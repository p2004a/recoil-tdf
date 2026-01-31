// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default defineConfig(
	{
		ignores: ['src/*.peg.ts'],
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	prettier,
);
