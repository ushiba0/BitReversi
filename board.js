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