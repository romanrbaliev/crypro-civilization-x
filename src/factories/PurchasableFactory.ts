
import { Building, Upgrade, Resource, GameState } from '@/context/types';
import { Purchasable, PurchasableType } from '@/types/purchasable';

/**
 * Фабрика для создания покупаемых элементов с правильными значениями по умолчанию
 */
export class PurchasableFactory {
  /**
   * Создает здание с корректными значениями по умолчанию
   */
  static createBuilding(config: Partial<Building>): Building {
    return {
      id: config.id || '',
      name: config.name || '',
      description: config.description || '',
      count: config.count || 0,
      unlocked: config.unlocked || false,
      cost: config.cost || {},
      costMultiplier: config.costMultiplier || 1.1,
      production: config.production || {},
      consumption: config.consumption || {},
      effects: config.effects || {},
      ...config
    };
  }
  
  /**
   * Создает улучшение с корректными значениями по умолчанию
   */
  static createUpgrade(config: Partial<Upgrade>): Upgrade {
    return {
      id: config.id || '',
      name: config.name || '',
      description: config.description || '',
      cost: config.cost || {},
      purchased: config.purchased || false,
      unlocked: config.unlocked || false,
      type: config.type || 'research',
      effects: config.effects || {},
      ...config
    };
  }
  
  /**
   * Создает новый ресурс с корректными значениями по умолчанию
   */
  static createResource(config: Partial<Resource>): Resource {
    return {
      id: config.id || '',
      name: config.name || '',
      description: config.description || '',
      type: config.type || 'resource',
      value: config.value || 0,
      max: config.max || 100,
      unlocked: config.unlocked || false,
      baseProduction: config.baseProduction || 0,
      production: config.production || 0,
      perSecond: config.perSecond || 0,
      consumption: config.consumption || 0,
      ...config
    };
  }
  
  /**
   * Клонирует существующий покупаемый элемент с модификациями
   */
  static cloneWithModifications(
    original: Purchasable, 
    modifications: Partial<Purchasable>
  ): Purchasable {
    return {
      ...original,
      ...modifications
    };
  }
  
  /**
   * Получает покупаемый элемент из состояния по ID и типу
   */
  static getItem(
    state: GameState, 
    itemId: string, 
    itemType: PurchasableType
  ): Purchasable | null {
    if (itemType === 'building') {
      return state.buildings[itemId] || null;
    } else if (itemType === 'upgrade' || itemType === 'research') {
      return state.upgrades[itemId] || null;
    } else if (itemType === 'specialization') {
      return state.specializations?.[itemId] || null;
    }
    return null;
  }
}
