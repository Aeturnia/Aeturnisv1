# Aeturnis Online TypeScript Monorepo - Replit.md

## Overview

This is a production-ready TypeScript monorepo using Yarn workspaces with comprehensive tooling for code quality, testing, and CI/CD. The project is set up according to enterprise-grade development standards with proper linting, formatting, testing, and pre-commit hooks.

## Project Architecture

### Comprehensive Monorepo Structure
- **Root**: Workspace configuration with shared tooling and scripts
- **Packages**: Three specialized packages for complete game development
  - **`@aeturnis/server`**: Express.js backend with TypeScript
  - **`@aeturnis/client`**: React frontend with Vite and game UI
  - **`@aeturnis/shared`**: Common types, utilities, and game logic
- **Documentation**: Comprehensive docs structure with API, guides, and game design
- **Environment**: Multi-environment configuration (.env files)
- **Testing**: Vitest with coverage reporting across all packages

### Enhanced Architecture Features

The expanded monorepo now includes:
- **Complete Game Stack**: Frontend, backend, and shared utilities
- **MMORPG Types**: Character races, stats, combat system, and game events
- **React Game Client**: Modern React app with Zustand state management
- **WebSocket Support**: Real-time game communication infrastructure
- **Progressive Web App**: PWA configuration for mobile-friendly gaming
- **Comprehensive Documentation**: API docs, game design, and development guides
- **Environment Management**: Development, test, and production configurations

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

### July 03, 2025 - Major Project Structure Improvements
- **Successfully Created TypeScript Monorepo**: Fully functional development environment with packages/server structure
- **Implemented Comprehensive Monorepo Structure**: Added client and shared packages for complete game development
- **Added React Game Client**: Modern React frontend with Vite, TypeScript, and game-specific components
- **Created Shared Utilities Package**: Common types, constants, and utilities for MMORPG game logic
- **Implemented Environment Configuration**: Multi-environment setup with .env files for development, test, and production
- **Added Comprehensive Documentation**: API documentation, development guides, and game design documentation
- **Enhanced Package Scripts**: Build, test, and typecheck scripts for all packages with workspace management
- **Installed Modern Dependencies**: React, Vite, Zustand, React Query, and Socket.io for full-stack game development
- **Configured Progressive Web App**: PWA setup for mobile-friendly gaming experience
- **Established Game Architecture**: MMORPG-specific types, character system, combat mechanics, and real-time communication

## User Preferences

Preferred communication style: Simple, everyday language.
User requested: Production-ready TypeScript monorepo with comprehensive tooling.