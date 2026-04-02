import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const INSTRUCTIONS = [
  { text: 'Mova o cavaleiro para a DIREITA da torre!', targetZone: 'right' },
  { text: 'Coloque o cavaleiro EMBAIXO do dragão!', targetZone: 'bottom' },
  { text: 'Posicione o cavaleiro À ESQUERDA do castelo!', targetZone: 'left' },
  { text: 'Leve o cavaleiro para EM CIMA da bandeira!', targetZone: 'top' },
  { text: 'Mova o cavaleiro para o CENTRO do castelo!', targetZone: 'center' },
];

const ZONES = ['top', 'left', 'center', 'right', 'bottom'];

export function CasteloPosicoes() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [instrIdx, setInstrIdx] = useState(0);

  useEffect(() => { setAnswered(false); setFeedback(null); setInstrIdx(phase - 1); }, [phase]);

  const instruction = INSTRUCTIONS[instrIdx % INSTRUCTIONS.length];

  const handleZone = (zone: string) => {
    if (answered) return;
    const correct = zone === instruction.targetZone;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Castelo das Posições" emoji="🏰" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Castelo das Posições" emoji="🏰" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>👑 O Rei diz:</div>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 18, color: 'var(--text)', background: '#FFF9C4', padding: '10px 20px', borderRadius: 'var(--radius-pill)', display: 'inline-block' }}>
          {instruction.text}
        </h2>
      </div>

      {/* Castle grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 8, height: 240, marginBottom: 16 }}>
        <div/>
        <button onClick={() => handleZone('top')} style={zoneStyle('top', instruction.targetZone === 'top' && answered)}>⬆️<br/>Em cima</button>
        <div/>
        <button onClick={() => handleZone('left')} style={zoneStyle('left', instruction.targetZone === 'left' && answered)}>⬅️<br/>Esquerda</button>
        <button onClick={() => handleZone('center')} style={zoneStyle('center', instruction.targetZone === 'center' && answered)}>🏰<br/>Centro</button>
        <button onClick={() => handleZone('right')} style={zoneStyle('right', instruction.targetZone === 'right' && answered)}>➡️<br/>Direita</button>
        <div/>
        <button onClick={() => handleZone('bottom')} style={zoneStyle('bottom', instruction.targetZone === 'bottom' && answered)}>⬇️<br/>Embaixo</button>
        <div/>
      </div>

      <div style={{ textAlign: 'center', fontSize: 48 }}>🗡️ Cavaleiro esperando...</div>
    </GameShell>
  );
}

function zoneStyle(zone: string, active: boolean): React.CSSProperties {
  return {
    borderRadius: 16,
    border: `3px solid ${active ? 'var(--c5)' : 'var(--border)'}`,
    background: active ? '#E8F5E9' : '#fff',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text2)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 70,
    transition: 'all 0.15s',
  };
}
