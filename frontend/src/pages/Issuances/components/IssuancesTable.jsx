import { issuanceService } from '../../../services/issuanceService';
import StatusBadge         from './StatusBadge';
import styles              from './IssuancesTable.module.css';

/**
 * IssuancesTable
 * Props:
 *   issuances   {array}
 *   loading     {boolean}
 *   error       {string|null}
 *   actionId    {number|null}   — id currently being acted on
 *   onReturn    {fn(id)}
 *   onDelete    {fn(issuance)}  — receives full object for confirm dialog
 *   onRetry     {fn}
 */
export default function IssuancesTable({
  issuances, loading, error, actionId, onReturn, onDelete, onRetry,
}) {

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.wrap}>
        <table className={styles.table}>
          <TableHead />
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i} className={styles.row}>
                {SKELETON_WIDTHS.map((w, j) => (
                  <td key={j} className={styles.td}>
                    <span className={styles.skeleton} style={{ width: w }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>⚠</span>
        <p className={styles.noticeText}>{error}</p>
        <button className={styles.retryBtn} onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────
  if (issuances.length === 0) {
    return (
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>🔄</span>
        <p className={styles.noticeText}>No issuances found.</p>
        <p className={styles.noticeHint}>
          Issue a book or adjust your filters.
        </p>
      </div>
    );
  }

  // ── Table ────────────────────────────────────────────────────
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <TableHead />
        <tbody>
          {issuances.map((issuance) => {
            const displayStatus = issuanceService.getDisplayStatus(issuance);
            const daysOverdue   = issuanceService.getDaysOverdue(issuance);
            const isActing      = actionId === issuance.id;
            const isReturned    = issuance.status === 'Returned';

            return (
              <tr
                key={issuance.id}
                className={`${styles.row} ${isActing ? styles.rowActing : ''}`}
              >
                {/* Member */}
                <td className={styles.td}>
                  <div className={styles.personCell}>
                    <span className={styles.personName}>
                      {issuance.member?.name ?? `Member #${issuance.memberId}`}
                    </span>
                    <span className={styles.personSub}>
                      {issuance.member?.email ?? ''}
                    </span>
                  </div>
                </td>

                {/* Book */}
                <td className={styles.td}>
                  <div className={styles.bookCell}>
                    <span className={styles.bookTitle}>
                      {issuance.book?.title ?? `Book #${issuance.bookId}`}
                    </span>
                    <span className={styles.bookAuthor}>
                      {issuance.book?.author ?? ''}
                    </span>
                  </div>
                </td>

                {/* Issued date */}
                <td className={styles.td}>
                  <span className={styles.dateText}>
                    {formatDate(issuance.issuedAt)}
                  </span>
                </td>

                {/* Due date */}
                <td className={styles.td}>
                  <span
                    className={`${styles.dateText} ${
                      displayStatus === 'Overdue' ? styles.dateOverdue : ''
                    }`}
                  >
                    {formatDate(issuance.dueDate)}
                  </span>
                </td>

                {/* Status */}
                <td className={styles.td}>
                  <StatusBadge status={displayStatus} days={daysOverdue} />
                </td>

                {/* Actions */}
                <td className={`${styles.td} ${styles.actions}`}>
                  {!isReturned && (
                    <button
                      className={styles.returnBtn}
                      onClick={() => onReturn(issuance.id)}
                      disabled={isActing}
                      aria-label={`Return book for ${issuance.member?.name}`}
                    >
                      {isActing ? 'Processing…' : '↩ Return'}
                    </button>
                  )}
                  {isReturned && (
                    <span className={styles.returnedLabel}>Returned</span>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(issuance)}
                    disabled={isActing}
                    aria-label="Delete issuance record"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function TableHead() {
  const cols = ['Member', 'Book', 'Issued', 'Due Date', 'Status', 'Actions'];
  return (
    <thead>
      <tr>
        {cols.map((h) => (
          <th key={h} className={styles.th}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

const SKELETON_WIDTHS = ['55%', '50%', '35%', '35%', '30%', '50%'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
}