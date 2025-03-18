
// Компонент вкладки с реферальной системой
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { getUserReferralCode, getUserReferrals, checkReferralInfo } from '@/api/gameDataService';
import { toast } from '@/hooks/use-toast';
import { getUserIdentifier } from '@/api/userIdentification';
import { saveReferralInfo } from '@/api/gameDataService';
import { formatDate } from '@/utils/helpers';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Компонент вкладки с реферальной системой
 * @returns {JSX.Element} Компонент вкладки
 */
export default function ReferralsTab(): JSX.Element {
  const { dispatch, state } = useGame();
  const [referralCode, setReferralCode] = useState<string>('Загрузка...');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [referCode, setReferCode] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Функция для добавления ивентов (используется локально)
  const onAddEvent = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    safeDispatchGameEvent(message, type);
  };
  
  // Функция загрузки реферального кода
  const loadReferralCode = async (): Promise<void> => {
    try {
      const code = await getUserReferralCode();
      if (code) {
        setReferralCode(code);
        dispatch({ type: 'SET_REFERRAL_CODE', payload: { code } });
      }
    } catch (error) {
      console.error('Ошибка при загрузке реферального кода:', error);
      setReferralCode('Ошибка загрузки');
    }
  };
  
  // Функция загрузки списка рефералов
  const loadReferrals = async (): Promise<void> => {
    try {
      const refs = await getUserReferrals();
      setReferrals(refs);
      
      // Добавляем рефералов в состояние игры
      refs.forEach(ref => {
        dispatch({ 
          type: 'ADD_REFERRAL', 
          payload: { referral: ref } 
        });
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке списка рефералов:', error);
      setLoading(false);
    }
  };
  
  // Обработка копирования в буфер обмена
  const copyToClipboard = () => {
    const url = `https://t.me/crypto_civilization_bot?start=${referralCode}`;
    navigator.clipboard.writeText(url).then(
      () => {
        toast({
          title: "Скопировано!",
          description: "Ссылка скопирована в буфер обмена",
          variant: "default",
        });
        onAddEvent("Реферальная ссылка скопирована в буфер обмена", "success");
      },
      () => {
        toast({
          title: "Ошибка!",
          description: "Не удалось скопировать ссылку",
          variant: "destructive",
        });
        onAddEvent("Не удалось скопировать реферальную ссылку", "error");
      }
    );
  };
  
  // Проверка реферального кода
  const checkReferCode = async () => {
    if (!referCode || referCode.length < 4) {
      toast({
        title: "Неверный код",
        description: "Введите корректный реферальный код",
        variant: "destructive",
      });
      return;
    }
    
    const result = await checkReferralInfo(referCode);
    
    if (!result.exists) {
      toast({
        title: "Код не найден",
        description: "Введенный реферальный код не существует",
        variant: "destructive",
      });
      return;
    }
    
    if (result.isSelf) {
      toast({
        title: "Ошибка",
        description: "Вы не можете использовать свой собственный код",
        variant: "destructive",
      });
      return;
    }
    
    setIsDialogOpen(true);
  };
  
  // Подтверждение использования реферального кода
  const confirmUseReferCode = async () => {
    try {
      const userId = await getUserIdentifier();
      
      if (!userId) {
        toast({
          title: "Ошибка",
          description: "Не удалось определить пользователя",
          variant: "destructive",
        });
        return;
      }
      
      await saveReferralInfo(userId, referCode);
      
      toast({
        title: "Успешно!",
        description: "Реферальный код успешно применен",
        variant: "default",
      });
      
      // Обновляем состояние игры
      dispatch({ 
        type: 'SET_REFERRED_BY', 
        payload: { referredBy: referCode } 
      });
      
      setIsDialogOpen(false);
      
      // Обновляем информацию
      loadReferralCode();
    } catch (error) {
      console.error('Ошибка при применении реферального кода:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось применить реферальный код",
        variant: "destructive",
      });
    }
  };
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadReferralCode();
    loadReferrals();
  }, []);
  
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ваш реферальный код</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Input value={referralCode} readOnly className="bg-gray-100" />
              <Button onClick={copyToClipboard}>Копировать ссылку</Button>
            </div>
            <p className="text-sm text-gray-500">
              Поделитесь этим кодом с друзьями и получите бонусы за каждого нового игрока!
            </p>
          </div>
        </CardContent>
      </Card>
      
      {!state.referredBy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ввести реферальный код</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Input 
                  value={referCode} 
                  onChange={(e) => setReferCode(e.target.value.toUpperCase())}
                  placeholder="Введите реферальный код" 
                  maxLength={8}
                />
                <Button onClick={checkReferCode}>Применить</Button>
              </div>
              <p className="text-sm text-gray-500">
                Введите реферальный код, чтобы получить стартовые бонусы. 
                Код можно ввести только один раз.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ваши рефералы {referrals.length > 0 && `(${referrals.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка списка рефералов...</p>
          ) : referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.map((ref, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{ref.username}</p>
                    <p className="text-xs text-gray-500">Присоединился: {formatDate(new Date(ref.joinedAt))}</p>
                  </div>
                  <div>
                    {ref.activated ? (
                      <Badge>Активен</Badge>
                    ) : (
                      <Badge variant="outline">Не активен</Badge>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium">Что дают рефералы?</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>50 USDT за каждого активированного реферала</li>
                  <li>+5% к производительности за каждого активного реферала</li>
                  <li>Возможность приглашать рефералов на работу в ваши здания</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">У вас пока нет рефералов</p>
              <p className="text-sm mt-2">Поделитесь своим реферальным кодом, чтобы привлечь новых игроков</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение использования реферального кода</DialogTitle>
          </DialogHeader>
          <p>
            Вы собираетесь использовать реферальный код: <strong>{referCode}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Реферальный код можно использовать только один раз. 
            После применения изменить его будет невозможно.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button onClick={confirmUseReferCode}>Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
