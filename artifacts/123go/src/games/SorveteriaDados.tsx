import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const FLAVORS = [
  { name: 'Chocolate', emoji: '🍫', color: '#795548', count: 8 },
  { name: 'Morango',   emoji: '🍓', color: '#E91E63', count: 5 },
  { name: 'Baunilha',  emoji: '🍦', color: '#FFF8E1', borderColor: '#FFCA28', count: 12 },
  { name: 'Menta',     emoji: '🌿', color: '#4CAF50', count: 3 },
];

function genCountOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  const d1 = correct > 1 ? correct - 1 : correct + 2;
  opts.add(d1);
  while (opts.size < 3) opts.add(Math.max(1, correct + Math.floor(Math.random() * 5) - 2));
  return [...opts].sort(() => Math.random() - 0.5);
}

const PHASES = [
  {
    type: 'bar',
    label: 'Qual sabor tem MAIS bolas de sorvete?',
    question: 'MAIS',
    correct: 2,
  },
  {
    type: 'bar',
    label: 'Qual sabor tem MENOS bolas de sorvete?',
    question: 'MENOS',
    correct: 3,
  },
  {
    type: 'count',
    label: 'Quantas bolas de CHOCOLATE tem?',
    flavorIdx: 0,
    correct: 8,
  },
  {
    type: 'bar',
    label: 'Quantos sabores têm MAIS de 4 bolas?',
    question: 'MAIS que 4',
    correct: 0,
    multiAnswer: true,
  },
  {
    type: 'bar',
    label: 'Que sabor ficou em 2° lugar?',
    question: '2° lugar',
    correct: 0,
  },
];

export function SorveteriaDados() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [countOptions, setCountOptions] = useState<number[]>([]);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    if (phaseData.type === 'count') {
      setCountOptions(genCountOptions(phaseData.correct ?? 0));
    }
  }, [phase]);

  const handleFlavorAnswer = (flavorIdx: number) => {
    if (answered || phaseCompletedRef.current) return;
    let correct = false;
    if (phaseData.question === 'MAIS') {
      const maxCount = Math.max(...FLAVORS.map(f => f.count));
      correct = FLAVORS[flavorIdx].count === maxCount;
    } else if (phaseData.question === 'MENOS') {
      const minCount = Math.min(...FLAVORS.map(f => f.count));
      correct = FLAVORS[flavorIdx].count === minCount;
    } else if (phaseData.question === '2° lugar') {
      const sorted = [...FLAVORS].sort((a, b) => b.count - a.count);
      correct = FLAVORS[flavorIdx].name === sorted[1].name;
    }
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true;
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  const handleCountAnswer = (val: number) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = val === (phaseData.correct ?? -1);
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true;
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Sorveteria dos Dados" emoji="🍦" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  const maxCount = Math.max(...FLAVORS.map(f => f.count));

  return (
    <GameShell title="Sorveteria dos Dados" emoji="🍦" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
            {phaseData.label}
          </h2>
        </div>

        {/* Bar chart */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: '14px 10px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, justifyContent: 'center' }}>
            {FLAVORS.map((f, i) => {
              const h = Math.round((f.count / maxCount) * 120);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 14, color: 'var(--text)' }}>{f.count}</span>
                  <button
                    onPointerUp={() => phaseData.type === 'bar' ? handleFlavorAnswer(i) : undefined}
                    style={{
                      width: '100%', height: h, borderRadius: '8px 8px 0 0',
                      background: f.color, border: `2px solid ${(f as any).borderColor ?? '#0002'}`,
                      cursor: phaseData.type === 'bar' ? 'pointer' : 'default',
                      transition: 'all 0.2s', minHeight: 10,
                      touchAction: 'manipulation',
                    }}
                  />
                  <span style={{ fontSize: 18 }}><AppleEmoji emoji={f.emoji} size={22} /></span>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10, color: f.color, textAlign: 'center' }}>{f.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Count question: 3 button options */}
        {phaseData.type === 'count' && (
          <div>
            <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 13, marginBottom: 12 }}>
              Olhe o gráfico — escolha o número certo:
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              {countOptions.map(val => (
                <button
                  key={val}
                  onPointerUp={() => handleCountAnswer(val)}
                  style={{
                    width: 88, height: 88, borderRadius: 20,
                    border: '2.5px solid var(--border)', background: '#fff',
                    fontFamily: 'Nunito', fontWeight: 900, fontSize: 42, color: 'var(--text)',
                    cursor: 'pointer', minHeight: 88, minWidth: 88,
                    transition: 'all 0.15s', touchAction: 'manipulation',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}

        {phaseData.type === 'bar' && !answered && (
          <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 6 }}>
            Toque na barra do sabor correto!
          </p>
        )}
      </div>
    </GameShell>
  );
}
