
import { GameState, Resource, Building, Upgrade } from '@/context/types';
import { formatNumber } from './helpers';
import { getActiveBuildingHelpers, getHelperStatusSummary, getReferralAssignedBuildingId } from './referralHelperUtils';

/**
 * Детальный расчет производства знаний с пошаговой информацией
 */
export const debugKnowledgeProduction = (state: GameState): { steps: string[], total: number } => {
  const steps: string[] = [];
  let totalProduction = 0;
  
  try {
    steps.push(`Анализ скорости накопления знаний`);
    
    // Шаг 1: Проверяем существование ресурса "Знания"
    const knowledgeResource = state.resources['knowledge'];
    if (!knowledgeResource) {
      steps.push(`Ошибка: Ресурс 'knowledge' не найден в состоянии игры`);
      return { steps, total: 0 };
    }
    
    steps.push(`Шаг 1: Ресурс "Знания" существует. Текущее значение: ${formatNumber(knowledgeResource.value)}/${knowledgeResource.max !== Infinity ? formatNumber(knowledgeResource.max) : '∞'}`);
    
    // Шаг 2: Базовое производство от зданий
    steps.push(`Шаг 2: Расчет базового производства от зданий:`);
    
    let buildingProduction = 0;
    let hasPracticeBuilding = false;
    let buildingProductionDetails = [];
    
    Object.values(state.buildings).forEach(building => {
      const { id, name, count, production = {} } = building;
      
      // Проверяем, производит ли здание знания
      if (count > 0 && production.knowledge) {
        const baseAmount = Number(production.knowledge) * count;
        buildingProduction += baseAmount;
        
        buildingProductionDetails.push({
          id,
          name,
          count,
          baseProduction: Number(production.knowledge),
          totalProduction: baseAmount
        });
        
        steps.push(`- ${name} (${count} шт.): базовое производство ${Number(production.knowledge)}/сек * ${count} = ${baseAmount}/сек`);
        
        if (id === 'practice') {
          hasPracticeBuilding = true;
        }
      }
    });
    
    if (buildingProduction === 0) {
      steps.push(`- Нет зданий, производящих знания`);
    }
    
    if (!hasPracticeBuilding) {
      steps.push(`- Внимание: здание "Практика" не обнаружено или не производит знания`);
    }
    
    steps.push(`Итого базовое производство от зданий: ${buildingProduction}/сек`);
    totalProduction = buildingProduction;
    
    // Шаг 3: Бонусы от рефералов
    steps.push(`Шаг 3: Расчет бонуса от рефералов:`);
    
    // Получаем общую сводку по статусам помощников
    const helperSummary = getHelperStatusSummary(state.referralHelpers);
    steps.push(`- Общая сводка по помощникам: ${helperSummary.accepted} активных, ${helperSummary.pending} ожидающих, ${helperSummary.rejected} отклоненных из ${helperSummary.total}`);
    
    const activeReferrals = state.referrals.filter(ref => 
      (ref.status === 'active' || ref.activated === true || ref.activated === 'true'));
    
    const referralBonus = activeReferrals.length * 0.05; // 5% за каждого
    
    steps.push(`- Всего рефералов: ${state.referrals.length}`);
    steps.push(`- Активных рефералов: ${activeReferrals.length}`);
    steps.push(`- Бонус от рефералов: ${activeReferrals.length} * 5% = +${(referralBonus * 100).toFixed(0)}%`);
    
    if (activeReferrals.length > 0) {
      const referralEffect = buildingProduction * referralBonus;
      steps.push(`- Эффект бонуса: ${buildingProduction} * ${(referralBonus * 100).toFixed(0)}% = +${referralEffect.toFixed(2)}/сек`);
      totalProduction += referralEffect;
    }
    
    // Шаг 4: Бонусы от помощников для реферрера (5% за каждого)
    steps.push(`Шаг 4: Расчет бонуса от помощников для реферрера (5% за каждого):`);
    
    let helperBonusTotal = 0;
    
    // Проходим по каждому зданию, производящему знания
    buildingProductionDetails.forEach(building => {
      // Находим помощников для этого здания с помощью унифицированной функции
      const helpers = getActiveBuildingHelpers(building.id, state.referralHelpers);
      
      steps.push(`- Проверка здания "${building.name}" (ID: ${building.id}):`);
      
      if (helpers.length > 0) {
        // ОБНОВЛЕННАЯ ЛОГИКА: Теперь каждый помощник дает 5% бонуса для реферрера
        const helperBonus = helpers.length * 0.05; // 5% за каждого
        const helperEffect = building.totalProduction * helperBonus;
        
        helperBonusTotal += helperEffect;
        
        steps.push(`  ✅ Найдено ${helpers.length} помощников = +${(helperBonus * 100).toFixed(0)}% к производству (по 5% за каждого)`);
        steps.push(`  ✅ Эффект: ${building.totalProduction}/сек * ${(helperBonus * 100).toFixed(0)}% = +${helperEffect.toFixed(2)}/сек`);
        
        // Выводим подробно о каждом помощнике
        helpers.forEach((helper, index) => {
          steps.push(`    - Помощник #${index + 1}: ID=${helper.helperId}, статус=${helper.status}`);
        });
      } else {
        steps.push(`  ❌ Помощников для этого здания не найдено`);
      }
    });
    
    // Если нет помощников - показываем это явно
    if (helperBonusTotal === 0) {
      // Более подробно показываем отсутствие помощников
      steps.push(`- Нет активных помощников на зданиях, производящих знания`);
      
      // Перечисляем все здания с их ID для диагностики
      steps.push(`- Список зданий, производящих знания:`);
      buildingProductionDetails.forEach(b => {
        steps.push(`  ${b.name} (ID: ${b.id})`);
      });
      
      // Показываем всех доступных помощников
      steps.push(`- Доступные помощники в системе (${state.referralHelpers.length}):`);
      if (state.referralHelpers.length === 0) {
        steps.push(`  Нет доступных помощников`);
      } else {
        state.referralHelpers.forEach(helper => {
          steps.push(`  Помощник ID: ${helper.helperId}, для здания: ${helper.buildingId}, статус: ${helper.status}`);
        });
      }
    } else {
      steps.push(`- Общий бонус от помощников для реферрера: +${helperBonusTotal.toFixed(2)}/сек (5% за каждого помощника)`);
      totalProduction += helperBonusTotal;
    }
    
    // Шаг 5: Бонус для реферала-помощника (10% за каждое здание)
    steps.push(`Шаг 5: Расчет бонуса для реферала-помощника (10% за каждое здание):`);
    
    // Получаем ID текущего пользователя
    // ИЗМЕНЕНО: теперь используем локальное хранилище или кэш для user_id вместо referralCode
    const currentUserId = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
    
    // Выводим ID пользователя для отладки
    steps.push(`- Текущий пользователь ID: ${currentUserId || 'не определен'}`);
    
    if (currentUserId) {
      // Проверяем, является ли текущий пользователь помощником для кого-то
      const buildingsAsHelper = state.referralHelpers.filter(h => 
        h.helperId === currentUserId && h.status === 'accepted'
      );
      
      // Выводим все записи о помощниках для полной диагностики
      steps.push(`- Все записи о помощниках (${state.referralHelpers.length}):`);
      state.referralHelpers.forEach((h, idx) => {
        steps.push(`  Запись #${idx+1}: helperId=${h.helperId}, buildingId=${h.buildingId}, status=${h.status}`);
      });
      
      if (buildingsAsHelper.length > 0) {
        steps.push(`- Текущий пользователь (${currentUserId}) является помощником для ${buildingsAsHelper.length} зданий:`);
        
        let helperBonusForReferral = 0;
        
        buildingsAsHelper.forEach((helperRecord, index) => {
          steps.push(`  Здание #${index + 1}: ID=${helperRecord.buildingId}`);
          
          // НОВАЯ ЛОГИКА: Реферал получает 10% бонус за каждое здание, на котором он помогает
          const perBuildingBonus = 0.1; // 10% за здание
          const bonusFromBuilding = buildingProduction * perBuildingBonus;
          helperBonusForReferral += bonusFromBuilding;
          
          steps.push(`  ✅ Бонус за здание: ${buildingProduction}/сек * 10% = +${bonusFromBuilding.toFixed(2)}/сек`);
        });
        
        steps.push(`- Общий бонус для реферала-помощника: +${helperBonusForReferral.toFixed(2)}/сек (10% за каждое здание)`);
        totalProduction += helperBonusForReferral;
      } else {
        steps.push(`- Текущий пользователь (${currentUserId}) не является помощником ни для каких зданий`);
        
        // Добавляем явное логирование для поиска пользователя среди помощников
        const helpersWithThisId = state.referralHelpers.filter(h => h.helperId === currentUserId);
        if (helpersWithThisId.length > 0) {
          steps.push(`  Найдены записи для этого пользователя, но они не в статусе 'accepted':`);
          helpersWithThisId.forEach((h, idx) => {
            steps.push(`  - Запись #${idx+1}: helperId=${h.helperId}, buildingId=${h.buildingId}, status=${h.status}`);
          });
        }
      }
    } else {
      steps.push(`- Не удалось определить ID текущего пользователя для проверки статуса помощника`);
    }
    
    // Шаг 6: Бонусы от исследований
    steps.push(`Шаг 6: Расчет бонусов от исследований:`);
    
    let upgradeBonus = 0;
    let upgradesFound = false;
    let knowledgeUpgradeMultiplier = 0;
    
    Object.values(state.upgrades).forEach(upgrade => {
      if (!upgrade.purchased) return;
      
      const effects = upgrade.effects || upgrade.effect || {};
      
      for (const [effectId, value] of Object.entries(effects)) {
        // Проверяем эффекты, влияющие на скорость накопления знаний
        if (effectId === 'knowledgeBoost' || effectId === 'knowledgeProduction') {
          upgradesFound = true;
          const boostValue = Number(value);
          knowledgeUpgradeMultiplier += boostValue;
          
          steps.push(`- Исследование "${upgrade.name}": эффект "${effectId}" = +${(boostValue * 100).toFixed(0)}%`);
        }
      }
    });
    
    if (!upgradesFound) {
      steps.push(`- Нет исследований, влияющих на производство знаний`);
      
      // Показать список всех купленных исследований для диагностики
      const purchasedUpgrades = Object.values(state.upgrades).filter(u => u.purchased);
      steps.push(`- Купленные исследования (${purchasedUpgrades.length}):`);
      if (purchasedUpgrades.length > 0) {
        purchasedUpgrades.forEach(u => {
          const effects = u.effects || u.effect || {};
          steps.push(`  "${u.name}" (ID: ${u.id}) с эффектами: ${JSON.stringify(effects)}`);
        });
      } else {
        steps.push(`  Нет купленных исследований`);
      }
    } else {
      const upgradeEffect = buildingProduction * knowledgeUpgradeMultiplier;
      steps.push(`- Общий бонус от исследований: +${(knowledgeUpgradeMultiplier * 100).toFixed(0)}%`);
      steps.push(`- Эффект исследований: ${buildingProduction}/сек * ${(knowledgeUpgradeMultiplier * 100).toFixed(0)}% = +${upgradeEffect.toFixed(2)}/сек`);
      totalProduction += upgradeEffect;
    }
    
    // Итоговый расчет
    steps.push(`Шаг 7: Итоговый расчет:`);
    steps.push(`- Базовое производство от зданий: ${buildingProduction.toFixed(2)}/сек`);
    
    if (referralBonus > 0) {
      const referralEffect = buildingProduction * referralBonus;
      steps.push(`- Бонус от рефералов: +${referralEffect.toFixed(2)}/сек`);
    }
    
    if (helperBonusTotal > 0) {
      steps.push(`- Бонус от помощников для реферрера (5% за каждого): +${helperBonusTotal.toFixed(2)}/сек`);
    }
    
    // Обновлено: используем user_id вместо referralCode
    const currentUserIdForSummary = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
    const buildingsAsHelper = currentUserIdForSummary ? state.referralHelpers.filter(h => 
      h.helperId === currentUserIdForSummary && h.status === 'accepted'
    ) : [];
    
    if (buildingsAsHelper.length > 0) {
      const helperBonusForReferral = buildingProduction * buildingsAsHelper.length * 0.1;
      steps.push(`- Бонус для реферала-помощника (10% за каждое здание, ${buildingsAsHelper.length} зданий): +${helperBonusForReferral.toFixed(2)}/сек`);
    }
    
    if (knowledgeUpgradeMultiplier > 0) {
      const upgradeEffect = buildingProduction * knowledgeUpgradeMultiplier;
      steps.push(`- Бонус от исследований: +${upgradeEffect.toFixed(2)}/сек`);
    }
    
    steps.push(`Итоговая скорость накопления знаний: ${totalProduction.toFixed(2)}/сек`);
    steps.push(`Показатель в интерфейсе: ${knowledgeResource.perSecond ? knowledgeResource.perSecond.toFixed(2) : '0'}/сек`);
    
    if (Math.abs(totalProduction - (knowledgeResource.perSecond || 0)) > 0.01) {
      steps.push(`Обнаружено расхождение между расчетным значением и значением в интерфейсе!`);
    }
    
  } catch (error) {
    console.error('Ошибка при расчете скорости накопления знаний:', error);
    steps.push(`Произошла ошибка при расчете: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return { steps, total: totalProduction };
};
