
import {get_legal_move_wrapper, 
    put_stone_wrapper, get_state_wrapper,
    get_next_random_move_wrapper,
    expand_children_wraper,
    expand_children_orderby_eval_wrapper,
    expand_children_orderby_complete_read_wrapper,
    expand_children_orderby_mtdf_wrapper,

} from "./bitreversi-wasm/pkg/bitreversi_wasm.js";

export class BitBoard {
    constructor(node){
        this.black = 0x0000000810000000n;
        this.white = 0x0000001008000000n;
        this.turn = 1;
        this.stones = 4;
        this.eval = 0;
        this.last_move = -1;

        if(node instanceof BitBoard){
            this.black = node.black;
            this.white = node.white;
            this.turn = node.turn;
            this.stones = node.stones;
            this.eval = node.eval;
            this.last_move = node.last_move;
        }else if(typeof node === 'string'){
            const arr = node.split(',');
            console.assert(arr.length === 3);
            this.black = BigInt(`0x${arr[0]}`);
            this.white = BigInt(`0x${arr[1]}`);
            this.turn = parseInt(arr[2], 10);
        }

        console.assert((this.black&this.white) === 0n);
        console.assert(this.turn === 1 || this.turn === -1);
    }

    toString(){
        return [this.black, this.white, this.turn].map(e=>e.toString(16)).join(',');
    }
    
    validate(){
        console.assert((this.black&this.white) === 0n);
    }

    getLegalMove(){
        const board_str = this.toString();
        const res_str = get_legal_move_wrapper(board_str);
        return BigInt(`0x${res_str}`);
    }

    get_last_move() {
        let last_move;
        try {
            last_move = this.last_move;
        } catch (error) {
            last_move = -1;
        }
        return last_move;
    }

    putStone(hand = 0n){
        const board_str = this.toString();
        const res_str = put_stone_wrapper(board_str, hand.toString(16));
        const new_board = new BitBoard(res_str);
        new_board.validate();
        return new_board;
    }

    getState(){
        const board_str = this.toString();
        return get_state_wrapper(board_str);
    }

    getNextRandomMove(){
        const board_str = this.toString();
        const res_str = get_next_random_move_wrapper(board_str);
        return BigInt(`0x${res_str}`)
    }

    expandChildren(){
        const board_str = this.toString();
        const res_str = expand_children_wraper(board_str);
        const children_str = res_str.split(';');
        const last_elem = children_str.pop();
        console.assert(last_elem === '');
        const children = children_str.map(e => new BitBoard(e));
        return children;
    }

    numOfStones(){
        return countBits(this.black|this.white);
    }

    numOfBlack(){
        return countBits(this.black);
    }

    numOfWhite(){
        return countBits(this.white);
    }

    mtdf(){
        
    }

    clone(){
        return new BitBoard(this);
    }

    isLegalMove(move = 0n) {
        console.assert(countBits(move) === 1);
        const legal_move = this.getLegalMove();

        if((legal_move&move) === 0n){
            return false;
        } else {
            return true;
        }
    }

    expand_children_orderby_eval(depth = 0){
        let board_str = this.toString();
        let res = expand_children_orderby_eval_wrapper(board_str, depth);
        let obj = JSON.parse(res);
        return obj;
    }

    expand_children_orderby_complete_read(){
        let board_str = this.toString();
        let res = expand_children_orderby_complete_read_wrapper(board_str);
        let obj = JSON.parse(res);
        return obj;
    }

    expand_children_orderby_mtdf(){
        let board_str = this.toString();
        let res = expand_children_orderby_mtdf_wrapper(board_str);
        let obj = JSON.parse(res);
        return obj;
    }
}


const countBits = x =>{
    x = (x & 0x5555555555555555n) + (x>>1n  & 0x5555555555555555n);
    x = (x & 0x3333333333333333n) + (x>>2n  & 0x3333333333333333n);
    x = (x & 0x0f0f0f0f0f0f0f0fn) + (x>>4n  & 0x0f0f0f0f0f0f0f0fn);
    x = (x & 0x00ff00ff00ff00ffn) + (x>>8n  & 0x00ff00ff00ff00ffn);
    x = (x & 0x0000ffff0000ffffn) + (x>>16n & 0x0000ffff0000ffffn);
    x = (x & 0x00000000ffffffffn) + (x>>32n & 0x00000000ffffffffn);
    return Number(x);
};
