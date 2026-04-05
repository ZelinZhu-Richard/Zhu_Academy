import { useEffect } from 'react';
import GraphCanvas from './components/layout/GraphCanvas';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ErrorBanner from './components/ui/ErrorBanner';
import StatusBar from './components/ui/StatusBar';
import { useGraphActions } from './hooks/useGraphActions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useGraphStore } from './store/graphStore';
import styles from './styles/layout.module.css';

function App() {
  const theme = useGraphStore((state) => state.theme);
  const error = useGraphStore((state) => state.error);
  const status = useGraphStore((state) => state.status);
  const topic = useGraphStore((state) => state.topic);
  const nodes = useGraphStore((state) => state.nodes);
  const reviewMode = useGraphStore((state) => state.reviewMode);
  const clearError = useGraphStore((state) => state.clearError);
  const { createTopicGraph, resetTopicGraph, toggleTheme, toggleReviewMode } = useGraphActions();

  useKeyboardShortcuts();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className={styles.appShell}>
      <TopBar
        reviewMode={reviewMode}
        theme={theme}
        onToggleReview={toggleReviewMode}
        onToggleTheme={toggleTheme}
      />

      {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

      <div className={styles.mainLayout}>
        <Sidebar topic={topic} onGenerate={createTopicGraph} onReset={resetTopicGraph} />
        <GraphCanvas />
      </div>

      <StatusBar nodeCount={nodes.length} status={status} topic={topic} />
    </div>
  );
}

export default App;
