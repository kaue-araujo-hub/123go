import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

/* ── Phase definitions ───────────────────────────────────────────────────────
   nexts: array of correct answers for each empty slot (in order)
   options: draggable bank of tiles (reusable, includes correct + distractors)
   Tile counts: ph1=1 slot, ph2=2, ph3=3, ph4=3, ph5=4
────────────────────────────────────────────────────────────────────────── */
const PHASES = [
  {
    label: 'Qual é o próximo?',
    pattern: ['🌹', '🌼', '🌹', '🌼', '🌹'],
    nexts:   ['🌼'],
    options: ['🌹', '🌼', '🌸'],
  },
  {
    label: 'Qual é o próximo?',
    pattern: ['🌹', '🌼', '🌸', '🌹'],
    nexts:   ['🌼', '🌸'],
    options: ['🌼', '🌸', '🌺'],
  },
  {
    label: 'Qual é o próximo?',
    pattern: ['🐜', '🐞', '🐜', '🐞'],
    nexts:   ['🐜', '🐞', '🐜'],
    options: ['🐜', '🐞', '🐌'],
  },
  {
    label: 'Qual é o próximo?',
    pattern: ['🌸', '🌺', '🌸', '🌺'],
    nexts:   ['🌸', '🌺', '🌸'],
    options: ['🌸', '🌺', '🌻'],
  },
  {
    label: 'Qual é o próximo?',
    pattern: ['🦋', '🐝', '🦋'],
    nexts:   ['🐝', '🦋', '🐝', '🦋'],
    options: ['🦋', '🐝', '🐛'],
  },
];

export function JardimPadroes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [feedback,     setFeedback]     = useState<'correct' | 'wrong' | null>(null);
  const [filled,       setFilled]       = useState<Record<number, string>>({}); // slotIdx → emoji
  const [draggingOpt,  setDraggingOpt]  = useState<string | null>(null);
  const [ghostPos,     setGhostPos]     = useState<{ x: number; y: number } | null>(null);
  const [hoveredSlot,  setHoveredSlot]  = useState<number | null>(null);

  const draggingRef       = useRef<string | null>(null);
  const slotRefs          = useRef<(HTMLDivElement | null)[]>([]);
  const phaseCompletedRef = useRef(false);

  const phaseData = PHASES[phase - 1];

  /* tile size: desktop = ~1.7× mobile */
  const totalItems = phaseData.pattern.length + phaseData.nexts.length;
  const tileSize   = isDesktop
    ? (totalItems <= 6 ? 54 : 42)
    : (totalItems <= 6 ? 62 : 52);
  const emojiSize  = tileSize - 18;

  /* ── 1. completion — must be BEFORE the phase-reset effect ── */
  useEffect(() => {
    if (
      Object.keys(filled).length === phaseData.nexts.length &&
      phaseData.nexts.length > 0 &&
      !phaseCompletedRef.current
    ) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 900);
    }
  }, [filled, phaseData.nexts.length, onCorrect, onPhaseComplete]);

  /* ── 2. phase reset — declared AFTER completion effect ── */
  useEffect(() => {
    phaseCompletedRef.current = false;
    setFilled({});
    setFeedback(null);
    setDraggingOpt(null);
    setGhostPos(null);
    setHoveredSlot(null);
    slotRefs.current = [];
  }, [phase]);

  /* ── helpers ── */
  const getHoveredSlot = (x: number, y: number): number | null => {
    for (let i = 0; i < slotRefs.current.length; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    return null;
  };

  const handleDrop = (slotIdx: number, emoji: string) => {
    if (filled[slotIdx] !== undefined || phaseCompletedRef.current) return;
    if (emoji === phaseData.nexts[slotIdx]) {
      setFilled(prev => ({ ...prev, [slotIdx]: emoji }));
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  /* ── drag ── */
  const startDrag = (e: React.PointerEvent, opt: string) => {
    if (phaseCompletedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = opt;
    setDraggingOpt(opt);
    setGhostPos({ x: e.clientX, y: e.clientY });

    const onMove = (ev: PointerEvent) => {
      setGhostPos({ x: ev.clientX, y: ev.clientY });
      setHoveredSlot(getHoveredSlot(ev.clientX, ev.clientY));
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);

      const slot = getHoveredSlot(ev.clientX, ev.clientY);
      const opt  = draggingRef.current;
      draggingRef.current = null;
      setDraggingOpt(null);
      setGhostPos(null);
      setHoveredSlot(null);

      if (slot !== null && opt !== null) {
        handleDrop(slot, opt);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  };

  if (phaseComplete) {
    return (
      <GameShell title="Jardim de Padrões" emoji="🌸" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  const allFilled = Object.keys(filled).length === phaseData.nexts.length;

  return (
    <GameShell title="Jardim de Padrões" emoji="🌸" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Ghost */}
      {ghostPos && draggingOpt && (
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
          <AppleEmoji emoji={draggingOpt} size={44} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', margin: 0 }}>
          {phaseData.label}
        </h2>
      </div>

      {/* Pattern + slots row */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
        padding: 14, marginBottom: isDesktop ? 20 : 28,
        display: 'flex', alignItems: 'center',
        gap: isDesktop ? (totalItems <= 6 ? 16 : 12) : (totalItems <= 6 ? 8 : 6),
        justifyContent: 'center',
        flexWrap: 'nowrap',
      }}>
        {/* Fixed pattern items */}
        {phaseData.pattern.map((item, i) => (
          <div key={`p-${i}`} style={{
            width: tileSize, height: tileSize, borderRadius: 12,
            background: 'var(--bg)', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AppleEmoji emoji={item} size={emojiSize} />
          </div>
        ))}

        {/* Drop slots */}
        {phaseData.nexts.map((expected, i) => {
          const isFilled   = filled[i] !== undefined;
          const isHovered  = hoveredSlot === i && !isFilled;
          return (
            <div
              key={`s-${i}`}
              ref={el => { slotRefs.current[i] = el; }}
              style={{
                width: tileSize + 4, height: tileSize + 4,
                borderRadius: 13, flexShrink: 0,
                background: isFilled
                  ? '#E8F5E9'
                  : isHovered
                    ? 'rgba(245,158,11,0.12)'
                    : 'var(--bg)',
                border: isFilled
                  ? '3px solid #4CAF50'
                  : isHovered
                    ? '3px solid var(--c2)'
                    : '3px dashed var(--c2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border 0.15s, background 0.15s, transform 0.15s',
                transform: isHovered ? 'scale(1.1)' : isFilled ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isHovered ? '0 0 12px rgba(245,158,11,0.4)' : 'none',
                animation: isFilled || draggingOpt ? 'none' : `vasoPulse 1.4s ease-in-out ${i * 0.18}s infinite`,
              }}
            >
              {isFilled
                ? <AppleEmoji emoji={filled[i]} size={emojiSize} />
                : <span style={{
                    fontSize: tileSize <= 46 ? 18 : 22,
                    color: isHovered ? 'var(--c2)' : 'rgba(0,0,0,0.28)',
                    fontWeight: 900, fontFamily: 'Nunito',
                    transition: 'color 0.15s',
                  }}>?</span>
              }
            </div>
          );
        })}
      </div>

      {/* Draggable options bank */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {phaseData.options.map(opt => {
          const isDraggingMe = draggingOpt === opt;
          const optSize = isDesktop ? 80 : 90;
          const optEmoji = isDesktop ? 50 : 54;
          return (
            <div
              key={opt}
              onPointerDown={e => startDrag(e, opt)}
              style={{
                width: optSize, height: optSize, borderRadius: isDesktop ? 18 : 22,
                border: '3px solid var(--border)',
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: allFilled ? 'default' : 'grab',
                touchAction: 'none', userSelect: 'none',
                opacity: isDraggingMe ? 0.3 : 1,
                transform: isDraggingMe ? 'scale(0.9)' : 'scale(1)',
                transition: 'opacity 0.15s, transform 0.15s',
                boxShadow: isDraggingMe ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <AppleEmoji emoji={opt} size={optEmoji} />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes vasoPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.97) translateZ(0); }
          50%       { opacity: 1;   transform: scale(1.06) translateZ(0); }
        }
      `}</style>
    </GameShell>
  );
}
