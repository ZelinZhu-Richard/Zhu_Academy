import styles from '../../styles/layout.module.css';

function ErrorBanner({ message, onDismiss, onRetry }) {
  return (
    <div className={styles.errorBanner} role="alert">
      <span>{message}</span>
      <div className={styles.errorBannerActions}>
        {onRetry ? (
          <button className={styles.primaryButton} onClick={onRetry} type="button">
            Retry
          </button>
        ) : null}
        <button className={styles.secondaryButton} onClick={onDismiss} type="button">
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default ErrorBanner;
