import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { games } from '../data/games';
import { StudentGameCard } from '../components/StudentGameCard';
import { touchStreak, getStreak, getStarsToday, getLevelInfo } from '../utils/progress';
import styles from './StudentCatalog.module.css';

function StatRow({ icon, label, value, highlight = false, flash = false }: {
  icon: string; label: string; value: string; highlight?: boolean; flash?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontFamily: 'Nunito', fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 14,
        color: highlight ? '#7C3AED' : 'var(--text)',
        animation: flash ? 'scStudentBurst 0.6s cubic-bezier(.34,1.56,.64,1)' : 'none',
      }}>
        {value}
      </span>
    </div>
  );
}

export function StudentCatalog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Gamification state ─────────────────────────────── */
  const [streak,       setStreak]      = useState(() => getStreak());
  const [starsToday,   setStarsToday]  = useState(() => getStarsToday());
  const [levelInfo,    setLevelInfo]   = useState(() => getLevelInfo());
  const [progressOpen, setProgressOpen] = useState(false);
  const [starFlash,    setStarFlash]   = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  /* Touch streak on first load */
  useEffect(() => {
    const s = touchStreak();
    setStreak(s);
  }, []);

  /* Listen for star events from games */
  useEffect(() => {
    const handler = () => {
      setStarsToday(getStarsToday());
      setLevelInfo(getLevelInfo());
      setStreak(getStreak());
      setStarFlash(true);
      setTimeout(() => setStarFlash(false), 800);
    };
    window.addEventListener('123go-progress-update', handler);
    return () => window.removeEventListener('123go-progress-update', handler);
  }, []);

  /* Close progress popover when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (progressRef.current && !progressRef.current.contains(e.target as Node)) {
        setProgressOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const q = searchQuery.toLowerCase();
    return games.filter(g => g.title.toLowerCase().includes(q));
  }, [searchQuery]);

  function handleCardTap(path: string) {
    setLocation(path);
  }

  return (
    <div className={styles.screen}>

      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onPointerUp={() => setLocation('/')}
          aria-label="Voltar à tela inicial"
          style={{ touchAction: 'manipulation' }}
        >
          ←
        </button>

        <h1 className={styles.logo} aria-label="123GO!">
          <span style={{ color: '#5B4FCF' }}>1</span>
          <span style={{ color: '#E91E8C' }}>2</span>
          <span style={{ color: '#FF6B35' }}>3</span>
          <span style={{ color: '#1A1A2E' }}>G</span>
          <span style={{ color: '#4CAF50' }}>O</span>
          <span style={{ color: '#E91E8C' }}>!</span>
        </h1>

        {/* ── Meu Progresso button + popover ── */}
        <div ref={progressRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setProgressOpen(o => !o)}
            aria-label="Meu Progresso"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 13px',
              borderRadius: 9999,
              border: `1.5px solid ${progressOpen ? '#7C3AED' : '#DDD6FE'}`,
              background: progressOpen ? '#7C3AED' : '#F5F3FF',
              color: progressOpen ? '#fff' : '#5B21B6',
              fontFamily: 'Nunito', fontWeight: 800, fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" fill="none" stroke={progressOpen ? 'rgba(255,255,255,0.3)' : '#DDD6FE'} strokeWidth="2.5" />
              <circle cx="10" cy="10" r="8" fill="none" stroke={progressOpen ? '#FFD700' : '#7C3AED'}
                strokeWidth="2.5"
                strokeDasharray={`${(levelInfo.progressPct / 100) * 50.3} 50.3`}
                strokeLinecap="round"
                transform="rotate(-90 10 10)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
              <text x="10" y="13.5" textAnchor="middle" fontSize="7" fontWeight="bold"
                fill={progressOpen ? '#FFD700' : '#7C3AED'} fontFamily="Nunito">
                {levelInfo.level}
              </text>
            </svg>
            <span className={styles.progressBtnLabel}>Meu Progresso</span>
            {starsToday > 0 && (
              <span style={{
                background: progressOpen ? 'rgba(255,255,255,0.25)' : '#EDE9FE',
                color: progressOpen ? '#fff' : '#5B21B6',
                fontSize: 11, fontWeight: 800,
                padding: '1px 6px', borderRadius: 6,
                animation: starFlash ? 'scStudentBurst 0.6s cubic-bezier(.34,1.56,.64,1)' : 'none',
              }}>
                ⭐ {starsToday}
              </span>
            )}
          </button>

          {/* ── Popover panel ── */}
          {progressOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 272,
              background: '#fff',
              border: '1.5px solid #E5E7EB',
              borderRadius: 20,
              boxShadow: '0 10px 40px rgba(0,0,0,0.13)',
              zIndex: 300,
              overflow: 'hidden',
              animation: 'scSlideDown 0.2s ease',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                padding: '16px 18px 14px',
                color: '#fff',
              }}>
                <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 15, marginBottom: 10 }}>
                  🏆 Meu Progresso
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, opacity: 0.9 }}>
                    Nível {levelInfo.level}
                  </span>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, color: '#FDE68A' }}>
                    {levelInfo.progressPct}%
                  </span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${levelInfo.progressPct}%`,
                    background: 'linear-gradient(90deg, #FDE68A, #FCD34D)',
                    borderRadius: 9999,
                    transition: 'width 0.6s cubic-bezier(.34,1.56,.64,1)',
                    boxShadow: '0 0 8px rgba(253,211,77,0.6)',
                  }} />
                </div>
                <div style={{ fontFamily: 'Nunito', fontSize: 11, opacity: 0.7, marginTop: 6 }}>
                  {levelInfo.starsInLevel} / {levelInfo.starsForLevel} estrelas para o próximo nível
                </div>
              </div>

              <div style={{ padding: '14px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <StatRow icon="⭐" label="Estrelas hoje" value={starsToday > 0 ? `${starsToday}` : '—'} highlight={starsToday > 0} flash={starFlash} />
                <StatRow icon="🌟" label="Total de estrelas" value={`${levelInfo.starsInLevel + (levelInfo.level - 1) * 15}`} />
                <StatRow icon="🔥" label="Sequência de dias" value={`${streak} dia${streak !== 1 ? 's' : ''}`} />
              </div>

              <div style={{
                borderTop: '1px solid #E5E7EB',
                padding: '10px 18px',
                background: '#FAFAFA',
                fontFamily: 'Nunito', fontSize: 12, color: '#6B7280',
                fontWeight: 600, textAlign: 'center',
              }}>
                {starsToday === 0
                  ? '🚀 Jogue um jogo para ganhar sua primeira estrela hoje!'
                  : starsToday < 3
                  ? `✨ Ótimo! Você já ganhou ${starsToday} estrela${starsToday !== 1 ? 's' : ''} hoje. Continue!`
                  : '🎉 Incrível! Você está arrasando hoje!'}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar jogo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Buscar jogo por nome"
          />
        </div>
      </header>

      <main className={styles.main}>
        {filteredGames.length === 0 ? (
          <div className={styles.empty} role="status">
            <span aria-hidden="true">🔍</span>
            <p>Nenhum jogo encontrado para "{searchQuery}"</p>
          </div>
        ) : (
          <div
            className={styles.grid}
            role="list"
            aria-label={`${filteredGames.length} jogos disponíveis`}
          >
            {filteredGames.map((game, index) => (
              <StudentGameCard
                key={game.id}
                game={game}
                index={index}
                onTap={handleCardTap}
              />
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes scStudentBurst {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
        @keyframes scSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 520px) {
          .${styles.progressBtnLabel} { display: none !important; }
        }
      `}</style>
    </div>
  );
}
