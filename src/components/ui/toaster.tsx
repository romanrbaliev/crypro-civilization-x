
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Установим явно classNames в зависимости от типа уведомления
        let toastClassName = 'bg-white text-foreground';
        if (props.variant === "destructive" || props.variant === "error") {
          toastClassName = 'destructive';
        } else if (props.variant === "success") {
          toastClassName = 'bg-green-100 text-green-900 border-green-200';
        } else if (props.variant === "warning") {
          toastClassName = 'bg-yellow-100 text-yellow-900 border-yellow-200';
        } else if (props.variant === "info" || props.variant === "default") {
          toastClassName = 'bg-blue-50 text-blue-900 border-blue-100';
        }

        return (
          <Toast
            key={id}
            {...props}
            className={toastClassName}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
