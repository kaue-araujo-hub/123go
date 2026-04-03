import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  {
    attribute: 'cor',
    label: 'Organize por COR!',
    drawers: [
      { label: '🔴 Vermelho', key: 'red', color: '#EF5350' },
      { label: '🔵 Azul', key: 'blue', color: '#42A5F5' },
      { label: '🟡 Amarelo', key: 'yellow', color: '#FFA726' },
    ],
    objects: [
      { emoji: '🍎', attr: 'red' }, { emoji: '🌹', attr: 'red' }, { emoji: '❤️', attr: 'red' },
      { emoji: '💙', attr: 'blue' }, { emoji: '🫐', attr: 'blue' }, { emoji: '🐋', attr: 'blue' },
      { emoji: '⭐', attr: 'yellow' }, { emoji: '🌟', attr: 'yellow' }, { emoji: '🌻', attr: 'yellow' },
    ],
  },
  {
    attribute: 'forma',
    label: 'Organize por FORMA!',
    drawers: [
      { label: '⬛ Quadrado', key: 'square', color: '#5B4FCF' },
      { label: '⭕ Círculo', key: 'circle', color: '#E91E8C' },
      { label: '🔺 Triângulo', key: 'triangle', color: '#FF6B35' },
    ],
    objects: [
      { emoji: '📦', attr: 'square' }, { emoji: '🎁', attr: 'square' }, { emoji: '📱', attr: 'square' },
      { emoji: '🌍', attr: 'circle' }, { emoji: '⚽', attr: 'circle' }, { emoji: '🎱', attr: 'circle' },
      { emoji: '🍕', attr: 'triangle' }, { emoji: '⛰️', attr: 'triangle' }, { emoji: '🎄', attr: 'triangle' },
    ],
  },
  {
    attribute: 'tamanho',
    label: 'Organize por TAMANHO!',
    drawers: [
      { label: '🔹 Pequeno', key: 'small', color: '#4CAF50' },
      { label: '🔷 Médio', key: 'medium', color: '#FF9800' },
      { label: '💠 Grande', key: 'large', color: '#9C27B0' },
    ],
    objects: [
      { emoji: '🐜', attr: 'small' }, { emoji: '🐦', attr: 'small' }, { emoji: '🐝', attr: 'small' },
      { emoji: '🐕', attr: 'medium' }, { emoji: '🐱', attr: 'medium' }, { emoji: '🐇', attr: 'medium' },
      { emoji: '🐘', attr: 'large' }, { emoji: '🦁', attr: 'large' }, { emoji: '🐄', attr: 'large' },
    ],
  },
  {
    attribute: 'cor+forma',
    label: 'Organize por COR e FORMA!',
    drawers: [
      { label: '🔴⬛ Vermelho Quadrado', key: 'red-square', color: '#EF5350' },
      { label: '🔵⭕ Azul Círculo', key: 'blue-circle', color: '#42A5F5' },
      { label: '🟡🔺 Amarelo Triângulo', key: 'yellow-triangle', color: '#FFA726' },
    ],
    objects: [
      { emoji: '🟥', attr: 'red-square' }, { emoji: '❤️‍🔥', attr: 'red-square' }, { emoji: '🔴', attr: 'red-square' },
      { emoji: '🔵', attr: 'blue-circle' }, { emoji: '💙', attr: 'blue-circle' }, { emoji: '🫐', attr: 'blue-circle' },
      { emoji: '⭐', attr: 'yellow-triangle' }, { emoji: '🌟', attr: 'yellow-triangle' }, { emoji: '🏔️', attr: 'yellow-triangle' },
    ],
  },
  {
    attribute: 'mistério',
    label: 'Descubra o atributo misterioso!',
    hint: 'Dica: observe o que todos os objetos em cada gaveta têm em comum!',
    drawers: [
      { label: '?', key: 'water', color: '#00B4D8' },
      { label: '?', key: 'land', color: '#4CAF50' },
      { label: '?', key: 'sky', color: '#5B4FCF' },
    ],
    objects: [
      { emoji: '🐟', attr: 'water' }, { emoji: '🐠', attr: 'water' }, { emoji: '🦈', attr: 'water' },
      { emoji: '🐘', attr: 'land' }, { emoji: '🐆', attr: 'land' }, { emoji: '🦊', attr: 'land' },
      { emoji: '🦅', attr: 'sky' }, { emoji: '🦋', attr: 'sky' }, { emoji: '🐦', attr: 'sky' },
    ],
  },
];

export function AtelieOrdem() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [dragging, setDragging] = useState<{emoji: string, attr: string} | null>(null);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    setPlaced({});
    setFeedback(null);
    setDragging(null);
  }, [phase]);

  const remaining = phaseData.objects.filter(o => !Object.values(placed).flat().includes(o.emoji));

  useEffect(() => {
    if (remaining.length === 0 && !phaseComplete) {
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [remaining.length, phaseComplete, onCorrect, onPhaseComplete]);

  const handleDrop = (drawerKey: string) => {
    if (!dragging) return;
    const correct = dragging.attr === drawerKey;
    if (correct) {
      setPlaced(prev => ({
        ...prev,
        [drawerKey]: [...(prev[drawerKey] || []), dragging.emoji],
      }));
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
    setDragging(null);
  };

  const handleTap = (emoji: string, attr: string) => {
    // Cycle through drawers on tap
    const drawerIdx = phaseData.drawers.findIndex(d => d.key === attr);
    if (drawerIdx !== -1) {
      setPlaced(prev => ({
        ...prev,
        [attr]: [...(prev[attr] || []), emoji],
      }));
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Ateliê da Ordem" emoji="🎨" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Ateliê da Ordem" emoji="🎨" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>
          {phaseData.label}
        </h2>
        {(phaseData as any).hint && (
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>{(phaseData as any).hint}</p>
        )}
      </div>

      {/* Objects to sort */}
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        padding: 16,
        marginBottom: 16,
        minHeight: 80,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
      }}>
        {remaining.map((obj, i) => (
          <div
            key={obj.emoji}
            draggable
            onDragStart={() => setDragging(obj)}
            onClick={() => handleTap(obj.emoji, obj.attr)}
            style={{
              width: 56,
              height: 56,
              fontSize: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              background: 'var(--bg)',
              borderRadius: 12,
              border: '1.5px solid var(--border)',
              minHeight: 72,
              minWidth: 56,
            }}
          ><AppleEmoji emoji={obj.emoji} size={36} /></div>
        ))}
        {remaining.length === 0 && (
          <p style={{ color: 'var(--c5)', fontWeight: 700 }}>Tudo organizado!</p>
        )}
      </div>

      {/* Drawers */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {phaseData.drawers.map(drawer => (
          <div
            key={drawer.key}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(drawer.key)}
            style={{
              flex: 1,
              minWidth: 90,
              padding: 12,
              borderRadius: 16,
              border: `3px solid ${drawer.color}`,
              background: `${drawer.color}15`,
              minHeight: 90,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: drawer.color, textAlign: 'center' }}>{drawer.label}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {(placed[drawer.key] || []).map((emoji, i) => (
                <AppleEmoji key={i} emoji={emoji} size={24} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 10 }}>
        Toque nos objetos ou arraste para as gavetas
      </p>
    </GameShell>
  );
}
