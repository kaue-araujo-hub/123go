import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

const FLASH_DURATIONS = [7000, 4000, 4000, 4000, 4000];
const STAR_COUNTS     = [3, 7, 4, 9, 5];

function generateOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  let attempts = 0;
  while (opts.size < 3 && attempts < 50) {
    const delta = Math.floor(Math.random() * 5) - 2;
    const cand = Math.max(1, correct + delta);
    if (cand !== correct) opts.add(cand);
    attempts++;
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

function getStarPositions(count: number): { x: number; y: number }[] {
  const STAR_SIZE_PCT = 12; // star diameter as % of container width
  const padding = STAR_SIZE_PCT / 2 + 2; // keep stars fully inside
  const MIN_DIST = STAR_SIZE_PCT + 4;
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    let pos = { x: 0, y: 0 };
    let attempts = 0;
    do {
      pos = {
        x: padding + Math.random() * (100 - padding * 2),
        y: padding + Math.random() * (100 - padding * 2),
      };
      attempts++;
    } while (
      attempts < 80 &&
      positions.some(p => Math.hypot(p.x - pos.x, p.y - pos.y) < MIN_DIST)
    );
    positions.push(pos);
  }
  return positions;
}

function StarField({ count, visible }: { count: number; visible: boolean }) {
  const isDesktop = useIsDesktop();
  const starSize = isDesktop ? 36 : 40;

  // Regenerate positions whenever count changes
  const positions = useRef<{ x: number; y: number }[]>([]);
  useEffect(() => {
    positions.current = getStarPositions(count);
  }, [count]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: isDesktop ? 220 : 260,
      background: '#0D1B2A',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {visible && positions.current.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
            animation: 'starTwinkle 0.5s ease-in-out infinite alternate',
            animationDelay: `${i * 0.08}s`,
            willChange: 'transform, opacity',
          }}
        >
          <AppleEmoji emoji="⭐" size={starSize} />
        </div>
      ))}

      {!visible && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', color: 'rgba(255,255,255,0.4)', fontSize: 14,
          fontFamily: 'Nunito', fontWeight: 600,
        }}>
          Quantas estrelas você viu?
        </div>
      )}

      <style>{`
        @keyframes starTwinkle {
          from { opacity: 0.6; transform: translate(-50%, -50%) scale(0.88); }
          to   { opacity: 1;   transform: translate(-50%, -50%) scale(1.12); }
        }
      `}</style>
    </div>
  );
}

export function CacaEstrelas() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();
  const [showStars, setShowStars]     = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [answered, setAnswered]       = useState(false);
  const [feedback, setFeedback]       = useState<'correct' | 'wrong' | null>(null);
  const [options, setOptions]         = useState<number[]>([]);
  const phaseCompletedRef = useRef(false);
  const hideTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const starCount     = STAR_COUNTS[phase - 1] ?? 3;
  const flashDuration = FLASH_DURATIONS[phase - 1] ?? 2000;

  const startFlash = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowStars(true);
    setShowButtons(false);
    setAnswered(false);
    hideTimerRef.current = setTimeout(() => {
      setShowStars(false);
      setShowButtons(true);
    }, flashDuration);
  }, [flashDuration]);

  useEffect(() => {
    phaseCompletedRef.current = false;
    setOptions(generateOptions(starCount));
    startFlash();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [phase]);

  const handleAnswer = (answer: number) => {
    if (answered || phaseCompletedRef.current || !showButtons) return;
    const correct = answer === starCount;
    setAnswered(true);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      phaseCompletedRef.current = true;
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Caça Estrelas" emoji="⭐" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  // Button sizing
  const btnSize    = isDesktop ? 80 : 110;
  const btnRadius  = isDesktop ? 18 : 26;
  const btnFontSz  = isDesktop ? 42 : 62;

  return (
    <GameShell title="Caça Estrelas" emoji="⭐" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>
          Memorize e conte as estrelas!
        </h2>
        {showStars && (
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
            ⏱ O céu pisca por {flashDuration / 1000}s
          </p>
        )}
      </div>

      <StarField key={`phase-${phase}`} count={starCount} visible={showStars} />

      {/* "Show again" button — before answer buttons appear */}
      {!showStars && !showButtons && !answered && (
        <button
          onPointerUp={startFlash}
          style={{
            display: 'block', margin: '0 auto 16px', padding: '10px 24px',
            borderRadius: 'var(--radius-pill)', background: 'var(--c3)', color: '#fff',
            fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            border: 'none', minHeight: 44, touchAction: 'manipulation',
          }}
        >
          Mostrar de novo ↺
        </button>
      )}

      {/* "See again" link above answer buttons */}
      {!showStars && showButtons && !answered && (
        <button
          onPointerUp={startFlash}
          style={{
            display: 'block', margin: '0 auto 14px', padding: '8px 20px',
            borderRadius: 'var(--radius-pill)', background: 'transparent', color: 'var(--text3)',
            fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            border: '1.5px solid var(--border)', minHeight: 36, touchAction: 'manipulation',
          }}
        >
          Ver de novo ↺
        </button>
      )}

      {/* Answer buttons */}
      {showButtons && (
        <div style={{ display: 'flex', gap: isDesktop ? 18 : 14, justifyContent: 'center', marginTop: 4 }}>
          {options.map(opt => (
            <button
              key={opt}
              onPointerUp={() => handleAnswer(opt)}
              style={{
                width: btnSize, height: btnSize,
                borderRadius: btnRadius,
                border: '3px solid var(--border)',
                background: '#fff',
                fontFamily: 'Nunito',
                fontWeight: 900,
                fontSize: btnFontSz,
                lineHeight: 1,
                color: 'var(--text)',
                cursor: 'pointer',
                minHeight: btnSize,
                minWidth: btnSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                touchAction: 'manipulation',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </GameShell>
  );
}