
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Settings } from "lucide-react";
import { useGame } from "@/context/hooks/useGame";
import LanguageSwitch from "./LanguageSwitch";
import { useTranslation } from "@/i18n";

interface SettingsDialogProps {
  className?: string;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ className }) => {
  const { dispatch } = useGame();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = React.useState(false);
  
  const handleSaveGame = () => {
    // Отправляем событие для сохранения игры
    dispatch({ type: 'SAVE_GAME' });
  };
  
  const handleLoadGame = () => {
    // Отправляем событие для загрузки игры
    dispatch({ type: 'LOAD_GAME' });
  };
  
  const handleResetGame = () => {
    // Закрываем диалог подтверждения
    setShowResetConfirmation(false);
    // Закрываем диалог настроек
    setIsOpen(false);
    
    // Отправляем событие для сброса игры
    dispatch({ type: 'RESET_GAME' });
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className={className}
          >
            <Settings className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('settings.title')}</DialogTitle>
            <DialogDescription>
              {t('app.title')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Выбор языка */}
            <LanguageSwitch />
            
            {/* Кнопки управления сохранением */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button onClick={handleSaveGame}>
                {t('settings.saveGame')}
              </Button>
              <Button onClick={handleLoadGame} variant="outline">
                {t('settings.loadGame')}
              </Button>
            </div>
            
            {/* Кнопка сброса игры */}
            <Button 
              onClick={() => setShowResetConfirmation(true)} 
              variant="destructive"
              className="mt-2"
            >
              {t('settings.resetGame')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Диалог подтверждения сброса игры */}
      <AlertDialog open={showResetConfirmation} onOpenChange={setShowResetConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сброс игры</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите сбросить игру? Весь прогресс будет удален.
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetGame}>Сбросить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsDialog;
