import { create } from 'zustand';
import { getLayoutedElements } from '../utils/layoutGraph';

const initialState = {
  nodes: [],
  edges: [],
  activeNodeId: null,
  topic: '',
  status: 'idle',
  error: '',
  isGenerating: false,
  reviewMode: false,
  theme: 'light',
};

export const useGraphStore = create((set, get) => ({
  ...initialState,

  // --- Node & edge mutations ---

  addNodes: (newNodes) => {
    const { nodes, edges } = get();
    const merged = [...nodes, ...newNodes];
    const { nodes: laid, edges: laidEdges } = getLayoutedElements(merged, edges);
    set({ nodes: laid, edges: laidEdges });
  },

  addEdges: (newEdges) => {
    const { nodes, edges } = get();
    const merged = [...edges, ...newEdges];
    const { nodes: laid, edges: laidEdges } = getLayoutedElements(nodes, merged);
    set({ nodes: laid, edges: laidEdges });
  },

  setGraph: (nodes, edges) => {
    const { nodes: laid, edges: laidEdges } = getLayoutedElements(nodes, edges);
    set({ nodes: laid, edges: laidEdges });
  },

  expandNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, expanded: true } }
          : n
      ),
    }));
  },

  updateNodeData: (nodeId, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...patch } }
          : n
      ),
    }));
  },

  // --- UI state ---

  setActiveNode: (activeNodeId) => set({ activeNodeId }),
  setTopic: (topic) => set({ topic }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  clearError: () => set({ error: '' }),
  toggleReviewMode: () => set((state) => ({ reviewMode: !state.reviewMode })),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  // --- Full reset ---

  resetGraph: () => set({ ...initialState }),
}));
