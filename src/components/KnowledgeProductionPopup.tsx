
import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';
import { debugKnowledgeProduction } from '@/utils/debugCalculator';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { convertGameState } from '@/utils/typeConverters';

const KnowledgeProductionPopup = () => {
  const { state, forceUpdate } = useGame();
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);
  const [finalValue, setFinalValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  
  const updateCalculation = async () => {
    try {
      setLoading(true);
      
      // Форсируем обновление состояния игры
      forceUpdate();
      
      // Небольшая задержка, чтобы обновление успело применится
      setTimeout(() => {
        try {
          // Выводим состояние практики
          console.log("Состояние практики:", {
            exists: !!state.buildings.practice,
            count: state.buildings.practice?.count || 0,
            unlocked: state.buildings.practice?.unlocked || false
          });
          
          // Выводим состояние производства знаний
          console.log("Состояние знаний:", {
            value: state.resources.knowledge?.value || 0,
            baseProduction: state.resources.knowledge?.baseProduction || 0,
            production: state.resources.knowledge?.production || 0,
            perSecond: state.resources.knowledge?.perSecond || 0
          });
          
          // Получаем расчеты, используем функцию-помощник для преобразования типов
          const typedState = convertGameState(state);
          const { steps, finalValue } = debugKnowledgeProduction(typedState);
          setCalculationSteps(steps);
          setFinalValue(finalValue);
          
          // Сравниваем с текущим значением в state
          const currentPerSecond = state.resources.knowledge?.perSecond || 0;
          
          // Защита от null при вызове toFixed
          const formattedFinalValue = finalValue !== null && finalValue !== undefined ? finalValue.toFixed(2) : "0.00";
          const formattedCurrentPerSecond = currentPerSecond !== null && currentPerSecond !== undefined ? currentPerSecond.toFixed(2) : "0.00";
          
          console.log(`KnowledgeProductionPopup: Расчетное значение=${formattedFinalValue}, текущее=${formattedCurrentPerSecond}`);
          
          // Проверяем расхождение
          if (Math.abs(finalValue - currentPerSecond) > 0.01) {
            console.warn(`KnowledgeProductionPopup: Обнаружено расхождение в расчетах знаний: ${Math.abs(finalValue - currentPerSecond).toFixed(2)}`);
          }
        } catch (error) {
          console.error('Ошибка в debugKnowledgeProduction:', error);
          setCalculationSteps(['Произошла ошибка при расчете: ' + error]);
          setFinalValue(0);
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Ошибка при обновлении расчета:', error);
      setLoading(false);
    }
  };
  
  // Обновляем расчет при открытии popover
  const handleOpenChange = (open: boolean) => {
    if (open) {
      updateCalculation();
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
          <Calculator className="h-3.5 w-3.5" /> 
          Расчет знаний
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 bg-white rounded-md">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Детализация расчета знаний</h3>
          
          <div className="flex justify-between mb-3">
            <span className="text-sm">Производство знаний:</span>
            <span className="font-semibold text-sm">
              {loading ? '...' : `${finalValue !== null ? finalValue.toFixed(2) : '0.00'}/сек`}
            </span>
          </div>
          
          <div className="mt-2 p-2 bg-gray-50 rounded border text-xs text-gray-600 max-h-80 overflow-y-auto whitespace-pre-line">
            {loading ? (
              <div className="text-center py-2">Загрузка данных...</div>
            ) : (
              calculationSteps.map((step, index) => (
                <div key={index} className={
                  step.includes('Статус помощника') ? 'bg-blue-50 p-1 rounded my-1' : 
                  step.includes('Итого:') || step.includes('Итоговая скорость:') ? 'font-bold mt-2' : 
                  step.includes('Общий бонус') ? 'font-semibold' :
                  step.includes('⚠️') ? 'text-red-500 font-bold' :
                  step.includes('✅') ? 'text-green-500 font-bold' : ''
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
              onClick={updateCalculation}
            >
              Обновить расчет
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default KnowledgeProductionPopup;
