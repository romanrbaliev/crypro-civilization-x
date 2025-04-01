
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useToast } from "@/components/ui/use-toast";
import { Game } from '@/components/Game';

const GameScreen: React.FC = () => {
  const { state } = useGame();
  const { toast } = useToast();

  // Проверяем, что игра запущена
  if (!state.gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Игра не запущена</h2>
          <p className="mb-4">Пожалуйста, вернитесь на главную страницу и начните игру</p>
          <a href="/" className="text-blue-500 hover:underline">Вернуться на главную</a>
        </div>
      </div>
    );
  }

  return <Game />;
};

export default GameScreen;
