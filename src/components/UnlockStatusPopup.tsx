
import React, { useState, useEffect } from 'react';
import { Unlock } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';
import { debugUnlockStatus } from '@/utils/unlockManager';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const UnlockStatusPopup = () => {
  const { state, forceUpdate } = useGame();
  const [statusSteps, setStatusSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const updateStatus = async () => {
    try {
      setLoading(true);
      
      // Форсируем обновление состояния игры
      forceUpdate();
      
      // Небольшая задержка, чтобы обновление успело применится
      setTimeout(() => {
        try {
          // Получаем отчет о статусе разблокировок
          const result = debugUnlockStatus(state);
          setStatusSteps(result.steps || []);
          
          // Консольный лог для отладки
          console.log("Здания с условиями разблокировки:", 
            unlockRules.filter(r => r.targetType === 'building').map(r => ({
              id: r.targetId,
              conditions: r
            }))
          );
          
          // Проверка статуса ключевых зданий
          console.log("Статус enhancedWallet:", {
            exists: !!state.buildings.enhancedWallet,
            unlocked: state.buildings.enhancedWallet?.unlocked,
            walletLevel: state.buildings.cryptoWallet?.count
          });
          
          console.log("Статус cryptoLibrary:", {
            exists: !!state.buildings.cryptoLibrary,
            unlocked: state.buildings.cryptoLibrary?.unlocked,
            hasUpgrade: state.upgrades.cryptoCurrencyBasics?.purchased
          });
          
          console.log("Статус coolingSystem:", {
            exists: !!state.buildings.coolingSystem,
            unlocked: state.buildings.coolingSystem?.unlocked,
            computerLevel: state.buildings.homeComputer?.count
          });
          
        } catch (error) {
          console.error('Ошибка при анализе разблокировок:', error);
          setStatusSteps(['Произошла ошибка при анализе разблокировок: ' + error]);
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      setLoading(false);
    }
  };
  
  // Обновляем статус при открытии popover
  const handleOpenChange = (open: boolean) => {
    if (open) {
      updateStatus();
    }
  };
  
  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 text-xs gap-1 bg-white"
        >
          <Unlock className="h-3.5 w-3.5" /> 
          Статус разблокировок
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 bg-white rounded-md">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Статус разблокировок контента</h3>
          
          <div className="mt-2 p-2 bg-gray-50 rounded border text-xs text-gray-600 max-h-80 overflow-y-auto whitespace-pre-line">
            {loading ? (
              <div className="text-center py-2">Загрузка данных...</div>
            ) : (
              statusSteps.map((step, index) => (
                <div key={index} className={
                  step.includes('✅') ? 'text-green-600' : 
                  step.includes('❌') ? 'text-red-500' : 
                  step.startsWith('•') ? 'pl-2' :
                  step.startsWith('📊') || step.startsWith('🔓') || step.startsWith('🏗️') || step.startsWith('📚') ? 'font-semibold mt-2' : ''
                }>
                  {step}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-3 flex justify-end">
            <Button 
              variant="secondary" 
              size="sm" 
              className="text-xs" 
              onClick={updateStatus}
            >
              Обновить статус
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Получаем правила разблокировки для консольного лога
const unlockRules = [
  // Правила для ключевых зданий
  { targetId: 'enhancedWallet', targetType: 'building', buildings: [{ id: 'cryptoWallet', minCount: 5 }] },
  { targetId: 'cryptoLibrary', targetType: 'building', upgrades: [{ id: 'cryptoCurrencyBasics', purchased: true }] },
  { targetId: 'coolingSystem', targetType: 'building', buildings: [{ id: 'homeComputer', minCount: 2 }] }
];

export default UnlockStatusPopup;
