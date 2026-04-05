/**
 * ModalitySelector.tsx
 * Painel exclusivo do professor para escolher modalidade e dificuldade.
 * NUNCA renderizado para alunos.
 */

import { useState } from 'react';
import { SessionManager } from '../../auth/SessionManager';
import { useGameMode }    from '../../hooks/useGameMode';
import { MODE_META }      from '../../engine/ModeConfig';
import { ModalityCard }   from './ModalityCard';
import styles from './ModalitySelector.module.css';

import type { GameMode, Difficulty } from '../../auth/SessionManager';

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; emoji: string }> = {
  easy:   { label: 'Fácil',   emoji: '🌱' },
  medium: { label: 'Médio',   emoji: '🌿' },
  hard:   { label: 'Difícil', emoji: '🌳' },
};

interface ModalitySelectorProps {
  onSessionStarted?: (sessionId: string) => void;
}

export function ModalitySelector({ onSessionStarted }: ModalitySelectorProps) {
  const { mode, difficulty, isTeacher } = useGameMode();
  const [sessionStarted, setSessionStarted] = useState(false);

  if (!isTeacher) return null;

  function handleSelectMode(newMode: GameMode) {
    SessionManager.setMode(newMode);
    setSessionStarted(false);
  }

  function handleSelectDifficulty(newDiff: Difficulty) {
    SessionManager.setDifficulty(newDiff);
    setSessionStarted(false);
  }

  function handleStartSession() {
    const id = SessionManager.startClassSession();
    if (id) {
      setSessionStarted(true);
      onSessionStarted?.(id);
    }
  }

  return (
    <section className={styles.section} aria-label="Configurações de modalidade de aula">

      {/* Cabeçalho */}
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">🎓</span>
        <div>
          <h2 className={styles.headerTitle}>Modalidades de Aula</h2>
          <p className={styles.headerSub}>
            Escolha como a turma vai jogar hoje. Os alunos não verão esta tela.
          </p>
        </div>
      </div>

      {/* Carrossel de modalidades */}
      <div className={styles.carousel} role="radiogroup" aria-label="Selecionar modalidade">
        {(Object.values(MODE_META) as typeof MODE_META[GameMode][]).map(meta => (
          <ModalityCard
            key={meta.id}
            meta={meta}
            isActive={mode === meta.id}
            onSelect={() => handleSelectMode(meta.id)}
          />
        ))}
      </div>

      {/* Seletor de dificuldade */}
      <div className={styles.difficultySection}>
        <p className={styles.difficultyLabel}>Nível de dificuldade</p>
        <div className={styles.difficultyPills} role="radiogroup" aria-label="Nível de dificuldade">
          {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, { label: string; emoji: string }][]).map(([key, { label, emoji }]) => (
            <button
              key={key}
              role="radio"
              aria-checked={difficulty === key}
              className={`${styles.diffPill} ${difficulty === key ? styles.diffActive : ''}`}
              onClick={() => handleSelectDifficulty(key)}
            >
              <span aria-hidden="true">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dica pedagógica contextual */}
      <div className={styles.teacherTip} aria-live="polite" key={mode}>
        <span className={styles.tipIcon} aria-hidden="true">💡</span>
        <p className={styles.tipText}>{MODE_META[mode].teacherTip}</p>
      </div>

      {/* Botão iniciar sessão */}
      <button
        className={styles.btnStart}
        onClick={handleStartSession}
        aria-label="Iniciar sessão de aula com as configurações selecionadas"
        style={sessionStarted ? { background: '#4CAF50' } : undefined}
      >
        {sessionStarted
          ? '✓ Aula iniciada! Alunos já recebem o modo →'
          : `Iniciar aula com Modo ${MODE_META[mode].label} →`}
      </button>

    </section>
  );
}
