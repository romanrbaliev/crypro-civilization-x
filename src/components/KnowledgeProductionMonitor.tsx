
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Book, AlarmClock, Timer, BarChart2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResourceSystem } from '@/hooks/useResourceSystem';

interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'production' | 'tick' | 'calculation';
}

const KnowledgeProductionMonitor: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { state } = useGame();
  const { resourceSystem, formatValue } = useResourceSystem();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnowledgeValueRef = useRef<number>(0);
  const practiceBuiltRef = useRef<number>(0);
  
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
      addLog(`Текущий запас знаний: ${formatValue(knowledge.value, 'knowledge')}`, 'info');
      addLog(`Производство знаний: ${formatValue(knowledge.perSecond || 0, 'knowledge')}/сек`, 'calculation');
      addLog(`Базовое производство: ${formatValue(knowledge.baseProduction || 0, 'knowledge')}/сек`, 'calculation');
      lastKnowledgeValueRef.current = knowledge.value || 0;
      
      // Проверяем наличие построенных практик
      const practiceCount = state.buildings.practice?.count || 0;
      if (practiceCount > 0) {
        addLog(`Построено практик: ${practiceCount}`, 'info');
        addLog(`Ожидаемое производство от практик: ${formatValue(practiceCount * 1, 'knowledge')}/сек`, 'calculation');
      } else {
        addLog('Практики не построены. Автоматическое производство знаний не активировано.', 'info');
      }
    }
    
    // Запускаем интервал для отслеживания изменений
    logIntervalRef.current = setInterval(() => {
      const currentValue = state.resources.knowledge?.value || 0;
      const lastValue = lastKnowledgeValueRef.current;
      
      if (currentValue !== lastValue) {
        const diff = currentValue - lastValue;
        addLog(`Изменение знаний: ${formatValue(lastValue, 'knowledge')} → ${formatValue(currentValue, 'knowledge')} (${diff > 0 ? '+' : ''}${formatValue(diff, 'knowledge')})`, 'production');
        lastKnowledgeValueRef.current = currentValue;
      }
    }, 500);
    
    return () => {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
    };
  }, [open, state.resources.knowledge, formatValue]);
  
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
      } else if (logMessage.includes('Производство') && logMessage.includes('knowledge')) {
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
      default: return <Book className="h-4 w-4 mr-2" />;
    }
  };
  
  // Форматирование времени
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Book className="mr-2 h-5 w-5" />
            Монитор производства знаний
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-sm mb-2">
          <p className="mb-1 font-medium">Текущие значения:</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-slate-100 p-2 rounded">
              <span className="font-medium">Знания:</span> {formatValue(state.resources.knowledge?.value || 0, 'knowledge')}
            </div>
            <div className="bg-slate-100 p-2 rounded">
              <span className="font-medium">Производство:</span> {formatValue(state.resources.knowledge?.perSecond || 0, 'knowledge')}/сек
            </div>
          </div>
          <div className="bg-slate-100 p-2 rounded mb-2">
            <span className="font-medium">Построено практик:</span> {state.buildings.practice?.count || 0}
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
