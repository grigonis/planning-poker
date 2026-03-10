# Technical Concerns & Debt

## High Priority
- **In-Memory Store**: All room and voting data is lost on server restart. Lack of persistence prevents resuming sessions across crashes/restarts.
- **Scroll Optimization**: Landing page complexity (glassmorphism/filters) required optimization. Excessive use of `backdrop-blur` can still impact low-end devices.

## Technical Debt
- **CommonJS/ESM Mismatch**: Server uses CJS while Frontend uses ESM. This prevents easy sharing of utility functions (like vote consensus logic) between tiers.
- **Security**: WebSocket protocol is currently unauthenticated. Reliance on room IDs for "security" is a risk for private grooming sessions.
- **Error Boundaries**: Client needs more robust handling for socket disconnections or server timeouts.

## Performance
- Check layout shifts when `Navbar` transitions from `max-w-7xl` to `max-w-4xl`.
- Verify bundle sizes for large SVGs and dependencies like DiceBear.
