import type { SKIP, STOP } from './constants';

/**
 *
 *
 * An object that is like `Estree` AST node.
 */
export type NodeLike = {
    type: string;
    [key: string]: unknown;
};

/**
 *
 *
 * Basic type of `onEnter`, `onExit`.
 */
export type Visitor<T extends NodeLike, R> = (node: T) => R;

/**
 * `onEnter` argument in `traverse` function.
 *
 * Can return {@link SKIP} to skip the current node or {@link STOP} to stop `traverse` function.
 */
export type OnEnter<T extends NodeLike> = Visitor<
    T,
    NodeLike | typeof SKIP | typeof STOP | void
>;

/**
 *
 * `onExit` argument in `traverse` function.
 *
 * Can return {@link STOP} to stop `traverse` function.
 */
export type OnExit<T extends NodeLike> = Visitor<
    T,
    NodeLike | typeof STOP | void
>;

export type Traverse = {
    <T extends NodeLike>(
        node: T,
        onEnter: OnEnter<T>,
        onExit: OnExit<T> | null,
    ): void;

    <T extends NodeLike, P extends NodeLike | NodeLike[]>(
        node: T,
        onEnter: OnEnter<T>,
        onExit: OnExit<T> | null,
        parent: P,
        key: P extends NodeLike ? Extract<keyof P, string> : string,
    ): void;
};
