import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

export function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setQuery('');
    onSearch('');
  };

  useEffect(() => {
    if (mobileSearchOpen) {
      mobileInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
    }}>

      {/* ── MOBILE SEARCH OPEN STATE ── */}
      {mobileSearchOpen && (
        <div className="header-mobile-search" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flex: 1,
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={mobileInputRef}
              type="search"
              placeholder="Buscar jogos, habilidades..."
              value={query}
              onChange={handleChange}
              aria-label="Buscar jogos"
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid var(--c3)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'Nunito Sans',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            onClick={closeMobileSearch}
            aria-label="Fechar busca"
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1.5px solid var(--border)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              color: 'var(--text2)',
            }}
          >✕</button>
        </div>
      )}

      {/* ── DEFAULT STATE (logo + desktop search + mobile icon) ── */}
      {!mobileSearchOpen && (
        <>
          {/* Logo — always visible */}
          <div style={{
            fontFamily: 'Nunito',
            fontWeight: 900,
            fontSize: 24,
            letterSpacing: '-0.5px',
            flexShrink: 0,
          }}>
            <span style={{ color: 'var(--c3)' }}>1</span>
            <span style={{ color: 'var(--c2)' }}>2</span>
            <span style={{ color: 'var(--c1)' }}>3</span>
            <span style={{ color: 'var(--text)' }}>G</span>
            <span style={{ color: 'var(--c5)' }}>O</span>
            <span style={{ color: 'var(--c2)' }}>!</span>
          </div>

          {/* Desktop search bar — hidden on mobile */}
          <div className="header-search-desktop" style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
              <svg
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                placeholder="Buscar jogos, habilidades, temas..."
                value={query}
                onChange={handleChange}
                aria-label="Buscar jogos"
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'Nunito Sans',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Mobile search icon — hidden on desktop */}
          <button
            className="header-search-icon"
            onClick={openMobileSearch}
            aria-label="Abrir busca"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1.5px solid var(--border)',
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text2)',
              flexShrink: 0,
            }}
          >
            <SearchIcon />
          </button>
        </>
      )}

      <style>{`
        /* Mobile: hide desktop search, show icon */
        @media (max-width: 599px) {
          .header-search-desktop { display: none !important; }
          .header-search-icon    { display: flex !important; margin-left: auto; }
          .header-mobile-search  { display: flex !important; }
        }
        /* Desktop: show search bar, hide icon */
        @media (min-width: 600px) {
          .header-search-icon    { display: none !important; }
          .header-mobile-search  { display: none !important; }
        }
      `}</style>
    </header>
  );
}
