import { requestConceptGraphParsed } from '../services/claudeService';
import { useGraphStore } from '../store/graphStore';

function transformToReactFlow(claudeResponse) {
  const { nodes: conceptNodes = [], edges: conceptEdges = [] } = claudeResponse;

  const rfNodes = conceptNodes.map((node) => ({
    id: node.id,
    type: 'concept',
    position: { x: 0, y: 0 },
    data: {
      id: node.id,
      label: node.label,
      description: node.description || '',
      depth: node.depth ?? 0,
      parentId: node.parentId ?? null,
      connections: node.connections || [],
      expanded: false,
      mastery: 0.0,
      practiceProblems: [],
      formula: node.formula ?? null,
      mistakes: [],
      lastReviewed: null,
      nodeType: node.nodeType || 'concept',
    },
  }));

  const nodeIds = new Set(rfNodes.map((n) => n.id));
  const rfEdges = conceptEdges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => ({
      id: e.id || `e-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      ...(e.label ? { label: e.label } : {}),
    }));

  return { nodes: rfNodes, edges: rfEdges };
}

export function useGraphActions() {
  const setGraph = useGraphStore((s) => s.setGraph);
  const setStatus = useGraphStore((s) => s.setStatus);
  const setError = useGraphStore((s) => s.setError);
  const setIsGenerating = useGraphStore((s) => s.setIsGenerating);
  const setTopic = useGraphStore((s) => s.setTopic);
  const clearError = useGraphStore((s) => s.clearError);
  const resetGraphStore = useGraphStore((s) => s.resetGraph);
  const toggleThemeStore = useGraphStore((s) => s.toggleTheme);
  const toggleReviewModeStore = useGraphStore((s) => s.toggleReviewMode);

  const generateGraph = async (topic) => {
    if (useGraphStore.getState().isGenerating) {
      return;
    }

    clearError();
    setStatus('loading');
    setIsGenerating(true);
    setTopic(topic);

    try {
      const data = await requestConceptGraphParsed(topic);
      const { nodes, edges } = transformToReactFlow(data);

      if (nodes.length === 0) {
        throw new Error('Claude returned no concepts. Try a more specific topic.');
      }

      setGraph(nodes, edges);
      setStatus('ready');
    } catch (err) {
      console.error('[useGraphActions.generateGraph]', err);
      setError(err.message || 'Something went wrong generating the graph');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGraph = () => {
    resetGraphStore();
  };

  return {
    generateGraph,
    resetGraph,
    toggleTheme: toggleThemeStore,
    toggleReviewMode: toggleReviewModeStore,
  };
}
