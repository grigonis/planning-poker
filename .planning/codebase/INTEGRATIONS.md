# External Integrations

## APIs & Services
- **WebSocket**: [Socket.io](https://socket.io/) (Self-hosted on Port 3000).
- **Avatars**: [DiceBear](https://www.dicebear.com/) (Generated on client).

## Protocol
- **CORS**: Currently permissive (`origin: "*"`) for internal/dev testing.
- **Payloads**: JSON-based event data.

## Environment Dependencies
- `PORT`: Server port (default 3000).
- Client requires `VITE_SOCKET_URL` or similar (inferred from `SocketContext`).
