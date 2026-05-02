use std::fs::File;
use std::io::{BufRead, BufReader};
use std::sync::atomic::Ordering;

use clap::{Parser, Subcommand};
use std::io::prelude::*;

#[cfg(test)]
mod test;

use bitreversi::bitboard;
use bitreversi::bitboard::BitBoard;

#[derive(Debug)]
enum Algo {
    NegaAlpha,
    Mtdf,
    Ab,
    NegaScout,
    NegaAlphaEval,
}

#[derive(Parser, Debug)]
struct ClapEvalArgs {
    /// Reversi board to solve (f5d6 format.)
    #[arg(short, long, allow_hyphen_values = true)]
    board: String,

    /// Path to weight data to use.
    #[arg(short, long)]
    weight: String,

    /// Search depth.
    #[arg(short, long, default_value_t = 0)]
    depth: u32,

    /// Search algorithm.
    #[arg(short, long, default_value = "NegaAlphaEval")]
    algo: String,

    #[arg(long, default_value_t = -64, allow_hyphen_values = true)]
    alpha: i32,

    #[arg(long, default_value_t = 64, allow_hyphen_values = true)]
    beta: i32,
}

#[derive(Parser, Debug)]
struct ClapAssessArgs {
    /// Path to training data file.
    #[arg(short, long)]
    training_data: String,

    /// Path to weight data to use.
    #[arg(short, long)]
    weight: String,

    /// Search depth.
    #[arg(short, long, default_value_t = 0)]
    depth: u32,

    /// Maximum node numbers to assess.
    #[arg(short, long)]
    max: Option<u64>,

    #[arg(long, default_value_t = -64, allow_hyphen_values = true)]
    alpha: i32,

    #[arg(long, default_value_t = 64, allow_hyphen_values = true)]
    beta: i32,
}

#[derive(Parser, Debug)]
struct ClapShowEvalArgs {
    /// Reversi board to solve (f5d6 format.)
    #[arg(short, long, allow_hyphen_values = true)]
    board: String,

    /// Path to weight data to use.
    #[arg(short, long)]
    weight: String,

    /// Search depth.
    #[arg(short, long, default_value_t = 0)]
    depth: u32,
}

#[derive(Parser, Debug)]
struct ClapTrainArgs {
    /// Path to training data file.
    #[arg(short, long)]
    training_data: String,

    /// Path to weight data to use.
    #[arg(short, long)]
    weight: Option<String>,

    /// Output train data.
    #[arg(short, long)]
    outfile: String,

    /// Maximum node numbers to train.
    #[arg(short, long)]
    max: Option<u64>,
}

#[derive(Parser, Debug)]
struct ClapPrintArgs {
    /// Reversi board to solve (f5d6 format.)
    #[arg(short, long, allow_hyphen_values = true)]
    board: String,

    /// Current turn (one of `black` or `white`)
    #[arg(short, long, default_value = "black")]
    turn: String,
}

#[derive(Parser, Debug)]
struct ClapStatsArgs {
    /// Path to weight data to use.
    #[arg(short, long)]
    weight: String,
}

#[derive(Subcommand, Debug)]
enum ClapSubcommand {
    /// Calculate the loss between evaluation values derived from weights and the score of training dataset. Outputs the mean of abs(eval - score).
    Assess(ClapAssessArgs),

    /// Calculate the evaluation value for the input board.
    Solve(ClapEvalArgs),

    /// Calculate the evaluation value for the input board.
    ShowEval(ClapShowEvalArgs),

    /// Train weights using dataset.
    Train(ClapTrainArgs),

    Ffo,

    /// Generates zeroed weight data file.
    Generate,

    /// Print board.
    Print(ClapPrintArgs),

    /// Print stats of weight data.
    Stats(ClapStatsArgs),
}

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct ClapArgs {
    #[clap(subcommand)]
    subcmd: ClapSubcommand,

    /// Log level (One of error, warn, info, debug and trace.)
    #[arg(short, long)]
    log: Option<String>,
}

fn set_loglevel(loglevel: &str) {
    unsafe {
        std::env::set_var("RUST_LOG", loglevel);
    }
}

fn print_board(board: &BitBoard) {
    let mut result = "  a b c d e f g h\n".to_string();
    result += "  ---------------\n";
    let black_stone = "X";
    let white_stone = "0";
    let blank_cell = " ";

    for (index, row) in (0..8).rev().enumerate() {
        result += format!("{}", index + 1).as_str();
        result += "|";
        for col in (0..8).rev() {
            let bit = 1 << (row * 8 + col);
            let stone = if board.black & bit != 0 {
                black_stone
            } else if board.white & bit != 0 {
                white_stone
            } else {
                blank_cell
            };
            result += stone;
            result += " ";
        }
        result += "\n";
    }
    print!("{result}");
}

fn load_weight_data(path_to_file: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut file = File::open(path_to_file)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    bitreversi::bitboard::eval::import_weight(&content)?;
    log::info!("Loaded weight data from file {path_to_file}.");
    Ok(())
}

struct AssesmentStats {
    total_count: u64,        // 評価した全データ数
    total_diff: u64,         // 教師データと評価値の差の合計
    diff_over_10_count: u64, // 評価値と教師データの差が 10 以上の回数
    wrong_count: u64,        // 教師データと評価値の正負が異なっていた回数
    wrong_count_base: u64,
}

/// 教師データを利用して Weight データを評価する。
fn assess_weight(args: &ClapAssessArgs) -> Result<(), Box<dyn std::error::Error>> {
    load_weight_data(&args.weight)?;

    let max_assess_num = args.max.unwrap_or(u64::MAX);

    let dataset_file = File::open(&args.training_data)?;
    let reader = BufReader::new(dataset_file);

    let mut stats: AssesmentStats = unsafe { std::mem::zeroed() };
    let start_time = std::time::Instant::now();
    let mut time_since = std::time::Instant::now();

    let print_loss = |stats: &AssesmentStats| {
        let total_count = stats.total_count;
        let loss = (stats.total_diff as f32) / (stats.total_count as f32);
        let wrong_rate = (stats.wrong_count as f32) / (stats.wrong_count_base as f32 + 1.0);
        let elapsed_ms = std::cmp::max(start_time.elapsed().as_millis(), 1);
        let read_nodes_count = bitboard::READ_NODE_COUNT.load(Ordering::Relaxed) as u128;
        let node_per_ms = read_nodes_count / elapsed_ms;
        println!(
            "Number of data = {total_count}, loss = {loss}, wrong_rate = {wrong_rate}, \
            Elapsed = {elapsed_ms} ms, read = {read_nodes_count} nodes, Speed = {node_per_ms} Knodes/s."
        );
        println!("diff > 10: {}", stats.diff_over_10_count as f32 / stats.total_count as f32);
    };

    for line in reader.lines() {
        // Print stats every 10 seconds.
        if time_since.elapsed().as_millis() > 10 * 1000 {
            print_loss(&stats);
            time_since = std::time::Instant::now();
        }
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }

        let mut parts = line.split_ascii_whitespace();
        let Some(m5t6) = parts.next() else {
            continue;
        };
        let board = BitBoard::from_f5d6(m5t6);
        let score = if let Some(score_str) = parts.next() {
            score_str.parse::<i64>().unwrap_or_default()
        } else {
            continue;
        };

        // let eval = board.nega_alpha_eval(-64, 64, depth, 0) as i64;
        let eval = board.nega_alpha_eval(args.alpha, args.beta, args.depth) as i64;
        log::trace!("{m5t6} Score: {score}, Estimated: {eval}");
        let d = score - eval;
        stats.total_diff += d.unsigned_abs();
        stats.total_count += 1;
        if d.abs() >= 10 {
            stats.diff_over_10_count += 1;
        }
        if eval * score <= 0 && d.abs() > 10 {
            stats.wrong_count += 1;
            log::trace!("(big diff) {m5t6} Score: {score}, Estimated: {eval} (diff={d})");
        }
        if eval * score != 0 {
            stats.wrong_count_base += 1;
        }

        if stats.total_count > max_assess_num {
            break;
        }
    }

    print_loss(&stats);
    Ok(())
}

/// 教師データを利用して Weight データを学習する。
fn train_weight(training_data: &str, max_train_num: u64) -> Result<(), Box<dyn std::error::Error>> {
    let dataset_file = File::open(training_data)?;
    let reader = BufReader::new(dataset_file);

    let mut total_data_count = 0;
    let mut total_diff: u64 = 0; // 教師データとの差の絶対値の合計。

    let start_time = std::time::Instant::now();
    let mut time_since = std::time::Instant::now();

    let print_loss = |total_diff: u64, total_data_count: u64| {
        let loss = (total_diff as f32) / (total_data_count as f32);
        let elapsed_ms = std::cmp::max(start_time.elapsed().as_millis(), 1);
        println!("Number of data = {total_data_count}, loss = {loss}, Elapsed = {elapsed_ms} ms.");
    };

    for line in reader.lines() {
        // Print stats every 10 seconds.
        if time_since.elapsed().as_millis() > 10 * 1000 {
            print_loss(total_diff, total_data_count);
            time_since = std::time::Instant::now();
        }
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }

        let mut parts = line.split_ascii_whitespace();
        let Some(m5t6) = parts.next() else {
            continue;
        };
        let board = BitBoard::from_f5d6(m5t6);
        let evalboard = bitreversi::bitboard::eval::EvalBoard::new(board.black, board.white);
        let old_eval = evalboard.get_eval();
        let score = if let Some(score_str) = parts.next() {
            score_str.parse::<i64>().unwrap_or_default()
        } else {
            continue;
        };
        evalboard.train(score as i32);

        let d = score - old_eval as i64;
        total_diff += d.unsigned_abs();
        total_data_count += 1;

        if total_data_count > max_train_num {
            break;
        }
    }

    print_loss(total_diff, total_data_count);
    Ok(())
}

/// 各特徴量の重みデータの統計を表示。
pub fn weights_stats() {
    let weights = bitreversi::bitboard::eval::WEIGHTS.lock().unwrap();

    let array_stats = |arr: &[f32]| {
        let mut v = arr.to_vec();
        v.sort_unstable_by(|a, b| a.partial_cmp(b).unwrap());
        let max = v.last().unwrap();
        let min = v.first().unwrap();
        let sum = v.iter().fold(0.0, |acc, x| acc + x);
        let mean = sum / v.len() as f32;
        let median = v[v.len() / 2];
        let zeros_count = v.iter().filter(|x| x.abs() < 0.01).count();
        let zeros_pct = (zeros_count * 100) as f32 / v.len() as f32;
        println!("min: {min:.2}, max: {max:.2}, mean: {mean:.2}, median: {median:.2}, zeros: {zeros_pct:.2}");
    };

    for (phase, weight) in weights.iter().enumerate() {
        print!("Phase {phase} horizontal1    ");
        array_stats(&weight.horizontal1);
        print!("Phase {phase} horizontal2    ");
        array_stats(&weight.horizontal2);
        print!("Phase {phase} horizontal3    ");
        array_stats(&weight.horizontal3);
        print!("Phase {phase} horizontal4    ");
        array_stats(&weight.horizontal4);
        print!("Phase {phase} triangle       ");
        array_stats(&weight.triangle);
        print!("Phase {phase} diagonal1      ");
        array_stats(&weight.diagonal1);
        print!("Phase {phase} diagonal2      ");
        array_stats(&weight.diagonal2);
        print!("Phase {phase} diagonal3      ");
        array_stats(&weight.diagonal3);
        print!("Phase {phase} edge1          ");
        array_stats(&weight.edge1);
        print!("Phase {phase} diaghalf       ");
        array_stats(&weight.diaghalf);

        println!();
    }
}

fn solve(args: &ClapEvalArgs) -> Result<(), Box<dyn std::error::Error>> {
    load_weight_data(&args.weight)?;

    let board = BitBoard::from_f5d6(&args.board);
    log::info!("Evaluating board {board:?}");
    print_board(&board);

    let algo = match args.algo.to_lowercase().as_str() {
        "negaalpha" | "nega" => Algo::NegaAlpha,
        "negascout" | "ns" => Algo::NegaScout,
        "mtdf" => Algo::Mtdf,
        "ab" => Algo::Ab,
        "eval" | "negaalphaeval" => Algo::NegaAlphaEval,
        _ => Algo::NegaAlphaEval,
    };

    log::info!("Using algorithm {algo:?} (alpha, beta) = ({}, {})", args.alpha, args.beta);

    let start_time = std::time::Instant::now();
    let eval = match algo {
        Algo::NegaAlpha => board.nega_alpha(args.alpha, args.beta),
        Algo::Mtdf => board.mtdf_with_window(args.alpha, args.beta),
        Algo::Ab => board.ab_with_map(args.alpha, args.beta),
        Algo::NegaScout => board.negascout(args.alpha, args.beta),
        Algo::NegaAlphaEval => board.nega_alpha_eval(args.alpha, args.beta, args.depth),
    };
    let elapsed_ns = start_time.elapsed().as_nanos() + 1;
    let elapsed_ms = elapsed_ns / 1_000_000;

    let read_node_count = bitboard::READ_NODE_COUNT.load(Ordering::Relaxed) as u128;
    let knps = read_node_count * 1_000_000 / elapsed_ns;
    let cache_hit = bitboard::BTREE_USED_COUNT.load(Ordering::Relaxed);
    let cache_len = bitreversi::get_cache_count();

    println!("Eval value: {eval}.");
    println!("Stones: {} (blank = {}).", board.count_stones(), 64 - board.count_stones());
    match read_node_count {
        0..1000 => println!("Read {read_node_count} nodes, {knps} K nodes / s"),
        1000..1_000_000 => println!("Read {:.2} K nodes, {knps} K nodes / s", read_node_count as f32 / 1000.0),
        1_000_000..1_000_000_000 => println!("Read {:.2} M nodes, {knps} K nodes / s", read_node_count as f32 / 1_000_000.0),
        _ => println!("Read {:.2} G nodes, {knps} K nodes / s", read_node_count as f32 / 1_000_000_000.0),
    }
    println!("Cache hit = {cache_hit}, Cache size = {cache_len}");
    println!("Took {elapsed_ms} ms");

    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let clapargs = ClapArgs::parse();

    // Setup logger.
    if let Some(loglevel) = clapargs.log.as_ref() {
        set_loglevel(loglevel);
    } else {
        set_loglevel("none");
    }
    env_logger::init();

    match clapargs.subcmd {
        ClapSubcommand::Assess(args) => {
            assess_weight(&args)?;
            return Ok(());
        }

        ClapSubcommand::Solve(args) => {
            solve(&args)?;
        }

        ClapSubcommand::ShowEval(args) => {
            _ = args;
            log::info!("Currently do nothing");
        }

        ClapSubcommand::Train(args) => {
            let filename = &args.outfile;

            if let Some(weight_file) = args.weight.as_ref() {
                load_weight_data(weight_file)?;
            }

            let max_train_num = args.max.unwrap_or(u64::MAX);

            train_weight(&args.training_data, max_train_num)?;

            log::info!("Exporting weight data to {filename}");
            let weight_str = bitboard::eval::export_weight()?;
            let mut file = std::fs::File::create(filename)?;
            write!(file, "{}", weight_str)?;
            file.flush()?;
            log::debug!("Export weight data done.");
        }

        ClapSubcommand::Ffo => {}

        ClapSubcommand::Generate => {
            let filename = "weight_data.txt";
            bitreversi::bitboard::eval::init_weight()?;
            let weight_str = bitboard::eval::export_weight()?;
            let mut file = std::fs::File::create(filename)?;
            write!(file, "{}", weight_str)?;
            file.flush()?;
            println!("Generate {filename}");
        }

        ClapSubcommand::Print(args) => {
            let input_board = BitBoard::from_f5d6(&args.board);
            let board = match args.turn.as_str() {
                "black" => input_board,
                "white" => BitBoard::new(input_board.white, input_board.black, -1),
                _ => return Err("Invalid argument (--turn)".into()),
            };
            print_board(&board);
        }

        ClapSubcommand::Stats(args) => {
            load_weight_data(&args.weight)?;
            weights_stats();
        }
    }

    Ok(())
}
