import { GameState, Resource } from '@/context/types';
import { ResourceEvent, ResourceEventType, ResourceMetrics } from '@/types/resources';
import { ResourceCalculator } from '@/services/ResourceCalculator';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Система управления ресурсами
 */
export class ResourceSystem {
  private calculator: ResourceCalculator;
  
  constructor() {
    this.calculator = new ResourceCalculator();
  }
  
  /**
   * Обновляет ресурсы на основе прошедшего времени
   * @param state Игровое состояние
   * @param deltaTime Прошедшее время в миллисекундах
   * @returns Обновленное игровое состояние
   */
  updateResources(state: GameState, deltaTime: number): GameState {
    // Если дельта времени неположительная, ничего не делаем
    if (deltaTime <= 0) {
      return state;
    }
    
    console.log(`ResourceSystem: Обновление ресурсов, прошло ${deltaTime}ms`);
    
    // Преобразуем миллисекунды в секунды
    const deltaSeconds = deltaTime / 1000;
    
    // Создаем копию состояния и ресурсов
    let newState = { ...state };
    const resources = { ...state.resources };
    
    // Рассчитываем метрики для всех ресурсов
    const metrics = this.calculator.calculateResourceMetrics(state);
    
    // Обновляем каждый ресурс
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      
      // Пропускаем неразблокированные ресурсы
      if (!resource.unlocked) {
        console.log(`Ресурс ${resourceId} не разблокирован, пропускаем...`);
        continue;
      }
      
      // Получаем метрики для текущего ресурса
      const resourceMetrics = metrics[resourceId];
      
      if (!resourceMetrics) {
        continue;
      }
      
      // Получаем чистое изменение ресурса (производство - потребление)
      const netChange = resourceMetrics.netProduction * deltaSeconds;
      
      if (netChange !== 0) {
        // Текущее значение ресурса
        const currentValue = resource.value;
        
        // Рассчитываем новое значение
        let newValue = currentValue + netChange;
        
        // Ограничиваем максимальным значением
        if (resource.max !== undefined && resource.max !== null && resource.max !== Infinity) {
          newValue = Math.min(newValue, resource.max);
        }
        
        // Не допускаем отрицательных значений
        newValue = Math.max(0, newValue);
        
        // Логируем изменение только если оно значительное
        if (Math.abs(newValue - currentValue) > 0.001) {
          console.log(`Ресурс ${resourceId}: ${currentValue.toFixed(4)} -> ${newValue.toFixed(4)} (изменение: ${netChange.toFixed(4)}, продукция: ${resourceMetrics.finalProduction.toFixed(2)}/сек, потребление: ${resourceMetrics.finalConsumption.toFixed(2)}/сек)`);
        }
        
        // Создаем событие обновления ресурса
        const event: ResourceEvent = {
          type: ResourceEventType.RESOURCE_UPDATED,
          resourceId,
          oldValue: currentValue,
          newValue,
          delta: netChange,
          timestamp: Date.now()
        };
        
        // Обновляем ресурс
        resources[resourceId] = {
          ...resource,
          value: newValue,
          production: resourceMetrics.finalProduction,
          consumption: resourceMetrics.finalConsumption,
          perSecond: resourceMetrics.netProduction
        };
        
        // Отправляем событие в шину событий
        safeDispatchGameEvent(`Ресурс ${resourceId} обновлен: ${currentValue.toFixed(2)} -> ${newValue.toFixed(2)}`);
      }
    }
    
    // Обновляем ресурсы в состоянии
    newState.resources = resources;
    
    return newState;
  }
  
  /**
   * Обновляет производство ресурсов
   * @param state Игровое состояние
   * @returns Обновленное игровое состояние
   */
  updateResourceProduction(state: GameState): GameState {
    console.log("ResourceSystem: Обновление производства ресурсов");
    
    // Создаем копию состояния и ресурсов
    let newState = { ...state };
    const resources = { ...state.resources };
    
    // Рассчитываем метрики для всех ресурсов
    const metrics = this.calculator.calculateResourceMetrics(state);
    
    // Обновляем каждый ресурс
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      
      // Пропускаем неразблокированные ресурсы
      if (!resource.unlocked) continue;
      
      // Получаем метрики для текущего ресурса
      const resourceMetrics = metrics[resourceId];
      
      if (!resourceMetrics) continue;
      
      // Обновляем значения производства и потребления
      resources[resourceId] = {
        ...resource,
        production: resourceMetrics.finalProduction,
        consumption: resourceMetrics.finalConsumption,
        perSecond: resourceMetrics.netProduction
      };
      
      console.log(`Ресурс ${resourceId}: производство ${resourceMetrics.finalProduction.toFixed(2)}/сек, потребление ${resourceMetrics.finalConsumption.toFixed(2)}/сек, итого ${resourceMetrics.netProduction.toFixed(2)}/сек`);
    }
    
    // Обновляем ресурсы в состоянии
    newState.resources = resources;
    
    return newState;
  }
  
  /**
   * Обновляет максимальные значения ресурсов
   * @param state Игровое состояние
   * @returns Обновленное игровое состояние
   */
  updateResourceMaxValues(state: GameState): GameState {
    console.log("ResourceSystem: Обновление максимальных значений ресурсов");
    
    // Создаем копию состояния и ресурсов
    let newState = { ...state };
    const resources = { ...state.resources };
    
    // Рассчитываем максимальные значения для всех ресурсов
    const maxValues = this.calculator.calculateResourceMaxValues(state);
    
    // Обновляем каждый ресурс
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      
      // Пропускаем неразблокированные ресурсы
      if (!resource.unlocked) continue;
      
      // Получаем максимальное значение для текущего ресурса
      const maxValue = maxValues[resourceId];
      
      if (maxValue !== undefined) {
        console.log(`Ресурс ${resourceId}: максимум ${resource.max} -> ${maxValue}`);
        
        // Обновляем максимальное значение
        resources[resourceId] = {
          ...resource,
          max: maxValue
        };
      }
    }
    
    // Обновляем ресурсы в состоянии
    newState.resources = resources;
    
    return newState;
  }
  
  /**
   * Полностью пересчитывает все ресурсы
   * @param state Игровое состояние
   * @returns Обновленное игровое состояние
   */
  recalculateAllResourceProduction(state: GameState): GameState {
    console.log("ResourceSystem: Полный пересчет всех ресурсов");
    
    // Сначала обновляем максимальные значения
    let newState = this.updateResourceMaxValues(state);
    
    // Затем обновляем производство
    newState = this.updateResourceProduction(newState);
    
    return newState;
  }
  
  /**
   * Инкрементирует значение ресурса
   * @param state Игровое состояние
   * @param payload Объект с параметрами инкремента
   * @returns Обновленное игровое состояние
   */
  incrementResource(
    state: GameState, 
    payload: { resourceId: string; amount?: number }
  ): GameState {
    const { resourceId, amount = 1 } = payload;
    const resource = state.resources[resourceId];
    
    // Проверяем, существует ли и разблокирован ли ресурс
    if (!resource || !resource.unlocked) {
      console.warn(`ResourceSystem: Попытка инкрементировать неразблокированный ресурс: ${resourceId}`);
      return state;
    }
    
    // Проверяем, что инкрементируемое значение положительно
    const incrementAmount = Math.max(0, amount);
    
    // Рассчитываем новое значение с учетом максимума
    const newValue = Math.min(
      resource.value + incrementAmount,
      resource.max || Number.MAX_SAFE_INTEGER
    );
    
    // Обновляем значение ресурса
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          value: newValue
        }
      }
    };
  }
  
  /**
   * Разблокирует ресурс
   * @param state Игровое состояние
   * @param payload Объект с параметрами разблокировки
   * @returns Обновленное игровое состояние
   */
  unlockResource(
    state: GameState, 
    payload: { resourceId: string }
  ): GameState {
    const { resourceId } = payload;
    const resource = state.resources[resourceId];
    
    // Проверяем, существует ли ресурс
    if (!resource) {
      console.warn(`ResourceSystem: Попытка разблокировать несуществующий ресурс: ${resourceId}`);
      return state;
    }
    
    // Если ресурс уже разблокирован, ничего не делаем
    if (resource.unlocked) {
      return state;
    }
    
    console.log(`ResourceSystem: Разблокировка ресурса ${resourceId}`);
    
    // Создаем событие разблокировки ресурса
    const event: ResourceEvent = {
      type: ResourceEventType.RESOURCE_UNLOCKED,
      resourceId,
      timestamp: Date.now()
    };
    
    // Отправляем событие в шину событий
    safeDispatchGameEvent(`Ресурс ${resourceId} разблокирован`);
    
    // Разблокируем ресурс
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          unlocked: true
        }
      }
    };
  }
  
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   * @param state Игровое состояние
   * @param cost Стоимость в виде объекта {resourceId: amount, ...}
   * @returns true, если ресурсов достаточно
   */
  checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    return this.calculator.checkAffordability(state, cost);
  }
  
  /**
   * Получает список недостающих ресурсов
   * @param state Игровое состояние
   * @param cost Стоимость в виде объекта {resourceId: amount, ...}
   * @returns Объект с недостающими ресурсами {resourceId: missingAmount, ...}
   */
  getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    return this.calculator.getMissingResources(state, cost);
  }
  
  /**
   * Вычитает ресурсы при покупке
   * @param state Игровое состояние
   * @param cost Стоимость в виде объекта {resourceId: amount, ...}
   * @returns Обновленное игровое состояние или null, если ресурсов недостаточно
   */
  deductResources(state: GameState, cost: Record<string, number>): GameState | null {
    // Проверяем, достаточно ли ресурсов
    if (!this.checkAffordability(state, cost)) {
      return null;
    }
    
    // Создаем копию состояния и ресурсов
    let newState = { ...state };
    const resources = { ...state.resources };
    
    // Вычитаем стоимость из каждого ресурса
    for (const resourceId in cost) {
      const resource = resources[resourceId];
      const amount = Number(cost[resourceId]);
      
      resources[resourceId] = {
        ...resource,
        value: resource.value - amount
      };
      
      console.log(`ResourceSystem: Вычтено ${amount} единиц ресурса ${resourceId}`);
    }
    
    // Обновляем ресурсы в состоянии
    newState.resources = resources;
    
    return newState;
  }
  
  /**
   * Применяет знания (конвертирует knowledge в USDT)
   * @param state Игровое состояние
   * @returns Обновленное игровое состояние
   */
  applyKnowledge(state: GameState): GameState {
    const knowledgeResource = state.resources.knowledge;
    const usdtResource = state.resources.usdt;
    
    // Проверяем, что ресурсы существуют и разблокированы
    if (!knowledgeResource || !knowledgeResource.unlocked || !usdtResource || !usdtResource.unlocked) {
      console.warn(`ResourceSystem: Невозможно применить знания, ресурсы не разблокированы`);
      return state;
    }
    
    // Минимальное количество знаний для конвертации
    const minKnowledge = 10;
    
    // Проверяем, хватает ли знаний
    if (knowledgeResource.value < minKnowledge) {
      console.warn(`ResourceSystem: Недостаточно знаний для применения (${knowledgeResource.value} < ${minKnowledge})`);
      return state;
    }
    
    // Базовый коэффициент конвертации: 10 знаний = 1 USDT
    let conversionRate = 0.1; // 1/10
    
    // Проверяем наличие улучшений, повышающих эффективность конвертации
    const hasCryptoBasics = 
      (state.upgrades.cryptoCurrencyBasics?.purchased === true) ||
      (state.upgrades.cryptoBasics?.purchased === true);
    
    // Если есть улучшение, повышаем эффективность на 10%
    if (hasCryptoBasics) {
      conversionRate *= 1.1; // +10% к эффективности
    }
    
    // Рассчитываем количество знаний для конвертации (кратное 10)
    const knowledgeToConvert = Math.min(knowledgeResource.value, minKnowledge);
    
    // Рассчитываем количество получаемых USDT
    const usdtGained = knowledgeToConvert * conversionRate;
    
    console.log(`ResourceSystem: Применение знаний - конвертация ${knowledgeToConvert} знаний в ${usdtGained} USDT`);
    
    // Обновляем ресурсы
    return {
      ...state,
      resources: {
        ...state.resources,
        knowledge: {
          ...knowledgeResource,
          value: knowledgeResource.value - knowledgeToConvert
        },
        usdt: {
          ...usdtResource,
          value: Math.min(usdtResource.value + usdtGained, usdtResource.max || Number.MAX_SAFE_INTEGER)
        }
      },
      // Увеличиваем счетчик применения знаний
      counters: {
        ...state.counters,
        apply: {
          id: 'apply',
          value: (state.counters.apply?.value || 0) + 1
        }
      }
    };
  }
  
  /**
   * Применяет все доступные знания (конвертирует knowledge в USDT)
   * @param state Игровое состояние
   * @returns Обновленное игровое состояние
   */
  applyAllKnowledge(state: GameState): GameState {
    const knowledgeResource = state.resources.knowledge;
    const usdtResource = state.resources.usdt;
    
    // Проверяем, что ресурсы существуют и разблокированы
    if (!knowledgeResource || !knowledgeResource.unlocked || !usdtResource || !usdtResource.unlocked) {
      console.warn(`ResourceSystem: Невозможно применить знания, ресурсы не разблокированы`);
      return state;
    }
    
    // Минимальное количество знаний для конвертации
    const minKnowledge = 10;
    
    // Проверяем, хватает ли знаний
    if (knowledgeResource.value < minKnowledge) {
      console.warn(`ResourceSystem: Недостаточно знаний для применения (${knowledgeResource.value} < ${minKnowledge})`);
      return state;
    }
    
    // Базовый коэффициент конвертации: 10 знаний = 1 USDT
    let conversionRate = 0.1; // 1/10
    
    // Проверяем наличие улучшений, повышающих эффективность конвертации
    const hasCryptoBasics = 
      (state.upgrades.cryptoCurrencyBasics?.purchased === true) ||
      (state.upgrades.cryptoBasics?.purchased === true);
    
    // Если есть улучшение, повышаем эффективность на 10%
    if (hasCryptoBasics) {
      conversionRate *= 1.1; // +10% к эффективности
    }
    
    // Рассчитываем количество знаний для конвертации (кратное 10)
    const knowledgeToConvert = Math.floor(knowledgeResource.value / minKnowledge) * minKnowledge;
    
    // Рассчитываем количество получаемых USDT
    const usdtGained = knowledgeToConvert * conversionRate;
    
    console.log(`ResourceSystem: Применение всех знаний - конвертация ${knowledgeToConvert} знаний в ${usdtGained} USDT`);
    
    // Обновляем ресурсы
    return {
      ...state,
      resources: {
        ...state.resources,
        knowledge: {
          ...knowledgeResource,
          value: knowledgeResource.value - knowledgeToConvert
        },
        usdt: {
          ...usdtResource,
          value: Math.min(usdtResource.value + usdtGained, usdtResource.max || Number.MAX_SAFE_INTEGER)
        }
      },
      // Увеличиваем счетчик применения знаний
      counters: {
        ...state.counters,
        apply: {
          id: 'apply',
          value: (state.counters.apply?.value || 0) + 1
        }
      }
    };
  }
  
  /**
   * Обменивает Bitcoin на USDT
   * @param state Игровое состояние
   * @returns Обновленное игровое состояние
   */
  exchangeBitcoin(state: GameState): GameState {
    const bitcoinResource = state.resources.bitcoin;
    const usdtResource = state.resources.usdt;
    
    // Проверяем, что ресурсы существуют и разблокированы
    if (!bitcoinResource || !bitcoinResource.unlocked || !usdtResource || !usdtResource.unlocked) {
      console.warn(`ResourceSystem: Невозможно обменять Bitcoin, ресурсы не разблокированы`);
      return state;
    }
    
    // Проверяем, есть ли Bitcoin для обмена
    if (bitcoinResource.value <= 0) {
      console.warn(`ResourceSystem: Нет Bitcoin для обмена`);
      return state;
    }
    
    // Получаем текущий курс обмена и комиссию
    const exchangeRate = state.miningParams?.exchangeRate || 25000;
    const exchangeCommission = state.miningParams?.exchangeCommission || 0.005;
    
    // Рассчитываем количество USDT
    const bitcoinAmount = bitcoinResource.value;
    const usdtBeforeCommission = bitcoinAmount * exchangeRate;
    const commission = usdtBeforeCommission * exchangeCommission;
    const usdtAmount = usdtBeforeCommission - commission;
    
    console.log(`ResourceSystem: Обмен ${bitcoinAmount} BTC на ${usdtAmount} USDT по курсу ${exchangeRate} с комиссией ${commission}`);
    
    // Обновляем ресурсы
    return {
      ...state,
      resources: {
        ...state.resources,
        bitcoin: {
          ...bitcoinResource,
          value: 0 // Обмениваем весь Bitcoin
        },
        usdt: {
          ...usdtResource,
          value: Math.min(usdtResource.value + usdtAmount, usdtResource.max || Number.MAX_SAFE_INTEGER)
        }
      }
    };
  }
}
