import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { games } from '../data/games';
import { temaLabels, temaColors } from '../data/games';

/* ── Constants ─────────────────────────────────────────────────────── */

const PLACEHOLDERS = [
  'O que vamos aprender hoje? 🚀',
  'Procure um jogo divertido...',
  'Qual matemática você quer praticar? 🌟',
  'Busque por números, formas ou mais! 🎈',
];

const QUICK_CHIPS = [
  { label: '🔢 Números',  query: 'numeros'   },
  { label: '📐 Geometria', query: 'geometria' },
  { label: '🎨 Ateliê',   query: 'ateliê'    },
  { label: '➕ Soma',     query: 'soma'       },
  { label: '📊 Gráfico',  query: 'gráfico'   },
];

/* ── Helpers ────────────────────────────────────────────────────────── */

type AnySpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend:   (() => void) | null;
};
type AnySpeechRecognitionCtor = new () => AnySpeechRecognition;

function getSpeechRecognition(): AnySpeechRecognitionCtor | null {
  const w = window as unknown as Record<string, unknown>;
  return (w['SpeechRecognition'] ?? w['webkitSpeechRecognition'] ?? null) as AnySpeechRecognitionCtor | null;
}

/* ── Icons ──────────────────────────────────────────────────────────── */

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? '#EF4444' : 'none'} stroke={active ? '#EF4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3"/>
      <path d="M5 10a7 7 0 0 0 14 0"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

/* ── Props ──────────────────────────────────────────────────────────── */

interface HeaderProps {
  onSearch: (query: string) => void;
}

/* ── Inline SearchBar component ─────────────────────────────────────── */

function SearchBar({
  query,
  setQuery,
  onSearch,
  inputRef,
  compact = false,
}: {
  query: string;
  setQuery: (v: string) => void;
  onSearch: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  compact?: boolean;
}) {
  const [focused,      setFocused]      = useState(false);
  const [placeholderIdx, setIdx]        = useState(0);
  const [voiceActive,  setVoiceActive]  = useState(false);
  const [shadowFocus,  setShadowFocus]  = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Rotate placeholder when idle */
  useEffect(() => {
    if (focused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % PLACEHOLDERS.length), 3200);
    return () => clearInterval(t);
  }, [focused]);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleChip = (chipQuery: string) => {
    setQuery(chipQuery);
    onSearch(chipQuery);
    setFocused(false);
  };

  const handleVoice = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      /* Graceful fallback: pulse animation only */
      setVoiceActive(true);
      setTimeout(() => setVoiceActive(false), 1200);
      return;
    }
    const recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setVoiceActive(true);
    recognition.start();
    recognition.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onSearch(transcript);
      setVoiceActive(false);
    };
    recognition.onerror = () => setVoiceActive(false);
    recognition.onend   = () => setVoiceActive(false);
  };

  /* Filtered results for dropdown */
  const results = query.trim().length > 0
    ? games.filter(g => {
        const q = query.toLowerCase();
        return [g.title, g.desc, g.unidade, g.habilidade, g.tema].join(' ').toLowerCase().includes(q);
      }).slice(0, 6)
    : [];

  const showDropdown = focused && (query.trim().length > 0 || true); /* chips always show when focused */
  const showResults  = focused && query.trim().length > 0;
  const showChips    = focused && query.trim().length === 0;

  const accentColor = compact ? 'var(--c3)' : 'var(--c2)';

  return (
    <div ref={wrapRef} style={{ width: '100%', maxWidth: compact ? undefined : 500, position: 'relative' }}>
      {/* ── Input pill ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#fff',
        border: `2px solid ${focused ? accentColor : 'var(--border)'}`,
        borderRadius: 9999,
        boxShadow: shadowFocus
          ? `0 4px 20px rgba(99,102,241,0.18), 0 1px 4px rgba(0,0,0,0.06)`
          : '0 1px 4px rgba(0,0,0,0.07)',
        transition: 'border-color 0.2s ease, box-shadow 0.25s ease',
        overflow: 'hidden',
        padding: '0 12px 0 14px',
        gap: 8,
      }}>
        {/* Search icon */}
        <span style={{ color: focused ? accentColor : 'var(--text3)', flexShrink: 0, transition: 'color 0.2s' }}>
          <SearchIcon size={compact ? 15 : 17} />
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => { setFocused(true); setShadowFocus(true); }}
          onBlur={() => setShadowFocus(false)}
          placeholder={focused ? 'Buscar...' : PLACEHOLDERS[placeholderIdx]}
          aria-label="Buscar jogos"
          autoComplete="off"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text)',
            fontFamily: 'Nunito',
            fontWeight: 600,
            fontSize: compact ? 14 : 15,
            padding: compact ? '9px 0' : '11px 0',
            minWidth: 0,
          }}
        />

        {/* Clear button — shown when typing */}
        {query.length > 0 && (
          <button
            onMouseDown={e => { e.preventDefault(); setQuery(''); onSearch(''); }}
            style={{
              flexShrink: 0, border: 'none', background: 'none',
              color: 'var(--text3)', cursor: 'pointer',
              padding: '0 2px', fontSize: 16, lineHeight: 1,
            }}
            aria-label="Limpar busca"
          >✕</button>
        )}

        {/* Mic button */}
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={handleVoice}
          aria-label="Buscar por voz"
          style={{
            flexShrink: 0, border: 'none', background: 'none',
            cursor: 'pointer', padding: '2px 0',
            color: voiceActive ? '#EF4444' : 'var(--text3)',
            animation: voiceActive ? 'pulseDot 0.7s ease-in-out infinite' : 'none',
            transition: 'color 0.2s',
          }}
        >
          <MicIcon active={voiceActive} />
        </button>
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)',
          left: 0, right: 0,
          background: '#fff',
          border: '1.5px solid var(--border)',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 200,
          overflow: 'hidden',
          animation: 'slideDown 0.18s ease',
        }}>

          {/* Quick chips (shown when input is empty) */}
          {showChips && (
            <div style={{ padding: '12px 14px 10px' }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Busca rápida
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {QUICK_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    onMouseDown={e => { e.preventDefault(); handleChip(chip.query); }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 9999,
                      border: '1.5px solid var(--border)',
                      background: '#F9FAFB',
                      fontFamily: 'Nunito', fontWeight: 700, fontSize: 13,
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, background 0.15s, border-color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--c2)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c2)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                      (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            results.length > 0 ? (
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 14px 8px' }}>
                  {results.length} resultado{results.length !== 1 ? 's' : ''}
                </div>
                {results.map(game => {
                  const accent = temaColors[game.tema] ?? '#10B981';
                  const tLabel = temaLabels[game.tema] ?? game.tema;
                  return (
                    <button
                      key={game.id}
                      onMouseDown={e => { e.preventDefault(); setQuery(game.title); onSearch(game.title); setFocused(false); }}
                      style={{
                        width: '100%', padding: '10px 14px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        border: 'none', background: 'transparent',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F5F3FF'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      {/* Emoji thumbnail */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: game.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                      }}>
                        {game.emoji}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {game.title}
                        </div>
                        <div style={{
                          display: 'inline-block',
                          background: `${accent}18`, color: accent,
                          fontFamily: 'Nunito', fontWeight: 700, fontSize: 11,
                          padding: '1px 8px', borderRadius: 6, marginTop: 2,
                        }}>
                          {tLabel}
                        </div>
                      </div>

                      <span style={{ color: 'var(--text3)', fontSize: 12, flexShrink: 0 }}>▶</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div style={{ padding: '24px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎈</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                  Ops! Não encontramos esse jogo
                </div>
                <div style={{ fontFamily: 'Nunito', fontSize: 13, color: 'var(--text2)' }}>
                  Que tal tentar outro? 🚀
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Header ────────────────────────────────────────────────────── */

export function Header({ onSearch }: HeaderProps) {
  const [, setLocation] = useLocation();
  const [query,             setQuery]             = useState('');
  const [mobileSearchOpen,  setMobileSearchOpen]  = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleSetQuery = useCallback((v: string) => {
    setQuery(v);
    onSearch(v);
  }, [onSearch]);

  const openMobileSearch = () => setMobileSearchOpen(true);

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setQuery('');
    onSearch('');
  };

  useEffect(() => {
    if (mobileSearchOpen) mobileInputRef.current?.focus();
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
        <div className="header-mobile-search" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ flex: 1 }}>
            <SearchBar
              query={query}
              setQuery={handleSetQuery}
              onSearch={onSearch}
              inputRef={mobileInputRef}
              compact
            />
          </div>
          <button
            onClick={closeMobileSearch}
            aria-label="Fechar busca"
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
              border: '1.5px solid var(--border)', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16, color: 'var(--text2)',
            }}
          >✕</button>
        </div>
      )}

      {/* ── DEFAULT STATE ── */}
      {!mobileSearchOpen && (
        <>
          {/* Logo */}
          <div
            onClick={() => setLocation('/')}
            role="link" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setLocation('/')}
            style={{
              fontFamily: 'Nunito', fontWeight: 900, fontSize: 24,
              letterSpacing: '-0.5px', flexShrink: 0,
              cursor: 'pointer', userSelect: 'none',
            }}
          >
            <span style={{ color: 'var(--c3)' }}>1</span>
            <span style={{ color: 'var(--c2)' }}>2</span>
            <span style={{ color: 'var(--c1)' }}>3</span>
            <span style={{ color: 'var(--text)' }}>G</span>
            <span style={{ color: 'var(--c5)' }}>O</span>
            <span style={{ color: 'var(--c2)' }}>!</span>
          </div>

          {/* Desktop search bar */}
          <div className="header-search-desktop" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchBar query={query} setQuery={handleSetQuery} onSearch={onSearch} />
          </div>

          {/* Mobile search icon */}
          <button
            className="header-search-icon"
            onClick={openMobileSearch}
            aria-label="Abrir busca"
            style={{
              width: 38, height: 38, borderRadius: '50%',
              border: '1.5px solid var(--border)', background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text2)', flexShrink: 0,
            }}
          >
            <SearchIcon size={17} />
          </button>
        </>
      )}

      <style>{`
        @media (max-width: 599px) {
          .header-search-desktop { display: none !important; }
          .header-search-icon    { display: flex !important; margin-left: auto; }
          .header-mobile-search  { display: flex !important; }
        }
        @media (min-width: 600px) {
          .header-search-icon    { display: none !important; }
          .header-mobile-search  { display: none !important; }
        }
        /* Remove browser default search-cancel button */
        input[type="search"]::-webkit-search-cancel-button { display: none; }
        input[type="search"]::-webkit-search-decoration     { display: none; }
      `}</style>
    </header>
  );
}
