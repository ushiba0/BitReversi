// しくみ
// 


class GRAPHIC extends CONSTANTS{
	constructor(){
		super();
	}

	render(node=this.now){
		
		let black = 0;
		let white = 0;
		const board = node.board;
		
		//評価値を消す
		for(let value of squares){
			value.className = '';
		}
		
		//石の数をカウント
		for(let i=1;i<65;i++){
			if(board[i]===1){
				black++;
			}else if(board[i]===-1){
				white++;
			}
		}
		
		//石を置く
		for(let i=1;i<65;i++){
			if(board[i]===1){
				circles[i-1].className = 'black';
			}else if(board[i]===-1){
				circles[i-1].className = 'white';	
			}else{
				circles[i-1].className = 'blank';
			}
		}
		
		black_score.innerText = black + '';
		white_score.innerText = white + '';
		
		if(node.turn!==this.colorOfCpu){
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
	
	showEval(node=this.now, alpha=-100,beta=100, depth=-1){
		
		const search_depth = (depth===-1)?
			(this.depth[1]>=64-node.stones ? -1 : this.depth[0]):
			depth;
		const evals = ai.cpuHand(node, alpha, beta, search_depth);

		if(evals.length===0){
			return;
		}

		// delete former evels
		for(const element of circles){
			element.innerText = '';
		}

		for(const node of evals){
			const hand = node.hand;
			let put = 0;
			if(hand[0]<0){
				put = 0;
			}else if(hand[0]>0){
				put = 31-Math.log2(hand[0]);
			}
			if(hand[1]<0){
				put = 32;
			}else if(hand[1]>0){
				put = 63-Math.log2(hand[1]);
			}

			circles[put].innerText = node.e;
			if(node.e>0){
				circles[put].className = 'eval_plus';
				circles[put].innerText = (node.e + '').slice(0, 5);
			}else{
				circles[put].className = 'eval_minus';
				circles[put].innerText = (node.e + '').slice(0, 5);
			}
		}
		
		return;
	}
	
	showMove(node=this.now){

		let [move1, move2] = node.getMove();
		const board = new Array();
		
		for(let i=0;i<65;i++){
			board[i] = 0;
		}
		
		for(let i=32;i>0;i--){
			if(move1&1 === 1){
				board[i] = 1;
			}
			move1 = move1 >>> 1;
		}
		for(let i=64;i>32;i--){
			if(move2&1 === 1){
				board[i] = 1;
			}
			move2 = move2 >>> 1;
		}
		
		for(let i=1;i<65;i++){
			if(board[i]===1){
				squares[i-1].className = 'legal';
			}else{
				squares[i-1].className = '';
			}
		}
	}
	
	showHand(node=this.now){
		// this.nowにhandプロパティがなかったら
		if(node.hand1===0 && node.hand2===0){
			for(let i=0;i<64;i++){
				if(squares[i].className==='lastput'){
					squares[i].className==='';
				}
			}
			return;
		}

		let x, y;
		if(node.hand1<0){
			y = 0;
			x = 0;
		}else if(node.hand1>0){
			const e = 31 - Math.log2(node.hand1);
			y = ~~(e/8);
			x = e%8;
		}
		if(node.hand2<0){
			y = 4;
			x = 0;
		}else if(node.hand2>0){
			const e = 63 - Math.log2(node.hand2);
			y = ~~(e/8);
			x = e%8;
		}
		
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
		return this.record[this.record.length - 1];
	}
	
	//ゲームを進行する
	play(hand1=0, hand2=0){
		
		const [move1, move2] = this.now.getMove();
		
		if(!(hand1===0 && hand2===0)){//handle illegal hand
			if(!(move1&hand1)&&!(move2&hand2)){
				console.error(`error (${hand1}, ${hand2}) is illegal hand`);
				return;
			}
		}
		
		//思考中のタッチ操作を無効にする
		clickDisabled = true;

		const player_turn = ()=>{ return new Promise((resolve)=>{
			if(this.now.turn===this.colorOfCpu){
				resolve();
			}else{
				const newNode = this.now.putStone(hand1, hand2);
				this.record.push(newNode);
				this.now.hand1 = hand1;
				this.now.hand2 = hand2;
				resolve();
			}
		});};
		
		const cpu_turn = ()=>{ return new Promise((resolve)=>{
			if(this.now.state()===1){
				const search_depth = this.depth[1]>=64-this.now.stones ? -1 : this.depth[0]; 
				const move = ai.cpuHand(this.now, -100, 100, search_depth, true);
				this.record.push(move[0]);
			}else if(this.now.state()===2){
				const hand1 = this.now.hand1;
				const hand2 = this.now.hand2;
				this.record.push(new BOARD(this.now));
				this.now.turn *= -1;
				this.now.hand1 = hand1;
				this.now.hand2 = hand2;
				resolve();
			}else{
				console.log('終局');
				resolve();
			}
			
			if(this.now.state()===1){
				resolve();
			}else if(this.now.state()===2){
				const hand1 = this.now.hand1;
				const hand2 = this.now.hand2;
				this.record.push(new BOARD(this.now));
				this.now.turn *= -1;
				this.now.hand1 = hand1;
				this.now.hand2 = hand2;
				this.play();
				resolve();
			}else{
				resolve();
			}
		});};
		
		const render = ()=>{ return new Promise((resolve)=>{
			setTimeout(() => {
				resolve();
			}, 50);
			this.render(this.now);
			this.showMove(this.now);
			this.showHand(this.now);
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
				history[0].putStone(...move[rand].hand);
			}else if(state===2){
				history[0].turn *=-1;
			}else{
				break;
			}
		}
			
		for(let i=0;i<nodes.length;i++){
			nodes[i].e *= -1;
			if(nodes[i].turn===-1){
				nodes[i].swap();
				nodes[i].turn = 1;
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
				const depth = node_now.stones>60? -6 : 0;
				const move = ai.cpuHand(node_now, -100, 100, depth);
				const index = Math.random()<random_rate ? Math.floor(Math.random()*move.length) : 0;
				const next_move = move[index];
				const next_node = new BOARD(next_move);
				next_node.e = -next_move.e;
				nodes.push(next_node);
				node_now.putStone(...next_move.hand);
			}else if(state===2){
				node_now.turn *=-1;
			}else{
				break;
			}
		}
		return nodes;
	}
    
    generateNode(N=64){
		const n = ~~Math.max(Math.min(64, N), 4);
		let node_now = new BOARD();
		
		while(true){
			if(node_now.stones===n){
				//node_now.turn = 1;
				return node_now;
			}
			
			const state = node_now.state();

			if(state===1){
				const moves = ai.cpuHand(node_now, -100, 100, 2);
				const key = Math.random()<0.01 ? ~~(Math.random()*moves.length) : 0;
				node_now = node_now.putStone(moves[key].hand1, moves[key].hand2)
			}else if(state===2){
				node_now.turn *= -1;
			}else{
				if(node_now.stones===n){
					node_now.turn = 1;
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
			if(node.turn===-1){
				node.swap();
				node.e *= -1;
			}
			node.e = value * node.turn;

			node.turn = 1;
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
		const phase = Math.min(Math.max(10, node.stones-4), 60);

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

const calcLoss = (N=200)=>{
	let s_2 = 0;
	for(let i=0;i<N;i++){
		const node = master.generateNode(~~(Math.random()*6) + 58);
		const true_value = ai.negaScout(node, -1, 1, -1, 0);
		const pred_value = ai.evaluation(node);
		const sgn_true_value = true_value>0? 1 : (true_value<0? -1 : 0);
		const sgn_pred_value = pred_value>0? 1 : (pred_value<0? -1 : 0);

		s_2 += (sgn_pred_value-sgn_true_value)**2;
	}

	return s_2/N;
};

const montecarlo = (num_iter=5)=>{

	for(let iter=0;iter<num_iter;iter++){
		const start_time = performance.now();
		
		const N = 5000;
		selfPlay(N);
		const w = trainEV();
		for(let i=0;i<w.length;i++){
			if(w[i]===0){
				continue;
			}
			ai.weights[i] = ai.weights[i]*0.9 + w[i]/N*0.1;
		}

		const loss = calcLoss();
		const end_time = performance.now();
		const time = (end_time-start_time)/1000;
		console.log(`epoch: ${iter+1}\nloss: ${loss.toPrecision(4)}\ntime: ${time.toPrecision(4)}`);
	}
};