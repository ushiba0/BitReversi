/* tslint:disable */
/* eslint-disable */
/**
* @returns {string}
*/
export function print_stats(): string;
/**
* @param {string} board_str
* @returns {string}
*/
export function get_legal_move_wrapper(board_str: string): string;
/**
* @param {string} board_str
* @param {string} hand
* @returns {string}
*/
export function put_stone_wrapper(board_str: string, hand: string): string;
/**
* @param {string} board_str
* @returns {number}
*/
export function get_state_wrapper(board_str: string): number;
/**
* @param {string} board_str
* @returns {string}
*/
export function get_next_random_move_wrapper(board_str: string): string;
/**
* @param {string} board_str
* @returns {string}
*/
export function expand_children_wraper(board_str: string): string;
/**
*/
export function initialize(): void;
/**
* @param {string} str
*/
export function load_weight_data_wrapper(str: string): void;
/**
* @returns {string}
*/
export function export_weight_data_wrapper(): string;
/**
* @returns {number}
*/
export function clear_btree(): number;
/**
* @param {string} board_str
* @param {number} depth
* @returns {string}
*/
export function expand_children_orderby_eval_wrapper(board_str: string, depth: number): string;
/**
* @param {string} board_str
* @returns {string}
*/
export function expand_children_orderby_complete_read_wrapper(board_str: string): string;
/**
* @param {string} board_str
* @returns {string}
*/
export function expand_children_orderby_mtdf_wrapper(board_str: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly print_stats: (a: number) => void;
  readonly get_legal_move_wrapper: (a: number, b: number, c: number) => void;
  readonly put_stone_wrapper: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly get_state_wrapper: (a: number, b: number) => number;
  readonly get_next_random_move_wrapper: (a: number, b: number, c: number) => void;
  readonly expand_children_wraper: (a: number, b: number, c: number) => void;
  readonly initialize: () => void;
  readonly load_weight_data_wrapper: (a: number, b: number) => void;
  readonly export_weight_data_wrapper: (a: number) => void;
  readonly clear_btree: () => number;
  readonly expand_children_orderby_eval_wrapper: (a: number, b: number, c: number, d: number) => void;
  readonly expand_children_orderby_complete_read_wrapper: (a: number, b: number, c: number) => void;
  readonly expand_children_orderby_mtdf_wrapper: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
