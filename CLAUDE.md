# Planning Poker — Claude Code Design System Rules

This document guides Claude Code when integrating Figma designs into this codebase.

---

## Project Overview

**Stack**: React 18 + Vite + Tailwind CSS + Socket.io
**Architecture**: Monorepo with `client/` (frontend) and `server/` (backend)
**Current branch**: `Playing-room-redesign`

---

## 1. Frameworks & Build System

- **UI**: React 18 (JSX, functional components, hooks only — no class components)
- **Router**: React Router DOM v7
- **Build**: Vite 5 (`client/vite.config.js`)
- **CSS**: Tailwind CSS v3 (utility-first, no CSS Modules, no Styled Components)
- **Icons**: Lucide React (`lucide-react` package)
- **Avatars**: Dicebear v9 (`@dicebear/core`, `@dicebear/collection`, avataaars style)
- **Class utilities**: `clsx` + `tailwind-merge` for conditional/safe class merging

---

## 2. Design Tokens

All tokens are defined in `client/tailwind.config.js`. Do **not** use raw hex values inline — always use the Tailwind token names.

### Colors

```js
// tailwind.config.js → theme.extend.colors
banana: {
  100: '#fffbea',
  200: '#fff1c2',
  300: '#ffe699',
  400: '#ffd24d',
  500: '#ffb800',   // ← PRIMARY brand accent
  600: '#e69900',
},
orange: { 500: '#ff5c00' },   // secondary accent
dark: {
  900: '#0a0a0a',    // ← page background
  800: '#151921',    // ← card/surface background
},
```

**Semantic usage:**
| Intent | Token |
|---|---|
| Primary CTA / highlight | `banana-500` |
| Hover on primary | `banana-600` |
| Page background | `dark-900` |
| Card / surface | `dark-800` |
| Body text | `gray-400` (`text-gray-400`) |
| Muted / secondary text | `white/60` |
| Online status | `green-500` (#22c55e) |
| Developer role | `indigo-500` / `indigo-600` |
| QA role | `rose-500` / `rose-600` |
| Error | `red-500` |

### Typography

Fonts are loaded via Google Fonts in `client/src/index.css`.

| Token | Family | Weights | Usage |
|---|---|---|---|
| `font-sans` | Inter | 300–900 | Body, UI text |
| `font-heading` | Poppins | 400–700 | Headings, titles |

**Scale examples:**
- Hero title: `text-7xl font-heading font-bold`
- Section heading: `text-3xl font-heading font-semibold`
- Body: `text-sm font-sans`
- Badge/label: `text-xs font-medium`

### Spacing

Uses Tailwind default 4px scale. Common values used in this project:
- Component gaps: `gap-2`, `gap-4`, `gap-6`, `gap-8`, `gap-12`
- Padding: `p-4`, `p-6`, `p-8`, `px-6 py-4`

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Small cards, inputs |
| `rounded-xl` | 12px | Modal panels |
| `rounded-2xl` | 16px | Large cards |
| `rounded-full` | 9999px | Avatars, badges, pills |
| `rounded-[60px]` | 60px | Poker table shape |

---

## 3. Styling Approach

### Rules

1. **Use Tailwind utility classes** for all styling. Never write raw CSS unless adding a reusable utility class to `index.css`.
2. **Add new utility classes** to `client/src/index.css` as `@layer utilities` blocks.
3. **Conditional classes**: use `clsx()` or `cn()` (clsx + twMerge).
4. **Dark theme only**: the app is dark-mode only (`bg-dark-900` base). Do not add light mode variants.

### Glassmorphism Utilities (from `index.css`)

```css
.glass-card   /* rgba(21,25,33,0.7) + 12px blur + 1px white/5 border */
.glass        /* rgba(255,255,255,0.03) + 12px blur + 1px white/10 border */
.glass-gold   /* banana gradient + 16px blur + banana border + banana glow */
```

Use these classes for cards, panels, and modals instead of inline backdrop-filter styles.

### Glow / Shadow Effects

Custom glow via inline Tailwind-compatible shadow:
```jsx
className="shadow-[0_0_20px_rgba(255,184,0,0.1)]"  // banana glow
className="shadow-[0_0_30px_rgba(255,184,0,0.3)]"  // strong banana glow
```

---

## 4. Component Architecture

### File Structure

```
client/src/
├── assets/banana-poker/   # Brand images/SVGs
├── assets/card*.svg       # Game card assets
├── components/
│   ├── home/              # Landing page components
│   ├── Room/              # Poker table + avatar
│   ├── Voting/            # Card + voting overlay
│   └── Results/           # Results board
├── pages/
│   ├── Landing.jsx
│   └── Room.jsx
└── context/
    └── SocketContext.jsx
```

### Conventions

- **Functional components only** with hooks
- **Props**: destructured inline, no PropTypes
- **State**: `useState` for local, `useSocket()` context for real-time global state
- **No Redux / Zustand** — keep state local or in SocketContext
- **File naming**: PascalCase for components (`PokerTable.jsx`), camelCase for utilities

### Icon Usage Pattern

```jsx
import { Crown, Eye, Play, X } from 'lucide-react';

// Usage — always specify size in pixels
<Crown size={10} className="text-banana-500" />
<Play size={18} />
```

Common sizes: 10, 15, 18, 20, 24, 32

---

## 5. Asset Management

### Location

All client assets live in `client/src/assets/`:
- `banana-poker/` — brand SVGs and PNGs (logo, illustrations, social icons)
- `card1.svg`–`card8.svg` — poker card graphics

### Import Pattern

```js
// Always import as ES module, never reference by public URL
import bananaLogo from '../../assets/banana-poker/banana-logo.svg';
import card1 from '../assets/card1.svg';
```

### New Assets from Figma

1. Export SVGs from Figma (optimized, no IDs)
2. Place in `client/src/assets/banana-poker/` (brand) or `client/src/assets/` (game)
3. Import as ES module in the component

---

## 6. Animations

Defined as custom Tailwind keyframes in `tailwind.config.js`:

| Class | Duration | Description |
|---|---|---|
| `animate-blob` | 7s infinite | Organic blob morph |
| `animate-pulse-slow` | 4s | Slow pulse |
| `animate-expand-contract` | 6s | Expand/rotate (card shuffle) |
| `animate-flip` | — | 3D card flip |
| `animate-in`, `fade-in`, `zoom-in-95` | — | Entry animations (tailwindcss-animate) |

**Transition defaults**:
- Fast UI: `transition duration-200`
- Standard: `transition duration-300`
- Slow/emphasis: `transition duration-500 ease-in-out`

---

## 7. Responsive Design

- Mobile-first with Tailwind breakpoints
- Common pattern: `grid-cols-4 md:grid-cols-7` (voting cards)
- Poker table uses absolute positioning — handle responsive via parent constraints
- Modals: `w-full max-w-md mx-auto` pattern

---

## 8. Real-time / Socket.io

- Global socket managed in `SocketContext.jsx`
- Access via `const socket = useSocket()`
- Room state lives in `Room.jsx` via socket event listeners
- localStorage key: `banana_session_{roomId}` — stores `{ userId, name, role, roomId }`

---

## 9. When Implementing Figma Designs

1. **Identify tokens**: Map Figma colors → `banana-*`, `dark-*`, or Tailwind defaults
2. **Use utility classes**: Translate all spacing/radius/shadow to Tailwind tokens
3. **Reuse glass utilities**: Apply `.glass-card`, `.glass-gold` for frosted panels
4. **Lucide icons**: If a new icon is needed, import from `lucide-react` — don't add SVG inline
5. **New assets**: Export from Figma as optimized SVG, import as ES module
6. **No new CSS files**: Add utility classes to `index.css @layer utilities` only if truly reusable
7. **Font**: Use `font-sans` (Inter) for UI, `font-heading` (Poppins) for titles
8. **Dark only**: Always use `dark-900`/`dark-800` backgrounds, never white/light surfaces
