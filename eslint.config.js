// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  [
    globalIgnores(['dist']),
    {
      files: ['**/*.{ts,tsx}'],
      extends: [js.configs.recommended, tseslint.configs.recommended, reactRefresh.configs.vite],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
      },
      plugins: {
        'jsx-a11y': jsxA11y,
        'react-hooks': reactHooks,
      },
      rules: {
        ...jsxA11y.configs.recommended.rules,
        ...reactHooks.configs.recommended.rules,
        'jsx-a11y/label-has-associated-control': 'warn',
        'jsx-a11y/mouse-events-have-key-events': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
        'jsx-a11y/click-events-have-key-events': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        // React 19 Compiler handles memoization automatically - disable manual memoization warnings
        'react-hooks/exhaustive-deps': 'off',
        // Prevent console statements in production code
        'no-console': ['error', { allow: ['warn', 'error'] }],
      },
    },
    // Relax a few rules in test utilities only to avoid artificial type complexity
    {
      files: ['src/test/**/*.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
      rules: {
        // Allow any in test helpers/mocks to keep tests concise
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  storybook.configs['flat/recommended']
);
