
import React, { useEffect, useRef, useState } from 'react';

interface GameCanvasProps {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onGameOver: (finalScore: number) => void;
  isPaused?: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onScoreChange, 
  onLivesChange,
  onGameOver,
  isPaused = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Справочники для игровой логики
  const gameStateRef = useRef({
    playerX: 0,
    playerY: 0,
    enemies: [] as {x: number, y: number, speed: number, size: number}[],
    bullets: [] as {x: number, y: number, speed: number}[],
    score: 0,
    lives: 3,
    lastFrameTime: 0,
    isPaused: false,
    isGameOver: false,
    touchX: null as number | null,
    touchY: null as number | null
  });
  
  // Инициализация игры
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Устанавливаем размер canvas
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Обновляем начальную позицию игрока
        gameStateRef.current.playerX = canvas.width / 2;
        gameStateRef.current.playerY = canvas.height - 50;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Обработчики событий для мыши и касаний
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.playerX = e.clientX - rect.left;
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (gameStateRef.current.isPaused || gameStateRef.current.isGameOver) return;
      fireBullet();
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      setIsGameStarted(true);
      
      if (gameStateRef.current.isPaused || gameStateRef.current.isGameOver) return;
      
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      
      gameStateRef.current.touchX = touch.clientX - rect.left;
      gameStateRef.current.touchY = touch.clientY - rect.top;
      
      // Выстрел при нажатии
      fireBullet();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      if (gameStateRef.current.isPaused || gameStateRef.current.isGameOver) return;
      
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      
      gameStateRef.current.touchX = touch.clientX - rect.left;
      gameStateRef.current.touchY = touch.clientY - rect.top;
      
      // Обновляем позицию игрока при движении
      gameStateRef.current.playerX = gameStateRef.current.touchX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      gameStateRef.current.touchX = null;
      gameStateRef.current.touchY = null;
    };
    
    // Добавляем обработчики событий
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Запуск игрового цикла
    startGameLoop();
    
    // Удаляем обработчики при размонтировании
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  // Обновляем состояние паузы в соответствии с пропсом
  useEffect(() => {
    gameStateRef.current.isPaused = isPaused;
  }, [isPaused]);
  
  // Стрельба
  const fireBullet = () => {
    const bullet = {
      x: gameStateRef.current.playerX,
      y: gameStateRef.current.playerY - 20,
      speed: 8
    };
    
    gameStateRef.current.bullets.push(bullet);
  };
  
  // Создание врага
  const createEnemy = (canvasWidth: number) => {
    const size = 20 + Math.random() * 15;
    return {
      x: Math.random() * (canvasWidth - size * 2) + size,
      y: -size,
      speed: 1 + Math.random() * 2,
      size: size
    };
  };
  
  // Игровой цикл
  const startGameLoop = () => {
    const loop = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const gameState = gameStateRef.current;
      
      // Расчет delta time для гладкой анимации
      if (!gameState.lastFrameTime) {
        gameState.lastFrameTime = timestamp;
      }
      
      const deltaTime = timestamp - gameState.lastFrameTime;
      gameState.lastFrameTime = timestamp;
      
      // Если игра на паузе или закончена, не обновляем
      if (!gameState.isPaused && !gameState.isGameOver) {
        updateGame(deltaTime, canvas.width, canvas.height);
      }
      
      // Отрисовка
      drawGame(ctx, canvas.width, canvas.height);
      
      // Продолжаем цикл
      requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
  };
  
  // Обновление состояния игры
  const updateGame = (deltaTime: number, canvasWidth: number, canvasHeight: number) => {
    const gameState = gameStateRef.current;
    
    // Создаем новых врагов случайно
    if (Math.random() < 0.02) {
      gameState.enemies.push(createEnemy(canvasWidth));
    }
    
    // Двигаем врагов
    gameState.enemies.forEach((enemy, i) => {
      enemy.y += enemy.speed * (deltaTime / 16);
      
      // Проверка коллизии с игроком
      const dx = enemy.x - gameState.playerX;
      const dy = enemy.y - gameState.playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < enemy.size + 15) {
        // Коллизия с игроком
        gameState.enemies.splice(i, 1);
        gameState.lives--;
        
        // Обновляем UI
        setLives(gameState.lives);
        onLivesChange(gameState.lives);
        
        // Проверяем условие окончания игры
        if (gameState.lives <= 0) {
          gameState.isGameOver = true;
          setIsGameOver(true);
          onGameOver(gameState.score);
        }
      }
      
      // Удаляем врагов, вышедших за экран
      if (enemy.y > canvasHeight + enemy.size) {
        gameState.enemies.splice(i, 1);
      }
    });
    
    // Двигаем пули
    gameState.bullets.forEach((bullet, i) => {
      bullet.y -= bullet.speed * (deltaTime / 16);
      
      // Удаляем пули, вышедшие за экран
      if (bullet.y < 0) {
        gameState.bullets.splice(i, 1);
        return;
      }
      
      // Проверяем коллизии с врагами
      gameState.enemies.forEach((enemy, j) => {
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.size) {
          // Пуля попала во врага
          gameState.bullets.splice(i, 1);
          gameState.enemies.splice(j, 1);
          gameState.score += 10;
          
          // Обновляем UI
          setScore(gameState.score);
          onScoreChange(gameState.score);
        }
      });
    });
  };
  
  // Отрисовка игры
  const drawGame = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const gameState = gameStateRef.current;
    
    // Очищаем холст
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Фон
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Звезды
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = Math.sin(i * 0.5) * canvasWidth;
      const y = (i * canvasHeight / 50 + Date.now() * 0.01) % canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Игрок
    ctx.fillStyle = '#4cc9f0';
    ctx.beginPath();
    ctx.moveTo(gameState.playerX, gameState.playerY - 15);
    ctx.lineTo(gameState.playerX - 15, gameState.playerY + 15);
    ctx.lineTo(gameState.playerX + 15, gameState.playerY + 15);
    ctx.closePath();
    ctx.fill();
    
    // Добавляем свечение к игроку
    ctx.shadowColor = '#4cc9f0';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#4cc9f0';
    ctx.beginPath();
    ctx.arc(gameState.playerX, gameState.playerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Враги
    gameState.enemies.forEach(enemy => {
      // Градиент для врагов
      const enemyGradient = ctx.createRadialGradient(
        enemy.x, enemy.y, 0,
        enemy.x, enemy.y, enemy.size
      );
      enemyGradient.addColorStop(0, '#f72585');
      enemyGradient.addColorStop(1, '#7209b7');
      
      ctx.fillStyle = enemyGradient;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Добавляем свечение к врагам
      ctx.shadowColor = '#f72585';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#f72585';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    
    // Пули
    ctx.fillStyle = '#fee440';
    gameState.bullets.forEach(bullet => {
      ctx.shadowColor = '#fee440';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    
    // Экран паузы
    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctx.font = '30px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('ПАУЗА', canvasWidth / 2, canvasHeight / 2);
    }
    
    // Экран начала игры
    if (!isGameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Нажмите для начала игры', canvasWidth / 2, canvasHeight / 2);
    }
    
    // Экран окончания игры
    if (isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctx.font = '30px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('ИГРА ОКОНЧЕНА', canvasWidth / 2, canvasHeight / 2 - 30);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Счёт: ${gameState.score}`, canvasWidth / 2, canvasHeight / 2 + 20);
    }
  };
  
  return (
    <div className="w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full touch-none"
        onClick={() => setIsGameStarted(true)}
      />
    </div>
  );
};

export default GameCanvas;
