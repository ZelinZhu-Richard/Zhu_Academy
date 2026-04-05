import styles from '../../styles/layout.module.css';

function StatusBar({ topic, status, nodeCount }) {
  return (
    <footer className={styles.statusBar}>
      <span>{topic ? `Topic: ${topic}` : 'No topic selected'}</span>
      <span>Status: {status}</span>
      <span>Nodes: {nodeCount}</span>
    </footer>
  );
}

export default StatusBar;
