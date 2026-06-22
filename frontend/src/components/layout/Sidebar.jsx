import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants/routes';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>📖</span>
        <span className={styles.brandName}>LibraryMS</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {NAV_LINKS.map(({ label, path, icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
                }
              >
                <span className={styles.navIcon}>{icon}</span>
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <span className={styles.footerText}>v1.0.0</span>
      </div>
    </aside>
  );
}