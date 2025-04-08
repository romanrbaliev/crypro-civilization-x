
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useResources } from '@/hooks/useResources';
import { useTranslation } from '@/i18n';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/helpers';

interface KnowledgeProductionMonitorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KnowledgeProductionMonitor: React.FC<KnowledgeProductionMonitorProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { state, dispatch } = useGame();
  const { formatValue } = useResources();
  const { t } = useTranslation();
  
  // Состояние для хранения данных о производстве знаний
  const [productionLogs, setProductionLogs] = useState<any[]>([]);
  
  // Обработчик события обновления знаний
  useEffect(() => {
    const handleKnowledgeUpdate = (event: any) => {
      if (event instanceof CustomEvent && event.detail) {
        const { oldValue, newValue, delta, source } = event.detail;
        
        // Добавляем новую запись в логи
        setProductionLogs(prev => {
          const newLog = {
            timestamp: Date.now(),
            oldValue,
            newValue,
            delta,
            source
          };
          
          // Ограничиваем количество записей
          return [newLog, ...prev].slice(0, 50);
        });
      }
    };
    
    window.addEventListener('knowledge-value-updated', handleKnowledgeUpdate);
    
    return () => {
      window.removeEventListener('knowledge-value-updated', handleKnowledgeUpdate);
    };
  }, []);
  
  // Форсированный пересчет всех ресурсов
  const handleForceUpdate = () => {
    dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
  };
  
  const knowledge = state.resources.knowledge;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('monitor.knowledge.title')}</SheetTitle>
          <SheetDescription>
            {t('monitor.knowledge.description')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {/* Текущее состояние знаний */}
          <div className="p-3 border rounded-md">
            <h3 className="text-sm font-medium mb-2">{t('monitor.knowledge.currentState')}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Значение:</div>
              <div className="font-mono">{formatValue(knowledge.value, 'knowledge')}</div>
              
              <div>Производство:</div>
              <div className="font-mono">{formatValue(knowledge.production, 'knowledge')}/сек</div>
              
              <div>Потребление:</div>
              <div className="font-mono">{formatValue(knowledge.consumption, 'knowledge')}/сек</div>
              
              <div>Итого:</div>
              <div className="font-mono">{formatValue(knowledge.perSecond, 'knowledge')}/сек</div>
            </div>
          </div>
          
          {/* Кнопка обновления */}
          <Button onClick={handleForceUpdate} variant="outline" size="sm" className="w-full">
            {t('monitor.knowledge.updateButton')}
          </Button>
          
          {/* Журнал событий производства знаний */}
          <div className="p-3 border rounded-md">
            <h3 className="text-sm font-medium mb-2">{t('monitor.knowledge.productionLog')}</h3>
            
            {productionLogs.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto text-xs">
                {productionLogs.map((log, index) => (
                  <div key={index} className="p-1 border-b last:border-b-0">
                    <div className="flex justify-between">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span>{log.source || 'update'}</span>
                    </div>
                    <div className="font-mono">
                      {formatValue(log.oldValue, 'knowledge')} → {formatValue(log.newValue, 'knowledge')} 
                      ({log.delta > 0 ? '+' : ''}{formatValue(log.delta, 'knowledge')})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-xs p-4">
                {t('monitor.knowledge.noLogs')}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default KnowledgeProductionMonitor;
