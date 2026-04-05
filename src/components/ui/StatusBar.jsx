import styles from '../../styles/layout.module.css';

const STATUS_LABELS = {
  idle: 'Ready',
  loading: 'Generating…',
  ready: 'Complete',
  error: 'Error',
};

function StatusBar({ topic, status, nodeCount }) {
  const label = STATUS_LABELS[status] || status;

  return (
    <footer className={styles.statusBar}>
      <span>{topic ? `Topic: ${topic}` : 'No topic selected'}</span>
      <span>{label}</span>
      {status === 'ready' && nodeCount > 0 ? (
        <span>
          {nodeCount} concept{nodeCount !== 1 ? 's' : ''}
        </span>
      ) : null}
    </footer>
  );
}

export default StatusBar;
