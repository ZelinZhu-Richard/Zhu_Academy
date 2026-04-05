import dagre from 'dagre';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 180;

export function layoutGraph(nodes) {
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({
    marginx: 24,
    marginy: 24,
    nodesep: 32,
    rankdir: 'LR',
    ranksep: 72,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    graph.setNode(node.id, { height: NODE_HEIGHT, width: NODE_WIDTH });
  });

  nodes.forEach((node) => {
    (node.dependsOn ?? []).forEach((parentId) => {
      graph.setEdge(parentId, node.id);
    });
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const layoutNode = graph.node(node.id);

    return {
      ...node,
      position: {
        x: Math.max(0, layoutNode.x - NODE_WIDTH / 2),
        y: Math.max(0, layoutNode.y - NODE_HEIGHT / 2),
      },
      size: {
        height: NODE_HEIGHT,
        width: NODE_WIDTH,
      },
    };
  });
}
