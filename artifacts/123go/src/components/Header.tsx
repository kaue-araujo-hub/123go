import React, { useState } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

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
      justifyContent: 'center',
      padding: '0 16px',
      gap: 16,
    }}>
      {/* Logo */}
      <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px', flexShrink: 0 }}>
        <span style={{ color: 'var(--c3)' }}>1</span>
        <span style={{ color: 'var(--c2)' }}>2</span>
        <span style={{ color: 'var(--c1)' }}>3</span>
        <span style={{ color: 'var(--text)' }}>G</span>
        <span style={{ color: 'var(--c5)' }}>O</span>
        <span style={{ color: 'var(--c2)' }}>!</span>
      </div>

      {/* Search */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        position: 'relative',
      }}>
        <svg
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}
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
          }}
        />
      </div>
    </header>
  );
}
