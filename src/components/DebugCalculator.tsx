
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isBlockchainBasicsUnlocked } from '@/utils/researchUtils';
import { getUnlocksFromState } from '@/utils/unlockHelper';

const DebugCalculator = () => {
  const { state, dispatch } = useGame();
  
  // Получаем объект unlocks для обратной совместимости
  const unlocks = state.unlocks || getUnlocksFromState(state);
  
  // Функция для принудительной проверки разблокировок
  const checkUnlocks = () => {
    dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
  };
  
  // Функция для принудительной разблокировки криптокошелька
  const unlockCryptoWallet = () => {
    if (state.buildings.cryptoWallet) {
      dispatch({ 
        type: 'UPDATE_BUILDING', 
        payload: { 
          buildingId: 'cryptoWallet', 
          updates: { unlocked: true }
        } 
      });
    }
  };
  
  // Функция для принудительной разблокировки основ криптовалют
  const unlockCryptoCurrencyBasics = () => {
    if (state.upgrades.cryptoBasics) {
      dispatch({ 
        type: 'UPDATE_UPGRADE', 
        payload: { 
          upgradeId: 'cryptoBasics', 
          updates: { unlocked: true }
        } 
      });
    }
  };
  
  const researchStatus = () => {
    return {
      researchUnlocked: Object.values(state.upgrades).some(u => u.unlocked || u.purchased),
      blockchainBasicsPurchased: isBlockchainBasicsUnlocked(state),
      cryptoCurrencyBasicsUnlocked: state.upgrades.cryptoBasics?.unlocked,
      cryptoCurrencyBasicsPurchased: state.upgrades.cryptoBasics?.purchased,
      cryptoWalletUnlocked: state.buildings.cryptoWallet?.unlocked,
      cryptoWalletCount: state.buildings.cryptoWallet?.count || 0
    };
  };
  
  const status = researchStatus();
  
  return (
    <Card className="w-full max-h-[300px] overflow-auto">
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Отладка разблокировок</CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p>Вкладка исследований: {status.researchUnlocked ? '✅' : '❌'}</p>
            <p>Основы блокчейна: {status.blockchainBasicsPurchased ? '✅' : '❌'}</p>
            <p>Криптокошелек разблокирован: {status.cryptoWalletUnlocked ? '✅' : '❌'}</p>
            <p>Криптокошелеков куплено: {status.cryptoWalletCount}</p>
            <p>Основы криптовалют разблокированы: {status.cryptoCurrencyBasicsUnlocked ? '✅' : '❌'}</p>
            <p>Основы криптовалют изучены: {status.cryptoCurrencyBasicsPurchased ? '✅' : '❌'}</p>
          </div>
          <div className="space-y-1">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugCalculator;
