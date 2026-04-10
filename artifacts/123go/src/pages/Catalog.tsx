import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Header } from '../components/Header';
import { FilterBar, type FilterState } from '../components/FilterBar';
import { GameCard } from '../components/GameCard';
import { GameListRow } from '../components/GameListRow';
import { GameModal } from '../components/GameModal';
import { Pagination } from '../components/Pagination';
import { TrailSection } from '../components/TrailSection';
import { NivelCards } from '../components/NivelCards/NivelCards';
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

// ... (mantenha toda a lógica inicial de filtros e buscas)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onSearch={handleSearch} />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '20px 16px' }}>
        <button
          onPointerUp={() => setLocation('/')}
          style={{ /* Seus estilos de botão Sair */ }}
        >
          ← Sair
        </button>

        {/* ... (Breadcrumb, NivelCards, TrailSection e Filtros permanecem iguais) */}

        {/* Grid de Jogos */}
        <div ref={gridRef}>
           {/* ... Lógica de renderização pagedGames.map(...) */}
        </div>
      </main>

      {/* FOOTER - Verifique se este bloco está EXATAMENTE aqui */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '30px 16px',
        textAlign: 'center',
        color: 'var(--text3)',
        fontSize: 13,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginTop: 'auto' // Garante que ele fique no final
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          <button 
            onClick={() => setLocation('/principios')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--c1)', 
              fontWeight: 700, 
              cursor: 'pointer', 
              textDecoration: 'underline',
              fontFamily: 'Nunito'
            }}
          >
            Princípios Pedagógicos
          </button>
        </div>
        <div>© 2026 123GO. &nbsp; Todos os Direitos Reservados.</div>
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
} // <--- Verifique se esta chave fecha a função Catalog