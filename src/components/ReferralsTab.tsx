
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/utils/helpers";
import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/components/ui/use-toast"
import { GameEvent } from "@/context/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReferralsTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [referralCode, setReferralCode] = useState<string | null>(state.referralCode || "");
  const [newReferralCode, setNewReferralCode] = useState("");
  const [helperRequest, setHelperRequest] = useState<{ referralId: string; buildingId: string } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const { toast } = useToast()
  
  useEffect(() => {
    if (state.referralCode) {
      setReferralCode(state.referralCode);
    }
  }, [state.referralCode]);
  
  const handleSetReferralCode = () => {
    if (newReferralCode && newReferralCode !== state.referralCode) {
      dispatch({ type: "SET_REFERRAL_CODE", payload: { code: newReferralCode } });
      setReferralCode(newReferralCode);
      onAddEvent(`Реферальный код установлен: ${newReferralCode}`, "success");
    }
  };
  
  const handleAddReferral = (code: string) => {
    if (code && code !== state.referralCode) {
      dispatch({ 
        type: "ADD_REFERRAL", 
        payload: { 
          referral: { id: code, activated: false } 
        } 
      });
      onAddEvent(`Реферал добавлен с кодом: ${code}`, "success");
    }
  };
  
  const handleActivateReferral = (referralId: string) => {
    dispatch({ type: "ACTIVATE_REFERRAL", payload: { referralId } });
    onAddEvent(`Реферал активирован: ${referralId}`, "success");
  };
  
  const handleHireReferralHelper = (referralId: string) => {
    if (selectedBuilding) {
      dispatch({
        type: "HIRE_REFERRAL_HELPER",
        payload: { referralId, buildingId: selectedBuilding }
      });
      onAddEvent(`Помощник нанят от реферала: ${referralId}`, "success");
    } else {
      toast({
        title: "Ошибка",
        description: "Необходимо выбрать здание для помощника",
        variant: "destructive",
      });
    }
  };
  
  const handleRespondToHelperRequest = (helperId: string, accepted: boolean) => {
    if (helperRequest) {
      dispatch({
        type: "RESPOND_TO_HELPER_REQUEST",
        payload: {
          helperId,
          accepted
        }
      });
      onAddEvent(`Ответ на запрос помощника: ${accepted ? 'Принят' : 'Отклонен'}`, accepted ? "success" : "warning");
      setHelperRequest(null);
    }
  };
  
  const handleUpdateReferralStatus = (referralId: string) => {
    dispatch({
      type: "UPDATE_REFERRAL_STATUS",
      payload: {
        referralId,
        status: "active",
        activated: true,
        hired: false,
        buildingId: null
      }
    });
  };
  
  const handleBuildingSelect = (buildingId: string) => {
    setSelectedBuilding(buildingId);
  };
  
  const renderReferralList = () => {
    if (!state.referrals || state.referrals.length === 0) {
      return <p>У вас пока нет рефералов.</p>;
    }
    
    return (
      <Table>
        <TableCaption>Список ваших рефералов и их статус.</TableCaption>
        <TableHead>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHead>
        <TableBody>
          {state.referrals.map((referral: any) => (
            <TableRow key={referral.id}>
              <TableCell>{referral.id}</TableCell>
              <TableCell>{referral.status || (referral.activated ? 'Активирован' : 'Не активирован')}</TableCell>
              <TableCell>
                {!referral.activated && (
                  <Button onClick={() => handleActivateReferral(referral.id)} variant="outline" size="sm">
                    Активировать
                  </Button>
                )}
                {!referral.hired && (
                  <Button onClick={() => handleHireReferralHelper(referral.id)} variant="outline" size="sm">
                    Нанять помощника
                  </Button>
                )}
                <Button onClick={() => handleUpdateReferralStatus(referral.id)} variant="outline" size="sm">
                  Обновить статус
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  const renderReferralHelpers = () => {
    if (!state.referralHelpers || state.referralHelpers.length === 0) {
      return <p>У вас пока нет помощников.</p>;
    }
    
    return (
      <Table>
        <TableCaption>Список ваших помощников и их статус.</TableCaption>
        <TableHead>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Запрос</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHead>
        <TableBody>
          {state.referralHelpers.map((helper) => (
            <TableRow key={helper.id}>
              <TableCell>{helper.id}</TableCell>
              <TableCell>
                {helper.status === "pending" && (
                  <>
                    Запрос на помощь в строительстве: {helper.buildingId}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Ответить
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Подтверждение запроса</DialogTitle>
                          <DialogDescription>
                            Вы уверены, что хотите помочь рефералу построить здание?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="building">Здание</Label>
                            <Select onValueChange={handleBuildingSelect} defaultValue={selectedBuilding || undefined}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Выберите здание" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(state.buildings).map((building) => (
                                  <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button onClick={() => handleRespondToHelperRequest(helper.id, true)} variant="outline" size="sm">
                          Принять
                        </Button>
                        <Button onClick={() => handleRespondToHelperRequest(helper.id, false)} variant="outline" size="sm">
                          Отклонить
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </TableCell>
              <TableCell>
                {helper.status === "accepted" && <p>Помогает строить: {helper.buildingId}</p>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <div className="referrals-tab">
      <h2>Реферальная система</h2>
      
      <div className="referral-code-section">
        <h3>Ваш реферальный код:</h3>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={referralCode || ""}
            disabled
            className="w-auto"
          />
          <Input
            type="text"
            placeholder="Новый реферальный код"
            value={newReferralCode}
            onChange={(e) => setNewReferralCode(e.target.value)}
            className="w-auto"
          />
          <Button onClick={handleSetReferralCode} variant="outline" size="sm">
            Установить код
          </Button>
        </div>
      </div>
      
      <div className="add-referral-section">
        <h3>Добавить реферала:</h3>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Введите реферальный код"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                handleAddReferral(input.value);
              }
            }}
            className="w-auto"
          />
          <Button onClick={() => handleAddReferral(newReferralCode)} variant="outline" size="sm">
            Добавить реферала
          </Button>
        </div>
      </div>
      
      <div className="referral-list-section">
        <h3>Список рефералов:</h3>
        {renderReferralList()}
      </div>
      
      <div className="referral-helpers-section">
        <h3>Помощники:</h3>
        {renderReferralHelpers()}
      </div>
    </div>
  );
};

export default ReferralsTab;
