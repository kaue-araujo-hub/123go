import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 5, emoji: '🍬', label: 'A' }, { count: 9, emoji: '🍭', label: 'B' }], correct: 1 },
  { question: 'Qual pote tem MENOS balas?', potes: [{ count: 7, emoji: '🍬', label: 'A' }, { count: 10, emoji: '🍭', label: 'B' }], correct: 0 },
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 10, emoji: '🍬', label: 'A' }, { count: 9, emoji: '🍭', label: 'B' }], correct: 0 },
  { question: 'Qual pote tem MENOS balas?', potes: [{ count: 9, emoji: '🍬', label: 'A' }, { count: 16, emoji: '🍭', label: 'B' }], correct: 0 },
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 11, emoji: '🍬', label: 'A' }, { count: 7, emoji: '🍭', label: 'B' }], correct: 0 },
];

function PoteVisual({ count, emoji, label, selected, onTap }: {
  count: number; emoji: string; label: string; selected?: boolean; onTap: () => void;
}) {
  return (
    <button
      onPointerUp={onTap}
      style={{
        flex: 1, padding: '10px 8px', borderRadius: 20,
        border: `3px solid ${selected ? 'var(--c3)' : 'var(--border)'}`,
        background: selected ? '#EDE9FF' : '#fff', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 6,
        minHeight: 0, transition: 'all 0.2s', touchAction: 'manipulation',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, color: 'var(--text2)', flexShrink: 0 }}>Pote {label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', maxWidth: 130, overflow: 'hidden' }}>
        {Array.from({ length: Math.min(count, 20) }).map((_, i) => (
          <AppleEmoji key={i} emoji={emoji} size={16} />
        ))}
        {count > 20 && <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>+{count - 20}</span>}
      </div>
      <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 24, color: 'var(--text)', flexShrink: 0 }}>{count}</span>
    </button>
  );
}

export function LojaDeBala() {
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

  const handleChoice = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = idx === phaseData.correct;
    setAnswered(true);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      phaseCompletedRef.current = true;
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 1000);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Loja de Balas" emoji="🍬" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Loja de Balas" emoji="🍬" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Flex column — fills GameShell area, no overflow */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ marginBottom: 6 }}><AppleEmoji emoji="🏪" size={40} /></div>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)', margin: 0 }}>
            {phaseData.question}
          </h2>
        </div>

        {/* Potes — grow to fill remaining space */}
        <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
          {phaseData.potes.map((pote, idx) => (
            <PoteVisual
              key={idx} count={pote.count} emoji={pote.emoji} label={pote.label}
              selected={idx === phaseData.correct && answered}
              onTap={() => handleChoice(idx)}
            />
          ))}
        </div>

      </div>
    </GameShell>
  );
}
