import React, { useState } from 'react';
import { useLocation } from 'wouter';
import type { Game } from '../data/games';

const temaColors: Record<string, string> = {
  numeros: 'var(--c3)',
  algebra: 'var(--c2)',
  geometria: 'var(--c1)',
  grandezas: 'var(--c4)',
  probabilidade: 'var(--c5)',
};

const temaLabels: Record<string, string> = {
  numeros: 'Números',
  algebra: 'Álgebra',
  geometria: 'Geometria',
  grandezas: 'Grandezas e Medidas',
  probabilidade: 'Probabilidade e Estatística',
};

const periodoLabels: Record<number, string> = {
  1: '1º Bimestre',
  2: '2º Bimestre',
  3: '3º Bimestre',
};

interface GameListRowProps {
  game: Game;
  onInfo: (game: Game) => void;
}

export function GameListRow({ game, onInfo }: GameListRowProps) {
  const [, setLocation] = useLocation();
  const [hovered, setHovered] = useState(false);
  const color = temaColors[game.tema];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        overflow: 'hidden',
      }}
    >
      {/* Emoji thumbnail strip */}
      <div style={{
        width: 64,
        minWidth: 64,
        height: 64,
        background: game.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        flexShrink: 0,
      }}>
        {game.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '10px 14px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
          <h3 style={{
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 14,
            color: 'var(--text)',
            lineHeight: 1.2,
            margin: 0,
          }}>
            {game.title}
          </h3>
          <span style={{
            background: 'var(--text)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'Nunito',
            whiteSpace: 'nowrap',
          }}>
            {periodoLabels[game.periodo]}
          </span>
          <span style={{
            background: color,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'Nunito',
            whiteSpace: 'nowrap',
          }}>
            {temaLabels[game.tema]}
          </span>
        </div>
        <p style={{
          color: 'var(--text2)',
          fontSize: 12,
          lineHeight: 1.4,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {game.desc}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onInfo(game); }}
          aria-label={`Informações sobre ${game.title}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--bg)',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text2)',
            flexShrink: 0,
          }}
        >
          i
        </button>
        <button
          onClick={() => setLocation(game.path)}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-pill)',
            background: color,
            color: '#fff',
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minHeight: 36,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          🎮 Jogar
        </button>
      </div>
    </div>
  );
}
