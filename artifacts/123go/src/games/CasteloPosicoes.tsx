import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

type Zone = 'top' | 'bottom' | 'left' | 'right' | 'center';

interface Instruction {
  text: string;
  targetZone: Zone;
  secondZone?: Zone;
}

const INSTRUCTIONS_BY_PHASE: Instruction[][] = [
  [
    { text: 'Coloque o cavaleiro EM CIMA do castelo!', targetZone: 'top' },
    { text: 'Coloque o cavaleiro EMBAIXO do castelo!', targetZone: 'bottom' },
    { text: 'Coloque o cavaleiro À ESQUERDA do castelo!', targetZone: 'left' },
  ],
  [
    { text: 'Coloque o cavaleiro EM CIMA E À DIREITA!', targetZone: 'right', secondZone: 'top' },
    { text: 'Coloque o cavaleiro EMBAIXO E À ESQUERDA!', targetZone: 'left', secondZone: 'bottom' },
  ],
  [
    { text: 'O rei diz: NO CENTRO!', targetZone: 'center' },
    { text: 'O rei diz: À DIREITA!', targetZone: 'right' },
    { text: 'O rei diz: EM CIMA!', targetZone: 'top' },
  ],
  [
    { text: 'Dois passos à DIREITA!', targetZone: 'right' },
    { text: 'Dois passos para CIMA!', targetZone: 'top' },
    { text: 'Para o CENTRO!', targetZone: 'center' },
  ],
  [
    { text: 'O dragão está À ESQUERDA — fuja para a DIREITA!', targetZone: 'right' },
    { text: 'O dragão está EMBAIXO — fuja para CIMA!', targetZone: 'top' },
    { text: 'Chegou ao CENTRO do castelo!', targetZone: 'center' },
  ],
];

export function CasteloPosicoes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [instrIdx, setInstrIdx] = useState(0);
  const phaseCompletedRef = useRef(false);
  const instrIdxRef = useRef(0);

  const instructions = INSTRUCTIONS_BY_PHASE[phase - 1] ?? INSTRUCTIONS_BY_PHASE[0];
  const instruction = instructions[instrIdx] ?? instructions[0];

  useEffect(() => {
    phaseCompletedRef.current = false;
    instrIdxRef.current = 0;
    setInstrIdx(0);
    setAnswered(false);
    setFeedback(null);
  }, [phase]);

  const handleZone = (zone: Zone) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = zone === instruction.targetZone ||
      (instruction.secondZone !== undefined && zone === instruction.secondZone);
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      onCorrect();
      const next = instrIdxRef.current + 1;
      setTimeout(() => {
        setFeedback(null);
        if (next >= instructions.length) {
          phaseCompletedRef.current = true;
          onPhaseComplete();
        } else {
          instrIdxRef.current = next;
          setInstrIdx(next);
          setAnswered(false);
        }
      }, 900);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Castelo das Posições" emoji="🏰" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  const zones: Zone[] = ['top', 'center', 'bottom', 'left', 'right'];

  return (
    <GameShell title="Castelo das Posições" emoji="🏰" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <AppleEmoji emoji="👑" size={isDesktop ? 24 : 34} />
          <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>O Rei diz:</span>
        </div>
        <div style={{ background: '#FFF9C4', border: '2px solid #F9A825', borderRadius: 16, padding: '10px 18px', display: 'inline-block' }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: 'var(--text)', margin: 0 }}>
            {instruction.text}
          </h2>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 6 }}>
          Instrução {instrIdx + 1}/{instructions.length}
        </p>
      </div>

      {/* Castle grid - 3×3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 8, height: isDesktop ? 170 : 230, marginBottom: 14 }}>
        <div />
        <button onPointerUp={() => handleZone('top')}    style={zoneStyle('top',    instruction.targetZone === 'top'    || instruction.secondZone === 'top',    answered)}>⬆️<br/>Em cima</button>
        <div />
        <button onPointerUp={() => handleZone('left')}   style={zoneStyle('left',   instruction.targetZone === 'left'   || instruction.secondZone === 'left',   answered)}>⬅️<br/>Esquerda</button>
        <button onPointerUp={() => handleZone('center')} style={zoneStyle('center', instruction.targetZone === 'center' || instruction.secondZone === 'center', answered)}>🏰<br/>Centro</button>
        <button onPointerUp={() => handleZone('right')}  style={zoneStyle('right',  instruction.targetZone === 'right'  || instruction.secondZone === 'right',  answered)}>➡️<br/>Direita</button>
        <div />
        <button onPointerUp={() => handleZone('bottom')} style={zoneStyle('bottom', instruction.targetZone === 'bottom' || instruction.secondZone === 'bottom', answered)}>⬇️<br/>Embaixo</button>
        <div />
      </div>

      <div style={{ textAlign: 'center' }}>
        <AppleEmoji emoji="🗡️" size={isDesktop ? 32 : 48} className="game-character-idle" />
      </div>
    </GameShell>
  );
}

function zoneStyle(zone: string, active: boolean, answered: boolean): React.CSSProperties {
  return {
    borderRadius: 16, border: `3px solid ${active && answered ? 'var(--c5)' : 'var(--border)'}`,
    background: active && answered ? '#E8F5E9' : '#fff',
    fontSize: 12, fontWeight: 700, color: 'var(--text2)', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 3, minHeight: 60, transition: 'all 0.15s',
    touchAction: 'manipulation',
  };
}
