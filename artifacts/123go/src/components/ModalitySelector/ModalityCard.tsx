/**
 * ModalityCard.tsx
 * Card individual de cada modalidade no carrossel — com tilt 3D sutil ao hover.
 */

import { useRef } from 'react';
import type { ModeMeta } from '../../engine/ModeConfig';
import styles from './ModalityCard.module.css';

interface ModalityCardProps {
  meta:     ModeMeta;
  isActive: boolean;
  onSelect: () => void;
}

export function ModalityCard({ meta, isActive, onSelect }: ModalityCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(600px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.03) translateZ(0)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = '';
  }

  return (
    <button
      ref={cardRef}
      role="radio"
      aria-checked={isActive}
      aria-label={`Modalidade ${meta.label}: ${meta.tagline}`}
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      style={{ '--mode-color': meta.color, '--mode-bg': meta.colorBg } as React.CSSProperties}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {isActive && (
        <span className={styles.checkmark} aria-hidden="true">✓</span>
      )}
      <span className={styles.emoji} aria-hidden="true">{meta.emoji}</span>
      <h3 className={styles.title}>{meta.label}</h3>
      <p  className={styles.tagline}>{meta.tagline}</p>
      <p  className={styles.description}>{meta.description}</p>
    </button>
  );
}
