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
	constructor(board){
		const boardArrayBuffer = new ArrayBuffer(24);
		this.boardArray = new Int32Array(boardArrayBuffer, 0, 6);
		//this._board8array = new Uint8Array(boardArrayBuffer, 0, 24);
		
		if(board && board.boardArray){
			this.boardArray.set(board.boardArray, 0);
		}else{
			this.boardArray.set([8, 268435456, 16, 134217728, 1, 4], 0);
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

	expand(){
		const childNodes = [];
		const board = this;
		const legalhand = this.legalHand();
		let bit = 0, i = 0;

		while(legalhand[0]){
			bit = -legalhand[0] & legalhand[0];
			//
			const child = new BOARD(board);
			child.placeAndTurnStones(bit, 0);
			child.hand = [bit, 0];
			childNodes[i] = child;
			//
			legalhand[0] = legalhand[0] ^ bit; i+=1;
		}
		while(legalhand[1]){
			bit = -legalhand[1] & legalhand[1];
			//
			const child = new BOARD(board);
			child.placeAndTurnStones(0, bit);
			child.hand = [0, bit];
			childNodes[i] = child;
			//
			legalhand[1] = legalhand[1] ^ bit; i+=1;
		}
		return childNodes;
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

	horizontalLines(){
		const lines = new Array(16);
		const boardArray = this.boardArray;
		lines[0] = (boardArray[0]>>>24) & 0xff;
		lines[1] = (boardArray[0]>>>16) & 0xff;
		lines[2] = (boardArray[0]>>>8) & 0xff;
		lines[3] = (boardArray[0]>>>0) & 0xff;
		lines[4] = (boardArray[1]>>>24) & 0xff;
		lines[5] = (boardArray[1]>>>16) & 0xff;
		lines[6] = (boardArray[1]>>>8) & 0xff;
		lines[7] = (boardArray[1]>>>0) & 0xff;
		lines[8] = (boardArray[2]>>>24) & 0xff;
		lines[9] = (boardArray[2]>>>16) & 0xff;
		lines[10] = (boardArray[2]>>>8) & 0xff;
		lines[11] = (boardArray[2]>>>0) & 0xff;
		lines[12] = (boardArray[3]>>>24) & 0xff;
		lines[13] = (boardArray[3]>>>16) & 0xff;
		lines[14] = (boardArray[3]>>>8) & 0xff;
		lines[15] = (boardArray[3]>>>0) & 0xff;
		
		return lines
	}

	shape(){
		const [b0, b1, b2, b3, b4, b5, b6, b7, w0, w1, w2, w3, w4, w5, w6, w7] = this.horizontalLines();
		const list = new Array(80);
		let lineb, linew;

		//horizontal 1
		//上辺
		list[0] = b0;
		list[1] = w0;
		//下辺
		list[2] = b7;
		list[3] = w7;
		//右辺
		lineb = ((b7&1)<<0)|((b6&1)<<1)|((b5&1)<<2)|((b4&1)<<3)|((b3&1)<<4)|((b2&1)<<5)|((b1&1)<<6)|((b0&1)<<7);
		linew = ((w7&1)<<0)|((w6&1)<<1)|((w5&1)<<2)|((w4&1)<<3)|((w3&1)<<4)|((w2&1)<<5)|((w1&1)<<6)|((w0&1)<<7);
		list[4] = lineb;
		list[5] = linew;
		//左辺
		lineb = ((b7&128)<<0)|((b6&128)<<1)|((b5&128)<<2)|((b4&128)<<3)|((b3&128)<<4)|((b2&128)<<5)|((b1&128)<<6)|((b0&128)<<7);
		linew = ((w7&128)<<0)|((w6&128)<<1)|((w5&128)<<2)|((w4&128)<<3)|((w3&128)<<4)|((w2&128)<<5)|((w1&128)<<6)|((w0&128)<<7);
		list[6] = lineb>>>7;
		list[7] = linew>>>7;
		
		
		
		//horizontal 2
		//上辺
		list[8] = b1;
		list[9] = w1;
		//下辺
		list[10] = b6;
		list[11] = w6;
		//右辺
		lineb = ((b7&2)<<0)|((b6&2)<<1)|((b5&2)<<2)|((b4&2)<<3)|((b3&2)<<4)|((b2&2)<<5)|((b1&2)<<6)|((b0&2)<<7);
		linew = ((w7&2)<<0)|((w6&2)<<1)|((w5&2)<<2)|((w4&2)<<3)|((w3&2)<<4)|((w2&2)<<5)|((w1&2)<<6)|((w0&2)<<7);
		list[12] = lineb>>>1;
		list[13] = linew>>>1;
		//左辺
		lineb = ((b7&64)<<0)|((b6&64)<<1)|((b5&64)<<2)|((b4&64)<<3)|((b3&64)<<4)|((b2&64)<<5)|((b1&64)<<6)|((b0&64)<<7);
		linew = ((w7&64)<<0)|((w6&64)<<1)|((w5&64)<<2)|((w4&64)<<3)|((w3&64)<<4)|((w2&64)<<5)|((w1&64)<<6)|((w0&64)<<7);
		list[14] = lineb>>>6;
		list[15] = linew>>>6;
		
	
		
		//horizontal 3
		//上辺
		list[16] = b2;
		list[17] = w2;
		//下辺
		list[18] = b5;
		list[19] = w5;
		//右辺
		lineb = ((b7&4)<<0)|((b6&4)<<1)|((b5&4)<<2)|((b4&4)<<3)|((b3&4)<<4)|((b2&4)<<5)|((b1&4)<<6)|((b0&4)<<7);
		linew = ((w7&4)<<0)|((w6&4)<<1)|((w5&4)<<2)|((w4&4)<<3)|((w3&4)<<4)|((w2&4)<<5)|((w1&4)<<6)|((w0&4)<<7);
		list[20] = lineb>>>2;
		list[21] = linew>>>2;
		//左辺
		lineb = ((b7&32)<<0)|((b6&32)<<1)|((b5&32)<<2)|((b4&32)<<3)|((b3&32)<<4)|((b2&32)<<5)|((b1&32)<<6)|((b0&32)<<7);
		linew = ((w7&32)<<0)|((w6&32)<<1)|((w5&32)<<2)|((w4&32)<<3)|((w3&32)<<4)|((w2&32)<<5)|((w1&32)<<6)|((w0&32)<<7);
		list[22] = lineb>>>5;
		list[23] = linew>>>5;
	
	
		
		//horizontal 4
		//上辺
		list[24] = b3;
		list[25] = w3;
		//下辺
		list[26] = b4;
		list[27] = w4;
		//右辺
		lineb = ((b7&8)<<0)|((b6&8)<<1)|((b5&8)<<2)|((b4&8)<<3)|((b3&8)<<4)|((b2&8)<<5)|((b1&8)<<6)|((b0&8)<<7);
		linew = ((w7&8)<<0)|((w6&8)<<1)|((w5&8)<<2)|((w4&8)<<3)|((w3&8)<<4)|((w2&8)<<5)|((w1&8)<<6)|((w0&8)<<7);
		list[28] = lineb>>>3;
		list[29] = linew>>>3;
		//左辺
		lineb = ((b7&16)<<0)|((b6&16)<<1)|((b5&16)<<2)|((b4&16)<<3)|((b3&16)<<4)|((b2&16)<<5)|((b1&16)<<6)|((b0&16)<<7);
		linew = ((w7&16)<<0)|((w6&16)<<1)|((w5&16)<<2)|((w4&16)<<3)|((w3&16)<<4)|((w2&16)<<5)|((w1&16)<<6)|((w0&16)<<7);
		list[30] = lineb>>>4;
		list[31] = linew>>>4;
		
	
		
		//diagonal 8
		//右肩上がり
		lineb = (b7&128)|(b6&64)|(b5&32)|(b4&16)|(b3&8)|(b2&4)|(b1&2)|(b0&1);
		linew = (w7&128)|(w6&64)|(w5&32)|(w4&16)|(w3&8)|(w2&4)|(w1&2)|(w0&1);
		list[32] = lineb;
		list[33] = linew;
		//右肩下がり
		lineb = (b7&1)|(b6&2)|(b5&4)|(b4&8)|(b3&16)|(b2&32)|(b1&64)|(b0&128);
		linew = (w7&1)|(w6&2)|(w5&4)|(w4&8)|(w3&16)|(w2&32)|(w1&64)|(w0&128);
		list[34] = lineb;
		list[35] = linew;

		list[36] = lineb;
		list[37] = linew;
		list[38] = lineb;
		list[39] = linew;
		
		
		
		//corner 8
		//upper left
		lineb = ((b0&128))|((b1&128)>>>1)|((b0&64)>>>1)|((b2&128)>>>3)|((b1&64)>>>3)|((b0&32)>>>3)|((b3&128)>>>6)|((b0&16)>>>4);
		linew = ((w0&128))|((w1&128)>>>1)|((w0&64)>>>1)|((w2&128)>>>3)|((w1&64)>>>3)|((w0&32)>>>3)|((w3&128)>>>6)|((w0&16)>>>4);
		list[40] = lineb;
		list[41] = linew;
		//upper right
		lineb = ((b0&1)<<7)|((b1&1)<<6)|((b0&2)<<4)|((b2&1)<<4)|((b1&2)<<2)|((b0&4)<<0)|((b3&1)<<1)|((b0&8)>>>3);
		linew = ((w0&1)<<7)|((w1&1)<<6)|((w0&2)<<4)|((w2&1)<<4)|((w1&2)<<2)|((w0&4)<<0)|((w3&1)<<1)|((w0&8)>>>3);
		list[42] = lineb;
		list[43] = linew;
		//lower left
		lineb = ((b7&128))|((b6&128)>>>1)|((b7&64)>>>1)|((b5&128)>>>3)|((b6&64)>>>3)|((b7&32)>>>3)|((b4&128)>>>6)|((b7&16)>>>4);
		linew = ((w7&128))|((w6&128)>>>1)|((w7&64)>>>1)|((w5&128)>>>3)|((w6&64)>>>3)|((w7&32)>>>3)|((w4&128)>>>6)|((w7&16)>>>4);
		list[44] = lineb;
		list[45] = linew;
		//lower right
		lineb = ((b7&1)<<7)|((b6&1)<<6)|((b7&2)<<4)|((b5&1)<<4)|((b6&2)<<2)|((b7&4)<<0)|((b4&1)<<1)|((b7&8)>>>3);
		linew = ((w7&1)<<7)|((w6&1)<<6)|((w7&2)<<4)|((w5&1)<<4)|((w6&2)<<2)|((w7&4)<<0)|((w4&1)<<1)|((w7&8)>>>3);
		list[46] = lineb;
		list[47] = linew;
		
		
		
		//diagonal 7
		//upper left
		lineb = (b6&128)|(b5&64)|(b4&32)|(b3&16)|(b2&8)|(b1&4)|(b0&2);
		linew = (w6&128)|(w5&64)|(w4&32)|(w3&16)|(w2&8)|(w1&4)|(w0&2);
		list[48] = lineb>>>1;
		list[49] = linew>>>1;
		//lower right
		lineb = (b1&1)|(b2&2)|(b3&4)|(b4&8)|(b5&16)|(b6&32)|(b7&64);
		linew = (w1&1)|(w2&2)|(w3&4)|(w4&8)|(w5&16)|(w6&32)|(w7&64);
		list[50] = lineb;
		list[51] = linew;
		//lower left
		lineb = (b1&128)|(b2&64)|(b3&32)|(b4&16)|(b5&8)|(b6&4)|(b7&2);
		linew = (w1&128)|(w2&64)|(w3&32)|(w4&16)|(w5&8)|(w6&4)|(w7&2);
		list[52] = lineb>>>1;
		list[53] = linew>>>1;
		//upper right
		lineb = (b6&1)|(b5&2)|(b4&4)|(b3&8)|(b2&16)|(b1&32)|(b0&64);
		linew = (w6&1)|(w5&2)|(w4&4)|(w3&8)|(w2&16)|(w1&32)|(w0&64);
		list[54] = lineb;
		list[55] = linew;
	
		
		
		//diagonal 6
		//upper left
		lineb = (b5&128)|(b4&64)|(b3&32)|(b2&16)|(b1&8)|(b0&4);
		linew = (w5&128)|(w4&64)|(w3&32)|(w2&16)|(w1&8)|(w0&4);
		list[56] = lineb>>>2;
		list[57] = linew>>>2;
		//lower right
		lineb = (b2&1)|(b3&2)|(b4&4)|(b5&8)|(b6&16)|(b7&32);
		linew = (w2&1)|(w3&2)|(w4&4)|(w5&8)|(w6&16)|(w7&32);
		list[58] = lineb;
		list[59] = linew;
		//lower left
		lineb = (b2&128)|(b3&64)|(b4&32)|(b5&16)|(b6&8)|(b7&4);
		linew = (w2&128)|(w3&64)|(w4&32)|(w5&16)|(w6&8)|(w7&4);
		list[60] = lineb>>>2;
		list[61] = linew>>>2;
		//upper right
		lineb = (b5&1)|(b4&2)|(b3&4)|(b2&8)|(b1&16)|(b0&32);
		linew = (w5&1)|(w4&2)|(w3&4)|(w2&8)|(w1&16)|(w0&32);
		list[62] = lineb;
		list[63] = linew;
	
		
		
		//corner24
		//horizontal upper left
		lineb = (b0&0xf0)|((b1&0xf0)>>>4);
		linew = (w0&0xf0)|((w1&0xf0)>>>4);
		list[64] = lineb;
		list[65] = linew;
		//horizontal lower left
		lineb = (b7&0xf0)|((b6&0xf0)>>>4);
		linew = (w7&0xf0)|((w6&0xf0)>>>4);
		list[66] = lineb;
		list[67] = linew;
		//horizontal upper right
		lineb = ((b0&1)<<7)|((b0&2)<<5)|((b0&4)<<3)|((b0&8)<<1)|((b1&1)<<3)|((b1&2)<<1)|((b1&4)>>>1)|((b1&8)>>>3);
		linew = ((w0&1)<<7)|((w0&2)<<5)|((w0&4)<<3)|((w0&8)<<1)|((w1&1)<<3)|((w1&2)<<1)|((w1&4)>>>1)|((w1&8)>>>3);
		list[68] = lineb;
		list[69] = linew;
		//horizontal lower right
		lineb = ((b7&1)<<7)|((b7&2)<<5)|((b7&4)<<3)|((b7&8)<<1)|((b6&1)<<3)|((b6&2)<<1)|((b6&4)>>>1)|((b6&8)>>>3);
		linew = ((w7&1)<<7)|((w7&2)<<5)|((w7&4)<<3)|((w7&8)<<1)|((w6&1)<<3)|((w6&2)<<1)|((w6&4)>>>1)|((w6&8)>>>3);
		list[70] = lineb;
		list[71] = linew;
		//vertical upper left
		lineb = ((b0&128)>>>0)|((b1&128)>>>1)|((b2&128)>>>2)|((b3&128)>>>3)|((b0&64)>>>3)|((b1&64)>>>4)|((b2&64)>>>5)|((b3&64)>>>6);
		linew = ((w0&128)>>>0)|((w1&128)>>>1)|((w2&128)>>>2)|((w3&128)>>>3)|((w0&64)>>>3)|((w1&64)>>>4)|((w2&64)>>>5)|((w3&64)>>>6);
		list[72] = lineb;
		list[73] = linew;
		//vertical lower left
		lineb = ((b7&128)>>>0)|((b6&128)>>>1)|((b5&128)>>>2)|((b4&128)>>>3)|((b7&64)>>>3)|((b6&64)>>>4)|((b5&64)>>>5)|((b4&64)>>>6);
		linew = ((w7&128)>>>0)|((w6&128)>>>1)|((w5&128)>>>2)|((w4&128)>>>3)|((w7&64)>>>3)|((w6&64)>>>4)|((w5&64)>>>5)|((w4&64)>>>6);
		list[74] = lineb;
		list[75] = linew;
		//vertical upper right
		lineb = ((b0&1)<<7)|((b1&1)<<6)|((b2&1)<<5)|((b3&1)<<4)|((b0&2)<<2)|((b1&2)<<1)|((b2&2)<<0)|((b3&2)>>>1);
		linew = ((w0&1)<<7)|((w1&1)<<6)|((w2&1)<<5)|((w3&1)<<4)|((w0&2)<<2)|((w1&2)<<1)|((w2&2)<<0)|((w3&2)>>>1);
		list[76] = lineb;
		list[77] = linew;
		//vertical lower right
		lineb = ((b7&1)<<7)|((b6&1)<<6)|((b5&1)<<5)|((b4&1)<<4)|((b7&2)<<2)|((b6&2)<<1)|((b5&2)<<0)|((b4&2)>>>1);
		linew = ((w7&1)<<7)|((w6&1)<<6)|((w5&1)<<5)|((w4&1)<<4)|((w7&2)<<2)|((w6&2)<<1)|((w5&2)<<0)|((w4&2)>>>1);
		list[78] = lineb;
		list[79] = linew;
		
		return list;
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

const learningSet = (N=100, n1=50, n2=64)=>{
	const data = new Uint8ClampedArray(N*20);
	const max = ~~Math.min(Math.max(n1, n2), 64);
	const min = ~~Math.max(Math.min(n1, n2), 4);

	const split = (_x)=>{
		const x = _x|0;
		const a1 = (x>>>24) & 0xff;
		const a2 = (x>>>16) & 0xff;
		const a3 = (x>>>8) & 0xff;
		const a4 = (x>>>0) & 0xff;
		return [a1, a2, a3, a4];
	};

	for(let i=0;i<N;i++){
		const stones = ~~(Math.random()*(max-min+1))+min;
		const board = master.generateNode(stones);
		board.e = ai.negaScout(board, -64, 64, -1);

		data.set(split(board.boardArray[0]), i*20 + 0);
		data.set(split(board.boardArray[1]), i*20 + 4);
		data.set(split(board.boardArray[2]), i*20 + 8);
		data.set(split(board.boardArray[3]), i*20 + 12);
		data.set(split(board.e), i*20 + 16);
	}

	const d2p = new data2png();
	d2p.toPng(data);

	return data;
};