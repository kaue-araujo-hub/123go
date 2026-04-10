import React, { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "../components/Header";
import { games } from "../data/games";
import { GameCard } from "../components/GameCard";

const MATH_UNITS = [
  { id: 'numeros', title: 'Números', icon: '🔢', color: '#4F46E5' },
  { id: 'algebra', title: 'Álgebra', icon: '✖️', color: '#EC4899' },
  { id: 'geometria', title: 'Geometria', icon: '📐', color: '#10B981' },
  { id: 'grandezas', title: 'Grandezas e Medidas', icon: '⚖️', color: '#F59E0B' },
  { id: 'probabilidade', title: 'Probabilidade e Estatística', icon: '📊', color: '#6366F1' },
];

export function MathGames() {
  const [, setLocation] = useLocation();
  const [activeUnit, setActiveUnit] = useState<string | null>(null);

  const filteredGames = games.filter(game => {
    if (!activeUnit) return true;
    return game.tema === activeUnit;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Header onSearch={() => {}} />

      <main style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 16px', flex: 1 }}>
        <button 
          onClick={() => setLocation('/catalog')}
          style={{ 
            background: 'none', border: 'none', color: 'var(--text3)', 
            cursor: 'pointer', marginBottom: 20, fontWeight: 700, fontFamily: 'Nunito' 
          }}
        >
          ← Voltar para Categorias
        </button>

        <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 28, marginBottom: 24, color: 'var(--text)' }}>
          Unidades Temáticas
        </h1>

        {/* --- CARDS DE UNIDADES COM TRAVA FLEX --- */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', // Garante alinhamento horizontal
          flexWrap: 'wrap', 
          justifyContent: 'flex-start', // Alinha ao início sem espalhar
          alignItems: 'flex-start',
          gap: 12, 
          marginBottom: 40,
          width: '100%'
        }}>
          {MATH_UNITS.map((unit) => (
            <button
              key={unit.id}
              onClick={() => setActiveUnit(unit.id === activeUnit ? null : unit.id)}
              style={{
                // TRAVA DEFINITIVA: Não cresce (0), não encolhe (0), base de 120px
                flex: '0 0 120px', 
                background: activeUnit === unit.id ? unit.color : '#fff',
                color: activeUnit === unit.id ? '#fff' : unit.color,
                padding: '12px 4px',
                borderRadius: '16px',
                cursor: 'pointer',
                border: `2px solid ${unit.color}`,
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: activeUnit === unit.id ? `0 4px 12px ${unit.color}44` : 'none',
                minHeight: '90px',
                outline: 'none'
              }}
            >
              <span style={{ fontSize: 24 }}>{unit.icon}</span>
              <span style={{ 
                fontFamily: 'Nunito', 
                fontWeight: 800, 
                fontSize: 9, 
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1.1,
                whiteSpace: 'normal' // Permite quebra de linha em textos longos
              }}>
                {unit.title}
              </span>
            </button>
          ))}
        </div>

        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, marginBottom: 16, color: 'var(--text)' }}>
          {activeUnit ? `Mostrando: ${MATH_UNITS.find(u => u.id === activeUnit)?.title}` : "Todos os Jogos"}
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 20 
        }}>
          {filteredGames.map((gameItem) => (
            <GameCard 
              key={gameItem.id}
              game={gameItem}
              onInfo={(selectedGame) => console.log(selectedGame)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}