import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'assets/js/data/course-index.js',
      'assets/js/data/lessons/**',
      'assets/js/core/icons.js'
    ]
  },
  js.configs.recommended,
  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser }
    }
  },
  {
    files: ['sw.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: { ...globals.serviceworker, ...globals.browser }
    }
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser }
    }
  },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }]
    }
  }
];
