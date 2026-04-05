import styles from '../../styles/nodes.module.css';

function NodeSkeleton() {
  return (
    <div className={`${styles.nodeCard} ${styles.skeleton}`}>
      <div className={styles.skeletonBar} />
      <div className={styles.skeletonBar} />
      <div className={styles.skeletonBar} />
    </div>
  );
}

export default NodeSkeleton;
