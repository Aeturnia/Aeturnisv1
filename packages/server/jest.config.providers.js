module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/providers/__tests__/**/*.test.ts',
    '**/providers/__tests__/**/*.test.js'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@aeturnis/shared$': '<rootDir>/../shared/src',
  },
  collectCoverageFrom: [
    'src/providers/**/*.ts',
    '!src/providers/__tests__/**',
    '!src/providers/**/*.d.ts',
    '!src/providers/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/providers/__tests__/setup.ts'],
  testTimeout: 10000,
  verbose: true,
};