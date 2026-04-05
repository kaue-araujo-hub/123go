import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

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
    setSplashing(prev => { const n = new Set(prev); n.add(i); return n; });
    setTimeout(() => {
      setSplashing(prev => { const n = new Set(prev); n.delete(i); return n; });
      setPoppedSet(prev => { const n = new Set(prev); n.add(i); return n; });
    }, 280);
  }, [popped, phaseData.pop, poppedSet, splashing]);

  const VISIBLE_CAP = 16;
  const bigVisible = Math.min(bigGroup, VISIBLE_CAP);
  const bigExtra = bigGroup - bigVisible;
  const smallVisible = Math.min(smallGroup, VISIBLE_CAP);
  const smallExtra = smallGroup - smallVisible;
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
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>
          {phaseData.question}
        </h2>
        {remaining > 0 ? (
          <p style={{ color, fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, margin: 0 }}>
            Ainda faltam <span style={{ fontSize: 22 }}>{remaining}</span> balões!
          </p>
        ) : (
          <p style={{ color: 'var(--c5)', fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, margin: 0 }}>
            🎉 Grupos igualizados!
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {/* Active group (can be popped) */}
        <div style={{ flex: 1, background: activeBg, borderRadius: 16, padding: 10, border: `2px solid ${color}` }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color, textAlign: 'center', margin: '0 0 6px' }}>
            Grupo principal: {bigGroup - popped}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {Array.from({ length: bigVisible }, (_, i) => (
              <button
                key={i}
                onPointerUp={() => handlePop(i)}
                style={{
                  background: 'none', border: 'none', cursor: popped >= phaseData.pop ? 'default' : 'pointer',
                  padding: 2, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  touchAction: 'manipulation',
                  animation: splashing.has(i) ? 'splashPop 0.28s ease forwards' : undefined,
                }}
              >
                {poppedSet.has(i)
                  ? <span style={{ fontSize: 16 }}>💨</span>
                  : splashing.has(i)
                  ? <span style={{ fontSize: 16 }}>💥</span>
                  : <AppleEmoji emoji="🎈" size={22} style={{ filter: hueFilter }} />
                }
              </button>
            ))}
          </div>
          {bigExtra > 0 && <p style={{ fontFamily: 'Nunito', fontSize: 10, color, textAlign: 'center', margin: '3px 0 0' }}>+{bigExtra}</p>}
        </div>

        {/* Static group (no interaction) */}
        <div style={{ flex: 1, background: '#F5F5F5', borderRadius: 16, padding: 10, border: '2px dashed #CCC', opacity: 0.8 }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: '#888', textAlign: 'center', margin: '0 0 6px' }}>
            Grupo alvo: {smallGroup}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', pointerEvents: 'none' }}>
            {Array.from({ length: smallVisible }, (_, i) => (
              <AppleEmoji key={i} emoji="🎈" size={18} style={{ opacity: 0.5, filter: 'grayscale(1)' }} />
            ))}
          </div>
          {smallExtra > 0 && <p style={{ fontFamily: 'Nunito', fontSize: 10, color: '#999', textAlign: 'center', margin: '3px 0 0' }}>+{smallExtra}</p>}
        </div>
      </div>

      {/* Big POP button */}
      <button
        onPointerUp={() => {
          if (popped >= phaseData.pop) return;
          const next = Array.from({ length: bigVisible }, (_, i) => i).find(i => !poppedSet.has(i) && !splashing.has(i));
          if (next !== undefined) handlePop(next);
        }}
        disabled={popped >= phaseData.pop}
        style={{
          width: '100%', padding: '14px', borderRadius: 'var(--radius-pill)',
          background: popped >= phaseData.pop ? 'var(--border)' : color, color: '#fff',
          fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, border: 'none',
          cursor: popped >= phaseData.pop ? 'default' : 'pointer', minHeight: 56,
          touchAction: 'manipulation', transition: 'background 0.2s',
        }}
      >
        {popped >= phaseData.pop ? '✅ Grupos Iguais!' : '💥 POP!'}
      </button>

      <style>{`
        @keyframes splashPop {
          0%   { transform: scale(1) translateZ(0); opacity: 1; }
          60%  { transform: scale(1.6) translateZ(0); opacity: 0.8; }
          100% { transform: scale(0) translateZ(0); opacity: 0; }
        }
      `}</style>
    </GameShell>
  );
}
