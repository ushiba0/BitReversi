use once_cell::sync::Lazy;
use std::{io::Write, sync::Mutex};

const NUM_PHASE: usize = 20;
const LEARNING_RATE: f32 = 0.0005;
const WEIGHT_SCALE_FACTOR: f32 = 128.0;

#[cfg(test)]
use std::sync::atomic::AtomicBool;

#[cfg(test)]
static BLOCK_TEST: AtomicBool = AtomicBool::new(true);

pub static WEIGHTS: Lazy<Mutex<Vec<Weights>>> = Lazy::new(|| Mutex::new(Vec::new()));

pub static INDEX_BLACK: Lazy<[usize; 1024]> = Lazy::new(|| {
    let mut arr = [0; 1024];

    for i in 0..1024 {
        arr[i] = INDEX_WHITE[i] * 2;
    }

    arr
});

pub static INDEX_WHITE: Lazy<[usize; 1024]> = Lazy::new(|| {
    let mut arr = [0; 1024];

    for (i, elem) in arr.iter_mut().enumerate() {
        let binary = format!("{i:b}");
        let decimal = usize::from_str_radix(&binary, 3).expect("(BUG) Invalid ternary string");
        *elem = decimal;
    }
    arr
});

#[test]
pub fn test_to_ternary() -> Result<(), Box<dyn std::error::Error>> {
    let index_black = [0usize, 2, 6, 8, 18, 20, 24, 26, 54, 56, 60, 62, 72];
    let index_white = [0usize, 1, 3, 4, 9, 10, 12, 13, 27, 28, 30, 31, 36];

    assert_eq!(&index_black[..], &INDEX_BLACK[0..13]);
    assert_eq!(&index_white[..], &INDEX_WHITE[0..13]);

    let index_black = [
        58976usize, 58986, 58988, 58992, 58994, 59022, 59024, 59028, 59030, 59040, 59042, 59046, 59048,
    ];
    let index_white = [
        29488usize, 29493, 29494, 29496, 29497, 29511, 29512, 29514, 29515, 29520, 29521, 29523, 29524,
    ];
    assert_eq!(&index_black[..], &INDEX_BLACK[(1024 - 13)..]);
    assert_eq!(&index_white[..], &INDEX_WHITE[(1024 - 13)..]);

    Ok(())
}

#[derive(Clone)]
pub struct Weights {
    pub horizontal1: Vec<f32>,
    pub horizontal2: Vec<f32>,
    pub horizontal3: Vec<f32>,
    pub horizontal4: Vec<f32>,
    pub triangle: Vec<f32>,
    pub diagonal1: Vec<f32>,
    pub diagonal2: Vec<f32>,
    pub diagonal3: Vec<f32>,
    pub edge1: Vec<f32>,
    pub diaghalf: Vec<f32>,
    pub edge2: Vec<f32>,
}

#[derive(Clone, Copy)]
pub struct EvalBoard {
    pub black: u64,
    pub white: u64,
}

impl EvalBoard {
    pub fn new(black: u64, white: u64) -> Self {
        Self { black, white }
    }

    pub fn flip_horizontal(&self) -> Self {
        Self {
            black: self.black.swap_bytes(),
            white: self.white.swap_bytes(),
        }
    }

    #[inline(always)]
    fn __u64_flip_diagnal(num: u64) -> u64 {
        let mut result: u64 = num;

        let mask: u64 = 0x0f0f0f0f00000000 & (result ^ (result << 28));
        result ^= mask ^ (mask >> 28);

        let mask: u64 = 0x3333000033330000 & (result ^ (result << 14));
        result ^= mask ^ (mask >> 14);

        let mask: u64 = 0x5500550055005500 & (result ^ (result << 7));
        result ^= mask ^ (mask >> 7);

        result
    }

    /*
        o x x x x x x x    o o o o o o o o
        o o x x x x x x    x o o o o o o o
        o o o x x x x x    x x o o o o o o
        o o o o x x x x    x x x o o o o o
        o o o o o x x x -> x x x x o o o o
        o o o o o o x x    x x x x x o o o
        o o o o o o o x    x x x x x x o o
        o o o o o o o o    x x x x x x x o
    */
    pub fn flip_diagonal(&self) -> Self {
        Self {
            black: Self::__u64_flip_diagnal(self.black),
            white: Self::__u64_flip_diagnal(self.white),
        }
    }

    pub fn rotate_90(&self) -> Self {
        self.flip_diagonal().flip_horizontal()
    }

    #[inline(always)]
    fn _u64_horizontal1(num: u64) -> usize {
        let mut result: u64 = num & 0xff;
        result |= (num >> 1) & 0x100;
        result |= (num >> 5) & 0x200;
        result as usize
    }

    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 X 0 0 0 0 X 0
    // X X X X X X X X
    pub fn get_horizontal1_index(&self) -> usize {
        INDEX_BLACK[Self::_u64_horizontal1(self.black)] + INDEX_WHITE[Self::_u64_horizontal1(self.white)]
    }

    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // X X X X X X X X
    // 0 0 0 0 0 0 0 0
    pub fn get_horizontal2_index(&self) -> usize {
        INDEX_BLACK[((self.black >> 8) & 0xff) as usize] + INDEX_WHITE[((self.white >> 8) & 0xff) as usize]
    }

    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // X X X X X X X X
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    pub fn get_horizontal3_index(&self) -> usize {
        INDEX_BLACK[((self.black >> 16) & 0xff) as usize] + INDEX_WHITE[((self.white >> 16) & 0xff) as usize]
    }

    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // X X X X X X X X
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    pub fn get_horizontal4_index(&self) -> usize {
        INDEX_BLACK[((self.black >> 24) & 0xff) as usize] + INDEX_WHITE[((self.white >> 24) & 0xff) as usize]
    }

    #[inline(always)]
    fn _u64_triangle(num: u64) -> usize {
        let mut result: u64 = num & 0xf;
        result |= (num >> 4) & 0b0111_0000;
        result |= (num >> 9) & 0b1_1000_0000;
        result |= (num >> 15) & 0b10_0000_0000;
        result as usize
    }

    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 X
    // 0 0 0 0 0 0 X X
    // 0 0 0 0 0 X X X
    // 0 0 0 0 X X X X
    pub fn get_triangle_index(&self) -> usize {
        INDEX_BLACK[Self::_u64_triangle(self.black)] + INDEX_WHITE[Self::_u64_triangle(self.white)]
    }

    #[inline(always)]
    fn _u64_diagonal1(num: u64) -> usize {
        let mut result = num & 0x0102040810204080;
        result = (result | (result >> 8)) & 0x0003000c003000c0;
        result = (result | (result >> 16)) & 0x0000000f000000f0;
        result = (result | (result >> 32)) & 0x00000000000000ff;
        result as usize
    }

    // 0 0 0 0 0 0 0 X
    // 0 0 0 0 0 0 X 0
    // 0 0 0 0 0 X 0 0
    // 0 0 0 0 X 0 0 0
    // 0 0 0 X 0 0 0 0
    // 0 0 X 0 0 0 0 0
    // 0 X 0 0 0 0 0 0
    // X 0 0 0 0 0 0 0
    pub fn get_diagonal1_index(&self) -> usize {
        INDEX_BLACK[Self::_u64_diagonal1(self.black)] + INDEX_WHITE[Self::_u64_diagonal1(self.white)]
    }

    #[inline(always)]
    fn _u64_diagonal2(num: u64) -> usize {
        let mut result = (Self::_u64_diagonal1(num << 1) & 0xfe) as u64;
        result |= (num & 0x80) << 1;
        result |= (num >> 56) & 1;
        result as usize
    }

    // 0 0 0 0 0 0 0 1
    // 0 0 0 0 0 0 0 2
    // 0 0 0 0 0 0 3 0
    // 0 0 0 0 0 4 0 0
    // 0 0 0 0 5 0 0 0
    // 0 0 0 6 0 0 0 0
    // 0 0 7 0 0 0 0 0
    // 9 8 0 0 0 0 0 0      -> 987654321
    pub fn get_diagonal2_index(&self) -> usize {
        INDEX_BLACK[Self::_u64_diagonal2(self.black)] + INDEX_WHITE[Self::_u64_diagonal2(self.white)]
    }

    #[inline(always)]
    fn _u64_diagonal3(num: u64) -> usize {
        let diag1 = ((num << 2) & 0xffffffffffff) | ((num & 0x0001000000000000) << 1) | (num & 0x0100000000000000);
        let mut result = Self::_u64_diagonal1(diag1) as u64;
        result |= (num & 0xc0) << 2;
        result as usize
    }

    // 0 0 0 0 0 0 0 X
    // 0 0 0 0 0 0 0 X
    // 0 0 0 0 0 0 0 X
    // 0 0 0 0 0 0 X 0
    // 0 0 0 0 0 X 0 0
    // 0 0 0 0 X 0 0 0
    // 0 0 0 X 0 0 0 0
    // X X X 0 0 0 0 0
    pub fn get_diagonal3_index(&self) -> usize {
        INDEX_BLACK[Self::_u64_diagonal3(self.black)] + INDEX_WHITE[Self::_u64_diagonal3(self.white)]
    }

    #[inline(always)]
    fn _u64_edge1(num: u64) -> usize {
        let mut result = num & 0x031f;
        result |= (num & 0x010000) >> 11;
        result |= (num & 0x01000000) >> 18;
        result |= (num & 0x0100000000) >> 25;
        result as usize
    }

    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 1
    // 0 0 0 0 0 0 0 1
    // 0 0 0 0 0 0 0 1
    // 0 0 0 0 0 0 1 1
    // 0 0 0 1 1 1 1 1
    pub fn get_edge1_index(&self) -> usize {
        INDEX_BLACK[Self::_u64_edge1(self.black)] + INDEX_WHITE[Self::_u64_edge1(self.white)]
    }

    #[inline(always)]
    fn _u64_diaghalf(num: u64) -> usize {
        let mut result = num & 0x03;
        result |= (num & 0x0700) >> 6;
        result |= (num & 0x0e0000) >> 12;
        result |= (num & 0x0c000000) >> 18;
        result as usize
    }

    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 1 1 0 0
    // 0 0 0 0 1 1 1 0
    // 0 0 0 0 0 1 1 1
    // 0 0 0 0 0 0 1 1
    pub fn get_diaghalf_index(&self) -> usize {
        INDEX_BLACK[Self::_u64_diaghalf(self.black)] + INDEX_WHITE[Self::_u64_diaghalf(self.white)]
    }

    #[inline(always)]
    fn _u64_edge2(num: u64) -> usize {
        let mut result = num & 0x03e7;
        result |= (num & 0xc000) >> 11;
        result as usize
    }

    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0 0
    // 1 1 0 0 0 0 1 1
    // 1 1 1 0 0 1 1 1
    pub fn get_edge2_index(&self) -> usize {
        INDEX_BLACK[Self::_u64_edge2(self.black)] + INDEX_WHITE[Self::_u64_edge2(self.white)]
    }

    pub fn get_eval(&self) -> f32 {
        let weights = WEIGHTS.lock().unwrap();
        let phase = calc_phase(self.black, self.white);
        let weight = &weights[phase];

        let mut result: f32 = 0.0;

        let mut nodes: [EvalBoard; 8] = unsafe { std::mem::zeroed() };
        nodes[0] = *self;
        nodes[1] = nodes[0].rotate_90();
        nodes[2] = nodes[1].rotate_90();
        nodes[3] = nodes[2].rotate_90();
        nodes[4] = nodes[0].flip_diagonal();
        nodes[5] = nodes[4].rotate_90();
        nodes[6] = nodes[5].rotate_90();
        nodes[7] = nodes[6].rotate_90();

        for node in nodes {
            result += weight.horizontal1[node.get_horizontal1_index()];
            result += weight.horizontal2[node.get_horizontal2_index()];
            result += weight.horizontal3[node.get_horizontal3_index()];
            result += weight.horizontal4[node.get_horizontal4_index()];
            result += weight.triangle[node.get_triangle_index()];
            result += weight.diagonal1[node.get_diagonal1_index()];
            result += weight.diagonal2[node.get_diagonal2_index()];
            result += weight.diagonal3[node.get_diagonal3_index()];
            result += weight.edge1[node.get_edge1_index()];
            result += weight.diaghalf[node.get_diaghalf_index()];
            result += weight.edge2[node.get_edge2_index()];
        }

        result
    }

    pub fn get_eval_light(&self) -> f32 {
        let weights = WEIGHTS.lock().unwrap();
        let phase = calc_phase(self.black, self.white);
        let weight = &weights[phase];

        let mut result: f32 = 0.0;

        let mut nodes: [EvalBoard; 4] = unsafe { std::mem::zeroed() };
        nodes[0] = *self;
        nodes[1] = nodes[0].rotate_90();
        nodes[2] = nodes[1].rotate_90();
        nodes[3] = nodes[2].rotate_90();

        for node in nodes {
            result += weight.horizontal1[node.get_horizontal1_index()];
            result += weight.horizontal2[node.get_horizontal2_index()];
            result += weight.horizontal3[node.get_horizontal3_index()];
            result += weight.triangle[node.get_triangle_index()];
            result += weight.diagonal1[node.get_diagonal1_index()];
            result += weight.diaghalf[node.get_diaghalf_index()];
        }

        result * 8.0
    }

    pub fn train(&self, score: i32) {
        update_weight(self, score);
    }
}

/// 現在の石数から phase (0..NUM_PHASE) を求める。
fn calc_phase(black: u64, white: u64) -> usize {
    let stones = black.count_ones() + white.count_ones();
    // stones == 64 は phase NUM_PHASE - 1 に分類したいので 64 ではなく 65 で割る。
    (stones as usize * NUM_PHASE) / 65
}

#[test]
fn test_board_patterns() -> Result<(), Box<dyn std::error::Error>> {
    assert_eq!(EvalBoard::_u64_horizontal1(0xffff), 0x3ff);
    assert_eq!(EvalBoard::_u64_horizontal1(0xff00), 0x300);
    assert_eq!(EvalBoard::_u64_triangle(0xffffffff), 0x3ff);
    assert_eq!(EvalBoard::_u64_triangle(0x0103070f), 0x3ff);
    assert_eq!(EvalBoard::_u64_triangle(0x01000000), 0x0200);
    assert_eq!(EvalBoard::_u64_diagonal1(0xffffffffffffffff), 0xff);
    assert_eq!(EvalBoard::_u64_diagonal1(0x0102040810204080), 0xff);
    assert_eq!(EvalBoard::_u64_diagonal1(0xffff000000000000), 0x03);
    assert_eq!(EvalBoard::_u64_diagonal1(0x10204080), 0xf0);
    assert_eq!(EvalBoard::_u64_diagonal2(0xffffffffffffffff), 0x1ff);
    assert_eq!(EvalBoard::_u64_diagonal2(0x081020c0), 0x1f0);
    assert_eq!(EvalBoard::_u64_diagonal2(0x0101010101010101), 3);
    assert_eq!(EvalBoard::_u64_diagonal3(0xffffffffffffffff), 0x3ff);
    assert_eq!(EvalBoard::_u64_diagonal3(0x01010102040810e0), 0x3ff);
    assert_eq!(EvalBoard::_u64_edge1(0xffffffffffffffff), 0x3ff);
    assert_eq!(EvalBoard::_u64_edge1(0x010101031f), 0x3ff);
    assert_eq!(EvalBoard::_u64_diaghalf(0xffffffffffffffff), 0x3ff);
    assert_eq!(EvalBoard::_u64_diaghalf(0x0c0e0703), 0x3ff);
    assert_eq!(EvalBoard::_u64_diaghalf(0xffff), 0b11111);
    assert_eq!(EvalBoard::_u64_edge2(0xc3e7), 0x3ff);
    Ok(())
}

pub fn init_weight() -> Result<(), Box<dyn std::error::Error>> {
    let mut weights = WEIGHTS.lock()?;
    weights.clear();

    let zeros_3_8: Vec<f32> = vec![0.0; 3usize.pow(8)];
    let zeros_3_9: Vec<f32> = vec![0.0; 3usize.pow(9)];
    let zeros_3_10: Vec<f32> = vec![0.0; 3usize.pow(10)];

    let w = Weights {
        horizontal1: zeros_3_10.clone(),
        horizontal2: zeros_3_8.clone(),
        horizontal3: zeros_3_8.clone(),
        horizontal4: zeros_3_8.clone(),
        triangle: zeros_3_10.clone(),
        diagonal1: zeros_3_8.clone(),
        diagonal2: zeros_3_9.clone(),
        diagonal3: zeros_3_10.clone(),
        edge1: zeros_3_10.clone(),
        diaghalf: zeros_3_10.clone(),
        edge2: zeros_3_10.clone(),
    };

    for _ in 0..NUM_PHASE {
        weights.push(w.clone());
    }

    Ok(())
}

/// Takes a Vec<f32>, compresses it using Gzip, and converts it into a Base64-encoded string.
/// This function is the inverse of b64_to_f32vec().
fn f32vec_to_b64(v: &[f32]) -> String {
    use flate2::{Compression, write::GzEncoder};
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());

    for &f in v {
        let ff = (f * WEIGHT_SCALE_FACTOR).round();
        encoder.write_all(&ff.to_be_bytes()).unwrap();
    }

    let compressed_bytes = encoder.finish().unwrap();
    base64::encode(compressed_bytes)
}

/// Takes a Base64-encoded string, and docode it to Vec<f32>.
/// This function is the inverse of f32vec_to_b64().
fn b64_to_f32vec(s: &str) -> Vec<f32> {
    use std::io::prelude::*;

    let compressed = base64::decode(s).expect("Invalid Base64");
    let mut decoder = flate2::read::GzDecoder::new(&compressed[..]);
    let mut u8array: Vec<u8> = Vec::new();
    decoder.read_to_end(&mut u8array).expect("Gzip decompression failed");

    u8array
        .chunks_exact(4)
        .map(|chunk| f32::from_be_bytes(chunk.try_into().unwrap()) / WEIGHT_SCALE_FACTOR)
        .collect()
}

#[test]
fn test_b64_f32_conversion() -> Result<(), Box<dyn std::error::Error>> {
    let input = [0.0, 1.1, 2.2, 3.3, 4.4, 5.5, 100.0];
    let output = b64_to_f32vec(&f32vec_to_b64(&input));
    for i in 0..input.len() {
        let diff = input[i] - output[i];
        assert!(diff.abs() < 0.05, "Difference > 5%");
    }
    Ok(())
}

pub fn export_weight() -> Result<String, Box<dyn std::error::Error>> {
    let mut result = String::new();
    let weight_list = WEIGHTS.lock()?;

    for (phase, weights) in weight_list.iter().enumerate() {
        result += format!("Phase {phase}\n").as_str();

        result += "horizontal1 ";
        result += f32vec_to_b64(&weights.horizontal1).as_str();
        result += "\n";

        result += "horizontal2 ";
        result += f32vec_to_b64(&weights.horizontal2).as_str();
        result += "\n";

        result += "horizontal3 ";
        result += f32vec_to_b64(&weights.horizontal3).as_str();
        result += "\n";

        result += "horizontal4 ";
        result += f32vec_to_b64(&weights.horizontal4).as_str();
        result += "\n";

        result += "triangle ";
        result += f32vec_to_b64(&weights.triangle).as_str();
        result += "\n";

        result += "diagonal1 ";
        result += f32vec_to_b64(&weights.diagonal1).as_str();
        result += "\n";

        result += "diagonal2 ";
        result += f32vec_to_b64(&weights.diagonal2).as_str();
        result += "\n";

        result += "diagonal3 ";
        result += f32vec_to_b64(&weights.diagonal3).as_str();
        result += "\n";

        result += "edge1 ";
        result += f32vec_to_b64(&weights.edge1).as_str();
        result += "\n";

        result += "diaghalf ";
        result += f32vec_to_b64(&weights.diaghalf).as_str();
        result += "\n";

        result += "edge2 ";
        result += f32vec_to_b64(&weights.edge2).as_str();
        result += "\n";
    }

    Ok(result)
}

pub fn import_weight(data: &str) -> Result<(), Box<dyn std::error::Error>> {
    init_weight()?;
    let mut weight_list = WEIGHTS.lock()?;

    let mut phase = 0xffusize; // Initialize with invalid value.

    for line in data.lines() {
        if line.starts_with("Phase") {
            let mut strlist = line.split_whitespace();
            strlist.next().unwrap();
            let s = strlist.next().unwrap();
            let ss = s.parse::<usize>()?;
            phase = ss;
            continue;
        }

        if line.starts_with("horizontal1") {
            weight_list[phase].horizontal1 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("horizontal2") {
            weight_list[phase].horizontal2 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("horizontal3") {
            weight_list[phase].horizontal3 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("horizontal4") {
            weight_list[phase].horizontal4 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("triangle") {
            weight_list[phase].triangle = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("diagonal1") {
            weight_list[phase].diagonal1 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("diagonal2") {
            weight_list[phase].diagonal2 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("diagonal3") {
            weight_list[phase].diagonal3 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("edge1") {
            weight_list[phase].edge1 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("diaghalf") {
            weight_list[phase].diaghalf = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }

        if line.starts_with("edge2") {
            weight_list[phase].edge2 = b64_to_f32vec(&line[line.find(' ').unwrap() + 1..]);
        }
    }

    Ok(())
}

fn update_weight(board: &EvalBoard, score: i32) {
    let phase = calc_phase(board.black, board.white);

    let eval_accurate = score as f32;
    let eval_old = board.get_eval();
    let delta = (eval_accurate - eval_old) * LEARNING_RATE;
    let weights = &mut WEIGHTS.lock().unwrap()[phase];

    let mut nodes = [*board; 8];
    nodes[1] = nodes[0].rotate_90();
    nodes[2] = nodes[1].rotate_90();
    nodes[3] = nodes[2].rotate_90();
    nodes[4] = nodes[0].flip_diagonal();
    nodes[5] = nodes[4].rotate_90();
    nodes[6] = nodes[5].rotate_90();
    nodes[7] = nodes[6].rotate_90();

    for node in nodes {
        let index = node.get_horizontal1_index();
        if index > 0 {
            weights.horizontal1[index] += delta;
        }

        let index = node.get_horizontal2_index();
        if index > 0 {
            weights.horizontal2[index] += delta;
        }

        let index = node.get_horizontal3_index();
        if index > 0 {
            weights.horizontal3[index] += delta;
        }

        let index = node.get_horizontal4_index();
        if index > 0 {
            weights.horizontal4[index] += delta;
        }

        let index = node.get_triangle_index();
        if index > 0 {
            weights.triangle[index] += delta;
        }

        let index = node.get_diagonal1_index();
        if index > 0 {
            weights.diagonal1[index] += delta;
        }

        let index = node.get_diagonal2_index();
        if index > 0 {
            weights.diagonal2[index] += delta;
        }

        let index = node.get_diagonal3_index();
        if index > 0 {
            weights.diagonal3[index] += delta;
        }

        let index = node.get_edge1_index();
        if index > 0 {
            weights.edge1[index] += delta;
        }

        let index = node.get_diaghalf_index();
        if index > 0 {
            weights.diaghalf[index] += delta;
        }

        let index = node.get_edge2_index();
        if index > 0 {
            weights.edge2[index] += delta;
        }
    }
}

/// 静的評価関数
pub fn evaluate(black: u64, white: u64) -> f32 {
    let board = EvalBoard::new(black, white);
    board.get_eval()
}

/// move ordering 用の軽量版価関数
pub fn evaluate_light(black: u64, white: u64) -> f32 {
    let board = EvalBoard::new(black, white);
    board.get_eval_light()
}

/// 重みの学習で評価値が教師データに近づいていくことを確認する。
#[test]
fn test_learning() -> Result<(), Box<dyn std::error::Error>> {
    while BLOCK_TEST.load(std::sync::atomic::Ordering::Acquire) {
        println!("Waiting for test_import_export() to complete.");
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    init_weight()?;

    let board = EvalBoard::new(0x181b030b123030, 0x7e2464fcf4ec0000);
    let eval_answer = 30;

    let mut previous_eval = 0.0;

    println!("{}", &format!("Learning eval answer = {}", eval_answer));
    for i in 0..10 {
        update_weight(&board, eval_answer);
        let eval = board.get_eval();
        assert!(eval > previous_eval);
        assert!(eval < eval_answer as f32);
        println!("After {i} training, eval is {}", board.get_eval());
        previous_eval = eval;
    }

    Ok(())
}

/// 重みデータのインポート・エクスポートのテスト
#[test]
fn test_import_export() -> Result<(), Box<dyn std::error::Error>> {
    let start_time = std::time::Instant::now();
    init_weight()?;

    {
        let mut weights = WEIGHTS.lock()?;
        weights[0].horizontal1[0] = 10.0;
        weights[2].edge1[2] = 10.0;
    }

    let data_str = export_weight()?;
    init_weight()?;
    import_weight(&data_str)?;

    let weights = WEIGHTS.lock()?;
    assert_eq!(weights[0].horizontal1[0], 10.0);
    assert_eq!(weights[2].edge1[2], 10.0);

    println!("[test_import_export] Took {} ms.", start_time.elapsed().as_millis());
    BLOCK_TEST.store(false, std::sync::atomic::Ordering::Release);
    Ok(())
}
