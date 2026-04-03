import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { ops: [{ a: 2, b: 1, op: '+', ans: 3 }, { a: 3, b: 2, op: '+', ans: 5 }, { a: 1, b: 4, op: '+', ans: 5 }], label: 'Adição até 5' },
  { ops: [{ a: 4, b: 5, op: '+', ans: 9 }, { a: 6, b: 3, op: '+', ans: 9 }, { a: 7, b: 2, op: '+', ans: 9 }], label: 'Adição até 10' },
  { ops: [{ a: 5, b: 2, op: '-', ans: 3 }, { a: 4, b: 1, op: '-', ans: 3 }, { a: 3, b: 2, op: '-', ans: 1 }], label: 'Subtração até 5' },
  { ops: [{ a: 9, b: 4, op: '-', ans: 5 }, { a: 8, b: 3, op: '-', ans: 5 }, { a: 10, b: 6, op: '-', ans: 4 }], label: 'Subtração até 10' },
  { ops: [{ a: 5, b: 3, op: '+', ans: 8 }, { a: 9, b: 4, op: '-', ans: 5 }, { a: 6, b: 4, op: '+', ans: 10 }], label: 'Adição e Subtração' },
];

export function TremDosNumeros() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [opIdx, setOpIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [draggingVal, setDraggingVal] = useState<number | null>(null);
  const [dropOver, setDropOver] = useState(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setOpIdx(0); setFeedback(null); }, [phase]);

  if (phaseComplete || !phaseData) {
    return (
      <GameShell title="Trem dos Números" emoji="🚂" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  const currentOp = phaseData.ops[opIdx];
  if (!currentOp) return null;

  const options = [currentOp.ans - 1, currentOp.ans, currentOp.ans + 1].sort(() => Math.random() - 0.5);

  const handleDrop = () => {
    if (draggingVal === currentOp.ans) {
      handleCorrect();
    } else if (draggingVal !== null) {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
    setDraggingVal(null);
    setDropOver(false);
  };

  const handleCorrect = () => {
    setFeedback('correct');
    onCorrect();
    setTimeout(() => {
      setFeedback(null);
      if (opIdx + 1 >= phaseData.ops.length) {
        onPhaseComplete();
      } else {
        setOpIdx(i => i + 1);
      }
    }, 800);
  };

  const handleTap = (val: number) => {
    if (val === currentOp.ans) {
      handleCorrect();
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  return (
    <GameShell title="Trem dos Números" emoji="🚂" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ background: 'var(--c3)', color: '#fff', padding: '4px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 700 }}>
          {phaseData.label} • Conta {opIdx + 1}/{phaseData.ops.length}
        </span>
      </div>

      {/* Train */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: 20, marginBottom: 24, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
          <AppleEmoji emoji="🚂" size={28} />
          <span style={{ color: 'var(--text3)', fontSize: 14 }}>—————————</span>
          <AppleEmoji emoji="🚃" size={28} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 48, color: 'var(--text)' }}>{currentOp.a}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 36, color: 'var(--c2)' }}>{currentOp.op}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 48, color: 'var(--text)' }}>{currentOp.b}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 36, color: 'var(--text3)' }}>=</div>
          {/* Drop target */}
          <div
            onDragOver={e => { e.preventDefault(); setDropOver(true); }}
            onDragLeave={() => setDropOver(false)}
            onDrop={handleDrop}
            style={{
              width: 70,
              height: 70,
              borderRadius: 14,
              border: `3px dashed ${dropOver ? 'var(--c3)' : 'var(--border)'}`,
              background: dropOver ? '#EDE9FF' : 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Nunito',
              fontWeight: 900,
              fontSize: 28,
              color: 'var(--text3)',
              transition: 'all 0.2s',
            }}
          >?</div>
        </div>
      </div>

      {/* Number options */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {options.map(val => (
          <div
            key={val}
            draggable
            onDragStart={() => setDraggingVal(val)}
            onClick={() => handleTap(val)}
            style={{
              width: 96,
              height: 96,
              borderRadius: 20,
              background: '#fff',
              border: '2.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Nunito',
              fontWeight: 900,
              fontSize: 48,
              color: 'var(--text)',
              cursor: 'grab',
              boxShadow: 'var(--shadow)',
              minHeight: 96,
              minWidth: 96,
              transition: 'all 0.15s',
            }}
          >{val}</div>
        ))}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 12 }}>
        Arraste o número certo para o vagão vazio
      </p>
    </GameShell>
  );
}
