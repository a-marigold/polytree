import type { NodeLike, OnEnter, OnExit, Traverse } from './types';

import { SKIP, STOP } from './constants';

/**
 * Used in `parentStack` in {@link traverse} for `parent` root node not to have a risk
 *
 * of polymorphic objects in the `parentStack`.
 */
const NO_PARENT = { type: '' } as const satisfies NodeLike;

/**
 *
 *
 *
 * Used in `keyStack` in {@link traverse} for `key` of root node not to have a risk
 *
 * of polymorphic types in the `keyStack`.
 */

const NO_KEY = '-1' as const satisfies string;

export const traverse: Traverse = (
    node: NodeLike,

    onEnter: OnEnter<NodeLike>,
    onExit: OnExit<NodeLike> | null,

    parent?: NodeLike | NodeLike[],

    key?: string,
) => {
    const nodeStack: NodeLike[] = [node];

    const parentStack: (NodeLike | NodeLike[])[] = [parent ?? NO_PARENT];

    const keyStack: string[] = [key ?? NO_KEY];

    while (nodeStack.length) {
        const node = nodeStack.pop() as NodeLike;
        const parent = parentStack.pop() as NodeLike | NodeLike[];
        const key = keyStack.pop() as string;

        const enterResult = onEnter(node);

        if (enterResult) {
            if (enterResult === SKIP) {
                continue;
            }

            if (enterResult === STOP) {
                return;
            }

            if (parent) {
                // assertion is needed because typescript cannot trust that `key` is an indexed type of `parent`. the `key` is not undefined if the `parent` is not undefined

                (parent as NodeLike)[key] = enterResult;
            }
        }

        for (const nodeKey in node) {
            const property = node[nodeKey];

            if ((property as NodeLike | undefined)?.type) {
                nodeStack.push(property as NodeLike);
                parentStack.push(node);

                keyStack.push(nodeKey);
            }

            if (Array.isArray(property)) {
                for (
                    let propIndex = property.length - 1;
                    propIndex >= 0;
                    propIndex--
                ) {
                    nodeStack.push(property[propIndex]);

                    parentStack.push(property);

                    keyStack.push(propIndex.toString());
                }
            }
        }

        if (onExit) {
            const exitResult = onExit(node);

            if (exitResult) {
                if (exitResult === STOP) {
                    return;
                }

                if (parent) {
                    // assertion is needed because typescript cannot trust that `key` is an indexed type of `parent`. the `key` is not undefined if the `parent` is not undefined
                    (parent as NodeLike)[key as string] = exitResult;
                }
            }
        }
    }
};
