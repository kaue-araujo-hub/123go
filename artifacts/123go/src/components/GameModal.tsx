import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import type { Game } from '../data/games';

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
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(26,26,46,0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Desktop centering wrapper */}
      <div className="modal-wrapper" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
        <div
          ref={dialogRef}
          className="modal-content"
          style={{
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            width: '100%',
            maxWidth: 520,
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: 0,
          }}
        >
          {/* Handle (mobile) */}
          <div className="modal-handle" style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
            <div style={{ width: 40, height: 4, background: '#E8E8F0', borderRadius: 2 }}/>
          </div>

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
              fontSize: 28,
              flexShrink: 0,
            }}>
              {game.emoji}
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

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Objeto de Conhecimento
              </p>
              <p style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6 }}>{game.objeto}</p>
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
            >
              🎮 Jogar agora
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 600px) {
          .modal-wrapper {
            align-items: center !important;
            height: 100%;
          }
          .modal-content {
            border-radius: 20px !important;
          }
          .modal-handle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
