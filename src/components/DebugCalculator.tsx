
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isBlockchainBasicsUnlocked } from '@/utils/researchUtils';

const DebugCalculator = () => {
  const { state, dispatch } = useGame();
  
  // Функция для принудительной проверки разблокировок
  const checkUnlocks = () => {
    dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
  };
  
  // Функция для принудительной разблокировки криптокошелька
  const unlockCryptoWallet = () => {
    if (state.buildings.cryptoWallet) {
      dispatch({ 
        type: 'SET_BUILDING_UNLOCKED', 
        payload: { 
          buildingId: 'cryptoWallet', 
          unlocked: true 
        } 
      });
    }
  };
  
  // Функция для принудительной разблокировки основ криптовалют
  const unlockCryptoCurrencyBasics = () => {
    if (state.upgrades.cryptoCurrencyBasics) {
      dispatch({ 
        type: 'SET_UPGRADE_UNLOCKED', 
        payload: { 
          upgradeId: 'cryptoCurrencyBasics', 
          unlocked: true 
        } 
      });
    }
  };
  
  const researchStatus = () => {
    return {
      researchUnlocked: state.unlocks.research === true,
      blockchainBasicsPurchased: isBlockchainBasicsUnlocked(state),
      cryptoCurrencyBasicsUnlocked: state.upgrades.cryptoCurrencyBasics?.unlocked,
      cryptoCurrencyBasicsPurchased: state.upgrades.cryptoCurrencyBasics?.purchased,
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
