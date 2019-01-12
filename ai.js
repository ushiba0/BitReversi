//探査では、currentTurn から見た評価値が返される。

class AI extends EV {
	constructor(arg){
		super(arg);
	}
	
	negaScout(node, alpha, beta, depth, showStatus=false){

		const argnode = new BOARD(node);
		let num_readnode = 0;
		let value = 0;

		
		const search = (board, alpha, beta, depth)=>{
			num_readnode++;

			if(depth===0){
				return this.evaluation(board)*board.boardArray[4];
			}
		
			const state = board.state(board);
			let max = -128, v = 0;
			
			if(state===1){
				//expand child node
				const legalhand = board.legalHand();
				const childNodes = [];
				let bit = 0, i = 0;
				while(legalhand[0]){
					bit = -legalhand[0] & legalhand[0];
					//
					const child = new BOARD(board);
					child.placeAndTurnStones(bit, 0);
					childNodes[i] = child;
					childNodes[i].e = -this.evaluation(child)*child.boardArray[4];
					if(max<childNodes[i].e){max = childNodes[i].e; v = i;}
					//
					legalhand[0] = legalhand[0] ^ bit; i+=1;
				}
				while(legalhand[1]){
					bit = -legalhand[1] & legalhand[1];
					//
					const child = new BOARD(board);
					child.placeAndTurnStones(0, bit);
					childNodes[i] = child;
					childNodes[i].e = -this.evaluation(child)*child.boardArray[4];
					if(max<childNodes[i].e){max = childNodes[i].e; v = i;}
					//
					legalhand[1] = legalhand[1] ^ bit; i+=1;
				}

				max = v = -search(childNodes[v], -beta, -alpha, depth-1);
				if(beta<=v){return v;} //cut
				if(alpha<v){alpha = v;}
				
				//move ordering
				if(board.boardArray[5]<60){
					childNodes.sort((a,b)=>{return b.e-a.e});
				}
				
				for(let i=1;i<childNodes.length;i++){
					v = -search(childNodes[i], -alpha-1, -alpha, depth-1);
					if(beta<=v){return v;}
					if(alpha<v){
						alpha = v;
						v = -search(childNodes[i], -beta, -alpha, depth-1);
						if(beta<=v){return v;}
						if(alpha<v){alpha = v;}
					}
					if(max<v){max = v;}
				}
				
				return max;
			}else if(state===2){ //pass
				const child = new BOARD(board);
				child.boardArray[4] *= -1;
				return -search(child, -beta, -alpha, depth-1);
			}else{ //game finish
				return board.b_w()*board.boardArray[4];
			}
		}

		value = search(argnode, alpha, beta, depth);
		if(showStatus){
			console.log(`NegaScout\nread nodes: ${num_readnode}\nevaluation: ${value}`);
		}
		return value;
	}

	cpuHand(board, alpha=-100, beta=100, depth=0,showStatus=false){
		const childNodes = [];
		const startTime = performance.now();
		let rand=0, temp=0, bit=0, i=0, value=0;

		const legalhand = board.legalHand();
		
		
		while(legalhand[0]){
			bit = -legalhand[0] & legalhand[0];
			//
			const child = new BOARD(board);
			child.placeAndTurnStones(bit, 0);
			child.e = -this.negaScout(child, alpha, beta, depth);
			child.hand = [bit, 0];
			childNodes[i++] = child;
			//
			legalhand[0] = legalhand[0] ^ bit;
		}
		while(legalhand[1]){
			bit = -legalhand[1] & legalhand[1];
			//
			const child = new BOARD(board);
			child.placeAndTurnStones(0, bit);
			child.e = -this.negaScout(child, alpha, beta, depth);
			child.hand = [0, bit];
			childNodes[i++] = child;
			//
			legalhand[1] = legalhand[1] ^ bit;
		}
		
		// sort
		childNodes.sort((a,b)=>{return b.e-a.e});
		
		//最大値がいくつあるかをrandにカウント
		for(let i=1;i<childNodes.length;i++){
			if(~~childNodes[0].e===~~childNodes[i].e){
				rand = i;
			}else{
				break;
			}
		}
		
		//0番目とrand番目を入れ替える
		rand = ~~(Math.random() * rand);
		temp = childNodes[0];
		childNodes[0] = childNodes[rand];
		childNodes[rand] = temp;
		
		if(showStatus){
			console.log(
				"read " + this.num_readnode + " nodes\n" + 
				"process time " + (performance.now()-startTime) + " ms\n" + 
				(~~(this.num_readnode/(performance.now()-startTime))) + " nodes per ms\n" + 
				"cpu put at " + childNodes[rand].hand + "\n"
			);
		}
		
		return childNodes;
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
		if(legalhand[0]===0 && legalhand[1]===0){
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
	
}

const ai = new AI();
