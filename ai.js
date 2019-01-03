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
		this.legalHand(boardArray, legalhand);
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
		temp = (temp&0x55555555) + ((temp>>>1)&0x55555555);
		temp = (temp&0x33333333) + ((temp>>>2)&0x33333333);
		temp = (temp&0x0f0f0f0f) + ((temp>>>4)&0x0f0f0f0f);
		temp = (temp&0x00ff00ff) + ((temp>>>8)&0x00ff00ff);
		temp = (temp&0x0000ffff) + ((temp>>>16)&0x0000ffff);
		sum += temp;
	
		temp = b_[1];
		temp = (temp&0x55555555) + ((temp>>>1)&0x55555555);
		temp = (temp&0x33333333) + ((temp>>>2)&0x33333333);
		temp = (temp&0x0f0f0f0f) + ((temp>>>4)&0x0f0f0f0f);
		temp = (temp&0x00ff00ff) + ((temp>>>8)&0x00ff00ff);
		temp = (temp&0x0000ffff) + ((temp>>>16)&0x0000ffff);
		sum += temp;
		return (sum<<1) - b_[5];
	}

	negaScout(node, alpha, beta, depth, showStatus=false){
		let num_readnode = 0;
		const argnode = new BOARD(node.boardArray);
		const board_array_buffer = new ArrayBuffer(24);
		const b32a = new Int32Array(board_array_buffer, 0);
		const b8a = new Uint8Array(board_array_buffer, 0);
		let value = 0;

		
		const search = (b_, alpha, beta, depth)=>{
			num_readnode++;
			if(depth===0){
				b32a[0] = b_[0]; b32a[1] = b_[1];
				b32a[2] = b_[2]; b32a[3] = b_[3];
				b32a[4] = b_[4]; b32a[5] = b_[5];
				return this.evaluation(b8a)*b_[4];
			}

			const state = this.state(b_);
			let max, v;
			
			if(state===1){
				//expand child node
				const legalhand = [0, 0];
				this.legalHand(b_, legalhand);
				const childNodes = [];
				let bit = 0, i = 0;
				while(legalhand[0]){
					bit = -legalhand[0] & legalhand[0];
					//
					const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5]];
					this.placeAndTurnStones(newNode, [bit, 0]);
					childNodes[i] = newNode;
					b32a[0] = newNode[0]; b32a[1] = newNode[1]; b32a[2] = newNode[2]; b32a[3] = newNode[3]; b32a[4] = newNode[4]; b32a[5] = newNode[5];
					childNodes[i].e = -this.evaluation(b8a)*newNode[4];
					//
					legalhand[0] = legalhand[0] ^ bit; i+=1;
				}
				while(legalhand[1]){
					bit = -legalhand[1] & legalhand[1];
					//
					const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5]];
					this.placeAndTurnStones(newNode, [0, bit]);
					childNodes[i] = newNode;
					b32a[0] = newNode[0]; b32a[1] = newNode[1]; b32a[2] = newNode[2]; b32a[3] = newNode[3]; b32a[4] = newNode[4]; b32a[5] = newNode[5];
					childNodes[i].e = -this.evaluation(b8a)*newNode[4];
					//
					legalhand[1] = legalhand[1] ^ bit; i+=1;
				}
				
				//move ordering
				for(let i=0;i<childNodes.length-1;i+=1){
					for(let j=i+1;j<childNodes.length;j+=1){
						if(childNodes[i].e<childNodes[j].e){
							let temp = childNodes[i];
							childNodes[i] = childNodes[j];
							childNodes[j] = temp;
						}
					}
				}
				
				v = -search(childNodes[0], -beta, -alpha, depth-1);
				max = v;
				if(beta<=v){return v;}//cut
				if(alpha<v){alpha = v;}
				
				for(let j=1;j<childNodes.length;j+=1){
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
				return -search([b_[0], b_[1], b_[2], b_[3], -b_[4], b_[5]], -beta, -alpha, depth-1);
			}else{ //game finish
				return this.b_w(b_)*b_[4];
			}
		}
		value = search(argnode.boardArray, alpha, beta, depth);
		if(showStatus){
			console.log(`NegaScout\nread nodes: ${num_readnode}\nevaluation: ${value}`);
		}
		return value;
	}

	negaScout_(node, alpha, beta, depth, showStatus=false){
		let num_readnode = 0;
		const argnode = new BOARD(node.boardArray);
		const board_array_buffer = new ArrayBuffer(24);
		const b32a = new Int32Array(board_array_buffer, 0);
		const b8a = new Uint8Array(board_array_buffer, 0);
		let value = 0;
		
		const search = (b_, alpha, beta, depth)=>{
			num_readnode++;
			if(depth===0){
				b32a[0] = b_[0]; b32a[1] = b_[1];
				b32a[2] = b_[2]; b32a[3] = b_[3];
				b32a[4] = b_[4]; b32a[5] = b_[5];
				return this.evaluation(b8a)*b_[4];
			}

			const state = this.state(b_);
			let max, v;
			
			if(state===1){
				//expand child node
				const legalhand = [0, 0];
				this.legalHand(b_, legalhand);
				const childNodes = [];
				let bit = 0, i = 0;
				while(legalhand[0]){
					bit = -legalhand[0] & legalhand[0];
					//
					const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5]];
					this.placeAndTurnStones(newNode, [bit, 0]);
					childNodes[i] = newNode;
					b32a[0] = newNode[0]; b32a[1] = newNode[1]; b32a[2] = newNode[2]; b32a[3] = newNode[3]; b32a[4] = newNode[4]; b32a[5] = newNode[5];
					childNodes[i].e = -this.evaluation(b8a)*newNode[4];
					//
					legalhand[0] = legalhand[0] ^ bit; i+=1;
				}
				while(legalhand[1]){
					bit = -legalhand[1] & legalhand[1];
					//
					const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5]];
					this.placeAndTurnStones(newNode, [0, bit]);
					childNodes[i] = newNode;
					b32a[0] = newNode[0]; b32a[1] = newNode[1]; b32a[2] = newNode[2]; b32a[3] = newNode[3]; b32a[4] = newNode[4]; b32a[5] = newNode[5];
					childNodes[i].e = -this.evaluation(b8a)*newNode[4];
					//
					legalhand[1] = legalhand[1] ^ bit; i+=1;
				}
				
				//move ordering
				for(let i=0;i<childNodes.length-1;i+=1){
					for(let j=i+1;j<childNodes.length;j+=1){
						if(childNodes[i].e<childNodes[j].e){
							let temp = childNodes[i];
							childNodes[i] = childNodes[j];
							childNodes[j] = temp;
						}
					}
				}
				
				v = -search(childNodes[0], -beta, -alpha, depth-1);
				max = v;
				if(beta<=v){return v;}//cut
				if(alpha<v){alpha = v;}
				
				for(let j=1;j<childNodes.length;j+=1){
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
				return -search([b_[0], b_[1], b_[2], b_[3], -b_[4], b_[5]], -beta, -alpha, depth-1);
			}else{ //game finish
				return this.b_w(b_)*b_[4];
			}
		}
		value = search(argnode.boardArray, alpha, beta, depth);
		if(showStatus){
			console.log(`NegaScout\nread nodes: ${num_readnode}\nevaluation: ${value}`);
		}
		return value;
	}

	cpuHand(board, alpha=-100, beta=100, depth=0,showStatus=false){
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
			const childNode = new BOARD(board.boardArray);
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

	bitCount(x){
		x = (x&0x55555555) + ((x>>>1)&0x55555555);
		x = (x&0x33333333) + ((x>>>2)&0x33333333);
		x = (x&0x0f0f0f0f) + ((x>>>4)&0x0f0f0f0f);
		x = (x&0x00ff00ff) + ((x>>>8)&0x00ff00ff);
		x = (x&0x0000ffff) + ((x>>>16)&0x0000ffff);
		return x;
	}

	hash(b_){
		const b1 = b_[0];
		const b2 = b_[1];
		const w1 = b_[2];
		const w2 = b_[3];
		let a = (b1>>>2)^(w2<<2)^((b1<<11)|(b1>>>20));
		let b = (b2>>>2)^(w1<<2)^((b2<<11)|(b2>>>20));
		let c = (b1>>>2)^(w2<<2)^((w1<<11)|(w1>>>20));
		let d = (b1>>>2)^(w2<<2)^((w2<<11)|(w2>>>20));
		
		b = (~a)^(b*17)^(b>>>4)^(c*257)^(c>>>13)^(d);
		b = (~a)^(b*17)^(b>>>4)^(c*257)^(c>>>13)^(d);
		b = (~a)^(b*17)^(b>>>4)^(c*257)^(c>>>13)^(d);
		b = (~a)^(b*17)^(b>>>4)^(c*257)^(c>>>13)^(d);
		b = (~a)^(b*17)^(b>>>4)^(c*257)^(c>>>13)^(d);
		
		return b;
	}

	randomHand(board){
		const hands = [];
		const mask1 = 0x00003c3c;
		const mask2 = 0x3c3c0000;
		let legalhand = board.legalHand();

		const x_mask1 = ~0x42c30000;
		const x_mask2 = ~0x0000c342;

		if(Math.random()>0.1){
			legalhand[0] &= x_mask1;
			legalhand[1] &= x_mask2;
		}
		if(this.bitCount(legalhand[0])+this.bitCount(legalhand[1])===0){
			legalhand = board.legalHand();
		}
		
		while(legalhand[0]){
			const bit = -legalhand[0] & legalhand[0];
			hands.push([bit, 0]);
			legalhand[0] = legalhand[0] ^ bit;
		}
		while(legalhand[1]){
			const bit = -legalhand[1] & legalhand[1];
			hands.push([0, bit]);
			legalhand[1] = legalhand[1] ^ bit;
		}
		
		let random_index;
		
		for(let i=0;i<3;i++){
			random_index= ~~(Math.random()*hands.length);
			if((hands[random_index][0]&mask1)|(hands[random_index][1]&mask2)){
				return hands[random_index];
			}
		}
		
		return hands[random_index];
	}

	negaAlpha(node, alpha, beta, depth, showStatus=false){

		let num_readnode = 0;
		const argnode = new BOARD(node.boardArray);
		const board_array_buffer = new ArrayBuffer(24);
		const b32a = new Int32Array(board_array_buffer, 0);
		const b8a = new Uint8Array(board_array_buffer, 0);
		let value = 0;



		const search = (b_, alpha, beta, depth)=>{
			num_readnode++;
			if(depth===0){
				b32a[0] = b_[0]; b32a[1] = b_[1];
				b32a[2] = b_[2]; b32a[3] = b_[3];
				b32a[4] = b_[4]; b32a[5] = b_[5];
				return this.evaluation(b8a)*b_[4];
			}

			const state = this.state(b_);
			const hand = [0, 0];
			const legalhand = [0, 0];
			
			if(state===1){
				//expand child node
				this.legalHand(b_, legalhand);
				const childNodes = [];
				let i = 0;
				while(legalhand[0]){
					const bit = -legalhand[0] & legalhand[0];
					//
					const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5]];
					hand[0] = bit; hand[1] = 0;
					this.placeAndTurnStones(newNode, hand);
					b32a[0] = newNode[0]; b32a[1] = newNode[1];
					b32a[2] = newNode[2]; b32a[3] = newNode[3];
					b32a[4] = newNode[4]; b32a[5] = newNode[5];
					newNode.e = -this.evaluation(b8a)*newNode[4];
					childNodes[i] = newNode;
					//
					legalhand[0] = legalhand[0] ^ bit; i+=1;
				}
				while(legalhand[1]){
					const bit = -legalhand[1] & legalhand[1];
					//
					const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5]];
					hand[0] = 0; hand[1] = bit;
					this.placeAndTurnStones(newNode, hand);
					b32a[0] = newNode[0]; b32a[1] = newNode[1];
					b32a[2] = newNode[2]; b32a[3] = newNode[3];
					b32a[4] = newNode[4]; b32a[5] = newNode[5];
					newNode.e = -this.evaluation(b8a)*newNode[4];
					childNodes[i] = newNode;
					//
					legalhand[1] = legalhand[1] ^ bit; i+=1;
				}

				// move ordering				
				if(b_[5]<60){
					for(let i=0;i<childNodes.length-1;i+=1){
						for(let j=i+1;j<childNodes.length;j+=1){
							if(childNodes[i].e<childNodes[j].e){
								let temp = childNodes[i];
								childNodes[i] = childNodes[j];
								childNodes[j] = temp;
							}
						}
					}
				}

				for(let i=0;i<childNodes.length;i++){
					alpha = Math.max(alpha, -search(childNodes[i], -beta, -alpha, depth-1));
					if(alpha>=beta){return alpha;}
				}


				return alpha;
			}else if(state===2){
				return -search([b_[0], b_[1], b_[2], b_[3], -b_[4], b_[5]], -beta, -alpha, depth-1);
			}else{
				return this.b_w(b_)*b_[4];
			}
		};
		value = search(argnode.boardArray, alpha, beta, depth);
		if(showStatus){
			console.log(`NegaAlpha\nread nodes: ${num_readnode}\nevaluation: ${value}`);
		}
		return value;
	}

	negaAlpha_(node, alpha, beta, depth, showStatus=false){

		let num_readnode = 0;
		const argnode = new BOARD(node.boardArray);
		const board_array_buffer = new ArrayBuffer(24);
		const b32a = new Int32Array(board_array_buffer, 0);
		const b8a = new Uint8Array(board_array_buffer, 0);
		let value = 0;

		const hash_table = new Int32Array(65536);
		const hash_b1 = new Int32Array(65536);
		const hash_max = new Int8Array(65536);
		const hash_min = new Int8Array(65536);
		let hash_index = 0;


		const search = (b_, alpha, beta, depth)=>{
			num_readnode++;
			if(depth===0){
				b32a[0] = b_[0]; b32a[1] = b_[1];
				b32a[2] = b_[2]; b32a[3] = b_[3];
				b32a[4] = b_[4]; b32a[5] = b_[5];
				return this.evaluation(b8a)*b_[4];
			}

			// search hash table
			const hash = this.hash(b_);
			const indexof = hash_table.indexOf(hash);
			const hash_exist = indexof!==-1 && b_[0]===hash_b1[indexof];
			if(hash_exist){
				if(hash_max[indexof]<=alpha){
					return hash_max[indexof];
				}
				if(hash_min[indexof]>=beta){
					return hash_min[indexof];
				}
				if(hash_max[indexof]===hash_min[indexof]>=beta){
					return hash_max[indexof];
				}
				alpha = Math.max(alpha, hash_min[indexof]);
				beta = Math.min(beta, hash_max[indexof]);
			}

			const state = this.state(b_);
			const hand = [0, 0];
			const legalhand = [0, 0];
			
			if(state===1){
				//expand child node
				this.legalHand(b_, legalhand);
				const childNodes = [];
				let i = 0;
				while(legalhand[0]){
					const bit = -legalhand[0] & legalhand[0];
					//
					const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5]];
					hand[0] = bit; hand[1] = 0;
					this.placeAndTurnStones(newNode, hand);
					b32a[0] = newNode[0]; b32a[1] = newNode[1];
					b32a[2] = newNode[2]; b32a[3] = newNode[3];
					b32a[4] = newNode[4]; b32a[5] = newNode[5];
					newNode.e = -this.evaluation(b8a)*newNode[4];
					childNodes[i] = newNode;
					//
					legalhand[0] = legalhand[0] ^ bit; i+=1;
				}
				while(legalhand[1]){
					const bit = -legalhand[1] & legalhand[1];
					//
					const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5]];
					hand[0] = 0; hand[1] = bit;
					this.placeAndTurnStones(newNode, hand);
					b32a[0] = newNode[0]; b32a[1] = newNode[1];
					b32a[2] = newNode[2]; b32a[3] = newNode[3];
					b32a[4] = newNode[4]; b32a[5] = newNode[5];
					newNode.e = -this.evaluation(b8a)*newNode[4];
					childNodes[i] = newNode;
					//
					legalhand[1] = legalhand[1] ^ bit; i+=1;
				}

				// move ordering				
				if(b_[5]<60){
					for(let i=0;i<childNodes.length-1;i+=1){
						for(let j=i+1;j<childNodes.length;j+=1){
							if(childNodes[i].e<childNodes[j].e){
								let temp = childNodes[i];
								childNodes[i] = childNodes[j];
								childNodes[j] = temp;
							}
						}
					}
				}


				let score = 0, score_max = -256, a = alpha;
				for(let i=0;i<childNodes.length;i++){
					score = -search(childNodes[i], -beta, -a, depth-1);
					if(score<=beta){
						//置換表に[score, infty]を追加
						if(score>=beta){
							if(hash_exist){
								hash_min[indexof] = score;
								hash_max[indexof] = 256;
							}else{
								hash_table[hash_index] = this.hash(childNodes[i]);
								hash_b1[hash_index] = childNodes[i][0];
								hash_max[hash_index] = score;
								hash_min[hash_index] = 256;
								hash_index++;
							}
							return score;
						}
					}
					if(score>score_max){
						a = Math.max(a, score);
						score_max = score;
					}
					alpha = Math.max(alpha, 0);
					if(alpha>=beta){return alpha;}
				}

				if(score_max>alpha){
					//置換表に[score_max, score_max]を追加
					if(hash_exist){
						hash_min[indexof] = score_max;
						hash_max[indexof] = score_max;
					}else{
						hash_table[hash_index] = this.hash(b_);
						hash_b1[hash_index] = b_[0];
						hash_max[hash_index] = score_max;
						hash_min[hash_index] = score_max;
						hash_index++;
					}
				}else{
					//地下表に[-infty, score_max]を追加
					if(hash_exist){
						hash_min[indexof] = -256;
						hash_max[indexof] = score_max;
					}else{
						hash_table[hash_index] = this.hash(b_);
						hash_b1[hash_index] = b_[0];
						hash_min[indexof] = -256;
						hash_max[indexof] = score_max;
						hash_index++;
					}
				}

				return score_max;
			}else if(state===2){
				return -search([b_[0], b_[1], b_[2], b_[3], -b_[4], b_[5]], -beta, -alpha, depth-1);
			}else{
				return this.b_w(b_)*b_[4];
			}
		};
		value = search(argnode.boardArray, alpha, beta, depth);
		if(showStatus){
			console.log(`NegaAlpha\nread nodes: ${num_readnode}\nevaluation: ${value}`);
		}
		return value;
	}
}

const ai = new AI();
