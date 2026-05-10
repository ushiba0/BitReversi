use bitreversi::bitboard::BitBoard;

#[cfg(test)]
#[test]
fn test_test() {
    assert!(true, "This test should pass.");
}

#[cfg(test)]
#[test]
fn test_nega_alpha() -> Result<(), Box<dyn std::error::Error>> {
    let start = std::time::Instant::now();
    let board = BitBoard::convert_from_str("1030f078ccd40801,c0c0e87332bf7fe,1");
    assert_eq!(board.nega_alpha(-64, 64), -12);
    let board = BitBoard::convert_from_str("1030f078ccd40800,c0c0e87332bf6fe,1");
    assert_eq!(board.nega_alpha(-64, 64), -12);
    let board = BitBoard::convert_from_str("1030f078c8d40c00,c0c0e873629f2fe,1");
    assert_eq!(board.nega_alpha(-64, 64), -12);
    let board = BitBoard::convert_from_str("1030f068c0d00800,c0c0e973e2cf4fe,1");
    assert_eq!(board.nega_alpha(-64, 64), -12);
    let board = BitBoard::convert_from_str("2004003e25090107,8f98f8c0d8f6fe88,1");
    assert_eq!(board.nega_alpha(-64, 64), 2);
    let board = BitBoard::convert_from_str("181b030b123070,7e2464fcf4ec0400,1");
    assert_eq!(board.nega_alpha(-64, 64), -4);
    let board = BitBoard::convert_from_str("181b0303162070,7e2464fcfce81c08,1");
    assert_eq!(board.nega_alpha(-64, 64), -2);
    let board = BitBoard::convert_from_str("fffffefee8c0fafc,173f0000,1");
    assert_eq!(board.nega_alpha(-64, 64), 60);
    println!("test_nega_alpha Elapsed: {} ms", start.elapsed().as_millis());

    Ok(())
}

#[cfg(test)]
#[test]
fn test_alpha_beta_with_map() -> Result<(), Box<dyn std::error::Error>> {
    let start = std::time::Instant::now();
    let board = BitBoard::convert_from_str("1030f078ccd40801,c0c0e87332bf7fe,1");
    assert_eq!(board.alpha_beta_with_map(-64, 64, 0), -12);
    let board = BitBoard::convert_from_str("1030f078ccd40800,c0c0e87332bf6fe,1");
    assert_eq!(board.alpha_beta_with_map(-64, 64, 0), -12);
    let board = BitBoard::convert_from_str("1030f078c8d40c00,c0c0e873629f2fe,1");
    assert_eq!(board.alpha_beta_with_map(-64, 64, 0), -12);
    let board = BitBoard::convert_from_str("1030f068c0d00800,c0c0e973e2cf4fe,1");
    assert_eq!(board.alpha_beta_with_map(-64, 64, 0), -12);
    let board = BitBoard::convert_from_str("2004003e25090107,8f98f8c0d8f6fe88,1");
    assert_eq!(board.alpha_beta_with_map(-64, 64, 0), 2);
    let board = BitBoard::convert_from_str("181b030b123070,7e2464fcf4ec0400,1");
    assert_eq!(board.alpha_beta_with_map(-64, 64, 0), -4);
    let board = BitBoard::convert_from_str("181b0303162070,7e2464fcfce81c08,1");
    assert_eq!(board.alpha_beta_with_map(-64, 64, 0), -2);
    let board = BitBoard::convert_from_str("fffffefee8c0fafc,173f0000,1");
    assert_eq!(board.alpha_beta_with_map(-64, 64, 0), 60);
    println!("test_alpha_beta_with_map Elapsed: {} ms", start.elapsed().as_millis());
    Ok(())
}

#[cfg(test)]
#[test]
fn test_mtdf() -> Result<(), Box<dyn std::error::Error>> {
    let start = std::time::Instant::now();
    let board = BitBoard::convert_from_str("1030f078ccd40801,c0c0e87332bf7fe,1");
    assert_eq!(board.mtdf_with_window(-64, 64), -12);
    let board = BitBoard::convert_from_str("1030f078ccd40800,c0c0e87332bf6fe,1");
    assert_eq!(board.mtdf_with_window(-64, 64), -12);
    let board = BitBoard::convert_from_str("1030f078c8d40c00,c0c0e873629f2fe,1");
    assert_eq!(board.mtdf_with_window(-64, 64), -12);
    let board = BitBoard::convert_from_str("1030f068c0d00800,c0c0e973e2cf4fe,1");
    assert_eq!(board.mtdf_with_window(-64, 64), -12);
    let board = BitBoard::convert_from_str("2004003e25090107,8f98f8c0d8f6fe88,1");
    assert_eq!(board.mtdf_with_window(-64, 64), 2);
    let board = BitBoard::convert_from_str("181b030b123070,7e2464fcf4ec0400,1");
    assert_eq!(board.mtdf_with_window(-64, 64), -4);
    let board = BitBoard::convert_from_str("181b0303162070,7e2464fcfce81c08,1");
    assert_eq!(board.mtdf_with_window(-64, 64), -2);
    let board = BitBoard::convert_from_str("fffffefee8c0fafc,173f0000,1");
    assert_eq!(board.mtdf_with_window(-64, 64), 60);
    println!("test_mtdf Elapsed: {} ms", start.elapsed().as_millis());
    Ok(())
}

#[cfg(test)]
#[test]
// http://www.radagast.se/othello/ffotest.html
fn test_ffo() -> Result<(), Box<dyn std::error::Error>> {
    let start = std::time::Instant::now();
    println!("test_mtdf Elapsed: {} ms", start.elapsed().as_millis());
    Ok(())
}
