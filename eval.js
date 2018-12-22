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




class EV extends BOARD_OPERATION{
	constructor(arg){
		super(arg);

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
	evaluation(board8Array){
		
		const b8 = board8Array; //8bit board array
		//b	w
		//3	11
		//2	10
		//1	9
		//0	8
		//7	15
		//6	14
		//5	13
		//4	12
	
		let lineb = 0, linew = 0, index = 0, score = 0;
		
		const num_shape = this.num_shape;
		const num_phase = this.num_phase;
		const weights = this.weights;
		const indexb = this.indexb;
		const indexw = this.indexw;
		const phase = Math.min(Math.max(0, b8[20]-4), 60);
		
		let start = 0;
	
		start = 6561*phase;
		//horizontal 1
		//上辺
		index = indexb[b8[3 ]] + indexw[b8[11]];
		score += weights[start + index];
		//下辺
		index = indexb[b8[4 ]] + indexw[b8[12]];
		score += weights[start + index];
		//右辺
		lineb = ((b8[4 ]&1)<<0)|((b8[5 ]&1)<<1)|((b8[6 ]&1)<<2)|((b8[7 ]&1)<<3)|((b8[0 ]&1)<<4)|((b8[1 ]&1)<<5)|((b8[2 ]&1)<<6)|((b8[3 ]&1)<<7);
		linew = ((b8[12]&1)<<0)|((b8[13]&1)<<1)|((b8[14]&1)<<2)|((b8[15]&1)<<3)|((b8[8 ]&1)<<4)|((b8[9 ]&1)<<5)|((b8[10]&1)<<6)|((b8[11]&1)<<7);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//左辺
		lineb = ((b8[4 ]&128)<<0)|((b8[5 ]&128)<<1)|((b8[6 ]&128)<<2)|((b8[7 ]&128)<<3)|((b8[0 ]&128)<<4)|((b8[1 ]&128)<<5)|((b8[2 ]&128)<<6)|((b8[3 ]&128)<<7);
		linew = ((b8[12]&128)<<0)|((b8[13]&128)<<1)|((b8[14]&128)<<2)|((b8[15]&128)<<3)|((b8[8 ]&128)<<4)|((b8[9 ]&128)<<5)|((b8[10]&128)<<6)|((b8[11]&128)<<7);
		index = indexb[lineb>>>7] + indexw[linew>>>7];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//horizontal 2
		//上辺
		index = indexb[b8[2 ]] + indexw[b8[10]];
		score += weights[start + index];
		//下辺
		index = indexb[b8[5 ]] + indexw[b8[13]];
		score += weights[start + index];
		//右辺
		lineb = ((b8[4 ]&2)<<0)|((b8[5 ]&2)<<1)|((b8[6 ]&2)<<2)|((b8[7 ]&2)<<3)|((b8[0 ]&2)<<4)|((b8[1 ]&2)<<5)|((b8[2 ]&2)<<6)|((b8[3 ]&2)<<7);
		linew = ((b8[12]&2)<<0)|((b8[13]&2)<<1)|((b8[14]&2)<<2)|((b8[15]&2)<<3)|((b8[8 ]&2)<<4)|((b8[9 ]&2)<<5)|((b8[10]&2)<<6)|((b8[11]&2)<<7);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		score += weights[start + index];
		//左辺
		lineb = ((b8[4 ]&64)<<0)|((b8[5 ]&64)<<1)|((b8[6 ]&64)<<2)|((b8[7 ]&64)<<3)|((b8[0 ]&64)<<4)|((b8[1 ]&64)<<5)|((b8[2 ]&64)<<6)|((b8[3 ]&64)<<7);
		linew = ((b8[12]&64)<<0)|((b8[13]&64)<<1)|((b8[14]&64)<<2)|((b8[15]&64)<<3)|((b8[8 ]&64)<<4)|((b8[9 ]&64)<<5)|((b8[10]&64)<<6)|((b8[11]&64)<<7);
		index = indexb[lineb>>>6] + indexw[linew>>>6];
		score += weights[start + index];
		
	
		start += 6561*num_phase;
		//horizontal 3
		//上辺
		index = indexb[b8[1 ]] + indexw[b8[9 ]];
		score += weights[start + index];
		//下辺
		index = indexb[b8[6 ]] + indexw[b8[14]];
		score += weights[start + index];
		//右辺
		lineb = ((b8[4 ]&4)<<0)|((b8[5 ]&4)<<1)|((b8[6 ]&4)<<2)|((b8[7 ]&4)<<3)|((b8[0 ]&4)<<4)|((b8[1 ]&4)<<5)|((b8[2 ]&4)<<6)|((b8[3 ]&4)<<7);
		linew = ((b8[12]&4)<<0)|((b8[13]&4)<<1)|((b8[14]&4)<<2)|((b8[15]&4)<<3)|((b8[8 ]&4)<<4)|((b8[9 ]&4)<<5)|((b8[10]&4)<<6)|((b8[11]&4)<<7);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		score += weights[start + index];
		//左辺
		lineb = ((b8[4 ]&32)<<0)|((b8[5 ]&32)<<1)|((b8[6 ]&32)<<2)|((b8[7 ]&32)<<3)|((b8[0 ]&32)<<4)|((b8[1 ]&32)<<5)|((b8[2 ]&32)<<6)|((b8[3 ]&32)<<7);
		linew = ((b8[12]&32)<<0)|((b8[13]&32)<<1)|((b8[14]&32)<<2)|((b8[15]&32)<<3)|((b8[8 ]&32)<<4)|((b8[9 ]&32)<<5)|((b8[10]&32)<<6)|((b8[11]&32)<<7);
		index = indexb[lineb>>>5] + indexw[linew>>>5];
		score += weights[start + index];
	
	
		start += 6561*num_phase;
		//horizontal 4
		//上辺
		index = indexb[b8[0 ]] + indexw[b8[8 ]];
		score += weights[start + index];
		//下辺
		index = indexb[b8[7 ]] + indexw[b8[15]];
		score += weights[start + index];
		//右辺
		lineb = ((b8[4 ]&8)<<0)|((b8[5 ]&8)<<1)|((b8[6 ]&8)<<2)|((b8[7 ]&8)<<3)|((b8[0 ]&8)<<4)|((b8[1 ]&8)<<5)|((b8[2 ]&8)<<6)|((b8[3 ]&8)<<7);
		linew = ((b8[12]&8)<<0)|((b8[13]&8)<<1)|((b8[14]&8)<<2)|((b8[15]&8)<<3)|((b8[8 ]&8)<<4)|((b8[9 ]&8)<<5)|((b8[10]&8)<<6)|((b8[11]&8)<<7);
		index = indexb[lineb>>>3] + indexw[linew>>>3];
		score += weights[start + index];
		//左辺
		lineb = ((b8[4 ]&16)<<0)|((b8[5 ]&16)<<1)|((b8[6 ]&16)<<2)|((b8[7 ]&16)<<3)|((b8[0 ]&16)<<4)|((b8[1 ]&16)<<5)|((b8[2 ]&16)<<6)|((b8[3 ]&16)<<7);
		linew = ((b8[12]&16)<<0)|((b8[13]&16)<<1)|((b8[14]&16)<<2)|((b8[15]&16)<<3)|((b8[8 ]&16)<<4)|((b8[9 ]&16)<<5)|((b8[10]&16)<<6)|((b8[11]&16)<<7);
		index = indexb[lineb>>>4] + indexw[linew>>>4];
		score += weights[start + index];
		
	
		start += 6561*num_phase;
		//diagonal 8
		//右肩上がり
		lineb = (b8[4 ]&128)|(b8[5 ]&64)|(b8[6 ]&32)|(b8[7 ]&16)|(b8[0 ]&8)|(b8[1 ]&4)|(b8[2 ]&2)|(b8[3 ]&1);
		linew = (b8[12]&128)|(b8[13]&64)|(b8[14]&32)|(b8[15]&16)|(b8[8 ]&8)|(b8[9 ]&4)|(b8[10]&2)|(b8[11]&1);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//右肩下がり
		lineb = (b8[4 ]&1)|(b8[5 ]&2)|(b8[6 ]&4)|(b8[7 ]&8)|(b8[0 ]&16)|(b8[1 ]&32)|(b8[2 ]&64)|(b8[3 ]&128);
		linew = (b8[12]&1)|(b8[13]&2)|(b8[14]&4)|(b8[15]&8)|(b8[8 ]&16)|(b8[9 ]&32)|(b8[10]&64)|(b8[11]&128);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//corner 8
		//upper left
		lineb = ((b8[3 ]&128))|((b8[2 ]&128)>>>1)|((b8[3 ]&64)>>>1)|((b8[1 ]&128)>>>3)|((b8[2 ]&64)>>>3)|((b8[3 ]&32)>>>3)|((b8[0 ]&128)>>>6)|((b8[3 ]&16)>>>4);
		linew = ((b8[11]&128))|((b8[10]&128)>>>1)|((b8[11]&64)>>>1)|((b8[9 ]&128)>>>3)|((b8[10]&64)>>>3)|((b8[11]&32)>>>3)|((b8[8 ]&128)>>>6)|((b8[11]&16)>>>4);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//upper right
		lineb = ((b8[3 ]&1)<<7)|((b8[2 ]&1)<<6)|((b8[3 ]&2)<<4)|((b8[1 ]&1)<<4)|((b8[2 ]&2)<<2)|((b8[3 ]&4)<<0)|((b8[0 ]&1)<<1)|((b8[3 ]&8)>>>3);
		linew = ((b8[11]&1)<<7)|((b8[10]&1)<<6)|((b8[11]&2)<<4)|((b8[9 ]&1)<<4)|((b8[10]&2)<<2)|((b8[11]&4)<<0)|((b8[8 ]&1)<<1)|((b8[11]&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//lower left
		lineb = ((b8[4 ]&128))|((b8[5 ]&128)>>>1)|((b8[4 ]&64)>>>1)|((b8[6 ]&128)>>>3)|((b8[5 ]&64)>>>3)|((b8[4 ]&32)>>>3)|((b8[7 ]&128)>>>6)|((b8[4 ]&16)>>>4);
		linew = ((b8[12]&128))|((b8[13]&128)>>>1)|((b8[12]&64)>>>1)|((b8[14]&128)>>>3)|((b8[13]&64)>>>3)|((b8[12]&32)>>>3)|((b8[15]&128)>>>6)|((b8[12]&16)>>>4);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//lower right
		lineb = ((b8[4 ]&1)<<7)|((b8[5 ]&1)<<6)|((b8[4 ]&2)<<4)|((b8[6 ]&1)<<4)|((b8[5 ]&2)<<2)|((b8[4 ]&4)<<0)|((b8[7 ]&1)<<1)|((b8[4 ]&8)>>>3);
		linew = ((b8[12]&1)<<7)|((b8[13]&1)<<6)|((b8[12]&2)<<4)|((b8[14]&1)<<4)|((b8[13]&2)<<2)|((b8[12]&4)<<0)|((b8[15]&1)<<1)|((b8[12]&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//diagonal 7
		//upper left
		lineb = (b8[5 ]&128)|(b8[6 ]&64)|(b8[7 ]&32)|(b8[0 ]&16)|(b8[1 ]&8)|(b8[2 ]&4)|(b8[3 ]&2);
		linew = (b8[13]&128)|(b8[14]&64)|(b8[15]&32)|(b8[8 ]&16)|(b8[9 ]&8)|(b8[10]&4)|(b8[11]&2);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		score += weights[start + index];
		//lower right
		lineb = (b8[2 ]&1)|(b8[1 ]&2)|(b8[0 ]&4)|(b8[7 ]&8)|(b8[6 ]&16)|(b8[5 ]&32)|(b8[4 ]&64);
		linew = (b8[10]&1)|(b8[9 ]&2)|(b8[8 ]&4)|(b8[15]&8)|(b8[14]&16)|(b8[13]&32)|(b8[12]&64);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//lower left
		lineb = (b8[2 ]&128)|(b8[1 ]&64)|(b8[0 ]&32)|(b8[7 ]&16)|(b8[6 ]&8)|(b8[5 ]&4)|(b8[4 ]&2);
		linew = (b8[10]&128)|(b8[9 ]&64)|(b8[8 ]&32)|(b8[15]&16)|(b8[14]&8)|(b8[13]&4)|(b8[12]&2);
		index = indexb[lineb>>>1] + indexw[linew>>>1];
		score += weights[start + index];
		//upper right
		lineb = (b8[5 ]&1)|(b8[6 ]&2)|(b8[7 ]&4)|(b8[0 ]&8)|(b8[1 ]&16)|(b8[2 ]&32)|(b8[3 ]&64);
		linew = (b8[10]&1)|(b8[9 ]&2)|(b8[8 ]&4)|(b8[15]&8)|(b8[14]&16)|(b8[13]&32)|(b8[12]&64);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
	
		
		start += 6561*num_phase;
		//diagonal 6
		//upper left
		lineb = (b8[6 ]&128)|(b8[7 ]&64)|(b8[0 ]&32)|(b8[1 ]&16)|(b8[2 ]&8)|(b8[3 ]&4);
		linew = (b8[14]&128)|(b8[15]&64)|(b8[8 ]&32)|(b8[9 ]&16)|(b8[10]&8)|(b8[11]&4);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		score += weights[start + index];
		//lower right
		lineb = (b8[1 ]&1)|(b8[0 ]&2)|(b8[7 ]&4)|(b8[6 ]&8)|(b8[5 ]&16)|(b8[4 ]&32);
		linew = (b8[9 ]&1)|(b8[8 ]&2)|(b8[15]&4)|(b8[14]&8)|(b8[13]&16)|(b8[12]&32);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//lower left
		lineb = (b8[1 ]&128)|(b8[0 ]&64)|(b8[7 ]&32)|(b8[6 ]&16)|(b8[5 ]&8)|(b8[4 ]&4);
		linew = (b8[9 ]&128)|(b8[8 ]&64)|(b8[15]&32)|(b8[14]&16)|(b8[13]&8)|(b8[12]&4);
		index = indexb[lineb>>>2] + indexw[linew>>>2];
		score += weights[start + index];
		//upper right
		lineb = (b8[6 ]&1)|(b8[7 ]&2)|(b8[0 ]&4)|(b8[1 ]&8)|(b8[2 ]&16)|(b8[3 ]&32);
		linew = (b8[14]&1)|(b8[15]&2)|(b8[8 ]&4)|(b8[9 ]&8)|(b8[10]&16)|(b8[11]&32);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		
		
		start += 6561*num_phase;
		//corner24
		//horizontal upper left
		lineb = (b8[3 ]&0xf0)|((b8[2 ]&0xf)>>>4);
		linew = (b8[11]&0xf0)|((b8[10]&0xf)>>>4);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//horizontal lower left
		lineb = (b8[4 ]&0xf0)|((b8[5 ]&0xf)>>>4);
		linew = (b8[12]&0xf0)|((b8[13]&0xf)>>>4);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//horizontal upper right
		lineb = ((b8[3 ]&1)<<7)|((b8[3 ]&2)<<5)|((b8[3 ]&4)<<3)|((b8[3 ]&8)<<1)|((b8[2 ]&1)<<3)|((b8[2 ]&2)<<1)|((b8[2 ]&4)>>>1)|((b8[2 ]&8)>>>3);
		linew = ((b8[11]&1)<<7)|((b8[11]&2)<<5)|((b8[11]&4)<<3)|((b8[11]&8)<<1)|((b8[10]&1)<<3)|((b8[10]&2)<<1)|((b8[10]&4)>>>1)|((b8[10]&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//horizontal lower right
		lineb = ((b8[4 ]&1)<<7)|((b8[4 ]&2)<<5)|((b8[4 ]&4)<<3)|((b8[4 ]&8)<<1)|((b8[5 ]&1)<<3)|((b8[5 ]&2)<<1)|((b8[5 ]&4)>>>1)|((b8[5 ]&8)>>>3);
		linew = ((b8[12]&1)<<7)|((b8[12]&2)<<5)|((b8[12]&4)<<3)|((b8[12]&8)<<1)|((b8[13]&1)<<3)|((b8[13]&2)<<1)|((b8[13]&4)>>>1)|((b8[13]&8)>>>3);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//vertical upper left
		lineb = ((b8[3 ]&128)>>>0)|((b8[2 ]&128)>>>1)|((b8[1 ]&128)>>>2)|((b8[0 ]&128)>>>3)|((b8[3 ]&64)>>>3)|((b8[2 ]&64)>>>4)|((b8[1 ]&64)>>>5)|((b8[0 ]&64)>>>6);
		linew = ((b8[11]&128)>>>0)|((b8[10]&128)>>>1)|((b8[9 ]&128)>>>2)|((b8[8 ]&128)>>>3)|((b8[11]&64)>>>3)|((b8[10]&64)>>>4)|((b8[9 ]&64)>>>5)|((b8[8 ]&64)>>>6);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//vertical lower left
		lineb = ((b8[4 ]&128)>>>0)|((b8[5 ]&128)>>>1)|((b8[6 ]&128)>>>2)|((b8[7 ]&128)>>>3)|((b8[4 ]&64)>>>3)|((b8[5 ]&64)>>>4)|((b8[6 ]&64)>>>5)|((b8[7 ]&64)>>>6);
		linew = ((b8[12]&128)>>>0)|((b8[13]&128)>>>1)|((b8[14]&128)>>>2)|((b8[15]&128)>>>3)|((b8[12]&64)>>>3)|((b8[13]&64)>>>4)|((b8[14]&64)>>>5)|((b8[15]&64)>>>6);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//vertical upper right
		lineb = ((b8[3 ]&1)<<7)|((b8[2 ]&1)<<6)|((b8[1 ]&1)<<5)|((b8[0 ]&1)<<4)|((b8[3 ]&2)<<2)|((b8[2 ]&2)<<1)|((b8[1 ]&2)<<0)|((b8[0 ]&2)>>>1);
		linew = ((b8[11]&1)<<7)|((b8[10]&1)<<6)|((b8[9 ]&1)<<5)|((b8[8 ]&1)<<4)|((b8[11]&2)<<2)|((b8[10]&2)<<1)|((b8[9 ]&2)<<0)|((b8[8 ]&2)>>>1);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		//vertical lower right
		lineb = ((b8[4 ]&1)<<7)|((b8[5 ]&1)<<6)|((b8[6 ]&1)<<5)|((b8[7 ]&1)<<4)|((b8[4 ]&2)<<2)|((b8[5 ]&2)<<1)|((b8[6 ]&2)<<0)|((b8[7 ]&2)>>>1);
		linew = ((b8[12]&1)<<7)|((b8[13]&1)<<6)|((b8[14]&1)<<5)|((b8[15]&1)<<4)|((b8[12]&2)<<2)|((b8[13]&2)<<1)|((b8[14]&2)<<0)|((b8[15]&2)>>>1);
		index = indexb[lineb] + indexw[linew];
		score += weights[start + index];
		
		/*if(flag){
			console.log('sum score weights[0]',b8[20],score,weights[0]);
		}*/
		
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
		const phase = Math.min(Math.max(0, b8[20]-4), 60);
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
		const othello = new Game_b();
		let c = 0, loss = 0;
		
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
			const list = othello.getSelfPlayGame();
			for(let j=0;j<list.length;j++){
				if(list[j].boardArray[5]>=n1 && list[j].boardArray[5]<=n2){
					const node = list[j];
					this.updateWeights(node._board8array, node.e);
					//console.log(node.boardArray,node.e);
					loss += Math.pow(this.evaluation(node._board8array)-node.e, 2);
					c++;
					if(c%100000===0){
						console.log(c/10000, Math.sqrt(loss/c).toPrecision(4));
					}
				}
			}
			
			const endTime = performance.now();
			if(endTime-startTime>s){ break; }
		}

		this.float2int();
		console.log(`complete ${c} trains\nloss ${Math.sqrt(loss/c).toPrecision(4)}`);
    }

    train(s=0, n=64){
        const reversi = new Game_b();
        let count = 0;
		let loss = 0;
		
		this.int2float();

        const startTime = performance.now();
		while(true){
            const node = reversi.generateNode(n);
			const value = reversi.ai.negaScout_last(node, -64, 64);
            
			this.updateWeights(node._board8array, value);
			loss += Math.pow((value-this.evaluation(node._board8array)), 2);
			count++;
			
			const endTime = performance.now();
			if(endTime-startTime>s){break;}
		}

		this.float2int();

		console.log(`complete ${count} trainings\nloss ${Math.sqrt(loss/count).toPrecision(4)}`);
		
	}
	
	/*
	//重みを単一の配列に直して、toPngを呼ぶ
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
        const that = this;
        const func = function(){
			const newarr = new Int8Array(d2p.array.length);
			for(let i=0;i<d2p.array.length;i++){
				newarr[i] = d2p.array[i] - 128;
			}
            that.weights = newarr;
        }
        const d2p = new data2png();
        d2p.selectPng(func);
    }*/
    
    
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


/*

var b = master.generateNode(54);
master.render(b);
counter = 0;
var e1 = master.ai.negaAlpha_last(b,-100,100);
console.log(`negaAlpha read node ${counter}`);
var e2 = master.ai.negaScout(b, -100, 100, 3);
var e3 = master.ai.negaScout_last(b, -100, 100);
console.log(e1, e2, e3);

*/