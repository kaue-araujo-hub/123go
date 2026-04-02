import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const btnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: active ? 'none' : '1.5px solid var(--border)',
    background: active ? 'var(--text)' : '#fff',
    color: active ? '#fff' : disabled ? 'var(--text3)' : 'var(--text2)',
    fontFamily: 'Nunito',
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    minHeight: 44,
    minWidth: 44,
  });

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32 }}>
      <button
        disabled={currentPage === 1}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        style={btnStyle(false, currentPage === 1)}
        aria-label="Página anterior"
      >‹</button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={btnStyle(page === currentPage)}
          aria-label={`Página ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        style={btnStyle(false, currentPage === totalPages)}
        aria-label="Próxima página"
      >›</button>
    </div>
  );
}
