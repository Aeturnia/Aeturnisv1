# Aeturnis Online TypeScript Monorepo - Replit.md

## Overview

This is a production-ready TypeScript monorepo using Yarn workspaces with comprehensive tooling for code quality, testing, and CI/CD. The project is set up according to enterprise-grade development standards with proper linting, formatting, testing, and pre-commit hooks.

## Project Architecture

### Monorepo Structure
- **Root**: Yarn workspace configuration with shared tooling
- **Packages**: Individual workspace packages under `packages/`
- **Server Package**: `@aeturnis/server` - Express.js TypeScript server
- **Testing**: Vitest with coverage reporting and thresholds
- **Linting**: ESLint with TypeScript and Prettier integration
- **Git Hooks**: Husky for pre-commit code quality checks

### Current State

The monorepo includes:
- **TypeScript Configuration**: Shared base config with package-specific extensions
- **Testing Setup**: Vitest with 80% coverage thresholds
- **Code Quality**: ESLint v9 with TypeScript and Prettier
- **CI/CD**: GitHub Actions workflow for automated testing
- **Pre-commit Hooks**: Husky integration for code quality gates

## Technology Stack

### Core Dependencies
- **TypeScript**: Latest stable version for type safety
- **Yarn Workspaces**: Package management and monorepo organization
- **Vitest**: Modern testing framework with native TypeScript support
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting and style consistency
- **Husky**: Git hooks for pre-commit quality checks

### Development Dependencies
- **Express**: Web framework for server package
- **ts-node**: TypeScript execution for development
- **@types/node & @types/express**: TypeScript definitions

## Key Features

### Testing Framework
- Vitest with native TypeScript support
- Coverage reporting with v8 provider
- 80% minimum coverage thresholds
- Watch mode for development

### Code Quality Pipeline
- ESLint v9 with modern flat configuration
- TypeScript-aware linting rules
- Prettier integration for consistent formatting
- Pre-commit hooks prevent bad commits

### Workspace Configuration
- Yarn workspace with proper package isolation
- Shared TypeScript configuration inheritance
- Cross-package script orchestration
- Individual package build and test capabilities

## Available Scripts

- `yarn dev` - Start development server (server package)
- `yarn build` - Build all workspace packages
- `yarn test` - Run all tests
- `yarn test:coverage` - Run tests with coverage report
- `yarn lint` - Lint all TypeScript files
- `yarn format` - Format all code with Prettier
- `yarn typecheck` - Run TypeScript type checking

## Recent Changes

### July 03, 2025
- **Successfully Created TypeScript Monorepo**: Fully functional development environment with packages/server structure
- **Configured Development Scripts**: Fixed dev script to use ts-node for direct TypeScript execution
- **Verified Testing Framework**: All 2 tests passing with Vitest framework
- **Validated Build Process**: TypeScript compilation generates proper JavaScript output with source maps
- **Confirmed Type Safety**: TypeScript type checking passes without errors
- **Production-Ready Setup**: Complete development tooling with build, test, and typecheck scripts

## User Preferences

Preferred communication style: Simple, everyday language.
User requested: Production-ready TypeScript monorepo with comprehensive tooling.