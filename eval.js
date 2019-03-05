class WEIGHTS_MANAGER{
	constructor(){
		
		const c = new CONSTANTS;
		const buffer = new ArrayBuffer(6561*c.num_phase*c.num_shape);

		this.buffer = buffer;
		this.weights = new Int8Array(buffer);
	}

	exportPng(){
        const d2p = new data2png();
		d2p.width = 6561/3;
		const newarr = new Uint8ClampedArray(this.weights.length);
		for(let i=0;i<this.weights.length;i++){
			newarr[i] = this.weights[i] + 128;
		}
        d2p.toPng(newarr);
	}

	selectPng(){
        const func = ()=>{
			const newarr = new Int8Array(this.buffer);
			for(let i=0;i<this.buffer.byteLength;i++){
				newarr[i] = d2p.array[i] - 128;
			}
            this.weights = newarr;
        }
        const d2p = new data2png();
        d2p.selectPng(func);
	}
	
	loadPng(){
		const func = ()=>{
			const newarr = new Int8Array(this.buffer);
			for(let i=0;i<this.buffer.byteLength;i++){
				newarr[i] = d2p.array[i] - 128;
			}
			this.weights = newarr;
		};
        const d2p = new data2png();
		d2p.loadPng('weights.png', func);
	}
}
const weights_manager = new WEIGHTS_MANAGER();
weights_manager.loadPng();




class EV extends CONSTANTS {
	constructor(){
		super();
		
		this.weights = weights_manager.weights;
		this.temp_weights;
        
		// generate index table
		this.indexb = new Uint16Array(256);
		this.indexw = new Uint16Array(256);
		for(let i=0;i<256;i++){
			this.indexb[i] = parseInt(parseInt(i.toString(2),10)*2,3);
			this.indexw[i] = this.indexb[i]/2;
		}
	}
	
	//

	evaluation(board){
	
		const shape = board.shape();
		let index = 0, score = 0;
		
		const num_shape = this.num_shape;
		const num_phase = this.num_phase;
		const weights = this.weights;
		const indexb = this.indexb;
		const indexw = this.indexw;
		const phase = Math.min(Math.max(10, board.stones-4), 60);
		
		let start = 0;
	
		start = 6561*phase;
		//horizontal 1
		//上辺
		index = indexb[shape[0]] + indexw[shape[1]];
		score += weights[start + index];
		//下辺
		index = indexb[shape[2]] + indexw[shape[3]];
		score += weights[start + index];
		//右辺
		index = indexb[shape[4]] + indexw[shape[5]];
		score += weights[start + index];
		//左辺
		index = indexb[shape[6]] + indexw[shape[7]];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//horizontal 2
		//上辺
		index = indexb[shape[8]] + indexw[shape[9]];
		score += weights[start + index];
		//下辺
		index = indexb[shape[10]] + indexw[shape[11]];
		score += weights[start + index];
		//右辺
		index = indexb[shape[12]] + indexw[shape[13]];
		score += weights[start + index];
		//左辺
		index = indexb[shape[14]] + indexw[shape[15]];
		score += weights[start + index];
		
	
		start += 6561*num_phase;
		//horizontal 3
		//上辺
		index = indexb[shape[16]] + indexw[shape[17]];
		score += weights[start + index];
		//下辺
		index = indexb[shape[18]] + indexw[shape[19]];
		score += weights[start + index];
		//右辺
		index = indexb[shape[20]] + indexw[shape[21]];
		score += weights[start + index];
		//左辺
		index = indexb[shape[22]] + indexw[shape[23]];
		score += weights[start + index];
		
	
		start += 6561*num_phase;
		//horizontal 4
		//上辺
		index = indexb[shape[24]] + indexw[shape[25]];
		score += weights[start + index];
		//下辺
		index = indexb[shape[26]] + indexw[shape[27]];
		score += weights[start + index];
		//右辺
		index = indexb[shape[28]] + indexw[shape[29]];
		score += weights[start + index];
		//左辺
		index = indexb[shape[30]] + indexw[shape[31]];
		score += weights[start + index];
		
	
		start += 6561*num_phase;
		//diagonal 8
		//右肩上がり
		index = indexb[shape[32]] + indexw[shape[33]];
		score += weights[start + index];
		//右肩下がり
		index = indexb[shape[34]] + indexw[shape[35]];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//corner 8
		//upper left
		index = indexb[shape[40]] + indexw[shape[41]];
		score += weights[start + index];
		//upper right
		index = indexb[shape[42]] + indexw[shape[43]];
		score += weights[start + index];
		//lower left
		index = indexb[shape[44]] + indexw[shape[45]];
		score += weights[start + index];
		//lower right
		index = indexb[shape[46]] + indexw[shape[47]];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//diagonal 7
		//upper left
		index = indexb[shape[48]] + indexw[shape[49]];
		score += weights[start + index];
		//lower right
		index = indexb[shape[50]] + indexw[shape[51]];
		score += weights[start + index];
		//lower left
		index = indexb[shape[52]] + indexw[shape[53]];
		score += weights[start + index];
		//upper right
		index = indexb[shape[54]] + indexw[shape[55]];
		score += weights[start + index];
	
		
		start += 6561*num_phase;
		//diagonal 6
		//upper left
		index = indexb[shape[56]] + indexw[shape[57]];
		score += weights[start + index];
		//lower right
		index = indexb[shape[58]] + indexw[shape[59]];
		score += weights[start + index];
		//lower left
		index = indexb[shape[60]] + indexw[shape[61]];
		score += weights[start + index];
		//upper right
		index = indexb[shape[62]] + indexw[shape[63]];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//corner24
		//horizontal upper left
		index = indexb[shape[64]] + indexw[shape[65]];
		score += weights[start + index];
		//horizontal lower left
		index = indexb[shape[66]] + indexw[shape[67]];
		score += weights[start + index];
		//horizontal upper right
		index = indexb[shape[68]] + indexw[shape[69]];
		score += weights[start + index];
		//horizontal lower right
		index = indexb[shape[70]] + indexw[shape[71]];
		score += weights[start + index];
		//vertical upper left
		index = indexb[shape[72]] + indexw[shape[73]];
		score += weights[start + index];
		//vertical lower left
		index = indexb[shape[74]] + indexw[shape[75]];
		score += weights[start + index];
		//vertical upper right
		index = indexb[shape[76]] + indexw[shape[77]];
		score += weights[start + index];
		//vertical lower right
		index = indexb[shape[78]] + indexw[shape[79]];
		score += weights[start + index];
		
		
		if(isNaN(score)){
			throw 'error score is NaN';
		}
		
		return score/16;
	}
	
	updateWeights(board, e){

		const shape = board.shape();
		const weights = this.weights;
		const indexb = this.indexb;
		const indexw = this.indexw;
		const num_shape = this.num_shape;
		const num_phase = this.num_phase;
		const phase = Math.min(Math.max(10, board.stones-4), 60);
		let index=0;
		let start = 0;
		
	
		//accurate evaluation of this node
		const y = e;
		//predicted evaluation of this node
		const W = this.evaluation(board);
		//delta
		const delta = (y - W)*this.learning_rate;
		
	
		start = 6561*phase;
		//horizontal 1
		//上辺
		index = indexb[shape[0]] + indexw[shape[1]];
		weights[start + index] += delta;
		//下辺
		index = indexb[shape[2]] + indexw[shape[3]];
		weights[start + index] += delta;
		//右辺
		index = indexb[shape[4]] + indexw[shape[5]];
		weights[start + index] += delta;
		//左辺
		index = indexb[shape[6]] + indexw[shape[7]];
		weights[start + index] += delta;
		
		
		start += 6561*num_phase;
		//horizontal 2
		//上辺
		index = indexb[shape[8]] + indexw[shape[9]];
		weights[start + index] += delta;
		//下辺
		index = indexb[shape[10]] + indexw[shape[11]];
		weights[start + index] += delta;
		//右辺
		index = indexb[shape[12]] + indexw[shape[13]];
		weights[start + index] += delta;
		//左辺
		index = indexb[shape[14]] + indexw[shape[15]];
		weights[start + index] += delta;
		
	
		start += 6561*num_phase;
		//horizontal 3
		//上辺
		index = indexb[shape[16]] + indexw[shape[17]];
		weights[start + index] += delta;
		//下辺
		index = indexb[shape[18]] + indexw[shape[19]];
		weights[start + index] += delta;
		//右辺
		index = indexb[shape[20]] + indexw[shape[21]];
		weights[start + index] += delta;
		//左辺
		index = indexb[shape[22]] + indexw[shape[23]];
		weights[start + index] += delta;
	
	
		start += 6561*num_phase;
		//horizontal 4
		//上辺
		index = indexb[shape[24]] + indexw[shape[25]];
		weights[start + index] += delta;
		//下辺
		index = indexb[shape[26]] + indexw[shape[27]];
		weights[start + index] += delta;
		//右辺
		index = indexb[shape[28]] + indexw[shape[29]];
		weights[start + index] += delta;
		//左辺
		index = indexb[shape[30]] + indexw[shape[31]];
		weights[start + index] += delta;
		
	
		start += 6561*num_phase;
		//diagonal 8
		//右肩上がり
		index = indexb[shape[32]] + indexw[shape[33]];
		weights[start + index] += delta;
		//右肩下がり
		index = indexb[shape[34]] + indexw[shape[35]];
		weights[start + index] += delta;
		
		
		start += 6561*num_phase;
		//corner 8
		//upper left
		index = indexb[shape[40]] + indexw[shape[41]];
		weights[start + index] += delta;
		//upper right
		index = indexb[shape[42]] + indexw[shape[43]];
		weights[start + index] += delta;
		//lower left
		index = indexb[shape[44]] + indexw[shape[45]];
		weights[start + index] += delta;
		//lower right
		index = indexb[shape[46]] + indexw[shape[47]];
		weights[start + index] += delta;
		
		
		start += 6561*num_phase;
		//diagonal 7
		//upper left
		index = indexb[shape[48]] + indexw[shape[49]];
		weights[start + index] += delta;
		//lower right
		index = indexb[shape[50]] + indexw[shape[51]];
		weights[start + index] += delta;
		//lower left
		index = indexb[shape[52]] + indexw[shape[53]];
		weights[start + index] += delta;
		//upper right
		index = indexb[shape[54]] + indexw[shape[55]];
		weights[start + index] += delta;
	
		
		start += 6561*num_phase;
		//diagonal 6
		//upper left
		index = indexb[shape[56]] + indexw[shape[57]];
		weights[start + index] += delta;
		//lower right
		index = indexb[shape[58]] + indexw[shape[59]];
		weights[start + index] += delta;
		//lower left
		index = indexb[shape[60]] + indexw[shape[61]];
		weights[start + index] += delta;
		//upper right
		index = indexb[shape[62]] + indexw[shape[63]];
		weights[start + index] += delta;
		
		
		start += 6561*num_phase;
		//corner24
		//horizontal upper left
		index = indexb[shape[64]] + indexw[shape[65]];
		weights[start + index] += delta;
		//horizontal lower left
		index = indexb[shape[66]] + indexw[shape[67]];
		weights[start + index] += delta;
		//horizontal upper right
		index = indexb[shape[68]] + indexw[shape[69]];
		weights[start + index] += delta;
		//horizontal lower right
		index = indexb[shape[70]] + indexw[shape[71]];
		weights[start + index] += delta;
		//vertical upper left
		index = indexb[shape[72]] + indexw[shape[73]];
		weights[start + index] += delta;
		//vertical lower left
		index = indexb[shape[74]] + indexw[shape[75]];
		weights[start + index] += delta;
		//vertical upper right
		index = indexb[shape[76]] + indexw[shape[77]];
		weights[start + index] += delta;
		//vertical lower right
		index = indexb[shape[78]] + indexw[shape[79]];
		weights[start + index] += delta;
		
	}
	
	trainAll(s=0, n1=0, n2=n1){
		const c = new CONSTANTS;
		let count = 0, loss = 0;
		
		//最小値と最大値を整える
		if(n1===0 && n2===0){
			n1 = 4;
			n2 = 64;
		}else{
			const a = ~~n1;
			const b = ~~n2;
			n1 = Math.min(a,b);
			n2 = Math.max(a,b);
		}

		// 重みを入れ替え
		const temp = this.weights;
		this.weights = new Float32Array(6561*c.num_phase*c.num_shape);
		this.weights.set(temp);
		
		const startTime = performance.now();
		while(true){
			const list = develop.getSelfPlayGame();
			for(const node of list){
				if(node.stones>=n1 && node.stones<=n2){
					const nodes = new Array(8);
					nodes[0] = node;
					nodes[1] = nodes[0].rotate();
					nodes[2] = nodes[1].rotate();
					nodes[3] = nodes[2].rotate();
					nodes[4] = nodes[0].flip();
					nodes[5] = nodes[4].rotate();
					nodes[6] = nodes[5].rotate();
					nodes[7] = nodes[6].rotate();

					for(const node_ of nodes){
						this.updateWeights(node_, node_.e);
					}

					const true_value = node.e;
					const pred_value = this.evaluation(node);
		
					loss += Math.pow(true_value-pred_value, 2);
					count++;
				}
			}

			const endTime = performance.now();
			if(endTime-startTime>s){ break; }
		}

		for(let i=0;i<this.weights.length;i++){
			if(this.weights===0){
				continue;
			}
			this.weights[i] = Math.min(Math.max(this.weights[i], -128), 127);
		}
		temp.set(this.weights);
		this.weights = temp;
		console.log(`complete ${count} trainings\nloss ${Math.sqrt(loss/count).toPrecision(4)}`);
	}
	
	trainOne(s=0, n=64){
		
		const c = new CONSTANTS;
		let count = 0, loss = 0;
		
		// 重みを入れ替え
		const temp = this.weights;
		this.weights = new Float32Array(6561*c.num_phase*c.num_shape);
		this.weights.set(temp);
		
		//最小値と最大値を整える
		n = ~~Math.min(Math.max(n, 4), 64);
		
		const startTime = performance.now();
		while(true){
			const node = develop.generateNode(n);
			const nodes = new Array(8);
			nodes[0] = node;
			nodes[1] = nodes[0].rotate();
			nodes[2] = nodes[1].rotate();
			nodes[3] = nodes[2].rotate();
			nodes[4] = nodes[0].flip();
			nodes[5] = nodes[4].rotate();
			nodes[6] = nodes[5].rotate();
			nodes[7] = nodes[6].rotate();

			const true_value = node.negaAlpha(-100, 100, -1);
			const pred_value = this.evaluation(node);

			for(const node_ of nodes){
				this.updateWeights(node_, true_value);
			}
			
			loss += Math.pow(true_value - pred_value, 2);
			count++;

			const endTime = performance.now();
			if(endTime - startTime>s){ break; }
		}

		/*let ccccc=0;
		for(let i=0;i<diff.length;i++){
			if(diff[i]!==0){
				if(Math.random()<0.01){console.log(i, diff[i]);}
				ccccc++;
			}
		}
		console.log(`ccccccc is ${ccccc}`)*/
		for(let i=0;i<this.weights.length;i++){
			if(this.weights===0){
				continue;
			}
			this.weights[i] = Math.min(Math.max(this.weights[i], -128), 127);
		}
		temp.set(this.weights);
		this.weights = temp;
		console.log(`complete ${count} trainings\nloss ${Math.sqrt(loss/count).toPrecision(4)}`);
	}
}