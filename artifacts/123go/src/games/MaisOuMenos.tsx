import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

/* ── Fases ───────────────────────────────────────────────────────────────────── */
interface Phase {
  qtdA:  number;
  qtdB:  number;
  item:  string;
  pergunta: 'mais' | 'menos';
}
const PHASES: Phase[] = [
  { qtdA: 8,  qtdB: 3,  item: '🍎', pergunta: 'mais'  },
  { qtdA: 2,  qtdB: 7,  item: '⭐', pergunta: 'menos' },
  { qtdA: 6,  qtdB: 11, item: '🌸', pergunta: 'mais'  },
  { qtdA: 9,  qtdB: 5,  item: '🐟', pergunta: 'menos' },
  { qtdA: 7,  qtdB: 9,  item: '🍬', pergunta: 'mais'  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MaisOuMenos() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [feedback,   setFeedback]   = useState<'correct' | 'wrong' | null>(null);
  const [acertos,    setAcertos]    = useState(0);
  const [swapped,    setSwapped]    = useState(false);
  const [chosen,     setChosen]     = useState<'A' | 'B' | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const thumbRef   = useRef<HTMLDivElement>(null);
  const aRef       = useRef<HTMLDivElement>(null);
  const bRef       = useRef<HTMLDivElement>(null);
  const dragging   = useRef(false);
  const startX     = useRef(0);
  const currentX   = useRef(0);
  const phaseCompletedRef = useRef(false);

  const phaseData = PHASES[phase - 1];

  const qtdA = swapped ? phaseData.qtdB : phaseData.qtdA;
  const qtdB = swapped ? phaseData.qtdA : phaseData.qtdB;
  const correctSide: 'A' | 'B' = phaseData.pergunta === 'mais'
    ? (qtdA > qtdB ? 'A' : 'B')
    : (qtdA < qtdB ? 'A' : 'B');

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAcertos(0);
    setFeedback(null);
    setChosen(null);
    setSwapped(Math.random() < 0.5);
    setShuffleKey(k => k + 1);
  }, [phase]);

  const resetThumb = useCallback(() => {
    if (thumbRef.current) {
      thumbRef.current.style.transition = 'transform 0.3s ease';
      thumbRef.current.style.transform  = 'translateX(0)';
      setTimeout(() => {
        if (thumbRef.current) thumbRef.current.style.transition = '';
      }, 350);
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (feedback || chosen) return;
    dragging.current = true;
    startX.current   = e.clientX;
    currentX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [feedback, chosen]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    currentX.current = e.clientX;
    const dx = currentX.current - startX.current;
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translateX(${dx}px)`;
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - startX.current;
    const threshold = 50;

    if (Math.abs(dx) < threshold) { resetThumb(); return; }
    const side: 'A' | 'B' = dx < 0 ? 'A' : 'B';
    setChosen(side);

    if (side === correctSide) {
      setFeedback('correct');
      onCorrect();
      const next = acertos + 1;
      if (next >= 4 && !phaseCompletedRef.current) {
        phaseCompletedRef.current = true;
        setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 900);
      } else {
        setAcertos(next);
        setTimeout(() => {
          setFeedback(null); setChosen(null);
          setSwapped(Math.random() < 0.5);
          setShuffleKey(k => k + 1);
          resetThumb();
        }, 800);
      }
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null); setChosen(null);
        resetThumb();
      }, 600);
    }
  }, [correctSide, acertos, onCorrect, onPhaseComplete, resetThumb]);

  if (phaseComplete) {
    return (
      <GameShell title="Mais ou Menos?" emoji="👍" color="#00B4D8" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="#00B4D8" />
      </GameShell>
    );
  }

  const itemSz = isDesktop ? 32 : 26;
  const perRow  = 5;
  const perguntaLabel = phaseData.pergunta === 'mais' ? 'MAIS' : 'MENOS';

  function renderGrupo(qtd: number, title: string) {
    const rows: number[] = [];
    let rem = qtd;
    while (rem > 0) { rows.push(Math.min(rem, perRow)); rem -= perRow; }
    return (
      <div style={{
        flex: 1, background: '#fff', borderRadius: 16,
        border: '1.5px solid var(--border)',
        padding: '12px 8px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: '#9CA3AF' }}>{title}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          {rows.map((cnt, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              {Array.from({ length: cnt }).map((_, ci) => (
                <AppleEmoji key={ci} emoji={phaseData.item} size={itemSz} />
              ))}
            </div>
          ))}
        </div>
        <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, color: '#1A1A2E', marginTop: 4 }}>{qtd}</span>
      </div>
    );
  }

  return (
    <GameShell title="Mais ou Menos?" emoji="👍" color="#00B4D8" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Progresso */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} style={{ fontSize: 20 }}>{i < acertos ? '⭐' : '☆'}</span>
        ))}
      </div>

      <p style={{
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 17,
        color: 'var(--text)', textAlign: 'center', marginBottom: 16,
      }}>
        Arraste o polegar para o grupo que tem{' '}
        <strong style={{ color: '#00B4D8' }}>{perguntaLabel}</strong>!
      </p>

      {/* Grupos A e B */}
      <div key={shuffleKey} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div ref={aRef} style={{ flex: 1 }}>{renderGrupo(qtdA, 'Grupo A')}</div>
        <div ref={bRef} style={{ flex: 1 }}>{renderGrupo(qtdB, 'Grupo B')}</div>
      </div>

      {/* Polegar arrastável (centralizado entre os grupos) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, userSelect: 'none' }}>
        <div
          ref={thumbRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            fontSize: 52, cursor: 'grab', touchAction: 'none',
            filter: chosen ? (feedback === 'correct' ? 'drop-shadow(0 0 8px #4CAF50)' : 'drop-shadow(0 0 8px #F44336)') : 'none',
            transition: 'filter 0.2s',
          }}
          role="slider"
          aria-label="Arrastar polegar para o grupo correto"
        >
          👍
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
        ← Arraste para o grupo correto →
      </p>
    </GameShell>
  );
}
