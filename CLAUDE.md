# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **DevClass**, a React-based educational platform frontend for learning programming languages. The application provides an interactive code editor, lessons, user authentication, and achievement tracking system.

**Key Technologies:**
- React 18 with Vite
- Chakra UI for components and theming
- Monaco Editor for code editing
- React Router for navigation
- Axios for API communication
- Docker for containerized deployment

## Development Commands

**Important:** The main source code is located in the `devClass/` subdirectory, not the root.

```bash
# Navigate to the main project directory
cd devClass/

# Install dependencies
npm ci

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Authentication System
- **Context-based authentication** using `AuthContext.jsx`
- JWT tokens stored in localStorage with automatic validation
- Axios interceptors automatically attach auth headers
- `PrivateRoute` component protects authenticated routes
- Backend API: `https://schooldev.duckdns.org/api/`

### Main Application Structure
- **App.jsx**: Main router with conditional navbar rendering based on route
- **LayoutWithNavbar**: Shared layout wrapper for authenticated pages
- **Routes:**
  - `/login`, `/register`: Public authentication pages
  - `/`: Home dashboard (protected)
  - `/editor`: Monaco-based code editor (protected)  
  - `/lessons`: Learning path with exercises (protected)
  - `/achievements`: User badges/achievements (protected)

### Code Editor Features
- Multi-language support (JavaScript, TypeScript, Python, Java, C#, PHP)
- Monaco Editor integration with syntax highlighting
- Code execution via Piston API (`https://emkc.org/api/v2/piston`)
- Language-specific code snippets and version management
- Real-time output display

### Key Components
- **CodeEditor.jsx**: Main editor interface with language selector
- **Output.jsx**: Code execution results display
- **LanguageSelector.jsx**: Programming language picker
- **Home.jsx**: Dashboard with course listings from backend API
- **Lessons.jsx**: Interactive learning path with exercise progression
- **Badges.jsx**: Achievement/badge display system

### API Integration
- Main backend: `https://schooldev.duckdns.org/api/`
- Code execution: Piston API for running user code safely
- Automatic token validation on app startup
- Error handling with automatic logout on auth failures

### Docker Configuration
- Multi-stage build (Node.js build + Nginx production)
- Non-root user for security
- Production-ready Nginx configuration
- Optimized for CI/CD deployment

### Code Quality Tools
- ESLint configuration for React/JSX
- SonarQube integration (`sonar-project.properties`)
- Project key: `schooldev_front`

## Development Notes

- All main source code is in `devClass/src/`
- Authentication state is managed globally via React Context
- The app validates JWT tokens on startup and automatically redirects to login if invalid
- Code editor supports secure execution through containerized Piston API
- Chakra UI theming system is configured but not extensively customized
- Routes are conditionally rendered based on authentication status