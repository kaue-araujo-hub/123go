import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  {
    attribute: 'cor', label: 'Organize por COR!',
    drawers: [
      { label: '🔴 Vermelho', key: 'red',    color: '#EF5350' },
      { label: '🔵 Azul',    key: 'blue',   color: '#42A5F5' },
      { label: '🟡 Amarelo', key: 'yellow', color: '#FFA726' },
    ],
    objects: [
      { emoji: '🍎', attr: 'red' },    { emoji: '🌹', attr: 'red' },    { emoji: '❤️', attr: 'red' },
      { emoji: '💙', attr: 'blue' },   { emoji: '🫐', attr: 'blue' },   { emoji: '🐋', attr: 'blue' },
      { emoji: '⭐', attr: 'yellow' }, { emoji: '🌟', attr: 'yellow' }, { emoji: '🌻', attr: 'yellow' },
    ],
    mystery: false,
  },
  {
    attribute: 'forma', label: 'Organize por FORMA!',
    drawers: [
      { label: '⬛ Quadrado', key: 'square',   color: '#5B4FCF' },
      { label: '⭕ Círculo',  key: 'circle',   color: '#E91E8C' },
      { label: '🔺 Triângulo',key: 'triangle', color: '#FF6B35' },
    ],
    objects: [
      { emoji: '📦', attr: 'square' },   { emoji: '🎁', attr: 'square' },   { emoji: '📱', attr: 'square' },
      { emoji: '🌍', attr: 'circle' },   { emoji: '⚽', attr: 'circle' },   { emoji: '🎱', attr: 'circle' },
      { emoji: '🍕', attr: 'triangle' }, { emoji: '⛰️', attr: 'triangle' }, { emoji: '🎄', attr: 'triangle' },
    ],
    mystery: false,
  },
  {
    attribute: 'tamanho', label: 'Organize por TAMANHO!',
    drawers: [
      { label: '🔹 Pequeno', key: 'small',  color: '#4CAF50' },
      { label: '🔷 Médio',   key: 'medium', color: '#FF9800' },
      { label: '💠 Grande',  key: 'large',  color: '#9C27B0' },
    ],
    objects: [
      { emoji: '🐜', attr: 'small' },  { emoji: '🐦', attr: 'small' },  { emoji: '🐝', attr: 'small' },
      { emoji: '🐕', attr: 'medium' }, { emoji: '🐱', attr: 'medium' }, { emoji: '🐇', attr: 'medium' },
      { emoji: '🐘', attr: 'large' },  { emoji: '🦁', attr: 'large' },  { emoji: '🐄', attr: 'large' },
    ],
    mystery: false,
  },
  {
    attribute: 'cor+forma', label: 'Organize por COR e FORMA!',
    drawers: [
      { label: '🔴⬛ Vermelho Quadrado', key: 'red-square',       color: '#EF5350' },
      { label: '🔵⭕ Azul Círculo',      key: 'blue-circle',      color: '#42A5F5' },
      { label: '🟡🔺 Amarelo Triângulo', key: 'yellow-triangle',  color: '#FFA726' },
    ],
    objects: [
      { emoji: '🟥', attr: 'red-square' },      { emoji: '❤️', attr: 'red-square' },       { emoji: '🔴', attr: 'red-square' },
      { emoji: '🔵', attr: 'blue-circle' },     { emoji: '💙', attr: 'blue-circle' },      { emoji: '🫐', attr: 'blue-circle' },
      { emoji: '⭐', attr: 'yellow-triangle' }, { emoji: '🌟', attr: 'yellow-triangle' },  { emoji: '🏔️', attr: 'yellow-triangle' },
    ],
    mystery: false,
  },
  {
    attribute: 'mistério', label: 'Descubra o atributo misterioso!',
    drawers: [
      { label: '?', key: 'water', color: '#00B4D8' },
      { label: '?', key: 'land',  color: '#4CAF50' },
      { label: '?', key: 'sky',   color: '#5B4FCF' },
    ],
    objects: [
      { emoji: '🐟', attr: 'water' }, { emoji: '🐠', attr: 'water' }, { emoji: '🦈', attr: 'water' },
      { emoji: '🐘', attr: 'land' },  { emoji: '🐆', attr: 'land' },  { emoji: '🦊', attr: 'land' },
      { emoji: '🦅', attr: 'sky' },   { emoji: '🦋', attr: 'sky' },   { emoji: '🐦', attr: 'sky' },
    ],
    mystery: true,
  },
];

const MYSTERY_HINTS: Record<string, string> = { water: '🌊 Água', land: '🌿 Terra', sky: '☁️ Céu' };

export function AtelieOrdem() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<{ emoji: string; attr: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const phaseCompletedRef = useRef(false);
  const correctRef = useRef(0);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    correctRef.current = 0;
    setPlaced({});
    setFeedback(null);
    setSelected(null);
    setCorrectCount(0);
  }, [phase]);

  const remaining = phaseData.objects.filter(o => !Object.values(placed).flat().includes(o.emoji));

  useEffect(() => {
    if (remaining.length === 0 && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [remaining.length, onCorrect, onPhaseComplete]);

  const handleObjectTap = (obj: { emoji: string; attr: string }) => {
    if (phaseCompletedRef.current) return;
    setSelected(prev => prev?.emoji === obj.emoji ? null : obj);
  };

  const handleDrawerTap = (drawerKey: string) => {
    if (!selected || phaseCompletedRef.current) return;
    const correct = selected.attr === drawerKey;
    if (correct) {
      setPlaced(prev => ({ ...prev, [drawerKey]: [...(prev[drawerKey] || []), selected.emoji] }));
      const nc = correctRef.current + 1;
      correctRef.current = nc;
      setCorrectCount(nc);
      setSelected(null);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Ateliê da Ordem" emoji="🗂️" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Ateliê da Ordem" emoji="🗂️" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>
          {phaseData.label}
        </h2>
        {selected && <p style={{ color: 'var(--c3)', fontSize: 13, fontWeight: 700 }}>Agora toque na gaveta correta!</p>}
        {!selected && remaining.length > 0 && <p style={{ color: 'var(--text2)', fontSize: 13 }}>Toque em um objeto para selecionar</p>}
        {phaseData.mystery && correctCount >= 2 && (
          <p style={{ color: '#00B4D8', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
            💡 Dica: cada gaveta representa um habitat — {Object.keys(MYSTERY_HINTS).map(k => MYSTERY_HINTS[k]).join(', ')}
          </p>
        )}
      </div>

      {/* Objects */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: 12, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', minHeight: 72 }}>
        {remaining.map(obj => (
          <div
            key={obj.emoji}
            onPointerUp={() => handleObjectTap(obj)}
            style={{
              width: 62, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', background: selected?.emoji === obj.emoji ? '#E3F2FD' : 'var(--bg)',
              borderRadius: 16, border: `2.5px solid ${selected?.emoji === obj.emoji ? 'var(--c3)' : 'var(--border)'}`,
              boxShadow: selected?.emoji === obj.emoji ? '0 0 0 3px rgba(91,79,207,0.3)' : '0 2px 6px rgba(0,0,0,0.07)',
              transition: 'all 0.15s', touchAction: 'manipulation',
              transform: selected?.emoji === obj.emoji ? 'scale(1.1) translateZ(0)' : 'scale(1) translateZ(0)',
            }}
          >
            <AppleEmoji emoji={obj.emoji} size={44} />
          </div>
        ))}
        {remaining.length === 0 && <p style={{ color: 'var(--c5)', fontWeight: 700, margin: 0 }}>✅ Tudo organizado!</p>}
      </div>

      {/* Drawers */}
      <div style={{ display: 'flex', gap: 8 }}>
        {phaseData.drawers.map(drawer => {
          const hint = phaseData.mystery && correctCount >= 2 ? MYSTERY_HINTS[drawer.key] : null;
          return (
            <div
              key={drawer.key}
              onPointerUp={() => handleDrawerTap(drawer.key)}
              style={{
                flex: 1, padding: '8px 6px', borderRadius: 16,
                border: `3px solid ${selected ? drawer.color : `${drawer.color}88`}`,
                background: selected ? `${drawer.color}22` : `${drawer.color}10`,
                minHeight: 130, display: 'flex', flexDirection: 'column', gap: 5,
                alignItems: 'center', cursor: selected ? 'pointer' : 'default',
                transition: 'all 0.2s', touchAction: 'manipulation',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: drawer.color, textAlign: 'center', fontFamily: 'Nunito', lineHeight: 1.2 }}>
                {hint ?? drawer.label}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', flex: 1, alignContent: 'center' }}>
                {(placed[drawer.key] || []).map((emoji, i) => (
                  <AppleEmoji key={i} emoji={emoji} size={28} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, marginTop: 6 }}>
        {selected ? `"${selected.emoji}" selecionado — toque na gaveta certa` : 'Toque nos objetos para organizar'}
      </p>
    </GameShell>
  );
}
