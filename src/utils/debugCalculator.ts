
/**
 * Утилита для отладочного расчета производства знаний с детализацией
 * @param state - Текущее состояние игры
 * @returns Шаги расчета и финальное значение
 */
export const debugKnowledgeProduction = (state) => {
  const steps = [];
  let finalValue = 0;
  
  try {
    // Шаг 1: Базовое производство от здания "Практика"
    const practiceCount = state.buildings.practice?.count || 0;
    if (practiceCount > 0) {
      const baseKnowledgeProduction = 0.21 * practiceCount;
      steps.push(`Базовое производство от здания "Практика": ${practiceCount} × 0.21 = ${baseKnowledgeProduction.toFixed(2)}/сек`);
      finalValue += baseKnowledgeProduction;
    } else {
      steps.push(`Здание "Практика" не построено (0/сек)`);
    }
    
    // Шаг 2: Проверка исследований, влияющих на производство знаний
    const blockchainBasics = state.upgrades.blockchainBasics?.purchased || 
                             state.upgrades.basicBlockchain?.purchased || 
                             state.upgrades.blockchain_basics?.purchased;
    
    let researchBonus = 0;
    if (blockchainBasics) {
      researchBonus += 0.1; // +10% от исследования "Основы блокчейна"
      steps.push(`Исследование "Основы блокчейна": +10% к производству знаний`);
    }
    
    // Проверяем другие исследования
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      if (upgrade.purchased && (upgrade.effects || upgrade.effect)) {
        const effects = upgrade.effects || upgrade.effect;
        
        // Проверяем эффекты, связанные с знаниями
        if (effects.knowledgeBoost) {
          const boost = effects.knowledgeBoost;
          researchBonus += Number(boost);
          steps.push(`Исследование "${upgrade.name}": +${(Number(boost) * 100).toFixed(0)}% к производству знаний`);
        }
      }
    }
    
    if (researchBonus > 0) {
      const bonusProduction = finalValue * researchBonus;
      steps.push(`Бонус от исследований: ${finalValue.toFixed(2)} × ${(researchBonus * 100).toFixed(0)}% = +${bonusProduction.toFixed(2)}/сек`);
      finalValue += bonusProduction;
    }
    
    // Шаг 3: Проверка специализации
    if (state.specialization === 'analyst') {
      const specialistBonus = finalValue * 0.25; // +25% для аналитика
      steps.push(`Бонус от специализации "Аналитик": ${finalValue.toFixed(2)} × 25% = +${specialistBonus.toFixed(2)}/сек`);
      finalValue += specialistBonus;
    }
    
    // Шаг 4: Проверка бонусов от реферальных помощников
    if (state.referralHelpers && state.referralHelpers.length > 0) {
      const activeHelpers = state.referralHelpers.filter(h => h.status === 'accepted');
      const helpersOnKnowledge = activeHelpers.filter(h => h.buildingId === 'practice' || h.buildingId === 'cryptoLibrary');
      
      if (helpersOnKnowledge.length > 0) {
        steps.push(`\nПомощники и референции:`);
        
        // Для каждого помощника
        helpersOnKnowledge.forEach(helper => {
          const helperBonus = finalValue * 0.05; // +5% от каждого помощника
          steps.push(`Статус помощника даёт бонус: +${helperBonus.toFixed(2)}/сек (5% от ${finalValue.toFixed(2)})`);
          finalValue += helperBonus;
        });
        
        steps.push(`Общий бонус от помощников: +${(helpersOnKnowledge.length * 5)}% к производству знаний`);
      }
    }
    
    // Итоговое производство
    steps.push(`\nИтого: ${finalValue.toFixed(2)} знаний/сек`);
    
  } catch (error) {
    steps.push(`Ошибка при расчете: ${error.message}`);
    console.error('Ошибка при расчете производства знаний:', error);
  }
  
  return { steps, finalValue };
};
