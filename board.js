//board			ボードを配列で返す
//setBoard		配列をボードにセット
//legalHand		着手可能位置をthis.l1とthis.l2に格納
//placeAndTurnStones	石を返す。this.currentturnを逆にして、this.sumofstonesに1を足す
//count			黒石ー白石の値を返す
//hash			ハッシュ値を生成
//state			次の人が置けるなら1、次の人がパスなら2、終局なら3を返す
//swap			黒と白を入れ替える。

//BOARD_DATA holds stone location, current turn, sum of stones
class BOARD {
	constructor(board8array){
		const boardArrayBuffer = new ArrayBuffer(24);
		this.boardArray = new Int32Array(boardArrayBuffer, 0, 6);
		this._board8array = new Uint8Array(boardArrayBuffer, 0, 24);
		

		if(board8array && board8array.length===6){
			this.boardArray.set(board8array, 0);
		}else{
			this.boardArray.set([8,268435456,16,134217728,1,4], 0);
		}
	}

	
	get board(){
		const board = new Int8Array(65);
		
		for(let i=0;i<32;i++){
			if(this.boardArray[0]&(1<<i)){
				board[32-i] = 1;
			}
		}
		for(let i=0;i<32;i++){
			if(this.boardArray[1]&(1<<i)){
				board[64-i] = 1;
			}
		}
			
		for(let i=0;i<32;i++){
			if(this.boardArray[2]&(1<<i)){
				board[32-i] = -1;
			}
		}
		for(let i=0;i<32;i++){
			if(this.boardArray[3]&(1<<i)){
				board[64-i] = -1;
			}
		}
		return board;
	}
	
	setBitBoard(arr){
		if(!arr.length){
			throw 'argment object may not be a array';
		}
		if(arr.length!==6){
			throw 'length of array doesnt match bit board';
		}
		if((arr[0]&arr[2])|(arr[1]&arr[3])){
			throw 'invalid fboard data';
		}
		
		this.boardArray[0] = arr[0];
		this.boardArray[1] = arr[1];
		this.boardArray[2] = arr[2];
		this.boardArray[3] = arr[3];
		
		if(arr[4]===-1){
			this.boardArray[4] = -1;
		}else{
			this.boardArray[4] = 1;
		}

		let num_stones = 0;
		for(let i=0;i<4;i++){
			for(let j=0;j<32;j++){
				if(this.boardArray[i]&(1<<j)){
					num_stones++;
				}
			}
		}

		this.boardArray[5] = num_stones;
	}

	set setBoard(arr_){
		const arr = new Int8Array(65);
		
		//reset board array
		this.boardArray[0] = this.boardArray[1] = this.boardArray[2] = this.boardArray[3] = 0;
		
		for(let i=1;i<65;i++){
			if(arr_[i]===1){
				arr[i] = 1;
			}else{
				arr[i] = 0;
			}
		}

		//set black stone
		for(let i=0;i<32;i++){
			this.boardArray[0] |= arr[32-i]<<i;
			this.boardArray[1] |= arr[64-i]<<i
		}
		

		for(let i=1;i<65;i++){
			if(arr_[i]===-1){
				arr[i] = 1;
			}else{
				arr[i] = 0;
			}
		}

		//set white stone
		for(let i=0;i<32;i++){
			this.boardArray[2] |= arr[32-i]<<i;
			this.boardArray[3] |= arr[64-i]<<i;
		}

		let num_stones = 0;
		for(let i=0;i<4;i++){
			for(let j=0;j<32;j++){
				if(this.boardArray[i]&(1<<j)){
					num_stones++;
				}
			}
		}
		this.boardArray[5] = num_stones;

		this.boardArray[4] = (arr_[0]===-1) ? -1 : 1;


	}
	
	placeAndTurnStones(hand1, hand2){

		const b_ = this.boardArray;
		let temp, temp1, temp2;
	
		if(this.boardArray[4]===-1){//white turn
			temp = b_[2];
			b_[2] = b_[0];
			b_[0] = temp;
			temp = b_[3];
			b_[3] = b_[1];
			b_[1] = temp;
		}
		
		const horizontalMask1 = 0x7e7e7e7e & b_[2];
		const horizontalMask2 = 0x7e7e7e7e & b_[3];
		const verticalMask1 = 0x00ffffff & b_[2];
		const verticalMask2 = 0xffffff00 & b_[3];
		const edgeMask1 = 0x007e7e7e & b_[2];
		const edgeMask2 = 0x7e7e7e00 & b_[3];
		
	
	
	
		//+1
		temp1  = horizontalMask1 & (hand1<<1); temp2  = horizontalMask2 & (hand2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		if(((temp1<<1)&b_[0])|((temp2<<1)&b_[1])){
			b_[0] ^= temp1; b_[1] ^= temp2;
			b_[2] ^= temp1; b_[3] ^= temp2;
		}
	
	
		//-1
		temp1  = horizontalMask1 & (hand1>>>1); temp2  = horizontalMask2 & (hand2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		if(((temp1>>>1)&b_[0])|((temp2>>>1)&b_[1])){
			b_[0] ^= temp1; b_[1] ^= temp2;
			b_[2] ^= temp1; b_[3] ^= temp2;
		}
	
		
	
		//+8
		temp1  = verticalMask1&(hand1>>>8); temp2  = verticalMask2&(hand2>>>8|hand1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		if(((temp1>>>8)&b_[0])|((temp2>>>8|temp1<<24)&b_[1])){
			b_[0] ^= temp1; b_[1] ^= temp2;
			b_[2] ^= temp1; b_[3] ^= temp2;
		}
	
		//-8
		temp1  = verticalMask1&(hand1<<8|hand2>>>24); temp2  = verticalMask2&(hand2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		if(((temp1<<8|temp2>>>24)&b_[0])|((temp2<<8)&b_[1])){
			b_[0] ^= temp1; b_[1] ^= temp2;
			b_[2] ^= temp1; b_[3] ^= temp2;
		}
		
		//-7
		temp1  = edgeMask1&(hand1<<7|hand2>>>25); temp2  = edgeMask2&(hand2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		if(((temp1<<7|temp2>>>25)&b_[0])|((temp2<<7)&b_[1])){
			b_[0] ^= temp1; b_[1] ^= temp2;
			b_[2] ^= temp1; b_[3] ^= temp2;
		}
		
		
		//-9
		temp1  = edgeMask1&(hand1<<9|hand2>>>23); temp2  = edgeMask2&(hand2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		if(((temp1<<9|temp2>>>23)&b_[0])|((temp2<<9)&b_[1])){
			b_[0] ^= temp1; b_[1] ^= temp2;
			b_[2] ^= temp1; b_[3] ^= temp2;
		}
		
		//+7
		temp1  = edgeMask1&(hand1>>>7); temp2  = edgeMask2&(hand2>>>7|hand1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		if(((temp1>>>7)&b_[0])|((temp2>>>7|temp1<<25)&b_[1])){
			b_[0] ^= temp1; b_[1] ^= temp2;
			b_[2] ^= temp1; b_[3] ^= temp2;
		}
		
		//+9
		temp1  = edgeMask1&(hand1>>>9); temp2  = edgeMask2&(hand2>>>9|hand1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		if(((temp1>>>9)&b_[0])|((temp2>>>9|temp1<<23)&b_[1])){
			b_[0] ^= temp1; b_[1] ^= temp2;
			b_[2] ^= temp1; b_[3] ^= temp2;
		}
	
		b_[0] |= hand1;
		b_[1] |= hand2;
	
		if(this.boardArray[4]===-1){//white turn
			temp = b_[2];
			b_[2] = b_[0];
			b_[0] = temp;
			temp = b_[3];
			b_[3] = b_[1];
			b_[1] = temp;
		}
	
		
		//change turn
		this.boardArray[4]*=-1;
		//add stone
		this.boardArray[5]++;
		
	}

	legalHand(){
		const legalhand = [0, 0];
		const b_ = this.boardArray;
		let temp, temp1, temp2;
	
		if(this.boardArray[4]===-1){//white turn
			temp = b_[2];
			b_[2] = b_[0];
			b_[0] = temp;
			temp = b_[3];
			b_[3] = b_[1];
			b_[1] = temp;
		}
		
		const horizontalMask1 = 0x7e7e7e7e&b_[2];
		const horizontalMask2 = 0x7e7e7e7e&b_[3];
		const verticalMask1 = 0x00ffffff&b_[2];
		const verticalMask2 = 0xffffff00&b_[3];
		const edgeMask1 = 0x007e7e7e&b_[2];
		const edgeMask2 = 0x7e7e7e00&b_[3];
		const blankBoard1 = ~(b_[0]|b_[2]);
		const blankBoard2 = ~(b_[1]|b_[3]);
		
		//reset
		legalhand[0] = legalhand[1] = 0;
		
		//-1
		temp1 = horizontalMask1&(b_[0]<<1); temp2 = horizontalMask2&(b_[1]<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		legalhand[0] |= blankBoard1&(temp1<<1);
		legalhand[1] |= blankBoard2&(temp2<<1);
		
		//+1
		temp1 = horizontalMask1&(b_[0]>>>1); temp2 = horizontalMask2&(b_[1]>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		legalhand[0] |= blankBoard1&(temp1>>>1);
		legalhand[1] |= blankBoard2&(temp2>>>1);
		
		//-8
		temp1 = verticalMask1&(b_[0]<<8|b_[1]>>>24); temp2 = verticalMask2&(b_[1]<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		legalhand[0] |= blankBoard1&(temp1<<8|temp2>>>24);
		legalhand[1] |= blankBoard2&(temp2<<8);
		
		//+8
		temp1 = verticalMask1&(b_[0]>>>8); temp2 = verticalMask2&(b_[1]>>>8|b_[0]<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		legalhand[0] |= blankBoard1&(temp1>>>8);
		legalhand[1] |= blankBoard2&(temp2>>>8|temp1<<24);
		
		//-7
		temp1 = edgeMask1&(b_[0]<<7|b_[1]>>>25); temp2 = edgeMask2&(b_[1]<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		legalhand[0] |= blankBoard1&(temp1<<7|temp2>>>25);
		legalhand[1] |= blankBoard2&(temp2<<7);
		
		//-9
		temp1 = edgeMask1&(b_[0]<<9| b_[1]>>>23); temp2 = edgeMask2&(b_[1]<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		legalhand[0] |= blankBoard1&(temp1<<9| temp2>>>23);
		legalhand[1] |= blankBoard2&(temp2<<9);
		
		//+7
		temp1 = edgeMask1&(b_[0]>>>7); temp2 = edgeMask2&(b_[1]>>>7|b_[0]<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		legalhand[0] |= blankBoard1&(temp1>>>7);
		legalhand[1] |= blankBoard2&(temp2>>>7|temp1<<25);
		
		//+9
		temp1 = edgeMask1&(b_[0]>>>9); temp2 = edgeMask2&(b_[1]>>>9| b_[0]<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		legalhand[0] |= blankBoard1&(temp1>>>9);
		legalhand[1] |= blankBoard2&(temp2>>>9| temp1<<23);
		
		if(this.boardArray[4]===-1){//white turn
			temp = b_[2];
			b_[2] = b_[0];
			b_[0] = temp;
			temp = b_[3];
			b_[3] = b_[1];
			b_[1] = temp;
		}

		return legalhand;
	}


	
	

	state(){
		
		const legalhand = this.legalHand();
		
		if(legalhand[0]|legalhand[1]){
			return 1;
		}
		
		this.boardArray[4] *= -1;
		const legalhand_ = this.legalHand(legalhand);
		this.boardArray[4] *= -1;
		
		if(legalhand_[0]|legalhand_[1]){
			return 2;
		}else{
			return 3;
		}
		
	}

	get hash(){
		let a = this.boardArray[0];
		let b = this.boardArray[1];
		let c = this.boardArray[2];
		let d = this.boardArray[3];
		
		a = (a=(a<<7)|(~a>>>25))^((b*17)|((b=(~b<<11)|(b>>>21))>>>4))^((c*257)|((c=(~c<<13)|(c>>19))>>>13))^(d=(d<<17)|(d>>>15));
		a = (a=(a<<7)|(~a>>>25))^((b*17)|((b=(~b<<11)|(b>>>21))>>>4))^((c*257)|((c=(~c<<13)|(c>>19))>>>13))^(d=(d<<17)|(d>>>15));
		a = (a=(a<<7)|(~a>>>25))^((b*17)|((b=(~b<<11)|(b>>>21))>>>4))^((c*257)|((c=(~c<<13)|(c>>19))>>>13))^(d=(d<<17)|(d>>>15));
		
		
		return a;
	}

	b_w(){

		let temp, sum=0;
		const b_ = this.boardArray;

		temp = b_[0];
		temp = (temp&0x55555555) + ((temp&0xaaaaaaaa)>>>1);
		temp = (temp&0x33333333) + ((temp&0xcccccccc)>>>2);
		temp = (temp&0x0f0f0f0f) + ((temp&0xf0f0f0f0)>>>4);
		temp = (temp&0x00ff00ff) + ((temp&0xff00ff00)>>>8);
		temp = (temp&0x0000ffff) + ((temp&0xffff0000)>>>16);
		sum += temp;

		temp = b_[1];
		temp = (temp&0x55555555) + ((temp&0xaaaaaaaa)>>>1);
		temp = (temp&0x33333333) + ((temp&0xcccccccc)>>>2);
		temp = (temp&0x0f0f0f0f) + ((temp&0xf0f0f0f0)>>>4);
		temp = (temp&0x00ff00ff) + ((temp&0xff00ff00)>>>8);
		temp = (temp&0x0000ffff) + ((temp&0xffff0000)>>>16);
		sum += temp;

		return (sum<<1) - b_[5];
	}

	swap(){
		let temp = 0;

		temp = this.boardArray[0];
		this.boardArray[0] = this.boardArray[2];
		this.boardArray[2] = temp;
		temp = this.boardArray[1];
		this.boardArray[1] = this.boardArray[3];
		this.boardArray[3] = temp;
	}
}


//従来では3弱
function speedtest(n=58){
	const reversi = new Game();
	let count = 0;
	const TIME = 1000;
	
	const startTime = new Date().getTime();
	while(true){
		const node = reversi.generateNode(n);
		node.e = reversi.ai.negaScout_last(node, -64, 64);
		count++;

		
		if(count%10===0 && new Date().getTime() - startTime>TIME){
			break;
		}
	}

	
	console.log('node per ms: ' + (count/TIME) );
}



const measureTime = (func, iter)=>{
	const before = performance.now();
	for(let i=0;i<iter;i++){
		func();
	}
	const after = performance.now();
	const time = (after-before).toPrecision(4);
	const ppms = (iter/(-before+after)).toPrecision(4);
	console.log(`time: ${time} ms, ${ppms} process per ms`);
};


class LINEBOARD {
	constructor(){
		// horizontal 1...8
		// vertical 1...8
		// diagonal upward 3,4,5,6,7,8,7,6,5,4,3
		// diagonal downward 3,4,5,6,7,8,7,6,5,4,3
		this.lines = new Uint16Array(8+8+11+11+2);
		this.boardArray = new Int32Array(6);

		const afterBlack = new Array(6561);
		const afterWhite = new Array(6561);
		const indexb = new Array(256);
		const indexw = new Array(256);
		const legalBlack = new Array(6561);
		const legalWhite = new Array(6561);
		const count = new Array(6561);
		for(let i=0;i<256;i++){
			indexb[i] = parseInt(parseInt(i.toString(2),10)*2,3);
			indexw[i] = indexb[i]/2;
		}

		// generate index table
		for(let index=0;index<6561;index++){
			const line_str = index.toString(3).split('');
			const line_black = line_str.map(x=>{
				if(x==="2"){ return 1; }
				else {return 0;}
			});
			const line_white = line_str.map(x=>{
				if(x==="1"){ return 1; }
				else {return 0;}
			});
			const b = parseInt(line_black.join(''), 2);
			const w = parseInt(line_white.join(''), 2);

			afterBlack[index] = new Array(8);
			for(let k=0, hand=1;k<8;k++){
				const mask = 0b01111110 & w;
				let temp = 0;
				let b_ = b, w_ = w;
				
				temp  = mask & (hand<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				if((temp<<1)&b){
					b_ ^= temp;
					w_ ^= temp;
				}
				
				temp  = mask & (hand>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				if((temp>>>1)&b){
					b_ ^= temp;
					w_ ^= temp;
				}
				

				if(w_&hand){
					w_ ^= hand;
				}
				b_ |= hand;
				afterBlack[index][k] = indexb[b_] + indexw[w_];
				hand = hand<<1;
			}

			afterWhite[index] = new Array(8);
			for(let k=0, hand=1;k<8;k++){
				const mask = 0b01111110 & b;
				let temp = 0;
				let b_ = b, w_ = w;
			
				temp  = mask & (hand<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				if((temp<<1)&w){
					b_ ^= temp;
					w_ ^= temp;
				}
				
				temp  = mask & (hand>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				if((temp>>>1)&w){
					b_ ^= temp;
					w_ ^= temp;
				}
				
				
				if(b_&hand){
					b_ ^= hand;
				}
				w_ |= hand;
				afterWhite[index][k] = indexb[b_] + indexw[w_];
				hand = hand<<1;
			}
		}

		// generate legalhand table
		for(let index=0;index<6561;index++){
			const line_str = index.toString(3).split('');
			const line_black = line_str.map(x=>{
				if(x==="2"){ return 1; }
				else {return 0;}
			});
			const line_white = line_str.map(x=>{
				if(x==="1"){ return 1; }
				else {return 0;}
			});
			const b = parseInt(line_black.join(''), 2);
			const w = parseInt(line_white.join(''), 2);

			(()=>{
				const mask = 0b01111110 & w;
				const blank = ~(b|w)
				let temp = 0;
				let legal = 0;
				let b_ = b, w_ = w;
				
				temp  = mask & (b_<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				legal |= blank & (temp<<1);
	
				temp  = mask & (b_>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				legal |= blank & (temp>>>1);
				
				legalBlack[index] = legal;
			})();

			(()=>{
				const mask = 0b01111110 & b;
				const blank = ~(b|w)
				let temp = 0;
				let legal = 0;
				let b_ = b, w_ = w;
				
				temp  = mask & (w_<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				temp |= mask & (temp<<1);
				legal |= blank & (temp<<1);
	
				temp  = mask & (w_>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				temp |= mask & (temp>>>1);
				legal |= blank & (temp>>>1);
				
				legalWhite[index] = legal;
			})();
			
		}

		// calculate black - white
		
		// generate legalhand table
		for(let index=0;index<6561;index++){
			const line_str = index.toString(3).split('');
			const line_black = line_str.map(x=>{
				if(x==="2"){ return 1; }
				else {return 0;}
			});
			const line_white = line_str.map(x=>{
				if(x==="1"){ return 1; }
				else {return 0;}
			});
			let b = parseInt(line_black.join(''), 2);
			let w = parseInt(line_white.join(''), 2);

			b = ((b>>>1)&0b01010101) + (b&0b01010101);
			b = ((b>>>2)&0b00110011) + (b&0b00110011);
			b = ((b>>>4)&0b00001111) + (b&0b00001111);
			w = ((w>>>1)&0b01010101) + (w&0b01010101);
			w = ((w>>>2)&0b00110011) + (w&0b00110011);
			w = ((w>>>4)&0b00001111) + (w&0b00001111);

			count[index] = b-w;
			
		}


		this.afterBlack = afterBlack;
		this.afterWhite = afterWhite;
		
		this.indexb = indexb;
		this.indexw = indexw;

		this.legalBlack = legalBlack;
		this.legalWhite = legalWhite;

		this.count = count;
	}

	setLineBoard(boardArray){
		//index table
		const indexb = this.indexb;
		const indexw = this.indexw;
		const lines = this.lines;
		const b = new Array(8);
		const w = new Array(8);
		let lineb = 0, linew = 0;

		
		
		

		// define b1...8 w1...8
		b[0] = (boardArray[0]>>>24)&0xff;
		b[1] = (boardArray[0]>>>16)&0xff;
		b[2] = (boardArray[0]>>>8)&0xff;
		b[3] = (boardArray[0]>>>0)&0xff;
		b[4] = (boardArray[1]>>>24)&0xff;
		b[5] = (boardArray[1]>>>16)&0xff;
		b[6] = (boardArray[1]>>>8)&0xff;
		b[7] = (boardArray[1]>>>0)&0xff;
		w[0] = (boardArray[2]>>>24)&0xff;
		w[1] = (boardArray[2]>>>16)&0xff;
		w[2] = (boardArray[2]>>>8)&0xff;
		w[3] = (boardArray[2]>>>0)&0xff;
		w[4] = (boardArray[3]>>>24)&0xff;
		w[5] = (boardArray[3]>>>16)&0xff;
		w[6] = (boardArray[3]>>>8)&0xff;
		w[7] = (boardArray[3]>>>0)&0xff;
		

		// horizontal
		lineb = b[0]; linew = w[0];
		lines[0] = indexb[lineb] + indexw[linew];
		lineb = b[1]; linew = w[1];
		lines[1] = indexb[lineb] + indexw[linew];
		lineb = b[2]; linew = w[2];
		lines[2] = indexb[lineb] + indexw[linew];
		lineb = b[3]; linew = w[3];
		lines[3] = indexb[lineb] + indexw[linew];
		lineb = b[4]; linew = w[4];
		lines[4] = indexb[lineb] + indexw[linew];
		lineb = b[5]; linew = w[5];
		lines[5] = indexb[lineb] + indexw[linew];
		lineb = b[6]; linew = w[6];
		lines[6] = indexb[lineb] + indexw[linew];
		lineb = b[7]; linew = w[7];
		lines[7] = indexb[lineb] + indexw[linew];

		//vertical
		lineb = ((b[0]&128)>>>0)|((b[1]&128)>>>1)|((b[2]&128)>>>2)|((b[3]&128)>>>3)|((b[4]&128)>>>4)|((b[5]&128)>>>5)|((b[6]&128)>>>6)|((b[7]&128)>>>7);
		linew = ((w[0]&128)>>>0)|((w[1]&128)>>>1)|((w[2]&128)>>>2)|((w[3]&128)>>>3)|((w[4]&128)>>>4)|((w[5]&128)>>>5)|((w[6]&128)>>>6)|((w[7]&128)>>>7);
		lines[8 ] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&64)<<1)|((b[1]&64)>>>0)|((b[2]&64)>>>1)|((b[3]&64)>>>2)|((b[4]&64)>>>3)|((b[5]&64)>>>4)|((b[6]&64)>>>5)|((b[7]&64)>>>6);
		linew = ((w[0]&64)<<1)|((w[1]&64)>>>0)|((w[2]&64)>>>1)|((w[3]&64)>>>2)|((w[4]&64)>>>3)|((w[5]&64)>>>4)|((w[6]&64)>>>5)|((w[7]&64)>>>6);
		lines[9 ] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&32)<<2)|((b[1]&32)<<1)|((b[2]&32)>>>0)|((b[3]&32)>>>1)|((b[4]&32)>>>2)|((b[5]&32)>>>3)|((b[6]&32)>>>4)|((b[7]&32)>>>5);
		linew = ((w[0]&32)<<2)|((w[1]&32)<<1)|((w[2]&32)>>>0)|((w[3]&32)>>>1)|((w[4]&32)>>>2)|((w[5]&32)>>>3)|((w[6]&32)>>>4)|((w[7]&32)>>>5);
		lines[10] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&16)<<3)|((b[1]&16)<<2)|((b[2]&16)<<1)|((b[3]&16)>>>0)|((b[4]&16)>>>1)|((b[5]&16)>>>2)|((b[6]&16)>>>3)|((b[7]&16)>>>4);
		linew = ((w[0]&16)<<3)|((w[1]&16)<<2)|((w[2]&16)<<1)|((w[3]&16)>>>0)|((w[4]&16)>>>1)|((w[5]&16)>>>2)|((w[6]&16)>>>3)|((w[7]&16)>>>4);
		lines[11] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&8)<<4)|((b[1]&8)<<3)|((b[2]&8)<<2)|((b[3]&8)<<1)|((b[4]&8)>>>0)|((b[5]&8)>>>1)|((b[6]&8)>>>2)|((b[7]&8)>>>3);
		linew = ((w[0]&8)<<4)|((w[1]&8)<<3)|((w[2]&8)<<2)|((w[3]&8)<<1)|((w[4]&8)>>>0)|((w[5]&8)>>>1)|((w[6]&8)>>>2)|((w[7]&8)>>>3);
		lines[12] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&4)<<5)|((b[1]&4)<<4)|((b[2]&4)<<3)|((b[3]&4)<<2)|((b[4]&4)<<1)|((b[5]&4)>>>0)|((b[6]&4)>>>1)|((b[7]&4)>>>2);
		linew = ((w[0]&4)<<5)|((w[1]&4)<<4)|((w[2]&4)<<3)|((w[3]&4)<<2)|((w[4]&4)<<1)|((w[5]&4)>>>0)|((w[6]&4)>>>1)|((w[7]&4)>>>2);
		lines[13] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&2)<<6)|((b[1]&2)<<5)|((b[2]&2)<<4)|((b[3]&2)<<3)|((b[4]&2)<<2)|((b[5]&2)<<1)|((b[6]&2)>>>0)|((b[7]&2)>>>1);
		linew = ((w[0]&2)<<6)|((w[1]&2)<<5)|((w[2]&2)<<4)|((w[3]&2)<<3)|((w[4]&2)<<2)|((w[5]&2)<<1)|((w[6]&2)>>>0)|((w[7]&2)>>>1);
		lines[14] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&1)<<7)|((b[1]&1)<<6)|((b[2]&1)<<5)|((b[3]&1)<<4)|((b[4]&1)<<3)|((b[5]&1)<<2)|((b[6]&1)<<1)|((b[7]&1)>>>0);
		linew = ((w[0]&1)<<7)|((w[1]&1)<<6)|((w[2]&1)<<5)|((w[3]&1)<<4)|((w[4]&1)<<3)|((w[5]&1)<<2)|((w[6]&1)<<1)|((w[7]&1)>>>0);
		lines[15] = indexb[lineb] + indexw[linew];
		
		//diagonal upward
		lineb = ((b[2]&128)|(b[1]&64)|(b[0]&32))>>>5;
		linew = ((w[2]&128)|(w[1]&64)|(w[0]&32))>>>5;
		lines[16] = indexb[lineb] + indexw[linew];
		lineb = ((b[3]&128)|(b[2]&64)|(b[1]&32)|(b[0]&16))>>>4;
		linew = ((w[3]&128)|(w[2]&64)|(w[1]&32)|(w[0]&16))>>>4;
		lines[17] = indexb[lineb] + indexw[linew];
		lineb = ((b[4]&128)|(b[3]&64)|(b[2]&32)|(b[1]&16)|(b[0]&8))>>>3;
		linew = ((w[4]&128)|(w[3]&64)|(w[2]&32)|(w[1]&16)|(w[0]&8))>>>3;
		lines[18] = indexb[lineb] + indexw[linew];
		lineb = ((b[5]&128)|(b[4]&64)|(b[3]&32)|(b[2]&16)|(b[1]&8)|(b[0]&4))>>>2;
		linew = ((w[5]&128)|(w[4]&64)|(w[3]&32)|(w[2]&16)|(w[1]&8)|(w[0]&4))>>>2;
		lines[19] = indexb[lineb] + indexw[linew];
		lineb = ((b[6]&128)|(b[5]&64)|(b[4]&32)|(b[3]&16)|(b[2]&8)|(b[1]&4)|(b[0]&2))>>>1;
		linew = ((w[6]&128)|(w[5]&64)|(w[4]&32)|(w[3]&16)|(w[2]&8)|(w[1]&4)|(w[0]&2))>>>1;
		lines[20] = indexb[lineb] + indexw[linew];
		lineb = ((b[7]&128)|(b[6]&64)|(b[5]&32)|(b[4]&16)|(b[3]&8)|(b[2]&4)|(b[1]&2)|(b[0]&1));
		linew = ((w[7]&128)|(w[6]&64)|(w[5]&32)|(w[4]&16)|(w[3]&8)|(w[2]&4)|(w[1]&2)|(w[0]&1));
		lines[21] = indexb[lineb] + indexw[linew];
		lineb = ((b[7]&64)|(b[6]&32)|(b[5]&16)|(b[4]&8)|(b[3]&4)|(b[2]&2)|(b[1]&1));
		linew = ((w[7]&64)|(w[6]&32)|(w[5]&16)|(w[4]&8)|(w[3]&4)|(w[2]&2)|(w[1]&1));
		lines[22] = indexb[lineb] + indexw[linew];
		lineb = ((b[7]&32)|(b[6]&16)|(b[5]&8)|(b[4]&4)|(b[3]&2)|(b[2]&1));
		linew = ((w[7]&32)|(w[6]&16)|(w[5]&8)|(w[4]&4)|(w[3]&2)|(w[2]&1));
		lines[23] = indexb[lineb] + indexw[linew];
		lineb = ((b[7]&16)|(b[6]&8)|(b[5]&4)|(b[4]&2)|(b[3]&1));
		linew = ((w[7]&16)|(w[6]&8)|(w[5]&4)|(w[4]&2)|(w[3]&1));
		lines[24] = indexb[lineb] + indexw[linew];
		lineb = ((b[7]&8)|(b[6]&4)|(b[5]&2)|(b[4]&1));
		linew = ((w[7]&8)|(w[6]&4)|(w[5]&2)|(w[4]&1));
		lines[25] = indexb[lineb] + indexw[linew];
		lineb = ((b[7]&4)|(b[6]&2)|(b[5]&1));
		linew = ((w[7]&4)|(w[6]&2)|(w[5]&1));
		lines[26] = indexb[lineb] + indexw[linew];

		//diagonal downward
		lineb = ((b[5]&128)|(b[6]&64)|(b[7]&32))>>>5;
		linew = ((w[5]&128)|(w[6]&64)|(w[7]&32))>>>5;
		lines[27] = indexb[lineb] + indexw[linew];
		lineb = ((b[4]&128)|(b[5]&64)|(b[6]&32)|(b[7]&16))>>>4;
		linew = ((w[4]&128)|(w[5]&64)|(w[6]&32)|(w[7]&16))>>>4;
		lines[28] = indexb[lineb] + indexw[linew];
		lineb = ((b[3]&128)|(b[4]&64)|(b[5]&32)|(b[6]&16)|(b[7]&8))>>>3;
		linew = ((w[3]&128)|(w[4]&64)|(w[5]&32)|(w[6]&16)|(w[7]&8))>>>3;
		lines[29] = indexb[lineb] + indexw[linew];
		lineb = ((b[2]&128)|(b[3]&64)|(b[4]&32)|(b[5]&16)|(b[6]&8)|(b[7]&4))>>>2;
		linew = ((w[2]&128)|(w[3]&64)|(w[4]&32)|(w[5]&16)|(w[6]&8)|(w[7]&4))>>>2;
		lines[30] = indexb[lineb] + indexw[linew];
		lineb = ((b[1]&128)|(b[2]&64)|(b[3]&32)|(b[4]&16)|(b[5]&8)|(b[6]&4)|(b[7]&2))>>>1;
		linew = ((w[1]&128)|(w[2]&64)|(w[3]&32)|(w[4]&16)|(w[5]&8)|(w[6]&4)|(w[7]&2))>>>1;
		lines[31] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&128)|(b[1]&64)|(b[2]&32)|(b[3]&16)|(b[4]&8)|(b[5]&4)|(b[6]&2)|(b[7]&1));
		linew = ((w[0]&128)|(w[1]&64)|(w[2]&32)|(w[3]&16)|(w[4]&8)|(w[5]&4)|(w[6]&2)|(w[7]&1));
		lines[32] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&64)|(b[1]&32)|(b[2]&16)|(b[3]&8)|(b[4]&4)|(b[5]&2)|(b[6]&1));
		linew = ((w[0]&64)|(w[1]&32)|(w[2]&16)|(w[3]&8)|(w[4]&4)|(w[5]&2)|(w[6]&1));
		lines[33] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&32)|(b[1]&16)|(b[2]&8)|(b[3]&4)|(b[4]&2)|(b[5]&1));
		linew = ((w[0]&32)|(w[1]&16)|(w[2]&8)|(w[3]&4)|(w[4]&2)|(w[5]&1));
		lines[34] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&16)|(b[1]&8)|(b[2]&4)|(b[3]&2)|(b[4]&1));
		linew = ((w[0]&16)|(w[1]&8)|(w[2]&4)|(w[3]&2)|(w[4]&1));
		lines[35] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&8)|(b[1]&4)|(b[2]&2)|(b[3]&1));
		linew = ((w[0]&8)|(w[1]&4)|(w[2]&2)|(w[3]&1));
		lines[36] = indexb[lineb] + indexw[linew];
		lineb = ((b[0]&4)|(b[1]&2)|(b[2]&1));
		linew = ((w[0]&4)|(w[1]&2)|(w[2]&1));
		lines[37] = indexb[lineb] + indexw[linew];

	}

	placeAndTurnStones(top, left){
		
		// horizontal
		this.lines[top] = this.afterBlack[this.lines[top]][7-left];
		// vertical
		this.lines[8+left] = this.afterBlack[this.lines[8+left]][top];
		
		const diag_up_idx = top + left - 2;
		const diag_up_hand = top+left>7 ? top : 7-left;
		const diag_down_idx = 5 - top + left;
		const diag_down_hand = top>left ? 7-top : 7-left;

		// diag upward
		this.lines[16+diag_up_idx] = this.afterBlack[this.lines[16+diag_up_idx]][diag_up_hand];
		// diag downword
		this.lines[27+diag_down_idx] = this.afterBlack[this.lines[27+diag_down_idx]][diag_down_hand];




	}

	legalHand(){
	}
}


const testhash = (iter=100,n1=4,n2=64)=>{
	const hash_table = new Int32Array(iter);
	const board_table = new Array(iter);
	let index = 0;
	let crash = 0;

	const max = ~~Math.min(Math.max(n1, n2), 64);
	const min = ~~Math.max(Math.min(n1, n2), 4);
	console.log(max, min);

	for(let i=0;i<iter;i++){
		const stones = ~~(Math.random()*(max-min)) + min;
		const node = master.generateNode(stones);
		const hash = node.hash
		const indexof = hash_table.indexOf(hash);
		if(indexof===-1){
			hash_table[index] = hash;
			board_table[index] = node;
		}else{
			const b1 = node.boardArray[0]-board_table[indexof].boardArray[0];
			const b2 = node.boardArray[1]-board_table[indexof].boardArray[1];
			const w1 = node.boardArray[2]-board_table[indexof].boardArray[2];
			const w2 = node.boardArray[3]-board_table[indexof].boardArray[3];
			if(b1===0 && b2===0 && w1===0 && w2===0){
			}else{
				crash++;
				console.log(node);
				console.log(board_table[indexof]);
			}
		}
		index++;
	}
	console.log(`crash: ${crash}`);
};