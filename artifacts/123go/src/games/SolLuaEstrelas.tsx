import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PERIODS = [
  { name: 'Manhã',     emoji: '🌅', bg: '#FFF9C4', textColor: '#E65100',
    activities: [{ emoji: '🪥', label: 'escovar dentes' }, { emoji: '☕', label: 'café da manhã' }] },
  { name: 'Tarde',     emoji: '☀️', bg: '#FFE0B2', textColor: '#BF360C',
    activities: [{ emoji: '📚', label: 'escola' }, { emoji: '🍱', label: 'almoço' }] },
  { name: 'Noite',     emoji: '🌙', bg: '#1A237E', textColor: '#fff',
    activities: [{ emoji: '🛁', label: 'banho' }, { emoji: '📖', label: 'história' }] },
  { name: 'Madrugada', emoji: '⭐', bg: '#0D1B2A', textColor: '#B0BEC5',
    activities: [{ emoji: '😴', label: 'dormir' }, { emoji: '🌙', label: 'sonhar' }] },
];

const PHASES = [
  { type: 'identify', showEmoji: '🌅', correct: 0, question: 'Qual período é esse?' },
  { type: 'identify', showEmoji: '☀️', correct: 1, question: 'Qual período é esse?' },
  { type: 'identify', showEmoji: '🌙', correct: 2, question: 'Qual período é esse?' },
  { type: 'activity', period: 0, actIdx: 0, question: 'O que se faz de MANHÃ?' },
  { type: 'order',    question: 'Ordene os períodos do dia!' },
];

export function SolLuaEstrelas() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
  }, [phase]);

  const handleAnswer = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = (phaseData.correct ?? -1) === idx;
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
      <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c4)" />
      </GameShell>
    );
  }

  if (phaseData.type === 'order') {
    return (
      <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
            {phaseData.question}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          {PERIODS.map((p, i) => (
            <div key={i} style={{
              padding: '14px 12px', background: p.bg, borderRadius: 16,
              border: '2px solid var(--border)', textAlign: 'center', flex: 1, minWidth: 70,
            }}>
              <div><AppleEmoji emoji={p.emoji} size={40} /></div>
              <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, marginTop: 6, color: p.textColor }}>
                {i + 1}° {p.name}
              </p>
            </div>
          ))}
        </div>
        <button
          onPointerUp={() => {
            if (!phaseCompletedRef.current) {
              phaseCompletedRef.current = true;
              onCorrect();
              setTimeout(() => onPhaseComplete(), 400);
            }
          }}
          style={{
            width: '100%', padding: 14, borderRadius: 'var(--radius-pill)',
            background: 'var(--c4)', color: '#fff', fontFamily: 'Nunito',
            fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
            minHeight: 52, touchAction: 'manipulation',
          }}
        >
          ✅ Ordem correta! Próxima fase →
        </button>
      </GameShell>
    );
  }

  if (phaseData.type === 'activity' && phaseData.period !== undefined && phaseData.actIdx !== undefined) {
    const period = PERIODS[phaseData.period];
    const allActivities = PERIODS.flatMap(p => p.activities);
    const correct = period.activities[phaseData.actIdx];
    const decoys = allActivities.filter(a => a.label !== correct.label).slice(0, 2);
    const options = [correct, ...decoys].sort(() => Math.random() - 0.5);
    return (
      <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 8 }}>
            {phaseData.question}
          </h2>
          <AppleEmoji emoji={period.emoji} size={72} />
          <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginTop: 6 }}>{period.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {options.map((act, i) => (
            <button
              key={i}
              onPointerUp={() => handleAnswer(act.label === correct.label ? phaseData.correct ?? 0 : -1)}
              style={{
                padding: '16px 14px', borderRadius: 20, border: '2px solid var(--border)',
                background: '#fff', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, cursor: 'pointer', minWidth: 88, minHeight: 88,
                touchAction: 'manipulation', flex: 1,
              }}
            >
              <AppleEmoji emoji={act.emoji} size={44} />
              <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{act.label}</span>
            </button>
          ))}
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Sol, Lua e Estrelas" emoji="☀️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 10 }}>
          {phaseData.question}
        </h2>
        <AppleEmoji emoji={phaseData.showEmoji ?? '☀️'} size={88} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {PERIODS.map((p, i) => (
          <button
            key={i}
            onPointerUp={() => handleAnswer(i)}
            style={{
              padding: '14px 10px', borderRadius: 18, border: '2.5px solid var(--border)',
              background: i === (phaseData.correct ?? -1) && answered ? '#E8F5E9' : p.bg,
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              minHeight: 64, transition: 'all 0.15s', touchAction: 'manipulation',
            }}
          >
            <AppleEmoji emoji={p.emoji} size={40} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: p.textColor }}>{p.name}</span>
          </button>
        ))}
      </div>
    </GameShell>
  );
}
