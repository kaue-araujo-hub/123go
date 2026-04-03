import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import type { Game } from '../data/games';
import { AppleEmoji } from '../utils/AppleEmoji';

const temaColors: Record<string, string> = {
  numeros: 'var(--c3)',
  algebra: 'var(--c2)',
  geometria: 'var(--c1)',
  grandezas: 'var(--c4)',
  probabilidade: 'var(--c5)',
};

const periodoLabels: Record<number, string> = {
  1: '1º Bimestre',
  2: '2º Bimestre',
  3: '3º Bimestre',
};

interface GameModalProps {
  game: Game | null;
  onClose: () => void;
}

export function GameModal({ game, onClose }: GameModalProps) {
  const [, setLocation] = useLocation();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!game) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [game, onClose]);

  useEffect(() => {
    if (game) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [game]);

  if (!game) return null;

  const temaColor = temaColors[game.tema];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(26,26,46,0.5)',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
        <div
          ref={dialogRef}
          style={{
            background: '#fff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: 520,
            maxHeight: '88vh',
            overflowY: 'auto',
            padding: 0,
          }}
        >
          {/* spacer top */}
          <div style={{ height: 8 }} />

          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: temaColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AppleEmoji emoji={game.emoji} size={32} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 id="modal-title" style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 2 }}>
                {game.title}
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>
                {periodoLabels[game.periodo]} · {game.unidade}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 16,
                color: 'var(--text2)',
                flexShrink: 0,
              }}
            >✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Unidade Temática
              </p>
              <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>{game.unidade}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Habilidade
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{
                  background: temaColor,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontFamily: 'Nunito',
                }}>
                  {game.codigo}
                </span>
              </div>
              <p style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6 }}>{game.habilidade}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Objeto de Conhecimento
              </p>
              <p style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6 }}>{game.objeto}</p>
            </div>

            {/* Como Jogar */}
            <div style={{
              background: 'var(--bg)',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1.5px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Como Jogar
                </p>
              </div>
              <p style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{game.comoJogar}</p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setLocation(game.path)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--c3), var(--c2))',
                color: '#fff',
                fontFamily: 'Nunito',
                fontWeight: 800,
                fontSize: 16,
                padding: '14px 24px',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                border: 'none',
                minHeight: 52,
              }}
              className="btn-interactive"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none', flexShrink: 0, marginRight: 6, verticalAlign: 'middle' }}><polygon points="5,3 19,12 5,21"/></svg>Jogar agora
            </button>
          </div>
        </div>
    </div>
  );
}
