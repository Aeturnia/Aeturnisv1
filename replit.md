# Game Development Environment - Replit.md

## Overview

This is a full-stack web application designed as a game development environment. It combines a React frontend with an Express backend, featuring a custom game engine built with HTML5 Canvas and supporting modern web technologies. The application is structured as a monorepo with shared code between client and server components.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with custom configuration
- **Game Engine**: Custom HTML5 Canvas-based game engine
- **3D Graphics**: Three.js integration with React Three Fiber
- **State Management**: Zustand for game state and audio management
- **UI Library**: Radix UI components with custom Tailwind CSS styling
- **Asset Support**: GLTF/GLB models, audio files (MP3, OGG, WAV)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: In-memory storage with fallback to database
- **Development**: Hot module replacement with Vite middleware

### Technology Stack
- **Language**: TypeScript across the entire stack
- **CSS**: Tailwind CSS with custom design system
- **Database**: PostgreSQL (configured but not yet fully implemented)
- **ORM**: Drizzle with migration support
- **Package Manager**: npm

## Key Components

### Game Engine (`client/src/lib/gameEngine.ts`)
- Custom HTML5 Canvas-based game engine
- Frame-based rendering loop with FPS tracking
- Automatic canvas resizing and responsive design
- Built-in debugging and performance monitoring

### Game State Management
- **Game Store** (`client/src/lib/stores/useGame.tsx`): Manages game phases (ready, playing, ended)
- **Audio Store** (`client/src/lib/stores/useAudio.tsx`): Handles sound effects and background music with mute functionality

### Game Loop (`client/src/hooks/useGameLoop.ts`)
- Custom React hook for managing game animation frames
- Provides delta time for smooth animations
- Handles cleanup on component unmount

### UI Components
- Comprehensive UI component library based on Radix UI
- Game-specific interface components with overlay support
- Responsive design with mobile considerations

### Database Schema (`shared/schema.ts`)
- User management with authentication support
- Drizzle ORM schema definitions
- Type-safe database operations

## Data Flow

### Game Flow
1. Application starts in "ready" phase
2. User interaction triggers transition to "playing" phase
3. Game engine runs continuous update/render loop
4. Game events trigger state changes through Zustand stores
5. Game completion transitions to "ended" phase

### Client-Server Communication
- RESTful API endpoints (currently minimal, ready for expansion)
- Shared TypeScript types between client and server
- Session management for user authentication

### Asset Loading
- Static assets served through Vite in development
- Support for 3D models, audio files, and textures
- Optimized asset loading with proper MIME types

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, React Three Fiber
- **Three.js**: 3D graphics library with post-processing effects
- **Radix UI**: Accessible UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Drizzle**: Type-safe PostgreSQL ORM

### Development Dependencies
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing and optimization

### Database Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development
- Concurrent client and server development with Vite HMR
- Database migrations with Drizzle Kit
- TypeScript compilation checking

### Production Build
- Client: Vite builds optimized React bundle
- Server: ESBuild bundles Express server for Node.js
- Database: Drizzle migrations ensure schema consistency

### Environment Configuration
- Environment variables for database connection
- Configurable development vs production settings
- Asset optimization and compression for production

## Changelog

Changelog:
- July 03, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.