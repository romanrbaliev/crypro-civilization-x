
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
        // Нормализуем тип тоста
        let adjustedVariant: ToastType = (props.variant || "default") as ToastType;
        
        // Преобразуем варианты, которые не соответствуют ToastType
        if (props.variant === "destructive" || props.variant === "error") {
          adjustedVariant = "destructive";
        } else if (props.variant === "default" || props.variant === "info") {
          adjustedVariant = "default";
        } else if (props.variant === "success") {
          adjustedVariant = "success";
        } else if (props.variant === "warning") {
          adjustedVariant = "warning";
        }
        
        return (
          <Toast key={id} {...props} variant={adjustedVariant}>
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
