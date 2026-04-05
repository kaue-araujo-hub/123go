import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { theme: '🍕', name: 'Pizza',        total: 5,  have: 2,  need: 3,  note: null },
  { theme: '🥪', name: 'Sanduíche',    total: 10, have: 4,  need: 6,  note: null },
  { theme: '🍦', name: 'Sorvete',      total: 8,  have: 10, need: -2, note: 'O cliente devolveu 2 bolas!' },
  { theme: '🍫', name: 'Brigadeiro',   total: 7,  have: 3,  need: 4,  note: null },
  { theme: '🎂', name: 'Bolo',         total: 10, have: 6,  need: 4,  note: null },
];

export function PizzariaMagica() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [placed, setPlaced] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];
  const target = Math.abs(phaseData.need);
  const isSubtraction = phaseData.need < 0;

  useEffect(() => {
    phaseCompletedRef.current = false;
    setPlaced(0);
    setFeedback(null);
  }, [phase]);

  useEffect(() => {
    if (placed >= target && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [placed, target, onCorrect, onPhaseComplete]);

  const addSlice = () => {
    if (placed < target && !phaseCompletedRef.current) {
      setPlaced(p => p + 1);
    }
  };

  const currentTotal = isSubtraction ? phaseData.have - placed : phaseData.have + placed;
  const canAdd = placed < target;

  if (phaseComplete) {
    return (
      <GameShell title="Pizzaria Mágica" emoji="🍕" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Pizzaria Mágica" emoji="🍕" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>
          {phaseData.theme} {phaseData.name}
        </span>
        {phaseData.note && (
          <p style={{ color: 'var(--c2)', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            {isSubtraction ? '↩️ ' : ''}{phaseData.note}
          </p>
        )}
      </div>

      {/* Equation display */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: 20, textAlign: 'center', marginBottom: 18 }}>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 8 }}>
          Precisa de: <strong>{phaseData.total}</strong> porções
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 52, color: 'var(--text)' }}>{phaseData.have}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 30, color: isSubtraction ? 'var(--c2)' : 'var(--c5)' }}>
            {isSubtraction ? '−' : '+'} {placed}
          </span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 30, color: 'var(--text3)' }}>=</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 52, color: currentTotal === phaseData.total ? 'var(--c5)' : 'var(--c1)' }}>
            {currentTotal}
          </span>
        </div>
        {/* Visual slices */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {Array.from({ length: Math.min(currentTotal, 20) }).map((_, i) => (
            <AppleEmoji key={i} emoji={phaseData.theme} size={22} />
          ))}
          {currentTotal > 20 && <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>+{currentTotal - 20}</span>}
        </div>
        {isSubtraction && (
          <p style={{ color: 'var(--c2)', fontSize: 12, marginTop: 8, fontWeight: 600 }}>
            ↩️ Remover: {placed}/{target} devolvidos
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--border)', borderRadius: 8, height: 10, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--c1)', width: `${Math.min((placed / target) * 100, 100)}%`, transition: 'width 0.3s ease', borderRadius: 8 }} />
      </div>

      {/* Add/remove button */}
      <button
        onPointerUp={addSlice}
        disabled={!canAdd}
        style={{
          width: '100%', height: 70, borderRadius: 18,
          background: canAdd ? 'var(--c1)' : 'var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, cursor: canAdd ? 'pointer' : 'default',
          fontFamily: 'Nunito', fontWeight: 800, color: '#fff',
          gap: 10, border: 'none', transition: 'background 0.2s',
          touchAction: 'manipulation',
        }}
      >
        {isSubtraction ? '↩️' : '➕'} <AppleEmoji emoji={phaseData.theme} size={34} />
        <span style={{ fontSize: 16 }}>{isSubtraction ? 'Devolver' : 'Adicionar'}</span>
      </button>
    </GameShell>
  );
}
