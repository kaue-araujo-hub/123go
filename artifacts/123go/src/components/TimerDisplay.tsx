/**
 * TimerDisplay.tsx
 * Componente visual do timer — amigável para crianças, sem gerar pressão.
 * Tamanho e animações otimizados para mobile.
 */

import { useEffect, useRef } from 'react';
import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  formatted:  string;
  isRunning:  boolean;
  compact?:   boolean;
}

export function TimerDisplay({ formatted, isRunning, compact = false }: TimerDisplayProps) {
  const ref = useRef<HTMLSpanElement>(null);

  /* Pulsa suavemente quando o segundo muda */
  useEffect(() => {
    const el = ref.current;
    if (!el || !isRunning) return;
    el.classList.remove(styles.tick);
    /* Force reflow para reiniciar a animação */
    void el.offsetWidth;
    el.classList.add(styles.tick);
  }, [formatted, isRunning]);

  return (
    <div
      className={[
        styles.wrapper,
        compact    ? styles.compact  : '',
        isRunning  ? styles.running  : '',
      ].join(' ')}
      role="timer"
      aria-label={`Tempo decorrido: ${formatted}`}
      aria-live="off"
    >
      <span className={styles.icon} aria-hidden="true">⏱</span>
      <span className={styles.label} ref={ref}>
        {formatted}
      </span>
    </div>
  );
}
