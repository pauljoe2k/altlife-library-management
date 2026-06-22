import styles from './StatusBadge.module.css';

/**
 * StatusBadge
 * Props:
 *   status  {'Issued' | 'Returned' | 'Overdue'}
 *   days    {number}  — days overdue, shown only when Overdue
 */
export default function StatusBadge({ status, days = 0 }) {
  const modMap = {
    Issued:   styles.issued,
    Returned: styles.returned,
    Overdue:  styles.overdue,
  };

  const labelMap = {
    Issued:   'Issued',
    Returned: 'Returned',
    Overdue:  days > 0 ? `Overdue · ${days}d` : 'Overdue',
  };

  return (
    <span className={`${styles.badge} ${modMap[status] ?? styles.issued}`}>
      <span className={styles.dot} aria-hidden="true" />
      {labelMap[status] ?? status}
    </span>
  );
}