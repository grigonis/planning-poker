import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user: authUser, loading: authLoading } = useAuthContext();

    // Track last connected auth UID to avoid reconnecting on Firebase User object
    // re-creations (e.g. silent token refresh). We only want to reconnect on
    // actual identity changes: null → UID (sign-in) or UID → null (sign-out).
    const lastAuthUidRef = useRef(undefined); // undefined = not yet initialized

    useEffect(() => {
        // Wait until Firebase auth state has resolved before connecting.
        if (authLoading) return;

        const currentUid = authUser?.uid ?? null;

        // Skip reconnect if auth identity hasn't changed — prevents spurious
        // socket teardown/recreate cycles on Firebase User object refresh.
        if (lastAuthUidRef.current !== undefined && lastAuthUidRef.current === currentUid) {
            return;
        }
        lastAuthUidRef.current = currentUid;

        const connect = async () => {
            let idToken = null;
            if (authUser) {
                try {
                    idToken = await authUser.getIdToken();
                } catch (err) {
                    console.warn('[Socket] Could not get ID token — connecting as guest:', err.message);
                }
            }

            const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
            const newSocket = io(serverUrl, {
                auth: idToken ? { idToken } : {},
            });

            setSocket(newSocket);
            newSocket.on('connect', () => setIsConnected(true));
            newSocket.on('disconnect', () => setIsConnected(false));

            return newSocket;
        };

        let socketInstance;
        connect().then(s => { socketInstance = s; });

        return () => {
            socketInstance?.close();
        };
    // authUser included to capture current user object for getIdToken().
    // lastAuthUidRef guards against spurious reconnects on object re-creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser, authLoading]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
