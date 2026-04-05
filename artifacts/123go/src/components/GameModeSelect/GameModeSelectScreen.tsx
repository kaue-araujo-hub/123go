import React, { useState } from 'react';
import type { GameMode } from '../../auth/SessionManager';

interface Props {
  onSelect: (mode: GameMode) => void;
  onBack:   () => void;
}

interface ModeCard {
  mode:     GameMode;
  emoji:    string;
  label:    string;
  tagline:  string;
  desc:     string;
  color:    string;
  bg:       string;
  border:   string;
  glow:     string;
}

const MODES: ModeCard[] = [
  {
    mode:    'practice',
    emoji:   '🟢',
    label:   'Prática',
    tagline: 'Livre e sem pressa',
    desc:    'Explore sem pressão. Erros são bem-vindos!',
    color:   '#15803D',
    bg:      '#F0FDF4',
    border:  '#86EFAC',
    glow:    'rgba(21,128,61,0.18)',
  },
  {
    mode:    'challenge',
    emoji:   '🟡',
    label:   'Desafio',
    tagline: 'Teste seus limites',
    desc:    'Mostre o que você sabe e acumule estrelas!',
    color:   '#B45309',
    bg:      '#FFFBEB',
    border:  '#FCD34D',
    glow:    'rgba(180,83,9,0.18)',
  },
  {
    mode:    'time',
    emoji:   '🔴',
    label:   'Tempo',
    tagline: 'Contra o relógio',
    desc:    'Responda rápido! O tempo está correndo!',
    color:   '#DC2626',
    bg:      '#FEF2F2',
    border:  '#FCA5A5',
    glow:    'rgba(220,38,38,0.18)',
  },
];

export function GameModeSelectScreen({ onSelect, onBack }: Props) {
  const [hovered, setHovered] = useState<GameMode | null>(null);
  const [picking, setPicking] = useState<GameMode | null>(null);

  function handlePick(mode: GameMode) {
    setPicking(mode);
    localStorage.setItem('123go_game_mode', mode);
    window.dispatchEvent(new CustomEvent('123go:mode-changed', { detail: { mode } }));
    setTimeout(() => onSelect(mode), 280);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        height: 56,
        borderBottom: '1px solid var(--border)',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text3)',
            fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
            border: 'none', background: 'none', cursor: 'pointer',
            padding: '6px 4px',
            borderRadius: 8,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'; }}
        >
          ← Voltar
        </button>
        <span style={{
          fontFamily: 'Nunito', fontWeight: 800, fontSize: 15,
          color: 'var(--text)', marginLeft: 'auto', marginRight: 'auto',
          paddingRight: 60,
        }}>
          Escolha o modo de jogo
        </span>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px 40px',
        gap: 16,
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
      }}>
        <p style={{
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
          color: 'var(--text3)', textAlign: 'center', marginBottom: 4,
        }}>
          Como você quer jogar agora?
        </p>

        {MODES.map(m => {
          const isHov  = hovered  === m.mode;
          const isPick = picking  === m.mode;
          return (
            <button
              key={m.mode}
              onClick={() => handlePick(m.mode)}
              onMouseEnter={() => setHovered(m.mode)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 20px',
                borderRadius: 20,
                border: `2px solid ${isHov || isPick ? m.border : 'var(--border)'}`,
                background: isHov || isPick ? m.bg : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
                boxShadow: isHov || isPick
                  ? `0 8px 28px ${m.glow}, 0 2px 8px rgba(0,0,0,0.06)`
                  : '0 1px 4px rgba(0,0,0,0.05)',
                transform: isPick ? 'scale(0.97)' : isHov ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {/* Emoji badge */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: isHov || isPick ? `${m.color}15` : 'var(--bg)',
                border: `1.5px solid ${isHov || isPick ? m.border : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
                transition: 'all 0.18s ease',
              }}>
                {m.emoji}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontFamily: 'Nunito', fontWeight: 900, fontSize: 17,
                    color: isHov || isPick ? m.color : 'var(--text)',
                    transition: 'color 0.18s',
                  }}>{m.label}</span>
                  <span style={{
                    fontFamily: 'Nunito', fontWeight: 700, fontSize: 11,
                    color: isHov || isPick ? m.color : 'var(--text3)',
                    background: isHov || isPick ? `${m.color}12` : 'var(--bg)',
                    border: `1px solid ${isHov || isPick ? m.border : 'var(--border)'}`,
                    borderRadius: 6,
                    padding: '1px 7px',
                    transition: 'all 0.18s',
                  }}>{m.tagline}</span>
                </div>
                <p style={{
                  fontFamily: 'Nunito', fontWeight: 600, fontSize: 13,
                  color: 'var(--text2)', margin: 0, lineHeight: 1.4,
                }}>{m.desc}</p>
              </div>

              {/* Arrow */}
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke={isHov || isPick ? m.color : 'var(--text3)'}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, transition: 'all 0.18s', transform: isHov ? 'translateX(4px)' : 'none' }}
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes modeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
