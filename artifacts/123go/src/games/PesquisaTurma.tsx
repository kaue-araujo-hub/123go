import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';

const CATEGORIES = [
  { name: 'Gato', emoji: '🐱', color: '#E91E63' },
  { name: 'Cachorro', emoji: '🐶', color: '#5B4FCF' },
  { name: 'Peixe', emoji: '🐠', color: '#00BCD4' },
  { name: 'Pássaro', emoji: '🦜', color: '#4CAF50' },
];

const CORRECT_CHART = CATEGORIES.map((c, i) => ({ ...c, votes: [5, 8, 3, 6][i] }));
const ERROR_CHART   = CATEGORIES.map((c, i) => ({ ...c, votes: [5, 3, 8, 6][i] }));

function BarChart({ data, label, error }: { data: typeof CORRECT_CHART; label: string; error?: boolean }) {
  const maxV = Math.max(...data.map(d => d.votes));
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: `2px solid ${error ? 'var(--c2)' : 'var(--border)'}`, padding: '14px 10px' }}>
      {error && (
        <div style={{ background: '#FFEBEE', borderRadius: 8, padding: '6px 10px', marginBottom: 10, textAlign: 'center' }}>
          <span style={{ color: 'var(--c2)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 12 }}>
            🚨 Este gráfico tem um erro! Os dados de Morango e Cachorro estão trocados!
          </span>
        </div>
      )}
      <p style={{ textAlign: 'center', fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, justifyContent: 'center' }}>
        {data.map((d, i) => {
          const h = Math.round((d.votes / maxV) * 100);
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 14, color: 'var(--text)' }}>{d.votes}</span>
              <div style={{ width: '100%', height: h, borderRadius: '6px 6px 0 0', background: d.color }} />
              <AppleEmoji emoji={d.emoji} size={22} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PHASES = [
  'vote',
  'readChart',
  'errorChart',
  'countQuestion',
  'publish',
];

export function PesquisaTurma() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const [votes, setVotes] = useState<number[]>([0, 0, 0, 0]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const phaseCompletedRef = useRef(false);
  const chartRef = useRef<{ destroy?: () => void }>({});
  const phaseKey = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAnswered(false);
    setFeedback(null);
    setChartVisible(false);
    if (phase === 1) setVotes([0, 0, 0, 0]);
    const timer = setTimeout(() => setChartVisible(true), 200);
    return () => {
      clearTimeout(timer);
      if (chartRef.current.destroy) { chartRef.current.destroy(); chartRef.current = {}; }
    };
  }, [phase]);

  const addVote = (catIdx: number) => {
    if (phaseCompletedRef.current) return;
    setVotes(prev => { const n = [...prev]; n[catIdx]++; return n; });
  };

  const canPublish = votes.every(v => v >= 1);
  const totalVotes = votes.reduce((a, b) => a + b, 0);

  const handleSimpleAdvance = () => {
    if (phaseCompletedRef.current) return;
    phaseCompletedRef.current = true;
    onCorrect();
    setTimeout(() => onPhaseComplete(), 400);
  };

  if (phaseComplete) {
    return (
      <GameShell title="Pesquisa da Turma" emoji="📊" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c2)" />
      </GameShell>
    );
  }

  // Phase 1: Voting
  if (phaseKey === 'vote') {
    return (
      <GameShell title="Pesquisa da Turma" emoji="📊" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>Qual é o animal favorito?</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Votos: {totalVotes} — Cada categoria precisa de ao menos 1 voto</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onPointerUp={() => addVote(i)}
              style={{
                padding: '14px 10px', borderRadius: 18,
                border: `2.5px solid ${votes[i] > 0 ? cat.color : 'var(--border)'}`,
                background: votes[i] > 0 ? `${cat.color}18` : '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer', minHeight: 88, transition: 'all 0.15s', touchAction: 'manipulation',
              }}
            >
              <AppleEmoji emoji={cat.emoji} size={44} />
              <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{cat.name}</span>
              <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 20, color: cat.color }}>
                {votes[i]} voto{votes[i] !== 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
        <button
          onPointerUp={handleSimpleAdvance}
          disabled={!canPublish}
          style={{
            width: '100%', padding: 14, borderRadius: 'var(--radius-pill)',
            background: canPublish ? 'var(--c2)' : 'var(--border)', color: '#fff',
            fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, border: 'none',
            cursor: canPublish ? 'pointer' : 'not-allowed', minHeight: 52, touchAction: 'manipulation',
            transition: 'background 0.2s',
          }}
        >
          {canPublish ? '✅ Ver gráfico →' : `Todos precisam de pelo menos 1 voto`}
        </button>
      </GameShell>
    );
  }

  // Phase 2: Read chart
  if (phaseKey === 'readChart') {
    const voteData = CATEGORIES.map((c, i) => ({ ...c, votes: votes[i] || CORRECT_CHART[i].votes }));
    const maxVotes = Math.max(...voteData.map(v => v.votes));
    const winner = voteData.find(v => v.votes === maxVotes);
    return (
      <GameShell title="Pesquisa da Turma" emoji="📊" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
            Veja o gráfico da turma!
          </h2>
        </div>
        {chartVisible && <BarChart data={voteData} label="Pesquisa: Animal Favorito" />}
        <div style={{ background: '#E8F5E9', borderRadius: 14, padding: '10px 16px', marginTop: 12, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: '#2E7D32', margin: 0 }}>
            🏆 Animal mais votado: <AppleEmoji emoji={winner?.emoji ?? '?'} size={20} /> {winner?.name}
          </p>
        </div>
        <button
          onPointerUp={handleSimpleAdvance}
          style={{ width: '100%', marginTop: 14, padding: 14, borderRadius: 'var(--radius-pill)', background: 'var(--c2)', color: '#fff', fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', minHeight: 52, touchAction: 'manipulation' }}
        >
          Próxima fase →
        </button>
      </GameShell>
    );
  }

  // Phase 3: Error chart (deliberate mistake)
  if (phaseKey === 'errorChart') {
    return (
      <GameShell title="Pesquisa da Turma" emoji="📊" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
            🔍 Encontre o erro no gráfico!
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Os dados estão incorretos. Você consegue ver o erro?</p>
        </div>
        {chartVisible && <BarChart data={ERROR_CHART} label="Gráfico com ERRO" error />}
        <button
          onPointerUp={handleSimpleAdvance}
          style={{ width: '100%', marginTop: 14, padding: 14, borderRadius: 'var(--radius-pill)', background: 'var(--c2)', color: '#fff', fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', minHeight: 52, touchAction: 'manipulation' }}
        >
          Entendi o erro! →
        </button>
      </GameShell>
    );
  }

  // Phase 4: Count question
  if (phaseKey === 'countQuestion') {
    const correctData = CORRECT_CHART;
    const maxV = Math.max(...correctData.map(d => d.votes));
    const winner = correctData.find(d => d.votes === maxV);
    const options = [winner?.votes ?? 8, (winner?.votes ?? 8) - 2, (winner?.votes ?? 8) + 1].sort(() => Math.random() - 0.5);
    return (
      <GameShell title="Pesquisa da Turma" emoji="📊" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <FeedbackOverlay type={feedback} />
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
            Quantos votos o Cachorro teve?
          </h2>
        </div>
        {chartVisible && <BarChart data={correctData} label="Dados da Pesquisa" />}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 16 }}>
          {options.map(val => (
            <button
              key={val}
              onPointerUp={() => {
                if (answered || phaseCompletedRef.current) return;
                const correct = val === (winner?.votes ?? 8);
                setFeedback(correct ? 'correct' : 'wrong');
                setAnswered(true);
                if (correct) {
                  phaseCompletedRef.current = true;
                  onCorrect();
                  setTimeout(() => { setFeedback(null); onPhaseComplete(); }, 1000);
                } else {
                  setTimeout(() => { setFeedback(null); setAnswered(false); }, 800);
                }
              }}
              style={{
                width: 86, height: 86, borderRadius: 20,
                border: '2.5px solid var(--border)', background: '#fff',
                fontFamily: 'Nunito', fontWeight: 900, fontSize: 42, color: 'var(--text)',
                cursor: 'pointer', minHeight: 86, touchAction: 'manipulation',
              }}
            >
              {val}
            </button>
          ))}
        </div>
      </GameShell>
    );
  }

  // Phase 5: Publish (all categories need ≥1 vote)
  const publishData = votes.some(v => v === 0) ? CORRECT_CHART : CATEGORIES.map((c, i) => ({ ...c, votes: votes[i] }));
  const canPublishFinal = publishData.every(d => d.votes >= 1);

  return (
    <GameShell title="Pesquisa da Turma" emoji="📊" color="var(--c2)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>
          📢 Publique a pesquisa da turma!
        </h2>
        {!canPublishFinal && (
          <p style={{ color: 'var(--c2)', fontSize: 13, fontWeight: 700 }}>
            ⚠️ Todos os animais precisam de ao menos 1 voto para publicar!
          </p>
        )}
      </div>
      {chartVisible && <BarChart data={publishData} label="Resultado Final da Turma" />}
      <button
        onPointerUp={() => {
          if (!phaseCompletedRef.current && canPublishFinal) {
            phaseCompletedRef.current = true;
            onCorrect();
            setTimeout(() => onPhaseComplete(), 400);
          }
        }}
        disabled={!canPublishFinal}
        style={{
          width: '100%', marginTop: 14, padding: 14, borderRadius: 'var(--radius-pill)',
          background: canPublishFinal ? 'var(--c2)' : 'var(--border)', color: '#fff',
          fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, border: 'none',
          cursor: canPublishFinal ? 'pointer' : 'not-allowed',
          minHeight: 52, touchAction: 'manipulation', transition: 'background 0.2s',
        }}
      >
        {canPublishFinal ? '🚀 Publicar pesquisa!' : '🔒 Precisa de mais votos'}
      </button>
    </GameShell>
  );
}
