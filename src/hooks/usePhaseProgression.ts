
import { useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Хук для отслеживания и управления прогрессией фаз игры
 */
export function usePhaseProgression() {
  const { state, dispatch } = useGame();

  // Проверка условий разблокировки для Фазы 2
  useEffect(() => {
    // Проверка разблокировки "Домашний компьютер" когда есть 10 электричества
    if (
      state.resources.electricity && 
      state.resources.electricity.unlocked && 
      state.resources.electricity.value >= 10 &&
      state.buildings.homeComputer && 
      !state.buildings.homeComputer.unlocked
    ) {
      dispatch({ 
        type: "SET_BUILDING_UNLOCKED", 
        payload: { buildingId: "homeComputer", unlocked: true } 
      });
      safeDispatchGameEvent(
        "Доступен для покупки Домашний компьютер! Производит вычислительную мощность.", 
        "success"
      );
    }

    // Проверка разблокировки "Автомайнер" когда есть 50 вычислительной мощности
    if (
      state.resources.computingPower && 
      state.resources.computingPower.unlocked && 
      state.resources.computingPower.value >= 50 &&
      state.buildings.autoMiner && 
      !state.buildings.autoMiner.unlocked
    ) {
      dispatch({ 
        type: "SET_BUILDING_UNLOCKED", 
        payload: { buildingId: "autoMiner", unlocked: true } 
      });
      safeDispatchGameEvent(
        "Доступен для покупки Автомайнер! Автоматизирует добычу BTC.", 
        "success"
      );
    }

    // Проверка разблокировки "Интернет-канал" когда есть 45 USDT
    if (
      state.resources.usdt && 
      state.resources.usdt.unlocked && 
      state.resources.usdt.value >= 45 &&
      state.buildings.internetConnection && 
      !state.buildings.internetConnection.unlocked
    ) {
      dispatch({ 
        type: "SET_BUILDING_UNLOCKED", 
        payload: { buildingId: "internetConnection", unlocked: true } 
      });
      safeDispatchGameEvent(
        "Доступен для покупки Интернет-канал! Ускоряет получение знаний.", 
        "success"
      );
    }

    // Проверка разблокировки "Криптокошелек" после покупки исследования "Основы блокчейна"
    const hasBlockchainBasics = 
      (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased) ||
      (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased);
      
    if (
      hasBlockchainBasics && 
      state.buildings.cryptoWallet && 
      !state.buildings.cryptoWallet.unlocked
    ) {
      dispatch({ 
        type: "SET_BUILDING_UNLOCKED", 
        payload: { buildingId: "cryptoWallet", unlocked: true } 
      });
      safeDispatchGameEvent(
        "Доступен для покупки Криптокошелек! Увеличивает максимальное хранение USDT и знаний.", 
        "success"
      );
    }

    // Проверка разблокировки исследования "Безопасность криптокошельков" после покупки Криптокошелька
    if (
      state.buildings.cryptoWallet && 
      state.buildings.cryptoWallet.count > 0 &&
      state.upgrades.walletSecurity && 
      !state.upgrades.walletSecurity.unlocked
    ) {
      dispatch({
        type: "PURCHASE_UPGRADE",
        payload: { upgradeId: "walletSecurity", markAsUnlocked: true }
      });
      safeDispatchGameEvent(
        "Доступно новое исследование: Безопасность криптокошельков", 
        "info"
      );
    }

    // Обновление фазы на Фазу 2, когда откроются основные механики
    if (
      state.phase === 1 && 
      state.resources.electricity && 
      state.resources.electricity.unlocked && 
      state.resources.computingPower && 
      state.resources.computingPower.unlocked
    ) {
      dispatch({
        type: "UPDATE_PHASE",
        payload: { phase: 2 }
      });
      safeDispatchGameEvent(
        "Достигнута Фаза 2: Основы криптоэкономики! Развивайте инфраструктуру и накапливайте ресурсы.", 
        "achievement"
      );
    }
  }, [state, dispatch]);

  return { phase: state.phase };
}
