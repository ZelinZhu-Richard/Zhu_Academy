import { useEffect, useState } from 'react';
import styles from '../../styles/layout.module.css';

function TopicInput({ defaultValue = '', onSubmit }) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextValue = value.trim();

    if (!nextValue) {
      return;
    }

    onSubmit(nextValue);
  };

  return (
    <form className={styles.topicForm} onSubmit={handleSubmit}>
      <label className={styles.inputLabel} htmlFor="topic-input">
        Study topic
      </label>
      <input
        id="topic-input"
        className={styles.topicInput}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Example: chain rule"
        value={value}
      />
      <button className={styles.primaryButton} type="submit">
        Generate graph
      </button>
    </form>
  );
}

export default TopicInput;
