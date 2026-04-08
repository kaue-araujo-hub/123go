import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PHASE_LABELS    = ['Adição até 5', 'Adição até 10', 'Subtração até 5', 'Subtração até 10', 'Mix'];
const TOTAL_PER_PHASE = [3, 3, 3, 3, 4];

export function TremDosNumeros() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [problem, setProblem]         = useState(() => generateProblem(1));
  const [options,  setOptions]        = useState<number[]>([]);
  const [round,    setRound]          = useState(1);
  const [correct,  setCorrect]        = useState(0); // answers correct in this phase
  const [feedback, setFeedback]       = useState<'correct' | 'wrong' | null>(null);

  /* Drag state */
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragPos,  setDragPos]  = useState<{ x: number; y: number } | null>(null);
  const [isOver,   setIsOver]   = useState(false);

  const phaseCompletedRef = useRef(false);
  const roundRef          = useRef(1);
  const dropZoneRef       = useRef<HTMLDivElement>(null);
  const draggingRef       = useRef<number | null>(null);

  const newProblem = (p: number) => {
    const prob   = generateProblem(p);
    const decoy1 = prob.ans === 1 ? 2 : prob.ans - 1;
    const decoy2 = prob.ans + 1;
    setProblem(prob);
    setOptions(shuffle([prob.ans, decoy1, decoy2]));
  };

  useEffect(() => {
    phaseCompletedRef.current = false;
    roundRef.current = 1;
    setRound(1);
    setCorrect(0);
    setFeedback(null);
    setDragging(null);
    setDragPos(null);
    setIsOver(false);
    draggingRef.current = null;
    newProblem(phase <= 4 ? phase : Math.random() > 0.5 ? 1 : 3);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCorrect = useCallback(() => {
    if (phaseCompletedRef.current) return;
    setFeedback('correct');
    onCorrect();
    const total     = TOTAL_PER_PHASE[phase - 1];
    const nextRound = roundRef.current + 1;
    setCorrect(c => c + 1); // advance train
    setTimeout(() => {
      setFeedback(null);
      setIsOver(false);
      if (nextRound > total) {
        phaseCompletedRef.current = true;
        onPhaseComplete();
      } else {
        roundRef.current = nextRound;
        setRound(nextRound);
        newProblem(phase <= 4 ? phase : Math.random() > 0.5 ? 1 : 3);
      }
    }, 800);
  }, [phase, onCorrect, onPhaseComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkDrop = useCallback((x: number, y: number, val: number) => {
    const zone = dropZoneRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const hit  = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (hit) {
      if (val === problem.ans) {
        handleCorrect();
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 700);
      }
    }
  }, [problem.ans, handleCorrect]);

  /* Global pointer listeners while dragging */
  useEffect(() => {
    if (dragging === null) return;
    const onMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });
      const zone = dropZoneRef.current;
      if (zone) {
        const r = zone.getBoundingClientRect();
        setIsOver(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
      }
    };
    const onUp = (e: PointerEvent) => {
      const val = draggingRef.current;
      if (val !== null) checkDrop(e.clientX, e.clientY, val);
      setDragging(null);
      setDragPos(null);
      setIsOver(false);
      draggingRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
  }, [dragging, checkDrop]);

  const startDrag = (e: React.PointerEvent, val: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = val;
    setDragging(val);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  if (phaseComplete) {
    return (
      <GameShell title="Trem dos Números" emoji="🚂" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  const total        = TOTAL_PER_PHASE[phase - 1];
  /* Train goes from 0% → ~88% of track (leaving room for star at the right end) */
  const trainPct     = (correct / total) * 88;

  return (
    <GameShell title="Trem dos Números" emoji="🚂" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Ghost element following the pointer */}
      {dragging !== null && dragPos && (
        <div style={{
          position: 'fixed',
          left: dragPos.x - 44, top: dragPos.y - 44,
          width: 88, height: 88, borderRadius: 20,
          background: '#fff', border: '2.5px solid var(--c3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Nunito', fontWeight: 900, fontSize: 44, color: 'var(--c3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          opacity: 0.92, pointerEvents: 'none', zIndex: 9999,
          transform: 'scale(1.08)',
        }}>
          {dragging}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ background: 'var(--c3)', color: '#fff', padding: '4px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 700 }}>
          {PHASE_LABELS[phase - 1]} • Conta {round}/{total}
        </span>
      </div>

      {/* Train track — trem avança a cada acerto */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        padding: '14px 16px 10px',
        marginBottom: 16,
      }}>
        {/* Track */}
        <div style={{ position: 'relative', height: 48, marginBottom: 8 }}>
          {/* Rail line */}
          <div style={{
            position: 'absolute', top: '50%', left: '5%', right: '5%',
            height: 4, background: '#E5E7EB', borderRadius: 2,
            transform: 'translateY(-50%)',
          }} />
          {/* Rail ties */}
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute', top: 'calc(50% - 6px)',
              left: `${8 + i * 11}%`, width: 3, height: 12,
              background: '#D1D5DB', borderRadius: 1,
            }} />
          ))}
          {/* Train emoji — moves right with each correct answer */}
          <div style={{
            position: 'absolute', top: '50%',
            left: `${trainPct}%`,
            transform: 'translateY(-50%)',
            transition: 'left 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontSize: 30, lineHeight: 1,
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.15))',
          }}>
            🚂
          </div>
          {/* Star at the right end */}
          <div style={{
            position: 'absolute', top: '50%', right: '2%',
            transform: 'translateY(-50%)',
            fontSize: 28,
            filter: correct === total
              ? 'drop-shadow(0 0 8px gold)'
              : 'grayscale(0.3) opacity(0.7)',
            transition: 'filter 0.4s ease',
          }}>
            ⭐
          </div>
        </div>

        {/* Equation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 46, color: 'var(--text)' }}>{problem.a}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 34, color: problem.op === '+' ? 'var(--c5)' : 'var(--c2)' }}>{problem.op}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 46, color: 'var(--text)' }}>{problem.b}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 34, color: 'var(--text3)' }}>=</div>
          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            style={{
              width: 68, height: 68, borderRadius: 14,
              border: `3px dashed ${isOver ? 'var(--c3)' : 'var(--border)'}`,
              background: isOver ? '#EDE9FF' : 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 26, color: 'var(--text3)',
              transition: 'all 0.2s',
              animation: isOver ? 'dropPulse 0.8s ease infinite' : undefined,
            }}
          >?</div>
        </div>
      </div>

      {/* Number options — drag only */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
        {options.map(val => (
          <div
            key={val}
            onPointerDown={e => startDrag(e, val)}
            style={{
              width: 88, height: 88, borderRadius: 20,
              background: dragging === val ? '#F3F0FF' : '#fff',
              border: `2.5px solid ${dragging === val ? 'var(--c3)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 44,
              color: dragging === val ? 'var(--c3)' : 'var(--text)',
              cursor: 'grab', boxShadow: dragging === val ? 'none' : 'var(--shadow)',
              minHeight: 88, minWidth: 88, transition: 'all 0.15s',
              touchAction: 'none', userSelect: 'none',
              opacity: dragging === val ? 0.45 : 1,
            }}
          >{val}</div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 10 }}>
        Arraste o número correto para o vagão ⬆
      </p>

      <style>{`
        @keyframes dropPulse { 50% { opacity: 0.5; } }
      `}</style>
    </GameShell>
  );
}
