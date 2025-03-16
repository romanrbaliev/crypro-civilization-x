
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building, Lightbulb } from "lucide-react";
import EventLog, { GameEvent } from "@/components/EventLog";
import { generateId } from "@/utils/helpers";
import Header from "@/components/Header";
import BuildingsTab from "@/components/BuildingsTab";
import ResearchTab from "@/components/ResearchTab";
import ResourceList from "@/components/ResourceList";
import GameIntro from "@/components/GameIntro";
import ActionButtons from "@/components/ActionButtons";

const GameScreen = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(!state.gameStarted);
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState("buildings");
  
  // Проверяем, есть ли разблокированные здания и исследования
  const hasBuildingsUnlocked = Object.values(state.buildings).some(
    b => b.unlocked && b.id !== "practice"
  );
  
  const hasResearchUnlocked = Object.values(state.upgrades).some(
    u => u.unlocked && !u.purchased
  );
  
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
  
  const unlockedResources = Object.values(state.resources).filter(r => r.unlocked);
  
  if (showIntro) {
    return <GameIntro onClose={handleCloseIntro} />;
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header prestigePoints={state.prestigePoints} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Левая колонка: Здания и Исследования */}
        <div className="w-7/12 flex flex-col overflow-hidden border-r">
          <div className="border-b flex">
            {hasBuildingsUnlocked && (
              <Button 
                variant={selectedTab === "buildings" ? "default" : "ghost"} 
                className="justify-start rounded-none section-title h-6 px-3"
                onClick={() => setSelectedTab("buildings")}
              >
                <Building className="h-3 w-3 mr-2" />
                Здания
              </Button>
            )}
            {hasResearchUnlocked && (
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
          
          <div className="flex-1 overflow-auto p-2">
            {selectedTab === "buildings" && hasBuildingsUnlocked && (
              <BuildingsTab onAddEvent={addEvent} />
            )}
            
            {selectedTab === "research" && hasResearchUnlocked && (
              <ResearchTab onAddEvent={addEvent} />
            )}
          </div>
        </div>
        
        {/* Правая колонка: Ресурсы и Действия */}
        <div className="w-5/12 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-2">
            <ResourceList resources={unlockedResources} />
          </div>
          
          <div className="action-buttons-container">
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
