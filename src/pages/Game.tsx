
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import GameCanvas from '@/components/GameCanvas';
import { toast } from 'sonner';
import { ArrowLeft, Heart, Trophy, Pause, Play } from 'lucide-react';

const Game = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Загрузка рекорда из localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Обработчики событий
  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    
    // Уведомление о достижении определенных отметок
    if (newScore > 0 && newScore % 100 === 0) {
      toast.success(`Поздравляем! Счёт: ${newScore}`, {
        position: 'top-center',
      });
    }
  };

  const handleLivesChange = (newLives: number) => {
    setLives(newLives);
    
    if (newLives < lives) {
      toast.error('Вы потеряли жизнь!', {
        position: 'top-center',
      });
    }
  };

  const handleGameOver = (finalScore: number) => {
    setIsGameOver(true);
    
    // Обновление рекорда
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('highScore', finalScore.toString());
      
      toast.success(`Новый рекорд: ${finalScore}!`, {
        position: 'top-center',
      });
    }
    
    toast(`Игра окончена! Ваш счёт: ${finalScore}`, {
      position: 'top-center',
    });
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleBack = () => {
    navigate('/');
  };

  // Индикаторы жизней
  const renderLives = () => {
    return Array(lives)
      .fill(0)
      .map((_, index) => (
        <Heart key={index} className="w-6 h-6 text-game-accent animate-pulse-soft" fill="#F43F5E" />
      ));
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Верхняя панель */}
      <div className="glass p-4 flex justify-between items-center z-10 border-b border-white/20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full aspect-square p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">{renderLives()}</div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">{highScore}</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full">
            <span className="font-semibold">{score}</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={togglePause} className="rounded-full aspect-square p-2">
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      
      {/* Игровая область */}
      <div className="flex-1 p-4">
        <GameCanvas
          onScoreChange={handleScoreChange}
          onLivesChange={handleLivesChange}
          onGameOver={handleGameOver}
        />
      </div>
      
      {/* Инструкции для мобильных устройств */}
      <div className="glass p-4 text-center text-sm z-10 border-t border-white/20">
        Перемещайте палец для движения. Нажмите, чтобы стрелять.
      </div>
      
      {/* Пауза */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in z-20">
          <div className="glass p-8 rounded-2xl max-w-sm w-full text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Пауза</h2>
            <p className="mb-6 text-gray-700">Игра приостановлена. Нажмите кнопку ниже, чтобы продолжить.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={togglePause}>Продолжить</Button>
              <Button variant="secondary" onClick={handleBack}>На главную</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Завершение игры */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in z-20">
          <div className="glass p-8 rounded-2xl max-w-sm w-full text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-2">Игра окончена</h2>
            
            <div className="mb-6">
              <p className="text-gray-700">Ваш счёт:</p>
              <p className="text-3xl font-bold">{score}</p>
              
              {score >= highScore && score > 0 && (
                <div className="mt-2 text-game-secondary font-medium">Новый рекорд!</div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>Играть снова</Button>
              <Button variant="secondary" onClick={handleBack}>На главную</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
