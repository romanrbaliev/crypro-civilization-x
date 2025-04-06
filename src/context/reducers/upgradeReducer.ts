
import { GameState, Upgrade } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { processPurchase } from './purchaseSystem';
import { PurchasableType } from '@/types/purchasable';

export const processPurchaseUpgrade = (state: GameState, payload: { upgradeId: string }): GameState => {
  // Конвертируем старый формат в новый
  const newPayload = {
    itemId: payload.upgradeId,
    itemType: 'upgrade' as PurchasableType
  };
  
  // Используем новую унифицированную функцию
  return processPurchase(state, newPayload);
};
