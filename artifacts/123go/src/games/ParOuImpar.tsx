import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

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

function getScatteredPositions(
  count: number,
  areaW: number,
  areaH: number,
  itemSize: number,
): { x: number; y: number; rotate: number }[] {
  const MIN_DIST = itemSize + 10;
  const positions: { x: number; y: number; rotate: number }[] = [];
  const padding = itemSize / 2 + 6;

  for (let i = 0; i < count; i++) {
    let pos = { x: 0, y: 0, rotate: 0 };
    let attempts = 0;
    do {
      pos = {
        x: padding + Math.random() * (areaW - padding * 2),
        y: padding + Math.random() * (areaH - padding * 2),
        rotate: Math.random() * 30 - 15,
      };
      attempts++;
    } while (
      attempts < 80 &&
      positions.some(p => Math.hypot(p.x - pos.x, p.y - pos.y) < MIN_DIST)
    );
    positions.push(pos);
  }
  return positions;
}

export function ParOuImpar() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [phaseItems, setPhaseItems] = useState<{ id: string; emoji: string; isSolo: boolean }[]>([]);
  const [positions, setPositions] = useState<{ x: number; y: number; rotate: number }[]>([]);
  const phaseCompletedRef = useRef(false);

  const itemSize   = isDesktop ? 60 : 82;
  const areaWidth  = isDesktop ? 860 : 360;
  const areaHeight = isDesktop ? 340 : 420;

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    const built = PHASE_BUILDERS[phase - 1]?.() ?? buildPhase(2, 'meias', '🧦', '🧤');
    setPhaseItems(built.items);
    setPositions(getScatteredPositions(built.items.length, areaWidth, areaHeight, itemSize));
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
      </div>

      {/* Scattered play area */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: areaHeight,
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        overflow: 'hidden',
      }}>
        {phaseItems.map((item, idx) => {
          const pos = positions[idx] ?? { x: 40, y: 40, rotate: 0 };
          return (
            <button
              key={item.id}
              onPointerUp={() => handleTap(item)}
              style={{
                position: 'absolute',
                left: pos.x - itemSize / 2,
                top:  pos.y - itemSize / 2,
                width: itemSize,
                height: itemSize,
                borderRadius: isDesktop ? 14 : 20,
                border: `2.5px solid ${item.isSolo && answered ? 'var(--c5)' : 'var(--border)'}`,
                background: item.isSolo && answered ? '#E8F5E9' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: `rotate(${pos.rotate}deg)`,
                transition: 'all 0.2s ease',
                touchAction: 'manipulation',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                padding: 0,
              }}
            >
              <AppleEmoji emoji={item.emoji} size={isDesktop ? 38 : 54} />
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}