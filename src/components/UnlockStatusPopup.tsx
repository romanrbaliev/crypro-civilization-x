
import React, { useState, useEffect } from 'react';
import { Unlock } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';
import { debugUnlockStatus } from '@/utils/debugCalculator';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const UnlockStatusPopup = () => {
  const { state, forceUpdate } = useGame();
  const [statusSteps, setStatusSteps] = useState<string[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [lockedItems, setLockedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const updateStatus = async () => {
    try {
      setLoading(true);
      
      // Форсируем обновление состояния игры
      forceUpdate();
      
      // Проверяем состояние здания "Практика" перед вызовом debugUnlockStatus
      const practiceBuilding = state.buildings.practice;
      console.log("UnlockStatusPopup: Статус здания Практика перед проверкой:", 
        practiceBuilding ? 
        `существует, unlocked=${practiceBuilding.unlocked}, count=${practiceBuilding.count}` : 
        "отсутствует в state.buildings");
      
      // Выводим список всех зданий
      console.log("UnlockStatusPopup: Все здания:", Object.keys(state.buildings));
      console.log("UnlockStatusPopup: Разблокированные здания:", 
        Object.values(state.buildings)
          .filter(b => b.unlocked)
          .map(b => `${b.id} (unlocked=${b.unlocked}, count=${b.count})`));
      
      // Небольшая задержка, чтобы обновление успело применится
      setTimeout(() => {
        try {
          // Получаем отчет о статусе разблокировок
          const result = debugUnlockStatus(state);
          setStatusSteps(result.steps || []); // Шаги проверки условий
          setUnlockedItems(result.unlocked || []); // Разблокированные элементы
          setLockedItems(result.locked || []); // Заблокированные элементы
          
          // Проверяем состояние здания "Практика" после вызова debugUnlockStatus
          const practiceBuilding = state.buildings.practice;
          console.log("UnlockStatusPopup: Статус здания Практика после проверки:", 
            practiceBuilding ? 
            `существует, unlocked=${practiceBuilding.unlocked}, count=${practiceBuilding.count}` : 
            "отсутствует в state.buildings");
          
        } catch (error) {
          console.error('Ошибка при анализе разблокировок:', error);
          setStatusSteps(['Произошла ошибка при анализе разблокировок: ' + error]);
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      setLoading(false);
    }
  };
  
  // Обновляем статус при открытии popover
  const handleOpenChange = (open: boolean) => {
    if (open) {
      updateStatus();
    }
  };
  
  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 text-xs gap-1 bg-white"
        >
          <Unlock className="h-3.5 w-3.5" /> 
          Проверка разблокировок
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 bg-white rounded-md">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Статус разблокировок контента</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
            <div>
              <h4 className="font-semibold text-green-600">Разблокировано ({unlockedItems.length}):</h4>
              <ul className="mt-1 space-y-1 text-green-600">
                {unlockedItems.slice(0, 6).map((item, idx) => (
                  <li key={idx}>✅ {item}</li>
                ))}
                {unlockedItems.length > 6 && (
                  <li>... и еще {unlockedItems.length - 6}</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-500">Заблокировано ({lockedItems.length}):</h4>
              <ul className="mt-1 space-y-1 text-gray-500">
                {lockedItems.slice(0, 6).map((item, idx) => (
                  <li key={idx}>❌ {item}</li>
                ))}
                {lockedItems.length > 6 && (
                  <li>... и еще {lockedItems.length - 6}</li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-2 p-2 bg-gray-50 rounded border text-xs text-gray-600 max-h-80 overflow-y-auto whitespace-pre-line">
            {loading ? (
              <div className="text-center py-2">Загрузка данных...</div>
            ) : (
              statusSteps.map((step, index) => (
                <div key={index} className={
                  step.includes('✅') ? 'text-green-600' : 
                  step.includes('❌') ? 'text-red-500' : 
                  step.startsWith('•') ? 'pl-2' :
                  step.startsWith('📊') || step.startsWith('🔓') || step.startsWith('🏗️') || step.startsWith('📚') ? 'font-semibold mt-2' : ''
                }>
                  {step}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-3 flex justify-end">
            <Button 
              variant="secondary" 
              size="sm" 
              className="text-xs" 
              onClick={updateStatus}
            >
              Обновить статус
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UnlockStatusPopup;
