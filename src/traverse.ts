import type {
    NodeLike,
    NodeParentLike,
    OnEnter,
    OnExit,
    Traverse,
} from './types';

import { SKIP, STOP } from './constants';

/**
 *
 * #### Traverses `node` iterativly.
 * #### Can traverse any AST that has nodes with `type` property.
 *
 * `onEnter` and `onExit` can return a new node to replace the current node
 *
 * or {@link STOP} to immediatly stop traversal.
 *
 * @template N Type of possible Node that can appear in AST.
 * @template P Type of `parent`.
 *
 * @param node Root node to be traversed.
 *
 * @param onEnter Can return {@link SKIP} not to traverse the current node.
 * @param onExit Сalled only after all node's children are traversed.
 *   SHOULD NOT return {@link SKIP} because it can cause unexpected behaviour.
 *
 *
 *
 *
 * @param parent Parent of `node`. If this is provided, the root node can be replaced.
 * @param key Key in `parent` of `node`. If `parent` is an array, `key` should be a string of index.
 *
 */

export const traverse: Traverse = (
    node: NodeLike,

    onEnter: OnEnter<NodeLike, NodeParentLike | undefined> | null,
    onExit: OnExit<NodeLike, NodeParentLike | undefined> | null,

    parent?: NodeParentLike,

    key?: string,
): void => {
    /**
     *
     * `0` means calling `onEnter`.
     *
     * `1` means calling `onExit`.
     *
     */
    type NodeState = 0 | 1;

    /**
     *
     * `nodeStack` is flattened for better performance.
     *
     * It has significant order which must be supported:
     *
     * ```typescript
     * nodeStack.pop(); // `NodeState`
     * nodeStack.pop(); // Key
     * nodeStack.pop(); // Parent | Undefined
     * nodeStack.pop(); // Node
     *
     * nodeStack.push(Node, Parent, Key, 0 | 1);
     * ```
     */
    const nodeStack: (
        | NodeLike
        | NodeParentLike
        | undefined
        | string
        | NodeState
    )[] = [node, parent, key, 0];

    while (nodeStack.length) {
        // assertionss below are not dangeruous - see the description of `nodeStack`
        const nodeState = nodeStack.pop() as NodeState;
        const key = nodeStack.pop() as string;
        const parent = nodeStack.pop() as NodeParentLike | undefined;
        const node = nodeStack.pop() as NodeLike;

        if (nodeState) {
            // assertion is not dangerous because there is not any truthy value in `stateStack` if `onExit` is not provided.
            const exitResult = (
                onExit as OnExit<NodeLike, NodeParentLike | undefined>
            )(node, parent, key);

            if (exitResult) {
                if (exitResult === STOP) {
                    return;
                }

                if (parent) {
                    (parent as Record<string, unknown>)[key] = exitResult;
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

                    if (parent) {
                        (parent as Record<string, unknown>)[key] = enterResult;
                    }
                }
            }
            if (onExit) {
                nodeStack.push(node, parent, key, 1);
            }

            for (const nodeKey in node) {
                const property = (node as Record<string, unknown>)[nodeKey];

                if (
                    typeof property === 'object' &&
                    (property as NodeLike | null)?.type
                ) {
                    nodeStack.push(property as NodeLike, node, nodeKey, 0);

                    continue;
                }

                if (
                    Array.isArray(property) &&
                    typeof property[0] === 'object'
                ) {
                    let propIndex = property.length - 1;

                    while (propIndex >= 0) {
                        nodeStack.push(
                            property[propIndex],

                            property as NodeParentLike,

                            propIndex.toString(),
                            0,
                        );

                        propIndex--;
                    }

                    continue;
                }
            }
        }
    }
};
