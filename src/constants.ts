/**
 * Indicates that a node should be skipped.
 *
 * Can only be returned from `onEnter` callback in `traverse`.
 *
 * Can cause errors if `onExit` callback in `traverse` returned this.
 *
 */
export const SKIP = Symbol();

/**
 * Indicates that `traverse` function should be stopped.
 *
 *
 *
 * Can be returned from both `onEnter` and `onExit` callbacks in `traverse`.
 */
export const STOP = Symbol();
