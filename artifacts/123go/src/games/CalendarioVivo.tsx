import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const ALL_DAYS = [
  { name: 'Segunda',  emoji: '📘', color: '#5B4FCF' },
  { name: 'Terça',    emoji: '📗', color: '#4CAF50' },
  { name: 'Quarta',   emoji: '📙', color: '#FF9800' },
  { name: 'Quinta',   emoji: '📕', color: '#EF5350' },
  { name: 'Sexta',    emoji: '📓', color: '#E91E8C' },
  { name: 'Sábado',   emoji: '📔', color: '#00BCD4' },
  { name: 'Domingo',  emoji: '📒', color: '#9C27B0' },
];

const PHASES = [
  { label: 'Ordene os 2 primeiros dias!',  days: ALL_DAYS.slice(0, 2) },
  { label: 'Ordene os 5 dias da semana!', days: ALL_DAYS.slice(0, 5) },
  { label: 'Um dia está faltando!',        days: ALL_DAYS.slice(0, 4), missingIdx: 2 },
  { label: 'Ordene a semana completa!',   days: ALL_DAYS },
  { label: 'Ordene todos os 7 dias!',     days: ALL_DAYS },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

export function CalendarioVivo() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [order, setOrder] = useState<typeof ALL_DAYS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setFeedback(null);
    setOrder(shuffle([...phaseData.days]));
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
    if (phaseCompletedRef.current) return;
    const correct = order.every((d, i) => d.name === phaseData.days[i].name);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      phaseCompletedRef.current = true;
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

  const missingDayName = phaseData.missingIdx !== undefined ? ALL_DAYS[phaseData.missingIdx].name : null;

  return (
    <GameShell title="Calendário Vivo" emoji="📅" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>{phaseData.label}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Use as setas ▲▼ para reordenar!</p>
        {missingDayName && (
          <div style={{ marginTop: 8, background: '#FFF9C4', border: '2px dashed #F9A825', borderRadius: 12, padding: '6px 14px', display: 'inline-block', animation: 'vasoPulse 1.2s ease-in-out infinite' }}>
            <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#E65100' }}>
              ❓ Qual dia está faltando?
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
        {order.map((day, idx) => (
          <div key={day.name} style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#fff',
            borderRadius: 14, padding: '9px 12px', border: `2px solid ${day.color}44`,
          }}>
            <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--text3)', width: 20 }}>{idx + 1}.</span>
            <AppleEmoji emoji={day.emoji} size={28} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, flex: 1, color: day.color }}>{day.name}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onPointerUp={() => moveDay(idx, -1)}
                disabled={idx === 0}
                style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid var(--border)', background: '#fff', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 13, opacity: idx === 0 ? 0.25 : 1, touchAction: 'manipulation', minHeight: 34 }}
              >▲</button>
              <button
                onPointerUp={() => moveDay(idx, 1)}
                disabled={idx === order.length - 1}
                style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid var(--border)', background: '#fff', cursor: idx === order.length - 1 ? 'default' : 'pointer', fontSize: 13, opacity: idx === order.length - 1 ? 0.25 : 1, touchAction: 'manipulation', minHeight: 34 }}
              >▼</button>
            </div>
          </div>
        ))}
      </div>

      <button
        onPointerUp={checkOrder}
        style={{
          width: '100%', padding: 14, borderRadius: 'var(--radius-pill)',
          background: 'var(--c4)', color: '#fff', fontFamily: 'Nunito',
          fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer',
          minHeight: 52, touchAction: 'manipulation',
        }}
      >
        ✅ Verificar ordem
      </button>

      <style>{`
        @keyframes vasoPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.98) translateZ(0); }
          50%       { opacity: 1;   transform: scale(1.02) translateZ(0); }
        }
      `}</style>
    </GameShell>
  );
}
