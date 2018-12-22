//配列とpngを相互変換するクラス
//topng     配列を引数に受け取り、画像を最下部にappendする
//selectpng 読み込むpngをエクスプローラーから選ぶ
//loadpng   名前を指定してpngをロード
//読み込んだpngデータはthis.arrayに格納される

//仕様 最初1行は情報を格納するビット列
//最初の2ピクセル（72bit）は配列のサイズを格納する。

class data2png {
    constructor(){
        this.width = 100;
        this.height = 100;
        this.array = [];
    }

	toPng(arr){
		const cvs = document.createElement('canvas');
        document.body.appendChild(cvs);
		const ctx = cvs.getContext('2d');
		cvs.width = this.width;
        cvs.height = Math.max(this.height, 2 + ~~(arr.length/3/this.width));
        const imagedata = ctx.getImageData(0, 0 , cvs.width, cvs
            .height);
		const data = imagedata.data;
        
        
        const len = arr.length;
        data[0] = len&0xff;
        data[1] = (len&0xff00)>>>8;
        data[2] = (len&0xff0000)>>>16;
        data[3] = 255;
        data[4] = (len&0xff000000)>>>24;
        data[5] = 0;
        data[6] = 0;
        data[7] = 255;
        for(let i=2;i<this.width;i++){
            data[i*4+0] = 255;
            data[i*4+1] = 255;
            data[i*4+2] = 255;
            data[i*4+3] = 255;
        }
            
        
		for(let i=0, loop=arr.length/3;i<loop;i++){
			data[(i+this.width)*4+0] = arr[i*3+0];
			data[(i+this.width)*4+1] = arr[i*3+1];
			data[(i+this.width)*4+2] = arr[i*3+2];
            data[(i+this.width)*4+3] = 255;  
		}
		ctx.putImageData(imagedata,0,0);
		
		const png = cvs.toDataURL('img/png');
		const img = document.createElement('img');
		document.body.appendChild(img);
		img.src = png;
		
		cvs.remove();
	}
	
	selectPng(func){
        
        const that = this;
        let arr;
		
		const fileform = document.createElement("form");
		const file = document.createElement("input");
		file.id = "file";
		file.name = "file";
		file.type = "file";
		fileform.appendChild(file);
		document.body.appendChild(fileform);
		file.click();
		
		const setfile = document.getElementById("file");
		setfile.addEventListener("change", function(e){
			const file = e.target.files[0];
            const cvs = document.createElement('canvas');
            
			const ctx = cvs.getContext('2d');
			const img = new Image();
			const filereader = new FileReader();
			filereader.onload = (e)=>{
				img.onload = ()=>{
					cvs.width = img.naturalWidth;
					cvs.height = img.naturalHeight;
					ctx.drawImage(img,0,0,img.naturalWidth,img.naturalHeight);
				
				
					const imagedata = ctx.getImageData(0,0,cvs.width,cvs.height);
					const data = imagedata.data;
                    
                    const len = data[0]|(data[1]<<8)|(data[2]<<16)|(data[4]<<24);
                    arr = new Uint8ClampedArray(len);
                    for(let i=0, k=cvs.width*4;i<len;i++){
                        if(k%4===3){
                            k++;
                        }
                        arr[i] = data[k++];
                    }
                    that.array = arr;   
                    func();
					cvs.remove();
					console.log("image data loaded");
				};
				img.src = e.target.result;	
			};
			filereader.readAsDataURL(file);
		});
		fileform.remove();
	}
	
	loadPng(name, func){
		this.array = [];
		let arr = this.array;
		const that = this;
		const img = new Image();
		img.src = name;
		const cvs = document.createElement('canvas');
		const ctx = cvs.getContext('2d');
		
		img.onload = ()=> {
			cvs.width = img.naturalWidth;
			cvs.height = img.naturalHeight;
			ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
			
			const imagedata = ctx.getImageData(0,0,cvs.width,cvs.height);
            const data = imagedata.data;
            
            const len = data[0]|(data[1]<<8)|(data[2]<<16)|(data[4]<<24);
            arr = new Uint8ClampedArray(len);
            for(let i=0, k=cvs.width*4;i<len;i++){
                if(k%4===3){
                    k++;
                }
                arr[i] = data[k++];
            }
            that.array = arr;
            
            func();
			cvs.remove();
			console.log("image data was loaded successfully");
		}
    }
}