import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

/* ── Fases ───────────────────────────────────────────────────────────────────── */
interface Phase {
  maxQtd:    number;
  opcoes:    number;
  item:      string;
  flashMode: boolean;
}
const PHASES: Phase[] = [
  { maxQtd: 5,  opcoes: 3, item: '🍎', flashMode: false },
  { maxQtd: 8,  opcoes: 3, item: '⭐', flashMode: false },
  { maxQtd: 10, opcoes: 4, item: '🐟', flashMode: false },
  { maxQtd: 12, opcoes: 4, item: '🌸', flashMode: false },
  { maxQtd: 15, opcoes: 4, item: '🍬', flashMode: true  },
];

const CARD_COLORS = ['#FF6B35','#5B4FCF','#4CAF50','#E91E8C','#00B4D8','#FF9800'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRound(maxQtd: number, numOpcoes: number) {
  const correct = 1 + Math.floor(Math.random() * maxQtd);
  const opts = new Set<number>([correct]);
  let attempts = 0;
  while (opts.size < numOpcoes && attempts < 100) {
    const delta = Math.floor(Math.random() * 5) - 2;
    const cand  = Math.max(1, Math.min(maxQtd + 2, correct + delta));
    if (cand !== correct) opts.add(cand);
    attempts++;
  }
  if (opts.size < numOpcoes) {
    let n = 1;
    while (opts.size < numOpcoes) { if (!opts.has(n)) opts.add(n); n++; }
  }
  return { correct, options: shuffle([...opts]) };
}

export function QuantosTem() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [feedback,    setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [correct,     setCorrect]     = useState(0);
  const [options,     setOptions]     = useState<number[]>([]);
  const [acertos,     setAcertos]     = useState(0);
  const [flash,       setFlash]       = useState(false);
  const [showItems,   setShowItems]   = useState(true);
  const [wrongBtn,    setWrongBtn]    = useState<number | null>(null);
  const phaseCompletedRef = useRef(false);

  const phaseData = PHASES[phase - 1];

  function startRound() {
    const round = generateRound(phaseData.maxQtd, phaseData.opcoes);
    setCorrect(round.correct);
    setOptions(round.options);
    setFeedback(null);
    setWrongBtn(null);

    if (phaseData.flashMode) {
      setShowItems(true);
      setFlash(false);
      const t = setTimeout(() => {
        setShowItems(false);
        setFlash(true);
      }, 1800);
      return () => clearTimeout(t);
    } else {
      setShowItems(true);
      setFlash(false);
    }
  }

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAcertos(0);
    setFeedback(null);
    setWrongBtn(null);
    startRound();
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTap(num: number) {
    if (feedback) return;

    if (num === correct) {
      setFeedback('correct');
      onCorrect();
      const next = acertos + 1;
      setAcertos(next);
      if (next >= 4 && !phaseCompletedRef.current) {
        phaseCompletedRef.current = true;
        setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 900);
      } else {
        setTimeout(() => startRound(), 800);
      }
    } else {
      setWrongBtn(num);
      setFeedback('wrong');
      setTimeout(() => { setFeedback(null); setWrongBtn(null); }, 600);
    }
  }

  if (phaseComplete) {
    return (
      <GameShell title="Quantos Tem?" emoji="🍎" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c5)" />
      </GameShell>
    );
  }

  const itemsPerRow = 5;
  const rows: number[] = [];
  let rem = correct;
  while (rem > 0) {
    rows.push(Math.min(rem, itemsPerRow));
    rem -= itemsPerRow;
  }

  return (
    <GameShell title="Quantos Tem?" emoji="🍎" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Progresso em estrelas */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} style={{ fontSize: 22, transition: 'transform 0.2s', transform: i < acertos ? 'scale(1.15)' : 'scale(1)' }}>
            {i < acertos ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      {/* Pergunta */}
      <p style={{
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 18,
        color: 'var(--text)', textAlign: 'center', marginBottom: 12,
      }}>
        Quantos <span style={{ fontSize: 22 }}>{phaseData.item}</span> você vê?
        {phaseData.flashMode && !showItems && (
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E91E8C', display: 'block', marginTop: 4 }}>
            ⚡ Memória! Lembra quantos havia?
          </span>
        )}
      </p>

      {/* Grade de objetos */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
        padding: '16px 12px', marginBottom: 20, minHeight: 80,
        display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
      }}>
        {showItems ? (
          rows.map((count, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              {Array.from({ length: count }).map((_, ci) => (
                <AppleEmoji key={ci} emoji={phaseData.item} size={isDesktop ? 22 : 32} />
              ))}
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
            <span style={{ fontSize: 36 }}>🤔</span>
          </div>
        )}
      </div>

      {/* Botões de opção */}
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
      }}>
        {options.map((num, i) => {
          const isWrong   = wrongBtn === num;
          const isCorrect = feedback === 'correct' && num === correct;
          const color     = CARD_COLORS[i % CARD_COLORS.length];
          return (
            <button
              key={num}
              onPointerUp={() => handleTap(num)}
              style={{
                minWidth: isDesktop ? 50 : 72, minHeight: isDesktop ? 50 : 72, borderRadius: 16,
                fontFamily: 'Nunito', fontWeight: 900, fontSize: isDesktop ? 20 : 28,
                color: '#fff', background: color,
                border: 'none', cursor: 'pointer', touchAction: 'manipulation',
                userSelect: 'none',
                transform: isWrong ? 'translateX(0)' : isCorrect ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isCorrect ? `0 0 16px ${color}88` : '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'transform 0.12s, box-shadow 0.12s',
                animation: isWrong ? 'btnShake 0.4s ease' : undefined,
              }}
            >
              {num}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes btnShake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </GameShell>
  );
}
