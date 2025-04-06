
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from '@/context/GameContext';
import GamePage from '@/pages/Game';
import NotFoundPage from '@/pages/NotFound';
import GameStateHandler from '@/GameStateHandler';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <GameStateHandler />
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;
