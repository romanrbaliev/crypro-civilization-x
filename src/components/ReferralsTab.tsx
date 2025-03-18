
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Copy, Send, MessageSquare, Users, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from '@/hooks/use-toast';
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

interface ReferralsTabProps {
  onAddEvent: (message: string, type?: string) => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [referralLink, setReferralLink] = useState('');
  
  // Генерация реферальной ссылки
  useEffect(() => {
    // Используем прямую ссылку на бота
    setReferralLink(`https://t.me/Crypto_civilization_bot?start=${state.referralCode}`);
  }, [state.referralCode]);

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

  // Отправка приглашения помощнику
  const inviteHelper = async (referralId: string) => {
    if (!selectedBuildingId) {
      toast({
        title: "Ошибка",
        description: "Выберите здание для помощника",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`https://t.me/Crypto_civilization_bot/invite_helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerId: state.referralCode,
          helperId: referralId,
          buildingId: selectedBuildingId
        })
      });

      if (response.ok) {
        toast({
          title: "Приглашение отправлено",
          description: "Ожидаем ответа помощника",
        });
        onAddEvent("Приглашение помощника отправлено", "success");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить приглашение",
        variant: "destructive"
      });
    }
  };

  const totalReferrals = state.referrals.length;
  const activeReferrals = state.referrals.filter(ref => ref.activated).length;

  // Фильтрация рефералов по активности
  const filteredReferrals = currentTab === 'active' 
    ? state.referrals.filter(ref => ref.activated)
    : state.referrals;

  const availableBuildings = Object.values(state.buildings)
    .filter(b => b.count > 0);

  return (
    <div className="p-2 flex flex-col h-full">
      <div className="mb-2">
        <h2 className="text-xs font-medium mb-1">Реферальная программа</h2>
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
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="all" className="text-[10px] h-6">
              <Users className="h-3 w-3 mr-1" />
              Все ({totalReferrals})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-[10px] h-6">
              <Users className="h-3 w-3 mr-1" />
              Активные ({activeReferrals})
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
                            onClick={() => inviteHelper(referral.id)}
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
        </Tabs>
      </div>
    </div>
  );
};

export default ReferralsTab;
