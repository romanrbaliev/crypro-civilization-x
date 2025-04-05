import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { roles } from '@/utils/gameConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function SpecializationTab() {
  const { state, dispatch } = useGame();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Получаем текущую специализацию из состояния
  const currentSpecialization = state.player?.specialization || state.specialization;
  
  // Эффект для установки выбранной роли при загрузке компонента
  useEffect(() => {
    if (currentSpecialization) {
      setSelectedRole(currentSpecialization);
    }
  }, [currentSpecialization]);
  
  // Обработчик выбора специализации
  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };
  
  // Обработчик подтверждения выбора специализации
  const handleChooseSpecialization = (specializationId: string) => {
    dispatch({
      type: "CHOOSE_SPECIALIZATION",
      payload: { specializationId }
    });
  };
  
  // Проверка доступности роли
  const isRoleAvailable = (roleId: string) => {
    const role = roles[roleId];
    if (!role.requiredUpgrades) return true;
    
    return role.requiredUpgrades.every(upgradeId => 
      state.upgrades[upgradeId]?.purchased
    );
  };
  
  // Получение списка требуемых апгрейдов для роли
  const getRequiredUpgrades = (roleId: string) => {
    const role = roles[roleId];
    if (!role.requiredUpgrades) return [];
    
    return role.requiredUpgrades.map(upgradeId => ({
      id: upgradeId,
      name: state.upgrades[upgradeId]?.name || upgradeId,
      purchased: state.upgrades[upgradeId]?.purchased || false
    }));
  };
  
  // Форматирование бонуса для отображения
  const formatBonus = (key: string, value: number) => {
    const sign = value >= 0 ? '+' : '';
    const percentage = Math.abs(value * 100).toFixed(0);
    return `${sign}${percentage}% ${key}`;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Выбор специализации</h1>
      
      {currentSpecialization && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Текущая специализация: {roles[currentSpecialization]?.name || currentSpecialization}</AlertTitle>
          <AlertDescription>
            Вы уже выбрали специализацию. Изменить её можно будет после престижа.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(roles).map(([roleId, role]) => {
          const isAvailable = isRoleAvailable(roleId);
          const isSelected = selectedRole === roleId;
          const isActive = currentSpecialization === roleId;
          const requiredUpgrades = getRequiredUpgrades(roleId);
          
          return (
            <Card 
              key={roleId} 
              className={`
                ${isSelected ? 'border-blue-500 shadow-md' : ''}
                ${isActive ? 'bg-blue-50' : ''}
                ${!isAvailable ? 'opacity-70' : ''}
              `}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{role.name}</CardTitle>
                  {isActive && <Badge>Активно</Badge>}
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                    <div className="flex items-center justify-center h-full">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={`/images/roles/${roleId}.png`} alt={role.name} />
                        <AvatarFallback>{role.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                  </AspectRatio>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Бонусы:</h3>
                  <ul className="text-sm space-y-1">
                    {Object.entries(role.bonuses).map(([key, value]) => (
                      <li key={key} className="flex justify-between">
                        <span>{key}</span>
                        <span className="text-green-600">{formatBonus(key, value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {requiredUpgrades.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-medium">Требуемые исследования:</h3>
                    <ul className="text-sm space-y-1">
                      {requiredUpgrades.map(upgrade => (
                        <li key={upgrade.id} className="flex justify-between">
                          <span>{upgrade.name}</span>
                          <span className={upgrade.purchased ? 'text-green-600' : 'text-red-600'}>
                            {upgrade.purchased ? '✓' : '✗'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <div className="w-full space-y-2">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleRoleSelect(roleId)}
                    disabled={!isAvailable || isActive}
                  >
                    {isSelected ? 'Выбрано' : 'Выбрать'}
                  </Button>
                  
                  {isSelected && !isActive && (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleChooseSpecialization(roleId)}
                      disabled={!isAvailable || isActive}
                    >
                      Подтвердить выбор
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
