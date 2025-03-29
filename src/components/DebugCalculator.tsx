
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { isBlockchainBasicsPurchased } from '@/utils/researchUtils';

const DebugCalculator = () => {
  const { state, dispatch } = useGame();
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  useEffect(() => {
    // Получение информации о состоянии игры для отладки
    const blockchainBasicsPurchased = isBlockchainBasicsPurchased(state);
    const cryptoWalletUnlocked = state.buildings.cryptoWallet?.unlocked || false;
    
    const debugText = `
      Основы блокчейна изучены: ${blockchainBasicsPurchased}
      Криптокошелек разблокирован: ${cryptoWalletUnlocked}
      Количество знаний: ${state.resources.knowledge?.value.toFixed(2) || 0}
      Макс. знаний: ${state.resources.knowledge?.max.toFixed(2) || 0}
      Производство знаний: ${state.resources.knowledge?.baseProduction.toFixed(3) || 0}/сек
    `;
    
    setDebugInfo(debugText);
  }, [state]);
  
  return (
    <div className="border rounded p-2 my-2 bg-gray-50 text-xs">
      <h3 className="font-bold mb-1">Отладочная информация:</h3>
      <pre className="whitespace-pre-wrap text-[9px]">{debugInfo}</pre>
      
      <div className="mt-2 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[9px]"
          onClick={() => {
            // Принудительно разблокируем криптокошелек
            dispatch({
              type: "SET_BUILDING_UNLOCKED",
              payload: { buildingId: "cryptoWallet", unlocked: true }
            });
            console.log("Принудительно разблокирован криптокошелек!");
          }}
        >
          Разблокировать кошелек
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[9px]"
          onClick={() => {
            // Проверяем все разблокировки
            dispatch({ type: "FORCE_RESOURCE_UPDATE" });
            console.log("Принудительное обновление ресурсов и разблокировок!");
          }}
        >
          Обновить разблокировки
        </Button>
      </div>
    </div>
  );
};

export default DebugCalculator;
