
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
  
  // Состояние для анимации
  const [animationState, setAnimationState] = useState<AnimationState>({
    startValue: 0,
    targetValue: 0,
    currentValue: 0,
    progress: 0,
    isRunning: false
  });
  
  // Функция для добавления лога
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      message,
      type
    };
    
    setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100)); // Ограничиваем список 100 записями
  };
  
  // Получаем диагностические данные для ресурса знаний
  const knowledgeDiagnostics = getResourceDiagnostics ? getResourceDiagnostics('knowledge') : null;
  
  // Функция для запуска анимации изменения значения
  const startValueAnimation = (startVal: number, targetVal: number) => {
    if (startVal === targetVal) return;
    
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
      1500, // длительность анимации в мс
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
        addLog(`Анимация изменения значения завершена: ${formatValue(startVal, 'knowledge')} → ${formatValue(targetVal, 'knowledge')}`, 'animation');
      }
    );
    
    // Запускаем аниматор
    animatorRef.current.start();
    addLog(`Начата анимация изменения значения: ${formatValue(startVal, 'knowledge')} → ${formatValue(targetVal, 'knowledge')}`, 'animation');
  };
  
  // Отслеживаем изменение количества практик
  useEffect(() => {
    const practiceCount = state.buildings.practice?.count || 0;
    
    if (practiceCount > 0 && practiceCount !== practiceBuiltRef.current) {
      practiceBuiltRef.current = practiceCount;
      addLog(`Практика построена (${practiceCount}). Начинаем отслеживание производства знаний.`, 'info');
    }
  }, [state.buildings.practice?.count]);
  
  // Отслеживаем текущее производство знаний
  useEffect(() => {
    const knowledge = state.resources.knowledge;
    
    if (!open || !knowledge || !knowledge.unlocked) return;
    
    // Начальная запись текущего состояния
    if (open) {
      const currentKnowledgeValue = knowledge.value || 0;
      
      addLog(`Текущий запас знаний: ${formatValue(currentKnowledgeValue, 'knowledge')}`, 'info');
      addLog(`Производство знаний: ${formatValue(knowledge.perSecond || 0, 'knowledge')}/сек`, 'calculation');
      addLog(`Базовое производство: ${formatValue(knowledge.baseProduction || 0, 'knowledge')}/сек`, 'calculation');
      
      // Инициализация анимационного состояния
      setAnimationState({
        startValue: currentKnowledgeValue,
        targetValue: currentKnowledgeValue,
        currentValue: currentKnowledgeValue,
        progress: 100,
        isRunning: false
      });
      
      lastKnowledgeValueRef.current = currentKnowledgeValue;
      
      // Проверяем наличие построенных практик
      const practiceCount = state.buildings.practice?.count || 0;
      if (practiceCount > 0) {
        addLog(`Построено практик: ${practiceCount}`, 'info');
        addLog(`Ожидаемое производство от практик: ${formatValue(practiceCount * 1, 'knowledge')}/сек`, 'calculation');
      } else {
        addLog('Практики не построены. Автоматическое производство знаний не активировано.', 'info');
      }
      
      // Подробная диагностика компонентов производства
      if (knowledgeDiagnostics) {
        addLog(`Структура производства знаний:`, 'info');
        
        // Выводим информацию о здании "Практика"
        const practiceBuildingInfo = knowledgeDiagnostics.buildingProduction.find(b => b.name === 'Практика');
        if (practiceBuildingInfo) {
          addLog(`- Практика (${practiceBuildingInfo.count}): ${formatValue(practiceBuildingInfo.production, 'knowledge')}/сек`, 'calculation');
        }
        
        // Выводим бонусы от улучшений
        if (knowledgeDiagnostics.upgradeBonuses.length > 0) {
          knowledgeDiagnostics.upgradeBonuses.forEach(upgrade => {
            addLog(`- Улучшение "${upgrade.name}": эффект ${JSON.stringify(upgrade.effects)}`, 'calculation');
          });
        }
      }
    }
    
    // Запускаем интервал для отслеживания изменений
    logIntervalRef.current = setInterval(() => {
      const currentValue = state.resources.knowledge?.value || 0;
      const lastValue = lastKnowledgeValueRef.current;
      
      if (currentValue !== lastValue) {
        const diff = currentValue - lastValue;
        
        addLog(`Изменение знаний: ${formatValue(lastValue, 'knowledge')} → ${formatValue(currentValue, 'knowledge')} (${diff > 0 ? '+' : ''}${formatValue(diff, 'knowledge')})`, 'production');
        
        // Запускаем анимацию изменения значения
        startValueAnimation(lastValue, currentValue);
        
        lastKnowledgeValueRef.current = currentValue;
      }
    }, 500);
    
    return () => {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
      
      // Останавливаем анимацию при размонтировании
      if (animatorRef.current) {
        animatorRef.current.stop();
      }
    };
  }, [open, state.resources.knowledge, formatValue, knowledgeDiagnostics]);
  
  // Добавляем обработчик событий TICK
  useEffect(() => {
    if (!open) return;
    
    const originalConsoleLog = console.log;
    
    // Перехватываем логи, связанные с TICK и resourceUpdateReducer
    console.log = (...args) => {
      originalConsoleLog(...args);
      
      const logMessage = args.join(' ');
      
      if (logMessage.includes('TICK') && logMessage.includes('Обновление ресурсов')) {
        addLog(`TICK: ${logMessage}`, 'tick');
      } else if (logMessage.includes('resourceUpdateReducer') || logMessage.includes('ResourceSystem')) {
        addLog(`Система: ${logMessage}`, 'calculation');
      } else if (logMessage.includes('ResourceProductionService') && logMessage.includes('знаний')) {
        addLog(`Расчет: ${logMessage}`, 'calculation');
      }
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, [open]);
  
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
