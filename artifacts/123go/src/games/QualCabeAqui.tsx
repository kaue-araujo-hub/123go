import React, { useState, useEffect, useRef } from 'react';
import { GameShell, useGameEngine, FeedbackOverlay, PhaseCompleteCard } from '../engine/GameEngine';
import { AppleEmoji } from '../utils/AppleEmoji';
import { useIsDesktop } from '../hooks/useIsDesktop';

/* ── Fases ───────────────────────────────────────────────────────────────────── */
type Tam = 'pequeno' | 'medio' | 'grande';
interface Opcao { item: string; tam: Tam; }
interface Phase  { buraco: Tam; opcoes: Opcao[]; dica: boolean; }

const PHASES: Phase[] = [
  { buraco: 'grande',  opcoes: [{ item:'📦',  tam:'grande'  }, { item:'📫',  tam:'pequeno' }],                                 dica: true  },
  { buraco: 'pequeno', opcoes: [{ item:'🪨',  tam:'pequeno' }, { item:'🗿',  tam:'grande'  }],                                 dica: true  },
  { buraco: 'grande',  opcoes: [{ item:'🛁',  tam:'grande'  }, { item:'🧸',  tam:'pequeno' }, { item:'🪑', tam:'medio' }],      dica: false },
  { buraco: 'pequeno', opcoes: [{ item:'🪄',  tam:'pequeno' }, { item:'🚪',  tam:'grande'  }, { item:'🛋️', tam:'grande' }],    dica: false },
  { buraco: 'medio',   opcoes: [{ item:'💼',  tam:'medio'   }, { item:'🛻',  tam:'grande'  }, { item:'🪬', tam:'pequeno' }],   dica: false },
];

const HOLE_SIZES: Record<Tam, number> = { pequeno: 80, medio: 120, grande: 160 };
const OBJ_SIZES:  Record<Tam, number> = { pequeno: 40, medio: 60,  grande: 80  };

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QualCabeAqui() {
  const { phase, score, phaseComplete, gameComplete, onCorrect, onPhaseComplete, nextPhase, restart } = useGameEngine(5);
  const isDesktop = useIsDesktop();

  const [feedback,   setFeedback]   = useState<'correct' | 'wrong' | null>(null);
  const [acertos,    setAcertos]    = useState(0);
  const [opcoes,     setOpcoes]     = useState<Opcao[]>([]);
  const [enterObj,   setEnterObj]   = useState<string | null>(null);
  const [wrongObj,   setWrongObj]   = useState<string | null>(null);
  const phaseCompletedRef = useRef(false);

  const phaseData = PHASES[phase - 1];

  useEffect(() => {
    phaseCompletedRef.current = false;
    setAcertos(0);
    setFeedback(null);
    setEnterObj(null);
    setWrongObj(null);
    setOpcoes(shuffleArr(phaseData.opcoes));
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTap(opcao: Opcao) {
    if (feedback || enterObj) return;

    if (opcao.tam === phaseData.buraco) {
      setEnterObj(opcao.item);
      setFeedback('correct');
      onCorrect();
      const next = acertos + 1;
      setTimeout(() => {
        setEnterObj(null);
        setFeedback(null);
        const newAcertos = next;
        setAcertos(newAcertos);
        if (newAcertos >= 3 && !phaseCompletedRef.current) {
          phaseCompletedRef.current = true;
          onPhaseComplete();
        } else {
          setOpcoes(shuffleArr(phaseData.opcoes));
        }
      }, 900);
    } else {
      setWrongObj(opcao.item);
      setFeedback('wrong');
      setTimeout(() => { setWrongObj(null); setFeedback(null); }, 600);
    }
  }

  const rHoleSizes = isDesktop ? { pequeno: 56, medio: 84, grande: 112 } : HOLE_SIZES;
  const rObjSizes  = isDesktop ? { pequeno: 28, medio: 42, grande: 56  } : OBJ_SIZES;
  const holeSize = rHoleSizes[phaseData.buraco];
  const tamLabel: Record<Tam, string> = { pequeno: 'PEQUENO', medio: 'MÉDIO', grande: 'GRANDE' };

  if (phaseComplete) {
    return (
      <GameShell title="Qual Cabe Aqui?" emoji="📦" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
        <PhaseCompleteCard phase={phase} totalPhases={5} score={score} isGameComplete={gameComplete} onNext={nextPhase} onRestart={restart} color="var(--c5)" />
      </GameShell>
    );
  }

  return (
    <GameShell title="Qual Cabe Aqui?" emoji="📦" color="var(--c5)" currentPhase={phase} totalPhases={5} score={score} onRestart={restart}>
      <FeedbackOverlay type={feedback} />

      {/* Progresso */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: '50%',
            background: i < acertos ? 'var(--c5)' : 'var(--border)',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>

      <p style={{
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 17,
        color: 'var(--text)', textAlign: 'center', marginBottom: 20,
      }}>
        Qual objeto cabe no espaço <strong style={{ color: '#5B4FCF' }}>{tamLabel[phaseData.buraco]}</strong>?
      </p>

      {/* Buraco */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div style={{
          width: holeSize, height: holeSize,
          border: `4px dashed ${feedback === 'correct' ? '#4CAF50' : feedback === 'wrong' ? '#F44336' : '#5B4FCF'}`,
          borderRadius: holeSize * 0.2,
          background: feedback === 'correct' ? '#E8F5E9' : '#F7F8FC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s, background 0.2s',
          animation: 'holeBreath 2s ease-in-out infinite',
          position: 'relative', overflow: 'hidden',
        }}>
          {enterObj && (
            <span style={{
              fontSize: rObjSizes[phaseData.buraco],
              animation: 'objEnter 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
            }}>
              {enterObj}
            </span>
          )}
          {!enterObj && (
            <span style={{ fontSize: 18, color: '#B0B7C3' }}>?</span>
          )}
        </div>
      </div>

      {/* Opções */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {opcoes.map(opcao => {
          const isWrong   = wrongObj === opcao.item;
          const isCorrect = enterObj === opcao.item;
          const sz = rObjSizes[opcao.tam];
          return (
            <button
              key={opcao.item}
              onPointerUp={() => handleTap(opcao)}
              style={{
                minWidth: isDesktop ? 60 : 88, minHeight: isDesktop ? 60 : 88, borderRadius: isDesktop ? 14 : 20,
                background: '#fff', border: '2px solid var(--border)',
                cursor: 'pointer', touchAction: 'manipulation', userSelect: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isCorrect ? 0 : 1,
                transform: isWrong ? 'translateX(0)' : 'scale(1)',
                animation: isWrong ? 'btnShake 0.4s ease' : undefined,
                transition: 'opacity 0.2s, transform 0.12s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <span style={{ fontSize: sz }}>{opcao.item}</span>
            </button>
          );
        })}
      </div>

      {phaseData.dica && (
        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 16 }}>
          💡 Toque no objeto do tamanho certo!
        </p>
      )}

      <style>{`
        @keyframes holeBreath {
          0%, 100% { transform: scale(1) translateZ(0); }
          50%      { transform: scale(1.04) translateZ(0); }
        }
        @keyframes objEnter {
          from { transform: scale(2) translateZ(0); opacity: 0; }
          to   { transform: scale(1) translateZ(0); opacity: 1; }
        }
        @keyframes btnShake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </GameShell>
  );
}
