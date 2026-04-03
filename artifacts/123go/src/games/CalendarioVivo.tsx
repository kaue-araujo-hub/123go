import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const DAYS = [
  { name: 'Segunda', emoji: '📚', color: '#5B4FCF' },
  { name: 'Terça', emoji: '✏️', color: '#E91E8C' },
  { name: 'Quarta', emoji: '🎨', color: '#FF6B35' },
  { name: 'Quinta', emoji: '⚽', color: '#4CAF50' },
  { name: 'Sexta', emoji: '🎵', color: '#FF9800' },
  { name: 'Sábado', emoji: '🎉', color: '#00B4D8' },
  { name: 'Domingo', emoji: '😴', color: '#9C27B0' },
];

const PHASES = [
  { days: [DAYS[0], DAYS[1]], label: 'Ordene: Segunda e Terça!' },
  { days: DAYS, label: 'Ordene todos os dias da semana!' },
  { days: DAYS.slice(0, 5), missingIdx: 2, label: 'Qual dia está faltando?' },
  { days: DAYS.slice(0, 4), label: 'Organize de Segunda a Quinta!' },
  { days: DAYS, label: 'Semana completa — ordene tudo!' },
];

export function CalendarioVivo() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [order, setOrder] = useState<typeof DAYS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    // Shuffle the days
    setOrder([...phaseData.days].sort(() => Math.random() - 0.5));
    setFeedback(null);
  }, [phase]);

  const moveDay = (idx: number, dir: -1 | 1) => {
    setOrder(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const checkOrder = () => {
    const correct = order.every((d, i) => d.name === phaseData.days[i].name);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => setFeedback(null), 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Calendário Vivo" emoji="📅" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c4)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Calendário Vivo" emoji="📅" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>{phaseData.label}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Use as setas para reordenar!</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {order.map((day, idx) => (
          <div key={day.name} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#fff',
            borderRadius: 14,
            padding: '10px 14px',
            border: `2px solid ${day.color}30`,
          }}>
            <AppleEmoji emoji={day.emoji} size={32} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, flex: 1, color: day.color }}>{day.name}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => moveDay(idx, -1)} disabled={idx === 0}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: 14, opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
              <button onClick={() => moveDay(idx, 1)} disabled={idx === order.length - 1}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: 14, opacity: idx === order.length - 1 ? 0.3 : 1 }}>▼</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={checkOrder}
        style={{ width: '100%', padding: 14, borderRadius: 'var(--radius-pill)', background: 'var(--c4)', color: '#fff', fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', minHeight: 52 }}>
        ✅ Verificar ordem
      </button>
    </GameShell>
  );
}
