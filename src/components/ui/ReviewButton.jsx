import styles from '../../styles/layout.module.css';

function ReviewButton({ active, onClick }) {
  return (
    <button
      className={`${styles.toolbarButton} ${active ? styles.toolbarButtonActive : ''}`}
      onClick={onClick}
      type="button"
    >
      {active ? 'Review on' : 'Review off'}
    </button>
  );
}

export default ReviewButton;
