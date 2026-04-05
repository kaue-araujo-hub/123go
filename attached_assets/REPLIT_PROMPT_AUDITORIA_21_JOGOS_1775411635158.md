# PROMPT PARA O REPLIT — AUDITORIA E CORREÇÃO DE LÓGICA
## Plataforma 123GO! · Todos os 21 Jogos · Todas as Fases · Todos os Anos

---

## OBJETIVO DESTE PROMPT

Executar uma **auditoria completa e correção sistemática** de todos os 21 jogos da
plataforma 123GO!. Cada jogo tem 5 fases. O problema reportado é:

> "Todos os jogos, em algum momento (fase 1, 2, 3, 4 ou 5), têm lógica bugada.
> Às vezes elementos errados, lógica ruim onde o jogador sequer joga. Em outras,
> a interação de clicar e arrastar, clicar e segurar, ou clique rápido não funciona."

Este prompt não reescreve os jogos do zero. Ele **audita, diagnostica e corrige**
cada ponto específico sem quebrar o que já funciona.

---

## ARQUITETURA EXISTENTE (NÃO ALTERAR)

```
src/
├── engine/
│   ├── GameEngine.js          ← motor base (herdado por todos os jogos)
│   ├── AudioSystem.js         ← Web Audio API nativa
│   ├── PhaseManager.js        ← controle de fases 1–5
│   ├── FeedbackSystem.js      ← successBounce, errorShake, partículas
│   ├── ModeConfig.js          ← prática / desafio / tempo
│   ├── TimerSystem.js         ← cronômetro crescente
│   └── TimerStore.js          ← localStorage
├── hooks/
│   ├── useSwipe.js            ← useDrag com Pointer Events API
│   └── useTap.js              ← tap, doubleTap, hold
├── auth/
│   └── SessionManager.js      ← professor/aluno, PIN, sessão
└── components/
    ├── GameShell.jsx           ← wrapper: timer, badge, progresso, fases
    ├── HowToPlay/             ← tela "Como Jogar" + mini desafios
    └── StartCountdown/        ← animação 1→2→3→GO!
```

**Regras invioláveis ao corrigir:**
- Nunca usar `top/left/width/height` em animações — apenas `transform` e `opacity`
- `will-change: transform` em todo elemento com animação contínua
- Touch targets ≥ 44×44px
- `useDrag` via Pointer Events API (já implementado) — nunca substituir por `onMouseDown` puro
- `useTap` via Pointer Events API — nunca substituir por `onClick` puro em jogos
- `audio.init()` chamado na primeira interação do usuário (política de autoplay)
- Máximo 12 partículas por burst (performance mobile)

---

## METODOLOGIA DE AUDITORIA

Para **cada um dos 21 jogos**, execute este processo na ordem:

### ETAPA A — Diagnóstico (rode antes de qualquer correção)

```
1. Abrir o jogo no browser
2. Abrir DevTools → Console (filtrar por Errors e Warnings)
3. Abrir DevTools → Performance → gravar 10s de gameplay
4. Verificar cada item do CHECKLIST DE DIAGNÓSTICO abaixo
5. Registrar todos os bugs encontrados antes de corrigir qualquer um
```

### CHECKLIST DE DIAGNÓSTICO (aplicar a cada jogo, cada fase)

```
INTERAÇÃO:
[ ] O elemento arrastável responde ao toque/mouse imediatamente (< 50ms)?
[ ] O drag segue o dedo/mouse sem lag?
[ ] Ao soltar fora da zona, o elemento volta à posição original suavemente?
[ ] O tap registra na primeira tentativa (sem double-tap acidental)?
[ ] O hold acumula progresso sem travar?
[ ] Soltar antes de completar o hold reseta suavemente (sem crash)?
[ ] O swipe detecta direção corretamente (não confunde horizontal com vertical)?
[ ] setPointerCapture() está sendo chamado no pointerdown do drag?
[ ] touch-action: none está no elemento arrastável?
[ ] user-select: none está no elemento arrastável?

LÓGICA DE FASE:
[ ] A condição de avanço de fase está correta (quantos acertos = fase completa)?
[ ] A fase não avança com 0 acertos?
[ ] A fase não trava (nunca avança mesmo com todos acertos corretos)?
[ ] Elementos da fase são gerados com quantidade correta (ver tabela dos 21 jogos)?
[ ] A dificuldade da fase N+1 é maior que a fase N?
[ ] Ao reiniciar uma fase, o estado anterior é completamente limpo?
[ ] Números/quantidades aleatórias estão dentro dos limites definidos?
[ ] A resposta correta está sempre presente nas opções exibidas?
[ ] Não há duas respostas corretas ao mesmo tempo?

ESTADO DO JOGO:
[ ] O score não regride ao avançar de fase?
[ ] O timer não reinicia quando não deveria?
[ ] O timer não continua rodando quando o jogo está pausado/em modal?
[ ] O estado da fase anterior não vaza para a próxima fase?
[ ] Os elementos da fase anterior são removidos do DOM ao avançar?
[ ] EventListeners da fase anterior são removidos (sem listener leak)?

FEEDBACK:
[ ] Som de acerto toca em < 100ms após ação correta?
[ ] Som de erro toca em < 100ms após ação errada?
[ ] Animação de acerto (successBounce) é visível?
[ ] Animação de erro (errorShake) é visível?
[ ] Partículas aparecem no acerto?
[ ] Fase completa tem celebração (jingle + estrelinhas)?
[ ] Jogo completo tem confete?

ACESSIBILIDADE/RESPONSIVIDADE:
[ ] Funciona em viewport de 375px (iPhone SE)?
[ ] Funciona em viewport de 768px (iPad)?
[ ] Todos os alvos interativos têm min 44×44px?
[ ] Sem overflow horizontal na tela do jogo?
```

---

## CORREÇÕES OBRIGATÓRIAS POR TIPO DE BUG

### BUG TIPO 1 — Drag não funciona (elemento não segue o toque)

**Causa raiz mais comum:** `touch-action` não definido, `setPointerCapture` ausente,
ou `e.preventDefault()` chamado no elemento pai bloqueando o evento.

**Correção padrão — aplicar em TODO elemento arrastável dos 21 jogos:**

```jsx
// Em cada componente de item arrastável (Folha, Vagão, Alien, etc.)
// SUBSTITUIR qualquer implementação de drag por este padrão:

import { useRef, useState, useEffect } from 'react'

function useDragFixed({ onDragStart, onDragMove, onDragEnd, disabled = false }) {
  const ref        = useRef(null)
  const dragging   = useRef(false)
  const startPos   = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    // CRÍTICO: impede scroll da página durante o drag
    el.style.touchAction  = 'none'
    el.style.userSelect   = 'none'
    el.style.webkitUserSelect = 'none'
    el.style.cursor       = 'grab'

    function onPointerDown(e) {
      // CRÍTICO: captura o pointer — mantém eventos mesmo saindo do elemento
      el.setPointerCapture(e.pointerId)
      dragging.current = true
      startPos.current = { x: e.clientX, y: e.clientY }
      currentPos.current = { x: 0, y: 0 }
      el.style.cursor = 'grabbing'
      el.style.zIndex = '1000'
      onDragStart?.({ x: e.clientX, y: e.clientY, element: el })
    }

    function onPointerMove(e) {
      if (!dragging.current) return
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      currentPos.current = { x: dx, y: dy }
      // CRÍTICO: usar transform, nunca left/top
      el.style.transform = `translate(${dx}px, ${dy}px) translateZ(0) scale(1.05)`
      onDragMove?.({ x: e.clientX, y: e.clientY, dx, dy })
    }

    function onPointerUp(e) {
      if (!dragging.current) return
      dragging.current = false
      el.style.cursor = 'grab'
      el.style.zIndex = ''
      onDragEnd?.({
        x:  e.clientX,
        y:  e.clientY,
        dx: e.clientX - startPos.current.x,
        dy: e.clientY - startPos.current.y,
        finalAbsX: e.clientX,
        finalAbsY: e.clientY
      })
    }

    function onPointerCancel(e) {
      if (!dragging.current) return
      dragging.current = false
      // Retorna à posição original com transição suave
      el.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      el.style.transform  = 'translate(0,0) translateZ(0) scale(1)'
      setTimeout(() => { el.style.transition = '' }, 300)
      onDragEnd?.({ x: e.clientX, y: e.clientY, dx: 0, dy: 0, cancelled: true })
    }

    el.addEventListener('pointerdown',   onPointerDown)
    el.addEventListener('pointermove',   onPointerMove)
    el.addEventListener('pointerup',     onPointerUp)
    el.addEventListener('pointercancel', onPointerCancel)

    return () => {
      el.removeEventListener('pointerdown',   onPointerDown)
      el.removeEventListener('pointermove',   onPointerMove)
      el.removeEventListener('pointerup',     onPointerUp)
      el.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [disabled, onDragStart, onDragMove, onDragEnd])

  return ref
}
```

**Função de hitbox para detectar drop na zona correta:**

```js
// Usar getBoundingClientRect() — mais confiável que coordenadas relativas
function isInsideDropZone(pointerAbsX, pointerAbsY, dropZoneRef, margin = 20) {
  if (!dropZoneRef.current) return false
  const rect = dropZoneRef.current.getBoundingClientRect()
  return (
    pointerAbsX >= rect.left   - margin &&
    pointerAbsX <= rect.right  + margin &&
    pointerAbsY >= rect.top    - margin &&
    pointerAbsY <= rect.bottom + margin
  )
}
```

**Retorno suave ao errar o drop:**

```js
// Chamar quando o drop foi fora da zona
function returnToOrigin(el) {
  el.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
  el.style.transform  = 'translate(0,0) translateZ(0) scale(1)'
  setTimeout(() => { el.style.transition = '' }, 350)
}
```

---

### BUG TIPO 2 — Tap não registra / registra duplo

**Causa raiz mais comum:** `onClick` em vez de Pointer Events, ausência de
`touch-action: manipulation`, ou conflito entre `pointerdown` e `click`.

**Correção padrão — aplicar em TODO elemento tocável:**

```jsx
// SUBSTITUIR onClick por este hook em todos os elementos tocáveis dos jogos:

function useTapFixed({ onTap, onDoubleTap, disabled = false }) {
  const ref         = useRef(null)
  const lastTap     = useRef(0)
  const tapTimer    = useRef(null)
  const pointerDown = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    // CRÍTICO: remove o delay de 300ms do iOS
    el.style.touchAction = 'manipulation'
    el.style.userSelect  = 'none'
    el.style.webkitUserSelect = 'none'
    el.style.cursor      = 'pointer'

    function onPointerDown(e) {
      pointerDown.current = true
    }

    function onPointerUp(e) {
      if (!pointerDown.current) return
      pointerDown.current = false

      // Micro-feedback visual imediato (< 16ms)
      el.style.transform = 'scale(0.93) translateZ(0)'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)'
          el.style.transform  = 'scale(1) translateZ(0)'
          setTimeout(() => { el.style.transition = '' }, 200)
        })
      })

      const now     = Date.now()
      const elapsed = now - lastTap.current

      if (elapsed < 300 && elapsed > 0 && onDoubleTap) {
        // Double tap
        clearTimeout(tapTimer.current)
        onDoubleTap({ x: e.clientX, y: e.clientY })
      } else {
        // Single tap — aguarda 300ms para confirmar que não é double tap
        if (onDoubleTap) {
          tapTimer.current = setTimeout(() => {
            onTap?.({ x: e.clientX, y: e.clientY })
          }, 300)
        } else {
          // Sem onDoubleTap: dispara imediatamente
          onTap?.({ x: e.clientX, y: e.clientY })
        }
      }

      lastTap.current = now
    }

    function onPointerLeave() {
      pointerDown.current = false
    }

    el.addEventListener('pointerdown',  onPointerDown)
    el.addEventListener('pointerup',    onPointerUp)
    el.addEventListener('pointerleave', onPointerLeave)
    el.addEventListener('pointercancel',onPointerLeave)

    return () => {
      clearTimeout(tapTimer.current)
      el.removeEventListener('pointerdown',  onPointerDown)
      el.removeEventListener('pointerup',    onPointerUp)
      el.removeEventListener('pointerleave', onPointerLeave)
      el.removeEventListener('pointercancel',onPointerLeave)
    }
  }, [disabled, onTap, onDoubleTap])

  return ref
}
```

---

### BUG TIPO 3 — Hold trava ou não acumula progresso

**Causa raiz mais comum:** `setInterval` não limpo ao soltar, progresso calculado
com `Date.now()` em vez de `performance.now()`, ou ausência de cleanup no `useEffect`.

**Correção padrão:**

```jsx
function useHoldFixed({ onHoldComplete, holdDuration = 2000, disabled = false }) {
  const ref          = useRef(null)
  const holding      = useRef(false)
  const startTime    = useRef(null)
  const rafId        = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    el.style.touchAction  = 'none'
    el.style.userSelect   = 'none'
    el.style.webkitUserSelect = 'none'

    function startHold(e) {
      el.setPointerCapture(e.pointerId)
      holding.current   = true
      startTime.current = performance.now()

      function tick() {
        if (!holding.current) return
        const elapsed = performance.now() - startTime.current
        const pct     = Math.min((elapsed / holdDuration) * 100, 100)
        setProgress(pct)

        if (pct >= 100) {
          holding.current = false
          onHoldComplete?.()
        } else {
          rafId.current = requestAnimationFrame(tick)
        }
      }
      rafId.current = requestAnimationFrame(tick)
    }

    function endHold() {
      if (!holding.current) return
      holding.current = false
      cancelAnimationFrame(rafId.current)
      // Esvazia suavemente com CSS transition
      setProgress(0)
    }

    el.addEventListener('pointerdown',  startHold)
    el.addEventListener('pointerup',    endHold)
    el.addEventListener('pointerleave', endHold)
    el.addEventListener('pointercancel',endHold)

    return () => {
      cancelAnimationFrame(rafId.current)
      el.removeEventListener('pointerdown',  startHold)
      el.removeEventListener('pointerup',    endHold)
      el.removeEventListener('pointerleave', endHold)
      el.removeEventListener('pointercancel',endHold)
    }
  }, [disabled, holdDuration, onHoldComplete])

  return { ref, progress }
}
```

---

### BUG TIPO 4 — Estado vaza entre fases (elementos da fase anterior persistem)

**Causa raiz mais comum:** `useState` inicializado uma vez e não resetado ao mudar de fase,
ou elementos criados com `document.createElement` sem remoção no cleanup.

**Correção padrão — aplicar no início de cada jogo que usa `useEffect` por fase:**

```jsx
// PADRÃO: toda fase tem sua própria key para forçar remontagem limpa
// Usar key={`game-${gameId}-phase-${phase}`} no componente raiz da fase

// ERRADO:
<PhaseContent phase={phase} />

// CORRETO — força desmontagem/remontagem ao trocar de fase:
<PhaseContent
  key={`g${gameId}-phase${phase}`}
  phase={phase}
  modeConfig={modeConfig}
  onComplete={onPhaseComplete}
/>

// Isso garante que useState, useRef e useEffect são resetados do zero
// Não é necessário limpar manualmente o estado da fase anterior
```

**Limpeza de EventListeners em fases com `document.addEventListener`:**

```js
// PADRÃO para qualquer fase que adiciona listeners globais:
useEffect(() => {
  // ... adiciona listeners ...
  return () => {
    // OBRIGATÓRIO: limpar TODOS os listeners adicionados neste effect
    // Verificar: toda função passada para addEventListener tem removeEventListener correspondente
    // com a MESMA referência de função (não criar nova função no remove)
  }
}, [phase]) // phase como dependência garante reset ao mudar de fase
```

---

### BUG TIPO 5 — Condição de vitória nunca dispara (fase trava)

**Causa raiz mais comum:** contagem de acertos não é comparada corretamente com o total
exigido, ou `useEffect` com dependência desatualizada (closure stale).

**Correção padrão:**

```jsx
// ERRADO — closure stale: correctCount sempre lê o valor inicial (0)
useEffect(() => {
  document.addEventListener('gameEvent', () => {
    if (correctCount === requiredCount) advancePhase() // BUG: correctCount = 0 sempre
  })
}, [])

// CORRETO — usar ref para valor sempre atualizado dentro de callbacks:
const correctCountRef = useRef(0)

function handleCorrect() {
  correctCountRef.current++
  setCorrectCount(correctCountRef.current) // atualiza UI
  if (correctCountRef.current >= requiredCount) {
    advancePhase()
  }
}

// OU usar useCallback com dependências corretas:
const handleCorrect = useCallback(() => {
  setCorrectCount(prev => {
    const next = prev + 1
    if (next >= requiredCount) {
      // Chamar advancePhase via setTimeout para não chamar durante render
      setTimeout(advancePhase, 0)
    }
    return next
  })
}, [requiredCount, advancePhase])
```

---

### BUG TIPO 6 — Condição de vitória dispara múltiplas vezes (fase avança 2x)

**Causa raiz mais comum:** condição de vitória verificada em evento que pode ser
disparado múltiplas vezes antes do estado ser atualizado.

**Correção padrão — flag de proteção:**

```jsx
const phaseCompletedRef = useRef(false)

function checkVictory(newCount) {
  // PROTEÇÃO: garante que advancePhase é chamado no máximo 1 vez por fase
  if (phaseCompletedRef.current) return
  if (newCount >= requiredCount) {
    phaseCompletedRef.current = true
    // Aguardar animação de sucesso antes de avançar
    setTimeout(() => {
      onPhaseComplete()
    }, 800)
  }
}

// CRÍTICO: resetar a flag ao montar (quando key muda, componente remonta do zero)
// Com o padrão key={`g${gameId}-phase${phase}`}, isso é automático
```

---

## CORREÇÕES ESPECÍFICAS POR JOGO

### G01 — Festa da Lagarta

**Bugs conhecidos por fase:**

```
FASE 1 (contar até 5 folhas):
- Bug: folhas podem ser arrastadas e "engolidas" antes da fase inicializar completamente
- Correção: desabilitar drag até `phaseReady === true` (setState após mount + 300ms)
- Bug: lagarta não cresce após engolir folha
- Correção: garantir que gsap.to(lagarteRef, { scaleX: newScale }) usa a ref correta,
  não um snapshot do DOM. Verificar se a ref está attachada antes da animação.

FASE 2 (até 10 folhas):
- Bug: contador de folhas engolidas não reseta ao iniciar a fase 2
- Correção: counter é um useRef — resetar para 0 no useEffect([phase])
- Bug: folhas geradas em posições sobrepostas (umas em cima das outras)
- Correção: algoritmo de posicionamento com grid ou checagem de colisão:
  function getRandomPosition(existingPositions, containerWidth, containerHeight) {
    const MIN_DIST = 80  // px mínimos entre folhas
    let pos, attempts = 0
    do {
      pos = {
        x: 40 + Math.random() * (containerWidth - 80),
        y: 40 + Math.random() * (containerHeight - 80)
      }
      attempts++
    } while (
      attempts < 50 &&
      existingPositions.some(p => Math.hypot(p.x - pos.x, p.y - pos.y) < MIN_DIST)
    )
    return pos
  }

FASE 3 (pareamento — agrupamento de 2):
- Bug: mecânica de pareamento não está clara — criar zona de staging:
  - Área "segurando" onde a criança coloca as 2 folhas antes de soltar na boca
  - Botão "Soltar!" aparece quando 2 folhas estão na zona
  - Se soltar com número errado: folhas voltam com errorShake

FASE 4 (velocidade):
- Bug: folhas "teleportam" para posição nova ao aumentar velocidade
- Correção: velocidade aumenta gradualmente via CSS transition-duration

FASE 5 (agrupamento de 3):
- Bug: fase 5 usa a mesma lógica da fase 3 (pareamento de 2)
- Correção: `groupSize` deve ser lido do PhaseManager, não hardcoded:
  const { groupSize } = PHASES[phase - 1]  // fase5: groupSize = 3
```

---

### G02 — Par ou Ímpar?

```
FASE 1 (4 elementos):
- Bug: às vezes gera 4 elementos todos com par (nenhum solitário)
- Correção: geração SEMPRE cria (N-1) pares + 1 solitário:
  function generateItems(pairCount, theme) {
    const items = []
    const available = [...theme.itens]
    // Adicionar pares
    for (let i = 0; i < pairCount; i++) {
      const item = available[i % available.length]
      items.push({ id: `${i}a`, value: item, hasPair: true, pairId: i })
      items.push({ id: `${i}b`, value: item, hasPair: true, pairId: i })
    }
    // Adicionar solitário (diferente dos pares)
    const solitario = available.find(a => !items.some(it => it.value === a))
                   ?? available[available.length - 1] + '_solo'
    items.push({ id: 'solo', value: solitario, hasPair: false, pairId: null })
    return shuffle(items)
  }

FASE 3 (pares escondidos atrás de nuvens):
- Bug: nuvem revelada por hover em vez de tap (não funciona em touch)
- Correção: revelar via onPointerDown, NÃO via CSS :hover

FASE 4 (ritmo):
- Bug: metrônomo não sincroniza com o piscar do elemento solitário
- Correção: usar único requestAnimationFrame como fonte de tempo:
  const BPM = 90
  const INTERVAL_MS = (60 / BPM) * 1000
  let lastBeat = performance.now()
  function rhythmLoop(now) {
    if (now - lastBeat >= INTERVAL_MS) {
      setSolitarioPulsing(true)
      setTimeout(() => setSolitarioPulsing(false), INTERVAL_MS * 0.4)
      lastBeat = now
    }
    rafId.current = requestAnimationFrame(rhythmLoop)
  }
  // Iniciar e limpar no useEffect da fase 4
```

---

### G03 — Caça Estrelas

```
FASE 1 (flash 2s, até 5 estrelas):
- Bug: botões de resposta aparecem ANTES do flash terminar
- Correção: mostrar botões apenas após o flash terminar:
  useEffect(() => {
    setShowStars(true)
    setShowButtons(false)
    const hideTimer = setTimeout(() => {
      setShowStars(false)
      setShowButtons(true)  // só aqui
    }, PHASES[phase-1].flashDuration)
    return () => clearTimeout(hideTimer)
  }, [currentRound])

- Bug: resposta correta não está garantida entre as 3 opções
- Correção:
  function generateOptions(correct) {
    const opts = new Set([correct])
    while (opts.size < 3) {
      const rand = Math.max(1, correct + Math.floor(Math.random() * 7) - 3)
      if (rand !== correct) opts.add(rand)
    }
    return shuffle([...opts])
  }

FASE 4 (comparação de 2 céus):
- Bug: pergunta "qual tem mais" não muda — sempre mostra o mesmo céu como correto
- Correção: alternar pergunta aleatoriamente entre "mais" e "menos":
  const [question, setQuestion] = useState(null)
  useEffect(() => {
    const q = Math.random() > 0.5 ? 'mais' : 'menos'
    setQuestion(q)
    setCorrecto(q === 'mais' ? Math.max(sky1, sky2) : Math.min(sky1, sky2))
  }, [currentRound])

FASE 5 (ordenar 3 céus):
- Bug: drag para ordenar não funciona porque usa onClick para reordenar
- Correção: implementar ordenação por tap (toca → seleciona, toca outra → troca posição):
  const [selected, setSelected] = useState(null)
  function handleSkyTap(index) {
    if (selected === null) {
      setSelected(index)
    } else {
      // Troca os dois selecionados
      const newOrder = [...skyOrder]
      ;[newOrder[selected], newOrder[index]] = [newOrder[index], newOrder[selected]]
      setSkyOrder(newOrder)
      setSelected(null)
      checkOrder(newOrder)
    }
  }
```

---

### G04 — Loja de Balas

```
FASE 1 (5 vs 15):
- Bug: balas renderizadas como número texto em vez de elementos visuais contáveis
- Correção: renderizar balas como círculos coloridos em grid:
  function renderBalas(count, color) {
    return Array.from({ length: count }, (_, i) => (
      <span key={i} className="bala" style={{ background: color }} />
    ))
  }

FASE 3 (igualar arrastando balas):
- Bug: arrastar bala de um pote para outro não atualiza a contagem visualmente
- Correção: atualizar estado imediatamente no onDragMove (feedback visual)
  e confirmar no onDragEnd (lógica):
  function onBalaDrop(fromPot, toPot, count = 1) {
    setPotes(prev => {
      const next = [...prev]
      if (next[fromPot] <= 0) return prev  // proteção
      next[fromPot] -= count
      next[toPot]   += count
      return next
    })
    checkEquality()
  }

FASE 5 (flash rápido):
- Bug: timer de flash não é cancelado se o componente desmonta
- Correção: sempre retornar cleanup no useEffect do flash
```

---

### G05 — Rã Puladora

```
FASE 1 (20 vs 10):
- Bug: swipe horizontal confundido com scroll da página
- Correção CRÍTICA — no container do jogo:
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Bloqueia scroll vertical/horizontal durante o jogo
    el.style.overscrollBehavior = 'none'
    el.style.touchAction        = 'none'
    return () => {
      el.style.overscrollBehavior = ''
      el.style.touchAction        = ''
    }
  }, [])

- Bug: rã "teleporta" para a lagoa ao invés de animar o salto
- Correção: animação de arco via CSS transform sequencial:
  function animateFrogJump(frogRef, targetX, targetY, onComplete) {
    const el = frogRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.transform  = 'translateZ(0)'
    // Ponto intermediário do arco
    const midX = targetX / 2
    const midY = -80  // altura do arco em px
    // Usar Web Animations API (mais leve que GSAP para este caso)
    const anim = el.animate([
      { transform: 'translate(0,0) translateZ(0) rotate(0deg)' },
      { transform: `translate(${midX}px,${midY}px) translateZ(0) rotate(-20deg)`, offset: 0.4 },
      { transform: `translate(${targetX}px,${targetY}px) translateZ(0) rotate(10deg)` }
    ], { duration: 600, easing: 'ease-in-out', fill: 'forwards' })
    anim.onfinish = onComplete
  }

FASE 3 (quantidade igual — rã não salta):
- Bug: quando a resposta correta é "igual" e o aluno swipa, o jogo não reconhece
- Correção: adicionar botão central "IGUAL!" que aparece nesta fase específica:
  {phase === 3 && quantity1 === quantity2 && (
    <button className="btn-equal" onPointerUp={() => handleCorrect('equal')}>
      São iguais!
    </button>
  )}
```

---

### G06 — Balões da Festa

```
FASE 1 (estourar 8 balões do grupo maior):
- Bug: não há indicação visual de QUANTOS balões ainda precisam ser estourados
- Correção: contador visual sempre visível: "Ainda faltam X" com animação de pop
  const remaining = initialCount - poppedCount
  // Atualizar em tempo real, animar quando chegar em 0

- Bug: balões podem ser estourados no grupo MENOR (que não deveria ser tocado)
- Correção: balões do grupo menor ficam com pointer-events: none até a fase de igualar
  e têm borda tracejada indicando "não toque"

FASE 4 (balões sobem e somem):
- Bug: balões saem completamente da tela antes de poder estourá-los
- Correção: definir limite de altura (translateY máximo = 80% da tela)
  e reiniciar a posição do balão não estourado no topo após N segundos,
  NÃO simplesmente remover do DOM

FASE 5 (criar dois grupos iguais do zero):
- Bug: interface não explica que o aluno deve criar os grupos (confusão total)
- Correção: adicionar instrução contextual animada ao iniciar a fase:
  "Crie dois grupos de balões com a mesma quantidade!"
  Com contador em cada grupo e botão "Pronto!" que valida
```

---

### G07 — Trem dos Números

```
FASE 1 (adição até 5):
- Bug: números arrastáveis não têm hitbox grande o suficiente (ficam < 44px)
- Correção: min-width: 56px; min-height: 56px em todos os números arrastáveis

- Bug: vagão de destino não tem feedback visual de "pronto para receber"
- Correção: ao iniciar o drag, vagão destino recebe classe .drop-ready:
  .drop-ready { border: 2px dashed var(--c3); animation: dropPulse 0.8s ease infinite; }
  @keyframes dropPulse { 50% { opacity: 0.5; } }

FASE 3 (subtração até 5) e FASE 4 (subtração até 10):
- Bug: equação mostra "X - Y = ?" mas os números arrastáveis ainda são de adição
- Correção: pool de números deve ser gerado a partir da equação correta:
  function generateSubtractionProblem(maxResult) {
    const result  = 1 + Math.floor(Math.random() * maxResult)
    const subtractor = 1 + Math.floor(Math.random() * (maxResult - result))
    const total   = result + subtractor
    // Exibir: total - subtractor = ?   Resposta: result
    return { total, subtractor, result }
  }
  // Números arrastáveis: [result, result+1, result-1] (embaralhados)
  // Nunca incluir 0 como opção

FASE 5 (mix adição+subtração com timer):
- Bug: timer do modo Tempo conflita com o timer crescente do TimerSystem
- Correção: o TimerDisplay deve mostrar COUNTDOWN nesta fase específica
  usando o timeLimitSeconds do ModeConfig. Verificar se GameShell recebe
  'countdown' como timerMode apenas quando mode === 'time' OU fase === 5
  (neste jogo fase 5 tem timer próprio independente do modo):
  const timerMode = (mode === 'time' || (gameId === 'g07' && phase === 5))
    ? 'countdown' : 'stopwatch'
```

---

### G08 — Pizzaria Mágica

```
FASE 1 (complemento até 5):
- Bug: fatias não "encaixam" visualmente no prato ao soltar
- Correção: ao confirmar drop correto, mover fatia para posição calculada no prato:
  function getSlicePositionOnPlate(index, total, plateRef) {
    const rect  = plateRef.current.getBoundingClientRect()
    const cx    = rect.left + rect.width  / 2
    const cy    = rect.top  + rect.height / 2
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2
    const r     = rect.width * 0.3
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }
  // Animar fatia até essa posição usando Web Animations API

FASE 3 (cliente devolveu — subtração):
- Bug: subtração não está clara visualmente — aluno não sabe O QUE remover
- Correção: fatias a remover ficam com border vermelho pulsante:
  @keyframes removeHint { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
  .remove-hint { animation: removeHint 0.6s ease infinite; border: 2px solid red; }
  // Aluno arrasta as fatias marcadas de volta para o balcão

FASE 4 (soma de dois pratos):
- Bug: dois pratos exibidos mas a área de cada um é muito pequena em mobile
- Correção: layout em coluna no mobile (um prato por vez, swipe para trocar)
  em vez de dois pratos lado a lado

FASE 5 (monte você mesmo):
- Bug: sem limite máximo — aluno pode arrastar infinitas fatias
- Correção: desabilitar arrastar quando prato atingir o target:
  const canAddSlice = currentSlices < targetSlices
  // useDragFixed recebe disabled={!canAddSlice}
```

---

### G09 — Batalha de Constelações

```
FASE 1 (adição — gestos de +):
- Bug: reconhecimento de gesto "+" falha em iOS (touch events no canvas)
- Correção: usar Pointer Events no canvas (funciona em todos os browsers):
  canvas.addEventListener('pointerdown', startDraw, { passive: false })
  canvas.addEventListener('pointermove', draw,      { passive: false })
  canvas.addEventListener('pointerup',   endDraw)
  // Em iOS Safari, canvas com pointer events precisa de touch-action: none no CSS

- Bug: threshold de reconhecimento muito rígido (rejeita traços válidos)
- Correção: algoritmo tolerante baseado em bounding box do traço:
  function recognizeGesture(points) {
    if (points.length < 6) return null
    const xs   = points.map(p => p.x)
    const ys   = points.map(p => p.y)
    const bbox = {
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys)
    }
    // Linha horizontal: bbox muito mais largo que alto
    if (bbox.w > bbox.h * 2.5) return 'minus'
    // Linha vertical: bbox muito mais alto que largo
    if (bbox.h > bbox.w * 2.5) return 'vertical'
    // Cruz (+): cruzamento detectado por mudança de direção
    const hasCross = detectDirectionChange(points)
    if (hasCross) return 'plus'
    return null
  }
  function detectDirectionChange(points) {
    // Simplificado: se há ponto de inflexão claro em X e em Y, é uma cruz
    let changX = 0, changY = 0, prevDx = 0, prevDy = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x
      const dy = points[i].y - points[i-1].y
      if (Math.sign(dx) !== Math.sign(prevDx) && Math.abs(dx) > 5) changX++
      if (Math.sign(dy) !== Math.sign(prevDy) && Math.abs(dy) > 5) changY++
      prevDx = dx; prevDy = dy
    }
    return changX >= 1 && changY >= 1
  }

FASE 5 (rival astronauta):
- Bug: a lógica do rival não existe — fase fica em branco
- Correção: rival sempre mostra uma resposta errada com delay de 2s:
  useEffect(() => {
    const wrongAnswer = generateWrongAnswer(currentProblem)
    const rivalTimer  = setTimeout(() => setRivalAnswer(wrongAnswer), 2000)
    return () => clearTimeout(rivalTimer)
  }, [currentProblem])
  // Aluno deve submeter a resposta CORRETA antes ou depois do rival
  // Se aluno acertar: ganhou essa rodada
  // Se aluno errar: rival "vence" a rodada mas jogo continua
```

---

### G10 — Ateliê da Ordem

```
FASE 4 (cor + forma combinados):
- Bug: gaveta aceita objeto que satisfaz apenas UM dos dois critérios
- Correção: validação AND obrigatória:
  function isCorrectDrawer(object, drawer) {
    const matchColor = !drawer.requiredColor || object.color === drawer.requiredColor
    const matchShape = !drawer.requiredShape || object.shape === drawer.requiredShape
    return matchColor && matchShape  // AMBOS devem ser true
  }

FASE 5 (gaveta misteriosa):
- Bug: o atributo da gaveta misteriosa nunca é revelado ao aluno
- Correção: após 2 acertos, mostrar dica progressiva:
  - Após 1 acerto: "Esta gaveta gosta de coisas ___" (cor/forma revelada com ?)
  - Após 2 acertos: revelar completamente o atributo com animação
```

---

### G11 — Jardim de Padrões

```
TODOS OS PADRÕES:
- Bug: posição do vaso vazio não é óbvia — aluno não sabe onde plantar
- Correção: vaso vazio tem animação de brilho pulsante indicando "plante aqui":
  @keyframes vasoPulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
  .vaso-empty { animation: vasoPulse 1s ease infinite; border: 2px dashed var(--c5); }

FASE 5 (criar próprio padrão):
- Bug: modo de criação não tem UI clara — aluno fica perdido
- Correção: fluxo em 3 etapas com instrução:
  1. "Toque nas flores para criar seu padrão (pelo menos 3)"
  2. "Agora toque em CONFIRMAR para testar"  
  3. Sistema gera 2 vasos vazios e o aluno deve completar o próprio padrão
```

---

### G12 — Nave Organizadora

```
FASE 4 (aliens caindo — velocidade):
- Bug: aliens caem fora da tela sem chance de pegar
- Correção: aliens não são removidos ao sair — "quicam" na borda:
  // Se alien atingir o fundo: sobe de volta com menor velocidade
  // Dar ao aluno ao menos 2 tentativas por alien antes de "perder" o alien
  // Alien perdido não encerra a fase — apenas não conta ponto
  // Fase avança quando 70% dos aliens são classificados corretamente

FASE 5 (compartimento misterioso):
- Bug: sem feedback do critério secreto mesmo após acertos
- Correção: a cada 2 acertos revelar 1 letra do critério (como jogo da forca visual)
```

---

### G13 — Robô Perdido

```
FASE 1 (3 movimentos):
- Bug: toque nas setas move o robô mas não verifica se chegou ao destino
- Correção: após CADA movimento, verificar posição:
  function moveRobot(direction) {
    const newPos = calculateNewPosition(robotPos, direction)
    if (isWall(newPos)) {
      // Robô bate na parede: shake animation, não move
      playError(); shakeRobot()
      return
    }
    setRobotPos(newPos)
    if (isGoal(newPos)) {
      handlePhaseComplete()
    }
  }

FASE 4 (dois robôs simultâneos):
- Bug: as setas controlam os dois robôs ao mesmo tempo (comportamento incorreto)
- Correção: botão de alternância entre robôs:
  const [activeRobot, setActiveRobot] = useState(0)
  // As setas sempre controlam apenas o robô ativo
  // Indicador visual (cor diferente) mostra qual robô está ativo
  // Ambos devem chegar ao destino para avançar

FASE 5 (criar labirinto):
- Bug: ferramentas de criação não existem
- Correção simplificada: usar labirinto pré-feito com "slot editável"
  onde o aluno pode mover 3 paredes de posição, depois testar com o robô
```

---

### G14 — Esconde-esconde Animal

```
FASE 3 (só áudio — sem referência visual):
- Bug: Web Speech API não funciona em todos os browsers escolares
- Correção: sempre usar áudio sintetizado com AudioSystem.js + texto escrito
  como fallback simultâneo (não "ou/ou" — sempre os dois):
  function announcePosition(position) {
    // Texto sempre visível
    setInstructionText(`O animal está ${POSITION_TEXTS[position]}`)
    // Áudio via Web Speech API (se disponível)
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(POSITION_TEXTS[position])
      utter.lang = 'pt-BR'
      utter.rate = 0.85  // mais devagar para crianças
      speechSynthesis.speak(utter)
    }
  }

FASE 5 (criança narra):
- Bug: captura de áudio (SpeechRecognition) não funciona na maioria dos tablets escolares
- Correção: substituir narração por áudio por seleção de palavras:
  // Criança toca nas palavras que descrevem a posição do animal
  // ex: [à direita] [à esquerda] [atrás] [em frente] [em cima] [em baixo]
  // Toca nas palavras na ordem certa = narração válida
```

---

### G15 — Castelo das Posições

```
FASE 2 (duas referências):
- Bug: cavaleiro pode ser colocado em posição que satisfaz apenas 1 das 2 referências
  e o jogo aceita como correto
- Correção: validação com duas zonas de aceitação (interseção):
  function isCorrectPosition(knightPos, ref1Zone, ref2Zone, margin = 30) {
    return isInsideZone(knightPos, ref1Zone, margin) &&
           isInsideZone(knightPos, ref2Zone, margin)
  }

FASE 3 (só áudio):
- Mesma correção do G14: Web Speech API + fallback em texto
```

---

### G16 — Sol, Lua e Estrelas

```
FASE 1 (identifique o período):
- Bug: criança não tem como "confirmar" qual período está selecionado
- Correção: 4 botões sempre visíveis (manhã / tarde / noite / madrugada)
  O sol na posição atual serve como pista — aluno toca no botão correspondente

FASE 2 (arrastar atividades para período):
- Bug: atividades são texto puro sem imagem — difícil para crianças de 6 anos
- Correção: cada atividade deve ser representada por emoji grande (≥ 48px):
  const ACTIVITIES = {
    manhã:     [{ emoji: '🪥', label: 'escovar dentes' }, { emoji: '☕', label: 'café' }],
    tarde:     [{ emoji: '📚', label: 'escola' },         { emoji: '🍱', label: 'almoço' }],
    noite:     [{ emoji: '🛁', label: 'banho' },          { emoji: '📖', label: 'história' }],
    madrugada: [{ emoji: '😴', label: 'dormir' },         { emoji: '🌙', label: 'sonhar' }]
  }

FASE 4 (só sons — identificar sem ver):
- Bug: sons de ambiente (pássaros, grilos) não estão sendo gerados
  — o AudioSystem.js atual só gera tons, não ambiência
- Correção: criar sons sintetizados representativos via AudioSystem:
  // Manhã: tom agudo e alegre (simula pássaro)
  // Tarde: tom médio animado
  // Noite: tom grave e lento (simula grilo)
  // Madrugada: silêncio com tom muito grave espaçado
  function playAmbience(period) {
    const config = {
      manhã:     { freq: 880, type: 'sine',     rhythm: 200 },
      tarde:     { freq: 660, type: 'triangle', rhythm: 300 },
      noite:     { freq: 220, type: 'sine',     rhythm: 800 },
      madrugada: { freq: 110, type: 'sine',     rhythm: 1500 }
    }[period]
    // Loop com setInterval, limpar no cleanup
  }
```

---

### G17 — Calendário Vivo

```
FASE 1 (Segunda e Terça):
- Bug: apenas 2 slots disponíveis mas os personagens de todos os dias aparecem
- Correção: fase 1 mostra APENAS os personagens de Segunda e Terça
  Os outros personagens ficam invisíveis (opacity: 0) até as fases correspondentes

FASE 3 (dia faltando):
- Bug: não há indicação visual clara de qual slot está vazio
- Correção: slot vazio tem animação de "?" pulsante e borda tracejada

FASE 4 (meses de uma estação):
- Bug: transição de "dias da semana" para "meses" confunde o aluno
  sem explicação de que o contexto mudou
- Correção: animação de transição de cena + instrução clara:
  "Agora vamos ordenar os meses do ano!"
  Com animação de câmera voando do calendário semanal para o anual
```

---

### G18 — Máquina do Tempo

```
FASE 1 (3 dias embaralhados):
- Bug: sem indicação de que o aluno deve TOCAR EM SEQUÊNCIA
  (parece uma interface estática)
- Correção: setas animadas entre os slots + instrução "Toque na ordem certa: 1º, 2º, 3º"
  + cursor animado demonstrando a ação na primeira vez que a fase carrega

FASE 2 (7 dias completos):
- Bug: 7 botões pequenos em tela mobile ficam < 44px
- Correção: em mobile, mostrar 7 botões em grid 4+3, com min-height: 52px cada

FASE 5 (semana + períodos + 2 meses):
- Bug: excesso de elementos na tela — impossível de usar em mobile 375px
- Correção: dividir em 3 sub-etapas separadas dentro da mesma fase:
  - Sub-etapa A: ordenar os 7 dias da semana
  - Sub-etapa B: ordenar os 4 períodos do dia
  - Sub-etapa C: ordenar 2 meses no calendário
  Barra de progresso da sub-etapa: ○○○ → ●○○ → ●●○ → ●●●
```

---

### G19 — Sorveteria dos Dados

```
FASE 3 (quantas bolas tem X?):
- Bug: pergunta pede um número mas não há input numérico — aluno não tem como responder
- Correção: 3 opções de resposta como botões (não campo de texto):
  function generateCountOptions(correct) {
    const opts = new Set([correct])
    while (opts.size < 3) {
      opts.add(Math.max(1, correct + Math.floor(Math.random() * 5) - 2))
    }
    return shuffle([...opts])
  }

FASE 5 (construir gráfico):
- Bug: aluno pode adicionar bolas infinitamente sem objetivo claro
- Correção: dar um "pedido" ao aluno:
  "Coloque 4 bolas de chocolate e 2 de morango"
  Aluno toca nas barras para adicionar bolas
  Botão "Pronto!" valida se os valores estão corretos
```

---

### G20 — Zoo de Tabelas

```
FASE 3 (total de duas linhas):
- Bug: criança precisa somar mentalmente dois números sem suporte visual
- Correção: ao selecionar as duas linhas, mostrar animação de "juntar":
  as bolas/ícones das duas linhas se movem visualmente para uma área de soma,
  sendo contados enquanto chegam

FASE 5 (completar a tabela):
- Bug: campo de entrada de número em mobile abre teclado que cobre a tabela
- Correção: substituir input de texto por seletor de +/- botões:
  <div className="number-picker">
    <button onPointerUp={() => setValue(v => Math.max(0, v-1))}>−</button>
    <span>{value}</span>
    <button onPointerUp={() => setValue(v => Math.min(20, v+1))}>+</button>
  </div>
```

---

### G21 — Pesquisa da Turma

```
FASE 3 (encontre o erro no gráfico):
- Bug: qual é o "erro" não está definido na lógica — fase exibe gráfico correto
- Correção: gerar deliberadamente um dado errado:
  function generateChartWithError(data) {
    const errorIndex = Math.floor(Math.random() * data.length)
    const correct    = [...data]
    const withError  = [...data]
    // Aumentar ou diminuir o valor errado em 2–4 unidades
    const delta = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.floor(Math.random() * 3))
    withError[errorIndex] = Math.max(1, withError[errorIndex] + delta)
    return { chartData: withError, errorIndex, correctValue: correct[errorIndex] }
  }

FASE 4 (compare 2 gráficos):
- Bug: Chart.js renderiza os 2 gráficos sobrepostos (z-index conflito)
- Correção: cada gráfico em seu próprio container com position: relative e z-index definido;
  destruir e recriar a instância do Chart ao trocar de fase:
  useEffect(() => {
    const chart = new Chart(canvasRef.current, config)
    return () => chart.destroy()  // CRÍTICO: sempre destruir antes de recriar
  }, [phase, chartData])

FASE 5 (faça sua própria pesquisa):
- Bug: sem confirmação de que a pesquisa está "pronta para publicar"
- Correção: botão "Publicar pesquisa!" só ativa quando todas as categorias
  têm pelo menos 1 voto (evitar gráfico com barra zero que confunde)
```

---

## UTILITÁRIO DE TESTE MANUAL — `src/utils/GameDebugger.js`

Criar este arquivo para uso durante a auditoria:

```js
/**
 * GameDebugger.js
 * Utilitário de debug — usar apenas em desenvolvimento (NODE_ENV !== 'production')
 */

export const GameDebugger = {

  // Avança para uma fase específica sem jogar as anteriores
  skipToPhase(gameShellRef, targetPhase) {
    if (process.env.NODE_ENV === 'production') return
    console.log(`[Debug] Pulando para fase ${targetPhase}`)
    gameShellRef.current?.setPhase(targetPhase)
  },

  // Simula N acertos seguidos para testar avanço de fase
  simulateCorrects(handleCorrect, count = 5, intervalMs = 200) {
    if (process.env.NODE_ENV === 'production') return
    let i = 0
    const interval = setInterval(() => {
      handleCorrect()
      if (++i >= count) clearInterval(interval)
    }, intervalMs)
  },

  // Verifica se há listener leaks (EventListeners acumulados)
  checkListenerLeaks(elementRef, eventName) {
    if (process.env.NODE_ENV === 'production') return
    // Usar performance.getEventCounts() se disponível (Chrome 105+)
    console.log(`[Debug] Verificar listeners de '${eventName}' em:`, elementRef.current)
  },

  // Log de estado de fase para diagnóstico
  logPhaseState(phase, state) {
    if (process.env.NODE_ENV === 'production') return
    console.group(`[Debug] Fase ${phase} — Estado`)
    Object.entries(state).forEach(([k, v]) => console.log(`  ${k}:`, v))
    console.groupEnd()
  }
}

// Adicionar atalhos de teclado apenas em dev
if (process.env.NODE_ENV !== 'production') {
  document.addEventListener('keydown', (e) => {
    if (!e.altKey) return
    if (e.key === '1') console.log('[Debug] Alt+1: force phase 1')
    if (e.key === '2') console.log('[Debug] Alt+2: force phase 2')
    if (e.key === '3') console.log('[Debug] Alt+3: force phase 3')
    if (e.key === '4') console.log('[Debug] Alt+4: force phase 4')
    if (e.key === '5') console.log('[Debug] Alt+5: force phase 5')
    if (e.key === 'c') console.log('[Debug] Alt+C: simulate 5 corrects')
    if (e.key === 'r') console.log('[Debug] Alt+R: reset current phase')
  })
}
```

---

## ORDEM DE EXECUÇÃO DAS CORREÇÕES

Execute na seguinte ordem para minimizar regressões:

```
BLOCO 1 — Fundação (corrigir primeiro, afeta todos os jogos):
  1. useDragFixed    → substituir em todos os elementos arrastáveis
  2. useTapFixed     → substituir em todos os elementos tocáveis
  3. useHoldFixed    → substituir em todos os elementos de hold
  4. key por fase    → adicionar key={`g${id}-phase${phase}`} em todos os jogos
  5. phaseCompletedRef → proteção contra duplo avanço em todos os jogos
  6. correctCountRef → closure stale fix em todos os jogos

BLOCO 2 — Jogos de Arrastar (G01, G04f3, G07, G08, G10, G11, G12, G15, G17):
  Aplicar correções específicas de cada jogo listadas acima

BLOCO 3 — Jogos de Toque (G02, G03, G04, G06, G13, G14, G18, G19, G20, G21):
  Aplicar correções específicas de cada jogo listadas acima

BLOCO 4 — Jogos Especiais (G05-swipe, G09-gesture, G16-audio):
  Aplicar correções específicas — mais complexas, testar separadamente

BLOCO 5 — Validação cruzada:
  Testar cada jogo em mobile (375px touch) e desktop (1280px mouse)
  Rodar o CHECKLIST DE DIAGNÓSTICO novamente em todos os 21 jogos
```

---

## CHECKLIST FINAL DE VALIDAÇÃO (aplicar após todas as correções)

```
INTERAÇÃO (testar mouse E touch em cada jogo):
[ ] G01: drag de folha para boca da lagarta funciona em touch
[ ] G02: tap no elemento solitário funciona sem double-tap acidental
[ ] G03: botões de resposta só aparecem após o flash terminar
[ ] G04: tap no pote correto registra imediatamente
[ ] G05: swipe não é confundido com scroll da página
[ ] G06: tap para estourar balão funciona em touch
[ ] G07: drag de número para vagão com hitbox correta
[ ] G08: drag de fatia para prato com retorno ao errar
[ ] G09: gesto "+" reconhecido em iOS Safari
[ ] G10: drag para gaveta com validação AND (cor + forma)
[ ] G11: vaso vazio claramente identificável
[ ] G12: drag de alien com correção ao cair fora da tela
[ ] G13: tap nas setas move robô corretamente
[ ] G14: tap na região correta com texto + áudio simultâneo
[ ] G15: drag do cavaleiro com validação de duas referências
[ ] G16: deslizar sol com resposta via botões
[ ] G17: drag dos personagens de dia na semana
[ ] G18: tap sequencial com botões ≥ 44px em mobile
[ ] G19: 3 opções de resposta como botões
[ ] G20: seletor +/- em vez de input de texto
[ ] G21: Chart.js destruído e recriado ao trocar de fase

LÓGICA (testar cada fase de cada jogo):
[ ] Nenhuma fase trava (avança com todos os acertos)
[ ] Nenhuma fase avança com 0 acertos
[ ] Nenhuma fase avança duas vezes seguidas
[ ] Estado da fase anterior completamente limpo
[ ] Resposta correta sempre presente nas opções
[ ] Dificuldade fase N+1 > fase N em todos os jogos
[ ] Elementos em quantidade correta por fase (ver especificação)

MEMÓRIA E PERFORMANCE:
[ ] Sem console.error em nenhum jogo
[ ] Sem EventListener leaks (verificar com DevTools → Performance → Memory)
[ ] 60fps com CPU throttle 4x no Chrome DevTools em todos os jogos
[ ] Partículas removidas do DOM após 600ms
[ ] Chart.js destruído ao desmontar G21
[ ] requestAnimationFrame cancelado ao desmontar em G05, G09, G16
```
