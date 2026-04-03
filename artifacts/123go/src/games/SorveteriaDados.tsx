import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const FLAVORS = [
  { name: 'Chocolate', emoji: '🍫', color: '#795548', count: 8 },
  { name: 'Morango', emoji: '🍓', color: '#E91E8C', count: 5 },
  { name: 'Baunilha', emoji: '🍦', color: '#FF9800', count: 10 },
  { name: 'Menta', emoji: '🌿', color: '#4CAF50', count: 3 },
  { name: 'Limão', emoji: '🍋', color: '#CDDC39', count: 7 },
];

const PHASES = [
  { question: 'Qual sabor tem MAIS bolas?', correctIdx: 2 },
  { question: 'Qual sabor tem MENOS bolas?', correctIdx: 3 },
  { question: 'Quantas bolas tem Chocolate?', correctIdx: 0, countQuestion: true, answer: 8 },
  { question: 'Qual tem MAIS bolas: Morango ou Limão?', correctIdx: 4, compare: [1, 4] },
  { question: 'Qual sabor tem MAIS bolas no total?', correctIdx: 2 },
];

export function SorveteriaDados() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setAnswered(false); setFeedback(null); }, [phase]);

  if (phaseComplete || !phaseData) {
    return (
      <GameShell title="Sorveteria dos Dados" emoji="🍦" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c5)" />
      </GameShell>
    );
  }

  const displayFlavors = phaseData.compare
    ? phaseData.compare.map(i => FLAVORS[i])
    : FLAVORS;

  const handleChoice = (flavorIdx: number) => {
    if (answered) return;
    const globalIdx = phaseData.compare ? phaseData.compare[flavorIdx] : flavorIdx;
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

  return (
    <GameShell title="Sorveteria dos Dados" emoji="🍦" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
          {phaseData.question}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Toque no sabor correto!</p>
      </div>

      {/* Bar chart made of ice cream scoops */}
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--border)',
        padding: '16px 12px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        justifyContent: 'center',
        height: 180,
      }}>
        {displayFlavors.map((f, i) => (
          <button
            key={f.name}
            onClick={() => handleChoice(i)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            {/* Scoops */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2 }}>
              {Array.from({ length: f.count }).map((_, j) => (
                <div key={j} style={{
                  width: 28,
                  height: 16,
                  borderRadius: '50%',
                  background: f.color,
                  opacity: 0.85,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}/>
              ))}
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text3)', marginTop: 4 }}>{f.name.slice(0, 6)}</span>
            <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 14, color: f.color }}>{f.count}</span>
          </button>
        ))}
      </div>
    </GameShell>
  );
}
