// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  [
    globalIgnores(['dist', 'node_modules', 'coverage']),
    {
      files: ['**/*.{ts,tsx}'],
      extends: [
        js.configs.recommended,
        tseslint.configs.recommended,
        react.configs.flat.recommended,
        react.configs.flat['jsx-runtime'],
        reactRefresh.configs.vite,
        prettierConfig,
      ],
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        globals: globals.browser,
        parser: tseslint.parser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: {
        'jsx-a11y': jsxA11y,
        'react-hooks': reactHooks,
        react,
        import: importPlugin,
        'unused-imports': unusedImports,
        prettier,
      },
      settings: {
        react: {
          version: 'detect',
        },
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      rules: {
        // Prettier integration
        'prettier/prettier': 'off', // Use Prettier separately via npm run format

        // ESLint core rules
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        eqeqeq: ['error', 'always'],
        'no-implicit-coercion': 'error',
        'no-multi-spaces': 'error',
        'no-trailing-spaces': 'error',
        'comma-dangle': 'off', // Disabled - conflicts with prettier
        'object-shorthand': 'error',
        'arrow-body-style': ['error', 'as-needed'],

        // TypeScript rules
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', disallowTypeAnnotations: false },
        ],

        // React rules
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/jsx-key': ['error', { checkFragmentShorthand: true }],
        'react/no-array-index-key': 'warn',
        'react/no-unescaped-entities': 'warn',
        'react/self-closing-comp': 'error',
        'react/jsx-boolean-value': ['error', 'never'],
        'react/no-unknown-property': ['error', { ignore: ['jsx', 'global', 'css'] }],

        // React Hooks rules
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'off', // React 19 Compiler handles memoization

        // Accessibility rules
        ...jsxA11y.configs.recommended.rules,
        'jsx-a11y/label-has-associated-control': 'warn',
        'jsx-a11y/mouse-events-have-key-events': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/anchor-is-valid': 'warn',
        'jsx-a11y/no-noninteractive-element-interactions': 'warn',

        // Import rules
        'import/order': 'off', // Disabled - requires proper resolver setup
        'import/no-unresolved': 'off', // Disabled - path aliases resolution issues
        'import/no-self-import': 'off', // Disabled - requires resolver
        'import/no-cycle': 'off', // Disabled - requires project graph
        'import/no-duplicates': 'off', // Disabled - resolver issue with TypeScript
        'import/export': 'off', // Disabled - resolver issue with TypeScript
        // NOTE: Duplicate prevention is enforced via code review checklist
        // See: DUPLICATE_PREVENTION_CHECKLIST.md

        // Unused imports
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
      },
    },
    // Relax a few rules in test utilities only to avoid artificial type complexity
    {
      files: ['src/test/**/*.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
      rules: {
        // Allow any in test helpers/mocks to keep tests concise
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-default-export': 'off',
      },
    },
    // Scripts - allow console and any types for testing/utilities
    {
      files: ['scripts/**/*.{ts,tsx,js}'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    // Config files - more relaxed rules
    {
      files: ['*.config.ts', '*.config.js', 'vite.config.ts', 'vitest.config.ts'],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
  storybook.configs['flat/recommended']
);
