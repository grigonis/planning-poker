import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user: authUser, loading: authLoading } = useAuthContext();
    const idTokenRef = useRef(null);

    useEffect(() => {
        // Wait until Firebase auth state has resolved before connecting.
        // This ensures we either attach a token (authenticated) or connect as guest.
        if (authLoading) return;

        const connect = async () => {
            // Get a fresh ID token if the user is signed in
            let idToken = null;
            if (authUser) {
                try {
                    idToken = await authUser.getIdToken();
                } catch (err) {
                    console.warn('[Socket] Could not get ID token — connecting as guest:', err.message);
                }
            }
            idTokenRef.current = idToken;

            const newSocket = io('http://localhost:5000', {
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
    // Reconnect whenever auth state changes (sign-in or sign-out)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser, authLoading]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
