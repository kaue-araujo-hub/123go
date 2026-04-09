import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

/* ── Fases ───────────────────────────────────────────────────────────────────── */
interface Pair { num: number; emoji: string; }
const PHASE_PAIRS: Pair[][] = [
  [{ num:1, emoji:'🍎' }, { num:2, emoji:'⭐' }, { num:3, emoji:'🐟' }],
  [{ num:2, emoji:'🌸' }, { num:4, emoji:'🍬' }, { num:3, emoji:'🐛' }],
  [{ num:3, emoji:'🍕' }, { num:5, emoji:'🌙' }, { num:2, emoji:'🏀' }, { num:4, emoji:'🍀' }],
  [{ num:4, emoji:'🦋' }, { num:6, emoji:'🍩' }, { num:3, emoji:'🌈' }, { num:5, emoji:'🐞' }],
  [{ num:5, emoji:'🍓' }, { num:7, emoji:'🌻' }, { num:4, emoji:'🎸' }, { num:6, emoji:'🦄' }],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Connection { num: number; emoji: string; }
interface DragLine { fromX: number; fromY: number; toX: number; toY: number; }

export function LigueNumero() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [feedback,    setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dragNum,     setDragNum]     = useState<number | null>(null);
  const [dragLine,    setDragLine]    = useState<DragLine | null>(null);
  const [wrongFlash,  setWrongFlash]  = useState<string | null>(null);
  const [shuffledNums,  setShuffledNums]  = useState<Pair[]>([]);
  const [shuffledGroups, setShuffledGroups] = useState<Pair[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs     = useRef<Record<string, HTMLDivElement | null>>({});
  const phaseCompletedRef = useRef(false);

  const pairs = PHASE_PAIRS[phase - 1];
  const LINE_COLORS = ['#5B4FCF', '#E91E8C', '#00B4D8', '#4CAF50', '#FF6B35', '#FFC107'];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setConnections([]);
    setDragLine(null);
    setDragNum(null);
    setWrongFlash(null);
    setFeedback(null);
    setShuffledNums(shuffle([...pairs]));
    setShuffledGroups(shuffle([...pairs]));
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

  function isNumConnected(num: number) { return connections.some(c => c.num === num); }
  function isEmojiConnected(emoji: string) { return connections.some(c => c.emoji === emoji); }

  const handleNumDown = useCallback((e: React.PointerEvent, num: number) => {
    if (isNumConnected(num)) return;
    const center = getCenterOf(`num-${num}`);
    if (!center) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const box = containerRef.current!.getBoundingClientRect();
    setDragNum(num);
    setDragLine({ fromX: center.x, fromY: center.y, toX: e.clientX - box.left, toY: e.clientY - box.top });
  }, [connections]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragNum === null || !containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    setDragLine(prev => prev ? { ...prev, toX: e.clientX - box.left, toY: e.clientY - box.top } : prev);
  }, [dragNum]);

  const handleGroupUp = useCallback((e: React.PointerEvent, pair: Pair) => {
    if (dragNum === null) return;
    if (isEmojiConnected(pair.emoji)) { setDragLine(null); setDragNum(null); return; }

    if (pair.num === dragNum) {
      const newConns = [...connections, { num: dragNum, emoji: pair.emoji }];
      setConnections(newConns);
      setFeedback('correct');
      onCorrect();
      setTimeout(() => setFeedback(null), 500);
      if (newConns.length === pairs.length && !phaseCompletedRef.current) {
        phaseCompletedRef.current = true;
        setTimeout(() => onPhaseComplete(), 900);
      }
    } else {
      setWrongFlash(pair.emoji);
      setFeedback('wrong');
      setTimeout(() => { setWrongFlash(null); setFeedback(null); }, 600);
    }
    setDragLine(null); setDragNum(null);
  }, [dragNum, connections, pairs.length, onCorrect, onPhaseComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phaseComplete) {
    return (
      <GameShell title="Ligue o Número" emoji="🔢" color="#5B4FCF" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="#5B4FCF" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Ligue o Número" emoji="🔢" color="#5B4FCF" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <p style={{
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 16,
        color: 'var(--text)', textAlign: 'center', marginBottom: 12,
      }}>
        Ligue cada número ao grupo certo! ({connections.length}/{pairs.length})
      </p>

      <div
        ref={containerRef}
        style={{
          position: 'relative', display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', gap: 0, userSelect: 'none', touchAction: 'none',
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={() => { setDragLine(null); setDragNum(null); }}
      >
        {/* Coluna de números */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {shuffledNums.map(p => {
            const conn    = connections.find(c => c.num === p.num);
            const linked  = !!conn;
            const colorIdx = pairs.findIndex(pp => pp.num === p.num);
            const color   = LINE_COLORS[colorIdx % LINE_COLORS.length];
            return (
              <div
                key={p.num}
                ref={el => { itemRefs.current[`num-${p.num}`] = el; }}
                onPointerDown={e => handleNumDown(e, p.num)}
                style={{
                  width: isDesktop ? 40 : 56, height: isDesktop ? 40 : 56, borderRadius: 14,
                  background: linked ? color + '22' : '#fff',
                  border: `2.5px solid ${linked ? color : dragNum === p.num ? '#5B4FCF' : '#E8E8F0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Nunito', fontWeight: 900, fontSize: 26,
                  color: linked ? color : '#1A1A2E',
                  cursor: linked ? 'default' : 'pointer', touchAction: 'none', userSelect: 'none',
                  transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
                  transform: linked ? 'scale(1.08) translateZ(0)' : 'scale(1) translateZ(0)',
                  boxShadow: linked ? `0 0 12px ${color}44` : '0 2px 6px rgba(0,0,0,0.08)',
                  textTransform: 'none', letterSpacing: 'normal',
                }}
              >
                {p.num}
              </div>
            );
          })}
        </div>

        {/* SVG overlay */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          {connections.map(conn => {
            const nc = getCenterOf(`num-${conn.num}`);
            const gc = getCenterOf(`grp-${conn.emoji}`);
            if (!nc || !gc) return null;
            const colorIdx = pairs.findIndex(p => p.num === conn.num);
            const color = LINE_COLORS[colorIdx % LINE_COLORS.length];
            return (
              <line
                key={`${conn.num}-${conn.emoji}`}
                x1={nc.x} y1={nc.y} x2={gc.x} y2={gc.y}
                stroke={color} strokeWidth={4} strokeLinecap="round" opacity={0.75}
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

        {/* Coluna de grupos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {shuffledGroups.map(p => {
            const conn    = connections.find(c => c.emoji === p.emoji);
            const linked  = !!conn;
            const isWrong = wrongFlash === p.emoji;
            const colorIdx = pairs.findIndex(pp => pp.emoji === p.emoji);
            const color   = LINE_COLORS[colorIdx % LINE_COLORS.length];
            return (
              <div
                key={p.emoji}
                ref={el => { itemRefs.current[`grp-${p.emoji}`] = el; }}
                onPointerUp={e => { if (dragNum !== null) handleGroupUp(e, p); }}
                style={{
                  width: isDesktop ? 56 : 80, minHeight: isDesktop ? 40 : 56, borderRadius: 14,
                  background: linked ? color + '22' : '#fff',
                  border: `2.5px solid ${linked ? color : isWrong ? '#F44336' : '#E8E8F0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexWrap: 'wrap', gap: 2, padding: '6px 4px',
                  touchAction: 'none', userSelect: 'none',
                  cursor: linked ? 'default' : 'pointer',
                  transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
                  transform: linked ? 'scale(1.08) translateZ(0)' : isWrong ? 'scale(0.92) translateZ(0)' : 'scale(1) translateZ(0)',
                  boxShadow: linked ? `0 0 12px ${color}44` : '0 2px 6px rgba(0,0,0,0.08)',
                }}
              >
                {Array.from({ length: p.num }).map((_, i) => (
                  <AppleEmoji key={i} emoji={p.emoji} size={20} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 14 }}>
        Arraste do número ao grupo com a mesma quantidade!
      </p>
    </GameShell>
  );
}
