import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const ALIENS = [
  { emoji: '👽', color: 'green',  shape: 'circle', id: 'a1' },
  { emoji: '🟢', color: 'green',  shape: 'circle', id: 'a2' },
  { emoji: '🤖', color: 'blue',   shape: 'square', id: 'a3' },
  { emoji: '🔵', color: 'blue',   shape: 'circle', id: 'a4' },
  { emoji: '👻', color: 'white',  shape: 'circle', id: 'a5' },
  { emoji: '🟡', color: 'yellow', shape: 'circle', id: 'a6' },
];

const PHASES = [
  {
    label: 'Organize por COR!',
    compartments: [
      { key: 'green',  label: '🟢 Verde',   color: '#4CAF50' },
      { key: 'blue',   label: '🔵 Azul',    color: '#2196F3' },
      { key: 'white',  label: '⚪ Branco',  color: '#9E9E9E' },
    ],
    getAttr: (a: typeof ALIENS[0]) => a.color,
    aliens: ALIENS,
  },
  {
    label: 'Organize por FORMA!',
    compartments: [
      { key: 'circle', label: '⭕ Círculo',  color: '#E91E8C' },
      { key: 'square', label: '⬛ Quadrado', color: '#5B4FCF' },
    ],
    getAttr: (a: typeof ALIENS[0]) => a.shape,
    aliens: ALIENS.slice(0, 4),
  },
  {
    label: 'Organize por COR e FORMA!',
    compartments: [
      { key: 'green', label: '🟢 Verde', color: '#4CAF50' },
      { key: 'blue',  label: '🔵 Azul',  color: '#2196F3' },
    ],
    getAttr: (a: typeof ALIENS[0]) => a.color,
    aliens: ALIENS.slice(0, 4),
  },
  {
    label: 'Aliens caindo! Organize rápido!',
    compartments: [
      { key: 'green',  label: '🟢 Verde',   color: '#4CAF50' },
      { key: 'blue',   label: '🔵 Azul',    color: '#2196F3' },
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
  const [selected, setSelected] = useState<typeof ALIENS[0] | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
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

  const remaining = phaseData.aliens.filter(a => !Object.values(placed).flat().includes(a.id));

  useEffect(() => {
    if (remaining.length === 0 && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [remaining.length, onCorrect, onPhaseComplete]);

  const handleAlienTap = (alien: typeof ALIENS[0]) => {
    if (phaseCompletedRef.current) return;
    setSelected(prev => prev?.id === alien.id ? null : alien);
  };

  const handleCompartmentTap = (key: string) => {
    if (!selected || phaseCompletedRef.current) return;
    const correct = phaseData.getAttr(selected) === key;
    if (correct) {
      setPlaced(prev => ({ ...prev, [key]: [...(prev[key] || []), selected.id] }));
      const nc = correctRef.current + 1;
      correctRef.current = nc;
      setCorrectCount(nc);
      setSelected(null);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const isMystery = phase === 5;
  const mysteryHints: Record<string, string> = { circle: '⭕ Círculo', square: '⬛ Quadrado' };

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
      <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, textAlign: 'center', marginBottom: 8, color: 'var(--text)' }}>
        {phaseData.label}
      </h2>
      {selected && <p style={{ textAlign: 'center', color: 'var(--c2)', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Agora toque no compartimento!</p>}
      {isMystery && correctCount >= 2 && (
        <p style={{ textAlign: 'center', color: '#9C27B0', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
          💡 Dica: gaveta = {correctCount >= 4 ? 'forma do alien!' : 'formato dos aliens?'}
        </p>
      )}

      {/* Aliens */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: 14, marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', minHeight: 72 }}>
        {remaining.map(alien => (
          <div
            key={alien.id}
            onPointerUp={() => handleAlienTap(alien)}
            style={{
              width: 62, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', background: selected?.id === alien.id ? '#E3F2FD' : 'var(--bg)',
              borderRadius: 14, border: `2.5px solid ${selected?.id === alien.id ? 'var(--c2)' : 'var(--border)'}`,
              transform: selected?.id === alien.id ? 'scale(1.12) translateZ(0)' : 'scale(1) translateZ(0)',
              transition: 'all 0.15s', touchAction: 'manipulation', minHeight: 62, minWidth: 62,
            }}
          >
            <AppleEmoji emoji={alien.emoji} size={40} />
          </div>
        ))}
        {remaining.length === 0 && <p style={{ color: 'var(--c5)', fontWeight: 700, margin: 0 }}>✅ Todos organizados!</p>}
      </div>

      {/* Compartments */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {phaseData.compartments.map(comp => {
          const hint = isMystery && correctCount >= 2 ? mysteryHints[comp.key] : null;
          return (
            <div
              key={comp.key}
              onPointerUp={() => handleCompartmentTap(comp.key)}
              style={{
                flex: 1, minWidth: 88, padding: 12, borderRadius: 16,
                border: `3px solid ${selected ? comp.color : `${comp.color}66`}`,
                background: selected ? `${comp.color}18` : `${comp.color}0A`,
                minHeight: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: selected ? 'pointer' : 'default', transition: 'all 0.2s', touchAction: 'manipulation',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: comp.color, textAlign: 'center' }}>
                {hint ?? comp.label}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                {(placed[comp.key] || []).map((id, i) => {
                  const alien = ALIENS.find(a => a.id === id);
                  return alien ? <AppleEmoji key={i} emoji={alien.emoji} size={26} /> : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </GameShell>
  );
}
