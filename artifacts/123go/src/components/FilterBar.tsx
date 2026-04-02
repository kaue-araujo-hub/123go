import React, { useState, useRef, useEffect } from 'react';

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
  grandezas: 'Grandezas',
  probabilidade: 'Probabilidade',
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const pill = (active: boolean, color: string): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    border: `1.5px solid ${active ? color : 'var(--border)'}`,
    background: active ? color : '#fff',
    color: active ? '#fff' : 'var(--text2)',
    fontFamily: 'Nunito Sans',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.15s ease',
    lineHeight: '1.4',
  });

  const active = activeCount(filters);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 20 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 14px',
          borderRadius: 'var(--radius-pill)',
          border: `1.5px solid ${open ? 'var(--text)' : 'var(--border)'}`,
          background: open ? 'var(--text)' : '#fff',
          color: open ? '#fff' : 'var(--text)',
          fontFamily: 'Nunito',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: 38,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        Filtros
        {active > 0 && (
          <span style={{
            background: open ? 'rgba(255,255,255,0.25)' : 'var(--c3)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            width: 18,
            height: 18,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Nunito',
          }}>{active}</span>
        )}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 1 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Floating dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          background: '#fff',
          borderRadius: 'var(--radius)',
          border: '1.5px solid var(--border)',
          padding: '12px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minWidth: 280,
          zIndex: 100,
        }}>
          {/* ANO */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Ano</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              <button style={pill(filters.ano === null, 'var(--text)')} onClick={() => onFilterChange({ ...filters, ano: null })}>Todos</button>
              {[1, 2, 3].map(a => (
                <button key={a} style={pill(filters.ano === a, '#7C3AED')} onClick={() => onFilterChange({ ...filters, ano: a })}>{a}º Ano</button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* PERÍODO */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Período</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              <button style={pill(filters.periodo === null, 'var(--text)')} onClick={() => onFilterChange({ ...filters, periodo: null })}>Todos</button>
              {[1, 2, 3].map(p => (
                <button key={p} style={pill(filters.periodo === p, 'var(--c6)')} onClick={() => onFilterChange({ ...filters, periodo: p })}>{p}º Bimestre</button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* TEMAS */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Temas</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
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
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border)',
                  background: '#fff',
                  color: 'var(--text2)',
                  fontFamily: 'Nunito',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ✕ Limpar filtros
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export type { FilterState };
