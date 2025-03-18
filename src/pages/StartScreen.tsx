
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { BitcoinIcon, Coins, Trophy, Settings, Info, Play, Trash2, DatabaseBackup } from "lucide-react";
import { clearGameState, clearAllSavedDataForAllUsers } from "@/context/utils/gameStorage";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const StartScreen = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  
  const handleStartGame = () => {
    dispatch({ type: "START_GAME" });
    navigate("/game");
  };
  
  const handleResetGame = async () => {
    await clearGameState();
    window.location.reload();
  };
  
  const handleResetAllGames = async () => {
    await clearAllSavedDataForAllUsers();
    window.location.reload();
  };
  
  const toggleAdminMode = () => {
    setAdminMode(!adminMode);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-purple-100 opacity-50" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-green-100 opacity-40" />
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-blue-100 opacity-30" />
      </div>
      
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-2xl font-bold">
            <BitcoinIcon className="h-8 w-8 text-amber-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              Crypto Civilization
            </span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleAdminMode}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-6 md:p-12 flex flex-col items-center justify-center z-10">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              Crypto Civilization
            </h1>
            <p className="text-lg text-gray-600">
              Начните как одиночный энтузиаст криптовалют и постройте целую децентрализованную цивилизацию
            </p>
          </div>
          
          <div className="space-y-4">
            {state.gameStarted && (
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-2">Существующая игра</h3>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{Object.values(state.resources).filter(r => r.unlocked).length}</div>
                    <div className="text-xs text-gray-600">Ресурсов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{Object.values(state.buildings).reduce((sum, b) => sum + b.count, 0)}</div>
                    <div className="text-xs text-gray-600">Зданий</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{Object.values(state.upgrades).filter(u => u.purchased).length}</div>
                    <div className="text-xs text-gray-600">Исследований</div>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              size="lg" 
              className="w-full text-lg py-6"
              onClick={handleStartGame}
            >
              <Play className="mr-2 h-5 w-5" />
              {state.gameStarted ? "Продолжить игру" : "Начать игру"}
            </Button>
            
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Info className="mr-2 h-4 w-4" />
                    Как играть
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Как играть в Crypto Civilization</DialogTitle>
                    <DialogDescription>
                      Руководство по основным механикам игры
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="basics">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="basics">Основы</TabsTrigger>
                      <TabsTrigger value="resources">Ресурсы</TabsTrigger>
                      <TabsTrigger value="buildings">Здания</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basics" className="space-y-4 mt-4">
                      <h4 className="font-semibold">Начало игры</h4>
                      <p className="text-sm">
                        1. Начните с изучения основ криптовалют, нажимая на кнопку "Изучить крипту".<br />
                        2. Накопив достаточно знаний, вы сможете применить их для получения USDT.<br />
                        3. Используйте USDT для строительства зданий, которые будут автоматически генерировать ресурсы.<br />
                        4. Постепенно открывайте новые механики и возможности по мере развития.
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="resources" className="space-y-4 mt-4">
                      <h4 className="font-semibold">Основные ресурсы</h4>
                      <ul className="space-y-2 text-sm">
                        <li><strong>🧠 Знания о крипте</strong> - базовый ресурс для исследований и обмена на USDT.</li>
                        <li><strong>💰 USDT</strong> - основная валюта для покупки зданий и улучшений.</li>
                        <li><strong>⚡ Электричество</strong> - необходимо для работы компьютеров и майнинг-ферм.</li>
                        <li><strong>💻 Вычислительная мощность</strong> - используется для майнинга и анализа данных.</li>
                        <li><strong>⭐ Репутация</strong> - влияет на эффективность социальных взаимодействий.</li>
                      </ul>
                    </TabsContent>
                    
                    <TabsContent value="buildings" className="space-y-4 mt-4">
                      <h4 className="font-semibold">Типы зданий</h4>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Практика</strong> - автоматически генерирует знания о криптовалютах.</li>
                        <li><strong>Генератор</strong> - производит электричество для ваших устройств.</li>
                        <li><strong>Домашний компьютер</strong> - обеспечивает вычислительную мощность.</li>
                        <li><strong>Криптокошелек</strong> - увеличивает максимальное хранение USDT.</li>
                        <li><strong>Интернет-канал</strong> - ускоряет получение знаний.</li>
                      </ul>
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => window.open("https://github.com/yourusername/crypto-civilization", "_blank")}>
                      Подробнее на GitHub
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Сбросить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Сбросить прогресс?</DialogTitle>
                    <DialogDescription>
                      Это действие удалит все ваши достижения и начнет игру заново. Это действие нельзя отменить.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setResetConfirmOpen(false)}>
                      Отмена
                    </Button>
                    <Button variant="destructive" onClick={handleResetGame}>
                      Сбросить игру
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {adminMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full mt-4">
                    <DatabaseBackup className="mr-2 h-4 w-4" />
                    Сбросить ВСЕ сохранения (для всех игроков)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Сбросить ВСЕ данные?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие удалит все сохранения для ВСЕХ игроков. 
                      Используйте только для тестирования и отладки. 
                      Это действие нельзя отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetAllGames} 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Удалить ВСЕ данные
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          {state.prestigePoints > 0 && (
            <div className="flex items-center justify-center space-x-2 text-amber-600">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">{state.prestigePoints} криптомудрости</span>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4 z-10">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© 2023 Crypto Civilization • Инкрементальная игра о крипте</p>
        </div>
      </footer>
    </div>
  );
};

export default StartScreen;
