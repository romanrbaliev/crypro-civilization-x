
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';

interface SpecializationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const specializations: SpecializationOption[] = [
  {
    id: 'miner',
    name: 'Майнер',
    description: 'Специализация на добыче криптовалюты. +25% к эффективности майнинга.',
    icon: '⛏️'
  },
  {
    id: 'trader',
    name: 'Трейдер',
    description: 'Специализация на торговле криптовалютой. +15% к обменному курсу.',
    icon: '📈'
  },
  {
    id: 'researcher',
    name: 'Исследователь',
    description: 'Специализация на исследованиях. -20% к стоимости исследований.',
    icon: '🔬'
  },
  {
    id: 'manager',
    name: 'Менеджер',
    description: 'Специализация на управлении. +10% к эффективности всех зданий.',
    icon: '👔'
  }
];

const SpecializationTab: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const handleChooseSpecialization = (specializationType: string) => {
    dispatch({ 
      type: 'CHOOSE_SPECIALIZATION', 
      payload: { specializationType } 
    });
  };
  
  const currentSpecialization = state.specialization 
    ? specializations.find(spec => spec.id === state.specialization) 
    : null;
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Выбор специализации</h2>
      
      {currentSpecialization ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg dark:bg-green-900 dark:border-green-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentSpecialization.icon}</span>
            <div>
              <h3 className="text-xl font-bold">{currentSpecialization.name}</h3>
              <p>{currentSpecialization.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-300">
            Выберите специализацию для вашего персонажа. От выбора будут зависеть 
            бонусы и доступные улучшения.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specializations.map(spec => (
              <div 
                key={spec.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{spec.icon}</span>
                  <h3 className="text-lg font-bold">{spec.name}</h3>
                </div>
                <p className="text-sm mb-4">{spec.description}</p>
                <Button 
                  onClick={() => handleChooseSpecialization(spec.id)}
                  className="w-full"
                >
                  Выбрать
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SpecializationTab;
