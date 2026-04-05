import { masteryColor } from '../../utils/masteryColor';
import styles from '../../styles/nodes.module.css';

function ReviewNode({ node, isActive }) {
  return (
    <article
      className={`${styles.nodeCard} ${styles.review} ${isActive ? styles.active : ''}`}
    >
      <span className={styles.nodeEyebrow}>Review Mode</span>
      <h3 className={styles.nodeTitle}>{node.title}</h3>
      <p className={styles.nodeBody}>{node.reviewPrompt || node.description}</p>
      <footer className={styles.nodeFooter}>
        <span
          className={styles.masteryPill}
          style={{ backgroundColor: masteryColor(node.mastery) }}
        >
          Confidence {Math.round((node.mastery ?? 0) * 100)}%
        </span>
      </footer>
    </article>
  );
}

export default ReviewNode;
