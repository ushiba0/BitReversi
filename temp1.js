
self.addEventListener('message', e=>{
    const buffer  = e.data;
    const arr = new Int32Array(buffer);
    
    for(let i=0;i<10000;i++){
        for(let j=0;j<10;j++){
            158730n%13433n;
        }
        const a = arr[0];
        const b = a + 1;
        arr[0] = b;
    }
    self.postMessage(arr[0]);
});