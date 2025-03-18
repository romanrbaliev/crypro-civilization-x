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
  
  return (
    <div className="p-1.5 rounded-lg border bg-white relative">
      <div className="flex justify-between items-start">
        <div className={`${isMobile ? 'max-w-[75%]' : ''}`}>
          <div className="text-[10px] font-medium">{referral.username}</div>
          <div className="text-[9px] text-gray-500">
            ID: <span className="font-mono">{referral.id}</span>
          </div>
          <div className="text-[9px] text-gray-500">
            Присоединился: {new Date(referral.joinedAt).toLocaleDateString()}
          </div>
          <div className="text-[9px] mt-1">
            Статус: {' '}
            <span className={referral.activated ? "text-green-600" : "text-gray-500"}>
              {referral.activated ? "Активирован" : "Не активирован"}
            </span>
          </div>
          {isAssigned && assignedBuildingId && (
            <div className="text-[9px] text-green-600 mt-0.5">
              {isHelperAssigned(referral.id, assignedBuildingId) ? "Помогает" : "Работает"} в здании
            </div>
          )}
          {referral.id === '123456789' && (
            <div className="text-[9px] text-blue-600">
              Тестовый пользователь romanaliev
            </div>
          )}
          {referral.id === '987654321' && (
            <div className="text-[9px] text-blue-600">
              Тестовый пользователь lanakores
            </div>
          )}
        </div>
        
        {referral.activated && !ownedReferral && (
          <div className="ml-2 flex-shrink-0">
            {isAssigned ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-[9px]"
                onClick={() => onFire(referral.id, assignedBuildingId)}
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
      setReferralLink(`https://t.me/Crypto_civilization_bot?start=${state.referralCode}`);
      console.log(`ReferralsTab: Используем существующий реферальный код: ${state.referralCode}`);
    } else {
      let newCode;
      
      if (userId === '123456789') {
        newCode = 'TEST_REF_CODE_ROMAN';
      } else if (userId === '987654321') {
        newCode = 'TEST_REF_CODE_LANA';
      } else {
        newCode = generateReferralCode();
      }
      
      dispatch({ type: "SET_REFERRAL_CODE", payload: { code: newCode } });
      setReferralLink(`https://t.me/Crypto_civilization_bot?start=${newCode}`);
      console.log(`ReferralsTab: Сгенерирован новый реферальный код: ${newCode}`);
    }
  }, [state.referralCode, dispatch, userId]);

  const loadReferrals = async () => {
    try {
      setIsRefreshingReferrals(true);
      const id = await getUserIdentifier();
      console.log('Загрузка рефералов для пользователя:', id);
      
      const isRomanaliev = id === '123456789';
      const isLanakores = id === '987654321';
      
      if (isRomanaliev) {
        console.log('Загрузка тестовых рефералов для romanaliev');
        
        const { data: existingReferral } = await supabase
          .from('referral_data')
          .select('*')
          .eq('user_id', '987654321')
          .eq('referred_by', 'TEST_REF_CODE_ROMAN')
          .single();
          
        if (!existingReferral) {
          console.log('Создаем тестовую запись реферала lanakores для romanaliev');
          
          await supabase
            .from('referral_data')
            .upsert({
              user_id: '987654321',
              referral_code: 'TEST_REF_CODE_LANA',
              referred_by: 'TEST_REF_CODE_ROMAN'
            });
        }
        
        const testReferral = {
          id: '987654321',
          username: 'lanakores',
          activated: true,
          joinedAt: Date.now()
        };
        
        dispatch({ 
          type: "LOAD_GAME", 
          payload: { 
            ...state, 
            referrals: [testReferral],
            referralCode: 'TEST_REF_CODE_ROMAN'
          } 
        });
        
        onAddEvent(`Загружен тестовый реферал lanakores для romanaliev`, "success");
        setIsRefreshingReferrals(false);
        return;
      }
      
      if (isLanakores) {
        console.log('Обновление реферальной информации для lanakores');
        
        dispatch({ 
          type: "LOAD_GAME", 
          payload: { 
            ...state, 
            referralCode: 'TEST_REF_CODE_LANA',
            referredBy: 'TEST_REF_CODE_ROMAN'
          } 
        });
        
        onAddEvent(`Вы (lanakores) б��ли приглашены пользователем romanaliev`, "info");
        setIsRefreshingReferrals(false);
        return;
      }
      
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
      
      const { data: userData } = await supabase
        .from(REFERRAL_TABLE)
        .select('referral_code')
        .eq('user_id', id)
        .single();
      
      if (userData && userData.referral_code) {
        console.log('Найден реферальный код в базе:', userData.referral_code);
        
        const { data: directReferrals } = await supabase
          .from(REFERRAL_TABLE)
          .select('user_id, created_at, referred_by')
          .eq('referred_by', userData.referral_code);
          
        console.log('Найдено рефералов в базе данных:', directReferrals?.length || 0, directReferrals);
        
        const { data: saveData } = await supabase
          .from(SAVES_TABLE)
          .select('game_data')
          .eq('user_id', id)
          .single();
        
        if (saveData && saveData.game_data) {
          const gameState = saveData.game_data as any;
          console.log('Текущие рефералы в сохранении:', gameState.referrals);
          
          if (directReferrals && directReferrals.length > 0) {
            const formattedReferrals = directReferrals.map(ref => {
              const existingRef = gameState.referrals?.find((r: any) => r.id === ref.user_id);
              
              return {
                id: ref.user_id,
                username: `ID: ${ref.user_id}`,
                activated: existingRef ? existingRef.activated : false,
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
            
            onAddEvent(`Обновлено ${formattedReferrals.length} рефералов. Активных: ${formattedReferrals.filter(r => r.activated).length}`, "success");
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении рефералов:', error);
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
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к Crypto Civilization и начни строить свою криптоимперию!')}`);
        onAddEvent("Отправка приглашения через Telegram", "info");
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
      
      console.log('Здания пользоват��ля:', userBuildings);
      
      if (referralId === '987654321' || referralId === '123456789') {
        console.log('Тестовый пользователь, возвращаем здания пользователя:', userBuildings);
        return userBuildings;
      }
      
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
        description: "Бонус к производительности здания отменен",
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
  const activeReferrals = state.referrals?.filter(ref => ref.activated)?.length || 0;

  const filteredReferrals = currentTab === 'active' 
    ? (state.referrals || []).filter(ref => ref.activated)
    : (state.referrals || []);

  const getUserBuildings = () => Object.values(state.buildings || {})
    .filter(b => b.count > 0);

  const hasHelperRequests = helperRequests.length > 0;

  const isTelegramUser = telegramUserInfo !== null;
  
  const isRomanAliev = userId === '123456789';
  const isLanaKores = userId === '987654321';

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
            {isRomanAliev && (
              <div className="mt-1 text-green-600">
                Тестовый аккаунт romanaliev
              </div>
            )}
            {isLanaKores && (
              <div className="mt-1 text-green-600">
                Тестовый аккаунт lanakores (приглашен пользователем romanaliev)
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
          <div className="text-[9px] bg-white border rounded p-1 truncate">
            {referralLink}
          </div>
          {state.referralCode && (
            <div className="text-[9px] mt-1 text-gray-500">
              Ваш реферальный код: <span className="font-mono">{state.referralCode}</span>
            </div>
          )}
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
                  <ReferralItem 
                    key={referral.id} 
                    referral={referral}
                    userBuildings={state.buildings}
                    helperRequests={helperRequests}
                    ownedReferral={referral.id === userId}
                    onHire={hireHelper}
                    onFire={fireHelper}
                    onLoadAvailableBuildings={loadAvailableBuildingsForReferral}
                    availableBuildings={availableBuildings}
                    isMobile={isMobile}
                    selectedBuildingId={selectedBuildingId}
                    setSelectedBuildingId={setSelectedBuildingId}
                    isHelperAssigned={isHelperAssigned}
                    assignedBuildingId={getAssignedBuildingId(referral.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px]">У вас пока нет рефералов</p>
                <p className="text-[9px] mt-1">Поделитесь своей реферальной ссылкой</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 text-[9px] h-6"
                  onClick={handleRefreshReferrals}
                  disabled={isRefreshingReferrals}
                >
                  {isRefreshingReferrals ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                      Обновление...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Обновить список
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-2">
            {filteredReferrals.length > 0 ? (
              <div className="space-y-1.5">
                {filteredReferrals.map(referral => {
                  const assignedBuildingId = getAssignedBuildingId(referral.id);
                  const assignedBuilding = assignedBuildingId ? state.buildings[assignedBuildingId] : null;
                  
                  return (
                    <div 
                      key={referral.id} 
                      className="flex flex-col p-1.5 rounded-lg border bg-green-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className={`${isMobile ? 'max-w-[75%]' : ''}`}>
                          <div className="text-[10px] font-medium">{referral.username}</div>
                          <div className="text-[9px] text-gray-500">
                            ID: <span className="font-mono">{referral.id}</span>
                          </div>
                          <div className="text-[9px] text-gray-500">
                            Присоединился: {new Date(referral.joinedAt).toLocaleDateString()}
                          </div>
                          {assignedBuilding && (
                            <div className="text-[9px] text-green-600 mt-1">
                              Работает в здании: {assignedBuilding.name}
                            </div>
                          )}
                          {referral.id === '123456789' && (
                            <div className="text-[9px] text-blue-600">
                              Тестовый пользователь romanaliev
                            </div>
                          )}
                          {referral.id === '987654321' && (
                            <div className="text-[9px] text-blue-600">
                              Тестовый пользователь lanakores
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-2 flex-shrink-0">
                          {assignedBuildingId ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-6 px-2 text-[9px]"
                              onClick={() => fireHelper(referral.id, assignedBuildingId)}
                            >
                              Уволить
                            </Button>
                          ) : (
                            <Dialog onOpenChange={(open) => {
                              if (open) loadAvailableBuildingsForReferral(referral.id);
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
                                        onClick={() => hireHelper(referral.id, selectedBuildingId)}
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
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px]">У вас пока нет активных рефералов</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="requests" className="mt-2">
            {helperRequests.length > 0 ? (
              <div className="space-y-1.5">
                {helperRequests.map(request => (
                  <div key={request.id} className="p-2 rounded-lg border bg-blue-50">
                    <div className="text-[10px] font-medium">Запрос на помощь</div>
                    <div className="text-[9px] text-gray-600 mt-1">
                      Пользователь ID: {request.employer_id} приглашает вас стать помощником
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
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
                <p className="text-[10px]">У вас нет запросов на помощь</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReferralsTab;

