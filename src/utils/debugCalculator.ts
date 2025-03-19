
import { GameState, Resource, Building } from "@/context/types";
import { calculateBuildingBoostFromHelpers, getHelperProductionBoost } from "@/utils/referralHelperUtils";

/**
 * Расчет скорости производства знаний с учетом всех бонусов
 * @param state Текущее состояние игры
 * @returns Объект с подробной информацией о расчете
 */
export const calculateKnowledgeProduction = (state: GameState) => {
  try {
    // Извлекаем ресурс знаний из состояния
    const knowledge = state.resources.knowledge;
    if (!knowledge) {
      return {
        success: false,
        message: "Ресурс знаний не найден в состоянии",
        details: {}
      };
    }

    // Получаем ID текущего пользователя
    const userId = localStorage.getItem('userId') || state.referralCode;
    if (!userId) {
      console.warn("ID пользователя не найден");
    }

    // Шаг 1: Определяем базовое производство от зданий
    const buildingProduction = {};
    let totalBaseProduction = 0;

    Object.values(state.buildings).forEach(building => {
      if (building.count > 0 && building.production && building.production.knowledge) {
        const amount = Number(building.production.knowledge) * building.count;
        buildingProduction[building.id] = amount;
        totalBaseProduction += amount;
      }
    });

    // Шаг 2: Определяем бонусы от активных рефералов
    const activeReferrals = state.referrals.filter(ref => 
      ref.activated === true || ref.activated === "true"
    );
    const referralBonus = activeReferrals.length * 0.05; // 5% за каждого активного реферала
    const referralBonusAmount = totalBaseProduction * referralBonus;

    // Шаг 3: Определяем бонусы от помощников
    const helperBonuses = {};
    let totalHelperBonus = 0;

    Object.values(state.buildings).forEach(building => {
      if (building.count > 0 && building.production && building.production.knowledge) {
        const buildingBoost = calculateBuildingBoostFromHelpers(building.id, state.referralHelpers);
        if (buildingBoost > 0) {
          const buildingBaseProduction = Number(building.production.knowledge) * building.count;
          const bonusAmount = buildingBaseProduction * buildingBoost;
          helperBonuses[building.id] = {
            baseProduction: buildingBaseProduction,
            boost: buildingBoost,
            bonusAmount: bonusAmount
          };
          totalHelperBonus += bonusAmount;
        }
      }
    });

    // Шаг 4: Определяем бонус для реферала-помощника (если текущий пользователь является помощником)
    const helperProductionBoost = userId ? getHelperProductionBoost(userId, state.referralHelpers) : 0;
    const helperProductionBonusAmount = totalBaseProduction * helperProductionBoost;

    // Шаг 5: Определяем бонусы от исследований
    const upgradeEffects = {};
    let totalUpgradeBonus = 0;

    Object.values(state.upgrades).forEach(upgrade => {
      if (upgrade.purchased) {
        const effects = upgrade.effects || upgrade.effect || {};
        
        if (effects.knowledgeBoost) {
          const boostPercent = Number(effects.knowledgeBoost);
          const boostAmount = totalBaseProduction * boostPercent;
          upgradeEffects[upgrade.id] = {
            name: upgrade.name,
            boost: boostPercent,
            bonusAmount: boostAmount
          };
          totalUpgradeBonus += boostAmount;
        }
      }
    });

    // Шаг 6: Рассчитываем общее производство и сравниваем с отображаемым
    const calculatedProduction = totalBaseProduction + referralBonusAmount + totalHelperBonus + totalUpgradeBonus + helperProductionBonusAmount;
    const displayedProduction = knowledge.perSecond || knowledge.production || 0;
    const discrepancy = Math.abs(calculatedProduction - displayedProduction);
    const hasDiscrepancy = discrepancy > 0.001; // Погрешность вычислений для чисел с плавающей точкой

    return {
      success: true,
      baseProduction: totalBaseProduction,
      buildingProduction,
      referralBonus: {
        activeReferrals: activeReferrals.length,
        bonusPercent: referralBonus * 100,
        bonusAmount: referralBonusAmount
      },
      helperBonus: {
        details: helperBonuses,
        totalBonus: totalHelperBonus
      },
      helperProductionBonus: {
        buildingsAsHelper: userId ? state.referralHelpers.filter(h => h.helperId === userId && h.status === 'accepted').length : 0,
        bonusPercent: helperProductionBoost * 100,
        bonusAmount: helperProductionBonusAmount
      },
      upgradeBonus: {
        effects: upgradeEffects,
        totalBonus: totalUpgradeBonus
      },
      calculatedProduction,
      displayedProduction,
      discrepancy: hasDiscrepancy ? discrepancy : 0,
      hasDiscrepancy
    };
  } catch (error) {
    console.error("Ошибка при расчете производства знаний:", error);
    return {
      success: false,
      message: `Ошибка при расчете: ${error.message}`,
      details: { error }
    };
  }
};
