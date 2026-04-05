import { masteryColor } from '../../utils/masteryColor';
import styles from '../../styles/nodes.module.css';

function ConceptNode({ node, isActive }) {
  return (
    <article
      className={`${styles.nodeCard} ${styles.concept} ${isActive ? styles.active : ''}`}
    >
      <span className={styles.nodeEyebrow}>Concept</span>
      <h3 className={styles.nodeTitle}>{node.title}</h3>
      <p className={styles.nodeBody}>{node.description}</p>
      <footer className={styles.nodeFooter}>
        <span
          className={styles.masteryPill}
          style={{ backgroundColor: masteryColor(node.mastery) }}
        >
          Mastery {Math.round((node.mastery ?? 0) * 100)}%
        </span>
      </footer>
    </article>
  );
}

export default ConceptNode;
