/*class Game_b {
	constructor(){
		this.depth = [2,4]
		this.mode = 'gameb';
		this.record = [new Board_b()];
		this.record[0].setBitBoard([8,268435456,16,134217728,1,4]);
		
		this.ai = new AI();
	}
	
	//重み,depth情報以外すべてリセット
	resetGame(){
		this.mode = 'gameb';
		this.record = [new Board_b()];
		this.render();
	}
	
	//最新のBoardを返す
	get now(){
		return this.record[0];
	}
	
	//ゲームを進行する
	play(e){
		
		const hand = [e<33? 1<<(32-e) : 0, e<33? 0 : 1<<(64-e)];
		const legalhand = this.now.legalHand([0, 0]);
		
		if(!(e===0)){//handle illegal hand
			if(!(legalhand[0]&hand[0])&&!(legalhand[1]&hand[1])){
				console.log(e);
				console.error("illegal hand");
				return;
			}
		}
		
		//思考中のタッチ操作を無効にする
		clickDisabled = true;

		const player_turn = ()=>{ return new Promise((resolve)=>{
			if(this.now.boardArray[4]===this.ai.colorOfCpu){
				resolve();
			}else{
				this.record.unshift(new Board_b(this.now.boardArray));
				this.now.placeAndTurnStones(hand);
				resolve();
			}
		});};
		
		const cpu_turn = ()=>{ return new Promise((resolve)=>{
			if(this.state===1){
				this.record.unshift(new Board_b(this.now.boardArray));
				const move = this.ai.cpuHand(this.now, -100, 100, true);
				this.now.put = move[0][3];
				console.log(move);
				this.now.placeAndTurnStones(move[0][1]);
				
			}else if(this.state===2){
				this.record.unshift(new Board_b(this.now.boardArray));
				this.now.boardArray[4] *= -1;
				resolve();
			}else{
				console.log('終局');
				resolve();
			}
			
			if(this.state===1){
				
				resolve();
			}else if(this.state===2){
				this.record.unshift(new Board_b(this.now.boardArray));
				this.now.boardArray[4] *= -1;
				this.play(0);
				
				resolve();
			}else{
				
				resolve();
			}
		});};
		
		const render = ()=>{
			return new Promise((resolve)=>{
				setTimeout(() => {
					resolve();
				}, 50);
				this.render();
				this.visualizeMove();
				this.visualizeLastPut();
			});
		};
		

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
	
	visualizeEvaluation(alpha=-100,beta=100){
		const evals = this.ai.cpuHand(this.now,true,alpha,beta);
		const d0 = evals[0][0];
		d3.select('#board').selectAll('text').remove();
		d3.select('#board').selectAll('text').data(evals).enter().append('text').attr({
			x:(d)=>{
				const x = d[1]%8===0 ? 7 : d[1]%8-1;
				return size/4+size*x+x+size/8;
			},
			y:(d)=>{
				const y = Math.ceil(d[1]/8)-1;
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
			const e = d[0] + '';
			const i = e.indexOf('.');
			if(i===-1){
				return e;
			}else{
				return e.slice(0,i+2);
			}
			return d[0] + "";
		});
	}
	
	visualizeMove(node=this.now){
		const legalhand = new Uint32Array(2);
		node.legalHand(legalhand);
		
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
	
	visualizeLastPut(put = this.now.put){
		if(put===0 || put===undefined){
			canvas.cpuput.attr("r",0);
			return;
		}
		const x = put%8===0 ? 7 : put%8-1;
		const y = Math.ceil(put/8)-1;
		canvas.cpuput.attr({
			cx:size/4+size*x+x+size/8,
			cy:size/4+size*y+y+size/8,
			r:size/12
		});

	}
	
	get state(){
		return this.now.state;
	}
	
	render(node=this.now){
		let black = 0;
		let white = 0;
		const b_ = node.board;
		const state = node.state;
		
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
		
		if(node.boardArray[4]!==this.ai.colorOfCpu){
			canvas.comment.text('player turn');
		}
		
		if(node.state===3){//終局
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
	
	//研究モード
	analysis(e){
		
		const hand1 = (e<33) ? 1 << (32-e) : 0;
		const hand2 = (e<33) ? 0 : 1 << (64-e);
		game.now.legalHand();
		const l1 = game.now.l1;
		const l2 = game.now.l2;
		
		if(e!==0){	
			if(!(l1&hand1)&&!(l2&hand2)){ //playerが置けない場所を触った
				console.log("illegal hand");
				return;
			}
		}
		
		if(game.state===3){
			return;
		}
		
		if(game.now.currentTurn===-1){
			canvas.bscorerect.attr('transform',()=>{
				return 'translate(' + size*0 + ',' + size*0 + ')';
			});
			canvas.wscorerect.attr('transform',()=>{
				return 'translate(' + size*2.5 + ',' + size*0 + ')';
			});
		}else{
			canvas.wscorerect.attr('transform',()=>{
				return 'translate(' + size*0 + ',' + size*0 + ')';
			});
			canvas.bscorerect.attr('transform',()=>{
				return 'translate(' + size*2.5 + ',' + size*0 + ')';
			});
		}
		
		game.now.placeAndTurnStones(hand1, hand2);
		
		if(game.state===1){
			
		}else if(game.state===2){
			game.currentTurn *= -1;
		}
		
		game.record.unshift(new Board_b(game.now));
		this.render();
		this.visualizeEvaluation();
		this.visualizeMove();
		
	}
	
	/////////////////
	//開発系
	getSelfPlayGame(){
		const nodes = [];
		this.record = [new Board_b([8,268435456,16,134217728,1,4])];
		//this.ai.colorOfCpu = 1;
		let state, move, c=0;
		
		while(true){
			state = this.now.state;
			
			if(state===1){
				this.record.unshift(new Board_b(this.now.boardArray));
				move = this.ai.cpuHand(this.now, -100, 100, false);
				const rand = ~~(Math.random()*Math.min(move.length, 2));
				for(let i=0;i<move.length;i++){
					nodes[c++] = move[i][2];
				}
				this.now.placeAndTurnStones(move[rand][1]);
				
			}else if(state===2){
				this.now.boardArray[4] *=-1;
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
		
		this.record = [new Board_b([8,268435456,16,134217728,1,4])];
		return nodes;
    }
    
    //ランダムな盤面を作るが、黒石を指定した個数にする
    generateNode(n=64, blk=-1){
        const black = blk===-1?~~(Math.random()*(n+1)) : Math.max(Math.min(blk,64), 0);
        const board = new Array(65);
        
        for(let i=1;i<65;i++){
            if(i<=black){
                board[i] = 1;
            }else{
                board[i] = -1;
            }
        }
        for(let i=1;i<65;i++){
            if(i>n){
                board[i] = 0;
            }
        }

        //shuffle
        for(let i=1;i<65;i++){
            const swapto = 1+~~(Math.random()*64);
            const temp = board[i];
            board[i] = board[swapto];
            board[swapto] = temp;
        }

        const b = new Board_b();
        b.setBoard = board;

        return b;
	}
	
}*/


class GRAPHIC extends AI {
	constructor(arg){
		super(arg);
	}

	render(node=-1){
		if(node===-1){
			node = this;
		}
		console.log(node);
		let black = 0;
		let white = 0;
		const b_ = node.board;
		const state = node.state;
		
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
		
		if(node.state===3){//終局
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

	visualizeEvaluation(alpha=-100,beta=100){
		const evals = this.cpuHand(this.now,true,alpha,beta);
		const d0 = evals[0][0];
		d3.select('#board').selectAll('text').remove();
		d3.select('#board').selectAll('text').data(evals).enter().append('text').attr({
			x:(d)=>{
				const x = d[1]%8===0 ? 7 : d[1]%8-1;
				return size/4+size*x+x+size/8;
			},
			y:(d)=>{
				const y = Math.ceil(d[1]/8)-1;
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
			const e = d[0] + '';
			const i = e.indexOf('.');
			if(i===-1){
				return e;
			}else{
				return e.slice(0,i+2);
			}
			return d[0] + "";
		});
	}
	
	visualizeMove(node=this.now){
		const legalhand = new Uint32Array(2);
		node.legalHand(legalhand);
		
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
	
	visualizeLastPut(put = this.now.put){
		if(put===0 || put===undefined){
			canvas.cpuput.attr("r",0);
			return;
		}
		const x = put%8===0 ? 7 : put%8-1;
		const y = Math.ceil(put/8)-1;
		canvas.cpuput.attr({
			cx:size/4+size*x+x+size/8,
			cy:size/4+size*y+y+size/8,
			r:size/12
		});

	}
}

class BOARD extends GRAPHIC{
	constructor(arg){
		super(arg);
	}
}



class MASTER extends BOARD {
	constructor(){
		super();
		this.mode = 'gameb';
		this.record = [new BOARD([8,268435456,16,134217728,1,4])];
		//this.render();
	}

	resetGame(){
		this.mode = 'gameb';
		this.record = [new BOARD([8,268435456,16,134217728,1,4])];
		this.render();
	}
	
	//最新のBoardを返す
	get now(){
		return this.record[0];
	}
	
	//ゲームを進行する
	play(e){
		
		const hand = [e<33? 1<<(32-e) : 0, e<33? 0 : 1<<(64-e)];
		const legalhand = this.now.legalHand([0, 0]);
		
		if(!(e===0)){//handle illegal hand
			if(!(legalhand[0]&hand[0])&&!(legalhand[1]&hand[1])){
				console.error(`error ${e} is illegal hand`);
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
				this.now.placeAndTurnStones(hand);
				resolve();
			}
		});};
		
		const cpu_turn = ()=>{ return new Promise((resolve)=>{
			if(this.state===1){
				this.record.unshift(new BOARD(this.now.boardArray));
				const move = this.now.cpuHand(-100, 100, true);
				this.now.put = move[0][3];
				console.log(move);
				this.now.placeAndTurnStones(move[0][1]);
				
			}else if(this.state===2){
				this.record.unshift(new BOARD(this.now.boardArray));
				this.now.boardArray[4] *= -1;
				resolve();
			}else{
				console.log('終局');
				resolve();
			}
			
			if(this.state===1){
				
				resolve();
			}else if(this.state===2){
				this.record.unshift(new BOARD(this.now.boardArray));
				this.now.boardArray[4] *= -1;
				this.play(0);
				
				resolve();
			}else{
				
				resolve();
			}
		});};
		
		const render = ()=>{
			return new Promise((resolve)=>{
				setTimeout(() => {
					resolve();
				}, 50);
				this.now.render();
				this.visualizeMove();
				this.visualizeLastPut();
			});
		};
		

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
		let state, move, c=0;
		
		while(true){
			state = history[0].state; //koko this.now.state;
			
			if(state===1){
				history.unshift(new BOARD(history[0].boardArray));
				move = history[0].cpuHand(history[0], -100, 100, false);
				const rand = ~~(Math.random()*Math.min(move.length, 2));
				for(let i=0;i<move.length;i++){
					nodes[c++] = new BOARD(move[i][2].boardArray);
					nodes[c-1].e = move[i][2].e;
				}
				history[0].placeAndTurnStones(move[rand][1]);
				
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
    generateNode(n=64, blk=-1){
        const black = blk===-1?~~(Math.random()*(n+1)) : Math.max(Math.min(blk,64), 0);
        const board = new Array(65);
        
        for(let i=1;i<65;i++){
            if(i<=black){
                board[i] = 1;
            }else{
                board[i] = -1;
            }
        }
        for(let i=1;i<65;i++){
            if(i>n){
                board[i] = 0;
            }
        }

        //shuffle
        for(let i=1;i<65;i++){
            const swapto = 1+~~(Math.random()*64);
            const temp = board[i];
            board[i] = board[swapto];
            board[swapto] = temp;
        }

        const b = new BOARD();
        b.setBoard = board;

        return b;
	}

}
const master = new MASTER();


//const master = new Game_b();


function randomhand(node){
	const legalhand = node.legalHand(new Uint32Array(2));

	let availble_place = 0;
	let no;

	for(let i=0;i<32;i++){
		if(legalhand[0]&(1<<i)){
			availble_place++;
		}
		if(legalhand[1]&(1<<i)){
			availble_place++;
		}
	}

	no = 1+~~(Math.random()*availble_place);

	for(let i=0;i<32;i++){
		if(legalhand[0]&(1<<i)){
			no--;
			if(no===0){
				legalhand[0] = 1<<i;
				legalhand[1] = 0;
				break;
			}
		}
		if(legalhand[1]&(1<<i)){
			no--;
			if(no===0){
				legalhand[0] = 0;
				legalhand[1] = 1<<i;
				break;
			}
		}
	}

	
		const start = performance.now();
		while(true){
			if(performance.now()-start>0){
				break;
			}
		}
		
	return legalhand;
}

