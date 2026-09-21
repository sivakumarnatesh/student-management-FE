import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon" />,
    error: <AlertTriangle size={18} className="toast-icon" />,
    info: <Info size={18} className="toast-icon" />,
  };

  return (
    <div className={`toast ${toast.type || 'info'}`}>
      {icons[toast.type] || icons.info}
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-msg">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
