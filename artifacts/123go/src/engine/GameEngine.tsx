import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import confetti from 'canvas-confetti';
import { CountdownOverlay } from '../components/CountdownOverlay';
import { AppleEmoji } from '../utils/AppleEmoji';
import { isMuted, setGlobalMuted, playCorrect, playWrong } from '../utils/sounds';
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
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
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
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* LEFT: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setLocation('/catalog')}
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
              flexShrink: 0,
            }}
          >←</button>
          <AppleEmoji emoji={emoji} size={22} style={{ flexShrink: 0 }} />
          <h1 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--text)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
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
            <span style={{
              background: color,
              color: '#fff',
              fontFamily: 'Nunito',
              fontWeight: 800,
              fontSize: 13,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              flexShrink: 0,
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
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
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
                  animation: current && isPlaying ? 'pulseDot 1.2s ease-in-out infinite' : 'none',
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
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 700, margin: '0 auto', width: '100%', position: 'relative' }}>
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
        /* Desktop: show centered controls in header, hide mobile bar */
        @media (min-width: 600px) {
          .game-controls-mobile  { display: none !important; }
          .game-controls-desktop { display: flex !important; }
        }
        /* Mobile: hide centered controls in header, show bar below */
        @media (max-width: 599px) {
          .game-controls-desktop { display: none !important; }
          .game-controls-mobile  { display: flex !important; }
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
    if (type === 'correct') playCorrect();
    else if (type === 'wrong') playWrong();
  }, [type]);

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

async function generateShareImage(
  playerName: string,
  gameTitle: string,
  score: number,
  totalPhases: number,
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

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(120, 120, 240, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W - 90, H - 90, 200, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W - 60, 200, 100, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  const cX = 80, cY = 90, cW = W - 160, cH = H - 180;
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#fff';
  drawRoundRect(ctx, cX, cY, cW, cH, 40);
  ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  ctx.textAlign = 'center';

  const brandColors = ['#F97316','#6366F1','#22C55E','#EF4444','#F97316','#6366F1'];
  const brand = '123GO!';
  ctx.font = 'bold 58px Nunito, system-ui, sans-serif';
  const bw = ctx.measureText(brand).width;
  let bx = W / 2 - bw / 2;
  for (let i = 0; i < brand.length; i++) {
    ctx.fillStyle = brandColors[i % brandColors.length];
    ctx.fillText(brand[i], bx + ctx.measureText(brand.slice(0, i)).width + ctx.measureText(brand[i]).width / 2, cY + 76);
  }

  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(cX + 60, cY + 98, cW - 120, 2);

  ctx.font = '120px serif';
  ctx.fillStyle = '#000';
  ctx.fillText('🏆', W / 2, cY + 255);

  ctx.font = 'bold 52px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#1F2937';
  const displayName = (playerName.trim() || 'Você').slice(0, 24);
  ctx.fillText(`🎉 Parabéns, ${displayName}!`, W / 2, cY + 345);

  ctx.font = '34px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#6B7280';
  const shortTitle = gameTitle.length > 28 ? gameTitle.slice(0, 26) + '…' : gameTitle;
  ctx.fillText(shortTitle, W / 2, cY + 400);

  const starFilled = Math.round(score);
  const starEmpty = totalPhases - starFilled;
  ctx.font = '54px serif';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('★'.repeat(starFilled) + '☆'.repeat(Math.max(0, starEmpty)), W / 2, cY + 478);

  ctx.font = 'bold 36px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#374151';
  ctx.fillText(`${score} de ${totalPhases} acertos`, W / 2, cY + 535);

  const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.font = '28px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText(`📅 ${date}`, W / 2, cY + 588);

  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(cX + 60, cY + 618, cW - 120, 2);

  ctx.font = '26px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText('Jogue também em:', W / 2, cY + 660);

  ctx.font = 'bold 30px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#4F46E5';
  ctx.fillText(siteUrl, W / 2, cY + 702);

  ctx.font = '22px Nunito, system-ui, sans-serif';
  ctx.fillStyle = '#D1D5DB';
  ctx.fillText('Plataforma de Jogos de Matemática — 1º Ano EF', W / 2, cY + 750);

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
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const game = games.find(g => g.path === path);
  const gameTitle = game?.title ?? '123GO!';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShare = async () => {
    setLoading(true);
    try {
      const blob = await generateShareImage(name, gameTitle, score, totalPhases, siteUrl);
      const file = new File([blob], '123go-pontuacao.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: '123GO! — Minha pontuação',
          text: `Olha minha pontuação no jogo "${gameTitle}"! 🎉`,
          url: siteUrl,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = '123go-pontuacao.png'; a.click();
        URL.revokeObjectURL(url);
      }
      setDone(true);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)', position: 'relative',
        animation: 'shareModalIn 0.25s ease-out',
      }}>
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'absolute', top: 16, right: 16, width: 30, height: 30,
            borderRadius: '50%', border: '1.5px solid var(--border)', background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'var(--text2)',
          }}
        >✕</button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🏆</div>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 22, color: 'var(--text)', margin: '0 0 4px' }}>
            Compartilhar pontuação
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
            {score} de {totalPhases} acertos em <strong>{gameTitle}</strong>
          </p>
        </div>

        <label style={{ display: 'block', fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
          Seu nome (opcional)
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setDone(false); }}
          placeholder="Ex: Maria"
          maxLength={30}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '12px 14px',
            borderRadius: 12, border: '1.5px solid var(--border)',
            fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, color: 'var(--text)',
            outline: 'none', marginBottom: 16, background: 'var(--bg)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#4F46E5')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />

        <button
          onClick={handleShare}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 'var(--radius-pill)',
            background: done ? '#22C55E' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
            color: '#fff', fontFamily: 'Nunito', fontWeight: 800, fontSize: 16,
            border: 'none', cursor: loading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: loading ? 0.75 : 1, transition: 'all 0.2s ease', minHeight: 52,
          }}
        >
          {loading ? (
            <>Gerando imagem…</>
          ) : done ? (
            <>✅ Compartilhado!</>
          ) : (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Compartilhar pontuação
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, marginTop: 12, marginBottom: 0 }}>
          Uma imagem será gerada e salva no seu dispositivo
        </p>
      </div>
      <style>{`
        @keyframes shareModalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
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

  return (
    <>
      {showShare && (
        <ShareModal
          score={score}
          totalPhases={totalPhases}
          onClose={() => setShowShare(false)}
        />
      )}
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
            <>
              <button
                onClick={() => setShowShare(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                  color: '#fff',
                  fontFamily: 'Nunito',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  minHeight: 48,
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
                onClick={() => setLocation('/catalog')}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
