const size = 40;


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
property.player_state_pass = false;




const createElement = (element="div", property={})=>{
    const div = document.createElement(element);
    div.className = property.className || "";
    div.id = property.id || "";
    return div;
};


const display = new Object();
display.squares = new Array();
display.circles = new Array();
display.black_score = document.getElementById("black_score");
display.white_score = document.getElementById("white_score");

display.comment = document.getElementById("comment");
display.board = document.getElementById("board");
display.pass = document.getElementById("pass");
display.switch = document.getElementById("switch_colors");



let w = Math.max(Math.min(window.innerWidth, 750), 200);
window.addEventListener("resize", ()=>{
	
});


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
				if(property.clickDisabled){
					return;
				}
				if(property.player_state_pass){
					return;
				}
				property.clickDisabled = true;
				const e = i*8 + j;
				master.play(i<4?1<<(31-e):0, i<4?0:1<<(63-e))
				.then(()=>{
					property.clickDisabled = false;
				});
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
    /*const black_stone = createElement('div', {className:"black minimize", id:"black_stone"});
	const white_stone = createElement('div', {className:"white minimize", id:"white_stone"});
    document.body.appendChild(black_stone);
    document.body.appendChild(display.black_score);
    document.body.appendChild(white_stone);
	document.body.appendChild(display.white_score);*/

	
	document.body.addEventListener(property.touchScreen?"touchend":"mouseup", (e)=>{
		const target = e.target;
		
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

	//on pulldown menu changed (depth)
	document.getElementById("search_depth").addEventListener("change", e=>{
		const value = e.target.value.split("/").map(x=>parseInt(x));
		property.depth0 = value[0];
		property.depth1 = value[1];
	});

	//pass button
	document.getElementById("pass").addEventListener(property.touchScreen?"touchend":"mouseup", e=>{
		if(property.player_state_pass){
			display.pass.style.display = "none";
			property.player_state_pass = false;
			master.play();
		}
	});
})();

let touchcount =0;
//document.body.appendChild(display.comment);
//document.body.appendChild(display.board);



const tds = document.getElementsByTagName("td");
for(let i=0;i<tds.length;i++){
	tds[i].style.height = "35px";
	tds[i].style.width = "35px";
}