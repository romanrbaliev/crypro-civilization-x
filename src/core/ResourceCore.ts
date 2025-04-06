
import { GameState, Resource } from '@/context/types';

/**
 * Основное ядро системы ресурсов. 
 * Реализует базовые операции с ресурсами без побочных эффектов.
 */
export class ResourceCore {
  /**
   * Рассчитывает чистое изменение ресурса за секунду
   */
  static calculateNetChange(resource: Resource): number {
    const production = resource.production || 0;
    const consumption = resource.consumption || 0;
    return production - consumption;
  }

  /**
   * Обновляет значение ресурса на основе производства и потребления за указанное время
   */
  static updateResourceValue(
    resource: Resource,
    deltaSeconds: number,
    ignoreConsumption: boolean = false
  ): Resource {
    // Пропускаем неразблокированные ресурсы
    if (!resource.unlocked) {
      return resource;
    }

    const production = resource.production || 0;
    const consumption = ignoreConsumption ? 0 : (resource.consumption || 0);
    
    // Рассчитываем чистое изменение ресурса
    const netChange = (production - consumption) * deltaSeconds;
    
    if (Math.abs(netChange) < 0.000001) {
      // Если изменение слишком маленькое, пропускаем обновление
      return resource;
    }
    
    // Обновляем значение ресурса
    let newValue = resource.value + netChange;
    
    // Ограничиваем значение максимумом
    if (resource.max !== undefined && resource.max !== null) {
      newValue = Math.min(newValue, resource.max);
    }
    
    // Не допускаем отрицательных значений
    newValue = Math.max(0, newValue);
    
    return {
      ...resource,
      value: newValue,
      perSecond: production - consumption
    };
  }

  /**
   * Инкрементирует значение ресурса
   */
  static incrementResource(resource: Resource, amount: number): Resource {
    if (!resource.unlocked) {
      return resource;
    }
    
    const newValue = Math.min(
      resource.value + Math.max(0, amount),
      resource.max || Number.MAX_SAFE_INTEGER
    );
    
    return {
      ...resource,
      value: newValue
    };
  }

  /**
   * Уменьшает значение ресурса
   */
  static decrementResource(resource: Resource, amount: number): Resource {
    if (!resource.unlocked) {
      return resource;
    }
    
    const newValue = Math.max(0, resource.value - Math.max(0, amount));
    
    return {
      ...resource,
      value: newValue
    };
  }

  /**
   * Разблокирует ресурс
   */
  static unlockResource(resource: Resource): Resource {
    return {
      ...resource,
      unlocked: true
    };
  }

  /**
   * Проверяет, достаточно ли у ресурса значения
   */
  static hasEnough(resource: Resource, amount: number): boolean {
    return resource.value >= amount;
  }
}
