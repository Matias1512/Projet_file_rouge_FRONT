# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a React-based code learning platform called "DevClass" with the following architecture:

- **Frontend**: React 18 + Vite + Chakra UI + Monaco Editor
- **Authentication**: JWT-based with localStorage persistence and Axios interceptors
- **Routing**: React Router with protected routes using `PrivateRoute` component
- **Code Execution**: External Piston API for secure code execution in multiple languages

The main application is located in the `devClass/` directory, not at the root level.

## Key Components

- `App.jsx`: Main app with routing logic and conditional navbar rendering
- `AuthContext.jsx`: Authentication state management with JWT token handling
- `PrivateRoute.jsx`: Route protection component
- `CodeEditor.jsx`: Monaco editor integration with language selection
- `LayoutWithNavbar.jsx`: Layout wrapper for authenticated pages
- `Lessons.jsx`: Learning content component
- `Badges.jsx`: Achievement/badges system

## Development Commands

All commands should be run from the `devClass/` directory:

```bash
# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Code Execution Architecture

The application uses the Piston API (emkc.org) for secure code execution:
- Supported languages defined in `constants.js`: JavaScript, TypeScript, Python, Java, C#, PHP
- Code execution isolated via external API (no local execution)
- Language versions are pinned in `LANGUAGE_VERSIONS` constant

## Authentication Flow

1. JWT tokens stored in localStorage
2. Axios interceptor automatically attaches Bearer token to requests
3. `AuthContext` provides `login`, `logout`, `isAuthenticated` state
4. Protected routes redirect unauthenticated users to login

## API Integration

- Main API client in `api.js` configured for Piston API
- Uses Axios with base URL configuration
- Authentication handled via context and interceptors

## Current Branch Structure

- Working on `lessons_page` branch
- Main branch is `main`
- Recent development includes login/registration system and private routing