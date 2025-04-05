
import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/helpers';
import { Brain, DollarSign, Zap, Cpu, Bitcoin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ResourceItemProps {
  name: string;
  value: number;
  max: number;
  perSecond: number;
  icon: React.ReactNode;
  color: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ 
  name, value, max, perSecond, icon, color 
}) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <div className="flex flex-col p-2">
      <div className="flex items-center mb-1">
        <div className={`mr-2 ${color}`}>{icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatNumber(value, 2)} / {formatNumber(max, 0)}
            {perSecond !== 0 && (
              <span className={perSecond > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
                {' '}({perSecond > 0 ? '+' : ''}{formatNumber(perSecond, 2)}/сек)
              </span>
            )}
          </div>
        </div>
      </div>
      <Progress value={percentage} className="h-1" />
    </div>
  );
};

const ResourcePanel: React.FC = () => {
  const { state } = useGame();
  
  // Получаем разблокированные ресурсы
  const unlockedResources = Object.values(state.resources).filter(r => r.unlocked);
  
  // Карта иконок для ресурсов
  const resourceIcons: { [key: string]: { icon: React.ReactNode; color: string } } = {
    knowledge: { icon: <Brain size={18} />, color: "text-blue-500" },
    usdt: { icon: <DollarSign size={18} />, color: "text-green-500" },
    electricity: { icon: <Zap size={18} />, color: "text-yellow-500" },
    computingPower: { icon: <Cpu size={18} />, color: "text-purple-500" },
    bitcoin: { icon: <Bitcoin size={18} />, color: "text-orange-500" }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
      {unlockedResources.map(resource => (
        <ResourceItem
          key={resource.id}
          name={resource.name}
          value={resource.value}
          max={resource.max}
          perSecond={resource.perSecond}
          icon={resourceIcons[resource.id]?.icon || <DollarSign size={18} />}
          color={resourceIcons[resource.id]?.color || "text-gray-500"}
        />
      ))}
    </div>
  );
};

export default ResourcePanel;
