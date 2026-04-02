import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { games } from '../data/games';

const temaColors: Record<string, string> = {
  numeros:      '#10B981',
  algebra:      '#3B82F6',
  geometria:    '#F59E0B',
  grandezas:    '#8B5CF6',
  probabilidade:'#EF4444',
};

// Use all 21 games, duplicated for seamless loop
const MARQUEE_GAMES = [...games, ...games];

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 90, damping: 18 },
  },
};

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── Center content ── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={STAGGER}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          zIndex: 10,
          position: 'relative',
          marginBottom: '20vh',
        }}
      >
        {/* Logo */}
        <motion.div variants={FADE_UP} style={{
          fontFamily: 'Nunito',
          fontWeight: 900,
          fontSize: 38,
          letterSpacing: '-1px',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          <span style={{ color: '#F59E0B' }}>1</span>
          <span style={{ color: '#EF4444' }}>2</span>
          <span style={{ color: '#3B82F6' }}>3</span>
          <span style={{ color: '#111' }}>G</span>
          <span style={{ color: '#10B981' }}>O</span>
          <span style={{ color: '#EF4444' }}>!</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={FADE_UP}
          style={{
            fontFamily: 'Nunito',
            fontWeight: 900,
            fontSize: 'clamp(32px, 6vw, 64px)',
            color: '#111',
            margin: '0 0 16px',
            lineHeight: 1.1,
            letterSpacing: '-1px',
          }}
        >
          Jogos Educativos
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={FADE_UP}
          style={{
            fontFamily: 'Nunito Sans',
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: '#666',
            maxWidth: 480,
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          Plataforma de jogos educacionais que transforma o aprendizado em uma
          experiência interativa, divertida e significativa.
        </motion.p>

        {/* CTA button */}
        <motion.button
          variants={FADE_UP}
          onClick={() => setLocation('/catalog')}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          style={{
            padding: '14px 42px',
            borderRadius: 9999,
            border: 'none',
            background: '#111',
            color: '#fff',
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 17,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            letterSpacing: '0.2px',
          }}
        >
          Começar
        </motion.button>
      </motion.div>

      {/* ── Marquee strip ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '42%',
        maskImage: 'linear-gradient(to bottom, transparent, black 28%, black 78%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 28%, black 78%, transparent)',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <motion.div
          style={{ display: 'flex', gap: 16, alignItems: 'flex-end', paddingBottom: 8 }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ ease: 'linear', duration: 38, repeat: Infinity }}
        >
          {MARQUEE_GAMES.map((game, i) => (
            <MarqueeCard key={`${game.id}-${i}`} game={game} index={i} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function MarqueeCard({ game, index }: { game: (typeof games)[0]; index: number }) {
  const accent = temaColors[game.tema] ?? '#10B981';
  const tiltDeg = index % 2 === 0 ? -4 : 4;

  return (
    <div style={{
      flexShrink: 0,
      width: 140,
      height: 190,
      borderRadius: 18,
      background: game.bg,
      border: `2px solid ${accent}30`,
      boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      transform: `rotate(${tiltDeg}deg)`,
      userSelect: 'none',
    }}>
      <span style={{ fontSize: 52, lineHeight: 1 }}>{game.emoji}</span>
      <span style={{
        fontFamily: 'Nunito',
        fontWeight: 800,
        fontSize: 11,
        color: '#333',
        textAlign: 'center',
        padding: '0 8px',
        lineHeight: 1.3,
      }}>
        {game.title}
      </span>
    </div>
  );
}
