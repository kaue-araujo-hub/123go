import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { useIsDesktop } from '../hooks/useIsDesktop';

const ALL_DAYS = [
  { name: 'Segunda',  color: '#7C3AED' },
  { name: 'Terça',    color: '#EF5350' },
  { name: 'Quarta',   color: '#FF9800' },
  { name: 'Quinta',   color: '#E91E8C' },
  { name: 'Sexta',    color: '#4CAF50' },
  { name: 'Sábado',   color: '#00BCD4' },
  { name: 'Domingo',  color: '#5B4FCF' },
];

const PHASES = [
  { label: 'Qual é a ordem dos dias?', days: ALL_DAYS.slice(0, 2) },
  { label: 'Qual é a ordem dos dias?', days: ALL_DAYS.slice(0, 3) },
  { label: 'Qual é a ordem dos dias?', days: ALL_DAYS.slice(0, 4) },
  { label: 'Qual é a ordem dos dias?', days: ALL_DAYS.slice(0, 5) },
  { label: 'Qual é a ordem dos dias?', days: ALL_DAYS },
];

const PLAY_H   = 380;
const BUBBLE_W = 114;
const BUBBLE_H = 42;
const PAD      = 12;

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genPositions(n: number, areaW: number, areaH: number) {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    let best = { x: PAD, y: PAD };
    let bestDist = -1;
    for (let attempt = 0; attempt < 80; attempt++) {
      const x = PAD + Math.random() * Math.max(0, areaW - BUBBLE_W - 2 * PAD);
      const y = PAD + Math.random() * Math.max(0, areaH - BUBBLE_H - 2 * PAD);
      const minDist = positions.reduce((min, p) => Math.min(min, Math.hypot(p.x - x, p.y - y)), Infinity);
      if (minDist > bestDist) { bestDist = minDist; best = { x, y }; }
      if (minDist > BUBBLE_W + PAD) break;
    }
    positions.push(best);
  }
  return positions;
}

export function CalendarioVivo() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();
  const [feedback,      setFeedback]      = useState<'correct' | 'wrong' | null>(null);
  const [clickedCount,  setClickedCount]  = useState(0);
  const [allDays,       setAllDays]       = useState<typeof ALL_DAYS>([]);
  const [positions,     setPositions]     = useState<{ x: number; y: number }[]>([]);
  const [doneDays,      setDoneDays]      = useState<Set<string>>(new Set());
  const [flashCorrect,  setFlashCorrect]  = useState<string | null>(null);
  const [wrongBubble,   setWrongBubble]   = useState<string | null>(null);
  const [areaW,         setAreaW]         = useState(290);
  const phaseCompletedRef = useRef(false);
  const containerRef      = useRef<HTMLDivElement>(null);
  const phaseData = PHASES[phase - 1];

  /* measure play area width after mount */
  useLayoutEffect(() => {
    if (containerRef.current) setAreaW(containerRef.current.clientWidth);
  }, []);

  /* reset on phase change */
  useEffect(() => {
    phaseCompletedRef.current = false;
    setFeedback(null);
    setClickedCount(0);
    setFlashCorrect(null);
    setWrongBubble(null);
    setDoneDays(new Set());
    const shuffled = shuffleArr([...phaseData.days]);
    setAllDays(shuffled);
    setPositions(genPositions(shuffled.length, areaW, PLAY_H));
  }, [phase, areaW]);

  const reshuffleAll = useCallback((days: typeof ALL_DAYS) => {
    setPositions(genPositions(days.length, areaW, PLAY_H));
  }, [areaW]);

  const handleTap = (dayName: string) => {
    if (phaseCompletedRef.current || flashCorrect || wrongBubble) return;
    if (doneDays.has(dayName)) return;
    const expectedName = phaseData.days[clickedCount].name;

    if (dayName === expectedName) {
      setFlashCorrect(dayName);
      setTimeout(() => {
        setFlashCorrect(null);
        const newCount = clickedCount + 1;
        const newDone  = new Set([...doneDays, dayName]);
        setDoneDays(newDone);
        setClickedCount(newCount);
        reshuffleAll(allDays);

        if (newCount === phaseData.days.length) {
          if (!phaseCompletedRef.current) {
            phaseCompletedRef.current = true;
            setFeedback('correct');
            onCorrect();
            setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 900);
          }
        }
      }, 320);
    } else {
      setWrongBubble(dayName);
      setFeedback('wrong');
      setTimeout(() => { setWrongBubble(null); setFeedback(null); }, 600);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Calendário Vivo" emoji="📅" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c4)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Calendário Vivo" emoji="📅" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', margin: 0 }}>
          {phaseData.label}
        </h2>
      </div>

      {/* Play area */}
      <div
        ref={containerRef}
        style={{ position: 'relative', width: '100%', height: PLAY_H, overflow: 'hidden' }}
      >
        {allDays.map((day, idx) => {
          const pos          = positions[idx] ?? { x: 0, y: 0 };
          const isDone       = doneDays.has(day.name);
          const isFlash      = flashCorrect === day.name;
          const isWrong      = wrongBubble  === day.name;
          return (
            <div
              key={day.name}
              onPointerUp={() => handleTap(day.name)}
              style={{
                position: 'absolute',
                left:     pos.x,
                top:      pos.y,
                width:    isDesktop ? 80 : BUBBLE_W,
                height:   isDesktop ? 32 : BUBBLE_H,
                transition: 'left 0.28s ease, top 0.28s ease, background 0.15s, transform 0.15s, opacity 0.25s',
                background: isFlash ? '#4CAF50' : isWrong ? '#EF5350' : day.color,
                borderRadius: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isDone ? 'default' : 'pointer',
                touchAction: 'manipulation', userSelect: 'none',
                transform: isFlash ? 'scale(1.12)' : isWrong ? 'scale(0.94)' : 'scale(1)',
                opacity: isDone ? 0.28 : 1,
                boxShadow: isDone ? 'none' : '0 3px 10px rgba(0,0,0,0.18)',
              }}
            >
              <span style={{
                fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: '#fff',
                pointerEvents: 'none',
              }}>
                {isFlash ? '✓' : day.name}
              </span>
            </div>
          );
        })}
      </div>
    </GameShell>
  );
}
