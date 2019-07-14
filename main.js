//property, display, confirmwindow

const property = new Object();
property.num_phase = 61;
property.num_shape = 10;
property.learning_rate = 1/8/2;
property.colorOfCpu = -1;
property.num_readnode = 0;
property.depth = 4;
property.depth_last = 12;
property.alpha = -100;
property.beta = 100;
property.clickDisabled = false;
property.player_state_pass = false;
property.touchcount = 0;
property.eventName = "mouseup";



const display = new Object();
display.squares = new Array();
display.circles = new Array();
display.black_score = document.getElementById("black_score");
display.white_score = document.getElementById("white_score");
display.comment = document.getElementById("comment");
display.board = document.getElementById("board");
display.pass = document.getElementById("pass");
display.switch = document.getElementById("switch_colors");




(()=>{
	//detect touch screen
	for(const name of ["iPhone", "Android", "Mobile", "iPad"]){
		if(navigator.userAgent.indexOf(name)!==-1){
			property.eventName = "touchend";
			break;
		}
	}
	
	
	//generate reversi board
	const reversiBoard = document.getElementById("test");
	for(let i=0;i<8;i++){
		const row = document.createElement("div");
		for(let i=0;i<8;i++){
			const box = document.createElement("div");
			const div = document.createElement("div");
			box.classList.add("board_box");
			row.classList.add("board_row");
			row.appendChild(box);
			box.appendChild(div);
			box.style.display = "inline-block";
			display.squares.push(box);
			display.circles.push(div);
		}
		reversiBoard.appendChild(row);
	}

	
	//add eventlistener to each cell
	for(let i=0;i<8;i++){
		for(let j=0;j<8;j++){
			const e = i*8 + j;
			display.squares[e].addEventListener(property.eventName, ()=>{
				if(property.clickDisabled){
					return;
				}
				if(property.player_state_pass){
					return;
				}
				property.clickDisabled = true;
				master.play(i<4?1<<(31-e):0, i<4?0:1<<(63-e))
				.then(()=>{
					property.clickDisabled = false;
				});
			});
		}
	}
	

	//detect 3-times-touch and go to kaihatsu-mode
	display.comment.addEventListener(property.eventName, e=>{
		e.preventDefault();
		property.touchcount++;
		setTimeout(()=>{property.touchcount=0;}, 300);
		if(property.touchcount>=3){
			const comment_text = display.comment.innerText;
			display.comment.innerText = "開発モード";
			property.touchcount = -1e9;
			setTimeout(() => {
				display.comment.innerText = comment_text;
				property.touchcount = 0;
			}, 3000);
		}
	});

	//on pulldown menu changed (depth)
	document.getElementById("search_depth").addEventListener("change", e=>{
		const value = e.target.value.split("/").map(x=>parseInt(x));
		property.depth = value[0];
		property.depth_last = value[1];
		property.alpha = value[2];
		property.beta = value[3];
	});

	//pass button
	document.getElementById("pass").addEventListener(property.eventName, e=>{
		if(property.player_state_pass){
			display.pass.style.display = "none";
			property.player_state_pass = false;
			master.play();
		}
	});

	//undo button
	document.getElementById("undo").addEventListener(property.eventName, e=>{
		master.undo();
	});

	//restart button
	document.getElementById("restart").addEventListener(property.eventName, e=>{
		confirmWindow(()=>{
			master.restart();
		})
	});

	//on window resized, fit board width to window
	const changeElementSize = ()=>{
		const w0 = Math.max(Math.min(500, window.innerWidth), 260);
		const w = w0 - 4 + "px";
		
		const header = document.getElementById("header");
		header.style.width = w;
		const test = document.getElementById("test");
		test.style.width = w;
		test.style.height = w;
		const footer1 = document.getElementById("footer1");
		footer1.style.width = w;
		const footer2 = document.getElementById("footer2");
		footer2.style.width = w;
	};
	changeElementSize();
	//pass button
	window.addEventListener("resize", ()=>{
		changeElementSize();
	});
})();



const confirmWindow = (res=()=>{}, rej=()=>{}, text_="are you sure?")=>{
	const background = document.createElement("div");
	background.style.position = "fixed";
	background.style.top = "0px";
	background.style.left = "0px";
	background.style.width = innerWidth + "px";
	background.style.height = innerHeight + "px";
	background.style.background = "#555555";
	background.style.opacity = "0.8";

	const box = document.createElement("div");
	box.style.position = "fixed";
	box.style.top = "60px";
	box.style.left = "50%";
	box.style.transform = "translate(-50%, 0%)";
	box.style.width = "300px";
	box.style.height = "100px";
	box.style.background = "#ffffff";
	box.style.borderRadius = "10px";

	const text = document.createElement("div");
	text.innerText = text_;
	text.style.fontSize = "14px";
	text.style.margin = "15px auto";

	const yes = document.createElement("div");
	yes.style.display = "inline-block";
	yes.innerText = "OK";
	yes.style.fontSize = "14px";
	yes.style.background = "#ff6347";
	yes.style.margin = "10px auto";
	yes.style.width = "80px";
	yes.style.height = "25px";
	yes.style.lineHeight = "26px";
	yes.style.borderRadius = "6px";

	const no = document.createElement("div");
	no.style.display = "inline-block";
	no.innerText = "Cancel";
	no.style.fontSize = "14px";
	no.style.background = "#bbb";
	no.style.margin = "10px 10px";
	no.style.width = "80px";
	no.style.height = "25px";
	no.style.lineHeight = "26px";
	no.style.borderRadius = "6px";



	box.appendChild(text);
	box.appendChild(yes);
	box.appendChild(no);
	background.appendChild(box);
	document.body.appendChild(background);

	yes.addEventListener("click", ()=>{
		res();
		background.remove();
	});
	no.addEventListener("click", ()=>{
		rej();
		background.remove();
	});

}


