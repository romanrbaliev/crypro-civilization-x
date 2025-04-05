
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Game from '@/pages/Game';
import GameScreen from '@/pages/GameScreen';
import NotFound from '@/pages/NotFound';
import { GameStateProvider } from '@/context/GameStateContext';
import { I18nProvider } from '@/context/I18nContext';
import './App.css';

// Создаем клиент для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <GameStateProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/game" replace />} />
              <Route path="/game" element={<GameScreen />} />
              <Route path="/game-legacy" element={<Game />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </GameStateProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
