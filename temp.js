
const generateModel = ()=>{

    const model = tf.sequential();
    model.add(tf.layers.conv2d({
        inputShape: [8, 8, 2],
        kernelSize: 3,
        filters: 64,
        strides: 1,
        padding: 'same',
        activation: 'relu',
        kernelInitializer: 'randomUniform',
    }));
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 64,
        strides: 1,
        padding: 'same',
        activation: 'relu',
        kernelInitializer: 'randomUniform',
    }));
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 64,
        strides: 1,
        padding: 'same',
        activation: 'relu',
        kernelInitializer: 'randomUniform',
    }));
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 64,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'randomUniform',
    }));
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 32,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'randomUniform',
    }));
    model.add(tf.layers.dropout({
        rate: 0.7
    }));
    model.add(tf.layers.flatten({}));
    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
    }));
    model.add(tf.layers.dense({
        units: 16,
        activation: 'relu',
    }));
    model.add(tf.layers.dense({
        units: 1,
        activation: 'relu',
    }));
    
    const LEARNING_RATE = 0.15;
    const optimizer = tf.train.sgd(LEARNING_RATE);
    model.compile({
        optimizer,
        loss: 'meanSquaredError',
        metrics: ['accuracy'],
    });

    return model;
};
const model = generateModel();



const loss = (batch, label)=>{
    return tf.tidy(()=>{
        const pred = model.predict(batch);
        const mean = pred.sub(label).square().mean();
        return mean;
    });
};

const generateData = ()=>{
    const batch_arr = new Array(64*2*8);
    const label_arr = new Array(0);
    const node = new Array(8);
    node[0] = master.generateNode(54);
    node[1] = ai.rotateBoard(node[0]);
    node[2] = ai.rotateBoard(node[1]);
    node[3] = ai.rotateBoard(node[2]);
    node[4] = ai.flipBoard(node[0]);
    node[5] = ai.rotateBoard(node[4]);
    node[6] = ai.rotateBoard(node[5]);
    node[7] = ai.rotateBoard(node[6]);
    const value = ai.negaScout(node[0], -64, 64, -1)/64+1;

    batch_arr.fill(0);
    label_arr.fill(0);
    
    for(let j=0;j<8;j++){
        for(let i=0;i<31;i++){
            if(node[j].boardArray[0]&(1<<(31-i))){
                batch_arr[64*2*j + i] = 1;
            }
            if(node[j].boardArray[1]&(1<<(31-i))){
                batch_arr[64*2*j + i+32] = 1;
            }
            if(node[j].boardArray[2]&(1<<(31-i))){
                batch_arr[64*2*j + i+64] = 1;
            }
            if(node[j].boardArray[3]&(1<<(31-i))){
                batch_arr[64*2*j + i+96] = 1;
            }
        }
        label_arr[j] = value;
    }
    

    return {batch_arr, label_arr};
};

const generateTrainingData = (BATCH_SIZE=1)=>{
    const batch_arr = new Float32Array(BATCH_SIZE*64*2*8);
    const label_arr = new Float32Array(BATCH_SIZE*8);

    for(let i=0;i<BATCH_SIZE;i++){
        const data = generateData();
        batch_arr.set(data.batch_arr, i*64*2*8);
        label_arr.set(data.label_arr, i*8);
    }

    const batch = tf.tensor4d(batch_arr, [BATCH_SIZE*8, 8, 8, 2]);
    const label = tf.tensor2d(label_arr, [BATCH_SIZE*8, 1]);

    return {batch, label};
};

const trainModel = async (iter=100)=>{
    for(let i=0;i<iter;i++){
        const data = generateTrainingData();
        const batch = data.batch;
        const label = data.label;
        await model.fit(batch, label);
    }
    
    // calculate loss
    const mse = tf.tidy(()=>{
        const data = generateTrainingData(200);
        const label = data.label.sub(tf.scalar(1)).mul(tf.scalar(64));
        const pred = model.predict(data.batch).sub(tf.scalar(1)).mul(tf.scalar(64));
        const loss = label.sub(pred).square().mean();
        return loss;
    });

    console.log(`loss: ${mse}`);

    /*for(let i=0;i<iter;i++){
        const data = generateTrainingData(10);
        const batch = data.batch;
        const label = data.label;
        optimizer.minimize(()=>{
            return loss(batch, label);
        });
    }*/
};

const tamesu = ()=>{
    const batch_arr = new Array(64*2);
    const label_arr = new Array(1);
    const node = master.generateNode(54);

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
    }

    const batch = tf.tensor4d(batch_arr, [1, 8, 8, 2]);
    const pred = model.predict(batch);
    const pred_arr = pred.dataSync();
    const true_value = ai.negaScout(node, -64, 64, -1);

    master.render(node);

    console.log(true_value, (pred_arr[0]-1)*64);
};