import ConceptNode from '../nodes/ConceptNode';
import FormulaNode from '../nodes/FormulaNode';
import NodeSkeleton from '../nodes/NodeSkeleton';
import PracticeNode from '../nodes/PracticeNode';
import ReviewNode from '../nodes/ReviewNode';
import { useGraphStore } from '../../store/graphStore';
import styles from '../../styles/layout.module.css';

const nodeComponents = {
  concept: ConceptNode,
  formula: FormulaNode,
  practice: PracticeNode,
  review: ReviewNode,
};

function GraphCanvas() {
  const nodes = useGraphStore((state) => state.nodes);
  const status = useGraphStore((state) => state.status);
  const activeNodeId = useGraphStore((state) => state.activeNodeId);
  const setActiveNode = useGraphStore((state) => state.setActiveNode);

  if (status === 'loading') {
    return (
      <section className={styles.graphCanvas}>
        <div className={styles.skeletonGrid}>
          <NodeSkeleton />
          <NodeSkeleton />
          <NodeSkeleton />
        </div>
      </section>
    );
  }

  if (!nodes.length) {
    return (
      <section className={styles.graphCanvas}>
        <div className={styles.emptyState}>
          <h2>Generate your first topic graph</h2>
          <p>Use the sidebar to create a starter concept graph for a study topic.</p>
        </div>
      </section>
    );
  }

  const height = Math.max(...nodes.map((node) => node.position?.y ?? 0)) + 260;

  return (
    <section className={styles.graphCanvas}>
      <div className={styles.canvasSurface} style={{ height }}>
        {nodes.map((node) => {
          const NodeComponent = nodeComponents[node.type] || ConceptNode;

          return (
            <button
              className={styles.canvasNode}
              key={node.id}
              onClick={() => setActiveNode(node.id)}
              style={{
                left: `${node.position?.x ?? 0}px`,
                top: `${node.position?.y ?? 0}px`,
              }}
              type="button"
            >
              <NodeComponent isActive={activeNodeId === node.id} node={node} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default GraphCanvas;
