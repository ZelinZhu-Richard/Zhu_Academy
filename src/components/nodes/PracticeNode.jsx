import { masteryColor } from '../../utils/masteryColor';
import styles from '../../styles/nodes.module.css';

function PracticeNode({ node, isActive }) {
  return (
    <article
      className={`${styles.nodeCard} ${styles.practice} ${isActive ? styles.active : ''}`}
    >
      <span className={styles.nodeEyebrow}>Practice</span>
      <h3 className={styles.nodeTitle}>{node.title}</h3>
      <p className={styles.nodeBody}>{node.question}</p>
      <footer className={styles.nodeFooter}>
        <span
          className={styles.masteryPill}
          style={{ backgroundColor: masteryColor(node.mastery) }}
        >
          Progress {Math.round((node.mastery ?? 0) * 100)}%
        </span>
      </footer>
    </article>
  );
}

export default PracticeNode;
