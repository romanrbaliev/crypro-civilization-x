
import React from 'react';
import { SpecializationSynergy } from '@/context/types';
import { useGame } from '@/context/hooks/useGame';
import { useToast } from "@/components/ui/use-toast";

interface SynergyCardProps {
  synergy: SpecializationSynergy;
  onActivate?: (synergyId: string) => void;
}

const SynergyCard: React.FC<SynergyCardProps> = ({ synergy, onActivate }) => {
  const { dispatch } = useGame();
  const { toast } = useToast();

  const onAddEvent = (description: string, type: "default" | "destructive") => {
    toast({
      title: "Системное сообщение",
      description,
      variant: type,
    })
  }

  const handleActivate = () => {
    if (onActivate) {
      // Используем переданный обработчик, если он есть
      onActivate(synergy.id);
    } else {
      // Иначе используем локальную логику
      dispatch({ 
        type: 'ACTIVATE_SYNERGY', 
        payload: { synergyId: synergy.id } 
      });
      onAddEvent(`Активирована синергия: ${synergy.name}`, "default");
    }
  };

  return (
    <div className="border rounded-md p-4 mb-4">
      <h3 className="text-lg font-semibold">{synergy.name}</h3>
      <p className="text-sm">{synergy.description}</p>
      <ul>
        {Object.entries(synergy.effects || {}).map(([key, value]) => (
          <li key={key} className="text-xs">
            {key}: {value}
          </li>
        ))}
        {synergy.bonus && Object.entries(synergy.bonus).map(([key, value]) => (
          <li key={`bonus-${key}`} className="text-xs font-semibold text-green-600">
            Бонус {key}: {value}
          </li>
        ))}
      </ul>
      <button
        onClick={handleActivate}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        Активировать
      </button>
    </div>
  );
};

export default SynergyCard;
