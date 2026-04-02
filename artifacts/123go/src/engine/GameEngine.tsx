import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import confetti from 'canvas-confetti';

interface PhaseConfig {
  speed: number;
  elements: number;
  timeLimit: number | null;
  hintsEnabled: boolean;
}

export function getPhaseConfig(phase: number): PhaseConfig {
  return {
    speed: [1, 1.2, 1.4, 1.6, 2.0][phase - 1] ?? 2.0,
    elements: [5, 8, 10, 12, 15][phase - 1] ?? 15,
    timeLimit: [null, null, 30, 20, 15][phase - 1] ?? 15,
    hintsEnabled: [true, true, false, false, false][phase - 1] ?? false,
  };
}

interface GameShellProps {
  title: string;
  emoji: string;
  color: string;
  currentPhase: number;
  totalPhases: number;
  children: React.ReactNode;
  onNextPhase?: () => void;
  showNextPhase?: boolean;
  score?: number;
}

export function GameShell({ title, emoji, color, currentPhase, totalPhases, children, onNextPhase, showNextPhase, score }: GameShellProps) {
  const [, setLocation] = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <button
          onClick={() => setLocation('/')}
          aria-label="Voltar ao catálogo"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1.5px solid var(--border)',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
            color: 'var(--text2)',
          }}
        >←</button>

        <span style={{ fontSize: 22 }}>{emoji}</span>
        <h1 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--text)', flex: 1 }}>{title}</h1>

        {score !== undefined && (
          <span style={{
            background: color,
            color: '#fff',
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 13,
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
          }}>
            ★ {score}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {Array.from({ length: totalPhases }).map((_, i) => {
            const phaseNum = i + 1;
            const done = phaseNum < currentPhase;
            const current = phaseNum === currentPhase;
            return (
              <div
                key={i}
                style={{
                  width: done || current ? 28 : 22,
                  height: 12,
                  borderRadius: 6,
                  background: done ? color : current ? color : 'var(--border)',
                  opacity: current ? 1 : done ? 0.8 : 0.4,
                  transition: 'all 0.3s ease',
                  animation: current ? 'pulseDot 1.2s ease-in-out infinite' : 'none',
                }}
              />
            );
          })}
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, marginTop: 6, fontWeight: 600 }}>
          Fase {currentPhase} de {totalPhases}
        </p>
      </div>

      {/* Game content */}
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 700, margin: '0 auto', width: '100%' }}>
        {children}
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export function useGameEngine(totalPhases = 5) {
  const [phase, setPhase] = useState(1);
  const [score, setScore] = useState(0);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const onCorrect = useCallback(() => {
    setScore(s => s + 1);
  }, []);

  const onPhaseComplete = useCallback(() => {
    setPhaseComplete(true);
    if (phase >= totalPhases) {
      setGameComplete(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [phase, totalPhases]);

  const nextPhase = useCallback(() => {
    if (phase < totalPhases) {
      setPhase(p => p + 1);
      setPhaseComplete(false);
    }
  }, [phase, totalPhases]);

  const restart = useCallback(() => {
    setPhase(1);
    setScore(0);
    setPhaseComplete(false);
    setGameComplete(false);
  }, []);

  return { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart };
}

interface FeedbackProps {
  type: 'correct' | 'wrong' | null;
}

export function FeedbackOverlay({ type }: FeedbackProps) {
  if (!type) return null;
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: 80,
      zIndex: 500,
      animation: 'feedbackPop 0.6s ease-out forwards',
      pointerEvents: 'none',
    }}>
      {type === 'correct' ? '✅' : '❌'}
      <style>{`
        @keyframes feedbackPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `}</style>
    </div>
  );
}

interface PhaseCompleteCardProps {
  phase: number;
  totalPhases: number;
  score: number;
  isGameComplete: boolean;
  onNext: () => void;
  onRestart: () => void;
  color: string;
}

export function PhaseCompleteCard({ phase, totalPhases, score, isGameComplete, onNext, onRestart, color }: PhaseCompleteCardProps) {
  const [, setLocation] = useLocation();

  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius)',
      padding: 32,
      textAlign: 'center',
      boxShadow: 'var(--shadow-hover)',
      border: '1.5px solid var(--border)',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>
        {isGameComplete ? '🏆' : '⭐'}
      </div>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>
        {isGameComplete ? 'Parabéns! Jogo completo!' : `Fase ${phase} completa!`}
      </h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
        {isGameComplete
          ? `Você completou todas as ${totalPhases} fases com ${score} acertos!`
          : `Continue para a próxima fase!`}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onRestart}
          style={{
            padding: '12px 24px',
            borderRadius: 'var(--radius-pill)',
            border: '1.5px solid var(--border)',
            background: '#fff',
            color: 'var(--text)',
            fontFamily: 'Nunito',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            minHeight: 48,
          }}
        >
          🔄 Recomeçar
        </button>
        {!isGameComplete && (
          <button
            onClick={onNext}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: color,
              color: '#fff',
              fontFamily: 'Nunito',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            Próxima fase →
          </button>
        )}
        {isGameComplete && (
          <button
            onClick={() => setLocation('/')}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: color,
              color: '#fff',
              fontFamily: 'Nunito',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            Ver outros jogos →
          </button>
        )}
      </div>
    </div>
  );
}
