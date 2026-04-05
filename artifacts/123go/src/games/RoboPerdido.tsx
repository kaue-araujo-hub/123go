import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

type Direction = 'up' | 'down' | 'left' | 'right';

const PHASES = [
  { grid: 3, robotStart: [0, 0] as [number, number], goal: [0, 2] as [number, number], dualRobot: false },
  { grid: 4, robotStart: [0, 0] as [number, number], goal: [2, 3] as [number, number], dualRobot: false },
  { grid: 4, robotStart: [1, 0] as [number, number], goal: [3, 3] as [number, number], dualRobot: false },
  { grid: 4, robotStart: [0, 0] as [number, number], goal: [3, 3] as [number, number], dualRobot: true,
    robot2Start: [3, 0] as [number, number], goal2: [0, 3] as [number, number] },
  { grid: 5, robotStart: [0, 0] as [number, number], goal: [4, 4] as [number, number], dualRobot: false },
];

export function RoboPerdido() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [robotPos, setRobotPos] = useState<[number, number]>([0, 0]);
  const [robot2Pos, setRobot2Pos] = useState<[number, number]>([0, 0]);
  const [activeRobot, setActiveRobot] = useState(0);
  const [robot1Done, setRobot1Done] = useState(false);
  const [robot2Done, setRobot2Done] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setRobotPos([...phaseData.robotStart]);
    setRobot2Pos(phaseData.robot2Start ? [...phaseData.robot2Start] : [0, 0]);
    setActiveRobot(0);
    setRobot1Done(false);
    setRobot2Done(false);
    setShaking(false);
    setFeedback(null);
  }, [phase]);

  const checkGoal = (pos: [number, number], goal: [number, number], robotIdx: number) => {
    if (pos[0] === goal[0] && pos[1] === goal[1]) {
      if (!phaseData.dualRobot) {
        if (!phaseCompletedRef.current) {
          phaseCompletedRef.current = true;
          setFeedback('correct');
          onCorrect();
          setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
        }
      } else {
        if (robotIdx === 0) setRobot1Done(true);
        if (robotIdx === 1) setRobot2Done(true);
      }
    }
  };

  useEffect(() => {
    if (phaseData.dualRobot && robot1Done && robot2Done && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback('correct');
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [robot1Done, robot2Done, phaseData.dualRobot, onCorrect, onPhaseComplete]);

  const move = (dir: Direction) => {
    if (phaseCompletedRef.current) return;
    const setPos = activeRobot === 0 ? setRobotPos : setRobot2Pos;
    const currentPos = activeRobot === 0 ? robotPos : robot2Pos;
    const goal = activeRobot === 0 ? phaseData.goal : phaseData.goal2!;

    let [nr, nc] = currentPos;
    if (dir === 'up')    nr = Math.max(0, nr - 1);
    if (dir === 'down')  nr = Math.min(phaseData.grid - 1, nr + 1);
    if (dir === 'left')  nc = Math.max(0, nc - 1);
    if (dir === 'right') nc = Math.min(phaseData.grid - 1, nc + 1);

    if (nr === currentPos[0] && nc === currentPos[1]) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    const newPos: [number, number] = [nr, nc];
    setPos(newPos);
    checkGoal(newPos, goal, activeRobot);
  };

  const cellSize = Math.min(52, Math.floor(268 / phaseData.grid));

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
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>
          Guie o robô até a casa!
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Use as setas para mover 🏠</p>
        {phaseData.dualRobot && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6 }}>
            <button
              onPointerUp={() => setActiveRobot(0)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: 'none',
                background: activeRobot === 0 ? 'var(--c1)' : 'var(--border)',
                color: activeRobot === 0 ? '#fff' : 'var(--text)',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              🤖 Robô 1 {robot1Done ? '✅' : ''}
            </button>
            <button
              onPointerUp={() => setActiveRobot(1)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: 'none',
                background: activeRobot === 1 ? '#FF9800' : 'var(--border)',
                color: activeRobot === 1 ? '#fff' : 'var(--text)',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              🦾 Robô 2 {robot2Done ? '✅' : ''}
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${phaseData.grid}, ${cellSize}px)`,
          gap: 3, background: '#fff', padding: 10, borderRadius: 'var(--radius)',
          border: '1.5px solid var(--border)',
        }}>
          {Array.from({ length: phaseData.grid }).map((_, row) =>
            Array.from({ length: phaseData.grid }).map((_, col) => {
              const isRobot1 = robotPos[0] === row && robotPos[1] === col;
              const isRobot2 = phaseData.dualRobot && robot2Pos[0] === row && robot2Pos[1] === col;
              const isGoal1 = phaseData.goal[0] === row && phaseData.goal[1] === col;
              const isGoal2 = phaseData.dualRobot && phaseData.goal2?.[0] === row && phaseData.goal2?.[1] === col;
              return (
                <div key={`${row}-${col}`} style={{
                  width: cellSize, height: cellSize, borderRadius: 6,
                  background: (isRobot1 && activeRobot === 0) || (isRobot2 && activeRobot === 1)
                    ? '#E3F2FD' : isGoal1 || isGoal2 ? '#E8F5E9' : 'var(--bg)',
                  border: `1px solid var(--border)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: Math.max(12, cellSize * 0.45),
                  animation: shaking && ((isRobot1 && activeRobot === 0) || (isRobot2 && activeRobot === 1))
                    ? 'robotShake 0.4s ease' : undefined,
                }}>
                  {isRobot1 && isRobot2 ? '🤖' : isRobot1 ? '🤖' : isRobot2 ? '🦾' : isGoal1 ? '🏠' : isGoal2 ? '🏡' : ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Direction buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 200, margin: '0 auto' }}>
        {[null, 'up', null, 'left', null, 'right', null, 'down', null].map((dir, i) => (
          dir ? (
            <button
              key={i}
              onPointerUp={() => move(dir as Direction)}
              style={{
                height: 56, borderRadius: 14, border: '2px solid var(--c1)',
                background: '#fff', fontSize: 22, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                touchAction: 'manipulation', minHeight: 56,
              }}
            >
              {dir === 'up' ? '⬆️' : dir === 'down' ? '⬇️' : dir === 'left' ? '⬅️' : '➡️'}
            </button>
          ) : <div key={i} />
        ))}
      </div>

      <style>{`
        @keyframes robotShake {
          0%, 100% { transform: translateX(0) translateZ(0); }
          25%       { transform: translateX(-6px) translateZ(0); }
          75%       { transform: translateX(6px) translateZ(0); }
        }
      `}</style>
    </GameShell>
  );
}
