import type {
    NodeLike,
    NodeParentLike,
    OnEnter,
    OnExit,
    Traverse,
} from './types';

import { SKIP, STOP } from './constants';

/**
 * Used in `parentStack` in {@link traverse} for parent of root node if `parent` argument is not provided.
 *
 */

const NO_PARENT: NodeParentLike = [];

/**
 * Used in `keyStack` in {@link traverse} for key of root node if `key` argument is not provided.
 */
const NO_KEY = '0' as const;

/**
 *
 * #### Traverses `node` iterativly.
 * #### Can traverse any AST that has nodes with `type` property.
 *
 * `onEnter` and `onExit` can return a new node to replace the current node
 *
 * or {@link STOP} to immediatly stop traversal.
 *
 * @template T Type of possible Node that can appear in AST.
 * @template P Type of `parent`.
 *
 * @param node Root node to be traversed.
 *
 * @param onEnter Can return {@link SKIP} not to traverse the current node.
 * @param onExit Сalled only after all node's children are traversed.
 *   SHOULD NOT return {@link SKIP} because it can cause unexpected behaviour.
 *
 * @param parent Parent of `node`. If this is provided, the root node can be replaced.
 * @param key Key in `parent` of `node`. If `parent` is an array, `key` should be a string of index.
 *
 */

export const traverse: Traverse = <
    N extends NodeLike,
    P extends NodeParentLike,
>(
    node: N,

    onEnter: OnEnter<N, P | null> | null,
    onExit: OnExit<N, P | null> | null,
    parent?: P,
    key?: string,
): void => {
    const nodeStack: N[] = [node];
    const parentStack: P[] = [parent ?? (NO_PARENT as P)];
    const keyStack: string[] = [key ?? NO_KEY];

    /**
     * `0` means calling {@link onEnter}.
     *
     * `1` means calling {@link onExit}.
     */

    const stateStack: (0 | 1)[] = [0];

    while (nodeStack.length) {
        const node = nodeStack.pop() as N;

        const parent = parentStack.pop() as P;

        const key = keyStack.pop() as string;

        if (stateStack.pop()) {
            // assertion is not dangerous because there is not any truthy value in `stateStack` if `onExit` is not provided.
            const exitResult = (onExit as OnExit<NodeLike, NodeParentLike>)(
                node,

                parent,
                key,
            );

            if (exitResult) {
                if (exitResult === STOP) {
                    return;
                }

                if (parent !== NO_PARENT) {
                    (parent as NodeLike)[key] = exitResult;
                }
            }

            continue;
        } else {
            if (onEnter) {
                const enterResult = onEnter(node, parent, key);

                if (enterResult) {
                    if (enterResult === SKIP) {
                        continue;
                    }

                    if (enterResult === STOP) {
                        return;
                    }

                    if (parent !== NO_PARENT) {
                        (parent as NodeLike)[key] = enterResult;
                    }
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
                    nodeStack.push(property as N);

                    parentStack.push(node as unknown as P);

                    keyStack.push(nodeKey);

                    stateStack.push(0);

                    continue;
                }

                if (Array.isArray(property)) {
                    for (
                        let propIndex = property.length - 1;
                        propIndex >= 0;
                        propIndex--
                    ) {
                        nodeStack.push(property[propIndex]);
                        parentStack.push(property as P);

                        keyStack.push(propIndex.toString());
                        stateStack.push(0);
                    }

                    continue;
                }
            }
        }
    }
};
