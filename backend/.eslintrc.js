/**
 * ESLint configuration for the backend TypeScript codebase.
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['log', 'warn', 'error', 'info'] }],
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '*.config.js',
    'prisma.config.ts',
    'prisma/**/*.ts',
    'tests/**/*.ts',
  ],
};
