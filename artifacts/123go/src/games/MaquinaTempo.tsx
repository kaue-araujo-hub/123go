import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const SEQUENCES = [
  ['Segunda', 'Terça', 'Quarta'],
  ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
  ['Manhã', 'Tarde', 'Noite', 'Segunda', 'Terça'],
  ['Janeiro', 'Fevereiro', 'Março', 'Abril'],
  ['Segunda', 'Terça', 'Manhã', 'Tarde', 'Janeiro', 'Fevereiro'],
];

export function MaquinaTempo() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [sequence, setSequence] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    const seq = SEQUENCES[phase - 1];
    setSequence(seq);
    setShuffled([...seq].sort(() => Math.random() - 0.5));
    setSelected([]);
    setFeedback(null);
  }, [phase]);

  const handleTap = (item: string) => {
    if (selected.includes(item)) return;
    const newSelected = [...selected, item];
    setSelected(newSelected);

    if (newSelected.length === sequence.length) {
      const correct = newSelected.every((s, i) => s === sequence[i]);
      setFeedback(correct ? 'correct' : 'wrong');
      if (correct) {
        onCorrect();
        setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setSelected([]);
        }, 800);
      }
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Máquina do Tempo" emoji="⚙️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c4)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Máquina do Tempo" emoji="⚙️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
          Toque na ordem certa para consertar a máquina!
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          Selecionados: {selected.length}/{sequence.length}
        </p>
      </div>

      {/* Selected sequence */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, minHeight: 52, background: '#fff', borderRadius: 14, padding: 12, border: '1.5px solid var(--border)', flexWrap: 'wrap' }}>
        {selected.map((s, i) => (
          <span key={i} style={{
            background: 'var(--c4)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'Nunito',
            fontWeight: 700,
            fontSize: 13,
          }}>{s}</span>
        ))}
      </div>

      {/* Shuffled options */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {shuffled.map(item => (
          <button
            key={item}
            onClick={() => handleTap(item)}
            disabled={selected.includes(item)}
            style={{
              padding: '12px 20px',
              borderRadius: 14,
              border: '2px solid var(--border)',
              background: selected.includes(item) ? 'var(--bg)' : '#fff',
              fontFamily: 'Nunito',
              fontWeight: 700,
              fontSize: 14,
              color: selected.includes(item) ? 'var(--text3)' : 'var(--text)',
              cursor: selected.includes(item) ? 'default' : 'pointer',
              opacity: selected.includes(item) ? 0.5 : 1,
              minHeight: 48,
              transition: 'all 0.15s',
            }}
          >{item}</button>
        ))}
      </div>
    </GameShell>
  );
}
