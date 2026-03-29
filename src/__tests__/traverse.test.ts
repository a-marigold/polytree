import { describe, it, expect, vi } from 'bun:test';

import { traverse } from 'src/traverse';
import { SKIP, STOP } from 'src/constants';

import type { NodeLike } from 'src/types';

const testTraverseVisitor = (visitorName: 'onEnter' | 'onExit') => {
    it(`should mutate AST if \`${visitorName}\` returned an object`, () => {
        const ast = {
            type: 'a',
            b: {
                type: 'b',
                c: {
                    type: 'c',
                    children: [{ type: 'a' }, { type: 'b' }, { type: 'c' }],
                },
            },
        };

        const astSnapshot = JSON.stringify(ast);

        const visitor = (node: NodeLike) => {
            if (node.type === 'b') {
                return { type: 'abc' };
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
            "b": {
              "type": "abc",
            },
            "type": "a",
          }
        `);
    });

    it(`should mutate AST if \`${visitorName}\` returned an object`, () => {
        const ast = {
            type: 'a',

            b: {
                type: 'b',

                c: {
                    type: 'c',

                    children: [{ type: 'a' }, { type: 'b' }, { type: 'c' }],
                },
            },
        };

        const astSnapshot = JSON.stringify(ast);

        const visitor = (node: NodeLike) => {
            if (node.type === 'b') {
                return { type: 'abc' };
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
            "b": {
              "type": "abc",
            },
            "type": "a",
          }
        `);
    });

    it(`should stop immediatly when \`${visitorName}\` returned \`STOP\``, () => {
        let visited = '';

        const visitor = (node: NodeLike) => {
            visited += node.type;

            if (node.type === 'c') {
                return STOP;
            }
        };

        traverse(
            {
                type: 'a',

                value: {
                    type: 'b',
                    value: {
                        type: 'd',
                    },
                    value2: {
                        type: 'c',
                    },
                },
            },

            visitorName === 'onEnter' ? visitor : null,
            visitorName === 'onExit' ? visitor : null,
        );

        expect(visited).not.toInclude('d');
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
                            value: [
                                { type: 'd', value: { type: 'e' } },
                                { type: 'f' },
                            ],
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
    });
});
