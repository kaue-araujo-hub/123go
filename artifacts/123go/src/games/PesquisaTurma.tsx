import React, { useState, useEffect } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

interface Phase {
  topic: string;
  options: { label: string; color: string; emoji: string }[];
  students: number;
}

const PHASES: Phase[] = [
  { topic: 'Qual sua fruta favorita?', options: [{ label: 'Maçã', color: '#E91E8C', emoji: '🍎' }, { label: 'Banana', color: '#FF9800', emoji: '🍌' }], students: 5 },
  { topic: 'Qual seu animal favorito?', options: [{ label: 'Cachorro', color: '#FF6B35', emoji: '🐕' }, { label: 'Gato', color: '#5B4FCF', emoji: '🐱' }, { label: 'Coelho', color: '#4CAF50', emoji: '🐇' }], students: 10 },
  { topic: 'Qual seu esporte favorito?', options: [{ label: 'Futebol', color: '#4CAF50', emoji: '⚽' }, { label: 'Basquete', color: '#FF9800', emoji: '🏀' }, { label: 'Natação', color: '#00B4D8', emoji: '🏊' }], students: 9 },
  { topic: 'Qual sua cor favorita?', options: [{ label: 'Azul', color: '#00B4D8', emoji: '💙' }, { label: 'Verde', color: '#4CAF50', emoji: '💚' }, { label: 'Rosa', color: '#E91E8C', emoji: '💗' }], students: 12 },
  { topic: 'Qual seu hobby favorito?', options: [{ label: 'Leitura', color: '#5B4FCF', emoji: '📚' }, { label: 'Jogos', color: '#FF6B35', emoji: '🎮' }, { label: 'Música', color: '#FF9800', emoji: '🎵' }], students: 15 },
];

const AVATARS = ['👦', '👧', '🧒', '👨‍🦱', '👩‍🦱', '🧑', '👦🏻', '👧🏻', '🧒🏽', '👦🏾', '👧🏾', '🧒🏿', '👦🏻', '👧🏽', '🧑🏾'];

export function PesquisaTurma() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedStudents, setVotedStudents] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    setVotes({});
    setVotedStudents([]);
    setFeedback(null);
  }, [phase]);

  const handleStudentVote = (studentIdx: number, optionLabel: string) => {
    if (votedStudents.includes(studentIdx)) return;
    setVotedStudents(prev => [...prev, studentIdx]);
    setVotes(prev => ({ ...prev, [optionLabel]: (prev[optionLabel] || 0) + 1 }));
    onCorrect();

    if (votedStudents.length + 1 >= phaseData.students) {
      setFeedback('correct');
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    }
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  if (phaseComplete) {
    return (
      <GameShell title="Pesquisa da Turma" emoji="📊" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c5)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Pesquisa da Turma" emoji="📊" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>{phaseData.topic}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Toque em cada criança e depois escolha a opção!</p>
        <p style={{ color: 'var(--c5)', fontWeight: 700, fontSize: 13 }}>{votedStudents.length}/{phaseData.students} votos coletados</p>
      </div>

      {/* Students */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {Array.from({ length: phaseData.students }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: votedStudents.includes(i) ? '#E8F5E9' : '#fff',
                border: `2px solid ${votedStudents.includes(i) ? '#4CAF50' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                cursor: votedStudents.includes(i) ? 'default' : 'pointer',
                opacity: votedStudents.includes(i) ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >{AVATARS[i % AVATARS.length]}</div>
            {!votedStudents.includes(i) && (
              <div style={{ display: 'flex', gap: 3 }}>
                {phaseData.options.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => handleStudentVote(i, opt.label)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: opt.color,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={opt.label}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live chart */}
      {totalVotes > 0 && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', padding: 16 }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--text)' }}>📊 Resultado em tempo real:</p>
          {phaseData.options.map(opt => {
            const count = votes[opt.label] || 0;
            return (
              <div key={opt.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 13 }}>{opt.emoji} {opt.label}</span>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: opt.color }}>{count}</span>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 6, height: 12, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: opt.color,
                    width: totalVotes > 0 ? `${(count / phaseData.students) * 100}%` : '0%',
                    transition: 'width 0.4s ease',
                    borderRadius: 6,
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GameShell>
  );
}
