
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { Play, Trophy, Settings, Volume2, VolumeX, RefreshCcw, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Animator, easing } from '@/utils/animations';
import { resetAllGameData } from '@/context/utils/gameStorage';
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

const Index = () => {
  const navigate = useNavigate();
  const [highScore, setHighScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [resetAlertOpen, setResetAlertOpen] = useState(false);

  // Загрузка рекорда из localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Анимация для элементов
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-stagger');
    
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.opacity = '0';
      htmlElement.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        new Animator(
          600,
          easing.easeOutBack,
          (progress) => {
            htmlElement.style.opacity = progress.toString();
            htmlElement.style.transform = `translateY(${20 * (1 - progress)}px)`;
          }
        ).start();
      }, 100 * index);
    });
  }, []);

  // Обработчики событий
  const handlePlay = () => {
    navigate('/game');
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Звук включен' : 'Звук выключен', {
      position: 'top-center',
    });
  };

  const handleResetAll = async () => {
    try {
      await resetAllGameData();
      toast.success('Все сохранения для всех пользователей успешно удалены', {
        position: 'top-center',
      });
      
      // Перезагрузка страницы после небольшой задержки
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
    <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-blue-50 to-white">
      {/* Декоративный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-100 opacity-50"></div>
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-green-100 opacity-40"></div>
        <div className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-red-100 opacity-30"></div>
      </div>
      
      {/* Верхняя панель */}
      <div className="glass border-b border-white/20 p-4 flex justify-between items-center z-10">
        <Logo size="md" className="animate-stagger" />
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSettings}
            className="rounded-full aspect-square p-2 animate-stagger"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Основное содержимое */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 animate-stagger">Космический Полет</h1>
          <p className="text-gray-600 max-w-md mx-auto animate-stagger">
            Управляйте космическим кораблем, избегайте астероидов и собирайте звезды для победы!
          </p>
        </div>
        
        {highScore > 0 && (
          <div className="glass px-6 py-4 rounded-full flex items-center gap-3 animate-stagger">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span className="font-semibold">Рекорд: {highScore}</span>
          </div>
        )}
        
        <Button
          size="lg"
          className="animate-stagger"
          onClick={handlePlay}
        >
          <Play className="mr-2 w-5 h-5" />
          Играть
        </Button>
      </div>
      
      {/* Настройки */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in z-20">
          <div className="glass p-8 rounded-2xl max-w-sm w-full animate-scale-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Настройки</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 hover:bg-white/20 rounded-lg transition-colors">
                <span>Звук</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleMute}
                  className="rounded-full aspect-square p-2"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-2 hover:bg-white/20 rounded-lg transition-colors">
                <span>Сбросить для всех</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResetAlertOpen(true)}
                  className="rounded-full aspect-square p-2"
                >
                  <Trash className="w-5 h-5 text-red-500" />
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-2 hover:bg-white/20 rounded-lg transition-colors">
                <span>Версия</span>
                <span className="text-sm text-gray-500">1.0.0</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleToggleSettings}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Диалог подтверждения сброса */}
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
      
      {/* Нижняя панель */}
      <div className="glass border-t border-white/20 p-4 text-center text-sm z-10">
        <p className="text-gray-600">© 2023 Telegram Mini Game. Все права защищены.</p>
      </div>
    </div>
  );
};

export default Index;
