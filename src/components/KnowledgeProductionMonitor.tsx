
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Book, AlarmClock, Timer, BarChart2, Building, Zap, ChevronRight, ArrowUpCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResourceSystem } from '@/hooks/useResourceSystem';
import { Animator, easing } from '@/utils/animations';

interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'production' | 'tick' | 'calculation' | 'animation';
}

interface AnimationState {
  startValue: number;
  targetValue: number; 
  currentValue: number;
  progress: number;
  isRunning: boolean;
}

const KnowledgeProductionMonitor: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { state } = useGame();
  const { resourceSystem, formatValue, getResourceDiagnostics } = useResourceSystem();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnowledgeValueRef = useRef<number>(0);
  const practiceBuiltRef = useRef<number>(0);
  const animatorRef = useRef<Animator | null>(null);
  const monitorOpenTimeRef = useRef<number>(0);
  
  // Состояние для анимации
  const [animationState, setAnimationState] = useState<AnimationState>({
    startValue: 0,
    targetValue: 0,
    currentValue: 0,
    progress: 0,
    isRunning: false
  });
  
  // Функция для добавления лога с выводом в консоль
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      message,
      type
    };
    
    console.log(`KnowledgeMonitor: ${message}`);
    
    setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100)); // Ограничиваем список 100 записями
  };
  
  // Получаем диагностические данные для ресурса знаний
  const knowledgeDiagnostics = getResourceDiagnostics ? getResourceDiagnostics('knowledge') : null;
  
  // Функция для запуска анимации изменения значения
  const startValueAnimation = (startVal: number, targetVal: number) => {
    if (Math.abs(startVal - targetVal) < 0.001) return;
    
    // Логируем начало анимации
    addLog(`Начата анимация изменения значения: ${formatValue(startVal, 'knowledge')} → ${formatValue(targetVal, 'knowledge')}`, 'animation');
    
    // Останавливаем предыдущую анимацию, если она запущена
    if (animatorRef.current) {
      animatorRef.current.stop();
    }
    
    setAnimationState({
      startValue: startVal,
      targetValue: targetVal,
      currentValue: startVal,
      progress: 0,
      isRunning: true
    });
    
    // Создаем новый аниматор
    animatorRef.current = new Animator(
      500, // уменьшаем длительность анимации для быстрого отклика
      easing.easeOutQuad, // функция плавности
      (progress) => {
        // Обновляем текущее значение анимации
        const interpolatedValue = startVal + (targetVal - startVal) * progress;
        setAnimationState(prev => ({
          ...prev,
          currentValue: interpolatedValue,
          progress: progress * 100
        }));
      },
      () => {
        // Завершение анимации
        setAnimationState(prev => ({
          ...prev,
          currentValue: targetVal,
          progress: 100,
          isRunning: false
        }));
        addLog(`Анимация изменения значения завершена: ${formatValue(targetVal, 'knowledge')}`, 'animation');
      }
    );
    
    // Запускаем аниматор
    animatorRef.current.start();
  };
  
  // Отслеживаем изменение количества практик
  useEffect(() => {
    const practiceCount = state.buildings.practice?.count || 0;
    
    if (practiceCount > 0 && practiceCount !== practiceBuiltRef.current) {
      practiceBuiltRef.current = practiceCount;
      addLog(`Практика построена (${practiceCount}). Начинаем отслеживание производства знаний.`, 'info');
    }
  }, [state.buildings.practice?.count]);

  // Эффект инициализации при открытии монитора
  useEffect(() => {
    if (!open) return;
    
    // Запоминаем время открытия монитора
    monitorOpenTimeRef.current = Date.now();
    
    const knowledge = state.resources.knowledge;
    if (!knowledge || !knowledge.unlocked) return;
    
    // Получаем текущее значение при открытии монитора
    const currentKnowledgeValue = knowledge.value || 0;
    
    addLog(`Монитор открыт в ${new Date().toLocaleTimeString()}`, 'info');
    
    // Инициализируем анимационное состояние
    setAnimationState({
      startValue: currentKnowledgeValue,
      targetValue: currentKnowledgeValue,
      currentValue: currentKnowledgeValue,
      progress: 100,
      isRunning: false
    });
    
    // Обновляем последнее известное значение
    lastKnowledgeValueRef.current = currentKnowledgeValue;
    
    // Отправляем лог о текущем состоянии
    addLog(`Текущий запас знаний: ${formatValue(currentKnowledgeValue, 'knowledge')}`, 'info');
    addLog(`Производство знаний: ${formatValue(knowledge.perSecond || 0, 'knowledge')}/сек`, 'calculation');
    
    // Добавляем детальную информацию о структуре производства
    if (knowledgeDiagnostics) {
      const buildingProduction = knowledgeDiagnostics.buildingProduction
        .filter(b => b.production > 0)
        .map(b => `${b.name} (${b.count}): ${formatValue(b.production, 'knowledge')}/сек`)
        .join(', ');
      
      if (buildingProduction) {
        addLog(`Структура производства: ${buildingProduction}`, 'info');
      }
      
      if (knowledgeDiagnostics.upgradeBonuses.length > 0) {
        addLog(`Активные бонусы: ${knowledgeDiagnostics.upgradeBonuses.length} улучшений`, 'info');
      }
    }
    
    // Регистрируем обработчик событий обновления знаний
    const handleKnowledgeUpdated = (event: CustomEvent) => {
      const { oldValue, newValue, delta } = event.detail;
      addLog(`Событие обновления: ${formatValue(oldValue, 'knowledge')} → ${formatValue(newValue, 'knowledge')} (${delta > 0 ? '+' : ''}${formatValue(delta, 'knowledge')})`, 'production');
      startValueAnimation(oldValue, newValue);
      lastKnowledgeValueRef.current = newValue;
    };
    
    window.addEventListener('knowledge-value-updated', handleKnowledgeUpdated as EventListener);
    
    return () => {
      window.removeEventListener('knowledge-value-updated', handleKnowledgeUpdated as EventListener);
    };
  }, [open, formatValue, knowledgeDiagnostics]);
  
  // Отдельный эффект для отслеживания изменений значения knowledge.value с быстрой периодичностью
  useEffect(() => {
    if (!open) return;
    
    const checkInterval = setInterval(() => {
      const knowledgeResource = state.resources.knowledge;
      if (!knowledgeResource || !knowledgeResource.unlocked) return;
      
      const currentValue = knowledgeResource.value || 0;
      const lastValue = lastKnowledgeValueRef.current;
      
      // Проверяем на реальное изменение значения с малым порогом точности
      if (Math.abs(currentValue - lastValue) > 0.000001) {
        const diff = currentValue - lastValue;
        
        addLog(`[Интервал] Изменение знаний: ${formatValue(lastValue, 'knowledge')} → ${formatValue(currentValue, 'knowledge')} (${diff > 0 ? '+' : ''}${formatValue(diff, 'knowledge')})`, 'production');
        
        // Запускаем анимацию изменения значения
        startValueAnimation(lastValue, currentValue);
        
        // Обновляем ref с последним значением
        lastKnowledgeValueRef.current = currentValue;
      } else if (knowledgeResource.perSecond > 0) {
        const elapsedSeconds = (Date.now() - monitorOpenTimeRef.current) / 1000;
        // Проверяем, не прошло ли уже 3 секунды без изменений
        if (elapsedSeconds > 3) {
          addLog(`Внимание: Производство > 0 (${knowledgeResource.perSecond.toFixed(4)}), но значение не меняется уже ${elapsedSeconds.toFixed(1)} сек`, 'calculation');
        }
      }
    }, 50); // Очень короткий интервал для быстрого отслеживания
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [open, state.resources.knowledge, formatValue]);
  
  // Отображение разных типов логов
  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'info': return <Book className="h-4 w-4 mr-2 text-blue-500" />;
      case 'production': return <BarChart2 className="h-4 w-4 mr-2 text-green-500" />;
      case 'tick': return <Timer className="h-4 w-4 mr-2 text-amber-500" />;
      case 'calculation': return <AlarmClock className="h-4 w-4 mr-2 text-purple-500" />;
      case 'animation': return <ArrowUpCircle className="h-4 w-4 mr-2 text-pink-500" />;
      default: return <Book className="h-4 w-4 mr-2" />;
    }
  };
  
  // Форматирование времени
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };
  
  // Вычисляем процент заполнения для ресурса
  const getResourceFillPercentage = () => {
    const resource = state.resources.knowledge;
    if (!resource || resource.max === undefined || resource.max === Infinity) return 0;
    return (animationState.currentValue / resource.max) * 100;
  };
  
  // Модифицируем хук useGameStateUpdateService для более частого обновления
  useEffect(() => {
    if (!open) return;
    
    // Увеличиваем частоту обновления игрового состояния, когда монитор открыт
    const forcedUpdateInterval = setInterval(() => {
      // Имитируем TICK в очень короткие интервалы для обновления UI
      window.dispatchEvent(new CustomEvent('monitor-force-update'));
    }, 100); // Более частое обновление, когда монитор открыт
    
    return () => {
      clearInterval(forcedUpdateInterval);
    };
  }, [open]);
  
  // Основное представление компонента
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Book className="mr-2 h-5 w-5" />
            Монитор производства знаний
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-sm mb-2">
          <p className="mb-2 font-medium">Обновление значения:</p>
          
          <div className="bg-slate-100 p-3 rounded-md mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Знания:</span>
              <div className="flex items-center">
                <span className="text-gray-500">{formatValue(animationState.startValue, 'knowledge')}</span>
                <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                <span className="font-medium">{formatValue(animationState.currentValue, 'knowledge')}</span>
                {animationState.isRunning && (
                  <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                )}
                {animationState.isRunning && (
                  <span className="text-green-500">{formatValue(animationState.targetValue, 'knowledge')}</span>
                )}
              </div>
            </div>
            
            <Progress 
              value={getResourceFillPercentage()} 
              indicatorClassName="bg-gradient-to-r from-blue-400 to-green-400" 
              className="h-2 mb-2"
            />
            
            {animationState.isRunning && (
              <Progress 
                value={animationState.progress} 
                indicatorClassName="bg-gradient-to-r from-amber-400 to-pink-400" 
                className="h-1.5 mb-2"
              />
            )}
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>Макс: {formatValue(state.resources.knowledge?.max || 0, 'knowledge')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-slate-100 p-2 rounded">
              <span className="font-medium">Текущее значение:</span> {formatValue(state.resources.knowledge?.value || 0, 'knowledge')}
            </div>
            <div className="bg-slate-100 p-2 rounded">
              <span className="font-medium">Производство:</span> {formatValue(state.resources.knowledge?.perSecond || 0, 'knowledge')}/сек
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-slate-100 p-2 rounded">
              <span className="font-medium flex items-center">
                <Zap className="h-4 w-4 mr-1 text-amber-500" />
                Базовое производство:
              </span> 
              <div className="text-xs text-gray-500 mt-1">
                Производство от ручных кликов или базовых источников
              </div>
              <div className="mt-1 font-medium">
                {formatValue(state.resources.knowledge?.baseProduction || 0, 'knowledge')}/сек
              </div>
            </div>
            
            <div className="bg-slate-100 p-2 rounded">
              <span className="font-medium flex items-center">
                <Building className="h-4 w-4 mr-1 text-blue-500" />
                От зданий:
              </span>
              <div className="text-xs text-gray-500 mt-1">
                Производство от всех построенных зданий
              </div>
              <div className="mt-1 font-medium">
                {knowledgeDiagnostics?.buildingProduction?.reduce((sum, b) => sum + b.production, 0) || 0}/сек
              </div>
            </div>
          </div>
          
          <div className="bg-slate-100 p-2 rounded mb-2">
            <span className="font-medium">Построено практик:</span> {state.buildings.practice?.count || 0}
            <div className="text-xs text-gray-500 mt-1">
              Каждая практика дает +1 знание/сек
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="font-medium text-sm mt-2 mb-2 flex justify-between items-center">
          <span>Журнал событий:</span>
          <button
            onClick={() => setLogs([])}
            className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded"
          >
            Очистить
          </button>
        </div>
        
        <ScrollArea className="flex-1 h-[300px] pr-4">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">Нет записей</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="text-xs border-l-2 pl-2 py-1" style={{ borderLeftColor: 
                  log.type === 'info' ? '#3b82f6' : 
                  log.type === 'production' ? '#22c55e' : 
                  log.type === 'tick' ? '#f59e0b' : 
                  log.type === 'animation' ? '#ec4899' :
                  '#a855f7'
                }}>
                  <div className="flex items-start">
                    <div className="flex items-center">
                      {getLogIcon(log.type)}
                      <span className="text-gray-500 mr-2">{formatTime(log.timestamp)}</span>
                    </div>
                    <span>{log.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeProductionMonitor;
