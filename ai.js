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
				return this.evaluation(board);//*board.turn;
			}
		
			const state = board.state(board);
			let max = -128, v = 0;
			
			if(state===1){
				//expand child node
				const children = board.expand();
				
				for(let i=0;i<children.length;i++){
					children[i].e = -this.evaluation(children[i]);//*children[i].turn;
					if(max<children[i].e){max = children[i].e; v = i;}
				}

				max = v = -search(children[v], -beta, -alpha, depth-1);
				if(beta<=v){return v;} //cut
				if(alpha<v){alpha = v;}
				
				//move ordering
				if(board.stones<60){
					children.sort((a,b)=>{return b.e-a.e});
				}
				
				for(let i=1;i<children.length;i++){
					v = -search(children[i], -alpha-1, -alpha, depth-1);
					if(beta<=v){return v;}
					if(alpha<v){
						alpha = v;
						v = -search(children[i], -beta, -alpha, depth-1);
						if(beta<=v){return v;}
						if(alpha<v){alpha = v;}
					}
					if(max<v){max = v;}
				}
				
				return max;
			}else if(state===2){ //pass
				const child = new BOARD(board);
				child.turn *= -1;
				return -search(child, -beta, -alpha, depth-1);
			}else{ //game finish
				return board.black_white()*board.turn;
			}
		}

		value = search(argnode, alpha, beta, depth);
		if(showStatus){
			console.log(`NegaScout\nread nodes: ${num_readnode}\nevaluation: ${value}`);
		}
		this.num_readnode = num_readnode;
		return value;
	}

	async cpuHand(node, alpha=-100, beta=100, depth=0, showStatus=false, showSearching=false){
		const startTime = performance.now();
		const children = node.expand();
		let rand=0, temp=0;
		if(children.length===0){
			return children;
		}
		for(const child of children){
			// どこにおいたかを調べる
			child.hand1 = (node.black1|node.white1)^(child.black1|child.white1);
			child.hand2 = (node.black2|node.white2)^(child.black2|child.white2);
			// calc eval of child
			child.e = -this.negaScout(child, alpha, beta, depth);

			//if(showSearching){
				await master.showSearchingCell(child.hand1, child.hand2);
			//}
		}
		// sort
		children.sort((a,b)=>{return b.e-a.e;});
		
		//最大値がいくつあるかをrandにカウント
		for(let i=1;i<children.length;i++){
			if(~~children[0].e===~~children[i].e){
				rand = i;
			}else{
				break;
			}
		}
		//0番目とrand番目を入れ替える
		rand = ~~(Math.random() * rand);
		temp = children[0];
		children[0] = children[rand];
		children[rand] = temp;
		const process_time = (performance.now()-startTime).toPrecision(4);
		const node_per_second = (~~(this.num_readnode/process_time)).toPrecision(4);
		if(showStatus){
			console.log(
				"read " + this.num_readnode + " nodes\n" + 
				"process time " + process_time + " ms\n" + 
				node_per_second + " nodes per ms\n"
			);
		}
		
		return children;
	}
	
	randomHand(board){
		const hands = [];
		const mask1 = 0x00003c3c;
		const mask2 = 0x3c3c0000;
		let legalhand = board.getMove();

		const x_mask1 = ~0x42c30000;
		const x_mask2 = ~0x0000c342;

		if(Math.random()>0.1){
			legalhand[0] &= x_mask1;
			legalhand[1] &= x_mask2;
		}
		if(legalhand[0]===0 && legalhand[1]===0){
			legalhand = board.getMove();
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

