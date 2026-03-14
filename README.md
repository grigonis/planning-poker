# Keystimate — Planning Poker

Real-time planning poker for agile teams. Create a room, invite your team, vote on story points — no account required.

## Stack

| Layer | Tech |
|---|---|
| Client | React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| Server | Node.js, Express, Socket.io |
| Auth | Firebase Auth (Google, GitHub, Email magic link) — optional |
| Database | Firestore (session history, user profiles) |

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore enabled and Auth providers configured

### Setup

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
cp client/.env.example client/.env
cp server/.env.example server/.env
# Fill in your Firebase credentials in both .env files
```

### Development

```bash
# Terminal 1 — server
cd server && npm run dev

# Terminal 2 — client
cd client && npm run dev
```

Client runs at `http://localhost:5173`, server at `http://localhost:5000`.

### Production Build

```bash
cd client && npm run build
# Serve dist/ with any static host (Vercel, Netlify, etc.)
# Deploy server/ to Railway, Render, Fly.io, etc.
```

## Environment Variables

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_SERVER_URL` | Socket server URL (default: `http://localhost:5000`) |
| `VITE_FIREBASE_EMAIL_LINK_URL` | Email magic link redirect URL (default: `window.origin/dashboard`) |

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key |
| `PORT` | Server port (default: `5000`) |
| `CORS_ORIGIN` | Comma-separated allowed origins (default: `http://localhost:5173`) |

## Features

- **No account required** — guests get a persistent UUID stored in localStorage
- **Optional sign-in** — Google / GitHub OAuth or email magic link; history syncs across devices
- **Real-time voting** — Socket.io; auto-reveal when all eligible voters have voted
- **Session history** — voted tasks persisted to Firestore immediately on reveal; survives server restarts
- **Groups** — assign participants to groups; per-group averages calculated on reveal
- **Tasks panel** — create tasks, bulk import, select active task before voting
- **Themes** — light / dark mode
