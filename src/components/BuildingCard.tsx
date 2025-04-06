
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Building } from '@/context/types';
import { formatCost } from '@/utils/costFormatter';
import { Building as BuildingIcon, Zap, BarChart2, CpuIcon, Bitcoin } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface BuildingCardProps {
  building: Building;
  isAffordable: boolean;
  onSelect: () => void;
  isSelected: boolean;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building, isAffordable, onSelect, isSelected }) => {
  const { id, name, description, count = 0, cost = {}, effects = {} } = building;
  const { t, language } = useTranslation();
  const [formattedCostText, setFormattedCostText] = useState<string>("");

  // Форматирование стоимости с учетом языка с ретраями
  useEffect(() => {
    // Попытка форматирования с ретраями
    let retryCount = 0;
    const maxRetries = 3;

    const formatWithRetry = () => {
      try {
        const formatted = formatCost(cost, language);
        if (formatted && formatted !== "undefined" && formatted !== "Стоимость не определена") {
          setFormattedCostText(formatted);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(formatWithRetry, 100 * retryCount);
        }
      } catch (error) {
        console.error("Ошибка при форматировании стоимости:", error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(formatWithRetry, 100 * retryCount);
        }
      }
    };

    formatWithRetry();
  }, [cost, language]);
  
  // Определение иконки для здания
  const getBuildingIcon = () => {
    switch (id) {
      case 'generator':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'practice':
        return <BarChart2 className="h-5 w-5 text-blue-500" />;
      case 'homeComputer':
        return <CpuIcon className="h-5 w-5 text-gray-700" />;
      case 'miner':
      case 'autoMiner':
        return <Bitcoin className="h-5 w-5 text-orange-500" />;
      default:
        return <BuildingIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  // Получение эффектов здания для отображения с учетом перевода
  const getBuildingEffects = () => {
    const effectDescriptions: string[] = [];
    
    // Специальные описания эффектов для конкретных зданий
    switch (id) {
      case 'practice':
        effectDescriptions.push(t('buildings.practice.effect'));
        break;
      case 'generator':
        effectDescriptions.push(t('buildings.generator.effect'));
        break;
      case 'homeComputer':
        effectDescriptions.push(t('buildings.homeComputer.effect'));
        effectDescriptions.push(t('buildings.homeComputer.consumption'));
        break;
      case 'miner':
      case 'autoMiner':
        effectDescriptions.push(t('buildings.miner.effect'));
        effectDescriptions.push(t('buildings.miner.consumption1'));
        effectDescriptions.push(t('buildings.miner.consumption2'));
        break;
      case 'cryptoWallet':
        effectDescriptions.push(t('buildings.cryptoWallet.effect1'));
        effectDescriptions.push(t('buildings.cryptoWallet.effect2'));
        break;
      case 'internetChannel':
        effectDescriptions.push(t('buildings.internetChannel.effect1'));
        effectDescriptions.push(t('buildings.internetChannel.effect2'));
        break;
      case 'coolingSystem':
        effectDescriptions.push(t('buildings.coolingSystem.effect'));
        break;
      case 'improvedWallet':
      case 'enhancedWallet':
        effectDescriptions.push(t('buildings.improvedWallet.effect1'));
        effectDescriptions.push(t('buildings.improvedWallet.effect2'));
        effectDescriptions.push(t('buildings.improvedWallet.effect3'));
        break;
      case 'cryptoLibrary':
        effectDescriptions.push(t('buildings.cryptoLibrary.effect1'));
        effectDescriptions.push(t('buildings.cryptoLibrary.effect2'));
        break;
    }
    
    return effectDescriptions;
  };
  
  // Получение переведенного названия и описания здания
  const getBuildingName = () => {
    const translationKey = `buildings.${id}`;
    return t(translationKey) !== translationKey ? t(translationKey) : name;
  };
  
  const getBuildingDescription = () => {
    const translationKey = `buildings.${id}.description`;
    return t(translationKey) !== translationKey ? t(translationKey) : description;
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
              <div className="text-xs text-gray-500">{t('buildings.count')}: {count}</div>
            </div>
          </div>
          <div className="text-sm font-medium text-green-600">
            {formattedCostText}
          </div>
        </div>
        
        <CardDescription className="text-xs mt-2">
          {getBuildingDescription()}
        </CardDescription>
        
        <div className="mt-2 text-xs">
          <div className="font-semibold text-gray-700">{t('buildings.effects')}:</div>
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
