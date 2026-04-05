import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPhase(pairCount: number, theme: string, pairEmoji: string, soloEmoji: string) {
  const items: { id: string; emoji: string; isSolo: boolean }[] = [];
  for (let i = 0; i < pairCount; i++) {
    items.push({ id: `${i}a`, emoji: pairEmoji, isSolo: false });
    items.push({ id: `${i}b`, emoji: pairEmoji, isSolo: false });
  }
  items.push({ id: 'solo', emoji: soloEmoji, isSolo: true });
  return { theme, items: shuffle(items) };
}

const PHASE_BUILDERS = [
  () => buildPhase(2, 'meias', '🧦', '🧤'),
  () => buildPhase(2, 'luvas', '🧤', '🐾'),
  () => buildPhase(3, 'sapatos', '👟', '🌟'),
  () => buildPhase(4, 'planetas', '🪐', '☀️'),
  () => buildPhase(4, 'frutas', '🍎', '🍊'),
];

export function ParOuImpar() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [phaseItems, setPhaseItems] = useState<{ id: string; emoji: string; isSolo: boolean }[]>([]);
  const [themeName, setThemeName] = useState('');
  const phaseCompletedRef = useRef(false);

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    const built = PHASE_BUILDERS[phase - 1]?.() ?? buildPhase(2, 'meias', '🧦', '🧤');
    setPhaseItems(built.items);
    setThemeName(built.theme);
  }, [phase]);

  const handleTap = (item: { id: string; isSolo: boolean }) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = item.isSolo;
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
      <GameShell title="Par ou Ímpar?" emoji="🧦" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Par ou Ímpar?" emoji="🧦" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 19, color: 'var(--text)', marginBottom: 4 }}>
          Toque no item que ficou <span style={{ color: 'var(--c3)' }}>sozinho!</span>
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Tema: <strong>{themeName}</strong></p>
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
        padding: 14, background: '#fff', borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
      }}>
        {phaseItems.map(item => (
          <button
            key={item.id}
            onPointerUp={() => handleTap(item)}
            style={{
              width: 88, height: 88, borderRadius: 20,
              border: `2.5px solid ${item.isSolo && answered ? 'var(--c5)' : 'var(--border)'}`,
              background: item.isSolo && answered ? '#E8F5E9' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease',
              minHeight: 88, minWidth: 88, touchAction: 'manipulation',
            }}
          >
            <AppleEmoji emoji={item.emoji} size={58} />
          </button>
        ))}
      </div>
    </GameShell>
  );
}
