require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Initialize Firebase Admin before any handlers — fails loudly if env vars missing
const { admin } = require("./firebase");
const { upsertUser } = require("./firestore");
const { rooms } = require("./store");

// SEC-09: Require explicit CORS_ORIGIN in production
if (!process.env.CORS_ORIGIN && process.env.NODE_ENV === 'production') {
    console.error('[FATAL] CORS_ORIGIN env var is required in production');
    process.exit(1);
}

const CORS_ORIGIN = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:5173'];

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

const registerRoomHandlers = require("./handlers/roomHandlers");
const registerVoteHandlers = require("./handlers/voteHandlers");
const registerTaskHandlers = require("./handlers/taskHandlers");
const registerGroupHandlers = require("./handlers/groupHandlers");

/**
 * Optional Firebase auth middleware.
 * If the client sends a Firebase ID token in socket.handshake.auth.idToken,
 * we verify it and attach socket.firebaseUid. Otherwise firebaseUid is null
 * (guest path — completely unchanged behaviour).
 */
io.use(async (socket, next) => {
    const idToken = socket.handshake.auth?.idToken;
    if (!idToken) {
        socket.firebaseUid = null;
        return next();
    }
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        socket.firebaseUid = decoded.uid;
        // Upsert user record — fire-and-forget
        upsertUser(decoded.uid, {
            email: decoded.email ?? null,
            displayName: decoded.name ?? null,
            photoURL: decoded.picture ?? null,
        }).catch(err => console.error('[Firestore] upsertUser failed:', err.message));
    } catch (err) {
        console.warn('[Auth] Invalid ID token — treating as guest:', err.message);
        socket.firebaseUid = null;
    }
    next();
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id} firebaseUid=${socket.firebaseUid ?? 'guest'}`);

    // Register Handlers
    registerRoomHandlers(io, socket);
    registerVoteHandlers(io, socket);
    registerTaskHandlers(io, socket);
    registerGroupHandlers(io, socket);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// SEC-08: Periodically expire abandoned rooms to prevent memory leaks
const ROOM_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours of inactivity
const ROOM_GC_INTERVAL_MS = 15 * 60 * 1000; // check every 15 minutes

setInterval(() => {
    const now = Date.now();
    let expired = 0;
    rooms.forEach((room, roomId) => {
        const anyConnected = Array.from(room.users.values()).some(u => u.connected);
        if (!anyConnected && now - (room.lastActivity ?? 0) > ROOM_TTL_MS) {
            rooms.delete(roomId);
            expired++;
        }
    });
    if (expired > 0) {
        console.log(`[GC] Expired ${expired} abandoned room(s). Active rooms: ${rooms.size}`);
    }
}, ROOM_GC_INTERVAL_MS);
