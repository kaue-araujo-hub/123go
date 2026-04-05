import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

function generateProblem(phase: number): { a: number; b: number; op: '+' | '-'; ans: number } {
  if (phase <= 2) {
    const max = phase === 1 ? 5 : 10;
    const a = 1 + Math.floor(Math.random() * (max - 1));
    const b = 1 + Math.floor(Math.random() * (max - a));
    return { a, b, op: '+', ans: a + b };
  } else {
    const max = phase === 3 ? 5 : 10;
    const ans = 1 + Math.floor(Math.random() * (max - 1));
    const b   = 1 + Math.floor(Math.random() * (max - ans));
    const a   = ans + b;
    return { a, b, op: '-', ans };
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

const PHASE_LABELS = ['Adição até 5', 'Adição até 10', 'Subtração até 5', 'Subtração até 10', 'Mix Adição e Subtração'];
const TOTAL_PER_PHASE = [3, 3, 3, 3, 4];

export function TremDosNumeros() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [options, setOptions] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggingVal, setDraggingVal] = useState<number | null>(null);
  const phaseCompletedRef = useRef(false);
  const roundRef = useRef(1);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const newProblem = (p: number) => {
    const prob = generateProblem(p);
    const decoy1 = prob.ans === 1 ? 2 : prob.ans - 1;
    const decoy2 = prob.ans + 1;
    const opts = shuffle([prob.ans, decoy1, decoy2]);
    setProblem(prob);
    setOptions(opts);
  };

  useEffect(() => {
    phaseCompletedRef.current = false;
    roundRef.current = 1;
    setRound(1);
    setFeedback(null);
    setDragOver(false);
    newProblem(phase <= 4 ? phase : Math.random() > 0.5 ? 1 : 3);
  }, [phase]);

  const handleCorrect = () => {
    if (phaseCompletedRef.current) return;
    setFeedback('correct');
    onCorrect();
    const total = TOTAL_PER_PHASE[phase - 1];
    const nextRound = roundRef.current + 1;
    setTimeout(() => {
      setFeedback(null);
      setDragOver(false);
      if (nextRound > total) {
        phaseCompletedRef.current = true;
        onPhaseComplete();
      } else {
        roundRef.current = nextRound;
        setRound(nextRound);
        const nextOp = phase <= 4 ? phase : Math.random() > 0.5 ? 1 : 3;
        newProblem(nextOp);
      }
    }, 800);
  };

  const handleTap = (val: number) => {
    if (feedback || phaseCompletedRef.current) return;
    if (val === problem.ans) {
      handleCorrect();
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 700);
    }
  };

  const handleDrop = () => {
    if (draggingVal === null) return;
    if (draggingVal === problem.ans) {
      handleCorrect();
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 700);
    }
    setDraggingVal(null);
    setDragOver(false);
  };

  if (phaseComplete) {
    return (
      <GameShell title="Trem dos Números" emoji="🚂" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  const total = TOTAL_PER_PHASE[phase - 1];

  return (
    <GameShell title="Trem dos Números" emoji="🚂" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{ background: 'var(--c3)', color: '#fff', padding: '4px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 700 }}>
          {PHASE_LABELS[phase - 1]} • Conta {round}/{total}
        </span>
      </div>

      {/* Train equation */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: 20, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
          <AppleEmoji emoji="🚂" size={26} />
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>——————</span>
          <AppleEmoji emoji="🚃" size={26} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 46, color: 'var(--text)' }}>{problem.a}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 34, color: problem.op === '+' ? 'var(--c5)' : 'var(--c2)' }}>{problem.op}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 46, color: 'var(--text)' }}>{problem.b}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 34, color: 'var(--text3)' }}>=</div>
          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              width: 68, height: 68, borderRadius: 14,
              border: `3px dashed ${dragOver ? 'var(--c3)' : 'var(--border)'}`,
              background: dragOver ? '#EDE9FF' : 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 26, color: 'var(--text3)',
              transition: 'all 0.2s', animation: dragOver ? 'dropPulse 0.8s ease infinite' : undefined,
            }}
          >?</div>
        </div>
      </div>

      {/* Number options */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
        {options.map(val => (
          <div
            key={val}
            draggable
            onDragStart={() => setDraggingVal(val)}
            onPointerUp={() => handleTap(val)}
            style={{
              width: 88, height: 88, borderRadius: 20, background: '#fff',
              border: '2.5px solid var(--border)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 44, color: 'var(--text)',
              cursor: 'pointer', boxShadow: 'var(--shadow)',
              minHeight: 88, minWidth: 88, transition: 'all 0.15s',
              touchAction: 'manipulation', userSelect: 'none',
            }}
          >{val}</div>
        ))}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 10 }}>
        Toque no número certo ou arraste para o vagão
      </p>
      <style>{`
        @keyframes dropPulse { 50% { opacity: 0.5; } }
      `}</style>
    </GameShell>
  );
}
