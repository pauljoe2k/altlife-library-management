import styles from './MembersTable.module.css';

/**
 * MembersTable
 * Props:
 *   members  {array}         — filtered list to render
 *   loading  {boolean}
 *   error    {string|null}
 *   deleteId {number|null}   — memberId currently being deleted
 *   onEdit   {fn(member)}
 *   onDelete {fn(memberId)}
 *   onRetry  {fn}
 */
export default function MembersTable({
  members, loading, error, deleteId, onEdit, onDelete, onRetry,
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
                {[...Array(5)].map((__, j) => (
                  <td key={j} className={styles.td}>
                    <span
                      className={styles.skeleton}
                      style={{ width: SKELETON_WIDTHS[j] }}
                    />
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
  if (members.length === 0) {
    return (
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>👥</span>
        <p className={styles.noticeText}>No members found.</p>
        <p className={styles.noticeHint}>
          Add a member or clear your search filter.
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
          {members.map((member) => {
            const isDeleting = deleteId === member.memberId;
            return (
              <tr
                key={member.memberId}
                className={`${styles.row} ${isDeleting ? styles.rowDeleting : ''}`}
              >
                {/* Avatar + Name */}
                <td className={styles.td}>
                  <div className={styles.nameCell}>
                    <span
                      className={styles.avatar}
                      style={{ '--avatar-color': getAvatarColor(member.name) }}
                    >
                      {getInitials(member.name)}
                    </span>
                    <span className={styles.name}>{member.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className={styles.td}>
                  <a
                    href={`mailto:${member.email}`}
                    className={styles.email}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {member.email}
                  </a>
                </td>

                {/* Phone */}
                <td className={styles.td}>
                  {member.phone
                    ? <span className={styles.phone}>{member.phone}</span>
                    : <span className={styles.nil}>—</span>
                  }
                </td>

                {/* Member ID */}
                <td className={styles.td}>
                  <code className={styles.memberId}>
                    #{String(member.memberId).padStart(4, '0')}
                  </code>
                </td>

                {/* Actions */}
                <td className={`${styles.td} ${styles.actions}`}>
                  <button
                    className={styles.editBtn}
                    onClick={() => onEdit(member)}
                    disabled={isDeleting}
                    aria-label={`Edit ${member.name}`}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(member.memberId)}
                    disabled={isDeleting}
                    aria-label={`Delete ${member.name}`}
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
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
  return (
    <thead>
      <tr>
        {['Member', 'Email', 'Phone', 'ID', 'Actions'].map((h) => (
          <th key={h} className={styles.th}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

// Varied skeleton widths per column — avoids mechanical uniform look
const SKELETON_WIDTHS = ['55%', '70%', '40%', '25%', '60%'];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

// Deterministic colour from name so the same member always
// gets the same avatar colour across renders
const AVATAR_COLORS = [
  '#2563EB', '#16A34A', '#D97706', '#DC2626',
  '#7C3AED', '#0891B2', '#DB2777', '#65A30D',
];

function getAvatarColor(name = '') {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}