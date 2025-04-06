
// Получает название специализации
export const getSpecializationName = (specId: string): string => {
  const specializationMap: Record<string, string> = {
    'miner': 'Майнер',
    'trader': 'Трейдер',
    'investor': 'Инвестор',
    'influencer': 'Инфлюенсер',
    'defi': 'DeFi',
    'technology': 'Технологии',
    'financial': 'Финансы',
    'social': 'Социальные',
    'temporal': 'Временные',
    'mystical': 'Мистические'
  };
  
  return specializationMap[specId] || specId;
};
