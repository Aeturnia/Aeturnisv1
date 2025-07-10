module.exports = {
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
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': process.env.NODE_ENV === 'production' 
      ? ['error', { allow: ['warn', 'error'] }]
      : ['warn', { allow: ['warn', 'error', 'info'] }],
  },
  overrides: [
    {
      // Allow console in server startup and provider initialization
      files: ['**/server.ts', '**/providers/**/*.ts'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      // Stricter rules for services
      files: ['**/services/**/*.ts'],
      rules: {
        'no-console': ['error', { allow: ['error'] }]
      }
    },
    {
      // Files that need 'any' for dynamic property access
      files: [
        'src/services/CharacterService.ts',
        'src/services/NPCService.ts',
        'src/services/ResourceService.ts',
        'src/middleware/statSecurity.middleware.ts'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  ignorePatterns: ['dist/', 'node_modules/', '**/*.d.ts', 'src/types/express.d.ts'],
};