/**
 * ModeBadge.tsx
 * Badge visível no topo de cada jogo — informa o modo ao aluno sem opção de mudá-lo.
 * Modo Prática (padrão) é omitido para não poluir a tela.
 */

import { useGameMode } from '../hooks/useGameMode';
import { MODE_META }   from '../engine/ModeConfig';
import styles from './ModeBadge.module.css';

export function ModeBadge() {
  const { mode } = useGameMode();

  if (mode === 'practice') return null;

  const meta = MODE_META[mode];

  return (
    <div
      className={styles.badge}
      style={{ '--badge-color': meta.color, '--badge-bg': meta.colorBg } as React.CSSProperties}
      aria-label={`Modo de jogo: ${meta.label}`}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{meta.badgeLabel}</span>
    </div>
  );
}
