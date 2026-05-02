pub mod eval;

use chrono::Local;
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::Mutex;
use std::sync::atomic::{AtomicU64, Ordering};

pub static BTREE_USED_COUNT: AtomicU64 = AtomicU64::new(0);
pub static READ_NODE_COUNT: AtomicU64 = AtomicU64::new(0);
pub static BOARD_CACHE: Lazy<Mutex<HashMap<u32, HashMap<u128, (i32, i32)>>>> = Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(PartialEq)]
pub enum BoardState {
    Pass,
    Next,
    End,
}

//#[derive(Debug)]
#[derive(Default)]
pub struct BitBoard {
    pub black: u64,
    pub white: u64,
    pub turn: i32,
    pub hand: u64,
    pub legal: u64,
    series_horz: u64,
    series_vert: u64,
    series_dig0: u64, //+7, -7
    series_dig1: u64, //+9, -9
    pub eval: i32,
    last_move: u64,
    pub mask: u64,
}

//#[derive(Debug)]
#[derive(Debug)]
pub enum Algorithm {
    NegaAlpha,
    Eval,
    Eval2,
    MTDf,
    NegaScout,
    Moves,
}

impl std::fmt::Debug for BitBoard {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{{\"eval\":{}, \"last_move\":{}, \"board\":\"{}\"}}",
            self.eval,
            self.last_move,
            self.to_string()
        )
    }
}

/// キャッシュを検索してヒットした場合は評価値を返す。
fn get_from_cache(board: &BitBoard) -> Option<(i32, i32)> {
    let cache = BOARD_CACHE.lock().unwrap();
    let cache1 = cache.get(&board.count_stones())?;
    let key = ((board.black as u128) << 64) | (board.white as u128);
    let cache2 = cache1.get(&key)?;
    Some(*cache2)
}

/// キャッシュに追加
fn put_to_cache(board: &BitBoard, low: i32, high: i32) {
    let mut cache = BOARD_CACHE.lock().unwrap();
    let key = ((board.black as u128) << 64) | (board.white as u128);

    cache
        .entry(board.count_stones())
        .and_modify(|cache1| {
            cache1.insert(key, (low, high));
        })
        .or_insert({
            let mut cache1 = HashMap::new();
            cache1.insert(key, (low, high));
            cache1
        });
}

static RANDOM_SEED: Lazy<Mutex<u64>> = Lazy::new(|| Mutex::new(0));
fn random() -> u64 {
    let mut seed = RANDOM_SEED.lock().unwrap();
    let date = Local::now().timestamp_millis() as u64;
    *seed ^= date;
    *seed += 17;
    *seed
}

#[inline(always)]
fn right_shift(a: u64, b: i32) -> u64 {
    a >> b
}

#[inline(always)]
fn left_shift(a: u64, b: i32) -> u64 {
    a << b
}

#[inline(always)]
fn put_stone_helper(mask: u64, hand: u64, counter: u64, between: &mut u64, func: fn(u64, i32) -> u64, shift: i32) {
    let mut series: u64 = mask & func(hand, shift);
    series |= mask & func(series, shift);
    series |= mask & func(series, shift);
    series |= mask & func(series, shift);
    series |= mask & func(series, shift);
    series |= mask & func(series, shift);
    *between |= series & counter;
}

#[inline(always)]
fn calc_legal_move_helper(
    mask: u64,
    black: u64,
    blank: u64,
    func: fn(u64, i32) -> u64,
    shift: i32,
    legal: &mut u64,
    series: &mut u64,
) {
    let mut temp: u64 = mask & func(black, shift);
    temp |= mask & func(temp, shift);
    temp |= mask & func(temp, shift);
    temp |= mask & func(temp, shift);
    temp |= mask & func(temp, shift);
    temp |= mask & func(temp, shift);
    *legal |= blank & func(temp, shift);
    *series |= temp;
}

#[inline(always)]
fn calc_legal_move(black: u64, white: u64, turn: i32) -> (u64, u64, u64, u64, u64) {
    if turn == -1 {
        return calc_legal_move(white, black, 1);
    }

    let blank = !(black | white);
    let mask_horz = 0x7e7e7e7e7e7e7e7e & white;
    let mask_vert = 0x00ffffffffffff00 & white;
    let mask_edge = 0x007e7e7e7e7e7e00 & white;
    let mut legal: u64 = 0;

    let mut series_horz: u64 = 0;
    let mut series_vert: u64 = 0;
    let mut series_dig0: u64 = 0; //+7, -7
    let mut series_dig1: u64 = 0; //+9, -9

    calc_legal_move_helper(mask_horz, black, blank, right_shift, 1, &mut legal, &mut series_horz);
    calc_legal_move_helper(mask_horz, black, blank, left_shift, 1, &mut legal, &mut series_horz);
    calc_legal_move_helper(mask_vert, black, blank, right_shift, 8, &mut legal, &mut series_vert);
    calc_legal_move_helper(mask_vert, black, blank, left_shift, 8, &mut legal, &mut series_vert);
    calc_legal_move_helper(mask_edge, black, blank, right_shift, 9, &mut legal, &mut series_dig1);
    calc_legal_move_helper(mask_edge, black, blank, right_shift, 7, &mut legal, &mut series_dig0);
    calc_legal_move_helper(mask_edge, black, blank, left_shift, 7, &mut legal, &mut series_dig0);
    calc_legal_move_helper(mask_edge, black, blank, left_shift, 9, &mut legal, &mut series_dig1);

    (legal, series_horz, series_vert, series_dig0, series_dig1)
}

fn shuffle_children(children: &mut [BitBoard]) {
    let len = children.len();
    for i in 0..len {
        let rand = random() % len as u64;
        let rand = rand as usize;
        children.swap(i, rand);
    }
}

impl BitBoard {
    pub fn new(black: u64, white: u64, turn: i32) -> Self {
        let (legal, series_horz, series_vert, series_dig0, series_dig1) = calc_legal_move(black, white, turn);

        BitBoard {
            black,
            white,
            turn,
            hand: 1,
            legal,
            series_horz,
            series_vert,
            series_dig0,
            series_dig1,
            eval: 0,
            last_move: 0,
            mask: 0xffffffffffffffff,
        }
    }

    #[allow(clippy::should_implement_trait)]
    pub fn from_str(str: &str) -> BitBoard {
        let v: Vec<&str> = str.split(',').collect();
        let black = u64::from_str_radix(v[0], 16).unwrap();
        let white = u64::from_str_radix(v[1], 16).unwrap();
        let turn = i32::from_str_radix(v[2], 16).unwrap();
        assert_eq!(black & white, 0, "bitboard validation error");
        assert!(turn == 1 || turn == -1, "bitboard validation error");
        BitBoard::new(black, white, turn)
    }

    /// Converts strings like '-XO-OOXOOXX-OXOO-XXOXXOOX-OXOOXOOXOOOXXXO-XOOOXXO-O-OO---OOOX-O-'
    /// to bitboard instance. 'X' will converted to black, and 'O' will converted to white.
    pub fn from_f5d6(str: &str) -> BitBoard {
        let f5d6_str = str.split(' ').next().unwrap();
        let black_str = f5d6_str.replace(['-', 'O'], "0").replace('X', "1");
        let black = u64::from_str_radix(&black_str, 2).unwrap();
        let white_str = f5d6_str.replace(['-', 'X'], "0").replace('O', "1");
        let white = u64::from_str_radix(&white_str, 2).unwrap();

        BitBoard::new(black, white, 1)
    }

    // This function switches the BitBoard turn.
    pub fn switch_turn(&self) -> BitBoard {
        let mut new_board = BitBoard::new(self.black, self.white, -self.turn);
        new_board.mask = self.mask;
        new_board
    }

    pub fn get_legal_move(&self) -> u64 {
        self.legal & self.mask
    }

    pub fn put_stone(&self, hand: u64) -> BitBoard {
        let mut black = self.black;
        let mut white = self.white;

        if self.turn == -1 {
            black = self.white;
            white = self.black;
        }

        let mask_horz = 0x7e7e7e7e7e7e7e7e & white;
        let mask_vert = 0x00ffffffffffff00 & white;
        let mask_edge = 0x007e7e7e7e7e7e00 & white;

        let mut between: u64 = 0;

        put_stone_helper(mask_horz, hand, self.series_horz, &mut between, right_shift, 1);
        put_stone_helper(mask_horz, hand, self.series_horz, &mut between, left_shift, 1);
        put_stone_helper(mask_vert, hand, self.series_vert, &mut between, right_shift, 8);
        put_stone_helper(mask_vert, hand, self.series_vert, &mut between, left_shift, 8);
        put_stone_helper(mask_edge, hand, self.series_dig1, &mut between, right_shift, 9);
        put_stone_helper(mask_edge, hand, self.series_dig0, &mut between, right_shift, 7);
        put_stone_helper(mask_edge, hand, self.series_dig0, &mut between, left_shift, 7);
        put_stone_helper(mask_edge, hand, self.series_dig1, &mut between, left_shift, 9);

        black ^= between;
        white ^= between;
        black ^= hand;

        let mut new_board = if self.turn == 1 {
            BitBoard::new(black, white, -1)
        } else {
            BitBoard::new(white, black, 1)
        };
        new_board.last_move = hand;
        new_board.mask = self.mask;

        new_board
    }

    pub fn get_board_state(&self) -> BoardState {
        if self.get_legal_move() != 0 {
            return BoardState::Next;
        }
        let board = self.switch_turn();
        if board.get_legal_move() > 0 {
            BoardState::Pass
        } else {
            BoardState::End
        }
    }

    #[inline(always)]
    pub fn get_num_stones(&self) -> u32 {
        let stones_bit = self.black | self.white;
        stones_bit.count_ones()
    }

    pub fn get_next_random_move(&self) -> u64 {
        let mut legal_moves = self.get_legal_move();
        let num_legal_moves = legal_moves.count_ones() as u64;
        let mut num_iter: u64 = random() % num_legal_moves;

        while num_iter != 0 {
            let bit = legal_moves & (!legal_moves + 1);
            legal_moves ^= bit;
            num_iter -= 1;
        }

        legal_moves & (!legal_moves + 1)
    }

    /// Expand children. This method does not sort children.
    pub fn expand(&self) -> Vec<BitBoard> {
        let mut legal_moves = self.get_legal_move();
        let mut children: Vec<BitBoard> = Vec::new();

        while legal_moves != 0 {
            let bit = legal_moves & (!legal_moves + 1);
            legal_moves ^= bit;

            let mut child = self.put_stone(bit);
            child.hand = bit;
            children.push(child);
        }
        children
    }

    pub fn expand_children_orderby(&self, algo: Algorithm, alpha: i32, beta: i32, depth: u32, shuffle: bool) -> Vec<BitBoard> {
        let mut children = self.expand();

        match algo {
            Algorithm::NegaAlpha => {
                for child in &mut children {
                    child.eval = -child.mtdf();
                }
            }
            Algorithm::MTDf => {
                for child in &mut children {
                    child.eval = -child.ab_with_map(-beta, -alpha);
                }
            }
            Algorithm::Eval => {
                for child in &mut children {
                    child.eval = -child.get_eval();
                }
            }
            Algorithm::Eval2 => {
                for child in &mut children {
                    child.eval = -child.nega_alpha_eval(-0xff, 0xff, depth);
                }
            }
            Algorithm::NegaScout => {
                for child in &mut children {
                    child.eval = -child.negascout(-0xff, 0xff);
                }
            }
            Algorithm::Moves => {
                for child in &mut children {
                    child.eval = -(child.get_legal_move().count_ones() as i32);
                }
            }
        }

        // Randomize children.
        if shuffle {
            shuffle_children(&mut children);
        }
        // Then sort children. children[0] is the best move.
        children.sort_unstable_by_key(|k| -k.eval);

        children
    }

    pub fn nega_alpha_eval(&self, mut alpha: i32, beta: i32, depth: u32) -> i32 {
        READ_NODE_COUNT.fetch_add(1, Ordering::Relaxed);
        if depth == 0 {
            return self.get_eval();
        }

        match self.get_board_state() {
            BoardState::Next => {
                let children = self.expand_children_orderby(Algorithm::Eval, 0, 0, 0, false);

                for child in children {
                    let eval = -child.nega_alpha_eval(-beta, -alpha, depth - 1);
                    alpha = std::cmp::max(alpha, eval);
                    if alpha >= beta {
                        return alpha;
                    }
                }
                alpha
            }
            BoardState::Pass => {
                let child = self.switch_turn();
                -child.nega_alpha_eval(-beta, -alpha, depth)
            }
            BoardState::End => self.get_eval(),
        }
    }

    pub fn nega_alpha(&self, mut alpha: i32, beta: i32) -> i32 {
        READ_NODE_COUNT.fetch_add(1, Ordering::Relaxed);
        match self.get_board_state() {
            BoardState::Next => {
                let children = match 64 - self.count_stones() {
                    0..4 => self.expand(),
                    4..8 => self.expand_children_orderby(Algorithm::Moves, 0, 0, 0, false),
                    _ => self.expand_children_orderby(Algorithm::Eval, 0, 0, 0, false),
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
            BoardState::Pass => {
                let child = self.switch_turn();
                -child.nega_alpha(-beta, -alpha)
            }
            BoardState::End => (self.black.count_ones() as i32 - self.white.count_ones() as i32) * self.turn,
        }
    }

    // Ref: https://ja.wikipedia.org/wiki/Negascout
    pub fn negascout(&self, mut alpha: i32, beta: i32) -> i32 {
        if 64 - self.get_num_stones() <= 6 {
            return self.nega_alpha(alpha, beta);
        }

        READ_NODE_COUNT.fetch_add(1, Ordering::Relaxed);
        match self.get_board_state() {
            BoardState::Next => {
                let children = self.expand_children_orderby(Algorithm::Eval, 0, 0, 0, false);
                let mut it = children.iter();
                let best_child = it.next().unwrap();
                let mut max = -best_child.negascout(-beta, -alpha);
                let mut v = max;
                if beta <= v {
                    return v; // カット
                }
                if alpha < v {
                    alpha = v;
                }

                for child in it {
                    v = -child.negascout(-alpha - 1, -alpha);
                    if beta <= v {
                        return v; // カット
                    }
                    if alpha < v {
                        alpha = v;
                        v = -child.negascout(-beta, -alpha);
                        if beta <= v {
                            return v; // カット
                        }
                        if alpha < v {
                            alpha = v;
                        }
                    }
                    if max < v {
                        max = v;
                    }
                }
                max
            }
            BoardState::Pass => {
                let child = self.switch_turn();
                -child.negascout(-beta, -alpha)
            }
            BoardState::End => (self.black.count_ones() as i32 - self.white.count_ones() as i32) * self.turn,
        }
    }

    // Uses hash table
    // ref: https://sealsoft.jp/thell/algorithm.html#transpositiontable
    pub fn ab_with_map(&self, mut alpha: i32, mut beta: i32) -> i32 {
        READ_NODE_COUNT.fetch_add(1, Ordering::Relaxed);

        match get_from_cache(self) {
            None => {}
            Some((low, high)) => {
                BTREE_USED_COUNT.fetch_add(1, Ordering::Relaxed);
                if high <= alpha {
                    return high;
                } else if low >= beta || low == high {
                    return low;
                }
                alpha = std::cmp::max(alpha, low);
                beta = std::cmp::min(beta, high);
            }
        }

        match self.get_board_state() {
            BoardState::Next => {
                let children = match 64 - self.count_stones() {
                    0..6 => return self.nega_alpha(alpha, beta),
                    6..12 => self.expand_children_orderby(Algorithm::Moves, alpha, beta, 0, false),
                    12.. => self.expand_children_orderby(Algorithm::Eval, 0, 0, 0, false),
                };
                let mut eval_max: i32 = -0xffff;
                let mut a = alpha;

                for child in children {
                    let eval = -child.ab_with_map(-beta, -a);
                    if eval >= beta {
                        put_to_cache(self, eval, 0xffff);
                        return eval;
                    }
                    if eval > eval_max {
                        a = std::cmp::max(a, eval);
                        eval_max = eval;
                    }
                }
                if eval_max > alpha {
                    put_to_cache(self, eval_max, eval_max);
                } else {
                    put_to_cache(self, -0xffff, eval_max);
                }
                eval_max
            }
            BoardState::Pass => {
                let child = self.switch_turn();
                -child.ab_with_map(-beta, -alpha)
            }
            BoardState::End => self.diff(),
        }
    }

    // ref: https://ja.wikipedia.org/wiki/MTD-f
    pub fn mtdf(&self) -> i32 {
        let mut lower_bound = -0xffffi32;
        let mut upper_bound = 0xffffi32;
        let mut g = 0i32;

        while lower_bound < upper_bound {
            let beta = if g == lower_bound { g + 1 } else { g };

            g = self.ab_with_map(beta - 1, beta);

            if g < beta {
                upper_bound = g;
            } else {
                lower_bound = g;
            }
        }
        g
    }

    // ref: https://ja.wikipedia.org/wiki/MTD-f
    pub fn mtdf_with_window(&self, mut lower_bound: i32, mut upper_bound: i32) -> i32 {
        let mut g = 0i32;

        while lower_bound < upper_bound {
            let beta = if g == lower_bound { g + 1 } else { g };

            g = self.ab_with_map(beta - 1, beta);

            if g < beta {
                upper_bound = g;
            } else {
                lower_bound = g;
            }
        }
        g
    }

    #[inline(always)]
    pub fn diff(&self) -> i32 {
        (self.black.count_ones() as i32 - self.white.count_ones() as i32) * self.turn
    }

    pub fn count_stones(&self) -> u32 {
        (self.black | self.white).count_ones()
    }

    #[allow(clippy::inherent_to_string)]
    pub fn to_string(&self) -> String {
        format!("{:x},{:x},{}", self.black, self.white, self.turn)
    }

    pub fn get_eval(&self) -> i32 {
        eval::evaluate(self.black, self.white) as i32 * self.turn
    }
}
