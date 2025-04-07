import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Book, Timer, Settings, BarChart2, ClipboardList, Play, Pause, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResourceSystem } from '@/hooks/useResourceSystem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'production' | 'tick' | 'calculation' | 'system' | 'debug';
  details?: any;
}

const KnowledgeProductionMonitor: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { state, dispatch } = useGame();
  const { formatValue } = useResourceSystem();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logInterval, setLogInterval] = useState<number>(5); // интервал в секундах
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [loggingActive, setLoggingActive] = useState<boolean>(true);
  const [detailedMode, setDetailedMode] = useState<boolean>(true);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastLogTimeRef = useRef<number>(0);
  
  const addLog = (message: string, type: LogEntry['type'] = 'info', details?: any) => {
    const timestamp = Date.now();
    const newLog: LogEntry = {
      id: `log-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      message,
      type,
      details
    };
    
    console.log(`KnowledgeMonitor: ${message}`, details || '');
    
    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs];
      return updatedLogs.length > 500 ? updatedLogs.slice(0, 500) : updatedLogs;
    });
    
    lastLogTimeRef.current = timestamp;
  };
  
  useEffect(() => {
    if (autoScrollEnabled && scrollAreaRef.current && logs.length > 0) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = 0;
        }
      }, 10);
    }
  }, [logs, autoScrollEnabled]);
  
  const getKnowledgeInfo = () => {
    const knowledge = state.resources.knowledge;
    if (!knowledge || !knowledge.unlocked) return null;
    
    return {
      value: knowledge.value || 0,
      max: knowledge.max || Infinity,
      production: knowledge.production || 0,
      perSecond: knowledge.perSecond || 0,
      baseProduction: knowledge.baseProduction || 0,
      consumption: knowledge.consumption || 0
    };
  };
  
  const analyzeKnowledgeProduction = () => {
    const knowledge = getKnowledgeInfo();
    if (!knowledge) {
      addLog('Ресурс "Знания" не разблокирован или не существует', 'info');
      return;
    }
    
    addLog(`=== АНАЛИЗ ПР��ИЗВОДСТВА ЗНАНИЙ ===`, 'system');
    addLog(`Текущее значение: ${formatValue(knowledge.value, 'knowledge')}/${formatValue(knowledge.max, 'knowledge')}`, 'info');
    addLog(`Производство: ${formatValue(knowledge.perSecond, 'knowledge')}/сек`, 'production');
    
    if (detailedMode) {
      addLog(`--- Производство от зданий ---`, 'calculation');
      const buildings = Object.values(state.buildings)
        .filter(b => b.count > 0 && b.production && b.production.knowledge);
      
      if (buildings.length > 0) {
        buildings.forEach(b => {
          const total = (b.production.knowledge || 0) * b.count;
          addLog(`${b.name} (${b.count} шт.): ${formatValue(b.production.knowledge || 0, 'knowledge')} × ${b.count} = ${formatValue(total, 'knowledge')}/сек`, 'calculation');
        });
      }
      
      addLog(`--- Активные бонусы от улучшений ---`, 'calculation');
      const upgrades = Object.values(state.upgrades)
        .filter(u => u.purchased && u.effects);
      
      if (upgrades.length > 0) {
        upgrades.forEach(u => {
          addLog(`${u.name}: ${JSON.stringify(u.effects)}`, 'calculation');
        });
      }
      
      addLog(`--- Формула расчета ---`, 'debug');
      addLog(`Базовое производство: ${formatValue(knowledge.baseProduction, 'knowledge')}/сек`, 'debug');
      addLog(`От зданий и улучшений: ${formatValue(knowledge.production - knowledge.baseProduction, 'knowledge')}/сек`, 'debug');
      addLog(`Общее производство (perSecond): ${formatValue(knowledge.perSecond, 'knowledge')}/сек`, 'debug');
      
      const secondsToMax = knowledge.max !== Infinity && knowledge.perSecond > 0 
        ? (knowledge.max - knowledge.value) / knowledge.perSecond 
        : null;
      
      if (secondsToMax !== null) {
        const minutes = Math.floor(secondsToMax / 60);
        const seconds = Math.floor(secondsToMax % 60);
        addLog(`Время до максимума: ${minutes}м ${seconds}с`, 'calculation');
      }
    }
    
    addLog(`--- Счетчики системы ---`, 'system');
    Object.entries(state.counters).forEach(([key, value]) => {
      addLog(`${key}: ${value.value}`, 'system');
    });
    
    addLog(`Последнее обновление состояния: ${new Date(state.lastUpdate).toLocaleTimeString()}`, 'system');
    addLog(`=== КОНЕЦ АНАЛИЗА ===`, 'system');
  };
  
  const analyzeUpdateTick = () => {
    const now = Date.now();
    const knowledge = getKnowledgeInfo();
    
    if (!knowledge) return;
    
    const deltaTime = now - state.lastUpdate;
    const expectedIncrement = knowledge.perSecond * (deltaTime / 1000);
    
    addLog(`--- АНАЛИЗ ТИКА ОБНОВЛЕНИЯ ---`, 'tick');
    addLog(`Прошло с последнего обновления: ${deltaTime}мс`, 'tick');
    addLog(`Текущее значение знаний: ${formatValue(knowledge.value, 'knowledge')}`, 'tick');
    addLog(`Ожидаемое увеличение: ${formatValue(expectedIncrement, 'knowledge')}`, 'calculation');
    addLog(`Ожидаемое новое значение: ${formatValue(knowledge.value + expectedIncrement, 'knowledge')}`, 'calculation');
    
    dispatch({ 
      type: 'TICK', 
      payload: { 
        forcedUpdate: true, 
        currentTime: now, 
        deltaTime,
        forceSave: true
      } 
    });
    
    setTimeout(() => {
      const updatedKnowledge = state.resources.knowledge;
      if (!updatedKnowledge) return;
      
      const actualNewValue = updatedKnowledge.value || 0;
      const actualIncrement = actualNewValue - knowledge.value;
      
      addLog(`После обновления: ${formatValue(actualNewValue, 'knowledge')}`, 'tick');
      addLog(`Фактическое увеличение: ${formatValue(actualIncrement, 'knowledge')}`, 'tick');
      
      if (Math.abs(actualIncrement - expectedIncrement) > 0.0001) {
        addLog(`⚠️ Расхождение: ${formatValue(actualIncrement - expectedIncrement, 'knowledge')}`, 'debug');
        console.log(`Детали расхождения: ожидалось ${expectedIncrement.toFixed(4)}, получено ${actualIncrement.toFixed(4)}`);
        console.log(`Формула ожидания: ${knowledge.perSecond.toFixed(4)} * (${deltaTime} / 1000) = ${expectedIncrement.toFixed(4)}`);
        
        addLog(`Структура ресурса knowledge:`, 'debug');
        addLog(`value: ${updatedKnowledge.value}, perSecond: ${updatedKnowledge.perSecond}, max: ${updatedKnowledge.max}`, 'debug');
      } else {
        addLog(`✓ Обновление выполнено корректно`, 'debug');
      }
      
      addLog(`--- КОНЕЦ АНАЛИЗА ТИКА ---`, 'tick');
    }, 50);
  };
  
  const monitorKnowledgeChanges = () => {
    const knowledge = getKnowledgeInfo();
    if (!knowledge) return;
    
    addLog(`Мониторинг знаний: ${formatValue(knowledge.value, 'knowledge')}`, 'production');
  };
  
  const handleIntervalChange = (value: string) => {
    const interval = parseInt(value, 10);
    setLogInterval(interval);
    
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current);
      logIntervalRef.current = null;
    }
    
    if (loggingActive) {
      startLogging(interval);
    }
    
    addLog(`Интервал логирования изменен на ${interval} секунд`, 'system');
  };
  
  const startLogging = (interval: number = logInterval) => {
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current);
    }
    
    analyzeKnowledgeProduction();
    
    logIntervalRef.current = setInterval(() => {
      if (open) {
        monitorKnowledgeChanges();
        
        if (Math.floor(Date.now() / 1000) % (interval * 3) < interval) {
          analyzeKnowledgeProduction();
        }
        
        if (Math.floor(Date.now() / 1000) % (interval * 2) < interval) {
          analyzeUpdateTick();
        }
      }
    }, interval * 1000);
    
    setLoggingActive(true);
    addLog(`Автоматическое логирование запущено (интервал: ${interval} сек)`, 'system');
  };
  
  const stopLogging = () => {
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current);
      logIntervalRef.current = null;
    }
    
    setLoggingActive(false);
    addLog('Автоматическое логирование остановлено', 'system');
  };
  
  const clearLogs = () => {
    setLogs([]);
    addLog('Журнал очищен', 'system');
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };
  
  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'info': return <Book className="h-4 w-4 mr-2 text-blue-500" />;
      case 'production': return <BarChart2 className="h-4 w-4 mr-2 text-green-500" />;
      case 'tick': return <Timer className="h-4 w-4 mr-2 text-amber-500" />;
      case 'calculation': return <ClipboardList className="h-4 w-4 mr-2 text-purple-500" />;
      case 'system': return <Settings className="h-4 w-4 mr-2 text-gray-500" />;
      case 'debug': return <RefreshCw className="h-4 w-4 mr-2 text-red-500" />;
      default: return <Book className="h-4 w-4 mr-2" />;
    }
  };
  
  const getLogBorderColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'info': return 'border-blue-400';
      case 'production': return 'border-green-400';
      case 'tick': return 'border-amber-400';
      case 'calculation': return 'border-purple-400';
      case 'system': return 'border-gray-400';
      case 'debug': return 'border-red-400';
      default: return 'border-blue-400';
    }
  };
  
  const analyzeResourceUpdates = () => {
    const knowledge = getKnowledgeInfo();
    if (!knowledge) return;
    
    addLog(`=== ДЕТАЛЬНЫЙ АНАЛИЗ ПРОЦЕССА ОБНОВЛЕНИЯ РЕСУРСОВ ===`, 'system');
    
    addLog(`Проверка функций обновления...`, 'debug');
    
    const currentValue = knowledge.value;
    const maxValue = knowledge.max;
    const perSecondRate = knowledge.perSecond;
    
    addLog(`Текущие параметры:`, 'info');
    addLog(`- Значение знаний: ${formatValue(currentValue, 'knowledge')}`, 'info');
    addLog(`- Максимум знаний: ${formatValue(maxValue, 'knowledge')}`, 'info');
    addLog(`- Скорость производства: ${formatValue(perSecondRate, 'knowledge')}/сек`, 'info');
    
    addLog(`Тестирование инкремента через 1 секунду...`, 'debug');
    const testIncrement = perSecondRate * 1;
    const testNewValue = Math.min(currentValue + testIncrement, maxValue);
    addLog(`Тестовый инкремент: ${formatValue(testIncrement, 'knowledge')}`, 'calculation');
    addLog(`Ожидаемое новое значение: ${formatValue(testNewValue, 'knowledge')}`, 'calculation');
    
    addLog(`Запуск тестового TICK на 1000 ms...`, 'system');
    
    const beforeTest = knowledge.value;
    
    dispatch({ 
      type: 'TICK', 
      payload: { 
        forcedUpdate: true, 
        currentTime: Date.now(), 
        deltaTime: 1000,
        forceSave: true
      } 
    });
    
    setTimeout(() => {
      const afterTest = state.resources.knowledge?.value || 0;
      
      addLog(`Значение до теста: ${formatValue(beforeTest, 'knowledge')}`, 'debug');
      addLog(`Значение после теста: ${formatValue(afterTest, 'knowledge')}`, 'debug');
      addLog(`Фактическое увеличение: ${formatValue(afterTest - beforeTest, 'knowledge')}`, 'debug');
      
      if (Math.abs((afterTest - beforeTest) - testIncrement) <= 0.001) {
        addLog(`✅ Тест прошел успешно! Инкремент работает корректно`, 'debug');
      } else {
        addLog(`❌ Тест не прошел! Ожидалось увеличение ${formatValue(testIncrement, 'knowledge')}, получено ${formatValue(afterTest - beforeTest, 'knowledge')}`, 'debug');
        
        addLog(`Структура ресурса knowledge:`, 'debug');
        addLog(`value: ${updatedKnowledge.value}, perSecond: ${updatedKnowledge.perSecond}, max: ${updatedKnowledge.max}`, 'debug');
      }
      
      addLog(`=== КОНЕЦ ДЕТАЛЬНОГО АНАЛИЗА ===`, 'system');
    }, 100);
  };
  
  useEffect(() => {
    if (open) {
      addLog(`Монитор производства знаний открыт в ${new Date().toLocaleTimeString()}`, 'system');
      
      if (loggingActive && !logIntervalRef.current) {
        startLogging();
      }
    } else {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
    }
    
    return () => {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
    };
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Book className="mr-2 h-5 w-5" />
            Монитор производства знаний
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-between items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => loggingActive ? stopLogging() : startLogging()}
              variant={loggingActive ? "destructive" : "default"}
              className="h-8"
            >
              {loggingActive ? <><Pause className="h-3 w-3 mr-1" /> Пауза</> : <><Play className="h-3 w-3 mr-1" /> Старт</>}
            </Button>
            
            <Button 
              size="sm"
              onClick={() => {
                analyzeKnowledgeProduction();
                analyzeUpdateTick();
              }}
              variant="outline"
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Обновить
            </Button>
            
            <Button 
              size="sm"
              onClick={analyzeResourceUpdates}
              variant="outline"
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Диагностика
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={logInterval.toString()} onValueChange={handleIntervalChange}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Интервал" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 секунда</SelectItem>
                <SelectItem value="2">2 секунды</SelectItem>
                <SelectItem value="5">5 секунд</SelectItem>
                <SelectItem value="10">10 секунд</SelectItem>
                <SelectItem value="30">30 секунд</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              size="sm" 
              onClick={clearLogs} 
              variant="outline"
              className="h-8"
            >
              Очистить
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Switch 
              id="auto-scroll"
              checked={autoScrollEnabled}
              onCheckedChange={setAutoScrollEnabled}
            />
            <Label htmlFor="auto-scroll">Автопрокрутка</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              id="detailed-mode"
              checked={detailedMode}
              onCheckedChange={setDetailedMode}
            />
            <Label htmlFor="detailed-mode">Подробный режим</Label>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="font-medium text-sm mb-2">
          Журнал производства и расчетов:
        </div>
        
        <ScrollArea className="flex-1 h-[400px] pr-4" ref={scrollAreaRef}>
          <div className="space-y-1.5">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">Нет записей в журнале</div>
            ) : (
              logs.map(log => (
                <div 
                  key={log.id} 
                  className={`text-xs border-l-2 pl-2 py-1.5 bg-gray-50 rounded-sm ${getLogBorderColor(log.type)}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center">
                      {getLogIcon(log.type)}
                      <span className="text-gray-500 mr-2 whitespace-nowrap">{formatTime(log.timestamp)}</span>
                    </div>
                    <span className="flex-grow">{log.message}</span>
                  </div>
                  {log.details && detailedMode && (
                    <div className="mt-1 pl-6 text-gray-600">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
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
