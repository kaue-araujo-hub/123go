import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Header } from '../components/Header';
import { FilterBar, type FilterState } from '../components/FilterBar';
import { GameCard } from '../components/GameCard';
import { GameListRow } from '../components/GameListRow';
import { GameModal } from '../components/GameModal';
import { Pagination } from '../components/Pagination';
import { TrailSection } from '../components/TrailSection';
import { games, type Game } from '../data/games';

const ITEMS_PER_PAGE = 10;

type ViewMode = 'grid' | 'list';

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" fill={active ? 'currentColor' : 'none'} />
      <rect x="14" y="3" width="7" height="7" fill={active ? 'currentColor' : 'none'} />
      <rect x="3" y="14" width="7" height="7" fill={active ? 'currentColor' : 'none'} />
      <rect x="14" y="14" width="7" height="7" fill={active ? 'currentColor' : 'none'} />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" strokeWidth={active ? 2.5 : 2} />
      <line x1="8" y1="12" x2="21" y2="12" strokeWidth={active ? 2.5 : 2} />
      <line x1="8" y1="18" x2="21" y2="18" strokeWidth={active ? 2.5 : 2} />
      <circle cx="3" cy="6" r="1.5" fill="currentColor" />
      <circle cx="3" cy="12" r="1.5" fill="currentColor" />
      <circle cx="3" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function Catalog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ ano: null, periodo: null, tema: null, age: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      if (filters.ano    !== null && game.ano    !== filters.ano)    return false;
      if (filters.periodo !== null && game.periodo !== filters.periodo) return false;
      if (filters.tema   !== null && game.tema   !== filters.tema)   return false;
      if (filters.age !== null && !(game.ageMin <= filters.age && filters.age <= game.ageMax)) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          game.title, game.desc, game.tema, game.unidade,
          game.codigo, game.habilidade, game.objeto,
          String(game.ano), String(game.periodo)
        ].join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const pagedGames = filteredGames.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const viewBtn = (mode: ViewMode): React.CSSProperties => ({
    width: 38,
    height: 38,
    borderRadius: 10,
    border: `1.5px solid ${viewMode === mode ? 'var(--text)' : 'var(--border)'}`,
    background: viewMode === mode ? 'var(--text)' : '#fff',
    color: viewMode === mode ? '#fff' : 'var(--text2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onSearch={handleSearch} />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '20px 16px' }}>
        {/* Back to entry */}
        <button
          onPointerUp={() => setLocation('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 13,
            color: 'var(--text3)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: 8,
            fontFamily: 'Nunito Sans',
            fontWeight: 600,
            minHeight: 44,
            touchAction: 'manipulation',
          }}
          aria-label="Voltar à tela inicial"
        >
          ← Sair
        </button>
        {/* Breadcrumb + stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16, flexWrap: 'wrap', rowGap: 8 }}>
          <h1 style={{
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 22,
            color: 'var(--text)',
            margin: 0,
          }}>
            Jogos
          </h1>

          {/* Separator */}
          <span style={{
            fontFamily: 'Nunito',
            fontWeight: 400,
            fontSize: 20,
            color: 'var(--text3)',
            margin: '0 6px',
            lineHeight: 1,
          }}>
            /
          </span>

          {/* Matemática label */}
          <span style={{
            fontFamily: 'Nunito',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--text2)',
          }}>
            Matemática
          </span>

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
            <span style={{
              background: 'var(--c3)',
              color: '#fff',
              fontFamily: 'Nunito',
              fontWeight: 700,
              fontSize: 12,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              whiteSpace: 'nowrap',
            }}>
              {games.length} Jogos
            </span>
            <span style={{
              background: 'var(--c1)',
              color: '#fff',
              fontFamily: 'Nunito',
              fontWeight: 700,
              fontSize: 12,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              whiteSpace: 'nowrap',
            }}>
              5 Temas
            </span>
          </div>
        </div>

        {/* Featured carousel */}
        <TrailSection />

        <div ref={gridRef}>
          {/* Toolbar: filters + view toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
          }}>
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            {/* View toggle buttons */}
            <div style={{ display: 'flex', gap: 6, paddingTop: 0, flexShrink: 0 }}>
              <button
                onClick={() => setViewMode('grid')}
                style={viewBtn('grid')}
                aria-label="Ver em grade"
                title="Grade"
              >
                <GridIcon active={viewMode === 'grid'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={viewBtn('list')}
                aria-label="Ver em lista"
                title="Lista"
              >
                <ListIcon active={viewMode === 'list'} />
              </button>
            </div>
          </div>

          {pagedGames.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16 }}>Nenhum jogo encontrado</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Tente outros filtros ou termos de busca</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 16,
                    marginBottom: 8,
                  }}
                  className="games-grid stagger-grid"
                >
                  {pagedGames.map(game => (
                    <GameCard key={game.id} game={game} onInfo={setSelectedGame} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                  {pagedGames.map(game => (
                    <GameListRow key={game.id} game={game} onInfo={setSelectedGame} />
                  ))}
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 16px',
        textAlign: 'center',
        color: 'var(--text3)',
        fontSize: 13,
      }}>
        © 2026 123GO. &nbsp; Todos os Direitos Reservados.
      </footer>

      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />

      <style>{`
        @media (min-width: 520px) {
          .games-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
