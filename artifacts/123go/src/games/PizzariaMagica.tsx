import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const PHASES = [
  { theme: '🍕 Pizza', total: 5, have: 2, need: 3 },
  { theme: '🥪 Sanduíche', total: 10, have: 4, need: 6 },
  { theme: '🍦 Sorvete', total: 8, have: 10, need: -2, note: 'O cliente devolveu 2 bolas!' },
  { theme: '🍫 Brigadeiro', total: 7, have: 3, need: 4 },
  { theme: '🎂 Bolo', total: 10, have: 6, need: 4 },
];

export function PizzariaMagica() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [placed, setPlaced] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [dragging, setDragging] = useState(false);
  const phaseData = PHASES[phase - 1];
  const target = Math.abs(phaseData.need);

  useEffect(() => { setPlaced(0); setFeedback(null); }, [phase]);

  useEffect(() => {
    if (placed >= target && !phaseComplete) {
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [placed, target, phaseComplete, onCorrect, onPhaseComplete]);

  const addSlice = () => {
    if (placed < target) setPlaced(p => p + 1);
  };

  const isSubtraction = phaseData.need < 0;
  const have = isSubtraction ? phaseData.have : phaseData.have;
  const currentTotal = isSubtraction ? have - placed : have + placed;

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

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>
          {phaseData.theme}
        </p>
        {phaseData.note && <p style={{ color: 'var(--c2)', fontSize: 13, fontWeight: 600 }}>{phaseData.note}</p>}
      </div>

      {/* Pizza display */}
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        padding: 24,
        textAlign: 'center',
        marginBottom: 20,
      }}>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 8 }}>
          Precisa de: <strong>{phaseData.total}</strong> porções
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 56, color: 'var(--text)' }}>{have}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 32, color: isSubtraction ? 'var(--c2)' : 'var(--c5)' }}>
            {isSubtraction ? '−' : '+'} {placed}
          </span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 32, color: 'var(--text3)' }}>=</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 56, color: currentTotal === phaseData.total ? 'var(--c5)' : 'var(--c1)' }}>
            {currentTotal}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 12 }}>
          {Array.from({ length: Math.min(currentTotal, 20) }).map((_, i) => (
            <span key={i} style={{ fontSize: 20 }}>{phaseData.theme.split(' ')[0]}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div
          draggable
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          onClick={addSlice}
          style={{
            flex: 1,
            height: 80,
            borderRadius: 16,
            background: 'var(--c1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            cursor: 'grab',
            fontFamily: 'Nunito',
            fontWeight: 800,
            color: '#fff',
            gap: 8,
          }}
        >
          {isSubtraction ? '↩️' : '+'} <span>{phaseData.theme.split(' ')[0]}</span>
        </div>

        <div
          onDragOver={e => e.preventDefault()}
          onDrop={addSlice}
          style={{
            flex: 2,
            height: 80,
            borderRadius: 16,
            border: `3px dashed ${dragging ? 'var(--c1)' : 'var(--border)'}`,
            background: dragging ? '#FFF3E0' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            color: 'var(--text2)',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          🍽️ Solte aqui
        </div>
      </div>

      <div style={{ background: 'var(--border)', borderRadius: 8, height: 10, marginTop: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--c1)', width: `${(placed / target) * 100}%`, transition: 'width 0.3s ease', borderRadius: 8 }} />
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 6 }}>
        {placed}/{target} {isSubtraction ? 'devolvidos' : 'adicionados'}
      </p>
    </GameShell>
  );
}
