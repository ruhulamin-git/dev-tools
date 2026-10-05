import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	{
		// A read-only snapshot of the two editor plugins, kept for reference beside the tool
		// whose engine they share. It is linted, formatted and tested in its own repositories,
		// under their configs; running ours over it would report failures nobody can act on
		// here, because the fix belongs in a different repo.
		ignores: ['src/routes/cron-expression-generator/plugins/**']
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: { 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		ignores: ['eslint.config.js', 'svelte.config.js', '**/*.css'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		files: ['**/*.css'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off'
		}
	}
);
