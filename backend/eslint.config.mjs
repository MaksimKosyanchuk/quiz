import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
    { ignores: ['dist', 'node_modules'] },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        languageOptions: { globals: { ...globals.node } },
        rules: { '@typescript-eslint/no-explicit-any': 'error' },
    },
);
