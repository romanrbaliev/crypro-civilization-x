
import React from 'react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Settings } from 'lucide-react';

const GameHeader: React.FC = () => {
  return (
    <div className="border-b flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className="text-xs hover:text-blue-500 cursor-pointer">
                Как играть
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuLink className="text-xs hover:text-blue-500 cursor-pointer">
                Сбросить прогресс
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          <Settings size={18} />
        </button>
        
        <span className="text-xs">Настройки</span>
      </div>
    </div>
  );
};

export default GameHeader;
