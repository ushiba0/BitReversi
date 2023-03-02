import { BitBoard } from "./bitboard.mjs";


export class HistoryManager{
    constructor(){
        this.history = [];
    }

    clear(){
        this.history = [];
    }

    push(board){
        console.assert(board instanceof BitBoard);
        this.history.push(new BitBoard(board));
    }

    pop(){
        if(this.history.length === 0){
            return new BitBoard();
        }else if(this.history.length > 0){
            return this.history.pop();
        }else{
            throw 'We should not reach here.';
        }
    }

    last(){
        if (this.history.length === 0) {
            return new BitBoard();
        } else {
            const last_index = this.history.length -1;
            return this.history[last_index];
        }
        
    }
}
