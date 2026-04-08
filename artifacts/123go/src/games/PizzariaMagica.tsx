import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { theme: '🍕', name: 'Pizza',      need: 4,  total: 7  },
  { theme: '🥪', name: 'Sanduíche',  need: 6,  total: 9  },
  { theme: '🍦', name: 'Sorvete',    need: 5,  total: 8  },
  { theme: '🍫', name: 'Brigadeiro', need: 7,  total: 11 },
  { theme: '🎂', name: 'Bolo',       need: 8,  total: 12 },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x80000000;
  };
}

/* Generate non-overlapping positions in the top zone (0–60% vertical) */
function generatePositions(count: number, seed: number): { left: number; top: number }[] {
  const rand = seededRandom(seed);
  const positions: { left: number; top: number }[] = [];
  const MIN_DIST = 18; // % distance threshold
  let attempts = 0;
  while (positions.length < count && attempts < 500) {
    const left = 6 + rand() * 76;   // 6–82%
    const top  = 5 + rand() * 52;   // 5–57%
    const tooClose = positions.some(p =>
      Math.abs(p.left - left) < MIN_DIST && Math.abs(p.top - top) < MIN_DIST
    );
    if (!tooClose) positions.push({ left, top });
    attempts++;
  }
  // fallback: grid if too many collisions
  while (positions.length < count) {
    const idx  = positions.length;
    const cols = 4;
    positions.push({
      left: 10 + (idx % cols) * 22,
      top:  10 + Math.floor(idx / cols) * 22,
    });
  }
  return positions;
}

export function PizzariaMagica() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);

  const [placedSet, setPlacedSet] = useState<Set<number>>(new Set());
  const [feedback,  setFeedback]  = useState<'correct' | 'wrong' | null>(null);
  const [dragging,  setDragging]  = useState<number | null>(null);
  const [dragPos,   setDragPos]   = useState<{ x: number; y: number } | null>(null);
  const [isOver,    setIsOver]    = useState(false);

  const phaseCompletedRef = useRef(false);
  const draggingRef       = useRef<number | null>(null);
  const plateRef          = useRef<HTMLDivElement>(null);

  const phaseData = PHASES[phase - 1];
  const { theme, need: target, total } = phaseData;
  const placed = placedSet.size;

  const itemPositions = useMemo(
    () => generatePositions(total, phase * 997 + total * 31),
    [phase, total]
  );

  /* Completion effect first (sees phaseCompletedRef=true from prev phase) */
  useEffect(() => {
    if (placed >= target && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [placed, target, onCorrect, onPhaseComplete]);

  /* Reset after phase changes */
  useEffect(() => {
    phaseCompletedRef.current = false;
    setPlacedSet(new Set());
    setFeedback(null);
    setDragging(null);
    setDragPos(null);
    setIsOver(false);
    draggingRef.current = null;
  }, [phase]);

  const checkDrop = useCallback((x: number, y: number, idx: number) => {
    const plate = plateRef.current;
    if (!plate || placedSet.has(idx) || phaseCompletedRef.current) return;
    const r   = plate.getBoundingClientRect();
    const hit = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    if (hit) setPlacedSet(prev => { const n = new Set(prev); n.add(idx); return n; });
  }, [placedSet]);

  /* Global pointer listeners */
  useEffect(() => {
    if (dragging === null) return;
    const onMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });
      const plate = plateRef.current;
      if (plate) {
        const r = plate.getBoundingClientRect();
        setIsOver(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
      }
    };
    const onUp = (e: PointerEvent) => {
      const idx = draggingRef.current;
      if (idx !== null) checkDrop(e.clientX, e.clientY, idx);
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

  const startDrag = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = idx;
    setDragging(idx);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  if (phaseComplete) {
    return (
      <GameShell title="Restaurante Mágico" emoji="🍴" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  const pct = Math.min((placed / target) * 100, 100);

  return (
    <GameShell title="Restaurante Mágico" emoji="🍴" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Drag ghost */}
      {dragging !== null && dragPos && (
        <div style={{
          position: 'fixed',
          left: dragPos.x - 28, top: dragPos.y - 28,
          pointerEvents: 'none', zIndex: 9999,
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
          transform: 'scale(1.15)',
        }}>
          <AppleEmoji emoji={theme} size={56} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* Scattered food area + plate — relative container */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>

          {/* Scattered food items */}
          {itemPositions.map((pos, i) => {
            const isPlaced    = placedSet.has(i);
            const isDraggingMe = dragging === i;
            if (isPlaced) return null;
            return (
              <div
                key={i}
                onPointerDown={e => startDrag(e, i)}
                style={{
                  position: 'absolute',
                  left: `${pos.left}%`,
                  top:  `${pos.top}%`,
                  marginLeft: -28, marginTop: -28,
                  cursor: 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                  opacity: isDraggingMe ? 0.25 : 1,
                  transition: 'opacity 0.15s',
                  filter: 'drop-shadow(2px 3px 6px rgba(0,0,0,0.18))',
                  zIndex: isDraggingMe ? 0 : 2,
                }}
              >
                <AppleEmoji emoji={theme} size={52} />
              </div>
            );
          })}

          {/* Plate — centered in the bottom 40% */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingBottom: 8,
          }}>
            {/* Portion counter */}
            <div style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 20,
              color: placed >= target ? '#10B981' : 'var(--c1)',
              marginBottom: 4, transition: 'color 0.3s',
            }}>
              {placed} / {target} porções
            </div>

            {/* Progress arc */}
            <div style={{
              width: 180, height: 8, background: '#F0F0F0',
              borderRadius: 8, overflow: 'hidden', marginBottom: 10,
            }}>
              <div style={{
                height: '100%', borderRadius: 8,
                background: placed >= target ? '#10B981' : 'var(--c1)',
                width: `${pct}%`,
                transition: 'width 0.4s ease, background 0.3s',
              }} />
            </div>

            {/* Plate drop zone */}
            <div
              ref={plateRef}
              style={{
                width: 150, height: 150, borderRadius: '50%',
                background: isOver ? '#FFF0E5' : '#FAFAFA',
                border: `4px ${isOver ? 'solid' : 'dashed'} ${isOver ? 'var(--c1)' : '#D1D5DB'}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: isOver ? '0 0 0 6px rgba(255,100,0,0.15)' : '0 2px 12px rgba(0,0,0,0.08)',
                zIndex: 3, position: 'relative',
              }}
            >
              <AppleEmoji emoji="🍽️" size={72} style={{ opacity: isOver ? 0.9 : 0.7 }} />
            </div>

            <p style={{ color: 'var(--text3)', fontSize: 11, marginTop: 6 }}>
              Arraste as porções até aqui
            </p>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
