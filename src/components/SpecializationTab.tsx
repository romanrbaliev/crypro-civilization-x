
import React from 'react';
import { useGame } from '@/context/hooks/useGame';

interface SpecializationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  benefits: string[];
}

const specializations: SpecializationOption[] = [
  {
    id: 'miner',
    name: 'Майнер',
    description: 'Специализация на добыче криптовалюты через майнинг.',
    icon: '⛏️',
    benefits: [
      '+15% к эффективности майнинга',
      '+10% к энергоэффективности',
      'Доступ к специальным улучшениям для майнеров'
    ]
  },
  {
    id: 'trader',
    name: 'Трейдер',
    description: 'Специализация на торговле криптовалютой.',
    icon: '📈',
    benefits: [
      '+10% к обменному курсу криптовалют',
      '-5% комиссия при обмене',
      'Доступ к инструментам анализа рынка'
    ]
  },
  {
    id: 'developer',
    name: 'Разработчик',
    description: 'Специализация на создании блокчейн-приложений.',
    icon: '💻',
    benefits: [
      '+20% к производству знаний',
      '+10% к эффективности всех зданий',
      'Доступ к инновационным технологиям'
    ]
  }
];

const SpecializationTab: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const handleSelectSpecialization = (specialization: string) => {
    dispatch({
      type: 'CHOOSE_SPECIALIZATION',
      payload: { specialization }
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {specializations.map((spec) => (
        <div
          key={spec.id}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            state.specialization === spec.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => handleSelectSpecialization(spec.id)}
        >
          <div className="text-center mb-3">
            <span className="text-3xl">{spec.icon}</span>
          </div>
          <h3 className="text-lg font-bold text-center">{spec.name}</h3>
          <p className="text-sm text-gray-600 my-2">{spec.description}</p>
          <div className="mt-3">
            <h4 className="text-sm font-semibold">Преимущества:</h4>
            <ul className="text-xs text-gray-600 list-disc pl-4">
              {spec.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          {state.specialization === spec.id && (
            <div className="mt-3 text-center">
              <span className="inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded">
                Выбрано
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SpecializationTab;
