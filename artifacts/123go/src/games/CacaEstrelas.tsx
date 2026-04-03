import React, { useState, useEffect, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { flashTime: 2000, stars: 3, options: [2, 3, 5] },
  { flashTime: 1500, stars: 7, options: [5, 7, 9] },
  { flashTime: 1500, stars: 4, options: [3, 4, 6] },
  { flashTime: 1000, stars: 9, options: [8, 9, 11] },
  { flashTime: 800, stars: 5, options: [4, 5, 8] },
];

function StarField({ count, visible }: { count: number; visible: boolean }) {
  const positions = Array.from({ length: count }, (_, i) => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
  }));

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 160,
      background: '#0D1B2A',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {visible && positions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            fontSize: 24,
            animation: 'starTwinkle 0.5s ease-in-out infinite alternate',
            animationDelay: `${i * 0.1}s`,
          }}
        ><AppleEmoji emoji="⭐" size={28} /></div>
      ))}
      {!visible && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          Quantas estrelas você viu?
        </div>
      )}
      <style>{`
        @keyframes starTwinkle {
          from { opacity: 0.6; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export function CacaEstrelas() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [showStars, setShowStars] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const phaseData = PHASES[phase - 1];

  const startFlash = useCallback(() => {
    setShowStars(true);
    setAnswered(false);
    setTimeout(() => setShowStars(false), phaseData.flashTime);
  }, [phaseData.flashTime]);

  useEffect(() => {
    setFlashKey(k => k + 1);
    startFlash();
  }, [phase]);

  const handleAnswer = (answer: number) => {
    if (answered) return;
    const correct = answer === phaseData.stars;
    setAnswered(true);
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
      <GameShell title="Caça Estrelas" emoji="⭐" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Caça Estrelas" emoji="⭐" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>
          Memorize e conte as estrelas!
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          O céu pisca por {phaseData.flashTime / 1000}s — depois escolha o número certo
        </p>
      </div>

      <StarField key={flashKey} count={phaseData.stars} visible={showStars} />

      {!showStars && !answered && (
        <button
          onClick={startFlash}
          style={{
            display: 'block',
            margin: '0 auto 20px',
            padding: '10px 24px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--c3)',
            color: '#fff',
            fontFamily: 'Nunito',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            border: 'none',
            minHeight: 72,
          }}
        >
          Mostrar de novo ↺
        </button>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
        {phaseData.options.map(opt => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              border: '2px solid var(--border)',
              background: '#fff',
              fontFamily: 'Nunito',
              fontWeight: 900,
              fontSize: 32,
              color: 'var(--text)',
              cursor: 'pointer',
              minHeight: 80,
              minWidth: 80,
              transition: 'all 0.15s ease',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
