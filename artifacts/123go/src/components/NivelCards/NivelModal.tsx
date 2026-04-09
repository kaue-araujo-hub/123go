import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { AppleEmoji } from '../../utils/AppleEmoji';
import { type Game } from '../../data/games';
import styles from './NivelModal.module.css';

interface NivelDef {
  id:        string;
  label:     string;
  emoji:     string;
  color:     string;
  colorBg:   string;
  descricao: string;
}

interface Props {
  nivel:   NivelDef;
  jogos:   Game[];
  onClose: () => void;
}

export function NivelModal({ nivel, jogos, onClose }: Props) {
  const [, setLocation] = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleGameTap(jogo: Game) {
    onClose();
    setLocation(jogo.path);
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nivel-modal-title"
        tabIndex={-1}
        style={{ '--modal-color': nivel.color, '--modal-bg': nivel.colorBg } as React.CSSProperties}
      >
        <div className={styles.handle} aria-hidden="true" />

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEmoji} aria-hidden="true">{nivel.emoji}</span>
            <div>
              <h2 id="nivel-modal-title" className={styles.headerTitle}>
                Nível {nivel.label}
              </h2>
              <p className={styles.headerDesc}>{nivel.descricao}</p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onPointerUp={onClose}
            aria-label="Fechar modal"
            style={{ touchAction: 'manipulation' }}
          >
            ✕
          </button>
        </div>

        <div className={styles.jogosList} role="list">
          {jogos.map((jogo, i) => (
            <button
              key={jogo.id}
              className={styles.jogoCard}
              style={{
                animationDelay: `${i * 0.07}s`,
                touchAction: 'manipulation',
              } as React.CSSProperties}
              onPointerUp={() => handleGameTap(jogo)}
              role="listitem"
              aria-label={`Jogar ${jogo.title}`}
            >
              <div
                className={styles.jogoThumb}
                style={{ background: jogo.bg }}
                aria-hidden="true"
              >
                <AppleEmoji emoji={jogo.emoji} size={42} />
              </div>

              <div className={styles.jogoInfo}>
                <span className={styles.jogoTitle}>{jogo.title}</span>
                <span className={styles.jogoDesc}>{jogo.desc}</span>
                <span className={styles.jogoCodigo}>{jogo.codigo}</span>
              </div>

              <span className={styles.jogoArrow} aria-hidden="true">▶</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
