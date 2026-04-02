import React from 'react';

interface FilterState {
  ano: number | null;
  periodo: number | null;
  tema: string | null;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const temaColors: Record<string, string> = {
  numeros: 'var(--c3)',
  algebra: 'var(--c2)',
  geometria: 'var(--c1)',
  grandezas: 'var(--c4)',
  probabilidade: 'var(--c5)',
};

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const pillBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 'var(--radius-pill)',
    border: '1.5px solid var(--border)',
    background: '#fff',
    color: 'var(--text2)',
    fontFamily: 'Nunito Sans',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    minHeight: 36,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  };

  const activePill = (bg: string): React.CSSProperties => ({
    ...pillBase,
    background: bg,
    color: '#fff',
    borderColor: bg,
  });

  const anoColors: Record<number, string> = {
    1: '#8B5CF6',
    2: '#7C3AED',
    3: '#6D28D9',
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, marginBottom: 14, color: 'var(--text)' }}>
        Filtros
      </h2>

      {/* ANO */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: 60, paddingTop: 8 }}>ANO</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button
            style={filters.ano === null ? activePill('var(--text)') : pillBase}
            onClick={() => onFilterChange({ ...filters, ano: null })}
          >Todos</button>
          {[1, 2, 3].map(a => (
            <button
              key={a}
              style={filters.ano === a ? activePill(anoColors[a]) : pillBase}
              onClick={() => onFilterChange({ ...filters, ano: a })}
            >{a}º Ano</button>
          ))}
        </div>
      </div>

      {/* PERÍODO */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: 60, paddingTop: 8 }}>PERÍODO</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button
            style={filters.periodo === null ? activePill('var(--text)') : pillBase}
            onClick={() => onFilterChange({ ...filters, periodo: null })}
          >Todos</button>
          {[1, 2, 3].map(p => (
            <button
              key={p}
              style={filters.periodo === p ? activePill('var(--c6)') : pillBase}
              onClick={() => onFilterChange({ ...filters, periodo: p })}
            >{p}º Bimestre</button>
          ))}
        </div>
      </div>

      {/* TEMAS */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: 60, paddingTop: 8 }}>TEMAS</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button
            style={filters.tema === null ? activePill('var(--text)') : pillBase}
            onClick={() => onFilterChange({ ...filters, tema: null })}
          >Todos</button>
          {Object.entries(temaColors).map(([key, color]) => (
            <button
              key={key}
              style={filters.tema === key ? activePill(color) : pillBase}
              onClick={() => onFilterChange({ ...filters, tema: key })}
            >
              {key === 'numeros' ? 'Números'
                : key === 'algebra' ? 'Álgebra'
                : key === 'geometria' ? 'Geometria'
                : key === 'grandezas' ? 'Grandezas e Medidas'
                : 'Probabilidade e Estatística'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { FilterState };
