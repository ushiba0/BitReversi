
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
		d3.select('#board').selectAll('text').remove();
		
		//石の数をカウント
		for(let i=1;i<65;i++){
			if(b_[i]===1){
				black++;
			}else if(b_[i]===-1){
				white++;
			}
		}
		
		for(let i=1;i<65;i++){
			if(b_[i]===1){
				canvas.circles[i].attr({
						r:size*4/10,
						fill:"#292929",
						stroke:"#292929",
						"stroke-width":1
				});
			}else if(b_[i]===-1){
				canvas.circles[i].attr({
						r:size*4/10,
						fill:"#ffffff",
						stroke:"#a0a0a0",
						"stroke-width":1
				});
			}else{
				canvas.circles[i].attr({
						r:		0,
						fill:	"none",
						"stroke-width":0
				});
			}
		}
		
		canvas.bscore.text(black + "");
		canvas.wscore.text(white + "");
		
		if(node.boardArray[4]!==this.colorOfCpu){
			canvas.comment.text('player turn');
		}
		
		if(node.state()===3){//終局
			if(black > white){
				canvas.comment.text('black win');
			}else if(black < white){
				canvas.comment.text('white win');
			}else{
				canvas.comment.text('draw');
			}
			
			return;
		}
	}

	visualizeEvaluation(node=0, alpha=-100,beta=100, depth=-1){
		if(!node){
			node = this.now;
		}
		
		const search_depth = (depth===-1)?
		(this.depth[1]>=64-node.boardArray[5] ? -1 : this.depth[0])
		: depth;
		console.log(search_depth);
		const evals = ai.cpuHand(node, alpha, beta, search_depth);
		if(evals[0]===undefined){
			return;
		}
		const d0 = evals[0][0];
		d3.select('#board').selectAll('text').remove();
		d3.select('#board').selectAll('text').data(evals).enter().append('text').attr({
			x:(d)=>{
				const hand = d.hand;
				let put = 0;
				if(hand[0]<0){put = 1;}
				else if(hand[0]>0){put = 32-Math.log2(hand[0]);}
				if(hand[1]<0){put = 33;}
				else if(hand[1]>0){put = 64-Math.log2(hand[1]);}
				const x = put%8===0 ? 7 : put%8-1;
				return size/4+size*x+x+size/8;
			},
			y:(d)=>{
				const hand = d.hand;
				let put = 0;
				if(hand[0]<0){put = 1;}
				else if(hand[0]>0){put = 32-Math.log2(hand[0]);}
				if(hand[1]<0){put = 33;}
				else if(hand[1]>0){put = 64-Math.log2(hand[1]);}
				const y = Math.ceil(put/8)-1;
				return size/4+size*y+y+size/8+size/6;
			},
			fill:(d,i)=>{
				if(i===0){return 'red';}
				if(d0===d[0]){return 'red';}
				return 'black';
			}
		})
		.style('font-size', '10px')
		.text((d)=>{
			return d.e.toPrecision(3);
		});
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
				canvas.circles[i].attr({
					r:size/10,
					fill:"#ff69e1"//4169e1
				});
			}
		}
	}
	
	visualizeLastPut(node){
		if(!node){
			node = this.now;
		}
		if(!Array.isArray(node.hand)){
			canvas.cpuput.attr("r",0);
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
		canvas.cpuput.attr({
			cx:size/4+size*x+x+size/8,
			cy:size/4+size*y+y+size/8,
			r:size/12
		});

	}
}



class MASTER extends GRAPHIC {
	constructor(){
		super();
		this.mode = 'gameb';
		this.record = [new BOARD([8, 268435456, 16, 134217728, 1, 4])];
	}

	resetGame(){
		this.mode = 'gameb';
		this.record = [new BOARD([8, 268435456, 16, 134217728, 1, 4])];
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
				this.record.unshift(new BOARD(this.now.boardArray));
				this.now.placeAndTurnStones(hand1, hand2);
				resolve();
			}
		});};
		
		const cpu_turn = ()=>{ return new Promise((resolve)=>{
			if(this.now.state()===1){
				this.record.unshift(new BOARD(this.now.boardArray));
				const search_depth = this.depth[1]>=64-this.now.boardArray[5] ? -1 : this.depth[0]; 
				const move = ai.cpuHand(this.now, -100, 100, search_depth,true);
				this.now.placeAndTurnStones(...move[0].hand);
				this.now.hand = move[0].hand;
			}else if(this.now.state()===2){
				this.record.unshift(new BOARD(this.now.boardArray));
				this.now.boardArray[4] *= -1;
				resolve();
			}else{
				console.log('終局');
				resolve();
			}
			
			if(this.now.state()===1){
				resolve();
			}else if(this.now.state()===2){
				this.record.unshift(new BOARD(this.now.boardArray));
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
		const history = [new BOARD([8,268435456,16,134217728,1,4])];
		let c=0;
		
		while(true){
			const state = history[0].state();
			
			if(state===1){
				history.unshift(new BOARD(history[0].boardArray));
				const move = ai.cpuHand(history[0], -100, 100, 4);
				const rand = ~~(Math.random()*Math.min(move.length, 2));
				for(let i=0;i<move.length;i++){
					nodes[c] = new BOARD(move[i].boardArray);
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
    
    //ランダムな盤面を作るが、黒石を指定した個数にする
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