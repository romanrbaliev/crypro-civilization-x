
import React from "react";
import { Button } from "@/components/ui/button";
import { BitcoinIcon } from "lucide-react";

interface GameIntroProps {
  onClose: () => void;
}

const GameIntro: React.FC<GameIntroProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto text-center">
        <BitcoinIcon className="h-16 w-16 text-amber-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Добро пожаловать в Crypto Civilization!</h1>
        <p className="text-lg mb-8">
          Вы начинаете свой путь в мире криптовалют как энтузиаст, делающий первые шаги.
          Постепенно вы будете развивать свои знания, инфраструктуру и влияние, чтобы создать целую криптоцивилизацию!
        </p>
        
        <div className="space-y-4 text-left mb-8 bg-gray-50 p-4 rounded-lg w-full">
          <h2 className="font-semibold text-lg">Ваши первые шаги:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Нажимайте на кнопку "Изучить крипту", чтобы получать знания о криптовалютах</li>
            <li>Когда накопите 10 единиц знаний, вы сможете применить их и получить USDT</li>
            <li>Используйте USDT для строительства зданий, автоматизирующих получение ресурсов</li>
            <li>Постепенно открывайте новые механики, здания и исследования</li>
          </ol>
        </div>
        
        <Button size="lg" onClick={onClose}>
          Начать свой путь
        </Button>
      </div>
    </div>
  );
};

export default GameIntro;
