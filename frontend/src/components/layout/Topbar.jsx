import { useLocation } from 'react-router-dom';
import styles from './Topbar.module.css';

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/books':     'Books',
  '/members':   'Members',
  '/issuances': 'Issuances',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'Library MS';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.avatar} aria-label="User menu">
          LM
        </div>
      </div>
    </header>
  );
}