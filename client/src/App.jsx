import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Room from './pages/Room';
import CreateRoom from './pages/CreateRoom';

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300}>
        <Toaster position="top-center" richColors />
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/create" element={<CreateRoom />} />
              <Route path="/room/:roomId" element={<Room />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
