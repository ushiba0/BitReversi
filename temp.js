

const genworker = async ()=>{

    for(let i=0;i<100;i++){
        const res = await calc();
        console.log(res);
    }
    console.log("fin");
}
ai.weights[0]=2

const calc = ()=>{
    return new Promise(resolve=>{
        const worker = new Worker("temp1.js");

        //worker.postMessage(ai.weights.buffer, [ai.weights.buffer]);
        worker.postMessage(buf, [buf]);
        //worker.postMessage(ai.weights);
        //worker.postMessage(buf)
        
        worker.addEventListener("message", e=>{
            const arg = e.data;
            resolve(arg);
        });
    });
}


const buf = new SharedArrayBuffer(1e7);
const arr = new Int8Array(buf);

const work = (boardList)=>{
    boardList = [board1, board2, board3];
    const jobs = [];
    for(let i=0;i<3;i++){
        const worker = new Worker("temp1.js");
        const promise = new Promise(resolve=>{
            worker.addEventListener("message", message=>{
                resolve(message.data);
            });
        });

        let n=18;
        arr[i*n+0] = (boardList[i].black1>>>0)&0xff;
        arr[i*n+1] = (boardList[i].black1>>>8)&0xff;
        arr[i*n+2] = (boardList[i].black1>>>16)&0xff;
        arr[i*n+3] = (boardList[i].black1>>>24)&0xff;
        arr[i*n+4] = (boardList[i].black2>>>0)&0xff;
        arr[i*n+5] = (boardList[i].black2>>>8)&0xff;
        arr[i*n+6] = (boardList[i].black2>>>16)&0xff;
        arr[i*n+7] = (boardList[i].black2>>>24)&0xff;
        arr[i*n+8] = (boardList[i].white1>>>0)&0xff;
        arr[i*n+9] = (boardList[i].white1>>>8)&0xff;
        arr[i*n+10] = (boardList[i].white1>>>16)&0xff;
        arr[i*n+11] = (boardList[i].white1>>>24)&0xff;
        arr[i*n+12] = (boardList[i].white2>>>0)&0xff;
        arr[i*n+13] = (boardList[i].white2>>>8)&0xff;
        arr[i*n+14] = (boardList[i].white2>>>16)&0xff;
        arr[i*n+15] = (boardList[i].white2>>>24)&0xff;
        arr[i*n+16] = boardList[i].stones;
        arr[i*n+17] = boardList[i].turn;

        jobs.push(promise);
        worker.postMessage({buffer:buf, id:i});
    }

    Promise.all(jobs).then(result=>{
        console.log("end", result);
    });
}





board1 = new BOARD();
Object.assign(board1, 
{black1: 1693509860,
black2: -524239872,
e: 0,
stones: 60,
turn: 1,
white1: 403576603,
white2: 524239871})

board2 = new BOARD();
Object.assign(board2, 
{black1: 3682383,
black2: -805884159,
e: 0,
stones: 60,
turn: 1,
white1: 2135346864,
white2: 805884158})

board3 = new BOARD();
Object.assign(board3, 
{black1: 8134757,
black2: 1259538944,
e: 0,
stones: 60,
turn: 1,
white1: 2139332506,
white2: -1259539202})