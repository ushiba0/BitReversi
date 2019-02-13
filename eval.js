class WEIGHTS_MANAGER extends CONSTANTS {
	constructor(){
		super();
		this.buffer = new ArrayBuffer(6561*this.num_phase*this.num_shape);
		this.weights = new Int8Array(this.buffer);
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
        const that = this;//koko
        const func = function(){
			const newarr = new Int8Array(that.buffer);
			for(let i=0;i<that.buffer.byteLength;i++){
				newarr[i] = d2p.array[i] - 128;
			}
            that.weights = newarr;
        }
        const d2p = new data2png();
        d2p.selectPng(func);
	}
	
	loadPng(){
		const that = this;
		const func = function(){
			const newarr = new Int8Array(that.buffer);
			for(let i=0;i<that.buffer.byteLength;i++){
				newarr[i] = d2p.array[i] - 128;
			}
			that.weights = newarr;
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
		this.buffer = weights_manager.buffer;
		this.weights = new Int8Array(this.buffer);

		this.temp_weights;
        
		//index table
		this.indexb = new Uint16Array(256);
		this.indexw = new Uint16Array(256);
		for(let i=0;i<256;i++){
			this.indexb[i] = parseInt(parseInt(i.toString(2),10)*2,3);
			this.indexw[i] = this.indexb[i]/2;
		}

		//koko
		this.weights[0] = 123;
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
		let index=0;
		const num_shape = this.num_shape;
		const num_phase = this.num_phase;
		const phase = Math.min(Math.max(10, board.stones-4), 60);
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
	
	selfTraining(s=0,n1=0,n2=n1){
		const othello = new MASTER();
		let count = 0, loss = 0;
		
		if(n1===0 && n2===0){
			n1 = 4;
			n2 = 64;
		}else{
			const a = ~~n1;
			const b = ~~n2;
			n1 = Math.min(a,b);
			n2 = Math.max(a,b);
		}

		this.int2float();
		
		const startTime = performance.now();
		while(true){
			const list = othello.generateGame();
			for(let j=0;j<list.length;j++){
				if(list[j].stones>=n1 && list[j].stones<=n2){
					const node = list[j];
					const node1 = node;
					const node2 = this.rotateBoard(node1);
					const node3 = this.rotateBoard(node2);
					const node4 = this.rotateBoard(node3);
					const node5 = this.flipBoard(node1);
					const node6 = this.rotateBoard(node5);
					const node7 = this.rotateBoard(node6);
					const node8 = this.rotateBoard(node7);
					
					const true_value = node.e;
					const pred_value = this.evaluation(node1._board8array);
					
					this.updateWeights(node1._board8array, true_value);
					this.updateWeights(node2._board8array, true_value);
					this.updateWeights(node3._board8array, true_value);
					this.updateWeights(node4._board8array, true_value);
					this.updateWeights(node5._board8array, true_value);
					this.updateWeights(node6._board8array, true_value);
					this.updateWeights(node7._board8array, true_value);
					this.updateWeights(node8._board8array, true_value);
		
					loss += Math.pow(true_value-pred_value, 2);
					count++;
				}
			}
			
			const endTime = performance.now();
			if(endTime-startTime>s){ break; }
		}

		this.float2int();
		console.log(`complete ${count} trainings\nloss ${Math.sqrt(loss/count).toPrecision(4)}`);
    }

    train(s=0, n=64, depth=-1){
        const reversi = new MASTER();
        let count = 0;
		let loss = 0;
		this.int2float();
		//////////////////

        const startTime = performance.now();
		while(true){
			const node1 = reversi.generateNode(n);
			const node2 = this.rotateBoard(node1);
			const node3 = this.rotateBoard(node2);
			const node4 = this.rotateBoard(node3);
			const node5 = this.flipBoard(node1);
			const node6 = this.rotateBoard(node5);
			const node7 = this.rotateBoard(node6);
			const node8 = this.rotateBoard(node7);
			
			const true_value = ai.negaScout(node1, -64, 64, depth);
			const pred_value = this.evaluation(node1._board8array);
			const value = true_value;
            
			this.updateWeights(node1._board8array, value);
			this.updateWeights(node2._board8array, value);
			this.updateWeights(node3._board8array, value);
			this.updateWeights(node4._board8array, value);
			this.updateWeights(node5._board8array, value);
			this.updateWeights(node6._board8array, value);
			this.updateWeights(node7._board8array, value);
			this.updateWeights(node8._board8array, value);

			loss += Math.pow(true_value-pred_value, 2);
			count++;
			
			// determine end
			const endTime = performance.now();
			if(endTime-startTime>s){break;}
		}

		//////////////////
		this.float2int();

		console.log(`stones: ${n}\ncomplete ${count} trainings\nloss ${Math.sqrt(loss/count).toPrecision(4)}`);
		
	}

	trainAll(s=5000,depth=2){
		for(let n=52;n>4;n--){
			this.train(s, n, depth);
		}
	}

	flipBoard(node){
		const reverse = (x)=>{
			x = ((x&0b10101010)>>>1) | ((x&0b01010101)<<1);
			x = ((x&0b11001100)>>>2) | ((x&0b00110011)<<2);
			x = ((x&0b11110000)>>>4) | ((x&0b00001111)<<4);
			return x;
		};
		
		const black1 = node.black1;
		const black2 = node.black2;
		const white1 = node.white1;
		const white2 = node.white2;
		
		const b0 = reverse((black1>>>24) & 0xff);
		const b1 = reverse((black1>>>16) & 0xff);
		const b2 = reverse((black1>>>8) & 0xff);
		const b3 = reverse((black1>>>0) & 0xff);
		const b4 = reverse((black2>>>24) & 0xff);
		const b5 = reverse((black2>>>16) & 0xff);
		const b6 = reverse((black2>>>8) & 0xff);
		const b7 = reverse((black2>>>0) & 0xff);
		const w0 = reverse((white1>>>24) & 0xff);
		const w1 = reverse((white1>>>16) & 0xff);
		const w2 = reverse((white1>>>8) & 0xff);
		const w3 = reverse((white1>>>0) & 0xff);
		const w4 = reverse((white2>>>24) & 0xff);
		const w5 = reverse((white2>>>16) & 0xff);
		const w6 = reverse((white2>>>8) & 0xff);
		const w7 = reverse((white2>>>0) & 0xff);

		const newNode = new BOARD(node);
		
		newNode.black1 = (b0<<24)|(b1<<16)|(b2<<8)|b3;
		newNode.black2 = (b4<<24)|(b5<<16)|(b6<<8)|b7;
		newNode.white1 = (w0<<24)|(w1<<16)|(w2<<8)|w3;
		newNode.white2 = (w4<<24)|(w5<<16)|(w6<<8)|w7;

		return board;
	}

	rotateBoard(node){
		const reverse = (x)=>{
			x = ((x&0b10101010)>>>1) | ((x&0b01010101)<<1);
			x = ((x&0b11001100)>>>2) | ((x&0b00110011)<<2);
			x = ((x&0b11110000)>>>4) | ((x&0b00001111)<<4);
			return x;
		};

		const b = new Array();
		const w = new Array();
		const black1 = node.black1;
		const black2 = node.black2;
		const white1 = node.white1;
		const white2 = node.white2;
	
		b[0] = (black1>>>24)&0xff;
		b[1] = (black1>>>16)&0xff;
		b[2] = (black1>>>8)&0xff;
		b[3] = (black1>>>0)&0xff;
		b[4] = (black2>>>24)&0xff;
		b[5] = (black2>>>16)&0xff;
		b[6] = (black2>>>8)&0xff;
		b[7] = (black2>>>0)&0xff;
		w[0] = (white1>>>24)&0xff;
		w[1] = (white1>>>16)&0xff;
		w[2] = (white1>>>8)&0xff;
		w[3] = (white1>>>0)&0xff;
		w[4] = (white2>>>24)&0xff;
		w[5] = (white2>>>16)&0xff;
		w[6] = (white2>>>8)&0xff;
		w[7] = (white2>>>0)&0xff;
		let b1 = 0, b2 = 0, w1 = 0, w2 = 0;
		let lineb, linew;

		//vertical
		lineb = ((b[0]&128)>>>0)|((b[1]&128)>>>1)|((b[2]&128)>>>2)|((b[3]&128)>>>3)|((b[4]&128)>>>4)|((b[5]&128)>>>5)|((b[6]&128)>>>6)|((b[7]&128)>>>7);
		linew = ((w[0]&128)>>>0)|((w[1]&128)>>>1)|((w[2]&128)>>>2)|((w[3]&128)>>>3)|((w[4]&128)>>>4)|((w[5]&128)>>>5)|((w[6]&128)>>>6)|((w[7]&128)>>>7);
		b1 |= reverse(lineb)<<24; w1 |= reverse(linew)<<24;
		lineb = ((b[0]&64)<<1)|((b[1]&64)>>>0)|((b[2]&64)>>>1)|((b[3]&64)>>>2)|((b[4]&64)>>>3)|((b[5]&64)>>>4)|((b[6]&64)>>>5)|((b[7]&64)>>>6);
		linew = ((w[0]&64)<<1)|((w[1]&64)>>>0)|((w[2]&64)>>>1)|((w[3]&64)>>>2)|((w[4]&64)>>>3)|((w[5]&64)>>>4)|((w[6]&64)>>>5)|((w[7]&64)>>>6);
		b1 |= reverse(lineb)<<16; w1 |= reverse(linew)<<16;
		lineb = ((b[0]&32)<<2)|((b[1]&32)<<1)|((b[2]&32)>>>0)|((b[3]&32)>>>1)|((b[4]&32)>>>2)|((b[5]&32)>>>3)|((b[6]&32)>>>4)|((b[7]&32)>>>5);
		linew = ((w[0]&32)<<2)|((w[1]&32)<<1)|((w[2]&32)>>>0)|((w[3]&32)>>>1)|((w[4]&32)>>>2)|((w[5]&32)>>>3)|((w[6]&32)>>>4)|((w[7]&32)>>>5);
		b1 |= reverse(lineb)<<8; w1 |= reverse(linew)<<8;
		lineb = ((b[0]&16)<<3)|((b[1]&16)<<2)|((b[2]&16)<<1)|((b[3]&16)>>>0)|((b[4]&16)>>>1)|((b[5]&16)>>>2)|((b[6]&16)>>>3)|((b[7]&16)>>>4);
		linew = ((w[0]&16)<<3)|((w[1]&16)<<2)|((w[2]&16)<<1)|((w[3]&16)>>>0)|((w[4]&16)>>>1)|((w[5]&16)>>>2)|((w[6]&16)>>>3)|((w[7]&16)>>>4);
		b1 |= reverse(lineb); w1 |= reverse(linew);
		lineb = ((b[0]&8)<<4)|((b[1]&8)<<3)|((b[2]&8)<<2)|((b[3]&8)<<1)|((b[4]&8)>>>0)|((b[5]&8)>>>1)|((b[6]&8)>>>2)|((b[7]&8)>>>3);
		linew = ((w[0]&8)<<4)|((w[1]&8)<<3)|((w[2]&8)<<2)|((w[3]&8)<<1)|((w[4]&8)>>>0)|((w[5]&8)>>>1)|((w[6]&8)>>>2)|((w[7]&8)>>>3);
		b2 |= reverse(lineb)<<24; w2 |= reverse(linew)<<24;
		lineb = ((b[0]&4)<<5)|((b[1]&4)<<4)|((b[2]&4)<<3)|((b[3]&4)<<2)|((b[4]&4)<<1)|((b[5]&4)>>>0)|((b[6]&4)>>>1)|((b[7]&4)>>>2);
		linew = ((w[0]&4)<<5)|((w[1]&4)<<4)|((w[2]&4)<<3)|((w[3]&4)<<2)|((w[4]&4)<<1)|((w[5]&4)>>>0)|((w[6]&4)>>>1)|((w[7]&4)>>>2);
		b2 |= reverse(lineb)<<16; w2 |= reverse(linew)<<16;
		lineb = ((b[0]&2)<<6)|((b[1]&2)<<5)|((b[2]&2)<<4)|((b[3]&2)<<3)|((b[4]&2)<<2)|((b[5]&2)<<1)|((b[6]&2)>>>0)|((b[7]&2)>>>1);
		linew = ((w[0]&2)<<6)|((w[1]&2)<<5)|((w[2]&2)<<4)|((w[3]&2)<<3)|((w[4]&2)<<2)|((w[5]&2)<<1)|((w[6]&2)>>>0)|((w[7]&2)>>>1);
		b2 |= reverse(lineb)<<8; w2 |= reverse(linew)<<8;
		lineb = ((b[0]&1)<<7)|((b[1]&1)<<6)|((b[2]&1)<<5)|((b[3]&1)<<4)|((b[4]&1)<<3)|((b[5]&1)<<2)|((b[6]&1)<<1)|((b[7]&1)>>>0);
		linew = ((w[0]&1)<<7)|((w[1]&1)<<6)|((w[2]&1)<<5)|((w[3]&1)<<4)|((w[4]&1)<<3)|((w[5]&1)<<2)|((w[6]&1)<<1)|((w[7]&1)>>>0);
		b2 |= reverse(lineb); w2 |= reverse(linew);

		const newNode = new BOARD(node);
		newNode.black1 = b1;
		newNode.black2 = b2;
		newNode.white1 = w1;
		newNode.white2 = w2;

		return newNode;
	}
	
    int2float(){
		this.temp_weights = this.weights;
		this.weights = new Float32Array(6561*this.num_phase*this.num_shape);
		this.weights.set(this.temp_weights);
	}
	
	float2int(){
		const newarr = new Int8Array(this.buffer);
		for(let i=0;i<6561*this.num_phase*this.num_shape;i++){
			newarr[i] = Math.max(Math.min(127, this.weights[i]), -128);
		}
        this.weights = newarr;
    }

    //weightsを切り出す
    sliceweights(shape=0, phase=0){
        return this.weights.slice(6561*(this.num_phase*shape + phase), 6561*(this.num_phase*shape + phase + 1));
    }
	
}