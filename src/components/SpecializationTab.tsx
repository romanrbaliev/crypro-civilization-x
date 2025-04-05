
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useTranslation } from '@/i18n';

interface SpecializationTabProps {
  onAddEvent: (message: string, type: string) => void;
}

export function SpecializationTab({ onAddEvent }: SpecializationTabProps) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  
  // Специализации
  const specializations = [
    {
      id: 'miner',
      name: 'Майнер',
      description: 'Фокусируется на эффективном майнинге криптовалют',
      effects: [
        '+25% к эффективности майнинга',
        '+10% к максимальной вычислительной мощности',
        '-15% к энергопотреблению майнеров'
      ]
    },
    {
      id: 'trader',
      name: 'Трейдер',
      description: 'Эксперт по торговле и обмену криптовалютами',
      effects: [
        '+15% к курсу обмена криптовалют',
        '-20% комиссия при обмене',
        '+10% к максимальному хранению валют'
      ]
    },
    {
      id: 'investor',
      name: 'Инвестор',
      description: 'Профессионал в долгосрочных инвестициях',
      effects: [
        '+20% к пассивному доходу',
        '+25% к эффективности стейкинга',
        '+15% к максимальному хранению всех ресурсов'
      ]
    },
    {
      id: 'analyst',
      name: 'Аналитик',
      description: 'Эксперт по анализу данных и прогнозированию',
      effects: [
        '+25% к эффективности исследований',
        '-20% к стоимости улучшений',
        '+10% к всем производственным бонусам'
      ]
    },
    {
      id: 'influencer',
      name: 'Инфлюенсер',
      description: 'Специалист по социальному влиянию и сообществам',
      effects: [
        '+30% к реферальным бонусам',
        '+20% к эффективности коллективных проектов',
        '+15% к репутации в сообществе'
      ]
    }
  ];
  
  const handleChooseSpecialization = (specializationId: string) => {
    dispatch({ 
      type: "CHOOSE_SPECIALIZATION", 
      payload: { specializationId }
    });
    
    const spec = specializations.find(s => s.id === specializationId);
    if (spec) {
      onAddEvent(`Выбрана специализация: ${spec.name}`, "success");
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Выберите специализацию</h2>
      <p className="text-sm text-gray-600 mb-6">
        Специализация определяет уникальные бонусы для вашего развития. 
        Выбор можно изменить только после престижа.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specializations.map(spec => (
          <div 
            key={spec.id}
            className={`
              border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors
              ${state.specialization === spec.id ? 'bg-blue-50 border-blue-500' : 'bg-white'}
            `}
            onClick={() => handleChooseSpecialization(spec.id)}
          >
            <h3 className="font-medium text-lg">{spec.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{spec.description}</p>
            <div className="mt-2">
              <span className="text-sm font-semibold">Эффекты:</span>
              <ul className="mt-1 text-sm">
                {spec.effects.map((effect, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-1">•</span>
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Именованный экспорт по умолчанию для обратной совместимости
export default SpecializationTab;
