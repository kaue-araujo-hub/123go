import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const ZOO_DATA = [
  { name: 'Leão', emoji: '🦁', count: 5 },
  { name: 'Elefante', emoji: '🐘', count: 3 },
  { name: 'Girafa', emoji: '🦒', count: 7 },
  { name: 'Zebra', emoji: '🦓', count: 2 },
  { name: 'Macaco', emoji: '🐒', count: 9 },
];

const PHASES = [
  { data: ZOO_DATA.slice(0, 3), question: 'Qual animal tem MAIS?', correctIdx: 2 },
  { data: ZOO_DATA.slice(0, 4), question: 'Qual animal tem MENOS?', correctIdx: 3 },
  { data: ZOO_DATA.slice(0, 3), question: 'Quantos Leão + Elefante no total? (8)', correctIdx: 0, multiAnswer: 8 },
  { data: ZOO_DATA, question: 'Qual animal tem MAIS?', correctIdx: 4 },
  { data: ZOO_DATA, question: 'Qual animal tem MENOS?', correctIdx: 3 },
];

export function ZooTabelas() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setAnswered(false); setFeedback(null); }, [phase]);

  const handleChoice = (idx: number) => {
    if (answered) return;
    const globalIdx = ZOO_DATA.findIndex(z => z.name === phaseData.data[idx].name);
    const correct = globalIdx === phaseData.correctIdx;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Zoo de Tabelas" emoji="🦁" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c5)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Zoo de Tabelas" emoji="🦁" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>{phaseData.question}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Toque na linha correta da tabela!</p>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', background: 'var(--c5)', padding: '10px 16px' }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#fff' }}>Animal</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#fff' }}>Qtd.</span>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#fff' }}>Gráfico</span>
        </div>
        {phaseData.data.map((animal, idx) => (
          <button
            key={animal.name}
            onClick={() => handleChoice(idx)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 2fr',
              padding: '12px 16px',
              borderBottom: idx < phaseData.data.length - 1 ? '1px solid var(--border)' : 'none',
              background: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              alignItems: 'center',
              transition: 'background 0.15s',
              minHeight: 72,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AppleEmoji emoji={animal.emoji} size={22} /> {animal.name}</span>
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--c5)' }}>{animal.count}</span>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Array.from({ length: animal.count }).map((_, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--c5)', opacity: 0.7 }}/>
              ))}
            </div>
          </button>
        ))}
      </div>
    </GameShell>
  );
}
