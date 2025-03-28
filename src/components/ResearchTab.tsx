
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import UpgradeItem from "./UpgradeItem";
import { Beaker } from "lucide-react";
import { Upgrade } from "@/context/types";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  
  // Проверяем состояние флага research в unlocks
  const researchUnlocked = state.unlocks.research === true;
  
  // Определяем базовое исследование
  const isInitialResearch = (upgradeId: string) => {
    return upgradeId === 'basicBlockchain' || 
           upgradeId === 'blockchain_basics' || 
           upgradeId === 'blockchainBasics';
  };
  
  // Проверяем, куплены ли "Основы блокчейна"
  const basicBlockchainPurchased = Object.entries(state.upgrades)
    .some(([_, upgrade]) => 
      isInitialResearch(upgrade.id) && upgrade.purchased
    );
  
  // Фильтруем доступные исследования с явным приведением типов
  const unlockedUpgrades = Object.entries(state.upgrades)
    .filter(([_, upgrade]) => {
      // Если исследования еще не разблокированы, не показываем ничего
      if (!researchUnlocked) return false;
      
      // Если это "Основы блокчейна", показываем когда разблокировано исследование
      if (isInitialResearch(upgrade.id)) return upgrade.unlocked && !upgrade.purchased;
      
      // Если "Основы блокчейна" не куплены, скрываем все остальные исследования
      if (!basicBlockchainPurchased) return false;
      
      // Проверяем, есть ли у исследования требования к другим исследованиям
      if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
        // Проверяем, все ли требуемые исследования куплены
        return upgrade.requiredUpgrades.every(
          reqId => state.upgrades[reqId] && state.upgrades[reqId].purchased
        ) && upgrade.unlocked && !upgrade.purchased;
      }
      
      // Проверяем требования в другом формате
      if (upgrade.requirements) {
        const requiredUpgrades = Object.keys(upgrade.requirements)
                                  .filter(key => !key.includes('Count') && state.upgrades[key]);
        
        if (requiredUpgrades.length > 0) {
          return requiredUpgrades.every(
            reqId => state.upgrades[reqId] && state.upgrades[reqId].purchased
          ) && upgrade.unlocked && !upgrade.purchased;
        }
      }
      
      // Для исследований без требований, проверяем специальные правила
      
      // "Основы криптовалют" должны появиться после покупки "Основы блокчейна"
      if (upgrade.id === 'cryptoCurrencyBasics') {
        return basicBlockchainPurchased && upgrade.unlocked && !upgrade.purchased;
      }
      
      // "Безопасность криптокошельков" появляется после покупки криптокошелька
      if (upgrade.id === 'walletSecurity') {
        return state.buildings.cryptoWallet && 
               state.buildings.cryptoWallet.count > 0 && 
               upgrade.unlocked && 
               !upgrade.purchased;
      }
      
      // "Оптимизация алгоритмов" появляется после покупки автомайнера
      if (upgrade.id === 'algorithmOptimization') {
        return state.buildings.autoMiner && 
               state.buildings.autoMiner.count > 0 && 
               upgrade.unlocked && 
               !upgrade.purchased;
      }
      
      return false;
    })
    .map(([_, upgrade]) => upgrade as Upgrade);
  
  // Купленные исследования с явным приведением типов
  const purchasedUpgrades = Object.entries(state.upgrades)
    .filter(([_, upgrade]) => upgrade.purchased)
    .map(([_, upgrade]) => upgrade as Upgrade);
  
  // Если исследования не разблокированы, показываем пустой экран
  if (!researchUnlocked) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Beaker className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="text-xs">
          Исследования пока недоступны.<br />
          Продолжайте развиваться для открытия новых технологий.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {unlockedUpgrades.length === 0 && purchasedUpgrades.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Beaker className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-xs">
            Исследования пока недоступны.<br />
            Продолжайте развиваться для открытия новых технологий.
          </p>
        </div>
      ) : (
        <>
          {unlockedUpgrades.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-medium mb-2">Доступные исследования</h2>
              <div className="space-y-1">
                {unlockedUpgrades.map(upgrade => (
                  <UpgradeItem 
                    key={upgrade.id} 
                    upgrade={upgrade} 
                    onPurchase={() => onAddEvent(`Завершено исследование: ${upgrade.name}`, "success")} 
                  />
                ))}
              </div>
            </div>
          )}
          
          {purchasedUpgrades.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-2">Завершенные исследования</h2>
              <div className="space-y-1">
                {purchasedUpgrades.map(upgrade => (
                  <UpgradeItem 
                    key={upgrade.id} 
                    upgrade={upgrade} 
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResearchTab;
