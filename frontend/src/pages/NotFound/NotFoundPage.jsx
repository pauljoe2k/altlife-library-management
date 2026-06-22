import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.HOME} className={styles.link}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}