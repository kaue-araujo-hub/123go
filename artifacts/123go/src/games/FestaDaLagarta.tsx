import React, { useState, useEffect, useCallback } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard, getPhaseConfig } from '../engine/GameEngine';

const PHASES = [
  { target: 3, max: 5, label: 'Arraste 3 folhas para a lagarta!' },
  { target: 7, max: 10, label: 'Arraste 7 folhas para a lagarta!' },
  { target: 5, max: 10, label: 'Encontre a lagarta com 5 folhas!' },
  { target: 6, max: 10, label: 'Arraste rápido! 6 folhas em 20 segundos!' },
  { target: 8, max: 12, label: 'Arraste 2 folhas de cada vez para a lagarta!' },
];

export function FestaDaLagarta() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [folhasColetadas, setFolhasColetadas] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    setFolhasColetadas(0);
  }, [phase]);

  useEffect(() => {
    if (folhasColetadas >= phaseData.target && !phaseComplete) {
      setFeedback('correct');
      setTimeout(() => {
        setFeedback(null);
        onPhaseComplete();
      }, 1000);
    }
  }, [folhasColetadas, phaseData.target, phaseComplete, onPhaseComplete]);

  const handleDragStart = (id: number) => setDraggingId(id);
  const handleDrop = () => {
    if (draggingId !== null) {
      setFolhasColetadas(c => Math.min(c + 1, phaseData.target));
      setDraggingId(null);
      setDragOver(false);
      onCorrect();
    }
  };

  const handleTap = (leafId: number) => {
    if (folhasColetadas < phaseData.target) {
      setFolhasColetadas(c => c + 1);
      onCorrect();
    }
  };

  const leaves = Array.from({ length: phaseData.max }, (_, i) => ({
    id: i,
    collected: i < folhasColetadas,
    color: ['#5CAD3C', '#8BC34A', '#4CAF50', '#66BB6A', '#81C784'][i % 5],
  }));

  if (phaseComplete) {
    return (
      <GameShell title="Festa da Lagarta" emoji="🐛" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c5)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Festa da Lagarta" emoji="🐛" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
          {phaseData.label}
        </p>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Folhas coletadas: <strong>{folhasColetadas}</strong> / {phaseData.target}
        </p>
      </div>

      {/* Progress bar inside game */}
      <div style={{ background: 'var(--border)', borderRadius: 8, height: 12, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'var(--c5)',
          width: `${(folhasColetadas / phaseData.target) * 100}%`,
          transition: 'width 0.3s ease',
          borderRadius: 8,
        }} />
      </div>

      {/* Caterpillar */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          background: dragOver ? '#E8F5E9' : '#F1F8E9',
          border: `3px dashed ${dragOver ? '#4CAF50' : '#A5D6A7'}`,
          borderRadius: 20,
          padding: 20,
          textAlign: 'center',
          marginBottom: 24,
          transition: 'all 0.2s ease',
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 56, animation: folhasColetadas > 0 ? 'wriggle 0.5s ease' : 'none' }}>
          {'🐛'.repeat(1)}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: folhasColetadas }).map((_, i) => (
            <span key={i} style={{ fontSize: 16 }}>🌿</span>
          ))}
        </div>
        <p style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 600 }}>
          {dragOver ? 'Solte aqui!' : 'Arraste folhas para cá ou toque nelas'}
        </p>
      </div>

      {/* Leaves */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {leaves.filter(l => !l.collected).map(leaf => (
          <div
            key={leaf.id}
            draggable
            onDragStart={() => handleDragStart(leaf.id)}
            onClick={() => handleTap(leaf.id)}
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: leaf.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              cursor: 'grab',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s ease',
              minHeight: 64,
              minWidth: 64,
            }}
          >
            🍃
          </div>
        ))}
      </div>

      <style>{`
        @keyframes wriggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>
    </GameShell>
  );
}
