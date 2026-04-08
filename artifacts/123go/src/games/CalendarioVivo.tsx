import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const ALL_DAYS = [
  { name: 'Segunda',  emoji: '📘', color: '#5B4FCF' },
  { name: 'Terça',    emoji: '📗', color: '#4CAF50' },
  { name: 'Quarta',   emoji: '📙', color: '#FF9800' },
  { name: 'Quinta',   emoji: '📕', color: '#EF5350' },
  { name: 'Sexta',    emoji: '📓', color: '#E91E8C' },
  { name: 'Sábado',   emoji: '📔', color: '#00BCD4' },
  { name: 'Domingo',  emoji: '📒', color: '#9C27B0' },
];

const PHASES = [
  { label: 'Ordene os 2 primeiros dias!',  days: ALL_DAYS.slice(0, 2) },
  { label: 'Ordene os 5 dias da semana!', days: ALL_DAYS.slice(0, 5) },
  { label: 'Um dia está faltando!',        days: ALL_DAYS.slice(0, 4), missingIdx: 2 },
  { label: 'Ordene a semana completa!',   days: ALL_DAYS },
  { label: 'Ordene todos os 7 dias!',     days: ALL_DAYS },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CARD_H = 52;   /* approx card height (px) */
const CARD_GAP = 7;

export function CalendarioVivo() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [order,       setOrder]       = useState<typeof ALL_DAYS>([]);
  const [feedback,    setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [ghostPos,    setGhostPos]    = useState<{ x: number; y: number } | null>(null);
  const [insertPos,   setInsertPos]   = useState<number | null>(null);   // 0..n inclusive

  const phaseCompletedRef = useRef(false);
  const draggingRef       = useRef<number | null>(null);
  const cardRefs          = useRef<(HTMLDivElement | null)[]>([]);
  const phaseData = PHASES[phase - 1];

  /* ── reset ── */
  useEffect(() => {
    phaseCompletedRef.current = false;
    setFeedback(null);
    setDraggingIdx(null);
    setGhostPos(null);
    setInsertPos(null);
    cardRefs.current = [];
    setOrder(shuffle([...phaseData.days]));
  }, [phase]);

  /* ── auto-check after reorder ── */
  const checkOrder = useCallback((currentOrder: typeof ALL_DAYS) => {
    if (phaseCompletedRef.current) return;
    const correct = currentOrder.every((d, i) => d.name === phaseData.days[i].name);
    if (correct) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  }, [phaseData, onCorrect, onPhaseComplete]);

  /* ── get insert position from pointer Y ── */
  const getInsertPos = useCallback((clientY: number): number => {
    const rects = cardRefs.current.map(el => el?.getBoundingClientRect() ?? null);
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (!r) continue;
      if (clientY < r.top + r.height / 2) return i;
    }
    return rects.length;
  }, []);

  /* ── drag start ── */
  const startDrag = (e: React.PointerEvent, idx: number) => {
    if (phaseCompletedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = idx;
    setDraggingIdx(idx);
    setGhostPos({ x: e.clientX, y: e.clientY });
    setInsertPos(idx);

    const onMove = (ev: PointerEvent) => {
      setGhostPos({ x: ev.clientX, y: ev.clientY });
      setInsertPos(getInsertPos(ev.clientY));
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);

      const from = draggingRef.current!;
      const to   = getInsertPos(ev.clientY);

      draggingRef.current = null;
      setDraggingIdx(null);
      setGhostPos(null);
      setInsertPos(null);

      if (to === from || to === from + 1) return; /* no movement */

      setOrder(prev => {
        const next = [...prev];
        const [removed] = next.splice(from, 1);
        const insertAt  = to > from ? to - 1 : to;
        next.splice(insertAt, 0, removed);
        /* auto-check with new order */
        setTimeout(() => checkOrder(next), 200);
        return next;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  };

  if (phaseComplete) {
    return (
      <GameShell title="Calendário Vivo" emoji="📅" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c4)" />
      </GameShell>
    );
  }

  const missingDayName = phaseData.missingIdx !== undefined ? ALL_DAYS[phaseData.missingIdx].name : null;
  const isDragging     = draggingIdx !== null;
  const draggedDay     = isDragging ? order[draggingIdx!] : null;

  return (
    <GameShell title="Calendário Vivo" emoji="📅" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Ghost — follows pointer */}
      {ghostPos && draggedDay && (
        <div style={{
          position: 'fixed',
          left: ghostPos.x - 140, top: ghostPos.y - CARD_H / 2,
          width: 280, height: CARD_H,
          background: '#fff', borderRadius: 14,
          border: `2.5px solid ${draggedDay.color}`,
          boxShadow: '0 10px 28px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
          zIndex: 9999, pointerEvents: 'none',
          transform: 'scale(1.06)',
        }}>
          <AppleEmoji emoji={draggedDay.emoji} size={28} />
          <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: draggedDay.color, flex: 1 }}>
            {draggedDay.name}
          </span>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', margin: 0 }}>
          {phaseData.label}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
          Arraste os cards para reordenar
        </p>
        {missingDayName && (
          <div style={{ marginTop: 8, background: '#FFF9C4', border: '2px dashed #F9A825', borderRadius: 12, padding: '6px 14px', display: 'inline-block' }}>
            <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#E65100' }}>
              ❓ Qual dia está faltando?
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: CARD_GAP }}>
        {order.map((day, idx) => {
          const isBeingDragged = isDragging && draggingIdx === idx;

          /* shift cards to visually preview insert position */
          let extraTop = 0;
          if (isDragging && insertPos !== null && draggingIdx !== null) {
            if (insertPos <= idx && draggingIdx > idx) extraTop = CARD_H + CARD_GAP;
            if (insertPos > idx && draggingIdx < idx) extraTop = -(CARD_H + CARD_GAP);
          }

          return (
            <div key={day.name} style={{ position: 'relative' }}>
              {/* insert indicator line — above this card */}
              {isDragging && insertPos === idx && (
                <div style={{
                  height: 3, borderRadius: 2, marginBottom: 4,
                  background: 'var(--c4)',
                  animation: 'insertPulse 0.6s ease-in-out infinite',
                }} />
              )}

              <div
                ref={el => { cardRefs.current[idx] = el; }}
                onPointerDown={e => startDrag(e, idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isBeingDragged ? 'var(--bg)' : '#fff',
                  borderRadius: 14,
                  padding: `9px 12px`,
                  border: isBeingDragged
                    ? `2px dashed ${day.color}88`
                    : `2px solid ${day.color}44`,
                  opacity: isBeingDragged ? 0.35 : 1,
                  cursor: 'grab',
                  touchAction: 'none', userSelect: 'none',
                  transform: `translateY(${extraTop}px)`,
                  transition: isDragging && !isBeingDragged ? 'transform 0.15s ease' : 'none',
                  boxShadow: isBeingDragged ? 'none' : '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--text3)', width: 20 }}>
                  {idx + 1}.
                </span>
                <AppleEmoji emoji={day.emoji} size={28} />
                <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, flex: 1, color: day.color }}>
                  {day.name}
                </span>
                {/* drag handle */}
                <span style={{ color: '#ccc', fontSize: 16, letterSpacing: 1 }}>⠿</span>
              </div>

              {/* insert indicator line — after last card */}
              {isDragging && insertPos === order.length && idx === order.length - 1 && (
                <div style={{
                  height: 3, borderRadius: 2, marginTop: 4,
                  background: 'var(--c4)',
                  animation: 'insertPulse 0.6s ease-in-out infinite',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes insertPulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>
    </GameShell>
  );
}
