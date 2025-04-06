
import React from 'react';
import { useGameUpdater } from './hooks/useGameUpdater';

/**
 * Компонент-контейнер для обработки состояния игры
 * Используется для централизованного управления обновлениями и сохранениями
 */
export const GameStateHandler: React.FC = () => {
  // Инициализируем хук обновления состояния
  useGameUpdater();
  
  // Не отображаем ничего, только управляем состоянием
  return null;
};

export default GameStateHandler;
