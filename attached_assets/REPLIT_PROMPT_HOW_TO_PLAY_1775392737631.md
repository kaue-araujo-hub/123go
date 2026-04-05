# PROMPT PARA O REPLIT — FLUXO "COMO JOGAR" + COUNTDOWN
## Plataforma 123GO! · Workflow de Entrada nos 21 Jogos

---

## POR QUE O PROMPT ORIGINAL PRECISAVA DE AJUSTES

O prompt anterior tinha 7 gaps críticos para este projeto:

1. **`interactionType` como campo solto** — não integrava com o `games.js` já existente
   nem com o `InteractionTypes.js` já implementado na engine. Campo novo precisa entrar
   no data model dos 21 jogos.

2. **`startGame({ gameId, mode })` fictício** — conflita com o `GameShell.jsx` e o
   `SessionManager` já existentes. O fluxo real usa `modeConfig` do `ModeConfig.js`
   e o `TimerSystem` do `useTimer.js`.

3. **`currentScreen` como variável solta** — quebra em React. O roteamento entre
   catálogo → HowToPlay → countdown → jogo precisa usar o `useState` do `GameShell`
   ou o React Router já implícito na arquitetura SPA.

4. **Mini desafios sem CSS especificado** — o prompt dizia "arrastar objeto até alvo"
   sem definir animações, integração com `InteractionTypes.js`, nem as regras
   GPU-only já estabelecidas (só `transform` e `opacity`).

5. **`hasSeenTutorial` sem integração com `TimerStore`** — a persistência já usa
   `localStorage` com chave `123go_timer_data`. O tutorial precisa usar o mesmo
   padrão de namespace e o `SessionManager` para distinguir professor (pular sempre)
   de aluno (pular após a primeira vez).

6. **Countdown `1→2→3→GO!` sem CSS** — animação de entrada crítica para o engajamento
   infantil, sem nenhuma especificação visual nem integração com o `AudioManager.js`
   já existente para os sons de contagem.

7. **Sem mapeamento dos 21 jogos** — cada jogo tem `interactionType` diferente; o
   prompt precisava mapear todos os jogos para seus tipos de interação e mini desafios
   correspondentes.

---

## CONTEXTO DA PLATAFORMA — O QUE JÁ EXISTE

```
src/
├── data/games.js              ← array dos 21 jogos — ADICIONAR campos novos
├── engine/
│   ├── GameEngine.js          ← motor base — INTEGRAR fluxo de entrada
│   ├── AudioManager.js        ← Howler + Tone.js — USAR no countdown
│   ├── InteractionTypes.js    ← drag, tap, swipe, hold, gesture, rhythm
│   ├── ModeConfig.js          ← config por modalidade (prática/desafio/tempo)
│   ├── TimerSystem.js         ← cronômetro crescente por fase
│   └── TimerStore.js          ← localStorage: tempos + hasSeenTutorial
├── auth/
│   └── SessionManager.js      ← perfil professor/aluno, PIN, sessão de aula
├── hooks/
│   ├── useTimer.js            ← hook do timer
│   └── useGameMode.js         ← hook da modalidade ativa
└── components/
    ├── GameShell.jsx           ← wrapper dos jogos — INTEGRAR aqui o fluxo
    ├── ModeBadge.jsx           ← badge de modalidade no jogo
    └── TimerDisplay.jsx        ← display do timer
```

**Novos arquivos a criar neste prompt:**
```
src/
├── components/
│   ├── HowToPlay/
│   │   ├── HowToPlayScreen.jsx         ← tela principal "Como Jogar"
│   │   ├── HowToPlayScreen.module.css
│   │   ├── MiniChallenge.jsx           ← mini desafio interativo
│   │   ├── MiniChallenge.module.css
│   │   ├── InteractionPreview.jsx      ← demonstração animada da interação
│   │   └── InteractionPreview.module.css
│   └── StartCountdown/
│       ├── StartCountdown.jsx          ← animação 1→2→3→GO!
│       └── StartCountdown.module.css
└── data/
    └── tutorials.js                    ← mini desafios por interactionType
```

---

## PASSO 1 — ATUALIZAR `src/data/games.js`

Adicionar dois campos novos em CADA um dos 21 jogos:

```js
// Campos novos a adicionar em cada objeto do array GAMES
{
  // ... campos já existentes (id, title, desc, emoji, bg, ano, periodo, tema, etc.)

  // NOVO — tipo principal de interação (define os mini desafios do tutorial)
  interactionType: "drag",
  // Valores válidos: "drag" | "tap" | "hold" | "swipe" | "gesture" | "rhythm"

  // NOVO — personagem/tema do tutorial (mantém consistência visual com o jogo)
  tutorialTheme: {
    bg:    "#EAF3DE",   // mesma cor do card
    emoji: "🐛",        // mesmo emoji do card
    color: "#4CAF50"    // cor de destaque do tema
  }
}
```

**Mapeamento completo de `interactionType` para os 21 jogos:**

```js
// g01 — Festa da Lagarta       → "drag"     (arrastar folhas para a boca)
// g02 — Par ou Ímpar?          → "tap"      (tocar no elemento solitário)
// g03 — Caça Estrelas          → "tap"      (tocar no número correto em tempo)
// g04 — Loja de Balas          → "tap"      (tocar no pote correto)
// g05 — Rã Puladora            → "swipe"    (deslizar a rã para a lagoa)
// g06 — Balões da Festa        → "tap"      (tocar para estourar)
// g07 — Trem dos Números       → "drag"     (arrastar número para o vagão)
// g08 — Pizzaria Mágica        → "drag"     (arrastar fatias para o prato)
// g09 — Batalha de Constelações→ "gesture"  (desenhar + ou – na tela)
// g10 — Ateliê da Ordem        → "drag"     (arrastar objetos para gavetas)
// g11 — Jardim de Padrões      → "drag"     (arrastar flor para o vaso)
// g12 — Nave Organizadora      → "drag"     (arrastar alien para compartimento)
// g13 — Robô Perdido           → "tap"      (tocar setas direcionais)
// g14 — Esconde-esconde Animal → "tap"      (tocar na região correta)
// g15 — Castelo das Posições   → "drag"     (arrastar cavaleiro)
// g16 — Sol, Lua e Estrelas    → "swipe"    (deslizar o sol pelo arco)
// g17 — Calendário Vivo        → "drag"     (arrastar dias da semana)
// g18 — Máquina do Tempo       → "tap"      (tocar em sequência ordenada)
// g19 — Sorveteria dos Dados   → "tap"      (tocar na barra do gráfico)
// g20 — Zoo de Tabelas         → "tap"      (tocar na linha da tabela)
// g21 — Pesquisa da Turma      → "tap"      (tocar em avatares para votar)
```

---

## PASSO 2 — CRIAR `src/data/tutorials.js`

Define os mini desafios por tipo de interação. Cada tipo tem exatamente **2 mini desafios**:
rápidos, sem falha crítica, com feedback positivo imediato.

```js
/**
 * tutorials.js
 * Define os 2 mini desafios de cada tipo de interação.
 * Reutilizado por todos os 21 jogos — nenhum jogo define seu próprio tutorial.
 */

export const TUTORIALS = {

  drag: {
    title:       "Arrastar",
    icon:        "👆",
    description: "Toque e arraste para o lugar certo",
    challenges: [
      {
        id:          "drag-1",
        instruction: "Arraste a estrela até o cesto!",
        emoji:       "⭐",
        targetEmoji: "🧺",
        hint:        "Toque na estrela e arraste sem soltar",
        // Mecânica: elemento fonte + zona de drop simples (hitbox 80px)
        // Sucesso: elemento encaixa com successBounce, partículas verdes
        // Sem falha: se soltar fora, volta suavemente com flyBack
      },
      {
        id:          "drag-2",
        instruction: "Agora arraste a maçã para a caixa!",
        emoji:       "🍎",
        targetEmoji: "📦",
        hint:        "Você consegue!",
        // Mesma mecânica — reforça o aprendizado
      }
    ]
  },

  tap: {
    title:       "Tocar",
    icon:        "👇",
    description: "Toque rápido no elemento certo",
    challenges: [
      {
        id:          "tap-1",
        instruction: "Toque na bolinha amarela!",
        // 3 bolinhas coloridas aparecem; criança toca na amarela
        // Errou: shake suave + continua (sem punição)
        // Acertou: successBounce + partículas
        hint:        "Qual é a amarela?",
      },
      {
        id:          "tap-2",
        instruction: "Toque 3 vezes no sol!",
        emoji:       "☀️",
        targetCount: 3,
        // Contador visual: ○ ○ ○ → ● ● ●
        // Cada toque: micro-bounce + som de tick
        // Ao completar 3: celebração
        hint:        "Toque, toque, toque!",
      }
    ]
  },

  swipe: {
    title:       "Deslizar",
    icon:        "👋",
    description: "Deslize o dedo na direção certa",
    challenges: [
      {
        id:          "swipe-1",
        instruction: "Deslize a nuvem para a direita!",
        emoji:       "☁️",
        direction:   "right",
        // Seta animada mostra a direção esperada (pisca 2x então some)
        // Criança desliza; nuvem se move com o dedo
        // Sucesso: nuvem continua voando para fora com trilha
        hint:        "Para lá →",
      },
      {
        id:          "swipe-2",
        instruction: "Agora deslize para baixo!",
        emoji:       "🌧️",
        direction:   "down",
        hint:        "Para baixo ↓",
      }
    ]
  },

  hold: {
    title:       "Segurar",
    icon:        "✊",
    description: "Toque e segure até completar",
    challenges: [
      {
        id:           "hold-1",
        instruction:  "Segure o botão até encher a barra!",
        holdDuration: 2000, // ms
        // Barra de progresso circular cresce enquanto segura
        // Soltar antes: barra esvazia suavemente (sem punição)
        // Completar: explosão de confete
        hint:         "Não solta!",
      },
      {
        id:           "hold-2",
        instruction:  "Segure a lâmpada para acendê-la!",
        emoji:        "💡",
        holdDuration: 1500,
        // Emoji muda de 💡 (apagada) para ✨ (acesa) ao completar
        hint:         "Quase lá!",
      }
    ]
  },

  gesture: {
    title:       "Desenhar",
    icon:        "✏️",
    description: "Desenhe o símbolo com o dedo",
    challenges: [
      {
        id:          "gesture-1",
        instruction: "Desenhe uma linha reta de cima para baixo!",
        shape:       "vertical-line",
        // Canvas mostra rastro do dedo em tempo real (cor da paleta do jogo)
        // Ao terminar: algoritmo simples verifica direção dominante (vertical)
        // Sem precisão exigida — qualquer linha aproximada aceita
        hint:         "Como uma chuva ↓",
      },
      {
        id:          "gesture-2",
        instruction: "Agora desenhe uma linha de um lado para o outro!",
        shape:       "horizontal-line",
        hint:         "Como um rabisco →",
      }
    ]
  },

  rhythm: {
    title:       "No Ritmo",
    icon:        "🎵",
    description: "Toque no momento certo",
    challenges: [
      {
        id:          "rhythm-1",
        instruction: "Toque quando a estrela piscar!",
        // Estrela pulsa com animação rhythmPulse (já definida no CSS avançado)
        // BPM: 60 (1 batida por segundo — bem lento para crianças)
        // Janela de acerto: ±300ms (bem generosa)
        // Acertou: ⭐ explode em estrelinhas
        hint:         "Espere piscar!",
      },
      {
        id:          "rhythm-2",
        instruction: "Toque 2 vezes no ritmo!",
        targetTaps:  2,
        hint:         "Pum... pum!",
      }
    ]
  }
}
```

---

## PASSO 3 — CRIAR `src/components/HowToPlay/HowToPlayScreen.jsx`

```jsx
/**
 * HowToPlayScreen.jsx
 * Tela intermediária entre catálogo e jogo.
 * Aparece SEMPRE na primeira vez; pode ser pulada depois (alunos).
 * Professores pulam automaticamente (definido no SessionManager).
 */

import { useState, useEffect }      from 'react'
import { SessionManager }           from '../../auth/SessionManager'
import { TUTORIALS }                from '../../data/tutorials'
import { MiniChallenge }            from './MiniChallenge'
import { InteractionPreview }       from './InteractionPreview'
import { ModeBadge }                from '../ModeBadge'
import styles                       from './HowToPlayScreen.module.css'

/**
 * @param {object}   props
 * @param {object}   props.game          — objeto completo do jogo (do games.js)
 * @param {function} props.onPlay        — callback: inicia countdown → jogo
 * @param {function} props.onBack        — callback: volta ao catálogo
 */
export function HowToPlayScreen({ game, onPlay, onBack }) {
  const tutorial        = TUTORIALS[game.interactionType]
  const [step, setStep] = useState('preview')
  // 'preview'    → demonstração animada da interação
  // 'challenge1' → primeiro mini desafio
  // 'challenge2' → segundo mini desafio
  // 'ready'      → tela de "Pronto para jogar!"

  const isTeacher       = SessionManager.isTeacher()

  // Professor pula direto para 'ready'
  useEffect(() => {
    if (isTeacher) setStep('ready')
  }, [isTeacher])

  // Verificar se aluno já viu este tutorial
  const hasSeenKey = `123go_tutorial_${game.id}`
  const hasSeen    = localStorage.getItem(hasSeenKey) === 'true'

  // Aluno que já viu: mostra apenas tela 'ready' com opção de rever
  const [showFull, setShowFull] = useState(!hasSeen)

  function handleChallengeComplete(challengeIndex) {
    if (challengeIndex === 0) setStep('challenge2')
    else                       setStep('ready')
  }

  function handlePlay() {
    // Marcar como visto
    localStorage.setItem(hasSeenKey, 'true')
    onPlay()  // GameShell inicia o countdown
  }

  // ─── Tela simplificada (já viu antes) ────────────────────────────────────
  if (!showFull && hasSeen && !isTeacher) {
    return (
      <div className={styles.readyScreen}>
        <div className={styles.gameCard}>
          <span className={styles.gameEmoji}>{game.emoji}</span>
          <h1 className={styles.gameTitle}>{game.title}</h1>
          <ModeBadge />
        </div>

        <button className={styles.btnPlay} onClick={handlePlay} aria-label="Jogar agora">
          Jogar agora
          <span className={styles.btnArrow} aria-hidden="true">▶</span>
        </button>

        <button
          className={styles.btnReview}
          onClick={() => setShowFull(true)}
          aria-label="Rever como jogar"
        >
          Rever como jogar
        </button>

        <button className={styles.btnBack} onClick={onBack} aria-label="Voltar ao catálogo">
          ← Voltar
        </button>
      </div>
    )
  }

  // ─── Fluxo completo ───────────────────────────────────────────────────────
  return (
    <div
      className={styles.screen}
      style={{ '--game-color': game.tutorialTheme.color, '--game-bg': game.tutorialTheme.bg }}
    >
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.btnBack} onClick={onBack} aria-label="Voltar ao catálogo">
          ← Voltar
        </button>
        <h1 className={styles.heading}>Como Jogar</h1>
        {/* Professor pode pular para jogar imediatamente */}
        {isTeacher && (
          <button className={styles.btnSkip} onClick={handlePlay}>
            Pular →
          </button>
        )}
      </header>

      {/* Barra de progresso do tutorial */}
      <div className={styles.progressBar} role="progressbar" aria-label="Progresso do tutorial">
        {['preview', 'challenge1', 'challenge2', 'ready'].map((s, i) => (
          <div
            key={s}
            className={`${styles.progressDot} ${
              ['preview','challenge1','challenge2','ready'].indexOf(step) >= i
                ? styles.progressDotActive : ''
            }`}
          />
        ))}
      </div>

      {/* Conteúdo por etapa */}
      <div className={styles.content}>

        {step === 'preview' && (
          <InteractionPreview
            tutorial={tutorial}
            gameEmoji={game.emoji}
            onReady={() => setStep('challenge1')}
          />
        )}

        {step === 'challenge1' && (
          <MiniChallenge
            challenge={tutorial.challenges[0]}
            gameTheme={game.tutorialTheme}
            index={0}
            onComplete={() => handleChallengeComplete(0)}
          />
        )}

        {step === 'challenge2' && (
          <MiniChallenge
            challenge={tutorial.challenges[1]}
            gameTheme={game.tutorialTheme}
            index={1}
            onComplete={() => handleChallengeComplete(1)}
          />
        )}

        {step === 'ready' && (
          <div className={styles.readyContent}>
            <span className={styles.readyEmoji} aria-hidden="true">
              {game.emoji}
            </span>
            <h2 className={styles.readyTitle}>
              {isTeacher ? 'Tudo pronto!' : 'Você aprendeu!'}
            </h2>
            <p className={styles.readySub}>
              {isTeacher
                ? `Configure a turma e inicie o ${game.title}.`
                : `Agora é hora de jogar o ${game.title}!`
              }
            </p>
            <ModeBadge />
          </div>
        )}
      </div>

      {/* Footer com botão principal */}
      {(step === 'ready') && (
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
  )
}
```

---

## PASSO 4 — CRIAR `src/components/HowToPlay/MiniChallenge.jsx`

```jsx
/**
 * MiniChallenge.jsx
 * Executa um mini desafio interativo usando InteractionTypes.js da engine.
 * Sem falha crítica — qualquer tentativa é positivamente reforçada.
 */

import { useState, useRef }       from 'react'
import { useDrag }                from '../../hooks/useSwipe'
import { useTap }                 from '../../hooks/useTap'
import { audio }                  from '../../engine/AudioSystem'
import { ParticlesBurst }         from '../ParticlesBurst'
import styles                     from './MiniChallenge.module.css'

export function MiniChallenge({ challenge, gameTheme, index, onComplete }) {
  const [completed, setCompleted]   = useState(false)
  const [attempts,  setAttempts]    = useState(0)
  const [showHint,  setShowHint]    = useState(false)
  const [particles, setParticles]   = useState(false)
  const sourceRef = useRef(null)
  const targetRef = useRef(null)

  // Mostrar dica após 2 tentativas sem sucesso
  function recordAttempt() {
    const next = attempts + 1
    setAttempts(next)
    if (next >= 2) setShowHint(true)
  }

  function handleSuccess() {
    if (completed) return
    setCompleted(true)
    setParticles(true)
    audio.success()
    // Avança para o próximo desafio após 1.2s (tempo de celebrar)
    setTimeout(() => {
      setParticles(false)
      onComplete()
    }, 1200)
  }

  // ─── Drag challenge ───────────────────────────────────────────────────────
  if (challenge.id.startsWith('drag')) {
    return (
      <DragChallenge
        challenge={challenge}
        gameTheme={gameTheme}
        onSuccess={handleSuccess}
        onMiss={recordAttempt}
        showHint={showHint}
        completed={completed}
        particles={particles}
      />
    )
  }

  // ─── Tap challenge ────────────────────────────────────────────────────────
  if (challenge.id.startsWith('tap')) {
    return (
      <TapChallenge
        challenge={challenge}
        gameTheme={gameTheme}
        onSuccess={handleSuccess}
        onMiss={recordAttempt}
        showHint={showHint}
        completed={completed}
        particles={particles}
      />
    )
  }

  // ─── Swipe challenge ──────────────────────────────────────────────────────
  if (challenge.id.startsWith('swipe')) {
    return (
      <SwipeChallenge
        challenge={challenge}
        gameTheme={gameTheme}
        onSuccess={handleSuccess}
        onMiss={recordAttempt}
        showHint={showHint}
        completed={completed}
        particles={particles}
      />
    )
  }

  // ─── Hold challenge ───────────────────────────────────────────────────────
  if (challenge.id.startsWith('hold')) {
    return (
      <HoldChallenge
        challenge={challenge}
        gameTheme={gameTheme}
        onSuccess={handleSuccess}
        showHint={showHint}
        completed={completed}
        particles={particles}
      />
    )
  }

  // ─── Gesture challenge ────────────────────────────────────────────────────
  if (challenge.id.startsWith('gesture')) {
    return (
      <GestureChallenge
        challenge={challenge}
        gameTheme={gameTheme}
        onSuccess={handleSuccess}
        onMiss={recordAttempt}
        showHint={showHint}
        completed={completed}
        particles={particles}
      />
    )
  }

  return null
}

// ─── Sub-componentes dos desafios ─────────────────────────────────────────────

function DragChallenge({ challenge, gameTheme, onSuccess, onMiss, showHint, completed, particles }) {
  const [dragging,    setDragging]   = useState(false)
  const [pos,         setPos]        = useState({ x: 0, y: 0 })
  const [snapped,     setSnapped]    = useState(false)
  const targetCenter = useRef({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const dragRef = useDrag({
    onDragStart: () => { setDragging(true); audio.dragStart?.() },
    onDragMove:  ({ dx, dy }) => setPos({ x: dx, y: dy }),
    onDragEnd:   ({ x, y }) => {
      setDragging(false)
      // Hitbox: 80px ao redor do centro do alvo
      const tc = targetCenter.current
      if (Math.abs(x - tc.x) < 80 && Math.abs(y - tc.y) < 80) {
        setSnapped(true)
        onSuccess()
      } else {
        setPos({ x: 0, y: 0 }) // retorna suavemente
        onMiss()
      }
    }
  })

  return (
    <div className={styles.dragArena} ref={containerRef}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      {/* Zona de destino */}
      <div
        className={`${styles.dropZone} ${snapped ? styles.dropZoneSuccess : ''}`}
        ref={el => {
          if (el) {
            const r = el.getBoundingClientRect()
            targetCenter.current = { x: r.left + r.width/2, y: r.top + r.height/2 }
          }
        }}
        aria-label="Zona de destino"
      >
        <span className={styles.targetEmoji} aria-hidden="true">{challenge.targetEmoji}</span>
      </div>

      {/* Elemento arrastável */}
      {!snapped && (
        <div
          ref={dragRef}
          className={`${styles.draggable} ${dragging ? styles.dragging : ''}`}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) translateZ(0)` }}
          aria-label={`Arraste ${challenge.emoji}`}
          role="button"
          tabIndex={0}
        >
          <span aria-hidden="true">{challenge.emoji}</span>
        </div>
      )}

      {/* Dica animada após 2 tentativas */}
      {showHint && !completed && (
        <p className={styles.hint} role="status">{challenge.hint}</p>
      )}

      {/* Partículas de sucesso */}
      {particles && <ParticlesBurst count={12} color={gameTheme.color} />}
    </div>
  )
}

function TapChallenge({ challenge, gameTheme, onSuccess, onMiss, showHint, completed, particles }) {
  const [tapCount,  setTapCount]  = useState(0)
  const [wrongTap,  setWrongTap]  = useState(false)
  const target = challenge.targetCount ?? 1

  // Para tap-1: 3 alvos coloridos, toca no correto
  // Para tap-2: contador de toques até target

  function handleTap(isCorrect) {
    if (isCorrect) {
      const next = tapCount + 1
      setTapCount(next)
      audio.tap?.()
      if (next >= target) onSuccess()
    } else {
      setWrongTap(true)
      onMiss()
      setTimeout(() => setWrongTap(false), 400)
    }
  }

  return (
    <div className={styles.tapArena}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      {/* Alvo principal */}
      <button
        className={`${styles.tapTarget} ${completed ? styles.tapSuccess : ''} ${wrongTap ? styles.tapWrong : ''}`}
        style={{ '--tap-color': gameTheme.color, '--tap-bg': gameTheme.bg }}
        onClick={() => handleTap(true)}
        aria-label={`Toque aqui — ${tapCount} de ${target}`}
      >
        <span className={styles.tapEmoji} aria-hidden="true">{challenge.emoji ?? '⭐'}</span>
        {target > 1 && (
          <div className={styles.tapCounter} aria-live="polite">
            {Array.from({ length: target }).map((_, i) => (
              <span
                key={i}
                className={`${styles.tapDot} ${i < tapCount ? styles.tapDotFilled : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </button>

      {showHint && !completed && (
        <p className={styles.hint} role="status">{challenge.hint}</p>
      )}

      {particles && <ParticlesBurst count={12} color={gameTheme.color} />}
    </div>
  )
}

function SwipeChallenge({ challenge, gameTheme, onSuccess, onMiss, showHint, completed, particles }) {
  const [swiped, setSwiped] = useState(false)
  const DIR_ARROWS = { right: '→', left: '←', up: '↑', down: '↓' }

  const swipeRef = useDrag({
    onDragEnd: ({ dx, dy }) => {
      const horizontal = Math.abs(dx) > Math.abs(dy)
      let detected = horizontal
        ? (dx > 40 ? 'right' : dx < -40 ? 'left' : null)
        : (dy > 40 ? 'down'  : dy < -40 ? 'up'   : null)

      if (detected === challenge.direction) {
        setSwiped(true)
        onSuccess()
      } else if (detected) {
        onMiss()
      }
    }
  })

  return (
    <div className={styles.swipeArena}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      {/* Seta de dica direcional — pisca 2x e some */}
      <div className={styles.directionHint} aria-hidden="true">
        {DIR_ARROWS[challenge.direction]}
      </div>

      <div
        ref={swipeRef}
        className={`${styles.swipeTarget} ${swiped ? styles.swipeSuccess : ''}`}
        style={{ '--tap-color': gameTheme.color }}
        role="button"
        aria-label={`Deslize para ${challenge.direction}`}
        tabIndex={0}
      >
        <span className={styles.swipeEmoji} aria-hidden="true">{challenge.emoji}</span>
      </div>

      {showHint && !completed && (
        <p className={styles.hint} role="status">{challenge.hint}</p>
      )}

      {particles && <ParticlesBurst count={12} color={gameTheme.color} />}
    </div>
  )
}

function HoldChallenge({ challenge, gameTheme, onSuccess, showHint, completed, particles }) {
  const [progress, setProgress] = useState(0)  // 0–100
  const intervalRef = useRef(null)
  const startRef    = useRef(null)
  const DURATION    = challenge.holdDuration ?? 2000

  function startHold() {
    startRef.current = performance.now()
    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startRef.current
      const pct     = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(intervalRef.current)
        onSuccess()
      }
    }, 30)
  }

  function endHold() {
    clearInterval(intervalRef.current)
    if (progress < 100) setProgress(0)  // esvazia suavemente via CSS transition
  }

  return (
    <div className={styles.holdArena}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      <div className={styles.holdContainer}>
        {/* Barra de progresso circular */}
        <svg className={styles.holdRing} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#E8E8F0" strokeWidth="6"/>
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke={gameTheme.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            style={{ transition: progress === 0 ? 'stroke-dashoffset 0.4s ease' : 'none',
                     transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>

        <button
          className={`${styles.holdBtn} ${completed ? styles.holdSuccess : ''}`}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          aria-label={`Segure este botão por ${DURATION/1000} segundos`}
          style={{ '--hold-color': gameTheme.color }}
        >
          <span aria-hidden="true">{challenge.emoji ?? '✊'}</span>
        </button>
      </div>

      {showHint && !completed && (
        <p className={styles.hint} role="status">{challenge.hint}</p>
      )}

      {particles && <ParticlesBurst count={16} color={gameTheme.color} />}
    </div>
  )
}

function GestureChallenge({ challenge, gameTheme, onSuccess, onMiss, showHint, completed, particles }) {
  const canvasRef = useRef(null)
  const drawing   = useRef(false)
  const points    = useRef([])

  function startDraw(e) {
    drawing.current = true
    points.current  = []
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = gameTheme.color
    ctx.lineWidth   = 6
    ctx.lineCap     = 'round'
    ctx.beginPath()
  }

  function draw(e) {
    if (!drawing.current) return
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    points.current.push({ x, y })
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endDraw() {
    if (!drawing.current) return
    drawing.current = false
    if (points.current.length < 5) return

    // Detecção simples por direção dominante
    const pts    = points.current
    const first  = pts[0]
    const last   = pts[pts.length - 1]
    const dx     = Math.abs(last.x - first.x)
    const dy     = Math.abs(last.y - first.y)
    const detected = dx > dy ? 'horizontal-line' : 'vertical-line'

    if (detected === challenge.shape) {
      onSuccess()
    } else {
      onMiss()
      // Limpa o canvas após erro
      setTimeout(() => {
        const ctx = canvasRef.current?.getContext('2d')
        ctx?.clearRect(0, 0, 300, 200)
      }, 400)
    }
  }

  return (
    <div className={styles.gestureArena}>
      <p className={styles.instruction}>{challenge.instruction}</p>

      <canvas
        ref={canvasRef}
        width={300}
        height={200}
        className={`${styles.gestureCanvas} ${completed ? styles.gestureSuccess : ''}`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        aria-label="Área de desenho — desenhe com o dedo ou mouse"
        role="img"
      />

      {showHint && !completed && (
        <p className={styles.hint} role="status">{challenge.hint}</p>
      )}

      {particles && <ParticlesBurst count={12} color={gameTheme.color} />}
    </div>
  )
}
```

---

## PASSO 5 — CRIAR `src/components/StartCountdown/StartCountdown.jsx`

```jsx
/**
 * StartCountdown.jsx
 * Animação de contagem regressiva antes de iniciar o jogo.
 * Duração total: ~2.6s (3 números × 700ms + GO! × 500ms + pausa 200ms)
 * Usa AudioManager.js já existente para os sons de contagem.
 */

import { useState, useEffect } from 'react'
import { audio }               from '../../engine/AudioSystem'
import styles                  from './StartCountdown.module.css'

const SEQUENCE = [
  { label: '1', color: '#5B4FCF', scale: 1.0 },  // roxo --c3
  { label: '2', color: '#E91E8C', scale: 1.0 },  // rosa --c2
  { label: '3', color: '#FF6B35', scale: 1.0 },  // laranja --c1
  { label: 'GO!', color: '#4CAF50', scale: 1.2 }, // verde --c5
]

/**
 * @param {object}   props
 * @param {function} props.onComplete — chamado quando a contagem termina
 * @param {object}   props.game       — jogo que vai iniciar (para personalizar cor)
 */
export function StartCountdown({ onComplete, game }) {
  const [step,    setStep]    = useState(0)    // índice atual na SEQUENCE
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Iniciar o AudioContext na primeira interação (já está feito no AudioSystem)
    audio.init?.()

    let current = 0

    function tick() {
      if (current >= SEQUENCE.length) {
        // Contagem concluída
        setTimeout(onComplete, 200)
        return
      }

      setStep(current)
      setVisible(true)

      // Som de cada número
      if (current < 3) {
        audio.playTone({ freq: [523, 659, 784][current], duration: 0.15 })
      } else {
        // GO! — fanfarra curta (3 notas rápidas)
        audio.phase?.()
      }

      // Esconde antes do próximo (para reiniciar animação)
      const duration = current === 3 ? 500 : 700
      setTimeout(() => {
        setVisible(false)
        current++
        setTimeout(tick, 80) // pequena pausa entre números
      }, duration)
    }

    // Pequena pausa antes de começar (deixa o jogador se preparar)
    const startTimeout = setTimeout(tick, 300)
    return () => clearTimeout(startTimeout)
  }, []) // eslint-disable-line

  const current = SEQUENCE[step]

  return (
    <div
      className={styles.overlay}
      aria-live="assertive"
      aria-label={`Iniciando em: ${current?.label}`}
    >
      {/* Fundo com a cor do tema do jogo */}
      <div
        className={styles.bg}
        style={{ background: game?.tutorialTheme?.bg ?? '#F7F8FC' }}
        aria-hidden="true"
      />

      {/* Número/palavra */}
      {visible && current && (
        <div
          key={step} // força reinício de animação a cada número
          className={`${styles.number} ${step === 3 ? styles.go : ''}`}
          style={{
            color:       current.color,
            '--scale':   current.scale,
            '--n-color': current.color
          }}
          aria-hidden="true"
        >
          {current.label}
        </div>
      )}

      {/* Indicadores de ponto (○○○●) */}
      <div className={styles.dots} aria-hidden="true">
        {[0,1,2].map(i => (
          <span
            key={i}
            className={`${styles.dot} ${step > i ? styles.dotPassed : ''} ${step === i ? styles.dotActive : ''}`}
            style={step === i || step > i ? { background: SEQUENCE[i].color } : {}}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## PASSO 6 — CSS DOS COMPONENTES

### `StartCountdown.module.css`

```css
/* Overlay que cobre toda a tela */
.overlay {
  position:        fixed;
  inset:           0;
  z-index:         500;
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             32px;
}

.bg {
  position: absolute;
  inset:    0;
  z-index:  0;
  animation: bgPulse 0.7s ease-in-out infinite alternate;
  will-change: opacity;
}

@keyframes bgPulse {
  from { opacity: 0.6; }
  to   { opacity: 1; }
}

/* Número principal */
.number {
  position:    relative;
  z-index:     1;
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size:   clamp(80px, 25vw, 160px);
  line-height: 1;
  color:       var(--n-color);
  will-change: transform, opacity;
  animation:   numberPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  text-shadow: 0 4px 0 rgba(0,0,0,0.08);
  /* GPU-only — sem reflow */
  transform:   translateZ(0);
}

@keyframes numberPop {
  0%   { transform: scale(0.2) rotate(-15deg) translateZ(0); opacity: 0; }
  70%  { transform: scale(calc(var(--scale, 1) * 1.1)) rotate(3deg) translateZ(0); opacity: 1; }
  100% { transform: scale(var(--scale, 1)) rotate(0deg) translateZ(0); opacity: 1; }
}

/* GO! tem animação diferente — mais expansiva */
.go {
  font-size:  clamp(60px, 20vw, 120px);
  animation:  goPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes goPop {
  0%   { transform: scale(0.5) translateZ(0); opacity: 0; }
  50%  { transform: scale(1.4) translateZ(0); opacity: 1; }
  100% { transform: scale(1.2) translateZ(0); opacity: 1; }
}

/* Indicadores de ponto */
.dots {
  position:        relative;
  z-index:         1;
  display:         flex;
  gap:             12px;
}

.dot {
  width:         12px;
  height:        12px;
  border-radius: 50%;
  background:    rgba(0,0,0,0.12);
  transition:    background 0.2s ease, transform 0.2s ease;
  will-change:   transform;
}

.dotActive {
  transform: scale(1.4) translateZ(0);
}

.dotPassed {
  transform: scale(1) translateZ(0);
  opacity:   0.5;
}

/* Respeitar preferência de movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  .number, .go, .bg { animation: none !important; }
  .number { opacity: 1; transform: none; }
}
```

### `HowToPlayScreen.module.css` (estrutural)

```css
.screen {
  display:         flex;
  flex-direction:  column;
  min-height:      100dvh;
  background:      var(--game-bg, #F7F8FC);
  animation:       screenIn 0.35s ease both;
  will-change:     transform, opacity;
}

@keyframes screenIn {
  from { transform: translateX(40px) translateZ(0); opacity: 0; }
  to   { transform: translateX(0) translateZ(0); opacity: 1; }
}

.header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         16px 20px;
  background:      rgba(255,255,255,0.92);
  border-bottom:   1px solid rgba(0,0,0,0.06);
  position:        sticky;
  top:             0;
  z-index:         10;
}

.heading {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size:   18px;
  color:       #1A1A2E;
  margin:      0;
}

/* Barra de progresso do tutorial */
.progressBar {
  display:         flex;
  justify-content: center;
  gap:             8px;
  padding:         14px 0;
}

.progressDot {
  width:         8px;
  height:        8px;
  border-radius: 50%;
  background:    #E8E8F0;
  transition:    background 0.25s ease, transform 0.25s ease;
  will-change:   transform;
}

.progressDotActive {
  background:  var(--game-color, #5B4FCF);
  transform:   scale(1.3) translateZ(0);
}

.content {
  flex:    1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.footer {
  padding:    20px;
  background: rgba(255,255,255,0.92);
  border-top: 1px solid rgba(0,0,0,0.06);
}

/* Botões */
.btnBack {
  font-family:   'Nunito', sans-serif;
  font-weight:   700;
  font-size:     14px;
  color:         #5A5A7A;
  background:    transparent;
  border:        none;
  cursor:        pointer;
  padding:       8px;
  min-height:    44px;
  min-width:     44px;
  touch-action:  manipulation;
}

.btnSkip {
  font-family:   'Nunito', sans-serif;
  font-weight:   700;
  font-size:     13px;
  color:         var(--game-color, #5B4FCF);
  background:    transparent;
  border:        none;
  cursor:        pointer;
  padding:       8px;
  min-height:    44px;
  touch-action:  manipulation;
}

.btnPlay {
  width:         100%;
  min-height:    56px;
  border-radius: 50px;
  border:        none;
  background:    linear-gradient(135deg, #5B4FCF, #E91E8C);
  color:         #ffffff;
  font-family:   'Nunito', sans-serif;
  font-weight:   900;
  font-size:     20px;
  cursor:        pointer;
  display:       flex;
  align-items:   center;
  justify-content: center;
  gap:           10px;
  touch-action:  manipulation;
  will-change:   transform;
  transition:    transform 0.15s ease, opacity 0.15s ease;
  animation:     btnAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.btnPlay:active { transform: scale(0.96) translateZ(0); opacity: 0.9; }

@keyframes btnAppear {
  from { transform: translateY(16px) translateZ(0); opacity: 0; }
  to   { transform: translateY(0) translateZ(0); opacity: 1; }
}

.btnArrow {
  font-size:    18px;
  animation:    arrowPulse 1.2s ease-in-out infinite;
  will-change:  transform;
}

@keyframes arrowPulse {
  0%, 100% { transform: translateX(0) translateZ(0); }
  50%      { transform: translateX(4px) translateZ(0); }
}

/* Tela ready */
.readyContent {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            12px;
  text-align:     center;
}

.readyEmoji {
  font-size:  72px;
  animation:  emojiCelebrate 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change: transform;
}

@keyframes emojiCelebrate {
  0%   { transform: scale(0) rotate(-20deg) translateZ(0); opacity: 0; }
  70%  { transform: scale(1.2) rotate(5deg) translateZ(0); opacity: 1; }
  100% { transform: scale(1) rotate(0deg) translateZ(0); opacity: 1; }
}

.readyTitle {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size:   24px;
  color:       #1A1A2E;
  margin:      0;
}

.readySub {
  font-size: 15px;
  color:     #5A5A7A;
  margin:    0;
  max-width: 280px;
}

/* Hint */
.hint {
  font-family:   'Nunito', sans-serif;
  font-weight:   700;
  font-size:     14px;
  color:         var(--game-color, #5B4FCF);
  text-align:    center;
  margin-top:    16px;
  animation:     hintAppear 0.3s ease both;
  will-change:   opacity;
}

@keyframes hintAppear {
  from { opacity: 0; transform: translateY(6px) translateZ(0); }
  to   { opacity: 1; transform: translateY(0) translateZ(0); }
}

@media (prefers-reduced-motion: reduce) {
  .screen, .btnPlay, .readyEmoji, .btnArrow, .hint, .progressDot {
    animation: none !important; transition: none !important;
  }
}
```

---

## PASSO 7 — INTEGRAÇÃO NO `GameShell.jsx`

```jsx
// GameShell.jsx — adicionar controle de tela (catalog → howToPlay → countdown → game)

import { useState }            from 'react'
import { HowToPlayScreen }     from './HowToPlay/HowToPlayScreen'
import { StartCountdown }      from './StartCountdown/StartCountdown'

// Estados de tela
const SCREENS = {
  HOW_TO_PLAY: 'howToPlay',
  COUNTDOWN:   'countdown',
  GAME:        'game',
}

export function GameShell({ game, onBackToCatalog, children }) {
  const [screen, setScreen] = useState(SCREENS.HOW_TO_PLAY)

  // HowToPlay → Countdown
  function handlePlay() {
    setScreen(SCREENS.COUNTDOWN)
  }

  // Countdown terminou → Jogo
  function handleCountdownComplete() {
    setScreen(SCREENS.GAME)
    // Timer crescente inicia aqui (já implementado no useTimer com autoStart)
  }

  if (screen === SCREENS.HOW_TO_PLAY) {
    return (
      <HowToPlayScreen
        game={game}
        onPlay={handlePlay}
        onBack={onBackToCatalog}
      />
    )
  }

  if (screen === SCREENS.COUNTDOWN) {
    return (
      <StartCountdown
        game={game}
        onComplete={handleCountdownComplete}
      />
    )
  }

  // SCREENS.GAME — conteúdo normal do jogo com timer, badge, etc.
  return (
    <div className="game-shell">
      {/* ... header com timer, ModeBadge, fase ... */}
      {children}
    </div>
  )
}
```

---

## PASSO 8 — COMO O CATÁLOGO ACIONA O FLUXO

```js
// Em GameCard.js (catálogo) — ao clicar no card ou no botão "Jogar"
// O botão "Jogar agora" do Modal de info já existe — apenas redirecionar:

function handlePlayGame(game) {
  // Navega para a rota do jogo — o GameShell assume a partir daqui
  // O fluxo é: catálogo → /games/g01-festa-lagarta/ → GameShell inicia em HowToPlay
  window.location.href = game.path
  // OU em SPA com React Router:
  // navigate(game.path)
}
```

---

## CHECKLIST DE VALIDAÇÃO

- [ ] `games.js` atualizado com `interactionType` e `tutorialTheme` em todos os 21 jogos
- [ ] `tutorials.js` criado com os 2 mini desafios por tipo de interação
- [ ] `HowToPlayScreen` não renderiza após `hasSeenTutorial === true` (vai direto para ready)
- [ ] Professor vai direto para tela 'ready' (sem tutorial)
- [ ] Mini desafio de drag usa `useDrag` do `useSwipe.js` já existente
- [ ] Mini desafio de tap usa `useTap` do `useTap.js` já existente
- [ ] Nenhum mini desafio tem "game over" ou punição por erro
- [ ] Dica aparece após 2 tentativas falhas (não antes)
- [ ] `StartCountdown` usa `audio.playTone()` do `AudioSystem.js` já existente
- [ ] Countdown usa sons crescentes: C5 → E5 → G5 → fanfarra
- [ ] GO! tem animação maior que os números (scale: 1.2)
- [ ] Timer do `useTimer` inicia APÓS o countdown terminar (não antes)
- [ ] `ModeConfig` é lido corretamente pelo jogo após o countdown
- [ ] Botão "Voltar" no HowToPlay retorna ao catálogo sem iniciar o timer
- [ ] Toda animação usa apenas `transform` e `opacity` (regra GPU-only)
- [ ] `prefers-reduced-motion` desliga todas as animações decorativas
- [ ] Funciona em iOS Safari (touch events no canvas do GestureChallenge)
- [ ] Funciona em Android Chrome e desktop
- [ ] `localStorage.getItem('123go_tutorial_${game.id}')` persiste entre sessões
