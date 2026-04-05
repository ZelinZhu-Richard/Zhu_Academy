import styles from '../../styles/layout.module.css';

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className={styles.errorBanner} role="alert">
      <span>{message}</span>
      <button className={styles.secondaryButton} onClick={onDismiss} type="button">
        Dismiss
      </button>
    </div>
  );
}

export default ErrorBanner;
