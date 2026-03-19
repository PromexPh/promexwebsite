'use client';

import { useState, useCallback } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  function ToastContainer() {
    return (
      <div className={styles.container} aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.type]}`}
            role="alert"
          >
            <i
              className={`fa-solid ${
                t.type === 'success'
                  ? 'fa-circle-check'
                  : t.type === 'error'
                  ? 'fa-circle-exclamation'
                  : 'fa-triangle-exclamation'
              }`}
              aria-hidden="true"
            />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    );
  }

  return { addToast, ToastContainer };
}
