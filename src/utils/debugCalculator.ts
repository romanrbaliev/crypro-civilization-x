
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
    
    if (totalUpgradeBoost > 0) {
      steps.push(`Всего от исследований: +${totalUpgradeBoost.toFixed(2)}/сек`);
    } else {
      steps.push('- Нет активных исследований с бонусами к знаниям (0% бонуса)');
    }
    
    // Шаг 3: Бонусы от рефералов (только для реферрера)
    const currentUserId = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
    const referrals = state.referrals || [];
    const activeReferrals = referrals.filter((ref: any) => 
      ref.status === 'active' || ref.activated === true || ref.activated === 'true'
    );
    
    steps.push('\n3. Бонусы от рефералов:');
    
    let referralBoostAmount = 0;
    if (activeReferrals.length > 0) {
      const referralBonus = activeReferrals.length * 0.05; // 5% за каждого активного реферала
      referralBoostAmount = baseValue * referralBonus;
      
      steps.push(`- Активных рефералов: ${activeReferrals.length}, бонус: +${(referralBonus * 100).toFixed(0)}%`);
      steps.push(`- Увеличение производства: +${referralBoostAmount.toFixed(2)}/сек`);
      
      totalUpgradeBoost += referralBoostAmount;
    } else {
      steps.push('- Нет активных рефералов (0% бонуса)');
    }
    
    // Шаг 4: Бонусы от помощников, где текущий пользователь является РАБОТОДАТЕЛЕМ
    steps.push('\n4. Бонусы от помощников для работодателя:');
    
    const referralHelpers = state.referralHelpers || [];
    let totalHelperBonus = 0;
    
    // Фильтруем только тех помощников, где текущий пользователь - работодатель
    const myHelpers = referralHelpers.filter((helper: any) => 
      helper.employerId === currentUserId && helper.status === 'accepted'
    );
    
    if (myHelpers.length > 0) {
      const helperIds = new Set();
      
      // Группируем помощников по зданиям
      const helpersByBuilding: Record<string, any[]> = {};
      
      myHelpers.forEach((helper: any) => {
        if (!helpersByBuilding[helper.buildingId]) {
          helpersByBuilding[helper.buildingId] = [];
        }
        helpersByBuilding[helper.buildingId].push(helper);
        helperIds.add(helper.helperId);
      });
      
      // Для каждого здания с помощниками
      Object.entries(helpersByBuilding).forEach(([buildingId, helpers]) => {
        const building = buildings[buildingId];
        
        if (building && building.production && building.production.knowledge) {
          const buildingProduction = building.production.knowledge * building.count;
          const helperBonus = helpers.length * 0.05; // 5% за каждого помощника
          const helperBoostAmount = buildingProduction * helperBonus;
          
          totalHelperBonus += helperBoostAmount;
          steps.push(`- Здание "${building.name}" с ${helpers.length} помощниками: +${(helperBonus * 100).toFixed(0)}% к производству ${buildingProduction.toFixed(2)}/сек = +${helperBoostAmount.toFixed(2)}/сек`);
        }
      });
      
      steps.push(`- Всего уникальных помощников: ${helperIds.size}`);
      steps.push(`- Общий бонус от помощников: +${totalHelperBonus.toFixed(2)}/сек`);
      
      totalUpgradeBoost += totalHelperBonus;
    } else {
      steps.push('- Нет зданий с активными помощниками (0% бонуса)');
    }
    
    // Шаг 5: Бонус для реферала-помощника (10% за каждое здание, если текущий пользователь является ПОМОЩНИКОМ)
    steps.push('\n5. Бонус для реферала-помощника:');
    
    let helperBuildingsCount = 0;
    let hasHelperRole = false;
    
    if (currentUserId) {
      // Проверяем, где текущий пользователь выступает в роли помощника
      const whereIAmHelper = referralHelpers.filter((h: any) => 
        h.helperId === currentUserId && h.status === 'accepted'
      );
      
      helperBuildingsCount = whereIAmHelper.length;
      hasHelperRole = helperBuildingsCount > 0;
      
      // Дополнительно проверяем в кеше/БД для подтверждения
      const helperBuildingsFromCache = await helperStatusCache.get(currentUserId);
      
      steps.push(`- Данные о помощнике из БД: ${helperBuildingsFromCache} зданий`);
      steps.push(`- Данные о помощнике из локального состояния: ${helperBuildingsCount} зданий`);
      
      // Используем максимальное значение из локального состояния и БД для надежности
      helperBuildingsCount = Math.max(helperBuildingsCount, helperBuildingsFromCache);
      
      let helperBoostAmount = 0;
      if (helperBuildingsCount > 0) {
        const helperBonus = helperBuildingsCount * 0.1; // 10% за каждое здание
        helperBoostAmount = baseValue * helperBonus;
        
        steps.push(`- Пользователь ${currentUserId.substring(0, 10)}... помогает на ${helperBuildingsCount} зданиях`);
        steps.push(`- Статус помощника даёт бонус: +${(helperBonus * 100).toFixed(0)}% к базовому производству = +${helperBoostAmount.toFixed(2)}/сек`);
        
        totalUpgradeBoost += helperBoostAmount;
      } else {
        steps.push(`- Текущий пользователь (${currentUserId.substring(0, 10)}...) не является помощником ни для каких зданий`);
      }
    } else {
      steps.push('- Не удалось определить ID пользователя');
    }
    
    // Шаг 6: Расчёт итогового значения
    const finalValue = baseValue + totalUpgradeBoost;
    steps.push('\n6. Итоговое производство знаний:');
    steps.push(`- Базовое производство: ${baseValue.toFixed(2)}/сек`);
    steps.push(`- Бонусы от исследований, рефералов и помощников: +${totalUpgradeBoost.toFixed(2)}/сек`);
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
