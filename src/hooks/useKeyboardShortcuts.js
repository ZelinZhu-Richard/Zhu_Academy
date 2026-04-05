import { useEffect } from 'react';
import { saveGraphState } from '../services/storageService';
import { useGraphStore } from '../store/graphStore';

export function useKeyboardShortcuts() {
  const clearError = useGraphStore((state) => state.clearError);
  const toggleReviewMode = useGraphStore((state) => state.toggleReviewMode);
  const toggleTheme = useGraphStore((state) => state.toggleTheme);

  useEffect(() => {
    const persistCurrentState = () => {
      const { nodes, reviewMode, theme, topic } = useGraphStore.getState();

      if (topic) {
        saveGraphState(topic, { nodes, reviewMode, theme });
      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === 'j') {
        event.preventDefault();
        toggleReviewMode();
        persistCurrentState();
      }

      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        toggleTheme();
        persistCurrentState();
      }

      if (event.key === 'Escape') {
        clearError();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearError, toggleReviewMode, toggleTheme]);
}
