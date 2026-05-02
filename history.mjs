import { BitBoard } from "./bitboard.mjs";

export class Data {
    constructor(h5board){
        if (h5board === undefined) {
            this.gamemode = 0;
            this.player_color = 1;
            this.search_depth = 4;
            this.search_depth_last = 12;
            this.last_move = -1;
        } else {
            this.gamemode = h5board.gamemode;
            this.player_color = h5board.player_color;
            this.search_depth = h5board.search_depth;
            this.search_depth_last = h5board.search_depth_last;
            try {
                this.last_move = h5board.last_move;
            } catch (error) {
                this.last_move = -1;
            }
        }
    }
}

export class BoardHistory {
    constructor(board, data) {
        this.board = board;
        this.data = data;
    }
}

export class HistoryManager{
    constructor(){
        this.history = [];
        this.h5history = [];
    }

    clear(){
        this.history = [];
        this.h5history = [];
    }

    generate_newboard() {
        const board = new BitBoard();
        const data = new Data();
        data.gamemode = 0;
        data.player_color = 1;
        data.search_depth = 4;
        data.search_depth = 12;
        return new BoardHistory(board, data);
    }

    push_board(h5board) {
        console.assert(h5board instanceof Vue);
        const data = new Data(h5board);
        const board = h5board.bitboard.clone();
        const board_history = new BoardHistory(board, data);
        this.h5history.push(board_history);
    }

    push_newobard() {
        const h5board = this.generate_newboard();
        this.h5history.push(h5board);
    }

    pop_board() {
        if(this.h5history.length === 0){
            return this.generate_newboard();
        } else {
            return this.h5history.pop();
        }
    }

    last_board() {
        if (this.h5history.length === 0) {
            return this.generate_newboard();
        } else {
            const last_index = this.h5history.length -1;
            return this.h5history[last_index];
        }
    }
}
