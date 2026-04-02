import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

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
          <div style={{ fontSize: 64, marginBottom: 16 }}>🐸</div>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 12 }}>
            {phaseData.question}
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>A rã ficou na dúvida... as duas lagoas têm o mesmo número de flores!</p>
          <button onClick={() => { onCorrect(); onPhaseComplete(); }}
            style={{ padding: '12px 28px', borderRadius: 'var(--radius-pill)', background: 'var(--c3)', color: '#fff', fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', minHeight: 48 }}>
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
      <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 64, animation: jumping !== null ? 'frogJump 0.4s ease' : 'none' }}>
        🐸
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {phaseData.lagoas.map((lagoa, idx) => (
          <button
            key={idx}
            onClick={() => handleJump(idx)}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 20,
              border: '3px solid #81C784',
              background: '#E8F5E9',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              minHeight: 120,
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: 100 }}>
              {Array.from({ length: Math.min(lagoa.count, 20) }).map((_, i) => (
                <span key={i} style={{ fontSize: 12 }}>🌸</span>
              ))}
            </div>
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 24, color: '#2E7D32' }}>{lagoa.count}</span>
          </button>
        ))}
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
