# Aeturnis Online

A production-ready TypeScript monorepo using Yarn workspaces with comprehensive tooling for code quality, testing, and CI/CD.

![CI Status](https://github.com/Aeturnia/AeturnisV1/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/Aeturnia/AeturnisV1/branch/main/graph/badge.svg)](https://codecov.io/gh/Aeturnia/AeturnisV1)
[![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://typescriptlang.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Run tests
yarn test

# Run linting
yarn lint

# Format code
yarn format

# Build all packages
yarn build
```

## 📁 Project Structure

```
.
├── .github/workflows/      # GitHub Actions CI/CD
├── packages/
│   └── server/            # Express server package
├── .husky/                # Git hooks
├── package.json           # Root workspace configuration
├── tsconfig.base.json     # Shared TypeScript config
├── vitest.config.ts       # Test configuration
└── README.md
```

## 🛠️ Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build all packages
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn format` - Format code with Prettier
- `yarn typecheck` - Run TypeScript type checking

### Adding New Packages

To add a new package to the monorepo:

1. Create a new directory in `packages/`
2. Add a `package.json` with the workspace name format `@aeturnis/package-name`
3. Add a `tsconfig.json` extending the base configuration
4. The package will be automatically included in workspace operations

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for testing with:

- Coverage reporting via v8
- Watch mode for development
- Coverage thresholds (80% minimum)

## 📋 Code Quality

- **ESLint**: TypeScript-aware linting with recommended rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for code quality
- **TypeScript**: Strict type checking

## 🔧 Troubleshooting

### Common Issues

1. **Yarn workspace not found**: Ensure you're using Yarn v1 (classic)
2. **Husky hooks not running**: Run `yarn prepare` to reinstall hooks
3. **Coverage threshold failing**: Check vitest.config.ts thresholds
4. **ESLint errors**: Run `yarn lint:fix` to auto-fix issues

### Requirements

- Node.js ≥ 20.0.0
- Yarn ≥ 1.22.0

## 📝 License

MIT © [Aeturnia](https://github.com/Aeturnia)