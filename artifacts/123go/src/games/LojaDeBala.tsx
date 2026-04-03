import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 5, emoji: '🍬' }, { count: 15, emoji: '🍭' }], correct: 1 },
  { question: 'Qual pote tem MENOS balas?', potes: [{ count: 10, emoji: '🍬' }, { count: 14, emoji: '🍭' }], correct: 0 },
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 12, emoji: '🍬' }, { count: 8, emoji: '🍭' }], correct: 0 },
  { question: 'Qual pote tem MENOS balas?', potes: [{ count: 9, emoji: '🍬' }, { count: 16, emoji: '🍭' }], correct: 0 },
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 11, emoji: '🍬' }, { count: 7, emoji: '🍭' }], correct: 0 },
];

function BowlVisual({ count, emoji, selected, onClick }: { count: number; emoji: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 20,
        border: `3px solid ${selected ? 'var(--c3)' : 'var(--border)'}`,
        background: selected ? '#EDE9FF' : '#fff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        minHeight: 120,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: 120 }}>
        {Array.from({ length: Math.min(count, 20) }).map((_, i) => (
          <AppleEmoji key={i} emoji={emoji} size={20} />
        ))}
      </div>
      <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>{count}</span>
    </button>
  );
}

export function LojaDeBala() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setAnswered(false); setFeedback(null); }, [phase]);

  const handleChoice = (idx: number) => {
    if (answered) return;
    const correct = idx === phaseData.correct;
    setAnswered(true);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
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
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}><AppleEmoji emoji="🏪" size={48} /></div>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
          {phaseData.question}
        </h2>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {phaseData.potes.map((pote, idx) => (
          <BowlVisual key={idx} count={pote.count} emoji={pote.emoji} onClick={() => handleChoice(idx)} />
        ))}
      </div>
    </GameShell>
  );
}
