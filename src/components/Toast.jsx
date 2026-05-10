import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-[60px] right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`flex items-center gap-2 p-3 bg-surface border rounded-md shadow-lg min-w-[250px] animate-in slide-in-from-right-5 fade-in duration-300 ${toast.type === 'success' ? 'border-accent-success' : toast.type === 'warning' ? 'border-accent-warning' : 'border-accent-error'}`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-accent-success" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-accent-warning" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-accent-error" />}
          <span className="text-sm font-medium text-text-primary">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
