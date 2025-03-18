
import React, { useEffect, useState } from 'react';
import { getUserReferrals } from '@/api/referralService';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Referral {
  id: string;
  username: string;
  activated: boolean;
  joinedAt: number;
}

const ReferralTable = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadReferrals = async () => {
    setLoading(true);
    try {
      const data = await getUserReferrals();
      console.log('Загружены рефералы:', data);
      setReferrals(data);
    } catch (error) {
      console.error('Ошибка при загрузке рефералов:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadReferrals();
  }, []);
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ваши рефералы</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadReferrals} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>
      
      {referrals.length > 0 ? (
        <Table>
          <TableCaption>Список приглашенных вами пользователей</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата регистрации</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell>{referral.username}</TableCell>
                <TableCell>
                  {referral.activated ? (
                    <Badge className="bg-green-500">Активирован</Badge>
                  ) : (
                    <Badge variant="outline">Ожидает активации</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(referral.joinedAt), { 
                    addSuffix: true,
                    locale: ru
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {loading ? 'Загрузка рефералов...' : 'У вас пока нет рефералов'}
        </div>
      )}
    </Card>
  );
};

export default ReferralTable;
