import React, { useState, useEffect, useRef, useMemo } from "react";
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
  { min: 5,  max: 10, minDiff: 2, maxDiff: 4, question: "mais", roundsToWin: 3 }, // Fase 1: Girassol
  { min: 8,  max: 14, minDiff: 2, maxDiff: 5, question: "mais", roundsToWin: 3 }, // Fase 2: Abelha
  { min: 10, max: 16, minDiff: 1, maxDiff: 4, question: "mais", roundsToWin: 4 }, // Fase 3: Cachorro
  { min: 12, max: 20, minDiff: 1, maxDiff: 5, question: "menos", roundsToWin: 4 }, // Fase 4: Borboleta
  { min: 10, max: 22, minDiff: 1, maxDiff: 6, question: "mais", roundsToWin: 5 }, // Fase 5: Sakura
];

const PHASE_EMOJIS = ["🌻", "🐝", "🐶", "🦋", "🌸"];

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
      c1 = cfg.min;
      c2 = cfg.min + cfg.minDiff;
      break;
    }
  } while (
    c1 === c2 ||
    Math.abs(c1 - c2) < cfg.minDiff ||
    Math.abs(c1 - c2) > cfg.maxDiff
  );

  const question: "mais" | "menos" = Math.random() > 0.5 ? "mais" : "menos";
  const correct: 0 | 1 = question === "mais" ? (c1 > c2 ? 0 : 1) : c1 < c2 ? 0 : 1;
  const emoji = PHASE_EMOJIS[phaseIndex];

  return { counts: [c1, c2], correct, question, emoji };
}

function RandomPondContent({ count, emoji, isDesktop }: { count: number, emoji: string, isDesktop: boolean }) {
  const positions = useMemo(() => {
    const pts: { top: number; left: number; rotation: number }[] = [];
    // Aumentamos a grade para garantir espaço. 
    // Para 22 itens, uma grade 6x6 (36 células) é suficiente para evitar sobreposição.
    const gridSize = 6; 
    const cells: number[] = [];
    for (let i = 0; i < gridSize * gridSize; i++) cells.push(i);
    
    // Embaralhar células disponíveis
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    // Pegar as N primeiras células para garantir que não ocupem o mesmo espaço
    for (let i = 0; i < Math.min(count, cells.length); i++) {
      const row = Math.floor(cells[i] / gridSize);
      const col = cells[i] % gridSize;
      
      // Adiciona um "jitter" (tremidinha) dentro da célula para não parecer uma grade perfeita
      const jitter = 10; 
      pts.push({
        top: (row * (80 / gridSize)) + 15 + (Math.random() * jitter - jitter/2),
        left: (col * (80 / gridSize)) + 15 + (Math.random() * jitter - jitter/2),
        rotation: Math.random() * 40 - 20,
      });
    }
    return pts;
  }, [count, emoji]);

  // Ajuste de tamanho dinâmico para não poluir visualmente quando há muitos itens
  const size = useMemo(() => {
    if (count > 18) return isDesktop ? 22 : 26;
    if (count > 12) return isDesktop ? 26 : 30;
    return isDesktop ? 30 : 36;
  }, [count, isDesktop]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {positions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${pos.top}%`,
            left: `${pos.left}%`,
            transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
            pointerEvents: 'none',
            transition: 'all 0.5s ease-out'
          }}
        >
          <AppleEmoji emoji={emoji} size={size} />
        </div>
      ))}
    </div>
  );
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
  return (
    <button
      onPointerUp={onTap}
      style={{
        flex: 1,
        aspectRatio: "1 / 1",
        maxWidth: isDesktop ? 280 : 340,
        maxHeight: isDesktop ? 280 : 340,
        borderRadius: "50%",
        border: `4px solid ${isActive ? "#0288D1" : "#4FC3F7"}`,
        background: isActive
          ? "radial-gradient(circle, #B3E5FC 60%, #81D4FA 100%)"
          : "radial-gradient(circle, #E1F5FE 60%, #B3E5FC 100%)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        touchAction: "manipulation",
        overflow: "hidden",
        position: 'relative',
        boxShadow: isActive
          ? "0 0 0 4px #29B6F6, 0 4px 16px rgba(3,169,244,0.3)"
          : "0 4px 16px rgba(3,169,244,0.15)",
        padding: 0,
      }}
    >
      <RandomPondContent count={count} emoji={emoji} isDesktop={isDesktop} />
      
      <div style={{
        position: 'absolute',
        bottom: '8%',
        background: 'white',
        padding: '2px 10px',
        borderRadius: '12px',
        fontFamily: 'Nunito',
        fontWeight: 900,
        fontSize: isDesktop ? 16 : 20,
        color: "#01579B",
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 2
      }}>
        {count}
      </div>
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
    const isCorrect = idx === round.correct;

    setTimeout(() => {
      setFeedback(isCorrect ? "correct" : "wrong");
      setAnswered(true);

      if (isCorrect) {
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
        }, 800);
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

  if (!round) return null;

  return (
    <GameShell title="Rã Puladora" emoji="🐸" color="var(--c3)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", gap: 8 }}>
        
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "Nunito", fontWeight: 800, fontSize: isDesktop ? 18 : 20, color: "var(--text)", margin: "8px 0" }}>
            {round.question === "mais" ? "💧 Qual lagoa tem MAIS?" : "💧 Qual lagoa tem MENOS?"}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>
          <div style={{ 
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: jumping !== null ? `translateX(${jumping === 0 ? '-80px' : '80px'}) translateY(-40px) scale(1.1)` : 'none'
          }}>
            <AppleEmoji emoji="🐸" size={isDesktop ? 50 : 65} className={jumping === null ? "game-character-idle" : ""} />
          </div>
        </div>

        <div style={{
          display: "flex",
          gap: isDesktop ? 30 : 15,
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: "0 10px",
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

        <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "15px 0" }}>
          {Array.from({ length: cfg.roundsToWin }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              background: i < roundNum - 1 ? "var(--c3)" : i === roundNum - 1 ? "#81C784" : "#E0E0E0",
              transition: 'all 0.3s'
            }} />
          ))}
        </div>
      </div>
    </GameShell>
  );
}