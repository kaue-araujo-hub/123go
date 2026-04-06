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

  function handleTeacher() {
    if (SessionManager.isTeacher()) {
      setLocation('/catalog');
    } else {
      setLocation('/teacher-pin');
    }
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
        <div className={styles.numbersArt} aria-hidden="true">
          <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="200" height="120">
            <rect x="4"  y="2"  width="12" height="6"  rx="2" fill="#FF6B35" opacity="0.9"/>
            <rect x="10" y="2"  width="6"  height="52" rx="2" fill="#4CAF50" opacity="0.85"/>
            <rect x="4"  y="50" width="22" height="6"  rx="2" fill="#4CAF50" opacity="0.7"/>
            <path d="M38 8 A16 16 0 0 1 70 8 Q70 22 55 32 L38 48 L70 48" stroke="#E91E8C" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <rect x="38" y="22" width="32" height="7" rx="3" fill="#5B4FCF" opacity="0.5"/>
            <rect x="46" y="36" width="24" height="7" rx="3" fill="#FF9800" opacity="0.6"/>
            <path d="M88 8 A14 14 0 0 1 116 8 Q116 22 102 26 Q116 30 116 44 A14 14 0 0 1 88 44" stroke="#00B4D8" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <rect x="100" y="6"  width="18" height="14" rx="3" fill="#FF9800" opacity="0.55"/>
            <ellipse cx="110" cy="26" rx="10" ry="8"  fill="#5B4FCF" opacity="0.35"/>
            <ellipse cx="110" cy="44" rx="10" ry="10" fill="#E91E8C" opacity="0.4"/>
            <line x1="14" y1="68" x2="2"  y2="82"  stroke="#5B4FCF" strokeWidth="7" strokeLinecap="round"/>
            <ellipse cx="14" cy="100" rx="14" ry="14" fill="#4CAF50" opacity="0.8"/>
            <ellipse cx="14" cy="100" rx="9"  ry="9"  fill="#2D6A30" opacity="0.4"/>
            <path d="M14 86 A14 14 0 0 1 28 100" stroke="#5B4FCF" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <rect x="46" y="66" width="30" height="7" rx="3" fill="#00B8A0"/>
            <rect x="58" y="66" width="7"  height="8" rx="2" fill="#3D4A3D" opacity="0.5"/>
            <line x1="76" y1="68" x2="52" y2="118" stroke="#E91E8C" strokeWidth="7" strokeLinecap="round"/>
            <ellipse cx="166" cy="84"  rx="16" ry="16" fill="#FF6B35" opacity="0.85"/>
            <ellipse cx="166" cy="104" rx="16" ry="16" fill="#00B4D8" opacity="0.85"/>
            <ellipse cx="166" cy="96"  rx="10" ry="8"  fill="#3D3D3D" opacity="0.3"/>
          </svg>
        </div>

        <h1 className={styles.logoText} aria-label="123GO!">
          <span style={{ color: '#5B4FCF' }}>1</span>
          <span style={{ color: '#E91E8C' }}>2</span>
          <span style={{ color: '#FF6B35' }}>3</span>
          <span style={{ color: '#fff' }}>G</span>
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
          aria-label="Entrar como Aluno ou Visitante"
          style={{ touchAction: 'manipulation' }}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.35 }}
        >
          <span className={styles.btnIcon} aria-hidden="true">🎮</span>
          <div className={styles.btnText}>
            <span className={styles.btnTitle}>Aluno / Visitante</span>
            <span className={styles.btnSub}>Jogar agora</span>
          </div>
          <span className={styles.btnArrow} aria-hidden="true">→</span>
        </motion.button>

        <motion.button
          className={`${styles.btn} ${styles.btnTeacher}`}
          onPointerUp={handleTeacher}
          aria-label="Entrar como Professor ou Instrutor"
          style={{ touchAction: 'manipulation' }}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.48 }}
        >
          <span className={styles.btnIcon} aria-hidden="true">🎓</span>
          <div className={styles.btnText}>
            <span className={styles.btnTitle}>Professor / Instrutor</span>
            <span className={styles.btnSub}>Gerenciar turma</span>
          </div>
          <span className={styles.btnArrow} aria-hidden="true">→</span>
        </motion.button>

      </div>

      <p className={styles.footer} aria-hidden="true">
        Currículo Paulista · 1º ano · Matemática
      </p>

    </div>
  );
}
