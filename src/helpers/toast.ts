export type Toast = {
  id: number;
  message: string;
  variation: "info" | "error";
  actionLabel?: string;
  onAction?: () => void;
};

export type ToastOptions = {
  variation?: "info" | "error";
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

const DEFAULT_DURATION_MS = 5000;

let nextId = 1;
let toasts: Toast[] = [];
const listeners = new Set<(toasts: Toast[]) => void>();

const emit = () => {
  const snapshot = [...toasts];
  listeners.forEach((listener) => listener(snapshot));
};

export const dismissToast = (id: number) => {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
};

/** Show a transient toast; returns its id. Auto-dismisses after durationMs. */
export const showToast = (message: string, options: ToastOptions = {}) => {
  const id = nextId++;
  toasts = [
    ...toasts,
    {
      id,
      message,
      variation: options.variation ?? "info",
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    },
  ];
  emit();
  setTimeout(() => dismissToast(id), options.durationMs ?? DEFAULT_DURATION_MS);
  return id;
};

/** Subscribe to toast changes; returns an unsubscribe function. */
export const subscribeToToasts = (listener: (toasts: Toast[]) => void) => {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
};
