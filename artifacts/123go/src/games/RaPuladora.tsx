import React, { useState, useEffect, useRef } from "react";
import {
  GameShell,
  useGameEngine,
  FeedbackOverlay,
  PhaseCompleteCard,
} from "../engine/GameEngine";
import { AppleEmoji } from "../utils/AppleEmoji";
import { useIsDesktop } from "../hooks/useIsDesktop";

interface PhaseConfig {
  min: number;
  max: number;
  minDiff: number;
  maxDiff: number;
  question: "mais" | "menos";
  roundsToWin: number;
}

const PHASE_CONFIGS: PhaseConfig[] = [
  {
    min: 10,
    max: 20,
    minDiff: 5,
    maxDiff: 10,
    question: "mais",
    roundsToWin: 3,
  },
  {
    min: 12,
    max: 22,
    minDiff: 2,
    maxDiff: 6,
    question: "mais",
    roundsToWin: 3,
  },
  {
    min: 10,
    max: 18,
    minDiff: 1,
    maxDiff: 3,
    question: "mais",
    roundsToWin: 4,
  },
  {
    min: 10,
    max: 20,
    minDiff: 1,
    maxDiff: 4,
    question: "menos",
    roundsToWin: 4,
  },
  {
    min: 10,
    max: 25,
    minDiff: 1,
    maxDiff: 5,
    question: "mais",
    roundsToWin: 5,
  },
];

interface Round {
  counts: [number, number];
  correct: 0 | 1;
  question: "mais" | "menos";
}

function generateRound(cfg: PhaseConfig): Round {
  let c1 = cfg.min;
  let c2 = cfg.min + cfg.minDiff;
  let attempts = 0;

  do {
    c1 = cfg.min + Math.floor(Math.random() * (cfg.max - cfg.min + 1));
    c2 = cfg.min + Math.floor(Math.random() * (cfg.max - cfg.min + 1));
    attempts++;
    if (attempts > 100) {
      c1 = cfg.min + Math.floor((cfg.max - cfg.min) * 0.4);
      c2 =
        c1 +
        cfg.minDiff +
        Math.floor(Math.random() * (cfg.maxDiff - cfg.minDiff + 1));
      break;
    }
  } while (
    c1 === c2 ||
    Math.abs(c1 - c2) < cfg.minDiff ||
    Math.abs(c1 - c2) > cfg.maxDiff
  );

  const question: "mais" | "menos" = Math.random() > 0.5 ? "mais" : "menos";
  const correct: 0 | 1 =
    question === "mais" ? (c1 > c2 ? 0 : 1) : c1 < c2 ? 0 : 1;

  return { counts: [c1, c2], correct, question };
}

export function RaPuladora() {
  const {
    phase,
    score,
    phaseComplete,
    gameComplete,
    onCorrect,
    onPhaseComplete,
    nextPhase,
    restart,
  } = useGameEngine(5);
  const isDesktop = useIsDesktop();
  const [round, setRound] = useState<Round | null>(null);
  const [roundNum, setRoundNum] = useState(1);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answered, setAnswered] = useState(false);
  const [jumping, setJumping] = useState<number | null>(null);
  const phaseCompletedRef = useRef(false);
  const roundRef = useRef(1);
  const cfg = PHASE_CONFIGS[phase - 1];

  // Ajustes de Escala Desktop (Baseados no sucesso da Lagarta)
  const FROG_SIZE = isDesktop ? 22 : 64;
  const FLOWER_SIZE = isDesktop ? 12 : 28;
  const GRID_COLS = isDesktop ? "repeat(5, auto)" : "repeat(4, auto)";

  useEffect(() => {
    phaseCompletedRef.current = false;
    roundRef.current = 1;
    setRoundNum(1);
    setAnswered(false);
    setFeedback(null);
    setJumping(null);
    setRound(generateRound(cfg));
  }, [phase]);

  const handleJump = (idx: number) => {
    if (answered || phaseCompletedRef.current || !round) return;
    setJumping(idx);
    const correct = idx === round.correct;

    setTimeout(() => {
      setFeedback(correct ? "correct" : "wrong");
      setAnswered(true);

      if (correct) {
        onCorrect();
        const nextRound = roundRef.current + 1;
        setTimeout(() => {
          setFeedback(null);
          if (nextRound > cfg.roundsToWin) {
            phaseCompletedRef.current = true;
            onPhaseComplete();
          } else {
            roundRef.current = nextRound;
            setRoundNum(nextRound);
            setAnswered(false);
            setJumping(null);
            setRound(generateRound(cfg));
          }
        }, 900);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setAnswered(false);
          setJumping(null);
        }, 900);
      }
    }, 420);
  };

  if (phaseComplete) {
    return (
      <GameShell
        title="Rã Puladora"
        emoji="🐸"
        color="var(--c3)"
        currentPhase={phase}
        totalPhases={5}
        score={score}
        onRestart={restart}
      >
        <PhaseCompleteCard
          phase={phase}
          totalPhases={5}
          score={score}
          isGameComplete={gameComplete}
          onNext={nextPhase}
          onRestart={restart}
          color="var(--c3)"
        />
      </GameShell>
    );
  }

  if (!round) return null;

  const questionLabel =
    round.question === "mais"
      ? "🌸 Qual lagoa tem MAIS flores?"
      : "🌸 Qual lagoa tem MENOS flores?";

  return (
    <GameShell
      title="Rã Puladora"
      emoji="🐸"
      color="var(--c3)"
      currentPhase={phase}
      totalPhases={5}
      score={score}
      onRestart={restart}
    >
      <FeedbackOverlay type={feedback} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          gap: isDesktop ? 4 : 8,
        }}
      >
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <p
            style={{
              fontFamily: "Nunito",
              fontWeight: 800,
              fontSize: isDesktop ? 16 : 18,
              color: "var(--text)",
              margin: 0,
            }}
          >
            {questionLabel}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
            padding: isDesktop ? "4px 0" : "8px 0",
          }}
        >
          <div
            style={{
              animation: jumping !== null ? "frogJump 0.42s ease" : undefined,
            }}
          >
            <AppleEmoji
              emoji="🐸"
              size={FROG_SIZE}
              className={jumping === null ? "game-character-idle" : ""}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: isDesktop ? 8 : 12,
            flex: 1,
            minHeight: 0,
            maxHeight: isDesktop ? 200 : undefined,
          }}
        >
          {([0, 1] as const).map((idx) => {
            const count = round.counts[idx];
            const VISIBLE_CAP = isDesktop ? 12 : 15;
            const visible = Math.min(count, VISIBLE_CAP);
            const extra = count - visible;
            return (
              <button
                key={idx}
                onPointerUp={() => handleJump(idx)}
                style={{
                  flex: 1,
                  padding: isDesktop ? "6px" : "8px 6px",
                  borderRadius: 20,
                  border: "3px solid #81C784",
                  background: jumping === idx ? "#C8E6C9" : "#E8F5E9",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  transition: "background 0.2s",
                  touchAction: "manipulation",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: GRID_COLS,
                    gap: isDesktop ? 1 : 2,
                    justifyContent: "center",
                  }}
                >
                  {Array.from({ length: visible }).map((_, i) => (
                    <AppleEmoji key={i} emoji="🌸" size={FLOWER_SIZE} />
                  ))}
                </div>
                {extra > 0 && (
                  <span
                    style={{
                      fontFamily: "Nunito",
                      fontSize: 10,
                      color: "#4CAF50",
                      fontWeight: 700,
                    }}
                  >
                    +{extra}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "Nunito",
                    fontWeight: 900,
                    fontSize: isDesktop ? 22 : 28,
                    color: "#2E7D32",
                    lineHeight: 1,
                  }}
                >
                  {count}
                </span>
                <span
                  style={{ fontFamily: "Nunito", fontSize: 10, color: "#888" }}
                >
                  flores
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            flexShrink: 0,
            padding: isDesktop ? "2px 0 6px 0" : "4px 0",
          }}
        >
          {Array.from({ length: cfg.roundsToWin }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  i < roundNum - 1
                    ? "var(--c3)"
                    : i === roundNum - 1
                      ? "#81C784"
                      : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes frogJump {
          0%   { transform: translateY(0); }
          45%  { transform: translateY(-20px) scale(1.15); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </GameShell>
  );
}
