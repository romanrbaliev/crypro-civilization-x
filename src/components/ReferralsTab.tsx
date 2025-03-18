
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useGame } from '@/context/hooks/useGame';
import ReferralTable from './ReferralTable';

export default function ReferralsTab() {
  const { state } = useGame();
  const { referralCode } = state;
  
  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success("Реферальный код скопирован в буфер обмена");
    }
  };
  
  return (
    <Tabs defaultValue="invite" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="invite">Пригласить</TabsTrigger>
        <TabsTrigger value="referrals">Мои рефералы</TabsTrigger>
      </TabsList>
      
      <TabsContent value="invite">
        <Card>
          <CardHeader>
            <CardTitle>Пригласите друзей в игру</CardTitle>
            <CardDescription>
              Получайте бонусы при активации реферала
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="referral-code" className="text-sm font-medium">
                  Ваш реферальный код
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="referral-code"
                    value={referralCode || ""}
                    readOnly
                    className="font-mono"
                  />
                  <Button size="icon" variant="outline" onClick={copyReferralCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="font-semibold mb-2">Преимущества реферальной программы:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Получайте 5% бонуса к производству ресурсов за каждого активного реферала</li>
                  <li>Рефералы могут помогать в управлении вашими зданиями</li>
                  <li>Дополнительные бонусы при активации исследований рефералами</li>
                </ul>
              </div>
              
              <Button variant="default" className="w-full mt-4 gap-2">
                <UserPlus className="h-4 w-4" />
                Поделиться ссылкой
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="referrals">
        <ReferralTable />
      </TabsContent>
    </Tabs>
  );
}
