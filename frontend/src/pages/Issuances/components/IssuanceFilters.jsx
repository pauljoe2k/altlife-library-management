import styles from './IssuanceFilters.module.css';

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All Statuses' },
  { value: 'Issued',   label: 'Issued' },
  { value: 'Overdue',  label: 'Overdue' },
  { value: 'Returned', label: 'Returned' },
];

export default function IssuanceFilters({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  totalShown,
  totalAll,
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.controls}>

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by member or book…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search issuances"
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

        {/* Status filter */}
        <div className={styles.selectWrap}>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <span className={styles.selectArrow} aria-hidden="true">▾</span>
        </div>
      </div>

      <span className={styles.count}>
        {search || statusFilter !== 'all'
          ? `${totalShown} of ${totalAll} issuances`
          : `${totalAll} issuance${totalAll !== 1 ? 's' : ''}`}
      </span>
    </div>
  );
}