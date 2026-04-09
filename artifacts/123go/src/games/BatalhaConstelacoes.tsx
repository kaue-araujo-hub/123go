import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { useIsDesktop } from '../hooks/useIsDesktop';

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

const PHASE_TYPES      = ['add', 'sub', 'mix', 'mix', 'rival'] as const;
const ROUNDS_PER_PHASE = [2, 2, 2, 3, 2];

export function BatalhaConstelacoes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [problem,     setProblem]     = useState(() => generateProblem('add'));
  const [options,     setOptions]     = useState<number[]>([]);
  const [round,       setRound]       = useState(1);
  const [correct,     setCorrect]     = useState(0);
  const [feedback,    setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [rivalAnswer, setRivalAnswer] = useState<number | null>(null);
  const [rocketBurst, setRocketBurst] = useState(false);

  /* Drag state */
  const [draggingVal, setDraggingVal] = useState<number | null>(null);
  const [ghostPos,    setGhostPos]    = useState<{ x: number; y: number } | null>(null);
  const [isOver,      setIsOver]      = useState(false); // drop zone hover

  const dropZoneRef        = useRef<HTMLDivElement>(null);
  const phaseCompletedRef  = useRef(false);
  const roundRef           = useRef(1);
  const rivalTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingValRef     = useRef<number | null>(null);

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
    setDraggingVal(null);
    setGhostPos(null);
    setIsOver(false);
    loadProblem(phase - 1);
    return () => { if (rivalTimerRef.current) clearTimeout(rivalTimerRef.current); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback((val: number) => {
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
  }, [feedback, problem.ans, phase, onCorrect, onPhaseComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Drag handlers ── */
  const startDrag = (e: React.PointerEvent, val: number) => {
    if (feedback || phaseCompletedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingValRef.current = val;
    setDraggingVal(val);
    setGhostPos({ x: e.clientX, y: e.clientY });

    const onMove = (ev: PointerEvent) => {
      setGhostPos({ x: ev.clientX, y: ev.clientY });
      /* Check hover over drop zone */
      if (dropZoneRef.current) {
        const r = dropZoneRef.current.getBoundingClientRect();
        setIsOver(
          ev.clientX >= r.left && ev.clientX <= r.right &&
          ev.clientY >= r.top  && ev.clientY <= r.bottom
        );
      }
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);

      if (dropZoneRef.current) {
        const r = dropZoneRef.current.getBoundingClientRect();
        const landed =
          ev.clientX >= r.left && ev.clientX <= r.right &&
          ev.clientY >= r.top  && ev.clientY <= r.bottom;
        if (landed && draggingValRef.current !== null) {
          handleAnswer(draggingValRef.current);
        }
      }

      draggingValRef.current = null;
      setDraggingVal(null);
      setGhostPos(null);
      setIsOver(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
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
  const rocketPct = 2 + (correct / total) * 78;
  const atTarget  = correct >= total;

  return (
    <GameShell title="Batalha de Constelações" emoji="🌌" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Ghost element — follows pointer */}
      {ghostPos && draggingVal !== null && (
        <div style={{
          position: 'fixed',
          left: ghostPos.x - (isDesktop ? 28 : 44),
          top:  ghostPos.y - (isDesktop ? 28 : 44),
          width: isDesktop ? 56 : 88, height: isDesktop ? 56 : 88,
          borderRadius: isDesktop ? 14 : 20,
          background: '#fff',
          border: '3px solid var(--c3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Nunito', fontWeight: 900, fontSize: isDesktop ? 28 : 44, color: 'var(--c3)',
          zIndex: 9999, pointerEvents: 'none',
          transform: 'scale(1.1)',
        }}>
          {draggingVal}
        </div>
      )}

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

      {/* Rocket track */}
      <div style={{
        position: 'relative', height: 54,
        background: '#0D1B2A', borderRadius: 16,
        marginBottom: 12, overflow: 'hidden',
        border: '1.5px solid rgba(255,255,255,0.08)',
      }}>
        {[12, 25, 38, 52, 65, 78].map((left, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%',
            left: `${left}%`, marginTop: -1,
            width: 3, height: 3, borderRadius: '50%',
            background: left / 100 < rocketPct / 100 ? 'rgba(255,220,80,0.9)' : 'rgba(255,255,255,0.2)',
            transition: 'background 0.4s',
            boxShadow: left / 100 < rocketPct / 100 ? '0 0 4px gold' : 'none',
          }} />
        ))}
        <div style={{
          position: 'absolute', right: '3%', top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 26,
          filter: atTarget ? 'drop-shadow(0 0 10px #7C3AED)' : 'opacity(0.65)',
          transition: 'filter 0.4s',
        }}>🪐</div>
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
        }}>🚀</div>
        <div style={{
          position: 'absolute', top: '50%',
          left: '0%',
          transform: 'translateY(-50%)',
          width: `${Math.max(0, rocketPct - 2)}%`,
          height: 3, borderRadius: 4,
          background: 'linear-gradient(to right, transparent, rgba(120,180,255,0.6))',
          transition: 'width 0.65s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>

      {/* Problem display with drop zone */}
      <div style={{
        background: '#0D1B2A', borderRadius: 20, padding: '18px 20px',
        textAlign: 'center', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        {['⭐', '✨', '💫', '🌟'].map((s, i) => (
          <span key={i} style={{ position: 'absolute', fontSize: 11, opacity: 0.35, top: `${18 + i * 22}%`, left: `${8 + i * 23}%` }}>{s}</span>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: isDesktop ? 36 : 56, color: '#fff' }}>{problem.a}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: isDesktop ? 26 : 40, color: problem.op === '+' ? '#81C784' : '#EF9A9A' }}>{problem.op}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: isDesktop ? 36 : 56, color: '#fff' }}>{problem.b}</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: isDesktop ? 22 : 36, color: 'rgba(255,255,255,0.5)' }}>=</span>

          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            style={{
              width: isDesktop ? 52 : 80, height: isDesktop ? 52 : 80, borderRadius: isDesktop ? 12 : 18,
              border: isOver
                ? '3px solid #F9A825'
                : draggingVal !== null
                  ? '3px dashed rgba(255,255,255,0.6)'
                  : '3px dashed rgba(255,255,255,0.3)',
              background: isOver
                ? 'rgba(249,168,37,0.18)'
                : draggingVal !== null
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border 0.2s, background 0.2s, transform 0.2s',
              transform: isOver ? 'scale(1.12)' : draggingVal !== null ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isOver ? '0 0 18px rgba(249,168,37,0.45)' : 'none',
            }}
          >
            <span style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 38,
              color: isOver ? '#F9A825' : 'rgba(255,255,255,0.35)',
              transition: 'color 0.2s',
            }}>?</span>
          </div>
        </div>

        {isRival && rivalAnswer !== null && (
          <div style={{ marginTop: 10, background: 'rgba(255,100,100,0.2)', borderRadius: 10, padding: '5px 14px', display: 'inline-block' }}>
            <span style={{ color: '#EF9A9A', fontFamily: 'Nunito', fontSize: 13, fontWeight: 700 }}>
              🤖 Rival respondeu: <strong>{rivalAnswer}</strong> (errado!)
            </span>
          </div>
        )}
      </div>

      {/* Drag instruction hint */}
      <p style={{
        textAlign: 'center', color: 'rgba(0,0,0,0.35)',
        fontSize: 12, marginBottom: 12, fontFamily: 'Nunito',
        opacity: draggingVal !== null ? 0 : 1, transition: 'opacity 0.2s',
      }}>
        Arraste o número correto até o <strong>?</strong>
      </p>

      {/* Draggable number tiles */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {options.map(val => {
          const isDraggingMe = draggingVal === val;
          return (
            <div
              key={val}
              onPointerDown={e => startDrag(e, val)}
              style={{
                width: isDesktop ? 60 : 92, height: isDesktop ? 60 : 92, borderRadius: isDesktop ? 14 : 22,
                border: '3px solid var(--border)',
                background: isDraggingMe ? '#f0f0f0' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Nunito', fontWeight: 900, fontSize: isDesktop ? 28 : 46, color: 'var(--text)',
                cursor: 'grab', touchAction: 'none', userSelect: 'none',
                opacity: isDraggingMe ? 0.3 : 1,
                transition: 'opacity 0.15s, transform 0.15s',
                transform: isDraggingMe ? 'scale(0.95)' : 'scale(1)',
                boxShadow: isDraggingMe ? 'none' : '0 3px 10px rgba(0,0,0,0.08)',
              }}
            >
              {val}
            </div>
          );
        })}
      </div>
    </GameShell>
  );
}
