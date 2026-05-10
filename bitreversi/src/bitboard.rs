use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

use crate::eval;

#[derive(Debug)]
pub enum BoardState {
    Pass(BitBoard),
    Next,
    End,
}

#[derive(Debug)]
pub enum Algo {
    NegaAlpha,
    Eval,
    Eval2,
    MTDf,
    NegaScout,
    Moves,
    EvalLight,
    Ids,
}

#[derive(Default)]
pub struct BitBoard {
    pub black: u64,
    pub white: u64,
    pub turn: i32,
    pub eval: i32,
    pub last_move: u64,
    legal_moves: AtomicU64,
    is_legal_moves_calculated: AtomicBool,
}

impl std::fmt::Debug for BitBoard {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{{\"eval\":{}, \"last_move\":{:?}, \"board\":\"{}\"}}",
            self.eval,
            self.last_move,
            self.convert_to_string()
        )
    }
}

fn random() -> u64 {
    static RANDOM_SEED: AtomicU64 = AtomicU64::new(0x123); // 初期値が 0 だと乱数を生成できない.

    let mut seed = RANDOM_SEED.load(Ordering::Relaxed);

    seed ^= seed << 13;
    seed ^= seed >> 7;
    seed ^= seed << 17;
    RANDOM_SEED.store(seed, Ordering::Relaxed);

    seed
}

/// 黒手番の手 (mov) で返る白石 (series) を求め、between に結果を入れる。
#[inline(always)]
fn put_stone_helper_right_shift(mask: u64, mov: u64, black: u64, between: &mut u64, shift: i32) {
    let mut series: u64 = mask & (mov >> shift);
    if series == 0 {
        return;
    }

    series |= mask & (series >> shift);
    series |= mask & (series >> shift);
    series |= mask & (series >> shift);
    series |= mask & (series >> shift);
    series |= mask & (series >> shift);
    if (series >> shift) & black != 0 {
        *between |= series;
    }
}

/// 黒手番の手 (mov) で返る白石 (series) を求め、between に結果を入れる。
#[inline(always)]
fn put_stone_helper_left_shift(mask: u64, mov: u64, black: u64, between: &mut u64, shift: i32) {
    let mut series: u64 = mask & (mov << shift);
    if series == 0 {
        return;
    }

    series |= mask & (series << shift);
    series |= mask & (series << shift);
    series |= mask & (series << shift);
    series |= mask & (series << shift);
    series |= mask & (series << shift);
    if (series << shift) & black != 0 {
        *between |= series;
    }
}

/// 黒手番の手 (mov) の合法手を求め、legal_moves に結果を格納する
#[inline(always)]
fn legal_moves_helper_right_shift(mask: u64, black: u64, blank: u64, shift: i32, legal_moves: &mut u64) {
    let mut temp: u64 = mask & (black >> shift);
    if temp == 0 {
        return;
    }

    temp |= mask & (temp >> shift);
    temp |= mask & (temp >> shift);
    temp |= mask & (temp >> shift);
    temp |= mask & (temp >> shift);
    temp |= mask & (temp >> shift);
    *legal_moves |= blank & (temp >> shift);
}

/// 黒手番の手 (mov) の合法手を求め、legal_moves に結果を格納する
#[inline(always)]
fn legal_moves_helper_left_shift(mask: u64, black: u64, blank: u64, shift: i32, legal_moves: &mut u64) {
    let mut temp: u64 = mask & (black << shift);
    if temp == 0 {
        return;
    }

    temp |= mask & (temp << shift);
    temp |= mask & (temp << shift);
    temp |= mask & (temp << shift);
    temp |= mask & (temp << shift);
    temp |= mask & (temp << shift);
    *legal_moves |= blank & (temp << shift);
}

/// 黒手番の手 (mov) の合法手を求める.
#[inline(always)]
fn calc_legal_move(black: u64, white: u64, turn: i32) -> u64 {
    if turn == -1 {
        return calc_legal_move(white, black, 1);
    }

    let blank = !(black | white);
    let mask_horz = 0x7e7e7e7e7e7e7e7e & white;
    let mask_vert = 0x00ffffffffffff00 & white;
    let mask_edge = 0x007e7e7e7e7e7e00 & white;
    let mut legal_moves: u64 = 0;

    legal_moves_helper_right_shift(mask_horz, black, blank, 1, &mut legal_moves);
    legal_moves_helper_right_shift(mask_vert, black, blank, 8, &mut legal_moves);
    legal_moves_helper_right_shift(mask_edge, black, blank, 7, &mut legal_moves);
    legal_moves_helper_right_shift(mask_edge, black, blank, 9, &mut legal_moves);

    legal_moves_helper_left_shift(mask_horz, black, blank, 1, &mut legal_moves);
    legal_moves_helper_left_shift(mask_vert, black, blank, 8, &mut legal_moves);
    legal_moves_helper_left_shift(mask_edge, black, blank, 7, &mut legal_moves);
    legal_moves_helper_left_shift(mask_edge, black, blank, 9, &mut legal_moves);

    legal_moves
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
    /// Creates a new BitBoard. This function does not validate input arguments.
    fn new(black: u64, white: u64, turn: i32) -> Self {
        BitBoard {
            black,
            white,
            turn,
            legal_moves: AtomicU64::new(0),
            eval: 0,
            last_move: 0,
            is_legal_moves_calculated: AtomicBool::new(false),
        }
    }

    /// Creates a new BitBoard. Panics if there is overlap in black stones and white stones,
    /// or turn is an invalid number.
    pub fn new_with_validation(black: u64, white: u64, turn: i32) -> Self {
        assert_eq!(black & white, 0);
        assert_eq!(turn.abs(), 1);
        Self::new(black, white, turn)
    }

    pub fn convert_from_str(str: &str) -> BitBoard {
        let v: Vec<&str> = str.split(',').collect();
        let black = u64::from_str_radix(v[0], 16).unwrap();
        let white = u64::from_str_radix(v[1], 16).unwrap();
        let turn = i32::from_str_radix(v[2], 16).unwrap();
        BitBoard::new_with_validation(black, white, turn)
    }

    /// Converts strings like '-XO-OOXOOXX-OXOO-XXOXXOOX-OXOOXOOXOOOXXXO-XOOOXXO-O-OO---OOOX-O-'
    /// to bitboard instance. 'X' will converted to black, and 'O' will converted to white.
    pub fn from_f5d6(str: &str, turn: i32) -> BitBoard {
        let f5d6_str = str.split(' ').next().unwrap();
        let black_str = f5d6_str.replace(['-', 'O'], "0").replace('X', "1");
        let black = u64::from_str_radix(&black_str, 2).unwrap();
        let white_str = f5d6_str.replace(['-', 'X'], "0").replace('O', "1");
        let white = u64::from_str_radix(&white_str, 2).unwrap();

        if turn == 1 {
            BitBoard::new_with_validation(black, white, 1)
        } else {
            BitBoard::new_with_validation(white, black, -1)
        }
    }

    // This function switches the BitBoard turn.
    pub fn switch_turn(&self) -> BitBoard {
        BitBoard::new(self.black, self.white, -self.turn)
    }

    pub fn get_legal_move(&self) -> u64 {
        if self.is_legal_moves_calculated.load(Ordering::Relaxed) {
            return self.legal_moves.load(Ordering::Relaxed);
        }

        // Calculate legal moves.
        let legal_moves = calc_legal_move(self.black, self.white, self.turn);
        self.is_legal_moves_calculated.store(true, Ordering::Relaxed);
        self.legal_moves.store(legal_moves, Ordering::Relaxed);
        legal_moves
    }

    pub fn put_stone(&self, hand: u64) -> BitBoard {
        debug_assert_eq!(hand.count_ones(), 1);

        let (mut black, mut white) = if self.turn == 1 {
            (self.black, self.white)
        } else {
            (self.white, self.black)
        };

        let mask_horizontal = 0x7e7e7e7e7e7e7e7e & white;
        let mask_vertical = 0x00ffffffffffff00 & white;
        let mask_edge = 0x007e7e7e7e7e7e00 & white;

        let mut between: u64 = 0;

        put_stone_helper_right_shift(mask_horizontal, hand, black, &mut between, 1);
        put_stone_helper_right_shift(mask_vertical, hand, black, &mut between, 8);
        put_stone_helper_right_shift(mask_edge, hand, black, &mut between, 7);
        put_stone_helper_right_shift(mask_edge, hand, black, &mut between, 9);

        put_stone_helper_left_shift(mask_horizontal, hand, black, &mut between, 1);
        put_stone_helper_left_shift(mask_vertical, hand, black, &mut between, 8);
        put_stone_helper_left_shift(mask_edge, hand, black, &mut between, 7);
        put_stone_helper_left_shift(mask_edge, hand, black, &mut between, 9);

        debug_assert_ne!(between, 0);
        black ^= between;
        white ^= between;
        black ^= hand;

        let mut new_board = if self.turn == 1 {
            BitBoard::new(black, white, -1)
        } else {
            BitBoard::new(white, black, 1)
        };
        new_board.last_move = hand;

        new_board
    }

    /// 現在の盤面の状態を返す。
    /// 石を置ける -> BoardState::Next
    /// パス -> BoardState::Pass
    /// ゲーム終了 -> BoardState::End
    pub fn get_board_state(&self) -> BoardState {
        if self.count_stones() == 64 {
            // 石の個数が 64 の場合は即 End を返す。合法手の生成は比較的重いので、こうすることで終盤読み切りが約 10% 高速化する。
            return BoardState::End;
        }

        if self.get_legal_move() != 0 {
            // 自分は石を置けるのでゲームは進行 (Next) できる
            return BoardState::Next;
        }

        // 自分は置くところがないので、相手に置くところがあるか調べる。
        let board = self.switch_turn();

        if board.get_legal_move() != 0 {
            // 自分は置けず、相手は置けるのでパス
            BoardState::Pass(board)
        } else {
            // 自分も相手も置けないのでゲーム終了
            BoardState::End
        }
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

            let child = self.put_stone(bit);
            children.push(child);
        }
        children
    }

    pub fn expand_children_orderby(&self, algo: Algo, alpha: i32, beta: i32, depth: u32, shuffle: bool) -> Vec<BitBoard> {
        let mut children = self.expand();

        match algo {
            Algo::NegaAlpha => {
                for child in &mut children {
                    child.eval = -child.nega_alpha_eval(-beta, -alpha, depth);
                }
            }
            Algo::MTDf => {
                for child in &mut children {
                    child.eval = -child.alpha_beta_with_map(-beta, -alpha, 0);
                }
            }
            Algo::Eval => {
                for child in &mut children {
                    child.eval = -child.get_eval();
                }
            }
            Algo::EvalLight => {
                for child in &mut children {
                    child.eval = -child.get_eval_light();
                }
            }
            Algo::Eval2 => {
                for child in &mut children {
                    child.eval = -child.nega_alpha_eval(-0xff, 0xff, depth);
                }
            }
            Algo::NegaScout => {
                for child in &mut children {
                    child.eval = -child.nega_scout(-0xff, 0xff, 0);
                }
            }
            Algo::Moves => {
                for child in &mut children {
                    child.eval = -(child.get_legal_move().count_ones() as i32);
                }
            }
            Algo::Ids => {
                for child in &mut children {
                    child.eval = -child.iterative_deepening_search(-0xff, 0xff, depth);
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

    pub fn expand_move_ordering(&self, algo: Algo, search_depth: u32) -> Vec<BitBoard> {
        let mut children = self.expand();

        if search_depth == 123 {
            children.sort_by_cached_key(|child| child.nega_alpha_eval(-64, 64, 0));
            children.sort_by_cached_key(|child| child.get_legal_move().count_ones());
            return children;
        }

        match algo {
            Algo::Moves => {
                for child in children.iter_mut() {
                    match child.get_board_state() {
                        // child.eval が小さいほど有利 (先頭に並ぶ)
                        // 子ノードの着手可能位置数
                        BoardState::Next => child.eval = child.get_legal_move().count_ones() as i32,
                        BoardState::Pass(_) => child.eval = 0,
                        BoardState::End => child.eval = -1,
                    }
                }
            }

            Algo::Eval => {
                for child in children.iter_mut() {
                    match child.get_board_state() {
                        // child.eval が小さいほど有利 (先頭に並ぶ)
                        BoardState::Next => child.eval = child.nega_alpha_eval(-64, 64, search_depth),
                        BoardState::Pass(_) => child.eval = -0xff,
                        BoardState::End => child.eval = -0xffff,
                    }
                }
            }

            _ => unimplemented!(),
        }

        // Sort children. children[0] is the best move.
        children.sort_unstable_by_key(|k| k.eval);

        children
    }

    #[inline(always)]
    pub fn diff(&self) -> i32 {
        (self.black.count_ones() as i32 - self.white.count_ones() as i32) * self.turn
    }

    #[inline(always)]
    pub fn count_stones(&self) -> u32 {
        (self.black | self.white).count_ones()
    }

    pub fn convert_to_string(&self) -> String {
        format!("{:x},{:x},{}", self.black, self.white, self.turn)
    }

    pub fn get_eval(&self) -> i32 {
        eval::evaluate(self.black, self.white) as i32 * self.turn
    }

    pub fn get_eval_light(&self) -> i32 {
        eval::evaluate_light(self.black, self.white) as i32 * self.turn
    }
}
