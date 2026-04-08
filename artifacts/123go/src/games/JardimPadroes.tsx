import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  {
    label: 'Padrão AB: qual vem a seguir?',
    pattern: ['🌹', '🌼', '🌹', '🌼', '🌹'],
    next: '🌼',
    options: ['🌹', '🌼', '🌸'],
  },
  {
    label: 'Padrão ABC: qual vem a seguir?',
    pattern: ['🌹', '🌼', '🌸', '🌹', '🌼'],
    next: '🌸',
    options: ['🌹', '🌸', '🌺'],
  },
  {
    label: 'Padrão por FORMA: qual vem a seguir?',
    pattern: ['⭕', '⬛', '⭕', '⬛', '⭕'],
    next: '⬛',
    options: ['⭕', '⬛', '🔺'],
  },
  {
    label: 'Padrão por TAMANHO: qual vem a seguir?',
    pattern: ['🌸', '🌺', '🌸', '🌺', '🌸'],
    next: '🌺',
    options: ['🌸', '🌺', '🌻'],
  },
  {
    label: 'Complete o padrão especial!',
    pattern: ['🦋', '🐝', '🦋', '🐝', '🦋'],
    next: '🐝',
    options: ['🦋', '🐝', '🐛'],
  },
];

export function JardimPadroes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);

  const [feedback,    setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [answered,   setAnswered]    = useState(false);

  /* drag state */
  const [draggingOpt, setDraggingOpt] = useState<string | null>(null);
  const [ghostPos,    setGhostPos]    = useState<{ x: number; y: number } | null>(null);
  const [isOver,      setIsOver]      = useState(false);

  const dropRef       = useRef<HTMLDivElement>(null);
  const draggingRef   = useRef<string | null>(null);
  const phaseCompletedRef = useRef(false);

  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    setDraggingOpt(null);
    setGhostPos(null);
    setIsOver(false);
  }, [phase]);

  const handleChoice = (choice: string) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = choice === phaseData.next;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true;
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  /* ── Drag handlers ── */
  const startDrag = (e: React.PointerEvent, opt: string) => {
    if (answered || phaseCompletedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = opt;
    setDraggingOpt(opt);
    setGhostPos({ x: e.clientX, y: e.clientY });

    const onMove = (ev: PointerEvent) => {
      setGhostPos({ x: ev.clientX, y: ev.clientY });
      if (dropRef.current) {
        const r = dropRef.current.getBoundingClientRect();
        setIsOver(
          ev.clientX >= r.left && ev.clientX <= r.right &&
          ev.clientY >= r.top  && ev.clientY <= r.bottom
        );
      }
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);

      if (dropRef.current) {
        const r = dropRef.current.getBoundingClientRect();
        const landed =
          ev.clientX >= r.left && ev.clientX <= r.right &&
          ev.clientY >= r.top  && ev.clientY <= r.bottom;
        if (landed && draggingRef.current) {
          handleChoice(draggingRef.current);
        }
      }

      draggingRef.current = null;
      setDraggingOpt(null);
      setGhostPos(null);
      setIsOver(false);
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

  return (
    <GameShell title="Jardim de Padrões" emoji="🌸" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Ghost element — follows pointer */}
      {ghostPos && draggingOpt && (
        <div style={{
          position: 'fixed',
          left: ghostPos.x - 36, top: ghostPos.y - 36,
          width: 72, height: 72,
          background: '#fff', borderRadius: 18,
          border: '3px solid var(--c2)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, pointerEvents: 'none',
          transform: 'scale(1.12)',
        }}>
          <AppleEmoji emoji={draggingOpt} size={46} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>
          {phaseData.label}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>
          Arraste a figura correta para completar o padrão
        </p>
      </div>

      {/* Pattern sequence */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
        padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center',
        gap: 8, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {phaseData.pattern.map((item, i) => (
          <div key={i} style={{
            width: 54, height: 54, borderRadius: 12, background: 'var(--bg)',
            border: '2px solid var(--border)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <AppleEmoji emoji={item} size={34} />
          </div>
        ))}

        {/* Drop zone — the ? slot */}
        <div
          ref={dropRef}
          style={{
            width: 58, height: 58, borderRadius: 14,
            background: answered
              ? '#E8F5E9'
              : isOver
                ? 'rgba(var(--c2-rgb, 245,158,11), 0.12)'
                : 'var(--bg)',
            border: answered
              ? '3px solid #4CAF50'
              : isOver
                ? '3px solid var(--c2)'
                : `3px dashed var(--c2)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border 0.15s, background 0.15s, transform 0.15s',
            transform: isOver ? 'scale(1.12)' : answered ? 'scale(1.05)' : 'scale(1)',
            boxShadow: isOver ? '0 0 14px rgba(245,158,11,0.35)' : 'none',
            animation: answered || draggingOpt ? undefined : 'vasoPulse 1.2s ease-in-out infinite',
          }}
        >
          {answered
            ? <AppleEmoji emoji={phaseData.next} size={36} />
            : <span style={{ fontSize: 24, color: isOver ? 'var(--c2)' : 'rgba(0,0,0,0.3)', fontWeight: 900, fontFamily: 'Nunito', transition: 'color 0.15s' }}>?</span>
          }
        </div>
      </div>

      {/* Draggable option tiles */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {phaseData.options.map(opt => {
          const isDraggingMe = draggingOpt === opt;
          const isCorrectAndAnswered = opt === phaseData.next && answered;
          return (
            <div
              key={opt}
              onPointerDown={e => startDrag(e, opt)}
              style={{
                width: 96, height: 96, borderRadius: 22,
                border: `3px solid ${isCorrectAndAnswered ? '#4CAF50' : 'var(--border)'}`,
                background: isCorrectAndAnswered ? '#E8F5E9' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: answered ? 'default' : 'grab',
                touchAction: 'none', userSelect: 'none',
                opacity: isDraggingMe ? 0.3 : 1,
                transform: isDraggingMe ? 'scale(0.92)' : 'scale(1)',
                transition: 'opacity 0.15s, transform 0.15s, border 0.15s',
                boxShadow: isDraggingMe ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <AppleEmoji emoji={opt} size={56} />
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
