import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  {
    label: 'Padrão AB: qual vem a seguir?',
    pattern: ['🌹', '🌼', '🌹', '🌼', '🌹'],
    next: '🌼',
    options: ['🌹', '🌼', '🌸'],
  },
  {
    label: 'Padrão ABC: qual vem a seguir?',
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
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
  }, [phase]);

  const handleChoice = (choice: string) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = choice === phaseData.next;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true;
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

      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 6 }}>
          {phaseData.label}
        </h2>
      </div>

      {/* Pattern sequence */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
        padding: 18, marginBottom: 22, display: 'flex', alignItems: 'center',
        gap: 8, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {phaseData.pattern.map((item, i) => (
          <div key={i} style={{
            width: 54, height: 54, borderRadius: 12, background: 'var(--bg)',
            border: '2px solid var(--border)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <AppleEmoji emoji={item} size={34} />
          </div>
        ))}
        {/* Empty vase with pulse */}
        <div style={{
          width: 54, height: 54, borderRadius: 12,
          background: answered ? '#E8F5E9' : 'var(--bg)',
          border: `3px dashed ${answered ? '#4CAF50' : 'var(--c2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: answered ? undefined : 'vasoPulse 1.2s ease-in-out infinite',
        }}>
          {answered ? <AppleEmoji emoji={phaseData.next} size={34} /> : <span style={{ fontSize: 22, color: 'var(--c2)' }}>?</span>}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {phaseData.options.map(opt => (
          <button
            key={opt}
            onPointerUp={() => handleChoice(opt)}
            style={{
              width: 96, height: 96, borderRadius: 22,
              border: `3px solid ${opt === phaseData.next && answered ? '#4CAF50' : 'var(--border)'}`,
              background: opt === phaseData.next && answered ? '#E8F5E9' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', minHeight: 96, minWidth: 96,
              transition: 'all 0.15s ease', touchAction: 'manipulation',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <AppleEmoji emoji={opt} size={56} />
          </button>
        ))}
      </div>

      <style>{`
        @keyframes vasoPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.97) translateZ(0); }
          50%       { opacity: 1;   transform: scale(1.03) translateZ(0); }
        }
        @keyframes pulseBorder {
          0%, 100% { border-color: var(--c2); }
          50%       { border-color: transparent; }
        }
      `}</style>
    </GameShell>
  );
}
