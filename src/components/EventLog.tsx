
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';

const EventLog: React.FC = () => {
  const { state } = useGame();
  const [messages, setMessages] = useState<string[]>([
    "Добро пожаловать в Crypto Civilization!",
    "Нажмите 'Изучить крипту' чтобы начать свой путь."
  ]);
  
  // Добавление новых сообщений при появлении разблокировок
  useEffect(() => {
    const handleUnlockEvent = (event: CustomEvent) => {
      const { itemId } = event.detail;
      
      if (itemId === 'usdt') {
        addMessage("Вы разблокировали USDT! Теперь вы можете применять знания для получения криптовалюты.");
      } else if (itemId === 'practice') {
        addMessage("Разблокировано здание: Практика. Оно автоматически генерирует знания.");
      } else if (itemId === 'generator') {
        addMessage("Разблокировано здание: Генератор. Производит электричество для ваших устройств.");
      } else if (itemId === 'research') {
        addMessage("Разблокированы исследования! Теперь вы можете развивать технологии.");
      } else if (itemId === 'bitcoin') {
        addMessage("Вы открыли Bitcoin! Майнинг теперь доступен.");
      }
    };
    
    window.addEventListener('unlock-event', handleUnlockEvent as EventListener);
    
    return () => {
      window.removeEventListener('unlock-event', handleUnlockEvent as EventListener);
    };
  }, []);
  
  // Функция добавления нового сообщения
  const addMessage = (message: string) => {
    setMessages(prev => [message, ...prev.slice(0, 9)]);
  };
  
  return (
    <div className="h-16 overflow-y-auto">
      <div className="space-y-1 p-1">
        {messages.map((message, index) => (
          <div key={index} className="text-sm text-gray-600">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLog;
