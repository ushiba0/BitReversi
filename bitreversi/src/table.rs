use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::Mutex;

use super::bitboard::BitBoard;

static BOARD_CACHE: Lazy<Mutex<HashMap<u32, HashMap<u128, SearchInfo>>>> = Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(Clone, Copy)]
pub struct SearchInfo {
    pub low: i32,
    pub high: i32,
    pub is_complete_read: bool,
    pub search_depth: u32,
    pub best_move: u64,
    pub cutoff: usize,
}

impl SearchInfo {
    pub fn new(low: i32, high: i32, depth: u32, is_complete_read: bool) -> Self {
        Self {
            low,
            high,
            is_complete_read,
            search_depth: depth,
            best_move: 0,
            cutoff: usize::MAX,
        }
    }

    pub fn new1(low: i32, high: i32, depth: u32, best_move: u64, is_complete_read: bool) -> Self {
        debug_assert_eq!(best_move.count_ones(), 1);
        Self {
            low,
            high,
            is_complete_read,
            search_depth: depth,
            best_move,
            cutoff: usize::MAX,
        }
    }

    pub fn new2(low: i32, high: i32, depth: u32, best_move: u64, cutoff: usize, is_complete_read: bool) -> Self {
        debug_assert_eq!(best_move.count_ones(), 1);
        Self {
            low,
            high,
            is_complete_read,
            search_depth: depth,
            best_move,
            cutoff,
        }
    }
}

/// キャッシュを検索してヒットした場合は評価値を返す。
pub fn cache_get(board: &BitBoard) -> Option<SearchInfo> {
    let key1 = if board.turn == 1 {
        board.count_stones()
    } else {
        board.count_stones() + 100
    };
    let cache = BOARD_CACHE.lock().unwrap();
    let cache1 = cache.get(&key1)?;
    let key2 = ((board.black as u128) << 64) | (board.white as u128);
    let search_info = cache1.get(&key2)?;
    Some(*search_info)
}

/// キャッシュに追加
pub fn cache_insert(board: &BitBoard, search_info: SearchInfo) {
    let mut cache = BOARD_CACHE.lock().unwrap();
    let key1 = if board.turn == 1 {
        board.count_stones()
    } else {
        board.count_stones() + 100
    };
    let key2 = ((board.black as u128) << 64) | (board.white as u128);

    cache
        .entry(key1)
        .and_modify(|cache1| {
            cache1.insert(key2, search_info);
        })
        .or_insert({
            let mut cache1 = HashMap::new();
            cache1.insert(key2, search_info);
            cache1
        });
}

/// 現在キャッシュに保存されている盤面の総数を返す.
pub fn get_cache_size() -> usize {
    let cache = BOARD_CACHE.lock().unwrap();
    let mut total_size = 0;

    for tree in cache.values() {
        total_size += tree.len();
    }
    total_size
}

/// 保存されているキャッシュをクリアする.
pub fn cache_clear() {
    let mut cache = BOARD_CACHE.lock().unwrap();
    cache.clear();
}
