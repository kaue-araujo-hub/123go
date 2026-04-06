import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { target: 3, max: 5,  label: 'Arraste 3 folhas para a lagarta!', groupSize: 1 },
  { target: 7, max: 10, label: 'Arraste 7 folhas para a lagarta!', groupSize: 1 },
  { target: 5, max: 8,  label: 'Coloque folhas na lagarta (grupos de 2)!', groupSize: 2 },
  { target: 6, max: 10, label: 'Rápido! Dê 6 folhas à lagarta!', groupSize: 1 },
  { target: 8, max: 12, label: 'Arraste folhas para a lagarta (grupos de 3)!', groupSize: 3 },
];

const LEAF_COLORS = ['#5CAD3C', '#8BC34A', '#4CAF50', '#66BB6A', '#81C784', '#3E9642', '#69BD45', '#A5D6A7',
  '#5CAD3C', '#8BC34A', '#4CAF50', '#66BB6A'];

function getPositions(count: number): { x: number; y: number }[] {
  const MIN_DIST = 72;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    let pos = { x: 0, y: 0 };
    let attempts = 0;
    do {
      pos = { x: 36 + Math.random() * 220, y: 24 + Math.random() * 120 };
      attempts++;
    } while (attempts < 60 && positions.some(p => Math.hypot(p.x - pos.x, p.y - pos.y) < MIN_DIST));
    positions.push(pos);
  }
  return positions;
}

interface PointerDrag {
  id: number;
  ghostX: number;
  ghostY: number;
  startX: number;
  startY: number;
}

export function FestaDaLagarta() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [collected, setCollected]     = useState(0);
  const [feedback, setFeedback]       = useState<'correct' | 'wrong' | null>(null);
  const [dragOver, setDragOver]       = useState(false);
  const [phaseReady, setPhaseReady]   = useState(false);
  const [positions, setPositions]     = useState<{ x: number; y: number }[]>([]);
  const [collectedIds, setCollectedIds] = useState<Set<number>>(new Set());
  const [draggingId, setDraggingId]   = useState<number | null>(null);
  const [pointerDrag, setPointerDrag] = useState<PointerDrag | null>(null);

  const phaseCompletedRef = useRef(false);
  const collectedRef      = useRef(0);
  const pointerDragRef    = useRef<PointerDrag | null>(null);
  const dropZoneRef       = useRef<HTMLDivElement>(null);
  const collectedIdsRef   = useRef<Set<number>>(new Set());
  const phaseData = PHASES[phase - 1];

  // Keep ref in sync with state
  useEffect(() => { collectedIdsRef.current = collectedIds; }, [collectedIds]);

  useEffect(() => {
    phaseCompletedRef.current = false;
    collectedRef.current = 0;
    setCollected(0);
    setFeedback(null);
    setDragOver(false);
    setPhaseReady(false);
    setCollectedIds(new Set());
    setDraggingId(null);
    setPointerDrag(null);
    pointerDragRef.current = null;
    setPositions(getPositions(phaseData.max));
    const t = setTimeout(() => setPhaseReady(true), 300);
    return () => clearTimeout(t);
  }, [phase]);

  const handleCollect = useCallback(() => {
    if (!phaseReady || phaseCompletedRef.current) return;
    const next = collectedRef.current + 1;
    collectedRef.current = next;
    setCollected(next);
    onCorrect();
    if (next >= phaseData.target) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 900);
    }
  }, [phaseReady, phaseData.target, onCorrect, onPhaseComplete]);

  const collectLeaf = useCallback((id: number) => {
    if (phaseCompletedRef.current || collectedIdsRef.current.has(id)) return;
    setCollectedIds(prev => { const n = new Set(prev); n.add(id); return n; });
    handleCollect();
  }, [handleCollect]);

  // ── Pointer-based drag ────────────────────────────────────────────────────

  const onLeafPointerDown = useCallback((id: number, e: React.PointerEvent) => {
    if (!phaseReady || phaseCompletedRef.current || collectedIdsRef.current.has(id)) return;
    e.preventDefault();
    e.stopPropagation();
    const drag: PointerDrag = { id, ghostX: e.clientX, ghostY: e.clientY, startX: e.clientX, startY: e.clientY };
    pointerDragRef.current = drag;
    setPointerDrag(drag);
    setDraggingId(id);
  }, [phaseReady]);

  const onContainerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerDragRef.current) return;
    const updated = { ...pointerDragRef.current, ghostX: e.clientX, ghostY: e.clientY };
    pointerDragRef.current = updated;
    setPointerDrag(updated);

    if (dropZoneRef.current) {
      const r = dropZoneRef.current.getBoundingClientRect();
      setDragOver(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
    }
  }, []);

  const onContainerPointerUp = useCallback((e: React.PointerEvent) => {
    if (!pointerDragRef.current) return;
    const { id, startX, startY } = pointerDragRef.current;
    pointerDragRef.current = null;
    setPointerDrag(null);
    setDraggingId(null);
    setDragOver(false);

    const moved = Math.hypot(e.clientX - startX, e.clientY - startY) > 8;

    if (moved) {
      // Drag gesture — collect only if released over the drop zone
      if (dropZoneRef.current) {
        const r = dropZoneRef.current.getBoundingClientRect();
        const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (over) collectLeaf(id);
      }
    } else {
      // Tap gesture — collect directly
      collectLeaf(id);
    }
  }, [collectLeaf]);

  const onContainerPointerLeave = useCallback(() => {
    // If pointer leaves the game area while dragging, cancel the drag
    if (!pointerDragRef.current) return;
    pointerDragRef.current = null;
    setPointerDrag(null);
    setDraggingId(null);
    setDragOver(false);
  }, []);

  if (phaseComplete) {
    return (
      <GameShell title="Festa da Lagarta" emoji="🐛" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c5)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Festa da Lagarta" emoji="🐛" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Floating ghost leaf that follows the pointer while dragging */}
      {pointerDrag && (
        <div style={{
          position: 'fixed',
          left: pointerDrag.ghostX - 27,
          top:  pointerDrag.ghostY - 27,
          width: 54, height: 54, borderRadius: 14,
          background: LEAF_COLORS[pointerDrag.id % LEAF_COLORS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, opacity: 0.88, pointerEvents: 'none', zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.30)',
          transform: 'scale(1.18)',
        }}>🍃</div>
      )}

      {/* Outer container captures all pointer events for drag tracking */}
      <div
        onPointerMove={onContainerPointerMove}
        onPointerUp={onContainerPointerUp}
        onPointerLeave={onContainerPointerLeave}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: 0 }}>{phaseData.label}</p>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 8, height: 10, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--c5)', width: `${Math.min((collected / phaseData.target) * 100, 100)}%`, transition: 'width 0.3s ease', borderRadius: 8 }} />
        </div>

        {/* Drop zone — caterpillar */}
        <div
          ref={dropZoneRef}
          style={{
            background: dragOver ? '#D7F2D7' : '#F1F8E9',
            border: `3px dashed ${dragOver ? '#4CAF50' : '#A5D6A7'}`,
            borderRadius: 20, padding: '10px 12px', textAlign: 'center',
            marginBottom: 10, transition: 'all 0.2s ease', minHeight: 110,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 5,
          }}
        >
          <div className={collected > 0 ? '' : 'game-character-idle'}>
            <AppleEmoji emoji="🐛" size={76} />
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 180 }}>
            {Array.from({ length: Math.min(collected, 12) }).map((_, i) => (
              <AppleEmoji key={i} emoji="🌿" size={16} />
            ))}
            {collected > 12 && <span style={{ fontSize: 11, color: 'var(--c5)', fontWeight: 700 }}>+{collected - 12}</span>}
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600, margin: 0 }}>
            {dragOver ? '🎯 Solte aqui!' : 'Arraste folhas ou toque nelas'}
          </p>
        </div>

        {/* Leaves area */}
        <div style={{ position: 'relative', minHeight: 170, background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
          {!phaseReady && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text3)', fontSize: 13 }}>Preparando...</span>
            </div>
          )}
          {positions.length > 0 && Array.from({ length: phaseData.max }, (_, i) => i).filter(id => !collectedIds.has(id)).map(id => {
            const pos = positions[id] || { x: 30 + (id % 5) * 52, y: 30 };
            const dur = 2.4 + (id % 4) * 0.35;
            const del = -(id * 0.47 % dur);
            const isBeingDragged = id === draggingId;
            return (
              <div
                key={id}
                onPointerDown={e => onLeafPointerDown(id, e)}
                style={{
                  position: 'absolute', left: pos.x, top: pos.y,
                  width: 54, height: 54, borderRadius: 14,
                  background: LEAF_COLORS[id % LEAF_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                  cursor: phaseReady ? 'grab' : 'default',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                  opacity: isBeingDragged ? 0 : phaseReady ? 1 : 0.5,
                  touchAction: 'none', userSelect: 'none',
                  transition: 'opacity 0.1s',
                  animation: phaseReady && !isBeingDragged
                    ? `leafSway ${dur}s ${del}s ease-in-out infinite`
                    : undefined,
                }}
              >
                🍃
              </div>
            );
          })}
        </div>

        {phaseData.groupSize > 1 && (
          <p style={{ textAlign: 'center', color: 'var(--c5)', fontSize: 12, fontWeight: 700, marginTop: 6 }}>
            ✋ Agrupe de {phaseData.groupSize} em {phaseData.groupSize}!
          </p>
        )}
      </div>

      <style>{`
        @keyframes leafSway {
          0%   { transform: translateX(0)    rotate(0deg);  }
          25%  { transform: translateX(9px)  rotate(4deg);  }
          75%  { transform: translateX(-9px) rotate(-4deg); }
          100% { transform: translateX(0)    rotate(0deg);  }
        }
      `}</style>
    </GameShell>
  );
}
