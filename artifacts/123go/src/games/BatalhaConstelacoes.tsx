import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

function generateProblem(type: 'add' | 'sub' | 'mix'): { a: number; b: number; op: '+' | '-'; ans: number } {
  if (type === 'add') {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * (10 - a));
    return { a, b, op: '+', ans: a + b };
  } else if (type === 'sub') {
    const ans = 1 + Math.floor(Math.random() * 8);
    const b   = 1 + Math.floor(Math.random() * ans);
    return { a: ans + b, b, op: '-', ans };
  } else {
    return Math.random() > 0.5 ? generateProblem('add') : generateProblem('sub');
  }
}

function genOptions(ans: number): number[] {
  const opts = new Set<number>([ans]);
  const d1 = ans >= 2 ? ans - 1 : ans + 2;
  opts.add(d1);
  while (opts.size < 3) { opts.add(Math.max(1, ans + Math.floor(Math.random() * 4) - 2)); }
  return [...opts].sort(() => Math.random() - 0.5);
}

const PHASE_TYPES = ['add', 'sub', 'mix', 'mix', 'rival'] as const;
const ROUNDS_PER_PHASE = [2, 2, 2, 3, 2];

export function BatalhaConstelacoes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [problem, setProblem] = useState(() => generateProblem('add'));
  const [options, setOptions] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [rivalAnswer, setRivalAnswer] = useState<number | null>(null);
  const phaseCompletedRef = useRef(false);
  const roundRef = useRef(1);
  const rivalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProblem = (phaseIdx: number) => {
    const typeKey = PHASE_TYPES[phaseIdx];
    const type = typeKey === 'rival' ? 'mix' : typeKey;
    const prob = generateProblem(type as 'add' | 'sub' | 'mix');
    const opts = genOptions(prob.ans);
    setProblem(prob);
    setOptions(opts);
    setRivalAnswer(null);

    if (typeKey === 'rival') {
      if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current);
      const wrongAns = opts.find(o => o !== prob.ans) ?? prob.ans + 1;
      rivalTimerRef.current = setTimeout(() => setRivalAnswer(wrongAns), 2000);
    }
  };

  useEffect(() => {
    phaseCompletedRef.current = false;
    roundRef.current = 1;
    setRound(1);
    setFeedback(null);
    setRivalAnswer(null);
    loadProblem(phase - 1);
    return () => { if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current); };
  }, [phase]);

  const handleAnswer = (val: number) => {
    if (feedback || phaseCompletedRef.current) return;
    const correct = val === problem.ans;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      onCorrect();
      const total = ROUNDS_PER_PHASE[phase - 1];
      setTimeout(() => {
        setFeedback(null);
        setRivalAnswer(null);
        if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current);
        const nextRound = roundRef.current + 1;
        if (nextRound > total) {
          phaseCompletedRef.current = true;
          onPhaseComplete();
        } else {
          roundRef.current = nextRound;
          setRound(nextRound);
          loadProblem(phase - 1);
        }
      }, 800);
    } else {
      setTimeout(() => setFeedback(null), 700);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Batalha de Constelações" emoji="🌌" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  const isRival = PHASE_TYPES[phase - 1] === 'rival';
  const total = ROUNDS_PER_PHASE[phase - 1];

  return (
    <GameShell title="Batalha de Constelações" emoji="🌌" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span style={{ background: 'var(--c3)', color: '#fff', padding: '3px 12px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700 }}>
          Batalha {round}/{total}
        </span>
        {isRival && <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>🤖 O astronauta rival vai responder em 2s… seja mais rápido!</p>}
      </div>

      {/* Problem display */}
      <div style={{ background: '#0D1B2A', borderRadius: 20, padding: 28, textAlign: 'center', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        {['⭐','✨','💫','🌟'].map((s, i) => (
          <span key={i} style={{ position: 'absolute', fontSize: 11, opacity: 0.35, top: `${18 + i * 22}%`, left: `${8 + i * 23}%` }}>{s}</span>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 60, color: '#fff' }}>{problem.a}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 44, color: problem.op === '+' ? '#81C784' : '#EF9A9A' }}>{problem.op}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 60, color: '#fff' }}>{problem.b}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 44, color: 'rgba(255,255,255,0.4)' }}>= ?</span>
        </div>

        {isRival && rivalAnswer !== null && (
          <div style={{ marginTop: 12, background: 'rgba(255,100,100,0.2)', borderRadius: 10, padding: '6px 14px', display: 'inline-block' }}>
            <span style={{ color: '#EF9A9A', fontFamily: 'Nunito', fontSize: 13, fontWeight: 700 }}>
              🤖 Rival respondeu: <strong>{rivalAnswer}</strong> (errado!)
            </span>
          </div>
        )}
      </div>

      {/* Answer options */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
        {options.map(val => (
          <button
            key={val}
            onPointerUp={() => handleAnswer(val)}
            style={{
              width: 96, height: 96, borderRadius: 22,
              border: '3px solid var(--border)', background: '#fff',
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 46, color: 'var(--text)',
              cursor: 'pointer', minHeight: 96, minWidth: 96,
              transition: 'all 0.15s ease', touchAction: 'manipulation',
            }}
          >
            {val}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
