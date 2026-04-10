import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

const PHASES = [
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 5, emoji: '🍬', label: 'A' }, { count: 9, emoji: '🍭', label: 'B' }], correct: 1 },
  { question: 'Qual pote tem MENOS balas?', potes: [{ count: 7, emoji: '🍬', label: 'A' }, { count: 10, emoji: '🍭', label: 'B' }], correct: 0 },
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 10, emoji: '🍬', label: 'A' }, { count: 9, emoji: '🍭', label: 'B' }], correct: 0 },
  { question: 'Qual pote tem MENOS balas?', potes: [{ count: 6, emoji: '🍬', label: 'A' }, { count: 8, emoji: '🍭', label: 'B' }], correct: 0 },
  { question: 'Qual pote tem MAIS balas?', potes: [{ count: 8, emoji: '🍬', label: 'A' }, { count: 5, emoji: '🍭', label: 'B' }], correct: 0 },
];

// Pick emoji size so ALL items fit inside the pote without overflow
function getEmojiSize(count: number, isDesktop: boolean): number {
  if (count <= 4)  return isDesktop ? 36 : 42;
  if (count <= 6)  return isDesktop ? 28 : 34;
  if (count <= 9)  return isDesktop ? 22 : 26;
  return isDesktop ? 18 : 22; // 10+
}

function PoteVisual({ count, emoji, label, selected, onTap, isDesktop }: {
  count: number; emoji: string; label: string; selected?: boolean; onTap: () => void; isDesktop: boolean;
}) {
  const emojiSize = getEmojiSize(count, isDesktop);
  const gap = count > 9 ? 2 : 4;

  return (
    <button
      onPointerUp={onTap}
      style={{
        flex: 1,
        padding: '10px 8px',
        borderRadius: 20,
        border: `3px solid ${selected ? 'var(--c3)' : 'var(--border)'}`,
        background: selected ? '#EDE9FF' : '#fff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
        minHeight: 0,
        transition: 'all 0.2s',
        touchAction: 'manipulation',
        overflow: 'hidden',
      }}
    >
      {/* Label */}
      <span style={{
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 13,
        color: 'var(--text2)', flexShrink: 0,
      }}>
        Pote {label}
      </span>

      {/* Emoji grid — grows to fill available space */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        flex: 1,
        width: '100%',
        padding: '0 6px',
        overflow: 'hidden',
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <AppleEmoji key={i} emoji={emoji} size={emojiSize} />
        ))}
      </div>

      {/* Count number */}
      <span style={{
        fontFamily: 'Nunito', fontWeight: 900,
        fontSize: isDesktop ? 22 : 26,
        color: 'var(--text)', flexShrink: 0,
      }}>
        {count}
      </span>
    </button>
  );
}

export function LojaDeBala() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();
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

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ marginBottom: 6 }}>
            <AppleEmoji emoji="🏪" size={isDesktop ? 28 : 40} />
          </div>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)', margin: 0 }}>
            {phaseData.question}
          </h2>
        </div>

        {/* Potes */}
        <div style={{
          display: 'flex', gap: 14, flex: 1, minHeight: 0,
          maxHeight: isDesktop ? 320 : undefined,
        }}>
          {phaseData.potes.map((pote, idx) => (
            <PoteVisual
              key={idx}
              count={pote.count}
              emoji={pote.emoji}
              label={pote.label}
              selected={idx === phaseData.correct && answered}
              onTap={() => handleChoice(idx)}
              isDesktop={isDesktop}
            />
          ))}
        </div>

      </div>
    </GameShell>
  );
}