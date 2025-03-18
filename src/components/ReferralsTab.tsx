import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { getUserReferrals } from '@/api/gameDataService';
import { Button } from '@/components/ui/button';
import { Copy, Loader2, RefreshCw, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BuildingOption {
  id: string;
  name: string;
  count: number;
}

const ReferralsTab = () => {
  const { state, dispatch, onAddEvent } = useGame();
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [buildingOptions, setBuildingOptions] = useState<BuildingOption[]>([]);
  
  useEffect(() => {
    // Формируем реферальную ссылку при загрузке компонента
    if (state.referralCode) {
      const baseUrl = window.location.origin;
      const referralUrl = `${baseUrl}?start=${state.referralCode}`;
      setReferralLink(referralUrl);
    }
  }, [state.referralCode]);

  useEffect(() => {
    // Загружаем рефералов при монтировании компонента
    loadReferrals();
  }, [loadReferrals]);
  
  useEffect(() => {
    // Обновляем список зданий, доступных для найма
    const availableBuildings = Object.values(state.buildings)
      .filter(building => building.unlocked && building.count > 0)
      .map(building => ({
        id: building.id,
        name: building.name,
        count: building.count
      }));
    
    setBuildingOptions(availableBuildings);
  }, [state.buildings]);

  const loadReferrals = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Загрузка рефералов...');
      
      // Получаем текущие рефералы
      const referrals = await getUserReferrals();
      
      if (referrals && referrals.length > 0) {
        console.log('Загружено рефералов из БД:', referrals.length);
        
        // Обновляем состояние игры с загруженными рефералами
        dispatch({ 
          type: "LOAD_GAME", 
          payload: { 
            ...state, 
            referrals: referrals
          } 
        });
        
        onAddEvent(`Загружено ${referrals.length} рефералов`, "info");
      } else if (state.referrals && state.referrals.length > 0) {
        console.log('Используем существующие рефералы из состояния:', state.referrals);
        onAddEvent(`Отображаем ${state.referrals.length} существующих рефералов`, "info");
      } else {
        console.log('У вас пока нет рефералов');
        onAddEvent("У вас пока нет рефералов", "info");
      }
      
    } catch (error) {
      console.error('Ошибка при загрузке рефералов:', error);
      onAddEvent("Ошибка при загрузке рефералов", "error");
    } finally {
      setLoading(false);
    }
  }, [dispatch, state, onAddEvent]);

  // Функция для копирования реферальной ссылки
  const copyReferralLink = useCallback(() => {
    try {
      if (!referralLink) {
        toast({
          title: "Ошибка",
          description: "Реферальная ссылка еще не сформирована",
          variant: "destructive"
        });
        onAddEvent("Реферальная ссылка еще не сформирована", "error");
        return;
      }
      
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Ссылка скопирована",
        description: "Реферальная ссылка успешно скопирована в буфер обмена",
      });
      onAddEvent("Реферальная ссылка скопирована", "success");
    } catch (error) {
      console.error('Ошибка при копировании реферальной ссылки:', error);
      onAddEvent("Не удалось скопировать ссылку", "error");
    }
  }, [state.referralCode, onAddEvent]);

  // Функция для найма помощника
  const handleHireHelper = (referralId: string, buildingId: string) => {
    dispatch({ 
      type: "HIRE_REFERRAL_HELPER", 
      payload: { referralId, buildingId } 
    });
  };

  // Рассчитываем бонус от рефералов
  const { activatedCount, totalCount, bonus } = useMemo(() => {
    const totalCount = state.referrals?.length || 0;
    // Считаем активированных рефералов
    const activatedCount = state.referrals?.filter(ref => ref.activated).length || 0;
    
    // Рассчитываем общий бонус (5% за каждого активированного реферала)
    const bonus = activatedCount * 5;
    
    console.log('Расчет бонуса от рефералов:', activatedCount, 'активных из', totalCount, 'всего');
    return { activatedCount, totalCount, bonus };
  }, [state.referrals]);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Ваша реферальная ссылка</h2>
        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
          <div className="flex-1 bg-gray-100 p-2 rounded text-xs break-all">
            {referralLink || "Загрузка..."}
          </div>
          <Button 
            size="sm" 
            onClick={copyReferralLink}
            className="whitespace-nowrap"
          >
            <Copy className="h-4 w-4 mr-1" />
            Скопировать
          </Button>
        </div>
        
        {/* Добавлено пояснение о статусе активации */}
        <p className="text-xs text-gray-500 mt-2">
          Реферал считается активированным, когда он строит свой первый генератор.
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Бонусы от рефералов</h2>
        <div className="bg-gray-100 p-3 rounded">
          <p className="mb-1">Активировано рефералов: <span className="font-bold">{activatedCount}</span> из {totalCount}</p>
          <p className="text-green-600 font-bold mb-1">Текущий бонус: +{bonus}% к производству</p>
          <p className="text-xs text-gray-600">Каждый активированный реферал даёт +5% к производству ресурсов</p>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Ваши рефералы</h2>
          <Button size="sm" variant="outline" onClick={loadReferrals} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Обновить
              </>
            )}
          </Button>
        </div>
        
        {state.referrals && state.referrals.length > 0 ? (
          <div className="space-y-3">
            {state.referrals.map((referral) => (
              <div key={referral.id} className="border rounded p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{referral.username}</p>
                    <div className="text-[9px] text-gray-500">
                      Присоединился: {new Date(referral.joinedAt).toLocaleString()}
                    </div>
                    <div className="text-[9px] mt-1">
                      Статус: {' '}
                      <span className={referral.activated ? "text-green-600" : "text-gray-500"}>
                        {referral.activated ? "Активирован" : "Не активирован"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Кнопка для найма помощника */}
                  {referral.activated && buildingOptions.length > 0 && (
                    <div className="ml-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Нанять
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Выберите здание</DropdownMenuLabel>
                          {buildingOptions.map((building) => (
                            <DropdownMenuItem 
                              key={building.id} 
                              onClick={() => handleHireHelper(referral.id, building.id)}
                            >
                              {building.name} (x{building.count})
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">У вас пока нет рефералов</p>
            <p className="text-sm text-gray-400 mt-2">Поделитесь своей реферальной ссылкой с друзьями</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsTab;
