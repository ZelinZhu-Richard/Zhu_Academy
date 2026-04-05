import { create } from 'zustand';

const initialState = {
  activeNodeId: null,
  error: '',
  nodes: [],
  reviewMode: false,
  status: 'idle',
  theme: 'light',
  topic: '',
};

export const useGraphStore = create((set) => ({
  ...initialState,
  clearError: () => set({ error: '' }),
  hydrateGraph: (payload) => set((state) => ({ ...state, ...payload })),
  resetGraph: () => set({ ...initialState }),
  setActiveNode: (activeNodeId) => set({ activeNodeId }),
  setError: (error) => set({ error, status: 'error' }),
  setNodes: (nodes) => set({ nodes }),
  setStatus: (status) => set({ status }),
  setTopic: (topic) => set({ topic }),
  toggleReviewMode: () => set((state) => ({ reviewMode: !state.reviewMode })),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
