
import * as React from "react"
import { type ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5 // Уменьшаем лимит тостов
const TOAST_REMOVE_DELAY = 3000 // Увеличиваем время удаления

type ToastType = "default" | "destructive" | "success" | "warning" | "info"

// Расширяем типы ToastProps с нашими вариантами
export type ExtendedToastProps = Omit<ToastProps, "variant"> & {
  variant?: ToastType
}

type ToasterToast = ExtendedToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  isDuplicate?: boolean // Добавляем флаг для проверки дубликатов
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> & { id: string }
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// Функция для проверки дубликатов тостов
const isDuplicateToast = (state: State, toast: ToasterToast): boolean => {
  return state.toasts.some(
    t => 
      t.title === toast.title && 
      t.description === toast.description && 
      t.variant === toast.variant &&
      Date.now() - (t.createdAt as number || 0) < 3000 // Проверяем, что тост был создан не более 3 секунд назад
  )
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      // Проверка на дубликаты
      if (isDuplicateToast(state, action.toast)) {
        return state;
      }
      
      // Добавляем timestamp создания тоста
      const newToast = {
        ...action.toast,
        createdAt: Date.now()
      }
      
      // Автоматически удаляем toast через 5 секунд для типов success, info и warning
      if (["success", "info", "warning"].includes(newToast.variant as string)) {
        setTimeout(() => {
          dispatch({
            type: "DISMISS_TOAST",
            toastId: newToast.id,
          })
        }, 5000)
      }
      
      return {
        ...state,
        toasts: [newToast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Если toast ID не указан, удаляем все
      if (toastId === undefined) {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        }
      }

      // Удаляем конкретный toast
      addToRemoveQueue(toastId)
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
