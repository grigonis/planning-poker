# Coding Conventions

## General Patterns
- **Functional Components**: React components use hooks and avoid class-based state.
- **Atomic Styles**: Priority is given to Tailwind CSS utilities. Complex effects (glassmorphism/noise) are extracted to `index.css`.
- **Props Destructuring**: Common practice in component signatures.

## Frontend (React/Vite)
- **ESM**: Using standard imports/exports.
- **Context API**: Used for cross-cutting concerns like sockets and themes instead of Redux.
- **Animations**: Prefer `framer-motion` for complex transitions and standard CSS transitions for simple hover states.

## Backend (Node/Express)
- **CommonJS**: Using `require` syntax for imports.
- **Modular Handlers**: Logic is separated from the main listener to keep `index.js` clean.
- **Non-Persistent Store**: Current implementation uses a simple memory object (`store.js`).

## UX/UI Principles
- **Aesthetic Excellence**: High use of glassmorphism, noise textures, and subtle animations (GSD/Antigravity standard).
- **Responsive**: Mobile-first grid layouts.
- **Performance**: Recent switch from CPU-heavy SVG filters to high-performance static textures for noise overlays.
