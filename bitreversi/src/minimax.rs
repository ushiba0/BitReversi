use std::sync::atomic::{AtomicU64, Ordering};

use super::bitboard::{Algo, BitBoard, BoardState};
use super::table::{SearchInfo, cache_get, cache_insert};

pub static STAT_CACHE_HIT: AtomicU64 = AtomicU64::new(0);
pub static STAT_READ_NODES: AtomicU64 = AtomicU64::new(0);

impl BitBoard {
    pub fn iterative_deepening_search(&self, alpha: i32, beta: i32, search_depth: u32) -> i32 {
        let mut current_depth = 0;
        let mut current_score = 0;
        let mut current_cutoff = 2;

        let max_depth = 64 - self.count_stones();
        let search_depth = std::cmp::min(search_depth, max_depth);
        let mut is_complete_read = false;

        // 反復深化のメインループ
        loop {
            let (mut a, mut b) = if current_depth >= 3 {
                let window = 5;
                (current_score - window, current_score + window) // 一度狭い窓での探索を行う
            } else {
                (alpha, beta)
            };

            let mut score = self.nega_alpha_eval_with_map(a, b, current_depth, 0, current_cutoff, &mut is_complete_read);

            // フェイルソフト判定
            if score <= a || score >= b {
                a = alpha;
                b = beta;
                score = self.nega_alpha_eval_with_map(a, b, current_depth, 0, current_cutoff, &mut is_complete_read);
            }

            current_score = score;

            let total_read = STAT_READ_NODES.load(Ordering::Relaxed);
            log::debug!(
                "[IDS] current_depth = {current_depth: >3} cutoff = ({current_cutoff}), score = {current_score: >3} (is_complete_read = {is_complete_read}), (a, b) = ({a: >3}, {b: >3}), Read {total_read} nodes."
            );

            if is_complete_read || (current_depth >= search_depth && current_cutoff >= 64) {
                break current_score;
            }

            if current_depth >= search_depth || (64 - self.count_stones()) <= Self::NA_THRESHOLD + current_depth {
                current_depth = 0;
                current_cutoff += 1;

                if current_cutoff >= 4 {
                    current_cutoff = 64;
                }
                continue;
            }

            if current_depth <= 10 && current_depth + 3 < search_depth {
                current_depth += 3;
            } else {
                current_depth += 1;
            }
        }
    }

    const NA_THRESHOLD: u32 = 6;

    pub fn nega_alpha_eval_with_map(
        &self,
        mut alpha: i32,
        mut beta: i32,
        search_depth: u32,
        current_depth: u32,
        cutoff: usize,
        is_complete_read: &mut bool,
    ) -> i32 {
        if 64 - self.count_stones() <= Self::NA_THRESHOLD {
            // 終盤の完全読み切りアルゴリズムへ移行
            *is_complete_read = true;
            return self.nega_alpha(alpha, beta);
        }

        STAT_READ_NODES.fetch_add(1, Ordering::Relaxed);

        if search_depth == 0 {
            *is_complete_read = false;
            return self.get_eval();
        }

        let original_alpha = alpha;
        let mut saved_best_move: u64 = 0;

        // キャッシュの探索
        if let Some(cache) = cache_get(self) {
            saved_best_move = cache.best_move;

            if cache.is_complete_read || (cache.search_depth >= search_depth && cache.cutoff >= cutoff) {
                STAT_CACHE_HIT.fetch_add(1, Ordering::Relaxed);

                if cache.high <= alpha {
                    *is_complete_read = cache.is_complete_read;
                    return cache.high;
                } else if cache.low >= beta || cache.low == cache.high {
                    *is_complete_read = cache.is_complete_read;
                    return cache.low;
                }

                alpha = std::cmp::max(alpha, cache.low);
                beta = std::cmp::min(beta, cache.high);
            }
        }

        match self.get_board_state() {
            BoardState::Next => {}
            BoardState::Pass(child) => {
                let v = -child.nega_alpha_eval_with_map(-beta, -alpha, search_depth, current_depth, cutoff, is_complete_read);

                if v >= beta {
                    cache_insert(self, SearchInfo::new2(v, 0xffff, search_depth, 0, cutoff, *is_complete_read));
                } else if v >= alpha {
                    cache_insert(self, SearchInfo::new2(v, v, search_depth, 0, cutoff, *is_complete_read));
                } else {
                    cache_insert(self, SearchInfo::new2(-0xffff, v, search_depth, 0, cutoff, *is_complete_read));
                }
                return v;
            }
            BoardState::End => {
                let v = self.diff();
                cache_insert(self, SearchInfo::new2(v, v, search_depth, self.last_move, cutoff, true));
                *is_complete_read = true;
                return v;
            }
        }

        // Now board state is BoardState::Next.
        let mut children = match 64 - self.count_stones() {
            ..14 => self.expand_move_ordering(Algo::Moves, 0),
            14.. => self.expand_move_ordering(Algo::Eval, 0),
        };

        // 前回見つけた最善手を優先的に探索するために children の先頭に移動
        if saved_best_move > 0
            && let Some(idx) = children.iter().position(|c| c.last_move == saved_best_move)
            && idx > 0
        {
            children.swap(0, idx);
        }

        let mut eval_max: i32 = -0xffff;
        let mut current_best_move = saved_best_move; // current_best_move is initialized with child0.last_move.
        let mut iter = children.iter();
        *is_complete_read = true;

        if let Some(child0) = iter.next() {
            let eval = -child0.nega_alpha_eval_with_map(-beta, -alpha, search_depth - 1, current_depth + 1, cutoff, is_complete_read);

            eval_max = eval;
            if beta <= eval {
                // 真の評価値は eval 以上
                cache_insert(
                    self,
                    SearchInfo::new2(eval, 0xffff, search_depth, child0.last_move, cutoff, *is_complete_read),
                );
                return eval; // Cut!
            }
            alpha = std::cmp::max(alpha, eval);
        }

        for (index, child) in iter.enumerate() {
            if index + 1 >= cutoff && current_depth >= 4 {
                *is_complete_read = false;
                break;
            }
            let mut is_comp = false;
            let mut eval =
                -child.nega_alpha_eval_with_map(-alpha - 1, -alpha, search_depth - 1, current_depth + 1, cutoff, &mut is_comp);
            *is_complete_read &= is_comp;
            if beta <= eval {
                // 真の評価値は eval 以上
                cache_insert(
                    self,
                    SearchInfo::new2(eval, 0xffff, search_depth, child.last_move, cutoff, *is_complete_read),
                );
                return eval; // Cut!
            }
            if alpha < eval {
                alpha = eval;
                eval = -child.nega_alpha_eval_with_map(-beta, -alpha, search_depth - 1, current_depth + 1, cutoff, &mut is_comp);
                *is_complete_read &= is_comp;
                if beta <= eval {
                    // 真の評価値は eval 以上
                    cache_insert(
                        self,
                        SearchInfo::new2(eval, 0xffff, search_depth, child.last_move, cutoff, *is_complete_read),
                    );
                    return eval; // Cut!
                }
                alpha = std::cmp::max(alpha, eval);
            }
            if eval > eval_max {
                // より良い評価値の手をメモする
                eval_max = eval;
                current_best_move = child.last_move;
            }
        }

        if eval_max > original_alpha {
            // 真の評価値を登録
            cache_insert(
                self,
                SearchInfo::new2(eval_max, eval_max, search_depth, current_best_move, cutoff, *is_complete_read),
            );
        } else {
            // 真の評価値は eval_max 以下
            cache_insert(
                self,
                SearchInfo::new2(-0xffff, eval_max, search_depth, current_best_move, cutoff, *is_complete_read),
            );
        }

        eval_max
    }

    pub fn nega_alpha_eval(&self, mut alpha: i32, beta: i32, depth: u32) -> i32 {
        STAT_READ_NODES.fetch_add(1, Ordering::Relaxed);
        if depth == 0 {
            return self.get_eval();
        }

        match self.get_board_state() {
            BoardState::Next => {
                let children = self.expand_children_orderby(Algo::EvalLight, 0, 0, 0, false);

                for child in children {
                    let eval = -child.nega_alpha_eval(-beta, -alpha, depth - 1);
                    alpha = std::cmp::max(alpha, eval);
                    if alpha >= beta {
                        return alpha;
                    }
                }
                alpha
            }
            BoardState::Pass(child) => -child.nega_alpha_eval(-beta, -alpha, depth),
            BoardState::End => {
                let diff = self.diff();
                // この探索で勝敗が付いた場合は石数差にボーナスを加える
                match diff {
                    ..0 => diff - 0xff,
                    0 => 0,
                    1.. => diff + 0xff,
                }
            }
        }
    }

    pub fn nega_alpha(&self, mut alpha: i32, beta: i32) -> i32 {
        STAT_READ_NODES.fetch_add(1, Ordering::Relaxed);
        match self.get_board_state() {
            BoardState::Next => {
                let children = match 64 - self.count_stones() {
                    0..5 => return self.nega_alpha_last4(alpha, beta),
                    // 5..8 => self.expand_children_orderby(Algo::Moves, 0, 0, 0, false),
                    5..8 => self.expand_move_ordering(Algo::Moves, 0),
                    _ => self.expand_children_orderby(Algo::Eval, 0, 0, 0, false),
                };
                for child in children {
                    let eval = -child.nega_alpha(-beta, -alpha);
                    alpha = std::cmp::max(alpha, eval);
                    if alpha >= beta {
                        return alpha;
                    }
                }
                alpha
            }
            BoardState::Pass(child) => -child.nega_alpha(-beta, -alpha),
            BoardState::End => self.diff(),
        }
    }

    /// 終盤 4 手専用の NegaAlpha 関数。
    /// - Vec<> 不使用 (heap memory を使用しない)
    /// - Move Ordering なし
    ///
    /// 偶数理論で簡易的に Move Ordering すると約 1% 読む Node 数が減るが、Code のシンプルさを優先して採用しない。
    fn nega_alpha_last4(&self, mut alpha: i32, beta: i32) -> i32 {
        debug_assert!(64 - self.count_stones() <= 4, "stones = {}", self.count_stones());
        STAT_READ_NODES.fetch_add(1, Ordering::Relaxed);
        match self.get_board_state() {
            BoardState::Next => {}
            BoardState::Pass(child) => return -child.nega_alpha_last4(-beta, -alpha),
            BoardState::End => return self.diff(),
        }

        //  Now state is BoardState::Next.

        let mut legal_moves = self.get_legal_move();

        while legal_moves != 0 {
            let bit = legal_moves & (!legal_moves + 1);
            legal_moves ^= bit;

            let child = self.put_stone(bit);
            let eval = -child.nega_alpha_last4(-beta, -alpha);
            alpha = std::cmp::max(alpha, eval);
            if alpha >= beta {
                return alpha;
            }
        }
        alpha
    }

    // Ref: https://ja.wikipedia.org/wiki/Negascout
    pub fn nega_scout(&self, mut alpha: i32, mut beta: i32, current_depth: u32) -> i32 {
        STAT_READ_NODES.fetch_add(1, Ordering::Relaxed);
        let mut cache_low = -0xffff;
        let mut cache_high = 0xffff;

        if let Some(cache) = cache_get(self)
            && cache.is_complete_read
        {
            STAT_CACHE_HIT.fetch_add(1, Ordering::Relaxed);
            if cache.low >= beta {
                return cache.low;
            }
            if cache.high <= alpha || cache.low == cache.high {
                return cache.high;
            }
            // Narrow down the search window.
            alpha = std::cmp::max(alpha, cache.low);
            beta = std::cmp::min(beta, cache.high);
            cache_low = cache.low;
            cache_high = cache.high;
        }

        if 64 - self.count_stones() <= 12 {
            return self.nega_alpha(alpha, beta);
        }

        let original_alpha = alpha;
        match self.get_board_state() {
            BoardState::Next => {
                let children = match current_depth {
                    0..6 => self.expand_children_orderby(Algo::Eval2, -64, 64, 2, false),
                    6..8 => self.expand_children_orderby(Algo::Eval2, -64, 64, 2, false),
                    _ => self.expand_children_orderby(Algo::Moves, 0, 0, 0, false),
                };
                let mut it = children.iter();
                let best_child = it.next().unwrap();

                let mut max = -best_child.nega_scout(-beta, -alpha, current_depth + 1);

                if beta <= max {
                    cache_insert(self, SearchInfo::new(max, cache_high, 0, true)); // Lower bound (fail high)
                    return max; // Cut!
                }
                if alpha < max {
                    alpha = max;
                }

                for child in it {
                    // Null Window Search
                    let mut v = -child.nega_scout(-alpha - 1, -alpha, current_depth + 1);
                    if beta <= v {
                        cache_insert(self, SearchInfo::new(v, cache_high, 0, true)); // Lower bound (fail high)
                        return v; // Cut!
                    }
                    if alpha < v {
                        alpha = v;
                        // Search with normal window.
                        v = -child.nega_scout(-beta, -alpha, current_depth + 1);
                        if beta <= v {
                            cache_insert(self, SearchInfo::new(v, cache_high, 0, true)); // Lower bound (fail high)
                            return v; // Cut
                        }
                        if alpha < v {
                            alpha = v;
                        }
                    }
                    if max < v {
                        max = v;
                    }
                }

                // Update cache.
                if max <= original_alpha {
                    cache_insert(self, SearchInfo::new(cache_low, max, 0, true)); // Upper bound (fail low)
                } else {
                    cache_insert(self, SearchInfo::new(max, max, 0, true)); // Exact value (complete read)
                }

                max
            }
            BoardState::Pass(child) => {
                let v = -child.nega_scout(-beta, -alpha, current_depth + 1);

                if v <= original_alpha {
                    cache_insert(self, SearchInfo::new(cache_low, v, 0, true));
                } else if v >= beta {
                    cache_insert(self, SearchInfo::new(v, cache_high, 0, true));
                } else {
                    cache_insert(self, SearchInfo::new(v, v, 0, true));
                }

                v
            }
            BoardState::End => {
                let diff = self.diff();
                cache_insert(self, SearchInfo::new(diff, diff, 0, false));
                diff
            }
        }
    }

    // Uses hash table
    // ref: https://sealsoft.jp/thell/algorithm.html#transpositiontable
    pub fn alpha_beta_with_map(&self, mut alpha: i32, mut beta: i32, current_depth: u32) -> i32 {
        STAT_READ_NODES.fetch_add(1, Ordering::Relaxed);

        if let Some(cache) = cache_get(self)
            && cache.is_complete_read
        {
            STAT_CACHE_HIT.fetch_add(1, Ordering::Relaxed);
            if cache.high <= alpha {
                return cache.high;
            } else if cache.low >= beta || cache.low == cache.high {
                return cache.low;
            }
            alpha = std::cmp::max(alpha, cache.low);
            beta = std::cmp::min(beta, cache.high);
        }

        match self.get_board_state() {
            BoardState::Next => {
                let children = if current_depth <= 2 {
                    self.expand_children_orderby(Algo::Eval2, -64, 64, 4, false)
                } else {
                    match 64 - self.count_stones() {
                        0..6 => return self.nega_alpha(alpha, beta),
                        6..18 => self.expand_move_ordering(Algo::Moves, 0),
                        // 6..18 => self.expand_children_orderby(Algo::Moves, 0, 0, 0, false),
                        18.. => self.expand_move_ordering(Algo::Eval, 2),
                        // 18.. => self.expand_children_orderby(Algo::Eval2, -64, 64, 1, false),
                    }
                };

                let mut eval_max: i32 = -0xffff;
                let mut a = alpha;

                for child in children {
                    let eval = -child.alpha_beta_with_map(-beta, -a, current_depth + 1);
                    if eval >= beta {
                        cache_insert(self, SearchInfo::new(eval, 0xffff, 0, true));
                        return eval;
                    }
                    if eval > eval_max {
                        a = std::cmp::max(a, eval);
                        eval_max = eval;
                    }
                }
                if eval_max > alpha {
                    cache_insert(self, SearchInfo::new(eval_max, eval_max, 0, true));
                } else {
                    cache_insert(self, SearchInfo::new(-0xffff, eval_max, 0, true));
                }
                eval_max
            }
            BoardState::Pass(child) => -child.alpha_beta_with_map(-beta, -alpha, current_depth + 1),
            BoardState::End => {
                let v = self.diff();
                cache_insert(self, SearchInfo::new(v, v, 0, true));
                v
            }
        }
    }

    // ref: https://ja.wikipedia.org/wiki/MTD-f
    pub fn mtdf_with_window(&self, mut lower_bound: i32, mut upper_bound: i32) -> i32 {
        let mut g = 0i32;

        while lower_bound < upper_bound {
            let beta = if g == lower_bound { g + 1 } else { g };

            log::debug!("[mtdf] (lower, upper) = ({lower_bound}, {upper_bound}), Search window = (, {beta})");
            g = self.nega_scout(beta - 1, beta, 0);

            if g < beta {
                upper_bound = g;
            } else {
                lower_bound = g;
            }
        }
        g
    }
}
