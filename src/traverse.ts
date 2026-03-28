import type { NodeLike, OnEnter, OnExit, Traverse } from './types';

import { SKIP, STOP } from './constants';

/**
 * Used in `parentStack` in {@link traverse} for `parent` of root node
 *
 * not to have a risk of polymorphic objects in the `parentStack`.
 */
const NO_PARENT = [] as const satisfies NodeLike[];

/**
 *
 *
 *
 * Used in `keyStack` in {@link traverse} for `key` of root node
 *
 * not to have a risk of polymorphic types in the `keyStack`.
 *
 */
const NO_KEY = '0' as const satisfies string;

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

    /**
     *
     * `0` means calling {@link onEnter}.
     *
     * `1` means calling {@link onExit}.
     */

    const stateStack: (0 | 1)[] = [0];

    while (nodeStack.length) {
        const node = nodeStack.pop() as NodeLike;

        const parent = parentStack.pop() as NodeLike | NodeLike[];

        const key = keyStack.pop() as string;

        if (stateStack.pop()) {
            // assertion is not dangerous because there is not any `1` in `stateStack` if `onExit` is not provided.
            const exitResult = (onExit as OnExit<NodeLike>)(node);

            if (exitResult) {
                if (exitResult === STOP) {
                    return;
                }

                (parent as NodeLike)[key] = exitResult;
            }

            continue;
        } else {
            const enterResult = onEnter(node);

            if (enterResult) {
                if (enterResult === SKIP) {
                    continue;
                }

                if (enterResult === STOP) {
                    return;
                }

                (parent as NodeLike)[key] = enterResult;
            }
        }

        if (onExit) {
            nodeStack.push(node);

            parentStack.push(parent);

            keyStack.push(key);

            stateStack.push(1);
        }

        for (const nodeKey in node) {
            const property = node[nodeKey];

            if ((property as NodeLike | undefined)?.type) {
                nodeStack.push(property as NodeLike);

                parentStack.push(node);

                keyStack.push(nodeKey);

                continue;
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

                continue;
            }
        }
    }
};
