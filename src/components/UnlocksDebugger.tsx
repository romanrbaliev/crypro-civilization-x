
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
import { debugUnlockStatus } from '@/utils/debugCalculator';
import { isPhase2Unlocked, getUnlockedPhase2Buildings, getUnlockedPhase2Upgrades } from '@/utils/researchUtils';

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
    setDebugInfo(result);
  };
  
  // Автоматически обновляем данные при открытии окна
  React.useEffect(() => {
    if (isOpen) {
      checkUnlocks();
    }
  }, [isOpen, state]);
  
  // Принудительно проверяем все разблокировки
  const forceCheckAll = () => {
    dispatch({ type: "FORCE_RESOURCE_UPDATE" });
    setTimeout(() => {
      checkUnlocks();
    }, 100);
  };
  
  // Дополнительная информация о фазе 2
  const phase2Info = React.useMemo(() => {
    if (!isOpen) return null;
    
    const phase2Unlocked = isPhase2Unlocked(state);
    const unlockedBuildings = getUnlockedPhase2Buildings(state);
    const unlockedUpgrades = getUnlockedPhase2Upgrades(state);
    
    return {
      phase2Unlocked,
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
        
        {/* Информация о фазе 2 */}
        {phase2Info && (
          <div className="border-t pt-3 mt-2">
            <h4 className="font-medium mb-2">Фаза 2: {state.phase >= 2 ? "Активна" : "Неактивна"}</h4>
            <p className="text-xs mb-2">
              Условия для фазы 2 {phase2Info.phase2Unlocked ? "выполнены" : "не выполнены"}
              {phase2Info.phase2Unlocked && state.phase < 2 && " (требуется обновление)"}
            </p>
            
            <div className="text-xs mb-2">
              <strong>Здания фазы 2:</strong>
              <ul className="ml-4">
                {['miner', 'cryptoLibrary', 'coolingSystem', 'enhancedWallet'].map(building => (
                  <li key={building} className={phase2Info.unlockedBuildings.includes(building) ? "text-green-600" : "text-gray-400"}>
                    {phase2Info.unlockedBuildings.includes(building) ? "✅" : "❌"} {building}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-xs">
              <strong>Исследования фазы 2:</strong>
              <ul className="ml-4">
                {['cryptoCurrencyBasics', 'algorithmOptimization', 'proofOfWork', 'energyEfficientComponents', 'cryptoTrading', 'tradingBot'].map(upgrade => (
                  <li key={upgrade} className={phase2Info.unlockedUpgrades.includes(upgrade) ? "text-green-600" : "text-gray-400"}>
                    {phase2Info.unlockedUpgrades.includes(upgrade) ? "✅" : "❌"} {upgrade}
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
