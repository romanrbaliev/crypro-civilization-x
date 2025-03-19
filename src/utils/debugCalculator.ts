
import { helperStatusCache } from './referralHelperUtils';

export function formatNumber(num: number, digits: number = 2): string {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

// Обновленная функция для детального анализа производства знаний
export async function debugKnowledgeProduction(state: any): Promise<{ steps: string[], finalValue: number }> {
  const steps: string[] = [];
  let baseValue = 0;
  
  try {
    // Шаг 1: Базовое производство от зданий
    steps.push('1. Базовое производство от зданий:');
    
    const buildings = state.buildings;
    let totalBuildingProduction = 0;
    
    Object.values(buildings).forEach((building: any) => {
      if (building.count > 0 && building.production && building.production.knowledge) {
        const buildingContribution = building.count * building.production.knowledge;
        totalBuildingProduction += buildingContribution;
        steps.push(`- ${building.name} (${building.count} шт.): ${buildingContribution.toFixed(2)}/сек`);
      }
    });
    
    steps.push(`Всего от зданий: ${totalBuildingProduction.toFixed(2)}/сек`);
    baseValue = totalBuildingProduction;
    
    // Шаг 2: Бонусы от исследований
    steps.push('\n2. Бонусы от исследований:');
    
    const upgrades = state.upgrades;
    let totalUpgradeBoost = 0;
    
    Object.values(upgrades).forEach((upgrade: any) => {
      if (upgrade.purchased) {
        const effects = upgrade.effects || upgrade.effect || {};
        
        if (effects.knowledgeBoost) {
          const boost = Number(effects.knowledgeBoost);
          const boostAmount = baseValue * boost;
          totalUpgradeBoost += boostAmount;
          steps.push(`- "${upgrade.name}" даёт +${(boost * 100).toFixed(0)}%: ${boostAmount.toFixed(2)}/сек`);
        }
      }
    });
    
    steps.push(`Всего от исследований: +${totalUpgradeBoost.toFixed(2)}/сек`);
    
    // Шаг 3: Бонусы от рефералов
    const referrals = state.referrals || [];
    const activeReferrals = referrals.filter((ref: any) => 
      ref.status === 'active' || ref.activated === true || ref.activated === 'true'
    );
    
    steps.push('\n3. Бонусы от рефералов:');
    
    if (activeReferrals.length > 0) {
      const referralBonus = activeReferrals.length * 0.05; // 5% за каждого активного реферала
      const referralBoostAmount = baseValue * referralBonus;
      
      steps.push(`- Активных рефералов: ${activeReferrals.length}, бонус: +${(referralBonus * 100).toFixed(0)}%`);
      steps.push(`- Увеличение производства: +${referralBoostAmount.toFixed(2)}/сек`);
      
      totalUpgradeBoost += referralBoostAmount;
    } else {
      steps.push('- Нет активных рефералов (0% бонуса)');
    }
    
    // Шаг 4: Бонусы от помощников для реферрера
    steps.push('\n4. Бонусы от помощников для реферрера:');
    
    const referralHelpers = state.referralHelpers || [];
    const helperIds = new Set();
    let totalHelperBonus = 0;
    
    // Группируем помощников по зданиям
    const helpersByBuilding: Record<string, any[]> = {};
    
    referralHelpers.forEach((helper: any) => {
      if (helper.status === 'accepted') {
        if (!helpersByBuilding[helper.buildingId]) {
          helpersByBuilding[helper.buildingId] = [];
        }
        helpersByBuilding[helper.buildingId].push(helper);
        helperIds.add(helper.helperId);
      }
    });
    
    // Для каждого здания с помощниками
    Object.entries(helpersByBuilding).forEach(([buildingId, helpers]) => {
      const building = buildings[buildingId];
      
      if (building && building.production && building.production.knowledge) {
        const buildingProduction = building.production.knowledge;
        const helperBonus = helpers.length * 0.05; // 5% за каждого помощника
        const helperBoostAmount = buildingProduction * helperBonus;
        
        totalHelperBonus += helperBoostAmount;
        steps.push(`- Здание "${building.name}" с ${helpers.length} помощниками: +${(helperBonus * 100).toFixed(0)}% к производству ${buildingProduction.toFixed(2)}/сек = +${helperBoostAmount.toFixed(2)}/сек`);
      }
    });
    
    if (Object.keys(helpersByBuilding).length === 0) {
      steps.push('- Нет зданий с активными помощниками (0% бонуса)');
    } else {
      steps.push(`- Всего уникальных помощников: ${helperIds.size}`);
      steps.push(`- Общий бонус от помощников: +${totalHelperBonus.toFixed(2)}/сек`);
    }
    
    // Шаг 5: Бонус для реферала-помощника (10% за каждое здание)
    steps.push('\n5. Бонус для реферала-помощника:');
    
    const currentUserId = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
    let helperBuildingsCount = 0;
    
    if (currentUserId) {
      // Получаем актуальное количество зданий из кеша или БД
      helperBuildingsCount = await helperStatusCache.get(currentUserId);
      
      // Проверяем локальное состояние тоже для диагностики
      const localHelperBuildings = referralHelpers.filter((h: any) => 
        h.helperId === currentUserId && h.status === 'accepted'
      );
      
      steps.push(`- Данные о помощнике из БД: ${helperBuildingsCount} зданий`);
      steps.push(`- Данные о помощнике из локального состояния: ${localHelperBuildings.length} зданий`);
      
      if (helperBuildingsCount > 0) {
        const helperBonus = helperBuildingsCount * 0.1; // 10% за каждое здание
        const helperBoostAmount = baseValue * helperBonus;
        
        steps.push(`- Пользователь ${currentUserId.substring(0, 10)}... помогает на ${helperBuildingsCount} зданиях`);
        steps.push(`- Статус помощника даёт бонус: +${(helperBonus * 100).toFixed(0)}% к базовому производству = +${helperBoostAmount.toFixed(2)}/сек`);
        
        totalUpgradeBoost += helperBoostAmount;
      } else {
        steps.push(`- Текущий пользователь (${currentUserId.substring(0, 10)}...) не является помощником ни для каких зданий по данным кеша`);
      }
    } else {
      steps.push('- Не удалось определить ID пользователя');
    }
    
    // Шаг 6: Расчёт итогового значения
    const finalValue = baseValue + totalUpgradeBoost + totalHelperBonus;
    steps.push('\n6. Итоговое производство знаний:');
    steps.push(`- Базовое производство: ${baseValue.toFixed(2)}/сек`);
    steps.push(`- Бонусы от исследований и рефералов: +${totalUpgradeBoost.toFixed(2)}/сек`);
    steps.push(`- Бонусы от помощников для реферрера: +${totalHelperBonus.toFixed(2)}/сек`);
    steps.push(`- Итого: ${finalValue.toFixed(2)}/сек`);
    
    return { 
      steps, 
      finalValue 
    };
  } catch (error) {
    steps.push(`\nОшибка при расчёте: ${error}`);
    console.error('Ошибка при расчёте производства знаний:', error);
    return { 
      steps, 
      finalValue: baseValue 
    };
  }
}

