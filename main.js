const size = 40;
let counter = 0;
let clickDisabled = false;
const canvas = new Object();


class CONSTANTS{
    constructor(){
		this.num_phase = 61;
		this.num_shape = 11;
		this.learning_rate = 1/2/4;
		this.colorOfCpu = -1;
        this.num_readnode = 0;
        this.depth = [2,4];
    }
}

const createElement = (element='',className='', id='')=>{
    if(element===''){
        element = 'div';
    }
    const div = document.createElement(element);
    if(className!==''){
        div.className = className;
    }
    if(id!==''){
        div.id = id;
    }
    return div;
};

const container = document.body;
const black_score = createElement('div', '', 'black_score');
const white_score = createElement('div', '', 'white_score');
const comment = createElement('div', '', 'comment');
const board = createElement('div', '', 'board');




const squares = new Array();
const circles = new Array();
const package = createElement('div');

(()=>{


	// generate board table
    const table = createElement('table');
	for(let i=0;i<8;i++){
		const tr = createElement('tr');
		for(let j=0;j<8;j++){
			const td = createElement('td');
			const div = createElement('div', 'blank');
			// on mouse click
			td.addEventListener('mousedown', ()=>{
				const e = i*8 + j;
				master.play(i<4?1<<(31-e):0, i<4?0:1<<(63-e));
			});
			// on touch start
			td.addEventListener('touchstart', ()=>{
				const e = i*8 + j;
				master.play(i<4?1<<(31-e):0, i<4?0:1<<(63-e));
			});

			td.appendChild(div);
			tr.appendChild(td);
			squares.push(td);
			circles.push(div);
		}
		table.appendChild(tr);
	}


    // initialize comment box
    comment.innerText = 'player turn';
    

    board.appendChild(table);

    // set score box
    const black_stone = createElement('div', 'black minimize', 'black_stone');
    const white_stone = createElement('div', 'white minimize', 'white_stone');
    container.appendChild(black_stone);
    container.appendChild(black_score);
    container.appendChild(white_stone);
	container.appendChild(white_score);


	
	window.addEventListener('click', (e)=>{
		const target = e.target;
		console.log(target);

		if(target.id==='depth0'){
			const list = ['1', '2', '4', '6', '8', '1'];
			const indexof = list.indexOf(target.innerText);
			target.innerText = list[indexof + 1];
		}
		if(target.id==='depth1'){
			const list = ['4', '6', '8', '12', '16', '4'];
			const indexof = list.indexOf(target.innerText);
			target.innerText = list[indexof + 1];
		} 
	});
	
})();


container.appendChild(comment);
container.appendChild(board);