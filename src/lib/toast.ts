import { toast } from 'sonner';

// Enhanced toast utilities with consistent styling

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showSuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    duration: options?.duration || 4000,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
};

export const showError = (message: string, options?: ToastOptions) => {
  toast.error(message, {
    duration: options?.duration || 5000,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
};

export const showInfo = (message: string, options?: ToastOptions) => {
  toast.info(message, {
    duration: options?.duration || 4000,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
};

export const showWarning = (message: string, options?: ToastOptions) => {
  toast.warning(message, {
    duration: options?.duration || 4500,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};

// Letter-specific toasts
export const letterToasts = {
  sending: () => showLoading('Sealing your letter...'),
  sent: () => showSuccess('Letter sealed and sent! ✉️'),
  opened: () => showSuccess('Letter opened successfully! 📬'),
  deleted: () => showSuccess('Letter deleted'),
  reactionAdded: () => showSuccess('Reaction added! 💝'),
  copied: () => showSuccess('Tracking ID copied to clipboard'),
  uploadError: () => showError('Failed to upload letter. Please try again.'),
  networkError: () => showError('Network error. Please check your connection.'),
  authRequired: () => showWarning('Please sign in to continue'),
};
