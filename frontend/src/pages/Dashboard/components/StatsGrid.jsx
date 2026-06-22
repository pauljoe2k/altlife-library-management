import SummaryCard from './SummaryCard';
import styles from './StatsGrid.module.css';

/**
 * StatsGrid
 * Renders the four summary cards.
 * Props mirror the four metrics fetched in DashboardPage.
 *
 *   stats = {
 *     totalBooks:      { value: number|null, error: boolean },
 *     totalMembers:    { value: number|null, error: boolean },
 *     activeIssuances: { value: number|null, error: boolean },
 *     returnedBooks:   { value: number|null, error: boolean },
 *   }
 */
export default function StatsGrid({ stats }) {
  const cards = [
    {
      key:    'totalBooks',
      label:  'Total Books',
      icon:   '📚',
      accent: '--color-primary',
    },
    {
      key:    'totalMembers',
      label:  'Total Members',
      icon:   '👥',
      accent: '--color-success',
    },
    {
      key:    'activeIssuances',
      label:  'Active Issuances',
      icon:   '🔄',
      accent: '--color-warning',
    },
    {
      key:    'returnedBooks',
      label:  'Returned Books',
      icon:   '✅',
      accent: '--color-sidebar-accent',
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map(({ key, label, icon, accent }) => (
        <SummaryCard
          key={key}
          label={label}
          icon={icon}
          accent={accent}
          value={stats[key]?.value}
          error={stats[key]?.error}
        />
      ))}
    </div>
  );
}