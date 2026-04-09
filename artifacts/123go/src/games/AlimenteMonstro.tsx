import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

/* ── Fases ───────────────────────────────────────────────────────────────────── */
interface Phase { pedido: number; item: string; total: number; }
const PHASES: Phase[] = [
  { pedido: 3, item: '🍪', total: 6  },
  { pedido: 5, item: '🍕', total: 9  },
  { pedido: 4, item: '🍔', total: 8  },
  { pedido: 7, item: '🌮', total: 12 },
  { pedido: 6, item: '🍩', total: 10 },
];

interface FoodItem { id: number; eaten: boolean; }

export function AlimenteMonstro() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [feedback,  setFeedback]  = useState<'correct' | 'wrong' | null>(null);
  const [items,     setItems]     = useState<FoodItem[]>([]);
  const [fed,       setFed]       = useState(0);
  const [phase3Ok,  setPhase3Ok]  = useState(false);
  const mouthRef = useRef<HTMLDivElement>(null);
  const phaseCompletedRef = useRef(false);

  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setFed(0);
    setFeedback(null);
    setPhase3Ok(false);
    setItems(Array.from({ length: phaseData.total }, (_, i) => ({ id: i, eaten: false })));
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const itemSize = isDesktop ? 56 : 48;

  function handleFeedItem(itemId: number) {
    if (feedback || items.find(i => i.id === itemId)?.eaten) return;

    const newFed = fed + 1;
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, eaten: true } : it));
    setFed(newFed);

    if (newFed === phaseData.pedido) {
      setFeedback('correct');
      onCorrect();
      if (!phaseCompletedRef.current) {
        phaseCompletedRef.current = true;
        setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
      }
    } else if (newFed > phaseData.pedido) {
      setFeedback('wrong');
      onCorrect();
      setTimeout(() => setFeedback(null), 600);
    }
  }

  /* drag-to-mouth */
  const startDrag = useCallback((e: React.PointerEvent, itemId: number) => {
    const el = e.currentTarget as HTMLElement;
    if (items.find(i => i.id === itemId)?.eaten || feedback) return;
    el.setPointerCapture(e.pointerId);
    let dropped = false;

    const onMove = (ev: PointerEvent) => {
      if (mouthRef.current) {
        const rect = mouthRef.current.getBoundingClientRect();
        if (ev.clientX >= rect.left && ev.clientX <= rect.right &&
            ev.clientY >= rect.top  && ev.clientY <= rect.bottom) {
          dropped = true;
        }
      }
    };
    const onUp = () => {
      if (dropped) handleFeedItem(itemId);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup',   onUp);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup',   onUp);
  }, [items, feedback]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phaseComplete) {
    return (
      <GameShell title="Alimente o Monstro" emoji="👾" color="#FF6B35" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="#FF6B35" />
      </GameShell>
    );
  }

  const overflow = fed > phaseData.pedido;

  return (
    <GameShell title="Alimente o Monstro" emoji="👾" color="#FF6B35" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Pedido */}
      <div style={{
        background: '#FAECE7', borderRadius: 14, padding: '10px 18px',
        marginBottom: 14, textAlign: 'center',
        border: '1.5px solid #FDBCA0',
      }}>
        <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: '#1A1A2E' }}>
          O monstro quer <strong style={{ color: '#FF6B35', fontSize: 22 }}>{phaseData.pedido}</strong>{' '}
          <AppleEmoji emoji={phaseData.item} size={22} />
        </span>
      </div>

      {/* Contador */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        {Array.from({ length: phaseData.pedido }).map((_, i) => (
          <div key={i} style={{
            width: 20, height: 20, borderRadius: '50%',
            background: i < fed ? '#FF6B35' : '#E8E8F0',
            border: '1.5px solid ' + (i < fed ? '#FF6B35' : '#D0D0E0'),
            transition: 'background 0.2s, transform 0.15s',
            transform: i < fed ? 'scale(1.15)' : 'scale(1)',
          }} />
        ))}
        {overflow && (
          <span style={{ fontSize: 18, marginLeft: 4 }}>⚠️</span>
        )}
      </div>

      {/* Monstro */}
      <div
        ref={mouthRef}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isDesktop ? 90 : 72,
          marginBottom: 12,
          filter: feedback === 'correct'
            ? 'drop-shadow(0 0 16px #4CAF50)'
            : feedback === 'wrong'
            ? 'drop-shadow(0 0 16px #F44336)'
            : 'none',
          transition: 'filter 0.2s',
          animation: 'monsterBounce 1.6s ease-in-out infinite',
          userSelect: 'none',
        }}
        aria-label="Boca do monstro — solte aqui"
      >
        {fed >= phaseData.pedido ? '😋' : '👾'}
      </div>

      {/* Itens */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10,
        justifyContent: 'center', padding: '0 8px',
      }}>
        {items.map(item => (
          <div
            key={item.id}
            onPointerDown={e => startDrag(e, item.id)}
            onPointerUp={() => handleFeedItem(item.id)}
            style={{
              fontSize: itemSize, cursor: item.eaten ? 'default' : 'grab',
              opacity: item.eaten ? 0.15 : 1,
              touchAction: 'none', userSelect: 'none',
              transition: 'opacity 0.25s, transform 0.15s',
              transform: item.eaten ? 'scale(0.7)' : 'scale(1)',
              willChange: 'transform, opacity',
            }}
            role="button"
            aria-label={`Item ${item.id + 1}`}
            aria-pressed={item.eaten}
          >
            {phaseData.item}
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 12 }}>
        Toque ou arraste para a boca do monstro!
      </p>

      <style>{`
        @keyframes monsterBounce {
          0%, 100% { transform: translateY(0) translateZ(0); }
          50%      { transform: translateY(-6px) translateZ(0); }
        }
      `}</style>
    </GameShell>
  );
}
