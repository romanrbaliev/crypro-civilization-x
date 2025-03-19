
import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { useGame } from '@/context/hooks/useGame';
import { debugKnowledgeProduction } from '@/utils/debugCalculator';
import { formatNumber } from '@/utils/helpers';

const DebugCalculator = () => {
  const { state } = useGame();
  const [calculationResult, setCalculationResult] = useState<{ steps: string[]; total: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleCalculate = () => {
    const result = debugKnowledgeProduction(state);
    setCalculationResult(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full flex items-center justify-center gap-2 text-xs"
          onClick={handleCalculate}
        >
          <Calculator className="h-3.5 w-3.5" />
          Анализ накопления знаний
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Детальный расчет накопления знаний</DialogTitle>
          <DialogDescription className="text-center">
            Пошаговый анализ скорости накопления знаний
          </DialogDescription>
        </DialogHeader>

        {calculationResult && (
          <div className="space-y-4">
            <div className="border p-3 rounded-md bg-blue-50">
              <p className="font-semibold">Итоговая скорость накопления: {formatNumber(calculationResult.total)}/сек</p>
              <p className="text-xs text-gray-600">
                Значение в интерфейсе: {state.resources.knowledge?.perSecond ? formatNumber(state.resources.knowledge.perSecond) : '0'}/сек
              </p>
            </div>
            
            <div className="space-y-2">
              {calculationResult.steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`p-2 text-sm ${
                    step.includes('Шаг') 
                      ? 'font-semibold border-b pb-1' 
                      : step.includes('Итого') || step.includes('Итоговая')
                        ? 'font-semibold text-blue-600' 
                        : step.includes('расхождение') || step.includes('Ошибка')
                          ? 'text-red-600 font-semibold'
                          : 'pl-4'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <DialogClose asChild>
                <Button className="w-full">Закрыть</Button>
              </DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DebugCalculator;
