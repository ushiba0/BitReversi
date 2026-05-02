use wasm_bindgen::prelude::*;
use web_sys::console::log_1;

pub mod bitboard;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

pub fn console_log(s: &str) {
    log_1(&JsValue::from(s));
}

fn reset_stats() {
    bitboard::READ_NODE_COUNT.store(0, std::sync::atomic::Ordering::Relaxed);
    bitboard::BTREE_USED_COUNT.store(0, std::sync::atomic::Ordering::Relaxed);
}

/// 現在キャッシュに保存されている盤面の総数を返す.
pub fn get_cache_count() -> usize {
    let cache = bitboard::BOARD_CACHE.lock().unwrap();
    let mut total_size = 0;

    for tree in cache.values() {
        total_size += tree.len();
    }
    total_size
}

#[wasm_bindgen]
pub fn print_stats() -> String {
    let stats = format!(
        "\"Read\": \"{} nodes\", \"BTree size\": {}, \"BTree used\": \"{} times.\"",
        bitboard::READ_NODE_COUNT.load(std::sync::atomic::Ordering::Relaxed),
        get_cache_count(),
        bitboard::BTREE_USED_COUNT.load(std::sync::atomic::Ordering::Relaxed)
    );

    console_log(&stats);
    stats
}

#[wasm_bindgen]
pub fn get_legal_move_wrapper(board_str: String) -> String {
    let board = bitboard::BitBoard::from_str(&board_str);
    format!("{:x}", board.get_legal_move())
}

#[wasm_bindgen]
pub fn put_stone_wrapper(board_str: String, hand: String) -> String {
    let board = bitboard::BitBoard::from_str(&board_str);
    let hand = u64::from_str_radix(hand.as_str(), 16).unwrap();
    let child = board.put_stone(hand);
    format!("{:x},{:x},{}", child.black, child.white, child.turn)
}

#[wasm_bindgen]
pub fn get_state_wrapper(board_str: String) -> i32 {
    let board = bitboard::BitBoard::from_str(&board_str);
    match board.get_board_state() {
        bitboard::BoardState::Next => 0,
        bitboard::BoardState::Pass => 1,
        bitboard::BoardState::End => 2,
    }
}

#[wasm_bindgen]
pub fn get_next_random_move_wrapper(board_str: String) -> String {
    console_log(&"get_next_random_move_wrapper".to_string());
    let board = bitboard::BitBoard::from_str(&board_str);
    format!("{:x}", board.get_next_random_move())
}

#[wasm_bindgen]
pub fn expand_children_wraper(board_str: String) -> String {
    console_log(&"expand_children_wraper".to_string());
    let mut result = String::from("");
    let board = bitboard::BitBoard::from_str(&board_str);
    let children = board.expand_children_orderby(bitboard::Algorithm::Moves, 0, 0, 0, true);

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
    bitboard::eval::import_weight(&str).unwrap();
}

#[wasm_bindgen]
pub fn export_weight_data_wrapper() -> String {
    bitboard::eval::export_weight().unwrap()
}

/// キャッシュをクリアし、それまでのキャッシュサイズを返す。
#[wasm_bindgen]
pub fn clear_btree() -> usize {
    let total_size = get_cache_count();
    bitboard::BOARD_CACHE.lock().unwrap().clear();
    total_size
}

#[wasm_bindgen]
pub fn expand_children_orderby_eval_wrapper(board_str: String, depth: u32) -> String {
    console_log(&"expand_children_orderby_eval_wrapper".to_string());
    use crate::bitboard::{Algorithm, BitBoard};
    let board = BitBoard::from_str(&board_str);
    let children = board.expand_children_orderby(Algorithm::Eval2, -0xff, 0xff, depth, true);
    print_stats();
    reset_stats();
    format!("{:?}", children)
}

#[wasm_bindgen]
pub fn expand_children_orderby_complete_read_wrapper(board_str: String) -> String {
    console_log(&"expand_children_orderby_complete_read_wrapper".to_string());
    use crate::bitboard::{Algorithm, BitBoard};
    let board = BitBoard::from_str(&board_str);
    let children = board.expand_children_orderby(Algorithm::NegaAlpha, -0xff, 0xff, 0xff, true);
    print_stats();
    reset_stats();
    format!("{:?}", children)
}

#[wasm_bindgen]
pub fn expand_children_orderby_mtdf_wrapper(board_str: String) -> String {
    console_log("expand_children_orderby_mtdf_wrapper");
    use crate::bitboard::{Algorithm, BitBoard};
    let board = BitBoard::from_str(&board_str);
    let children = board.expand_children_orderby(Algorithm::MTDf, -0xff, 0xff, 0xff, true);
    print_stats();
    reset_stats();
    format!("{:?}", children)
}
