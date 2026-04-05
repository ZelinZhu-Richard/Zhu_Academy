import { masteryColor } from '../../utils/masteryColor';
import styles from '../../styles/nodes.module.css';

function FormulaNode({ node, isActive }) {
  return (
    <article
      className={`${styles.nodeCard} ${styles.formula} ${isActive ? styles.active : ''}`}
    >
      <span className={styles.nodeEyebrow}>Formula Recall</span>
      <h3 className={styles.nodeTitle}>{node.title}</h3>
      <pre className={styles.formulaBlock}>{node.formula || 'Formula goes here'}</pre>
      <p className={styles.nodeFootnote}>{node.description}</p>
      <footer className={styles.nodeFooter}>
        <span
          className={styles.masteryPill}
          style={{ backgroundColor: masteryColor(node.mastery) }}
        >
          Recall {Math.round((node.mastery ?? 0) * 100)}%
        </span>
      </footer>
    </article>
  );
}

export default FormulaNode;
