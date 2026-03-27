import type { NodeLike, OnEnter, OnExit, Traverse } from './types';

import { SKIP, STOP } from './constants';

export const traverse: Traverse = (
    node: NodeLike,
    onEnter: OnEnter<NodeLike>,
    onExit: OnExit<NodeLike> | null,

    parent?: NodeLike | NodeLike[],
    key?: string | number,
) => {
    const enterResult = onEnter(node);

    if (enterResult) {
        if (enterResult === SKIP) {
            return;
        }

        if (enterResult === STOP) {
            return;
        }

        if (parent) {
            // assertion is needed bacause typescript cannot trust that `key` is an indexed type of `parent`. the `key` is not undefined if the `parent` is not undefined

            (parent as NodeLike)[key as string] = enterResult;
        }
    }

    for (const nodeKey in node) {
        const property = node[nodeKey];

        if ((property as NodeLike | undefined)?.type) {
            traverse(
                property as NodeLike,

                onEnter,
                onExit,
                node,
                nodeKey,
            );
        }

        if (Array.isArray(property) && nodeKey !== 'range') {
            for (let propIndex = 0; propIndex < property.length; propIndex++) {
                traverse<NodeLike>(
                    property[propIndex],

                    onEnter,
                    onExit,

                    property,
                    propIndex,
                );
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
                (parent as NodeLike)[key as string] = exitResult;
            }
        }
    }
};
