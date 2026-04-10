import React, { useState, useEffect, useRef } from "react";
import {
  GameShell,
  useGameEngine,
  FeedbackOverlay,
  PhaseCompleteCard,
} from "../engine/GameEngine";
import { useIsDesktop } from "../hooks/useIsDesktop";

type Direction = "up" | "down" | "left" | "right";

const ALL_DIRS: Direction[] = ["up", "down", "left", "right"];
const ARROW_ICON: Record<Direction, string> = {
  up:    "⬆️",
  down:  "⬇️",
  left:  "⬅️",
  right: "➡️",
};
const ARROW_LABEL: Record<Direction, string> = {
  up:    "Para cima",
  down:  "Para baixo",
  left:  "À esquerda",
  right: "À direita",
};

function shuffle(arr: Direction[]): Direction[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PHASES = [
  { grid: 3, robotStart: [0, 0] as [number, number], goal: [0, 2] as [number, number], dualRobot: false },
  { grid: 4, robotStart: [0, 0] as [number, number], goal: [2, 3] as [number, number], dualRobot: false },
  { grid: 4, robotStart: [1, 0] as [number, number], goal: [3, 3] as [number, number], dualRobot: false },
  {
    grid: 4, robotStart: [0, 0] as [number, number], goal: [3, 3] as [number, number],
    dualRobot: true, robot2Start: [3, 0] as [number, number], goal2: [0, 3] as [number, number],
  },
  { grid: 5, robotStart: [0, 0] as [number, number], goal: [4, 4] as [number, number], dualRobot: false },
];

export function RoboPerdido() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [robotPos,    setRobotPos]    = useState<[number, number]>([0, 0]);
  const [robot2Pos,   setRobot2Pos]   = useState<[number, number]>([0, 0]);
  const [activeRobot, setActiveRobot] = useState(0);
  const [robot1Done,  setRobot1Done]  = useState(false);
  const [robot2Done,  setRobot2Done]  = useState(false);
  const [shaking,     setShaking]     = useState(false);
  const [feedback,    setFeedback]    = useState<"correct" | "wrong" | null>(null);
  const [moveCount,   setMoveCount]   = useState(0);
  const [arrowOrder,  setArrowOrder]  = useState<Direction[]>(() => shuffle(ALL_DIRS));

  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  // Cell size: fill a generous area, capped per grid size
  const maxGridPx = isDesktop ? 420 : 320;
  const cellSize  = Math.floor((maxGridPx - 16) / phaseData.grid);

  useEffect(() => {
    phaseCompletedRef.current = false;
    setRobotPos([...phaseData.robotStart]);
    setRobot2Pos(phaseData.robot2Start ? [...phaseData.robot2Start] : [0, 0]);
    setActiveRobot(0);
    setRobot1Done(false);
    setRobot2Done(false);
    setShaking(false);
    setFeedback(null);
    setMoveCount(0);
    setArrowOrder(shuffle(ALL_DIRS));
  }, [phase]);

  useEffect(() => {
    if (phaseData.dualRobot && robot1Done && robot2Done && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      setFeedback("correct");
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  }, [robot1Done, robot2Done, phaseData.dualRobot, onCorrect, onPhaseComplete]);

  const checkGoal = (pos: [number, number], goal: [number, number], robotIdx: number) => {
    if (pos[0] === goal[0] && pos[1] === goal[1]) {
      if (!phaseData.dualRobot) {
        if (!phaseCompletedRef.current) {
          phaseCompletedRef.current = true;
          setFeedback("correct");
          onCorrect();
          setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
        }
      } else {
        if (robotIdx === 0) setRobot1Done(true);
        if (robotIdx === 1) setRobot2Done(true);
      }
    }
  };

  const move = (dir: Direction) => {
    if (phaseCompletedRef.current) return;
    const currentPos = activeRobot === 0 ? robotPos : robot2Pos;
    const setPos     = activeRobot === 0 ? setRobotPos : setRobot2Pos;
    const goal       = activeRobot === 0 ? phaseData.goal : phaseData.goal2!;

    let [nr, nc] = currentPos;
    if (dir === "up")    nr = Math.max(0, nr - 1);
    if (dir === "down")  nr = Math.min(phaseData.grid - 1, nr + 1);
    if (dir === "left")  nc = Math.max(0, nc - 1);
    if (dir === "right") nc = Math.min(phaseData.grid - 1, nc + 1);

    if (nr === currentPos[0] && nc === currentPos[1]) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    } else {
      setPos([nr, nc]);
      setMoveCount(c => c + 1);
      checkGoal([nr, nc], goal, activeRobot);
    }
    setArrowOrder(shuffle(ALL_DIRS));
  };

  if (phaseComplete) {
    return (
      <GameShell title="Robô Perdido" emoji="🤖" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  // Arrow button sizing
  const btnSize   = isDesktop ? 90 : 78;
  const arrowFont = isDesktop ? 36 : 30;
  const labelFont = isDesktop ? 11 : 10;

  return (
    <GameShell title="Robô Perdido" emoji="🤖" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h2 style={{ fontFamily: "Nunito", fontWeight: 800, fontSize: 17, color: "var(--text)", marginBottom: 4 }}>
          Guie o robô até a nave!
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 13, margin: 0 }}>
          Use as setas para mover 🚀
        </p>
        {phaseData.dualRobot && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
            <button
              onPointerUp={() => setActiveRobot(0)}
              style={{
                padding: "6px 14px", borderRadius: "var(--radius-pill)", border: "none",
                background: activeRobot === 0 ? "var(--c1)" : "var(--border)",
                color: activeRobot === 0 ? "#fff" : "var(--text)",
                fontFamily: "Nunito", fontWeight: 700, fontSize: 12,
                cursor: "pointer", touchAction: "manipulation",
              }}
            >
              🤖 Robô 1 {robot1Done ? "✅" : ""}
            </button>
            <button
              onPointerUp={() => setActiveRobot(1)}
              style={{
                padding: "6px 14px", borderRadius: "var(--radius-pill)", border: "none",
                background: activeRobot === 1 ? "#FF9800" : "var(--border)",
                color: activeRobot === 1 ? "#fff" : "var(--text)",
                fontFamily: "Nunito", fontWeight: 700, fontSize: 12,
                cursor: "pointer", touchAction: "manipulation",
              }}
            >
              🦾 Robô 2 {robot2Done ? "✅" : ""}
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${phaseData.grid}, ${cellSize}px)`,
          gap: 4,
          background: "#fff",
          padding: 10,
          borderRadius: "var(--radius)",
          border: "1.5px solid var(--border)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        }}>
          {Array.from({ length: phaseData.grid }).map((_, row) =>
            Array.from({ length: phaseData.grid }).map((_, col) => {
              const isRobot1  = robotPos[0] === row && robotPos[1] === col;
              const isRobot2  = phaseData.dualRobot && robot2Pos[0] === row && robot2Pos[1] === col;
              const isGoal1   = phaseData.goal[0] === row && phaseData.goal[1] === col;
              const isGoal2   = phaseData.dualRobot && phaseData.goal2?.[0] === row && phaseData.goal2?.[1] === col;
              const isActive  = (isRobot1 && activeRobot === 0) || (isRobot2 && activeRobot === 1);
              const isRobot   = isRobot1 || isRobot2;
              const isGoal    = isGoal1 || isGoal2;

              let emoji = "";
              if (isRobot1 && isRobot2) emoji = "🤖";
              else if (isRobot1) emoji = "🤖";
              else if (isRobot2) emoji = "🦾";
              else if (isGoal1)  emoji = "🚀";
              else if (isGoal2)  emoji = "🚀";

              return (
                <div
                  key={isRobot ? `robot-${row}-${col}-${moveCount}` : `${row}-${col}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 8,
                    background: isActive ? "#E3F2FD" : isGoal ? "#FFF8E1" : "var(--bg)",
                    border: "1.5px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: Math.max(18, cellSize * 0.52),
                    animation:
                      isRobot && isActive && !shaking ? "robotJump 0.35s ease"
                      : isRobot && shaking            ? "robotShake 0.4s ease"
                      : isGoal                        ? "rocketBlink 1.1s ease-in-out infinite"
                      : "none",
                  }}
                >
                  {emoji}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Arrow buttons */}
      <div style={{ display: "flex", gap: isDesktop ? 14 : 10, justifyContent: "center" }}>
        {arrowOrder.map(dir => (
          <button
            key={dir}
            onPointerUp={() => move(dir)}
            style={{
              width: btnSize,
              height: btnSize,
              borderRadius: 18,
              border: "2.5px solid var(--c1)",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              touchAction: "manipulation",
              boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
              transition: "transform 0.1s, box-shadow 0.1s",
              padding: 0,
            }}
          >
            <span style={{ fontSize: arrowFont, lineHeight: 1 }}>{ARROW_ICON[dir]}</span>
            <span style={{
              fontFamily: "Nunito",
              fontWeight: 700,
              fontSize: labelFont,
              color: "var(--c1)",
              lineHeight: 1,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}>
              {ARROW_LABEL[dir]}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes robotJump {
          0%   { transform: translateY(0) translateZ(0); }
          30%  { transform: translateY(-8px) translateZ(0); }
          60%  { transform: translateY(-4px) translateZ(0); }
          100% { transform: translateY(0) translateZ(0); }
        }
        @keyframes robotShake {
          0%, 100% { transform: translateX(0) translateZ(0); }
          25%       { transform: translateX(-6px) translateZ(0); }
          75%       { transform: translateX(6px) translateZ(0); }
        }
        @keyframes rocketBlink {
          0%, 100% { opacity: 1;   transform: scale(1)    translateZ(0); }
          50%       { opacity: 0.4; transform: scale(0.82) translateZ(0); }
        }
      `}</style>
    </GameShell>
  );
}