
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { GameProvider } from './context/GameContext';
import GameScreen from './pages/GameScreen';
import WelcomeScreen from './pages/WelcomeScreen';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="crypto-civ-theme">
      <GameProvider>
        <Router>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/game" element={<GameScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </GameProvider>
    </ThemeProvider>
  );
};

export default App;
