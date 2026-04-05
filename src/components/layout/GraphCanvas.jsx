import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

import { ConceptNode } from '../nodes/ConceptNode';
import { useGraphStore } from '../../store/graphStore';

const nodeTypes = {
  concept: ConceptNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: 'var(--muted)', strokeWidth: 2 },
};

export function GraphCanvas() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border)" gap={24} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
