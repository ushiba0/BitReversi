

const hash = (str='')=>{
    const arr = (new TextEncoder).encode(str);
    const iter = Math.floor(arr.length/128) + 1;
    const buffer_size = Math.max(iter*128, 128);
    const buffer = new ArrayBuffer(buffer_size);
    const array8 = new Int8Array(buffer);
    const h = new Int32Array(4);
    array8.set(arr);

    for(let i=0;i<4;i++){
        h[i] = ~~(Math.sqrt(i**i+7*i+5)*2**31);
    }

    const leftrotate = (_arg, _shift)=>{
        const arg = _arg|0;
        const shift = _shift%32;
        const result = (arg<<(shift)) | (arg>>>(32-shift));
        return result;
    };
    
    for(let i=0;i<iter;i++){
        const chunk = new Uint32Array(buffer, i*128, 128/4);
        const w = new Uint32Array(128);
        for(let j=0;j<32;j++){
            w[j] = chunk[j] + i+1;
        }

        // extend bit words
        for(let j=16;j<128;j++){
            w[j] = w[j]^w[j-2]^w[j-3]^w[j-5]^w[j-7]^w[j-11]^w[j-13]^w[j-15];
            w[j] = leftrotate(w[j], 1);
        }
        
        // initialize hash value
        let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = 0, k = 0;

        // main loop
        for(let j=0;j<128;j++){
            if(j<32){
                f = (b&c)|((~b)&d);
            }else if(32<=j && j<64){
                f = b^c^d;
            }else if(64<=j && j<96){
                f = (b&c)|(b&d)|(c&d);
            }else{
                f = b^c^d;
            }

            k = (~~(Math.sqrt(i*j+i+1)*2**31)|0);
            let temp = (leftrotate(a, 5) + f + e + k + w[j])|0;
            e = d;
            d = c;
            c = leftrotate(b, 30);
            b = a;
            a = temp;
        }

        h[0] = (h[0]+a)|0;
        h[1] = (h[1]+b)|0;
        h[2] = (h[2]+c)|0;
        h[3] = (h[3]+d)|0;
        h[4] = (h[4]+e)|0;

    }

    return [h[0]^h[4], h[1]^h[4], h[2]^h[4], h[3]^h[4]];
};

const encrypt = (str, key)=>{
    const arr = (new TextEncoder).encode(str);

    for(let i=0;i<arr.length;i++){
        let x = arr[i];
        x = ((x&0b01010101)<<1) | ((x&0b10101010)>>>1);
        x = ((x&0b00110011)<<2) | ((x&0b11001100)>>>2);
        x = ((x&0b00001111)<<4) | ((x&0b11110000)>>>4);
        arr[i] = x;
    }


    // convert data to png
    const d2p = new data2png();
    d2p.toPng(arr);
    return arr;
};



const decode = (str, key)=>{

    const arr = (new TextEncoder).encode(str);

    const func = ()=>{
        const arr = d2p.array;
        for(let i=0;i<arr.length;i++){
            let x = arr[i];
            x = ((x&0b01010101)<<1) | ((x&0b10101010)>>>1);
            x = ((x&0b00110011)<<2) | ((x&0b11001100)>>>2);
            x = ((x&0b00001111)<<4) | ((x&0b11110000)>>>4);
            arr[i] = x;
        }

        const result = (new TextDecoder).decode(arr);
        console.log(result);
    };
    

    
    // pick png data
    const d2p = new data2png();
    d2p.selectPng(func);

};