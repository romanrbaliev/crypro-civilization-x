
import React, { useState } from "react";
import { Trash, RefreshCcw } from "lucide-react";
import { resetAllGameData } from "@/context/utils/gameStorage";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const [resetAlertOpen, setResetAlertOpen] = useState(false);

  const handleResetAll = async () => {
    try {
      await resetAllGameData();
      toast.success('Все сохранения для всех пользователей успешно удалены', {
        position: 'top-center',
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error('Не удалось удалить сохранения игры.', {
        position: 'top-center',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки</DialogTitle>
            <DialogDescription>
              Управление игрой и дополнительные опции
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium mb-2">Настройки игры</h3>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span>Звук</span>
                <Button variant="outline" size="sm">
                  Вкл
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span>Уведомления</span>
                <Button variant="outline" size="sm">
                  Вкл
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium mb-2">Сохранения</h3>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span>Сбросить мой прогресс</span>
                <Button variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Сбросить
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200">
                <span className="font-medium text-red-600">Сбросить для всех</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-200 hover:text-red-700" 
                  onClick={() => setResetAlertOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Сбросить все
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium mb-2">О игре</h3>
              <p className="text-sm text-gray-500">
                Версия: 0.1.0 (Альфа)<br />
                © 2023 Crypto Civilization
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Закрыть</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      
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
    </>
  );
};

export default SettingsDialog;
