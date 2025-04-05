import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Copy, Send, MessageSquare, Users, Building, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isTelegramWebAppAvailable, generateReferralCode } from '@/utils/helpers';
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
import {
  isReferralHiredForBuilding,
  getReferralAssignedBuildingId
} from '@/utils/referralHelpers/buildingHelpers';
import { triggerReferralUIUpdate } from '@/api/referralService';
import { syncHelperDataWithGameState } from '@/api/referral/referralHelpers';

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
  referralHelpers: any[];
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
  assignedBuildingId,
  referralHelpers
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
  
  const isHired = useMemo(() => {
    return referralHelpers.some(
      helper => helper.helperId === referral.id && helper.status === 'accepted'
    );
  }, [referral.id, referralHelpers]);
  
  console.log(`Отображение карточки реферала ${referral.id}:`, {
    activated: referral.activated,
    directDbStatus,
    isActivated,
    isHired,
    assignedBuildingId
  });
  
  return (
    <div className="p-1.5 rounded-lg border bg-white relative">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="text-[10px] font-medium">{referral.username}</div>
          <div className="text-[9px] text-gray-500">
            ID: <span className="font-mono">{referral.id.substring(0, 8)}</span>
          </div>
          <div className="text-[9px] text-gray-500">
            Присоединился: {new Date(referral.joinedAt).toLocaleDateString()}
          </div>
          <div className="text-[9px] mt-1">
            Статус: {' '}
            {isHired ? (
              <span className="text-green-600 font-medium">Помощник</span>
            ) : isActivated ? (
              <span className="text-blue-600">Активирован</span>
            ) : (
              <span className="text-gray-500">Не активирован</span>
            )}
          </div>
          {isAssigned && assignedBuildingId && (
            <div className="text-[9px] text-green-600 mt-0.5">
              {isHelperAssigned(referral.id, assignedBuildingId) ? "Помогает" : "Работает"} в здании
            </div>
          )}
        </div>
        
        {isActivated && !ownedReferral && (
          <div className="ml-2 flex-shrink-0">
            {isHired ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-[9px] bg-red-50 hover:bg-red-100"
                onClick={() => onFire(referral.id, assignedBuildingId as string)}
              >
                <X className="h-3 w-3 mr-1 text-red-600" />
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
                    className="h-6 px-2 text-[9px] bg-green-50 hover:bg-green-100"
                  >
                    <Building className="h-3 w-3 mr-1 text-green-600" />
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
        
        if (id) {
          syncHelperData(id);
        }
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

  const loadReferrals = useCallback(async () => {
    if (isRefreshingReferrals) {
      console.log('Пропуск обновления рефералов, так как уже идет обновление');
      return;
    }
    
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
          .select('user_id, created_at, referred_by, is_activated')
          .eq('referred_by', userData.referral_code);
          
        console.log('Найденные рефералы напрямую из базы:', directReferrals);
        
        if (directReferrals && directReferrals.length > 0) {
          const { data: helperData } = await supabase
            .from('referral_helpers')
            .select('helper_id, building_id, status')
            .eq('employer_id', id)
            .eq('status', 'accepted');
            
          const helpers = helperData || [];
          console.log('Найденные помощники из базы:', helpers);
          
          const formattedReferrals = directReferrals.map(ref => {
            const helperInfo = helpers.find(h => h.helper_id === ref.user_id);
            const isHired = Boolean(helperInfo);
            const assignedBuildingId = helperInfo ? helperInfo.building_id : undefined;
            
            return {
              id: ref.user_id,
              username: `ID: ${ref.user_id.substring(0, 6)}`,
              activated: ref.is_activated === true,
              hired: isHired,
              assignedBuildingId: assignedBuildingId,
              joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
            };
          });
          
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
  }, [state, dispatch, onAddEvent, isRefreshingReferrals]);

  const forceRefreshReferrals = async () => {
    if (isRefreshingReferrals) {
      console.log('Пропуск принудительного обновления, так как уже идет обновление');
      return;
    }
    
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
        console.log('⚠️ Не найдено рефералов для этого ��ользователя');
        onAddEvent("Рефералы не найдены в базе данных", "info");
        setIsRefreshingReferrals(false);
        return;
      }
      
      const { data: helperData } = await supabase
        .from('referral_helpers')
        .select('helper_id, building_id, status')
        .eq('employer_id', id)
        .eq('status', 'accepted');
        
      const helpers = helperData || [];
      console.log('Найденные помощники из базы:', helpers);
      
      const updatedReferrals = (directReferrals || []).map(ref => {
        const helperInfo = helpers.find(h => h.helper_id === ref.user_id);
        const isHired = Boolean(helperInfo);
        const assignedBuildingId = helperInfo ? helperInfo.building_id : undefined;
        
        console.log(`Обновление статуса для реферала ${ref.user_id}:`, {
          dbStatus: ref.is_activated,
          isHired,
          buildingId: assignedBuildingId
        });
        
        return {
          id: ref.user_id,
          username: `ID: ${ref.user_id.substring(0, 6)}`,
          activated: ref.is_activated === true,
          hired: isHired,
          assignedBuildingId: assignedBuildingId,
          joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
        };
      });
      
      console.log('Обновленные данные рефералов для сохранения:', 
        JSON.stringify(updatedReferrals, null, 2));
      
      dispatch({ 
        type: "LOAD_GAME", 
        payload: { 
          ...state, 
          referrals: updatedReferrals 
        } 
      });
      
      helpers.forEach(helper => {
        triggerReferralUIUpdate(helper.helper_id, true, helper.building_id);
      });
      
      const activeCount = updatedReferrals.filter(r => r.activated === true).length;
      onAddEvent(`Обновлено ${updatedReferrals.length} рефералов. Активных: ${activeCount}`, "success");
      
      const refreshEvent = new CustomEvent('refresh-referrals');
      window.dispatchEvent(refreshEvent);
      
      setTimeout(() => {
        const forceUpdateEvent = new CustomEvent('force-resource-update');
        window.dispatchEvent(forceUpdateEvent);
        console.log('Отправлен запрос на принудительное обновление ресурсов');
      }, 500);
      
    } catch (error) {
      console.error('❌ Ошибка при обновлении рефералов:', error);
      onAddEvent("Ошибка при обновлении рефералов", "error");
    } finally {
      setIsRefreshingReferrals(false);
    }
  };

  const syncHelperData = async (userId: string) => {
    try {
      console.log('🔄 Синхронизация данных помощников для пользователя:', userId);
      
      const updateReferralHelpers = (helperRequests: any[]) => {
        if (Array.isArray(helperRequests) && helperRequests.length > 0) {
          console.log('🔄 Обновление состояния помощников:', helperRequests);
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { 
              ...state, 
              referralHelpers: helperRequests 
            } 
          });
        }
      };
      
      await syncHelperDataWithGameState(userId, updateReferralHelpers);
      console.log('✅ Синхронизация данных помощников успешно завершена');
      
      setTimeout(() => {
        const forceUpdateEvent = new CustomEvent('force-resource-update');
        window.dispatchEvent(forceUpdateEvent);
        console.log('Отправлен запрос на принудительное обновление ресурсов после синхронизации');
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка при синхронизации данных помощников:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('ReferralsTab: Монтирование компонента, загружаем рефералов...');
    
    if (!initialLoadComplete) {
      loadReferrals().then(() => {
        setInitialLoadComplete(true);
        console.log('Начальная загрузка рефералов завершена');
      });
    }
    
    const intervalId = setInterval(() => {
      console.log('Плановое обновление рефералов по таймеру (каждые 5 минут)');
      loadReferrals();
    }, 300000);
    
    return () => clearInterval(intervalId);
  }, [loadReferrals, initialLoadComplete]);

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

  const handleRefreshReferrals = async () => {
    const id = await getUserIdentifier();
    if (id) {
      syncHelperData(id);
    }
    forceRefreshReferrals();
    onAddEvent("Обновление списка рефералов и синхронизация помощников...", "info");
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
      console.error('Ошибка при получ��нии совместимых зданий:', error);
      return [];
    }
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
      
      const referral = state.referrals.find(r => r.id === referralId);
      if (referral) {
        dispatch({
          type: "UPDATE_REFERRAL_STATUS",
          payload: {
            referralId,
            activated: true,
            hired: false,
            buildingId: null
          }
        });
      }
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
      
      const updatedReferrals = state.referrals.map(ref => 
        ref.id === referralId 
          ? { ...ref, hired: false, assignedBuildingId: undefined } 
          : ref
      );
      
      dispatch({
        type: "LOAD_GAME",
        payload: {
          ...state,
          referrals: updatedReferrals
        }
      });
      
      toast({
        title: "Помощник уволен",
        description: "Бонус к производительности здания отменён",
      });
      onAddEvent("Помощник уволен", "info");
      
      triggerReferralUIUpdate(referralId, false);
      
      setTimeout(() => {
        dispatch({ type: "FORCE_RESOURCE_UPDATE" });
      }, 500);
      
    } catch (error) {
      console.error("Ошибка при увольнении помощника:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось уволить помощника",
        variant: "destructive"
      });
    }
  };

  const handleActivateReferral = (referralId: string) => {
    dispatch({
      type: "UPDATE_REFERRAL_STATUS",
      payload: {
        referralId,
        status: "active"
      }
    });
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
      const helperRequest = helperRequests.find(req => req.id === helperId);
      if (!helperRequest) {
        console.error("Запрос не найден:", helperId);
        return;
      }
      
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
        console.error("Ошибка при обновлении стат��са:", error);
        throw error;
      }

      setHelperRequests(prev => prev.filter(req => req.id !== helperId));

      const buildingId = helperRequest.building_id;
      const buildingName = state.buildings[buildingId]?.name || 'неизвестное здание';

      toast({
        title: accepted ? "Вы приняли предложение" : "Вы отклонили предложение",
        description: accepted 
          ? `Теперь вы помогаете здан��ю "${buildingName}" и получаете бонус +10% к производительности` 
          : "Предложение отклонено",
      });
      
      onAddEvent(
        accepted 
          ? `Вы приняли предложение о работе для здания "${buildingName}"` 
          : "Вы отклонили предложение о работе", 
        accepted ? "success" : "info"
      );
      
      if (accepted) {
        triggerReferralUIUpdate(helperRequest.helper_id, true, buildingId);
        
        setTimeout(() => {
          dispatch({ type: "FORCE_RESOURCE_UPDATE" });
        }, 1000);
      }
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
    return isReferralHiredForBuilding(referralId, buildingId, state.referralHelpers);
  };

  const getAssignedBuildingId = (referralId: string) => {
    return getReferralAssignedBuildingId(referralId, state.referralHelpers);
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
              <Button variant="outline" size="sm" className="h-5 w-5 p-0" onClick={sendTelegramInvite}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="text-[8px] font-mono bg-gray-100 p-1 rounded overflow-hidden text-ellipsis">
            {referralLink}
          </div>
          <div className="mt-1 text-[9px] text-blue-600">
            Поделитесь ссылкой с друзьями и получайте бонусы!
          </div>
        </div>
        
        <div className="bg-gray-50 p-2 rounded-lg border mb-2 flex justify-between items-center">
          <div>
            <div className="text-[10px] font-medium">Статистика:</div>
            <div className="text-[9px]">Всего рефералов: <span className="font-medium">{totalReferrals}</span></div>
            <div className="text-[9px]">Активных: <span className="font-medium text-green-600">{activeReferrals}</span></div>
          </div>
          <div className="text-xs font-medium">
            +{(activeReferrals * 5)}% к производству
          </div>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 h-6">
          <TabsTrigger value="all" className="text-[10px]">
            <Users className="h-3 w-3 mr-1" />
            Все рефералы
          </TabsTrigger>
          <TabsTrigger value="active" className="text-[10px]">
            <Building className="h-3 w-3 mr-1" />
            Активные
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 overflow-auto mt-2">
          {hasHelperRequests && (
            <div className="mb-2">
              <div className="text-[10px] font-medium mb-1 flex items-center">
                <MessageSquare className="h-3 w-3 mr-1 text-blue-500" />
                Запросы на сотрудничество:
              </div>
              <div className="space-y-1">
                {helperRequests.map(request => (
                  <div key={request.id} className="p-1.5 rounded-lg border bg-blue-50 relative">
                    <div className="text-[9px]">
                      Пользователь ID: <span className="font-mono">{request.employer_id.substring(0, 6)}</span> предлагает вам работу
                    </div>
                    <div className="text-[9px] mt-0.5">
                      Здание: <span className="font-medium">{state.buildings[request.building_id]?.name || 'Неизвестное здание'}</span>
                    </div>
                    <div className="flex space-x-1 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-5 text-[9px] px-2 bg-green-50 hover:bg-green-100"
                        onClick={() => respondToHelperRequest(request.id, true)}
                      >
                        <Check className="h-3 w-3 mr-1 text-green-600" />
                        Принять
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-5 text-[9px] px-2 bg-red-50 hover:bg-red-100"
                        onClick={() => respondToHelperRequest(request.id, false)}
                      >
                        <X className="h-3 w-3 mr-1 text-red-600" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
            </div>
          )}
          
          {filteredReferrals.length > 0 ? (
            <div className="space-y-1">
              {filteredReferrals.map(referral => (
                <ReferralItem
                  key={referral.id}
                  referral={referral}
                  userBuildings={getUserBuildings()}
                  helperRequests={helperRequests}
                  ownedReferral={false}
                  onHire={hireHelper}
                  onFire={fireHelper}
                  onLoadAvailableBuildings={loadAvailableBuildingsForReferral}
                  availableBuildings={availableBuildings}
                  isMobile={isMobile}
                  selectedBuildingId={selectedBuildingId}
                  setSelectedBuildingId={setSelectedBuildingId}
                  isHelperAssigned={isHelperAssigned}
                  assignedBuildingId={getAssignedBuildingId(referral.id)}
                  referralHelpers={state.referralHelpers}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-3">
              <Users className="h-6 w-6 text-gray-400 mb-1" />
              <p className="text-[11px] text-gray-600">У вас пока нет рефералов</p>
              <p className="text-[9px] text-gray-500 mt-1">
                Поделитесь реферальной ссылкой с друзьями, чтобы получать бонусы
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-6 text-[9px]"
                onClick={sendTelegramInvite}
              >
                <Send className="h-3 w-3 mr-1" />
                Пригласить друзей
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="flex-1 overflow-auto mt-2">
          {filteredReferrals.length > 0 ? (
            <div className="space-y-1">
              {filteredReferrals.map(referral => (
                <ReferralItem
                  key={referral.id}
                  referral={referral}
                  userBuildings={getUserBuildings()}
                  helperRequests={helperRequests}
                  ownedReferral={false}
                  onHire={hireHelper}
                  onFire={fireHelper}
                  onLoadAvailableBuildings={loadAvailableBuildingsForReferral}
                  availableBuildings={availableBuildings}
                  isMobile={isMobile}
                  selectedBuildingId={selectedBuildingId}
                  setSelectedBuildingId={setSelectedBuildingId}
                  isHelperAssigned={isHelperAssigned}
                  assignedBuildingId={getAssignedBuildingId(referral.id)}
                  referralHelpers={state.referralHelpers}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-3">
              <Users className="h-6 w-6 text-gray-400 mb-1" />
              <p className="text-[11px] text-gray-600">У вас нет активных рефералов</p>
              <p className="text-[9px] text-gray-500 mt-1">
                Активные рефералы это те, кто начал играть по вашей ссылке
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralsTab;
