
// Утилиты для создания анимаций в игре

// Функция для создания плавного перехода между значениями
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

// Функция для создания задержки
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Функции плавности для анимаций
export const easing = {
  // Линейная плавность
  linear: (t: number): number => t,
  
  // Плавное начало
  easeInQuad: (t: number): number => t * t,
  
  // Плавное окончание
  easeOutQuad: (t: number): number => t * (2 - t),
  
  // Плавное начало и окончание
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // Отскок в конце
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  
  // Упругий эффект
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// Класс для создания анимации с использованием requestAnimationFrame
export class Animator {
  private startTime: number = 0;
  private isRunning: boolean = false;
  private animationFrame: number = 0;

  constructor(
    private duration: number = 1000,
    private easingFunction: (t: number) => number = easing.linear,
    private onUpdate: (progress: number) => void,
    private onComplete?: () => void
  ) {}

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = performance.now();
    this.animationStep();
  }

  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrame);
  }

  private animationStep = (currentTime: number = performance.now()): void => {
    if (!this.isRunning) return;
    
    const elapsedTime = currentTime - this.startTime;
    const rawProgress = Math.min(elapsedTime / this.duration, 1);
    const easedProgress = this.easingFunction(rawProgress);
    
    this.onUpdate(easedProgress);
    
    if (rawProgress < 1) {
      this.animationFrame = requestAnimationFrame(this.animationStep);
    } else {
      this.isRunning = false;
      this.onComplete?.();
    }
  };
}

// Функция для создания анимации появления элемента
export const fadeIn = (element: HTMLElement, duration: number = 400): Promise<void> => {
  return new Promise(resolve => {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    new Animator(
      duration,
      easing.easeOutQuad,
      (progress) => {
        element.style.opacity = progress.toString();
      },
      () => {
        resolve();
      }
    ).start();
  });
};

// Функция для создания анимации исчезновения элемента
export const fadeOut = (element: HTMLElement, duration: number = 400): Promise<void> => {
  return new Promise(resolve => {
    element.style.opacity = '1';
    
    new Animator(
      duration,
      easing.easeOutQuad,
      (progress) => {
        element.style.opacity = (1 - progress).toString();
      },
      () => {
        element.style.display = 'none';
        resolve();
      }
    ).start();
  });
};
