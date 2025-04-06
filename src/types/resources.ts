
/**
 * Типы ресурсов в игре
 */
export type ResourceType = 'basic' | 'currency' | 'power' | 'computational' | 'crypto' | 'social' | 'resource';

/**
 * Типы эффектов, которые могут влиять на ресурсы
 */
export enum EffectType {
  // Производство и потребление
  PRODUCTION_FLAT = 'productionFlat',
  PRODUCTION_PERCENT = 'productionPercent',
  CONSUMPTION_FLAT = 'consumptionFlat',
  CONSUMPTION_PERCENT = 'consumptionPercent',
  
  // Максимальные значения
  MAX_CAPACITY_FLAT = 'maxCapacityFlat',
  MAX_CAPACITY_PERCENT = 'maxCapacityPercent',
  
  // Обмен и конвертация
  CONVERSION_EFFICIENCY = 'conversionEfficiency',
  
  // Общие бонусы
  GLOBAL_PRODUCTION_PERCENT = 'globalProductionPercent',
  GLOBAL_CONSUMPTION_PERCENT = 'globalConsumptionPercent',
}

/**
 * Источники эффекта
 */
export enum EffectSource {
  BUILDING = 'building',
  UPGRADE = 'upgrade',
  RESEARCH = 'research',
  REFERRAL = 'referral',
  SPECIALIZATION = 'specialization',
  SYNERGY = 'synergy',
  HELPER = 'helper',
}

/**
 * Интерфейс для эффекта, влияющего на ресурс
 */
export interface ResourceEffect {
  id: string;
  type: EffectType;
  source: EffectSource;
  sourceId: string;
  targetResourceId?: string; // Если null - применяется ко всем ресурсам
  value: number;
}

/**
 * Интерфейс для операции с ресурсом
 */
export interface ResourceOperation {
  resourceId: string;
  amount: number;
  operation: 'add' | 'subtract' | 'set' | 'multiply';
}

/**
 * Интерфейс для временного эффекта
 */
export interface TimedEffect {
  effect: ResourceEffect;
  startTime: number;
  duration: number; // В миллисекундах
}

/**
 * Интерфейс для модификатора ресурса
 */
export interface ResourceModifier {
  resourceId: string;
  flat: number; // Плоское значение (добавляется)
  percent: number; // Процентное значение (умножается)
}

/**
 * Интерфейс для метрик производства и потребления ресурса
 */
export interface ResourceMetrics {
  baseProduction: number;
  baseConsumption: number;
  finalProduction: number;
  finalConsumption: number;
  netProduction: number; // finalProduction - finalConsumption
  productionSources: Array<{sourceType: EffectSource, sourceId: string, amount: number}>;
  consumptionSources: Array<{sourceType: EffectSource, sourceId: string, amount: number}>;
}

/**
 * Интерфейс для событий системы ресурсов
 */
export enum ResourceEventType {
  RESOURCE_UPDATED = 'resourceUpdated',
  RESOURCE_UNLOCKED = 'resourceUnlocked',
  RESOURCE_EXHAUSTED = 'resourceExhausted',
  RESOURCE_CAPACITY_REACHED = 'resourceCapacityReached',
  PRODUCTION_UPDATED = 'productionUpdated',
}

/**
 * Интерфейс для события системы ресурсов
 */
export interface ResourceEvent {
  type: ResourceEventType;
  resourceId: string;
  oldValue?: number;
  newValue?: number;
  delta?: number;
  timestamp: number;
}
