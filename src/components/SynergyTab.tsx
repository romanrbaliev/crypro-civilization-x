
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import SynergyCard from './SynergyCard';
import { Puzzle } from 'lucide-react';
import { SpecializationSynergy } from '@/context/types';

interface SynergyTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const SynergyTab: React.FC<SynergyTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  
  // Проверяем наличие разблокированных синергий
  const unlockedSynergies = Object.entries(state.specializationSynergies)
    .filter(([_, s]) => s.unlocked)
    .map(([_, s]) => s as SpecializationSynergy);
  
  const hasUnlockedSynergies = unlockedSynergies.length > 0;
  
  // Активные синергии
  const activeSynergies = Object.entries(state.specializationSynergies)
    .filter(([_, s]) => s.active)
    .map(([_, s]) => s as SpecializationSynergy);
  
  // Неактивные, но разблокированные синергии
  const availableSynergies = Object.entries(state.specializationSynergies)
    .filter(([_, s]) => s.unlocked && !s.active)
    .map(([_, s]) => s as SpecializationSynergy);
  
  // Обработчик активации синергии
  const handleActivateSynergy = (synergyId: string) => {
    dispatch({ type: "ACTIVATE_SYNERGY", payload: { synergyId } });
    onAddEvent(`Активирована синергия: ${state.specializationSynergies[synergyId].name}`, "success");
  };
  
  // Запускаем проверку синергий
  React.useEffect(() => {
    dispatch({ type: "CHECK_SYNERGIES" });
  }, [state.upgrades, dispatch]);
  
  return (
    <div className="p-2 space-y-4">
      {hasUnlockedSynergies ? (
        <>
          {activeSynergies.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-sm mb-2">Активные синергии</h3>
              <div className="grid grid-cols-1 gap-3">
                {activeSynergies.map(synergy => (
                  <SynergyCard 
                    key={synergy.id} 
                    synergy={synergy}
                    onActivate={handleActivateSynergy}
                  />
                ))}
              </div>
            </div>
          )}
          
          {availableSynergies.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-2">Доступные синергии</h3>
              <div className="grid grid-cols-1 gap-3">
                {availableSynergies.map(synergy => (
                  <SynergyCard 
                    key={synergy.id} 
                    synergy={synergy}
                    onActivate={handleActivateSynergy}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Puzzle className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-xs">Продолжайте исследования в разных категориях для открытия синергии</p>
          <p className="text-[10px] mt-1">Синергия дает дополнительные бонусы при комбинировании исследований из разных категорий</p>
        </div>
      )}
    </div>
  );
};

export default SynergyTab;
