import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

type Direction = 'up' | 'down' | 'left' | 'right';

const PHASES = [
  { grid: 3, robotStart: [0, 0] as [number, number], goal: [0, 2] as [number, number], moves: 3 },
  { grid: 4, robotStart: [0, 0] as [number, number], goal: [2, 3] as [number, number], moves: 5 },
  { grid: 4, robotStart: [1, 0] as [number, number], goal: [3, 3] as [number, number], moves: 6 },
  { grid: 4, robotStart: [0, 0] as [number, number], goal: [3, 3] as [number, number], moves: 7 },
  { grid: 5, robotStart: [0, 0] as [number, number], goal: [4, 4] as [number, number], moves: 8 },
];

export function RoboPerdido() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [robotPos, setRobotPos] = useState<[number, number]>([0, 0]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    setRobotPos([...phaseData.robotStart]);
    setFeedback(null);
  }, [phase]);

  useEffect(() => {
    if (robotPos[0] === phaseData.goal[0] && robotPos[1] === phaseData.goal[1]) {
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [robotPos, phaseData.goal, onCorrect, onPhaseComplete, phaseComplete]);

  const move = (dir: Direction) => {
    if (phaseComplete) return;
    setRobotPos(([r, c]) => {
      let nr = r, nc = c;
      if (dir === 'up') nr = Math.max(0, r - 1);
      if (dir === 'down') nr = Math.min(phaseData.grid - 1, r + 1);
      if (dir === 'left') nc = Math.max(0, c - 1);
      if (dir === 'right') nc = Math.min(phaseData.grid - 1, c + 1);
      return [nr, nc];
    });
  };

  const cellSize = Math.min(56, Math.floor(280 / phaseData.grid));

  if (phaseComplete) {
    return (
      <GameShell title="Robô Perdido" emoji="🤖" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Robô Perdido" emoji="🤖" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>
          Guie o robô até a casa!
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Use as setas para mover o robô 🏠</p>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${phaseData.grid}, ${cellSize}px)`,
          gap: 4,
          background: '#fff',
          padding: 12,
          borderRadius: 'var(--radius)',
          border: '1.5px solid var(--border)',
        }}>
          {Array.from({ length: phaseData.grid }).map((_, row) =>
            Array.from({ length: phaseData.grid }).map((_, col) => {
              const isRobot = robotPos[0] === row && robotPos[1] === col;
              const isGoal = phaseData.goal[0] === row && phaseData.goal[1] === col;
              return (
                <div
                  key={`${row}-${col}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 8,
                    background: isRobot ? '#E3F2FD' : isGoal ? '#E8F5E9' : 'var(--bg)',
                    border: `2px solid ${isRobot ? 'var(--c4)' : isGoal ? 'var(--c5)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isRobot ? <AppleEmoji emoji="🤖" size={cellSize * 0.5} /> : isGoal ? <AppleEmoji emoji="🏠" size={cellSize * 0.5} /> : ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Directional pad */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <button onClick={() => move('up')} style={arrowStyle()}>⬆️</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => move('left')} style={arrowStyle()}>⬅️</button>
          <div style={{ width: 60 }}/>
          <button onClick={() => move('right')} style={arrowStyle()}>➡️</button>
        </div>
        <button onClick={() => move('down')} style={arrowStyle()}>⬇️</button>
      </div>
    </GameShell>
  );
}

function arrowStyle(): React.CSSProperties {
  return {
    width: 60,
    height: 60,
    borderRadius: 16,
    background: '#fff',
    border: '2px solid var(--border)',
    fontSize: 28,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    minWidth: 60,
    boxShadow: 'var(--shadow)',
    transition: 'transform 0.1s',
  };
}
