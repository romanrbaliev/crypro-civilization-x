
// Базовая логика игры

// Типы для игровых объектов
export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx?: number;
  vy?: number;
  color?: string;
  type: GameObjectType;
  isActive: boolean;
}

export enum GameObjectType {
  PLAYER = 'player',
  OBSTACLE = 'obstacle',
  COLLECTIBLE = 'collectible',
  BULLET = 'bullet',
  BACKGROUND = 'background'
}

// Состояние игры
export interface GameState {
  isGameOver: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  lives: number;
  objects: GameObject[];
  lastTimestamp: number;
}

// Инициализация начального состояния игры
export function createInitialGameState(): GameState {
  return {
    isGameOver: false,
    isPaused: false,
    score: 0,
    level: 1,
    lives: 3,
    objects: [
      {
        id: 'player',
        x: 50,
        y: 50,
        width: 30,
        height: 30,
        vx: 0,
        vy: 0,
        color: '#3B82F6',
        type: GameObjectType.PLAYER,
        isActive: true
      }
    ],
    lastTimestamp: performance.now()
  };
}

// Обновление игрового состояния на каждый тик игрового цикла
export function updateGameState(state: GameState, canvas: HTMLCanvasElement): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const now = performance.now();
  const deltaTime = (now - state.lastTimestamp) / 1000; // в секундах
  
  // Создаем копию состояния для обновления
  const newState: GameState = { ...state, lastTimestamp: now };
  
  // Обновляем положение всех объектов
  newState.objects = state.objects.map(obj => {
    if (!obj.isActive) return obj;
    
    let newX = obj.x;
    let newY = obj.y;
    
    if (obj.vx !== undefined) {
      newX += obj.vx * deltaTime;
    }
    
    if (obj.vy !== undefined) {
      newY += obj.vy * deltaTime;
    }
    
    // Проверка выхода за границы для игрока
    if (obj.type === GameObjectType.PLAYER) {
      newX = Math.max(0, Math.min(canvas.width - obj.width, newX));
      newY = Math.max(0, Math.min(canvas.height - obj.height, newY));
    }
    
    return { ...obj, x: newX, y: newY };
  });
  
  // Проверка столкновений между объектами
  newState.objects.forEach(obj1 => {
    if (!obj1.isActive || obj1.type === GameObjectType.BACKGROUND) return;
    
    newState.objects.forEach(obj2 => {
      if (!obj2.isActive || obj1.id === obj2.id || obj2.type === GameObjectType.BACKGROUND) return;
      
      if (checkCollision(obj1, obj2)) {
        handleCollision(obj1, obj2, newState);
      }
    });
  });
  
  // Удаляем объекты, которые вышли за пределы экрана
  newState.objects = newState.objects.filter(obj => {
    if (obj.type === GameObjectType.PLAYER || obj.type === GameObjectType.BACKGROUND) return true;
    
    return obj.isActive && 
           obj.x + obj.width > 0 && 
           obj.x < canvas.width && 
           obj.y + obj.height > 0 && 
           obj.y < canvas.height;
  });
  
  // Если это подходящее время, добавляем новые препятствия
  if (Math.random() < 0.02 * deltaTime * newState.level) {
    addObstacle(newState, canvas);
  }
  
  // Если это подходящее время, добавляем коллекционные предметы
  if (Math.random() < 0.01 * deltaTime * newState.level) {
    addCollectible(newState, canvas);
  }
  
  return newState;
}

// Проверка столкновения между двумя объектами
function checkCollision(obj1: GameObject, obj2: GameObject): boolean {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Обработка столкновения между объектами
function handleCollision(obj1: GameObject, obj2: GameObject, state: GameState): void {
  // Игрок сталкивается с препятствием
  if (obj1.type === GameObjectType.PLAYER && obj2.type === GameObjectType.OBSTACLE) {
    obj2.isActive = false;
    state.lives--;
    
    if (state.lives <= 0) {
      state.isGameOver = true;
    }
  }
  
  // Игрок собирает предмет
  if (obj1.type === GameObjectType.PLAYER && obj2.type === GameObjectType.COLLECTIBLE) {
    obj2.isActive = false;
    state.score += 10;
    
    // Увеличиваем уровень каждые 100 очков
    if (state.score % 100 === 0) {
      state.level++;
    }
  }
  
  // Пуля попадает в препятствие
  if (obj1.type === GameObjectType.BULLET && obj2.type === GameObjectType.OBSTACLE) {
    obj1.isActive = false;
    obj2.isActive = false;
    state.score += 5;
  }
}

// Добавление нового препятствия
function addObstacle(state: GameState, canvas: HTMLCanvasElement): void {
  const size = 20 + Math.random() * 30;
  const speed = 50 + Math.random() * 100 + state.level * 10;
  
  const obstacle: GameObject = {
    id: `obstacle-${Date.now()}-${Math.random()}`,
    x: canvas.width,
    y: Math.random() * (canvas.height - size),
    width: size,
    height: size,
    vx: -speed,
    vy: 0,
    color: '#F43F5E',
    type: GameObjectType.OBSTACLE,
    isActive: true
  };
  
  state.objects.push(obstacle);
}

// Добавление нового коллекционного предмета
function addCollectible(state: GameState, canvas: HTMLCanvasElement): void {
  const size = 15;
  const speed = 60 + Math.random() * 80;
  
  const collectible: GameObject = {
    id: `collectible-${Date.now()}-${Math.random()}`,
    x: canvas.width,
    y: Math.random() * (canvas.height - size),
    width: size,
    height: size,
    vx: -speed,
    vy: 0,
    color: '#10B981',
    type: GameObjectType.COLLECTIBLE,
    isActive: true
  };
  
  state.objects.push(collectible);
}

// Добавление новой пули
export function addBullet(state: GameState, playerObj: GameObject): void {
  const bullet: GameObject = {
    id: `bullet-${Date.now()}-${Math.random()}`,
    x: playerObj.x + playerObj.width,
    y: playerObj.y + playerObj.height / 2 - 5,
    width: 10,
    height: 4,
    vx: 300,
    vy: 0,
    color: '#3B82F6',
    type: GameObjectType.BULLET,
    isActive: true
  };
  
  state.objects.push(bullet);
}

// Изменение направления движения игрока
export function movePlayer(state: GameState, dx: number, dy: number): void {
  const playerObj = state.objects.find(obj => obj.type === GameObjectType.PLAYER);
  
  if (playerObj) {
    playerObj.vx = dx * 200;
    playerObj.vy = dy * 200;
  }
}

// Сброс игры
export function resetGame(state: GameState): GameState {
  return createInitialGameState();
}
