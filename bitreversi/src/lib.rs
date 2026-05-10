use wasm_bindgen::prelude::*;
use web_sys::console::log_1;

pub mod bitboard;
pub mod eval;
pub mod minimax;
pub mod table;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

pub fn console_log(s: &str) {
    log_1(&JsValue::from(s));
}

fn reset_stats() {
    minimax::STAT_READ_NODES.store(0, std::sync::atomic::Ordering::Relaxed);
    minimax::STAT_CACHE_HIT.store(0, std::sync::atomic::Ordering::Relaxed);
}

#[wasm_bindgen]
pub fn print_stats() -> String {
    let stats = format!(
        "\"Read\": \"{} nodes\", \"BTree size\": {}, \"BTree used\": \"{} times.\"",
        minimax::STAT_READ_NODES.load(std::sync::atomic::Ordering::Relaxed),
        table::get_cache_size(),
        minimax::STAT_CACHE_HIT.load(std::sync::atomic::Ordering::Relaxed)
    );

    console_log(&stats);
    stats
}

#[wasm_bindgen]
pub fn get_legal_move_wrapper(board_str: String) -> String {
    let board = bitboard::BitBoard::convert_from_str(&board_str);
    format!("{:x}", board.get_legal_move())
}

#[wasm_bindgen]
pub fn put_stone_wrapper(board_str: String, hand: String) -> String {
    let board = bitboard::BitBoard::convert_from_str(&board_str);
    let hand = u64::from_str_radix(hand.as_str(), 16).unwrap();
    let child = board.put_stone(hand);
    format!("{:x},{:x},{}", child.black, child.white, child.turn)
}

#[wasm_bindgen]
pub fn get_state_wrapper(board_str: String) -> i32 {
    let board = bitboard::BitBoard::convert_from_str(&board_str);
    match board.get_board_state() {
        bitboard::BoardState::Next => 0,
        bitboard::BoardState::Pass(_) => 1,
        bitboard::BoardState::End => 2,
    }
}

#[wasm_bindgen]
pub fn get_next_random_move_wrapper(board_str: String) -> String {
    console_log("get_next_random_move_wrapper");
    let board = bitboard::BitBoard::convert_from_str(&board_str);
    format!("{:x}", board.get_next_random_move())
}

#[wasm_bindgen]
pub fn expand_children_wraper(board_str: String) -> String {
    console_log("expand_children_wraper");
    let mut result = String::from("");
    let board = bitboard::BitBoard::convert_from_str(&board_str);
    let children = board.expand_children_orderby(bitboard::Algo::Moves, 0, 0, 0, true);

    for child in children {
        result += &format!("{:x},{:x},{};", child.black, child.white, child.turn);
    }
    result.to_string()
}

#[wasm_bindgen]
pub fn initialize() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn import_weight(str: String) {
    eval::import_weight(&str).unwrap();
}

#[wasm_bindgen]
pub fn export_weight_data_wrapper() -> String {
    eval::export_weight().unwrap()
}

/// キャッシュをクリアし、それまでのキャッシュサイズを返す。
#[wasm_bindgen]
pub fn clear_btree() -> usize {
    let total_size = table::get_cache_size();
    table::cache_clear();
    total_size
}

#[wasm_bindgen]
pub fn expand_children_orderby_eval_wrapper(board_str: String, depth: u32) -> String {
    console_log("expand_children_orderby_eval_wrapper");
    use crate::bitboard::{Algo, BitBoard};
    let board = BitBoard::convert_from_str(&board_str);
    let children = board.expand_children_orderby(Algo::Ids, -0xff, 0xff, depth, true);
    print_stats();
    reset_stats();
    format!("{:?}", children)
}

#[wasm_bindgen]
pub fn expand_children_orderby_complete_read_wrapper(board_str: String) -> String {
    console_log("expand_children_orderby_complete_read_wrapper");
    use crate::bitboard::{Algo, BitBoard};
    let board = BitBoard::convert_from_str(&board_str);
    let children = board.expand_children_orderby(Algo::NegaAlpha, -0xff, 0xff, 0xff, true);
    print_stats();
    reset_stats();
    format!("{:?}", children)
}

#[wasm_bindgen]
pub fn expand_children_orderby_mtdf_wrapper(board_str: String) -> String {
    console_log("expand_children_orderby_mtdf_wrapper");
    use crate::bitboard::{Algo, BitBoard};
    let board = BitBoard::convert_from_str(&board_str);
    let children = board.expand_children_orderby(Algo::MTDf, -0xff, 0xff, 0xff, true);
    print_stats();
    reset_stats();
    format!("{:?}", children)
}
