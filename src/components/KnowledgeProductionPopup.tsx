
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

const KnowledgeProductionPopup = () => {
  const { state } = useGame();
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);
  const [finalValue, setFinalValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  
  const updateCalculation = async () => {
    try {
      setLoading(true);
      const { steps, finalValue } = await debugKnowledgeProduction(state);
      setCalculationSteps(steps);
      setFinalValue(finalValue);
    } catch (error) {
      console.error('Ошибка при обновлении расчета:', error);
    } finally {
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
            <span className="font-semibold text-sm">{loading ? '...' : `${finalValue.toFixed(2)}/сек`}</span>
          </div>
          
          <div className="mt-2 p-2 bg-gray-50 rounded border text-xs text-gray-600 max-h-80 overflow-y-auto whitespace-pre-line">
            {loading ? (
              <div className="text-center py-2">Загрузка данных...</div>
            ) : (
              calculationSteps.map((step, index) => (
                <div key={index} className={
                  step.includes('Статус помощника даёт бонус') ? 'bg-blue-50 p-1 rounded my-1' : 
                  step.includes('Итого:') ? 'font-bold mt-2' : 
                  step.includes('Общий бонус от помощников') ? 'font-semibold' : ''
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
