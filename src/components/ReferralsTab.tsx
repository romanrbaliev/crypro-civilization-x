
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Building, ReferralHelper } from '@/context/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle, UserPlus, User, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserIdentifier } from '@/api/gameDataService';
import { asBuilding } from '@/utils/typeGuards';

interface ReferralsTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(state.referralCode);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [isReferralCodeCopied, setIsReferralCodeCopied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
    // Simulating referrals fetch since actual implementation has issues
    setTimeout(() => {
      setReferrals([]);
      setIsLoading(false);
    }, 500);

    if (!referralCode) {
      // Get user identifier as a fallback
      getUserIdentifier().then(newCode => {
        setReferralCode(newCode);
      });
    }
  }, [referralCode]);

  return (
    <div className="referrals-tab p-2">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Ваша реферальная система</h2>
        <p className="text-sm text-gray-600 mb-4">
          Приглашайте друзей и получайте бонусы! Каждый приглашенный вами игрок даст вам прирост к эффективности действий.
        </p>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ваш реферальный код</CardTitle>
            <CardDescription>Поделитесь этим кодом с друзьями</CardDescription>
          </CardHeader>
          <CardContent>
            {isLinkLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex">
                <Input 
                  value={referralCode || 'Загрузка...'}
                  readOnly
                  className="mr-2 bg-gray-50"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    if (referralCode) {
                      navigator.clipboard.writeText(referralCode);
                      setIsReferralCodeCopied(true);
                      setTimeout(() => setIsReferralCodeCopied(false), 2000);
                      toast({
                        title: "Скопировано!",
                        description: "Реферальный код скопирован в буфер обмена",
                      });
                    }
                  }}
                >
                  {isReferralCodeCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralsTab;
