
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

interface ErrorScreenProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onReload?: () => void;
  errorType?: string;
  error?: Error | string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  title = "Произошла ошибка", 
  description = "Не удалось загрузить приложение. Пожалуйста, попробуйте снова.", 
  onRetry, 
  onReload = () => window.location.reload(),
  errorType,
  error
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  
  const errorDetails = error instanceof Error 
    ? `${error.name}: ${error.message}\n${error.stack}` 
    : typeof error === 'string' 
      ? error 
      : 'Детали ошибки недоступны';
  
  const handleClose = () => {
    setIsOpen(false);
    if (onReload) {
      onReload();
    }
  };
  
  // Вместо полноэкранного режима используем диалог с информацией об ошибке
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{description}</p>
            {error && (
              <div className="mt-4 p-2 bg-gray-100 rounded-md text-xs text-gray-700 max-h-40 overflow-auto">
                <pre className="whitespace-pre-wrap">{errorDetails}</pre>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="space-x-2">
          {onRetry && (
            <Button 
              variant="outline" 
              onClick={() => {
                onRetry();
                setIsOpen(false);
              }}
            >
              Повторить попытку
            </Button>
          )}
          <AlertDialogAction onClick={handleClose}>
            Перезагрузить страницу
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorScreen;
