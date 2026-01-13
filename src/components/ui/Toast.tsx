import React from 'react';
import { useToast, type ToastMessage } from '../../context/ToastContext';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const TOAST_STYLES = {
    success: {
        bg: 'bg-green-50/90 dark:bg-green-900/40',
        border: 'border-green-200/50 dark:border-green-800/50',
        icon: CheckCircle2,
        iconColor: 'text-green-600 dark:text-green-400',
        progress: 'bg-green-500'
    },
    error: {
        bg: 'bg-red-50/90 dark:bg-red-900/40',
        border: 'border-red-200/50 dark:border-red-800/50',
        icon: XCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        progress: 'bg-red-500'
    },
    info: {
        bg: 'bg-primary/5 dark:bg-primary/10',
        border: 'border-primary/20 dark:border-primary/30',
        icon: Info,
        iconColor: 'text-primary dark:text-primary-light',
        progress: 'bg-primary'
    },
    warning: {
        bg: 'bg-amber-50/90 dark:bg-amber-900/40',
        border: 'border-amber-200/50 dark:border-amber-800/50',
        icon: AlertCircle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        progress: 'bg-amber-500'
    }
};

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
    const { removeToast } = useToast();
    const style = TOAST_STYLES[toast.type];
    const Icon = style.icon;

    return (
        <div
            className={`
        pointer-events-auto flex items-center gap-3 w-80 max-w-sm px-4 py-3
        ${style.bg} ${style.border} border backdrop-blur-md rounded-2xl shadow-xl
        animate-in slide-in-from-right-full fade-in duration-300
      `}
            role="alert"
        >
            <div className={`p-2 rounded-xl ${style.iconColor} bg-white/50 dark:bg-black/20`}>
                <Icon size={20} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                    {toast.message}
                </p>
            </div>

            <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-500"
            >
                <X size={16} />
            </button>

            {toast.duration && toast.duration > 0 && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden bg-black/5 dark:bg-white/5">
                    <div
                        className={`h-full ${style.progress} transition-all linear`}
                        style={{
                            animation: `shrinkWidth ${toast.duration}ms linear forwards`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((t: ToastMessage) => (
                <ToastItem key={t.id} toast={t} />
            ))}
            <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};
