
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Copy, Send, MessageSquare, Users, Building, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserIdentifier, getUserReferrals } from '@/api/gameDataService';

interface ReferralsTabProps {
  onAddEvent: (message: string, type?: string) => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [referralLink, setReferralLink] = useState('');
  const [helperRequests, setHelperRequests] = useState<any[]>([]);
  const [isRefreshingReferrals, setIsRefreshingReferrals] = useState(false);
  
  // Генерация реферальной ссылки
  useEffect(() => {
    // Если код реферала уже есть в состоянии, используем его
    if (state.referralCode) {
      setReferralLink(`https://t.me/Crypto_civilization_bot?start=${state.referralCode}`);
    } else {
      // Если кода нет, генерируем новый и обновляем состояние
      const newCode = generateReferralCode();
      dispatch({ type: "SET_REFERRAL_CODE", payload: { code: newCode } });
      setReferralLink(`https://t.me/Crypto_civilization_bot?start=${newCode}`);
    }
  }, [state.referralCode, dispatch]);

  // Функция для загрузки рефералов из Supabase
  const loadReferrals = async () => {
    try {
      setIsRefreshingReferrals(true);
      const userId = await getUserIdentifier();
      console.log('Загрузка рефералов для пользователя:', userId);
      
      // Получаем рефералов из Supabase
      const referralsData = await getUserReferrals();
      console.log('Получены данные рефералов:', referralsData);
      
      if (referralsData && referralsData.length > 0) {
        // Преобразуем данные рефералов в формат для состояния
        const formattedReferrals = referralsData.map(ref => ({
          id: ref.user_id,
          username: `Пользователь ${ref.user_id.substring(0, 6)}`,
          activated: false, // По умолчанию не активирован
          joinedAt: new Date(ref.created_at).getTime()
        }));
        
        // Обновляем состояние игры
        dispatch({ 
          type: "LOAD_GAME", 
          payload: { 
            ...state, 
            referrals: mergeReferrals(state.referrals, formattedReferrals) 
          } 
        });
        
        onAddEvent(`Загружено ${formattedReferrals.length} рефералов`, "info");
      }
    } catch (error) {
      console.error('Ошибка при загрузке рефералов:', error);
      onAddEvent("Ошибка при загрузке рефералов", "error");
    } finally {
      setIsRefreshingReferrals(false);
    }
  };
  
  // Функция для объединения существующих рефералов с новыми
  const mergeReferrals = (existingReferrals = [], newReferrals = []) => {
    const mergedReferrals = [...existingReferrals];
    
    // Добавляем только те рефералы, которых еще нет в списке
    for (const newRef of newReferrals) {
      const existingIndex = mergedReferrals.findIndex(ref => ref.id === newRef.id);
      
      if (existingIndex === -1) {
        // Реферал не найден, добавляем его
        mergedReferrals.push(newRef);
      } else {
        // Реферал уже есть, обновляем его данные с сохранением статуса активации
        mergedReferrals[existingIndex] = {
          ...newRef,
          activated: mergedReferrals[existingIndex].activated
        };
      }
    }
    
    return mergedReferrals;
  };

  // Загрузка рефералов при монтировании компонента
  useEffect(() => {
    loadReferrals();
    // Периодическое обновление списка рефералов
    const intervalId = setInterval(loadReferrals, 60000); // Каждую минуту
    return () => clearInterval(intervalId);
  }, []);

  // Функция генерации реферального кода (8 значный hex код)
  const generateReferralCode = () => {
    return Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
  };

  // Копирование ссылки в буфер обмена
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast({
          title: "Ссылка скопирована",
          description: "Реферальная ссылка скопирована в буфер обмена",
        });
        onAddEvent("Реферальная ссылка скопирована в буфер обмена", "success");
      })
      .catch(err => {
        toast({
          title: "Ошибка копирования",
          description: "Не удалось скопировать ссылку",
          variant: "destructive"
        });
        onAddEvent("Ошибка при копировании реферальной ссылки", "error");
      });
  };

  // Отправка приглашения через Telegram
  const sendTelegramInvite = () => {
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к Crypto Civilization и начни строить свою криптоимперию!')}`);
        onAddEvent("Отправка приглашения через Telegram", "info");
      } catch (error) {
        console.error('Ошибка при открытии ссылки в Telegram:', error);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к Crypto Civilization и начни строить свою криптоимперию!')}`, '_blank');
      }
    } else {
      // Fallback для браузеров без Telegram WebApp
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к Crypto Civilization и начни строить свою криптоимперию!')}`, '_blank');
    }
  };

  // Обновить список рефералов вручную
  const handleRefreshReferrals = () => {
    loadReferrals();
    onAddEvent("Обновление списка рефералов...", "info");
  };

  // Запрос на наем помощника
  const hireHelper = async (referralId: string) => {
    if (!selectedBuildingId) {
      toast({
        title: "Ошибка",
        description: "Выберите здание для помощника",
        variant: "destructive"
      });
      return;
    }

    try {
      const userId = await getUserIdentifier();
      
      // Обновляем состояние игры
      dispatch({ 
        type: "HIRE_REFERRAL_HELPER", 
        payload: { 
          referralId, 
          buildingId: selectedBuildingId 
        } 
      });

      // Записываем в Supabase информацию о запросе на наем помощника
      const { data, error } = await supabase
        .from('referral_helpers')
        .insert({
          employer_id: userId,
          helper_id: referralId,
          building_id: selectedBuildingId,
          status: 'pending'
        });

      if (error) {
        console.error("Ошибка при отправке запроса в БД:", error);
        throw error;
      }

      toast({
        title: "Приглашение отправлено",
        description: "Ожидаем ответа помощника",
      });
      onAddEvent("Приглашение помощника отправлено", "success");
    } catch (error) {
      console.error("Ошибка при отправке приглашения:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить приглашение",
        variant: "destructive"
      });
    }
  };

  // Загрузка запросов на должность помощника
  useEffect(() => {
    const loadHelperRequests = async () => {
      try {
        const userId = await getUserIdentifier();
        
        const { data, error } = await supabase
          .from('referral_helpers')
          .select('*')
          .eq('helper_id', userId)
          .eq('status', 'pending');

        if (error) {
          console.error("Ошибка при загрузке запросов:", error);
          return;
        }

        setHelperRequests(data || []);
      } catch (error) {
        console.error("Ошибка при загрузке запросов помощника:", error);
      }
    };

    loadHelperRequests();
    // Периодическое обновление запросов на работу
    const intervalId = setInterval(loadHelperRequests, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Ответ на запрос о найме
  const respondToHelperRequest = async (helperId: string, accepted: boolean) => {
    try {
      // Обновляем состояние игры
      dispatch({ 
        type: "RESPOND_TO_HELPER_REQUEST", 
        payload: { 
          helperId, 
          accepted 
        } 
      });

      // Обновляем статус в Supabase
      const { error } = await supabase
        .from('referral_helpers')
        .update({ status: accepted ? 'accepted' : 'rejected' })
        .eq('id', helperId);

      if (error) {
        console.error("Ошибка при обновлении статуса:", error);
        throw error;
      }

      // Обновляем локальный список запросов
      setHelperRequests(prev => prev.filter(req => req.id !== helperId));

      toast({
        title: accepted ? "Вы приняли предложение" : "Вы отклонили предложение",
        description: accepted ? "Теперь вы получаете бонус +10% к производительности" : "Предложение отклонено",
      });
      onAddEvent(accepted ? "Вы приняли предложение о работе" : "Вы отклонили предложение о работе", accepted ? "success" : "info");
    } catch (error) {
      console.error("Ошибка при ответе на запрос:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать ваш ответ",
        variant: "destructive"
      });
    }
  };

  const totalReferrals = state.referrals?.length || 0;
  const activeReferrals = state.referrals?.filter(ref => ref.activated)?.length || 0;

  // Фильтрация рефералов по активности
  const filteredReferrals = currentTab === 'active' 
    ? (state.referrals || []).filter(ref => ref.activated)
    : (state.referrals || []);

  const availableBuildings = Object.values(state.buildings || {})
    .filter(b => b.count > 0);

  // Проверка на наличие запросов о работе
  const hasHelperRequests = helperRequests.length > 0;

  return (
    <div className="p-2 flex flex-col h-full">
      <div className="mb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-medium mb-1">Реферальная программа</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-5 text-[9px] px-2"
            onClick={handleRefreshReferrals}
            disabled={isRefreshingReferrals}
          >
            {isRefreshingReferrals ? 'Обновление...' : 'Обновить'}
          </Button>
        </div>
        <p className="text-[10px] text-gray-600 mb-2">
          +5% к производительности за каждого активного реферала
        </p>
        
        <div className="bg-gray-50 p-2 rounded-lg border mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-medium">Ваша реферальная ссылка:</div>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" className="h-5 w-5 p-0" onClick={copyReferralLink}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-5 w-5 p-0" onClick={sendTelegramInvite}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="text-[9px] bg-white border rounded p-1 truncate">
            {referralLink}
          </div>
        </div>

        <div className="text-[10px] text-gray-500">
          Приглашено: {totalReferrals} | Активировано: {activeReferrals}
        </div>
      </div>

      <Separator className="my-2" />

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all" className="text-[10px] h-6">
              <Users className="h-3 w-3 mr-1" />
              Все
            </TabsTrigger>
            <TabsTrigger value="active" className="text-[10px] h-6">
              <Users className="h-3 w-3 mr-1" />
              Активные
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-[10px] h-6 relative">
              <MessageSquare className="h-3 w-3 mr-1" />
              Запросы
              {hasHelperRequests && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-2">
            {filteredReferrals.length > 0 ? (
              <div className="space-y-1.5">
                {filteredReferrals.map(referral => (
                  <div 
                    key={referral.id} 
                    className={`flex justify-between items-center p-1.5 rounded-lg border ${referral.activated ? 'bg-green-50' : 'bg-white'}`}
                  >
                    <div>
                      <div className="text-[10px] font-medium">{referral.username}</div>
                      <div className="text-[9px] text-gray-500">
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {referral.activated && (
                        <div className="text-[8px] text-green-600 bg-green-100 px-1 py-0.5 rounded">
                          Активен
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px]">У вас пока нет рефералов</p>
                <p className="text-[9px] mt-1">Поделитесь своей реферальной ссылкой</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-2">
            {filteredReferrals.length > 0 ? (
              <div className="space-y-1.5">
                {filteredReferrals.map(referral => (
                  <div 
                    key={referral.id} 
                    className="flex justify-between items-center p-1.5 rounded-lg border bg-green-50"
                  >
                    <div>
                      <div className="text-[10px] font-medium">{referral.username}</div>
                      <div className="text-[9px] text-gray-500">
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 px-2 text-[9px]"
                        >
                          <Building className="h-3 w-3 mr-1" />
                          Нанять
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xs">
                        <DialogHeader>
                          <DialogTitle className="text-sm">Нанять помощника</DialogTitle>
                          <DialogDescription className="text-[10px]">
                            Выберите здание, к которому хотите прикрепить помощника
                          </DialogDescription>
                        </DialogHeader>
                        <Select
                          value={selectedBuildingId}
                          onValueChange={setSelectedBuildingId}
                        >
                          <SelectTrigger className="text-[10px]">
                            <SelectValue placeholder="Выберите здание" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBuildings.map(building => (
                              <SelectItem 
                                key={building.id} 
                                value={building.id}
                                className="text-[10px]"
                              >
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-[9px] text-gray-500 mt-2">
                          Эффективность здания увеличится на 5%
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            size="sm"
                            className="text-[9px] h-6"
                            onClick={() => hireHelper(referral.id)}
                          >
                            Отправить приглашение
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px]">У вас пока нет активных рефералов</p>
                <p className="text-[9px] mt-1">Рефералы становятся активными после покупки Генератора</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-2">
            {helperRequests.length > 0 ? (
              <div className="space-y-1.5">
                {helperRequests.map(request => (
                  <div 
                    key={request.id} 
                    className="p-1.5 rounded-lg border bg-blue-50"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-[10px] font-medium">Предложение работы</div>
                      <div className="text-[9px] text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-[9px] mb-2">
                      Здание: <span className="font-medium">{state.buildings[request.building_id]?.name || request.building_id}</span>
                    </div>
                    <div className="text-[9px] text-gray-600 mb-2">
                      Вы получите +10% к производительности, если примете предложение
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-2 text-[9px]"
                        onClick={() => respondToHelperRequest(request.id, false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Отклонить
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-6 px-2 text-[9px]"
                        onClick={() => respondToHelperRequest(request.id, true)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Принять
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px]">У вас нет запросов о работе</p>
                <p className="text-[9px] mt-1">Здесь будут отображаться предложения о найме от других игроков</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReferralsTab;
