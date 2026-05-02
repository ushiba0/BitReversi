import { BitBoard } from "./bitboard.mjs";

/**
 * Class to hold game settings such as game mode, player color, and search depth.
 */
export class HistoryData {
    constructor(h5board = {}) {
        // Initialize properties from the provided h5board instance or use default values.
        this.gamemode = h5board.gamemode ?? 0;
        this.player_color = h5board.player_color ?? 1;
        this.search_depth = h5board.search_depth ?? 4;
        this.search_depth_last = h5board.search_depth_last ?? 12;

        // Safely retrieve last_move; default to -1 if it's not a valid number.
        if (h5board.bitboard && typeof h5board.bitboard.last_move === 'number') {
            this.last_move = h5board.bitboard.last_move;
        } else {
            this.last_move = -1;
        }
    }
}

/**
 * Class representing a snapshot of the board and its associated settings.
 */
export class BoardHistory {
    constructor(board, data) {
        this.board = board;
        this.data = data;
    }
}

/**
 * Class to manage game history for Undo/Redo functionality.
 */
export class HistoryManager {
    constructor() {
        this.h5history = [];
    }

    /**
     * Clears all stored history.
     */
    clear() {
        this.h5history = [];
    }

    /**
     * Internal helper to generate a default/new board state.
     */
    generate_newboard() {
        const board = new BitBoard();
        const data = new HistoryData(); // Created with default values
        return new BoardHistory(board, data);
    }

    /**
     * Saves the current state of the Vue instance (h5board) to the history stack.
     * Note: "instanceof Vue" is removed for Vue 3 compatibility.
     */
    push_board(h5board) {
        // Validate the incoming object. In Vue 3, we check for properties instead of constructor.
        if (!h5board || !h5board.bitboard) {
            console.error("Invalid board instance passed to push_board");
            return;
        }

        const data = new HistoryData(h5board);
        const board = h5board.bitboard.clone();
        const board_history = new BoardHistory(board, data);

        this.h5history.push(board_history);
    }

    /**
     * Adds a fresh, default board state to the history.
     */
    push_newboard() {
        this.h5history.push(this.generate_newboard());
    }

    /**
     * Removes and returns the latest board state (used for Undo).
     * Returns a new board state if the history is empty.
     */
    pop_board() {
        if (this.h5history.length === 0) {
            return this.generate_newboard();
        }
        return this.h5history.pop();
    }

    /**
     * Returns the latest board state without removing it.
     */
    last_board() {
        if (this.h5history.length === 0) {
            return this.generate_newboard();
        }
        return this.h5history[this.h5history.length - 1];
    }
}