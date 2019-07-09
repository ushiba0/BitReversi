
class GRAPHIC {
	constructor(){}

	render(node=this.now){
		
		let black = 0;
		let white = 0;
		const board = node.board;
		
		//評価値を消す
		for(let value of display.circles){
			value.innerText = '';
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
				display.circles[i-1].className = 'black';
			}else if(board[i]===-1){
				display.circles[i-1].className = 'white';	
			}else{
				display.circles[i-1].className = 'blank';
			}
		}
		
		display.black_score.innerText = black + '';
		display.white_score.innerText = white + '';
		
		if(node.turn!==property.colorOfCpu){
			display.comment.innerText = 'player turn';
		}
		
		if(node.state()===3){//終局
			if(black > white){
				display.comment.innerText = 'black win';
			}else if(black < white){
				display.comment.innerText = 'white win';
			}else{
				display.comment.innerText = 'draw';
			}
			
			return;
		}
	}
	
	showEval(node=this.now, alpha=-100,beta=100, depth=-1){
		
		const search_depth = (depth===-1)?
			(c.depth1>=64-node.stones ? -1 : c.depth0):
			depth;
		const evals = ai.cpuHand(node, alpha, beta, search_depth);

		if(evals.length===0){
			return;
		}

		// delete former evels
		for(const element of display.circles){
			element.innerText = '';
		}

		for(const node of evals){
			let put = 0;
			if(node.hand1<0){
				put = 0;
			}else if(node.hand1>0){
				put = 31-Math.log2(node.hand1);
			}
			if(node.hand2<0){
				put = 32;
			}else if(node.hand2>0){
				put = 63-Math.log2(node.hand2);
			}

			display.circles[put].innerText = node.e;
			if(node.e>0){
				display.circles[put].className = 'eval_plus';
				display.circles[put].innerText = (node.e + '').slice(0, 5);
			}else{
				display.circles[put].className = 'eval_minus';
				display.circles[put].innerText = (node.e + '').slice(0, 5);
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
				display.squares[i-1].className = 'legal';
			}else{
				display.squares[i-1].className = '';
			}
		}
	}
	
	showHand(node=this.now){
		// this.nowにhandプロパティがなかったら
		if(node.hand1===0 && node.hand2===0){
			for(let i=0;i<64;i++){
				if(display.squares[i].className==='lastput'){
					display.squares[i].className==='';
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
		
		display.squares[y*8+x].className = 'lastput';
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
	async play(hand1=0, hand2=0){
		const [move1, move2] = this.now.getMove();
		//handle illegal hand
		if(!(hand1===0 && hand2===0)){
			if(!(move1&hand1)&&!(move2&hand2)){
				console.error(`error (${hand1}, ${hand2}) is illegal hand`);
				return;
			}
		}

		const player_turn = ()=>{
			return new Promise(resolve=>{
				if(this.now.turn!==property.colorOfCpu){
					const newNode = this.now.putStone(hand1, hand2);
					newNode.hand1 = hand1;
					newNode.hand2 = hand2;
					this.record.push(newNode);
				}
				resolve();
			});
		};
		
		const cpu_turn = ()=>{
			return new Promise((resolve, reject)=>{
				if(this.now.state()===1){
					const search_depth = property.depth1>=64-this.now.stones ? -1 : property.depth0;
					display.switch.innerText = "102";
					try{ai.cpuHand(this.now, -100, 100, search_depth, true)}catch(e){
						document.write(e)
					}
					const move = ai.cpuHand(this.now, -100, 100, search_depth, true);
					display.switch.innerText = "103";
					this.record.push(move[0]);
				}
				if(this.now.state()===2){
					const newNode = new BOARD(this.now);
					newNode.hand1 = this.now.hand1;
					newNode.hand2 = this.now.hand2;
					newNode.turn *= -1;
					this.record.push(newNode);
					if(this.now.turn===property.colorOfCpu){
						property.player_state_pass = true;
						display.pass.classList.add("pass_availble");
						window.stop();
					}
				}
				resolve();
			});
		};
		
		const render = ()=>{
			return new Promise((resolve)=>{
				this.render(this.now);
				this.showMove(this.now);
				this.showHand(this.now);
				setTimeout(() => {
					resolve();
				}, 50);
			});
		};
		
		await player_turn();
		await render();
		await cpu_turn();
		display.switch.innerText = "cpu turn executed";
		await render();
		
		return;
	}
}
const master = new MASTER();



class DEVELOP extends MASTER{
    constructor(){
        super();
    }


    getSelfPlayGame(){
		const nodes = [];
		const history = [new BOARD()];
		let c = 0;
		
		while(true){
            const state = history.slice(-1)[0].state();
			
			if(state===1){
                const now = history.slice(-1)[0];
				const move = ai.cpuHand(now, -100, 100, 4);
				const rand = ~~(Math.random()*Math.min(move.length, 2));
                const child = now.putStone(move[rand].hand1, move[rand].hand2);
                history.push(child);
                
				for(let i=0;i<move.length;i++){
                    nodes.push(move[i]);
                }
			}else if(state===2){
				history.slice(-1)[0].turn *= -1;
			}else{
				break;
			}
		}
			
		for(let i=0;i<nodes.length;i++){
			nodes[i].e *= -1;
			if(nodes[i].turn===-1){
				nodes[i] = nodes[i].swap();
			}
		}
		
		return nodes;
    }
    
    generateNode(N=64){
		const n = Math.max(Math.min(64, ~~N), 4);
		let node_now = new BOARD();
		
		while(true){
			if(node_now.stones===n){
                node_now.turn = 1;
				return node_now;
			}
			
			const state = node_now.state();

			if(state===1){
				const moves = ai.cpuHand(node_now, -100, 100, 1);
				const key = Math.random()<0.05 ? ~~(Math.random()*moves.length) : 0;
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
const develop = new DEVELOP;


const p = ()=>{
	return new Promise((resolve, reject)=>{
		reject("reject");
	})
}

const afunc = async ()=>{
	const res = await p();
	console.log(res);
}