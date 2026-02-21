/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
    toasts: ToastMessage[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);

        setToasts((prev) => {
            // Remove any existing toast with the same message to prevent stacking
            const filtered = prev.filter((t) => t.message !== message);
            return [...filtered, { id, message, type, duration }];
        });

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return {
        toasts: context.toasts,
        removeToast: context.removeToast,
        toast: {
            success: (msg: string, dur?: number) => context.showToast(msg, 'success', dur),
            error: (msg: string, dur?: number) => context.showToast(msg, 'error', dur),
            info: (msg: string, dur?: number) => context.showToast(msg, 'info', dur),
            warning: (msg: string, dur?: number) => context.showToast(msg, 'warning', dur),
        }
    };
};
