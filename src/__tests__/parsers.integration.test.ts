import { describe, it, expect } from 'bun:test';

import { parseSync as oxcParse } from 'oxc-parser';

import { parse as babelParse } from '@babel/parser';

import { traverse } from '../traverse';

describe('Integration with parsers', () => {
    it('@babel/parser AST and oxc-parser AST with typescript', () => {
        const code = `
/*

  Trailing comments
*/
const a: number = {};
// Leading com

const b: string = {};

console.log(a + b);`;

        let oxcVisited = '';

        traverse(
            oxcParse('', code, { astType: 'ts', lang: 'ts' }).program,
            (node) => {
                oxcVisited += node.type;
            },
            null,
        );
        let babelVisited = '';

        traverse(
            babelParse(code, { plugins: ['typescript'], attachComment: false })
                .program,
            (node) => {
                babelVisited += node.type;
            },
            null,
        );

        expect(oxcVisited).toBe(babelVisited);
    });
});
