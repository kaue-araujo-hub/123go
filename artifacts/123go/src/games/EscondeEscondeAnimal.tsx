import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const PHASES = [
  { positions: ['em cima', 'embaixo'], animal: '🦊', hint: '🌳', allPositions: ['em cima', 'embaixo'] },
  { positions: ['à esquerda', 'à direita', 'em cima', 'embaixo'], animal: '🐇', hint: '🌺', allPositions: ['à esquerda', 'à direita', 'em cima', 'embaixo'] },
  { positions: ['em cima', 'embaixo', 'à esquerda', 'à direita'], animal: '🐸', hint: '🍄', allPositions: ['em cima', 'embaixo', 'à esquerda', 'à direita'] },
  { positions: ['no meio', 'em cima', 'embaixo', 'à esquerda'], animal: '🦔', hint: '🍀', allPositions: ['no meio', 'em cima', 'embaixo', 'à esquerda'] },
  { positions: ['atrás', 'na frente', 'à esquerda', 'à direita', 'em cima', 'embaixo'], animal: '🦦', hint: '🌊',
    allPositions: ['atrás', 'na frente', 'à esquerda', 'à direita', 'em cima', 'embaixo'] },
];

const POSITION_ICONS: Record<string, string> = {
  'em cima': '⬆️', 'embaixo': '⬇️', 'à esquerda': '⬅️', 'à direita': '➡️',
  'no meio': '🎯', 'atrás': '🔙', 'na frente': '🔜',
};

function announcePosition(position: string, animal: string) {
  const text = `O ${animal} está ${position}!`;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  }
  return text;
}

export function EscondeEscondeAnimal() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [instructionText, setInstructionText] = useState('');
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    if (!phaseData) return;
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    const idx = Math.floor(Math.random() * phaseData.positions.length);
    setCurrentPosition(idx);
    const pos = phaseData.positions[idx];
    const text = announcePosition(pos, phaseData.animal);
    setInstructionText(text);
    return () => { window.speechSynthesis?.cancel(); };
  }, [phase]);

  const correctPos = phaseData?.positions[currentPosition] ?? '';

  const handleTap = (pos: string) => {
    if (answered || phaseCompletedRef.current || !phaseData) return;
    const correct = pos === correctPos;
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true;
      onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  if (phaseComplete || !phaseData) {
    return (
      <GameShell title="Esconde-esconde Animal" emoji="🦊" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c1)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Esconde-esconde Animal" emoji="🦊" color="var(--c1)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Instruction — always visible text + audio */}
      <div style={{ background: '#FFF9C4', border: '2px solid #F9A825', borderRadius: 16, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: '#E65100', margin: 0 }}>
          📢 {instructionText}
        </p>
        <button
          onPointerUp={() => {
            const pos = phaseData.positions[currentPosition];
            const text = announcePosition(pos, phaseData.animal);
            setInstructionText(text);
          }}
          style={{
            marginTop: 8, padding: '4px 14px', borderRadius: 'var(--radius-pill)',
            background: '#F9A825', color: '#fff', border: 'none', fontFamily: 'Nunito',
            fontWeight: 700, fontSize: 12, cursor: 'pointer', touchAction: 'manipulation',
          }}
        >
          🔊 Ouvir de novo
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <AppleEmoji emoji={phaseData.animal} size={72} className="game-character-idle" />
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>Onde está o {phaseData.hint}? Toque na posição certa!</p>
      </div>

      {/* Position buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {phaseData.positions.map(pos => (
          <button
            key={pos}
            onPointerUp={() => handleTap(pos)}
            style={{
              padding: '12px 8px', borderRadius: 16, minHeight: 56,
              border: `2.5px solid ${correctPos === pos && answered ? 'var(--c5)' : 'var(--border)'}`,
              background: correctPos === pos && answered ? '#E8F5E9' : '#fff',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: 'var(--text)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, transition: 'all 0.15s', touchAction: 'manipulation',
            }}
          >
            <span style={{ fontSize: 22 }}>{POSITION_ICONS[pos] ?? '📍'}</span>
            {pos}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
