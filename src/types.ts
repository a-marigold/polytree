import type { SKIP, STOP } from './constants';

/**
 *
 *
 * Supertype of every AST node.
 */
export type NodeLike = {
    type: string;
};
/**
 *
 *
 *
 *
 * Supertype of every parent of an AST node.
 */
export type NodeParentLike = NodeLike | NodeLike[];

/**
 *
 *
 * Basic type of `onEnter`, `onExit`.
 */
export type Visitor<
    in N extends NodeLike,
    in P extends NodeParentLike | undefined,
    out R,
> = (node: N, parent: P, key: string) => R;

/**
 * `onEnter` parameter in `traverse` function.
 *
 * Can return {@link SKIP} to skip the current node or {@link STOP} to stop `traverse` function.
 */
export type OnEnter<
    N extends NodeLike,
    P extends NodeParentLike | undefined,
> = Visitor<N, P, NodeLike | typeof SKIP | typeof STOP | void | null>;

/**
 *
 *
 * `onExit` parameter in `traverse` function.
 *
 * Can return {@link STOP} to stop `traverse` function.
 *
 *
 */

export type OnExit<
    N extends NodeLike,
    P extends NodeParentLike | undefined,
> = Visitor<N, P, NodeLike | typeof STOP | void | null>;

export type Traverse = {
    <N extends NodeLike>(
        node: N,
        onEnter: OnEnter<N, N | N[] | undefined> | null,
        onExit: OnExit<N, N | N[] | undefined> | null,
    ): void;

    <N extends NodeLike, P extends NodeParentLike>(
        node: N,
        onEnter: OnEnter<N, N | N[] | P> | null,
        onExit: OnExit<N, N | N[] | P> | null,

        parent: P,
        key: P extends NodeLike ? Extract<keyof P, string> : string,
    ): void;
};
