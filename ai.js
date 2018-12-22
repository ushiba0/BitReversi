//探査では、currentTurn から見た評価値が返される。

class AI extends EV {
	constructor(arg){
		super(arg);
	}

	negaScout(alpha, beta, depth){
		//[b1,b2,w1,w2,turn,sum]
		let num_readnode = 0;
		const argnode = new BOARD_OPERATION(this.boardArray);
		const board = new BOARD_OPERATION();
		const b32a = board.boardArray;
		const b8a = board._board8array;
		let value = 0;

		function placeAndTurnStones(b_){

			let temp, temp1, temp2;
		
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
			const verticalMasck1 = 0x00ffffff & b_[2];
			const verticalMasck2 = 0xffffff00 & b_[3];
			const edgeMask1 = 0x007e7e7e & b_[2];
			const edgeMask2 = 0x7e7e7e00 & b_[3];
			
			//+1
			temp1  = horizontalMask1 & (b_[6]<<1); temp2  = horizontalMask2 & (b_[7]<<1);
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
			temp1  = horizontalMask1 & (b_[6]>>>1); temp2  = horizontalMask2 & (b_[7]>>>1);
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
			temp1  = verticalMasck1&(b_[6]>>>8); temp2  = verticalMasck2&(b_[7]>>>8|b_[6]<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			if(((temp1>>>8)&b_[0])|((temp2>>>8|temp1<<24)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
		
			//-8
			temp1  = verticalMasck1&(b_[6]<<8|b_[7]>>>24); temp2  = verticalMasck2&(b_[7]<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			if(((temp1<<8|temp2>>>24)&b_[0])|((temp2<<8)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
			
			//-7
			temp1  = edgeMask1&(b_[6]<<7|b_[7]>>>25); temp2  = edgeMask2&(b_[7]<<7);
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
			temp1  = edgeMask1&(b_[6]<<9|b_[7]>>>23); temp2  = edgeMask2&(b_[7]<<9);
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
			temp1  = edgeMask1&(b_[6]>>>7); temp2  = edgeMask2&(b_[7]>>>7|b_[6]<<25);
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
			temp1  = edgeMask1&(b_[6]>>>9); temp2  = edgeMask2&(b_[7]>>>9|b_[6]<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			if(((temp1>>>9)&b_[0])|((temp2>>>9|temp1<<23)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
		
			b_[0] |= b_[6];
			b_[1] |= b_[7];
		
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
		function legalHand(b_){
	
			let temp, temp1, temp2;
		
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
			b_[6] = b_[7] = 0;
			
			//-1
			temp1 = horizontalMask1&(b_[0]<<1); temp2 = horizontalMask2&(b_[1]<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			b_[6] |= blankBoard1&(temp1<<1);
			b_[7] |= blankBoard2&(temp2<<1);
			
			//+1
			temp1 = horizontalMask1&(b_[0]>>>1); temp2 = horizontalMask2&(b_[1]>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			b_[6] |= blankBoard1&(temp1>>>1);
			b_[7] |= blankBoard2&(temp2>>>1);
			
			//-8
			temp1 = verticalMask1&(b_[0]<<8|b_[1]>>>24); temp2 = verticalMask2&(b_[1]<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			b_[6] |= blankBoard1&(temp1<<8|temp2>>>24);
			b_[7] |= blankBoard2&(temp2<<8);
			
			//+8
			temp1 = verticalMask1&(b_[0]>>>8); temp2 = verticalMask2&(b_[1]>>>8|b_[0]<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			b_[6] |= blankBoard1&(temp1>>>8);
			b_[7] |= blankBoard2&(temp2>>>8|temp1<<24);
			
			//-7
			temp1 = edgeMask1&(b_[0]<<7|b_[1]>>>25); temp2 = edgeMask2&(b_[1]<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			b_[6] |= blankBoard1&(temp1<<7|temp2>>>25);
			b_[7] |= blankBoard2&(temp2<<7);
			
			//-9
			temp1 = edgeMask1&(b_[0]<<9| b_[1]>>>23); temp2 = edgeMask2&(b_[1]<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			b_[6] |= blankBoard1&(temp1<<9| temp2>>>23);
			b_[7] |= blankBoard2&(temp2<<9);
			
			//+7
			temp1 = edgeMask1&(b_[0]>>>7); temp2 = edgeMask2&(b_[1]>>>7|b_[0]<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			b_[6] |= blankBoard1&(temp1>>>7);
			b_[7] |= blankBoard2&(temp2>>>7|temp1<<25);
			
			//+9
			temp1 = edgeMask1&(b_[0]>>>9); temp2 = edgeMask2&(b_[1]>>>9| b_[0]<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			b_[6] |= blankBoard1&(temp1>>>9);
			b_[7] |= blankBoard2&(temp2>>>9| temp1<<23);
			
			if(b_[4]===-1){//white turn
				temp = b_[2];
				b_[2] = b_[0];
				b_[0] = temp;
				temp = b_[3];
				b_[3] = b_[1];
				b_[1] = temp;
			}
			
		}
		function state_b(b_){
			//b1, b2, w1, w2, turn, sum
			const legalhand = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], 0, 0];
			legalHand(legalhand);
			
			if(legalhand[6]|legalhand[7]){
				return 1;
			}
			
			legalhand[4] *= -1;
			legalHand(legalhand);
			legalhand[4] *= -1;
			
			if(legalhand[6]|legalhand[7]){
				return 2;
			}else{
				return 3;
			}
			
		}
		function b_w(b_){

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
		const search = (b_, alpha, beta, depth)=>{
			if(depth<1){
				b32a[0] = b_[0]; b32a[1] = b_[1]; b32a[2] = b_[2]; b32a[3] = b_[3]; b32a[4] = b_[4]; b32a[5] = b_[5];
				//console.log(b_[5]);
				return this.evaluation(b8a)*b_[4];
			}

			const state = state_b(b_);
			num_readnode++;
			let max, v;
			
			if(state===1){
				//expand child node
				const legalhand = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], 0, 0];
				legalHand(legalhand);
				const childNodes = [];
				let bit = 0, mask1 = 0xffffffff, mask2 = 0, i = 0;
				while(legalhand[6]|legalhand[7]){
					while(legalhand[6]){
						bit = -legalhand[6] & legalhand[6];
						//
						const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], bit&mask1, bit&mask2];
						placeAndTurnStones(newNode);
						childNodes[i] = newNode;
						b32a[0] = newNode[0]; b32a[1] = newNode[1]; b32a[2] = newNode[2]; b32a[3] = newNode[3]; b32a[4] = newNode[4]; b32a[5] = newNode[5];
						childNodes[i+1] = -this.evaluation(b8a)*newNode[4];
						//
						legalhand[6] = legalhand[6] ^ bit; i+=2;
					}
					legalhand[6] = legalhand[7]; legalhand[7] = 0; mask1 = 0; mask2 = 0xffffffff;
				}
				
				//move ordering
				for(let i=0;i<childNodes.length-2;i+=2){
					for(let j=i+2;j<childNodes.length;j+=2){
						if(childNodes[i+1]<childNodes[j+1]){
							let temp = childNodes[i];
							childNodes[i] = childNodes[j];
							childNodes[j] = temp;
							temp = childNodes[i+1];
							childNodes[i+1] = childNodes[j+1];
							childNodes[j+1] = temp;
						}
					}
				}
				
				v = -search([childNodes[0][0], childNodes[0][1], childNodes[0][2], childNodes[0][3], childNodes[0][4], childNodes[0][5]], -beta, -alpha, depth-1);
				max = v;
				if(beta<=v){return v;}//cut
				if(alpha<v){alpha = v;}
				
				for(let j=2;j<childNodes.length;j+=2){
					v = -search([childNodes[j][0], childNodes[j][1], childNodes[j][2], childNodes[j][3], childNodes[j][4], childNodes[j][5]], -alpha-1, -alpha, depth-1);//null window search
					if(beta<=v){return v;}
					if(alpha<v){
						alpha = v;
						v = -search([childNodes[j][0], childNodes[j][1], childNodes[j][2], childNodes[j][3], childNodes[j][4], childNodes[j][5]], -beta, -alpha, depth-1);
						if(beta<=v){return v;}
						if(alpha<v){alpha = v;}
					}
					if(max<v){max = v;}
				}
				
				return max;
			}else if(state===2){ //pass
				return -search([b_[0], b_[1], b_[2], b_[3], -b_[4], b_[5]], -beta, -alpha, depth-1);
			}else{ //game finish
				return b_w(b_)*b_[4];
			}
		}
		value = search(argnode.boardArray, alpha, beta, depth);
		// console.log(`negaScout read node ${num_readnode}`);
		return value;
	}

	negaScout_last(alpha, beta){
		//[b1,b2,w1,w2,turn,sum]
		let num_readnode = 0;
		const argnode = new BOARD_OPERATION(this.boardArray);
		const board = new BOARD_OPERATION();
		const b32a = board.boardArray;
		const b8a = board._board8array;
		const that = this;
		let value = 0;

		function placeAndTurnStones(b_){

			let temp, temp1, temp2;
		
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
			const verticalMasck1 = 0x00ffffff & b_[2];
			const verticalMasck2 = 0xffffff00 & b_[3];
			const edgeMask1 = 0x007e7e7e & b_[2];
			const edgeMask2 = 0x7e7e7e00 & b_[3];
			
			//+1
			temp1  = horizontalMask1 & (b_[6]<<1); temp2  = horizontalMask2 & (b_[7]<<1);
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
			temp1  = horizontalMask1 & (b_[6]>>>1); temp2  = horizontalMask2 & (b_[7]>>>1);
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
			temp1  = verticalMasck1&(b_[6]>>>8); temp2  = verticalMasck2&(b_[7]>>>8|b_[6]<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			if(((temp1>>>8)&b_[0])|((temp2>>>8|temp1<<24)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
		
			//-8
			temp1  = verticalMasck1&(b_[6]<<8|b_[7]>>>24); temp2  = verticalMasck2&(b_[7]<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			if(((temp1<<8|temp2>>>24)&b_[0])|((temp2<<8)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
			
			//-7
			temp1  = edgeMask1&(b_[6]<<7|b_[7]>>>25); temp2  = edgeMask2&(b_[7]<<7);
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
			temp1  = edgeMask1&(b_[6]<<9|b_[7]>>>23); temp2  = edgeMask2&(b_[7]<<9);
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
			temp1  = edgeMask1&(b_[6]>>>7); temp2  = edgeMask2&(b_[7]>>>7|b_[6]<<25);
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
			temp1  = edgeMask1&(b_[6]>>>9); temp2  = edgeMask2&(b_[7]>>>9|b_[6]<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			if(((temp1>>>9)&b_[0])|((temp2>>>9|temp1<<23)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
		
			b_[0] |= b_[6];
			b_[1] |= b_[7];
		
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
		function legalHand(b_){
	
			let temp, temp1, temp2;
		
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
			b_[6] = b_[7] = 0;
			
			//-1
			temp1 = horizontalMask1&(b_[0]<<1); temp2 = horizontalMask2&(b_[1]<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			b_[6] |= blankBoard1&(temp1<<1);
			b_[7] |= blankBoard2&(temp2<<1);
			
			//+1
			temp1 = horizontalMask1&(b_[0]>>>1); temp2 = horizontalMask2&(b_[1]>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			b_[6] |= blankBoard1&(temp1>>>1);
			b_[7] |= blankBoard2&(temp2>>>1);
			
			//-8
			temp1 = verticalMask1&(b_[0]<<8|b_[1]>>>24); temp2 = verticalMask2&(b_[1]<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			b_[6] |= blankBoard1&(temp1<<8|temp2>>>24);
			b_[7] |= blankBoard2&(temp2<<8);
			
			//+8
			temp1 = verticalMask1&(b_[0]>>>8); temp2 = verticalMask2&(b_[1]>>>8|b_[0]<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			b_[6] |= blankBoard1&(temp1>>>8);
			b_[7] |= blankBoard2&(temp2>>>8|temp1<<24);
			
			//-7
			temp1 = edgeMask1&(b_[0]<<7|b_[1]>>>25); temp2 = edgeMask2&(b_[1]<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			b_[6] |= blankBoard1&(temp1<<7|temp2>>>25);
			b_[7] |= blankBoard2&(temp2<<7);
			
			//-9
			temp1 = edgeMask1&(b_[0]<<9| b_[1]>>>23); temp2 = edgeMask2&(b_[1]<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			b_[6] |= blankBoard1&(temp1<<9| temp2>>>23);
			b_[7] |= blankBoard2&(temp2<<9);
			
			//+7
			temp1 = edgeMask1&(b_[0]>>>7); temp2 = edgeMask2&(b_[1]>>>7|b_[0]<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			b_[6] |= blankBoard1&(temp1>>>7);
			b_[7] |= blankBoard2&(temp2>>>7|temp1<<25);
			
			//+9
			temp1 = edgeMask1&(b_[0]>>>9); temp2 = edgeMask2&(b_[1]>>>9| b_[0]<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			b_[6] |= blankBoard1&(temp1>>>9);
			b_[7] |= blankBoard2&(temp2>>>9| temp1<<23);
			
			if(b_[4]===-1){//white turn
				temp = b_[2];
				b_[2] = b_[0];
				b_[0] = temp;
				temp = b_[3];
				b_[3] = b_[1];
				b_[1] = temp;
			}
			
		}
		function state_b(b_){
			//b1, b2, w1, w2, turn, sum
			const legalhand = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], 0, 0];
			legalHand(legalhand);
			
			if(legalhand[6]|legalhand[7]){
				return 1;
			}
			
			legalhand[4] *= -1;
			legalHand(legalhand);
			legalhand[4] *= -1;
			
			if(legalhand[6]|legalhand[7]){
				return 2;
			}else{
				return 3;
			}
			
		}
		function b_w(b_){

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
		const search = (b_, alpha, beta)=>{
			const state = state_b(b_);
			num_readnode++;
			let max, v;
			
			if(state===1){
				//expand child node
				const legalhand = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], 0, 0];
				legalHand(legalhand);
				const childNodes = [];
				let bit = 0, mask1 = 0xffffffff, mask2 = 0, i = 0;
				while(legalhand[6]|legalhand[7]){
					while(legalhand[6]){
						bit = -legalhand[6] & legalhand[6];
						//
						const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], bit&mask1, bit&mask2];
						placeAndTurnStones(newNode);
						childNodes[i] = newNode;
						b32a[0] = newNode[0]; b32a[1] = newNode[1]; b32a[2] = newNode[2]; b32a[3] = newNode[3]; b32a[4] = newNode[4]; b32a[5] = newNode[5];
						childNodes[i+1] = -this.evaluation(b8a)*newNode[4];
						//
						legalhand[6] = legalhand[6] ^ bit; i+=2;
					}
					legalhand[6] = legalhand[7]; legalhand[7] = 0; mask1 = 0; mask2 = 0xffffffff;
				}
				
				//move ordering
				for(let i=0;i<childNodes.length-2;i+=2){
					for(let j=i+2;j<childNodes.length;j+=2){
						if(childNodes[i+1]<childNodes[j+1]){
							let temp = childNodes[i];
							childNodes[i] = childNodes[j];
							childNodes[j] = temp;
							temp = childNodes[i+1];
							childNodes[i+1] = childNodes[j+1];
							childNodes[j+1] = temp;
						}
					}
				}
				
				v = -search([childNodes[0][0], childNodes[0][1], childNodes[0][2], childNodes[0][3], childNodes[0][4], childNodes[0][5]], -beta, -alpha);
				max = v;
				if(beta<=v){return v;}//cut
				if(alpha<v){alpha = v;}
				
				for(let j=2;j<childNodes.length;j+=2){
					v = -search([childNodes[j][0], childNodes[j][1], childNodes[j][2], childNodes[j][3], childNodes[j][4], childNodes[j][5]], -alpha-1, -alpha);//null window search
					if(beta<=v){return v;}
					if(alpha<v){
						alpha = v;
						v = -search([childNodes[j][0], childNodes[j][1], childNodes[j][2], childNodes[j][3], childNodes[j][4], childNodes[j][5]], -beta, -alpha);
						if(beta<=v){return v;}
						if(alpha<v){alpha = v;}
					}
					if(max<v){max = v;}
				}
				
				return max;
			}else if(state===2){ //pass
				return -search([b_[0], b_[1], b_[2], b_[3], -b_[4], b_[5]], -beta, -alpha);
			}else{ //game finish
				return b_w(b_) * b_[4];
			}
		}
		value = search(argnode.boardArray, alpha, beta);
		//console.log(`negaScout_last read node ${num_readnode}`);
		return value;
	}


	cpuHand(alpha=-100, beta=100, showStatus=false){
		
		const depth = this.depth[0];
		const depth_last = this.depth[1];
		
		function convertLocation(hand1,hand2){
			if(hand1<0){return 1;}
			if(hand2<0){return 33;}
			if(hand1){return 32-Math.log2(hand1);}
			if(hand2){return 64-Math.log2(hand2);}
		}
		
		const childIndex = [];
		const startTime = performance.now();
		let rand=0, temp=0, bit=0, i=0, value=0, mask1=0xffffffff, mask2=0;

		const legalhand = this.legalHand([0, 0]);
		this.num_readnode = 0;
		////////
	
		while(legalhand[0]|legalhand[1]){
			while(legalhand[0]){
				bit = -legalhand[0] & legalhand[0];
				//
				const childNode = new BOARD(this.boardArray);
				childNode.placeAndTurnStones([bit&mask1, bit&mask2]);
				if(this.boardArray[5]<64-depth_last){
					value = -childNode.negaScout(alpha, beta, depth);
				}else{
					value = -childNode.negaScout_last(alpha, beta, depth);
				}
				childNode.e = value;
				childIndex[i++] = [value, [bit&mask1, bit&mask2], childNode, convertLocation(bit&mask1, bit&mask2)];
				//
				legalhand[0] = legalhand[0] ^ bit;
			}
			legalhand[0] = legalhand[1]; legalhand[1] = 0; mask1 = 0; mask2 = 0xffffffff;
		}
	
		
		
		
		//配列をスコア順にソート
		for(let e=0;e<childIndex.length-1;e++){
			for(let j=e+1;j<childIndex.length;j++){
				if(childIndex[e][0]<childIndex[j][0]){
					temp = childIndex[e];
					childIndex[e] = childIndex[j];
					childIndex[j] = temp;
				}
			}
		}
		
		
		//最大値がいくつあるかをrandにカウント
		for(let e=1;e<childIndex.length;e++){
			if(childIndex[0][0]===childIndex[e][0]){
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
				"cpu put at " + childIndex[rand][1] + "\n"
			);
		}
			
		
		//node.put = childIndex[0][1];
		this.num_readnode = 0;
		
		
		return childIndex;
		
	}

	
	//nomal read
	_negaAlpha(node, alpha, beta, depth){
		counter++;
		
		if(depth===0){
			return this.evaluation(node)*node.currentTurn;
		}
		
		const state = node.state;
		
		if(state===1){//置ける
			
			//子ノードを展開
			node.legalHand();
			let l1 = node.l1, l2 = node.l2;
			let childNode;
			let bit = 0;
			let mask1 = -1, mask2 = 0;
			while(l1|l2){
				while(l1){
					bit = -l1 & l1;
					//
					childNode = new Board(node);
					childNode.placeAndTurnStones(bit&mask1, bit&mask2);
					alpha = Math.max(alpha, -this.negaAlpha(childNode, -beta, -alpha, depth-1));
					if(alpha>=beta){
						return alpha;
					}
					//
					l1 = l1 ^ bit;
				}
				l1 = l2; l2 = 0; mask1 = 0; mask2 = -1;
			}
			
			return alpha;
			
		}else if(state===2){ //pass
			const newNode = new Board(node);
			newNode.currentTurn *= -1;
			return -this.negaAlpha(newNode, -beta, -alpha, depth-1);
		}else if(state===3){ //終局
			//currentTurnをかけるのは、Negaalphaだから
			return 100 * node.currentTurn;
		}
	}
	
	//complete read
	_negaAlpha_last(node, alpha, beta){
		
		const state = node.state;
		counter++;
		
		if(state===1){
			//expand child nodes
			const legalhand = node.legalHand([0, 0]);
			let childNode;
			let bit = 0, mask1 = 0xffffffff, mask2 = 0;
			while(legalhand[0]|legalhand[1]){
				while(legalhand[0]){
					bit = -legalhand[0] & legalhand[0];
					//
					childNode = new BOARD_OPERATION(node.boardArray);
					childNode.placeAndTurnStones([bit&mask1, bit&mask2]);
					alpha = Math.max(alpha, -this.negaAlpha_last(childNode, -	beta, -alpha));
					if(alpha>=beta){return alpha;}
					//
					legalhand[0] ^= bit;
				}
				legalhand[0] = legalhand[1]; legalhand[1] = 0; mask1 = 0; mask2 = 0xffffffff;
			}
			return alpha;
		}else if(state===2){ //pass
			const newNode = new BOARD_OPERATION(node.boardArray);
			newNode.boardArray[4] *= -1;
			return -this.negaAlpha_last(newNode, -beta, -alpha);
		}else{ //game finish
			return node.b_w * node.boardArray[4];
		}
	}
	
	//nega alpha algorithm with move ordering
	_negaAlpha_last_m(node, alpha, beta){
		
		const state = node.state;
		counter++;
		
		if(state===1){//置ける
			
			//子ノードを展開
			node.legalHand();
			let l1 = node.l1, l2 = node.l2;
			const childIndex = new Array();
			let bit = 0, mask1 = -1, mask2 = 0, i = 0;
			while(l1|l2){
				while(l1){
					bit = -l1 & l1;
					//
					const childNode = new Board(node);
					childNode.placeAndTurnStones(bit&mask1, bit&mask2);
					childIndex[i] = [childNode, -this.evaluation(childNode)*childNode.currentTurn];
					
					//
					l1 = l1 ^ bit; i++;
				}
				l1 = l2; l2 = 0; mask1 = 0; mask2 = -1;
			}
			
			//move ordering
			for(let e=0;e<childIndex.length-1;e++){
				for(let j=e+1;j<childIndex.length;j++){
					if(childIndex[e][1]<childIndex[j][1]){
						let temp = childIndex[e];
						childIndex[e] = childIndex[j];
						childIndex[j] = temp;
					}
				}
			}
			
			for(let j=0;j<childIndex.length;j++){
				alpha = Math.max(alpha, -this.negaAlpha_last_m(childIndex[j][0], -beta, -alpha));
				if(alpha>=beta){return alpha;}
			}
			
			return alpha;
			
		}else if(state===2){ //pass
			const newNode = new Board(node);
			newNode.currentTurn *= -1;
			return -this.negaAlpha_last_m(newNode, -beta, -alpha);
		}else if(state===3){ //終局
			//currentTurnをかけるのは、Negaalphaだから
			return node.count * node.currentTurn;
		}
	}
	
	_negaScout_last(node, alpha, beta){
		//[b1,b2,w1,w2,turn,sum]
		let num_readnode = 0;
		const argnode = new BOARD_OPERATION(node.boardArray);
		const board = new BOARD_OPERATION();
		const b32a = board.boardArray;
		const b8a = board._board8array;
		const that = this;
		let value = 0;

		function placeAndTurnStones(b_){

			let temp, temp1, temp2;
		
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
			const verticalMasck1 = 0x00ffffff & b_[2];
			const verticalMasck2 = 0xffffff00 & b_[3];
			const edgeMask1 = 0x007e7e7e & b_[2];
			const edgeMask2 = 0x7e7e7e00 & b_[3];
			
			//+1
			temp1  = horizontalMask1 & (b_[6]<<1); temp2  = horizontalMask2 & (b_[7]<<1);
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
			temp1  = horizontalMask1 & (b_[6]>>>1); temp2  = horizontalMask2 & (b_[7]>>>1);
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
			temp1  = verticalMasck1&(b_[6]>>>8); temp2  = verticalMasck2&(b_[7]>>>8|b_[6]<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			if(((temp1>>>8)&b_[0])|((temp2>>>8|temp1<<24)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
		
			//-8
			temp1  = verticalMasck1&(b_[6]<<8|b_[7]>>>24); temp2  = verticalMasck2&(b_[7]<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			if(((temp1<<8|temp2>>>24)&b_[0])|((temp2<<8)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
			
			//-7
			temp1  = edgeMask1&(b_[6]<<7|b_[7]>>>25); temp2  = edgeMask2&(b_[7]<<7);
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
			temp1  = edgeMask1&(b_[6]<<9|b_[7]>>>23); temp2  = edgeMask2&(b_[7]<<9);
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
			temp1  = edgeMask1&(b_[6]>>>7); temp2  = edgeMask2&(b_[7]>>>7|b_[6]<<25);
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
			temp1  = edgeMask1&(b_[6]>>>9); temp2  = edgeMask2&(b_[7]>>>9|b_[6]<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			if(((temp1>>>9)&b_[0])|((temp2>>>9|temp1<<23)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
		
			b_[0] |= b_[6];
			b_[1] |= b_[7];
		
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
		function legalHand(b_){
	
			let temp, temp1, temp2;
		
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
			b_[6] = b_[7] = 0;
			
			//-1
			temp1 = horizontalMask1&(b_[0]<<1); temp2 = horizontalMask2&(b_[1]<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			b_[6] |= blankBoard1&(temp1<<1);
			b_[7] |= blankBoard2&(temp2<<1);
			
			//+1
			temp1 = horizontalMask1&(b_[0]>>>1); temp2 = horizontalMask2&(b_[1]>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			b_[6] |= blankBoard1&(temp1>>>1);
			b_[7] |= blankBoard2&(temp2>>>1);
			
			//-8
			temp1 = verticalMask1&(b_[0]<<8|b_[1]>>>24); temp2 = verticalMask2&(b_[1]<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			b_[6] |= blankBoard1&(temp1<<8|temp2>>>24);
			b_[7] |= blankBoard2&(temp2<<8);
			
			//+8
			temp1 = verticalMask1&(b_[0]>>>8); temp2 = verticalMask2&(b_[1]>>>8|b_[0]<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			b_[6] |= blankBoard1&(temp1>>>8);
			b_[7] |= blankBoard2&(temp2>>>8|temp1<<24);
			
			//-7
			temp1 = edgeMask1&(b_[0]<<7|b_[1]>>>25); temp2 = edgeMask2&(b_[1]<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			b_[6] |= blankBoard1&(temp1<<7|temp2>>>25);
			b_[7] |= blankBoard2&(temp2<<7);
			
			//-9
			temp1 = edgeMask1&(b_[0]<<9| b_[1]>>>23); temp2 = edgeMask2&(b_[1]<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			b_[6] |= blankBoard1&(temp1<<9| temp2>>>23);
			b_[7] |= blankBoard2&(temp2<<9);
			
			//+7
			temp1 = edgeMask1&(b_[0]>>>7); temp2 = edgeMask2&(b_[1]>>>7|b_[0]<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			b_[6] |= blankBoard1&(temp1>>>7);
			b_[7] |= blankBoard2&(temp2>>>7|temp1<<25);
			
			//+9
			temp1 = edgeMask1&(b_[0]>>>9); temp2 = edgeMask2&(b_[1]>>>9| b_[0]<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			b_[6] |= blankBoard1&(temp1>>>9);
			b_[7] |= blankBoard2&(temp2>>>9| temp1<<23);
			
			if(b_[4]===-1){//white turn
				temp = b_[2];
				b_[2] = b_[0];
				b_[0] = temp;
				temp = b_[3];
				b_[3] = b_[1];
				b_[1] = temp;
			}
			
		}
		function state_b(b_){
			//b1, b2, w1, w2, turn, sum
			const legalhand = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], 0, 0];
			legalHand(legalhand);
			
			if(legalhand[6]|legalhand[7]){
				return 1;
			}
			
			legalhand[4] *= -1;
			legalHand(legalhand);
			legalhand[4] *= -1;
			
			if(legalhand[6]|legalhand[7]){
				return 2;
			}else{
				return 3;
			}
			
		}
		function b_w(b_){

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
		const search = (b_, alpha, beta)=>{
			const state = state_b(b_);
			num_readnode++;
			let max, v;
			
			if(state===1){
				//expand child node
				const legalhand = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], 0, 0];
				legalHand(legalhand);
				const childNodes = [];
				let bit = 0, mask1 = 0xffffffff, mask2 = 0, i = 0;
				while(legalhand[6]|legalhand[7]){
					while(legalhand[6]){
						bit = -legalhand[6] & legalhand[6];
						//
						const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], bit&mask1, bit&mask2];
						placeAndTurnStones(newNode);
						childNodes[i] = newNode;
						b32a[0] = newNode[0]; b32a[1] = newNode[1]; b32a[2] = newNode[2]; b32a[3] = newNode[3]; b32a[4] = newNode[4]; b32a[5] = newNode[5];
						childNodes[i+1] = -this.evaluation(b8a)*newNode[4];
						//
						legalhand[6] = legalhand[6] ^ bit; i+=2;
					}
					legalhand[6] = legalhand[7]; legalhand[7] = 0; mask1 = 0; mask2 = 0xffffffff;
				}
				
				//move ordering
				for(let i=0;i<childNodes.length-2;i+=2){
					for(let j=i+2;j<childNodes.length;j+=2){
						if(childNodes[i+1]<childNodes[j+1]){
							let temp = childNodes[i];
							childNodes[i] = childNodes[j];
							childNodes[j] = temp;
							temp = childNodes[i+1];
							childNodes[i+1] = childNodes[j+1];
							childNodes[j+1] = temp;
						}
					}
				}
				
				v = -search([childNodes[0][0], childNodes[0][1], childNodes[0][2], childNodes[0][3], childNodes[0][4], childNodes[0][5]], -beta, -alpha);
				max = v;
				if(beta<=v){return v;}//cut
				if(alpha<v){alpha = v;}
				
				for(let j=2;j<childNodes.length;j+=2){
					v = -search([childNodes[j][0], childNodes[j][1], childNodes[j][2], childNodes[j][3], childNodes[j][4], childNodes[j][5]], -alpha-1, -alpha);//null window search
					if(beta<=v){return v;}
					if(alpha<v){
						alpha = v;
						v = -search([childNodes[j][0], childNodes[j][1], childNodes[j][2], childNodes[j][3], childNodes[j][4], childNodes[j][5]], -beta, -alpha);
						if(beta<=v){return v;}
						if(alpha<v){alpha = v;}
					}
					if(max<v){max = v;}
				}
				
				return max;
			}else if(state===2){ //pass
				return -search([b_[0], b_[1], b_[2], b_[3], -b_[4], b_[5]], -beta, -alpha);
			}else{ //game finish
				return b_w(b_) * b_[4];
			}
		}
		value = search(argnode.boardArray, alpha, beta);
		//console.log(`negaScout_last read node ${num_readnode}`);
		return value;
	}

	_negaScout(node, alpha, beta, depth){
		//[b1,b2,w1,w2,turn,sum]
		let num_readnode = 0;
		const argnode = new BOARD_OPERATION(node.boardArray);
		const board = new BOARD_OPERATION();
		const b32a = board.boardArray;
		const b8a = board._board8array;
		let value = 0;

		function placeAndTurnStones(b_){

			let temp, temp1, temp2;
		
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
			const verticalMasck1 = 0x00ffffff & b_[2];
			const verticalMasck2 = 0xffffff00 & b_[3];
			const edgeMask1 = 0x007e7e7e & b_[2];
			const edgeMask2 = 0x7e7e7e00 & b_[3];
			
			//+1
			temp1  = horizontalMask1 & (b_[6]<<1); temp2  = horizontalMask2 & (b_[7]<<1);
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
			temp1  = horizontalMask1 & (b_[6]>>>1); temp2  = horizontalMask2 & (b_[7]>>>1);
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
			temp1  = verticalMasck1&(b_[6]>>>8); temp2  = verticalMasck2&(b_[7]>>>8|b_[6]<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMasck1&(temp1>>>8); temp2 |= verticalMasck2&(temp2>>>8|temp1<<24);
			if(((temp1>>>8)&b_[0])|((temp2>>>8|temp1<<24)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
		
			//-8
			temp1  = verticalMasck1&(b_[6]<<8|b_[7]>>>24); temp2  = verticalMasck2&(b_[7]<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			temp1 |= verticalMasck1&(temp1<<8|temp2>>>24); temp2 |= verticalMasck2&(temp2<<8);
			if(((temp1<<8|temp2>>>24)&b_[0])|((temp2<<8)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
			
			//-7
			temp1  = edgeMask1&(b_[6]<<7|b_[7]>>>25); temp2  = edgeMask2&(b_[7]<<7);
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
			temp1  = edgeMask1&(b_[6]<<9|b_[7]>>>23); temp2  = edgeMask2&(b_[7]<<9);
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
			temp1  = edgeMask1&(b_[6]>>>7); temp2  = edgeMask2&(b_[7]>>>7|b_[6]<<25);
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
			temp1  = edgeMask1&(b_[6]>>>9); temp2  = edgeMask2&(b_[7]>>>9|b_[6]<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9|temp1<<23);
			if(((temp1>>>9)&b_[0])|((temp2>>>9|temp1<<23)&b_[1])){
				b_[0] ^= temp1; b_[1] ^= temp2;
				b_[2] ^= temp1; b_[3] ^= temp2;
			}
		
			b_[0] |= b_[6];
			b_[1] |= b_[7];
		
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
		function legalHand(b_){
	
			let temp, temp1, temp2;
		
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
			b_[6] = b_[7] = 0;
			
			//-1
			temp1 = horizontalMask1&(b_[0]<<1); temp2 = horizontalMask2&(b_[1]<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			temp1 |= horizontalMask1&(temp1<<1); temp2 |= horizontalMask2&(temp2<<1);
			b_[6] |= blankBoard1&(temp1<<1);
			b_[7] |= blankBoard2&(temp2<<1);
			
			//+1
			temp1 = horizontalMask1&(b_[0]>>>1); temp2 = horizontalMask2&(b_[1]>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			temp1 |= horizontalMask1&(temp1>>>1); temp2 |= horizontalMask2&(temp2>>>1);
			b_[6] |= blankBoard1&(temp1>>>1);
			b_[7] |= blankBoard2&(temp2>>>1);
			
			//-8
			temp1 = verticalMask1&(b_[0]<<8|b_[1]>>>24); temp2 = verticalMask2&(b_[1]<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			temp1 |= verticalMask1&(temp1<<8|temp2>>>24); temp2 |= verticalMask2&(temp2<<8);
			b_[6] |= blankBoard1&(temp1<<8|temp2>>>24);
			b_[7] |= blankBoard2&(temp2<<8);
			
			//+8
			temp1 = verticalMask1&(b_[0]>>>8); temp2 = verticalMask2&(b_[1]>>>8|b_[0]<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			temp1 |= verticalMask1&(temp1>>>8); temp2 |= verticalMask2&(temp2>>>8|temp1<<24);
			b_[6] |= blankBoard1&(temp1>>>8);
			b_[7] |= blankBoard2&(temp2>>>8|temp1<<24);
			
			//-7
			temp1 = edgeMask1&(b_[0]<<7|b_[1]>>>25); temp2 = edgeMask2&(b_[1]<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			temp1 |= edgeMask1&(temp1<<7|temp2>>>25); temp2 |= edgeMask2&(temp2<<7);
			b_[6] |= blankBoard1&(temp1<<7|temp2>>>25);
			b_[7] |= blankBoard2&(temp2<<7);
			
			//-9
			temp1 = edgeMask1&(b_[0]<<9| b_[1]>>>23); temp2 = edgeMask2&(b_[1]<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			temp1 |= edgeMask1&(temp1<<9| temp2>>>23); temp2 |= edgeMask2&(temp2<<9);
			b_[6] |= blankBoard1&(temp1<<9| temp2>>>23);
			b_[7] |= blankBoard2&(temp2<<9);
			
			//+7
			temp1 = edgeMask1&(b_[0]>>>7); temp2 = edgeMask2&(b_[1]>>>7|b_[0]<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			temp1 |= edgeMask1&(temp1>>>7); temp2 |= edgeMask2&(temp2>>>7|temp1<<25);
			b_[6] |= blankBoard1&(temp1>>>7);
			b_[7] |= blankBoard2&(temp2>>>7|temp1<<25);
			
			//+9
			temp1 = edgeMask1&(b_[0]>>>9); temp2 = edgeMask2&(b_[1]>>>9| b_[0]<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			temp1 |= edgeMask1&(temp1>>>9); temp2 |= edgeMask2&(temp2>>>9| temp1<<23);
			b_[6] |= blankBoard1&(temp1>>>9);
			b_[7] |= blankBoard2&(temp2>>>9| temp1<<23);
			
			if(b_[4]===-1){//white turn
				temp = b_[2];
				b_[2] = b_[0];
				b_[0] = temp;
				temp = b_[3];
				b_[3] = b_[1];
				b_[1] = temp;
			}
			
		}
		function state_b(b_){
			//b1, b2, w1, w2, turn, sum
			const legalhand = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], 0, 0];
			legalHand(legalhand);
			
			if(legalhand[6]|legalhand[7]){
				return 1;
			}
			
			legalhand[4] *= -1;
			legalHand(legalhand);
			legalhand[4] *= -1;
			
			if(legalhand[6]|legalhand[7]){
				return 2;
			}else{
				return 3;
			}
			
		}
		function b_w(b_){

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
		const search = (b_, alpha, beta, depth)=>{
			if(depth<1){
				b32a[0] = b_[0]; b32a[1] = b_[1]; b32a[2] = b_[2]; b32a[3] = b_[3]; b32a[4] = b_[4]; b32a[5] = b_[5];
				//console.log(b_[5]);
				return this.evaluation(b8a)*b_[4];
			}

			const state = state_b(b_);
			num_readnode++;
			let max, v;
			
			if(state===1){
				//expand child node
				const legalhand = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], 0, 0];
				legalHand(legalhand);
				const childNodes = [];
				let bit = 0, mask1 = 0xffffffff, mask2 = 0, i = 0;
				while(legalhand[6]|legalhand[7]){
					while(legalhand[6]){
						bit = -legalhand[6] & legalhand[6];
						//
						const newNode = [b_[0], b_[1], b_[2], b_[3], b_[4], b_[5], bit&mask1, bit&mask2];
						placeAndTurnStones(newNode);
						childNodes[i] = newNode;
						b32a[0] = newNode[0]; b32a[1] = newNode[1]; b32a[2] = newNode[2]; b32a[3] = newNode[3]; b32a[4] = newNode[4]; b32a[5] = newNode[5];
						childNodes[i+1] = -this.evaluation(b8a)*newNode[4];
						//
						legalhand[6] = legalhand[6] ^ bit; i+=2;
					}
					legalhand[6] = legalhand[7]; legalhand[7] = 0; mask1 = 0; mask2 = 0xffffffff;
				}
				
				//move ordering
				for(let i=0;i<childNodes.length-2;i+=2){
					for(let j=i+2;j<childNodes.length;j+=2){
						if(childNodes[i+1]<childNodes[j+1]){
							let temp = childNodes[i];
							childNodes[i] = childNodes[j];
							childNodes[j] = temp;
							temp = childNodes[i+1];
							childNodes[i+1] = childNodes[j+1];
							childNodes[j+1] = temp;
						}
					}
				}
				
				v = -search([childNodes[0][0], childNodes[0][1], childNodes[0][2], childNodes[0][3], childNodes[0][4], childNodes[0][5]], -beta, -alpha, depth-1);
				max = v;
				if(beta<=v){return v;}//cut
				if(alpha<v){alpha = v;}
				
				for(let j=2;j<childNodes.length;j+=2){
					v = -search([childNodes[j][0], childNodes[j][1], childNodes[j][2], childNodes[j][3], childNodes[j][4], childNodes[j][5]], -alpha-1, -alpha, depth-1);//null window search
					if(beta<=v){return v;}
					if(alpha<v){
						alpha = v;
						v = -search([childNodes[j][0], childNodes[j][1], childNodes[j][2], childNodes[j][3], childNodes[j][4], childNodes[j][5]], -beta, -alpha, depth-1);
						if(beta<=v){return v;}
						if(alpha<v){alpha = v;}
					}
					if(max<v){max = v;}
				}
				
				return max;
			}else if(state===2){ //pass
				return -search([b_[0], b_[1], b_[2], b_[3], -b_[4], b_[5]], -beta, -alpha, depth-1);
			}else{ //game finish
				return b_w(b_)*b_[4];
			}
		}
		value = search(argnode.boardArray, alpha, beta, depth);
		// console.log(`negaScout read node ${num_readnode}`);
		return value;
	}
	
	_cpuHand(node, alpha=-100, beta=100, showStatus=false){
		const depth = this.depth[0];
		const depth_last = this.depth[1];
		
		function convertLocation(hand1,hand2){
			if(hand1<0){return 1;}
			if(hand2<0){return 33;}
			if(hand1){return 32-Math.log2(hand1);}
			if(hand2){return 64-Math.log2(hand2);}
		}
		
		const childIndex = [];
		const startTime = performance.now();
		let rand=0, temp=0, bit=0, i=0, value=0, mask1=0xffffffff, mask2=0;

		const legalhand = node.legalHand([0, 0]);
		this.num_readnode = 0;
		////////
	
		while(legalhand[0]|legalhand[1]){
			while(legalhand[0]){
				bit = -legalhand[0] & legalhand[0];
				//
				const childNode = new BOARD_OPERATION(node.boardArray);
				childNode.placeAndTurnStones([bit&mask1, bit&mask2]);
				if(node.boardArray[5]<64-depth_last){
					value = -this.negaScout(childNode, alpha, beta, depth);
				}else{
					value = -this.negaScout_last(childNode, alpha, beta);
				}
				childNode.e = value;
				childIndex[i++] = [value, [bit&mask1, bit&mask2], childNode, convertLocation(bit&mask1, bit&mask2)];
				//
				legalhand[0] = legalhand[0] ^ bit;
			}
			legalhand[0] = legalhand[1]; legalhand[1] = 0; mask1 = 0; mask2 = 0xffffffff;
		}
	
		
		
		
		//配列をスコア順にソート
		for(let e=0;e<childIndex.length-1;e++){
			for(let j=e+1;j<childIndex.length;j++){
				if(childIndex[e][0]<childIndex[j][0]){
					temp = childIndex[e];
					childIndex[e] = childIndex[j];
					childIndex[j] = temp;
				}
			}
		}
		
		
		//最大値がいくつあるかをrandにカウント
		for(let e=1;e<childIndex.length;e++){
			if(childIndex[0][0]===childIndex[e][0]){
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
				"cpu put at " + childIndex[rand][1] + "\n"
			);
		}
			
		
		node.put = childIndex[0][1];
		this.num_readnode = 0;
		
		
		return childIndex;
		
	}
}
