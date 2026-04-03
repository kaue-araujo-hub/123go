import React, { useState, useEffect, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASE_THEMES = [
  { theme: 'meias', items: ['🧦', '🧦', '🧦', '🧦', '🧤'], singles: [4], count: 5 },
  { theme: 'luvas', items: ['🧤', '🧤', '🧤', '🧤', '🧤', '👟'], singles: [5], count: 6 },
  { theme: 'sapatos', items: ['👟', '👟', '👟', '👟', '👟', '👟', '🌟'], singles: [6], count: 7 },
  { theme: 'planetas', items: ['🪐', '🪐', '🌙', '🌙', '⭐', '⭐', '🌍', '🌍', '☀️'], singles: [8], count: 9 },
  { theme: 'frutas', items: ['🍎', '🍎', '🍊', '🍊', '🍋', '🍋', '🍇', '🍇', '🍓', '🫐'], singles: [9], count: 10 },
];

export function ParOuImpar() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const phaseData = PHASE_THEMES[phase - 1];

  useEffect(() => {
    setAnswered(false);
    setFeedback(null);
  }, [phase]);

  const handleTap = (idx: number) => {
    if (answered) return;
    const correct = phaseData.singles.includes(idx);
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      onCorrect();
      setTimeout(() => {
        setFeedback(null);
        onPhaseComplete();
      }, 1000);
    } else {
      setTimeout(() => setFeedback(null), 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Par ou Ímpar?" emoji="🧦" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Par ou Ímpar?" emoji="🧦" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
          Toque no item que ficou sozinho!
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Tema: {phaseData.theme}</p>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
        padding: 16,
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
      }}>
        {phaseData.items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleTap(idx)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              border: '2px solid var(--border)',
              background: phaseData.singles.includes(idx) && answered ? '#E8F5E9' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: 72,
              minWidth: 72,
            }}
          >
            <AppleEmoji emoji={item} size={40} />
          </button>
        ))}
      </div>
    </GameShell>
  );
}
