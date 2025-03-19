
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  Clock, 
  UserCircle, 
  Briefcase,
  X,
  RefreshCw 
} from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { isReferralHelperForBuilding, getHelperRequestId } from '@/utils/helpers';
import { updateReferralHiredStatus } from '@/api/referralService';
import { toast } from '@/hooks/use-toast';

interface ReferralCardProps {
  referral: {
    id: string;
    username: string;
    activated: boolean | string;
    hired?: boolean;
    joinedAt: number;
    assignedBuildingId?: string;
  };
  onHire?: (referralId: string, buildingId: string) => void;
  onFire?: (referralId: string) => void;
  selectedBuilding: string | null;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ 
  referral,
  onHire,
  onFire,
  selectedBuilding
}) => {
  const { state, dispatch } = useGame();
  const [isHired, setIsHired] = useState<boolean>(referral.hired || false);
  const [assignedBuilding, setAssignedBuilding] = useState<string | null>(
    referral.assignedBuildingId || null
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Определение статуса помощника с правильной проверкой типа
  const directDbStatus = typeof referral.activated === 'boolean' ? referral.activated : false;
  const isActivated = directDbStatus || 
    (typeof referral.activated === 'string' && referral.activated.toLowerCase() === 'true');
  
  // Логирование для отладки
  console.log(`Отображение карточки реферала ${referral.id}:`, {
    activated: referral.activated,
    directDbStatus,
    isActivated,
    typeOfActivated: typeof referral.activated,
    hired: isHired,
    assignedBuildingId: assignedBuilding || { _type: "undefined", value: "undefined" }
  });
  
  // Обновление статуса реферала при изменениях
  const updateReferralStatus = useCallback(() => {
    // Проверяем, есть ли для этого реферала активный запрос помощника
    if (!referral || !referral.id) return false;
    
    // Ищем активный запрос помощника для этого реферала
    const activeHelper = state.referralHelpers.find(
      h => h.helperId === referral.id && h.status === 'accepted'
    );
    
    if (activeHelper) {
      console.log(`Найден активный помощник для реферала ${referral.id}:`, activeHelper);
      setIsHired(true);
      setAssignedBuilding(activeHelper.buildingId);
      
      // Обновляем статус "hired" в состоянии реферала, если он не установлен
      if (!referral.hired) {
        dispatch({
          type: "ADD_REFERRAL",
          payload: { 
            referral: { 
              ...referral, 
              hired: true, 
              assignedBuildingId: activeHelper.buildingId 
            } 
          }
        });
      }
      
      return true;
    }
    
    // Если нет активного помощника, но в реферале указано, что он нанят
    if (referral.hired) {
      setIsHired(true);
      setAssignedBuilding(referral.assignedBuildingId || null);
      return true;
    }
    
    setIsHired(false);
    setAssignedBuilding(null);
    return false;
  }, [referral, state.referralHelpers, dispatch]);
  
  useEffect(() => {
    // Инициализация статуса
    updateReferralStatus();
    
    // Обработчик события обновления статуса реферала
    const handleStatusUpdate = (event: any) => {
      if (event.detail && event.detail.referralId === referral.id) {
        console.log(`Обновление статуса для реферала ${referral.id}:`, event.detail);
        setIsHired(event.detail.hired);
        setAssignedBuilding(event.detail.buildingId);
        
        // Показываем уведомление пользователю
        const buildingName = state.buildings[event.detail.buildingId]?.name || event.detail.buildingId;
        if (event.detail.hired) {
          toast({
            title: "Помощник нанят",
            description: `${referral.username} теперь работает на здании "${buildingName}"`,
            variant: "success"
          });
        }
      }
    };
    
    // Обработчик отладочного события
    const handleDebugEvent = (event: any) => {
      if (event.detail && (event.detail.helperId === referral.id || event.detail.referralId === referral.id)) {
        console.log(`Отладочное событие для реферала ${referral.id}:`, event.detail);
        
        // Обновляем UI и показываем сообщение
        toast({
          title: "Событие системы помощников",
          description: event.detail.message,
          variant: "default"
        });
        
        // Автоматически обновляем статус
        setTimeout(updateReferralStatus, 500);
      }
    };
    
    window.addEventListener('referral-status-updated', handleStatusUpdate);
    window.addEventListener('debug-helper-step', handleDebugEvent);
    window.addEventListener('debug-helper-boost', handleDebugEvent);
    window.addEventListener('debug-helper-personal-boost', handleDebugEvent);
    
    // Проверяем статус при изменении массива помощников
    if (state.referralHelpers.length > 0) {
      updateReferralStatus();
    }
    
    return () => {
      window.removeEventListener('referral-status-updated', handleStatusUpdate);
      window.removeEventListener('debug-helper-step', handleDebugEvent);
      window.removeEventListener('debug-helper-boost', handleDebugEvent);
      window.removeEventListener('debug-helper-personal-boost', handleDebugEvent);
    };
  }, [referral.id, state.referralHelpers, state.buildings, updateReferralStatus]);
  
  // Принудительное обновление статуса
  const handleRefresh = () => {
    setRefreshing(true);
    
    // Запускаем событие для получения обновленных данных из БД
    const refreshEvent = new CustomEvent('refresh-referrals');
    window.dispatchEvent(refreshEvent);
    
    // Обновляем локальный статус
    updateReferralStatus();
    
    // Показываем уведомление
    toast({
      title: "Обновление статуса",
      description: `Обновление статуса для реферала ${referral.username}`,
      variant: "default"
    });
    
    // Завершаем обновление через 1 секунду
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Расчет времени регистрации
  const joinedTime = referral.joinedAt ? formatDistanceToNow(
    new Date(referral.joinedAt),
    { addSuffix: true, locale: ru }
  ) : 'недавно';
  
  // Проверка, может ли реферал быть нанят на выбранное здание
  const canHire = isActivated && selectedBuilding && !isHired;
  
  // Проверка, есть ли активный запрос помощника для этого реферала и здания
  const isHelperForSelectedBuilding = selectedBuilding ? 
    isReferralHelperForBuilding(referral.id, selectedBuilding, state.referralHelpers) : 
    false;
    
  const helperRequestId = selectedBuilding ? 
    getHelperRequestId(referral.id, selectedBuilding, state.referralHelpers) : 
    null;
  
  // Обработчик нажатия кнопки найма или увольнения
  const handleActionButton = async () => {
    if (isHired) {
      // Если реферал уже нанят, увольняем его
      if (onFire) onFire(referral.id);
      
      // Обновляем статус в БД
      try {
        await updateReferralHiredStatus(referral.id, false);
        console.log(`Реферал ${referral.id} уволен, статус обновлен в БД`);
        
        toast({
          title: "Помощник уволен",
          description: `${referral.username} больше не является вашим помощником`,
          variant: "default"
        });
      } catch (error) {
        console.error(`Ошибка при обновлении статуса реферала ${referral.id}:`, error);
        
        toast({
          title: "Ошибка",
          description: "Не удалось уволить помощника. Попробуйте еще раз.",
          variant: "destructive"
        });
      }
      
      // Если реферал нанят на выбранное в данный момент здание, отменяем это назначение
      if (selectedBuilding && assignedBuilding === selectedBuilding) {
        const requestId = getHelperRequestId(referral.id, selectedBuilding, state.referralHelpers);
        if (requestId) {
          dispatch({
            type: "RESPOND_TO_HELPER_REQUEST",
            payload: { helperId: requestId, accepted: false }
          });
          console.log(`Отменено назначение помощника ${referral.id} на здание ${selectedBuilding}`);
        }
      }
      
      setIsHired(false);
      setAssignedBuilding(null);
      
      // Принудительное обновление для пересчета производства
      setTimeout(() => {
        if (typeof window.dispatchEvent === 'function') {
          const forceUpdateEvent = new CustomEvent('force-resource-update');
          window.dispatchEvent(forceUpdateEvent);
        }
      }, 500);
    } else if (canHire && selectedBuilding && onHire) {
      // Если реферал может быть нанят и выбрано здание, нанимаем его
      onHire(referral.id, selectedBuilding);
      
      toast({
        title: "Запрос отправлен",
        description: `Запрос на работу отправлен рефералу ${referral.username}`,
        variant: "default"
      });
      
      console.log(`Реферал ${referral.id} назначен помощником на здание ${selectedBuilding}`);
    }
  };
  
  // Определение содержимого бейджа статуса
  const getBadgeContent = () => {
    if (isHired) {
      return "Нанят";
    } else if (isActivated) {
      return "Активирован";
    } else {
      return "Не активирован";
    }
  };
  
  // Определение варианта бейджа статуса
  const getBadgeVariant = () => {
    if (isHired) {
      return "secondary" as const;
    } else if (isActivated) {
      return "secondary" as const;
    } else {
      return "outline" as const;
    }
  };
  
  return (
    <Card className="mb-2 overflow-hidden border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center gap-1">
            <UserCircle className="w-4 h-4" /> 
            {referral.username}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant()}>
              {getBadgeContent()}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-1 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> Присоединился {joinedTime}
        </div>
        
        {isHired && assignedBuilding && (
          <div className="flex items-center gap-1 mt-1 text-emerald-600">
            <Briefcase className="w-3 h-3" /> 
            Работает: {state.buildings[assignedBuilding]?.name || assignedBuilding}
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-2 justify-between">
        <span className="text-xs flex items-center">
          {isHired ? (
            <span className="text-emerald-600 flex items-center">
              <Check className="w-3 h-3 mr-1" /> Работает на вас
            </span>
          ) : isActivated ? (
            <span className="text-blue-600 flex items-center">
              <Check className="w-3 h-3 mr-1" /> Готов к работе
            </span>
          ) : (
            <span className="text-slate-400 flex items-center">
              <X className="w-3 h-3 mr-1" /> Не изучил основы
            </span>
          )}
        </span>
        
        {canHire && selectedBuilding && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleActionButton}
            className="h-7 text-xs"
            disabled={!isActivated || (isHired && !isHelperForSelectedBuilding)}
          >
            Нанять
          </Button>
        )}
        
        {isHired && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleActionButton}
            className="h-7 text-xs"
          >
            Уволить
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReferralCard;
