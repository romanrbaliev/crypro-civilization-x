
import React, { useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import MainLayout from "@/layouts/MainLayout";
import ResourcesPanel from "@/components/panels/ResourcesPanel";
import ActionsPanel from "@/components/panels/ActionsPanel";
import BuildingsPanel from "@/components/panels/BuildingsPanel";
import EventsPanel from "@/components/panels/EventsPanel";
import { useTranslation } from "@/i18n";
import { useResourceManager } from "@/hooks/useResourceManager";

const Game: React.FC = () => {
  const { state } = useGame();
  const { t } = useTranslation();
  const { recalculateProduction } = useResourceManager();
  
  // Принудительно пересчитываем производство при первом рендере
  useEffect(() => {
    if (state.gameStarted) {
      console.log("Game: Пересчет производства ресурсов при загрузке страницы");
      recalculateProduction();
    }
  }, [state.gameStarted, recalculateProduction]);
  
  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="col-span-1">
          <ResourcesPanel />
          <div className="h-4"></div>
          <ActionsPanel />
        </div>
        <div className="col-span-1 md:col-span-2">
          <BuildingsPanel />
          <div className="h-4"></div>
          <EventsPanel />
        </div>
      </div>
    </MainLayout>
  );
};

export default Game;
