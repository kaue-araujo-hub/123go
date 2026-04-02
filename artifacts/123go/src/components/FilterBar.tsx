import React, { useState } from 'react';

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

const temaLabels: Record<string, string> = {
  numeros: 'Números',
  algebra: 'Álgebra',
  geometria: 'Geometria',
  grandezas: 'Grandezas e Medidas',
  probabilidade: 'Probabilidade e Estatística',
};

function activeCount(filters: FilterState) {
  let count = 0;
  if (filters.ano !== null) count++;
  if (filters.periodo !== null) count++;
  if (filters.tema !== null) count++;
  return count;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);

  const pill = (
    active: boolean,
    color: string,
  ): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 'var(--radius-pill)',
    border: `1.5px solid ${active ? color : 'var(--border)'}`,
    background: active ? color : '#fff',
    color: active ? '#fff' : 'var(--text2)',
    fontFamily: 'Nunito Sans',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    minHeight: 34,
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.15s ease',
  });

  const active = activeCount(filters);

  return (
    <div style={{ marginBottom: 24, position: 'relative' }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          borderRadius: 'var(--radius-pill)',
          border: `1.5px solid ${open ? 'var(--text)' : 'var(--border)'}`,
          background: open ? 'var(--text)' : '#fff',
          color: open ? '#fff' : 'var(--text)',
          fontFamily: 'Nunito',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: 40,
        }}
      >
        {/* Filter icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        Filtros
        {active > 0 && (
          <span style={{
            background: open ? 'rgba(255,255,255,0.25)' : 'var(--c3)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            width: 20,
            height: 20,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Nunito',
          }}>{active}</span>
        )}
        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 2 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? 400 : 0,
        opacity: open ? 1 : 0,
        transition: 'max-height 0.3s ease, opacity 0.2s ease',
        marginTop: open ? 8 : 0,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius)',
          border: '1.5px solid var(--border)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-hover)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* ANO */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Ano</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button style={pill(filters.ano === null, 'var(--text)')} onClick={() => onFilterChange({ ...filters, ano: null })}>Todos</button>
              {[1, 2, 3].map(a => (
                <button key={a} style={pill(filters.ano === a, '#7C3AED')} onClick={() => onFilterChange({ ...filters, ano: a })}>{a}º Ano</button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* PERÍODO */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Período</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button style={pill(filters.periodo === null, 'var(--text)')} onClick={() => onFilterChange({ ...filters, periodo: null })}>Todos</button>
              {[1, 2, 3].map(p => (
                <button key={p} style={pill(filters.periodo === p, 'var(--c6)')} onClick={() => onFilterChange({ ...filters, periodo: p })}>{p}º Bimestre</button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* TEMAS */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Temas</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button style={pill(filters.tema === null, 'var(--text)')} onClick={() => onFilterChange({ ...filters, tema: null })}>Todos</button>
              {Object.entries(temaColors).map(([key, color]) => (
                <button key={key} style={pill(filters.tema === key, color)} onClick={() => onFilterChange({ ...filters, tema: key })}>
                  {temaLabels[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          {active > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--border)' }} />
              <button
                onClick={() => { onFilterChange({ ano: null, periodo: null, tema: null }); setOpen(false); }}
                style={{
                  alignSelf: 'flex-start',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border)',
                  background: '#fff',
                  color: 'var(--text2)',
                  fontFamily: 'Nunito',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  minHeight: 34,
                }}
              >
                ✕ Limpar filtros
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export type { FilterState };
