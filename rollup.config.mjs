import { defineConfig } from 'rollup';

import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default defineConfig([
    {
        input: './src/index.ts',
        plugins: [typescript({ outDir: './dist', exclude: ['**/tests/**'] })],
        output: {
            file: './dist/index.js',
            format: 'esm',
        },
    },
    {
        input: './src/index.ts',
        plugins: [dts()],
        output: {
            file: './dist/index.d.ts',
            format: 'esm',
        },
    },
]);
