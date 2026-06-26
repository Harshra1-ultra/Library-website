import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto transform translate-y-0 animate-fade-in-right
              ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : ''}
              ${isError ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : ''}
              ${isWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : ''}
              ${toast.type === 'info' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : ''}
            `}
          >
            {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium pr-2 text-white/90">
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
