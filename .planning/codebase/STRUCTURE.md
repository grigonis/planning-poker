# Directory Structure

## Key Locations

### `/client`
- `src/components/`: Modular UI components.
  - `home/`: Specialized components for the landing page (Hero, Features, etc.).
  - `ui/`: Design system primitives (buttons, grids).
- `src/pages/`: Full-page views.
- `src/context/`: React context providers for global state.
- `src/assets/`: Static assets (SVG cards, logos).
- `src/index.css`: Global styles and design token definitions.

### `/server`
- `handlers/`: Logic for processing Socket.io events.
- `index.js`: Server entry point and middleware configuration.
- `store.js`: In-memory state management.

### `/.agent`
- `agents/`: Custom AI domain specialist definitions.
- `skills/`: Reusable agent capabilities and scripts.
- `scripts/`: Project-specific audit and verification scripts.

## Naming Conventions
- **React Components**: PascalCase (e.g., `HeroCards.jsx`).
- **Hooks/Context**: camelCase (e.g., `useSocket.js`, `SocketContext.jsx`).
- **Styles**: Tailwind-first, with specific utility classes in `index.css`.
- **Server Handlers**: camelCase functions exported for event registration.
