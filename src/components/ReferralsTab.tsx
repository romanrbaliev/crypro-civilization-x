import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Copy, Send, MessageSquare, Users, Building, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
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
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getUserIdentifier } from '@/api/gameDataService';
import { useIsMobile } from '@/hooks/use-mobile';
import { checkSupabaseConnection } from '@/api/connectionUtils';

interface ReferralsTabProps {
  onAddEvent: (message: string, type?: string) => void;
}

interface ReferralItemProps {
  referral: any;
  userBuildings: any;
  helperRequests: any[];
  ownedReferral: boolean;
  onHire: (referralId: string, buildingId: string) => void;
  onFire: (referralId: string, buildingId: string) => void;
  onLoadAvailableBuildings: (referralId: string) => void;
  availableBuildings: any[];
  isMobile: boolean;
  selectedBuildingId: string;
  setSelectedBuildingId: (id: string) => void;
  isHelperAssigned: (referralId: string, buildingId: string) => boolean;
  assignedBuildingId?: string;
}

const ReferralItem: React.FC<ReferralItemProps> = ({
  referral,
  userBuildings,
  helperRequests,
  ownedReferral,
  onHire,
  onFire,
  onLoadAvailableBuildings,
  availableBuildings,
  isMobile,
  selectedBuildingId,
  setSelectedBuildingId,
  isHelperAssigned,
  assignedBuildingId
}) => {
  const isAssigned = Boolean(assignedBuildingId);
  
  const [directDbStatus, setDirectDbStatus] = useState<boolean | null>(null);
  
  const isActivated = directDbStatus !== null 
    ? directDbStatus 
    : (typeof referral.activated === 'boolean' 
        ? referral.activated 
        : String(referral.activated).toLowerCase() === 'true');
  
  useEffect(() => {
    const checkStatusInDb = async () => {
      try {
        const { data, error } = await supabase
          .from('referral_data')
          .select('is_activated')
          .eq('user_id', referral.id)
          .single();
          
        if (!error && data) {
          console.log(`Статус активации из БД для ${referral.id}:`, data.is_activated);
          setDirectDbStatus(data.is_activated === true);
        } else {
          console.error(`Ошибка при получении статуса из БД для ${referral.id}:`, error);
        }
      } catch (e) {
        console.error(`Ошибка при проверке статуса в БД для ${referral.id}:`, e);
      }
    };
    
    checkStatusInDb();
  }, [referral.id]);
  
  console.log(`Отображение карточки реферала ${referral.id}:`, {
    activated: referral.activated,
    directDbStatus,
    isActivated,
    typeOfActivated: typeof referral.activated,
    assignedBuildingId
  });
  
  return (
    <div className="p-1.5 rounded-lg border bg-white relative">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="text-[10px] font-medium">{referral.username}</div>
          <div className="text-[9px] text-gray-500">
            ID: <span className="font-mono">{referral.id}</span>
          </div>
          <div className="text-[9px] text-gray-500">
            Присоединился: {new Date(referral.joinedAt).toLocaleDateString()}
          </div>
          <div className="text-[9px] mt-1">
            Статус: {' '}
            <span className={isActivated ? "text-green-600" : "text-gray-500"}>
              {isActivated ? "Активирован" : "Не активирован"}
            </span>
          </div>
          {isAssigned && assignedBuildingId && (
            <div className="text-[9px] text-green-600 mt-0.5">
              {isHelperAssigned(referral.id, assignedBuildingId) ? "Помогает" : "Работает"} в здании
            </div>
          )}
        </div>
        
        {isActivated && !ownedReferral && (
          <div className="ml-2 flex-shrink-0">
            {isAssigned ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-[9px]"
                onClick={() => onFire(referral.id, assignedBuildingId as string)}
              >
                Уволить
              </Button>
            ) : (
              <Dialog onOpenChange={(open) => {
                if (open) onLoadAvailableBuildings(referral.id);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 text-[9px]"
                  >
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
                  
                  {availableBuildings.length > 0 ? (
                    <>
                      <div className="grid gap-3 py-2">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Здание</Label>
                          <Select
                            value={selectedBuildingId}
                            onValueChange={setSelectedBuildingId}
                          >
                            <SelectTrigger className="h-7 text-[10px]">
                              <SelectValue placeholder="Выберите здание" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableBuildings.map(building => (
                                <SelectItem 
                                  key={building.id} 
                                  value={building.id}
                                  className="text-[10px]"
                                >
                                  {building.name} (x{building.count})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          size="sm" 
                          className="h-7 text-[10px]"
                          onClick={() => onHire(referral.id, selectedBuildingId)}
                        >
                          Нанять помощника
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <div className="py-3 text-center">
                      <AlertCircle className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                      <p className="text-[11px]">
                        Нет доступных зданий для сотрудничества с этим рефералом
                      </p>
                      <p className="text-[9px] text-gray-500 mt-1">
                        Для найма помощника у вас и у реферала должны быть одинаковые здания
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ReferralsTab: React.FC<ReferralsTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [referralLink, setReferralLink] = useState('');
  const [helperRequests, setHelperRequests] = useState<any[]>([]);
  const [isRefreshingReferrals, setIsRefreshingReferrals] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [telegramUserInfo, setTelegramUserInfo] = useState<any>(null);
  const [availableBuildings, setAvailableBuildings] = useState<any[]>([]);
  const isMobile = useIsMobile();

  const REFERRAL_TABLE = 'referral_data';
  const SAVES_TABLE = 'game_saves';

  useEffect(() => {
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp) {
      try {
        const tg = window.Telegram.WebApp;
        if (tg.initDataUnsafe?.user) {
          setTelegramUserInfo(tg.initDataUnsafe.user);
          console.log('Информация о пользователе Telegram в ReferralsTab:', tg.initDataUnsafe.user);
        } else {
          console.log('Telegram WebApp доступен, но данные пользователя отсутствуют в ReferralsTab');
        }
      } catch (error) {
        console.error('Ошибка при получении информации Telegram в ReferralsTab:', error);
      }
    } else {
      console.log('Telegram WebApp недоступен в ReferralsTab');
    }
  }, []);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const id = await getUserIdentifier();
        setUserId(id);
        console.log(`ReferralsTab: Текущий пользователь ID: ${id}`);
      } catch (error) {
        console.error('Ошибка при получении ID пользователя:', error);
      }
    };
    
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (state.referralCode) {
      setReferralLink(`https://t.me/Crypto_civilization_bot/app?startapp=${state.referralCode}`);
      console.log(`ReferralsTab: Используем существующий реферальный код: ${state.referralCode}`);
    } else {
      const newCode = generateReferralCode();
      dispatch({ type: "SET_REFERRAL_CODE", payload: { code: newCode } });
      setReferralLink(`https://t.me/Crypto_civilization_bot/app?startapp=${newCode}`);
      console.log(`ReferralsTab: Сгенерирован новый реферальный код: ${newCode}`);
    }
  }, [state.referralCode, dispatch, userId]);

  const loadReferrals = async () => {
    try {
      setIsRefreshingReferrals(true);
      const id = await getUserIdentifier();
      console.log('Загрузка рефералов для пользователя:', id);
      
      const { data: userData } = await supabase
        .from(REFERRAL_TABLE)
        .select('referral_code')
        .eq('user_id', id)
        .single();
        
      if (userData && userData.referral_code) {
        console.log('Реферальный код пользователя:', userData.referral_code);
        
        const { data: directReferrals } = await supabase
          .from(REFERRAL_TABLE)
          .select('user_id, created_at, referred_by')
          .eq('referred_by', userData.referral_code);
          
        console.log('Найденные рефералы напрямую из базы:', directReferrals);
        
        if (directReferrals && directReferrals.length > 0) {
          const formattedReferrals = directReferrals.map(ref => ({
            id: ref.user_id,
            username: `ID: ${ref.user_id}`,
            activated: true,
            joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
          }));
          
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { 
              ...state, 
              referrals: formattedReferrals 
            } 
          });
          
          onAddEvent(`Загружено ${formattedReferrals.length} рефералов напрямую из базы`, "success");
          setIsRefreshingReferrals(false);
          return;
        }
      }
      
      if (state.referrals && state.referrals.length > 0) {
        console.log('Используем существующие рефералы из состояния:', state.referrals);
        onAddEvent(`Отображаем ${state.referrals.length} существующих рефералов`, "info");
      } else {
        onAddEvent("У вас пока нет рефералов", "info");
      }
    } catch (error) {
      console.error('Ошибка при загрузке рефералов:', error);
      onAddEvent("Ошибка при загрузке рефералов", "error");
    } finally {
      setIsRefreshingReferrals(false);
    }
  };

  const forceRefreshReferrals = async () => {
    try {
      setIsRefreshingReferrals(true);
      const id = await getUserIdentifier();
      console.log('Принудительное обновление рефералов для пользователя:', id);
      
      const isConnected = await checkSupabaseConnection();
      
      if (!isConnected) {
        console.error('❌ Ошибка соединения с Supabase при обновлении рефералов');
        onAddEvent("Ошибка соединения с базой данных", "error");
        setIsRefreshingReferrals(false);
        return;
      }
      
      console.log('✅ Соединение с Supabase подтверждено при обновлении рефералов');
      
      const { data: userData, error: userError } = await supabase
        .from('referral_data')
        .select('referral_code')
        .eq('user_id', id)
        .maybeSingle();
      
      if (userError) {
        console.error('❌ Ошибка при получении данных пользователя:', userError);
        onAddEvent("Ошибка при получении данных пользователя", "error");
        setIsRefreshingReferrals(false);
        return;
      }
      
      if (!userData || !userData.referral_code) {
        console.warn('⚠️ Реферальный код не найден для пользователя', id);
        onAddEvent("Реферальный код не найден", "warning");
        setIsRefreshingReferrals(false);
        return;
      }
      
      console.log('Найден реферальный код в базе:', userData.referral_code);
      
      const { data: directReferrals, error: referralError } = await supabase
        .from('referral_data')
        .select('user_id, created_at, referred_by, is_activated')
        .eq('referred_by', userData.referral_code);
        
      if (referralError) {
        console.error('❌ Ошибка при получении рефералов:', referralError);
        onAddEvent("Ошибка при получении данных рефералов", "error");
        setIsRefreshingReferrals(false);
        return;
      }
      
      console.log('Найдено рефералов в базе данных:', directReferrals?.length || 0);
      console.log('Детальные данные рефералов из базы:', JSON.stringify(directReferrals, null, 2));
      
      if (!directReferrals || directReferrals.length === 0) {
        console.log('⚠️ Не найдено рефералов для этого пользователя');
        onAddEvent("Рефералы не найдены в базе данных", "info");
        setIsRefreshingReferrals(false);
        return;
      }
      
      const updatedReferrals = await Promise.all((directReferrals || []).map(async (ref) => {
        const { data: activationData, error: activationError } = await supabase
          .from('referral_data')
          .select('is_activated')
          .eq('user_id', ref.user_id)
          .single();
          
        if (activationError) {
          console.error(`❌ Ошибка при получении статуса активации для ${ref.user_id}:`, activationError);
          return {
            id: ref.user_id,
            username: `ID: ${ref.user_id.substring(0, 6)}`,
            activated: false,
            typeOfActivated: 'boolean',
            joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
          };
        }
          
        const isActivated = activationData?.is_activated === true;
        
        console.log(`Обновление статуса для реферала ${ref.user_id}:`, {
          dbStatus: activationData?.is_activated,
          isActivated
        });
        
        dispatch({
          type: "UPDATE_REFERRAL_STATUS",
          payload: {
            referralId: ref.user_id,
            activated: isActivated
          }
        });
          
        return {
          id: ref.user_id,
          username: `ID: ${ref.user_id.substring(0, 6)}`,
          activated: isActivated,
          typeOfActivated: typeof isActivated,
          joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
        };
      }));
      
      console.log('Обновленные данные рефералов для сохранения:', 
        JSON.stringify(updatedReferrals, null, 2));
      
      dispatch({ 
        type: "LOAD_GAME", 
        payload: { 
          ...state, 
          referrals: updatedReferrals 
        } 
      });
      
      const activeCount = updatedReferrals.filter(r => r.activated === true).length;
      onAddEvent(`Обновлено ${updatedReferrals.length} рефералов. Активных: ${activeCount}`, "success");
      
      const refreshEvent = new CustomEvent('refresh-referrals');
      window.dispatchEvent(refreshEvent);
      
    } catch (error) {
      console.error('❌ Ошибка при обновлении рефералов:', error);
      onAddEvent("Ошибка при обновлении рефералов", "error");
    } finally {
      setIsRefreshingReferrals(false);
    }
  };

  useEffect(() => {
    console.log('ReferralsTab: Монтирование компонента, загружаем рефералов...');
    loadReferrals();
    const intervalId = setInterval(loadReferrals, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const generateReferralCode = () => {
    return Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
  };

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
          description: "Не удается скопировать ссылку",
          variant: "destructive"
        });
        onAddEvent("Ошибка при копировании реферальной ссылки", "error");
      });
  };

  const sendTelegramInvite = () => {
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp) {
      try {
        if (window.Telegram.WebApp.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к Crypto Civilization и начни строить свою криптоимперию!')}`);
          onAddEvent("Отправка приглашения через Telegram", "info");
        } else {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к Crypto Civilization и начни строить свою криптоимперию!')}`, '_blank');
        }
      } catch (error) {
        console.error('Ошибка при открытии ссылки в Telegram:', error);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к Crypto Civilization и начни строить свою криптоимперию!')}`, '_blank');
      }
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к Crypto Civilization и начни строить свою криптоимперию!')}`, '_blank');
    }
  };

  const handleRefreshReferrals = () => {
    forceRefreshReferrals();
    onAddEvent("Обновление списка рефералов...", "info");
  };

  const getCompatibleBuildings = async (referralId: string) => {
    try {
      console.log(`Получение доступных зданий для реферала ${referralId}`);
      
      const userBuildings = Object.entries(state.buildings)
        .filter(([_, building]) => building.count > 0)
        .map(([id, building]) => ({
          id,
          name: building.name,
          count: building.count
        }));
      
      console.log('Здания пользователя:', userBuildings);
      
      const { data } = await supabase
        .from(SAVES_TABLE)
        .select('game_data')
        .eq('user_id', referralId)
        .single();
      
      if (!data || !data.game_data) {
        console.log('Данные реферала не найдены, возвращаем только здания пользователя');
        return userBuildings;
      }
      
      let referralGameData;
      try {
        referralGameData = typeof data.game_data === 'string' 
          ? JSON.parse(data.game_data) 
          : data.game_data;
      } catch (e) {
        console.error('Ошибка при парсинге данных реферала:', e);
        return userBuildings;
      }
      
      if (!referralGameData.buildings) {
        console.log('У реферала нет зданий, возвращаем только здания пользователя');
        return userBuildings;
      }
      
      const referralBuildings = Object.entries(referralGameData.buildings)
        .filter(([_, building]: [string, any]) => building.count > 0)
        .map(([id, building]: [string, any]) => ({
          id,
          name: building.name,
          count: building.count
        }));
      
      console.log('Здания реферала:', referralBuildings);
      
      const commonBuildings = userBuildings.filter(userBuilding => 
        referralBuildings.some(referralBuilding => referralBuilding.id === userBuilding.id)
      );
      
      console.log('Общие здания:', commonBuildings);
      
      return commonBuildings;
    } catch (error) {
      console.error('Ошибка при получении совместимых зданий:', error);
      return [];
    }
  };

  const getBuildingResources = (buildingId: string) => {
    const building = state.buildings[buildingId];
    if (!building) return [];
    
    return Object.entries(building.production)
      .filter(([_, amount]) => amount > 0)
      .map(([resourceId, amount]) => {
        const resource = state.resources[resourceId];
        return {
          id: resourceId,
          name: resource?.name || resourceId,
          amount: amount
        };
      });
  };

  const hireHelper = async (referralId: string, buildingId: string) => {
    if (!buildingId) {
      toast({
        title: "Ошибка",
        description: "Выберите здание для помощника",
        variant: "destructive"
      });
      return;
    }

    try {
      const userId = await getUserIdentifier();
      
      dispatch({ 
        type: "HIRE_REFERRAL_HELPER", 
        payload: { 
          referralId, 
          buildingId 
        } 
      });

      const { data, error } = await supabase
        .from('referral_helpers')
        .insert({
          employer_id: userId,
          helper_id: referralId,
          building_id: buildingId,
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

  const fireHelper = async (referralId: string, buildingId: string) => {
    try {
      if (!buildingId) {
        toast({
          title: "Ошибка",
          description: "Не указано здание для увольнения помощника",
          variant: "destructive"
        });
        return;
      }

      console.log(`Увольнение помощника: реферал ID ${referralId}, здание ID ${buildingId}`);
      
      const helper = state.referralHelpers.find(
        h => h.helperId === referralId && h.buildingId === buildingId && h.status === 'accepted'
      );
      
      if (!helper) {
        console.error("Не найден активный помощник для увольнения");
        toast({
          title: "Ошибка",
          description: "Не найден активный помощник для увольнения",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('referral_helpers')
        .update({ status: 'rejected' })
        .eq('helper_id', referralId)
        .eq('building_id', buildingId)
        .eq('status', 'accepted');
        
      if (error) {
        console.error("Ошибка при увольнении помощника в БД:", error);
        throw error;
      }
      
      const updatedHelpers = state.referralHelpers.map(h => 
        (h.helperId === referralId && h.buildingId === buildingId && h.status === 'accepted')
          ? { ...h, status: 'rejected' as const }
          : h
      );
      
      dispatch({ 
        type: "LOAD_GAME", 
        payload: { 
          ...state, 
          referralHelpers: updatedHelpers 
        } 
      });
      
      toast({
        title: "Помощник уволен",
        description: "Бонус к производительности здания отменён",
      });
      onAddEvent("Помощник уволен", "info");
      
    } catch (error) {
      console.error("Ошибка при увольнении помощника:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось уволить помощника",
        variant: "destructive"
      });
    }
  };

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
    const intervalId = setInterval(loadHelperRequests, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const respondToHelperRequest = async (helperId: string, accepted: boolean) => {
    try {
      dispatch({ 
        type: "RESPOND_TO_HELPER_REQUEST", 
        payload: { 
          helperId, 
          accepted 
        } 
      });

      const { error } = await supabase
        .from('referral_helpers')
        .update({ status: accepted ? 'accepted' : 'rejected' })
        .eq('id', helperId);

      if (error) {
        console.error("Ошибка при обновлении статуса:", error);
        throw error;
      }

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
  
  const isHelperAssigned = (referralId: string, buildingId: string) => {
    return state.referralHelpers.some(
      h => h.helperId === referralId && h.buildingId === buildingId && h.status === 'accepted'
    );
  };
  
  const getAssignedBuildingId = (referralId: string) => {
    const helper = state.referralHelpers.find(
      h => h.helperId === referralId && h.status === 'accepted'
    );
    return helper ? helper.buildingId : undefined;
  };

  const loadAvailableBuildingsForReferral = async (referralId: string) => {
    try {
      const buildings = await getCompatibleBuildings(referralId);
      setAvailableBuildings(buildings);
      
      console.log(`Загружено ${buildings.length} доступных зданий для реферала ${referralId}`);
      
      if (buildings.length > 0) {
        setSelectedBuildingId(buildings[0].id);
      } else {
        setSelectedBuildingId('');
      }
    } catch (error) {
      console.error('Ошибка при загрузке доступных зданий:', error);
      setAvailableBuildings([]);
      setSelectedBuildingId('');
    }
  };

  const totalReferrals = state.referrals?.length || 0;
  const activeReferrals = state.referrals?.filter(ref => 
    typeof ref.activated === 'boolean' 
      ? ref.activated 
      : String(ref.activated).toLowerCase() === 'true'
  )?.length || 0;

  const filteredReferrals = currentTab === 'active' 
    ? (state.referrals || []).filter(ref => 
        (typeof ref.activated === 'boolean' && ref.activated === true) ||
        (typeof ref.activated === 'string' && ref.activated.toLowerCase() === 'true')
      )
    : (state.referrals || []);

  const getUserBuildings = () => Object.values(state.buildings || {})
    .filter(b => b.count > 0);

  const hasHelperRequests = helperRequests.length > 0;

  const isTelegramUser = telegramUserInfo !== null;

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
            {isRefreshingReferrals ? 
              <RefreshCw className="h-3 w-3 animate-spin mr-1" /> :
              <RefreshCw className="h-3 w-3 mr-1" />
            }
            {isRefreshingReferrals ? 'Обновление...' : 'Обновить'}
          </Button>
        </div>
        <p className="text-[10px] text-gray-600 mb-2">
          +5% к производительности за каждого активного реферала
        </p>
        
        {userId && (
          <div className="bg-blue-50 p-1.5 rounded-lg mb-2 text-[10px]">
            <div className="font-medium">Ваша информация:</div>
            <div>ID: <span className="font-mono text-blue-600">{userId}</span></div>
            {telegramUserInfo && (
              <div className="mt-1 text-green-600">
                Telegram: {telegramUserInfo.first_name} {telegramUserInfo.last_name || ''} 
                (ID: {telegramUserInfo.id})
              </div>
            )}
          </div>
        )}
        
        <div className="bg-gray-50 p-2 rounded-lg border mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-medium">Ваша реферальная ссылка:</div>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" className="h-5 w-5 p-0" onClick={copyReferralLink}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-
