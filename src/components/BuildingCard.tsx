
import React from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Building } from '@/context/types';
import { formatCost } from '@/utils/costFormatter';
import { Building as BuildingIcon, Zap, BarChart2, CpuIcon, Bitcoin } from 'lucide-react';
import { useI18nContext } from '@/context/I18nContext';
import { gameIds } from '@/i18n';

interface BuildingCardProps {
  building: Building;
  isAffordable: boolean;
  onSelect: () => void;
  isSelected: boolean;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building, isAffordable, onSelect, isSelected }) => {
  const { id, name, description, count = 0, cost = {}, effects = {} } = building;
  const { t } = useI18nContext();

  // Получаем переводы из системы i18n
  const getBuildingName = () => {
    const translationKey = `buildings.${id}.name`;
    const translated = t(translationKey);
    return typeof translated === 'string' ? translated : name;
  };
  
  const getBuildingDescription = () => {
    const translationKey = `buildings.${id}.description`;
    const translated = t(translationKey);
    return typeof translated === 'string' ? translated : description;
  };

  // Форматирование стоимости
  const formattedCost = formatCost(cost);
  
  // Определение иконки для здания
  const getBuildingIcon = () => {
    switch (id) {
      case gameIds.buildings.generator:
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case gameIds.buildings.practice:
        return <BarChart2 className="h-5 w-5 text-blue-500" />;
      case gameIds.buildings.homeComputer:
        return <CpuIcon className="h-5 w-5 text-gray-700" />;
      case gameIds.buildings.miner:
        return <Bitcoin className="h-5 w-5 text-orange-500" />;
      default:
        return <BuildingIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  // Получение эффектов здания из системы переводов
  const getBuildingEffects = () => {
    const translationKey = `buildings.${id}.effects`;
    const effects = t(translationKey);
    
    if (Array.isArray(effects)) {
      return effects;
    }
    
    // Если перевода нет, возвращаем стандартные эффекты
    return getDefaultEffects();
  };
  
  // Стандартные эффекты если перевод не найден
  const getDefaultEffects = () => {
    const effectDescriptions: string[] = [];
    
    // Специальные описания эффектов для конкретных зданий
    switch (id) {
      case gameIds.buildings.practice:
        effectDescriptions.push('Производит +1 знаний/сек');
        break;
      case gameIds.buildings.generator:
        effectDescriptions.push('Производит +0.5 электричества/сек');
        break;
      case gameIds.buildings.homeComputer:
        effectDescriptions.push('Производит +2 вычисл. мощности/сек');
        effectDescriptions.push('Потребляет 1 электричества/сек');
        break;
      case gameIds.buildings.miner:
        effectDescriptions.push('Производит +0.00005 BTC/сек');
        effectDescriptions.push('Потребляет 1 электричества/сек');
        effectDescriptions.push('Потребляет 5 вычисл. мощности/сек');
        break;
      case gameIds.buildings.cryptoWallet:
        effectDescriptions.push('+50 к макс. USDT');
        effectDescriptions.push('+25% к макс. знаниям');
        break;
      case gameIds.buildings.internetChannel:
        effectDescriptions.push('+20% к скорости получения знаний');
        effectDescriptions.push('+5% к производству вычисл. мощности');
        break;
      case gameIds.buildings.coolingSystem:
        effectDescriptions.push('-20% к потреблению вычисл. мощности');
        break;
      case gameIds.buildings.enhancedWallet:
        effectDescriptions.push('+150 к макс. USDT');
        effectDescriptions.push('+1 к макс. BTC');
        effectDescriptions.push('+8% к обмену BTC на USDT');
        break;
      case gameIds.buildings.cryptoLibrary:
        effectDescriptions.push('+50% к скорости получения знаний');
        effectDescriptions.push('+100 к макс. знаниям');
        break;
    }
    
    return effectDescriptions;
  };
  
  const borderColor = isSelected 
    ? "border-blue-500"
    : isAffordable
      ? "border-green-300 hover:border-green-500"
      : "border-gray-200";
  
  return (
    <Card 
      className={`h-full cursor-pointer mb-2 transition-all ${borderColor} ${isSelected ? 'shadow-md' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getBuildingIcon()}
            <div>
              <div className="text-sm font-medium">{getBuildingName()}</div>
              <div className="text-xs text-gray-500">Количество: {count}</div>
            </div>
          </div>
          <div className="text-sm font-medium text-green-600">
            {formattedCost}
          </div>
        </div>
        
        <CardDescription className="text-xs mt-2">
          {getBuildingDescription()}
        </CardDescription>
        
        <div className="mt-2 text-xs">
          <div className="font-semibold text-gray-700">Эффекты:</div>
          <ul className="list-disc list-inside">
            {getBuildingEffects().map((effect, index) => (
              <li key={index} className="text-gray-600">{effect}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingCard;
