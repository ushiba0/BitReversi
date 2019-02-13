
const generateModel = ()=>{
    const rate = 0.5;
    const model = tf.sequential();
    const LEARNING_RATE = 0.01;
    const optimizer = tf.train.sgd(LEARNING_RATE);


    model.add(tf.layers.conv2d({
        inputShape: [8, 8, 3],
        kernelSize: 3,
        filters: 64,
        strides: 1,
        padding: 'same',
        activation: 'relu',
        kernelInitializer: 'VarianceScaling',
    }));
    for(let i=0;i<6;i++){
        model.add(tf.layers.conv2d({
            kernelSize: 3,
            filters: 64,
            strides: 1,
            padding: 'same',
            activation: 'relu',
            kernelInitializer: 'VarianceScaling',
        }));
    }
    model.add(tf.layers.maxPooling2d({
        poolSize: [2, 2],
        strides: [2, 2],
    }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({
        units: 64,
        kernelInitializer: 'VarianceScaling',
        activation: 'relu',
    }));
    model.add(tf.layers.dense({
        units: 64,
        kernelInitializer: 'VarianceScaling',
        activation: 'relu',
    }));
    model.add(tf.layers.dense({
        units: 2,
        kernelInitializer: 'VarianceScaling',
        activation: 'softmax',
    }));
    
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        //metrics: ['accuracy'],
    });

    return model;
};
let model = generateModel();


const loadModel = async ()=>{
    model = await tf.loadModel('http://127.0.0.1:5500/my-model-1.json');
    model.compile({
        optimizer: tf.train.sgd(0.01),
        loss: 'categoricalCrossentropy',
        //metrics: ['accuracy'],
    });
};

const generateData = ()=>{
    const batch_arr = new Array(64*3*8);
    const label_arr = new Array(2*8);
    const node = new Array(8);
    const stones = ~~(Math.random()*12) + 48;
    node[0] = master.generateNode(stones);
    node[1] = ai.rotateBoard(node[0]);
    node[2] = ai.rotateBoard(node[1]);
    node[3] = ai.rotateBoard(node[2]);
    node[4] = ai.flipBoard(node[0]);
    node[5] = ai.rotateBoard(node[4]);
    node[6] = ai.rotateBoard(node[5]);
    node[7] = ai.rotateBoard(node[6]);
    const value = ai.negaScout(node[0], -1, 1, -1);

    batch_arr.fill(0);
    label_arr.fill(0);
    
    for(let j=0;j<8;j++){
        const legalhand = node[j].getMove();
        for(let i=0;i<31;i++){
            if(node[j].boardArray[0]&(1<<(31-i))){
                batch_arr[64*3*j + i] = 1;
            }
            if(node[j].boardArray[1]&(1<<(31-i))){
                batch_arr[64*3*j + i+32] = 1;
            }
            if(node[j].boardArray[2]&(1<<(31-i))){
                batch_arr[64*3*j + i+64] = 1;
            }
            if(node[j].boardArray[3]&(1<<(31-i))){
                batch_arr[64*3*j + i+96] = 1;
            }
            if(legalhand[0]&(1<<(31-i))){
                batch_arr[64*3*j + i+128] = 1;
            }
            if(legalhand[1]&(1<<(31-i))){
                batch_arr[64*3*j + i+160] = 1;
            }
        }

        if(value>0){
            label_arr[j*2+0] = 1;
            label_arr[j*2+1] = 0;
        }else if(value<0){
            label_arr[j*2+0] = 0;
            label_arr[j*2+1] = 1;
        }else{
            label_arr[j*2+0] = 0.5;
            label_arr[j*2+1] = 0.5;
        }
    }
    

    return {batch_arr, label_arr};
};

const generateTrainingData = (BATCH_SIZE=1)=>{
    const batch_arr = new Float32Array(BATCH_SIZE*64*3*8);
    const label_arr = new Float32Array(BATCH_SIZE*8*2);

    for(let i=0;i<BATCH_SIZE;i++){
        const data = generateData();
        batch_arr.set(data.batch_arr, i*64*3*8);
        label_arr.set(data.label_arr, i*8*2);
    }

    const batch = tf.tensor4d(batch_arr, [BATCH_SIZE*8, 8, 8, 3]);
    const label = tf.tensor2d(label_arr, [BATCH_SIZE*8, 2]);

    return {batch, label};
};

const trainModel = async (iter=100)=>{
    for(let i=0;i<iter;i++){
        const data = generateTrainingData();
        const batch = data.batch;
        const label = data.label;
        await model.fit(batch, label);

        batch.dispose();
        label.dispose();

        if((i+1)%100===0){
            // calculate loss
            const mse = tf.tidy(()=>{
                const data = generateTrainingData(200);
                const pred = model.predict(data.batch);
                const loss = data.label.sub(pred).square().mean();
                return loss.mul(tf.scalar(100));
            });
            
            console.log(`epoch: ${(i+1)/100} loss: ${mse}`);

            mse.dispose();

        }

    }
    
    console.log(`train fin`);

    /*for(let i=0;i<iter;i++){
        const data = generateTrainingData(10);
        const batch = data.batch;
        const label = data.label;
        optimizer.minimize(()=>{
            return loss(batch, label);
        });
    }*/
};

const tamesu = (N=54)=>{
    const batch_arr = new Array(64*3);
    const label_arr = new Array(1);
    const node = master.generateNode(N);
    const legalhand = node.getMove();

    batch_arr.fill(0);
    label_arr.fill(0);

    for(let i=0;i<31;i++){
        if(node.boardArray[0]&(1<<(31-i))){
            batch_arr[i] = 1;
        }
        if(node.boardArray[1]&(1<<(31-i))){
            batch_arr[i+32] = 1;
        }
        if(node.boardArray[2]&(1<<(31-i))){
            batch_arr[i+64] = 1;
        }
        if(node.boardArray[3]&(1<<(31-i))){
            batch_arr[i+96] = 1;
        }
        if(legalhand[0]&(1<<(31-i))){
            batch_arr[i+128] = 1;
        }
        if(legalhand[1]&(1<<(31-i))){
            batch_arr[i+160] = 1;
        }
    }

    const batch = tf.tensor4d(batch_arr, [1, 8, 8, 3]);
    const pred = model.predict(batch);
    const pred_arr = pred.dataSync();
    const true_value = ai.negaScout(node, -1, 1, -1);

    master.render(node);

    console.log(true_value, pred_arr);

    batch.dispose();
    pred.dispose();
};