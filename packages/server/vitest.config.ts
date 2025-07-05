import { defineConfig } from 'vitest/config';

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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/test-utils/**',
      ],
    },
  },
});