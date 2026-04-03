import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Trail,
  getGame,
  getTrailVisited,
  markTrailGameVisited,
  getTrailPerformance,
  setTrailPerformance,
  resetTrail,
} from '../data/trails';

interface Props {
  trail: Trail;
  onClose: () => void;
}

type PerfChoice = 'high' | 'low' | null;

export function TrailModal({ trail, onClose }: Props) {
  const [, setLocation] = useLocation();
  const [visited, setVisited] = useState<number[]>(() => getTrailVisited(trail.tema));
  const [perf, setPerf] = useState<PerfChoice>(() => getTrailPerformance(trail.tema));
  const [showPerfAsk, setShowPerfAsk] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const base = trail.steps.filter(s => s.role === 'base');
  const reinforcement = trail.steps.find(s => s.role === 'reinforcement')!;
  const expert = trail.steps.find(s => s.role === 'expert')!;

  const baseDone = base.every(s => visited.includes(s.gameId));
  const adaptiveDone =
    baseDone && (visited.includes(reinforcement.gameId) || visited.includes(expert.gameId));
  const trailComplete = baseDone && adaptiveDone;

  useEffect(() => {
    if (baseDone && perf === null && !showPerfAsk) {
      setShowPerfAsk(true);
    }
  }, [baseDone, perf, showPerfAsk]);

  useEffect(() => {
    if (trailComplete && !showPerfAsk) {
      setShowComplete(true);
    }
  }, [trailComplete, showPerfAsk]);

  const handlePlayStep = useCallback((gameId: number) => {
    markTrailGameVisited(trail.tema, gameId);
    const game = getGame(gameId);
    if (game) {
      localStorage.setItem('active_trail', trail.tema);
      setLocation(game.path);
      onClose();
    }
  }, [trail.tema, setLocation, onClose]);

  const handlePerfChoice = (choice: 'high' | 'low') => {
    setTrailPerformance(trail.tema, choice);
    setPerf(choice);
    setShowPerfAsk(false);
  };

  const handleReset = () => {
    resetTrail(trail.tema);
    setVisited([]);
    setPerf(null);
    setShowPerfAsk(false);
    setShowComplete(false);
  };

  const completedBase = base.filter(s => visited.includes(s.gameId)).length;
  const scoreMsg = trailComplete
    ? perf === 'high'
      ? `Mestre d${trail.tema === 'algebra' ? 'a' : 'e'} ${trail.shortLabel}! Você completou o desafio!`
      : 'Muito bem! Você dominou o básico, continue praticando!'
    : null;

  const c = trail.color;

  const handleShare = async () => {
    const msg = `🎉 Completei a Trilha de ${trail.label} no 123GO!\n${trail.skills.map(s => `✅ ${s}`).join('\n')}\nJogue você também: https://123go.replit.app`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Trilha de ${trail.label} — 123GO!`, text: msg });
      } else {
        await navigator.clipboard.writeText(msg);
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(msg);
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      } catch {}
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 0,
        animation: 'fadeInOverlay 0.2s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="trail-modal-body"
        style={{
          width: '100%', maxWidth: 520,
          maxHeight: '92dvh',
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          animation: 'slideUp 0.32s cubic-bezier(.32,1,.6,1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* ── Header gradient ── */}
        <div style={{
          background: trail.gradient,
          padding: '20px 20px 16px',
          borderRadius: '24px 24px 0 0',
          position: 'relative',
        }}>
          {/* Close btn */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 34, height: 34, borderRadius: '50%',
              border: 'none', background: 'rgba(0,0,0,0.12)',
              color: trail.darkColor,
              fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, lineHeight: 1,
            }}
          >×</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 36, lineHeight: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))' }}>{trail.emoji}</span>
            <div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: trail.darkColor, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>Trilha de Matemática</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 20, color: trail.darkColor, lineHeight: 1.1 }}>{trail.label}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: trail.darkColor, opacity: 0.8 }}>
                {completedBase}/{base.length} jogos base
              </span>
              {trailComplete && (
                <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: trail.darkColor }}>
                  ✅ Trilha completa!
                </span>
              )}
            </div>
            <div style={{ height: 8, background: 'rgba(0,0,0,0.12)', borderRadius: 4 }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: trail.darkColor,
                width: `${(completedBase / base.length) * 100}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '20px 20px 32px', flex: 1 }}>

          {/* Performance ask: shown after base games done if perf unknown */}
          {showPerfAsk && (
            <div style={{
              background: '#FFFBEB', border: '2px solid #FCD34D',
              borderRadius: 16, padding: '16px',
              marginBottom: 20,
              animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1)',
            }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: '#92400E', marginBottom: 4 }}>
                🌟 Parabéns! Jogos base concluídos!
              </div>
              <div style={{ fontFamily: 'Nunito', fontSize: 13, color: '#78350F', marginBottom: 12 }}>
                Como você se saiu nos jogos?
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handlePerfChoice('low')}
                  style={perfBtnStyle('#DBEAFE', '#1E40AF')}
                >
                  😓 Preciso praticar
                </button>
                <button
                  onClick={() => handlePerfChoice('high')}
                  style={perfBtnStyle('#D1FAE5', '#065F46')}
                >
                  🚀 Fui muito bem!
                </button>
              </div>
            </div>
          )}

          {/* Trail steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Base games */}
            <div style={{ marginBottom: 8 }}>
              <SectionLabel>📚 Jogos Obrigatórios</SectionLabel>
            </div>
            {base.map((step, i) => {
              const game = getGame(step.gameId);
              const done = visited.includes(step.gameId);
              const isNext = !done && base.slice(0, i).every(s => visited.includes(s.gameId));
              return (
                <React.Fragment key={`base-${i}`}>
                  <StepNode
                    step={step}
                    game={game}
                    done={done}
                    isNext={isNext}
                    locked={false}
                    color={c}
                    onPlay={() => handlePlayStep(step.gameId)}
                  />
                  {i < base.length - 1 && <StepConnector color={c} done={done} />}
                </React.Fragment>
              );
            })}

            {/* Fork */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
              <div style={{ width: 2, height: 20, background: baseDone ? c : '#E5E7EB' }} />
              {baseDone && (
                <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: c, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Escolha seu caminho
                </div>
              )}
            </div>

            {/* Adaptive paths side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Reinforcement */}
              {(() => {
                const done = visited.includes(reinforcement.gameId);
                const locked = !baseDone;
                const recommended = !locked && perf === 'low';
                const game = getGame(reinforcement.gameId);
                return (
                  <AdaptiveNode
                    step={reinforcement}
                    game={game}
                    done={done}
                    locked={locked}
                    recommended={recommended}
                    label="Reforço"
                    labelColor="#B45309"
                    labelBg="#FEF9C3"
                    badgeEmoji="🟡"
                    color="#D97706"
                    onPlay={() => handlePlayStep(reinforcement.gameId)}
                  />
                );
              })()}

              {/* Expert */}
              {(() => {
                const done = visited.includes(expert.gameId);
                const locked = !baseDone;
                const recommended = !locked && perf === 'high';
                const game = getGame(expert.gameId);
                return (
                  <AdaptiveNode
                    step={expert}
                    game={game}
                    done={done}
                    locked={locked}
                    recommended={recommended}
                    label="Desafio Expert"
                    labelColor="#6D28D9"
                    labelBg="#EDE9FE"
                    badgeEmoji="🚀"
                    color="#7C3AED"
                    onPlay={() => handlePlayStep(expert.gameId)}
                  />
                );
              })()}
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginTop: 24 }}>
            <SectionLabel>🏅 Habilidades desta trilha</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {trail.skills.map((skill, i) => {
                const unlocked = i < completedBase;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: unlocked ? `${c}10` : '#F9FAFB',
                    border: `1.5px solid ${unlocked ? c + '40' : '#E5E7EB'}`,
                    borderRadius: 12,
                    transition: 'all 0.3s ease',
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{unlocked ? '✅' : '🔒'}</span>
                    <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: unlocked ? '#111' : '#9CA3AF', lineHeight: 1.3 }}>
                      {skill}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          {(visited.length > 0) && (
            <button
              onClick={handleReset}
              style={{
                marginTop: 20, width: '100%',
                padding: '10px 0',
                borderRadius: 12, border: '1.5px solid #E5E7EB',
                background: 'transparent',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 13,
                color: '#9CA3AF', cursor: 'pointer',
              }}
            >
              🔄 Recomeçar trilha
            </button>
          )}
        </div>
      </div>

      {/* ── Completion Modal ── */}
      {showComplete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowComplete(false); }}
        >
          <div style={{
            background: '#fff', borderRadius: 24,
            padding: '32px 24px 24px',
            maxWidth: 360, width: '100%',
            textAlign: 'center',
            animation: 'popIn 0.4s cubic-bezier(.34,1.56,.64,1)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 12, lineHeight: 1 }}>🏆</div>
            <div style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 20,
              color: trail.darkColor, marginBottom: 8, lineHeight: 1.2,
            }}>
              {scoreMsg}
            </div>
            <div style={{ fontFamily: 'Nunito', fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
              Trilha de {trail.label} concluída!
            </div>

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, color: '#374151', marginBottom: 10 }}>
                ✨ Habilidades conquistadas:
              </div>
              {trail.skills.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                  <span style={{ color: trail.color, fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: 'Nunito', fontSize: 13, color: '#374151' }}>{s}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleShare}
              style={{
                width: '100%', padding: '14px 0',
                borderRadius: 14, border: 'none',
                background: trail.color, color: '#fff',
                fontFamily: 'Nunito', fontWeight: 800, fontSize: 15,
                cursor: 'pointer', marginBottom: 10,
              }}
            >
              {copyDone ? '✅ Copiado!' : '📤 Compartilhar Progresso'}
            </button>
            <button
              onClick={() => setShowComplete(false)}
              style={{
                width: '100%', padding: '12px 0',
                borderRadius: 14,
                border: '1.5px solid #E5E7EB',
                background: 'transparent',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
                color: '#6B7280', cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {children}
    </div>
  );
}

function StepConnector({ color, done }: { color: string; done: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 2, height: 16, background: done ? color : '#E5E7EB', transition: 'background 0.4s ease' }} />
    </div>
  );
}

function StepNode({ step, game, done, isNext, locked, color, onPlay }: {
  step: { label: string };
  game: ReturnType<typeof getGame>;
  done: boolean;
  isNext: boolean;
  locked: boolean;
  color: string;
  onPlay: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: done ? `${color}12` : isNext ? '#F9FAFB' : '#FAFAFA',
      border: `2px solid ${done ? color + '60' : isNext ? color : '#E5E7EB'}`,
      borderRadius: 16,
      transition: 'all 0.3s ease',
      animation: isNext ? 'pulseDot 2s ease-in-out infinite' : 'none',
    }}>
      {/* Status dot */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: done ? color : isNext ? color + '20' : '#F3F4F6',
        border: `2px solid ${done ? color : isNext ? color : '#E5E7EB'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>
        {done ? '✅' : isNext ? <span style={{ fontSize: 12, color }}>▶</span> : <span style={{ fontSize: 12, color: '#9CA3AF' }}>○</span>}
      </div>

      {/* Game info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {step.label}
        </div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {game?.emoji} {game?.title}
        </div>
        <div style={{ fontFamily: 'Nunito', fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {game?.desc}
        </div>
      </div>

      {/* Play btn */}
      {!done && (
        <button
          onClick={onPlay}
          disabled={locked}
          style={{
            flexShrink: 0,
            padding: '8px 14px',
            borderRadius: 10, border: 'none',
            background: locked ? '#E5E7EB' : color,
            color: locked ? '#9CA3AF' : '#fff',
            fontFamily: 'Nunito', fontWeight: 800, fontSize: 13,
            cursor: locked ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {locked ? '🔒' : '▶ Jogar'}
        </button>
      )}
    </div>
  );
}

function AdaptiveNode({ step, game, done, locked, recommended, label, labelColor, labelBg, badgeEmoji, color, onPlay }: {
  step: { label: string };
  game: ReturnType<typeof getGame>;
  done: boolean;
  locked: boolean;
  recommended: boolean;
  label: string;
  labelColor: string;
  labelBg: string;
  badgeEmoji: string;
  color: string;
  onPlay: () => void;
}) {
  return (
    <div style={{
      borderRadius: 16,
      border: `2px solid ${done ? color + '60' : recommended ? color : locked ? '#E5E7EB' : '#E5E7EB'}`,
      background: done ? `${color}10` : recommended ? `${color}08` : '#FAFAFA',
      padding: '12px',
      display: 'flex', flexDirection: 'column', gap: 8,
      position: 'relative',
      transition: 'all 0.3s ease',
      opacity: locked ? 0.5 : 1,
    }}>
      {/* Recommended badge */}
      {recommended && !done && !locked && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: color, color: '#fff',
          fontFamily: 'Nunito', fontWeight: 800, fontSize: 10,
          padding: '2px 10px', borderRadius: 99,
          whiteSpace: 'nowrap',
          animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1)',
        }}>
          ★ Recomendado
        </div>
      )}

      {/* Label chip */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: labelBg, color: labelColor,
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 10,
        padding: '2px 8px', borderRadius: 99,
        alignSelf: 'flex-start',
      }}>
        {badgeEmoji} {label}
      </div>

      {/* Game name */}
      <div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, color: locked ? '#9CA3AF' : '#111', lineHeight: 1.3 }}>
          {game?.emoji} {game?.title}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onPlay}
        disabled={locked || done}
        style={{
          width: '100%', padding: '8px 0',
          borderRadius: 10, border: 'none',
          background: done ? '#E5E7EB' : locked ? '#F3F4F6' : color,
          color: done ? '#6B7280' : locked ? '#9CA3AF' : '#fff',
          fontFamily: 'Nunito', fontWeight: 800, fontSize: 12,
          cursor: done || locked ? 'default' : 'pointer',
        }}
      >
        {done ? '✅ Concluído' : locked ? '🔒 Bloqueado' : '▶ Jogar'}
      </button>
    </div>
  );
}

function perfBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    flex: 1, padding: '10px 8px',
    borderRadius: 12, border: `1.5px solid ${color}40`,
    background: bg, color,
    fontFamily: 'Nunito', fontWeight: 800, fontSize: 13,
    cursor: 'pointer', textAlign: 'center',
  };
}
