'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, AlertCircle, Info, X, 
  Mail, Bell, Sparkles 
} from 'lucide-react';

// Toast types
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'letter';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  letterNotification: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast icons and colors
const toastConfig: Record<ToastType, { icon: React.ReactNode; bgColor: string; borderColor: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    bgColor: 'from-green-900/40 to-green-900/20',
    borderColor: 'border-green-500/30',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    bgColor: 'from-red-900/40 to-red-900/20',
    borderColor: 'border-red-500/30',
  },
  warning: {
    icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    bgColor: 'from-yellow-900/40 to-yellow-900/20',
    borderColor: 'border-yellow-500/30',
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-400" />,
    bgColor: 'from-blue-900/40 to-blue-900/20',
    borderColor: 'border-blue-500/30',
  },
  letter: {
    icon: <Mail className="w-5 h-5 text-amber-400" />,
    bgColor: 'from-amber-900/40 to-orange-900/20',
    borderColor: 'border-amber-500/30',
  },
};

// Individual toast component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = toastConfig[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`relative bg-gradient-to-r ${config.bgColor} backdrop-blur-xl rounded-xl border ${config.borderColor} p-4 shadow-2xl min-w-[320px] max-w-[420px]`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-white/60 text-xs mt-1 leading-relaxed">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {toast.duration && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 origin-left rounded-b-xl"
        />
      )}

      {/* Special effects for letter type */}
      {toast.type === 'letter' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
        </motion.div>
      )}
    </motion.div>
  );
}

// Toast container component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Toast provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const letterNotification = useCallback((title: string, message?: string) => {
    addToast({ type: 'letter', title, message, duration: 8000 });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    letterNotification,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Notification center component (for persistent notifications)
interface Notification {
  id: string;
  type: 'letter' | 'reaction' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  letterId?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClearAll,
  isOpen,
  onClose,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Obaveštenja</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-500 text-black rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Obriši sve
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="overflow-y-auto h-[calc(100%-72px)]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40">
                  <Bell className="w-12 h-12 mb-4 opacity-50" />
                  <p>Nema obaveštenja</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-amber-500/5' : ''
                      }`}
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'letter' 
                            ? 'bg-amber-500/20' 
                            : notification.type === 'reaction'
                            ? 'bg-pink-500/20'
                            : 'bg-blue-500/20'
                        }`}>
                          {notification.type === 'letter' ? (
                            <Mail className="w-4 h-4 text-amber-400" />
                          ) : notification.type === 'reaction' ? (
                            <Sparkles className="w-4 h-4 text-pink-400" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-white/60 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-white/40 mt-2">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper function
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Upravo sada';
  if (seconds < 3600) return `Pre ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Pre ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `Pre ${Math.floor(seconds / 86400)} dana`;
  
  return date.toLocaleDateString('sr-Latn');
}

export default ToastProvider;
