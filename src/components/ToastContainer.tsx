import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        let bgStyle = 'bg-white border-slate-200 text-slate-800';
        let icon = <Info className="h-5 w-5 text-blue-500 shrink-0" />;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-emerald-500/10';
          icon = <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-rose-50 border-rose-300 text-rose-950 shadow-rose-500/10';
          icon = <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-red-100 border-red-400 text-red-950 shadow-red-500/20';
          icon = <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${bgStyle}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-xs font-bold leading-tight mb-0.5">{toast.title}</p>
              )}
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
