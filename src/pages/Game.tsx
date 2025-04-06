
import React, { useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { useTranslation } from "@/i18n";
import { useResourceManager } from "@/hooks/useResourceManager";
import GameScreen from "@/pages/GameScreen";

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
  
  return <GameScreen />;
};

export default Game;
