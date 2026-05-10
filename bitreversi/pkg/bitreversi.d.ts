/* tslint:disable */
/* eslint-disable */

/**
 * キャッシュをクリアし、それまでのキャッシュサイズを返す。
 */
export function clear_btree(): number;

export function expand_children_orderby_complete_read_wrapper(board_str: string): string;

export function expand_children_orderby_eval_wrapper(board_str: string, depth: number): string;

export function expand_children_orderby_mtdf_wrapper(board_str: string): string;

export function expand_children_wraper(board_str: string): string;

export function export_weight_data_wrapper(): string;

export function get_legal_move_wrapper(board_str: string): string;

export function get_next_random_move_wrapper(board_str: string): string;

export function get_state_wrapper(board_str: string): number;

export function import_weight(str: string): void;

export function initialize(): void;

export function print_stats(): string;

export function put_stone_wrapper(board_str: string, hand: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly expand_children_orderby_complete_read_wrapper: (a: number, b: number) => [number, number];
    readonly expand_children_orderby_eval_wrapper: (a: number, b: number, c: number) => [number, number];
    readonly expand_children_orderby_mtdf_wrapper: (a: number, b: number) => [number, number];
    readonly expand_children_wraper: (a: number, b: number) => [number, number];
    readonly export_weight_data_wrapper: () => [number, number];
    readonly get_legal_move_wrapper: (a: number, b: number) => [number, number];
    readonly get_next_random_move_wrapper: (a: number, b: number) => [number, number];
    readonly get_state_wrapper: (a: number, b: number) => number;
    readonly import_weight: (a: number, b: number) => void;
    readonly print_stats: () => [number, number];
    readonly put_stone_wrapper: (a: number, b: number, c: number, d: number) => [number, number];
    readonly initialize: () => void;
    readonly clear_btree: () => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
