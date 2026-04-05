/**
 * PhaseResults.tsx
 * Tela de resultados exibida ao concluir todas as fases.
 * Mostra tempo por fase, tempo total e melhor tempo histórico.
 */

import { TimerSystem } from '../engine/TimerSystem';
import styles from './PhaseResults.module.css';

const PHASE_LABELS = ['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4', 'Fase 5'];
const PHASE_EMOJIS = ['🌱', '🌿', '🌳', '⭐', '🏆'];

interface PhaseResultsProps {
  phaseTimes: (number | null)[];
  totalTime:  number;
  bestTime:   number | null;
  onReplay:   () => void;
  onNext?:    () => void;
}

export function PhaseResults({ phaseTimes, totalTime, bestTime, onReplay, onNext }: PhaseResultsProps) {
  const isNewRecord = bestTime !== null && totalTime > 0 && totalTime <= bestTime;

  return (
    <div className={styles.container} role="dialog" aria-label="Resultado do jogo">

      {/* Cabeçalho */}
      <div className={styles.header}>
        <span className={styles.trophy} aria-hidden="true">
          {isNewRecord ? '🏆' : '🎉'}
        </span>
        <h2 className={styles.title}>
          {isNewRecord ? 'Novo recorde!' : 'Parabéns! Jogo concluído!'}
        </h2>
        {isNewRecord && (
          <p className={styles.recordBadge}>✨ Melhor tempo!</p>
        )}
      </div>

      {/* Tempo total em destaque */}
      <div className={styles.totalBox} aria-label={`Tempo total: ${TimerSystem.format(totalTime)}`}>
        <span className={styles.totalLabel}>⏱ Tempo total</span>
        <span className={styles.totalTime}>{TimerSystem.format(totalTime)}</span>
        {bestTime !== null && (
          <span className={styles.bestTime}>
            Melhor: {TimerSystem.format(bestTime)}
          </span>
        )}
      </div>

      {/* Breakdown por fase */}
      <div className={styles.phaseList} role="list">
        {phaseTimes.map((t, i) => (
          <div
            key={i}
            className={`${styles.phaseRow} ${t === null ? styles.skipped : ''}`}
            role="listitem"
            aria-label={`${PHASE_LABELS[i]}: ${t !== null ? TimerSystem.format(t) : 'não jogada'}`}
          >
            <span className={styles.phaseEmoji} aria-hidden="true">
              {PHASE_EMOJIS[i]}
            </span>
            <span className={styles.phaseName}>{PHASE_LABELS[i]}</span>
            <span className={styles.phaseTime}>
              {t !== null ? TimerSystem.format(t) : '—'}
            </span>

            {/* Barra de proporção visual */}
            {t !== null && totalTime > 0 && (
              <div
                className={styles.phaseBar}
                style={{ ['--pct' as string]: `${Math.round((t / totalTime) * 100)}%` }}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className={styles.actions}>
        <button className={styles.btnReplay} onClick={onReplay} aria-label="Jogar novamente">
          🔄 Jogar de novo
        </button>
        {onNext && (
          <button className={styles.btnNext} onClick={onNext} aria-label="Próximo jogo">
            Próximo jogo →
          </button>
        )}
      </div>
    </div>
  );
}
