import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { SessionManager } from '../auth/SessionManager';
import styles from './EntryScreen.module.css';

const BUBBLES = ['#5B4FCF','#E91E8C','#FF6B35','#4CAF50','#00B4D8','#FF9800','#5B4FCF','#E91E8C'];

export function EntryScreen() {
  const [, setLocation] = useLocation();

  function handleStudent() {
    SessionManager.logoutTeacher();
    setLocation('/student');
  }

  return (
    <div className={styles.screen} role="main">

      {/* Floating bubbles background */}
      <div className={styles.bg} aria-hidden="true">
        {BUBBLES.map((color, i) => (
          <span
            key={i}
            className={styles.bubble}
            style={{
              '--bubble-color': color,
              '--bubble-x':     `${10 + i * 11}%`,
              '--bubble-size':  `${24 + (i % 3) * 16}px`,
              '--bubble-delay': `${i * 0.4}s`,
              '--bubble-dur':   `${4 + (i % 3)}s`,
            } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        className={styles.logoWrap}
        initial={{ scale: 0.6, y: -20, opacity: 0 }}
        animate={{ scale: 1,   y: 0,   opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.05 }}
        aria-label="123GO! Plataforma de jogos de matemática"
      >
        <h1 className={styles.logoText} aria-label="123GO!">
          <span style={{ color: '#5B4FCF' }}>1</span>
          <span style={{ color: '#E91E8C' }}>2</span>
          <span style={{ color: '#FF6B35' }}>3</span>
          <span style={{ color: '#1A1A2E' }}>G</span>
          <span style={{ color: '#4CAF50' }}>O</span>
          <span style={{ color: '#E91E8C' }}>!</span>
        </h1>
        <p className={styles.tagline}>Jogos de Matemática</p>
      </motion.div>

      {/* Profile buttons */}
      <div className={styles.buttons} role="group" aria-label="Escolha seu perfil">

        <motion.button
          className={`${styles.btn} ${styles.btnStudent}`}
          onPointerUp={handleStudent}
          aria-label="Jogar agora"
          style={{ touchAction: 'manipulation' }}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.35 }}
        >
          <span className={styles.btnIcon} aria-hidden="true">🎮</span>
          <div className={styles.btnText}>
            <span className={styles.btnTitle}>Jogar Agora</span>
          </div>
          <span className={styles.btnArrow} aria-hidden="true">→</span>
        </motion.button>

      </div>

    </div>
  );
}
