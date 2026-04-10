import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

const PHASES = [
  { target: 3, max: 5,  label: 'Arraste 3 folhas para a lagarta!', groupSize: 1 },
  { target: 7, max: 10, label: 'Arraste 7 folhas para a lagarta!', groupSize: 1 },
  { target: 5, max: 8,  label: 'Coloque folhas na lagarta (grupos de 2)!', groupSize: 2 },
  { target: 6, max: 10, label: 'Rápido! Dê 6 folhas à lagarta!', groupSize: 1 },
  { target: 8, max: 12, label: 'Arraste folhas para a lagarta (grupos de 3)!', groupSize: 3 },
];

const LEAF_COLORS = ['#5CAD3C', '#8BC34A', '#4CAF50', '#66BB6A', '#81C784', '#3E9642', '#69BD45', '#A5D6A7',
  '#5CAD3C', '#8BC34A', '#4CAF50', '#66BB6A'];

function getPositions(count: number, maxX = 220, maxY = 120): { x: number; y: number }[] {
  const MIN_DIST = 72;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    let pos = { x: 0, y: 0 };
    let attempts = 0;
    do {
      pos = { x: 36 + Math.random() * maxX, y: 24 + Math.random() * maxY };
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
  const isDesktop = useIsDesktop();
  const [collected, setCollected]       = useState(0);
  const [feedback, setFeedback]         = useState<'correct' | 'wrong' | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [phaseReady, setPhaseReady]     = useState(false);
  const [positions, setPositions]       = useState<{ x: number; y: number }[]>([]);
  const [collectedIds, setCollectedIds] = useState<Set<number>>(new Set());
  const [draggingId, setDraggingId]     = useState<number | null>(null);
  const [pointerDrag, setPointerDrag]   = useState<PointerDrag | null>(null);

  const phaseCompletedRef = useRef(false);
  const collectedRef      = useRef(0);
  const pointerDragRef    = useRef<PointerDrag | null>(null);
  const dropZoneRef       = useRef<HTMLDivElement>(null);
  const collectedIdsRef   = useRef<Set<number>>(new Set());
  const phaseData = PHASES[phase - 1];

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
    setPositions(getPositions(phaseData.max, isDesktop ? 380 : 220, isDesktop ? 200 : 120));
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

  // ── Pointer-based drag only ───────────────────────────────────────────────

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

    // Only collect if the pointer actually moved (drag gesture) AND released over the drop zone
    const moved = Math.hypot(e.clientX - startX, e.clientY - startY) > 8;
    if (moved && dropZoneRef.current) {
      const r = dropZoneRef.current.getBoundingClientRect();
      const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (over) collectLeaf(id);
    }
    // No tap/click fallback — drag-to-drop only
  }, [collectLeaf]);

  const onContainerPointerLeave = useCallback(() => {
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

      {/* Floating ghost leaf following the pointer while dragging */}
      {pointerDrag && (
        <div style={{
          position: 'fixed',
          left: pointerDrag.ghostX - (isDesktop ? 27 : 41),
          top:  pointerDrag.ghostY - (isDesktop ? 27 : 41),
          width: isDesktop ? 54 : 82, height: isDesktop ? 54 : 82,
          borderRadius: isDesktop ? 14 : 20,
          background: LEAF_COLORS[pointerDrag.id % LEAF_COLORS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isDesktop ? 28 : 44, opacity: 0.88,
          pointerEvents: 'none', zIndex: 9999,
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
            marginBottom: 10, transition: 'all 0.2s ease',
            minHeight: isDesktop ? 200 : 110,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 5,
          }}
        >
          <div className={collected > 0 ? '' : 'game-character-idle'}>
            <AppleEmoji emoji="🐛" size={isDesktop ? 76 : 120} />
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 180 }}>
            {Array.from({ length: Math.min(collected, 12) }).map((_, i) => (
              <AppleEmoji key={i} emoji="🌿" size={isDesktop ? 16 : 22} />
            ))}
            {collected > 12 && <span style={{ fontSize: 11, color: 'var(--c5)', fontWeight: 700 }}>+{collected - 12}</span>}
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600, margin: 0 }}>
            {dragOver ? '🎯 Solte aqui!' : '⬆ Arraste as folhas até aqui'}
          </p>
        </div>

        {/* Leaves area */}
        <div style={{ position: 'relative', minHeight: isDesktop ? 280 : 170, background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
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
            const leafSize = isDesktop ? 52 : 82;
            return (
              <div
                key={id}
                onPointerDown={e => onLeafPointerDown(id, e)}
                style={{
                  position: 'absolute', left: pos.x, top: pos.y,
                  width: leafSize, height: leafSize, borderRadius: isDesktop ? 14 : 20,
                  background: LEAF_COLORS[id % LEAF_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isDesktop ? 28 : 44,
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