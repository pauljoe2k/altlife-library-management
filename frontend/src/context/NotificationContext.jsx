import { createContext, useCallback, useContext, useState } from 'react';
import styles from './NotificationContext.module.css';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss }}>
      {children}

      {/* Global toast tray — rendered once at the app root */}
      <div className={styles.tray} aria-live="polite" aria-atomic="false">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`${styles.toast} ${styles[n.type] ?? styles.info}`}
          >
            <span className={styles.toastMsg}>{n.message}</span>
            <button
              className={styles.toastClose}
              onClick={() => dismiss(n.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider');
  return ctx;
}