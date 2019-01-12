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
    
		const boardArray = board.boardArray;
		
		const b0 = (boardArray[0]>>>24) & 0xff;
		const b1 = (boardArray[0]>>>16) & 0xff;
		const b2 = (boardArray[0]>>>8) & 0xff;
		const b3 = (boardArray[0]>>>0) & 0xff;
		const b4 = (boardArray[1]>>>24) & 0xff;
		const b5 = (boardArray[1]>>>16) & 0xff;
		const b6 = (boardArray[1]>>>8) & 0xff;
		const b7 = (boardArray[1]>>>0) & 0xff;
		const w0 = (boardArray[2]>>>24) & 0xff;
		const w1 = (boardArray[2]>>>16) & 0xff;
		const w2 = (boardArray[2]>>>8) & 0xff;
		const w3 = (boardArray[2]>>>0) & 0xff;
		const w4 = (boardArray[3]>>>24) & 0xff;
		const w5 = (boardArray[3]>>>16) & 0xff;
		const w6 = (boardArray[3]>>>8) & 0xff;
		const w7 = (boardArray[3]>>>0) & 0xff;
	
	
		let lineb = 0, linew = 0, index = 0, score = 0;
		
		const num_shape = this.num_shape;
		const num_phase = this.num_phase;
		const weights = this.weights;
		const indexb = this.indexb;
		const indexw = this.indexw;
		const phase = Math.min(Math.max(0, boardArray[5]-4+10), 60);
		
		let start = 0;
	
		start = 6561*phase;
		//horizontal 1
		//上辺
		index = indexb[b0] + indexw[w0];
		score += weights[start + index];
		//下辺
		index = indexb[b7] + indexw[w7];
		score += weights[start + index];
		//右辺
		lineb = ((b7&1)<<0)|((b6&1)<<1)|((b5&1)<<2)|((b4&1)<<3)|((b3&1)<<4)|((b2&1)<<5)|((b1&1)<<6)|((b0&1)<<7);
		linew = ((w7&1)<<0)|((w6&1)<<1)|((w5&1)<<2)|((w4&1)<<3)|((w3&1)<<4)|((w2&1)<<5)|((w1&1)<<6)|((w0&1)<<7);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//左辺
		lineb = ((b7&128)<<0)|((b6&128)<<1)|((b5&128)<<2)|((b4&128)<<3)|((b3&128)<<4)|((b2&128)<<5)|((b1&128)<<6)|((b0&128)<<7);
		linew = ((w7&128)<<0)|((w6&128)<<1)|((w5&128)<<2)|((w4&128)<<3)|((w3&128)<<4)|((w2&128)<<5)|((w1&128)<<6)|((w0&128)<<7);
		index = indexb[lineb>>>7] + indexw[linew>>>7];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//horizontal 2
		//上辺
		index = indexb[b1] + indexw[w1];
		score += weights[start + index];
		//下辺
		index = indexb[b6] + indexw[w6];
		score += weights[start + index];
		//右辺
		lineb = ((b7&2)<<0)|((b6&2)<<1)|((b5&2)<<2)|((b4&2)<<3)|((b3&2)<<4)|((b2&2)<<5)|((b1&2)<<6)|((b0&2)<<7);
		linew = ((w7&2)<<0)|((w6&2)<<1)|((w5&2)<<2)|((w4&2)<<3)|((w3&2)<<4)|((w2&2)<<5)|((w1&2)<<6)|((w0&2)<<7);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		score += weights[start + index];
		//左辺
		lineb = ((b7&64)<<0)|((b6&64)<<1)|((b5&64)<<2)|((b4&64)<<3)|((b3&64)<<4)|((b2&64)<<5)|((b1&64)<<6)|((b0&64)<<7);
		linew = ((w7&64)<<0)|((w6&64)<<1)|((w5&64)<<2)|((w4&64)<<3)|((w3&64)<<4)|((w2&64)<<5)|((w1&64)<<6)|((w0&64)<<7);
		index = indexb[lineb>>>6] + indexw[linew>>>6];
		score += weights[start + index];
		
	
		start += 6561*num_phase;
		//horizontal 3
		//上辺
		index = indexb[b2] + indexw[w2];
		score += weights[start + index];
		//下辺
		index = indexb[b5] + indexw[w5];
		score += weights[start + index];
		//右辺
		lineb = ((b7&4)<<0)|((b6&4)<<1)|((b5&4)<<2)|((b4&4)<<3)|((b3&4)<<4)|((b2&4)<<5)|((b1&4)<<6)|((b0&4)<<7);
		linew = ((w7&4)<<0)|((w6&4)<<1)|((w5&4)<<2)|((w4&4)<<3)|((w3&4)<<4)|((w2&4)<<5)|((w1&4)<<6)|((w0&4)<<7);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		score += weights[start + index];
		//左辺
		lineb = ((b7&32)<<0)|((b6&32)<<1)|((b5&32)<<2)|((b4&32)<<3)|((b3&32)<<4)|((b2&32)<<5)|((b1&32)<<6)|((b0&32)<<7);
		linew = ((w7&32)<<0)|((w6&32)<<1)|((w5&32)<<2)|((w4&32)<<3)|((w3&32)<<4)|((w2&32)<<5)|((w1&32)<<6)|((w0&32)<<7);
		index = indexb[lineb>>>5] + indexw[linew>>>5];
		score += weights[start + index];
	
	
		start += 6561*num_phase;
		//horizontal 4
		//上辺
		index = indexb[b3] + indexw[w3];
		score += weights[start + index];
		//下辺
		index = indexb[b4] + indexw[w4];
		score += weights[start + index];
		//右辺
		lineb = ((b7&8)<<0)|((b6&8)<<1)|((b5&8)<<2)|((b4&8)<<3)|((b3&8)<<4)|((b2&8)<<5)|((b1&8)<<6)|((b0&8)<<7);
		linew = ((w7&8)<<0)|((w6&8)<<1)|((w5&8)<<2)|((w4&8)<<3)|((w3&8)<<4)|((w2&8)<<5)|((w1&8)<<6)|((w0&8)<<7);
		index = indexb[lineb>>>3] + indexw[linew>>>3];
		score += weights[start + index];
		//左辺
		lineb = ((b7&16)<<0)|((b6&16)<<1)|((b5&16)<<2)|((b4&16)<<3)|((b3&16)<<4)|((b2&16)<<5)|((b1&16)<<6)|((b0&16)<<7);
		linew = ((w7&16)<<0)|((w6&16)<<1)|((w5&16)<<2)|((w4&16)<<3)|((w3&16)<<4)|((w2&16)<<5)|((w1&16)<<6)|((w0&16)<<7);
		index = indexb[lineb>>>4] + indexw[linew>>>4];
		score += weights[start + index];
		
	
		start += 6561*num_phase;
		//diagonal 8
		//右肩上がり
		lineb = (b7&128)|(b6&64)|(b5&32)|(b4&16)|(b3&8)|(b2&4)|(b1&2)|(b0&1);
		linew = (w7&128)|(w6&64)|(w5&32)|(w4&16)|(w3&8)|(w2&4)|(w1&2)|(w0&1);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//右肩下がり
		lineb = (b7&1)|(b6&2)|(b5&4)|(b4&8)|(b3&16)|(b2&32)|(b1&64)|(b0&128);
		linew = (w7&1)|(w6&2)|(w5&4)|(w4&8)|(w3&16)|(w2&32)|(w1&64)|(w0&128);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//corner 8
		//upper left
		lineb = ((b0&128))|((b1&128)>>>1)|((b0&64)>>>1)|((b2&128)>>>3)|((b1&64)>>>3)|((b0&32)>>>3)|((b3&128)>>>6)|((b0&16)>>>4);
		linew = ((w0&128))|((w1&128)>>>1)|((w0&64)>>>1)|((w2&128)>>>3)|((w1&64)>>>3)|((w0&32)>>>3)|((w3&128)>>>6)|((w0&16)>>>4);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//upper right
		lineb = ((b0&1)<<7)|((b1&1)<<6)|((b0&2)<<4)|((b2&1)<<4)|((b1&2)<<2)|((b0&4)<<0)|((b3&1)<<1)|((b0&8)>>>3);
		linew = ((w0&1)<<7)|((w1&1)<<6)|((w0&2)<<4)|((w2&1)<<4)|((w1&2)<<2)|((w0&4)<<0)|((w3&1)<<1)|((w0&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//lower left
		lineb = ((b7&128))|((b6&128)>>>1)|((b7&64)>>>1)|((b5&128)>>>3)|((b6&64)>>>3)|((b7&32)>>>3)|((b4&128)>>>6)|((b7&16)>>>4);
		linew = ((w7&128))|((w6&128)>>>1)|((w7&64)>>>1)|((w5&128)>>>3)|((w6&64)>>>3)|((w7&32)>>>3)|((w4&128)>>>6)|((w7&16)>>>4);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//lower right
		lineb = ((b7&1)<<7)|((b6&1)<<6)|((b7&2)<<4)|((b5&1)<<4)|((b6&2)<<2)|((b7&4)<<0)|((b4&1)<<1)|((b7&8)>>>3);
		linew = ((w7&1)<<7)|((w6&1)<<6)|((w7&2)<<4)|((w5&1)<<4)|((w6&2)<<2)|((w7&4)<<0)|((w4&1)<<1)|((w7&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//diagonal 7
		//upper left
		lineb = (b6&128)|(b5&64)|(b4&32)|(b3&16)|(b2&8)|(b1&4)|(b0&2);
		linew = (w6&128)|(w5&64)|(w4&32)|(w3&16)|(w2&8)|(w1&4)|(w0&2);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		score += weights[start + index];
		//lower right
		lineb = (b1&1)|(b2&2)|(b3&4)|(b4&8)|(b5&16)|(b6&32)|(b7&64);
		linew = (w1&1)|(w2&2)|(w3&4)|(w4&8)|(w5&16)|(w6&32)|(w7&64);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//lower left
		lineb = (b1&128)|(b2&64)|(b3&32)|(b4&16)|(b5&8)|(b6&4)|(b7&2);
		linew = (w1&128)|(w2&64)|(w3&32)|(w4&16)|(w5&8)|(w6&4)|(w7&2);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		score += weights[start + index];
		//upper right
		lineb = (b6&1)|(b5&2)|(b4&4)|(b3&8)|(b2&16)|(b1&32)|(b0&64);
		linew = (w1&1)|(w2&2)|(w3&4)|(w4&8)|(w5&16)|(w6&32)|(w7&64);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
	
		
		start += 6561*num_phase;
		//diagonal 6
		//upper left
		lineb = (b5&128)|(b4&64)|(b3&32)|(b2&16)|(b1&8)|(b0&4);
		linew = (w5&128)|(w4&64)|(w3&32)|(w2&16)|(w1&8)|(w0&4);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		score += weights[start + index];
		//lower right
		lineb = (b2&1)|(b3&2)|(b4&4)|(b5&8)|(b6&16)|(b7&32);
		linew = (w2&1)|(w3&2)|(w4&4)|(w5&8)|(w6&16)|(w7&32);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//lower left
		lineb = (b2&128)|(b3&64)|(b4&32)|(b5&16)|(b6&8)|(b7&4);
		linew = (w2&128)|(w3&64)|(w4&32)|(w5&16)|(w6&8)|(w7&4);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		score += weights[start + index];
		//upper right
		lineb = (b5&1)|(b4&2)|(b3&4)|(b2&8)|(b1&16)|(b0&32);
		linew = (w5&1)|(w4&2)|(w3&4)|(w2&8)|(w1&16)|(w0&32);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//corner24
		//horizontal upper left
		lineb = (b0&0xf0)|((b1&0xf)>>>4);
		linew = (w0&0xf0)|((w1&0xf)>>>4);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//horizontal lower left
		lineb = (b7&0xf0)|((b6&0xf)>>>4);
		linew = (w7&0xf0)|((w6&0xf)>>>4);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//horizontal upper right
		lineb = ((b0&1)<<7)|((b0&2)<<5)|((b0&4)<<3)|((b0&8)<<1)|((b1&1)<<3)|((b1&2)<<1)|((b1&4)>>>1)|((b1&8)>>>3);
		linew = ((w0&1)<<7)|((w0&2)<<5)|((w0&4)<<3)|((w0&8)<<1)|((w1&1)<<3)|((w1&2)<<1)|((w1&4)>>>1)|((w1&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//horizontal lower right
		lineb = ((b7&1)<<7)|((b7&2)<<5)|((b7&4)<<3)|((b7&8)<<1)|((b6&1)<<3)|((b6&2)<<1)|((b6&4)>>>1)|((b6&8)>>>3);
		linew = ((w7&1)<<7)|((w7&2)<<5)|((w7&4)<<3)|((w7&8)<<1)|((w6&1)<<3)|((w6&2)<<1)|((w6&4)>>>1)|((w6&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//vertical upper left
		lineb = ((b0&128)>>>0)|((b1&128)>>>1)|((b2&128)>>>2)|((b3&128)>>>3)|((b0&64)>>>3)|((b1&64)>>>4)|((b2&64)>>>5)|((b3&64)>>>6);
		linew = ((w0&128)>>>0)|((w1&128)>>>1)|((w2&128)>>>2)|((w3&128)>>>3)|((w0&64)>>>3)|((w1&64)>>>4)|((w2&64)>>>5)|((w3&64)>>>6);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//vertical lower left
		lineb = ((b7&128)>>>0)|((b6&128)>>>1)|((b5&128)>>>2)|((b4&128)>>>3)|((b7&64)>>>3)|((b6&64)>>>4)|((b5&64)>>>5)|((b4&64)>>>6);
		linew = ((w7&128)>>>0)|((w6&128)>>>1)|((w5&128)>>>2)|((w4&128)>>>3)|((w7&64)>>>3)|((w6&64)>>>4)|((w5&64)>>>5)|((w4&64)>>>6);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//vertical upper right
		lineb = ((b0&1)<<7)|((b1&1)<<6)|((b2&1)<<5)|((b3&1)<<4)|((b0&2)<<2)|((b1&2)<<1)|((b2&2)<<0)|((b3&2)>>>1);
		linew = ((w0&1)<<7)|((w1&1)<<6)|((w2&1)<<5)|((w3&1)<<4)|((w0&2)<<2)|((w1&2)<<1)|((w2&2)<<0)|((w3&2)>>>1);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//vertical lower right
		lineb = ((b7&1)<<7)|((b6&1)<<6)|((b5&1)<<5)|((b4&1)<<4)|((b7&2)<<2)|((b6&2)<<1)|((b5&2)<<0)|((b4&2)>>>1);
		linew = ((w7&1)<<7)|((w6&1)<<6)|((w5&1)<<5)|((w4&1)<<4)|((w7&2)<<2)|((w6&2)<<1)|((w5&2)<<0)|((w4&2)>>>1);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		
		
		if(isNaN(score)){
			throw 'error score is NaN';
		}
		
		return score/16;
	}
	
	updateWeights(board8Array, e){
		//b1 b2 w1 w2
		const b8 = board8Array;
		const weights = this.weights;
		const indexb = this.indexb;
		const indexw = this.indexw;
		let lineb=0, linew=0, index=0;
		const num_shape = this.num_shape;
		const num_phase = this.num_phase;
		const phase = Math.min(Math.max(0, b8[20]-4+10), 60);
		let start = 0;
		
	
		//accurate evaluation of this node
		const y = e;
		//predicted evaluation of this node
		const W = this.evaluation(board8Array);
		//delta
		const delta = (y - W)*this.learning_rate;
		

		function reverse(line){//lineを逆転
			line = ((line&0b01010101)<<1) | ((line&0b10101010)>>>1);
			line = ((line&0b00110011)<<2) | ((line&0b11001100)>>>2);
			line = ((line&0b00001111)<<4) | ((line&0b11110000)>>>4);
			return line;
		}
	
	
	
		start = 6561*phase;
		//horizontal 1
		//上辺
		index = indexb[b8[3 ]] + indexw[b8[11]];
		weights[start + index] += delta;
		//index = indexb[reverse(b8[3 ])] + indexw[reverse(b8[11])];
		//weights[start + index] += delta;
		//下辺
		index = indexb[b8[4 ]] + indexw[b8[12]];
		weights[start + index] += delta;
		//index = indexb[reverse(b8[ 4])] + indexw[reverse(b8[12])];
		//weights[start + index] += delta;
		//右辺
		lineb = ((b8[4 ]&1)<<0)|((b8[5 ]&1)<<1)|((b8[6 ]&1)<<2)|((b8[7 ]&1)<<3)|((b8[0 ]&1)<<4)|((b8[1 ]&1)<<5)|((b8[2 ]&1)<<6)|((b8[3 ]&1)<<7);
		linew = ((b8[12]&1)<<0)|((b8[13]&1)<<1)|((b8[14]&1)<<2)|((b8[15]&1)<<3)|((b8[8 ]&1)<<4)|((b8[9 ]&1)<<5)|((b8[10]&1)<<6)|((b8[11]&1)<<7);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta;
		//左辺
		lineb = ((b8[4 ]&128)<<0)|((b8[5 ]&128)<<1)|((b8[6 ]&128)<<2)|((b8[7 ]&128)<<3)|((b8[0 ]&128)<<4)|((b8[1 ]&128)<<5)|((b8[2 ]&128)<<6)|((b8[3 ]&128)<<7);
		linew = ((b8[12]&128)<<0)|((b8[13]&128)<<1)|((b8[14]&128)<<2)|((b8[15]&128)<<3)|((b8[8 ]&128)<<4)|((b8[9 ]&128)<<5)|((b8[10]&128)<<6)|((b8[11]&128)<<7);
		index = indexb[lineb>>>7] + indexw[linew>>>7];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb>>>7)] + indexw[reverse(linew>>>7)];
		//weights[start + index] += delta;
		
	
		start += 6561*num_phase;
		//horizontal 2
		//上辺
		index = indexb[b8[2 ]] + indexw[b8[10]];
		weights[start + index] += delta;
		//index = indexb[reverse(b8[2 ])] + indexw[reverse(b8[10])];
		//weights[start + index] += delta;
		//下辺
		index = indexb[b8[5 ]] + indexw[b8[13]];
		weights[start + index] += delta;
		//index = indexb[reverse(b8[5 ])] + indexw[reverse(b8[13])];
		//weights[start + index] += delta;
		//右辺
		lineb = ((b8[4 ]&2)<<0)|((b8[5 ]&2)<<1)|((b8[6 ]&2)<<2)|((b8[7 ]&2)<<3)|((b8[0 ]&2)<<4)|((b8[1 ]&2)<<5)|((b8[2 ]&2)<<6)|((b8[3 ]&2)<<7);
		linew = ((b8[12]&2)<<0)|((b8[13]&2)<<1)|((b8[14]&2)<<2)|((b8[15]&2)<<3)|((b8[8 ]&2)<<4)|((b8[9 ]&2)<<5)|((b8[10]&2)<<6)|((b8[11]&2)<<7);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb>>>1)] + indexw[reverse(linew>>>1)];
		//weights[start + index] += delta;
		//左辺
		lineb = ((b8[4 ]&64)<<0)|((b8[5 ]&64)<<1)|((b8[6 ]&64)<<2)|((b8[7 ]&64)<<3)|((b8[0 ]&64)<<4)|((b8[1 ]&64)<<5)|((b8[2 ]&64)<<6)|((b8[3 ]&64)<<7);
		linew = ((b8[12]&64)<<0)|((b8[13]&64)<<1)|((b8[14]&64)<<2)|((b8[15]&64)<<3)|((b8[8 ]&64)<<4)|((b8[9 ]&64)<<5)|((b8[10]&64)<<6)|((b8[11]&64)<<7);
		index = indexb[lineb>>>6] + indexw[linew>>>6];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb>>>6)] + indexw[reverse(linew>>>6)];
		//weights[start + index] += delta;
		
		
		start += 6561*num_phase;
		//horizontal 3
		//上辺
		index = indexb[b8[1 ]] + indexw[b8[9 ]];
		weights[start + index] += delta;
		//index = indexb[reverse(b8[1 ])] + indexw[reverse(b8[9 ])];
		//weights[start + index] += delta;
		//下辺
		index = indexb[b8[6 ]] + indexw[b8[14]];
		weights[start + index] += delta;
		//index = indexb[reverse(b8[6 ])] + indexw[reverse(b8[14])];
		//weights[start + index] += delta;
		//右辺
		lineb = ((b8[4 ]&4)<<0)|((b8[5 ]&4)<<1)|((b8[6 ]&4)<<2)|((b8[7 ]&4)<<3)|((b8[0 ]&4)<<4)|((b8[1 ]&4)<<5)|((b8[2 ]&4)<<6)|((b8[3 ]&4)<<7);
		linew = ((b8[12]&4)<<0)|((b8[13]&4)<<1)|((b8[14]&4)<<2)|((b8[15]&4)<<3)|((b8[8 ]&4)<<4)|((b8[9 ]&4)<<5)|((b8[10]&4)<<6)|((b8[11]&4)<<7);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb>>>2)] + indexw[reverse(linew>>>2)];
		//weights[start + index] += delta;
		//左辺
		lineb = ((b8[4 ]&32)<<0)|((b8[5 ]&32)<<1)|((b8[6 ]&32)<<2)|((b8[7 ]&32)<<3)|((b8[0 ]&32)<<4)|((b8[1 ]&32)<<5)|((b8[2 ]&32)<<6)|((b8[3 ]&32)<<7);
		linew = ((b8[12]&32)<<0)|((b8[13]&32)<<1)|((b8[14]&32)<<2)|((b8[15]&32)<<3)|((b8[8 ]&32)<<4)|((b8[9 ]&32)<<5)|((b8[10]&32)<<6)|((b8[11]&32)<<7);
		index = indexb[lineb>>>5] + indexw[linew>>>5];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb>>>5)] + indexw[reverse(linew>>>5)];
		//weights[start + index] += delta;
		
	
		start += 6561*num_phase;
		//horizontal 4
		//上辺
		index = indexb[b8[0 ]] + indexw[b8[8 ]];
		weights[start + index] += delta;
		//index = indexb[reverse(b8[0 ])] + indexw[reverse(b8[8 ])];
		//weights[start + index] += delta;
		//下辺
		index = indexb[b8[7 ]] + indexw[b8[15]];
		weights[start + index] += delta;
		//index = indexb[reverse(b8[7 ])] + indexw[reverse(b8[15])];
		//weights[start + index] += delta;
		//右辺
		lineb = ((b8[4 ]&8)<<0)|((b8[5 ]&8)<<1)|((b8[6 ]&8)<<2)|((b8[7 ]&8)<<3)|((b8[0 ]&8)<<4)|((b8[1 ]&8)<<5)|((b8[2 ]&8)<<6)|((b8[3 ]&8)<<7);
		linew = ((b8[12]&8)<<0)|((b8[13]&8)<<1)|((b8[14]&8)<<2)|((b8[15]&8)<<3)|((b8[8 ]&8)<<4)|((b8[9 ]&8)<<5)|((b8[10]&8)<<6)|((b8[11]&8)<<7);
		index = indexb[lineb>>>3] + indexw[linew>>>3];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb>>>3)] + indexw[reverse(linew>>>3)];
		//weights[start + index] += delta;
		//左辺
		lineb = ((b8[4 ]&16)<<0)|((b8[5 ]&16)<<1)|((b8[6 ]&16)<<2)|((b8[7 ]&16)<<3)|((b8[0 ]&16)<<4)|((b8[1 ]&16)<<5)|((b8[2 ]&16)<<6)|((b8[3 ]&16)<<7);
		linew = ((b8[12]&16)<<0)|((b8[13]&16)<<1)|((b8[14]&16)<<2)|((b8[15]&16)<<3)|((b8[8 ]&16)<<4)|((b8[9 ]&16)<<5)|((b8[10]&16)<<6)|((b8[11]&16)<<7);
		index = indexb[lineb>>>4] + indexw[linew>>>4];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb>>>4)] + indexw[reverse(linew>>>4)];
		//weights[start + index] += delta;
		
		
		start += 6561*num_phase;
		//dig8[n]
		//右肩上がり
		lineb = (b8[4 ]&128)|(b8[5 ]&64)|(b8[6 ]&32)|(b8[7 ]&16)|(b8[0 ]&8)|(b8[1 ]&4)|(b8[2 ]&2)|(b8[3 ]&1);
		linew = (b8[12]&128)|(b8[13]&64)|(b8[14]&32)|(b8[15]&16)|(b8[8 ]&8)|(b8[9 ]&4)|(b8[10]&2)|(b8[11]&1);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta;
		//右肩下がり
		lineb = (b8[4 ]&1)|(b8[5 ]&2)|(b8[6 ]&4)|(b8[7 ]&8)|(b8[0 ]&16)|(b8[1 ]&32)|(b8[2 ]&64)|(b8[3 ]&128);
		linew = (b8[12]&1)|(b8[13]&2)|(b8[14]&4)|(b8[15]&8)|(b8[8 ]&16)|(b8[9 ]&32)|(b8[10]&64)|(b8[11]&128);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta;
	
	
		start += 6561*num_phase;
		//corner 8
		//upper left
		lineb = ((b8[3 ]&128))|((b8[2 ]&128)>>>1)|((b8[3 ]&64)>>>1)|((b8[1 ]&128)>>>3)|((b8[2 ]&64)>>>3)|((b8[3 ]&32)>>>3)|((b8[0 ]&128)>>>6)|((b8[3 ]&16)>>>4);
		linew = ((b8[11]&128))|((b8[10]&128)>>>1)|((b8[11]&64)>>>1)|((b8[9 ]&128)>>>3)|((b8[10]&64)>>>3)|((b8[11]&32)>>>3)|((b8[8 ]&128)>>>6)|((b8[11]&16)>>>4);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta;
		//upper right
		lineb = ((b8[3 ]&1)<<7)|((b8[2 ]&1)<<6)|((b8[3 ]&2)<<4)|((b8[1 ]&1)<<4)|((b8[2 ]&2)<<2)|((b8[3 ]&4)<<0)|((b8[0 ]&1)<<1)|((b8[3 ]&8)>>>3);
		linew = ((b8[11]&1)<<7)|((b8[10]&1)<<6)|((b8[11]&2)<<4)|((b8[9 ]&1)<<4)|((b8[10]&2)<<2)|((b8[11]&4)<<0)|((b8[8 ]&1)<<1)|((b8[11]&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta;
		//lower left
		lineb = ((b8[4 ]&128))|((b8[5 ]&128)>>>1)|((b8[4 ]&64)>>>1)|((b8[6 ]&128)>>>3)|((b8[5 ]&64)>>>3)|((b8[4 ]&32)>>>3)|((b8[7 ]&128)>>>6)|((b8[4 ]&16)>>>4);
		linew = ((b8[12]&128))|((b8[13]&128)>>>1)|((b8[12]&64)>>>1)|((b8[14]&128)>>>3)|((b8[13]&64)>>>3)|((b8[12]&32)>>>3)|((b8[15]&128)>>>6)|((b8[12]&16)>>>4);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta;
		//lower right
		lineb = ((b8[4 ]&1)<<7)|((b8[5 ]&1)<<6)|((b8[4 ]&2)<<4)|((b8[6 ]&1)<<4)|((b8[5 ]&2)<<2)|((b8[4 ]&4)<<0)|((b8[7 ]&1)<<1)|((b8[4 ]&8)>>>3);
		linew = ((b8[12]&1)<<7)|((b8[13]&1)<<6)|((b8[12]&2)<<4)|((b8[14]&1)<<4)|((b8[13]&2)<<2)|((b8[12]&4)<<0)|((b8[15]&1)<<1)|((b8[12]&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta;
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta;
		
	
		start += 6561*num_phase;
		//dig7[n]
		//upper left
		lineb = (b8[5 ]&128)|(b8[6 ]&64)|(b8[7 ]&32)|(b8[0 ]&16)|(b8[1 ]&8)|(b8[2 ]&4)|(b8[3 ]&2);
		linew = (b8[13]&128)|(b8[14]&64)|(b8[15]&32)|(b8[8 ]&16)|(b8[9 ]&8)|(b8[10]&4)|(b8[11]&2);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		weights[start + index] += delta
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta
		//lower right
		lineb = (b8[2 ]&1)|(b8[1 ]&2)|(b8[0 ]&4)|(b8[7 ]&8)|(b8[6 ]&16)|(b8[5 ]&32)|(b8[4 ]&64);
		linew = (b8[10]&1)|(b8[9 ]&2)|(b8[8 ]&4)|(b8[15]&8)|(b8[14]&16)|(b8[13]&32)|(b8[12]&64);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//index = indexb[reverse(lineb)>>>1] + indexw[reverse(linew)>>>1];
		//weights[start + index] += delta
		//lower left
		lineb = (b8[2 ]&128)|(b8[1 ]&64)|(b8[0 ]&32)|(b8[7 ]&16)|(b8[6 ]&8)|(b8[5 ]&4)|(b8[4 ]&2);
		linew = (b8[10]&128)|(b8[9 ]&64)|(b8[8 ]&32)|(b8[15]&16)|(b8[14]&8)|(b8[13]&4)|(b8[12]&2);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		weights[start + index] += delta
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta
		//upper right
		lineb = (b8[5 ]&1)|(b8[6 ]&2)|(b8[7 ]&4)|(b8[0 ]&8)|(b8[1 ]&16)|(b8[2 ]&32)|(b8[3 ]&64);
		linew = (b8[10]&1)|(b8[9 ]&2)|(b8[8 ]&4)|(b8[15]&8)|(b8[14]&16)|(b8[13]&32)|(b8[12]&64);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//index = indexb[reverse(lineb)>>>1] + indexw[reverse(linew)>>>1];
		//weights[start + index] += delta
		
		
		start += 6561*num_phase;
		//dig6[n]
		//upper left
		lineb = (b8[6 ]&128)|(b8[7 ]&64)|(b8[0 ]&32)|(b8[1 ]&16)|(b8[2 ]&8)|(b8[3 ]&4);
		linew = (b8[14]&128)|(b8[15]&64)|(b8[8 ]&32)|(b8[9 ]&16)|(b8[10]&8)|(b8[11]&4);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		weights[start + index] += delta
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta
		//lower right
		lineb = (b8[1 ]&1)|(b8[0 ]&2)|(b8[7 ]&4)|(b8[6 ]&8)|(b8[5 ]&16)|(b8[4 ]&32);
		linew = (b8[9 ]&1)|(b8[8 ]&2)|(b8[15]&4)|(b8[14]&8)|(b8[13]&16)|(b8[12]&32);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//index = indexb[reverse(lineb)>>>2] + indexw[reverse(linew)>>>2];
		//weights[start + index] += delta
		//lower left
		lineb = (b8[1 ]&128)|(b8[0 ]&64)|(b8[7 ]&32)|(b8[6 ]&16)|(b8[5 ]&8)|(b8[4 ]&4);
		linew = (b8[9 ]&128)|(b8[8 ]&64)|(b8[15]&32)|(b8[14]&16)|(b8[13]&8)|(b8[12]&4);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		weights[start + index] += delta
		//index = indexb[reverse(lineb)] + indexw[reverse(linew)];
		//weights[start + index] += delta
		//upper right
		lineb = (b8[6 ]&1)|(b8[7 ]&2)|(b8[0 ]&4)|(b8[1 ]&8)|(b8[2 ]&16)|(b8[3 ]&32);
		linew = (b8[14]&1)|(b8[15]&2)|(b8[8 ]&4)|(b8[9 ]&8)|(b8[10]&16)|(b8[11]&32);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//index = indexb[reverse(lineb)>>>2] + indexw[reverse(linew)>>>2];
		//weights[start + index] += delta


		start += 6561*num_phase;
		//corner24
		//horizontal upper left
		lineb = (b8[3 ]&0xf0)|((b8[2 ]&0xf)>>>4);
		linew = (b8[11]&0xf0)|((b8[10]&0xf)>>>4);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//horizontal lower left
		lineb = (b8[4 ]&0xf0)|((b8[5 ]&0xf)>>>4);
		linew = (b8[12]&0xf0)|((b8[13]&0xf)>>>4);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//horizontal upper right
		lineb = ((b8[3 ]&1)<<7)|((b8[3 ]&2)<<5)|((b8[3 ]&4)<<3)|((b8[3 ]&8)<<1)|((b8[2 ]&1)<<3)|((b8[2 ]&2)<<1)|((b8[2 ]&4)>>>1)|((b8[2 ]&8)>>>3);
		linew = ((b8[11]&1)<<7)|((b8[11]&2)<<5)|((b8[11]&4)<<3)|((b8[11]&8)<<1)|((b8[10]&1)<<3)|((b8[10]&2)<<1)|((b8[10]&4)>>>1)|((b8[10]&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//horizontal lower right
		lineb = ((b8[4 ]&1)<<7)|((b8[4 ]&2)<<5)|((b8[4 ]&4)<<3)|((b8[4 ]&8)<<1)|((b8[5 ]&1)<<3)|((b8[5 ]&2)<<1)|((b8[5 ]&4)>>>1)|((b8[5 ]&8)>>>3);
		linew = ((b8[12]&1)<<7)|((b8[12]&2)<<5)|((b8[12]&4)<<3)|((b8[12]&8)<<1)|((b8[13]&1)<<3)|((b8[13]&2)<<1)|((b8[13]&4)>>>1)|((b8[13]&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//vertical upper left
		lineb = ((b8[3 ]&128)>>>0)|((b8[2 ]&128)>>>1)|((b8[1 ]&128)>>>2)|((b8[0 ]&128)>>>3)|((b8[3 ]&64)>>>3)|((b8[2 ]&64)>>>4)|((b8[1 ]&64)>>>5)|((b8[0 ]&64)>>>6);
		linew = ((b8[11]&128)>>>0)|((b8[10]&128)>>>1)|((b8[9 ]&128)>>>2)|((b8[8 ]&128)>>>3)|((b8[11]&64)>>>3)|((b8[10]&64)>>>4)|((b8[9 ]&64)>>>5)|((b8[8 ]&64)>>>6);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//vertical lower left
		lineb = ((b8[4 ]&128)>>>0)|((b8[5 ]&128)>>>1)|((b8[6 ]&128)>>>2)|((b8[7 ]&128)>>>3)|((b8[4 ]&64)>>>3)|((b8[5 ]&64)>>>4)|((b8[6 ]&64)>>>5)|((b8[7 ]&64)>>>6);
		linew = ((b8[12]&128)>>>0)|((b8[13]&128)>>>1)|((b8[14]&128)>>>2)|((b8[15]&128)>>>3)|((b8[12]&64)>>>3)|((b8[13]&64)>>>4)|((b8[14]&64)>>>5)|((b8[15]&64)>>>6);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//vertical upper right
		lineb = ((b8[3 ]&1)<<7)|((b8[2 ]&1)<<6)|((b8[1 ]&1)<<5)|((b8[0 ]&1)<<4)|((b8[3 ]&2)<<2)|((b8[2 ]&2)<<1)|((b8[1 ]&2)<<0)|((b8[0 ]&2)>>>1);
		linew = ((b8[11]&1)<<7)|((b8[10]&1)<<6)|((b8[9 ]&1)<<5)|((b8[8 ]&1)<<4)|((b8[11]&2)<<2)|((b8[10]&2)<<1)|((b8[9 ]&2)<<0)|((b8[8 ]&2)>>>1);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		//vertical lower right
		lineb = ((b8[4 ]&1)<<7)|((b8[5 ]&1)<<6)|((b8[6 ]&1)<<5)|((b8[7 ]&1)<<4)|((b8[4 ]&2)<<2)|((b8[5 ]&2)<<1)|((b8[6 ]&2)<<0)|((b8[7 ]&2)>>>1);
		linew = ((b8[12]&1)<<7)|((b8[13]&1)<<6)|((b8[14]&1)<<5)|((b8[15]&1)<<4)|((b8[12]&2)<<2)|((b8[13]&2)<<1)|((b8[14]&2)<<0)|((b8[15]&2)>>>1);
		index = indexb[lineb] + indexw[linew];
		weights[start + index] += delta
		
		
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
				if(list[j].boardArray[5]>=n1 && list[j].boardArray[5]<=n2){
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

	flipBoard(argboard){
		const reverse = (x)=>{
			x = ((x&0b10101010)>>>1) | ((x&0b01010101)<<1);
			x = ((x&0b11001100)>>>2) | ((x&0b00110011)<<2);
			x = ((x&0b11110000)>>>4) | ((x&0b00001111)<<4);
			return x;
		};

		const board = new BOARD(argboard);
		const b8a = board._board8array;

		for(let i=0;i<16;i++){
			b8a[i] = reverse(b8a[i]);
		}

		return board;
	}

	rotateBoard(argboard){
		const reverse = (x)=>{
			x = ((x&0b10101010)>>>1) | ((x&0b01010101)<<1);
			x = ((x&0b11001100)>>>2) | ((x&0b00110011)<<2);
			x = ((x&0b11110000)>>>4) | ((x&0b00001111)<<4);
			return x;
		};
		const board = new BOARD(argboard);
		const boardArray = argboard.boardArray;
		const b = new Array();
		const w = new Array();
	
		b[0] = (boardArray[0]>>>24)&0xff;
		b[1] = (boardArray[0]>>>16)&0xff;
		b[2] = (boardArray[0]>>>8)&0xff;
		b[3] = (boardArray[0]>>>0)&0xff;
		b[4] = (boardArray[1]>>>24)&0xff;
		b[5] = (boardArray[1]>>>16)&0xff;
		b[6] = (boardArray[1]>>>8)&0xff;
		b[7] = (boardArray[1]>>>0)&0xff;
		w[0] = (boardArray[2]>>>24)&0xff;
		w[1] = (boardArray[2]>>>16)&0xff;
		w[2] = (boardArray[2]>>>8)&0xff;
		w[3] = (boardArray[2]>>>0)&0xff;
		w[4] = (boardArray[3]>>>24)&0xff;
		w[5] = (boardArray[3]>>>16)&0xff;
		w[6] = (boardArray[3]>>>8)&0xff;
		w[7] = (boardArray[3]>>>0)&0xff;
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

		board.boardArray[0] = b1;
		board.boardArray[1] = b2;
		board.boardArray[2] = w1;
		board.boardArray[3] = w2;

		return board;
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


function calcLoss(s=100, n=64, blk=-1){
	const reversi = new Game_b();
	let count = 0;
	let loss = 0;

	const startTime = performance.now();
	while(true){
		const node = reversi.generateNode(n, blk);
		const accurate_eval = reversi.ai.negaScout_last(node, -64, 64);
		const predicted_eval = master.ai.evaluation(node._board8array);
		loss += Math.pow((accurate_eval-predicted_eval), 2);
		count++;
		if(performance.now()-startTime>s){
			master.render(node);
			console.log(`accurate eval: ${accurate_eval}\n predicted eval: ${predicted_eval}`);
			break;
		}
	}

	console.log(`loss ${Math.sqrt(loss/count).toPrecision(4)}`);
	
}


function line(){
	let lineb, linew;
	const board = master.generateNode(64);
	const b8 = board._board8array;
	master.render(board);
	
	lineb = ((b8[4 ]&1)<<7)|((b8[5 ]&1)<<6)|((b8[4 ]&2)<<4)|((b8[6 ]&1)<<4)|((b8[5 ]&2)<<2)|((b8[4 ]&4)<<0)|((b8[7 ]&1)<<1)|((b8[4 ]&8)>>>3);
	linew = ((b8[12]&1)<<7)|((b8[13]&1)<<6)|((b8[12]&2)<<4)|((b8[14]&1)<<4)|((b8[13]&2)<<2)|((b8[12]&4)<<0)|((b8[15]&1)<<1)|((b8[12]&8)>>>3);
	
	const shift = 0;

	lineb = lineb>>>shift;
	linew = linew>>>shift;
	if(lineb+linew!==255){console.error('255')};
	if((lineb&linew)!==0){console.error('0')};
	console.log(lineb, linew);
}

