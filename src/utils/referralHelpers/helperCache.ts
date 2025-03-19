
import { getHelperBuildingsFromDB } from './helperQueries';

/**
 * Кеш для хранения данных о помощниках
 */
export const helperStatusCache = {
  userId: '',
  helperCount: 0,
  lastUpdated: 0,
  updating: false,
  
  // Обновление данных в кеше
  async update(userId: string, forceUpdate = false): Promise<number> {
    // Если данные уже в процессе обновления, возвращаем текущее значение
    if (this.updating && !forceUpdate) return this.helperCount;
    
    // Если кеш актуален (обновлялся менее 30 секунд назад) и userId совпадает, возвращаем кешированное значение
    const now = Date.now();
    if (!forceUpdate && this.userId === userId && now - this.lastUpdated < 30000) {
      return this.helperCount;
    }
    
    this.updating = true;
    try {
      const count = await getHelperBuildingsFromDB(userId);
      this.userId = userId;
      this.helperCount = count;
      this.lastUpdated = now;
      
      // Отправляем событие об обновлении статуса помощника
      if (typeof window !== 'undefined' && window.gameEventBus) {
        const event = new CustomEvent('helper-status-updated', { 
          detail: { userId, helperCount: count }
        });
        window.gameEventBus.dispatchEvent(event);
      }
      
      return count;
    } finally {
      this.updating = false;
    }
  },
  
  // Получение данных из кеша или обновление, если необходимо
  async get(userId: string, forceUpdate = false): Promise<number> {
    if (forceUpdate || this.userId !== userId || Date.now() - this.lastUpdated > 30000) {
      return this.update(userId, forceUpdate);
    }
    return this.helperCount;
  }
};
