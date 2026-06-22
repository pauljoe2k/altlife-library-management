import { useEffect, useCallback } from 'react';
import styles from './ConfirmDialog.module.css';

/**
 * ConfirmDialog — reusable confirmation modal.
 * Props:
 *   isOpen      {boolean}
 *   title       {string}
 *   message     {string}
 *   confirmLabel {string}   default 'Confirm'
 *   cancelLabel  {string}   default 'Cancel'
 *   variant     {'danger' | 'warning'}   default 'danger'
 *   loading     {boolean}
 *   onConfirm   {fn}
 *   onCancel    {fn}
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  loading      = false,
  onConfirm,
  onCancel,
}) {
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape' && !loading) onCancel(); },
    [loading, onCancel],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const iconMap = { danger: '🗑️', warning: '⚠️' };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div className={styles.dialog}>

        <div className={styles.iconWrap} data-variant={variant}>
          <span aria-hidden="true">{iconMap[variant]}</span>
        </div>

        <div className={styles.content}>
          <h3 id="confirm-title" className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`${styles.confirmBtn} ${styles[variant]}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}