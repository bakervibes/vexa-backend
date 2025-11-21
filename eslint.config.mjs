import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
	// Ignore patterns
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/coverage/**',
			'**/.env*',
			'**/*.js', // Ignore all JS files
			'**/prisma/**',
			'prisma.config.ts',
		],
	},

	// Base ESLint recommended config
	eslint.configs.recommended,

	// TypeScript files configuration
	{
		files: ['**/*.ts', '**/*.mts', '**/*.cts'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.eslint.json',
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				Buffer: 'readonly',
				NodeJS: 'readonly',
				setTimeout: 'readonly',
				setInterval: 'readonly',
				clearTimeout: 'readonly',
				clearInterval: 'readonly',
				global: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
		},
		rules: {
			// Disable base rule as it can report incorrect errors
			'no-unused-vars': 'off',

			// TypeScript specific rules
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
				},
			],

			// General rules
			'no-console': 'off', // Allowed in backend
			'no-debugger': 'error',
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},

	// Prettier config (must be last to override other configs)
	eslintConfigPrettier,
]
