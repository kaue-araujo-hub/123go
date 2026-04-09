import React, { useState } from 'react';
import { games } from '../../data/games';
import { NivelModal } from './NivelModal';
import styles from './NivelCards.module.css';

type NivelId = 'pre-numerico' | 'numerico';

interface NivelDef {
  id:        NivelId;
  label:     string;
  sublabel:  string;
  emoji:     string;
  color:     string;
  colorBg:   string;
  colorDark: string;
  descricao: string;
  tag:       string;
}

const NIVEIS: NivelDef[] = [
  {
    id:        'pre-numerico',
    label:     'Pré-numérico',
    sublabel:  'Comparar, classificar e perceber',
    emoji:     '🌱',
    color:     '#00B4D8',
    colorBg:   '#E6F1FB',
    colorDark: '#0C447C',
    descricao: 'Antes de contar, a criança aprende a comparar tamanhos, reconhecer formas e perceber "mais" e "menos" de forma visual.',
    tag:       '3 jogos',
  },
  {
    id:        'numerico',
    label:     'Numérico',
    sublabel:  'Contar, nomear e relacionar',
    emoji:     '🔢',
    color:     '#5B4FCF',
    colorBg:   '#EEEDFE',
    colorDark: '#26215C',
    descricao: 'A criança conta objetos, associa números a quantidades e começa a construir os primeiros fatos matemáticos.',
    tag:       '3 jogos',
  },
];

export function NivelCards() {
  const [activeNivel, setActiveNivel] = useState<NivelId | null>(null);

  const jogosDoNivel = activeNivel
    ? games.filter(g => g.nivel === activeNivel)
    : [];

  const nivelAtivo = activeNivel ? NIVEIS.find(n => n.id === activeNivel) ?? null : null;

  return (
    <>
      <section className={styles.section} aria-label="Níveis de aprendizagem">
        <h2 className={styles.sectionTitle}>Nível</h2>

        <div className={styles.grid}>
          {NIVEIS.map((nivel, i) => (
            <button
              key={nivel.id}
              className={styles.card}
              style={{
                '--nivel-color': nivel.color,
                '--nivel-bg':    nivel.colorBg,
                '--nivel-dark':  nivel.colorDark,
                animationDelay:  `${i * 0.08}s`,
                touchAction:     'manipulation',
              } as React.CSSProperties}
              onPointerUp={() => setActiveNivel(nivel.id)}
              aria-label={`Nível ${nivel.label} — ${nivel.tag}`}
              aria-haspopup="dialog"
            >
              <span className={styles.cardEmoji} aria-hidden="true">
                {nivel.emoji}
              </span>
              <div className={styles.cardText}>
                <span className={styles.cardLabel}>{nivel.label}</span>
                <span className={styles.cardSub}>{nivel.sublabel}</span>
              </div>
              <span className={styles.cardTag} aria-hidden="true">
                {nivel.tag}
              </span>
              <span className={styles.cardArrow} aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </section>

      {activeNivel && nivelAtivo && (
        <NivelModal
          nivel={nivelAtivo}
          jogos={jogosDoNivel}
          onClose={() => setActiveNivel(null)}
        />
      )}
    </>
  );
}
