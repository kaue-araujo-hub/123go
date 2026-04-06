import React from 'react';
import type { Game } from '../data/games';
import styles from './StudentGameCard.module.css';

interface Props {
  game:  Game;
  index: number;
  onTap: (path: string) => void;
}

export function StudentGameCard({ game, index, onTap }: Props) {

  function handlePointerUp(e: React.PointerEvent) {
    e.preventDefault();
    onTap(game.path);
  }

  return (
    <div
      className={styles.card}
      style={{
        '--card-bg':    game.bg,
        '--card-index': index,
        animationDelay: `${Math.min(index * 30, 600)}ms`,
      } as React.CSSProperties}
      role="button"
      tabIndex={0}
      aria-label={`Jogar ${game.title}`}
      onPointerUp={handlePointerUp}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onTap(game.path)}
    >
      <div className={styles.thumb} aria-hidden="true">
        <div className={styles.thumbBg} />
        <div className={styles.thumbCircle} />
        <span
          className={styles.emoji}
          style={{ animationDelay: `${index * 0.2}s` }}
          aria-hidden="true"
        >
          {game.emoji}
        </span>
      </div>

      <p className={styles.name}>{game.title}</p>
    </div>
  );
}
