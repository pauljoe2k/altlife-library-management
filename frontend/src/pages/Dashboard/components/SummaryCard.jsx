import styles from './SummaryCard.module.css';

/**
 * SummaryCard
 * Props:
 *   label   {string}  — metric name shown below the value
 *   value   {string|number|null}  — the stat; null = loading state
 *   icon    {string}  — emoji or single character
 *   accent  {string}  — CSS custom property name for the left border colour
 *                        e.g. '--color-primary' | '--color-success' | etc.
 *   error   {boolean} — renders an error indicator instead of value
 */
export default function SummaryCard({ label, value, icon, accent, error }) {
  const borderColor = accent
    ? `var(${accent})`
    : 'var(--color-primary)';

  return (
    <article
      className={styles.card}
      style={{ '--card-accent': borderColor }}
    >
      <div className={styles.iconWrap}>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.valueRow}>
          {error ? (
            <span className={styles.error}>—</span>
          ) : value === null || value === undefined ? (
            <span className={styles.skeleton} aria-label="Loading" />
          ) : (
            <span className={styles.value}>{value}</span>
          )}
        </div>
        <p className={styles.label}>{label}</p>
      </div>
    </article>
  );
}