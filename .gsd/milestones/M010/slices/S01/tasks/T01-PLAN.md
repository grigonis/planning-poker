/**
 * Simple token bucket rate limiter for socket events.
 * 
 * @param {Object} limits - Map of eventName to { max, windowMs }
 * @returns {Function} - Function that takes (socket, eventName) and returns true if allowed
 */
const createRateLimiter = (limits = {}) => {
  // Store limits per socket
  // Map<socketId, Map<eventName, { count, resetAt }>>
  const stores = new Map();

  return (socket, eventName) => {
    const limit = limits[eventName];
    if (!limit) return true; // No limit for this event

    const now = Date.now();
    let socketStore = stores.get(socket.id);
    if (!socketStore) {
      socketStore = new Map();
      stores.set(socket.id, socketStore);
      
      // Cleanup on disconnect
      socket.on('disconnect', () => {
        stores.delete(socket.id);
      });
    }

    const entry = socketStore.get(eventName) ?? { count: 0, resetAt: now + limit.windowMs };
    
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + limit.windowMs;
    }

    entry.count++;
    socketStore.set(eventName, entry);

    return entry.count <= limit.max;
  };
};

module.exports = createRateLimiter;
