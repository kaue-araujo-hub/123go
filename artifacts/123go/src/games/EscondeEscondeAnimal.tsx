import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const POSITIONS = ['em cima', 'embaixo', 'à esquerda', 'à direita', 'no meio', 'atrás da árvore', 'na frente da pedra'];

const PHASES = [
  { positions: ['em cima', 'embaixo'], animal: '🦊', hint: '🌳' },
  { positions: ['à esquerda', 'à direita', 'em cima', 'embaixo'], animal: '🐇', hint: '🌺' },
  { positions: ['em cima', 'embaixo', 'à esquerda', 'à direita'], animal: '🐸', hint: '🍄' },
  { positions: ['no meio', 'em cima', 'embaixo', 'à esquerda'], animal: '🦔', hint: '🍀' },
  { positions: ['atrás da árvore', 'na frente da pedra', 'em cima', 'embaixo'], animal: '🦦', hint: '🌊' },
];

export function EscondeEscondeAnimal() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    if (!phaseData) return;
    setAnswered(false);
    setFeedback(null);
    setCurrentPosition(Math.floor(Math.random() * phaseData.positions.length));
  }, [phase]);

  if (phaseComplete || !phaseData) {
    return (
      <GameShell title="Esconde-esconde Animal" emoji="🦊" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  const correctPos = phaseData.positions[currentPosition];

  const handleTap = (pos: string) => {
    if (answered) return;
    const correct = pos === correctPos;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  return (
    <GameShell title="Esconde-esconde Animal" emoji="🦊" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 8 }}>
          O {phaseData.animal} está escondido <strong>{correctPos}</strong>!
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Toque na posição correta!</p>
      </div>

      {/* Visual grid */}
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        padding: 20,
        marginBottom: 20,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 8,
        height: 200,
      }}>
        {phaseData.positions.map((pos, idx) => (
          <button
            key={pos}
            onClick={() => handleTap(pos)}
            style={{
              borderRadius: 12,
              border: `2px solid ${correctPos === pos && answered ? 'var(--c5)' : 'var(--border)'}`,
              background: correctPos === pos && answered ? '#E8F5E9' : 'var(--bg)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 4,
              padding: 4,
            }}
          >
            <AppleEmoji emoji={phaseData.hint} size={28} />
            <span style={{ fontSize: 10 }}>{pos}</span>
          </button>
        ))}
      </div>
    </GameShell>
  );
}
