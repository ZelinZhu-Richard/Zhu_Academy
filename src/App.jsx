import { useEffect } from 'react';
import { GraphCanvas } from './components/layout/GraphCanvas';
import NodeSkeleton from './components/nodes/NodeSkeleton';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ErrorBanner from './components/ui/ErrorBanner';
import StatusBar from './components/ui/StatusBar';
import { useGraphActions } from './hooks/useGraphActions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useGraphStore } from './store/graphStore';
import styles from './styles/layout.module.css';

function App() {
  const topic = useGraphStore((s) => s.topic);
  const status = useGraphStore((s) => s.status);
  const error = useGraphStore((s) => s.error);
  const isGenerating = useGraphStore((s) => s.isGenerating);
  const theme = useGraphStore((s) => s.theme);
  const reviewMode = useGraphStore((s) => s.reviewMode);
  const nodeCount = useGraphStore((s) => s.nodes.length);
  const clearError = useGraphStore((s) => s.clearError);

  const { generateGraph, resetGraph, toggleTheme, toggleReviewMode } = useGraphActions();

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

      {error ? (
        <ErrorBanner
          message={error}
          onDismiss={clearError}
          onRetry={topic ? () => generateGraph(topic) : undefined}
        />
      ) : null}

      <div className={styles.mainLayout}>
        <Sidebar
          topic={topic}
          isLoading={isGenerating}
          onGenerate={generateGraph}
          onReset={resetGraph}
        />
        <div className={styles.graphCanvas}>
          {isGenerating ? (
            <div className={styles.skeletonGrid}>
              <NodeSkeleton />
              <NodeSkeleton />
              <NodeSkeleton />
              <NodeSkeleton />
              <NodeSkeleton />
            </div>
          ) : nodeCount > 0 ? (
            <GraphCanvas />
          ) : (
            <div className={styles.emptyState}>
              <h2>Generate your first topic graph</h2>
              <p>Type a subject in the sidebar and hit Generate.</p>
            </div>
          )}
        </div>
      </div>

      <StatusBar topic={topic} status={status} nodeCount={nodeCount} />
    </div>
  );
}

export default App;
