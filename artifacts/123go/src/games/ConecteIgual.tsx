import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

/* ── Fases ───────────────────────────────────────────────────────────────────── */
interface PhaseItem { id: string; emoji: string; color: string; }
interface PhaseConfig { pairs: [PhaseItem, PhaseItem][]; }

const PHASE_CONFIGS: PhaseConfig[] = [
  { pairs: [
    [{ id:'a1', emoji:'🟦', color:'#2196F3' }, { id:'b1', emoji:'🟦', color:'#2196F3' }],
    [{ id:'a2', emoji:'🟥', color:'#F44336' }, { id:'b2', emoji:'🟥', color:'#F44336' }],
    [{ id:'a3', emoji:'🟩', color:'#4CAF50' }, { id:'b3', emoji:'🟩', color:'#4CAF50' }],
  ]},
  { pairs: [
    [{ id:'a1', emoji:'⭐', color:'#FFC107' }, { id:'b1', emoji:'⭐', color:'#FFC107' }],
    [{ id:'a2', emoji:'❤️', color:'#E91E8C' }, { id:'b2', emoji:'❤️', color:'#E91E8C' }],
    [{ id:'a3', emoji:'🔷', color:'#2196F3' }, { id:'b3', emoji:'🔷', color:'#2196F3' }],
    [{ id:'a4', emoji:'🟪', color:'#9C27B0' }, { id:'b4', emoji:'🟪', color:'#9C27B0' }],
  ]},
  { pairs: [
    [{ id:'a1', emoji:'🐶', color:'#FF9800' }, { id:'b1', emoji:'🐶', color:'#FF9800' }],
    [{ id:'a2', emoji:'🐱', color:'#E91E8C' }, { id:'b2', emoji:'🐱', color:'#E91E8C' }],
    [{ id:'a3', emoji:'🐸', color:'#4CAF50' }, { id:'b3', emoji:'🐸', color:'#4CAF50' }],
  ]},
  { pairs: [
    [{ id:'a1', emoji:'🍎', color:'#F44336' }, { id:'b1', emoji:'🍎', color:'#F44336' }],
    [{ id:'a2', emoji:'🍋', color:'#FFC107' }, { id:'b2', emoji:'🍋', color:'#FFC107' }],
    [{ id:'a3', emoji:'🫐', color:'#5B4FCF' }, { id:'b3', emoji:'🫐', color:'#5B4FCF' }],
    [{ id:'a4', emoji:'🍇', color:'#9C27B0' }, { id:'b4', emoji:'🍇', color:'#9C27B0' }],
  ]},
  { pairs: [
    [{ id:'a1', emoji:'🌙', color:'#5B4FCF' }, { id:'b1', emoji:'🌙', color:'#5B4FCF' }],
    [{ id:'a2', emoji:'☀️', color:'#FFC107' }, { id:'b2', emoji:'☀️', color:'#FFC107' }],
    [{ id:'a3', emoji:'❄️', color:'#2196F3' }, { id:'b3', emoji:'❄️', color:'#2196F3' }],
    [{ id:'a4', emoji:'🌈', color:'#E91E8C' }, { id:'b4', emoji:'🌈', color:'#E91E8C' }],
  ]},
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Connection { leftId: string; rightId: string; color: string; }
interface DragLine { fromX: number; fromY: number; toX: number; toY: number; }

export function ConecteIgual() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);

  const [feedback,     setFeedback]     = useState<'correct' | 'wrong' | null>(null);
  const [connections,  setConnections]  = useState<Connection[]>([]);
  const [dragLine,     setDragLine]     = useState<DragLine | null>(null);
  const [dragFromId,   setDragFromId]   = useState<string | null>(null);
  const [dragFromSide, setDragFromSide] = useState<'left' | 'right' | null>(null);
  const [wrongFlash,   setWrongFlash]   = useState<string | null>(null);
  const [leftItems,    setLeftItems]    = useState<PhaseItem[]>([]);
  const [rightItems,   setRightItems]   = useState<PhaseItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs     = useRef<Record<string, HTMLDivElement | null>>({});
  const phaseCompletedRef = useRef(false);

  const phaseConfig = PHASE_CONFIGS[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setConnections([]);
    setDragLine(null);
    setDragFromId(null);
    setDragFromSide(null);
    setWrongFlash(null);
    setFeedback(null);
    setLeftItems(shuffle(phaseConfig.pairs.map(p => p[0])));
    setRightItems(shuffle(phaseConfig.pairs.map(p => p[1])));
    itemRefs.current = {};
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function getCenterOf(id: string): { x: number; y: number } | null {
    const el  = itemRefs.current[id];
    const box = containerRef.current;
    if (!el || !box) return null;
    const er = el.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    return { x: er.left - br.left + er.width / 2, y: er.top - br.top + er.height / 2 };
  }

  function isConnected(id: string) {
    return connections.some(c => c.leftId === id || c.rightId === id);
  }

  function findPairId(id: string): string {
    const pair = phaseConfig.pairs.find(p => p[0].id === id || p[1].id === id);
    if (!pair) return '';
    return pair[0].id === id ? pair[1].id : pair[0].id;
  }

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string, side: 'left' | 'right') => {
    if (isConnected(id)) return;
    const center = getCenterOf(id);
    if (!center) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragFromId(id);
    setDragFromSide(side);
    const box = containerRef.current!.getBoundingClientRect();
    setDragLine({ fromX: center.x, fromY: center.y, toX: e.clientX - box.left, toY: e.clientY - box.top });
  }, [connections]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragFromId || !containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    setDragLine(prev => prev ? { ...prev, toX: e.clientX - box.left, toY: e.clientY - box.top } : prev);
  }, [dragFromId]);

  const handlePointerUp = useCallback((e: React.PointerEvent, id: string, side: 'left' | 'right') => {
    if (!dragFromId || dragFromSide === side) { setDragLine(null); setDragFromId(null); setDragFromSide(null); return; }
    const expected = findPairId(dragFromId);
    if (id === expected) {
      const item = [...leftItems, ...rightItems].find(i => i.id === dragFromId || i.id === id)!;
      const newConn: Connection = {
        leftId:  side === 'right' ? dragFromId : id,
        rightId: side === 'right' ? id : dragFromId,
        color:   item.color,
      };
      const newConns = [...connections, newConn];
      setConnections(newConns);
      setFeedback('correct');
      onCorrect();
      setTimeout(() => setFeedback(null), 500);
      if (newConns.length === phaseConfig.pairs.length && !phaseCompletedRef.current) {
        phaseCompletedRef.current = true;
        setTimeout(() => onPhaseComplete(), 900);
      }
    } else {
      setWrongFlash(id);
      setFeedback('wrong');
      setTimeout(() => { setWrongFlash(null); setFeedback(null); }, 600);
    }
    setDragLine(null); setDragFromId(null); setDragFromSide(null);
  }, [dragFromId, dragFromSide, connections, phaseConfig.pairs.length, leftItems, rightItems, onCorrect, onPhaseComplete, findPairId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phaseComplete) {
    return (
      <GameShell title="Conecte o Igual" emoji="🔵" color="#E91E8C" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="#E91E8C" />
      </GameShell>
    );
  }

  function renderItem(item: PhaseItem, side: 'left' | 'right') {
    const conn   = connections.find(c => c.leftId === item.id || c.rightId === item.id);
    const linked = !!conn;
    const isWrong = wrongFlash === item.id;
    return (
      <div
        key={item.id}
        ref={el => { itemRefs.current[item.id] = el; }}
        onPointerDown={e => { if (!linked) handlePointerDown(e, item.id, side); }}
        onPointerMove={handlePointerMove}
        onPointerUp={e => { if (dragFromId && dragFromSide !== side) handlePointerUp(e, item.id, side); }}
        style={{
          width: 60, height: 60, borderRadius: 14,
          background: linked ? conn!.color + '22' : '#fff',
          border: `2.5px solid ${linked ? conn!.color : isWrong ? '#F44336' : '#E8E8F0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: linked ? 'default' : 'pointer',
          touchAction: 'none', userSelect: 'none',
          transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
          transform: linked ? 'scale(1.08) translateZ(0)' : isWrong ? 'scale(0.92) translateZ(0)' : 'scale(1) translateZ(0)',
          boxShadow: linked ? `0 0 12px ${conn!.color}44` : '0 2px 6px rgba(0,0,0,0.08)',
        }}
      >
        <AppleEmoji emoji={item.emoji} size={34} />
      </div>
    );
  }

  return (
    <GameShell title="Conecte o Igual" emoji="🔵" color="#E91E8C" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <p style={{
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 16,
        color: 'var(--text)', textAlign: 'center', marginBottom: 12,
      }}>
        Conecte as formas iguais! ({connections.length}/{phaseConfig.pairs.length})
      </p>

      <div
        ref={containerRef}
        style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0, userSelect: 'none', touchAction: 'none' }}
        onPointerMove={handlePointerMove}
      >
        {/* Coluna esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {leftItems.map(item => renderItem(item, 'left'))}
        </div>

        {/* SVG lines overlay */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
        >
          {connections.map(conn => {
            const lc = getCenterOf(conn.leftId);
            const rc = getCenterOf(conn.rightId);
            if (!lc || !rc) return null;
            return (
              <line
                key={`${conn.leftId}-${conn.rightId}`}
                x1={lc.x} y1={lc.y} x2={rc.x} y2={rc.y}
                stroke={conn.color} strokeWidth={4} strokeLinecap="round"
                opacity={0.75}
              />
            );
          })}
          {dragLine && (
            <line
              x1={dragLine.fromX} y1={dragLine.fromY}
              x2={dragLine.toX}   y2={dragLine.toY}
              stroke="#9CA3AF" strokeWidth={3} strokeDasharray="8 5"
              strokeLinecap="round" opacity={0.7}
            />
          )}
        </svg>

        {/* Coluna direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rightItems.map(item => renderItem(item, 'right'))}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 14 }}>
        Arraste de uma forma para a forma igual!
      </p>
    </GameShell>
  );
}
