import { useEffect, useState } from 'react';
import { bookService }     from '../../services/bookService';
import { memberService }   from '../../services/memberService';
import { issuanceService } from '../../services/issuanceService';
import StatsGrid           from './components/StatsGrid';
import RecentIssuances     from './components/RecentIssuances';
import styles              from './DashboardPage.module.css';

// ─────────────────────────────────────────────────────────────────
// Initial shape for each metric slot.
// value: null  → loading skeleton
// value: N     → rendered number
// error: true  → dash shown inside card
// ─────────────────────────────────────────────────────────────────
const INITIAL_STATS = {
  totalBooks:      { value: null, error: false },
  totalMembers:    { value: null, error: false },
  activeIssuances: { value: null, error: false },
  returnedBooks:   { value: null, error: false },
};

export default function DashboardPage() {
  const [stats, setStats]             = useState(INITIAL_STATS);
  const [issuances, setIssuances]     = useState(null);
  const [issuancesLoading, setIssuancesLoading] = useState(true);
  const [issuancesError,   setIssuancesError]   = useState(null);

  useEffect(() => {
    fetchAllMetrics();
  }, []);

  async function fetchAllMetrics() {
    // Fire all three requests in parallel — one slow endpoint
    // won't block the others from rendering
    const [booksResult, membersResult, issuancesResult] = await Promise.all([
      bookService.fetchAll(),
      memberService.fetchAll(),
      issuanceService.fetchAll(),
    ]);

    // ── Books ──────────────────────────────────────────────────
    setStats((prev) => ({
      ...prev,
      totalBooks: booksResult.error
        ? { value: null, error: true }
        : { value: booksResult.data.length, error: false },
    }));

    // ── Members ────────────────────────────────────────────────
    setStats((prev) => ({
      ...prev,
      totalMembers: membersResult.error
        ? { value: null, error: true }
        : { value: membersResult.data.length, error: false },
    }));

    // ── Issuances (active + returned + recent table) ───────────
    if (issuancesResult.error) {
      setStats((prev) => ({
        ...prev,
        activeIssuances: { value: null, error: true },
        returnedBooks:   { value: null, error: true },
      }));
      setIssuancesError(issuancesResult.error);
    } else {
      const all      = issuancesResult.data;
      const active   = all.filter((i) => !i.returnedAt);
      const returned = all.filter((i) =>  i.returnedAt);

      setStats((prev) => ({
        ...prev,
        activeIssuances: { value: active.length,   error: false },
        returnedBooks:   { value: returned.length,  error: false },
      }));
      setIssuances(all);
    }

    setIssuancesLoading(false);
  }

  // Derive a friendly time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
                'Good evening';

  return (
    <div className={styles.page}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting}</p>
          <p className={styles.subtitle}>
            Here's a snapshot of your library right now.
          </p>
        </div>
        <div className={styles.timestamp}>
          <span className={styles.dot} />
          <span className={styles.timestampText}>
            Live · {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day:     'numeric',
              month:   'long',
              year:    'numeric',
            })}
          </span>
        </div>
      </div>

      {/* ── Summary cards ──────────────────────────────────────── */}
      <StatsGrid stats={stats} />

      {/* ── Divider ────────────────────────────────────────────── */}
      <div className={styles.divider} />

      {/* ── Recent issuances ───────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Recent Issuances</h2>
            <p className={styles.sectionSubtitle}>
              The 5 most recently recorded transactions.
            </p>
          </div>
        </div>

        <RecentIssuances
          issuances={issuances}
          loading={issuancesLoading}
          error={issuancesError}
        />
      </section>
    </div>
  );
}