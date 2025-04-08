
/**
 * Типы ресурсов в игре
 */
export type ResourceType = 'basic' | 'currency' | 'power' | 'computational' | 'crypto' | 'social';

/**
 * Интерфейс для метрик ресурса
 */
export interface ResourceMetrics {
  production: number;
  consumption: number;
  netPerSecond: number;
}

/**
 * Событие обновления ресурса
 */
export interface ResourceUpdateEvent {
  resourceId: string;
  oldValue: number;
  newValue: number;
  source: string;
}

/**
 * Настройка форматирования ресурса
 */
export interface ResourceFormatConfig {
  decimalPlaces: number;
  useShortFormat: boolean;
  minValueForShort: number;
  specialFormat?: (value: number) => string;
}
