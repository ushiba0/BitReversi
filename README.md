# BitReversi
JavaScriptで動くりばーし

https://lychnus372.github.io/BitReversi/

## 画面の説明
### 右上の”player turn”と出てる部分
どっちのターンとか、どっちの勝ちとかが表示される

### 青ぽちのマス
着手可能位置を表す

### 緑のマス
1手前に石が置かれたマスを表す

### 青丸が突然大きくなった
コンピュータが、そのマスの先読みを終えたということ。

## ボタンの説明
### switch
黒番と白番を入れかえる

### restart
盤面をリセットして初めからリバーシを始める

### undo
1手分盤面の状況を戻す

### ...moves
読みの深さを設定する。例えば 4/12 は4手読み・終盤12手完全読みを意味する。
また 8* / 16* のようにアスタリスクがついている場合、積極的に枝刈りを行うことでスピードアップを図る。ただし、精度は下がる。

### setup board
盤面を手動でセットアップできるモードになる。セットアップが終わったら、もう一度このボタンを押してセットアップモードを脱出しよう。

### disp reset
表示がバグったときはこれを押してね



## 個人的メモ

## ファイルごとのメモ
### main.js
- reversi boardを作成。
- 各種event listenerをadd
- propertyオブジェクトに、ゲームの進行に必要な各種パラメータを格納
- displayオブジェクトに盤面の石を配列格納して、他のクラスからアクセスしやすくしている

### eval.js
- weights manager（クラス）を用意して、評価関数の重みを保持する。もしlocal strageを利用して、いちいちpngデータを読み込まなくてもいいようにしている。
- evaluation(くらす)ではその盤面の評価値を返す関数evaluation()を保持する。これがこのクラスの一番のキモ

### これから直すバグ
- data2pngは、最初の4バイトを見ることでファイルの大きさを認識し、バッファを確保している。その4バイトを認識すする部分がバグってめちゃでかいバッファを確保して読み込みに時間がかかってる
- nega scout法による先読みだと、真の評価値との間に差が発生してしまう。現状nega alpha法でこれを回避しているが、いつかこれをもとに戻したい。まあnega scout法ではnega alpha法に比べて10%程度しか効率化されないし、発生している誤差もそれなりに小さいのでわりと優先度は低い。
- 評価関数の重みデータが（png圧縮を効率化しても）400kB程度あるので、これを100kBくらいまで小さくしたい。現状は石の数に対して61通りの評価値を用意しているが、30通りに圧縮しても問題ないと思うたぶん。
- 評価関数の評価パターンが10通りしかないので、もう少しいろんなバリエーションを用意してもいいかも
- マルチスレッドに対応して読みのスピードを上げたいなあ















