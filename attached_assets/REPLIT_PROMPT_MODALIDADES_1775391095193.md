# PROMPT PARA O REPLIT — SISTEMA DE MODALIDADES DE AULA
## Plataforma 123GO! · Controle do Professor · 21 Jogos

---

## POR QUE O PROMPT ORIGINAL PRECISAVA DE AJUSTES

O prompt anterior tinha 6 gaps críticos para este projeto:

1. **`userRole` hardcoded** — não integrava com nenhum sistema de auth real; qualquer
   aluno poderia mudar o valor no DevTools e acessar o painel do professor.
2. **Estado global solto** — `gameMode = "practice"` como variável solta quebra em React
   (não é reativo, não persiste entre renders, não sincroniza entre componentes).
3. **Sem integração com TimerSystem** — o modo "Tempo" contradiz o timer crescente já
   implementado; os dois sistemas precisam coexistir com papéis distintos.
4. **Sem integração com GameEngine/GameShell** — `startGame({ mode })` era uma função
   fictícia sem conexão com a arquitetura já existente.
5. **Sem tratamento de sessão de aula** — "garantir que todos os alunos usem o mesmo
   modo" exige um mecanismo de sessão, não apenas localStorage individual.
6. **UI não especificada visualmente** — "carrossel horizontal" sem CSS, sem animações,
   sem integração com o design system da plataforma (Nunito, paleta de cores, border-radius).

---

## CONTEXTO DA PLATAFORMA

A plataforma **123GO!** já possui:
- `GameEngine.js` — motor base dos 21 jogos
- `TimerSystem.js` + `useTimer.js` — cronômetro crescente por fase (informativo)
- `TimerStore.js` — persistência de tempos em `localStorage`
- `GameShell.jsx` — wrapper com barra de progresso, score e timer
- `PhaseManager.js` — controle de fases 1–5 com dificuldade progressiva
- Design system: fonte Nunito, paleta `--c1` a `--c6`, `--radius: 16px`

**Este prompt integra o sistema de Modalidades a tudo isso — sem quebrar nada existente.**

---

## ARQUITETURA COMPLETA

```
src/
├── auth/
│   └── SessionManager.js          ← CRIAR — controla perfil e sessão de aula
├── engine/
│   ├── GameEngine.js              ← já existe — recebe ModeConfig no construtor
│   ├── ModeConfig.js              ← CRIAR — constantes e config por modalidade
│   ├── TimerSystem.js             ← já existe — modo "Tempo" usa countdown aqui
│   └── TimerStore.js              ← já existe — registra modalidade usada
├── hooks/
│   ├── useTimer.js                ← já existe — recebe mode para alternar comportamento
│   └── useGameMode.js             ← CRIAR — hook de leitura do modo ativo
├── components/
│   ├── ModalitySelector/
│   │   ├── ModalitySelector.jsx   ← CRIAR — painel do professor
│   │   ├── ModalityCard.jsx       ← CRIAR — card individual de cada modalidade
│   │   ├── ModalitySelector.module.css ← CRIAR
│   │   └── ModalityCard.module.css     ← CRIAR
│   ├── ModeBadge.jsx              ← CRIAR — badge no topo do jogo (visível ao aluno)
│   ├── ModeBadge.module.css       ← CRIAR
│   ├── TimerDisplay.jsx           ← já existe — adaptar para countdown no modo Tempo
│   └── GameShell.jsx              ← já existe — integrar ModeBadge + ModeConfig
└── pages/
    ├── TeacherDashboard.jsx       ← CRIAR — página exclusiva do professor
    └── StudentView.jsx            ← já existe (catálogo) — sem alteração
```

---

## ARQUIVO 1 — `src/auth/SessionManager.js`

```js
/**
 * SessionManager.js
 * Gerencia perfil de usuário e sessão de aula de forma segura.
 *
 * SEGURANÇA: o perfil "teacher" é protegido por PIN de 4 dígitos.
 * Alunos nunca veem o campo de PIN — o acesso professor é uma rota separada.
 * Nenhum dado sensível é exposto no cliente além do que já está aqui.
 */

const STORAGE_KEYS = {
  role:        '123go_role',       // "teacher" | "student"
  mode:        '123go_game_mode',  // "practice" | "challenge" | "time"
  difficulty:  '123go_difficulty', // "easy" | "medium" | "hard"
  sessionId:   '123go_session_id', // ID único da sessão de aula (gerado pelo professor)
  teacherPin:  '123go_teacher_pin_hash', // hash simples do PIN (não é segurança real — é UX)
}

// PIN padrão de fábrica — professor deve trocar na primeira vez
const DEFAULT_PIN = '1234'

export class SessionManager {

  // ─── Perfil ────────────────────────────────────────────────────────────────

  static getRole() {
    return localStorage.getItem(STORAGE_KEYS.role) ?? 'student'
  }

  static isTeacher() {
    return SessionManager.getRole() === 'teacher'
  }

  static isStudent() {
    return !SessionManager.isTeacher()
  }

  /**
   * Eleva para perfil professor verificando o PIN.
   * Retorna true se o PIN estiver correto.
   * NOTA: Este é um controle de UX, não de segurança criptográfica.
   * Para produção real, substituir por autenticação JWT/OAuth.
   */
  static loginAsTeacher(pin) {
    const stored = localStorage.getItem(STORAGE_KEYS.teacherPin) ?? DEFAULT_PIN
    if (pin === stored) {
      localStorage.setItem(STORAGE_KEYS.role, 'teacher')
      return true
    }
    return false
  }

  static logoutTeacher() {
    localStorage.setItem(STORAGE_KEYS.role, 'student')
  }

  static changePin(currentPin, newPin) {
    if (!SessionManager.loginAsTeacher(currentPin)) return false
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return false
    localStorage.setItem(STORAGE_KEYS.teacherPin, newPin)
    return true
  }

  // ─── Modalidade e Configuração ─────────────────────────────────────────────

  static getMode() {
    return localStorage.getItem(STORAGE_KEYS.mode) ?? 'practice'
  }

  static getDifficulty() {
    return localStorage.getItem(STORAGE_KEYS.difficulty) ?? 'easy'
  }

  /**
   * Define a modalidade — apenas professores podem chamar.
   * Retorna false silenciosamente se chamado por aluno.
   */
  static setMode(mode) {
    if (SessionManager.isStudent()) return false
    const valid = ['practice', 'challenge', 'time']
    if (!valid.includes(mode)) return false
    localStorage.setItem(STORAGE_KEYS.mode, mode)
    // Dispara evento customizado para que todos os componentes reativos atualizem
    window.dispatchEvent(new CustomEvent('123go:mode-changed', { detail: { mode } }))
    return true
  }

  static setDifficulty(difficulty) {
    if (SessionManager.isStudent()) return false
    const valid = ['easy', 'medium', 'hard']
    if (!valid.includes(difficulty)) return false
    localStorage.setItem(STORAGE_KEYS.difficulty, difficulty)
    window.dispatchEvent(new CustomEvent('123go:difficulty-changed', { detail: { difficulty } }))
    return true
  }

  // ─── Sessão de Aula ────────────────────────────────────────────────────────

  /**
   * Cria uma nova sessão de aula com ID único.
   * O professor compartilha esse ID (ex: via QR code ou código na lousa)
   * para que os alunos entrem na mesma configuração.
   * Retorna o ID da sessão criada.
   */
  static startClassSession() {
    if (SessionManager.isStudent()) return null
    const sessionId = `aula_${Date.now()}_${Math.random().toString(36).slice(2,7)}`
    const config = {
      id:         sessionId,
      mode:       SessionManager.getMode(),
      difficulty: SessionManager.getDifficulty(),
      startedAt:  new Date().toISOString(),
      active:     true
    }
    localStorage.setItem(STORAGE_KEYS.sessionId, JSON.stringify(config))
    window.dispatchEvent(new CustomEvent('123go:session-started', { detail: config }))
    return sessionId
  }

  static getCurrentSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.sessionId)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  static endClassSession() {
    if (SessionManager.isStudent()) return
    const session = SessionManager.getCurrentSession()
    if (session) {
      session.active   = false
      session.endedAt  = new Date().toISOString()
      localStorage.setItem(STORAGE_KEYS.sessionId, JSON.stringify(session))
    }
  }

  /**
   * Exporta a configuração da sessão como JSON para analytics/backend.
   */
  static exportSessionData() {
    return {
      session:    SessionManager.getCurrentSession(),
      mode:       SessionManager.getMode(),
      difficulty: SessionManager.getDifficulty(),
      exportedAt: new Date().toISOString()
    }
  }
}
```

---

## ARQUIVO 2 — `src/engine/ModeConfig.js`

```js
/**
 * ModeConfig.js
 * Fonte única de verdade para configurações de cada modalidade e dificuldade.
 * Todos os jogos leem daqui — nunca hardcodam valores.
 */

export const MODES = {
  practice:  'practice',
  challenge: 'challenge',
  time:      'time'
}

export const DIFFICULTIES = {
  easy:   'easy',
  medium: 'medium',
  hard:   'hard'
}

// ─── Labels e metadados de UI ─────────────────────────────────────────────────

export const MODE_META = {
  practice: {
    id:          'practice',
    label:       'Prática',
    emoji:       '🟢',
    tagline:     'Aprendizado leve e guiado',
    description: 'Fases fixas, sem tempo. Foco total em compreender o conteúdo no próprio ritmo.',
    color:       '#4CAF50',   // --c5
    colorBg:     '#EAF3DE',
    teacherTip:  'Ideal para introduzir um conceito novo ou para alunos que precisam de mais suporte.',
    badgeLabel:  'Modo Prática'
  },
  challenge: {
    id:          'challenge',
    label:       'Desafio',
    emoji:       '🔴',
    tagline:     'Fases variáveis a cada tentativa',
    description: 'Aleatoriedade controlada por faixa de dificuldade. Mantém a criança engajada.',
    color:       '#E91E8C',   // --c2
    colorBg:     '#FBEAF0',
    teacherTip:  'Use quando a turma já domina o básico e precisa de variação para não enjoar.',
    badgeLabel:  'Modo Desafio'
  },
  time: {
    id:          'time',
    label:       'Tempo',
    emoji:       '⚡',
    tagline:     'Complete antes do tempo acabar',
    description: 'Timer regressivo por fase. Estimula agilidade e cálculo mental.',
    color:       '#FF9800',   // --c6
    colorBg:     '#FFF3E0',
    teacherTip:  'Use apenas com turmas que já se sentem confortáveis. Evite como primeira experiência.',
    badgeLabel:  'Modo Tempo'
  }
}

// ─── Configuração por dificuldade — Modo Desafio ──────────────────────────────

export const CHALLENGE_CONFIG = {
  easy:   { minElements: 2,  maxElements: 4,  extraTime: 0  },
  medium: { minElements: 4,  maxElements: 6,  extraTime: 0  },
  hard:   { minElements: 6,  maxElements: 10, extraTime: 0  }
}

// ─── Configuração por dificuldade — Modo Tempo ────────────────────────────────
// IMPORTANTE: esses valores são do COUNTDOWN (tempo regressivo, apenas no modo Tempo).
// O TimerSystem crescente continua ativo em paralelo para analytics.

export const TIME_CONFIG = {
  easy:   { timeLimitSeconds: 150 }, // 2:30
  medium: { timeLimitSeconds: 90  }, // 1:30
  hard:   { timeLimitSeconds: 50  }  // 0:50
}

// ─── Configuração por dificuldade — Modo Prática ──────────────────────────────

export const PRACTICE_CONFIG = {
  easy:   { fixedPhases: true, hintsEnabled: true,  hintDelay: 3000  },
  medium: { fixedPhases: true, hintsEnabled: true,  hintDelay: 5000  },
  hard:   { fixedPhases: true, hintsEnabled: false, hintDelay: null  }
}

/**
 * Retorna a configuração completa para o modo e dificuldade atuais.
 * Use nos GameEngine de cada jogo.
 *
 * @param {string} mode       — 'practice' | 'challenge' | 'time'
 * @param {string} difficulty — 'easy' | 'medium' | 'hard'
 * @returns {object}
 */
export function getModeConfig(mode, difficulty) {
  const base = {
    mode,
    difficulty,
    meta:            MODE_META[mode],
    isTimedCountdown: mode === 'time',
    isRandomized:    mode === 'challenge',
    hasHints:        mode === 'practice',
  }

  if (mode === 'practice')  return { ...base, ...PRACTICE_CONFIG[difficulty] }
  if (mode === 'challenge') return { ...base, ...CHALLENGE_CONFIG[difficulty] }
  if (mode === 'time')      return { ...base, ...TIME_CONFIG[difficulty] }

  return base
}

/**
 * Gera um número aleatório dentro da faixa de dificuldade (modo Desafio).
 */
export function randomInRange(difficulty) {
  const { minElements, maxElements } = CHALLENGE_CONFIG[difficulty]
  return Math.floor(Math.random() * (maxElements - minElements + 1)) + minElements
}
```

---

## ARQUIVO 3 — `src/hooks/useGameMode.js`

```js
/**
 * useGameMode.js
 * Hook reativo que qualquer componente usa para ler o modo atual.
 * Atualiza automaticamente quando o professor muda o modo durante a aula.
 */

import { useState, useEffect } from 'react'
import { SessionManager }      from '../auth/SessionManager'
import { getModeConfig }       from '../engine/ModeConfig'

export function useGameMode() {
  const [mode,       setMode]       = useState(SessionManager.getMode)
  const [difficulty, setDifficulty] = useState(SessionManager.getDifficulty)
  const [isTeacher,  setIsTeacher]  = useState(SessionManager.isTeacher)

  useEffect(() => {
    function onModeChanged(e)       { setMode(e.detail.mode) }
    function onDiffChanged(e)       { setDifficulty(e.detail.difficulty) }
    function onStorageChanged(e) {
      if (e.key === '123go_role')        setIsTeacher(e.newValue === 'teacher')
      if (e.key === '123go_game_mode')   setMode(e.newValue ?? 'practice')
      if (e.key === '123go_difficulty')  setDifficulty(e.newValue ?? 'easy')
    }

    // Eventos customizados — mesma aba
    window.addEventListener('123go:mode-changed',        onModeChanged)
    window.addEventListener('123go:difficulty-changed',  onDiffChanged)
    // StorageEvent — abas diferentes (professor em um tablet, alunos em outro)
    window.addEventListener('storage', onStorageChanged)

    return () => {
      window.removeEventListener('123go:mode-changed',       onModeChanged)
      window.removeEventListener('123go:difficulty-changed', onDiffChanged)
      window.removeEventListener('storage',                  onStorageChanged)
    }
  }, [])

  const config = getModeConfig(mode, difficulty)

  return {
    mode,           // 'practice' | 'challenge' | 'time'
    difficulty,     // 'easy' | 'medium' | 'hard'
    isTeacher,      // boolean
    config,         // objeto completo com todas as configs
    // Atalhos diretos
    isPractice:  mode === 'practice',
    isChallenge: mode === 'challenge',
    isTime:      mode === 'time',
  }
}
```

---

## ARQUIVO 4 — `src/components/ModalitySelector/ModalitySelector.jsx`

```jsx
/**
 * ModalitySelector.jsx
 * Painel exclusivo do professor para escolher modalidade e dificuldade.
 * NUNCA renderizado para alunos.
 */

import { useState }           from 'react'
import { SessionManager }     from '../../auth/SessionManager'
import { useGameMode }        from '../../hooks/useGameMode'
import { MODE_META }          from '../../engine/ModeConfig'
import { ModalityCard }       from './ModalityCard'
import styles                 from './ModalitySelector.module.css'

const DIFFICULTY_LABELS = {
  easy:   { label: 'Fácil',  emoji: '🌱' },
  medium: { label: 'Médio',  emoji: '🌿' },
  hard:   { label: 'Difícil', emoji: '🌳' }
}

export function ModalitySelector() {
  const { mode, difficulty, isTeacher } = useGameMode()

  // Guarda de segurança — componente não renderiza para alunos
  if (!isTeacher) return null

  function handleSelectMode(newMode) {
    SessionManager.setMode(newMode)
  }

  function handleSelectDifficulty(newDiff) {
    SessionManager.setDifficulty(newDiff)
  }

  return (
    <section className={styles.section} aria-label="Configurações de modalidade de aula">

      {/* Cabeçalho do painel */}
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">🎓</span>
        <div>
          <h2 className={styles.headerTitle}>Modalidades de Aula</h2>
          <p className={styles.headerSub}>
            Escolha como a turma vai jogar hoje. Os alunos não verão esta tela.
          </p>
        </div>
      </div>

      {/* Carrossel de modalidades */}
      <div
        className={styles.carousel}
        role="radiogroup"
        aria-label="Selecionar modalidade"
      >
        {Object.values(MODE_META).map(meta => (
          <ModalityCard
            key={meta.id}
            meta={meta}
            isActive={mode === meta.id}
            onSelect={() => handleSelectMode(meta.id)}
          />
        ))}
      </div>

      {/* Seletor de dificuldade */}
      <div className={styles.difficultySection}>
        <p className={styles.difficultyLabel}>Nível de dificuldade</p>
        <div className={styles.difficultyPills} role="radiogroup" aria-label="Nível de dificuldade">
          {Object.entries(DIFFICULTY_LABELS).map(([key, { label, emoji }]) => (
            <button
              key={key}
              role="radio"
              aria-checked={difficulty === key}
              className={`${styles.diffPill} ${difficulty === key ? styles.diffActive : ''}`}
              onClick={() => handleSelectDifficulty(key)}
            >
              <span aria-hidden="true">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dica pedagógica contextual */}
      <div className={styles.teacherTip} aria-live="polite">
        <span className={styles.tipIcon} aria-hidden="true">💡</span>
        <p className={styles.tipText}>{MODE_META[mode].teacherTip}</p>
      </div>

      {/* Botão iniciar sessão */}
      <button
        className={styles.btnStart}
        onClick={() => SessionManager.startClassSession()}
        aria-label="Iniciar sessão de aula com as configurações selecionadas"
      >
        Iniciar aula com Modo {MODE_META[mode].label} →
      </button>

    </section>
  )
}
```

---

## ARQUIVO 5 — `src/components/ModalitySelector/ModalityCard.jsx`

```jsx
/**
 * ModalityCard.jsx
 * Card individual de cada modalidade no carrossel.
 */

import { useRef }    from 'react'
import styles        from './ModalityCard.module.css'

export function ModalityCard({ meta, isActive, onSelect }) {
  const cardRef = useRef(null)

  // Tilt 3D sutil ao hover (touch-friendly: só em pointer: fine)
  function handleMouseMove(e) {
    const card = cardRef.current
    if (!card) return
    const rect  = card.getBoundingClientRect()
    const cx    = rect.left + rect.width / 2
    const cy    = rect.top  + rect.height / 2
    const dx    = (e.clientX - cx) / (rect.width  / 2)
    const dy    = (e.clientY - cy) / (rect.height / 2)
    card.style.transform = `perspective(600px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.03) translateZ(0)`
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transform = ''
  }

  return (
    <button
      ref={cardRef}
      role="radio"
      aria-checked={isActive}
      aria-label={`Modalidade ${meta.label}: ${meta.tagline}`}
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      style={{ '--mode-color': meta.color, '--mode-bg': meta.colorBg }}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Indicador de seleção */}
      {isActive && (
        <span className={styles.checkmark} aria-hidden="true">✓</span>
      )}

      {/* Emoji + título */}
      <span className={styles.emoji} aria-hidden="true">{meta.emoji}</span>
      <h3 className={styles.title}>{meta.label}</h3>
      <p  className={styles.tagline}>{meta.tagline}</p>
      <p  className={styles.description}>{meta.description}</p>
    </button>
  )
}
```

---

## ARQUIVO 6 — `src/components/ModalitySelector/ModalitySelector.module.css`

```css
/* ─── Seção principal ──────────────────────────────────────────────────────── */
.section {
  display:        flex;
  flex-direction: column;
  gap:            20px;
  padding:        24px 20px;
  background:     #ffffff;
  border-radius:  20px;
  border:         1.5px solid #E8E8F0;
  margin-bottom:  28px;
  animation:      sectionAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change:    transform, opacity;
}

@keyframes sectionAppear {
  from { transform: translateY(-12px) translateZ(0); opacity: 0; }
  to   { transform: translateY(0) translateZ(0); opacity: 1; }
}

/* ─── Header ───────────────────────────────────────────────────────────────── */
.header {
  display:     flex;
  align-items: flex-start;
  gap:         12px;
}

.headerIcon {
  font-size:   28px;
  flex-shrink: 0;
  animation:   iconFloat 3s ease-in-out infinite;
  will-change: transform;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50%      { transform: translateY(-5px) translateZ(0); }
}

.headerTitle {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size:   18px;
  color:       #1A1A2E;
  margin:      0 0 3px;
}

.headerSub {
  font-size: 13px;
  color:     #5A5A7A;
  margin:    0;
}

/* ─── Carrossel de modalidades ─────────────────────────────────────────────── */
.carousel {
  display:               grid;
  grid-template-columns: repeat(3, 1fr);
  gap:                   12px;
}

/* Mobile: scroll horizontal */
@media (max-width: 600px) {
  .carousel {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
    overflow-x:            auto;
    scroll-snap-type:      x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom:        6px;
  }
}

/* ─── Dificuldade ──────────────────────────────────────────────────────────── */
.difficultySection { display: flex; flex-direction: column; gap: 10px; }

.difficultyLabel {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size:   13px;
  color:       #9090B0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.difficultyPills {
  display:   flex;
  gap:       8px;
  flex-wrap: wrap;
}

.diffPill {
  display:       flex;
  align-items:   center;
  gap:           6px;
  padding:       8px 18px;
  border-radius: 50px;
  border:        1.5px solid #E8E8F0;
  background:    #F7F8FC;
  font-family:   'Nunito', sans-serif;
  font-weight:   700;
  font-size:     14px;
  color:         #5A5A7A;
  cursor:        pointer;
  transition:    transform 0.15s ease, border-color 0.15s ease;
  will-change:   transform;
  touch-action:  manipulation;
  min-height:    44px;
}

.diffPill:hover      { border-color: #5B4FCF; color: #5B4FCF; }
.diffPill:active     { transform: scale(0.96) translateZ(0); }

.diffActive {
  background:   #1A1A2E;
  color:        #ffffff;
  border-color: #1A1A2E;
  animation:    pillPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change:  transform;
}

@keyframes pillPop {
  from { transform: scale(0.88) translateZ(0); }
  to   { transform: scale(1) translateZ(0); }
}

/* ─── Dica do professor ────────────────────────────────────────────────────── */
.teacherTip {
  display:       flex;
  align-items:   flex-start;
  gap:           10px;
  padding:       14px 16px;
  background:    rgba(91,79,207,0.06);
  border-radius: 12px;
  border-left:   3px solid #5B4FCF;
  animation:     tipFadeIn 0.3s ease;
  will-change:   opacity;
}

@keyframes tipFadeIn {
  from { opacity: 0; transform: translateX(-6px) translateZ(0); }
  to   { opacity: 1; transform: translateX(0) translateZ(0); }
}

.tipIcon { font-size: 18px; flex-shrink: 0; }
.tipText { font-size: 13px; color: #5A5A7A; line-height: 1.5; margin: 0; }

/* ─── Botão iniciar aula ───────────────────────────────────────────────────── */
.btnStart {
  width:         100%;
  min-height:    52px;
  border-radius: 50px;
  border:        none;
  background:    linear-gradient(135deg, #5B4FCF, #E91E8C);
  color:         #ffffff;
  font-family:   'Nunito', sans-serif;
  font-weight:   800;
  font-size:     16px;
  cursor:        pointer;
  transition:    transform 0.15s ease, opacity 0.15s ease;
  will-change:   transform;
  touch-action:  manipulation;
}

.btnStart:hover  { opacity: 0.92; }
.btnStart:active { transform: scale(0.97) translateZ(0); opacity: 0.88; }

@media (prefers-reduced-motion: reduce) {
  .section, .headerIcon, .teacherTip, .diffActive, .btnStart {
    animation: none !important; transition: none !important;
  }
}
```

---

## ARQUIVO 7 — `src/components/ModalitySelector/ModalityCard.module.css`

```css
/* ─── Card base ────────────────────────────────────────────────────────────── */
.card {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            8px;
  padding:        20px 14px;
  border-radius:  16px;
  border:         2px solid #E8E8F0;
  background:     #F7F8FC;
  cursor:         pointer;
  position:       relative;
  text-align:     center;

  /* Transição GPU-only */
  transition:     border-color 0.2s ease, background 0.2s ease;
  will-change:    transform;
  transform:      translateZ(0);
  touch-action:   manipulation;

  /* Scroll snap no mobile */
  scroll-snap-align: start;

  /* Reset de button */
  font-family:    inherit;
  outline:        none;
}

.card:focus-visible {
  box-shadow: 0 0 0 3px var(--mode-color, #5B4FCF);
}

/* Hover — só em dispositivos com ponteiro fino (mouse) */
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    border-color: var(--mode-color, #5B4FCF);
    background:   var(--mode-bg, #EEEDFE);
  }
}

/* Touch feedback */
.card:active {
  transform: scale(0.96) translateZ(0);
}

/* ─── Estado ativo ─────────────────────────────────────────────────────────── */
.active {
  border-color: var(--mode-color, #5B4FCF);
  background:   var(--mode-bg, #EEEDFE);
  animation:    cardSelect 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardSelect {
  0%   { transform: scale(0.94) translateZ(0); }
  60%  { transform: scale(1.04) translateZ(0); }
  100% { transform: scale(1) translateZ(0); }
}

/* ─── Checkmark ────────────────────────────────────────────────────────────── */
.checkmark {
  position:    absolute;
  top:         10px;
  right:       10px;
  width:       22px;
  height:      22px;
  border-radius: 50%;
  background:  var(--mode-color, #5B4FCF);
  color:       #ffffff;
  font-size:   12px;
  font-weight: 700;
  display:     flex;
  align-items: center;
  justify-content: center;
  animation:   checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change: transform;
}

@keyframes checkPop {
  from { transform: scale(0) translateZ(0); opacity: 0; }
  to   { transform: scale(1) translateZ(0); opacity: 1; }
}

/* ─── Conteúdo ─────────────────────────────────────────────────────────────── */
.emoji {
  font-size:   36px;
  line-height: 1;
  will-change: transform;
  animation:   emojiIdle 3s ease-in-out infinite;
  animation-delay: var(--card-index, 0) * 0.5s;
}

@keyframes emojiIdle {
  0%, 100% { transform: scale(1) translateZ(0); }
  50%      { transform: scale(1.1) translateZ(0); }
}

.active .emoji {
  animation: emojiActive 1.2s ease-in-out infinite;
}

@keyframes emojiActive {
  0%, 100% { transform: scale(1) rotate(0deg) translateZ(0); }
  25%      { transform: scale(1.15) rotate(-5deg) translateZ(0); }
  75%      { transform: scale(1.15) rotate(5deg) translateZ(0); }
}

.title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size:   15px;
  color:       #1A1A2E;
  margin:      0;
}

.active .title { color: var(--mode-color, #5B4FCF); }

.tagline {
  font-size:  12px;
  font-weight: 600;
  color:      #5A5A7A;
  margin:     0;
  line-height: 1.4;
}

.description {
  font-size:  11px;
  color:      #9090B0;
  margin:     0;
  line-height: 1.5;
}

/* ─── Entrada staggerada dos cards ─────────────────────────────────────────── */
.card {
  animation: cardAppear 0.4s ease both;
}
.card:nth-child(1) { animation-delay: 0.05s; }
.card:nth-child(2) { animation-delay: 0.12s; }
.card:nth-child(3) { animation-delay: 0.19s; }

@keyframes cardAppear {
  from { transform: translateY(10px) translateZ(0); opacity: 0; }
  to   { transform: translateY(0) translateZ(0); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .card, .emoji, .active, .checkmark { animation: none !important; }
}
```

---

## ARQUIVO 8 — `src/components/ModeBadge.jsx` + `.module.css`

Badge visível no topo de cada jogo para o aluno — informa o modo sem opção de mudá-lo:

```jsx
// ModeBadge.jsx
import { useGameMode } from '../hooks/useGameMode'
import { MODE_META }   from '../engine/ModeConfig'
import styles          from './ModeBadge.module.css'

export function ModeBadge() {
  const { mode } = useGameMode()
  const meta = MODE_META[mode]

  return (
    <div
      className={styles.badge}
      style={{ '--badge-color': meta.color, '--badge-bg': meta.colorBg }}
      aria-label={`Modo de jogo: ${meta.label}`}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{meta.badgeLabel}</span>
    </div>
  )
}
```

```css
/* ModeBadge.module.css */
.badge {
  display:       inline-flex;
  align-items:   center;
  gap:           6px;
  padding:       4px 12px;
  border-radius: 50px;
  background:    var(--badge-bg);
  border:        1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
  font-family:   'Nunito', sans-serif;
  font-weight:   700;
  font-size:     12px;
  color:         var(--badge-color);
  animation:     badgeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change:   transform;
}

@keyframes badgeIn {
  from { transform: scale(0.75) translateZ(0); opacity: 0; }
  to   { transform: scale(1) translateZ(0); opacity: 1; }
}

.dot {
  width:         7px;
  height:        7px;
  border-radius: 50%;
  background:    var(--badge-color);
  animation:     pulse 2s ease-in-out infinite;
  will-change:   transform, opacity;
}

@keyframes pulse {
  0%, 100% { transform: scale(1) translateZ(0);    opacity: 1; }
  50%      { transform: scale(1.4) translateZ(0);  opacity: 0.6; }
}

.label { line-height: 1; }

@media (prefers-reduced-motion: reduce) {
  .badge, .dot { animation: none !important; }
  .dot { opacity: 1; }
}
```

---

## INTEGRAÇÃO NO `GameShell.jsx` (arquivo já existente)

```jsx
// Adicionar ao GameShell.jsx existente — apenas os trechos novos

import { useGameMode }   from '../hooks/useGameMode'
import { ModeBadge }     from './ModeBadge'
import { getModeConfig } from '../engine/ModeConfig'

export function GameShell({ gameId, children }) {
  const { mode, difficulty, config } = useGameMode()

  // ... código existente de timer, fase, score ...

  // Adaptar o TimerDisplay conforme o modo:
  // - Modo Prática e Desafio: timer CRESCENTE (já implementado)
  // - Modo Tempo: timer REGRESSIVO com timeLimitSeconds do ModeConfig
  const timerMode = mode === 'time' ? 'countdown' : 'stopwatch'
  const timeLimit  = config.timeLimitSeconds ?? null

  return (
    <div className="game-shell">
      <header className="game-header">
        <button className="btn-back">←</button>

        {/* Badge do modo — visível para o aluno */}
        <ModeBadge />

        {/* Timer — comportamento muda com o modo */}
        <TimerDisplay
          formatted={formatted}
          isRunning={isRunning}
          mode={timerMode}
          timeLimit={timeLimit}
          compact={window.innerWidth < 400}
        />

        <div className="phase-indicator">Fase {phase}/5</div>
      </header>

      {/* Passa config do modo para o jogo filho */}
      {children({
        phase,
        modeConfig: config,          // ← NOVO: cada jogo lê isso
        onPhaseComplete: handlePhaseComplete,
        pause,
        start
      })}
    </div>
  )
}
```

---

## INTEGRAÇÃO NOS 21 JOGOS — PADRÃO DE USO

```jsx
// Padrão universal para cada game.js dos 21 jogos

export function FestaLagaraGame({ phase, modeConfig, onComplete }) {

  // Lê a config do modo — comportamento muda automaticamente
  const { isRandomized, fixedPhases, isTimedCountdown, minElements, maxElements, hasHints } = modeConfig

  // Número de elementos da fase
  const elementCount = isRandomized
    ? randomInRange(modeConfig.difficulty)  // Modo Desafio: aleatório na faixa
    : PHASES[phase - 1].folhas              // Modo Prática/Tempo: valor fixo

  // Dicas
  const showHint = hasHints  // true apenas em Prática

  // O timer regressivo (modo Tempo) é gerenciado pelo GameShell
  // O jogo apenas precisa chamar onComplete() quando o objetivo for atingido

  function handleSuccess() {
    // ... lógica de sucesso ...
    onComplete()  // GameShell cuida do timer, fase e analytics
  }

  return (
    <div>
      {/* renderizar jogo com elementCount, showHint, etc. */}
    </div>
  )
}
```

---

## PÁGINA DO PROFESSOR — `src/pages/TeacherDashboard.jsx`

```jsx
// Rota exclusiva: /professor (protegida por PIN)

import { useState }           from 'react'
import { SessionManager }     from '../auth/SessionManager'
import { ModalitySelector }   from '../components/ModalitySelector/ModalitySelector'

export function TeacherDashboard() {
  const [pin,       setPin]       = useState('')
  const [unlocked,  setUnlocked]  = useState(SessionManager.isTeacher())
  const [pinError,  setPinError]  = useState(false)

  function handleLogin() {
    if (SessionManager.loginAsTeacher(pin)) {
      setUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPin('')
    }
  }

  if (!unlocked) {
    return (
      <div className="pin-screen">
        <h1>Acesso do Professor</h1>
        <p>Digite o PIN para acessar as configurações de aula.</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="••••"
          aria-label="PIN de acesso do professor"
          aria-invalid={pinError}
        />
        {pinError && <p role="alert" className="pin-error">PIN incorreto. Tente novamente.</p>}
        <button onClick={handleLogin} disabled={pin.length !== 4}>
          Entrar
        </button>
        <p className="pin-hint">PIN padrão inicial: 1234 — troque após o primeiro acesso.</p>
      </div>
    )
  }

  return (
    <div className="teacher-dashboard">
      <header>
        <h1>🎓 Painel do Professor</h1>
        <button onClick={() => { SessionManager.logoutTeacher(); setUnlocked(false) }}>
          Sair
        </button>
      </header>

      {/* Seletor de modalidades */}
      <ModalitySelector />

      {/* Analytics da sessão atual */}
      <section>
        <h2>Dados da sessão</h2>
        <pre>{JSON.stringify(SessionManager.exportSessionData(), null, 2)}</pre>
      </section>
    </div>
  )
}
```

---

## CHECKLIST DE VALIDAÇÃO

- [ ] `ModalitySelector` não renderiza quando `isTeacher === false`
- [ ] Aluno não consegue acessar `/professor` sem PIN
- [ ] `SessionManager.setMode()` retorna `false` silenciosamente para alunos
- [ ] `useGameMode()` atualiza todos os componentes ao mudar modo (mesmo sem reload)
- [ ] `StorageEvent` sincroniza modo entre abas diferentes (professor + aluno)
- [ ] Modo Tempo usa `timeLimitSeconds` do `ModeConfig` — não hardcoded
- [ ] Modo Desafio usa `randomInRange(difficulty)` — não valor fixo
- [ ] `ModeBadge` aparece no topo de todos os 21 jogos
- [ ] Timer crescente continua funcionando em Prática e Desafio
- [ ] Timer regressivo ativa apenas no modo Tempo
- [ ] Dicas aparecem apenas no modo Prática
- [ ] PIN padrão `1234` funciona no primeiro acesso
- [ ] `SessionManager.exportSessionData()` retorna JSON válido
- [ ] Animações dos cards usam apenas `transform` e `opacity`
- [ ] `prefers-reduced-motion` desliga todas as animações decorativas
- [ ] Funciona em iOS Safari, Android Chrome e desktop
