//board			ボードを配列で返す
//setBoard		配列をボードにセット
//getMove		着手可能位置をthis.l1とthis.l2に格納
//putStone	石を返す。this.currentturnを逆にして、this.sumofstonesに1を足す
//count			黒石ー白石の値を返す
//hash			ハッシュ値を生成
//state			次の人が置けるなら1、次の人がパスなら2、終局なら3を返す
//swap			黒と白を入れ替える。

//BOARD_DATA holds stone location, current turn, sum of stones
class BOARD {
	constructor(node){
		this.black1 = 0x00000008;
		this.black2 = 0x10000000;
		this.white1 = 0x00000010;
		this.white2 = 0x08000000;
		this.turn = 1;
		this.stones = 4;
		this.e = 0;

		if(node instanceof BOARD){
			this.black1 = node.black1;
			this.black2 = node.black2;
			this.white1 = node.white1;
			this.white2 = node.white2;
			this.turn = node.turn;
			this.stones = node.stones;
			this.e = node.e;
		}
	}

	
	get board(){
		const board = new Int8Array(65);
		
		for(let i=0;i<32;i++){
			if(this.black1&(1<<i)){
				board[32-i] = 1;
			}
		}
		for(let i=0;i<32;i++){
			if(this.black2&(1<<i)){
				board[64-i] = 1;
			}
		}
			
		for(let i=0;i<32;i++){
			if(this.white1&(1<<i)){
				board[32-i] = -1;
			}
		}
		for(let i=0;i<32;i++){
			if(this.white2&(1<<i)){
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
		
		this.black1 = arr[0];
		this.black2 = arr[1];
		this.white1 = arr[2];
		this.white2 = arr[3];
		
		if(arr[4]===-1){
			this.turn = -1;
		}else{
			this.turn = 1;
		}

		let num_stones = 0;
		for(let j=0;j<32;j++){
			if(this.black1&(1<<j)){
				num_stones++;
			}
			if(this.black2&(1<<j)){
				num_stones++;
			}
			if(this.white1&(1<<j)){
				num_stones++;
			}
			if(this.white2&(1<<j)){
				num_stones++;
			}
		}

		this.stones = num_stones;
	}

	set setBoard(arr_){
		const arr = new Int8Array(65);
		
		//reset board array
		this.black1 = this.black2 = this.white1 = this.white2 = 0;
		
		for(let i=1;i<65;i++){
			if(arr_[i]===1){
				arr[i] = 1;
			}else{
				arr[i] = 0;
			}
		}

		//set black stone
		for(let i=0;i<32;i++){
			this.black1 |= arr[32-i]<<i;
			this.black2 |= arr[64-i]<<i
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
			this.white1 |= arr[32-i]<<i;
			this.white2 |= arr[64-i]<<i;
		}

		let num_stones = 0;
		for(let j=0;j<32;j++){
			if(this.black1&(1<<j)){
				num_stones++;
			}
			if(this.black2&(1<<j)){
				num_stones++;
			}
			if(this.white1&(1<<j)){
				num_stones++;
			}
			if(this.white2&(1<<j)){
				num_stones++;
			}
		}

		this.stones = num_stones;

		this.turn = (arr_[0]===-1) ? -1 : 1;


	}
	
	putStone(hand1, hand2){
		let black1 = this.black1;
		let black2 = this.black2;
		let white1 = this.white1;
		let white2 = this.white2;
		
		let temp, temp1, temp2;
	
		if(this.turn===-1){//white turn
			temp = white1;
			white1 = black1;
			black1 = temp;
			temp = white2;
			white2 = black2;
			black2 = temp;
		}
		
		const horizontalMask1 = 0x7e7e7e7e & white1;
		const horizontalMask2 = 0x7e7e7e7e & white2;
		const verticalMask1 = 0x00ffffff & white1;
		const verticalMask2 = 0xffffff00 & white2;
		const edgeMask1 = 0x007e7e7e & white1;
		const edgeMask2 = 0x7e7e7e00 & white2;
		
	
	
	
		//+1
		temp1  = horizontalMask1 & (hand1<<1); temp2  = horizontalMask2 & (hand2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		if(((temp1<<1)&black1)|((temp2<<1)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
	
	
		//-1
		temp1  = horizontalMask1 & (hand1>>>1); temp2  = horizontalMask2 & (hand2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		if(((temp1>>>1)&black1)|((temp2>>>1)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
	
		
	
		//+8
		temp1  = verticalMask1&(hand1>>>8); temp2  = verticalMask2&(hand2>>>8|hand1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		if(((temp1>>>8)&black1)|((temp2>>>8|temp1<<24)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
	
		//-8
		temp1  = verticalMask1&(hand1<<8|hand2>>>24); temp2  = verticalMask2&(hand2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		if(((temp1<<8|temp2>>>24)&black1)|((temp2<<8)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
		
		//-7
		temp1  = edgeMask1&(hand1<<7|hand2>>>25); temp2  = edgeMask2&(hand2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		if(((temp1<<7|temp2>>>25)&black1)|((temp2<<7)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
		
		
		//-9
		temp1  = edgeMask1&(hand1<<9|hand2>>>23); temp2  = edgeMask2&(hand2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9|temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		if(((temp1<<9|temp2>>>23)&black1)|((temp2<<9)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
		
		//+7
		temp1  = edgeMask1&(hand1>>>7); temp2  = edgeMask2&(hand2>>>7|hand1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		if(((temp1>>>7)&black1)|((temp2>>>7|temp1<<25)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
		
		//+9
		temp1  = edgeMask1&(hand1>>>9); temp2  = edgeMask2&(hand2>>>9|hand1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
		if(((temp1>>>9)&black1)|((temp2>>>9|temp1<<23)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
	
		black1 |= hand1;
		black2 |= hand2;
	
		if(this.turn===-1){//white turn
			temp = white1;
			white1 = black1;
			black1 = temp;
			temp = white2;
			white2 = black2;
			black2 = temp;
		}

		const child = new BOARD();

		child.black1 = black1;
		child.black2 = black2;
		child.white1 = white1;
		child.white2 = white2;
		child.turn = -this.turn;
		child.stones = this.stones + 1;
		
		return child;
	}

	getMove(){
		let move1 = 0, move2 = 0;
		let temp, temp1, temp2;
		
		let black1 = this.black1;
		let black2 = this.black2;
		let white1 = this.white1;
		let white2 = this.white2;
	
		if(this.turn===-1){//white turn
			temp = white1;
			white1 = black1;
			black1 = temp;
			temp = white2;
			white2 = black2;
			black2 = temp;
		}
		
		const horizontalMask1 = 0x7e7e7e7e&white1;
		const horizontalMask2 = 0x7e7e7e7e&white2;
		const verticalMask1 = 0x00ffffff&white1;
		const verticalMask2 = 0xffffff00&white2;
		const edgeMask1 = 0x007e7e7e&white1;
		const edgeMask2 = 0x7e7e7e00&white2;
		const blankBoard1 = ~(black1|white1);
		const blankBoard2 = ~(black2|white2);
		
		
		//-1
		temp1 = horizontalMask1&(black1<<1); temp2 = horizontalMask2&(black2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
		move1 |= blankBoard1&(temp1<<1);
		move2 |= blankBoard2&(temp2<<1);
		
		//+1
		temp1 = horizontalMask1&(black1>>>1); temp2 = horizontalMask2&(black2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
		move1 |= blankBoard1&(temp1>>>1);
		move2 |= blankBoard2&(temp2>>>1);
		
		//-8
		temp1 = verticalMask1&(black1<<8|black2>>>24); temp2 = verticalMask2&(black2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
		move1 |= blankBoard1&(temp1<<8|temp2>>>24);
		move2 |= blankBoard2&(temp2<<8);
		
		//+8
		temp1 = verticalMask1&(black1>>>8); temp2 = verticalMask2&(black2>>>8|black1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
		move1 |= blankBoard1&(temp1>>>8);
		move2 |= blankBoard2&(temp2>>>8|temp1<<24);
		
		//-7
		temp1 = edgeMask1&(black1<<7|black2>>>25); temp2 = edgeMask2&(black2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
		move1 |= blankBoard1&(temp1<<7|temp2>>>25);
		move2 |= blankBoard2&(temp2<<7);
		
		//-9
		temp1 = edgeMask1&(black1<<9| black2>>>23); temp2 = edgeMask2&(black2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
		move1 |= blankBoard1&(temp1<<9| temp2>>>23);
		move2 |= blankBoard2&(temp2<<9);
		
		//+7
		temp1 = edgeMask1&(black1>>>7); temp2 = edgeMask2&(black2>>>7|black1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
		move1 |= blankBoard1&(temp1>>>7);
		move2 |= blankBoard2&(temp2>>>7|temp1<<25);
		
		//+9
		temp1 = edgeMask1&(black1>>>9); temp2 = edgeMask2&(black2>>>9| black1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
		move1 |= blankBoard1&(temp1>>>9);
		move2 |= blankBoard2&(temp2>>>9| temp1<<23);

		return [move1, move2];
	}

	expand(){
		const children = [];
		let [move1, move2] = this.getMove();

		while(move1){
			const bit = -move1 & move1;
			//
			const child = this.putStone(bit, 0);
			children.push(child);
			//
			move1 = move1 ^ bit;
		}
		while(move2){
			const bit = -move2 & move2;
			//
			const child = this.putStone(0, bit);
			children.push(child);
			//
			move2 = move2 ^ bit;
		}
		return children;
	}

	state(){
		
		const [move1, move2] = this.getMove();
		
		if(move1|move2){
			return 1;
		}
		
		this.turn *= -1;
		const [move3, move4] = this.getMove();
		this.turn *= -1;
		
		if(move3|move4){
			return 2;
		}else{
			return 3;
		}
		
	}

	get hash(){
		let a = this.black1;
		let b = this.black2;
		let c = this.white1;
		let d = this.white2;
		
		a = (a=(a<<7)|(~a>>>25))^((b*17)|((b=(~b<<11)|(b>>>21))>>>4))^((c*257)|((c=(~c<<13)|(c>>19))>>>13))^(d=(d<<17)|(d>>>15));
		a = (a=(a<<7)|(~a>>>25))^((b*17)|((b=(~b<<11)|(b>>>21))>>>4))^((c*257)|((c=(~c<<13)|(c>>19))>>>13))^(d=(d<<17)|(d>>>15));
		a = (a=(a<<7)|(~a>>>25))^((b*17)|((b=(~b<<11)|(b>>>21))>>>4))^((c*257)|((c=(~c<<13)|(c>>19))>>>13))^(d=(d<<17)|(d>>>15));
		
		
		return a;
	}

	black_white(){

		let temp, sum=0;

		temp = this.black1;
		temp = (temp&0x55555555) + ((temp>>>1)&0x55555555);
		temp = (temp&0x33333333) + ((temp>>>2)&0x33333333);
		temp = (temp&0x0f0f0f0f) + ((temp>>>4)&0x0f0f0f0f);
		temp = (temp&0x00ff00ff) + ((temp>>>8)&0x00ff00ff);
		temp = (temp&0x0000ffff) + ((temp>>>16)&0x0000ffff);
		sum += temp;

		temp = this.black2;
		temp = (temp&0x55555555) + ((temp>>>1)&0x55555555);
		temp = (temp&0x33333333) + ((temp>>>2)&0x33333333);
		temp = (temp&0x0f0f0f0f) + ((temp>>>4)&0x0f0f0f0f);
		temp = (temp&0x00ff00ff) + ((temp>>>8)&0x00ff00ff);
		temp = (temp&0x0000ffff) + ((temp>>>16)&0x0000ffff);
		sum += temp;
		

		return (sum<<1) - this.stones;
	}

	swap(){
		const newNode = new BOARD();

		newNode.black1 = this.white1;
		newNode.black2 = this.white2;
		newNode.white1 = this.black1;
		newNode.white2 = this.black2;

		return newNode;
	}

	horizontalLines(){
		const lines = new Array(16);
		lines[0] = (this.black1>>>24) & 0xff;
		lines[1] = (this.black1>>>16) & 0xff;
		lines[2] = (this.black1>>>8) & 0xff;
		lines[3] = (this.black1>>>0) & 0xff;
		lines[4] = (this.black2>>>24) & 0xff;
		lines[5] = (this.black2>>>16) & 0xff;
		lines[6] = (this.black2>>>8) & 0xff;
		lines[7] = (this.black2>>>0) & 0xff;
		lines[8] = (this.white1>>>24) & 0xff;
		lines[9] = (this.white1>>>16) & 0xff;
		lines[10] = (this.white1>>>8) & 0xff;
		lines[11] = (this.white1>>>0) & 0xff;
		lines[12] = (this.white2>>>24) & 0xff;
		lines[13] = (this.white2>>>16) & 0xff;
		lines[14] = (this.white2>>>8) & 0xff;
		lines[15] = (this.white2>>>0) & 0xff;
		
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

	getBatch(){
		const batch_arr = new Array(64*3);
		const move = this.getMove();

		batch_arr.fill(0);

		for(let i=0;i<31;i++){
			if(this.black1&(1<<(31-i))){
				batch_arr[i] = 1;
			}
			if(this.black2&(1<<(31-i))){
				batch_arr[i+32] = 1;
			}
			if(this.white1&(1<<(31-i))){
				batch_arr[i+64] = 1;
			}
			if(this.white2&(1<<(31-i))){
				batch_arr[i+96] = 1;
			}
			if(move[0]&(1<<(31-i))){
				batch_arr[i+128] = 1;
			}
			if(move[1]&(1<<(31-i))){
				batch_arr[i+160] = 1;
			}
		}

		return batch_arr;
	}

	cnnEval(){
		const batch_arr = this.getBatch();
		const batch = tf.tensor4d(batch_arr, [1, 8, 8, 3]);
		const pred = model.predict(batch);
		const pred_arr = pred.dataSync();
		batch.dispose();
		pred.dispose();
		return pred_arr;
	}

	negaAlpha(alpha=-100, beta=100, depth=1){
		const search = (node, alpha, beta, depth)=>{
			if(depth===0){
				return node.black_white()*node.turn;
			}
		
			const state = node.state();
			
			if(state===1){
				const children = node.expand();// expand child node

				for(const child of children){
					alpha = Math.max(alpha, -search(child, -beta, -alpha, depth-1));
					if(alpha>=beta){
						return alpha;
					}
				}
				return alpha;
			}else if(state===2){ //pass
				const child = new BOARD(node);
				child.turn *= -1;
				return -search(child, -beta, -alpha, depth-1);
			}else{ //game finish
				return node.black_white()*node.turn;
			}
		}
		
		return search(this, alpha, beta, depth);
	}
}


const measureTime = (func, iter)=>{
	const startTime = performance.now();
	for(let i=0;i<iter;i++){
		func();
	}
	const endTime = performance.now();
	const averageTime = (endTime-startTime)/iter*1000;
	console.log(`average time: ${averageTime.toPrecision(4)} μs`);
};

var _b = new BOARD;
_b.black1= -1057177963
_b.black2= -455067384
_b.e= 0
_b.stones= 50
_b.turn= 1
_b.white1= 268451946
_b.white2= 455017991