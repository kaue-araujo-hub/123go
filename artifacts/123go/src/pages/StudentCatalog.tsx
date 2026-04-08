import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { games } from '../data/games';
import { StudentGameCard } from '../components/StudentGameCard';
import { SessionManager } from '../auth/SessionManager';
import { startBGM, stopBGM } from '../utils/bgm';
import { useLogoColors } from '../hooks/useLogoColors';
import styles from './StudentCatalog.module.css';

export function StudentCatalog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const logoColors = useLogoColors();

  /* Always enforce student role on this page */
  useEffect(() => {
    SessionManager.logoutTeacher();
  }, []);

  /* Catalog background music */
  useEffect(() => {
    startBGM('catalog');
    return () => { stopBGM(); };
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
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

        {/* ── Search overlay ── */}
        {searchOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '10px 14px' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              background: '#F3F4F6', border: '1.5px solid #E5E7EB',
              borderRadius: 9999, padding: '0 12px 0 14px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar jogo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Buscar jogo por nome"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent',
                  fontFamily: 'Nunito', fontWeight: 600, fontSize: 15,
                  color: '#1A1A2E', padding: '10px 0',
                }}
              />
              {searchQuery && (
                <button
                  onPointerUp={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 16, padding: 0, lineHeight: 1, touchAction: 'manipulation' }}
                  aria-label="Limpar busca"
                >✕</button>
              )}
            </div>
            <button
              onPointerUp={closeSearch}
              style={{
                flexShrink: 0, border: '1px solid #E5E7EB', background: '#F9FAFB',
                borderRadius: 9999, color: '#6B7280',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', padding: '8px 14px', touchAction: 'manipulation',
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ── Default: large centered logo + search icon ── */}
        {!searchOpen && (
          <div style={{ width: '100%', position: 'relative', textAlign: 'center', padding: '20px 16px 12px' }}>

            {/* Search icon — top right */}
            <button
              onPointerUp={openSearch}
              aria-label="Abrir busca"
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 38, height: 38, borderRadius: '50%',
                border: '1.5px solid #E5E7EB',
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', touchAction: 'manipulation',
                transition: 'background 0.15s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Big logo */}
            <h1 aria-label="123GO!" style={{
              fontFamily: 'Nunito', fontWeight: 900,
              fontSize: 'clamp(42px, 12vw, 62px)',
              letterSpacing: '-1px', lineHeight: 1, margin: '0 0 4px',
            }}>
              <span style={{ color: logoColors[0], transition: 'color 1.2s ease' }}>1</span>
              <span style={{ color: logoColors[1], transition: 'color 1.2s ease' }}>2</span>
              <span style={{ color: logoColors[2], transition: 'color 1.2s ease' }}>3</span>
              <span style={{ color: logoColors[3], transition: 'color 1.2s ease' }}>G</span>
              <span style={{ color: logoColors[4], transition: 'color 1.2s ease' }}>O</span>
              <span style={{ color: logoColors[5], transition: 'color 1.2s ease' }}>!</span>
            </h1>

            <p style={{
              fontFamily: 'Nunito', fontWeight: 600, fontSize: 13,
              color: '#9CA3AF', margin: 0,
            }}>
              Jogos de matemática
            </p>
          </div>
        )}
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

      {/* Subtle teacher area link */}
      <footer style={{ textAlign: 'center', padding: '10px 0 14px', flexShrink: 0 }}>
        <button
          onClick={() => setLocation('/teacher-pin')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Nunito', fontWeight: 600, fontSize: 12,
            color: '#C4C4C4', letterSpacing: '0.01em',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 8,
            transition: 'color 0.15s ease',
          }}
          onPointerEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onPointerLeave={e => (e.currentTarget.style.color = '#C4C4C4')}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Área do Professor
        </button>
      </footer>

    </div>
  );
}
