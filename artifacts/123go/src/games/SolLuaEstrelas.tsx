import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const PERIODS = [
  { name: 'Manhã', emoji: '🌅', bg: '#FFF9C4', activities: ['🏫', '☕', '🍳'] },
  { name: 'Tarde', emoji: '☀️', bg: '#FFE0B2', activities: ['🎒', '📚', '⚽'] },
  { name: 'Noite', emoji: '🌙', bg: '#1A237E', activities: ['🍽️', '📺', '😴'] },
];

const PHASES = [
  { question: 'Qual período é esse?', showEmoji: '🌅', correct: 0 },
  { question: 'Qual período é esse?', showEmoji: '☀️', correct: 1 },
  { question: 'Qual período é esse?', showEmoji: '🌙', correct: 2 },
  { question: 'O que se faz de MANHÃ?', activityQuestion: true, period: 0, activityIdx: 0 },
  { question: 'Organize os períodos do dia!', ordering: true },
];

export function SolLuaEstrelas() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setAnswered(false); setFeedback(null); }, [phase]);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    const correct = (phaseData.correct ?? -1) === idx;
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
      <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c4)" />
      </GameShell>
    );
  }

  if (phaseData.ordering) {
    return (
      <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
            Os períodos do dia na ordem certa!
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PERIODS.map((p, i) => (
            <div key={i} style={{ padding: 20, background: p.bg, borderRadius: 16, border: '2px solid var(--border)', textAlign: 'center', flex: 1, minWidth: 80 }}>
              <div style={{ fontSize: 40 }}>{p.emoji}</div>
              <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, marginTop: 6, color: i === 2 ? '#fff' : 'var(--text)' }}>{i + 1}° {p.name}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => { onCorrect(); onPhaseComplete(); }}
          style={{ width: '100%', marginTop: 20, padding: 14, borderRadius: 'var(--radius-pill)', background: 'var(--c4)', color: '#fff', fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', minHeight: 52 }}
        >
          ✅ Correto! Próxima fase
        </button>
      </GameShell>
    );
  }

  return (
    <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
          {phaseData.question}
        </h2>
        <div style={{ fontSize: 80, marginTop: 12 }}>{phaseData.showEmoji}</div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {PERIODS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            style={{
              flex: 1,
              minWidth: 90,
              padding: 16,
              borderRadius: 16,
              border: '2px solid var(--border)',
              background: p.bg,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              minHeight: 90,
            }}
          >
            <span style={{ fontSize: 32 }}>{p.emoji}</span>
            <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: i === 2 ? '#fff' : 'var(--text)' }}>{p.name}</span>
          </button>
        ))}
      </div>
    </GameShell>
  );
}
