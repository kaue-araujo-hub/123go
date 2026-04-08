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

const PHASE_TYPES     = ['add', 'sub', 'mix', 'mix', 'rival'] as const;
const ROUNDS_PER_PHASE = [2, 2, 2, 3, 2];

export function BatalhaConstelacoes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [problem,      setProblem]      = useState(() => generateProblem('add'));
  const [options,      setOptions]      = useState<number[]>([]);
  const [round,        setRound]        = useState(1);
  const [correct,      setCorrect]      = useState(0); // rocket progress
  const [feedback,     setFeedback]     = useState<'correct' | 'wrong' | null>(null);
  const [rivalAnswer,  setRivalAnswer]  = useState<number | null>(null);
  const [rocketBurst,  setRocketBurst]  = useState(false); // burst animation on hit
  const phaseCompletedRef  = useRef(false);
  const roundRef           = useRef(1);
  const rivalTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProblem = (phaseIdx: number) => {
    const typeKey = PHASE_TYPES[phaseIdx];
    const type    = typeKey === 'rival' ? 'mix' : typeKey;
    const prob    = generateProblem(type as 'add' | 'sub' | 'mix');
    const opts    = genOptions(prob.ans);
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
    setCorrect(0);
    setFeedback(null);
    setRivalAnswer(null);
    setRocketBurst(false);
    loadProblem(phase - 1);
    return () => { if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = (val: number) => {
    if (feedback || phaseCompletedRef.current) return;
    const isCorrect = val === problem.ans;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      onCorrect();
      setCorrect(c => c + 1);
      setRocketBurst(true);
      setTimeout(() => setRocketBurst(false), 500);
      const total     = ROUNDS_PER_PHASE[phase - 1];
      const nextRound = roundRef.current + 1;
      setTimeout(() => {
        setFeedback(null);
        setRivalAnswer(null);
        if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current);
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

  const isRival   = PHASE_TYPES[phase - 1] === 'rival';
  const total     = ROUNDS_PER_PHASE[phase - 1];
  /* Rocket travels from 2% → 80% of track width, leaving room for planet at right */
  const rocketPct = 2 + (correct / total) * 78;
  const atTarget  = correct >= total;

  return (
    <GameShell title="Batalha de Constelações" emoji="🌌" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Battle counter */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ background: 'var(--c3)', color: '#fff', padding: '3px 12px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700 }}>
          Batalha {round}/{total}
        </span>
        {isRival && (
          <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
            🤖 O astronauta rival vai responder em 2s… seja mais rápido!
          </p>
        )}
      </div>

      {/* Rocket track — space-themed progress bar */}
      <div style={{
        position: 'relative', height: 54,
        background: '#0D1B2A', borderRadius: 16,
        marginBottom: 12, overflow: 'hidden',
        border: '1.5px solid rgba(255,255,255,0.08)',
      }}>
        {/* Star trail dots */}
        {[12, 25, 38, 52, 65, 78].map((left, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%',
            left: `${left}%`, marginTop: -1,
            width: 3, height: 3, borderRadius: '50%',
            background: left / 100 < rocketPct / 100
              ? 'rgba(255,220,80,0.9)'
              : 'rgba(255,255,255,0.2)',
            transition: 'background 0.4s',
            boxShadow: left / 100 < rocketPct / 100 ? '0 0 4px gold' : 'none',
          }} />
        ))}

        {/* Target planet */}
        <div style={{
          position: 'absolute', right: '3%', top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 26,
          filter: atTarget ? 'drop-shadow(0 0 10px #7C3AED)' : 'opacity(0.65)',
          transition: 'filter 0.4s',
        }}>
          🪐
        </div>

        {/* Rocket — moves toward planet */}
        <div style={{
          position: 'absolute', top: '50%',
          left: `${rocketPct}%`,
          transform: `translateY(-50%) ${rocketBurst ? 'scale(1.35)' : 'scale(1)'}`,
          transition: rocketBurst
            ? 'transform 0.15s ease, left 0.65s cubic-bezier(0.34,1.56,0.64,1)'
            : 'left 0.65s cubic-bezier(0.34,1.56,0.64,1), transform 0.3s ease',
          fontSize: 26,
          filter: 'drop-shadow(0 0 6px rgba(120,180,255,0.7))',
          zIndex: 2,
        }}>
          🚀
        </div>

        {/* Exhaust trail */}
        <div style={{
          position: 'absolute', top: '50%',
          left: `${rocketPct - 3}%`,
          transform: 'translateY(-50%)',
          width: `${Math.max(0, rocketPct - 2)}%`,
          height: 3, borderRadius: 4,
          background: 'linear-gradient(to left, rgba(120,180,255,0.6), transparent)',
          transition: 'left 0.65s cubic-bezier(0.34,1.56,0.64,1), width 0.65s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>

      {/* Problem display */}
      <div style={{ background: '#0D1B2A', borderRadius: 20, padding: '18px 28px', textAlign: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        {['⭐', '✨', '💫', '🌟'].map((s, i) => (
          <span key={i} style={{ position: 'absolute', fontSize: 11, opacity: 0.35, top: `${18 + i * 22}%`, left: `${8 + i * 23}%` }}>{s}</span>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 58, color: '#fff' }}>{problem.a}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 42, color: problem.op === '+' ? '#81C784' : '#EF9A9A' }}>{problem.op}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 58, color: '#fff' }}>{problem.b}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 42, color: 'rgba(255,255,255,0.4)' }}>= ?</span>
        </div>

        {isRival && rivalAnswer !== null && (
          <div style={{ marginTop: 10, background: 'rgba(255,100,100,0.2)', borderRadius: 10, padding: '5px 14px', display: 'inline-block' }}>
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
