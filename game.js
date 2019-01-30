// しくみ
// 


class GRAPHIC extends CONSTANTS{
	constructor(){
		super();
	}

	render(node){
		if(!node){
			node = this.now;
		}
		
		let black = 0;
		let white = 0;
		const b_ = node.board;
		
		//評価値を消す
		for(let value of squares){
			value.className = '';
		}
		
		//石の数をカウント
		for(let i=1;i<65;i++){
			if(b_[i]===1){
				black++;
			}else if(b_[i]===-1){
				white++;
			}
		}
		
		//石を置く
		for(let i=1;i<65;i++){
			if(b_[i]===1){
				circles[i-1].className = 'black';
			}else if(b_[i]===-1){
				circles[i-1].className = 'white';	
			}else{
				circles[i-1].className = 'blank';
			}
		}
		
		black_score.innerText = black + '';
		white_score.innerText = white + '';
		
		if(node.boardArray[4]!==this.colorOfCpu){
			comment.innerText = 'player turn';
		}
		
		if(node.state()===3){//終局
			if(black > white){
				comment.innerText = 'black win';
			}else if(black < white){
				comment.innerText = 'white win';
			}else{
				comment.innerText = 'draw';
			}
			
			return;
		}
	}
	
	showEval(node=0, alpha=-100,beta=100, depth=-1){
		if(!node){
			node = this.now;
		}
		
		const search_depth = (depth===-1)?
			(this.depth[1]>=64-node.boardArray[5] ? -1 : this.depth[0]):
			depth;
		const evals = ai.cpuHand(node, alpha, beta, search_depth);

		if(evals.length===0){
			return;
		}

		// delete former evels
		for(let element of circles){
			element.innerText = '';
		}

		for(let node of evals){
			const hand = node.hand;
			let put = 0;
			if(hand[0]<0){
				put = 1;
			}else if(hand[0]>0){
				put = 32-Math.log2(hand[0]);
			}
			if(hand[1]<0){
				put = 33;
			}else if(hand[1]>0){
				put = 64-Math.log2(hand[1]);
			}

			circles[put-1].innerText = node.e;
			if(node.e>0){
				circles[put-1].className = 'eval_plus';
				circles[put-1].innerText = (node.e + '').slice(0, 5);
			}else{
				circles[put-1].className = 'eval_minus';
				circles[put-1].innerText = (node.e + '').slice(0, 5);
			}
		}
		
		return;
	}
	
	visualizeMove(node){
		if(!node){
			node = this.now;
		}

		const legalhand = node.legalHand();
		
		let l1 = legalhand[0];
		let l2 = legalhand[1];
		const board = new Array();
		
		for(let i=0;i<65;i++){
			board[i] = 0;
		}
		
		for(let i=32;i>0;i--){
			if(l1&1 === 1){
				board[i] = 1;
			}
			l1 = l1 >>> 1;
		}
		for(let i=64;i>32;i--){
			if(l2&1 === 1){
				board[i] = 1;
			}
			l2 = l2 >>> 1;
		}
		
		for(let i=1;i<65;i++){
			if(board[i]===1){
				squares[i-1].className = 'legal';
			}else{
				squares[i-1].className = '';
			}
		}
	}
	
	visualizeLastPut(node){
		if(!node){
			node = this.now;
		}
		if(!Array.isArray(node.hand)){
			for(let i=0;i<64;i++){
				if(squares[i].className==='lastput'){
					squares[i].className==='';
				}
			}
			return;
		}

		const hand = node.hand;
		let put = 0;
		
		if(hand[0]<0){put = 1;}
		if(hand[1]<0){put = 33;}
		if(hand[0]){put = 32-Math.log2(hand[0]);}
		if(hand[1]){put = 64-Math.log2(hand[1]);}

		const x = put%8===0 ? 7 : put%8-1;
		const y = Math.ceil(put/8)-1;
		squares[y*8+x].className = 'lastput';
	}
}



class MASTER extends GRAPHIC {
	constructor(){
		super();
		this.mode = 'gameb';
		this.record = [new BOARD()];
	}

	resetGame(){
		this.mode = 'gameb';
		this.record = [new BOARD()];
		this.render(this.now);
	}
	
	//最新のBoardを返す
	get now(){
		return this.record[0];
	}
	
	//ゲームを進行する
	play(hand1=0, hand2=0){
		let e;
		const legalhand = this.now.legalHand();
		
		if(!(hand1===0 && hand2===0)){//handle illegal hand
			if(!(legalhand[0]&hand1)&&!(legalhand[1]&hand2)){
				console.error(`error (${hand1}, ${hand2}) is illegal hand`);
				return;
			}
		}
		
		//思考中のタッチ操作を無効にする
		clickDisabled = true;

		const player_turn = ()=>{ return new Promise((resolve)=>{
			if(this.now.boardArray[4]===this.colorOfCpu){
				resolve();
			}else{
				this.record.unshift(new BOARD(this.now));
				this.now.placeAndTurnStones(hand1, hand2);
				resolve();
			}
		});};
		
		const cpu_turn = ()=>{ return new Promise((resolve)=>{
			if(this.now.state()===1){
				this.record.unshift(new BOARD(this.now));
				const search_depth = this.depth[1]>=64-this.now.boardArray[5] ? -1 : this.depth[0]; 
				const move = ai.cpuHand(this.now, -100, 100, search_depth,true);
				this.now.placeAndTurnStones(...move[0].hand);
				this.now.hand = move[0].hand;
			}else if(this.now.state()===2){
				this.record.unshift(new BOARD(this.now));
				this.now.boardArray[4] *= -1;
				resolve();
			}else{
				console.log('終局');
				resolve();
			}
			
			if(this.now.state()===1){
				resolve();
			}else if(this.now.state()===2){
				this.record.unshift(new BOARD(this.now));
				this.now.boardArray[4] *= -1;
				this.play();3
				resolve();
			}else{
				resolve();
			}
		});};
		
		const render = ()=>{return new Promise((resolve)=>{
			setTimeout(() => {
				resolve();
			}, 50);
			this.render(this.now);
			this.visualizeMove(this.now);
			this.visualizeLastPut(this.now);
		});};
		

		player_turn()
			.then(render)
			.then(cpu_turn)
			.then(render)
			.catch(e=>{
				console.error(e);
			});

			
		
		//クリック操作を有効化
		clickDisabled = false;
		
		return;
	}

	get state(){
		return this.now.state;
	}

	getSelfPlayGame(){
		const nodes = [];
		const history = [new BOARD()];
		let c=0;
		
		while(true){
			const state = history[0].state();
			
			if(state===1){
				history.unshift(new BOARD(history[0]));
				const move = ai.cpuHand(history[0], -100, 100, 4);
				const rand = ~~(Math.random()*Math.min(move.length, 2));
				for(let i=0;i<move.length;i++){
					nodes[c] = new BOARD(move[i]);
					nodes[c++].e = move[i].e;
				}
				history[0].placeAndTurnStones(...move[rand].hand);
			}else if(state===2){
				history[0].boardArray[4] *=-1;
			}else{
				break;
			}
		}
			
		for(let i=0;i<nodes.length;i++){
			nodes[i].e *= -1;
			if(nodes[i].boardArray[4]===-1){
				nodes[i].swap();
				nodes[i].boardArray[4] = 1;
			}
		}
		
		return nodes;
	}
	
	generateGame(random_rate=0){
		const node_now = this.generateNode(14);
		const nodes = [new BOARD(node_now)];
		
		while(true){
			const state = node_now.state();

			if(state===1){
				const depth = node_now.boardArray[5]>60? -6 : 0;
				const move = ai.cpuHand(node_now, -100, 100, depth);
				const index = Math.random()<random_rate ? Math.floor(Math.random()*move.length) : 0;
				const next_move = move[index];
				const next_node = new BOARD(next_move);
				next_node.e = -next_move.e;
				nodes.push(next_node);
				node_now.placeAndTurnStones(...next_move.hand);
			}else if(state===2){
				node_now.boardArray[4] *=-1;
			}else{
				break;
			}
		}
		return nodes;
	}
    
    generateNode(N=64){
		const n = Math.max(Math.min(64, N), 4);
		let node_now = new BOARD();
		
		while(true){
			const state = node_now.state();
			
			if(node_now.boardArray[5]===n){
				node_now.boardArray[4] = 1;
				return node_now;
			}

			if(state===1){
				const hand = ai.randomHand(node_now	);
				node_now.placeAndTurnStones(...hand);
			}else if(state===2){
				node_now.boardArray[4] *= -1;
			}else{
				if(node_now.boardArray[5]===N){
					node_now.boardArray[4] = 1;
					return node_now;
				}else{
					node_now = new BOARD();
				}
			}
		}
	}

}
const master = new MASTER();




const selfPlay = (num_iter, random_rate=0)=>{
	
	for(let i=0;i<num_iter;i++){
		const game = master.generateGame(random_rate);
		const last = game[game.length-1];
		const value = last.e;
		for(const node of game){
			if(node.boardArray[4]===-1){
				node.swap();
				node.e *= -1;
			}
			node.e = value * node.boardArray[4];

			node.boardArray[4] = 1;
			backup.push(node);
		}
	}
};


const trainEV = ()=>{
	const constants = new CONSTANTS();
	const num_phase = constants.num_phase;
	const num_shape = constants.num_shape;
	const weights_temp = new Float32Array(6561*num_phase*num_shape);
	const indexb = ai.indexb;
	const indexw = ai.indexw;

	while(backup.length>0){
		const node = backup.pop();
		const value = node.e;
		const phase = Math.min(Math.max(10, node.boardArray[5]-4), 60);

		const node1 = new BOARD(node);
		const node2 = ai.rotateBoard(node1);
		const node3 = ai.rotateBoard(node2);
		const node4 = ai.rotateBoard(node3);
		const node5 = ai.flipBoard(node1);
		const node6 = ai.rotateBoard(node5);
		const node7 = ai.rotateBoard(node6);
		const node8 = ai.rotateBoard(node7);

		for(let node of [node1, node2, node3, node4, node5, node6, node7, node8]){
			const shape = node.shape();
			let offset = 6561*phase, index;

			//horizontal 1
			//上辺
			index = indexb[shape[0]] + indexw[shape[1]];
			weights_temp[offset + index] += value;
			//下辺
			index = indexb[shape[2]] + indexw[shape[3]];
			weights_temp[offset + index] += value;
			//右辺
			index = indexb[shape[4]] + indexw[shape[5]];
			weights_temp[offset + index] += value;
			//左辺
			index = indexb[shape[6]] + indexw[shape[7]];
			weights_temp[offset + index] += value;
			
			
			offset += 6561*num_phase;
			//horizontal 2
			//上辺
			index = indexb[shape[8]] + indexw[shape[9]];
			weights_temp[offset + index] += value;
			//下辺
			index = indexb[shape[10]] + indexw[shape[11]];
			weights_temp[offset + index] += value;
			//右辺
			index = indexb[shape[12]] + indexw[shape[13]];
			weights_temp[offset + index] += value;
			//左辺
			index = indexb[shape[14]] + indexw[shape[15]];
			weights_temp[offset + index] += value;
			
		
			offset += 6561*num_phase;
			//horizontal 3
			//上辺
			index = indexb[shape[16]] + indexw[shape[17]];
			weights_temp[offset + index] += value;
			//下辺
			index = indexb[shape[18]] + indexw[shape[19]];
			weights_temp[offset + index] += value;
			//右辺
			index = indexb[shape[20]] + indexw[shape[21]];
			weights_temp[offset + index] += value;
			//左辺
			index = indexb[shape[22]] + indexw[shape[23]];
			weights_temp[offset + index] += value;
		
		
			offset += 6561*num_phase;
			//horizontal 4
			//上辺
			index = indexb[shape[24]] + indexw[shape[25]];
			weights_temp[offset + index] += value;
			//下辺
			index = indexb[shape[26]] + indexw[shape[27]];
			weights_temp[offset + index] += value;
			//右辺
			index = indexb[shape[28]] + indexw[shape[29]];
			weights_temp[offset + index] += value;
			//左辺
			index = indexb[shape[30]] + indexw[shape[31]];
			weights_temp[offset + index] += value;
			
		
			offset += 6561*num_phase;
			//diagonal 8
			//右肩上がり
			index = indexb[shape[32]] + indexw[shape[33]];
			weights_temp[offset + index] += value;
			//右肩下がり
			index = indexb[shape[34]] + indexw[shape[35]];
			weights_temp[offset + index] += value;
			
			
			offset += 6561*num_phase;
			//corner 8
			//upper left
			index = indexb[shape[40]] + indexw[shape[41]];
			weights_temp[offset + index] += value;
			//upper right
			index = indexb[shape[42]] + indexw[shape[43]];
			weights_temp[offset + index] += value;
			//lower left
			index = indexb[shape[44]] + indexw[shape[45]];
			weights_temp[offset + index] += value;
			//lower right
			index = indexb[shape[46]] + indexw[shape[47]];
			weights_temp[offset + index] += value;
			
			
			offset += 6561*num_phase;
			//diagonal 7
			//upper left
			index = indexb[shape[48]] + indexw[shape[49]];
			weights_temp[offset + index] += value;
			//lower right
			index = indexb[shape[50]] + indexw[shape[51]];
			weights_temp[offset + index] += value;
			//lower left
			index = indexb[shape[52]] + indexw[shape[53]];
			weights_temp[offset + index] += value;
			//upper right
			index = indexb[shape[54]] + indexw[shape[55]];
			weights_temp[offset + index] += value;
		
			
			offset += 6561*num_phase;
			//diagonal 6
			//upper left
			index = indexb[shape[56]] + indexw[shape[57]];
			weights_temp[offset + index] += value;
			//lower right
			index = indexb[shape[58]] + indexw[shape[59]];
			weights_temp[offset + index] += value;
			//lower left
			index = indexb[shape[60]] + indexw[shape[61]];
			weights_temp[offset + index] += value;
			//upper right
			index = indexb[shape[62]] + indexw[shape[63]];
			weights_temp[offset + index] += value;
			
			
			offset += 6561*num_phase;
			//corner24
			//horizontal upper left
			index = indexb[shape[64]] + indexw[shape[65]];
			weights_temp[offset + index] += value;
			//horizontal lower left
			index = indexb[shape[66]] + indexw[shape[67]];
			weights_temp[offset + index] += value;
			//horizontal upper right
			index = indexb[shape[68]] + indexw[shape[69]];
			weights_temp[offset + index] += value;
			//horizontal lower right
			index = indexb[shape[70]] + indexw[shape[71]];
			weights_temp[offset + index] += value;
			//vertical upper left
			index = indexb[shape[72]] + indexw[shape[73]];
			weights_temp[offset + index] += value;
			//vertical lower left
			index = indexb[shape[74]] + indexw[shape[75]];
			weights_temp[offset + index] += value;
			//vertical upper right
			index = indexb[shape[76]] + indexw[shape[77]];
			weights_temp[offset + index] += value;
			//vertical lower right
			index = indexb[shape[78]] + indexw[shape[79]];
			weights_temp[offset + index] += value;
		}

	}
	
	return weights_temp;
};

const montecarlo = ()=>{
	selfPlay(5000);
	const w = trainEV();
	for(let i=0;i<w.length;i++){
		if(w[i]===0){
			continue;
		}
		ai.weights[i] = ai.weights[i]*0.7 + w[i]/5000*0.3;
	}
};