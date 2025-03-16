
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";
import { Building, Lightbulb } from "lucide-react";
import EventLog, { GameEvent } from "@/components/EventLog";
import { generateId } from "@/utils/helpers";
import Header from "@/components/Header";
import BuildingsTab from "@/components/BuildingsTab";
import ResearchTab from "@/components/ResearchTab";
import ResourceList from "@/components/ResourceList";
import GameIntro from "@/components/GameIntro";
import { Button } from "@/components/ui/button";
import ActionButtons from "@/components/ActionButtons";

const GameScreen = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(!state.gameStarted);
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState("buildings");
  
  // Проверяем наличие хотя бы одного разблокированного здания (кроме practice)
  const hasUnlockedBuildings = Object.values(state.buildings)
    .some(b => b.unlocked && b.id !== "practice");
    
  // Проверяем наличие хотя бы одного разблокированного исследования
  const hasUnlockedResearch = Object.values(state.upgrades)
    .some(u => u.unlocked);
  
  useEffect(() => {
    if (!state.gameStarted) {
      navigate("/");
    }
  }, [state.gameStarted, navigate]);
  
  const addEvent = (message: string, type: GameEvent["type"] = "info") => {
    const newEvent: GameEvent = {
      id: generateId(),
      timestamp: Date.now(),
      message,
      type
    };
    
    setEventLog(prev => [newEvent, ...prev]);
  };
  
  const handleCloseIntro = () => {
    setShowIntro(false);
    dispatch({ type: "START_GAME" });
    
    addEvent("Добро пожаловать в мир криптовалют! Начните с изучения основ.", "info");
  };
  
  // Выбираем начальную вкладку в зависимости от открытых функций
  useEffect(() => {
    if (hasUnlockedBuildings) {
      setSelectedTab("buildings");
    } else if (hasUnlockedResearch) {
      setSelectedTab("research");
    }
  }, [hasUnlockedBuildings, hasUnlockedResearch]);
  
  const unlockedResources = Object.values(state.resources).filter(r => r.unlocked);
  
  if (showIntro) {
    return <GameIntro onClose={handleCloseIntro} />;
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header prestigePoints={state.prestigePoints} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/5 border-r flex flex-col overflow-hidden">
          {/* Показываем табы только если есть открытые функции */}
          {(hasUnlockedBuildings || hasUnlockedResearch) && (
            <div className="border-b">
              <div className="flex flex-col">
                {hasUnlockedBuildings && (
                  <Button 
                    variant={selectedTab === "buildings" ? "default" : "ghost"} 
                    className="justify-start rounded-none section-title h-6 px-3"
                    onClick={() => setSelectedTab("buildings")}
                  >
                    <Building className="h-3 w-3 mr-2" />
                    Здания
                  </Button>
                )}
                {hasUnlockedResearch && (
                  <Button 
                    variant={selectedTab === "research" ? "default" : "ghost"} 
                    className="justify-start rounded-none section-title h-6 px-3"
                    onClick={() => setSelectedTab("research")}
                  >
                    <Lightbulb className="h-3 w-3 mr-2" />
                    Исследования
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-auto p-2">
            <ResourceList resources={unlockedResources} />
          </div>
        </div>
        
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-2 flex flex-col">
            <div className="flex-1">
              {selectedTab === "buildings" && hasUnlockedBuildings && (
                <BuildingsTab onAddEvent={addEvent} />
              )}
              
              {selectedTab === "research" && hasUnlockedResearch && (
                <ResearchTab onAddEvent={addEvent} />
              )}
            </div>
            
            {/* Кнопки действий всегда видны внизу правой колонки */}
            <ActionButtons onAddEvent={addEvent} />
          </div>
        </div>
      </div>
      
      <div className="h-24 border-t bg-white flex-shrink-0">
        <EventLog events={eventLog} />
      </div>
    </div>
  );
};

export default GameScreen;
