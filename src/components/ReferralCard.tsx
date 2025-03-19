
import React, { useState, useEffect } from 'react';
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
  X 
} from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { isReferralHelperForBuilding, getHelperRequestId } from '@/utils/helpers';
import { updateReferralHiredStatus } from '@/api/referralService';

interface ReferralCardProps {
  referral: {
    id: string;
    username: string;
    activated: boolean;
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
  
  // Определение статуса помощника
  const directDbStatus = typeof referral.activated === 'boolean' ? referral.activated : false;
  const isActivated = directDbStatus || 
    (typeof referral.activated === 'string' && referral.activated.toLowerCase() === 'true');
  
  useEffect(() => {
    // Проверяем, есть ли для этого реферала активный запрос помощника
    const checkIfHelperActive = () => {
      if (!referral || !referral.id) return false;
      
      // Ищем активный запрос помощника для этого реферала
      const activeHelper = state.referralHelpers.find(
        h => h.helperId === referral.id && h.status === 'accepted'
      );
      
      if (activeHelper) {
        setIsHired(true);
        setAssignedBuilding(activeHelper.buildingId);
        return true;
      }
      
      setIsHired(!!referral.hired);
      setAssignedBuilding(referral.assignedBuildingId || null);
      return !!referral.hired;
    };
    
    checkIfHelperActive();
    
    // Обработчик события обновления статуса реферала
    const handleStatusUpdate = (event: any) => {
      if (event.detail && event.detail.referralId === referral.id) {
        setIsHired(event.detail.hired);
        setAssignedBuilding(event.detail.buildingId);
      }
    };
    
    window.addEventListener('referral-status-updated', handleStatusUpdate);
    
    return () => {
      window.removeEventListener('referral-status-updated', handleStatusUpdate);
    };
  }, [referral, state.referralHelpers]);
  
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
      await updateReferralHiredStatus(referral.id, false);
      
      // Если реферал нанят на выбранное в данный момент здание, отменяем это назначение
      if (selectedBuilding && assignedBuilding === selectedBuilding) {
        const requestId = getHelperRequestId(referral.id, selectedBuilding, state.referralHelpers);
        if (requestId) {
          dispatch({
            type: "RESPOND_TO_HELPER_REQUEST",
            payload: { helperId: requestId, accepted: false }
          });
        }
      }
      
      setIsHired(false);
      setAssignedBuilding(null);
    } else if (canHire && selectedBuilding && onHire) {
      // Если реферал может быть нанят и выбрано здание, нанимаем его
      onHire(referral.id, selectedBuilding);
    }
  };
  
  // Логи для отладки
  console.log(`Отображение карточки реферала ${referral.id}:`, {
    activated: referral.activated,
    directDbStatus,
    isActivated,
    typeOfActivated: typeof referral.activated,
    assignedBuildingId: {
      _type: typeof referral.assignedBuildingId,
      value: String(referral.assignedBuildingId)
    }
  });
  
  return (
    <Card className="mb-2 overflow-hidden border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center gap-1">
            <UserCircle className="w-4 h-4" /> 
            {referral.username}
          </CardTitle>
          <Badge variant={isActivated ? "success" : "outline"}>
            {isActivated ? "Активирован" : "Не активирован"}
          </Badge>
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
          {isActivated ? (
            isHired ? (
              <Check className="w-3 h-3 text-emerald-600 mr-1" />
            ) : (
              <span className="text-blue-600 flex items-center">
                <Check className="w-3 h-3 mr-1" /> Готов к работе
              </span>
            )
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
