
import { ResourceType } from '@/context/types';

// Базовый интерфейс для всех покупаемых элементов
export interface Purchasable {
  id: string;
  name: string;
  description: string;
  type: PurchasableType;
  cost: Record<string, number>;
  costMultiplier?: number; 
  unlocked: boolean;
  effects?: Record<string, number | string | boolean>;
  production?: Record<string, number>;
  consumption?: Record<string, number>;
  requirements?: Record<string, number | boolean>;
}

// Типы покупаемых элементов
export type PurchasableType = 'building' | 'upgrade' | 'research' | 'specialization';

// Интерфейс для обработки покупки
export interface PurchasePayload {
  itemId: string;
  itemType: PurchasableType;
  quantity?: number;
}

// Общий результат операции покупки
export interface PurchaseResult {
  success: boolean;
  newState: any;
  message?: string;
  errorCode?: string;
}
