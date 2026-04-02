import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const PHASES = [
  { g1: 20, g2: 12, pop: 8, question: 'Estoure 8 balões do grupo azul para igualar!' },
  { g1: 15, g2: 22, pop: 7, question: 'Estoure 7 balões do grupo rosa para igualar!' },
  { g1: 10, g2: 14, pop: 4, question: 'Estoure 4 balões do grupo verde para igualar!' },
  { g1: 18, g2: 12, pop: 6, question: 'Estoure 6 balões do grupo laranja para igualar!' },
  { g1: 16, g2: 8, pop: 8, question: 'Estoure 8 balões roxos para igualar os grupos!' },
];

const COLORS = ['#5B4FCF', '#E91E8C', '#4CAF50', '#FF9800', '#9C27B0'];

export function BaloesdaFesta() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [popped, setPopped] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseData = PHASES[phase - 1];
  const color = COLORS[(phase - 1) % COLORS.length];

  useEffect(() => { setPopped(0); setFeedback(null); }, [phase]);

  useEffect(() => {
    if (popped >= phaseData.pop && !phaseComplete) {
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [popped, phaseData.pop, phaseComplete, onCorrect, onPhaseComplete]);

  const handlePop = () => {
    if (popped < phaseData.pop) {
      setPopped(p => p + 1);
    }
  };

  const bigGroup = Math.max(phaseData.g1, phaseData.g2);
  const remaining = bigGroup - popped;

  if (phaseComplete) {
    return (
      <GameShell title="Balões da Festa" emoji="🎈" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Balões da Festa" emoji="🎈" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 6 }}>
          {phaseData.question}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          Estourou: {popped}/{phaseData.pop}
        </p>
      </div>

      {/* Groups */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: 16, border: '1.5px solid var(--border)', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
            {Array.from({ length: Math.min(phaseData.g2, 20) }).map((_, i) => (
              <span key={i} style={{ fontSize: 18 }}>🎈</span>
            ))}
          </div>
          <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>{phaseData.g2}</span>
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: 16, border: `2px dashed ${color}`, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
            {Array.from({ length: Math.max(0, Math.min(remaining, 20)) }).map((_, i) => (
              <button
                key={i}
                onClick={handlePop}
                style={{
                  fontSize: 18,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  padding: 2,
                }}
              >🎈</button>
            ))}
          </div>
          <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, color }}>
            {remaining} restantes
          </span>
        </div>
      </div>

      <button
        onClick={handlePop}
        disabled={popped >= phaseData.pop}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 'var(--radius-pill)',
          background: popped >= phaseData.pop ? 'var(--border)' : color,
          color: '#fff',
          fontFamily: 'Nunito',
          fontWeight: 800,
          fontSize: 18,
          border: 'none',
          cursor: popped >= phaseData.pop ? 'default' : 'pointer',
          minHeight: 56,
        }}
      >
        💥 POP!
      </button>
    </GameShell>
  );
}
