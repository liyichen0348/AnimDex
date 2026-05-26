import { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

let toastListeners: Array<(msg: ToastMessage) => void> = [];

/**
 * 触发一个全局自定义 Toast 提示，取代系统默认弹窗
 */
export const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) => {
  const msg: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    text,
    type,
    duration
  };
  toastListeners.forEach(listener => listener(msg));
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const addToast = (msg: ToastMessage) => {
      setToasts(prev => [...prev, msg]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== msg.id));
      }, msg.duration || 3000);
    };

    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter(l => l !== addToast);
    };
  }, []);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-[90vw] max-w-sm items-center">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-xl border border-white/20 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            t.type === 'success'
              ? 'bg-[#10b981] text-white shadow-[#10b981]/20'
              : t.type === 'error'
              ? 'bg-[#ef4444] text-white shadow-[#ef4444]/20'
              : 'bg-[#3b82f6] text-white shadow-[#3b82f6]/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] fill">
            {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'cancel' : 'info'}
          </span>
          <span className="text-[14px] font-bold tracking-wide">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
