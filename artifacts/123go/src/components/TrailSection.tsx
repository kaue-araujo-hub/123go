import React, { useState } from 'react';
import { trails, getTrailVisited } from '../data/trails';
import { TrailModal } from './TrailModal';

export function TrailSection() {
  const [openTrail, setOpenTrail] = useState<string | null>(null);

  const activeTrail = trails.find(t => t.tema === openTrail) ?? null;

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>🗺️</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
            Trilha de Matemática
          </span>
        </div>

        {/* 5 trail cards — horizontal scroll on mobile */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
          {trails.map(trail => (
            <TrailCard
              key={trail.tema}
              trail={trail}
              onOpen={() => setOpenTrail(trail.tema)}
            />
          ))}
        </div>
      </div>

      {activeTrail && (
        <TrailModal trail={activeTrail} onClose={() => setOpenTrail(null)} />
      )}
    </>
  );
}

function TrailCard({ trail, onOpen }: { trail: typeof trails[0]; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const visited = getTrailVisited(trail.tema);
  const base = trail.steps.filter(s => s.role === 'base');
  const completedBase = base.filter(s => visited.includes(s.gameId)).length;
  const pct = completedBase / base.length;
  const allDone = pct === 1 &&
    (visited.includes(trail.steps.find(s => s.role === 'reinforcement')!.gameId) ||
     visited.includes(trail.steps.find(s => s.role === 'expert')!.gameId));

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      style={{
        flex: '0 0 170px',
        borderRadius: 20,
        background: trail.gradient,
        border: `2px solid ${hovered ? trail.color : 'transparent'}`,
        boxShadow: hovered
          ? `0 10px 28px ${trail.color}40`
          : '0 4px 14px rgba(0,0,0,0.09)',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 14px 14px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Done badge */}
      {allDone && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: trail.color, color: '#fff',
          fontFamily: 'Nunito', fontWeight: 800, fontSize: 10,
          padding: '2px 8px', borderRadius: 99,
          animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1)',
        }}>
          ✓ Completo
        </div>
      )}

      {/* Big emoji */}
      <div style={{
        fontSize: 44, lineHeight: 1, marginBottom: 10,
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))',
        transition: 'transform 0.22s ease',
        transform: hovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1)',
      }}>
        {trail.emoji}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'Nunito', fontWeight: 900, fontSize: 14,
        color: trail.darkColor, lineHeight: 1.2, marginBottom: 4,
      }}>
        {trail.shortLabel}
      </div>

      {/* Description */}
      <div style={{
        fontFamily: 'Nunito', fontSize: 11, color: trail.darkColor,
        opacity: 0.7, lineHeight: 1.4, marginBottom: 12,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {trail.description}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10, color: trail.darkColor, opacity: 0.7 }}>
            {completedBase}/{base.length} jogos
          </span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10, color: trail.darkColor, opacity: 0.7 }}>
            {Math.round(pct * 100)}%
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(0,0,0,0.12)', borderRadius: 3 }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: trail.darkColor,
            width: `${pct * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={e => { e.stopPropagation(); onOpen(); }}
        style={{
          width: '100%', padding: '9px 0',
          borderRadius: 12, border: 'none',
          background: trail.color, color: '#fff',
          fontFamily: 'Nunito', fontWeight: 800, fontSize: 13,
          cursor: 'pointer',
          transition: 'opacity 0.15s, transform 0.15s',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {completedBase === 0 ? '▶ Iniciar' : allDone ? '🏆 Ver Trilha' : '▶ Continuar'}
      </button>
    </div>
  );
}
