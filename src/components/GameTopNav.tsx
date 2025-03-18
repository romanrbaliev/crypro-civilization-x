
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SettingsDialog from "./SettingsDialog";

const GameTopNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState("game");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    
    // Если нажали на настройки, открываем диалог
    if (tab === "settings") {
      setSettingsOpen(true);
      // Возвращаем активный таб к предыдущему значению
      return;
    }
  };

  return (
    <>
      <div className="w-full flex border-b">
        <button
          className={`flex-1 py-4 text-center font-medium ${
            activeTab === "howToPlay" ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => handleTabClick("howToPlay")}
        >
          Как играть
        </button>
        <button
          className={`flex-1 py-4 text-center font-medium ${
            activeTab === "reset" ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => handleTabClick("reset")}
        >
          Сбросить прогресс
        </button>
        <button
          className={`flex-1 py-4 text-center font-medium ${
            activeTab === "settings" ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => handleTabClick("settings")}
        >
          Настройки
        </button>
      </div>
      
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};

export default GameTopNav;
