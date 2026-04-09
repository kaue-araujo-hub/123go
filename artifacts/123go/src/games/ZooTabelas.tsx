import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

const ZOO_DATA = [
  { animal: 'Leão',    emoji: '🦁', count: 4,  area: 'Savana' },
  { animal: 'Elefante',emoji: '🐘', count: 7,  area: 'Savana' },
  { animal: 'Pinguim', emoji: '🐧', count: 12, area: 'Ártico' },
  { animal: 'Golfinho',emoji: '🐬', count: 3,  area: 'Oceano' },
  { animal: 'Urso',    emoji: '🐻', count: 5,  area: 'Floresta' },
];

const PHASES = [
  { label: 'Qual animal tem MAIS?',         type: 'most'       },
  { label: 'Qual animal tem MENOS?',        type: 'least'      },
  { label: 'Quantos animais ao todo?',      type: 'total',     correctVal: 4 + 7 + 12 + 3 + 5 },
  { label: 'Quais animais têm 5 ou MAIS?',  type: 'moreThan5'  },
  { label: 'Quais animais têm MENOS de 6?', type: 'lessThan6'  },
];

function genTotalOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  opts.add(correct - 2); opts.add(correct + 3);
  return [...opts].sort(() => Math.random() - 0.5);
}

export function ZooTabelas() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();
  const [feedback,     setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [answered,     setAnswered]    = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());
  const [totalOptions, setTotalOptions] = useState<number[]>([]);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    setSelectedIdxs(new Set());
    if (phaseData.type === 'total') {
      setTotalOptions(genTotalOptions(phaseData.correctVal ?? 0));
    }
  }, [phase]);

  /* single-select (most / least) */
  const handleAnimalTap = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    let correct = false;
    if (phaseData.type === 'most') {
      correct = ZOO_DATA[idx].count === Math.max(...ZOO_DATA.map(a => a.count));
    } else if (phaseData.type === 'least') {
      correct = ZOO_DATA[idx].count === Math.min(...ZOO_DATA.map(a => a.count));
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

  /* multi-select toggle (moreThan5 / lessThan6) */
  const toggleAnimal = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    const ns = new Set(selectedIdxs);
    if (ns.has(idx)) ns.delete(idx); else ns.add(idx);
    setSelectedIdxs(ns);
  };

  /* generic multi-select verify */
  const checkMultiSelect = () => {
    if (answered || phaseCompletedRef.current) return;
    const expected =
      phaseData.type === 'moreThan5'
        ? ZOO_DATA.map((a, i) => a.count >= 5 ? i : -1).filter(i => i >= 0)
        : ZOO_DATA.map((a, i) => a.count < 6  ? i : -1).filter(i => i >= 0);
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

  const isMultiSelect = phaseData.type === 'moreThan5' || phaseData.type === 'lessThan6';
  const isSingleSelect = phaseData.type === 'most' || phaseData.type === 'least';
  const isTappablePhase = isSingleSelect || isMultiSelect;

  const multiHint =
    phaseData.type === 'moreThan5' ? 'Selecione os animais com 5 ou mais' :
    phaseData.type === 'lessThan6' ? 'Selecione os animais com menos de 6' : '';

  return (
    <GameShell title="Zoo Tabelas" emoji="🦁" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>{phaseData.label}</h2>
      </div>

      {/* Reference table */}
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
            <AppleEmoji emoji={row.emoji} size={isDesktop ? 22 : 28} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: 'var(--c2)' }}>{row.count}</span>
            <span style={{ fontFamily: 'Nunito', fontSize: 11, color: 'var(--text3)' }}>{row.area}</span>
          </div>
        ))}
      </div>

      {/* Animal icon buttons — phases 1, 2, 4, 5 */}
      {isTappablePhase && (
        <div>
          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 12, marginBottom: 8 }}>
            {isMultiSelect ? multiHint : 'Toque no animal correto'}
          </p>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {ZOO_DATA.map((animal, idx) => {
              const isSelected = selectedIdxs.has(idx);
              return (
                <button
                  key={idx}
                  onPointerUp={() => isMultiSelect ? toggleAnimal(idx) : handleAnimalTap(idx)}
                  style={{
                    flex: 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '8px 4px', borderRadius: 14,
                    border: `2.5px solid ${isSelected ? 'var(--c2)' : 'var(--border)'}`,
                    background: isSelected ? '#FCE4EC' : '#fff',
                    cursor: 'pointer', touchAction: 'manipulation',
                    minHeight: 68,
                    transition: 'all 0.15s',
                    transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                    boxShadow: isSelected ? '0 2px 10px rgba(233,30,99,0.2)' : '0 1px 4px rgba(0,0,0,0.07)',
                  }}
                >
                  <AppleEmoji emoji={animal.emoji} size={isDesktop ? 34 : 44} />
                  <span style={{
                    fontFamily: 'Nunito', fontWeight: 700, fontSize: 10,
                    color: isSelected ? 'var(--c2)' : 'var(--text2)',
                    textAlign: 'center', lineHeight: 1.2,
                  }}>
                    {animal.animal}
                  </span>
                </button>
              );
            })}
          </div>

          {isMultiSelect && (
            <button
              onPointerUp={checkMultiSelect}
              style={{
                width: '100%', padding: 13, borderRadius: 'var(--radius-pill)',
                background: selectedIdxs.size === 0 ? 'var(--border)' : 'var(--c2)',
                color: selectedIdxs.size === 0 ? 'var(--text3)' : '#fff',
                fontFamily: 'Nunito', fontWeight: 800, fontSize: 15,
                border: 'none', cursor: selectedIdxs.size === 0 ? 'default' : 'pointer',
                minHeight: 50, touchAction: 'manipulation', transition: 'all 0.2s',
              }}
            >
              ✅ Verificar ({selectedIdxs.size} selecionados)
            </button>
          )}
        </div>
      )}

      {/* Total count options (phase 3) */}
      {phaseData.type === 'total' && (
        <div>
          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 13, marginBottom: 10 }}>Escolha o total correto:</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            {totalOptions.map(val => (
              <button
                key={val}
                onPointerUp={() => handleTotalAnswer(val)}
                style={{
                  width: isDesktop ? 56 : 86, height: isDesktop ? 56 : 86, borderRadius: isDesktop ? 12 : 20,
                  border: '2.5px solid var(--border)', background: '#fff',
                  fontFamily: 'Nunito', fontWeight: 900, fontSize: isDesktop ? 22 : 36, color: 'var(--text)',
                  cursor: 'pointer', minHeight: isDesktop ? 56 : 86, touchAction: 'manipulation',
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
