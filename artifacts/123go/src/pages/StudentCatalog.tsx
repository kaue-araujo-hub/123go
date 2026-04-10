import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from "wouter";
import { games } from '../data/games';
import { StudentGameCard } from '../components/StudentGameCard';
import { SessionManager } from '../auth/SessionManager';
import { useLogoColors } from '../hooks/useLogoColors';
import styles from './StudentCatalog.module.css';

export function StudentCatalog() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTheme = searchParams.get("tema") || null;

  const logoColors = useLogoColors();

  // Forçar logout do professor
  useEffect(() => {
    SessionManager.logoutTeacher();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
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

  // Filtragem otimizada
  // Filtragem otimizada - Busca por TÍTULO OU por CÓDIGO (EF01MA02, EF01MA03, etc.)
  const filteredGames = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    // Se não tiver busca, só aplica o filtro de tema
    if (!query) {
      return games.filter(game => 
        !currentTheme || currentTheme === 'all' || game.tema === currentTheme
      );
    }

    return games.filter(game => {
      // Busca por título
      const matchesTitle = game.title.toLowerCase().includes(query);

      // Busca por código de habilidade (ex: EF01MA02, EF01MA03...)
      const matchesCode = game.codigo 
        ? game.codigo.toLowerCase().includes(query) 
        : false;

      const matchesSearch = matchesTitle || matchesCode;

      // Filtro por tema continua funcionando
      const matchesTheme = !currentTheme || 
                           currentTheme === 'all' || 
                           game.tema === currentTheme;

      return matchesSearch && matchesTheme;
    });
  }, [searchQuery, currentTheme]);

  const handleCardTap = (path: string) => {
    setLocation(path);
  };

  const handleThemeClick = (themeId: string) => {
    if (themeId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ tema: themeId });
    }
  };

  const isAllActive = !currentTheme || currentTheme === 'all';

  return (
    <div className={styles.screen}>

      {/* ==================== HEADER ATUALIZADO ==================== */}
      <header className={styles.header}>

        {/* Search Overlay */}
        {/* Search Overlay - Versão mais compacta e parecida com a imagem */}
        {searchOpen && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: '#ffffff',
            width: '100%'
          }}>
            {/* Campo de busca menor e mais bonito */}
            <div style={{
              flex: 1,
              maxWidth: '680px',                    // ← Limita a largura máxima
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 9999,
              padding: '10px 16px',
              margin: '0 auto',                     // Centraliza
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar jogo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Buscar jogo por nome"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'Nunito',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#1E2937',
                }}
              />

              {/* Botão X para limpar a busca */}
              {searchQuery && (
                <button
                  onPointerUp={() => setSearchQuery('')}
                  aria-label="Limpar busca"
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#94A3B8',
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: 0,
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'manipulation'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Botão Cancelar */}
            <button
              onPointerUp={closeSearch}
              style={{
                flexShrink: 0,
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                borderRadius: 9999,
                color: '#64748B',
                fontFamily: 'Nunito',
                fontWeight: 700,
                fontSize: 13.5,
                padding: '9px 18px',
                cursor: 'pointer',
                touchAction: 'manipulation',
                whiteSpace: 'nowrap'
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Default Header: Logo + Badges */}
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
              Jogos de matemática criados para quem tem dispositivos simples e conexão limitada
            </p>

            {/* Badges - um ao lado do outro */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              marginTop: 12,
            }}>
              {/* Badge 1 - Feito para celulares */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#f0f3fd', border: '1px solid #bbc0f7',
                borderRadius: 999, padding: '6px 14px',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2248c5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{
                  fontFamily: 'Nunito Sans, sans-serif', 
                  fontWeight: 700, 
                  fontSize: 10,
                  color: '#161ba3', 
                  letterSpacing: '0.04em', 
                  textTransform: 'uppercase',
                }}>
                  FEITO PARA CELULARES E LAPTOP SIMPLES
                </span>
              </div>

              {/* Badge 2 - Não precisa instalar */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#fdfbf0', border: '1px solid #f7ecbb',
                borderRadius: 999, padding: '6px 14px',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c5b222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{
                  fontFamily: 'Nunito Sans, sans-serif', 
                  fontWeight: 700, 
                  fontSize: 10,
                  color: '#a38916', 
                  letterSpacing: '0.04em', 
                  textTransform: 'uppercase',
                }}>
                  NÃO PRECISA INSTALAR
                </span>
              </div>

              {/* Badge 3 - Alinhado ao Currículo Paulista */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#fdf0f9', border: '1px solid #f7bbe6',
                borderRadius: 999, padding: '6px 14px',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c5229f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{
                  fontFamily: 'Nunito Sans, sans-serif', 
                  fontWeight: 700, 
                  fontSize: 10,
                  color: '#a31693', 
                  letterSpacing: '0.04em', 
                  textTransform: 'uppercase',
                }}>
                  ALINHADO AO CURRÍCULO PAULISTA
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className={styles.main}>
        {/* Theme Filters */}
        {!searchQuery && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: 14, 
            marginBottom: 32, 
            padding: '0 10px' 
          }}>
            {[
              { id: 'all', label: 'Todos', emoji: '🌟', color: '#003989' },
              { id: 'numeros', label: 'Números', emoji: '🔢', color: '#5B4FCF' },
              { id: 'algebra', label: 'Álgebra', emoji: '✖️', color: '#EC4899' },
              { id: 'geometria', label: 'Geometria', emoji: '📐', color: '#10B981' },
              { id: 'grandezas', label: 'Grandezas e Medidas', emoji: '⚖️', color: '#F59E0B' },
              { id: 'probabilidade', label: 'Probabilidade e Estatística', emoji: '📊', color: '#6366F1' },
            ].map(unit => {
              const isActive = unit.id === 'all' ? isAllActive : currentTheme === unit.id;

              return (
                <button
                  key={unit.id}
                  onClick={() => handleThemeClick(unit.id)}
                  style={{
                    flex: '0 0 105px',
                    background: isActive ? unit.color : '#fff',
                    border: `2px solid ${unit.color}`,
                    borderRadius: 16,
                    padding: '16px 76px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: isActive ? `0 4px 12px ${unit.color}44` : 'none',
                    transform: isActive ? 'scale(1.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: 22 }}>{unit.emoji}</span>
                  <span style={{
                    fontFamily: 'Nunito',
                    fontWeight: 800,
                    fontSize: 9,
                    color: isActive ? '#fff' : unit.color,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    lineHeight: 1.1
                  }}>
                    {unit.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Games Grid */}
        <div className={styles.grid}>
          {filteredGames.length > 0 ? (
            filteredGames.map((game, index) => (
              <StudentGameCard
                key={game.id}
                game={game}
                index={index}
                onTap={handleCardTap}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
              <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 18 }}>
                Nenhum jogo encontrado
              </p>
              <p style={{ fontSize: 14, marginTop: 8 }}>
                Tente mudar o filtro ou a busca
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ==================== FOOTER COMPLETO ==================== */}
      <footer className={styles.footer} style={{ 
        flexShrink: 0, 
        borderTop: '1px solid #F0F0F0', 
        background: '#FAFAFA', 
        padding: '24px 20px 32px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 16 
      }}>

        {/* Legal links row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/termos">
            <a
              href="#termos"
              style={{
                fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, fontSize: 11,
                color: '#9CA3AF', textDecoration: 'none', letterSpacing: '0.02em',
                transition: 'color 0.15s',
              }}
              onPointerEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#6B7280')}
              onPointerLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF')}
            >
              Termos de Uso
            </a>
          </Link>

          <Link href="/privacidade">
            <span style={{ color: '#D1D5DB', fontSize: 10 }}>•</span>
            <a
              href="#privacidade"
              style={{
                fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, fontSize: 11,
                color: '#9CA3AF', textDecoration: 'none', letterSpacing: '0.02em',
                transition: 'color 0.15s',
              }}
              onPointerEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#6B7280')}
              onPointerLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF')}
            >
              Política de Privacidade
            </a>
          </Link>

          <Link href="/principios">
            <span style={{ color: '#D1D5DB', fontSize: 10 }}>•</span>
            <a
              href="#privacidade"
              style={{
                fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, fontSize: 11,
                color: '#9CA3AF', textDecoration: 'none', letterSpacing: '0.02em',
                transition: 'color 0.15s',
              }}
              onPointerEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#6B7280')}
              onPointerLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF')}
            >
              Princípios Pedagógicos
            </a>
          </Link>
        </div>

        {/* Copyright */}
        <p style={{
          fontFamily: 'Nunito Sans, sans-serif', fontWeight: 400, fontSize: 10.5,
          color: '#B0B7C3', textAlign: 'center', lineHeight: 1.5, margin: 0,
          letterSpacing: '0.01em',
        }}>
          © 123GO! – Um produto educacional desenvolvido por{' '}
          <span style={{ fontWeight: 700, color: '#9CA3AF' }}>Kauê Araujo</span>.
          {' '}Todos os direitos reservados.
        </p>

        {/* Contato badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          borderRadius: 999, padding: '3px 10px',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{
            fontFamily: 'Nunito Sans, sans-serif', fontWeight: 700, fontSize: 10,
            color: '#16A34A', letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            Quer colaborar? Contate-me: {' '}
            <a 
              href="mailto:kauearaujo_@outlook.com" 
              style={{ 
                color: '#16A34A', 
                textDecoration: 'underline', 
                cursor: 'pointer' 
              }}
            >
              kauearaujo_@outlook.com
            </a>
          </span>
        </div>

        {/* Área do Professor */}
        <button
          onClick={() => setLocation('/teacher-pin')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Nunito', fontWeight: 600, fontSize: 11,
            color: '#D1D5DB', letterSpacing: '0.01em',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 8,
            transition: 'color 0.15s ease',
            marginTop: 2,
          }}
          onPointerEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onPointerLeave={e => (e.currentTarget.style.color = '#D1D5DB')}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          
        </button>

      </footer>
    </div>
  );
}