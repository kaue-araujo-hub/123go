import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { games } from '../data/games';
import { StudentGameCard } from '../components/StudentGameCard';
import styles from './StudentCatalog.module.css';

export function StudentCatalog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const q = searchQuery.toLowerCase();
    return games.filter(g => g.title.toLowerCase().includes(q));
  }, [searchQuery]);

  function handleCardTap(path: string) {
    setLocation(path);
  }

  return (
    <div className={styles.screen}>

      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onPointerUp={() => setLocation('/')}
          aria-label="Voltar à tela inicial"
          style={{ touchAction: 'manipulation' }}
        >
          ←
        </button>

        <h1 className={styles.logo} aria-label="123GO!">
          <span style={{ color: '#5B4FCF' }}>1</span>
          <span style={{ color: '#E91E8C' }}>2</span>
          <span style={{ color: '#FF6B35' }}>3</span>
          <span style={{ color: '#fff' }}>G</span>
          <span style={{ color: '#4CAF50' }}>O</span>
          <span style={{ color: '#E91E8C' }}>!</span>
        </h1>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar jogo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Buscar jogo por nome"
          />
        </div>
      </header>

      <main className={styles.main}>
        {filteredGames.length === 0 ? (
          <div className={styles.empty} role="status">
            <span aria-hidden="true">🔍</span>
            <p>Nenhum jogo encontrado para "{searchQuery}"</p>
          </div>
        ) : (
          <div
            className={styles.grid}
            role="list"
            aria-label={`${filteredGames.length} jogos disponíveis`}
          >
            {filteredGames.map((game, index) => (
              <StudentGameCard
                key={game.id}
                game={game}
                index={index}
                onTap={handleCardTap}
              />
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
