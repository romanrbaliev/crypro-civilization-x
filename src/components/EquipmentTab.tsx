
import React, { useEffect, useState } from "react";
import { useGame } from "@/context/hooks/useGame";
import BuildingItem from "./BuildingItem";
import { getCategoryBuildings, isUnlockedBuilding } from "@/utils/buildingUtils";
import { Building } from "lucide-react";
import { t } from "@/localization";

// Определяем правильный тип для BuildingItem, без onAddEvent
// поскольку в компоненте BuildingItem этого свойства нет
interface EquipmentTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [unlockedBuildings, setUnlockedBuildings] = useState<string[]>([]);
  
  // Проверяем при каждом изменении состояния игры, какие здания разблокированы
  useEffect(() => {
    // Получаем список разблокированных ID зданий
    const unlocked = Object.values(state.buildings)
      .filter(building => building.unlocked)
      .map(building => building.id);
    
    setUnlockedBuildings(unlocked);
    console.log("EquipmentTab: Разблокированные здания:", unlocked);
    
    // Принудительно проверяем есть ли проблемные здания, которые уже должны быть разблокированы
    const shouldCheckBuildings = ['enhancedWallet', 'cryptoLibrary', 'coolingSystem'];
    for (const id of shouldCheckBuildings) {
      if (!unlocked.includes(id)) {
        // Проверяем условия для каждого здания
        if (id === 'enhancedWallet' && state.buildings.cryptoWallet?.count >= 5) {
          console.log(`EquipmentTab: ${id} должен быть разблокирован (кошелек: ${state.buildings.cryptoWallet.count})`);
          if (state.buildings[id]) {
            dispatch({ 
              type: "SET_BUILDING_UNLOCKED", 
              payload: { buildingId: id, unlocked: true } 
            });
          }
        } else if (id === 'cryptoLibrary' && state.upgrades.cryptoCurrencyBasics?.purchased) {
          console.log(`EquipmentTab: ${id} должен быть разблокирован (основы крипты: куплены)`);
          if (state.buildings[id]) {
            dispatch({ 
              type: "SET_BUILDING_UNLOCKED", 
              payload: { buildingId: id, unlocked: true } 
            });
          }
        } else if (id === 'coolingSystem' && state.buildings.homeComputer?.count >= 2) {
          console.log(`EquipmentTab: ${id} должен быть разблокирован (компьютер: ${state.buildings.homeComputer.count})`);
          if (state.buildings[id]) {
            dispatch({ 
              type: "SET_BUILDING_UNLOCKED", 
              payload: { buildingId: id, unlocked: true } 
            });
          }
        }
      }
    }
  }, [state.buildings, state.upgrades, dispatch]);
  
  // Получаем все здания в каждой категории
  const basicBuildings = getCategoryBuildings(state, ["practice", "generator"]);
  const productionBuildings = getCategoryBuildings(state, ["cryptoWallet", "homeComputer", "internetChannel"]);
  const advancedBuildings = getCategoryBuildings(state, ["miner", "cryptoLibrary", "coolingSystem", "enhancedWallet"]);
  
  // Проверяем, есть ли разблокированные здания
  const hasUnlockedBuildings = unlockedBuildings.length > 0;
  
  // Принудительно проверяем наличие каждого проблемного здания
  useEffect(() => {
    const criticalBuildings = {
      enhancedWallet: 'Улучшенный кошелек',
      cryptoLibrary: 'Криптобиблиотека',
      coolingSystem: 'Система охлаждения'
    };
    
    Object.entries(criticalBuildings).forEach(([id, name]) => {
      const building = state.buildings[id];
      
      if (building) {
        console.log(`EquipmentTab: ${name} (${id}): unlocked=${building.unlocked}, в списке=${unlockedBuildings.includes(id)}`);
        
        // Если здание существует, но не разблокировано, и должно быть разблокировано
        if (!building.unlocked) {
          if (id === 'enhancedWallet' && state.buildings.cryptoWallet?.count >= 5) {
            console.log(`EquipmentTab: ${id} должен быть принудительно разблокирован`);
            dispatch({ 
              type: "SET_BUILDING_UNLOCKED", 
              payload: { buildingId: id, unlocked: true } 
            });
          } else if (id === 'cryptoLibrary' && state.upgrades.cryptoCurrencyBasics?.purchased) {
            console.log(`EquipmentTab: ${id} должен быть принудительно разблокирован`);
            dispatch({ 
              type: "SET_BUILDING_UNLOCKED", 
              payload: { buildingId: id, unlocked: true } 
            });
          } else if (id === 'coolingSystem' && state.buildings.homeComputer?.count >= 2) {
            console.log(`EquipmentTab: ${id} должен быть принудительно разблокирован`);
            dispatch({ 
              type: "SET_BUILDING_UNLOCKED", 
              payload: { buildingId: id, unlocked: true } 
            });
          }
        }
      } else {
        console.log(`EquipmentTab: ${name} (${id}) не найден в state.buildings`);
      }
    });
  }, [state.buildings, state.upgrades, unlockedBuildings, dispatch]);
  
  if (!hasUnlockedBuildings) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Building className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="text-xs">
          {t("ui.states.empty.buildings")}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Базовые здания */}
      {basicBuildings.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-2">{t("ui.states.sections.basicEquipment")}</h2>
          <div className="space-y-1">
            {basicBuildings.map(building => (
              <BuildingItem 
                key={building.id} 
                building={building} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Здания производства */}
      {productionBuildings.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-2">{t("ui.states.sections.productionEquipment")}</h2>
          <div className="space-y-1">
            {productionBuildings.map(building => (
              <BuildingItem 
                key={building.id} 
                building={building} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Продвинутые здания */}
      {advancedBuildings.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-2">{t("ui.states.sections.advancedEquipment")}</h2>
          <div className="space-y-1">
            {advancedBuildings.map(building => (
              <BuildingItem 
                key={building.id} 
                building={building} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentTab;
