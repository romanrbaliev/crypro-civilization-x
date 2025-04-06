
import { useCallback } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { Purchasable, PurchasableType } from '@/types/purchasable';
import { checkAffordability, getMissingResources } from '@/context/reducers/purchaseSystem/checkAffordability';
import { checkRequirements, getMissingRequirements } from '@/utils/requirementsManager';

/**
 * Хук для работы с системой покупок
 */
export function usePurchaseSystem() {
  const { state, dispatch } = useGameState();
  
  /**
   * Проверяет возможность покупки элемента
   */
  const canPurchase = useCallback((item: Purchasable): boolean => {
    if (!item) return false;
    
    // Для улучшений проверяем, что они не куплены
    if ((item.type === 'upgrade' || item.type === 'research') && 
        'purchased' in item && item.purchased) {
      return false;
    }
    
    // Проверяем наличие ресурсов для покупки
    return checkAffordability(state, item.cost);
  }, [state]);
  
  /**
   * Проверяет разблокирован ли элемент
   */
  const isUnlocked = useCallback((item: Purchasable): boolean => {
    if (!item) return false;
    
    // Проверяем, разблокирован ли элемент
    return item.unlocked;
  }, [state]);
  
  /**
   * Выполняет покупку элемента
   */
  const purchase = useCallback((itemId: string, itemType: PurchasableType): void => {
    dispatch({ 
      type: 'PURCHASE_ITEM', 
      payload: { itemId, itemType } 
    });
  }, [dispatch]);
  
  /**
   * Проверяет выполнение требований для элемента
   */
  const meetsRequirements = useCallback((requirements: Record<string, any>): boolean => {
    return checkRequirements(state, requirements);
  }, [state]);
  
  /**
   * Получает список недостающих ресурсов для покупки
   */
  const getResourcesNeeded = useCallback((item: Purchasable): Record<string, number> => {
    if (!item) return {};
    return getMissingResources(state, item.cost);
  }, [state]);
  
  /**
   * Получает список недостающих требований для разблокировки
   */
  const getRequirementsNeeded = useCallback((requirements: Record<string, any>): string[] => {
    return getMissingRequirements(state, requirements);
  }, [state]);
  
  return {
    canPurchase,
    isUnlocked,
    purchase,
    meetsRequirements,
    getResourcesNeeded,
    getRequirementsNeeded
  };
}
