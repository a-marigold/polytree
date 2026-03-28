import { describe, it, expect, vi } from 'bun:test';

import { traverse } from 'src/traverse';

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

    describe('`onEnter` and `onExit`', () => {
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
                            children: [
                                { type: 'a' },
                                { type: 'b' },
                                { type: 'c' },
                            ],
                        },
                    },
                },

                onEnter,
                onExit,
            );

            expect(onEnter.mock.calls.length).toBe(onExit.mock.calls.length);
        });

        it('should mutate AST if `onEnter` returned an object', () => {
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

            traverse(
                ast,
                (node) => {
                    if (node.type === 'b') {
                        return { type: 'abc' };
                    }
                },

                null,
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

        it('should mutate AST if `onExit` returned an object', () => {
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

            traverse(
                ast,

                () => {},

                (nodessssss) => {
                    if (nodessssss.type === 'b') {
                        return { type: 'abc' };
                    }
                },
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
    });
});
