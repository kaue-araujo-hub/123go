import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import confetti from 'canvas-confetti';
import { CountdownOverlay } from '../components/CountdownOverlay';
import { AppleEmoji } from '../utils/AppleEmoji';
import { isMuted, setGlobalMuted, playCorrect, playWrong } from '../utils/sounds';
import { burstParticles } from '../utils/particles';
import { games } from '../data/games';

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
  onRestart?: () => void;
}

function ControlBtn({ onClick, title, children, active = true }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className="btn-interactive"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        border: '1.5px solid var(--border)',
        background: active ? '#fff' : 'var(--bg)',
        color: active ? 'var(--text)' : 'var(--text3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: active ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function SoundIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  );
}

export function GameShell({ title, emoji, color, currentPhase, totalPhases, children, onNextPhase, showNextPhase, score, onRestart }: GameShellProps) {
  const [, setLocation] = useLocation();
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [muted, setMuted] = useState(() => isMuted());

  const toggleMuted = useCallback(() => {
    setMuted(m => {
      setGlobalMuted(!m);
      return !m;
    });
  }, []);

  /* Countdown state */
  const [countdownKey, setCountdownKey]   = useState(0);
  const [countdownDone, setCountdownDone] = useState(false);
  const pendingRestartRef = useRef(false);

  const handleCountdownComplete = useCallback(() => {
    setCountdownDone(true);
    if (pendingRestartRef.current) {
      pendingRestartRef.current = false;
      onRestart?.();
    }
  }, [onRestart]);

  const isPlaying = countdownDone && !paused && !stopped;

  const handlePlay = () => {
    if (stopped) {
      setStopped(false);
      onRestart?.();
    } else {
      setPaused(false);
    }
  };

  const handlePause = () => {
    if (!stopped) setPaused(true);
  };

  const handleStop = () => {
    setPaused(false);
    setStopped(true);
  };

  const handleRestart = () => {
    setPaused(false);
    setStopped(false);
    setCountdownDone(false);
    pendingRestartRef.current = true;
    setCountdownKey(k => k + 1);
  };

  return (
    <div className="game-shell-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 123GO! countdown overlay */}
      {!countdownDone && (
        <CountdownOverlay
          countdownKey={countdownKey}
          onComplete={handleCountdownComplete}
        />
      )}

      {/* Top bar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        padding: '0 12px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* LEFT: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setLocation('/catalog')}
            aria-label="Voltar ao catálogo"
            className="btn-interactive"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1.5px solid var(--border)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              color: 'var(--text2)',
              flexShrink: 0,
            }}
          >←</button>
          <AppleEmoji emoji={emoji} size={22} style={{ flexShrink: 0 }} />
          <h1 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'var(--text)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
        </div>

        {/* CENTER: playback controls — desktop only */}
        <div className="game-controls-desktop" style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}>
          <ControlBtn onClick={handlePlay} title="Jogar" active={!isPlaying}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </ControlBtn>
          <ControlBtn onClick={handlePause} title="Pausar" active={isPlaying}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          </ControlBtn>
          <ControlBtn onClick={handleStop} title="Parar" active={!stopped}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          </ControlBtn>
          <ControlBtn onClick={handleRestart} title="Reiniciar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
          </ControlBtn>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />

          {/* Sound toggle */}
          <ControlBtn
            onClick={toggleMuted}
            title={muted ? 'Ativar som' : 'Desativar som'}
            active={!muted}
          >
            <SoundIcon muted={muted} />
          </ControlBtn>
        </div>

        {/* RIGHT: score */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {score !== undefined && (
            <span className="entry-pop" style={{
              background: color,
              color: '#fff',
              fontFamily: 'Nunito',
              fontWeight: 800,
              fontSize: 14,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              flexShrink: 0,
              letterSpacing: '0.02em',
            }}>
              ★ {score}
            </span>
          )}
        </div>
      </div>

      {/* Mobile controls bar — shown only on small screens */}
      <div className="game-controls-mobile" style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}>
        <ControlBtn onClick={handlePlay} title="Jogar" active={!isPlaying}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        </ControlBtn>
        <ControlBtn onClick={handlePause} title="Pausar" active={isPlaying}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </ControlBtn>
        <ControlBtn onClick={handleStop} title="Parar" active={!stopped}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
        </ControlBtn>
        <ControlBtn onClick={handleRestart} title="Reiniciar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
          </svg>
        </ControlBtn>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />

        {/* Sound toggle */}
        <ControlBtn
          onClick={toggleMuted}
          title={muted ? 'Ativar som' : 'Desativar som'}
          active={!muted}
        >
          <SoundIcon muted={muted} />
        </ControlBtn>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', padding: '6px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: totalPhases }).map((_, i) => {
            const phaseNum = i + 1;
            const done = phaseNum < currentPhase;
            const current = phaseNum === currentPhase;
            return (
              <div
                key={i}
                style={{
                  width: done || current ? 28 : 20,
                  height: 10,
                  borderRadius: 5,
                  background: done ? color : current ? color : 'var(--border)',
                  opacity: current ? 1 : done ? 0.85 : 0.3,
                  transition: 'all 0.3s ease',
                  animation: current && isPlaying ? 'pulseDot 1.2s ease-in-out infinite' : 'none',
                }}
              />
            );
          })}
        </div>
        <span style={{ color: 'var(--text2)', fontSize: 12, fontWeight: 700, fontFamily: 'Nunito', whiteSpace: 'nowrap' }}>
          {currentPhase}/{totalPhases}
        </span>
      </div>

      {/* Game content */}
      <div className="game-area" style={{ flex: 1, padding: '14px 14px', maxWidth: 720, margin: '0 auto', width: '100%', position: 'relative' }}>
        {children}

        {/* Paused overlay */}
        {paused && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            borderRadius: 12,
            zIndex: 40,
          }}>
            <div style={{ fontSize: 56 }}>⏸️</div>
            <p style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, color: 'var(--text)', margin: 0 }}>Jogo pausado</p>
            <button
              onClick={handlePlay}
              style={{
                padding: '12px 28px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: color,
                color: '#fff',
                fontFamily: 'Nunito',
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              Retomar
            </button>
          </div>
        )}

        {/* Stopped overlay */}
        {stopped && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            borderRadius: 12,
            zIndex: 40,
          }}>
            <div style={{ fontSize: 56 }}>⏹️</div>
            <p style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, color: 'var(--text)', margin: 0 }}>Jogo encerrado</p>
            <p style={{ color: 'var(--text2)', fontSize: 14, margin: 0 }}>Deseja jogar novamente?</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => setLocation('/catalog')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border)',
                  background: '#fff',
                  color: 'var(--text)',
                  fontFamily: 'Nunito',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ← Voltar ao catálogo
              </button>
              <button
                onClick={handleRestart}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: color,
                  color: '#fff',
                  fontFamily: 'Nunito',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                ↺ Recomeçar
              </button>
            </div>
          </div>
        )}
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
  useEffect(() => {
    if (type === 'correct') {
      playCorrect();
      burstParticles(window.innerWidth / 2, window.innerHeight / 2, 22);
    } else if (type === 'wrong') {
      playWrong();
    }
  }, [type]);

  if (!type) return null;

  const isCorrect = type === 'correct';

  return (
    <>
      {/* Screen flash */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: isCorrect ? '#22C55E' : '#EF4444',
        zIndex: 498,
        pointerEvents: 'none',
        animation: isCorrect ? 'flash-correct 0.5s ease-out forwards' : 'flash-wrong 0.45s ease-out forwards',
      }} />

      {/* Main emoji */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 90,
        zIndex: 500,
        animation: isCorrect
          ? 'feedbackBounce 0.65s cubic-bezier(.36,.07,.19,.97) forwards'
          : 'feedbackShake 0.55s ease-in-out forwards',
        pointerEvents: 'none',
        lineHeight: 1,
      }}>
        {isCorrect ? '✅' : '❌'}
      </div>

      <style>{`
        @keyframes feedbackBounce {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          40%  { opacity: 1; transform: translate(-50%, -50%) scale(1.45); }
          65%  { transform: translate(-50%, -50%) scale(0.88); }
          82%  { opacity: 1; transform: translate(-50%, -50%) scale(1.12); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
        @keyframes feedbackShake {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          12%  { opacity: 1; transform: translate(calc(-50% - 14px), -50%) scale(1.15) rotate(-6deg); }
          24%  { transform: translate(calc(-50% + 14px), -50%) scale(1.15) rotate(6deg); }
          36%  { transform: translate(calc(-50% - 10px), -50%) scale(1.05) rotate(-3deg); }
          48%  { transform: translate(calc(-50% + 10px), -50%) scale(1.05) rotate(3deg); }
          60%  { transform: translate(calc(-50% - 5px), -50%) scale(1); }
          72%  { transform: translate(calc(-50% + 5px), -50%) scale(1); }
          85%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
        }
      `}</style>
    </>
  );
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const FRIENDLY_MESSAGES: Record<number, string[]> = {
  5: ['Incrível! Você acertou tudo!', 'Perfeito! Nota 10!', 'Campeão! Acertos em cheio!'],
  4: ['Muito bom! Quase perfeito!', 'Excelente! Continue assim!', 'Arrasou! Só faltou um!'],
  3: ['Bom trabalho! Você está evoluindo!', 'Continue assim, está indo bem!', 'Metade do caminho! Vai lá!'],
  2: ['Não desista, continue tentando!', 'Bom esforço! Pratique mais!', 'Cada tentativa te deixa mais forte!'],
  1: ['Continue tentando, você consegue!', 'A prática leva à perfeição!', 'Não desanime, tente de novo!'],
  0: ['Que tal tentar mais uma vez?', 'Todo começo tem um primeiro passo!', 'Tente de novo, você vai melhorar!'],
};

function getFriendlyMessage(score: number, total: number): string {
  const pct = total > 0 ? Math.round((score / total) * 5) : 0;
  const msgs = FRIENDLY_MESSAGES[Math.max(0, Math.min(5, pct))] ?? FRIENDLY_MESSAGES[3];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

async function generateShareImage(
  playerName: string,
  gameTitle: string,
  score: number,
  totalPhases: number,
  message: string,
  siteUrl: string,
): Promise<Blob> {
  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#4F46E5');
  grad.addColorStop(1, '#7C3AED');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(120, 130, 230, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W - 80, H - 80, 200, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W - 50, 190, 110, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  const cX = 70, cY = 80, cW = W - 140, cH = H - 160;
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#fff';
  drawRoundRect(ctx, cX, cY, cW, cH, 40);
  ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  ctx.textAlign = 'center';

  const brandColors = ['#F97316','#6366F1','#22C55E','#EF4444','#F97316','#6366F1'];
  const brand = '123GO!';
  ctx.font = 'bold 60px Nunito, system-ui, sans-serif';
  const bw = ctx.measureText(brand).width;
  let bx = W / 2 - bw / 2;
  for (let i = 0; i < brand.length; i++) {
    ctx.fillStyle = brandColors[i % brandColors.length];
    const prev = ctx.measureText(brand.slice(0, i)).width;
    const cur = ctx.measureText(brand[i]).width;
    ctx.fillText(brand[i], bx + prev + cur / 2, cY + 78);
  }

  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(cX + 60, cY + 100, cW - 120, 2);

  ctx.font = 'bold 46px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#4F46E5';
  ctx.fillText(message, W / 2, cY + 190);

  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(cX + 60, cY + 218, cW - 120, 2);

  const titleLine = gameTitle.length > 30 ? gameTitle.slice(0, 28) + '…' : gameTitle;
  ctx.font = 'bold 40px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#1F2937';
  ctx.fillText(titleLine, W / 2, cY + 295);

  ctx.font = '32px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText('Plataforma 123GO! — Matemática 1º Ano', W / 2, cY + 345);

  const starsText = '★'.repeat(score) + '☆'.repeat(Math.max(0, totalPhases - score));
  ctx.font = '64px serif';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(starsText, W / 2, cY + 450);

  ctx.font = 'bold 38px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#374151';
  ctx.fillText(`${score} de ${totalPhases} acertos`, W / 2, cY + 510);

  const displayName = playerName.trim();
  if (displayName) {
    ctx.font = '30px Nunito, system-ui, sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText(`Jogador(a): ${displayName.slice(0, 20)}`, W / 2, cY + 560);
  }

  const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.font = '28px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText(date, W / 2, displayName ? cY + 605 : cY + 570);

  ctx.fillStyle = '#E5E7EB';
  const divY = displayName ? cY + 635 : cY + 600;
  ctx.fillRect(cX + 60, divY, cW - 120, 2);

  ctx.font = '26px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText('Acesse e jogue também:', W / 2, divY + 50);

  ctx.font = 'bold 32px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#4F46E5';
  ctx.fillText(siteUrl, W / 2, divY + 94);

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'));
}

interface ShareModalProps {
  score: number;
  totalPhases: number;
  onClose: () => void;
}

function ShareModal({ score, totalPhases, onClose }: ShareModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'done' | 'copied'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const game = games.find(g => g.path === path);
  const gameTitle = game?.title ?? '123GO!';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const [message] = useState(() => getFriendlyMessage(score, totalPhases));
  const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleShare = async () => {
    setLoading(true);
    try {
      const blob = await generateShareImage(name, gameTitle, score, totalPhases, message, siteUrl);
      const file = new File([blob], '123go-progresso.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `123GO! — ${gameTitle}`,
          text: `${message} Joguei "${gameTitle}" e fiz ${score} de ${totalPhases} acertos! Acesse e jogue também:`,
          url: siteUrl,
          files: [file],
        });
        setShareState('done');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = '123go-progresso.png'; a.click();
        URL.revokeObjectURL(url);
        try {
          await navigator.clipboard.writeText(siteUrl);
          setShareState('copied');
        } catch {
          setShareState('done');
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stars = '★'.repeat(score) + '☆'.repeat(Math.max(0, totalPhases - score));

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440,
        boxShadow: '0 28px 72px rgba(0,0,0,0.28)', position: 'relative',
        animation: 'shareModalIn 0.28s cubic-bezier(.34,1.56,.64,1)',
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'absolute', top: 12, right: 12, width: 30, height: 30,
            borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#fff', zIndex: 2,
          }}
        >✕</button>

        {/* Progress card preview */}
        <div style={{
          background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
          padding: '18px 20px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'Nunito' }}>
            123GO! — Plataforma de Matemática
          </div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 17, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>
            {message}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: '#fff', marginBottom: 3 }}>{gameTitle}</div>
            <div style={{ fontSize: 22, color: '#FBBF24', letterSpacing: 2, marginBottom: 4 }}>{stars}</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: '#fff' }}>
              {score} de {totalPhases} acertos
            </div>
            <div style={{ fontFamily: 'Nunito', fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{date}</div>
          </div>
        </div>

        {/* Bottom section */}
        <div style={{ padding: '14px 18px 16px' }}>
          <label style={{ display: 'block', fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Apelido ou primeiro nome (opcional)
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setShareState('idle'); }}
            placeholder="Ex: Mia, João, Bela…"
            maxLength={20}
            autoComplete="off"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px',
              borderRadius: 12, border: '1.5px solid var(--border)',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: 'var(--text)',
              outline: 'none', marginBottom: 6, background: 'var(--bg)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#4F46E5')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <p style={{ fontFamily: 'Nunito', fontSize: 12, color: 'var(--text2)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Apenas apelido ou primeiro nome para proteger sua privacidade
          </p>

          <button
            onClick={handleShare}
            disabled={loading}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 'var(--radius-pill)',
              background: shareState === 'done' || shareState === 'copied' ? '#22C55E' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
              color: '#fff', fontFamily: 'Nunito', fontWeight: 800, fontSize: 15,
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.75 : 1, transition: 'background 0.25s ease', minHeight: 50,
            }}
          >
            {loading ? 'Gerando imagem…' : shareState === 'done' ? '✅ Compartilhado!' : shareState === 'copied' ? '✅ Imagem salva + link copiado!' : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Compartilhar progresso
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
            Uma imagem com o progresso será gerada para compartilhar
          </p>
        </div>
      </div>
      <style>{`
        @keyframes shareModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
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
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (isGameComplete) {
      const t = setTimeout(() => setShowShare(true), 900);
      return () => clearTimeout(t);
    }
  }, [isGameComplete]);

  return (
    <>
      {showShare && (
        <ShareModal
          score={score}
          totalPhases={totalPhases}
          onClose={() => setShowShare(false)}
        />
      )}
      <div
        className="entry-pop"
        style={{
          background: '#fff',
          borderRadius: 'var(--radius)',
          padding: 22,
          textAlign: 'center',
          boxShadow: 'var(--shadow-hover)',
          border: '1.5px solid var(--border)',
        }}
      >
        <div style={{ marginBottom: 12, lineHeight: 1 }}>
          <AppleEmoji
            emoji={isGameComplete ? '🏆' : '⭐'}
            size={80}
            className="game-character-idle"
          />
        </div>
        <h2 className="entry-pop" style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, color: 'var(--text)', marginBottom: 6 }}>
          {isGameComplete ? 'Parabéns! Jogo completo!' : `Fase ${phase} completa!`}
        </h2>
        <p className="entry-pop" style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 18 }}>
          {isGameComplete
            ? `Você completou todas as ${totalPhases} fases com ${score} acertos!`
            : `Continue para a próxima fase!`}
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-interactive action-btn"
            onClick={onRestart}
            style={{
              padding: '12px 22px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border)',
              background: '#fff',
              color: 'var(--text)',
              fontFamily: 'Nunito',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              minHeight: 52,
            }}
          >
            🔄 Recomeçar
          </button>
          {!isGameComplete && (
            <button
              className="btn-interactive action-btn"
              onClick={onNext}
              style={{
                padding: '12px 22px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: color,
                color: '#fff',
                fontFamily: 'Nunito',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                minHeight: 52,
              }}
            >
              Próxima fase →
            </button>
          )}
          {isGameComplete && (
            <>
              <button
                className="btn-interactive action-btn"
                onClick={() => setShowShare(true)}
                style={{
                  padding: '12px 22px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                  color: '#fff',
                  fontFamily: 'Nunito',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  minHeight: 52,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Compartilhar
              </button>
              <button
                className="btn-interactive action-btn"
                onClick={() => setLocation('/catalog')}
                style={{
                  padding: '12px 22px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: color,
                  color: '#fff',
                  fontFamily: 'Nunito',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  minHeight: 52,
                }}
              >
                Ver outros jogos →
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
