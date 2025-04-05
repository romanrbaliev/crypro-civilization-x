
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastType
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, ...props }) {
        // Преобразуем error в destructive для обратной совместимости
        let adjustedVariant = props.variant;
        if (adjustedVariant === "error") {
          adjustedVariant = "destructive";
        }
        
        return (
          <Toast key={id} {...props} variant={adjustedVariant as any}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
