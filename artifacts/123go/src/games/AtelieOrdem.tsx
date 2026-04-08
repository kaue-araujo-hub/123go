import React, { useState, useEffect, useRef } from 'react';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

/* ── helpers ── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── phase data ── */
const PHASES = [
  {
    label: 'Organize por COR!',
    drawers: [
      { label: '🔴 Vermelho', key: 'red',    color: '#EF5350' },
      { label: '🔵 Azul',    key: 'blue',   color: '#42A5F5' },
      { label: '🟡 Amarelo', key: 'yellow', color: '#FFA726' },
    ],
    objects: [
      { emoji: '🍎', attr: 'red' },    { emoji: '🌹', attr: 'red' },    { emoji: '❤️',  attr: 'red' },
      { emoji: '💙', attr: 'blue' },   { emoji: '🫐', attr: 'blue' },   { emoji: '🐋',  attr: 'blue' },
      { emoji: '⭐', attr: 'yellow' }, { emoji: '🌟', attr: 'yellow' }, { emoji: '🌻', attr: 'yellow' },
    ],
    mystery: false,
  },
  {
    label: 'Organize por FORMA!',
    drawers: [
      { label: '⬛ Quadrado',  key: 'square',   color: '#5B4FCF' },
      { label: '⭕ Círculo',   key: 'circle',   color: '#E91E8C' },
      { label: '🔺 Triângulo', key: 'triangle', color: '#FF6B35' },
    ],
    objects: [
      { emoji: '📦', attr: 'square' },   { emoji: '🎁', attr: 'square' },   { emoji: '📱',  attr: 'square' },
      { emoji: '🌍', attr: 'circle' },   { emoji: '⚽', attr: 'circle' },   { emoji: '🎱',  attr: 'circle' },
      { emoji: '🍕', attr: 'triangle' }, { emoji: '⛰️', attr: 'triangle' }, { emoji: '🎄', attr: 'triangle' },
    ],
    mystery: false,
  },
  {
    label: 'Organize por TAMANHO!',
    drawers: [
      { label: '🔹 Pequeno', key: 'small',  color: '#4CAF50' },
      { label: '🔷 Médio',   key: 'medium', color: '#FF9800' },
      { label: '💠 Grande',  key: 'large',  color: '#9C27B0' },
    ],
    objects: [
      { emoji: '🐜', attr: 'small' },  { emoji: '🐦', attr: 'small' },  { emoji: '🐝', attr: 'small' },
      { emoji: '🐕', attr: 'medium' }, { emoji: '🐱', attr: 'medium' }, { emoji: '🐇', attr: 'medium' },
      { emoji: '🐘', attr: 'large' },  { emoji: '🦁', attr: 'large' },  { emoji: '🐄', attr: 'large' },
    ],
    mystery: false,
  },
  {
    label: 'Organize por COR e FORMA!',
    drawers: [
      { label: '🔴⬛ Verm. Quad.', key: 'red-square',      color: '#EF5350' },
      { label: '🔵⭕ Azul Circ.',  key: 'blue-circle',     color: '#42A5F5' },
      { label: '🟡🔺 Amar. Tri.',  key: 'yellow-triangle', color: '#FFA726' },
    ],
    objects: [
      { emoji: '🟥', attr: 'red-square' },      { emoji: '❤️',  attr: 'red-square' },      { emoji: '🔴', attr: 'red-square' },
      { emoji: '🔵', attr: 'blue-circle' },     { emoji: '💙',  attr: 'blue-circle' },     { emoji: '🫐', attr: 'blue-circle' },
      { emoji: '⭐', attr: 'yellow-triangle' }, { emoji: '🌟', attr: 'yellow-triangle' },  { emoji: '🏔️', attr: 'yellow-triangle' },
    ],
    mystery: false,
  },
  {
    label: 'Descubra o habitat misterioso!',
    drawers: [
      { label: '🌊 Água', key: 'water', color: '#00B4D8' },
      { label: '🌿 Terra', key: 'land',  color: '#4CAF50' },
      { label: '☁️ Céu',  key: 'sky',   color: '#5B4FCF' },
    ],
    objects: [
      { emoji: '🐟', attr: 'water' }, { emoji: '🐠', attr: 'water' }, { emoji: '🦈', attr: 'water' },
      { emoji: '🐘', attr: 'land' },  { emoji: '🐆', attr: 'land' },  { emoji: '🦊', attr: 'land' },
      { emoji: '🦅', attr: 'sky' },   { emoji: '🦋', attr: 'sky' },   { emoji: '🐦', attr: 'sky' },
    ],
    mystery: true,
  },
];

export function AtelieOrdem() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [feedback,    setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [placed,      setPlaced]      = useState<Record<string, string[]>>({});
  const [shuffled,    setShuffled]    = useState<{ emoji: string; attr: string }[]>([]);

  /* drag state */
  const [draggingObj, setDraggingObj] = useState<{ emoji: string; attr: string } | null>(null);
  const [ghostPos,    setGhostPos]    = useState<{ x: number; y: number } | null>(null);
  const [hoveredKey,  setHoveredKey]  = useState<string | null>(null);

  const draggingRef       = useRef<{ emoji: string; attr: string } | null>(null);
  const drawerNodeRefs    = useRef<Record<string, HTMLDivElement | null>>({});
  const phaseCompletedRef = useRef(false);

  const phaseData = PHASES[phase - 1];

  const remaining = shuffled.filter(o => !Object.values(placed).flat().includes(o.emoji));

  /* 1. completion detection — MUST be declared before the phase-reset effect
        so it runs first: phaseCompletedRef is still true when the next phase
        mounts (remaining is still 0 with stale state), preventing a false
        auto-complete of the new phase. */
  useEffect(() => {
    if (remaining.length === 0 && shuffled.length > 0 && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 900);
    }
  }, [remaining.length, shuffled.length, onCorrect, onPhaseComplete]);

  /* 2. phase reset — declared after completion so it runs second */
  useEffect(() => {
    phaseCompletedRef.current = false;
    setPlaced({});
    setFeedback(null);
    setDraggingObj(null);
    setGhostPos(null);
    setHoveredKey(null);
    setShuffled(shuffle(phaseData.objects));
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── drag helpers ── */
  const getHoveredDrawer = (x: number, y: number): string | null => {
    for (const key of Object.keys(drawerNodeRefs.current)) {
      const el = drawerNodeRefs.current[key];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return key;
    }
    return null;
  };

  const startDrag = (e: React.PointerEvent, obj: { emoji: string; attr: string }) => {
    if (phaseCompletedRef.current || feedback) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = obj;
    setDraggingObj(obj);
    setGhostPos({ x: e.clientX, y: e.clientY });

    const onMove = (ev: PointerEvent) => {
      setGhostPos({ x: ev.clientX, y: ev.clientY });
      setHoveredKey(getHoveredDrawer(ev.clientX, ev.clientY));
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);

      const key = getHoveredDrawer(ev.clientX, ev.clientY);
      const obj = draggingRef.current;
      draggingRef.current = null;
      setDraggingObj(null);
      setGhostPos(null);
      setHoveredKey(null);

      if (!key || !obj) return;

      if (obj.attr === key) {
        setPlaced(prev => ({ ...prev, [key]: [...(prev[key] || []), obj.emoji] }));
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 600);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  };

  if (phaseComplete) {
    return (
      <GameShell title="Ateliê da Ordem" emoji="🗂️" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Ateliê da Ordem" emoji="🗂️" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Ghost */}
      {ghostPos && draggingObj && (
        <div style={{
          position: 'fixed',
          left: ghostPos.x - (isDesktop ? 50 : 36),
          top:  ghostPos.y - (isDesktop ? 50 : 36),
          width: isDesktop ? 100 : 72, height: isDesktop ? 100 : 72,
          background: '#fff', borderRadius: isDesktop ? 24 : 18,
          border: '3px solid var(--c1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, pointerEvents: 'none',
          transform: 'scale(1.15)',
        }}>
          <AppleEmoji emoji={draggingObj.emoji} size={isDesktop ? 68 : 46} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', margin: 0 }}>
          {phaseData.label}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
          Arraste cada objeto até a gaveta correta
        </p>
      </div>

      {/* Objects area */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        padding: '10px 8px', marginBottom: 14,
        display: 'flex', flexWrap: 'wrap', gap: 8,
        justifyContent: 'center', minHeight: 82,
      }}>
        {remaining.length === 0 && (
          <p style={{ color: 'var(--c5)', fontWeight: 700, margin: 'auto' }}>✅ Tudo organizado!</p>
        )}
        {remaining.map(obj => {
          const isDraggingMe = draggingObj?.emoji === obj.emoji;
          const tileSize = isDesktop ? 100 : 64;
          const emojiSize = isDesktop ? 68 : 44;
          return (
            <div
              key={obj.emoji}
              onPointerDown={e => startDrag(e, obj)}
              style={{
                width: tileSize, height: tileSize,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'grab', background: 'var(--bg)', borderRadius: isDesktop ? 24 : 16,
                border: '2px solid var(--border)',
                boxShadow: isDraggingMe ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
                touchAction: 'none', userSelect: 'none',
                opacity: isDraggingMe ? 0.3 : 1,
                transition: 'opacity 0.15s, transform 0.15s',
                transform: isDraggingMe ? 'scale(0.9)' : 'scale(1)',
              }}
            >
              <AppleEmoji emoji={obj.emoji} size={emojiSize} />
            </div>
          );
        })}
      </div>

      {/* Drawer drop zones */}
      <div style={{ display: 'flex', gap: isDesktop ? 14 : 8 }}>
        {phaseData.drawers.map(drawer => {
          const isHovered = hoveredKey === drawer.key;
          return (
            <div
              key={drawer.key}
              ref={el => { drawerNodeRefs.current[drawer.key] = el; }}
              style={{
                flex: 1, padding: isDesktop ? '14px 10px' : '8px 6px', borderRadius: 16,
                border: `3px solid ${isHovered ? drawer.color : `${drawer.color}88`}`,
                background: isHovered ? `${drawer.color}33` : `${drawer.color}12`,
                minHeight: isDesktop ? 210 : 130,
                display: 'flex', flexDirection: 'column', gap: 5,
                alignItems: 'center',
                transition: 'border 0.15s, background 0.15s, transform 0.15s',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isHovered ? `0 0 16px ${drawer.color}55` : 'none',
              }}
            >
              <span style={{
                fontSize: isDesktop ? 15 : 11, fontWeight: 800, color: drawer.color,
                textAlign: 'center', fontFamily: 'Nunito', lineHeight: 1.2,
              }}>
                {drawer.label}
              </span>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: isDesktop ? 6 : 3,
                justifyContent: 'center', flex: 1, alignContent: 'center',
              }}>
                {(placed[drawer.key] || []).map((emoji, i) => (
                  <AppleEmoji key={i} emoji={emoji} size={isDesktop ? 40 : 26} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </GameShell>
  );
}
