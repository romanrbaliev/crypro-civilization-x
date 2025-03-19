
// Обновляем компонент DebugCalculator для поддержки асинхронного расчета
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { debugKnowledgeProduction } from '@/utils/debugCalculator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Info } from 'lucide-react';

const DebugCalculator = () => {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [debugSteps, setDebugSteps] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [totalProduction, setTotalProduction] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  useEffect(() => {
    const handleForceUpdate = () => {
      if (!isOpen) return; // Только если калькулятор открыт
      
      console.log('Получено событие принудительного обновления, пересчитываем...');
      runCalculation();
    };

    window.addEventListener('force-resource-update', handleForceUpdate);
    window.addEventListener('helpers-updated', handleForceUpdate);
    window.addEventListener('refresh-referrals', handleForceUpdate);
    
    return () => {
      window.removeEventListener('force-resource-update', handleForceUpdate);
      window.removeEventListener('helpers-updated', handleForceUpdate);
      window.removeEventListener('refresh-referrals', handleForceUpdate);
    };
  }, [isOpen, state]);

  useEffect(() => {
    // Автоматический пересчет при открытии и при значительных изменениях состояния
    if (isOpen) {
      runCalculation();
    }
  }, [isOpen, state.referralHelpers.length]);

  // Запускаем расчет с обработкой асинхронности
  const runCalculation = async () => {
    setIsCalculating(true);
    
    try {
      const result = await debugKnowledgeProduction(state);
      setDebugSteps(result.steps);
      setTotalProduction(result.total);
      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error('Ошибка при запуске калькулятора:', error);
      setDebugSteps([`Произошла ошибка: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Функция для добавления временной отметки к строкам
  const formatDebugStep = (step: string, index: number) => {
    // Добавляем отступы для визуальной иерархии
    if (step.startsWith('-')) {
      return <div key={index} className="pl-4 text-sm">{step}</div>;
    }
    if (step.startsWith('  ')) {
      return <div key={index} className="pl-8 text-sm">{step}</div>;
    }
    if (step.startsWith('    ')) {
      return <div key={index} className="pl-12 text-sm">{step}</div>;
    }
    
    // Заголовки шагов делаем более заметными
    if (step.startsWith('Шаг')) {
      return <div key={index} className="font-medium text-sm mt-2">{step}</div>;
    }
    
    // Начальный и итоговый шаги выделяем сильнее
    if (step.startsWith('Анализ') || step.startsWith('Итоговая')) {
      return <div key={index} className="font-bold text-sm">{step}</div>;
    }
    
    return <div key={index} className="text-sm">{step}</div>;
  };

  return (
    <div className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex w-full justify-between px-4 py-2">
            <span className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Калькулятор производства
            </span>
            <span>{isOpen ? '▲' : '▼'}</span>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-2">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Последнее обновление: {new Date(lastUpdateTime).toLocaleTimeString()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runCalculation} 
              disabled={isCalculating}
              className="text-xs"
            >
              {isCalculating ? 'Расчет...' : 'Пересчитать'}
            </Button>
          </div>
          
          <div className="max-h-60 overflow-y-auto border p-2 rounded-md bg-slate-50 space-y-1">
            {debugSteps.map(formatDebugStep)}
            
            {isCalculating && (
              <div className="text-center py-2 text-sm text-gray-500">
                Выполняется расчет...
              </div>
            )}
            
            {!isCalculating && debugSteps.length === 0 && (
              <div className="text-center py-2 text-sm text-gray-500">
                Нажмите "Пересчитать" для анализа производства
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DebugCalculator;
