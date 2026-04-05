# PROMPT PARA O REPLIT — SISTEMA DE TIMER PARA OS 21 JOGOS DA PLATAFORMA 123GO!

---

## CONTEXTO

A plataforma **123GO!** possui 21 jogos educacionais de matemática organizados em fases (1 a 5
por jogo). Implemente um **sistema de timer crescente** (cronômetro, não contagem regressiva)
que registre o tempo gasto por fase e por jogo, exiba de forma amigável para crianças,
persista os dados entre sessões via `localStorage`, e prepare a estrutura para futura
integração com analytics/backend.

O timer deve ser **informativo e analítico** — nunca gerar pressão ou bloquear o jogador.

---

## STACK E LOCALIZAÇÃO DOS ARQUIVOS

```
src/
├── engine/
│   ├── GameEngine.js         ← já existe — integrar timer aqui
│   ├── TimerSystem.js        ← CRIAR (lógica pura do timer)
│   └── TimerStore.js         ← CRIAR (persistência e analytics)
├── hooks/
│   └── useTimer.js           ← CRIAR (hook React para componentes)
├── components/
│   ├── TimerDisplay.jsx      ← CRIAR (UI do timer)
│   ├── TimerDisplay.module.css ← CRIAR (estilos animados)
│   └── PhaseResults.jsx      ← CRIAR (tela de resultado por fase)
└── shared/
    └── GameShell.jsx         ← já existe — adicionar <TimerDisplay /> aqui
```

---

## ARQUIVO 1 — `src/engine/TimerSystem.js`

```js
/**
 * TimerSystem.js
 * Lógica pura do cronômetro — sem dependência de React ou DOM.
 * Pode ser instanciada por qualquer jogo.
 */

export class TimerSystem {
  constructor() {
    this._startTime    = null   // timestamp do início da fase atual
    this._elapsed      = 0      // ms acumulados da fase atual (pausa incluída)
    this._intervalId   = null   // referência do setInterval
    this._isRunning    = false
    this._onTick       = null   // callback chamado a cada segundo: fn(elapsedSeconds)
    this._onStop       = null   // callback chamado ao parar: fn(elapsedSeconds)
  }

  // ─── Controles principais ───────────────────────────────────────────────────

  /**
   * Inicia ou retoma o timer.
   * Seguro chamar mesmo se já estiver rodando (idempotente).
   */
  start() {
    if (this._isRunning) return
    this._isRunning = true
    this._startTime = performance.now() - this._elapsed

    this._intervalId = setInterval(() => {
      this._elapsed = performance.now() - this._startTime
      this._onTick?.(this.getElapsedSeconds())
    }, 1000)
  }

  /**
   * Pausa o timer sem zerar.
   * Retorna os segundos decorridos no momento da pausa.
   */
  pause() {
    if (!this._isRunning) return this.getElapsedSeconds()
    this._isRunning = false
    this._elapsed   = performance.now() - this._startTime
    clearInterval(this._intervalId)
    return this.getElapsedSeconds()
  }

  /**
   * Para o timer e dispara o callback onStop.
   * Retorna os segundos decorridos.
   */
  stop() {
    const seconds = this.pause()
    this._onStop?.(seconds)
    return seconds
  }

  /**
   * Zera completamente — use ao iniciar uma nova fase.
   */
  reset() {
    clearInterval(this._intervalId)
    this._startTime  = null
    this._elapsed    = 0
    this._isRunning  = false
    this._intervalId = null
  }

  /**
   * Para, lê o tempo final e já reseta para a próxima fase.
   * Retorna os segundos da fase que acabou.
   */
  stopAndReset() {
    const seconds = this.stop()
    this.reset()
    return seconds
  }

  // ─── Leitura ────────────────────────────────────────────────────────────────

  getElapsedSeconds() {
    if (this._startTime === null) return 0
    const raw = this._isRunning
      ? performance.now() - this._startTime
      : this._elapsed
    return Math.floor(raw / 1000)
  }

  getElapsedMs() {
    if (this._startTime === null) return 0
    return this._isRunning
      ? Math.floor(performance.now() - this._startTime)
      : Math.floor(this._elapsed)
  }

  isRunning() { return this._isRunning }

  // ─── Formatação ─────────────────────────────────────────────────────────────

  /**
   * Retorna string no formato "mm:ss"
   * Exemplos: "00:05", "01:24", "10:00"
   */
  static format(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds))
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  // ─── Callbacks ──────────────────────────────────────────────────────────────

  /** Registra função chamada a cada segundo com os segundos decorridos */
  onTick(fn)  { this._onTick = fn;  return this }

  /** Registra função chamada quando o timer para */
  onStop(fn)  { this._onStop = fn;  return this }
}
```

---

## ARQUIVO 2 — `src/engine/TimerStore.js`

```js
/**
 * TimerStore.js
 * Armazena, persiste e calcula analytics dos tempos de todos os jogos.
 * Usa localStorage como camada de persistência.
 */

const STORAGE_KEY = '123go_timer_data'

export class TimerStore {
  constructor() {
    this._data = this._load()
  }

  // ─── Estrutura interna ───────────────────────────────────────────────────────
  // {
  //   [gameId]: {
  //     lastPlayed: ISO string,
  //     sessions: [
  //       {
  //         date: ISO string,
  //         phaseTimes: [fase1Sec, fase2Sec, fase3Sec, fase4Sec, fase5Sec],
  //         totalTime: number,
  //         completed: boolean
  //       }
  //     ]
  //   }
  // }

  // ─── Escrita ────────────────────────────────────────────────────────────────

  /**
   * Registra o tempo de uma fase específica.
   * @param {string|number} gameId   — id do jogo (ex: 1 ou "g01")
   * @param {number}        phase    — número da fase (1–5)
   * @param {number}        seconds  — tempo gasto em segundos
   */
  recordPhaseTime(gameId, phase, seconds) {
    this._ensureGame(gameId)
    const session = this._currentSession(gameId)
    session.phaseTimes[phase - 1] = seconds
    session.totalTime = session.phaseTimes.reduce((a, b) => a + (b || 0), 0)
    this._save()
  }

  /**
   * Marca a sessão atual como completa (todas as fases concluídas).
   */
  markGameComplete(gameId) {
    this._ensureGame(gameId)
    const session = this._currentSession(gameId)
    session.completed  = true
    session.totalTime  = session.phaseTimes.reduce((a, b) => a + (b || 0), 0)
    this._data[gameId].lastPlayed = new Date().toISOString()
    this._save()
  }

  /**
   * Inicia uma nova sessão para o jogo (chamado ao pressionar Play/Reiniciar).
   */
  startNewSession(gameId) {
    this._ensureGame(gameId)
    this._data[gameId].sessions.push({
      date:       new Date().toISOString(),
      phaseTimes: [null, null, null, null, null],
      totalTime:  0,
      completed:  false
    })
    this._save()
  }

  // ─── Leitura ────────────────────────────────────────────────────────────────

  /**
   * Retorna os dados da sessão atual do jogo.
   */
  getCurrentSession(gameId) {
    return this._currentSession(gameId)
  }

  /**
   * Retorna o melhor tempo total (menor) de um jogo nas sessões completas.
   */
  getBestTime(gameId) {
    const game = this._data[gameId]
    if (!game) return null
    const completed = game.sessions.filter(s => s.completed)
    if (!completed.length) return null
    return Math.min(...completed.map(s => s.totalTime))
  }

  /**
   * Retorna o histórico completo de sessões de um jogo.
   */
  getHistory(gameId) {
    return this._data[gameId]?.sessions ?? []
  }

  /**
   * Retorna analytics consolidados de todos os jogos.
   * Útil para dashboard futuro ou backend.
   */
  getAnalytics() {
    const result = {}
    Object.keys(this._data).forEach(gameId => {
      const sessions  = this._data[gameId].sessions
      const completed = sessions.filter(s => s.completed)
      const allTimes  = completed.map(s => s.totalTime)

      result[gameId] = {
        totalSessions:    sessions.length,
        completedSessions: completed.length,
        bestTime:         allTimes.length ? Math.min(...allTimes) : null,
        avgTime:          allTimes.length
          ? Math.round(allTimes.reduce((a,b) => a+b, 0) / allTimes.length)
          : null,
        avgPhaseBreakdown: this._avgPerPhase(completed),
        lastPlayed:       this._data[gameId].lastPlayed
      }
    })
    return result
  }

  /**
   * Exporta todos os dados como JSON — pronto para enviar a um backend.
   */
  exportJSON() {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version:    '1.0.0',
      data:       this._data
    }, null, 2)
  }

  /**
   * Limpa os dados de um jogo específico.
   */
  clearGame(gameId) {
    delete this._data[gameId]
    this._save()
  }

  /**
   * Limpa todos os dados (reset total).
   */
  clearAll() {
    this._data = {}
    this._save()
  }

  // ─── Privados ───────────────────────────────────────────────────────────────

  _ensureGame(gameId) {
    if (!this._data[gameId]) {
      this._data[gameId] = { lastPlayed: null, sessions: [] }
    }
    if (!this._data[gameId].sessions.length) {
      this.startNewSession(gameId)
    }
  }

  _currentSession(gameId) {
    const sessions = this._data[gameId]?.sessions ?? []
    return sessions[sessions.length - 1] ?? null
  }

  _avgPerPhase(completedSessions) {
    if (!completedSessions.length) return [null,null,null,null,null]
    return [0,1,2,3,4].map(i => {
      const times = completedSessions
        .map(s => s.phaseTimes[i])
        .filter(t => t !== null && t !== undefined)
      return times.length
        ? Math.round(times.reduce((a,b) => a+b, 0) / times.length)
        : null
    })
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data))
    } catch (e) {
      // localStorage cheio ou indisponível — falha silenciosamente
      console.warn('[TimerStore] Não foi possível salvar:', e.message)
    }
  }
}

// Singleton compartilhado por toda a aplicação
export const timerStore = new TimerStore()
```

---

## ARQUIVO 3 — `src/hooks/useTimer.js`

```js
/**
 * useTimer.js
 * Hook React que conecta TimerSystem ao ciclo de vida dos componentes.
 * Retorna estado reativo do timer e funções de controle.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { TimerSystem } from '../engine/TimerSystem'
import { timerStore }  from '../engine/TimerStore'

/**
 * @param {object} options
 * @param {string|number} options.gameId    — id do jogo atual
 * @param {number}        options.phase     — fase atual (1–5)
 * @param {boolean}       options.autoStart — iniciar automaticamente ao montar
 */
export function useTimer({ gameId, phase, autoStart = false }) {
  const timerRef      = useRef(new TimerSystem())
  const [seconds, setSeconds]   = useState(0)
  const [isRunning, setRunning] = useState(false)
  const [phaseTimes, setPhaseTimes] = useState([null,null,null,null,null])

  // Sincroniza o tick com o estado React
  useEffect(() => {
    const timer = timerRef.current
    timer.onTick(s => setSeconds(s))
    timer.onStop(s => setSeconds(s))

    if (autoStart) start()

    return () => {
      timer.pause() // limpa o interval ao desmontar
    }
  }, []) // eslint-disable-line

  // Reinicia o timer quando a fase muda
  useEffect(() => {
    timerRef.current.reset()
    setSeconds(0)
    if (autoStart) {
      timerRef.current.start()
      setRunning(true)
    }
  }, [phase]) // eslint-disable-line

  // ─── Funções expostas ────────────────────────────────────────────────────────

  const start = useCallback(() => {
    timerRef.current.start()
    setRunning(true)
  }, [])

  const pause = useCallback(() => {
    timerRef.current.pause()
    setRunning(false)
  }, [])

  /**
   * Chame quando a fase for concluída.
   * Salva o tempo no store e prepara para a próxima fase.
   * @returns {number} segundos gastos na fase
   */
  const completePhase = useCallback(() => {
    const elapsed = timerRef.current.stopAndReset()
    setRunning(false)
    setSeconds(0)

    // Persiste no store
    timerStore.recordPhaseTime(gameId, phase, elapsed)

    // Atualiza estado local
    setPhaseTimes(prev => {
      const next = [...prev]
      next[phase - 1] = elapsed
      return next
    })

    return elapsed
  }, [gameId, phase])

  /**
   * Chame quando o jogo inteiro for concluído (fase 5 finalizada).
   */
  const completeGame = useCallback(() => {
    timerStore.markGameComplete(gameId)
  }, [gameId])

  /**
   * Chame ao pressionar "Jogar" / iniciar nova sessão.
   */
  const startNewSession = useCallback(() => {
    timerStore.startNewSession(gameId)
    setPhaseTimes([null,null,null,null,null])
    timerRef.current.reset()
    setSeconds(0)
  }, [gameId])

  // ─── Dados derivados ─────────────────────────────────────────────────────────

  const totalTime = phaseTimes.reduce((acc, t) => acc + (t ?? 0), 0)
  const formatted = TimerSystem.format(seconds)
  const bestTime  = timerStore.getBestTime(gameId)

  return {
    // Estado
    seconds,
    formatted,       // "mm:ss" — use direto no JSX
    isRunning,
    phaseTimes,      // [seg_fase1, seg_fase2, ...]  null = não jogada ainda
    totalTime,       // soma das fases concluídas até agora
    bestTime,        // melhor tempo histórico (ou null)

    // Controles
    start,
    pause,
    completePhase,   // chamar ao finalizar cada fase
    completeGame,    // chamar ao finalizar o jogo inteiro
    startNewSession, // chamar ao apertar Play/Reiniciar
  }
}
```

---

## ARQUIVO 4 — `src/components/TimerDisplay.jsx`

```jsx
/**
 * TimerDisplay.jsx
 * Componente visual do timer — amigável para crianças, sem gerar pressão.
 * Tamanho e animações otimizados para mobile.
 */

import { useEffect, useRef } from 'react'
import { TimerSystem } from '../engine/TimerSystem'
import styles from './TimerDisplay.module.css'

/**
 * @param {object}  props
 * @param {string}  props.formatted   — "mm:ss" vindo do useTimer
 * @param {boolean} props.isRunning   — se o timer está ativo
 * @param {boolean} props.compact     — modo compacto para header pequeno
 */
export function TimerDisplay({ formatted, isRunning, compact = false }) {
  const ref = useRef(null)

  // Pulsa suavemente quando o segundo muda
  useEffect(() => {
    const el = ref.current
    if (!el || !isRunning) return
    el.classList.remove(styles.tick)
    // Force reflow para reiniciar a animação
    void el.offsetWidth
    el.classList.add(styles.tick)
  }, [formatted, isRunning])

  return (
    <div
      className={`${styles.wrapper} ${compact ? styles.compact : ''} ${isRunning ? styles.running : ''}`}
      role="timer"
      aria-label={`Tempo decorrido: ${formatted}`}
      aria-live="off"  /* não anunciar cada segundo no leitor de tela */
    >
      <span className={styles.icon} aria-hidden="true">⏱</span>
      <span className={styles.label} ref={ref}>
        {formatted}
      </span>
    </div>
  )
}
```

---

## ARQUIVO 5 — `src/components/TimerDisplay.module.css`

```css
/* ─── Container ─────────────────────────────────────────────────────────────── */
.wrapper {
  display:        inline-flex;
  align-items:    center;
  gap:            6px;
  padding:        6px 14px;
  border-radius:  50px;
  background:     rgba(255, 255, 255, 0.92);
  border:         1.5px solid rgba(0, 0, 0, 0.06);

  /* GPU-only — sem reflow */
  will-change:    transform, opacity;
  transform:      translateZ(0);

  /* Fonte amigável para crianças */
  font-family:    'Nunito', sans-serif;
  font-weight:    800;
  font-size:      18px;
  color:          #1A1A2E;
  letter-spacing: 0.02em;

  /* Transição suave ao aparecer/sumir */
  transition:     opacity 0.3s ease, transform 0.3s ease;
}

/* Quando parado */
.wrapper:not(.running) {
  opacity: 0.55;
}

/* Modo compacto — header pequeno ou mobile */
.compact {
  font-size:  14px;
  padding:    4px 10px;
  gap:        4px;
}

/* ─── Ícone ──────────────────────────────────────────────────────────────────── */
.icon {
  font-size:   16px;
  line-height: 1;

  /* Rotação suave enquanto roda */
  will-change: transform;
}

.running .icon {
  animation: spinSlow 8s linear infinite;
}

@keyframes spinSlow {
  from { transform: rotate(0deg) translateZ(0); }
  to   { transform: rotate(360deg) translateZ(0); }
}

/* ─── Número (mm:ss) ─────────────────────────────────────────────────────────── */
.label {
  will-change: transform, opacity;
  display:     inline-block;
  min-width:   52px;        /* evita layout shift ao mudar de "09:59" para "10:00" */
  text-align:  center;
  transform:   translateZ(0);
}

/* Micro-pulso a cada segundo — GPU only */
@keyframes secondTick {
  0%   { transform: scale(1) translateZ(0);    opacity: 1; }
  25%  { transform: scale(1.12) translateZ(0); opacity: 0.85; }
  60%  { transform: scale(0.97) translateZ(0); opacity: 1; }
  100% { transform: scale(1) translateZ(0);    opacity: 1; }
}

.tick {
  animation: secondTick 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ─── Entrada do componente ──────────────────────────────────────────────────── */
@keyframes timerAppear {
  from {
    transform: scale(0.7) translateY(-8px) translateZ(0);
    opacity:   0;
  }
  to {
    transform: scale(1) translateY(0) translateZ(0);
    opacity:   1;
  }
}

.wrapper {
  animation: timerAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* ─── Milestone: múltiplo de 1 minuto ───────────────────────────────────────── */
/* Aplicar via JS: wrapper.classList.add('milestone') por 1s */
@keyframes milestonePulse {
  0%   { transform: scale(1) translateZ(0);    }
  40%  { transform: scale(1.18) translateZ(0); }
  70%  { transform: scale(0.96) translateZ(0); }
  100% { transform: scale(1) translateZ(0);    }
}

.milestone {
  animation: milestonePulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-color: rgba(91, 79, 207, 0.3);
  color:        #5B4FCF;
}

/* ─── Parado com fadeout ─────────────────────────────────────────────────────── */
@keyframes timerStop {
  0%   { transform: scale(1) translateZ(0);    opacity: 1;    }
  30%  { transform: scale(1.08) translateZ(0); opacity: 1;    }
  100% { transform: scale(1) translateZ(0);    opacity: 0.45; }
}

.stopped {
  animation: timerStop 0.4s ease forwards;
}

/* ─── Responsividade ─────────────────────────────────────────────────────────── */
@media (max-width: 375px) {
  .wrapper { font-size: 15px; padding: 5px 10px; }
  .icon    { font-size: 13px; }
}

/* ─── Modo escuro ────────────────────────────────────────────────────────────── */
@media (prefers-color-scheme: dark) {
  .wrapper {
    background:   rgba(30, 30, 50, 0.92);
    border-color: rgba(255, 255, 255, 0.08);
    color:        #F0F0FF;
  }
}

/* ─── Movimento reduzido ─────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .tick, .running .icon, .milestone, .stopped {
    animation: none !important;
  }
}
```

---

## ARQUIVO 6 — `src/components/PhaseResults.jsx`

```jsx
/**
 * PhaseResults.jsx
 * Tela de resultados exibida ao concluir todas as 5 fases.
 * Mostra tempo por fase, tempo total e melhor tempo histórico.
 */

import { TimerSystem } from '../engine/TimerSystem'
import styles from './PhaseResults.module.css'

const PHASE_LABELS = ['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4', 'Fase 5']
const PHASE_EMOJIS = ['🌱', '🌿', '🌳', '⭐', '🏆']

export function PhaseResults({ phaseTimes, totalTime, bestTime, onReplay, onNext }) {
  const isNewRecord = bestTime !== null && totalTime <= bestTime

  return (
    <div className={styles.container} role="dialog" aria-label="Resultado do jogo">

      {/* Cabeçalho */}
      <div className={styles.header}>
        <span className={styles.trophy} aria-hidden="true">
          {isNewRecord ? '🏆' : '🎉'}
        </span>
        <h2 className={styles.title}>
          {isNewRecord ? 'Novo recorde!' : 'Fase concluída!'}
        </h2>
        {isNewRecord && (
          <p className={styles.recordBadge}>✨ Melhor tempo!</p>
        )}
      </div>

      {/* Tempo total em destaque */}
      <div className={styles.totalBox} aria-label={`Tempo total: ${TimerSystem.format(totalTime)}`}>
        <span className={styles.totalLabel}>⏱ Tempo total</span>
        <span className={styles.totalTime}>{TimerSystem.format(totalTime)}</span>
        {bestTime !== null && (
          <span className={styles.bestTime}>
            Melhor: {TimerSystem.format(bestTime)}
          </span>
        )}
      </div>

      {/* Breakdown por fase */}
      <div className={styles.phaseList} role="list">
        {phaseTimes.map((t, i) => (
          <div
            key={i}
            className={`${styles.phaseRow} ${t === null ? styles.skipped : ''}`}
            role="listitem"
            aria-label={`${PHASE_LABELS[i]}: ${t !== null ? TimerSystem.format(t) : 'não jogada'}`}
          >
            <span className={styles.phaseEmoji} aria-hidden="true">
              {PHASE_EMOJIS[i]}
            </span>
            <span className={styles.phaseName}>{PHASE_LABELS[i]}</span>
            <span className={styles.phaseTime}>
              {t !== null ? TimerSystem.format(t) : '—'}
            </span>

            {/* Barra de proporção visual */}
            {t !== null && totalTime > 0 && (
              <div
                className={styles.phaseBar}
                style={{ '--pct': `${Math.round((t / totalTime) * 100)}%` }}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className={styles.actions}>
        <button className={styles.btnReplay} onClick={onReplay} aria-label="Jogar novamente">
          🔄 Jogar de novo
        </button>
        {onNext && (
          <button className={styles.btnNext} onClick={onNext} aria-label="Próximo jogo">
            Próximo jogo →
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## ARQUIVO 7 — `src/components/PhaseResults.module.css`

```css
.container {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            20px;
  padding:        28px 24px;
  max-width:      400px;
  margin:         0 auto;
  animation:      resultsAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change:    transform, opacity;
}

@keyframes resultsAppear {
  from { transform: scale(0.85) translateY(20px) translateZ(0); opacity: 0; }
  to   { transform: scale(1) translateY(0) translateZ(0); opacity: 1; }
}

/* Troféu */
.trophy {
  font-size:  56px;
  display:    block;
  animation:  trophyBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  will-change: transform;
}

@keyframes trophyBounce {
  from { transform: scale(0) rotate(-20deg) translateZ(0); }
  to   { transform: scale(1) rotate(0deg) translateZ(0); }
}

.title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size:   22px;
  color:       #1A1A2E;
  text-align:  center;
}

.recordBadge {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size:   13px;
  color:       #5B4FCF;
  background:  rgba(91,79,207,0.1);
  padding:     4px 12px;
  border-radius: 50px;
}

/* Caixa do tempo total */
.totalBox {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            4px;
  padding:        20px 32px;
  background:     #F7F8FC;
  border-radius:  20px;
  border:         1.5px solid rgba(91,79,207,0.15);
  width:          100%;
  animation:      totalAppear 0.4s ease 0.3s both;
  will-change:    transform, opacity;
}

@keyframes totalAppear {
  from { transform: translateY(12px) translateZ(0); opacity: 0; }
  to   { transform: translateY(0) translateZ(0); opacity: 1; }
}

.totalLabel {
  font-size:   13px;
  color:       #5A5A7A;
  font-weight: 600;
}

.totalTime {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size:   40px;
  color:       #1A1A2E;
  letter-spacing: -0.02em;
  line-height: 1;
}

.bestTime {
  font-size:  12px;
  color:      #9090B0;
}

/* Lista de fases */
.phaseList {
  display:        flex;
  flex-direction: column;
  gap:            8px;
  width:          100%;
}

.phaseRow {
  display:     grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap:         8px;
  padding:     10px 14px;
  background:  #ffffff;
  border-radius: 12px;
  border:      1.5px solid #E8E8F0;
  position:    relative;
  overflow:    hidden;
  animation:   rowSlide 0.35s ease both;
  will-change: transform, opacity;
}

/* Stagger das linhas */
.phaseRow:nth-child(1) { animation-delay: 0.35s; }
.phaseRow:nth-child(2) { animation-delay: 0.42s; }
.phaseRow:nth-child(3) { animation-delay: 0.49s; }
.phaseRow:nth-child(4) { animation-delay: 0.56s; }
.phaseRow:nth-child(5) { animation-delay: 0.63s; }

@keyframes rowSlide {
  from { transform: translateX(-16px) translateZ(0); opacity: 0; }
  to   { transform: translateX(0) translateZ(0); opacity: 1; }
}

.phaseEmoji { font-size: 16px; }
.phaseName  { font-size: 13px; font-weight: 600; color: #5A5A7A; }
.phaseTime  { font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 14px; color: #1A1A2E; }

/* Barra de proporção */
.phaseBar {
  position:   absolute;
  bottom:     0;
  left:       0;
  height:     3px;
  width:      var(--pct, 0%);
  background: linear-gradient(90deg, #5B4FCF, #E91E8C);
  border-radius: 0 2px 2px 0;
  animation:  barGrow 0.6s ease both;
  will-change: transform;
  transform-origin: left;
}

@keyframes barGrow {
  from { transform: scaleX(0) translateZ(0); }
  to   { transform: scaleX(1) translateZ(0); }
}

.skipped { opacity: 0.45; }

/* Botões */
.actions {
  display:   flex;
  gap:       10px;
  width:     100%;
  flex-wrap: wrap;
}

.btnReplay, .btnNext {
  flex:         1;
  min-height:   48px;
  border-radius: 50px;
  border:       none;
  font-family:  'Nunito', sans-serif;
  font-weight:  800;
  font-size:    15px;
  cursor:       pointer;
  transition:   transform 0.15s ease, opacity 0.15s ease;
  touch-action: manipulation;
  will-change:  transform;
}

.btnReplay {
  background: #F0EFF9;
  color:      #5B4FCF;
}

.btnNext {
  background: linear-gradient(135deg, #5B4FCF, #E91E8C);
  color:      #ffffff;
}

.btnReplay:active, .btnNext:active {
  transform: scale(0.96) translateZ(0);
  opacity:   0.9;
}

@media (max-width: 360px) {
  .totalTime { font-size: 32px; }
  .actions   { flex-direction: column; }
}
```

---

## INTEGRAÇÃO NO `GameShell.jsx` (arquivo já existente)

Adicione o `TimerDisplay` e conecte o `useTimer` no shell compartilhado:

```jsx
// GameShell.jsx — trecho relevante com o timer integrado

import { useTimer }      from '../hooks/useTimer'
import { TimerDisplay }  from './TimerDisplay'
import { PhaseResults }  from './PhaseResults'

export function GameShell({ gameId, children }) {
  const [phase, setPhase]           = useState(1)
  const [showResults, setResults]   = useState(false)

  const {
    formatted, isRunning, phaseTimes, totalTime, bestTime,
    start, pause, completePhase, completeGame, startNewSession
  } = useTimer({ gameId, phase, autoStart: true })

  // Chamado pelos jogos filhos via prop ou context
  function handlePhaseComplete() {
    const elapsed = completePhase()  // para o timer, salva, retorna segundos
    if (phase < 5) {
      setPhase(p => p + 1)           // avança fase — useTimer reinicia automaticamente
    } else {
      completeGame()
      setResults(true)
    }
  }

  if (showResults) {
    return (
      <PhaseResults
        phaseTimes={phaseTimes}
        totalTime={totalTime}
        bestTime={bestTime}
        onReplay={() => {
          startNewSession()
          setPhase(1)
          setResults(false)
          start()
        }}
      />
    )
  }

  return (
    <div className="game-shell">

      {/* Barra superior */}
      <header className="game-header">
        <button className="btn-back" onClick={() => pause()}>←</button>

        {/* Timer — sempre visível no topo */}
        <TimerDisplay
          formatted={formatted}
          isRunning={isRunning}
          compact={window.innerWidth < 400}
        />

        <div className="phase-indicator">
          Fase {phase}/5
        </div>
      </header>

      {/* Conteúdo do jogo */}
      {children({ phase, onPhaseComplete: handlePhaseComplete, pause, start })}

    </div>
  )
}
```

---

## COMO APLICAR NOS 21 JOGOS — PADRÃO DE USO

Cada jogo segue este padrão exato dentro do `GameShell`:

```jsx
// Exemplo: g01-festa-lagarta/FestaLagarta.jsx

export default function FestaLagarta() {
  return (
    <GameShell gameId="g01">
      {({ phase, onPhaseComplete, pause, start }) => (
        <FestaLagaraGame
          phase={phase}
          onComplete={onPhaseComplete}  // ← chamar quando fase for concluída
          onPause={pause}
          onResume={start}
        />
      )}
    </GameShell>
  )
}
```

**Regra:** cada jogo chama `onPhaseComplete()` quando o jogador conclui os objetivos
da fase. O GameShell cuida de tudo: parar o timer, salvar o tempo, avançar a fase
e exibir os resultados.

---

## COMANDOS DE INSTALAÇÃO

Nenhuma dependência nova é necessária — o sistema usa apenas:
- React (já instalado)
- Web API nativa `performance.now()` (disponível em todos os browsers)
- `localStorage` nativo

```bash
# Nenhum npm install adicional necessário.
# Apenas criar os arquivos listados acima e importar nos jogos.

# Para verificar se o localStorage funciona no ambiente Replit:
node -e "console.log(typeof localStorage)"
# Se retornar 'undefined' no Node (esperado), o código roda normalmente no browser.
```

---

## CHECKLIST DE VALIDAÇÃO

Após implementar, verificar em todos os 21 jogos:

- [ ] Timer inicia automaticamente quando a fase carrega
- [ ] Timer aparece no topo da tela em todas as fases
- [ ] Timer para exatamente quando `onPhaseComplete()` é chamado
- [ ] Ao avançar de fase o cronômetro zera e reinicia do zero
- [ ] Ao concluir a fase 5, a tela `PhaseResults` é exibida
- [ ] `PhaseResults` mostra o tempo de cada fase individualmente
- [ ] `PhaseResults` mostra o tempo total somado corretamente
- [ ] `TimerStore` salva os dados em `localStorage`
- [ ] Ao recarregar a página, `bestTime` continua correto
- [ ] `timerStore.getAnalytics()` retorna dados estruturados no console
- [ ] `timerStore.exportJSON()` gera JSON válido (testar com `JSON.parse`)
- [ ] Timer não trava, não pula segundos e não causa memory leak
- [ ] Animação de pulso (`.tick`) ocorre a cada segundo sem jank
- [ ] `prefers-reduced-motion` desliga as animações do timer
- [ ] Funciona em iOS Safari, Android Chrome e desktop
- [ ] Nenhum `console.error` relacionado ao timer no DevTools
