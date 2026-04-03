import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const ALIENS = [
  { emoji: '👽', color: 'green', shape: 'circle', id: 'a1' },
  { emoji: '🟢', color: 'green', shape: 'circle', id: 'a2' },
  { emoji: '🤖', color: 'blue', shape: 'square', id: 'a3' },
  { emoji: '🔵', color: 'blue', shape: 'circle', id: 'a4' },
  { emoji: '👻', color: 'white', shape: 'circle', id: 'a5' },
  { emoji: '🟡', color: 'yellow', shape: 'circle', id: 'a6' },
];

const PHASES = [
  {
    label: 'Organize por COR!',
    compartments: [
      { key: 'green', label: '🟢 Verde', color: '#4CAF50' },
      { key: 'blue', label: '🔵 Azul', color: '#2196F3' },
      { key: 'white', label: '⚪ Branco', color: '#9E9E9E' },
    ],
    getAttr: (a: typeof ALIENS[0]) => a.color,
    aliens: ALIENS,
  },
  {
    label: 'Organize por FORMA!',
    compartments: [
      { key: 'circle', label: '⭕ Círculo', color: '#E91E8C' },
      { key: 'square', label: '⬛ Quadrado', color: '#5B4FCF' },
    ],
    getAttr: (a: typeof ALIENS[0]) => a.shape,
    aliens: ALIENS.slice(0, 4),
  },
  {
    label: 'Organize por COR e FORMA!',
    compartments: [
      { key: 'green', label: '🟢 Verde', color: '#4CAF50' },
      { key: 'blue', label: '🔵 Azul', color: '#2196F3' },
    ],
    getAttr: (a: typeof ALIENS[0]) => a.color,
    aliens: ALIENS.slice(0, 4),
  },
  {
    label: 'Os aliens estão caindo! Organize rápido!',
    compartments: [
      { key: 'green', label: '🟢 Verde', color: '#4CAF50' },
      { key: 'blue', label: '🔵 Azul', color: '#2196F3' },
      { key: 'yellow', label: '🟡 Amarelo', color: '#FF9800' },
    ],
    getAttr: (a: typeof ALIENS[0]) => a.color,
    aliens: ALIENS,
  },
  {
    label: 'Compartimento misterioso — descubra o padrão!',
    compartments: [
      { key: 'circle', label: '?', color: '#9C27B0' },
      { key: 'square', label: '?', color: '#FF5722' },
    ],
    getAttr: (a: typeof ALIENS[0]) => a.shape,
    aliens: ALIENS.slice(0, 4),
  },
];

export function NaveOrganizadora() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [dragging, setDragging] = useState<typeof ALIENS[0] | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setPlaced({}); setFeedback(null); }, [phase]);

  const remaining = phaseData.aliens.filter(a => !Object.values(placed).flat().includes(a.id));

  useEffect(() => {
    if (remaining.length === 0 && !phaseComplete) {
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [remaining.length, phaseComplete, onCorrect, onPhaseComplete]);

  const handleDrop = (key: string) => {
    if (!dragging) return;
    const correct = phaseData.getAttr(dragging) === key;
    if (correct) {
      setPlaced(prev => ({ ...prev, [key]: [...(prev[key] || []), dragging.id] }));
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
    setDragging(null);
  };

  const handleTap = (alien: typeof ALIENS[0]) => {
    const correctKey = phaseData.getAttr(alien);
    setPlaced(prev => ({ ...prev, [correctKey]: [...(prev[correctKey] || []), alien.id] }));
  };

  if (phaseComplete) {
    return (
      <GameShell title="Nave Organizadora" emoji="🚀" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Nave Organizadora" emoji="🚀" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, textAlign: 'center', marginBottom: 16, color: 'var(--text)' }}>
        {phaseData.label}
      </h2>

      {/* Aliens to sort */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: 16, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', minHeight: 80 }}>
        {remaining.map(alien => (
          <div
            key={alien.id}
            draggable
            onDragStart={() => setDragging(alien)}
            onClick={() => handleTap(alien)}
            style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', background: 'var(--bg)', borderRadius: 12, border: '1.5px solid var(--border)', minHeight: 60 }}
          ><AppleEmoji emoji={alien.emoji} size={40} /></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {phaseData.compartments.map(comp => (
          <div
            key={comp.key}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(comp.key)}
            style={{ flex: 1, minWidth: 90, padding: 12, borderRadius: 16, border: `3px solid ${comp.color}`, background: `${comp.color}15`, minHeight: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: comp.color, textAlign: 'center' }}>{comp.label}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {(placed[comp.key] || []).map((id, i) => {
                const alien = ALIENS.find(a => a.id === id);
                return alien ? <AppleEmoji key={i} emoji={alien.emoji} size={28} /> : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </GameShell>
  );
}
