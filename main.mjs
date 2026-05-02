import { BitBoard } from "./bitboard.mjs";
import { HistoryManager } from "./history.mjs";
import init, {
    initialize,
    clear_btree,
    print_stats,
} from "./bitreversi/pkg/bitreversi.js";
import { loadWeightData } from "./eval.mjs";

/*
    Cell IDs Map:
    63 62 61 60 59 58 57 56
    55 54 53 52 51 50 49 48
    47 46 45 44 43 42 41 40
    39 38 37 36 35 34 33 32
    31 30 29 28 27 26 25 24
    23 22 21 20 19 18 17 16
    15 14 13 12 11 10  9  8
     7  6  5  4  3  2  1  0
*/

/**
 * Converts a single bit to a cell ID (0-63). Returns 64 if no bit is set.
 */
const bit2CellID = (x = 0n) => {
    if (x === 0n) return 64;
    // Fast way to get bit position using string length of binary representation
    return x.toString(2).length - 1;
};

const CellIdToBit = (id = 0) => {
    return 1n << BigInt(id);
};

/**
 * Represents a single cell on the board for the UI.
 */
class H5Cell {
    constructor(id = 0) {
        this.id = id;
        this.black = 0;
        this.white = 0;
        this.legalblack = false;
        this.legalwhite = false;
        this.text = '';
        this.highlight_last_move = false;
    }

    isEmpty() {
        return this.black === 0 && this.white === 0;
    }
}

// Initialize cells array (0-63)
const createInitialCells = () => {
    const arr = Array(64);
    for (let i = 0; i < 64; i++) {
        arr[63 - i] = new H5Cell(i);
    }
    return arr;
};

/**
 * Parses the cell ID from a Click Event.
 */
const parseCellID = e => {
    if (e === null) {
        return 64;
    }
    let target = e.target;
    // Traverse up to find the element with an ID (handling nested icons or labels)
    while (target && target.id === '') {
        target = target.parentElement;
    }
    if (!target || target.id === '') {
        throw new Error('Could not parse Cell ID from target');
    }
    return parseInt(target.id, 10);
};

/**
 * Tells Vue to wait until the DOM is updated.
 */
const refresh_dom = async (vm) => {
    await vm.$nextTick();
};

const refreshDisplay_helper = async (h5board, show_legal_move = false) => {
    h5board.bitboard.validate();

    const blackBits = h5board.bitboard.black;
    const whiteBits = h5board.bitboard.white;

    // Synchronize H5Cell states with BitBoard
    for (let i = 0; i < 64; i += 1) {
        const cell = h5board.getCell(i);
        const bit = CellIdToBit(i);

        cell.black = (blackBits & bit) ? 1 : 0;
        cell.white = (whiteBits & bit) ? 1 : 0;
        cell.legalblack = false;
        cell.legalwhite = false;
        cell.text = '';
        cell.highlight_last_move = false;
    }

    if (show_legal_move) show_legal_move_in_dom(h5board);

    // Show last move
    const last_move = h5board.bitboard.get_last_move();
    if (last_move >= 0 && last_move < 64) {
        h5board.getCell(last_move).highlight_last_move = true;
    }

    // Update global score displays
    h5board.blackScore.score = h5board.bitboard.numOfBlack();
    h5board.whiteScore.score = h5board.bitboard.numOfWhite();
    h5board.blackScore.turn = h5board.bitboard.turn === 1;
    h5board.whiteScore.turn = h5board.bitboard.turn === -1;

    // Update game status comment
    switch (h5board.bitboard.getState()) {
        case 0: // Next move
            h5board.commentText = (h5board.player_color === h5board.bitboard.turn) ? "Your Turn" : "AI Turn";
            break;
        case 1: // Pass
            h5board.commentText = "Pass";
            break;
        case 2: // End
            const nb = h5board.bitboard.numOfBlack();
            const nw = h5board.bitboard.numOfWhite();
            if (nb === nw) h5board.commentText = "Draw";
            else if (nb > nw) h5board.commentText = "Black Win";
            else h5board.commentText = "White Win";
            break;
        default:
            throw new Error('Unreachable state');
    }

    await h5board.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));
};

const show_legal_move_in_dom = (h5board) => {
    const legal_move = h5board.bitboard.getLegalMove();
    const turn = h5board.bitboard.turn;

    for (let i = 0; i < 64; i++) {
        const cell = h5board.getCell(i);
        const bit = CellIdToBit(i);
        if (legal_move & bit) {
            if (turn === 1) {
                cell.legalblack = true;
            } else if (turn === -1) {
                cell.legalwhite = true;
            } else {
                throw new Error('Unreachable');
            }
        }
    }
};

const putStone_helper = (h5board, id) => {
    const move = CellIdToBit(id);
    if (h5board.bitboard.isLegalMove(move)) {
        const nextBoard = h5board.bitboard.putStone(move);
        nextBoard.last_move = id;
        h5board.bitboard = nextBoard;
    } else {
        throw new Error('Illegal move: Cannot put stone at #' + id);
    }
};

const showEvaluation_helper = (h5board) => {
    const evals = h5board.bitboard.expand_children_orderby_complete_read();
    for (const child of evals) {
        const id = bit2CellID(BigInt(child.last_move));
        if (id < 64) h5board.getCell(id).text = child.eval;
    }
};

const showEvaluation_approx_helper = (h5board, depth = 0) => {
    const evals = h5board.bitboard.expand_children_orderby_eval(depth);
    for (const child of evals) {
        const id = bit2CellID(BigInt(child.last_move));
        if (id < 64) h5board.getCell(id).text = child.eval;
    }
};

const ai_helper = (h5board) => {
    const board = h5board.bitboard;
    const num_stones = board.numOfStones();
    let children;

    // Choose search strategy based on remaining squares
    if (64 - num_stones <= h5board.search_depth_last) {
        children = h5board.bitboard.expand_children_orderby_mtdf();
    } else {
        children = h5board.bitboard.expand_children_orderby_eval(h5board.search_depth);
    }

    return Promise.resolve(BigInt(children[0].last_move));
};

const BITBOARD_STATE_NEXT = 0;
const BITBOARD_STATE_PASS = 1;
const BITBOARD_STATE_END = 2;

/**
 * Main game flow logic. Handles player/AI turns and passes.
 */
const proceed_game = async (h5board, id = null) => {
    // Player's move
    if (id !== null && h5board.bitboard.isLegalMove(CellIdToBit(id))) {
        h5board.histmgr.push_board(h5board);
        await h5board.putStone(id, false); // Don't show legal moves for AI turn yet
    }

    // Game Loop
    while (true) {
        const state = h5board.bitboard.getState();

        switch (state) {
            case BITBOARD_STATE_NEXT:
                if (h5board.bitboard.turn === h5board.player_color) {
                    await h5board.refreshDisplay(true);
                    return; // Wait for user input
                } else {
                    await h5board.refreshDisplay(true);
                    const aimove = await ai_helper(h5board);
                    const aimove_id = bit2CellID(aimove);
                    await h5board.putStone(aimove_id, true);
                    h5board.histmgr.last_board().board.last_move = aimove_id;
                    break; // Check next state
                }

            case BITBOARD_STATE_PASS:
                if (h5board.bitboard.turn === h5board.player_color) {
                    h5board.notification.pass = true;
                    await refresh_dom(h5board);
                    h5board.bitboard.turn *= -1;
                    await h5board.refreshDisplay(true);
                    return;
                } else {
                    // AI Pass
                    h5board.bitboard.turn *= -1;
                    await h5board.refreshDisplay(true);
                    // If AI passes, it's player's turn again.
                    if (h5board.bitboard.getLegalMove() === 0n) continue;
                    return;
                }

            case BITBOARD_STATE_END:
                await h5board.refreshDisplay(false);
                return;

            default:
                throw new Error('Invalid BitBoard state: ' + state);
        }
        await h5board.refreshDisplay(true);
    }
};

const GAMEMODE_GAME = 0;
const GAMEMODE_SETUP = 1;
const GAMEMODE_ANALYZER = 2;

/**
 * Vue Instance for the Entire Application (Vue 3 Single App)
 */
const app = Vue.createApp({
    data() {
        return {
            // board data
            cells: createInitialCells(),
            bitboard: new BitBoard(),
            histmgr: new HistoryManager(),
            gamemode: GAMEMODE_GAME,
            player_color: 1,
            search_depth: 4,
            search_depth_last: 12,
            isBusy: false,

            // header data
            commentText: "Initializing...",
            blackScore: { score: 2, turn: false },
            whiteScore: { score: 2, turn: false },

            // notification data
            notification: { text: "Pass (Tap to Proceed)", pass: false },

            // footer options
            depthOptions: [
                { name: '1/1 move', selected: false },
                { name: '2/2 moves', selected: false },
                { name: '4/4 moves', selected: false },
                { name: '4/12 moves', selected: true },
                { name: '6/12 moves', selected: false },
                { name: '6/16 moves', selected: false },
                { name: '8/16 moves', selected: false },
                { name: '8/18 moves', selected: false },
            ],
            colorOptions: [
                { name: 'Player: Black' },
                { name: 'Player: White' },
            ],
            modeOptions: [
                { name: 'Game Mode', disabled: false },
                { name: 'Proceed as Black', disabled: true },
                { name: 'Proceed as White', disabled: true },
                { name: 'Setup Mode', disabled: false },
                { name: 'Analyzer Mode', disabled: false },
            ],
            advanceOptions: [
                { name: 'Advance' },
                { name: 'Show Evaluation' },
                { name: 'Clear BTree' },
                { name: 'Dump Stats' },
            ]
        }
    },
    async mounted() {
        // Global initialization
        try {
            await init();
            initialize();
            await loadWeightData();
            this.commentText = "Ready";
            this.refreshDisplay(true);
        } catch (e) {
            console.error("Initialization failed:", e);
            this.commentText = "Init Failed";
        }
    },
    methods: {
        async onCellClick(e) {
            if (this.isBusy) return;
            this.isBusy = true;

            try {
                const id = parseCellID(e);

                switch (this.gamemode) {
                    case GAMEMODE_GAME:
                        if (this.bitboard.turn !== this.player_color) return;
                        await proceed_game(this, id);
                        break;

                    case GAMEMODE_SETUP:
                        const bit = CellIdToBit(id);
                        if (this.bitboard.black & bit) {
                            this.bitboard.black ^= bit;
                            this.bitboard.white ^= bit;
                        } else if (this.bitboard.white & bit) {
                            this.bitboard.white ^= bit;
                        } else {
                            this.bitboard.black ^= bit;
                        }
                        await this.refreshDisplay();
                        break;

                    case GAMEMODE_ANALYZER:
                        this.putStone(id);
                        const num_stones = this.bitboard.numOfStones();
                        if (64 - num_stones <= this.search_depth_last) {
                            this.showEvaluation();
                        } else {
                            this.showEvaluation_approx(this.search_depth);
                        }
                        break;
                }
            } catch (err) {
                console.error(err);
            } finally {
                this.isBusy = false;
            }
        },

        // board methods
        async putStone(id, show_legal_move = false) {
            putStone_helper(this, id);
            await this.refreshDisplay(show_legal_move);
        },
        async refreshDisplay(show_legal_move = false) {
            await refreshDisplay_helper(this, show_legal_move);
        },
        async showEvaluation() {
            await this.refreshDisplay();
            showEvaluation_helper(this);
        },
        async showEvaluation_approx(depth = 0) {
            await this.refreshDisplay();
            showEvaluation_approx_helper(this, depth);
        },
        getCell(id) {
            return this.cells[63 - id];
        },

        // notification methods
        async onPassNotificationClick() {
            this.notification.pass = false;
            await refresh_dom(this);
            proceed_game(this);
        },

        // footer methods
        async onClickReset() {
            if (this.isBusy) return;
            console.log(`Reset button pressed.`);
            this.bitboard = new BitBoard();
            this.gamemode = GAMEMODE_GAME;
            this.histmgr.clear();
            this.histmgr.push_board(this);
            gamemode_onchanged_helper(this, "Proceed as Black");
            await this.refreshDisplay(true);
            await proceed_game(this, null);
        },

        async onClickUndo() {
            if (this.isBusy) return;
            const last_h5board = this.histmgr.pop_board();
            if (!last_h5board) return;

            const restoredBoard = last_h5board.board.clone();
            restoredBoard.last_move = last_h5board.data.last_move;
            this.bitboard = restoredBoard;

            this.gamemode = last_h5board.data.gamemode;
            this.player_color = last_h5board.data.player_color;
            this.search_depth = last_h5board.data.search_depth;
            this.search_depth_last = last_h5board.data.search_depth_last;

            await this.refreshDisplay(true);
        },

        onDepthChange(e) {
            const parts = e.target.value.split(' ')[0].split('/');
            this.search_depth = parseInt(parts[0], 10);
            this.search_depth_last = parseInt(parts[1], 10);
            e.target.blur();
        },

        async onColorChange(e) {
            this.player_color = (e.target.value === 'Player: Black') ? 1 : -1;
            e.target.blur();
            if (this.gamemode === GAMEMODE_GAME) {
                await proceed_game(this, null);
            }
        },

        onModeChange(e) {
            e.target.blur();
            gamemode_onchanged_helper(this, e.target.value);
        },

        onAdvanceChange(e) {
            const val = e.target.value;
            switch (val) {
                case 'Show Evaluation':
                    const rem = 64 - this.bitboard.numOfStones();
                    if (rem <= this.search_depth_last) this.showEvaluation();
                    else this.showEvaluation_approx(this.search_depth);
                    break;
                case 'Clear BTree': clear_btree(); break;
                case 'Dump Stats': this.dumpSettings(); break;
            }
            e.target.selectedIndex = 0;
            e.target.blur();
        },

        dumpSettings() {
            const div = document.createElement('div');
            div.style.position = 'fixed';
            div.style.bottom = '10px';
            div.style.background = 'rgba(0,0,0,0.8)';
            div.style.color = 'white';
            div.style.padding = '10px';
            document.body.append(div);
            div.innerText = `Mode: ${this.gamemode}, Depth: ${this.search_depth}/${this.search_depth_last}, Stats: ${print_stats()}`;
            setTimeout(() => div.remove(), 10000);
        }
    }
});

const h5board = app.mount('#app');

/**
 * Gamemode Helper
 */
const gamemode_onchanged_helper = (vm, value) => {
    switch (value) {
        case 'Game Mode':
            vm.gamemode = GAMEMODE_GAME;
            vm.refreshDisplay(true);
            break;
        case 'Proceed as Black':
        case 'Proceed as White':
            vm.gamemode = GAMEMODE_GAME;
            vm.bitboard.turn = (value === 'Proceed as Black') ? 1 : -1;
            vm.modeOptions[1].disabled = true;
            vm.modeOptions[2].disabled = true;
            vm.modeOptions[0].disabled = false;
            document.getElementById('mode').selectedIndex = 0;
            proceed_game(vm, null);
            vm.refreshDisplay(true);
            break;
        case 'Setup Mode':
            vm.gamemode = GAMEMODE_SETUP;
            vm.modeOptions[1].disabled = false;
            vm.modeOptions[2].disabled = false;
            vm.modeOptions[0].disabled = true;
            vm.refreshDisplay();
            break;
        case 'Analyzer Mode':
            vm.gamemode = GAMEMODE_ANALYZER;
            vm.modeOptions[1].disabled = false;
            vm.modeOptions[2].disabled = false;
            vm.modeOptions[0].disabled = true;
            vm.onCellClick(null);
            break;
    }
};

// Export to window for debugging.
window.h5board = h5board;
window.BitBoard = BitBoard;