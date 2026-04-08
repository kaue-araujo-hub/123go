import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { playBalloonPop } from '../utils/sounds';

const PHASES = [
  { g1: 20, g2: 12, pop: 8,  question: 'Estoure 8 balões azuis para igualar os grupos!' },
  { g1: 15, g2: 22, pop: 7,  question: 'Estoure 7 balões rosa para igualar!' },
  { g1: 10, g2: 14, pop: 4,  question: 'Estoure 4 balões verdes para igualar!' },
  { g1: 18, g2: 12, pop: 6,  question: 'Estoure 6 balões laranja para igualar!' },
  { g1: 16, g2: 8,  pop: 8,  question: 'Estoure 8 balões roxos para igualar!' },
];

const ACTIVE_COLOR  = ['#5B4FCF', '#E91E8C', '#4CAF50', '#FF9800', '#9C27B0'];
const ACTIVE_BG     = ['#EEF0FF', '#FDE8F4', '#E8F5E9', '#FFF3E0', '#F3E8FF'];
const HUE_FILTER = [
  'hue-rotate(220deg) saturate(2) brightness(1.1)',
  'hue-rotate(310deg) saturate(1.6) brightness(1.05)',
  'hue-rotate(120deg) saturate(1.5)',
  'hue-rotate(20deg) saturate(1.8) brightness(1.1)',
  'hue-rotate(265deg) saturate(1.6)',
];

/** Seeded LCG random — same sequence every time for same seed */
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
  const phaseData  = PHASES[phase - 1];
  const colorIdx   = phase - 1;
  const color      = ACTIVE_COLOR[colorIdx];
  const activeBg   = ACTIVE_BG[colorIdx];
  const hueFilter  = HUE_FILTER[colorIdx];
  const bigGroup   = Math.max(phaseData.g1, phaseData.g2);
  const smallGroup = Math.min(phaseData.g1, phaseData.g2);
  const popped     = poppedSet.size;

  /* Precompute random scatter positions per phase — stable across renders */
  const balloonPositions = useMemo(() => {
    const rand = seededRandom(phase * 997 + bigGroup * 31);
    return Array.from({ length: bigGroup }, () => ({
      left: 8 + rand() * 74,  // 8% – 82%
      top:  6 + rand() * 76,  // 6% – 82%
    }));
  }, [phase, bigGroup]);

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
    }, 280);
  }, [popped, phaseData.pop, poppedSet, splashing]);

  const remaining = phaseData.pop - popped;

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

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: 8 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'var(--text)', margin: '0 0 2px' }}>
            {phaseData.question}
          </h2>
          {remaining > 0 ? (
            <p style={{ color, fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, margin: 0 }}>
              Faltam <span style={{ fontSize: 18 }}>{remaining}</span> balões!
            </p>
          ) : (
            <p style={{ color: 'var(--c5)', fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, margin: 0 }}>
              🎉 Grupos igualizados!
            </p>
          )}
        </div>

        {/* Balloon groups */}
        <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>

          {/* Active group — scattered balloons, tap to pop */}
          <div style={{
            flex: 1, background: activeBg, borderRadius: 16,
            padding: '6px', border: `2px solid ${color}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color, textAlign: 'center', margin: '0 0 3px', flexShrink: 0 }}>
              Grupo principal: {bigGroup - popped}
            </p>
            {/* Random scatter container */}
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
              {Array.from({ length: bigGroup }, (_, i) => {
                const pos = balloonPositions[i];
                const isPopped    = poppedSet.has(i);
                const isSplashing = splashing.has(i);
                return (
                  <button
                    key={i}
                    onPointerUp={() => handlePop(i)}
                    style={{
                      position: 'absolute',
                      left: `${pos.left}%`,
                      top:  `${pos.top}%`,
                      transform: 'translate(-50%, -50%)',
                      background: 'none', border: 'none',
                      cursor: (isPopped || popped >= phaseData.pop) ? 'default' : 'pointer',
                      padding: 0,
                      width: 40, height: 40,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      touchAction: 'manipulation',
                      animation: isSplashing ? 'splashPop 0.28s ease forwards' : undefined,
                      zIndex: isPopped ? 0 : 1,
                    }}
                  >
                    {isPopped
                      ? <span style={{ fontSize: 18 }}>💨</span>
                      : isSplashing
                      ? <span style={{ fontSize: 22 }}>💥</span>
                      : <AppleEmoji emoji="🎈" size={32} style={{ filter: hueFilter }} />
                    }
                  </button>
                );
              })}
            </div>
          </div>

          {/* Static target group */}
          <div style={{
            flex: 1, background: '#F5F5F5', borderRadius: 16,
            padding: '6px', border: '2px dashed #CCC',
            opacity: 0.8, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: '#888', textAlign: 'center', margin: '0 0 3px', flexShrink: 0 }}>
              Grupo alvo: {smallGroup}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden', flex: 1, alignContent: 'flex-start', padding: '4px' }}>
              {Array.from({ length: smallGroup }, (_, i) => (
                <AppleEmoji key={i} emoji="🎈" size={20} style={{ opacity: 0.5, filter: 'grayscale(1)' }} />
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes splashPop {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
          60%  { transform: translate(-50%, -50%) scale(1.8); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
        }
      `}</style>
    </GameShell>
  );
}
