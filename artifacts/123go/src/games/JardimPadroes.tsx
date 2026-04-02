import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const PHASES = [
  {
    label: 'Padrão AB (cor): qual vem a seguir?',
    pattern: ['🌹', '🌼', '🌹', '🌼', '🌹'],
    next: '🌼',
    options: ['🌹', '🌼', '🌸'],
  },
  {
    label: 'Padrão ABC (cor): qual vem a seguir?',
    pattern: ['🌹', '🌼', '🌸', '🌹', '🌼'],
    next: '🌸',
    options: ['🌹', '🌸', '🌺'],
  },
  {
    label: 'Padrão por FORMA: qual vem a seguir?',
    pattern: ['⭕', '⬛', '⭕', '⬛', '⭕'],
    next: '⬛',
    options: ['⭕', '⬛', '🔺'],
  },
  {
    label: 'Padrão por TAMANHO: qual vem a seguir?',
    pattern: ['🌸', '🌺', '🌸', '🌺', '🌸'],
    next: '🌺',
    options: ['🌸', '🌺', '🌻'],
  },
  {
    label: 'Complete o padrão especial!',
    pattern: ['🦋', '🐝', '🦋', '🐝', '🦋'],
    next: '🐝',
    options: ['🦋', '🐝', '🐛'],
  },
];

export function JardimPadroes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setAnswered(false); setFeedback(null); }, [phase]);

  const handleChoice = (choice: string) => {
    if (answered) return;
    const correct = choice === phaseData.next;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Jardim de Padrões" emoji="🌸" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Jardim de Padrões" emoji="🌸" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 8 }}>
          {phaseData.label}
        </h2>
      </div>

      {/* Pattern display */}
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        padding: 20,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {phaseData.pattern.map((item, i) => (
          <div key={i} style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'var(--bg)',
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}>
            {item}
          </div>
        ))}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: answered ? '#E8F5E9' : 'var(--bg)',
          border: `3px dashed ${answered ? '#4CAF50' : 'var(--c2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          animation: 'pulseBorder 1.5s ease-in-out infinite',
        }}>
          {answered ? phaseData.next : '?'}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {phaseData.options.map(opt => (
          <button
            key={opt}
            onClick={() => handleChoice(opt)}
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: '#fff',
              border: '2px solid var(--border)',
              fontSize: 44,
              cursor: 'pointer',
              minHeight: 88,
              minWidth: 88,
              boxShadow: 'var(--shadow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >{opt}</button>
        ))}
      </div>

      <style>{`
        @keyframes pulseBorder {
          0%, 100% { border-color: var(--c2); }
          50% { border-color: var(--c1); }
        }
      `}</style>
    </GameShell>
  );
}
