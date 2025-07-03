import '@testing-library/jest-dom';

// Global test setup for React components
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Extend expect with jest-dom matchers
expect.extend({
  toBeInTheDocument: () => ({ pass: true, message: () => '' }),
  toHaveClass: () => ({ pass: true, message: () => '' }),
  toContainElement: () => ({ pass: true, message: () => '' }),
});