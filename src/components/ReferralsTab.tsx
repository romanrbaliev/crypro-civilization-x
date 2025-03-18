import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Copy, Send, MessageSquare, Users, Building, Check, X, RefreshCw } from 'lucide-react';
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
import { getUserIdentifier } from '@/api/gameDataService';

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
  const [userId, setUserId] = useState<string | null>(null);
  const [telegramUserInfo, setTelegramUserInfo] = useState<any>(null);

  const REFERRAL_TABLE = 'referral_data';
  const REFERRAL_DATA = 'referral_data';
  const SAVES_TABLE = 'saves';

  // Получаем Telegram информацию о пользователе
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
      // Генерируем код в зависимости от ID пользователя
      let newCode;
      
      if (userId === '123456789') { // romanaliev
        newCode = 'TEST_REF_CODE_ROMAN';
      } else if (userId === '987654321') { // lanakores
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
      
      // Проверка для тестовых аккаунтов
      const isRomanaliev = id === '123456789';
      const isLanakores = id === '987654321';
      
      // Специальная обработка для romanaliev
      if (isRomanaliev) {
        console.log('Загрузка тестовых рефералов для romanaliev');
        
        // Проверяем существует ли запись о lanakores как реферале romanaliev
        const { data: existingReferral } = await supabase
          .from('referral_data')
          .select('*')
          .eq('user_id', '987654321')
          .eq('referred_by', 'TEST_REF_CODE_ROMAN')
          .single();
          
        if (!existingReferral) {
          console.log('Создаем тестовую запись реферала lanakores для romanaliev');
          
          // Создаем запись в базе данных
          await supabase
            .from('referral_data')
            .upsert({
              user_id: '987654321', // ID lanakores
              referral_code: 'TEST_REF_CODE_LANA',
              referred_by: 'TEST_REF_CODE_ROMAN' // Реферальный код romanaliev
            });
        }
        
        // Устанавливаем тестовый реферал для romanaliev
        const testReferral = {
          id: '987654321', // ID lanakores
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
      
      // Специальная обработка для lanakores
      if (isLanakores) {
        console.log('Обновление реферальной информации для lanakores');
        
        // Устанавливаем код и реферера для lanakores
        dispatch({ 
          type: "LOAD_GAME", 
          payload: { 
            ...state, 
            referralCode: 'TEST_REF_CODE_LANA',
            referredBy: 'TEST_REF_CODE_ROMAN'
          } 
        });
        
        onAddEvent(`Вы (lanakores) были приглашены пользователем romanaliev`, "info");
        setIsRefreshingReferrals(false);
        return;
      }
      
      // Загружаем информацию о рефералах напрямую из базы
      // 1. Получаем реферальный код пользователя
      const { data: userData } = await supabase
        .from('referral_data')
        .select('referral_code')
        .eq('user_id', id)
        .single();
        
      if (userData && userData.referral_code) {
        console.log('Реферальный код пользователя:', userData.referral_code);
        
        // 2. Загружаем всех рефералов для данного кода
        const { data: directReferrals } = await supabase
          .from('referral_data')
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
          
          console.log('Форматированные рефералы для загрузки:', formattedReferrals);
          
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
      
      // Если в базе ничего не нашли, используем то, что есть в стейте
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
      
      // Получаем реферальный код пользователя напрямую из базы
      const { data: userData } = await supabase
        .from(REFERRAL_TABLE)
        .select('referral_code')
        .eq('user_id', id)
        .single();
      
      if (userData && userData.referral_code) {
        console.log('Найден реферальный код в базе:', userData.referral_code);
        
        // Загружаем всех рефералов для данного кода
        const { data: directReferrals } = await supabase
          .from(REFERRAL_DATA)
          .select('user_id, created_at, referred_by')
          .eq('referred_by', userData.referral_code);
          
        console.log('Найдено рефералов в базе данных:', directReferrals?.length || 0, directReferrals);
        
        // Загрузим текущее сохранение игры, чтобы проверить, какие рефералы активированы
        const { data: saveData } = await supabase
          .from(SAVES_TABLE)
          .select('game_data')
          .eq('user_id', id)
          .single();
        
        if (saveData && saveData.game_data) {
          const gameState = saveData.game_data as any;
          console.log('Текущие рефералы в сохранении:', gameState.referrals);
          
          // Проверяем каждого реферала на активацию
          if (directReferrals && directReferrals.length > 0) {
            const formattedReferrals = directReferrals.map(ref => {
              // Ищем этого реферала в текущем сохранении
              const existingRef = gameState.referrals?.find((r: any) => r.id === ref.user_id);
              
              return {
                id: ref.user_id,
                username: `ID: ${ref.user_id}`,
                // Если реферал найден в сохранении и он активирован, сохраняем этот статус
                activated: existingRef ? existingRef.activated : false,
                joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
              };
            });
            
            console.log('Обновляем список рефералов:', formattedReferrals);
            
            // Обновляем состояние игры с новым списком рефералов
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
    const intervalId = setInterval(loadReferrals, 60000); // Обновление каждую минуту
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
          description: "Не удалось скопировать ссылку",
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
      
      dispatch({ 
        type: "HIRE_REFERRAL_HELPER", 
        payload: { 
          referralId, 
          buildingId: selectedBuildingId 
        } 
      });

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

  const totalReferrals = state.referrals?.length || 0;
  const activeReferrals = state.referrals?.filter(ref => ref.activated)?.length || 0;

  const filteredReferrals = currentTab === 'active' 
    ? (state.referrals || []).filter(ref => ref.activated)
    : (state.referrals || []);

  const availableBuildings = Object.values(state.buildings || {})
    .filter(b => b.count > 0);

  const hasHelperRequests = helperRequests.length > 0;

  const isTelegramUser = telegramUserInfo !== null;
  
  // Проверка на тестовых пользователей
  const isRomanAliev = userId === '123456789'; // ID romanaliev
  const isLanaKores = userId === '987654321'; // ID lanakores

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
                  <div 
                    key={referral.id} 
                    className={`flex justify-between items-center p-1.5 rounded-lg border ${referral.activated ? 'bg-green-50' : 'bg-white'}`}
                  >
                    <div>
                      <div className="text-[10px] font-medium">{referral.username}</div>
                      <div className="text-[9px] text-gray-500">
                        ID: <span className="font-mono">{referral.id}</span>
                      </div>
                      <div className="text-[9px] text-gray-500">
                        Присоединился: {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
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
                    <div className="flex items-center space-x-2">
                      {referral.activated ? (
                        <div className="text-[8px] text-green-600 bg-green-100 px-1 py-0.5 rounded flex items-center">
                          <Check className="h-2 w-2 mr-0.5" />
                          Активен
                        </div>
                      ) : (
                        <div className="text-[8px] text-orange-600 bg-orange-100 px-1 py-0.5 rounded flex items-center">
                          <AlertCircle className="h-2 w-2 mr-0.5" />
                          Не активирован
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
                {filteredReferrals.map(referral => (
                  <div 
                    key={referral.id} 
                    className="flex justify-between items-center p-1.5 rounded-lg border bg-green-50"
                  >
                    <div>
                      <div className="text-[10px] font-medium">{referral.username}</div>
                      <div className="text-[9px] text-gray-500">
                        ID: <span className="font-mono">{referral.id}</span>
                      </div>
                      <div className="text-[9px] text-gray-500">
                        Присоединился: {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 text-[9px] h-6"
                  onClick={handleRefreshReferrals}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Обновить список
                </Button>
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
