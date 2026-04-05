import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';

const SEQUENCES = [
  ['Segunda', 'Terça', 'Quarta'],
  ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
  ['Manhã', 'Tarde', 'Noite', 'Segunda', 'Terça'],
  ['Janeiro', 'Fevereiro', 'Março', 'Abril'],
  ['Segunda', 'Terça', 'Manhã', 'Tarde', 'Janeiro', 'Fevereiro'],
];

const PHASE_LABELS = [
  'Ordene os dias da semana!',
  'Ordene a semana completa!',
  'Ordene períodos e dias!',
  'Ordene os meses!',
  'Ordene dias, períodos e meses!',
];

type SubStep = { items: string[]; label: string };

function getSubSteps(seq: string[]): SubStep[] {
  const days  = seq.filter(s => ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'].includes(s));
  const times = seq.filter(s => ['Manhã','Tarde','Noite','Madrugada'].includes(s));
  const months = seq.filter(s => ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].includes(s));
  const steps: SubStep[] = [];
  if (days.length > 0)   steps.push({ items: days,   label: '📅 Ordene os dias' });
  if (times.length > 0)  steps.push({ items: times,  label: '🌅 Ordene os períodos' });
  if (months.length > 0) steps.push({ items: months, label: '📆 Ordene os meses' });
  if (steps.length === 0) steps.push({ items: seq, label: 'Ordene os itens' });
  return steps;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

export function MaquinaTempo() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [subSteps, setSubSteps] = useState<SubStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const phaseCompletedRef = useRef(false);
  const stepRef = useRef(0);

  const initStep = (steps: SubStep[], idx: number) => {
    const step = steps[idx];
    if (!step) return;
    setShuffled(shuffle([...step.items]));
    setSelected([]);
    setFeedback(null);
  };

  useEffect(() => {
    phaseCompletedRef.current = false;
    stepRef.current = 0;
    setStepIdx(0);
    const seq = SEQUENCES[phase - 1] ?? [];
    const steps = phase === 5 ? getSubSteps(seq) : [{ items: seq, label: PHASE_LABELS[phase - 1] }];
    setSubSteps(steps);
    initStep(steps, 0);
  }, [phase]);

  const currentStep = subSteps[stepIdx];
  const sequence = currentStep?.items ?? [];

  const handleTap = (item: string) => {
    if (feedback || phaseCompletedRef.current || selected.includes(item)) return;
    const newSelected = [...selected, item];
    setSelected(newSelected);

    if (newSelected.length === sequence.length) {
      const correct = newSelected.every((s, i) => s === sequence[i]);
      setFeedback(correct ? 'correct' : 'wrong');
      if (correct) {
        onCorrect();
        const nextStep = stepRef.current + 1;
        setTimeout(() => {
          setFeedback(null);
          if (nextStep >= subSteps.length) {
            phaseCompletedRef.current = true;
            onPhaseComplete();
          } else {
            stepRef.current = nextStep;
            setStepIdx(nextStep);
            initStep(subSteps, nextStep);
          }
        }, 900);
      } else {
        setTimeout(() => { setFeedback(null); setSelected([]); }, 900);
      }
    }
  };

  if (phaseComplete || !currentStep) {
    return (
      <GameShell title="Máquina do Tempo" emoji="⚙️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c4)" />
      </GameShell>
    );
  }

  const isPhase5 = phase === 5 && subSteps.length > 1;

  return (
    <GameShell title="Máquina do Tempo" emoji="⚙️" color="var(--c4)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
          {currentStep.label}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          Toque na ordem certa: {selected.length}/{sequence.length}
        </p>
        {isPhase5 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
            {subSteps.map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i <= stepIdx ? 'var(--c4)' : 'var(--border)' }} />
            ))}
          </div>
        )}
        <p style={{ color: 'var(--c4)', fontSize: 12, fontWeight: 700, marginTop: 6 }}>
          ↑ Toque: 1º, 2º, 3º...
        </p>
      </div>

      {/* Selected sequence display */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 16, minHeight: 50, background: '#fff', borderRadius: 14, padding: '10px 12px', border: '1.5px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
        {selected.length === 0 && <span style={{ color: 'var(--text3)', fontSize: 13 }}>Toque nos itens na ordem certa...</span>}
        {selected.map((s, i) => (
          <span key={i} style={{ background: 'var(--c4)', color: '#fff', padding: '5px 12px', borderRadius: 'var(--radius-pill)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 13 }}>
            {i + 1}. {s}
          </span>
        ))}
      </div>

      {/* Options grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center' }}>
        {shuffled.map(item => {
          const usedIdx = selected.indexOf(item);
          const used = usedIdx !== -1;
          return (
            <button
              key={item}
              onPointerUp={() => handleTap(item)}
              disabled={used}
              style={{
                padding: '11px 16px', borderRadius: 14,
                border: `2px solid ${used ? 'var(--c4)' : 'var(--border)'}`,
                background: used ? '#EDE9FF' : '#fff',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
                color: used ? 'var(--c4)' : 'var(--text)',
                cursor: used ? 'default' : 'pointer',
                opacity: used ? 0.6 : 1, minHeight: 48,
                touchAction: 'manipulation',
              }}
            >
              {used ? `${usedIdx + 1}. ${item}` : item}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
