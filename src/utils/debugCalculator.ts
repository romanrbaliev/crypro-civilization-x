
import { GameState } from '@/context/types';
import { isResourceUnlocked, isBuildingUnlocked, isUpgradeUnlocked } from './unlockHelper';

/**
 * Создает отчет о состоянии разблокировок для отладки
 */
export const debugUnlockStatus = (state: GameState): { unlocked: string[], locked: string[], steps: string[] } => {
  const unlocked: string[] = [];
  const locked: string[] = [];
  const steps: string[] = [];
  
  // Отладка ресурсов
  steps.push("Проверка ресурсов:");
  Object.entries(state.resources).forEach(([id, resource]) => {
    if (resource.unlocked) {
      unlocked.push(`Ресурс: ${resource.name}`);
      steps.push(`✅ Ресурс ${resource.name} разблокирован`);
    } else {
      locked.push(`Ресурс: ${resource.name}`);
      steps.push(`❌ Ресурс ${resource.name} заблокирован`);
      
      // Анализ почему ресурс заблокирован
      if (id === 'usdt') {
        const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
        steps.push(`• USDT требует применений знаний: ${applyKnowledgeCount}/1`);
      } else if (id === 'electricity') {
        steps.push(`• Электричество требует генератор: ${state.buildings.generator?.count || 0} > 0`);
      } else if (id === 'computingPower') {
        steps.push(`• Вычислительная мощность требует компьютер: ${state.buildings.homeComputer?.count || 0} > 0`);
      } else if (id === 'bitcoin') {
        steps.push(`• Bitcoin требует исследование основ криптовалют и майнер`);
      }
    }
  });
  
  // Отладка зданий
  steps.push("\nПроверка зданий:");
  Object.entries(state.buildings).forEach(([id, building]) => {
    if (building.unlocked) {
      unlocked.push(`Здание: ${building.name}`);
      steps.push(`✅ Здание ${building.name} разблокировано`);
    } else {
      locked.push(`Здание: ${building.name}`);
      steps.push(`❌ Здание ${building.name} заблокировано`);
      
      // Анализ почему здание заблокировано
      if (id === 'practice') {
        const applyKnowledgeCount = getCounterValue(state, 'applyKnowledge');
        steps.push(`• Практика требует применений знаний: ${applyKnowledgeCount}/2`);
      } else if (id === 'generator') {
        steps.push(`• Генератор требует USDT: ${state.resources.usdt?.value || 0}/11`);
      } else if (id === 'cryptoWallet') {
        steps.push(`• Криптокошелек требует исследование основ блокчейна`);
      } else if (id === 'homeComputer') {
        steps.push(`• Домашний компьютер требует электричества: ${state.resources.electricity?.value || 0}/50`);
      }
    }
  });
  
  // Отладка исследований
  steps.push("\nПроверка исследований:");
  Object.entries(state.upgrades).forEach(([id, upgrade]) => {
    if (upgrade.unlocked || upgrade.purchased) {
      if (upgrade.purchased) {
        unlocked.push(`Исследование (изучено): ${upgrade.name}`);
        steps.push(`✅ Исследование ${upgrade.name} изучено`);
      } else if (upgrade.unlocked) {
        unlocked.push(`Исследование (доступно): ${upgrade.name}`);
        steps.push(`✅ Исследование ${upgrade.name} доступно для изучения`);
      }
    } else {
      locked.push(`Исследование: ${upgrade.name}`);
      steps.push(`❌ Исследование ${upgrade.name} заблокировано`);
    }
  });
  
  return { unlocked, locked, steps };
};

// Вспомогательная функция для получения значения счетчика
function getCounterValue(state: GameState, counterId: string): number {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
}

/**
 * Создает отчет об эффектах, применяемых к ресурсам
 */
export const debugResourceEffects = (state: GameState): Record<string, any> => {
  const effectReport: Record<string, any> = {};
  
  // Проходим по всем ресурсам и получаем текущие бонусы
  Object.entries(state.resources).forEach(([resourceId, resource]) => {
    effectReport[resourceId] = {
      base: resource.baseProduction || 0,
      current: resource.production || 0,
      max: resource.max || 0,
      modifiers: []
    };
    
    // TODO: Здесь можно добавить сбор подробной информации о модификаторах
  });
  
  return effectReport;
};
