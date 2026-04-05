import ReviewButton from '../ui/ReviewButton';
import ThemeToggle from '../ui/ThemeToggle';
import styles from '../../styles/layout.module.css';

function TopBar({ reviewMode, theme, onToggleReview, onToggleTheme }) {
  return (
    <header className={styles.topBar}>
      <div>
        <p className={styles.brandEyebrow}>Zhu Academy</p>
        <h1 className={styles.brandTitle}>Concept Graph Studio</h1>
      </div>

      <div className={styles.topActions}>
        <ReviewButton active={reviewMode} onClick={onToggleReview} />
        <ThemeToggle onToggle={onToggleTheme} theme={theme} />
      </div>
    </header>
  );
}

export default TopBar;
