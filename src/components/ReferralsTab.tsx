import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import { Copy, UserPlus, UserCheck, Clock, Award, Briefcase, FolderInput } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { saveReferralInfo, activateReferral } from '@/api/gameDataService';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

interface ReferralsTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const { referralCode, referrals, referralHelpers } = state;
  const [activeTab, setActiveTab] = useState("code");
  const isMobile = useIsMobile();
  
  const copyToClipboard = () => {
    if (!referralCode) return;
    
    navigator.clipboard.writeText(referralCode)
      .then(() => {
        toast({
          title: "Скопировано!",
          description: "Реферальный код скопирован в буфер обмена.",
          variant: "success",
        });
      })
      .catch((err) => {
        console.error('Ошибка при копировании: ', err);
        toast({
          title: "Ошибка копирования",
          description: "Не удалось скопировать код в буфер обмена.",
          variant: "destructive",
        });
      });
  };
  
  const activateUserReferral = (referralId: string) => {
    dispatch({ type: "ACTIVATE_REFERRAL", payload: { referralId } });
    onAddEvent(`Активирован реферал ${referrals.find(r => r.id === referralId)?.username || referralId}`, "success");
  };
  
  const getHelperStatus = (referralId: string, buildingId: string) => {
    const helper = referralHelpers.find(
      h => h.helperId === referralId && h.buildingId === buildingId && (h.status === 'pending' || h.status === 'accepted')
    );
    
    return helper?.status || null;
  };
  
  const getHelperId = (referralId: string) => {
    const helper = referralHelpers.find(
      h => h.helperId === referralId && (h.status === 'pending' || h.status === 'accepted')
    );
    
    return helper?.id || null;
  };
  
  const hireHelper = (referralId: string) => {
    const buildingId = "practice";
    
    console.log("Нанимаем помощника для здания:", buildingId);
    
    dispatch({ 
      type: "HIRE_REFERRAL_HELPER", 
      payload: { 
        referralId,
        buildingId
      } 
    });
  };
  
  const respondToHelper = (helperId: string, accepted: boolean) => {
    dispatch({
      type: "RESPOND_TO_HELPER_REQUEST",
      payload: {
        helperId,
        accepted
      }
    });
  };
  
  const getActiveReferralsCount = () => {
    return referrals.filter(ref => ref.activated).length;
  };
  
  const calculateTotalBonus = () => {
    const activeCount = getActiveReferralsCount();
    return activeCount * 5;
  };
  
  const getHelperTypeMessage = (referralId: string) => {
    const pendingHelper = referralHelpers.find(
      h => h.helperId === referralId && h.status === 'pending'
    );
    
    if (pendingHelper) {
      return "Ожидает ответа";
    }
    
    const acceptedHelper = referralHelpers.find(
      h => h.helperId === referralId && h.status === 'accepted'
    );
    
    if (acceptedHelper) {
      return "Помогает вам";
    }
    
    return null;
  };
  
  const getPendingHelpRequests = () => {
    return referralHelpers.filter(h => 
      referrals.some(r => r.id === h.helperId) && h.status === 'pending'
    );
  };
  
  const getBuildingName = (buildingId: string) => {
    const building = state.buildings[buildingId];
    return building ? building.name : buildingId;
  };
  
  const getReferralName = (helperId: string) => {
    const referral = referrals.find(r => r.id === helperId);
    return referral ? referral.username : helperId;
  };
  
  const hasHelperRequests = getPendingHelpRequests().length > 0;
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="grid grid-cols-3 mb-2">
        <TabsTrigger value="code" className="text-xs">
          <UserPlus className="h-3 w-3 mr-1" />
          Ваш код
        </TabsTrigger>
        <TabsTrigger value="active" className="text-xs relative">
          <UserCheck className="h-3 w-3 mr-1" />
          Рефералы
          {referrals.length > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full text-[8px] min-w-[14px] h-[14px] flex items-center justify-center">
              {referrals.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="help" className="text-xs relative">
          <Briefcase className="h-3 w-3 mr-1" />
          Помощь
          {getPendingHelpRequests().length > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full text-[8px] min-w-[14px] h-[14px] flex items-center justify-center">
              {getPendingHelpRequests().length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="code" className="flex-1 overflow-auto">
        <div className="text-center py-4">
          <UserPlus className="h-10 w-10 mx-auto mb-2 text-blue-500" />
          <h3 className="text-sm font-semibold mb-2">Пригласите друзей</h3>
          <p className="text-xs text-gray-500 mb-4">Получите бонус +5% к производительности за каждого активного реферала!</p>
          
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-100 px-3 py-2 rounded-l border border-gray-300">
              <p className="text-xs font-mono">{referralCode}</p>
            </div>
            <Button 
              onClick={copyToClipboard} 
              variant="outline" 
              size="sm" 
              className="rounded-l-none"
            >
              <Copy className="h-4 w-4" />
              <span className="ml-1 text-xs">Копировать</span>
            </Button>
          </div>
          
          {getActiveReferralsCount() > 0 && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-xs font-semibold flex items-center justify-center">
                <Award className="h-4 w-4 mr-1 text-blue-500" />
                Ваш текущий бонус
              </h4>
              <p className="text-lg font-bold text-blue-600">+{calculateTotalBonus()}%</p>
              <p className="text-[10px] text-gray-500">
                {getActiveReferralsCount()} активных {getActiveReferralsCount() === 1 ? 'реферал' : 'рефералов'}
              </p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="active" className="flex-1 overflow-auto">
        {referrals.length > 0 ? (
          <div className="space-y-3 p-2">
            {referrals.map((referral) => (
              <div key={referral.id} className="border rounded-lg p-3 relative bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{referral.username}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Присоединился: {new Date(referral.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {referral.activated ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Активен
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px]"
                      onClick={() => activateUserReferral(referral.id)}
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      Активировать
                    </Button>
                  )}
                </div>
                
                {referral.activated && (
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-[10px] text-gray-600 flex items-center">
                      <Award className="h-3 w-3 mr-1 text-amber-500" />
                      +5% к производительности
                    </div>
                    
                    <div className="flex space-x-2">
                      {getHelperTypeMessage(referral.id) ? (
                        <div className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {getHelperTypeMessage(referral.id)}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-[10px] ${isMobile ? 'px-2' : ''}`}
                          onClick={() => hireHelper(referral.id)}
                        >
                          <Briefcase className="h-3 w-3 mr-1" />
                          {isMobile ? '' : 'Нанять'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">У вас пока нет рефералов</p>
            <p className="text-[10px] mt-2">Поделитесь своим реферальным кодом с друзьями</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="help" className="flex-1 overflow-auto">
        {hasHelperRequests ? (
          <div className="space-y-3 p-2">
            {getPendingHelpRequests().map((request) => (
              <div key={request.id} className="border rounded-lg p-3 relative bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      <FolderInput className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{getReferralName(request.helperId)}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Предлагает помощь для здания: {getBuildingName(request.buildingId)}
                    </p>
                  </div>
                  
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Ожидает ответа
                  </span>
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-[10px]"
                    onClick={() => respondToHelper(request.id, false)}
                  >
                    Отклонить
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-[10px]"
                    onClick={() => respondToHelper(request.id, true)}
                  >
                    Принять
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">Нет запросов на помощь</p>
            <p className="text-[10px] mt-2">Здесь будут отображаться предложения о помощи</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ReferralsTab;

