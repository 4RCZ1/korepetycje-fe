// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // TypeScript and general rules that enhance the base config
      'no-unused-vars': 'off', // Turn off base rule in favor of TypeScript rule
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General code quality
      'prefer-const': 'error',
      'no-var': 'error',

      // Import rules (enhance existing import plugin from expo config)
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'off', // React Native has special module resolution
      'import/no-duplicates': 'error',
      'import/no-unused-modules': 'off', // Can be slow in large projects
    },
  },
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
    ],
  },
]);
