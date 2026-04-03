import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { lagoas: [{ count: 20, flowers: 20 }, { count: 10, flowers: 10 }], question: 'Qual lagoa tem MAIS flores?', correct: 0 },
  { lagoas: [{ count: 15, flowers: 15 }, { count: 18, flowers: 18 }], question: 'Qual lagoa tem MAIS flores?', correct: 1 },
  { lagoas: [{ count: 12, flowers: 12 }, { count: 12, flowers: 12 }], question: 'As lagoas têm a MESMA quantidade!', correct: -1 },
  { lagoas: [{ count: 8, flowers: 8 }, { count: 14, flowers: 14 }], question: 'Qual lagoa tem MENOS flores?', correct: 0 },
  { lagoas: [{ count: 17, flowers: 17 }, { count: 11, flowers: 11 }], question: 'Qual lagoa tem MAIS flores?', correct: 0 },
];

export function RaPuladora() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [jumping, setJumping] = useState<number | null>(null);
  const phaseData = PHASES[phase - 1];

  useEffect(() => { setAnswered(false); setFeedback(null); setJumping(null); }, [phase]);

  const handleJump = (idx: number) => {
    if (answered) return;

    // Special phase 3: equal amounts
    if (phaseData.correct === -1) {
      setFeedback('correct');
      setAnswered(true);
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
      return;
    }

    setJumping(idx);
    const correct = idx === phaseData.correct;
    setTimeout(() => {
      setFeedback(correct ? 'correct' : 'wrong');
      setAnswered(true);
      if (correct) {
        onCorrect();
        setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
      } else {
        setTimeout(() => { setFeedback(null); setAnswered(false); setJumping(null); }, 1000);
      }
    }, 400);
  };

  if (phaseComplete) {
    return (
      <GameShell title="Rã Puladora" emoji="🐸" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  if (phaseData.correct === -1 && !answered) {
    return (
      <GameShell title="Rã Puladora" emoji="🐸" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <div style={{ textAlign: 'center', padding: 32, background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}>
          <div style={{ marginBottom: 16 }}><AppleEmoji emoji="🐸" size={72} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }} /></div>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 12 }}>
            {phaseData.question}
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>A rã ficou na dúvida... as duas lagoas têm o mesmo número de flores!</p>
          <button onClick={() => { onCorrect(); onPhaseComplete(); }}
            style={{ padding: '12px 28px', borderRadius: 'var(--radius-pill)', background: 'var(--c3)', color: '#fff', fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', minHeight: 72 }}>
            Entendi! Próxima fase →
          </button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Rã Puladora" emoji="🐸" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>{phaseData.question}</p>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Deslize a rã para a lagoa certa!</p>
      </div>

      {/* Frog */}
      <div style={{ textAlign: 'center', marginBottom: 16, animation: jumping !== null ? 'frogJump 0.4s ease' : undefined }}>
        <AppleEmoji emoji="🐸" size={96} className={jumping === null ? 'game-character-idle' : ''} />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {phaseData.lagoas.map((lagoa, idx) => {
          const VISIBLE_CAP = 15;
          const visible = Math.min(lagoa.count, VISIBLE_CAP);
          const extra   = lagoa.count - visible;
          return (
            <button
              key={idx}
              onClick={() => handleJump(idx)}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: 20,
                border: '3px solid #81C784',
                background: '#E8F5E9',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                minHeight: 100,
                transition: 'transform 0.15s',
              }}
            >
              {/* Compact grid: 4 cols × auto rows */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, auto)',
                gap: 3,
                justifyContent: 'center',
              }}>
                {Array.from({ length: visible }).map((_, i) => (
                  <AppleEmoji key={i} emoji="🌸" size={13} />
                ))}
              </div>
              {extra > 0 && (
                <span style={{ fontFamily: 'Nunito', fontSize: 11, color: '#4CAF50', fontWeight: 700 }}>+{extra}</span>
              )}
              <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 26, color: '#2E7D32', lineHeight: 1 }}>
                {lagoa.count}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes frogJump {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px) scale(1.2); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </GameShell>
  );
}
