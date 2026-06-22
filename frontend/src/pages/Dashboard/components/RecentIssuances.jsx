import styles from './RecentIssuances.module.css';
import { issuanceService } from '../../../services/issuanceService';

/**
 * RecentIssuances
 * Props:
 *   issuances  {array|null}   — null = loading, [] = empty
 *   loading    {boolean}
 *   error      {object|null}
 */
export default function RecentIssuances({ issuances, loading, error }) {

  if (loading) {
    return (
      <div className={styles.wrap}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>⚠</span>
        <p>Could not load recent issuances.</p>
      </div>
    );
  }

  if (!issuances || issuances.length === 0) {
    return (
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>📋</span>
        <p>No issuances recorded yet.</p>
      </div>
    );
  }

  // Show the 5 most recent entries
  const recent = [...issuances]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Member</th>
            <th className={styles.th}>Book</th>
            <th className={styles.th}>Issued</th>
            <th className={styles.th}>Due</th>
            <th className={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((issuance) => {
            const overdue  = issuanceService.isOverdue(issuance);
            const returned = Boolean(issuance.returnedAt);

            const statusLabel = returned
              ? 'Returned'
              : overdue
              ? `Overdue · ${issuanceService.getDaysOverdue(issuance)}d`
              : 'Active';

            const statusMod = returned
              ? styles.badgeReturned
              : overdue
              ? styles.badgeOverdue
              : styles.badgeActive;

            return (
              <tr key={issuance.id} className={styles.row}>
                <td className={styles.td}>
                  {issuance.member?.name ?? `Member #${issuance.memberId}`}
                </td>
                <td className={styles.td}>
                  {issuance.book?.title ?? `Book #${issuance.bookId}`}
                </td>
                <td className={styles.td}>
                  {formatDate(issuance.createdAt)}
                </td>
                <td className={styles.td}>
                  {formatDate(issuance.dueDate)}
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${statusMod}`}>
                    {statusLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
}