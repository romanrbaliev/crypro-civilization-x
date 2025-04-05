
import { GameState as TypesGameState, ReferralInfo as TypesReferralInfo, ResourceType } from '@/types/game';
import { GameState as ContextGameState, ReferralInfo as ContextReferralInfo } from '@/context/types';

/**
 * Функция-помощник для безопасного преобразования типов GameState
 * Используется для совместимости между разными определениями GameState
 */
export function convertGameState<T extends TypesGameState | ContextGameState>(state: any): T {
  // Обработка различий в типах для корректного преобразования
  if (state && state.referrals && Array.isArray(state.referrals)) {
    // Преобразуем поле activated, которое может быть string | boolean, к ожидаемому типу
    const processedReferrals = state.referrals.map((ref: any) => {
      if (ref && typeof ref.activated === 'string') {
        // Преобразуем строковое значение в булево
        return {
          ...ref,
          activated: ref.activated === 'true'
        };
      }
      return ref;
    });
    
    // Создаем новый объект с преобразованными рефералами
    state = {
      ...state,
      referrals: processedReferrals
    };
  }
  
  // Преобразуем типы ресурсов, если необходимо
  if (state && state.resources) {
    const resources = { ...state.resources };
    
    // Проходим по всем ресурсам
    Object.keys(resources).forEach(key => {
      const resource = resources[key];
      if (resource && typeof resource.type === 'string') {
        // Убедимся, что тип соответствует ожидаемым значениям ResourceType
        if (['primary', 'currency', 'resource'].includes(resource.type)) {
          // Тип уже в порядке
        } else {
          // Присваиваем подходящий тип по умолчанию
          resource.type = 'resource' as ResourceType;
        }
      }
    });
    
    // Обновляем ресурсы в состоянии
    state = {
      ...state,
      resources
    };
  }
  
  // Возвращаем преобразованный объект с правильным типом
  return state as T;
}

/**
 * Функция для нормализации поля activated в ReferralInfo
 * Преобразует строковые значения в булевы
 */
export function normalizeReferralInfo(referralInfo: TypesReferralInfo | ContextReferralInfo): TypesReferralInfo & ContextReferralInfo {
  if (typeof referralInfo.activated === 'string') {
    return {
      ...referralInfo,
      activated: referralInfo.activated === 'true'
    } as TypesReferralInfo & ContextReferralInfo;
  }
  
  return referralInfo as TypesReferralInfo & ContextReferralInfo;
}
