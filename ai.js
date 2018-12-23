//探査では、currentTurn から見た評価値が返される。

class AI extends EV {
	constructor(arg){
		super(arg);
	}

	placeAndTurnStones(boardArray, hand){
		let temp, temp1, temp2;
		const b_ = boardArray;
		const hand1 = hand[0], hand2 = hand[1];
		
		if(b_[4]===-1){//white turn
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
	
		if(b_[4]===-1){//white turn
			temp = b_[2];
			b_[2] = b_[0];
			b_[0] = temp;
			temp = b_[3];
			b_[3] = b_[1];
			b_[1] = temp;
		}
	
		//change turn
		b_[4]*=-1;
		//add stone
		b_[5]++;
	}

	legalHand(boardArray, legalhand){
	
		let temp, temp1, temp2;
		const b_ = boardArray;
	
		if(b_[4]===-1){//white turn
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
		
		if(b_[4]===-1){//white turn
			temp = b_[2];
			b_[2] = b_[0];
			b_[0] = temp;
			temp = b_[3];
			b_[3] = b_[1];
			b_[1] = temp;
		}
		
	}

	state(boardArray){
		const legalhand = [0, 0];
		this.legalHand(boardArray, legalhand);
		
		if(legalhand[0]|legalhand[1]){
			return 1;
		}
		
		boardArray[4] *= -1;
		legalHand(boardArray, legalhand);
		boardArray[4] *= -1;
		
		if(legalhand[0]|legalhand[1]){
			return 2;
		}else{
			return 3;
		}
		
	}

	b_w(boardArray){
		const b_ = boardArray;
		let temp, sum=0;
	
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

	negaScout(board, alpha, beta, depth){
		let num_readnode = 0;
		const argnode = new BOARD(board.boardArray);
		const board_array_buffer = new ArrayBuffer(24);
		const b32a = new Int32Array(board_array_buffer, 0, 6);
		const b8a = new Uint8Array(board_array_buffer, 0, 24);
		
		const search = (boardArray, alpha, beta, depth)=>{
			if(depth===0){
				b32a[0] = boardArray[0]; b32a[1] = boardArray[1];
				b32a[2] = boardArray[2]; b32a[3] = boardArray[3];
				b32a[4] = boardArray[4]; b32a[5] = boardArray[5];
				return this.evaluation(b8a)*boardArray[4];
			}
	
			const state = this.state(boardArray);
			num_readnode++;
			let max, v;
			
			if(state===1){
				//expand child node
				const legalhand = [0, 0];
				this.legalHand(boardArray, legalhand);
				const childNodes = [];
				const hand = [0, 0];
				let bit = 0, i = 0;
				while(legalhand[0]){
					bit = -legalhand[0] & legalhand[0];
	
					const newNode = [0, 0, 0, 0, 0, 0, 0];
					newNode[0] = boardArray[0]; newNode[1] = boardArray[1];
					newNode[2] = boardArray[2]; newNode[3] = boardArray[3];
					newNode[4] = boardArray[4]; newNode[5] = boardArray[5];
					hand[0] = bit; hand[1] = 0;
					this.placeAndTurnStones(newNode, hand);
					b32a[0] = newNode[0]; b32a[1] = newNode[1];
					b32a[2] = newNode[2]; b32a[3] = newNode[3];
					b32a[4] = newNode[4]; b32a[5] = newNode[5];
					newNode[6] = -this.evaluation(b8a)*newNode[4];
					childNodes[i++] = newNode;
					
					legalhand[0] ^= bit;
				}
				while(legalhand[1]){
					bit = -legalhand[1] & legalhand[1];
	
					const newNode = [0, 0, 0, 0, 0, 0, 0];
					newNode[0] = boardArray[0]; newNode[1] = boardArray[1];
					newNode[2] = boardArray[2]; newNode[3] = boardArray[3];
					newNode[4] = boardArray[4]; newNode[5] = boardArray[5];
					hand[0] = 0; hand[1] = bit;
					this.placeAndTurnStones(newNode, hand);
					b32a[0] = newNode[0]; b32a[1] = newNode[1];
					b32a[2] = newNode[2]; b32a[3] = newNode[3];
					b32a[4] = newNode[4]; b32a[5] = newNode[5];
					newNode[6] = -this.evaluation(b8a)*newNode[4];
					childNodes[i++] = newNode;
					
					legalhand[1] ^= bit;
				}
				
				//move ordering
				for(let i=0;i<childNodes.length-1;i++){
					for(let j=i+1;j<childNodes.length;j++){
						if(childNodes[i][6]<childNodes[j][6]){
							let temp = childNodes[i];
							childNodes[i] = childNodes[j];
							childNodes[j] = temp;
						}
					}
				}
				
				v = -search(childNodes[0] , -beta, -alpha, depth-1);
				max = v;
				if(beta<=v){return v;}//cut
				if(alpha<v){alpha = v;}
				
				for(let j=1;j<childNodes.length;j++){
					v = -search(childNodes[j], -alpha-1, -alpha, depth-1);//null window search
					if(beta<=v){return v;}
					if(alpha<v){
						alpha = v;
						v = -search(childNodes[j], -beta, -alpha, depth-1);
						if(beta<=v){return v;}
						if(alpha<v){alpha = v;}
					}
					if(max<v){max = v;}
				}
				
				return max;
			}else if(state===2){ //pass
				boardArray[4] *= -1;
				return -search(boardArray, -beta, -alpha, depth-1);
			}else{ //game finish
				return this.b_w(boardArray)*boardArray[4];
			}
		}

		const evaluation = search(argnode.boardArray, alpha, beta, depth);
		this.num_readnode = num_readnode;
		return evaluation;
	}

	cpuHand(board, alpha=-100, beta=100, showStatus=false){
		
		const depth = board.boardArray[5]<(64-this.depth[1]) ? this.depth[0] : -1;
		const childIndex = [];
		const startTime = performance.now();
		let rand=0, temp=0, bit=0, i=0, value=0;

		const legalhand = board.legalHand();
		
		
		while(legalhand[0]){
			bit = -legalhand[0] & legalhand[0];
			//
			const childNode = new BOARD(board.boardArray);
			childNode.placeAndTurnStones(bit, 0);
			value = -this.negaScout(childNode, alpha, beta, depth);
			childNode.e = value; childNode.hand = [bit, 0];
			childIndex[i++] = childNode;
			//
			legalhand[0] = legalhand[0] ^ bit;
		}
		while(legalhand[1]){
			bit = -legalhand[1] & legalhand[1];
			//
			const childNode = new BOARD(this.boardArray);
			childNode.placeAndTurnStones(0, bit);
			value = -this.negaScout(childNode, alpha, beta, depth);
			childNode.e = value; childNode.hand = [0, bit];
			childIndex[i++] = childNode;
			//
			legalhand[1] = legalhand[1] ^ bit;
		}
		
		//配列をスコア順にソート
		for(let e=0;e<childIndex.length-1;e++){
			for(let j=e+1;j<childIndex.length;j++){
				if(childIndex[e].e < childIndex[j].e){
					temp = childIndex[e];
					childIndex[e] = childIndex[j];
					childIndex[j] = temp;
				}
			}
		}
		
		//最大値がいくつあるかをrandにカウント
		for(let e=1;e<childIndex.length;e++){
			if(childIndex[0].e===childIndex[e].e){
				rand = e;
			}else{
				break;
			}
		}
		
		//0番目とrand番目を入れ替える
		rand = ~~(Math.random() * rand);
		temp = childIndex[0];
		childIndex[0] = childIndex[rand];
		childIndex[rand] = temp;

		
		if(showStatus){
			console.log(
				"read " + this.num_readnode + " nodes\n" + 
				"process time " + (performance.now()-startTime) + " ms\n" + 
				(~~(this.num_readnode/(performance.now()-startTime))) + " nodes per ms\n" + 
				"cpu put at " + childIndex[rand].hand + "\n"
			);
		}
		
		return childIndex;
	}

}

const ai = new AI();
