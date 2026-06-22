import styles from './MemberFilters.module.css';

export default function MemberFilters({
  search,
  onSearchChange,
  totalShown,
  totalAll,
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search members"
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
          ? `${totalShown} of ${totalAll} members`
          : `${totalAll} member${totalAll !== 1 ? 's' : ''}`}
      </span>
    </div>
  );
}