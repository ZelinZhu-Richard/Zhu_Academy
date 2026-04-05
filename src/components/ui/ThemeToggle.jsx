import styles from '../../styles/layout.module.css';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className={styles.toolbarButton} onClick={onToggle} type="button">
      Theme: {theme}
    </button>
  );
}

export default ThemeToggle;
