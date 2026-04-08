import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const ZOO_DATA = [
  { animal: 'Leão',    emoji: '🦁', count: 4,  area: 'Savana' },
  { animal: 'Elefante',emoji: '🐘', count: 7,  area: 'Savana' },
  { animal: 'Pinguim', emoji: '🐧', count: 12, area: 'Ártico' },
  { animal: 'Golfinho',emoji: '🐬', count: 3,  area: 'Oceano' },
  { animal: 'Urso',    emoji: '🐻', count: 5,  area: 'Floresta' },
];

const PHASES = [
  { label: 'Qual animal tem MAIS?',          type: 'most'       },
  { label: 'Qual animal tem MENOS?',         type: 'least'      },
  { label: 'Quantos animais ao todo?',       type: 'total',     correctVal: 4 + 7 + 12 + 3 + 5 },
  { label: 'Quais animais têm MAIS de 5?',   type: 'moreThan5', correctIdxs: [1, 2] },
  { label: 'Adicione novos animais à tabela!', type: 'add'      },
];

function genTotalOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  opts.add(correct - 2); opts.add(correct + 3);
  return [...opts].sort(() => Math.random() - 0.5);
}

export function ZooTabelas() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback,      setFeedback]      = useState<'correct' | 'wrong' | null>(null);
  const [answered,      setAnswered]      = useState(false);
  const [selectedIdxs,  setSelectedIdxs]  = useState<Set<number>>(new Set());
  const [totalOptions,  setTotalOptions]  = useState<number[]>([]);
  const [newCounts,     setNewCounts]     = useState<number[]>([2, 2]);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    setSelectedIdxs(new Set());
    setNewCounts([2, 2]);
    if (phaseData.type === 'total') {
      setTotalOptions(genTotalOptions(phaseData.correctVal ?? 0));
    }
  }, [phase]);

  /* single-select answer (most / least) */
  const handleAnimalTap = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    let correct = false;
    if (phaseData.type === 'most') {
      const maxCount = Math.max(...ZOO_DATA.map(a => a.count));
      correct = ZOO_DATA[idx].count === maxCount;
    } else if (phaseData.type === 'least') {
      const minCount = Math.min(...ZOO_DATA.map(a => a.count));
      correct = ZOO_DATA[idx].count === minCount;
    }
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true; onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  /* multi-select toggle (moreThan5) */
  const toggleAnimal = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    const ns = new Set(selectedIdxs);
    if (ns.has(idx)) ns.delete(idx); else ns.add(idx);
    setSelectedIdxs(ns);
  };

  const checkMoreThan5 = () => {
    if (phaseCompletedRef.current) return;
    const expected = ZOO_DATA.map((a, i) => a.count > 5 ? i : -1).filter(i => i >= 0);
    const correct = expected.length === selectedIdxs.size && expected.every(i => selectedIdxs.has(i));
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true; onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); setSelectedIdxs(new Set()); }, 1000);
    }
  };

  const handleTotalAnswer = (val: number) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = val === (phaseData.correctVal ?? 0);
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true; onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  if (phaseComplete) {
    return (
      <GameShell title="Zoo Tabelas" emoji="🦁" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  const isTappablePhase = phaseData.type === 'most' || phaseData.type === 'least' || phaseData.type === 'moreThan5';

  return (
    <GameShell title="Zoo Tabelas" emoji="🦁" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>{phaseData.label}</h2>
      </div>

      {/* Reference table — not clickable, just visual */}
      <div style={{ borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'var(--c2)', padding: '8px 12px' }}>
          {['Animal', 'Emoji', 'Quant.', 'Área'].map(h => (
            <span key={h} style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: '#fff' }}>{h}</span>
          ))}
        </div>
        {ZOO_DATA.map((row, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
              padding: '8px 12px',
              background: idx % 2 === 0 ? '#fff' : 'var(--bg)',
            }}
          >
            <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{row.animal}</span>
            <AppleEmoji emoji={row.emoji} size={22} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: 'var(--c2)' }}>{row.count}</span>
            <span style={{ fontFamily: 'Nunito', fontSize: 11, color: 'var(--text3)' }}>{row.area}</span>
          </div>
        ))}
      </div>

      {/* ── Animal icon buttons for phases 1, 2, 4 ── */}
      {isTappablePhase && (
        <div>
          {phaseData.type === 'moreThan5' && (
            <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 12, marginBottom: 8 }}>
              Selecione todos os animais com mais de 5
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
            {ZOO_DATA.map((animal, idx) => {
              const isSelected = selectedIdxs.has(idx);
              return (
                <button
                  key={idx}
                  onPointerUp={() => phaseData.type === 'moreThan5' ? toggleAnimal(idx) : handleAnimalTap(idx)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 12px', borderRadius: 16,
                    border: `2.5px solid ${isSelected ? 'var(--c2)' : 'var(--border)'}`,
                    background: isSelected ? '#E3F2FD' : '#fff',
                    cursor: 'pointer', touchAction: 'manipulation',
                    minWidth: 60, minHeight: 72,
                    transition: 'all 0.15s',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isSelected ? '0 2px 10px rgba(233,30,99,0.18)' : '0 1px 4px rgba(0,0,0,0.07)',
                  }}
                >
                  <AppleEmoji emoji={animal.emoji} size={36} />
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: isSelected ? 'var(--c2)' : 'var(--text2)' }}>
                    {animal.animal}
                  </span>
                </button>
              );
            })}
          </div>

          {phaseData.type === 'moreThan5' && (
            <button
              onPointerUp={checkMoreThan5}
              style={{
                width: '100%', padding: 13, borderRadius: 'var(--radius-pill)',
                background: 'var(--c2)', color: '#fff', fontFamily: 'Nunito',
                fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
                minHeight: 50, touchAction: 'manipulation',
                opacity: selectedIdxs.size === 0 ? 0.5 : 1, transition: 'opacity 0.15s',
              }}
            >
              ✅ Verificar ({selectedIdxs.size} selecionados)
            </button>
          )}
        </div>
      )}

      {/* ── Total count options (phase 3) ── */}
      {phaseData.type === 'total' && (
        <div>
          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 13, marginBottom: 10 }}>Escolha o total correto:</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            {totalOptions.map(val => (
              <button
                key={val}
                onPointerUp={() => handleTotalAnswer(val)}
                style={{
                  width: 86, height: 86, borderRadius: 20,
                  border: '2.5px solid var(--border)', background: '#fff',
                  fontFamily: 'Nunito', fontWeight: 900, fontSize: 36, color: 'var(--text)',
                  cursor: 'pointer', minHeight: 86, touchAction: 'manipulation',
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Add animals (phase 5) ── */}
      {phaseData.type === 'add' && (
        <div>
          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 13, marginBottom: 10 }}>
            Adicione novos animais ao zoológico!
          </p>
          {[{ emoji: '🐯', name: 'Tigre' }, { emoji: '🦒', name: 'Girafa' }].map((animal, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 14, padding: '10px 14px', marginBottom: 8, border: '1.5px solid var(--border)' }}>
              <AppleEmoji emoji={animal.emoji} size={32} />
              <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, flex: 1, color: 'var(--text)' }}>{animal.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onPointerUp={() => setNewCounts(prev => { const n = [...prev]; n[i] = Math.max(1, n[i] - 1); return n; })}
                  style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid var(--border)', background: '#fff', fontSize: 20, cursor: 'pointer', touchAction: 'manipulation', minHeight: 36 }}
                >−</button>
                <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 20, minWidth: 28, textAlign: 'center', color: 'var(--c2)' }}>{newCounts[i]}</span>
                <button
                  onPointerUp={() => setNewCounts(prev => { const n = [...prev]; n[i] = Math.min(20, n[i] + 1); return n; })}
                  style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid var(--border)', background: '#fff', fontSize: 20, cursor: 'pointer', touchAction: 'manipulation', minHeight: 36 }}
                >+</button>
              </div>
            </div>
          ))}
          <button
            onPointerUp={() => {
              if (!phaseCompletedRef.current) {
                phaseCompletedRef.current = true;
                onCorrect();
                setTimeout(() => onPhaseComplete(), 400);
              }
            }}
            style={{
              width: '100%', marginTop: 8, padding: 14, borderRadius: 'var(--radius-pill)',
              background: 'var(--c2)', color: '#fff', fontFamily: 'Nunito',
              fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
              minHeight: 52, touchAction: 'manipulation',
            }}
          >
            ✅ Adicionar ao zoológico!
          </button>
        </div>
      )}
    </GameShell>
  );
}
