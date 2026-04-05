import TopicInput from '../ui/TopicInput';
import styles from '../../styles/layout.module.css';

function Sidebar({ topic, onGenerate, onReset }) {
  return (
    <aside className={styles.sidebar}>
      <section>
        <h2 className={styles.sectionTitle}>Build a graph</h2>
        <p className={styles.supportText}>
          Start with a topic and seed a study graph. The scaffold currently loads demo nodes
          for the chosen topic.
        </p>
        <TopicInput defaultValue={topic} onSubmit={onGenerate} />
      </section>

      <section className={styles.sidebarSection}>
        <h2 className={styles.sectionTitle}>Shortcuts</h2>
        <ul className={styles.shortcutList}>
          <li>
            <kbd>Ctrl/Cmd</kbd> + <kbd>J</kbd> toggles review mode
          </li>
          <li>
            <kbd>Ctrl/Cmd</kbd> + <kbd>K</kbd> toggles theme
          </li>
          <li>
            <kbd>Escape</kbd> clears the current error
          </li>
        </ul>
      </section>

      <button className={styles.secondaryButton} onClick={onReset} type="button">
        Reset graph
      </button>
    </aside>
  );
}

export default Sidebar;
