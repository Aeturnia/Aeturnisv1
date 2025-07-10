module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Console rules - environment specific
    'no-console': process.env.NODE_ENV === 'production' 
      ? ['error', { allow: ['warn', 'error'] }]
      : ['warn', { allow: ['warn', 'error', 'info'] }],
  },
  overrides: [
    {
      // Test files can use console for debugging
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      }
    },
    {
      // Scripts and tools
      files: ['**/scripts/**/*.js', '**/scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
      }
    }
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '**/*.d.ts',
    'build/',
    '.eslintrc.js',
  ],
};