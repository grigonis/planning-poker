require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in MVP
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

const registerRoomHandlers = require("./handlers/roomHandlers");
const registerVoteHandlers = require("./handlers/voteHandlers");

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register Handlers
    registerRoomHandlers(io, socket);
    registerVoteHandlers(io, socket);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        // Handle cleanup or "grey status" logic here
        // For now, we rely on "User Left" handler if explicitly called, 
        // or we can add automatic "idle" marking here.
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
