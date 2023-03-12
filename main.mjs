
import { BitBoard } from "./bitboard.mjs";
import {HistoryManager} from "./history.mjs";
import init, {
    initialize, 
    clear_btree,
    print_stats,
} from "./bitreversi-wasm/pkg/bitreversi_wasm.js";
import {loadWeightData, exportWeightDataAsBlob} from "./eval.mjs";

(async ()=>{
    await init();
    initialize();
    await loadWeightData();
    h5board.refreshDisplay(true);
})();


/*
    cell id:
    [63] [62] [61] [60] [59] [58] [57] [56]
    [55] [54] [53] [52] [51] [50] [49] [48]
    [47] [46] [45] [44] [43] [42] [41] [40]
    [39] [38] [37] [36] [35] [34] [33] [32]
    [31] [30] [29] [28] [27] [26] [25] [24]
    [23] [22] [21] [20] [19] [18] [17] [16]
    [15] [14] [13] [12] [11] [10] [ 9] [ 8]
    [ 7] [ 6] [ 5] [ 4] [ 3] [ 2] [ 1] [ 0]
*/
const cells = Array(64);
class H5Cell {
    constructor(id = 0){
        this.id = id;
        this.black = 0;
        this.white = 0;
        this.legalblack = 0;
        this.legalwhite = 0;
        this.text = '';
        this.move = 0;
    }
    
    validate(){
        if((this.black !== 0 && this.black !== 1) || 
            (this.white !== 0 && this.white !== 1) || 
            (this.black === 1 && this.white === 1) ||
            ((this.black === 1 || this.white === 1) && (this.legalblack === 1 || this.legalwhite === 1))) {
            throw `Validation error: legal is 1 at cell #${this.id}. 
            #${this.id}.black = ${this.black}, #${this.id}.white = ${this.white}`
        }
    }

    isEmpty(){
        return this.black === 0 && this.white === 0;
    }
}

for(let i=0; i<64; i++){
    cells[63 - i] = new H5Cell(i);
}



const bitToID = (x = 0n) => {
    for(let i=0n; i<64n; i += 1n){
        if(x & (1n<<i)){
            return Number(i)
        }
    }
};

const idToBit = (id = 0) => {
    return 1n << BigInt(id);
};

const parseCellID = e =>{
    if (e === null) {
        console.assert(h5board.gamemode === GAMEMODE_ANALYZER);
        return 64;
    }
    let id = e.target.id;
    if(id === ''){
        // Target id is null. Use parent element id instead.
        id = e.target.parentElement.id;
        if(id === ''){
            id = e.target.parentElement.parentElement.id;
            if(id === ''){
                throw 'id is null.';
            }
        }
    }
    return parseInt(id, 10);
};

// Wait 2 frames to refresh dom.
const refresh_dom = async () => {
    for (const i in [0, 0]) {
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
    return;
};

const refreshDisplay_helper = async (h5board, showlegalmove=0, move_id=-1) =>{
    h5board.bitboard.validate();

    // Clear cells first.
    for(let i=0; i<64; i+=1){
        const cell = h5board.getCell(i);
        cell.black = 0;
        cell.white = 0;
        cell.legalblack = 0;
        cell.legalwhite = 0;
        cell.text = '';
        cell.move = 0;

        const bit = idToBit(i);
        if(h5board.bitboard.black&bit){
            cell.black = 1;
        }else if(h5board.bitboard.white&bit){
            cell.white = 1;
        }
    }

    if(showlegalmove) h5board.showLegalMove();

    // Show last move.
    const last_move = h5board.histmgr.last_board().board.get_last_move();
    if (last_move >= 0) {
        h5board.getCell(last_move).move = 1;
    }

    // Update score.
    h5BlackScore.score = h5board.bitboard.numOfBlack();
    h5WhiteScore.score = h5board.bitboard.numOfWhite();
    h5BlackScore.turn = h5board.bitboard.turn === 1 ? true : false;
    h5WhiteScore.turn = h5board.bitboard.turn === -1 ? true : false;

    // Update comment.
    switch (h5board.bitboard.getState()){
        case 0:
            if(h5board.player_color === h5board.bitboard.turn){
                h5Comment.text = "Your Turn";
            }else{
                h5Comment.text = "AI Turn";
            }
            break;
        case 1:
            h5Comment.text = "Pass";
            break;
        case 2:
            const num_black = h5board.bitboard.numOfBlack();
            const num_white = h5board.bitboard.numOfWhite();
            if(num_black === num_white){
                h5Comment.text = "Draw";
            }else if(num_black > num_white){
                h5Comment.text = "Black Win";
            }else{
                h5Comment.text = "White Win";
            }
            break;
        default:
            throw 'Unreachable';
    }
    

    await refresh_dom();
    return;
}


const showLegalMove_helper = (h5board) => {
    const legal_move = h5board.bitboard.getLegalMove();
    console.debug(`legal_move = ${legal_move}`);

    for(let i=0; i<64; i++){
        const cell = h5board.getCell(i);
        const bit = 1n << BigInt(i);
        if(legal_move&bit){
            if (h5board.bitboard.turn === 1) {
                cell.legalblack = 1;
                cell.legalwhite = 0;
            } else {
                cell.legalblack = 0;
                cell.legalwhite = 1;
            }
        }else{
            cell.legalblack = 0;
            cell.legalwhite = 0;
        }
    }
}

const putStone_helper = (h5board, id) => {
    console.debug(`putStone_helper(id = ${id})`);
    const move = idToBit(id);

    if (h5board.bitboard.isLegalMove(move)) {
        h5board.bitboard = h5board.bitboard.putStone(move);
    } else {
        throw 'You cannot put stone here.';
    }
};


const showEvaluation_helper = (h5board, alpha=-100, beta=100) => {
    let evals = h5board.bitboard.expand_children_orderby_complete_read();
    for (const child of evals){
        const id = bitToID(BigInt(child.last_move));
        h5board.getCell(id).text = child.eval;
    }
};


const showEvaluation_approx_helper = (h5board, alpha=-0xff, beta=0xff, depth=0) => {
    let evals = h5board.bitboard.expand_children_orderby_eval(depth);
    for (const child of evals){
        const id = bitToID(BigInt(child.last_move));
        h5board.getCell(id).text = child.eval;
    }
};


const ai_helper = (h5board)=> {
    const board = h5board.bitboard;
    const num_stones = board.numOfStones();
    let children;

    if (64-num_stones <= h5board.search_depth_last) {
        // Complete read.
        if (num_stones >= 50) {
            // Complete read.
            children = h5board.bitboard.expand_children_orderby_mtdf();
        } else {
            // mtdf read
            children = h5board.bitboard.expand_children_orderby_mtdf();
        }
    } else {
        // Approx read.
        children = h5board.bitboard.expand_children_orderby_eval(h5board.search_depth);
    }

    console.debug(children);
    return new Promise(resolve => {
        resolve(BigInt(children[0].last_move));
    });
};

const BITBOARD_STATE_NEXT = 0;
const BITBOARD_STATE_PASS = 1;
const BITBOARD_STATE_END = 2;

const proceed_game = async (h5board, id=null) => {
    console.debug("proceed_game");
    if (id!==null && h5board.bitboard.isLegalMove(idToBit(id))){
        h5board.histmgr.push_board(h5board);
        await h5board.putStone(id, 1);
    }

    while(true) {
        const state = h5board.bitboard.getState();
        console.debug(`BitBoard state is ${state}.`);

        switch(state){
            case BITBOARD_STATE_NEXT:
                if (h5board.bitboard.turn == h5board.player_color) {
                    console.debug("Next: player turn.");
                    await h5board.refreshDisplay(true);
                    return;
                } else {
                    console.debug("Next: AI turn.");
                    const aimove = await ai_helper(h5board);
                    const id = bitToID(aimove);
                    console.debug(`AI move: cell #${id}. move = (${aimove})`);
                    await h5board.putStone(id, true);
                    h5board.histmgr.last_board().board.last_move = id;
                    await h5board.refreshDisplay(true);
                    break;
                }
            
            case BITBOARD_STATE_PASS:
                if (h5board.bitboard.turn == h5board.player_color) {
                    console.debug("Player pass. Continue while loop.");
                    h5Notification.pass = true;
                    await refresh_dom();
                    h5board.bitboard.turn *= -1;
                    await h5board.refreshDisplay(true);
                    return;
                } else {
                    console.debug("AI pass. Next: player turn.");
                    h5board.bitboard.turn *= -1;
                    await h5board.refreshDisplay(true);
                    return;
                }
                
            case BITBOARD_STATE_END: 
                console.debug("Game end.");
                return;
            default:
                throw 'We should not reach here.';
        }
        await h5board.refreshDisplay(true);
    }

};


const GAMEMODE_GAME = 0;
const GAMEMODE_SETUP = 1;
const GAMEMODE_ANALYZER = 2;


const h5board = new Vue({
    el: '#htmlboard',
    data: {
        // cells should not be accessed directly.
        // Use this.getCell(id)
        cells: cells,
        bitboard: new BitBoard(),
        histmgr: new HistoryManager(),
        gamemode: GAMEMODE_GAME,
        player_color: 1, // 1: black, -1: white
        search_depth: 4,
        search_depth_last: 12,
    },

    methods: {
        async onCellClick(e){
            const id = parseCellID(e);
            console.assert(id>=0 && id<=64, `id = ${id}`);
            console.debug(`Invoking #${id} click event.`);

            switch(this.gamemode){
            case GAMEMODE_GAME:
                console.assert(this.bitboard.turn === this.player_color);
                proceed_game(this, id);
                await this.refreshDisplay(true);
                return;

            case GAMEMODE_SETUP:
                const bit = 1n << BigInt(id);
                if(this.bitboard.black&bit){
                    this.bitboard.black ^= bit;
                    this.bitboard.white ^= bit;
                    await this.refreshDisplay();
                    return;
                }
                if(this.bitboard.white&bit){
                    this.bitboard.white ^= bit;
                    await this.refreshDisplay();
                    return;
                }
                // If we reach here, cell#id is empty.
                this.bitboard.black ^= bit;
                await this.refreshDisplay();
                return;

            case GAMEMODE_ANALYZER: {
                this.putStone(id);
                const num_stones = h5board.bitboard.numOfStones();
                if (64-num_stones <= h5board.search_depth_last){
                    // Complete read.
                    h5board.showEvaluation(-0xff, 0xff);
                }else{
                    // Approx read.
                    h5board.showEvaluation_approx(-0xff, 0xff, h5board.search_depth)
                }
                break;
            }
                
            default:
                throw 'We should not reach here.';
            }
        },

        async putStone(id, showlegalmove){
            putStone_helper(this, id);
            await this.refreshDisplay(showlegalmove, id);
            return;
        },

        async refreshDisplay(showlegalmove, move_id){
            console.log(`Refreshing display. showlegalmove = ${showlegalmove}`);
            await refreshDisplay_helper(this, showlegalmove, move_id);
        },

        showLegalMove(){
            console.log('Calc legal move and refresh display.');
            showLegalMove_helper(this);
        },

        async showEvaluation(alpha=-100, beta=100){
            console.log('showEvaluation');
            await this.refreshDisplay();
            showEvaluation_helper(this, alpha, beta);
        },

        async showEvaluation_approx(alpha=-0xff, beta=0xff, depth=0){
            console.log('showEvaluation_approx');
            await this.refreshDisplay();
            //this.bitboard.expand_children_orderby_eval(0);
            showEvaluation_approx_helper(this, alpha, beta, depth);
        },

        getCell(id){
            return this.cells[63 - id];
        }
    },
});



const h5Notification = new Vue({
    el: '#notification',
    data: {
        text: "Pass (Tap to Proceed)",
        pass: false,
    },
    methods: {
        async onClickHandler(){
            this.pass = false;
            await refresh_dom();
            proceed_game(h5board);
        }
    }
});


const h5Comment = new Vue({
    el: '#comment',
    data: {
        text: ""
    }
});
const h5BlackScore = new Vue({
    el: '#black_score',
    data: {
        score: 2,
        turn: false,
    }
});
window.h5BlackScore = h5BlackScore;
const h5WhiteScore = new Vue({
    el: '#white_score',
    data: {
        score: 2,
        turn: false,
    }
});


const h5SearchDepth = new Vue({
    el: '#search_depth',
    data: {
        options: [
            {name:'1/1 move', selected: false},
            {name:'2/2 moves', selected: false},
            {name:'4/4 moves', selected: false},
            {name:'4/12 moves', selected: true},
            {name:'6/12 moves', selected: false},
            {name:'6/16 moves', selected: false},
            {name:'8/16 moves', selected: false},
            {name:'8/18 moves', selected: false},
        ],
    },
    methods: {
        onChangeHandler(e){
            const str = e.target.value;
            const depth = str.split(' ')[0]
                            .split('/')
                            .map(x => parseInt(x, 10));
            h5board.search_depth = depth[0];
            h5board.search_depth_last = depth[1];
            document.getElementById('search_depth').blur();
            console.log(`Search depth changed. search_depth = ${depth[0]}, search_depth_last = ${depth[1]}`);
        },
    }
});


const h5Advance = new Vue({
    el: '#advance',
    data: {
        options: [
            {name:'Advance'},
            {name:'Show Evaluation'},
            {name:'Clear BTree'},
            {name:'Download Data'},
            {name:'Dump Stats'},
        ],
    },
    methods: {
        onChangeHandler(e){
            console.log(`Advanced option: ${e.target.value}`);
            
            switch(e.target.value){
                case 'Show Evaluation':
                    const num_stones = h5board.bitboard.numOfStones();
                    if (64-num_stones <= h5board.search_depth_last){
                        // Complete read.
                        h5board.showEvaluation(-0xff, 0xff);
                    }else{
                        // Approx read.
                        h5board.showEvaluation_approx(-0xff, 0xff, h5board.search_depth)
                    }
                    break;
                case 'Download Data':
                    this.downloadData();
                    break;
                case 'Clear BTree':
                    this.clearBTree();
                    break;
                case 'Dump Stats':
                    this.dumpSettings();
                    break;
                default:
                    throw 'Unreachable';
            }
            
            document.getElementById('advance').selectedIndex = 0;
            document.getElementById('advance').blur();
        },

        downloadData(){
            const blob = exportWeightDataAsBlob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "eval_data.bin";
            a.click();
            a.remove();
        },

        clearBTree(){
            const btree_length = clear_btree();
            console.log(`BTree size = ${btree_length}`);
        },

        dumpSettings(){
            const div = document.createElement('div');
            document.body.append(div);
            div.innerText = `
            gamemode: ${h5board.gamemode},
            player_color: ${h5board.player_color},
            search_depth: ${h5board.search_depth},
            search_depth_last: ${h5board.search_depth_last},
            stats: ${print_stats()},
            `;

            // Clear setting in 10 secs.
            window.setTimeout(()=>{
                div.remove();
            }, 1000 * 10);
        }
    }
});


const h5ColorButton = new Vue({
    el: '#player_color',
    data: {
        options: [
            {name:'Player: Black'},
            {name:'Player: White'},
        ],
    },
    methods: {
        onChangeHandler(e){
            console.log(`Player color changed: ${e.target.value}`);
            
            switch(e.target.value){
                case 'Player: Black':
                    h5board.player_color = 1;
                    break;
                case 'Player: White':
                    h5board.player_color = -1;
                    break;
                default:
                    throw 'Unreachable';
            }
            document.getElementById('player_color').blur();
            
            if(h5board.gamemode === GAMEMODE_GAME){
                proceed_game(h5board, null);
            }
        },
    }
});


const h5_reset_button = new Vue({
    el: '#reset',
    date: {},
    methods: {
        onClickResetHandler(){
            console.log(`Reset button pressed.`);
            h5board.bitboard = new BitBoard();
            h5board.gamemode = GAMEMODE_GAME;
            h5board.histmgr.push_board(h5board);
            gamemode_onchanged_helper("Proceed as Black");
            h5board.refreshDisplay(true);
            proceed_game(h5board, null);
        },
    }
});


const h5_undo_button = new Vue({
    el: '#undo',
    date: {},
    methods: {
        onClickResetHandler(){
            console.log(`Undo button pressed.`);
            const last_board = h5board.histmgr.pop_board();
            h5board.bitboard = last_board.board.clone();
            h5board.gamemode = last_board.data.gamemode;
            h5board.player_color = last_board.data.player_color;
            h5board.search_depth = last_board.data.search_depth;
            h5board.search_depth_last = last_board.data.search_depth_last;

            h5board.refreshDisplay(true);
        },
    }
});



const gamemode_onchanged_helper = (value) => {
    console.log(`Mode changed: ${value}`);
            
    switch(value){
        case 'Geme Mode':
            h5board.gamemode = GAMEMODE_GAME;
            h5board.refreshDisplay(true);
            break;
        case 'Proceed as Black':
            h5board.gamemode = GAMEMODE_GAME;
            h5board.bitboard.turn = 1;
            // Disable "Proceed as" option.
            h5ModeButton.options[1].disabled = true;
            h5ModeButton.options[2].disabled = true;
            // Enable 'Game Mode'
            h5ModeButton.options[0].disabled = false;
            // Select 'Game Mode'
            document.getElementById('mode').selectedIndex = 0;
            proceed_game(h5board, null);
            h5board.refreshDisplay(true);
            break;
        case 'Proceed as White':
            h5board.gamemode = GAMEMODE_GAME;
            h5board.bitboard.turn = -1;
            // Disable "Proceed as" option.
            h5ModeButton.options[1].disabled = true;
            h5ModeButton.options[2].disabled = true;
            // Enable 'Game Mode'
            h5ModeButton.options[0].disabled = false;
            // Select 'Game Mode'
            document.getElementById('mode').selectedIndex = 0;
            proceed_game(h5board, null);
            h5board.refreshDisplay(true);
            break;
        case 'Setup Mode':
            h5board.gamemode = GAMEMODE_SETUP;
            // Enable "Proceed as" option.
            h5ModeButton.options[1].disabled = false;
            h5ModeButton.options[2].disabled = false;
            // Disable 'Game Mode'
            h5ModeButton.options[0].disabled = true;
            h5board.refreshDisplay();
            break;
        case 'Analyzer Mode':
            h5board.gamemode = GAMEMODE_ANALYZER;
            // Enable "Proceed as" option.
            h5ModeButton.options[1].disabled = false;
            h5ModeButton.options[2].disabled = false;
            // Disable 'Game Mode'
            h5ModeButton.options[0].disabled = true;
            h5board.onCellClick(null);
            break;
        default:
        
    }
};


const h5ModeButton = new Vue({
    el: '#mode',
    data: {
        options: [
            {name:'Geme Mode', disabled: false},
            {name:'Proceed as Black', disabled: true},
            {name:'Proceed as White', disabled: true},
            {name:'Setup Mode', disabled: false},
            {name:'Analyzer Mode', disabled: false},
        ],
    },

    methods: {
        onChangeHandler(e){
            document.getElementById('mode').blur();
            gamemode_onchanged_helper(e.target.value);
        },
    }
});


window.h5board = h5board;
window.BitBoard = BitBoard;