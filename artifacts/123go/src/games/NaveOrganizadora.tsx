import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

/* ── Items to sort ───────────────────────────────────────────────────────── */
const ITEMS = [
  { emoji: '⭐', color: 'yellow', shape: 'circle', id: 'i1' },
  { emoji: '🟢', color: 'green',  shape: 'circle', id: 'i2' },
  { emoji: '🤖', color: 'blue',   shape: 'square', id: 'i3' },
  { emoji: '🔵', color: 'blue',   shape: 'circle', id: 'i4' },
  { emoji: '👻', color: 'white',  shape: 'circle', id: 'i5' },
  { emoji: '🟡', color: 'yellow', shape: 'circle', id: 'i6' },
  { emoji: '🎁', color: 'yellow', shape: 'square', id: 'i7' }, // fase 2
  { emoji: '🍬', color: 'green',  shape: 'circle', id: 'i8' }, // fase 2
  { emoji: '☀️', color: 'blue',   shape: 'circle', id: 'i9' }, // fase 2
  { emoji: '🌿', color: 'green',  shape: 'circle', id: 'i10' }, // fase 4
];

type Item = typeof ITEMS[0];

/* ── Phase definitions ───────────────────────────────────────────────────── */
const PHASES = [
  {
    label: 'Organize por COR!',
    compartments: [
      { key: 'yellow', label: '🟡 Amarelo', color: '#F59E0B' },
      { key: 'blue',   label: '🔵 Azul',    color: '#2196F3' },
      { key: 'white',  label: '⚪ Branco',  color: '#9E9E9E' },
    ],
    getAttr: (a: Item) => a.color,
    items: [ITEMS[0], ITEMS[2], ITEMS[3], ITEMS[4], ITEMS[5]], // ⭐ 🤖 🔵 👻 🟡
  },
  {
    label: 'Organize por FORMA!',
    compartments: [
      { key: 'circle', label: '⭕ Círculo',  color: '#E91E8C' },
      { key: 'square', label: '⬛ Quadrado', color: '#5B4FCF' },
    ],
    getAttr: (a: Item) => a.shape,
    items: [ITEMS[6], ITEMS[7], ITEMS[2], ITEMS[8]], // 🎁 🍬 🤖 ☀️
  },
  {
    label: 'Organize por COR!',
    compartments: [
      { key: 'yellow', label: '🟡 Amarelo', color: '#F59E0B' },
      { key: 'blue',   label: '🔵 Azul',    color: '#2196F3' },
    ],
    getAttr: (a: Item) => a.color,
    items: [ITEMS[0], ITEMS[2], ITEMS[3], ITEMS[5]], // ⭐ 🤖 🔵 🟡
  },
  {
    label: 'Organize por COR!',
    compartments: [
      { key: 'yellow', label: '🟡 Amarelo', color: '#F59E0B' },
      { key: 'blue',   label: '🔵 Azul',    color: '#2196F3' },
      { key: 'green',  label: '🟢 Verde',   color: '#4CAF50' },
    ],
    getAttr: (a: Item) => a.color,
    items: [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3], ITEMS[5], ITEMS[9]], // ⭐ 🟢 🤖 🔵 🟡 🌿
  },
  {
    label: 'Compartimento misterioso — descubra o padrão!',
    compartments: [
      { key: 'circle', label: '?', color: '#9C27B0' },
      { key: 'square', label: '?', color: '#FF5722' },
    ],
    getAttr: (a: Item) => a.shape,
    items: [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]], // ⭐ 🟢 🤖 🔵
  },
];

export function NaveOrganizadora() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);

  const [placed,       setPlaced]       = useState<Record<string, string[]>>({});
  const [feedback,     setFeedback]     = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  /* drag state */
  const [draggingItem, setDraggingItem] = useState<Item | null>(null);
  const [ghostPos,     setGhostPos]     = useState<{ x: number; y: number } | null>(null);
  const [hoveredComp,  setHoveredComp]  = useState<string | null>(null);

  const draggingRef       = useRef<Item | null>(null);
  const compRefs          = useRef<Record<string, HTMLDivElement | null>>({});
  const phaseCompletedRef = useRef(false);
  const correctRef        = useRef(0);

  const phaseData = PHASES[phase - 1];
  const isMystery = phase === 5;
  const mysteryHints: Record<string, string> = { circle: '⭕ Círculo', square: '⬛ Quadrado' };

  /* ── Reset on phase change ── */
  useEffect(() => {
    phaseCompletedRef.current = false;
    correctRef.current = 0;
    setPlaced({});
    setFeedback(null);
    setDraggingItem(null);
    setGhostPos(null);
    setHoveredComp(null);
    setCorrectCount(0);
    compRefs.current = {};
  }, [phase]);

  const allPlacedIds = Object.values(placed).flat();
  const remaining    = phaseData.items.filter(a => !allPlacedIds.includes(a.id));

  /* ── Completion effect — BEFORE phase reset effect ── */
  useEffect(() => {
    if (remaining.length === 0 && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [remaining.length, onCorrect, onPhaseComplete]);

  /* ── Drag helpers ── */
  const getHoveredComp = (x: number, y: number): string | null => {
    for (const [key, el] of Object.entries(compRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return key;
    }
    return null;
  };

  const handleDrop = (compKey: string, item: Item) => {
    const correct = phaseData.getAttr(item) === compKey;
    if (correct) {
      setPlaced(prev => ({ ...prev, [compKey]: [...(prev[compKey] || []), item.id] }));
      const nc = correctRef.current + 1;
      correctRef.current = nc;
      setCorrectCount(nc);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const startDrag = (e: React.PointerEvent, item: Item) => {
    if (phaseCompletedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = item;
    setDraggingItem(item);
    setGhostPos({ x: e.clientX, y: e.clientY });

    const onMove = (ev: PointerEvent) => {
      setGhostPos({ x: ev.clientX, y: ev.clientY });
      setHoveredComp(getHoveredComp(ev.clientX, ev.clientY));
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);

      const comp = getHoveredComp(ev.clientX, ev.clientY);
      const item = draggingRef.current;
      draggingRef.current = null;
      setDraggingItem(null);
      setGhostPos(null);
      setHoveredComp(null);

      if (comp && item) handleDrop(comp, item);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  };

  if (phaseComplete) {
    return (
      <GameShell title="Nave Organizadora" emoji="🚀" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Nave Organizadora" emoji="🚀" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Drag ghost */}
      {ghostPos && draggingItem && (
        <div style={{
          position: 'fixed',
          left: ghostPos.x - 34, top: ghostPos.y - 34,
          width: 68, height: 68,
          background: '#fff', borderRadius: 16,
          border: '3px solid var(--c2)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, pointerEvents: 'none',
          transform: 'scale(1.12)',
        }}>
          <AppleEmoji emoji={draggingItem.emoji} size={44} />
        </div>
      )}

      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, textAlign: 'center', marginBottom: 6, color: 'var(--text)' }}>
        {phaseData.label}
      </h2>

      {isMystery && correctCount >= 2 && (
        <p style={{ textAlign: 'center', color: '#9C27B0', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
          💡 Dica: gaveta = {correctCount >= 4 ? 'formato dos itens!' : 'o formato de cada item?'}
        </p>
      )}

      {/* Items to drag */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
        padding: 14, marginBottom: 18,
        display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', minHeight: 72,
      }}>
        {remaining.map(item => {
          const isDraggingMe = draggingItem?.id === item.id;
          return (
            <div
              key={item.id}
              onPointerDown={e => startDrag(e, item)}
              style={{
                width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'grab', background: 'var(--bg)',
                borderRadius: 14, border: '2.5px solid var(--border)',
                opacity: isDraggingMe ? 0.3 : 1,
                transform: isDraggingMe ? 'scale(0.9) translateZ(0)' : 'scale(1) translateZ(0)',
                transition: 'opacity 0.15s, transform 0.15s',
                touchAction: 'none', userSelect: 'none',
                boxShadow: isDraggingMe ? 'none' : '0 2px 8px rgba(0,0,0,0.07)',
              }}
            >
              <AppleEmoji emoji={item.emoji} size={40} />
            </div>
          );
        })}
        {remaining.length === 0 && (
          <p style={{ color: 'var(--c5)', fontWeight: 700, margin: 'auto' }}>✅ Todos organizados!</p>
        )}
      </div>

      {/* Drop compartments */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {phaseData.compartments.map(comp => {
          const isHovered = hoveredComp === comp.key;
          const hint      = isMystery && correctCount >= 2 ? mysteryHints[comp.key] : null;
          return (
            <div
              key={comp.key}
              ref={el => { compRefs.current[comp.key] = el; }}
              style={{
                flex: 1, minWidth: 88, padding: 10, borderRadius: 16,
                border: `3px solid ${isHovered ? comp.color : `${comp.color}66`}`,
                background: isHovered ? `${comp.color}28` : `${comp.color}0D`,
                minHeight: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: draggingItem ? 'copy' : 'default',
                transition: 'all 0.15s',
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isHovered ? `0 0 14px ${comp.color}66` : 'none',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: comp.color, textAlign: 'center' }}>
                {hint ?? comp.label}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                {(placed[comp.key] || []).map((id, i) => {
                  const item = ITEMS.find(a => a.id === id);
                  return item ? <AppleEmoji key={i} emoji={item.emoji} size={28} /> : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </GameShell>
  );
}
