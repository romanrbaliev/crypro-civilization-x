
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import BuildingItem from "./BuildingItem";
import { canAffordBuilding } from "@/utils/buildingUtils";
import { Building } from "lucide-react";
import { t } from "@/localization";

// Интерфейс с onAddEvent
interface EquipmentTabProps {
  onAddEvent?: (message: string, type: string) => void;
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [unlockedBuildings, setUnlockedBuildings] = useState<string[]>([]);

  useEffect(() => {
    // Функция для проверки и разблокировки зданий
    const checkAndUnlockBuildings = () => {
      const newUnlockedBuildings: string[] = [];
      
      for (const buildingId in state.buildings) {
        const building = state.buildings[buildingId];
        if (building.unlocked && !unlockedBuildings.includes(buildingId)) {
          newUnlockedBuildings.push(buildingId);
        }
      }
      
      if (newUnlockedBuildings.length > 0) {
        setUnlockedBuildings(prevUnlockedBuildings => [...prevUnlockedBuildings, ...newUnlockedBuildings]);
      }
    };
    
    // Вызываем проверку при монтировании компонента и при каждом обновлении состояния игры
    checkAndUnlockBuildings();
  }, [state.buildings, unlockedBuildings]);
  
  useEffect(() => {
    // Функция для принудительной проверки разблокировок
    const forceCheckUnlocks = () => {
      dispatch({ type: "FORCE_RESOURCE_UPDATE" });
    };
    
    // Устанавливаем интервал для периодической проверки (каждые 5 секунд)
    const intervalId = setInterval(forceCheckUnlocks, 5000);
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [dispatch]);
  
  // Важное изменение: получаем все здания, которые когда-либо были разблокированы
  // Это гарантирует, что они не исчезнут из интерфейса
  const getAllVisibleBuildings = () => {
    // Объединяем здания, у которых флаг unlocked=true и здания, которые были ранее разблокированы
    const visibleBuildingIds = new Set([
      ...unlockedBuildings,
      ...Object.keys(state.buildings).filter(id => state.buildings[id].unlocked)
    ]);
    
    // Преобразуем ID в объекты зданий
    return Array.from(visibleBuildingIds).map(id => state.buildings[id]);
  };
  
  // Получаем все видимые здания
  const allVisibleBuildings = getAllVisibleBuildings();
  
  // Группируем здания по категориям
  const basicBuildings = allVisibleBuildings.filter(b => 
    ['practice', 'generator', 'cryptoWallet'].includes(b.id)
  );
  
  const computerBuildings = allVisibleBuildings.filter(b => 
    ['homeComputer', 'miningRig', 'internetConnection', 'coolingSystem', 'miner'].includes(b.id)
  );
  
  const advancedBuildings = allVisibleBuildings.filter(b => 
    ['improvedWallet', 'enhancedWallet', 'cryptoLibrary', 'server'].includes(b.id)
  );
  
  // Для отладки выводим в консоль количество видимых зданий
  console.log("EquipmentTab: Всего видимых зданий:", allVisibleBuildings.length);
  console.log("EquipmentTab: Разблокированных ранее:", unlockedBuildings);
  console.log("EquipmentTab: По категориям:", {
    basic: basicBuildings.map(b => b.id),
    computer: computerBuildings.map(b => b.id),
    advanced: advancedBuildings.map(b => b.id)
  });
  
  return (
    <div className="space-y-4">
      {allVisibleBuildings.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Building className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-xs">
            {t("ui.states.empty.buildings")}
          </p>
        </div>
      ) : (
        <>
          {basicBuildings.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-2">{t("ui.states.sections.basicEquipment")}</h2>
              <div className="space-y-1">
                {basicBuildings.map(building => (
                  <BuildingItem 
                    key={building.id} 
                    building={building} 
                    onAddEvent={onAddEvent}
                  />
                ))}
              </div>
            </div>
          )}
          
          {computerBuildings.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-2">{t("ui.states.sections.computerEquipment")}</h2>
              <div className="space-y-1">
                {computerBuildings.map(building => (
                  <BuildingItem 
                    key={building.id} 
                    building={building} 
                    onAddEvent={onAddEvent}
                  />
                ))}
              </div>
            </div>
          )}
          
          {advancedBuildings.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-2">{t("ui.states.sections.advancedEquipment")}</h2>
              <div className="space-y-1">
                {advancedBuildings.map(building => (
                  <BuildingItem 
                    key={building.id} 
                    building={building} 
                    onAddEvent={onAddEvent}
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

export default EquipmentTab;
