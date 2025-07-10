// ESLint config for CI - allows necessary 'any' types
module.exports = {
  extends: './.eslintrc.js',
  rules: {
    // Override the warning to off for CI
    '@typescript-eslint/no-explicit-any': 'off',
  }
};