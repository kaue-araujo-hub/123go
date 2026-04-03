import React, { useState, useEffect, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { g1: 20, g2: 12, pop: 8, question: 'Estoure 8 balões do grupo azul para igualar!' },
  { g1: 15, g2: 22, pop: 7, question: 'Estoure 7 balões do grupo rosa para igualar!' },
  { g1: 10, g2: 14, pop: 4, question: 'Estoure 4 balões do grupo verde para igualar!' },
  { g1: 18, g2: 12, pop: 6, question: 'Estoure 6 balões do grupo laranja para igualar!' },
  { g1: 16, g2: 8,  pop: 8, question: 'Estoure 8 balões roxos para igualar os grupos!' },
];

const ACTIVE_COLOR  = ['#5B4FCF', '#E91E8C', '#4CAF50', '#FF9800', '#9C27B0'];
const ACTIVE_BG     = ['#EEF0FF', '#FDE8F4', '#E8F5E9', '#FFF3E0', '#F3E8FF'];
const STATIC_BG     = ['#F5F5FF', '#FFF0F8', '#F0FAF0', '#FFF8F0', '#F9F0FF'];

// CSS filter to turn the default red 🎈 into each phase colour
const HUE_FILTER = [
  'hue-rotate(220deg) saturate(2) brightness(1.1)',   // blue
  'hue-rotate(310deg) saturate(1.6) brightness(1.05)', // pink
  'hue-rotate(120deg) saturate(1.5)',                 // green
  'hue-rotate(20deg)  saturate(1.8) brightness(1.1)', // orange
  'hue-rotate(265deg) saturate(1.6)',                 // purple
];

export function BaloesdaFesta() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [poppedSet,  setPoppedSet]  = useState<Set<number>>(new Set());
  const [splashing,  setSplashing]  = useState<Set<number>>(new Set());
  const [feedback,   setFeedback]   = useState<'correct' | 'wrong' | null>(null);

  const phaseData   = PHASES[phase - 1];
  const colorIdx    = phase - 1;
  const color       = ACTIVE_COLOR[colorIdx];
  const activeBg    = ACTIVE_BG[colorIdx];
  const staticBg    = STATIC_BG[colorIdx];
  const hueFilter   = HUE_FILTER[colorIdx];

  const bigGroup    = Math.max(phaseData.g1, phaseData.g2);
  const smallGroup  = Math.min(phaseData.g1, phaseData.g2);
  const popped      = poppedSet.size;

  useEffect(() => {
    setPoppedSet(new Set());
    setSplashing(new Set());
    setFeedback(null);
  }, [phase]);

  useEffect(() => {
    if (popped >= phaseData.pop && !phaseComplete) {
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [popped, phaseData.pop, phaseComplete, onCorrect, onPhaseComplete]);

  const handlePop = useCallback((i: number) => {
    if (popped >= phaseData.pop || poppedSet.has(i) || splashing.has(i)) return;
    setSplashing(prev => { const n = new Set(prev); n.add(i); return n; });
    setTimeout(() => {
      setSplashing(prev => { const n = new Set(prev); n.delete(i); return n; });
      setPoppedSet(prev => { const n = new Set(prev); n.add(i); return n; });
    }, 280);
  }, [popped, phaseData.pop, poppedSet, splashing]);

  // cap visible at 16 for layout, show +N label if more
  const VISIBLE_CAP = 16;
  const bigVisible   = Math.min(bigGroup, VISIBLE_CAP);
  const bigExtra     = bigGroup - bigVisible;
  const smallVisible = Math.min(smallGroup, VISIBLE_CAP);
  const smallExtra   = smallGroup - smallVisible;

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

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>
          {phaseData.question}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          Estourou: {popped}/{phaseData.pop}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>

        {/* Reference group (static) */}
        <div style={{
          flex: 1, background: staticBg, borderRadius: 16, padding: '12px 8px 10px',
          border: '1.5px solid var(--border)', textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Grupo fixo
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
            justifyItems: 'center',
            marginBottom: 6,
          }}>
            {Array.from({ length: smallVisible }).map((_, i) => (
              <AppleEmoji key={i} emoji="🎈" size={20} style={{ filter: hueFilter }} />
            ))}
          </div>
          {smallExtra > 0 && (
            <p style={{ fontFamily: 'Nunito', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>+{smallExtra}</p>
          )}
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 24, color }}>
            {smallGroup}
          </span>
        </div>

        {/* Interactive group — pop these */}
        <div style={{
          flex: 1, background: activeBg, borderRadius: 16, padding: '12px 8px 10px',
          border: `2px dashed ${color}`, textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Estoure estes!
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
            justifyItems: 'center',
            marginBottom: 6,
          }}>
            {Array.from({ length: bigVisible }).map((_, i) => {
              const isPopped   = poppedSet.has(i);
              const isSplash   = splashing.has(i);
              const isDone     = popped >= phaseData.pop;
              return (
                <button
                  key={i}
                  onClick={() => handlePop(i)}
                  disabled={isPopped || isDone}
                  style={{
                    width: 32, height: 36,
                    background: 'none', border: 'none',
                    cursor: isPopped || isDone ? 'default' : 'pointer',
                    padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    transition: 'transform 0.1s',
                    transform: isSplash ? 'scale(1.4)' : 'scale(1)',
                    animation: isSplash ? 'splashPop 0.28s ease' : 'none',
                  }}
                >
                  {isPopped
                    ? null
                    : isSplash
                      ? '💥'
                      : <AppleEmoji emoji="🎈" size={20} style={{ filter: hueFilter }} />
                  }
                </button>
              );
            })}
          </div>
          {bigExtra > 0 && (
            <p style={{ fontFamily: 'Nunito', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>+{bigExtra}</p>
          )}
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, color }}>
            {bigGroup - popped} restantes
          </span>
        </div>
      </div>

      {/* Big tap target POPbutton */}
      <button
        onClick={() => {
          const next = Array.from({ length: bigVisible }, (_, i) => i).find(i => !poppedSet.has(i) && !splashing.has(i));
          if (next !== undefined) handlePop(next);
        }}
        disabled={popped >= phaseData.pop}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-pill)',
          background: popped >= phaseData.pop ? 'var(--border)' : color,
          color: '#fff',
          fontFamily: 'Nunito',
          fontWeight: 800,
          fontSize: 18,
          border: 'none',
          cursor: popped >= phaseData.pop ? 'default' : 'pointer',
          minHeight: 64,
        }}
      >
        💥 POP!
      </button>

      <style>{`
        @keyframes splashPop {
          0%   { transform: scale(1);   opacity: 1; }
          60%  { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(0);   opacity: 0; }
        }
      `}</style>
    </GameShell>
  );
}
