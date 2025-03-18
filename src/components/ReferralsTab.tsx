import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Copy, Send, MessageSquare, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from '@/hooks/use-toast';

interface ReferralsTabProps {
  onAddEvent: (message: string, type?: string) => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const [currentTab, setCurrentTab] = useState('all');
  const [referralLink, setReferralLink] = useState('');
  
  // Генерация реферальной ссылки
  useEffect(() => {
    // Если находимся в Telegram, используем встроенный механизм для создания ссылки
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp) {
      // Используем Telegram WebApp для получения ссылки на бота с параметром ref
      const startParam = window.Telegram.WebApp.initDataUnsafe?.start_param || '';
      const baseUrl = startParam ? startParam : 'https://t.me/YourBotUsername?start=';
      
      setReferralLink(`${baseUrl}${state.referralCode}`);
    } else {
      // Fallback для тестирования вне Telegram
      setReferralLink(`https://t.me/YourBotUsername?start=${state.referralCode}`);
    }
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
        console.error("Ошибка копирования:", err);
      });
  };

  // Отправка реферальной ссылки через Telegram
  const shareReferralLink = () => {
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp?.openTelegramLink) {
      try {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Присоединяйся к Crypto Civilization! Начни свой путь в мире криптовалют:")}`);
        onAddEvent("Открыто окно отправки реферальной ссылки", "info");
      } catch (error) {
        console.error("Ошибка при отправке через Telegram:", error);
        toast({
          title: "Ошибка отправки",
          description: "Не удалось отправить ссылку через Telegram",
          variant: "destructive"
        });
        onAddEvent("Ошибка при отправке реферальной ссылки", "error");
      }
    } else {
      // Fallback для тестирования вне Telegram
      toast({
        title: "Функция недоступна",
        description: "Отправка ссылки доступна только в Telegram",
      });
      onAddEvent("Отправка ссылки доступна только в Telegram", "warning");
    }
  };

  // Открытие чата с рефералом в Telegram
  const openChatWithReferral = (username: string) => {
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp?.openTelegramLink) {
      try {
        // Если это имя вида "Player123456", извлекаем ID
        if (username.startsWith('Player')) {
          const userId = username.replace('Player', '');
          window.Telegram.WebApp.openTelegramLink(`https://t.me/${userId}`);
        } else {
          window.Telegram.WebApp.openTelegramLink(`https://t.me/${username}`);
        }
        onAddEvent(`Открыт чат с рефералом ${username}`, "info");
      } catch (error) {
        console.error("Ошибка при открытии чата:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось открыть чат с пользователем",
          variant: "destructive"
        });
      }
    } else {
      // Fallback для тестирования вне Telegram
      toast({
        title: "Функция недоступна",
        description: "Открытие чата доступно только в Telegram",
      });
    }
  };

  // Фильтрация рефералов по активности
  const filteredReferrals = currentTab === 'active' 
    ? state.referrals.filter(ref => ref.activated)
    : state.referrals;

  const totalReferrals = state.referrals.length;
  const activeReferrals = state.referrals.filter(ref => ref.activated).length;

  return (
    <div className="p-2 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Реферальная система</h2>
        <p className="text-sm text-gray-600 mb-3">
          Приглашайте друзей и получайте бонусы! За каждого активного реферала вы получаете 
          +5% к производительности ресурсов. Реферал считается активным после покупки первого Генератора.
        </p>
        
        <div className="bg-gray-50 p-3 rounded-lg border mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Ваша реферальная ссылка:</div>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={copyReferralLink}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={shareReferralLink}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="text-xs bg-white border rounded p-2 truncate">
            {referralLink}
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={shareReferralLink}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Пригласить
          </Button>
          <div className="text-xs text-gray-500">
            Приглашено: {totalReferrals} | Активировано: {activeReferrals}
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="all" className="text-xs h-8">
              <Users className="h-3.5 w-3.5 mr-1" />
              Все рефералы ({totalReferrals})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs h-8">
              <Users className="h-3.5 w-3.5 mr-1" />
              Активные ({activeReferrals})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {filteredReferrals.length > 0 ? (
              <div className="space-y-2">
                {filteredReferrals.map(referral => (
                  <div 
                    key={referral.id} 
                    className={`flex justify-between items-center p-2 rounded-lg border ${referral.activated ? 'bg-green-50' : 'bg-white'}`}
                  >
                    <div>
                      <div className="text-sm font-medium">{referral.username}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {referral.activated && (
                        <div className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                          Активен
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0" 
                        onClick={() => openChatWithReferral(referral.username)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">У вас пока нет рефералов</p>
                <p className="text-xs mt-1">Поделитесь своей реферальной ссылкой с друзьями</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            {filteredReferrals.length > 0 ? (
              <div className="space-y-2">
                {filteredReferrals.map(referral => (
                  <div 
                    key={referral.id} 
                    className="flex justify-between items-center p-2 rounded-lg border bg-green-50"
                  >
                    <div>
                      <div className="text-sm font-medium">{referral.username}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => openChatWithReferral(referral.username)}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">У вас пока нет активных рефералов</p>
                <p className="text-xs mt-1">Рефералы становятся активными после покупки Генератора</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReferralsTab;
