import React, { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showToast = (message: string, type: ToastType = 'info', duration: number = 4000) => {
    const toastOptions = {
      duration,
      position: 'top-right' as const,
      style: {
        background: '#fff',
        color: '#333',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
      },
    };

    switch (type) {
      case 'success':
        toast.success(message, {
          ...toastOptions,
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          style: {
            ...toastOptions.style,
            borderLeft: '4px solid #10b981',
          },
        });
        break;
      case 'error':
        toast.error(message, {
          ...toastOptions,
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          style: {
            ...toastOptions.style,
            borderLeft: '4px solid #ef4444',
          },
        });
        break;
      case 'warning':
        toast(message, {
          ...toastOptions,
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          style: {
            ...toastOptions.style,
            borderLeft: '4px solid #f59e0b',
          },
        });
        break;
      case 'info':
      default:
        toast(message, {
          ...toastOptions,
          icon: <Info className="w-5 h-5 text-blue-500" />,
          style: {
            ...toastOptions.style,
            borderLeft: '4px solid #3b82f6',
          },
        });
        break;
    }
  };

  const showSuccess = (message: string, duration?: number) => {
    showToast(message, 'success', duration);
  };

  const showError = (message: string, duration?: number) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showToast(message, 'info', duration);
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};









