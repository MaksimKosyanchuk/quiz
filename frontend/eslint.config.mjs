import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier/recommended';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
    { ignores: ['.next', 'node_modules', 'next-env.d.ts'] },
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    prettier,
];

export default config;
