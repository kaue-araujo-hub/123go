import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

/* ── helpers ── */
function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── static data ── */
const PERIODS = [
  { name: 'Manhã',     emoji: '🌅', bg: '#FFF9C4', textColor: '#E65100',
    activities: [{ emoji: '🍽️', label: 'almoçar' }, { emoji: '☕', label: 'café da manhã' }] },
  { name: 'Tarde',     emoji: '☀️', bg: '#FFE0B2', textColor: '#BF360C',
    activities: [{ emoji: '🥘', label: 'jantar' }, { emoji: '🍱', label: 'almoço' }] },
  { name: 'Noite',     emoji: '🌙', bg: '#1A237E', textColor: '#fff',
    activities: [{ emoji: '🛁', label: 'banho' }, { emoji: '📖', label: 'história' }] },
  { name: 'Madrugada', emoji: '⭐', bg: '#0D1B2A', textColor: '#B0BEC5',
    activities: [{ emoji: '😴', label: 'dormir' }, { emoji: '🌙', label: 'sonhar' }] },
];

/* meals and periods for the match phase */
const MATCH_MEALS = [
  { key: 'breakfast', emoji: '☕', label: 'Café da manhã', periodKey: 'manha' },
  { key: 'lunch',     emoji: '🍱', label: 'Almoço',        periodKey: 'tarde' },
  { key: 'dinner',    emoji: '🥘', label: 'Jantar',         periodKey: 'noite' },
];
const MATCH_PERIODS = [
  { key: 'manha', emoji: '🌅', name: 'Manhã', bg: '#FFF9C4', textColor: '#E65100' },
  { key: 'tarde', emoji: '☀️', name: 'Tarde', bg: '#FFE0B2', textColor: '#BF360C' },
  { key: 'noite', emoji: '🌙', name: 'Noite', bg: '#1A237E', textColor: '#fff'    },
];
const LINE_COLORS = ['#F59E0B', '#E91E8C', '#7C3AED'];

const PHASES = [
  { type: 'identify', showEmoji: '🌅', correct: 0, question: 'Qual período é esse?' },
  { type: 'identify', showEmoji: '☀️', correct: 1, question: 'Qual período é esse?' },
  { type: 'identify', showEmoji: '🌙', correct: 2, question: 'Qual período é esse?' },
  { type: 'activity', period: 0, actIdx: 0, question: 'O que se faz de MANHÃ?' },
  { type: 'match',    question: 'Ligue cada refeição ao período do dia!' },
];

export function SolLuaEstrelas() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();
  const [feedback,    setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [answered,    setAnswered]    = useState(false);
  const phaseCompletedRef = useRef(false);

  /* match-phase state */
  const [shuffledMeals, setShuffledMeals] = useState(() => shuffleArr(MATCH_MEALS));
  const [selectedMeal,  setSelectedMeal]  = useState<string | null>(null);
  const [connections,   setConnections]   = useState<Record<string, string>>({});   // mealKey → periodKey
  const [wrongPair,     setWrongPair]     = useState(false);

  /* refs for SVG lines */
  const containerRef    = useRef<HTMLDivElement>(null);
  const mealRefs        = useRef<Record<string, HTMLDivElement | null>>({});
  const periodRefs      = useRef<Record<string, HTMLDivElement | null>>({});
  type LineData = { key: string; x1: number; y1: number; x2: number; y2: number; color: string };
  const [lines, setLines] = useState<LineData[]>([]);

  const phaseData = PHASES[phase - 1];

  /* ── Reset ── */
  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    setShuffledMeals(shuffleArr(MATCH_MEALS));
    setSelectedMeal(null);
    setConnections({});
    setWrongPair(false);
    mealRefs.current   = {};
    periodRefs.current = {};
    setLines([]);
  }, [phase]);

  /* ── Completion check (match phase) ── */
  useEffect(() => {
    if (
      phaseData.type === 'match' &&
      Object.keys(connections).length === MATCH_MEALS.length &&
      !phaseCompletedRef.current
    ) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [connections, phaseData.type, onCorrect, onPhaseComplete]);

  /* ── Recompute SVG lines after render ── */
  useLayoutEffect(() => {
    if (!containerRef.current || phaseData.type !== 'match') return;
    const cr = containerRef.current.getBoundingClientRect();
    const newLines: LineData[] = [];
    Object.entries(connections).forEach(([mealKey, periodKey], idx) => {
      const mealEl   = mealRefs.current[mealKey];
      const periodEl = periodRefs.current[periodKey];
      if (!mealEl || !periodEl) return;
      const mr = mealEl.getBoundingClientRect();
      const pr = periodEl.getBoundingClientRect();
      newLines.push({
        key:   `${mealKey}-${periodKey}`,
        x1:    mr.right  - cr.left,
        y1:    mr.top    + mr.height / 2 - cr.top,
        x2:    pr.left   - cr.left,
        y2:    pr.top    + pr.height / 2 - cr.top,
        color: LINE_COLORS[idx % LINE_COLORS.length],
      });
    });
    setLines(newLines);
  }, [connections, phaseData.type]);

  /* ── Handlers ── */
  const handleAnswer = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = (phaseData.correct ?? -1) === idx;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true;
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  const handleMealTap = (mealKey: string) => {
    if (connections[mealKey] !== undefined || phaseCompletedRef.current) return;
    setSelectedMeal(prev => prev === mealKey ? null : mealKey);
  };

  const handlePeriodTap = (periodKey: string) => {
    if (!selectedMeal || phaseCompletedRef.current) return;
    const meal = MATCH_MEALS.find(m => m.key === selectedMeal)!;

    /* check if this period is already taken by another meal */
    const takenBy = Object.entries(connections).find(([, pk]) => pk === periodKey);
    if (takenBy) return;

    if (meal.periodKey === periodKey) {
      setConnections(prev => ({ ...prev, [selectedMeal]: periodKey }));
      setSelectedMeal(null);
    } else {
      setWrongPair(true);
      setFeedback('wrong');
      setTimeout(() => { setWrongPair(false); setFeedback(null); setSelectedMeal(null); }, 700);
    }
  };

  /* ── PhaseComplete screen ── */
  if (phaseComplete) {
    return (
      <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c4)" />
      </GameShell>
    );
  }

  /* ── Match phase (5) ── */
  if (phaseData.type === 'match') {
    return (
      <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: 'var(--text)', margin: 0 }}>
            {phaseData.question}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
            Toque na refeição e depois no período correto
          </p>
        </div>

        {/* Match area — relative container for SVG overlay */}
        <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: 0 }}>

          {/* SVG line overlay */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 2 }}
          >
            {lines.map(l => (
              <line
                key={l.key}
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={l.color} strokeWidth={3} strokeLinecap="round"
                strokeDasharray="0"
              />
            ))}
          </svg>

          {/* Left column — meals (shuffled) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1 }}>
            {shuffledMeals.map(meal => {
              const isConnected = connections[meal.key] !== undefined;
              const isSelected  = selectedMeal === meal.key;
              const connColor   = isConnected
                ? LINE_COLORS[Object.keys(connections).indexOf(meal.key) % LINE_COLORS.length]
                : undefined;
              return (
                <div
                  key={meal.key}
                  ref={el => { mealRefs.current[meal.key] = el; }}
                  onPointerUp={() => handleMealTap(meal.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 14,
                    border: `2.5px solid ${isConnected ? connColor! : isSelected ? 'var(--c4)' : 'var(--border)'}`,
                    background: isConnected ? `${connColor}18` : isSelected ? 'rgba(245,158,11,0.1)' : '#fff',
                    cursor: isConnected ? 'default' : 'pointer',
                    transition: 'all 0.15s', touchAction: 'manipulation',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 12px rgba(245,158,11,0.35)' : '0 1px 4px rgba(0,0,0,0.07)',
                    opacity: isConnected ? 0.75 : 1,
                  }}
                >
                  <AppleEmoji emoji={meal.emoji} size={32} />
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>
                    {meal.label}
                  </span>
                  {/* right dot */}
                  <div style={{ marginLeft: 'auto', width: 10, height: 10, borderRadius: '50%',
                    background: isConnected ? connColor! : isSelected ? 'var(--c4)' : '#ccc',
                    transition: 'background 0.15s',
                  }} />
                </div>
              );
            })}
          </div>

          {/* Spacer for lines */}
          <div style={{ width: 36, flexShrink: 0 }} />

          {/* Right column — periods (fixed order) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1 }}>
            {MATCH_PERIODS.map(period => {
              const connEntry   = Object.entries(connections).find(([, pk]) => pk === period.key);
              const isConnected = connEntry !== undefined;
              const connColor   = isConnected
                ? LINE_COLORS[Object.keys(connections).indexOf(connEntry![0]) % LINE_COLORS.length]
                : undefined;
              const isTarget    = selectedMeal !== null && !isConnected;
              return (
                <div
                  key={period.key}
                  ref={el => { periodRefs.current[period.key] = el; }}
                  onPointerUp={() => handlePeriodTap(period.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 14,
                    border: `2.5px solid ${isConnected ? connColor! : isTarget ? 'var(--c4)' : 'var(--border)'}`,
                    background: isConnected ? `${connColor}18` : isTarget ? 'rgba(245,158,11,0.06)' : period.bg,
                    cursor: isConnected ? 'default' : 'pointer',
                    transition: 'all 0.15s', touchAction: 'manipulation',
                    transform: isTarget ? 'scale(1.03)' : 'scale(1)',
                    opacity: isConnected ? 0.75 : 1,
                  }}
                >
                  {/* left dot */}
                  <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: isConnected ? connColor! : isTarget ? 'var(--c4)' : '#ccc',
                    transition: 'background 0.15s',
                  }} />
                  <AppleEmoji emoji={period.emoji} size={28} />
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: period.textColor }}>
                    {period.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </GameShell>
    );
  }

  /* ── Activity phase (4) ── */
  if (phaseData.type === 'activity' && phaseData.period !== undefined && phaseData.actIdx !== undefined) {
    const period = PERIODS[phaseData.period];
    const allActivities = PERIODS.flatMap(p => p.activities);
    const correct = period.activities[phaseData.actIdx];
    const decoys  = allActivities.filter(a => a.label !== correct.label).slice(0, 2);
    const options = [correct, ...decoys].sort(() => Math.random() - 0.5);
    return (
      <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 8 }}>
            {phaseData.question}
          </h2>
          <AppleEmoji emoji={period.emoji} size={isDesktop ? 48 : 72} />
          <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginTop: 6 }}>{period.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {options.map((act, i) => (
            <button
              key={i}
              onPointerUp={() => handleAnswer(act.label === correct.label ? phaseData.correct ?? 0 : -1)}
              style={{
                padding: '16px 14px', borderRadius: 20, border: '2px solid var(--border)',
                background: '#fff', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, cursor: 'pointer', minWidth: 88, minHeight: 88,
                touchAction: 'manipulation', flex: 1,
              }}
            >
              <AppleEmoji emoji={act.emoji} size={isDesktop ? 28 : 44} />
              <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{act.label}</span>
            </button>
          ))}
        </div>
      </GameShell>
    );
  }

  /* ── Identify phases (1-3) ── */
  return (
    <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 10 }}>
          {phaseData.question}
        </h2>
        <AppleEmoji emoji={phaseData.showEmoji ?? '☀️'} size={isDesktop ? 56 : 88} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {PERIODS.map((p, i) => (
          <button
            key={i}
            onPointerUp={() => handleAnswer(i)}
            style={{
              padding: '14px 10px', borderRadius: 18, border: '2.5px solid var(--border)',
              background: i === (phaseData.correct ?? -1) && answered ? '#E8F5E9' : p.bg,
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              minHeight: 64, transition: 'all 0.15s', touchAction: 'manipulation',
            }}
          >
            <AppleEmoji emoji={p.emoji} size={isDesktop ? 28 : 40} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: p.textColor }}>{p.name}</span>
          </button>
        ))}
      </div>
    </GameShell>
  );
}
