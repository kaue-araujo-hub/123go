import React from 'react';
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

const FLOAT_DELAYS = ['0s','0.4s','0.8s','1.2s','1.6s','2s','0.2s','0.6s','1s','1.4s'];

interface GameCardProps {
  game: Game;
  onInfo: (game: Game) => void;
}

export function GameCard({ game, onInfo }: GameCardProps) {
  const [, setLocation] = useLocation();
  const floatDelay = FLOAT_DELAYS[(game.id as number) % FLOAT_DELAYS.length] ?? '0s';

  const handleCardClick = () => setLocation(game.path);
  const handleInfoClick = (e: React.MouseEvent) => { e.stopPropagation(); onInfo(game); };

  return (
    <div
      onClick={handleCardClick}
      className="card-interactive"
      style={{
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Tags */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        right: 40,
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        zIndex: 2,
      }}>
        <span style={{
          background: '#7C3AED',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
          fontFamily: 'Nunito',
        }}>
          {game.ano}º Ano
        </span>
        <span style={{
          background: 'var(--text)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
          fontFamily: 'Nunito',
        }}>
          {periodoLabels[game.periodo]}
        </span>
        <span style={{
          background: temaColors[game.tema],
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
          fontFamily: 'Nunito',
        }}>
          {temaLabels[game.tema]}
        </span>
      </div>

      {/* Info button */}
      <button
        onClick={handleInfoClick}
        aria-label={`Informações sobre ${game.title}`}
        className="btn-interactive"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
          border: '1.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text2)',
        }}
      >
        i
      </button>

      {/* Thumbnail */}
      <div style={{
        height: 140,
        background: game.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <AppleEmoji
          emoji={game.emoji}
          size={72}
          className="card-emoji"
          style={{
            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.18))',
            '--float-delay': floatDelay,
          } as React.CSSProperties}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 14px' }}>
        <h3 style={{
          fontFamily: 'Nunito',
          fontWeight: 800,
          fontSize: 15,
          color: 'var(--text)',
          marginBottom: 4,
          lineHeight: 1.3,
        }}>
          {game.title}
        </h3>
        <p style={{
          color: 'var(--text2)',
          fontSize: 13,
          lineHeight: 1.5,
          marginBottom: 12,
        }}>
          {game.desc}
        </p>

        {/* Play button */}
        <button
          onClick={handleCardClick}
          className="btn-interactive"
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 'var(--radius-pill)',
            background: temaColors[game.tema],
            color: '#fff',
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 14,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            minHeight: 40,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none', flexShrink: 0 }}><polygon points="5,3 19,12 5,21"/></svg> Jogar
        </button>
      </div>
    </div>
  );
}
