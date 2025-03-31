
import { GameState } from '@/context/types';

/**
 * Функция для подробного логирования и расчета производства знаний
 * @param state Текущее состояние игры
 * @returns Объект со списком шагов расчета и конечным значением
 */
export const debugKnowledgeProduction = (state: GameState) => {
  const steps: string[] = [];
  let finalValue = 0;

  try {
    steps.push(`Расчет производства знаний:`);
    
    // Проверка наличия ресурса знаний
    if (!state.resources.knowledge || !state.resources.knowledge.unlocked) {
      steps.push(`Ресурс "Знания" не существует или не разблокирован.`);
      return { steps, finalValue: 0 };
    }
    
    // Базовое производство от практики
    let practiceProduction = 0;
    if (state.buildings.practice && state.buildings.practice.count > 0) {
      const practiceCount = state.buildings.practice.count;
      const basePerPractice = 1.0; // базовое производство от одной практики
      practiceProduction = practiceCount * basePerPractice;
      
      steps.push(`Базовое производство от практики: ${practiceCount} × ${basePerPractice} = ${practiceProduction} знаний/сек`);
    } else {
      steps.push(`Нет зданий "Практика" - базовое производство: 0 знаний/сек`);
    }
    
    // Бонусы от исследований
    let researchMultiplier = 1.0;
    let researchBonuses: string[] = [];
    
    if (state.upgrades.blockchainBasics?.purchased) {
      researchMultiplier += 0.1;
      researchBonuses.push(`Основы блокчейна: +10%`);
    }
    
    if (state.upgrades.basicBlockchain?.purchased) {
      researchMultiplier += 0.1;
      researchBonuses.push(`Основы блокчейна (альт.): +10%`);
    }
    
    if (state.upgrades.blockchain_basics?.purchased) {
      researchMultiplier += 0.1;
      researchBonuses.push(`Основы блокчейна (альт.2): +10%`);
    }
    
    if (researchBonuses.length > 0) {
      steps.push(`\nБонусы от исследований:`);
      researchBonuses.forEach(bonus => steps.push(`• ${bonus}`));
      steps.push(`Множитель от исследований: ×${researchMultiplier.toFixed(2)}`);
    } else {
      steps.push(`\nНет активных исследований с бонусами к знаниям.`);
    }
    
    // Бонусы от специализации
    let specializationMultiplier = 1.0;
    if (state.specialization === 'analyst') {
      specializationMultiplier = 1.25;
      steps.push(`\nБонус специализации "Аналитик": ×1.25 (+25%)`);
    }
    
    // Бонусы от рефералов и помощников
    let referralMultiplier = 1.0;
    let hasReferralBonus = false;
    
    // Проверяем рефералов
    if (Array.isArray(state.referrals) && state.referrals.length > 0) {
      const activeReferrals = state.referrals.filter(ref => 
        ref.status === 'active' || ref.activated === true || ref.activated === 'true'
      );
      
      if (activeReferrals.length > 0) {
        const referralBonus = activeReferrals.length * 0.05;
        referralMultiplier += referralBonus;
        steps.push(`\nБонус от ${activeReferrals.length} активных рефералов: +${(referralBonus * 100).toFixed(0)}%`);
        hasReferralBonus = true;
      }
    }
    
    // Проверяем помощников
    if (Array.isArray(state.referralHelpers) && state.referralHelpers.length > 0) {
      let helperBonus = 0;
      let helpersWithStatus = [];
      
      state.referralHelpers.forEach(helper => {
        if (helper.status === 'accepted' && helper.buildingId === 'practice') {
          helperBonus += 0.05;
          helpersWithStatus.push(helper.id);
        }
      });
      
      if (helperBonus > 0) {
        referralMultiplier += helperBonus;
        steps.push(`\nБонус от ${helpersWithStatus.length} помощников: +${(helperBonus * 100).toFixed(0)}%`);
        
        // Вывод статуса помощников
        steps.push(`\nСтатус помощников для практики:`);
        helpersWithStatus.forEach((helperId, index) => {
          steps.push(`• Помощник ${index + 1}: ID ${helperId}`);
        });
        
        hasReferralBonus = true;
      }
    }
    
    if (!hasReferralBonus) {
      steps.push(`\nНет активных рефералов или помощников.`);
    }
    
    // Расчет общего производства
    const baseProduction = practiceProduction;
    const withResearchBonus = baseProduction * researchMultiplier;
    const withSpecializationBonus = withResearchBonus * specializationMultiplier;
    const finalProduction = withSpecializationBonus * referralMultiplier;
    
    finalValue = finalProduction;
    
    steps.push(`\nИтоговый расчет:`);
    steps.push(`Базовое производство: ${baseProduction.toFixed(2)} знаний/сек`);
    
    if (researchMultiplier !== 1.0) {
      steps.push(`С учетом исследований: ${baseProduction.toFixed(2)} × ${researchMultiplier.toFixed(2)} = ${withResearchBonus.toFixed(2)} знаний/сек`);
    }
    
    if (specializationMultiplier !== 1.0) {
      steps.push(`С учетом специализации: ${withResearchBonus.toFixed(2)} × ${specializationMultiplier.toFixed(2)} = ${withSpecializationBonus.toFixed(2)} знаний/сек`);
    }
    
    if (referralMultiplier !== 1.0) {
      steps.push(`С учетом рефералов/помощников: ${withSpecializationBonus.toFixed(2)} × ${referralMultiplier.toFixed(2)} = ${finalProduction.toFixed(2)} знаний/сек`);
    }
    
    steps.push(`\nИтого: ${finalProduction.toFixed(2)} знаний/сек`);
    
    // Выведем также текущее значение perSecond из state
    const currentPerSecond = state.resources.knowledge.perSecond || 0;
    steps.push(`\nТекущее значение в state.resources.knowledge.perSecond: ${currentPerSecond.toFixed(2)} знаний/сек`);
    
    if (Math.abs(currentPerSecond - finalProduction) > 0.01) {
      steps.push(`⚠️ Обнаружено расхождение в расчетах и текущем значении!`);
    }
    
  } catch (error) {
    steps.push(`Ошибка расчета: ${error}`);
  }
  
  return { steps, finalValue };
};
