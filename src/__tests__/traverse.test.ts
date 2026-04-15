import { describe, it, expect, vi } from 'bun:test';

import { traverse } from '../traverse';
import { SKIP, STOP } from '../constants';

import type { NodeLike } from '../types';

const testTraverseVisitor = (visitorName: 'onEnter' | 'onExit') => {
    it(`should replace a node if \`${visitorName}\` returned an object`, () => {
        const toBeReplacedType = 'ToBeReplaced';

        const ast = {
            type: 'Root',
            value: {
                type: toBeReplacedType,
                value: {
                    type: 'a',
                    children: [{ type: toBeReplacedType }, { type: 'b' }, { type: 'c' }],
                },
            },
        };

        const astSnapshot = JSON.stringify(ast);

        const visitor = (node: NodeLike) => {
            if (node.type === toBeReplacedType) {
                return { type: 'Replaced' };
            }
        };

        traverse(
            ast,

            visitorName === 'onEnter' ? visitor : null,
            visitorName === 'onExit' ? visitor : null,
        );

        expect(astSnapshot).not.toBe(JSON.stringify(ast));

        expect(ast).toMatchInlineSnapshot(`
          {
            "type": "Root",
            "value": {
              "type": "Replaced",
            },
          }
        `);
    });

    it(`should stop immediatly when \`${visitorName}\` returned \`STOP\``, () => {
        const unreachableNodeType = 'Dead1';

        let visited = '';

        const visitor = (node: NodeLike) => {
            visited += node.type;

            if (node.type === 'STOP') {
                return STOP;
            }
        };

        traverse(
            {
                type: 'Root',
                value: {
                    type: 'Child',

                    children: [{ type: 'STOP' }, { type: unreachableNodeType }],
                },
            },

            visitorName === 'onEnter' ? visitor : null,

            visitorName === 'onExit' ? visitor : null,
        );

        expect(visited).not.toInclude(unreachableNodeType);
    });

    it('should not have errors with replacing root node if `parent` and `key` are not provided', () => {
        const visitor = (node: NodeLike) => {
            if (node.type === 'root') {
                return { type: 'a' };
            }
        };

        traverse(
            { type: 'root' },

            visitorName === 'onEnter' ? visitor : null,

            visitorName === 'onExit' ? visitor : null,
        );
    });

    it('should replace root node if `parent` and `key` are provided', () => {
        const root = {
            type: 'root',
        };

        const parent = {
            type: 'parent',
            value: root,
        };

        const replacementType = 'replacement';

        const visitor = (node: NodeLike) =>
            node.type === 'root' ? { type: replacementType } : null;

        traverse(
            root,
            visitorName === 'onEnter' ? visitor : null,
            visitorName === 'onExit' ? visitor : null,

            parent,

            'value',
        );

        expect(parent.value.type).toBe(replacementType);
    });
};

describe('traverse', () => {
    it('should visit every property that is an object and has `type` property', () => {
        let visited = '';

        traverse(
            {
                type: 'a',
                value: {
                    type: 'b',
                    value: {
                        type: 'c',
                        value: {
                            type: 'd',
                        },
                    },
                    value2: {
                        type: 'f',
                    },
                },
                value2: {
                    type: 'e',
                },
            },

            (node) => {
                visited += node.type;
            },

            null,
        );

        expect(visited).toMatchInlineSnapshot(`"aebfcd"`);
    });
    it('should visit every child of property that is an array in correct order', () => {
        let visited = '';

        traverse(
            {
                type: 'a',
                children: [
                    { type: 'b', children: [{ type: 'c' }, { type: 'd' }] },
                    { type: 'e' },
                    { type: 'f' },
                ],
            },
            (node) => {
                visited += node.type;
            },

            null,
        );

        expect(visited).toBe('abcdef');
    });
    it('should not traverse non node objects and arrays, elements of which are not nodes', () => {
        traverse(
            { type: 'Root', o: { noType: 'abc' }, prop: [1, 2, 3] },
            (node) => {
                if (!('type' in node)) {
                    throw new Error();
                }
            },
            (node) => {
                if (!('type' in node)) {
                    throw new Error();
                }
            },
        );
    });

    it('`onEnter` and `onExit` should be called the same times', () => {
        const onEnter = vi.fn();

        const onExit = vi.fn();

        traverse(
            {
                type: 'a',
                b: {
                    type: 'b',
                    c: {
                        type: 'c',
                        children: [{ type: 'a' }, { type: 'b' }, { type: 'c' }],
                    },
                },
            },

            onEnter,
            onExit,
        );

        expect(onEnter.mock.calls.length).toBe(onExit.mock.calls.length);
    });

    describe('onEnter', () => {
        testTraverseVisitor('onEnter');

        it('should skip the whole traversal of a node if `SKIP` is returned', () => {
            let visited = '';
            traverse(
                {
                    type: 'a',
                    value: {
                        type: 'b',
                        value: {
                            type: 'c',
                            value: [{ type: 'd', value: { type: 'e' } }, { type: 'f' }],
                        },
                    },
                },

                (node) => {
                    visited += node.type;
                    if (node.type === 'c') {
                        return SKIP;
                    }
                },
                null,
            );

            expect(visited).toBe('abc');
        });
    });

    describe('onExit', () => {
        testTraverseVisitor('onExit');

        it('should call `onExit` only after whole the node is traversed', () => {
            let visited = '';

            let visitedAfterRootTraversal = '';

            traverse(
                {
                    type: 'Root',
                    value: {
                        type: 'A',
                        value: {
                            type: 'B',
                            value: [{ type: 'C', value: { type: 'D' } }, { type: 'E' }],
                        },
                    },
                },
                (node) => {
                    visited += node.type;
                },

                (node) => {
                    if (node.type === 'Root') {
                        visitedAfterRootTraversal = visited;
                    }
                },
            );

            expect(visitedAfterRootTraversal).toMatchInlineSnapshot(`"RootABCDE"`);
        });
    });
});
