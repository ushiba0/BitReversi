const size = 40;
let clickDisabled = false;


const property = new Object();
property.num_phase = 61;
property.num_shape = 10;
property.learning_rate = 1/8/2;
property.colorOfCpu = -1;
property.num_readnode = 0;
property.depth = [2, 4];
property.depth0 = 4;
property.depth1 = 4;
property.clickDisabled = false;
property.touchScreen = false;





const createElement = (element="div", property={})=>{
    const div = document.createElement(element);
    div.className = property.className || "";
    div.id = property.id || "";
    return div;
};


const display = new Object();
display.squares = new Array();
display.circles = new Array();
display.black_score = createElement('div', {id:"black_score"});
display.white_score = createElement('div', {id:"white_score"});
display.comment = createElement('div', {id:"comment"});
display.board = createElement('div', {id:"board"});




(()=>{
	//detect touch screen
	for(const name of ["iPhone", "Android", "Mobile", "iPad"]){
		property.touchScreen = false;
		if(navigator.userAgent.indexOf(name)!==-1){
			property.touchScreen = true;
			break;
		}
	}

	// generate board table
    const table = createElement('table');
	for(let i=0;i<8;i++){
		const tr = createElement('tr');
		for(let j=0;j<8;j++){
			const td = createElement('td');
			const div = createElement('div', {className:"blank"});
			// on mouse click
			td.addEventListener(property.touchScreen?"touchend":"mouseup", ()=>{
				const e = i*8 + j;
				master.play(i<4?1<<(31-e):0, i<4?0:1<<(63-e));
			});

			td.appendChild(div);
			tr.appendChild(td);
			display.squares.push(td);
			display.circles.push(div);
		}
		table.appendChild(tr);
	}


    // initialize comment box
    display.comment.innerText = 'player turn';
    

    display.board.appendChild(table);

    // set score box
    const black_stone = createElement('div', {className:"black minimize", id:"black_stone"});
	const white_stone = createElement('div', {className:"white minimize", id:"white_stone"});
    document.body.appendChild(black_stone);
    document.body.appendChild(display.black_score);
    document.body.appendChild(white_stone);
	document.body.appendChild(display.white_score);


	// append search depth box
	const depth0 = createElement('div', {id:"depth0"});
	const depth1 = createElement('div', {id:"depth1"});
	depth0.innerText = 4;
	depth1.innerText = 4;
	document.body.appendChild(depth0);
	document.body.appendChild(depth1);


	
	// set click event of search depth
	const changeDepth = (e)=>{

	};
	document.body.addEventListener(property.touchScreen?"touchend":"mouseup", (e)=>{
		const target = e.target;
		
		if(target.id==='depth0'){
			const list = ['1', '2', '4', '6', '8', '1'];
			const indexof = list.indexOf(target.innerText);
			const depth = list[indexof + 1];
			target.innerText = depth;
			property.depth0 = parseInt(depth, 10);
			return;
		}
		if(target.id==='depth1'){
			const list = ['4', '6', '8', '12', '16', '4'];
			const indexof = list.indexOf(target.innerText);
			const depth = list[indexof + 1];
			target.innerText = depth;
			property.depth1 = parseInt(depth, 10);
			return;
		}

		//三回連続クリックの判定
		touchcount++;
		setTimeout(()=>{touchcount=0;}, 300);
		if(touchcount>=3){
			const comment_text = display.comment.innerText;
			display.comment.innerText = "開発モード";
			touchcount = -1e9;
			setTimeout(() => {
				display.comment.innerText = comment_text;
				touchcount = 0;
			}, 3000);
		}
	});
})();

let touchcount =0;
document.body.appendChild(display.comment);
document.body.appendChild(display.board);