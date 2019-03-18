const asdf = new SharedArrayBuffer(2**30);
const a = new Int32Array(asdf);
a[0] = 0;


const cpuHand = (node, alpha=-100, beta=100, depth=0, showStatus=false)=>{
		
    const startTime = performance.now();
    const children = node.expand();
    let rand=0, temp=0;

    if(children.length===0){
        return children;
    }
    
    for(const child of children){
        // calc eval of child
        child.e = -this.negaScout(child, alpha, beta, depth);
        // どこにおいたかを調べる
        child.hand1 = (node.black1|node.white1)^(child.black1|child.white1);
        child.hand2 = (node.black2|node.white2)^(child.black2|child.white2);
    }

    // sort
    children.sort((a,b)=>{return b.e-a.e;});
    
    //最大値がいくつあるかをrandにカウント
    for(let i=1;i<children.length;i++){
        if(~~children[0].e===~~children[i].e){
            rand = i;
        }else{
            break;
        }
    }
    
    //0番目とrand番目を入れ替える
    rand = ~~(Math.random() * rand);
    temp = children[0];
    children[0] = children[rand];
    children[rand] = temp;
    
    const process_time = (performance.now()-startTime).toPrecision(4);
    const node_per_second = (~~(this.num_readnode/process_time)).toPrecision(4);

    if(showStatus){
        console.log(
            "read " + this.num_readnode + " nodes\n" + 
            "process time " + process_time + " ms\n" + 
            node_per_second + " nodes per ms\n" + 
            "cpu put at " + children[rand].hand + "\n"
        );
    }
    
    return children;
}



const genWorker = ()=>{

    return new Promise((resolve)=>{
        const worker = new Worker("temp1.js");

        worker.addEventListener("message", msg=>{
            console.log(msg.data);
            //worker.terminate();
            resolve(msg.data);
        });
        worker.postMessage(a.buffer);
        //worker.postMessage(a.buffer, [a.buffer]);
    });
};

const execJobs = (N=1)=>{
    const jobs = new Array;

    for(let i=0;i<N;i++){
        const job = genWorker();
        jobs.push(job);
    }

    Promise.all(jobs).then(results=>{
        console.log(results);
    });
};



const wait = (t=0, m=0)=>{
    return new Promise(resolve=>{
        setTimeout(() => {
            console.log(m)
            resolve();
        }, t);
    })
}


const f1 = ()=>{
    return new Promise((resolve)=>{
        resolve(123);
    });
};

const f2 = async ()=>{
    await wait(1000);
    await wait(1000);
    await wait(1000);
    await wait(1000);
};

