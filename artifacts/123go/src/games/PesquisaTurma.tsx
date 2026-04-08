import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const CHART_DATA = [
  { name: 'Gato',     emoji: '🐱', color: '#E91E63', votes: 5 },
  { name: 'Cachorro', emoji: '🐶', color: '#5B4FCF', votes: 8 },
  { name: 'Peixe',    emoji: '🐠', color: '#00BCD4', votes: 3 },
  { name: 'Pássaro',  emoji: '🦜', color: '#4CAF50', votes: 6 },
];

const PHASES = [
  { label: 'Qual animal teve MAIS votos?',           type: 'most'  },
  { label: 'Qual animal teve MENOS votos?',          type: 'least' },
  { label: 'Quantos votos o Cachorro teve?',         type: 'count', targetIdx: 1, correct: 8  },
  { label: 'Quantos votos o Gato teve?',             type: 'count', targetIdx: 0, correct: 5  },
  { label: 'Quais animais tiveram MAIS de 5 votos?', type: 'multi' },
];

function genCountOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  opts.add(correct > 2 ? correct - 2 : correct + 3);
  while (opts.size < 3) opts.add(Math.max(1, correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1)));
  return [...opts].sort(() => Math.random() - 0.5);
}

function BarChart({ highlightIdx }: { highlightIdx?: number }) {
  const maxV = Math.max(...CHART_DATA.map(d => d.votes));
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius)',
      border: '1.5px solid var(--border)', padding: '12px 10px 8px',
    }}>
      <p style={{ textAlign: 'center', fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
        Dados da Pesquisa
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110, justifyContent: 'center' }}>
        {CHART_DATA.map((d, i) => {
          const h = Math.round((d.votes / maxV) * 92);
          const isHighlight = highlightIdx === i;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
              <span style={{
                fontFamily: 'Nunito', fontWeight: 900, fontSize: 14,
                color: isHighlight ? d.color : 'var(--text)',
                opacity: isHighlight ? 1 : 0.7,
              }}>
                {d.votes}
              </span>
              <div style={{
                width: '100%', height: h,
                borderRadius: '6px 6px 0 0',
                background: d.color,
                opacity: isHighlight !== undefined ? (isHighlight ? 1 : 0.35) : 1,
                transition: 'opacity 0.2s',
                outline: isHighlight ? `3px solid ${d.color}` : 'none',
                outlineOffset: 2,
              }} />
              <AppleEmoji emoji={d.emoji} size={22} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PesquisaTurma() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [feedback,     setFeedback]    = useState<'correct' | 'wrong' | null>(null);
  const [answered,     setAnswered]    = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());
  const [countOptions, setCountOptions] = useState<number[]>([]);
  const phaseCompletedRef = useRef(false);
  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    setSelectedIdxs(new Set());
    if (phaseData.type === 'count') {
      setCountOptions(genCountOptions(phaseData.correct ?? 0));
    }
  }, [phase]);

  /* single-select — most / least */
  const handleAnimalTap = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    let correct = false;
    if (phaseData.type === 'most') {
      correct = CHART_DATA[idx].votes === Math.max(...CHART_DATA.map(d => d.votes));
    } else if (phaseData.type === 'least') {
      correct = CHART_DATA[idx].votes === Math.min(...CHART_DATA.map(d => d.votes));
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

  /* count — number buttons */
  const handleCountTap = (val: number) => {
    if (answered || phaseCompletedRef.current) return;
    const correct = val === (phaseData.correct ?? 0);
    setFeedback(correct ? 'correct' : 'wrong');
    setAnswered(true);
    if (correct) {
      phaseCompletedRef.current = true; onCorrect();
      setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
    } else {
      setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
    }
  };

  /* multi-select — toggle + verify */
  const toggleAnimal = (idx: number) => {
    if (answered || phaseCompletedRef.current) return;
    const ns = new Set(selectedIdxs);
    if (ns.has(idx)) ns.delete(idx); else ns.add(idx);
    setSelectedIdxs(ns);
  };

  const checkMulti = () => {
    if (answered || phaseCompletedRef.current) return;
    const expected = CHART_DATA.map((d, i) => d.votes > 5 ? i : -1).filter(i => i >= 0);
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

  if (phaseComplete) {
    return (
      <GameShell title="Meus Pets" emoji="🐾" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  const isSingleSelect = phaseData.type === 'most' || phaseData.type === 'least';
  const isMulti = phaseData.type === 'multi';
  const isAnimalPhase = isSingleSelect || isMulti;

  return (
    <GameShell title="Meus Pets" emoji="🐾" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
          {phaseData.label}
        </h2>
      </div>

      {/* Bar chart — always visible */}
      <BarChart highlightIdx={phaseData.type === 'count' ? phaseData.targetIdx : undefined} />

      {/* Animal icon buttons — phases 1, 2, 5 */}
      {isAnimalPhase && (
        <div style={{ marginTop: 14 }}>
          {isMulti && (
            <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 12, marginBottom: 8 }}>
              Selecione todos os animais com mais de 5 votos
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {CHART_DATA.map((animal, idx) => {
              const isSelected = selectedIdxs.has(idx);
              return (
                <button
                  key={idx}
                  onPointerUp={() => isMulti ? toggleAnimal(idx) : handleAnimalTap(idx)}
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
                  <AppleEmoji emoji={animal.emoji} size={30} />
                  <span style={{
                    fontFamily: 'Nunito', fontWeight: 700, fontSize: 10,
                    color: isSelected ? 'var(--c2)' : 'var(--text2)',
                    textAlign: 'center', lineHeight: 1.2,
                  }}>
                    {animal.name}
                  </span>
                </button>
              );
            })}
          </div>

          {isMulti && (
            <button
              onPointerUp={checkMulti}
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

      {/* Number buttons — phases 3 & 4 */}
      {phaseData.type === 'count' && (
        <div style={{ marginTop: 14 }}>
          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 12, marginBottom: 12 }}>
            Olhe o gráfico e escolha o número certo:
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            {countOptions.map(val => (
              <button
                key={val}
                onPointerUp={() => handleCountTap(val)}
                style={{
                  width: 86, height: 86, borderRadius: 20,
                  border: '2.5px solid var(--border)', background: '#fff',
                  fontFamily: 'Nunito', fontWeight: 900, fontSize: 40, color: 'var(--text)',
                  cursor: 'pointer', minHeight: 86, touchAction: 'manipulation',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
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
