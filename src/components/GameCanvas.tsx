
import React, { useRef, useEffect, useState } from 'react';
import { addBullet, createInitialGameState, GameObjectType, GameState, movePlayer, resetGame, updateGameState } from '@/utils/gameLogic';
import { Animator, easing } from '@/utils/animations';

interface GameCanvasProps {
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  onGameOver?: (finalScore: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onScoreChange, 
  onLivesChange, 
  onGameOver 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isStarted, setIsStarted] = useState(false);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Инициализация игры
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  // Обработка событий клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer(gameState, 0, -1);
          break;
        case 'ArrowDown':
        case 's':
          movePlayer(gameState, 0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer(gameState, -1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(gameState, 1, 0);
          break;
        case ' ':
          handleShoot();
          break;
        case 'p':
          handlePause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isStarted) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'w':
        case 's':
          movePlayer(gameState, gameState.objects.find(obj => obj.type === GameObjectType.PLAYER)?.vx || 0, 0);
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'a':
        case 'd':
          movePlayer(gameState, 0, gameState.objects.find(obj => obj.type === GameObjectType.PLAYER)?.vy || 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, isStarted]);

  // Обработка событий касания для мобильных устройств
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isStarted) return;
      
      const touch = e.touches[0];
      touchStartPosRef.current = {
        x: touch.clientX,
        y: touch.clientY
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isStarted || !touchStartPosRef.current) return;
      
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPosRef.current.x;
      const dy = touch.clientY - touchStartPosRef.current.y;
      
      const threshold = 10;
      const moveX = Math.abs(dx) > threshold ? Math.sign(dx) : 0;
      const moveY = Math.abs(dy) > threshold ? Math.sign(dy) : 0;
      
      movePlayer(gameState, moveX, moveY);
      
      touchStartPosRef.current = {
        x: touch.clientX,
        y: touch.clientY
      };
    };

    const handleTouchEnd = () => {
      if (!isStarted) return;
      
      movePlayer(gameState, 0, 0);
      touchStartPosRef.current = null;
    };

    const handleTap = (e: TouchEvent) => {
      if (!isStarted) return;
      handleShoot();
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchend', handleTap);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchend', handleTap);
    };
  }, [gameState, isStarted]);

  // Обработка событий мыши
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isStarted) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const player = gameState.objects.find(obj => obj.type === GameObjectType.PLAYER);
      if (player) {
        const dx = x - (player.x + player.width / 2);
        const dy = y - (player.y + player.height / 2);
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 5) {
          movePlayer(gameState, dx / length, dy / length);
        } else {
          movePlayer(gameState, 0, 0);
        }
      }
    };

    const handleMouseDown = () => {
      if (!isStarted) return;
      handleShoot();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameState, isStarted]);

  // Игровой цикл
  useEffect(() => {
    let previousScore = gameState.score;
    let previousLives = gameState.lives;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      if (isStarted && !gameState.isPaused && !gameState.isGameOver) {
        const newGameState = updateGameState(gameState, canvas);
        setGameState(newGameState);
        
        if (newGameState.score !== previousScore) {
          previousScore = newGameState.score;
          onScoreChange?.(newGameState.score);
        }
        
        if (newGameState.lives !== previousLives) {
          previousLives = newGameState.lives;
          onLivesChange?.(newGameState.lives);
        }
        
        if (newGameState.isGameOver) {
          onGameOver?.(newGameState.score);
        }
      }
      
      renderGame(canvas, gameState);
      requestIdRef.current = requestAnimationFrame(animate);
    };

    requestIdRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestIdRef.current);
  }, [gameState, isStarted, onGameOver, onLivesChange, onScoreChange]);

  // Отрисовка игры
  const renderGame = (canvas: HTMLCanvasElement, state: GameState) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Очистка канваса
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка фона
    ctx.fillStyle = 'rgba(249, 250, 251, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка сетки
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)';
    ctx.lineWidth = 1;
    
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Отрисовка всех игровых объектов
    state.objects.forEach(obj => {
      if (!obj.isActive) return;
      
      ctx.fillStyle = obj.color || '#000000';
      
      if (obj.type === GameObjectType.PLAYER) {
        // Рисуем игрока как космический корабль
        ctx.save();
        ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
        
        // Тело корабля
        ctx.beginPath();
        ctx.moveTo(obj.width / 2, 0);
        ctx.lineTo(-obj.width / 2, obj.height / 2);
        ctx.lineTo(-obj.width / 3, 0);
        ctx.lineTo(-obj.width / 2, -obj.height / 2);
        ctx.closePath();
        ctx.fill();
        
        // Двигатель (эффект пламени)
        if (Math.abs(obj.vx || 0) > 0 || Math.abs(obj.vy || 0) > 0) {
          ctx.fillStyle = '#F97316';
          ctx.beginPath();
          ctx.moveTo(-obj.width / 2, obj.height / 4);
          ctx.lineTo(-obj.width / 2 - 10 - Math.random() * 5, 0);
          ctx.lineTo(-obj.width / 2, -obj.height / 4);
          ctx.closePath();
          ctx.fill();
        }
        
        ctx.restore();
      } else if (obj.type === GameObjectType.OBSTACLE) {
        // Рисуем препятствие как астероид
        ctx.save();
        ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
        ctx.beginPath();
        
        const vertices = 8;
        const radius = obj.width / 2;
        
        for (let i = 0; i < vertices; i++) {
          const angle = (i / vertices) * Math.PI * 2;
          const variation = 0.8 + Math.random() * 0.4;
          const x = Math.cos(angle) * radius * variation;
          const y = Math.sin(angle) * radius * variation;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Добавляем детали астероиду
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 3; i++) {
          const x = (Math.random() - 0.5) * radius;
          const y = (Math.random() - 0.5) * radius;
          const size = 2 + Math.random() * 4;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      } else if (obj.type === GameObjectType.COLLECTIBLE) {
        // Рисуем коллекционный предмет как звезду
        ctx.save();
        ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
        
        const spikes = 5;
        const outerRadius = obj.width / 2;
        const innerRadius = obj.width / 4;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i / (spikes * 2)) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Добавляем свечение
        ctx.shadowColor = obj.color || '#10B981';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.restore();
      } else if (obj.type === GameObjectType.BULLET) {
        // Рисуем пулю с эффектом свечения
        ctx.save();
        ctx.shadowColor = '#3B82F6';
        ctx.shadowBlur = 5;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        ctx.restore();
      }
    });
    
    // Отрисовка старта/конца игры
    if (!isStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.font = '24px sans-serif';
      ctx.fillText('Нажмите для начала игры', canvas.width / 2, canvas.height / 2);
    } else if (state.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.font = '24px sans-serif';
      ctx.fillText('Игра окончена', canvas.width / 2, canvas.height / 2 - 30);
      ctx.fillText(`Счёт: ${state.score}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = '18px sans-serif';
      ctx.fillText('Нажмите для новой игры', canvas.width / 2, canvas.height / 2 + 50);
    }
  };

  // Обработчики событий
  const handleShoot = () => {
    const player = gameState.objects.find(obj => obj.type === GameObjectType.PLAYER);
    if (player) {
      addBullet(gameState, player);
    }
  };

  const handlePause = () => {
    setGameState(prevState => ({
      ...prevState,
      isPaused: !prevState.isPaused
    }));
  };

  const handleCanvasClick = () => {
    if (!isStarted) {
      setIsStarted(true);
    } else if (gameState.isGameOver) {
      setGameState(resetGame(gameState));
      setIsStarted(true);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-2xl touch-none cursor-pointer shadow-lg"
      onClick={handleCanvasClick}
    />
  );
};

export default GameCanvas;
