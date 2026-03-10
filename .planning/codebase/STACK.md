# Technology Stack

**Analysis Date:** 2026-03-10

## Languages

**Primary:**
- JavaScript (ES6+, JSX) - Frontend and Backend logic

## Runtime

**Environment:**
- Node.js (v18+ recommended)
- Vite (v5.1.0) for frontend development and building

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present in root, client, and server

## Frameworks

**Core:**
- React (v18.2.0) - Frontend UI framework
- Express (v5.2.1) - Backend server framework
- Socket.io (v4.8.3) - Real-time communication (Server)
- Socket.io Client (v4.8.3) - Real-time communication (Client)

**Styling:**
- Tailwind CSS (v3.4.17) - Utility-first CSS framework
- Framer Motion (v11.18.2) - Animation library
- Lucide React (v0.564.0) - Icon library

**Testing:**
- Playwright (for E2E)

## Key Dependencies

**Critical:**
- `socket.io` - Core real-time engine
- `react-router-dom` (v7.13.0) - Client-side routing
- `@dicebear/core` & `@dicebear/collection` (v9.3.2) - Avatar generation
- `framer-motion` - Critical for UI animations

## Configuration

**Environment:**
- `dotenv` used on server for environment variable management
- `client/vite.config.js` for frontend build configuration
- `client/tailwind.config.js` for design tokens and theme extensions

---

*Stack analysis: 2026-03-10*
