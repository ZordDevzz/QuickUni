"use client"

import { toast, type ExternalToast } from "sonner"

type ToastType = "success" | "error" | "info" | "warning" | "default"
type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"

interface NotifyOptions extends Omit<ExternalToast, "position"> {
  type?: ToastType
  position?: ToastPosition
}

/**
 * A wrapper around Sonner's toast function to allow easy configuration
 * of position and type per-call.
 */
export const notify = (message: string, { type = "default", position, ...options }: NotifyOptions = {}) => {
  const toastOptions: ExternalToast = {
    position,
    ...options,
  }

  switch (type) {
    case "success":
      return toast.success(message, toastOptions)
    case "error":
      return toast.error(message, toastOptions)
    case "info":
      return toast.info(message, toastOptions)
    case "warning":
      return toast.warning(message, toastOptions)
    default:
      return toast(message, toastOptions)
  }
}

/**
 * Custom base toast component example
 * Usage: notify("Message", { type: "default" }) or use this component in toast.custom()
 */
// You can extend this to render fully custom JSX if needed
// toast.custom((t) => <MyCustomToast t={t} />)
