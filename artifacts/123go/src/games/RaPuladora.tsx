import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { lagoas: [{ count: 20 }, { count: 10 }], question: 'Qual lagoa tem MAIS flores?', correct: 0 },
  { lagoas: [{ count: 15 }, { count: 18 }], question: 'Qual lagoa tem MAIS flores?', correct: 1 },
  { lagoas: [{ count: 12 }, { count: 12 }], question: 'As lagoas têm a MESMA quantidade!', correct: -1 },
  { lagoas: [{ count: 8  }, { count: 14 }], question: 'Qual lagoa tem MENOS flores?', correct: 0 },
  { lagoas: [{ count: 17 }, { count: 11 }], question: 'Qual lagoa tem MAIS flores?', correct: 0 },
];

export function RaPuladora() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [jumping, setJumping] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    setJumping(null);
    const el = containerRef.current;
    if (el) {
      el.style.overscrollBehavior = 'none';
      el.style.touchAction = 'none';
    }
    return () => {
      if (el) {
        el.style.overscrollBehavior = '';
        el.style.touchAction = '';
      }
    };
  }, [phase]);

  const handleJump = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    if (phaseData.correct === -1) {
      phaseCompletedRef.current = true;
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
        phaseCompletedRef.current = true;
        onCorrect();
        setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
      } else {
        setTimeout(() => { setFeedback(null); setAnswered(false); setJumping(null); }, 1000);
      }
    }, 420);
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
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', padding: 28, background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}>
          <div style={{ marginBottom: 14 }}><AppleEmoji emoji="🐸" size={72} /></div>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 19, color: 'var(--text)', marginBottom: 10 }}>
            {phaseData.question}
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
            {phaseData.lagoas.map((l, i) => (
              <div key={i} style={{ background: '#E8F5E9', borderRadius: 14, padding: '12px 20px', border: '2px solid #A5D6A7' }}>
                <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 32, color: '#2E7D32' }}>{l.count}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>flores</div>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text2)', marginBottom: 18, fontSize: 14 }}>
            As duas lagoas têm o mesmo número de flores!
          </p>
          <button
            onPointerUp={() => handleJump(-1)}
            style={{ padding: '14px 28px', borderRadius: 'var(--radius-pill)', background: 'var(--c3)', color: '#fff', fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', minHeight: 52, touchAction: 'manipulation' }}
          >
            São Iguais! ✅
          </button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Rã Puladora" emoji="🐸" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div ref={containerRef} style={{ touchAction: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)', margin: 0 }}>{phaseData.question}</p>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Toque na lagoa certa!</p>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 14, willChange: 'transform' }}>
          <div style={{ display: 'inline-block', animation: jumping !== null ? 'frogJump 0.42s ease' : undefined }}>
            <AppleEmoji emoji="🐸" size={88} className={jumping === null ? 'game-character-idle' : ''} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {phaseData.lagoas.map((lagoa, idx) => {
            const VISIBLE_CAP = 15;
            const visible = Math.min(lagoa.count, VISIBLE_CAP);
            const extra = lagoa.count - visible;
            return (
              <button
                key={idx}
                onPointerUp={() => handleJump(idx)}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 20,
                  border: '3px solid #81C784', background: jumping === idx ? '#C8E6C9' : '#E8F5E9',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6, minHeight: 100,
                  transition: 'background 0.2s', touchAction: 'manipulation',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 2, justifyContent: 'center' }}>
                  {Array.from({ length: visible }).map((_, i) => (
                    <AppleEmoji key={i} emoji="🌸" size={12} />
                  ))}
                </div>
                {extra > 0 && <span style={{ fontFamily: 'Nunito', fontSize: 11, color: '#4CAF50', fontWeight: 700 }}>+{extra}</span>}
                <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 28, color: '#2E7D32', lineHeight: 1 }}>
                  {lagoa.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes frogJump {
          0%   { transform: translateY(0) translateZ(0); }
          45%  { transform: translateY(-22px) scale(1.2) translateZ(0); }
          100% { transform: translateY(0) translateZ(0); }
        }
      `}</style>
    </GameShell>
  );
}
