import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Test isolation and timing improvements
    testTimeout: 10000, // 10 seconds per test
    hookTimeout: 10000, // 10 seconds for setup/teardown
    pool: 'threads',
    isolate: true, // Isolate tests to prevent interference
    // Setup files
    setupFiles: ['./src/test-utils/setup.ts'],
    // Sequential test execution to prevent database conflicts
    sequence: {
      concurrent: false, // Run tests sequentially to avoid conflicts
    },
    // Test file patterns
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/__tests__/**/*.test.ts',
      'src/__tests__/**/*.spec.ts'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'src/__tests__/helpers/**',
      'src/__tests__/setup/**',
      'src/__tests__/fixtures/**'
    ],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/test-utils/**',
        'src/__tests__/**',
      ],
      include: [
        'src/**/*.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/__tests__'),
      '@helpers': path.resolve(__dirname, './src/__tests__/helpers')
    }
  }
});