import { Tutorial } from '../../data/tutorials';
import styles from './InteractionPreview.module.css';

interface Props {
  tutorial:  Tutorial;
  gameEmoji: string;
  color:     string;
  bg:        string;
  onReady:   () => void;
}

export function InteractionPreview({ tutorial, gameEmoji, color, bg, onReady }: Props) {
  return (
    <div
      className={styles.preview}
      style={{ '--preview-color': color, '--preview-bg': bg } as React.CSSProperties}
    >
      <div className={styles.iconBadge} aria-hidden="true">
        {tutorial.icon}
      </div>

      <h2 className={styles.title}>{tutorial.title}</h2>
      <p className={styles.description}>{tutorial.description}</p>

      <div className={styles.demoArea} aria-hidden="true">
        <InteractionDemo type={tutorial.title} gameEmoji={gameEmoji} />
      </div>

      <button className={styles.btnReady} onClick={onReady} style={{ '--preview-color': color } as React.CSSProperties}>
        Entendi! Vamos praticar →
      </button>
    </div>
  );
}

function InteractionDemo({ type, gameEmoji }: { type: string; gameEmoji: string }) {
  if (type === 'Arrastar') {
    return (
      <>
        <span className={styles.demoDragObj}>{gameEmoji}</span>
        <span className={styles.demoTarget}>🧺</span>
      </>
    );
  }
  if (type === 'Tocar') {
    return <span className={styles.demoTapObj}>{gameEmoji}</span>;
  }
  if (type === 'Deslizar') {
    return (
      <>
        <span className={styles.demoSwipeObj}>{gameEmoji}</span>
        <span className={styles.demoArrow}>→</span>
      </>
    );
  }
  if (type === 'Segurar') {
    return <span className={styles.demoHoldObj}>{gameEmoji}</span>;
  }
  if (type === 'Desenhar') {
    return (
      <div className={styles.demoGestureTrail}>
        <div className={styles.demoLine} />
      </div>
    );
  }
  if (type === 'No Ritmo') {
    return <span className={styles.demoTapObj}>⭐</span>;
  }
  return <span style={{ fontSize: 48 }}>{gameEmoji}</span>;
}
