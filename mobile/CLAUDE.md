# CLAUDE.md - RESQ Mobile Development Guide

## Project Overview

**RESQ Mobile** is a React Native + Expo application for disaster coordination and emergency reporting. This document provides context for Claude Code assistance during development.

### Technology Stack
- **Framework**: React Native 0.73+ with Expo SDK 50+
- **Language**: TypeScript (strict mode)
- **State**: Zustand (global) + TanStack Query (server)
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: Expo Router
- **Forms**: React Hook Form + Zod
- **API Client**: Axios with interceptors
- **Backend**: FastAPI (Python) on http://localhost:8000/api

### Related Documentation
- `MEMORY_BANK.md` - Project context and architecture decisions
- `TECHNOLOGY_STACK.md` - Technology choices and justifications
- `MODULES_PLAN.md` - Modular architecture and dependencies
- `API_INTEGRATION.md` - Backend API integration guide
- `SCREENS_ARCHITECTURE.md` - Screen design and component hierarchy

---

## Development Workflow

### Before You Start
1. Read all `.md` files in the mobile root directory
2. Check the design references in `../andorid tasarım/` folder
3. Review the backend API docs at `../backend/docs/API.md`

### Code Style
- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with hooks
- **Naming**: camelCase for JS, PascalCase for components
- **Imports**: Absolute imports with `@/` prefix
- **Exports**: Named exports in modules, default for screens

### Folder Structure
Each feature uses feature-based structure under `src/modules/`:
```
src/modules/[feature]/
├── components/        # UI components
├── screens/          # Screen components (if applicable)
├── hooks/            # Custom React hooks
├── services/         # API/business logic
├── stores/           # Zustand state stores
├── types/            # TypeScript types
└── index.ts          # Module exports
```

### Git Workflow
1. Work on feature branches: `git checkout -b feat/feature-name`
2. Commit messages: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
3. Keep commits focused and atomic
4. No direct pushes to main

---

## Design System Adherence

### Critical Rule ⚠️
**SCREENS MUST MATCH DESIGN MOCKUPS EXACTLY**

- Colors: Use hex codes from design
- Spacing: 16px base grid
- Typography: Refer to `src/lib/colors.ts` and design system
- Border radius: 8px (inputs), 12px (cards), 24px (buttons)
- Component placement: Exact positioning as per mockups

Design references are in: `../andorid tasarım/` folder
Reference docs: `SCREENS_ARCHITECTURE.md`

---

## Common Tasks

### Creating a New Module Feature
1. Create folder: `src/modules/[feature]/`
2. Create required subfolders: `components/`, `hooks/`, `services/`, `types/`
3. Create barrel export: `src/modules/[feature]/index.ts`
4. Reference in `MODULES_PLAN.md`

### Adding a New Screen
1. Create file in appropriate folder under `src/modules/`
2. Define TypeScript types with interfaces
3. Add Zod validation schema (if form)
4. Implement TanStack Query hooks
5. Use NativeWind for styling
6. Add to Expo Router navigation
7. Update `SCREENS_ARCHITECTURE.md`

### Working with Forms
```typescript
// Always use React Hook Form + Zod
const schema = z.object({
  field: z.string().min(1, "Required"),
})

type FormData = z.infer<typeof schema>
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

### API Integration
- Use `src/services/api.ts` for API client
- Define service methods in `src/modules/[feature]/services/`
- Wrap in TanStack Query hooks: `src/modules/[feature]/hooks/useFeature.ts`
- Error handling: Use APIError class from `src/lib/api-error.ts`

### Testing
```bash
npm test                    # Run all tests
npm test [filename]         # Run specific test
npm test --coverage        # Coverage report
```

---

## Backend Integration Points

### Authentication Flow
1. User logs in → JWT token
2. Token stored in SecureStore
3. Axios interceptor adds token to every request
4. Auto refresh on 401

### Report Creation Flow
1. User selects location
2. Confirms person count
3. Selects needs
4. Adds photos/audio (optional)
5. POST to `/api/reports`
6. TanStack Query invalidates cache

### Real-time Data (Future)
- WebSocket connection for live updates
- Background sync for offline-created reports

---

## Performance Guidelines

### General Rules
- Use TanStack Query for server state (never Redux for API data)
- Use Zustand for UI state only
- Memoize expensive components: `useMemo`, `useCallback`
- Lazy load screens with Expo Router
- Image optimization: Use Expo Image

### Common Bottlenecks to Avoid
- ❌ Unnecessary re-renders: Use `useCallback` for event handlers
- ❌ Blocking the main thread: Async operations in services
- ❌ Large lists without virtualization: Use FlatList properly
- ❌ Synchronous heavy computations: Use workers if needed

### Optimization Checklist
- [ ] No `any` types
- [ ] No unused imports
- [ ] No console.log in production
- [ ] Images optimized
- [ ] Animations use native driver
- [ ] API requests cached via TanStack Query

---

## Debugging Tips

### Common Issues

**API Connection Error**
```
Check: .env EXPO_PUBLIC_API_URL
Check: Backend server running (port 8000)
Check: Network requests in Expo DevTools
```

**Type Errors**
```
Run: npx tsc --noEmit
Check: tsconfig.json strict mode enabled
```

**State Management Issues**
```
Debug Zustand: Use Zustand DevTools browser extension
Debug Queries: Use TanStack Query DevTools
```

---

## Helpful Commands

```bash
# Development
npm run start              # Start Expo dev server
npm run android            # Run on Android emulator
npm run ios                # Run on iOS simulator
npm run web                # Run web preview

# Building
eas build --platform android
eas build --platform ios

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format with Prettier
npm test                  # Run Jest tests

# Dependency Management
npm update
npm audit fix
npm list [package]
```

---

## Links & References

- **Design Mockups**: `../andorid tasarım/` (9 screens)
- **Backend API**: `../backend/docs/API.md`
- **Database Schema**: `../backend/docs/DATABASE_SCHEMA.md`
- **React Native Docs**: https://reactnative.dev
- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org

---

## Questions to Ask Claude

Good starter questions:
- "Create the [Module Name] module with structure from MODULES_PLAN.md"
- "Implement the [Screen Name] screen matching the design at [image reference]"
- "Set up TanStack Query for [feature]"
- "Debug this TypeScript error..."
- "Review this component for performance"
- "Generate test suite for [feature]"

---

## Anti-Patterns to Avoid

🔴 **DON'T:**
- Use `any` types
- Store auth tokens in AsyncStorage (use SecureStore)
- Create API client instances in components
- Mix Redux with TanStack Query
- Ignore TypeScript errors
- Skip error boundaries
- Hard-code API URLs

🟢 **DO:**
- Use `unknown` → type guard → specific type
- Use SecureStore for sensitive data
- Centralize API client in services
- Use Zustand + TanStack Query (clear separation)
- Run `tsc --noEmit` before commit
- Add error boundaries to each module
- Use .env files for configuration

---

## Getting Help

1. Check the relevant .md file first
2. Look at similar components/screens as examples
3. Search codebase for similar patterns
4. Ask Claude for clarification on architecture decisions
5. Review backend API docs if integration issue

---

**Last Updated**: 2026-05-01  
**By**: Claude Code  
**Status**: Active Development
