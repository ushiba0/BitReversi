use crate::bitboard::BitBoard;

#[cfg(test)]
#[test]
fn test_test() {
    assert!(true, "This test should pass.");
}

#[cfg(test)]
#[test]
fn test_nega_alpha() -> Result<(), Box<dyn std::error::Error>> {
    let start = std::time::Instant::now();
    let board = BitBoard::from_str("1030f078ccd40801,c0c0e87332bf7fe,1");
    assert_eq!(board.nega_alpha(-64, 64), -12);
    let board = BitBoard::from_str("1030f078ccd40800,c0c0e87332bf6fe,1");
    assert_eq!(board.nega_alpha(-64, 64), -12);
    let board = BitBoard::from_str("1030f078c8d40c00,c0c0e873629f2fe,1");
    assert_eq!(board.nega_alpha(-64, 64), -12);
    let board = BitBoard::from_str("1030f068c0d00800,c0c0e973e2cf4fe,1");
    assert_eq!(board.nega_alpha(-64, 64), -12);
    let board = BitBoard::from_str("2004003e25090107,8f98f8c0d8f6fe88,1");
    assert_eq!(board.nega_alpha(-64, 64), 2);
    let board = BitBoard::from_str("181b030b123070,7e2464fcf4ec0400,1");
    assert_eq!(board.nega_alpha(-64, 64), -4);
    let board = BitBoard::from_str("181b0303162070,7e2464fcfce81c08,1");
    assert_eq!(board.nega_alpha(-64, 64), -2);
    let board = BitBoard::from_str("fffffefee8c0fafc,173f0000,1");
    assert_eq!(board.nega_alpha(-64, 64), 60);
    println!(
        "test_nega_alpha Elapsed: {} ms",
        start.elapsed().as_millis()
    );

    // this test will take over 30 seconds.
    //let board = BitBoard::from_str("181b030b123030,7e2464fcf4ec0000,1");
    //assert_eq!(board.nega_alpha(-64, 64), 0);
    // Note: algo: nega_alpha, mean: 3350 ms
    // Note: algo: ab_with_map, mean: 2700 ms
    // Note: algo: mtdf, mean: 450 ms
    Ok(())
}

#[cfg(test)]
#[test]
fn test_ab_with_map() -> Result<(), Box<dyn std::error::Error>> {
    let start = std::time::Instant::now();
    let board = BitBoard::from_str("1030f078ccd40801,c0c0e87332bf7fe,1");
    assert_eq!(board.ab_with_map(-64, 64), -12);
    let board = BitBoard::from_str("1030f078ccd40800,c0c0e87332bf6fe,1");
    assert_eq!(board.ab_with_map(-64, 64), -12);
    let board = BitBoard::from_str("1030f078c8d40c00,c0c0e873629f2fe,1");
    assert_eq!(board.ab_with_map(-64, 64), -12);
    let board = BitBoard::from_str("1030f068c0d00800,c0c0e973e2cf4fe,1");
    assert_eq!(board.ab_with_map(-64, 64), -12);
    let board = BitBoard::from_str("2004003e25090107,8f98f8c0d8f6fe88,1");
    assert_eq!(board.ab_with_map(-64, 64), 2);
    let board = BitBoard::from_str("181b030b123070,7e2464fcf4ec0400,1");
    assert_eq!(board.ab_with_map(-64, 64), -4);
    let board = BitBoard::from_str("181b0303162070,7e2464fcfce81c08,1");
    assert_eq!(board.ab_with_map(-64, 64), -2);
    let board = BitBoard::from_str("fffffefee8c0fafc,173f0000,1");
    assert_eq!(board.ab_with_map(-64, 64), 60);
    println!(
        "test_ab_with_map Elapsed: {} ms",
        start.elapsed().as_millis()
    );
    Ok(())
}

#[cfg(test)]
#[test]
fn test_mtdf() -> Result<(), Box<dyn std::error::Error>> {
    let start = std::time::Instant::now();
    let board = BitBoard::from_str("1030f078ccd40801,c0c0e87332bf7fe,1");
    assert_eq!(board.mtdf(), -12);
    let board = BitBoard::from_str("1030f078ccd40800,c0c0e87332bf6fe,1");
    assert_eq!(board.mtdf(), -12);
    let board = BitBoard::from_str("1030f078c8d40c00,c0c0e873629f2fe,1");
    assert_eq!(board.mtdf(), -12);
    let board = BitBoard::from_str("1030f068c0d00800,c0c0e973e2cf4fe,1");
    assert_eq!(board.mtdf(), -12);
    let board = BitBoard::from_str("2004003e25090107,8f98f8c0d8f6fe88,1");
    assert_eq!(board.mtdf(), 2);
    let board = BitBoard::from_str("181b030b123070,7e2464fcf4ec0400,1");
    assert_eq!(board.mtdf(), -4);
    let board = BitBoard::from_str("181b0303162070,7e2464fcfce81c08,1");
    assert_eq!(board.mtdf(), -2);
    let board = BitBoard::from_str("fffffefee8c0fafc,173f0000,1");
    assert_eq!(board.mtdf(), 60);
    println!("test_mtdf Elapsed: {} ms", start.elapsed().as_millis());
    Ok(())
}

// #[cfg(test)]
// #[test]
// fn test_generate_random_board() -> Result<(), Box<dyn std::error::Error>> {
//     let start = std::time::Instant::now();
//     for stones in 4u32..=64 {
//         for _ in 0..10 {
//             crate::train::generate_random_board(stones);
//         }
//     }
//     println!(
//         "test_generate_random_board Elapsed: {} ms",
//         start.elapsed().as_millis()
//     );
//     Ok(())
// }

// #[cfg(test)]
// #[test]
// fn try_eval_weight_data() -> Result<(), Box<dyn std::error::Error>> {
//     let start = std::time::Instant::now();
//     let weight_data_filename = "eval.bin".to_string();
//     crate::load_weight_data_helper(&weight_data_filename, 0)?;
//     let mut diff_sum = 0u64;
//     let num_iter = 1usize;
//     let mut counter = 0u64;

//     for _ in 0..num_iter {
//         for stones in 50..=59 {
//             counter += 1;
//             let board = crate::train::generate_random_board(stones);
//             let eval_estimated = board.nega_alpha_eval(-0xffff, 0xffff, 0, 0);
//             let eval_actual = board.mtdf();
//             println!(
//                 "stones = {: <4}, eval_estimated: {: <4}, eval_actual: {}, diff = {}, board = {}",
//                 stones,
//                 eval_estimated,
//                 eval_actual,
//                 (eval_estimated - eval_actual).abs(),
//                 board.to_string()
//             );
//             diff_sum += (eval_estimated - eval_actual).pow(2) as u64;
//         }
//     }
//     println!("sigma = {}", ((diff_sum / counter) as f64).sqrt());
//     println!(
//         "try_eval_weight_data Elapsed: {} ms",
//         start.elapsed().as_millis()
//     );
//     Ok(())
// }

// #[cfg(test)]
// #[test]
// fn test_board_mask() -> Result<(), Box<dyn std::error::Error>> {
//     let start = std::time::Instant::now();
//     let num_iter = 10usize;
//     let mask_upper_right = 0x0f0f0f0f00000000u64;
//     let mask_upper_left = 0xf0f0f0f000000000u64;
//     let mask_lower_right = 0x0f0f0f0fu64;
//     let mask_lower_left = 0xf0f0f0f0u64;

//     for _ in 0..num_iter {
//         let num_stones = 48;
//         let mut board = crate::train::generate_random_board(num_stones);
//         dbg!(board.mtdf());

//         let mut sum = 0;
//         board.mask = mask_upper_right;
//         sum += board.mtdf();
//         board.mask = mask_upper_left;
//         sum += board.mtdf();
//         board.mask = mask_lower_right;
//         sum += board.mtdf();
//         board.mask = mask_lower_left;
//         sum += board.mtdf();
//         let mean = sum / 4;
//         dbg!(mean);
//     }

//     println!("test_mtdf Elapsed: {} ms", start.elapsed().as_millis());
//     Ok(())
// }

#[cfg(test)]
#[test]
// http://www.radagast.se/othello/ffotest.html
fn test_ffo() -> Result<(), Box<dyn std::error::Error>> {
    let start = std::time::Instant::now();
    /*
        // 3160 ms
        let ffo40 = BitBoard::from_str("101312303010100,9e7ecedcfc1e0800,1");
        assert_eq!(ffo40.mtdf(), 38);

        // 31300 ms
        let ffo43 = BitBoard::from_str("3e3c0c1e1c08143e,706062f60800,-1");
        assert_eq!(ffo43.mtdf(), -12);

    */
    println!("test_mtdf Elapsed: {} ms", start.elapsed().as_millis());
    Ok(())
}
/*
|40|20|+38|+38|A2|27.6M|   0.409s|67M/s|
|41|22| +0| +0|H4|28.5M|   0.459s|62M/s|
|42|22| +6| +6|G2|69.8M|   1.125s|62M/s|
|43|23|-12|-12|C7| 107M|   2.218s|48M/s|
|44|23|-14|-14|D2|32.2M|   0.550s|58M/s|
|45|24| +6| +6|B2| 953M|  19.670s|48M/s|
*/
