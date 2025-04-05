
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isBlockchainBasicsUnlocked } from '@/utils/researchUtils';
import { UnlockService } from '@/services/UnlockService';
import { convertGameState } from '@/utils/typeConverters';

const DebugCalculator = () => {
  const { state, dispatch } = useGame();
  
  // Функция для принудительной проверки разблокировок
  const checkUnlocks = () => {
    dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
  };
  
  // Функция для полной перепроверки разблокировок
  const forceCheckAllUnlocks = () => {
    dispatch({ type: 'FORCE_CHECK_UNLOCKS' });
  };
  
  // Функция для принудительной разблокировки криптокошелька
  const unlockCryptoWallet = () => {
    if (state.buildings.cryptoWallet) {
      const unlockService = new UnlockService();
      // Используем функцию-помощник для преобразования типов и нормализации значений
      const typedState = convertGameState(state);
      unlockService.forceUnlock(typedState, 'cryptoWallet');
      dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
    }
  };
  
  // Функция для принудительной разблокировки основ криптовалют
  const unlockCryptoCurrencyBasics = () => {
    if (state.upgrades.cryptoCurrencyBasics) {
      const unlockService = new UnlockService();
      // Используем функцию-помощник для преобразования типов и нормализации значений
      const typedState = convertGameState(state);
      unlockService.forceUnlock(typedState, 'cryptoBasics');
      dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
    }
  };
  
  return (
    <Card className="w-full max-h-[300px] overflow-auto">
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs h-7"
          onClick={checkUnlocks}
        >
          Проверить разблокировки
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs h-7"
          onClick={forceCheckAllUnlocks}
        >
          Перепроверить все разблокировки
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs h-7"
          onClick={unlockCryptoWallet}
        >
          Разблокировать кошелек
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs h-7"
          onClick={unlockCryptoCurrencyBasics}
        >
          Разблокировать криптовалюты
        </Button>
      </CardContent>
    </Card>
  );
};

export default DebugCalculator;
