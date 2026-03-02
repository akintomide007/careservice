'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

let toastId = 0;
let addToastCallback: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const showToast = (toast: Omit<Toast, 'id'>) => {
  if (addToastCallback) {
    addToastCallback(toast);
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastCallback = (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${++toastId}`;
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration || 5000,
      };
      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto w-96 max-w-full border rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300 ${getColors(
            toast.type
          )}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1">{toast.title}</h3>
              {toast.message && (
                <p className="text-sm opacity-90">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
