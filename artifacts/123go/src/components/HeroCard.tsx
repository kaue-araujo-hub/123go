import React from 'react';

interface HeroCardProps {
  count: number;
  onExplore: () => void;
}

export function HeroCard({ count, onExplore }: HeroCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius)',
      border: '1.5px solid var(--border)',
      boxShadow: 'var(--shadow)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      marginBottom: 24,
    }}
    className="hero-card"
    >
      {/* SVG Art */}
      <div style={{ background: '#FAFAFA', padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
        <svg viewBox="0 0 240 140" width="240" height="140" style={{ maxWidth: '100%' }}>
          {/* Number 1 */}
          <g transform="translate(10, 5)">
            {/* Vertical bar - green gradient */}
            <rect x="15" y="10" width="14" height="70" rx="3" fill="#4CAF50" opacity="0.85"/>
            {/* Top accent - orange */}
            <rect x="5" y="10" width="24" height="18" rx="3" fill="#FF6B35" opacity="0.9"/>
          </g>

          {/* Number 2 */}
          <g transform="translate(60, 5)">
            {/* Curved top - pink semicircle */}
            <path d="M10 40 Q10 5 40 5 Q70 5 70 35 Q70 55 40 65 L10 80" fill="none" stroke="#E91E8C" strokeWidth="16" strokeLinecap="round"/>
            {/* Diagonal overlay - purple */}
            <rect x="5" y="48" width="52" height="16" rx="3" fill="#5B4FCF" opacity="0.7" transform="rotate(-10 5 48)"/>
            {/* Base - amber */}
            <rect x="5" y="72" width="55" height="14" rx="3" fill="#FF9800" opacity="0.85"/>
          </g>

          {/* Number 3 */}
          <g transform="translate(140, 5)">
            {/* Top circle segment - blue */}
            <path d="M10 35 Q10 5 40 5 Q70 5 70 30 Q70 45 40 50 Q70 55 70 72 Q70 95 40 95 Q10 95 10 72" fill="none" stroke="#00B4D8" strokeWidth="16" strokeLinecap="round"/>
            {/* Orange accent top */}
            <rect x="30" y="5" width="30" height="16" rx="4" fill="#FF9800" opacity="0.7"/>
            {/* Green accent */}
            <rect x="30" y="5" width="14" height="14" rx="3" fill="#4CAF50" opacity="0.8"/>
            {/* Dark oval overlay */}
            <ellipse cx="45" cy="50" rx="18" ry="14" fill="#2D1B69" opacity="0.5"/>
            {/* Pink bottom */}
            <ellipse cx="45" cy="72" rx="22" ry="20" fill="#E91E8C" opacity="0.4"/>
          </g>

          {/* Number 6 */}
          <g transform="translate(10, 85)">
            {/* Diagonal line - purple/blue */}
            <rect x="5" y="2" width="14" height="52" rx="4" fill="#5B4FCF" opacity="0.8" transform="rotate(-15 5 2)"/>
            {/* Circle - green */}
            <circle cx="28" cy="52" r="28" fill="#4CAF50" opacity="0.75"/>
            {/* Dark overlay on intersection */}
            <circle cx="20" cy="40" r="12" fill="#1A1A2E" opacity="0.3"/>
          </g>

          {/* Number 7 */}
          <g transform="translate(90, 85)">
            {/* Top bar - teal/green */}
            <rect x="3" y="3" width="55" height="14" rx="4" fill="#26C6DA" opacity="0.85"/>
            {/* Dark accent on top bar */}
            <rect x="3" y="3" width="20" height="14" rx="4" fill="#2D2D2D" opacity="0.35"/>
            {/* Diagonal going down - pink */}
            <rect x="38" y="3" width="14" height="70" rx="4" fill="#E91E8C" opacity="0.85" transform="rotate(10 38 3)"/>
          </g>

          {/* Number 8 */}
          <g transform="translate(165, 82)">
            {/* Top circle - orange */}
            <circle cx="35" cy="28" r="28" fill="#FF6B35" opacity="0.85"/>
            {/* Bottom circle - blue */}
            <circle cx="35" cy="62" r="28" fill="#00B4D8" opacity="0.85"/>
            {/* Intersection dark area */}
            <ellipse cx="35" cy="45" rx="20" ry="14" fill="#1A1A2E" opacity="0.45"/>
          </g>
        </svg>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 24px 24px', flex: 1 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 26, marginBottom: 10, color: 'var(--text)' }}>
          Matemática
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          Resolva problemas, complete missões e fortaleça o raciocínio lógico com jogos de números, operações e desafios do dia a dia.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={onExplore}
            style={{
              background: 'var(--text)',
              color: '#fff',
              fontFamily: 'Nunito',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 20px',
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Explorar jogos ↓
          </button>
          <span style={{ color: 'var(--text2)', fontSize: 13, fontWeight: 600 }}>
            {count} Jogos • 5 Temas
          </span>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .hero-card {
            flex-direction: row !important;
          }
          .hero-card > div:first-child {
            min-width: 280px;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
