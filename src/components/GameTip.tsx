
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, LightbulbIcon } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';

interface GameTipProps {
  className?: string;
}

const GameTip: React.FC<GameTipProps> = ({ className }) => {
  const { state } = useGame();
  const [currentTip, setCurrentTip] = useState<string>('');
  const [showTip, setShowTip] = useState<boolean>(true);
  
  // Список подсказок в зависимости от прогресса игры
  const tips = [
    'Нажмите "Изучить" для получения знаний.',
    'Обменивайте накопленные знания на USDT, нажимая "Применить".',
    'Покупайте здания для автоматического получения ресурсов.',
    'Генератор производит электричество, необходимое для работы компьютеров.',
    'Компьютеры генерируют вычислительную мощность, которую можно использовать для майнинга.',
    'Исследования дают постоянные бонусы к производству ресурсов.',
    'Криптокошелек увеличивает максимальное количество хранимых USDT.',
    'Система охлаждения снижает энергопотребление компьютеров.',
    'Майнеры автоматически добывают Bitcoin, используя вычислительную мощность.',
    'Биткоины можно обменять на USDT по рыночному курсу.'
  ];
  
  // Подсказки для конкретных этапов игры
  const contextualTips: { [key: string]: string } = {
    noBuildings: 'Пора приобрести ваше первое здание! Нажмите на вкладку "Здания".',
    lowElectricity: 'У вас мало электричества. Рассмотрите возможность покупки дополнительных генераторов.',
    researchAvailable: 'Доступны новые исследования! Перейдите на вкладку "Исследования".',
    miningPossible: 'У вас есть вычислительная мощность. Попробуйте майнинг, нажав "Майнить".',
    btcExchangeAvailable: 'У вас есть Bitcoin! Обменяйте их на USDT, нажав "Обменять BTC".'
  };
  
  // Определение контекстуальной подсказки на основе состояния игры
  const getContextualTip = () => {
    const { resources, buildings, upgrades, unlocks } = state;
    
    if (Object.values(buildings).every(b => b.count === 0)) {
      return contextualTips.noBuildings;
    }
    
    if (resources.electricity && resources.electricity.value < 10 && resources.electricity.unlocked) {
      return contextualTips.lowElectricity;
    }
    
    if (unlocks.research && Object.values(upgrades).some(u => u.unlocked && !u.purchased)) {
      return contextualTips.researchAvailable;
    }
    
    if (resources.computingPower && resources.computingPower.value > 0) {
      return contextualTips.miningPossible;
    }
    
    if (resources.bitcoin && resources.bitcoin.value > 0) {
      return contextualTips.btcExchangeAvailable;
    }
    
    return '';
  };
  
  // Выбор случайной подсказки или контекстуальной подсказки
  useEffect(() => {
    const contextTip = getContextualTip();
    
    if (contextTip) {
      setCurrentTip(contextTip);
    } else {
      const randomIndex = Math.floor(Math.random() * tips.length);
      setCurrentTip(tips[randomIndex]);
    }
    
    // Меняем подсказку каждые 30 секунд
    const interval = setInterval(() => {
      const newContextTip = getContextualTip();
      
      if (newContextTip) {
        setCurrentTip(newContextTip);
      } else {
        const newRandomIndex = Math.floor(Math.random() * tips.length);
        setCurrentTip(tips[newRandomIndex]);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [state]);
  
  if (!showTip) return null;
  
  return (
    <Card className={`relative border-blue-200 bg-blue-50 ${className}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 h-6 w-6" 
        onClick={() => setShowTip(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="p-3 pt-4">
        <div className="flex items-start space-x-3">
          <LightbulbIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">{currentTip}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameTip;
