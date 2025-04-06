
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Settings, Trophy } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resetAllGameData } from "@/context/utils/gameStorage";
import { toast } from "@/hooks/use-toast";
import { useGame } from "@/context/hooks/useGame";
import Logo from "@/components/Logo";

interface HeaderProps {
  prestigePoints: number;
}

const Header: React.FC<HeaderProps> = ({ prestigePoints }) => {
  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const { state } = useGame();

  const handleResetAll = async () => {
    try {
      await resetAllGameData();
      toast({
        title: "Сброс выполнен",
        description: "Все сохранения успешно удалены. Страница будет перезагружена.",
        variant: "success",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({
        title: "Ошибка сброса",
        description: "Не удалось удалить сохранения игры.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white border-b shadow-sm p-2 flex-shrink-0">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center">
          <Logo className="ml-2" />
        </div>
        
        <div className="flex items-center space-x-2">
          {prestigePoints > 0 && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">{prestigePoints}</span>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setResetAlertOpen(true)}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            <span>Сбросить прогресс</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Настройки</SheetTitle>
                <SheetDescription>
                  Управление игрой и дополнительные опции
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <h3 className="font-medium mb-2">Настройки игры</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
                    onClick={() => setResetAlertOpen(true)}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Сбросить прогресс
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-medium mb-2">О игре</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Версия: 0.1.0 (Альфа)<br />
                  © 2023 Crypto Civilization
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <AlertDialog open={resetAlertOpen} onOpenChange={setResetAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сбросить все сохранения?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит все сохранения игры для всех пользователей.
              Данное действие невозможно отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-red-500 hover:bg-red-600">
              Сбросить все сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Header;
