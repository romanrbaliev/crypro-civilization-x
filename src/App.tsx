
import { Routes, Route } from 'react-router-dom';
import WelcomeScreen from './pages/WelcomeScreen';
import GameScreen from './pages/GameScreen';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
