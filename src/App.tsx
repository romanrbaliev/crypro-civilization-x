
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotFound from '@/pages/NotFound';
import GameScreen from '@/pages/GameScreen';
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
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/game" replace />} />
            <Route path="/game" element={<GameScreen />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
