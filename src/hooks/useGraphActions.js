import { clearGraphState, loadGraphState, saveGraphState } from '../services/storageService';
import { useGraphStore } from '../store/graphStore';
import { layoutGraph } from '../utils/layoutGraph';

function buildSeedNodes(topic) {
  return [
    {
      dependsOn: [],
      description: `High-level framing for ${topic} and why it matters.`,
      id: 'concept-overview',
      mastery: 0.25,
      title: `${topic} overview`,
      type: 'concept',
    },
    {
      dependsOn: ['concept-overview'],
      description: `Key relationship or expression to memorize for ${topic}.`,
      formula: 'f(x + h) - f(x) / h',
      id: 'formula-anchor',
      mastery: 0.4,
      title: `${topic} anchor formula`,
      type: 'formula',
    },
    {
      dependsOn: ['concept-overview'],
      id: 'practice-core',
      mastery: 0.15,
      question: `Solve a representative ${topic} problem and explain each step.`,
      title: `${topic} practice`,
      type: 'practice',
    },
    {
      dependsOn: ['formula-anchor', 'practice-core'],
      description: `Explain ${topic} from memory, then solve one problem without notes.`,
      id: 'review-checkpoint',
      mastery: 0.1,
      reviewPrompt: `Teach the core idea of ${topic} in under two minutes.`,
      title: `${topic} review checkpoint`,
      type: 'review',
    },
  ];
}

export function useGraphActions() {
  const hydrateGraph = useGraphStore((state) => state.hydrateGraph);
  const resetGraph = useGraphStore((state) => state.resetGraph);
  const clearError = useGraphStore((state) => state.clearError);
  const toggleThemeStore = useGraphStore((state) => state.toggleTheme);
  const toggleReviewModeStore = useGraphStore((state) => state.toggleReviewMode);

  const createTopicGraph = (topic) => {
    clearError();
    useGraphStore.getState().setStatus('loading');

    try {
      const cachedState = loadGraphState(topic);

      if (cachedState?.nodes?.length) {
        hydrateGraph({
          ...cachedState,
          activeNodeId: cachedState.nodes[0]?.id ?? null,
          error: '',
          status: 'ready',
          topic,
        });
        return;
      }

      const nodes = layoutGraph(buildSeedNodes(topic));
      const nextState = {
        activeNodeId: nodes[0]?.id ?? null,
        error: '',
        nodes,
        reviewMode: false,
        status: 'ready',
        topic,
      };

      hydrateGraph(nextState);
      saveGraphState(topic, {
        nodes,
        reviewMode: false,
        theme: useGraphStore.getState().theme,
      });
    } catch (error) {
      useGraphStore.getState().setError(error.message || 'Unable to build graph');
    }
  };

  const resetTopicGraph = () => {
    const { topic } = useGraphStore.getState();

    if (topic) {
      clearGraphState(topic);
    }

    resetGraph();
  };

  const toggleTheme = () => {
    toggleThemeStore();

    const { nodes, reviewMode, theme, topic } = useGraphStore.getState();

    if (topic) {
      saveGraphState(topic, { nodes, reviewMode, theme });
    }
  };

  const toggleReviewMode = () => {
    toggleReviewModeStore();

    const { nodes, reviewMode, theme, topic } = useGraphStore.getState();

    if (topic) {
      saveGraphState(topic, { nodes, reviewMode, theme });
    }
  };

  return {
    createTopicGraph,
    resetTopicGraph,
    toggleReviewMode,
    toggleTheme,
  };
}
