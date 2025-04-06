
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorScreenProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onReload?: () => void;
  errorType?: string; // Добавляем поддержку для errorType
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  title = "Произошла ошибка", 
  description = "Не удалось загрузить приложение. Пожалуйста, попробуйте снова.", 
  onRetry, 
  onReload = () => window.location.reload(),
  errorType // Новое свойство 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{description}</p>
        <div className="flex flex-col space-y-2">
          {onRetry && (
            <Button 
              variant="outline" 
              onClick={onRetry}
            >
              Повторить попытку подключения
            </Button>
          )}
          <Button onClick={onReload}>
            Обновить страницу
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
