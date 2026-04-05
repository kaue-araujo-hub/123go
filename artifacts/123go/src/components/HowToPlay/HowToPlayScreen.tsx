import { useState, useEffect } from 'react';
import { Game } from '../../data/games';
import { TUTORIALS, InteractionType } from '../../data/tutorials';
import { SessionManager } from '../../auth/SessionManager';
import { MiniChallenge } from './MiniChallenge';
import { InteractionPreview } from './InteractionPreview';
import { ModeBadge } from '../ModeBadge';
import styles from './HowToPlayScreen.module.css';

type Step = 'preview' | 'challenge1' | 'challenge2' | 'ready';

const STEPS: Step[] = ['preview', 'challenge1', 'challenge2', 'ready'];

interface Props {
  game:   Game;
  onPlay: () => void;
  onBack: () => void;
}

export function HowToPlayScreen({ game, onPlay, onBack }: Props) {
  const tutorial  = TUTORIALS[game.interactionType as InteractionType];
  const isTeacher = SessionManager.isTeacher();

  const hasSeenKey = `123go_tutorial_${game.id}`;
  const hasSeen    = localStorage.getItem(hasSeenKey) === 'true';

  // Teachers and returning students who've already seen tutorial start at 'ready'
  const initialStep: Step = (isTeacher || hasSeen) ? 'ready' : 'preview';
  const [step, setStep]         = useState<Step>(initialStep);
  const [showFull, setShowFull] = useState(!hasSeen && !isTeacher);

  useEffect(() => {
    if (isTeacher) setStep('ready');
  }, [isTeacher]);

  function handleChallengeComplete(index: number) {
    if (index === 0) setStep('challenge2');
    else             setStep('ready');
  }

  function handlePlay() {
    localStorage.setItem(hasSeenKey, 'true');
    onPlay();
  }

  const cssVars = {
    '--game-color': game.tutorialTheme.color,
    '--game-bg':    game.tutorialTheme.bg,
  } as React.CSSProperties;

  const stepIndex = STEPS.indexOf(step);

  // ─── Tela simplificada (já viu antes, não professor) ─────────────────────
  if (!showFull && hasSeen && !isTeacher) {
    return (
      <div
        className={styles.readyScreen}
        style={cssVars}
      >
        <div className={styles.gameCard}>
          <span className={styles.gameEmoji} aria-hidden="true">{game.emoji}</span>
          <h1 className={styles.gameTitle}>{game.title}</h1>
          <ModeBadge />
        </div>

        <button className={styles.btnPlay} onClick={handlePlay} aria-label="Jogar agora">
          Jogar agora
          <span className={styles.btnArrow} aria-hidden="true">▶</span>
        </button>

        <button
          className={styles.btnReview}
          onClick={() => { setShowFull(true); setStep('preview'); }}
          aria-label="Rever como jogar"
        >
          Rever como jogar
        </button>

        <button className={styles.btnBack} onClick={onBack} aria-label="Voltar ao catálogo">
          ← Voltar
        </button>
      </div>
    );
  }

  // ─── Fluxo completo ───────────────────────────────────────────────────────
  return (
    <div className={styles.screen} style={cssVars}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.btnBack} onClick={onBack} aria-label="Voltar ao catálogo">
          ← Voltar
        </button>
        <h1 className={styles.heading}>
          {isTeacher ? `${game.emoji} ${game.title}` : 'Como Jogar'}
        </h1>
        {isTeacher && (
          <button className={styles.btnSkip} onClick={handlePlay} aria-label="Pular tutorial">
            Pular →
          </button>
        )}
        {!isTeacher && step !== 'ready' && (
          <button className={styles.btnSkip} onClick={() => setStep('ready')} aria-label="Ir direto para jogar">
            Pular →
          </button>
        )}
      </header>

      {/* Barra de progresso */}
      {!isTeacher && (
        <div className={styles.progressBar} role="progressbar" aria-label={`Etapa ${stepIndex + 1} de ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`${styles.progressDot} ${i <= stepIndex ? styles.progressDotActive : ''}`}
            />
          ))}
        </div>
      )}

      {/* Conteúdo por etapa */}
      <div className={styles.content}>
        {step === 'preview' && tutorial && (
          <InteractionPreview
            tutorial={tutorial}
            gameEmoji={game.emoji}
            color={game.tutorialTheme.color}
            bg={game.tutorialTheme.bg}
            onReady={() => setStep('challenge1')}
          />
        )}

        {step === 'challenge1' && tutorial && (
          <MiniChallenge
            challenge={tutorial.challenges[0]}
            gameTheme={game.tutorialTheme}
            onComplete={() => handleChallengeComplete(0)}
          />
        )}

        {step === 'challenge2' && tutorial && (
          <MiniChallenge
            challenge={tutorial.challenges[1]}
            gameTheme={game.tutorialTheme}
            onComplete={() => handleChallengeComplete(1)}
          />
        )}

        {step === 'ready' && (
          <div className={styles.readyContent}>
            <span className={styles.readyEmoji} aria-hidden="true">{game.emoji}</span>
            <h2 className={styles.readyTitle}>
              {isTeacher ? 'Tudo pronto!' : 'Você aprendeu!'}
            </h2>
            <p className={styles.readySub}>
              {isTeacher
                ? `Inicie o ${game.title} para a turma.`
                : `Agora é hora de jogar o ${game.title}!`
              }
            </p>
            <ModeBadge />
          </div>
        )}
      </div>

      {/* Footer — botão Jogar! apenas na etapa "ready" */}
      {step === 'ready' && (
        <div className={styles.footer}>
          <button
            className={styles.btnPlay}
            onClick={handlePlay}
            aria-label={`Jogar ${game.title}`}
          >
            Jogar!
            <span className={styles.btnArrow} aria-hidden="true">▶</span>
          </button>
        </div>
      )}
    </div>
  );
}
