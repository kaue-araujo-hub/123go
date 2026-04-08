import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { playBalloonPop } from '../utils/sounds';

const PHASES = [
  { total: 20, pop: 8,  question: 'Estoure 8 balões azuis!' },
  { total: 18, pop: 7,  question: 'Estoure 7 balões rosa!' },
  { total: 14, pop: 4,  question: 'Estoure 4 balões verdes!' },
  { total: 18, pop: 6,  question: 'Estoure 6 balões laranja!' },
  { total: 16, pop: 8,  question: 'Estoure 8 balões roxos!' },
];

const COLOR   = ['#5B4FCF', '#E91E8C', '#4CAF50', '#FF9800', '#9C27B0'];
const BG      = ['#EEF0FF', '#FDE8F4', '#E8F5E9', '#FFF3E0', '#F3E8FF'];
const HUE     = [
  'hue-rotate(220deg) saturate(2) brightness(1.1)',
  'hue-rotate(310deg) saturate(1.6) brightness(1.05)',
  'hue-rotate(120deg) saturate(1.5)',
  'hue-rotate(20deg)  saturate(1.8) brightness(1.1)',
  'hue-rotate(265deg) saturate(1.6)',
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function BaloesdaFesta() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [poppedSet,  setPoppedSet]  = useState<Set<number>>(new Set());
  const [splashing,  setSplashing]  = useState<Set<number>>(new Set());
  const [feedback,   setFeedback]   = useState<'correct' | 'wrong' | null>(null);
  const phaseCompletedRef = useRef(false);

  const phaseData = PHASES[phase - 1];
  const ci        = phase - 1;
  const color     = COLOR[ci];
  const bg        = BG[ci];
  const hue       = HUE[ci];
  const popped    = poppedSet.size;
  const remaining = phaseData.pop - popped;

  /* Stable random layout + float params per phase */
  const balloons = useMemo(() => {
    const rand = seededRandom(phase * 997 + phaseData.total * 31);
    return Array.from({ length: phaseData.total }, (_, i) => ({
      left:     6  + rand() * 78,          // 6 – 84 %
      top:      4  + rand() * 76,          // 4 – 80 %
      duration: 2.2 + rand() * 2.0,        // 2.2 – 4.2 s
      delay:    -(rand() * 3.0),           // –3 – 0 s  (start mid-cycle)
      amp:      10  + rand() * 16,         // 10 – 26 px vertical travel
    }));
  }, [phase, phaseData.total]);

  useEffect(() => {
    phaseCompletedRef.current = false;
    setPoppedSet(new Set());
    setSplashing(new Set());
    setFeedback(null);
  }, [phase]);

  useEffect(() => {
    if (popped >= phaseData.pop && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [popped, phaseData.pop, onCorrect, onPhaseComplete]);

  const handlePop = useCallback((i: number) => {
    if (phaseCompletedRef.current || popped >= phaseData.pop || poppedSet.has(i) || splashing.has(i)) return;
    playBalloonPop();
    setSplashing(prev => { const n = new Set(prev); n.add(i); return n; });
    setTimeout(() => {
      setSplashing(prev => { const n = new Set(prev); n.delete(i); return n; });
      setPoppedSet(prev => { const n = new Set(prev); n.add(i); return n; });
    }, 300);
  }, [popped, phaseData.pop, poppedSet, splashing]);

  if (phaseComplete) {
    return (
      <GameShell title="Balões da Festa" emoji="🎈" color={color} currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color={color} />
      </GameShell>
    );
  }

  return (
    <GameShell title="Balões da Festa" emoji="🎈" color={color} currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* Question + counter */}
        <div style={{ textAlign: 'center', flexShrink: 0, padding: '4px 0 6px' }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--text)', margin: '0 0 2px' }}>
            {phaseData.question}
          </h2>
          {remaining > 0 ? (
            <p style={{ color, fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, margin: 0 }}>
              Faltam <span style={{ fontSize: 17 }}>{remaining}</span>
            </p>
          ) : (
            <p style={{ color: '#10B981', fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, margin: 0 }}>
              🎉 Muito bem!
            </p>
          )}
        </div>

        {/* Full-area floating balloon field */}
        <div style={{
          position: 'relative', flex: 1, borderRadius: 18,
          background: bg, overflow: 'hidden',
          border: `2px solid ${color}22`,
        }}>
          {balloons.map((b, i) => {
            const isPopped    = poppedSet.has(i);
            const isSplashing = splashing.has(i);

            return (
              <button
                key={i}
                onPointerUp={() => handlePop(i)}
                style={{
                  position: 'absolute',
                  left: `${b.left}%`,
                  top:  `${b.top}%`,
                  transform: 'translate(-50%, -50%)',
                  background: 'none', border: 'none', padding: 0,
                  width: 48, height: 56,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: (isPopped || popped >= phaseData.pop) ? 'default' : 'pointer',
                  touchAction: 'manipulation',
                  animation: isSplashing
                    ? 'bfSplash 0.30s ease forwards'
                    : isPopped
                    ? 'none'
                    : `bfFloat ${b.duration.toFixed(2)}s ${b.delay.toFixed(2)}s ease-in-out infinite alternate`,
                  zIndex: isPopped ? 0 : isSplashing ? 10 : 1,
                  opacity: isPopped ? 0 : 1,
                  transition: isPopped ? 'opacity 0.15s ease' : undefined,
                  willChange: 'transform',
                  '--amp': `${b.amp.toFixed(0)}px`,
                } as React.CSSProperties}
              >
                {isSplashing
                  ? <span style={{ fontSize: 28 }}>💥</span>
                  : isPopped
                  ? null
                  : <AppleEmoji emoji="🎈" size={38} style={{ filter: hue, display: 'block' }} />
                }
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bfFloat {
          from { transform: translate(-50%, calc(-50% - var(--amp, 14px))); }
          to   { transform: translate(-50%, calc(-50% + var(--amp, 14px))); }
        }
        @keyframes bfSplash {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
          55%  { transform: translate(-50%, -50%) scale(2.0); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
        }
      `}</style>
    </GameShell>
  );
}
