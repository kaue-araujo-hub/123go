import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useLocation } from 'wouter';
import { games } from '../data/games';

const FEATURED_IDS = [1, 4, 7, 11, 15, 18];

const temaColors: Record<string, string> = {
  numeros:      '#10B981',
  algebra:      '#3B82F6',
  geometria:    '#F59E0B',
  grandezas:    '#8B5CF6',
  probabilidade:'#EF4444',
};
const temaLabels: Record<string, string> = {
  numeros:      'Números',
  algebra:      'Álgebra',
  geometria:    'Geometria',
  grandezas:    'Grandezas',
  probabilidade:'Probabilidade',
};

const medals = ['🥇', '🥈', '🥉', '4°', '5°', '6°'];

export function FeaturedCarousel() {
  const [, setLocation] = useLocation();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    skipSnaps: false,
    dragFree: true,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const featured = FEATURED_IDS.map(id => games.find(g => g.id === id)).filter(Boolean) as typeof games;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 15,
            color: 'var(--text)',
          }}>Mais Jogados</span>
        </div>

        {/* Nav arrows */}
        <div style={{ display: 'flex', gap: 6 }}>
          <NavBtn onClick={scrollPrev} disabled={!canPrev} dir="left" />
          <NavBtn onClick={scrollNext} disabled={!canNext} dir="right" />
        </div>
      </div>

      {/* Embla viewport */}
      <div ref={emblaRef} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          {featured.map((game, i) => (
            <FeaturedCard
              key={game.id}
              game={game}
              rank={i}
              medal={medals[i]}
              onClick={() => setLocation(game.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({
  game,
  rank,
  medal,
  onClick,
}: {
  game: (typeof games)[0];
  rank: number;
  medal: string;
  onClick: () => void;
}) {
  const accent = temaColors[game.tema] ?? '#10B981';
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        flex: '0 0 220px',
        borderRadius: 16,
        background: '#fff',
        border: `2px solid ${hovered ? accent : 'var(--border)'}`,
        boxShadow: hovered
          ? `0 8px 24px ${accent}30`
          : '0 2px 8px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top band with emoji */}
      <div style={{
        background: game.bg,
        padding: '18px 16px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 88,
      }}>
        {/* Rank badge */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 12,
          fontFamily: 'Nunito',
          fontWeight: 800,
          fontSize: rank < 3 ? 18 : 13,
          lineHeight: 1,
          color: rank < 3 ? undefined : 'var(--text2)',
        }}>
          {medal}
        </div>
        <span style={{ fontSize: 46, lineHeight: 1, display: 'block', userSelect: 'none' }}>
          {game.emoji}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{
          fontFamily: 'Nunito',
          fontWeight: 800,
          fontSize: 14,
          color: 'var(--text)',
          lineHeight: 1.3,
          margin: 0,
        }}>
          {game.title}
        </p>

        {/* Tema chip */}
        <span style={{
          display: 'inline-block',
          background: `${accent}18`,
          color: accent,
          fontFamily: 'Nunito',
          fontWeight: 700,
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 6,
          alignSelf: 'flex-start',
        }}>
          {temaLabels[game.tema]}
        </span>

        {/* Play button */}
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          style={{
            marginTop: 'auto',
            width: '100%',
            padding: '7px 0',
            borderRadius: 10,
            border: 'none',
            background: accent,
            color: '#fff',
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          ▶ Jogar
        </button>
      </div>
    </div>
  );
}

function NavBtn({ onClick, disabled, dir }: { onClick: () => void; disabled: boolean; dir: 'left' | 'right' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: '1.5px solid var(--border)',
        background: disabled ? 'var(--bg)' : '#fff',
        color: disabled ? 'var(--text3)' : 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
      aria-label={dir === 'left' ? 'Anterior' : 'Próximo'}
    >
      {dir === 'left' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </button>
  );
}
