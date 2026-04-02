import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Header } from '../components/Header';
import { HeroCard } from '../components/HeroCard';
import { FilterBar, type FilterState } from '../components/FilterBar';
import { GameCard } from '../components/GameCard';
import { GameModal } from '../components/GameModal';
import { Pagination } from '../components/Pagination';
import { games, type Game } from '../data/games';

const ITEMS_PER_PAGE = 10;

export function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ ano: null, periodo: null, tema: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Filters
      if (filters.ano !== null && game.ano !== filters.ano) return false;
      if (filters.periodo !== null && game.periodo !== filters.periodo) return false;
      if (filters.tema !== null && game.tema !== filters.tema) return false;

      // Search
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

  const handleExplore = useCallback(() => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onSearch={handleSearch} />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '20px 16px' }}>
        <h1 style={{
          fontFamily: 'Nunito',
          fontWeight: 800,
          fontSize: 22,
          color: 'var(--text)',
          marginBottom: 16,
        }}>
          Jogos
        </h1>

        <HeroCard count={filteredGames.length} onExplore={handleExplore} />

        <div ref={gridRef}>
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />

          {pagedGames.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16 }}>Nenhum jogo encontrado</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Tente outros filtros ou termos de busca</p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
                marginBottom: 8,
              }}
              className="games-grid"
              >
                {pagedGames.map(game => (
                  <GameCard key={game.id} game={game} onInfo={setSelectedGame} />
                ))}
              </div>

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
