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


const squares = new Array();
const circles = new Array();
const comment = document.createElement('div');
const black_score = document.createElement('div');
const white_score = document.createElement('div');
(()=>{

	// generate board table
    const table = document.createElement('table');
	for(let i=0;i<8;i++){
		const tr = document.createElement('tr');
		for(let j=0;j<8;j++){
			const td = document.createElement('td');
			const div = document.createElement('div');
			div.className = 'blank';
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

    // set class name
    black_score.className = 'scorebox';
    white_score.className = 'scorebox';
    comment.className = '';

    // set score box
    const black_stone = document.createElement('div');
    const white_stone = document.createElement('div');
    black_stone.className = 'black';
    white_stone.className = 'white';
    black_score.appendChild(black_stone);
    white_score.appendChild(white_stone);



    document.body.appendChild(comment);
    document.body.appendChild(black_score);
    document.body.appendChild(white_score);
	document.body.appendChild(table);
})();