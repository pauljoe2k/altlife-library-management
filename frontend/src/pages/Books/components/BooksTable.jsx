import styles from './BooksTable.module.css';

/**
 * BooksTable
 * Props:
 *   books    {array}         — filtered list to render
 *   loading  {boolean}
 *   error    {string|null}
 *   deleteId {number|null}   — id currently being deleted
 *   onEdit   {fn(book)}
 *   onDelete {fn(bookId)}
 *   onRetry  {fn}
 */
export default function BooksTable({
  books, loading, error, deleteId, onEdit, onDelete, onRetry,
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
                    <span className={styles.skeleton} />
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
  if (books.length === 0) {
    return (
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>📚</span>
        <p className={styles.noticeText}>No books found.</p>
        <p className={styles.noticeHint}>Add a book or clear your search filter.</p>
      </div>
    );
  }

  // ── Table ────────────────────────────────────────────────────
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <TableHead />
        <tbody>
          {books.map((book) => {
            const isDeleting = deleteId === book.bookId;
            return (
              <tr
                key={book.bookId}
                className={`${styles.row} ${isDeleting ? styles.rowDeleting : ''}`}
              >
                <td className={styles.td}>
                  <span className={styles.title}>{book.title}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.author}>{book.author}</span>
                </td>
                <td className={styles.td}>
                  {book.isbn
                    ? <code className={styles.isbn}>{book.isbn}</code>
                    : <span className={styles.nil}>—</span>
                  }
                </td>
                <td className={styles.td}>
                  {book.totalCopies !== null && book.totalCopies !== undefined
                    ? <span className={styles.copies}>{book.totalCopies}</span>
                    : <span className={styles.nil}>—</span>
                  }
                </td>
                <td className={`${styles.td} ${styles.actions}`}>
                  <button
                    className={styles.editBtn}
                    onClick={() => onEdit(book)}
                    disabled={isDeleting}
                    aria-label={`Edit ${book.title}`}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(book.bookId)}
                    disabled={isDeleting}
                    aria-label={`Delete ${book.title}`}
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

function TableHead() {
  return (
    <thead>
      <tr>
        {['Title', 'Author', 'ISBN', 'Copies', 'Actions'].map((h) => (
          <th key={h} className={styles.th}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}