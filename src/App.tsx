
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from '@/context/GameContext';
import { ToastProvider } from '@/context/ToastContext';
import { EventBusProvider } from '@/context/EventBusContext';
import GamePage from '@/pages/Game';
import HomePage from '@/pages/Home';
import LoginPage from '@/pages/Login';
import SignupPage from '@/pages/Signup';
import SettingsPage from '@/pages/Settings';
import ReferralPage from '@/pages/Referral';
import DocsPage from '@/pages/Docs';
import StatisticsPage from '@/pages/Statistics';
import RebirthPage from '@/pages/Rebirth';
import NotFoundPage from '@/pages/NotFound';
import GameStateHandler from '@/GameStateHandler';
import { Toaster } from '@/components/ui/toaster';
import PrivateRoute from '@/components/auth/PrivateRoute';
import AuthProvider from '@/context/AuthContext';
import NavigateToGame from '@/components/NavigateToGame';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventBusProvider>
          <ToastProvider>
            <GameProvider>
              <GameStateHandler />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/game" element={<PrivateRoute><GamePage /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                <Route path="/referral" element={<PrivateRoute><ReferralPage /></PrivateRoute>} />
                <Route path="/docs" element={<PrivateRoute><DocsPage /></PrivateRoute>} />
                <Route path="/statistics" element={<PrivateRoute><StatisticsPage /></PrivateRoute>} />
                <Route path="/rebirth" element={<PrivateRoute><RebirthPage /></PrivateRoute>} />
                <Route path="/navigate" element={<NavigateToGame />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <Toaster />
            </GameProvider>
          </ToastProvider>
        </EventBusProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
