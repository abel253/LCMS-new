// app/composables/useToast.ts
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message: string
  duration: number
  timestamp: number
}

const toasts = ref<ToastItem[]>([])

export const useToast = () => {
  const remove = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const show = (options: {
    type?: ToastType
    title?: string
    message: string
    duration?: number
  }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const type = options.type || 'info'
    const duration = options.duration ?? (type === 'error' ? 5000 : 4000)

    let defaultTitle = ''
    switch (type) {
      case 'success': defaultTitle = 'Success'; break
      case 'error': defaultTitle = 'Action Failed'; break
      case 'warning': defaultTitle = 'Notice'; break
      case 'info': defaultTitle = 'Information'; break
    }

    const item: ToastItem = {
      id,
      type,
      title: options.title || defaultTitle,
      message: options.message,
      duration,
      timestamp: Date.now()
    }

    toasts.value.unshift(item)

    // Keep max 5 toasts visible at a time
    if (toasts.value.length > 5) {
      toasts.value.pop()
    }

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const success = (message: string, title: string = 'Success') => {
    return show({ type: 'success', title, message })
  }

  const error = (message: string, title: string = 'Error') => {
    return show({ type: 'error', title, message })
  }

  const warning = (message: string, title: string = 'Warning') => {
    return show({ type: 'warning', title, message })
  }

  const info = (message: string, title: string = 'Notice') => {
    return show({ type: 'info', title, message })
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  }
}
