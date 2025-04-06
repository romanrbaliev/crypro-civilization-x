
import React, { useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/helpers';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Sparkles, 
  Lock, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatEffectName, formatEffectValue, formatEffect } from '@/utils/researchUtils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useTranslation } from '@/i18n';

interface TechTreeNodeProps {
  upgrade: any;
  onAddEvent: (message: string, type: string) => void;
}

const TechTreeNode: React.FC<TechTreeNodeProps> = ({ upgrade, onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useTranslation();
  
  // Проверка доступности исследования
  const canPurchase = () => {
    if (!upgrade.unlocked || upgrade.purchased) return false;
    
    // Проверяем наличие необходимых ресурсов
    for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
      if (state.resources[resourceId]?.value < Number(amount)) {
        return false;
      }
    }
    return true;
  };
  
  // Проверка зависимостей от других исследований
  const hasMissingDependencies = () => {
    if (!upgrade.requiredUpgrades || upgrade.requiredUpgrades.length === 0) return false;
    
    return upgrade.requiredUpgrades.some(
      (requiredId: string) => !state.upgrades[requiredId]?.purchased
    );
  };
  
  // Покупка исследования
  const handlePurchase = () => {
    try {
      // Безопасно получаем объект эффектов
      const effects = upgrade.effects || upgrade.effect || {};
      console.log(`Покупка исследования ${upgrade.id} с эффектами:`, effects);
      
      dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: upgrade.id } });
      
      // Локализованное сообщение о завершении исследования
      const message = language === 'ru'
        ? `Завершено исследование: ${upgrade.name}`
        : `Research completed: ${upgrade.name}`;
      
      onAddEvent(message, "success");
      setIsOpen(false);
    } catch (error) {
      console.error(`Ошибка при покупке исследования ${upgrade.id}:`, error);
      
      // Локализованное сообщение об ошибке
      const errorMessage = language === 'ru'
        ? `Ошибка при покупке исследования: ${upgrade.name}`
        : `Error purchasing research: ${upgrade.name}`;
      
      onAddEvent(errorMessage, "error");
    }
  };
  
  // Отображение стоимости
  const renderCost = () => {
    return Object.entries(upgrade.cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      const hasEnough = resource?.value >= Number(amount);
      
      // Получаем локализованное название ресурса
      const resourceName = getResourceName(resourceId);
      
      return (
        <div key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[9px] flex justify-between w-full`}>
          <span>{resourceName}</span>
          <span>{formatNumber(Number(amount))}</span>
        </div>
      );
    });
  };
  
  // Получение локализованного названия ресурса
  const getResourceName = (resourceId: string): string => {
    const translationKeys: {[key: string]: string} = {
      knowledge: 'resources.knowledge',
      usdt: 'resources.usdt',
      electricity: 'resources.electricity',
      computingPower: 'resources.computingPower',
      bitcoin: 'resources.bitcoin'
    };
    
    const translationKey = translationKeys[resourceId];
    if (translationKey) {
      return t(translationKey);
    }
    
    return state.resources[resourceId]?.name || resourceId;
  };
  
  // Отображение эффектов
  const renderEffects = () => {
    // Безопасно получаем объект эффектов
    const effects = upgrade.effects || upgrade.effect || {};
    
    // Переводы для эффектов исследований
    const getEffectTranslation = (effectId: string) => {
      const effectTranslations: {[key: string]: string} = {
        knowledgeMaxBoost: language === 'ru' ? 'Макс. знаний' : 'Max knowledge',
        knowledgeBoost: language === 'ru' ? 'Прирост знаний' : 'Knowledge gain',
        usdtMaxBoost: language === 'ru' ? 'Макс. USDT' : 'Max USDT',
        securityBoost: language === 'ru' ? 'Безопасность' : 'Security',
        miningEfficiencyBoost: language === 'ru' ? 'Эфф. майнинга' : 'Mining efficiency',
        electricityEfficiencyBoost: language === 'ru' ? 'Эфф. электричества' : 'Electricity efficiency',
        tradingEfficiencyBoost: language === 'ru' ? 'Эфф. трейдинга' : 'Trading efficiency',
        marketAnalysisBoost: language === 'ru' ? 'Анализ рынка' : 'Market analysis',
        electricityConsumptionReduction: language === 'ru' ? 'Потр. электричества' : 'Electricity consumption'
      };
      
      return effectTranslations[effectId] || formatEffectName(effectId);
    };
    
    // Обрабатываем особые случаи для известных исследований
    if (upgrade.id === 'blockchainBasics' || upgrade.id === 'basicBlockchain' || upgrade.id === 'blockchain_basics') {
      return (
        <>
          <div className="text-blue-600 text-[9px] flex justify-between w-full">
            <span>{language === 'ru' ? 'Макс. знаний' : 'Max knowledge'}</span>
            <span>+50%</span>
          </div>
          <div className="text-blue-600 text-[9px] flex justify-between w-full">
            <span>{language === 'ru' ? 'Прирост знаний' : 'Knowledge gain'}</span>
            <span>+10%</span>
          </div>
        </>
      );
    }
    
    if (upgrade.id === 'cryptoCurrencyBasics' || upgrade.id === 'cryptoBasics') {
      return (
        <div className="text-blue-600 text-[9px] flex justify-between w-full">
          <span>{language === 'ru' ? 'Эфф. применения знаний' : 'Knowledge application efficiency'}</span>
          <span>+10%</span>
        </div>
      );
    }
    
    if (upgrade.id === 'walletSecurity' || upgrade.id === 'cryptoWalletSecurity') {
      return (
        <div className="text-blue-600 text-[9px] flex justify-between w-full">
          <span>{language === 'ru' ? 'Макс. USDT' : 'Max USDT'}</span>
          <span>+25%</span>
        </div>
      );
    }
    
    if (upgrade.id === 'algorithmOptimization') {
      return (
        <div className="text-blue-600 text-[9px] flex justify-between w-full">
          <span>{language === 'ru' ? 'Эфф. майнинга' : 'Mining efficiency'}</span>
          <span>+15%</span>
        </div>
      );
    }
    
    if (upgrade.id === 'proofOfWork') {
      return (
        <div className="text-blue-600 text-[9px] flex justify-between w-full">
          <span>{language === 'ru' ? 'Эфф. майнинга' : 'Mining efficiency'}</span>
          <span>+25%</span>
        </div>
      );
    }
    
    if (upgrade.id === 'energyEfficientComponents') {
      return (
        <div className="text-blue-600 text-[9px] flex justify-between w-full">
          <span>{language === 'ru' ? 'Потр. электричества' : 'Electricity consumption'}</span>
          <span>-10%</span>
        </div>
      );
    }
    
    if (Object.keys(effects).length === 0) {
      return (
        <div className="text-gray-500 text-[9px]">
          {language === 'ru' ? 'Нет данных о эффектах' : 'No effect data available'}
        </div>
      );
    }
    
    return Object.entries(effects).map(([effectId, amount]) => {
      const effectName = getEffectTranslation(effectId);
      const formattedValue = formatEffectValue(Number(amount), effectId);
      
      return (
        <div key={effectId} className="text-blue-600 text-[9px] flex justify-between w-full">
          <span>{effectName}</span>
          <span>{formattedValue}</span>
        </div>
      );
    });
  };
  
  // Отображение специализации
  const renderSpecialization = () => {
    if (!upgrade.specialization) return null;
    
    const specializationMap: {[key: string]: {ru: string, en: string}} = {
      miner: { ru: "Майнер", en: "Miner" },
      trader: { ru: "Трейдер", en: "Trader" },
      investor: { ru: "Инвестор", en: "Investor" },
      influencer: { ru: "Инфлюенсер", en: "Influencer" },
      defi: { ru: "DeFi", en: "DeFi" }
    };
    
    const specName = specializationMap[upgrade.specialization] 
      ? specializationMap[upgrade.specialization][language === 'ru' ? 'ru' : 'en'] 
      : upgrade.specialization;
    
    const specializationLabel = language === 'ru' ? 'Специализация' : 'Specialization';
    
    return (
      <div className="text-[9px] text-purple-600 mt-1">
        {specializationLabel}: {specName}
      </div>
    );
  };
  
  // Определение стиля узла в зависимости от состояния
  const getNodeStyle = () => {
    if (upgrade.purchased) {
      return "border-green-200 bg-green-50";
    }
    if (!upgrade.unlocked || hasMissingDependencies()) {
      return "border-gray-200 bg-gray-50 opacity-75";
    }
    if (canPurchase()) {
      return "border-blue-200 bg-blue-50";
    }
    return "border-gray-200 bg-white";
  };
  
  // Получение имени требуемого улучшения
  const getRequiredUpgradeName = (requiredId: string) => {
    const upgrade = state.upgrades[requiredId];
    return upgrade ? upgrade.name : requiredId;
  };
  
  // Локализованные тексты
  const getLocalizedTexts = () => {
    if (language === 'ru') {
      return {
        cost: 'Стоимость',
        effects: 'Эффекты',
        researchButton: 'Исследовать',
        completed: 'Исследование завершено',
        requiredResearch: 'Требуются исследования',
        unlockConditions: 'Условия разблокировки',
        continueDeveloping: 'Продолжайте развиваться для открытия этого исследования.',
        specialization: 'Специализация',
        technologyLevel: 'Уровень технологии'
      };
    } else {
      return {
        cost: 'Cost',
        effects: 'Effects',
        researchButton: 'Research',
        completed: 'Research completed',
        requiredResearch: 'Required Research',
        unlockConditions: 'Unlock Conditions',
        continueDeveloping: 'Continue developing to unlock this research.',
        specialization: 'Specialization',
        technologyLevel: 'Technology Level'
      };
    }
  };
  
  const localizedTexts = getLocalizedTexts();
  
  // Получение переведенного названия и описания исследования
  const getUpgradeName = () => {
    const translationKey = `research.${upgrade.id}`;
    return t(translationKey) !== translationKey ? t(translationKey) : upgrade.name;
  };
  
  const getUpgradeDescription = () => {
    const translationKey = `research.${upgrade.id}.description`;
    return t(translationKey) !== translationKey ? t(translationKey) : upgrade.description;
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={`border rounded-lg ${getNodeStyle()} relative mb-2 overflow-hidden`}
          >
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center cursor-pointer p-2">
                <div>
                  <div className="text-xs font-medium flex items-center">
                    {getUpgradeName()}
                    {upgrade.purchased && <Sparkles className="ml-1 h-3 w-3 text-amber-500" />}
                    {!upgrade.unlocked && <Lock className="ml-1 h-3 w-3 text-gray-400" />}
                    {hasMissingDependencies() && <AlertCircle className="ml-1 h-3 w-3 text-red-400" />}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-2 pt-0">
                <div className="text-[9px] text-gray-500 mb-2">{getUpgradeDescription()}</div>
                
                {upgrade.unlocked && !upgrade.purchased && (
                  <>
                    <div className="flex justify-between mb-2">
                      <div className="space-y-1 w-1/2 pr-1">
                        <h4 className="text-[10px] font-medium">{localizedTexts.cost}:</h4>
                        {renderCost()}
                      </div>
                      <div className="space-y-1 w-1/2 pl-1">
                        <h4 className="text-[10px] font-medium">{localizedTexts.effects}:</h4>
                        {renderEffects()}
                      </div>
                    </div>
                    
                    {renderSpecialization()}
                    
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant={canPurchase() ? "default" : "outline"}
                        disabled={!canPurchase()}
                        onClick={handlePurchase}
                        className="text-[9px] h-6 px-2 py-0 w-full"
                      >
                        {localizedTexts.researchButton}
                      </Button>
                    </div>
                  </>
                )}
                
                {upgrade.purchased && (
                  <div className="text-[9px] text-green-600 font-medium">
                    {localizedTexts.completed}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-xs">
            <div className="font-medium">{getUpgradeName()}</div>
            <div className="text-gray-500 mt-1">{getUpgradeDescription()}</div>
            
            {hasMissingDependencies() && (
              <div className="mt-2 text-red-500">
                <div className="font-medium">{localizedTexts.requiredResearch}:</div>
                <ul className="list-disc list-inside mt-1">
                  {upgrade.requiredUpgrades?.map((requiredId: string) => (
                    <li key={requiredId}>{getRequiredUpgradeName(requiredId)}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(!upgrade.unlocked && !hasMissingDependencies()) && (
              <div className="mt-2 text-amber-500">
                <div className="font-medium">{localizedTexts.unlockConditions}:</div>
                <div className="mt-1">
                  {upgrade.unlockCondition?.buildings && Object.entries(upgrade.unlockCondition.buildings).map(([buildingId, count]) => (
                    <div key={buildingId}>
                      {state.buildings[buildingId]?.name ?? buildingId}: {String(count)}
                    </div>
                  ))}
                  {upgrade.unlockCondition?.resources && Object.entries(upgrade.unlockCondition.resources).map(([resourceId, amount]) => (
                    <div key={resourceId}>
                      {getResourceName(resourceId)}: {String(amount)}
                    </div>
                  ))}
                  {!upgrade.unlockCondition && localizedTexts.continueDeveloping}
                </div>
              </div>
            )}
            
            {upgrade.specialization && (
              <div className="mt-2 text-purple-600">
                <div className="font-medium">{localizedTexts.specialization}:</div>
                <div className="mt-1">{upgrade.specialization}</div>
              </div>
            )}
            
            {upgrade.tier > 0 && (
              <div className="mt-2 text-gray-500">
                <div className="font-medium">{localizedTexts.technologyLevel}:</div>
                <div className="mt-1">{upgrade.tier}</div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TechTreeNode;
