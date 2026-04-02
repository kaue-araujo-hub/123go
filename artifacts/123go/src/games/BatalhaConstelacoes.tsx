import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const PHASES = [
  { ops: [{ a: 3, b: 2, op: '+', ans: 5 }], type: 'addition' },
  { ops: [{ a: 7, b: 3, op: '-', ans: 4 }], type: 'subtraction' },
  { ops: [{ a: 5, b: 4, op: '+', ans: 9 }], type: 'mental' },
  { ops: [{ a: 8, b: 3, op: '-', ans: 5 }, { a: 4, b: 2, op: '+', ans: 6 }, { a: 6, b: 1, op: '-', ans: 5 }], type: 'sequence' },
  { ops: [{ a: 10, b: 4, op: '-', ans: 6 }], type: 'rival' },
];

export function BatalhaConstelacoes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [opIdx, setOpIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setOpIdx(0); setFeedback(null); setAnswer(''); }, [phase]);

  const currentOp = phaseData.ops[opIdx];
  const options = [currentOp.ans - 1, currentOp.ans, currentOp.ans + 2].sort(() => Math.random() - 0.5);

  const handleAnswer = (val: number) => {
    const correct = val === currentOp.ans;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      onCorrect();
      setTimeout(() => {
        setFeedback(null);
        if (opIdx + 1 >= phaseData.ops.length) {
          onPhaseComplete();
        } else {
          setOpIdx(i => i + 1);
        }
      }, 800);
    } else {
      setTimeout(() => setFeedback(null), 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Batalha de Constelações" emoji="🌌" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Batalha de Constelações" emoji="🌌" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{
        background: '#0D1B2A',
        borderRadius: 20,
        padding: 32,
        textAlign: 'center',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Stars background */}
        {['⭐', '✨', '💫'].map((s, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontSize: 12,
            opacity: 0.4,
            top: `${20 + i * 25}%`,
            left: `${10 + i * 30}%`,
          }}>{s}</span>
        ))}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 64, color: '#fff' }}>{currentOp.a}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 48, color: currentOp.op === '+' ? '#81C784' : '#EF9A9A' }}>
            {currentOp.op}
          </span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 64, color: '#fff' }}>{currentOp.b}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 48, color: 'rgba(255,255,255,0.5)' }}>=</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 48, color: 'rgba(255,255,255,0.4)' }}>?</span>
        </div>

        {phaseData.type === 'sequence' && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 }}>
            Conta {opIdx + 1} de {phaseData.ops.length}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {options.map(val => (
          <button
            key={val}
            onClick={() => handleAnswer(val)}
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: '#fff',
              border: '2px solid var(--border)',
              fontFamily: 'Nunito',
              fontWeight: 900,
              fontSize: 32,
              color: 'var(--text)',
              cursor: 'pointer',
              minHeight: 80,
              minWidth: 80,
              boxShadow: 'var(--shadow)',
              transition: 'all 0.15s',
            }}
          >{val}</button>
        ))}
      </div>
    </GameShell>
  );
}
