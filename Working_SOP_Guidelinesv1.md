# Working SOP Guidelines v1.0
**Date**: 2025-07-11
**Purpose**: Efficient implementation strategy for Claude Code + Replit Agent collaboration

## Current System State

### ✅ What's Working
1. **Backend Services**: Fully operational on port 8080
   - Real API endpoints active
   - Database connected (PostgreSQL)
   - WebSocket server on port 3001
   - Authentication with JWT tokens
   - 14 real database services (NO MOCK SERVICES)

2. **Frontend Integration**: 
   - Service hooks connected to real APIs
   - State management with automatic updates
   - WebSocket integration for real-time features
   - Basic authentication flow

3. **Development Environment**:
   - Stable port configuration (8080)
   - Server monitoring and restart debugging
   - Health check endpoint responsive

### ❌ Missing Features
1. Mock/real service switching (VITE_USE_MOCKS defined but not implemented)
2. Quick Action Toolbar (core gameplay feature)
3. Dynamic Equipment Stats (shows hardcoded values)
4. Error handling and retry logic in UI
5. Offline mode UI feedback
6. UI preference persistence
7. Combat screen full integration
8. Mobile HUD improvements

## Division of Labor

### Claude Code Responsibilities
- **Architecture & Design**: System design, data models, API structure
- **Complex Business Logic**: Calculations, game mechanics, algorithms
- **Database Operations**: Schema changes, migrations, queries
- **Service Layer**: API endpoints, service implementations
- **Type Safety**: Interfaces, type definitions, contracts
- **Security**: Authentication, authorization, data validation
- **Performance**: Optimization, caching strategies
- **Error Handling**: Retry logic, fallback mechanisms

### Replit Agent Responsibilities
- **UI Components**: Creating and styling React components
- **Simple CRUD**: Basic data operations
- **File Organization**: Imports, exports, folder structure
- **Visual Design**: CSS, layouts, responsive design
- **Testing**: Running tests, fixing simple failures
- **Package Management**: npm installs, dependency updates
- **Basic Refactoring**: Renaming, moving files
- **UI State**: Local component state, form handling

## Implementation Workflow

### Phase 1: Planning (Claude Code)
1. Analyze requirements thoroughly
2. Design data models and API contracts
3. Create TypeScript interfaces
4. Plan service architecture
5. Document API endpoints

### Phase 2: Backend Implementation (Claude Code)
1. Implement service classes
2. Create API endpoints
3. Add business logic
4. Set up database operations
5. Implement authentication/authorization

### Phase 3: Frontend Scaffolding (Replit Agent)
1. Create component structure
2. Set up routing
3. Implement basic layouts
4. Add styling/CSS
5. Create placeholder content

### Phase 4: Integration (Both)
1. **Claude**: Wire up service hooks
2. **Replit**: Connect UI to hooks
3. **Claude**: Implement state management
4. **Replit**: Add loading/error states
5. **Both**: Test integration points

### Phase 5: Polish (Both)
1. **Claude**: Performance optimization
2. **Replit**: Responsive design
3. **Claude**: Error handling
4. **Replit**: Accessibility features
5. **Both**: Final testing

## Priority Implementation Order

### Immediate (High Impact, Low Effort)
1. **Quick Action Toolbar**
   - Replit: UI components (5-8 slots, drag-drop)
   - Claude: Cooldown system, action binding

2. **Dynamic Equipment Stats**
   - Claude: Calculate real stats from items
   - Claude: Update stat display logic

3. **Error Handling Layer**
   - Claude: Service-level retry logic
   - Replit: User-friendly error UI

### Foundation (Required for Development)
4. **Mock Service Implementation**
   - Claude: Create mock service classes
   - Claude: Service factory for env switching

5. **Offline Mode**
   - Claude: Offline detection in services
   - Replit: Offline UI indicators

### Feature Completion
6. **Combat Screen**
   - Both: Full integration with real service
   - Replit: Action buttons with cooldowns

7. **UI Persistence**
   - Replit: localStorage for preferences
   - Replit: Settings management UI

8. **Mobile HUD**
   - Replit: Collapsible panels
   - Replit: Touch-optimized controls

## Communication Protocol

### Task Handoff
1. Use clear task boundaries
2. Share interfaces/types first
3. Document expected behavior
4. Use TODO comments for handoffs
5. Test integration points early

### Code Standards
1. Follow existing patterns in codebase
2. Use TypeScript strictly
3. Document complex logic
4. Keep components focused
5. Maintain consistent naming

### Git Workflow
1. Feature branches for new work
2. Descriptive commit messages
3. Test before committing
4. Update CLAUDE.md with progress
5. Create PRs for review

## Success Metrics

### Code Quality
- TypeScript errors: 0
- Linting errors: 0
- Test coverage: >80%
- No hardcoded values
- Proper error handling

### Performance
- Page load: <3 seconds
- API response: <500ms
- Smooth animations (60fps)
- Efficient re-renders
- Optimized bundle size

### User Experience
- Intuitive navigation
- Clear error messages
- Responsive design
- Accessible UI
- Consistent styling

## Quick Reference

### Current Stack
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Socket.IO
- **State**: Custom StateManager
- **Auth**: JWT tokens

### Key Endpoints
- Health: `GET http://localhost:8080/health`
- Status: `GET http://localhost:8080/api/status`
- Auth: `POST http://localhost:8080/api/v1/auth/login`
- Game API: `http://localhost:8080/api/v1/*`

### Environment Variables
- `PORT=8080` (server)
- `VITE_USE_MOCKS=true` (not implemented)
- `JWT_SECRET` (required)
- `DATABASE_URL` (required)

## Next Steps

1. Start with Quick Action Toolbar implementation
2. Have Replit Agent create UI components
3. Claude implements action binding system
4. Test integration thoroughly
5. Move to next priority item

This SOP ensures efficient collaboration by leveraging each tool's strengths while maintaining code quality and project momentum.