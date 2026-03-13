import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Room from './pages/Room';
import CreateRoom from './pages/CreateRoom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300}>
        <Toaster position="top-center" richColors />
        <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/create" element={<CreateRoom />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/room/:roomId" element={<Room />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
