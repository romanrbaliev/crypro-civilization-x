
// Добавляем типы для глобальных переменных окружения
/// <reference types="vite/client" />

interface Window {
  gameEventBus: EventTarget;
  TelegramWebviewProxy: any;
  Telegram: {
    WebApp: any;
  };
  __uv: string; // user version
  __av: string; // app version
  __game_user_id?: string; // кэшированный ID пользователя
}

// Глобальные типы для использования в приложении
declare type ProductionType = "click" | "auto";
declare type ResourceType = "knowledge" | "usdt" | "computingPower" | "electricity" | "reputation" | "btc";
declare type BuildingType = "practice" | "generator" | "computer" | "wallet" | "miner" | "internetConnection" | "storageServer" | "tradingBot" | "analyticCenter" | "dataCenter" | "marketplace";
declare type UpgradeCategory = "basic" | "intermediate" | "advanced" | "specialized" | "prestige";
declare type SpecializationType = "investor" | "trader" | "miner" | "influencer" | "analyst" | "founder" | "arbitrageur";

// Глобальные утилиты
declare const __DEV__: boolean;
