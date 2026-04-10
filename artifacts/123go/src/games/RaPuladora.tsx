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
  { min: 10, max: 20, minDiff: 5, maxDiff: 10, question: "mais", roundsToWin: 3 },
  { min: 12, max: 22, minDiff: 2, maxDiff: 6,  question: "mais", roundsToWin: 3 },
  { min: 10, max: 18, minDiff: 1, maxDiff: 3,  question: "mais", roundsToWin: 4 },
  { min: 10, max: 20, minDiff: 1, maxDiff: 4,  question: "menos", roundsToWin: 4 },
  { min: 10, max: 25, minDiff: 1, maxDiff: 5,  question: "mais", roundsToWin: 5 },
];

// Pond elements instead of flowers
const POND_EMOJIS = ["🐸", "🐢", "🦆", "🐟", "🪷"];

interface Round {
  counts: [number, number];
  correct: 0 | 1;
  question: "mais" | "menos";
  emoji: string;
}

function generateRound(cfg: PhaseConfig, phaseIndex: number): Round {
  let c1 = cfg.min;
  let c2 = cfg.min + cfg.minDiff;
  let attempts = 0;

  do {
    c1 = cfg.min + Math.floor(Math.random() * (cfg.max - cfg.min + 1));
    c2 = cfg.min + Math.floor(Math.random() * (cfg.max - cfg.min + 1));
    attempts++;
    if (attempts > 100) {
      c1 = cfg.min + Math.floor((cfg.max - cfg.min) * 0.4);
      c2 = c1 + cfg.minDiff + Math.floor(Math.random() * (cfg.maxDiff - cfg.minDiff + 1));
      break;
    }
  } while (
    c1 === c2 ||
    Math.abs(c1 - c2) < cfg.minDiff ||
    Math.abs(c1 - c2) > cfg.maxDiff
  );

  const question: "mais" | "menos" = Math.random() > 0.5 ? "mais" : "menos";
  const correct: 0 | 1 = question === "mais" ? (c1 > c2 ? 0 : 1) : c1 < c2 ? 0 : 1;
  const emoji = POND_EMOJIS[phaseIndex % POND_EMOJIS.length];

  return { counts: [c1, c2], correct, question, emoji };
}

// Scale emoji size so all items fit inside the pond circle
function getEmojiSize(count: number, isDesktop: boolean): number {
  if (count <= 6)  return isDesktop ? 26 : 30;
  if (count <= 10) return isDesktop ? 20 : 24;
  if (count <= 15) return isDesktop ? 16 : 20;
  return isDesktop ? 14 : 16;
}

function PondCircle({
  count,
  emoji,
  isActive,
  onTap,
  isDesktop,
}: {
  count: number;
  emoji: string;
  isActive: boolean;
  onTap: () => void;
  isDesktop: boolean;
}) {
  const emojiSize = getEmojiSize(count, isDesktop);
  const gap = count > 15 ? 1 : count > 10 ? 2 : 3;
  const cols = count <= 6 ? 3 : count <= 12 ? 4 : 5;

  return (
    <button
      onPointerUp={onTap}
      style={{
        flex: 1,
        aspectRatio: "1 / 1",
        maxWidth: isDesktop ? 260 : 320,
        maxHeight: isDesktop ? 260 : 320,
        borderRadius: "50%",
        border: `4px solid ${isActive ? "#0288D1" : "#4FC3F7"}`,
        background: isActive
          ? "radial-gradient(circle, #B3E5FC 60%, #81D4FA 100%)"
          : "radial-gradient(circle, #E1F5FE 60%, #B3E5FC 100%)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        transition: "all 0.2s",
        touchAction: "manipulation",
        overflow: "hidden",
        boxShadow: isActive
          ? "0 0 0 4px #29B6F6, 0 4px 16px rgba(3,169,244,0.3)"
          : "0 4px 16px rgba(3,169,244,0.15)",
        padding: "12%",
      }}
    >
      {/* Emoji grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, auto)`,
          gap,
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <AppleEmoji key={i} emoji={emoji} size={emojiSize} />
        ))}
      </div>

      {/* Count */}
      <span
        style={{
          fontFamily: "Nunito",
          fontWeight: 900,
          fontSize: isDesktop ? 20 : 24,
          color: "#01579B",
          lineHeight: 1,
          marginTop: 4,
        }}
      >
        {count}
      </span>
    </button>
  );
}

export function RaPuladora() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();
  const [round, setRound] = useState<Round | null>(null);
  const [roundNum, setRoundNum] = useState(1);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answered, setAnswered] = useState(false);
  const [jumping, setJumping] = useState<number | null>(null);
  const phaseCompletedRef = useRef(false);
  const roundRef = useRef(1);
  const cfg = PHASE_CONFIGS[phase - 1];

  const FROG_SIZE = isDesktop ? 36 : 64;

  useEffect(() => {
    phaseCompletedRef.current = false;
    roundRef.current = 1;
    setRoundNum(1);
    setAnswered(false);
    setFeedback(null);
    setJumping(null);
    setRound(generateRound(cfg, phase - 1));
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
            setRound(generateRound(cfg, phase - 1));
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
      <GameShell title="Rã Puladora" emoji="🐸" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c3)" />
      </GameShell>
    );
  }

  if (!round) return null;

  const questionLabel =
    round.question === "mais"
      ? "💧 Qual lagoa tem MAIS elementos?"
      : "💧 Qual lagoa tem MENOS elementos?";

  return (
    <GameShell title="Rã Puladora" emoji="🐸" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", gap: isDesktop ? 6 : 10 }}>

        {/* Question */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <p style={{ fontFamily: "Nunito", fontWeight: 800, fontSize: isDesktop ? 16 : 18, color: "var(--text)", margin: 0 }}>
            {questionLabel}
          </p>
        </div>

        {/* Frog */}
        <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ animation: jumping !== null ? "frogJump 0.42s ease" : undefined }}>
            <AppleEmoji
              emoji="🐸"
              size={FROG_SIZE}
              className={jumping === null ? "game-character-idle" : ""}
            />
          </div>
        </div>

        {/* Two pond circles side by side */}
        <div style={{
          display: "flex",
          gap: isDesktop ? 24 : 16,
          flex: 1,
          minHeight: 0,
          alignItems: "center",
          justifyContent: "center",
          padding: isDesktop ? "0 24px" : "0 8px",
        }}>
          {([0, 1] as const).map((idx) => (
            <PondCircle
              key={idx}
              count={round.counts[idx]}
              emoji={round.emoji}
              isActive={jumping === idx}
              onTap={() => handleJump(idx)}
              isDesktop={isDesktop}
            />
          ))}
        </div>

        {/* Round progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexShrink: 0, padding: isDesktop ? "2px 0 6px" : "4px 0" }}>
          {Array.from({ length: cfg.roundsToWin }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i < roundNum - 1 ? "var(--c3)" : i === roundNum - 1 ? "#81C784" : "var(--border)",
            }} />
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