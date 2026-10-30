import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist', 'src/shared/api/generated/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
        },
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'auth', pattern: 'src/auth/**' },
        {
          type: 'feature',
          pattern: 'src/features/*',
          capture: ['featureName'],
          partialMatch: false,
        },
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'config', pattern: 'src/config/**' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'feature' } },
              disallow: { to: { element: { type: 'app' } } },
            },
            {
              from: { element: { type: 'auth' } },
              disallow: {
                to: { element: { types: { anyOf: ['app', 'feature'] } } },
              },
            },
            {
              from: { element: { type: 'shared' } },
              disallow: {
                to: {
                  element: {
                    types: { anyOf: ['auth', 'app', 'feature'] },
                  },
                },
              },
            },
            {
              from: { element: { type: 'config' } },
              disallow: {
                to: {
                  element: {
                    types: { anyOf: ['auth', 'app', 'feature'] },
                  },
                },
              },
            },
            {
              from: { element: { type: 'feature' } },
              to: { element: { type: 'feature' } },
              disallow: [{ to: { element: { type: 'feature' } } }],
            },
            {
              from: { element: { type: 'feature' } },
              to: { element: { type: 'feature' } },
              allow: [{ to: { element: { fileInternalPath: 'index.ts' } } }],
            },
          ],
        },
      ],
    },
  },
])
