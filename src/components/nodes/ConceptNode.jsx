import { Handle, Position } from 'reactflow';
import { masteryColor } from '../../utils/masteryColor';
import styles from '../../styles/nodes.module.css';

export function ConceptNode({ data, selected }) {
  return (
    <div className={`${styles.nodeCard} ${styles.concept} ${selected ? styles.active : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <span className={styles.nodeEyebrow}>Concept</span>
      <h3 className={styles.nodeTitle}>{data.label}</h3>
      <p className={styles.nodeBody}>{data.description}</p>

      <footer className={styles.nodeFooter}>
        <span
          className={styles.masteryPill}
          style={{ backgroundColor: masteryColor(data.mastery) }}
        >
          Mastery {Math.round((data.mastery ?? 0) * 100)}%
        </span>
      </footer>

      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}
