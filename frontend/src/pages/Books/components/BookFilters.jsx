import styles from './BookFilters.module.css';

export default function BookFilters({ search, onSearchChange, totalShown, totalAll }) {
  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by title, author or ISBN…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search books"
        />
        {search && (
          <button
            className={styles.clearBtn}
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <span className={styles.count}>
        {search
          ? `${totalShown} of ${totalAll} books`
          : `${totalAll} book${totalAll !== 1 ? 's' : ''}`}
      </span>
    </div>
  );
}