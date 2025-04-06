
import { GameState } from "@/context/types";

// Вспомогательная функция для преобразования названия эффекта в ID ресурса
export const mapResourceId = (resourcePart: string): string => {
  const resourceIdMap: Record<string, string> = {
    'knowledge': 'knowledge',
    'usdt': 'usdt',
    'bitcoin': 'bitcoin',
    'electricity': 'electricity',
    'computingpower': 'computingPower',
    'computing': 'computingPower'
  };
  
  return resourceIdMap[resourcePart.toLowerCase()] || resourcePart;
};

// Кэш для хранения уже примененных эффектов
const effectCache = new Map<string, GameState>();
const CACHE_TTL = 5000; // 5 секунд жизни кэша

// Очистка кэша
export const clearEffectCache = () => {
  effectCache.clear();
};

// Применяет эффекты исследования к состоянию
export const applyUpgradeEffects = (state: GameState, upgradeId: string): GameState => {
  const upgrade = state.upgrades[upgradeId];
  if (!upgrade || !upgrade.purchased) {
    return state;
  }
  
  // Проверка кэша
  const cacheKey = `upgrade_${upgradeId}_${state.lastUpdate}`;
  if (effectCache.has(cacheKey)) {
    return effectCache.get(cacheKey) as GameState;
  }
  
  try {
    let newState = { ...state, resources: { ...state.resources } };
    
    // Фиксированные эффекты для известных исследований
    if (upgradeId === 'blockchainBasics') {
      // Обновляем максимум знаний (+50%)
      if (newState.resources.knowledge) {
        const currentMax = newState.resources.knowledge.max || 100;
        newState.resources.knowledge.max = currentMax * 1.5;
        
        // Увеличиваем производство знаний на 10%
        if (newState.resources.knowledge.baseProduction !== undefined) {
          const baseProd = newState.resources.knowledge.baseProduction || 0;
          newState.resources.knowledge.baseProduction = baseProd * 1.1;
        } else {
          // Если baseProduction не определен, создаем его
          newState.resources.knowledge.baseProduction = 0.1; // Базовое значение с 10% бонусом
        }
      }
    }
    
    // Обработка динамических эффектов из upgrade.effects
    if (upgrade.effects) {
      for (const [effectId, value] of Object.entries(upgrade.effects)) {
        try {
          if (effectId.includes('Max') || effectId.includes('max')) {
            // Эффекты на максимум ресурсов
            const resourcePart = effectId.toLowerCase().replace('max', '').replace('boost', '');
            const resourceId = mapResourceId(resourcePart);
            
            if (newState.resources[resourceId]) {
              const currentMax = newState.resources[resourceId].max || 0;
              
              // Если эффект процентный (>= 1.0 или < 1.0)
              if (Number(value) >= 1.0) {
                newState.resources[resourceId].max = currentMax * Number(value);
              } else {
                newState.resources[resourceId].max = currentMax * (1 + Number(value));
              }
            }
          } else if (effectId.includes('Production') || effectId.includes('production') || effectId.includes('Boost') || effectId.includes('boost')) {
            // Эффекты на производство ресурсов
            const resourcePart = effectId.toLowerCase()
              .replace('production', '')
              .replace('boost', '');
            const resourceId = mapResourceId(resourcePart);
            
            if (newState.resources[resourceId]) {
              // Установка базового производства если не определено
              if (newState.resources[resourceId].baseProduction === undefined) {
                newState.resources[resourceId].baseProduction = 0;
              }
              
              const currentProduction = newState.resources[resourceId].baseProduction || 0;
              
              // Если эффект процентный (>= 1.0 или < 1.0)
              if (Number(value) >= 1.0) {
                newState.resources[resourceId].baseProduction = currentProduction * Number(value);
              } else {
                newState.resources[resourceId].baseProduction = currentProduction * (1 + Number(value));
              }
            }
          }
        } catch (error) {
          console.error(`Ошибка при применении эффекта ${effectId}:`, error);
        }
      }
    }
    
    // Сохраняем в кэш
    effectCache.set(cacheKey, newState);
    
    // Установка автоматической очистки кэша после истечения TTL
    setTimeout(() => {
      effectCache.delete(cacheKey);
    }, CACHE_TTL);
    
    return newState;
  } catch (error) {
    console.error(`Ошибка при применении эффектов улучшения ${upgradeId}:`, error);
    return state;
  }
};
