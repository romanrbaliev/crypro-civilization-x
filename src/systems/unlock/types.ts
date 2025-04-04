
import { GameState } from '@/context/types';

// Типы условий разблокировки
export type UnlockConditionOperator = 'gte' | 'eq' | 'lte';
export type UnlockConditionType = 'resource' | 'building' | 'upgrade' | 'counter';
export type UnlockItemType = 'resource' | 'building' | 'upgrade' | 'feature';

export interface UnlockCondition {
  // Уникальный идентификатор условия
  id: string;
  // Тип условия (ресурс, здание, исследование, счетчик)
  type: UnlockConditionType;
  // Идентификатор объекта для проверки
  targetId: string;
  // Требуемое значение (количество, булево)
  targetValue: number | boolean;
  // Оператор сравнения
  operator: UnlockConditionOperator;
  // Опциональное описание (для отладки и понимания)
  description?: string;
}

// Структура для элемента, который может быть разблокирован
export interface UnlockableItem {
  // Уникальный идентификатор элемента
  id: string;
  // Тип элемента (ресурс, здание, исследование, функция)
  type: UnlockItemType;
  // Название элемента для отображения
  name: string;
  // Массив условий (все должны быть выполнены для разблокировки)
  conditions: UnlockCondition[];
  // Требуется ли автоматическая разблокировка при выполнении условий
  autoUnlock: boolean;
  // Влияет ли на другие разблокировки
  influencesOthers: boolean;
}

// Состояние разблокировок в игре
export interface UnlockState {
  // Состояние разблокировки для каждого элемента
  items: { [itemId: string]: boolean };
  // Кэш результатов проверок
  conditionCache: { [conditionId: string]: boolean };
  // Время последней проверки для каждого элемента
  lastChecked: { [itemId: string]: number };
}

export interface UnlockNotification {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface UnlockChangeEvent {
  itemId: string;
  unlocked: boolean;
  itemType: UnlockItemType;
  itemName: string;
}
