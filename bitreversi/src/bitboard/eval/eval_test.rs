#[cfg(test)]
use std::sync::atomic::AtomicBool;

#[cfg(test)]
static BLOCK: AtomicBool = AtomicBool::new(true);

/// 重みの学習で評価値が教師データに近づいていくことを確認する。
#[cfg(test)]
#[test]
pub fn test_learning() -> Result<(), Box<dyn std::error::Error>> {
    while BLOCK.load(std::sync::atomic::Ordering::Acquire) {
        println!("Waiting for test_import_export() to complete.");
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    super::init_weight()?;

    let board = super::EvalBoard::new(0x181b030b123030, 0x7e2464fcf4ec0000);
    let eval_answer = 30;

    let mut previous_eval = 0.0;

    println!("{}", &format!("Learning eval answer = {}", eval_answer));
    for i in 0..10 {
        super::update_weight(&board, eval_answer);
        let eval = board.get_eval();
        assert!(eval > previous_eval);
        assert!(eval < eval_answer as f32);
        println!("After {i} training, eval is {}", board.get_eval());
        previous_eval = eval;
    }

    Ok(())
}

/// 重みデータのインポート・エクスポートのテスト
#[cfg(test)]
#[test]
pub fn test_import_export() -> Result<(), Box<dyn std::error::Error>> {
    let start_time = std::time::Instant::now();
    super::init_weight()?;

    {
        let mut weights = super::WEIGHTS.lock()?;
        weights[0].horizontal1[0] = 10.0;
        weights[2].edge1[2] = 10.0;
    }

    let data_str = super::export_weight()?;
    super::init_weight()?;
    super::import_weight(&data_str)?;

    let weights = super::WEIGHTS.lock()?;
    assert_eq!(weights[0].horizontal1[0], 10.0);
    assert_eq!(weights[2].edge1[2], 10.0);

    println!("[test_import_export] Took {} ms.", start_time.elapsed().as_millis());
    BLOCK.store(false, std::sync::atomic::Ordering::Release);
    Ok(())
}
