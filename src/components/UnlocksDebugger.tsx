
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { debugUnlockStatus } from '@/utils/unlockManager';
import { 
  getUnlockedBuildingsByGroup, 
  getUnlockedUpgradesByGroup 
} from '@/utils/researchUtils';

const UnlocksDebugger: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const [debugInfo, setDebugInfo] = React.useState<{
    unlocked: string[],
    locked: string[],
    steps: string[]
  }>({ unlocked: [], locked: [], steps: [] });
  
  const [isOpen, setIsOpen] = React.useState(false);
  
  const checkUnlocks = () => {
    const result = debugUnlockStatus(state);
    setDebugInfo({
      unlocked: result.unlocked || [],
      locked: result.locked || [],
      steps: result.steps || []
    });
    
    // Дополнительно проверяем проблемные здания в консоли
    console.log("UnlocksDebugger: Проверка статуса ключевых зданий");
    
    console.log("enhancedWallet (Улучшенный кошелек):", {
      exists: !!state.buildings.enhancedWallet,
      unlocked: state.buildings.enhancedWallet?.unlocked,
      count: state.buildings.enhancedWallet?.count,
      cryptoWalletLevel: state.buildings.cryptoWallet?.count,
      conditionMet: state.buildings.cryptoWallet?.count >= 5
    });
    
    console.log("cryptoLibrary (Криптобиблиотека):", {
      exists: !!state.buildings.cryptoLibrary,
      unlocked: state.buildings.cryptoLibrary?.unlocked,
      count: state.buildings.cryptoLibrary?.count,
      cryptoBasicsPurchased: state.upgrades.cryptoCurrencyBasics?.purchased,
      conditionMet: state.upgrades.cryptoCurrencyBasics?.purchased === true
    });
    
    console.log("coolingSystem (Система охлаждения):", {
      exists: !!state.buildings.coolingSystem,
      unlocked: state.buildings.coolingSystem?.unlocked,
      count: state.buildings.coolingSystem?.count,
      homeComputerLevel: state.buildings.homeComputer?.count,
      conditionMet: state.buildings.homeComputer?.count >= 2
    });
    
    console.log("cryptoCommunity (Крипто-сообщество):", {
      exists: !!state.upgrades.cryptoCommunity,
      unlocked: state.upgrades.cryptoCommunity?.unlocked,
      purchased: state.upgrades.cryptoCommunity?.purchased,
      usdtAmount: state.resources.usdt?.value,
      cryptoBasicsPurchased: state.upgrades.cryptoCurrencyBasics?.purchased,
      conditionMet: state.resources.usdt?.value >= 30 && state.upgrades.cryptoCurrencyBasics?.purchased === true
    });
  };
  
  // Автоматически обновляем данные при открытии окна
  React.useEffect(() => {
    if (isOpen) {
      checkUnlocks();
    }
  }, [isOpen, state]);
  
  // Принудительно проверяем все разблокировки
  const forceCheckAll = () => {
    console.log("UnlocksDebugger: Принудительная проверка разблокировок");
    dispatch({ type: "FORCE_RESOURCE_UPDATE" });
    setTimeout(() => {
      checkUnlocks();
    }, 100);
  };
  
  // Получаем информацию о разблокированных элементах
  const advancedBuildings = React.useMemo(() => {
    if (!isOpen) return null;
    
    // Список продвинутых зданий
    const advancedBuildingsList = ['miner', 'cryptoLibrary', 'coolingSystem', 'enhancedWallet'];
    const unlockedBuildings = getUnlockedBuildingsByGroup(state, advancedBuildingsList);
    
    // Список продвинутых исследований
    const advancedUpgradesList = [
      'cryptoCurrencyBasics', 
      'algorithmOptimization', 
      'proofOfWork', 
      'energyEfficientComponents', 
      'cryptoTrading', 
      'tradingBot'
    ];
    const unlockedUpgrades = getUnlockedUpgradesByGroup(state, advancedUpgradesList);
    
    return {
      unlockedBuildings,
      unlockedUpgrades
    };
  }, [isOpen, state]);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2 text-gray-500 text-xs">
          🔍 Отладка разблокировок
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Отладка разблокировок контента</DialogTitle>
          <DialogDescription>
            Статус разблокировки элементов контента в игре.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 mb-3">
          <div className="flex-1">
            <h4 className="font-medium mb-2 text-sm">Разблокированные элементы:</h4>
            <ul className="text-xs text-green-600">
              {debugInfo.unlocked.map((item, index) => (
                <li key={index}>✅ {item}</li>
              ))}
            </ul>
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-2 text-sm">Заблокированные элементы:</h4>
            <ul className="text-xs text-gray-400">
              {debugInfo.locked.map((item, index) => (
                <li key={index}>❌ {item}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Информация о продвинутых зданиях и исследованиях */}
        {advancedBuildings && (
          <div className="border-t pt-3 mt-2">
            <h4 className="font-medium mb-2">Продвинутый контент</h4>
            
            <div className="text-xs mb-2">
              <strong>Продвинутые здания:</strong>
              <ul className="ml-4">
                {['miner', 'cryptoLibrary', 'coolingSystem', 'enhancedWallet'].map(building => (
                  <li key={building} className={advancedBuildings.unlockedBuildings.includes(building) ? "text-green-600" : "text-gray-400"}>
                    {advancedBuildings.unlockedBuildings.includes(building) ? "✅" : "❌"} {building}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-xs">
              <strong>Продвинутые исследования:</strong>
              <ul className="ml-4">
                {['cryptoCurrencyBasics', 'algorithmOptimization', 'proofOfWork', 'energyEfficientComponents', 'cryptoTrading', 'tradingBot'].map(upgrade => (
                  <li key={upgrade} className={advancedBuildings.unlockedUpgrades.includes(upgrade) ? "text-green-600" : "text-gray-400"}>
                    {advancedBuildings.unlockedUpgrades.includes(upgrade) ? "✅" : "❌"} {upgrade}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 rounded p-3 mt-3 text-xs text-gray-600 max-h-60 overflow-y-auto">
          <h4 className="font-medium mb-2">Подробный отчет:</h4>
          {debugInfo.steps.map((step, index) => (
            <div 
              key={index} 
              className={
                step.includes("✅") ? "text-green-600" :
                step.includes("❌") ? "text-red-500" :
                step.startsWith("•") ? "pl-2" :
                ""
              }
            >
              {step}
            </div>
          ))}
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" size="sm" onClick={checkUnlocks} className="mr-2">
            Обновить данные
          </Button>
          <Button size="sm" onClick={forceCheckAll}>
            Принудительная проверка
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnlocksDebugger;
