use once_cell::sync::Lazy;

pub static INDEX_BLACK: Lazy<[usize; 1024]> = Lazy::new(|| {
    let mut arr = [0; 1024];

    for i in 0..1024 {
        arr[i] = INDEX_WHITE[i] * 2;
    }

    arr
});

pub static INDEX_WHITE: Lazy<[usize; 1024]> = Lazy::new(|| {
    let mut arr = [0; 1024];

    for i in 0..1024 {
        let binary = format!("{i:b}");
        let decimal = usize::from_str_radix(&binary, 3).expect("(BUG) Invalid ternary string");
        arr[i] = decimal;
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
