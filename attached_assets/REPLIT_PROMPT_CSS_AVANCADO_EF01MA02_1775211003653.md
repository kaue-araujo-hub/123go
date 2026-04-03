# PROMPT PARA O REPLIT — JOGOS EF01MA02 COM CSS AVANÇADO
## Festa da Lagarta · Par ou Ímpar? · Caça Estrelas

---

## VISÃO GERAL

Construa **3 jogos educacionais interativos** para crianças do 1º ano do Ensino Fundamental,
alinhados à habilidade **EF01MA02** do Currículo Paulista (contagem exata e aproximada,
estratégias de pareamento e agrupamentos). Os jogos devem ser **visualmente ricos**,
com animações CSS avançadas otimizadas para dispositivos mobile de entrada e navegadores
móveis (Android 8+, iOS 13+), rodando a **60fps estáveis**.

---

## TECH STACK (OBRIGATÓRIO — não substituir)

```
React 18          — functional components + hooks (useState, useEffect, useRef, useCallback)
Tailwind CSS 3    — utilitários de layout, espaçamento e cores base
CSS Modules       — animações avançadas via @keyframes (NÃO usar Tailwind para animações)
Vite              — bundler e dev server
```

> **Nenhuma biblioteca de animação externa** (sem Framer Motion, GSAP, Anime.js).
> Todas as animações são implementadas com CSS puro em arquivos `.module.css`.

---

## REGRA DE OURO DE PERFORMANCE

**Use APENAS estas propriedades CSS para animar — nunca outras:**

```css
/* ✅ PERMITIDO — processado pela GPU, sem reflow */
transform: translate(), scale(), rotate(), skew()
opacity: 0 → 1
filter: brightness() /* apenas em hover, não em loop */

/* ❌ PROIBIDO em animações */
top, left, right, bottom   /* causa reflow */
width, height              /* causa reflow */
margin, padding            /* causa reflow */
box-shadow                 /* causa repaint pesado */
border-radius em loop      /* causa repaint */
background-color em loop   /* causa repaint */
blur() em loop             /* muito pesado em mobile */
```

**Sempre use `will-change: transform` em elementos que animam continuamente.**
**Sempre use `transform: translateZ(0)` para forçar camada de composição.**

---

## ESTRUTURA DE PASTAS

```
src/
├── games/
│   ├── shared/
│   │   ├── GameShell.jsx          # wrapper comum: barra de progresso, score, voltar
│   │   ├── GameShell.module.css
│   │   ├── PhaseManager.js        # lógica de fases 1–5
│   │   ├── AudioSystem.js         # sons leves com Web Audio API nativa
│   │   ├── ParticlesBurst.jsx     # partículas CSS puras (sucesso)
│   │   ├── ParticlesBurst.module.css
│   │   ├── useSwipe.js            # hook de swipe/drag touch+mouse
│   │   ├── useTap.js              # hook de tap, double tap, hold
│   │   └── appleEmoji.js          # helper para emojis Apple PNG
│   │
│   ├── g01-festa-lagarta/
│   │   ├── FestaLagarta.jsx
│   │   ├── FestaLagarta.module.css
│   │   ├── Lagarta.jsx            # personagem principal animado
│   │   ├── Lagarta.module.css
│   │   ├── Folha.jsx              # item arrastável
│   │   ├── Folha.module.css
│   │   └── phases.js              # configuração das 5 fases
│   │
│   ├── g02-par-impar/
│   │   ├── ParImpar.jsx
│   │   ├── ParImpar.module.css
│   │   ├── ItemCard.jsx           # card tocável com flip animation
│   │   ├── ItemCard.module.css
│   │   └── phases.js
│   │
│   └── g03-caca-estrelas/
│       ├── CacaEstrelas.jsx
│       ├── CacaEstrelas.module.css
│       ├── Estrela.jsx            # estrela com twinkle animation
│       ├── Estrela.module.css
│       ├── CeuParallax.jsx        # fundo em camadas parallax
│       ├── CeuParallax.module.css
│       └── phases.js
```

---

## SISTEMA DE ANIMAÇÕES CSS — ESPECIFICAÇÃO DETALHADA

### 1. Animações de Personagem (idle + reação)

```css
/* Respiração idle — todos os personagens */
@keyframes breathe {
  0%, 100% { transform: scaleY(1) translateZ(0); }
  50%       { transform: scaleY(1.04) translateZ(0); }
}

/* Flutuação idle suave */
@keyframes float {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50%       { transform: translateY(-8px) translateZ(0); }
}

/* Bounce de sucesso */
@keyframes successBounce {
  0%         { transform: scale(1) translateZ(0); }
  30%        { transform: scale(1.4) translateY(-12px) translateZ(0); }
  55%        { transform: scale(0.92) translateY(4px) translateZ(0); }
  75%        { transform: scale(1.08) translateY(-4px) translateZ(0); }
  100%       { transform: scale(1) translateY(0) translateZ(0); }
}

/* Shake de erro */
@keyframes errorShake {
  0%, 100%  { transform: translateX(0) translateZ(0); }
  15%       { transform: translateX(-10px) rotate(-4deg) translateZ(0); }
  30%       { transform: translateX(10px) rotate(4deg) translateZ(0); }
  45%       { transform: translateX(-8px) rotate(-2deg) translateZ(0); }
  60%       { transform: translateX(8px) rotate(2deg) translateZ(0); }
  75%       { transform: translateX(-4px) translateZ(0); }
}

/* Wiggle de chamada de atenção */
@keyframes wiggle {
  0%, 100%  { transform: rotate(0deg) translateZ(0); }
  25%       { transform: rotate(-8deg) translateZ(0); }
  75%       { transform: rotate(8deg) translateZ(0); }
}

/* Pop de aparecimento */
@keyframes popIn {
  0%   { transform: scale(0) translateZ(0); opacity: 0; }
  70%  { transform: scale(1.15) translateZ(0); opacity: 1; }
  100% { transform: scale(1) translateZ(0); opacity: 1; }
}

/* Fly-in da esquerda */
@keyframes flyInLeft {
  0%   { transform: translateX(-120%) translateZ(0); opacity: 0; }
  100% { transform: translateX(0) translateZ(0); opacity: 1; }
}

/* Disappear up */
@keyframes flyOutUp {
  0%   { transform: translateY(0) scale(1) translateZ(0); opacity: 1; }
  100% { transform: translateY(-80px) scale(0.5) translateZ(0); opacity: 0; }
}

/* Spin celebração */
@keyframes celebrationSpin {
  0%   { transform: rotate(0deg) scale(1) translateZ(0); }
  50%  { transform: rotate(180deg) scale(1.2) translateZ(0); }
  100% { transform: rotate(360deg) scale(1) translateZ(0); }
}
```

### 2. Partículas CSS Puras (sem Canvas)

```css
/* Partícula individual */
@keyframes particleBurst {
  0%   { transform: translate(0, 0) scale(1) translateZ(0); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0) translateZ(0); opacity: 0; }
}

/* Usar CSS custom properties para variar direção de cada partícula */
/* --dx e --dy definidos inline via style={{ '--dx': '40px', '--dy': '-60px' }} */
```

Componente React de partículas:
```jsx
// ParticlesBurst.jsx
// Gera N elementos <span> com --dx e --dy aleatórios
// Duração: 600ms, depois remove do DOM
// Máximo de 12 partículas por burst (performance mobile)
// Shapes: ●, ★, ♥ — usando caracteres unicode, sem imagens
```

### 3. Fundo Parallax CSS (sem JavaScript de scroll)

```css
/* Camada de fundo — move mais lento */
@keyframes parallaxSlow {
  0%   { transform: translateX(0) translateZ(0); }
  100% { transform: translateX(-50%) translateZ(0); }
}

/* Camada do meio */
@keyframes parallaxMid {
  0%   { transform: translateX(0) translateZ(0); }
  100% { transform: translateX(-50%) translateZ(0); }
}

/* Trick: duplicar o fundo horizontalmente (200% width)
   para loop infinito sem glitch */
```

### 4. Perspectiva 3D Sutil (sem WebGL)

```css
.card-3d-container {
  perspective: 600px;
  perspective-origin: center center;
}

@keyframes cardFlip {
  0%   { transform: rotateY(0deg) translateZ(0); }
  50%  { transform: rotateY(90deg) translateZ(0); }
  100% { transform: rotateY(0deg) translateZ(0); }
}

@keyframes tiltOnHover {
  /* Aplicado via JS: element.style.transform = rotateX + rotateY calculados
     com base na posição do toque/mouse relativa ao centro do elemento */
}
```

---

## JOGO 1 — FESTA DA LAGARTA

### Descrição pedagógica
**Habilidade:** EF01MA02 — Contar de maneira exata utilizando pareamento e agrupamentos.
**Mecânica:** Arrastar folhas para a boca da lagarta. A cada folha correta, a lagarta cresce.

### Componentes visuais e animações

#### Lagarta (personagem principal)
```css
/* Corpo segmentado — cada segmento é um div circular */
/* Idle: ondulação que percorre os segmentos com animation-delay crescente */
@keyframes segmentWave {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50%      { transform: translateY(-5px) translateZ(0); }
}
/* Segmento 1: delay 0ms, Segmento 2: delay 80ms, Segmento N: delay N*80ms */

/* Crescimento ao comer folha: novo segmento faz popIn */
/* Boca: anima para aberta ao receber drag (scale + rotate) */
@keyframes mouthOpen {
  0%   { transform: scaleY(1) translateZ(0); }
  50%  { transform: scaleY(1.6) translateZ(0); }
  100% { transform: scaleY(1) translateZ(0); }
}

/* Olhos: piscam a cada 3s */
@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1) translateZ(0); }
  95%           { transform: scaleY(0.1) translateZ(0); }
}
```

#### Folhas (itens arrastáveis)
```css
/* Idle: rotação leve como se estivesse flutuando ao vento */
@keyframes leafFloat {
  0%, 100% { transform: rotate(-5deg) translateY(0) translateZ(0); }
  33%      { transform: rotate(3deg) translateY(-6px) translateZ(0); }
  66%      { transform: rotate(-2deg) translateY(-3px) translateZ(0); }
}

/* Ao ser pego (drag start): escala para 1.2, rotaciona levemente */
/* Ao ser solto corretamente: flyOutUp até a boca da lagarta */
/* Ao ser solto incorretamente: errorShake + retorna à posição original */
```

#### Fundo (floresta)
```
Camada 1 (fundo): céu gradiente estático — verde escuro para verde médio
Camada 2 (paralax lento 30s loop): silhuetas de árvores grandes — translateX loop
Camada 3 (parallax médio 20s loop): arbustos — translateX loop mais rápido
Camada 4 (chão): faixa de grama estática
Camada 5 (foreground): folhas caindo animadas
```

```css
@keyframes leafFall {
  0%   { transform: translateY(-20px) rotate(0deg) translateZ(0); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(100vh) rotate(360deg) translateZ(0); opacity: 0; }
}
/* 6 folhas com delays diferentes: 0s, 1.2s, 2.4s, 3.6s, 4.8s, 6s */
/* Duração: 8s cada, loop infinito */
```

### 5 Fases

```js
// phases.js — g01-festa-lagarta
export const PHASES = [
  { id: 1, folhas: 5,  target: 5,  velocidade: 1.0, agrupamento: 1, dica: true  },
  { id: 2, folhas: 10, target: 10, velocidade: 1.0, agrupamento: 1, dica: false },
  { id: 3, folhas: 8,  target: 4,  velocidade: 1.2, agrupamento: 2, dica: false }, // pares
  { id: 4, folhas: 12, target: 6,  velocidade: 1.4, agrupamento: 2, dica: false },
  { id: 5, folhas: 15, target: 5,  velocidade: 1.6, agrupamento: 3, dica: false }, // trios
]
// 'agrupamento: 2' significa contar de 2 em 2 — arrastar 2 folhas juntas
```

### Drag & Drop — implementação touch+mouse

```js
// useSwipe.js — hook universal para drag (mouse + touch)
// Usar pointer events API (unifica mouse e touch)
// Calcular posição relativa ao container
// Detectar "zona de destino" (boca da lagarta) por hitbox simples:
//   Math.abs(pointerX - mouthX) < 60 && Math.abs(pointerY - mouthY) < 60
// NÃO usar @dnd-kit aqui — implementação manual é mais leve e específica
```

---

## JOGO 2 — PAR OU ÍMPAR?

### Descrição pedagógica
**Habilidade:** EF01MA02 — Pareamento e identificação de elementos sem par.
**Mecânica:** Objetos aparecem em tela. Um fica sem par. Criança toca no solitário.

### Componentes visuais e animações

#### Cards de objetos
```css
/* Entrada: os cards aparecem com popIn em stagger (delay incremental) */
/* delay: index * 80ms — máximo 12 cards, delay total máximo 960ms */

/* Idle: leve flutuação alternada por linha */
@keyframes cardFloat {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50%      { transform: translateY(-6px) translateZ(0); }
}

/* Hover/touch: tilt 3D sutil usando perspective no container */
/* Scale: 1.08 no touch start, 1 no touch end */

/* Par encontrado: dois cards se aproximam (translateX para o centro),
   depois desaparecem juntos com flyOutUp + burst de partículas */
@keyframes pairMerge {
  0%   { transform: translateX(0) scale(1) translateZ(0); }
  60%  { transform: translateX(var(--merge-x)) scale(1.1) translateZ(0); }
  100% { transform: translateX(var(--merge-x)) scale(0) translateZ(0); opacity: 0; }
}

/* Solitário selecionado corretamente: successBounce + celebrationSpin */
/* Seleção errada (tocou num par): errorShake */

/* Flip animation ao revelar objeto (fase 3 — pares escondidos) */
@keyframes cardReveal {
  0%   { transform: rotateY(90deg) translateZ(0); opacity: 0; }
  100% { transform: rotateY(0deg) translateZ(0); opacity: 1; }
}
```

#### Troca de tema por fase (SCAMPER Substituir)
```js
const THEMES = [
  { id: 1, itens: ['🧦','🧤','👟'],        nome: 'Roupas'   },
  { id: 2, itens: ['🍎','🍊','🍋'],        nome: 'Frutas'   },
  { id: 3, itens: ['🌟','🌙','☁️'],        nome: 'Céu'      },
  { id: 4, itens: ['🐶','🐱','🐰'],        nome: 'Animais'  },
  { id: 5, itens: ['🚂','✈️','🚢'],        nome: 'Veículos' },
]
```

#### Fundo adaptativo por tema
```css
/* Cada tema tem seu gradiente de fundo */
/* Transição entre temas: opacity fade 400ms no container de fundo */
@keyframes bgFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### Interação de ritmo (fase 4)
```js
// Metrônomo via Web Audio API nativa (sem biblioteca):
const ctx = new AudioContext()
function beep(freq = 880, duration = 80) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration/1000)
  osc.start()
  osc.stop(ctx.currentTime + duration/1000)
}
// BPM: fase1=60, fase2=70, fase3=80, fase4=90(ritmo), fase5=100
// Na fase 4: card "solitário" pisca no ritmo — criança deve tocar no pulso certo
@keyframes rhythmPulse {
  0%, 100% { transform: scale(1) translateZ(0); opacity: 1; }
  50%      { transform: scale(1.15) translateZ(0); opacity: 0.7; }
}
```

### 5 Fases

```js
export const PHASES = [
  { id: 1, pares: 2,  total: 5,  temOcultos: false, temRitmo: false, delay: 120 },
  { id: 2, pares: 3,  total: 7,  temOcultos: false, temRitmo: false, delay: 100 },
  { id: 3, pares: 3,  total: 7,  temOcultos: true,  temRitmo: false, delay: 90  },
  { id: 4, pares: 3,  total: 7,  temOcultos: false, temRitmo: true,  delay: 80  },
  { id: 5, pares: 5,  total: 11, temOcultos: true,  temRitmo: false, delay: 60  },
]
```

---

## JOGO 3 — CAÇA ESTRELAS

### Descrição pedagógica
**Habilidade:** EF01MA02 — Estimativa de quantidades por visualização rápida (subitizing).
**Mecânica:** Constelação aparece por N segundos e some. Criança escolhe o número correto.

### Componentes visuais e animações

#### Céu estrelado (fundo)
```css
/* Estrelas de fundo: 3 camadas com velocidades diferentes */
/* Camada 1: 80 estrelas pequenas (1px) — translateX loop 120s */
/* Camada 2: 40 estrelas médias (2px) — translateX loop 80s */
/* Camada 3: 20 estrelas grandes (3px) — translateX loop 50s */

@keyframes starLayer {
  from { transform: translateX(0) translateZ(0); }
  to   { transform: translateX(-50%) translateZ(0); }
}
/* Cada camada é um div com background: radial-gradient repetido
   gerando pontos de estrela sem elementos DOM extras */

/* Aurora boreal sutil no fundo (performance-safe) */
@keyframes aurora {
  0%, 100% { transform: skewX(-5deg) translateX(-5%) translateZ(0); opacity: 0.15; }
  50%      { transform: skewX(5deg) translateX(5%) translateZ(0); opacity: 0.25; }
}
/* Implementar com 2 divs sobrepostos de gradiente suave — NÃO usar blur */
```

#### Estrelas da constelação (elementos principais)
```css
/* Twinkle individual — cada estrela tem duração e delay únicos */
@keyframes twinkle {
  0%, 100% { transform: scale(1) translateZ(0); opacity: 1; }
  50%      { transform: scale(0.6) translateZ(0); opacity: 0.4; }
}

/* Aparecimento das estrelas (constelação surge) — stagger por índice */
@keyframes starAppear {
  0%   { transform: scale(0) rotate(-30deg) translateZ(0); opacity: 0; }
  70%  { transform: scale(1.2) rotate(5deg) translateZ(0); opacity: 1; }
  100% { transform: scale(1) rotate(0deg) translateZ(0); opacity: 1; }
}
/* delay: index * 60ms para efeito de constelação "desenhando" */

/* Desaparecimento das estrelas (flash encerra) */
@keyframes starDisappear {
  0%   { transform: scale(1) translateZ(0); opacity: 1; }
  100% { transform: scale(2) translateZ(0); opacity: 0; }
}

/* Linha de constelação conectando estrelas */
/* Implementar com divs em position absolute, largura calculada por JS,
   rotação calculada por atan2, usando scaleX de 0 → 1 para "desenhar" */
@keyframes drawLine {
  from { transform: scaleX(0) translateZ(0); transform-origin: left center; }
  to   { transform: scaleX(1) translateZ(0); transform-origin: left center; }
}

/* Estrela correta piscando no ritmo (metrônomo) */
@keyframes rhythmGlow {
  0%, 100% { transform: scale(1) translateZ(0); opacity: 1; }
  50%      { transform: scale(1.3) translateZ(0); opacity: 0.6; }
}
```

#### Timer visual (barra de tempo)
```css
/* Barra que encolhe da direita para a esquerda */
@keyframes timerShrink {
  from { transform: scaleX(1) translateZ(0); transform-origin: left; }
  to   { transform: scaleX(0) translateZ(0); transform-origin: left; }
}
/* Duração controlada via animation-duration dinâmico no style prop */
/* Muda de cor conforme diminui: verde → amarelo → vermelho
   usando CSS custom property animada */

/* Pulsação urgente nos últimos 2 segundos */
@keyframes timerPulse {
  0%, 100% { transform: scaleX(var(--progress)) scaleY(1) translateZ(0); }
  50%      { transform: scaleX(var(--progress)) scaleY(1.3) translateZ(0); }
}
```

#### Botões de resposta (3 opções numéricas)
```css
/* Entrada: flyInLeft com stagger (delay: 0ms, 80ms, 160ms) */

/* Hover/touch: tilt 3D (perspective no container) */
@keyframes buttonTilt {
  /* calculado via JS com base na posição do touch */
}

/* Selecionado correto: successBounce + cor verde */
/* Selecionado errado: errorShake + cor vermelha por 500ms */
/* Todos os botões: popIn ao surgir */
```

#### Telescópio (fase 2 — hold para ampliar)
```css
/* Círculo que expande ao segurar o botão */
@keyframes telescopeExpand {
  from { transform: scale(0.3) translateZ(0); opacity: 0; }
  to   { transform: scale(1) translateZ(0); opacity: 1; }
}
/* Vinheta circular usando radial-gradient no pseudo-elemento ::after */
/* Sem blur — usar apenas gradiente de opacidade nas bordas */
```

### 5 Fases

```js
export const PHASES = [
  { id: 1, estrelas: [2,3,4,5],     flashDuration: 2000, opcoes: 3, agrupadas: false },
  { id: 2, estrelas: [4,5,6,7,8],   flashDuration: 1500, opcoes: 3, agrupadas: true  },
  { id: 3, estrelas: [5,7,9,10,12], flashDuration: 1200, opcoes: 3, agrupadas: true  },
  { id: 4, estrelas: [8,10,12,15],  flashDuration: 1000, opcoes: 4, agrupadas: true  },
  { id: 5, estrelas: [10,15,18,20], flashDuration: 800,  opcoes: 4, agrupadas: true  },
]
// 'agrupadas: true' = estrelas organizadas em grupos visuais para facilitar contagem
```

---

## SISTEMA DE FEEDBACK UNIFICADO — `FeedbackSystem.js`

```js
// Funções puras que adicionam/removem classes CSS nos elementos React via ref

export function playSuccess(ref) {
  if (!ref.current) return
  ref.current.classList.remove('feedback-error')
  ref.current.classList.add('feedback-success')
  playSound('success')
  spawnParticles(ref.current)
  setTimeout(() => ref.current?.classList.remove('feedback-success'), 800)
}

export function playError(ref) {
  if (!ref.current) return
  ref.current.classList.remove('feedback-success')
  ref.current.classList.add('feedback-error')
  playSound('error')
  setTimeout(() => ref.current?.classList.remove('feedback-error'), 500)
}

export function playPhaseComplete(containerRef) {
  playSound('phase')
  spawnMassParticles(containerRef.current) // 20 partículas
}

// Classes CSS no module.css compartilhado:
// .feedback-success → animation: successBounce 0.8s ease
// .feedback-error   → animation: errorShake 0.5s ease
```

---

## SISTEMA DE ÁUDIO — `AudioSystem.js` (Web Audio API nativa)

```js
// Zero dependências externas — usa apenas Web Audio API do browser
// Funciona em todos os navegadores modernos

class AudioSystem {
  constructor() {
    this.ctx = null
    this.enabled = true
  }

  init() {
    // Inicializar apenas após interação do usuário (política de autoplay)
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
  }

  // Gera sons sintetizados (sem arquivos .mp3)
  playTone(config) {
    if (!this.ctx || !this.enabled) return
    const { freq = 440, duration = 0.1, type = 'sine', volume = 0.3 } = config
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
    gain.gain.setValueAtTime(volume, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }

  // Sons específicos por evento
  success() {
    // Arpejo ascendente: C5 → E5 → G5
    this.playTone({ freq: 523, duration: 0.1 })
    setTimeout(() => this.playTone({ freq: 659, duration: 0.1 }), 80)
    setTimeout(() => this.playTone({ freq: 784, duration: 0.2 }), 160)
  }

  error() {
    // Descida dissonante
    this.playTone({ freq: 220, duration: 0.15, type: 'sawtooth', volume: 0.2 })
    setTimeout(() => this.playTone({ freq: 180, duration: 0.2, type: 'sawtooth', volume: 0.15 }), 100)
  }

  tap() {
    this.playTone({ freq: 800, duration: 0.05, type: 'sine', volume: 0.15 })
  }

  phase() {
    // Fanfarra de 5 notas
    const notes = [523, 587, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone({ freq, duration: 0.15 }), i * 100)
    })
  }

  dragStart() {
    this.playTone({ freq: 600, duration: 0.06, type: 'sine', volume: 0.1 })
  }
}

export const audio = new AudioSystem()
```

---

## HOOK DE DRAG — `useSwipe.js`

```js
// Implementação com Pointer Events API (unifica mouse + touch + stylus)
// Sem biblioteca externa

export function useDrag({ onDragStart, onDragMove, onDragEnd }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let isDragging = false
    let startX, startY, currentX, currentY

    function handlePointerDown(e) {
      e.preventDefault()
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      el.setPointerCapture(e.pointerId) // essencial para touch
      onDragStart?.({ x: startX, y: startY, element: el })
    }

    function handlePointerMove(e) {
      if (!isDragging) return
      currentX = e.clientX
      currentY = e.clientY
      onDragMove?.({ x: currentX, y: currentY, dx: currentX - startX, dy: currentY - startY })
    }

    function handlePointerUp(e) {
      if (!isDragging) return
      isDragging = false
      onDragEnd?.({ x: e.clientX, y: e.clientY, dx: e.clientX - startX, dy: e.clientY - startY })
    }

    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerup', handlePointerUp)
      el.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [onDragStart, onDragMove, onDragEnd])

  return ref
}
```

---

## HOOK DE TAP — `useTap.js`

```js
export function useTap({ onTap, onDoubleTap, onHold, holdDuration = 600 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let lastTap = 0
    let holdTimer = null

    function handlePointerDown(e) {
      holdTimer = setTimeout(() => {
        onHold?.({ x: e.clientX, y: e.clientY })
        holdTimer = null
      }, holdDuration)
    }

    function handlePointerUp(e) {
      if (holdTimer) {
        clearTimeout(holdTimer)
        holdTimer = null
        const now = Date.now()
        const timeSinceLast = now - lastTap
        if (timeSinceLast < 300 && timeSinceLast > 0) {
          onDoubleTap?.({ x: e.clientX, y: e.clientY })
        } else {
          onTap?.({ x: e.clientX, y: e.clientY })
        }
        lastTap = now
      }
    }

    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', () => { clearTimeout(holdTimer); holdTimer = null })

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointerup', handlePointerUp)
    }
  }, [onTap, onDoubleTap, onHold, holdDuration])

  return ref
}
```

---

## GAME SHELL — `GameShell.jsx`

Interface compartilhada por todos os jogos:

```jsx
// Elementos da UI:
// - Botão voltar (top-left): ← ícone, min 44x44px
// - Score (top-center): número com animação de pop ao incrementar
// - Barra de progresso de fases (top-right): 5 bolinhas
//   Fase completa: bolinha muda de outline para filled com successBounce
// - Nível atual: "Fase X de 5"

// CSS da barra de progresso:
// @keyframes phaseDot { ... successBounce em 400ms }
// Bolinha ativa pisca suavemente com breathe animation
```

---

## PARTÍCULAS CSS — `ParticlesBurst.jsx`

```jsx
// Máximo 12 partículas por burst (limitação de performance mobile)
// Cada partícula: <span> de 6px com forma aleatória (●, ★, ◆)
// CSS custom properties para direção: --dx (−80 a 80px), --dy (−120 a −40px)
// Remove do DOM após animation completar (600ms)
// Implementar com React state: array de partículas, limpar após timeout

// Exemplo de partícula:
// <span
//   style={{ '--dx': `${randomDx}px`, '--dy': `${randomDy}px`, color: randomColor }}
//   className={styles.particle}
// />

// CSS:
// @keyframes particleBurst {
//   0%   { transform: translate(0,0) scale(1) translateZ(0); opacity: 1; }
//   100% { transform: translate(var(--dx),var(--dy)) scale(0) translateZ(0); opacity: 0; }
// }
// .particle { animation: particleBurst 0.6s ease-out forwards; }
```

---

## CONFIGURAÇÃO DE PERFORMANCE — `global.css`

```css
/* Otimizações globais de performance */

/* Forçar aceleração de hardware em todos os elementos animados */
.animated {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Prevenir seleção de texto durante drag */
.no-select {
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation; /* remove delay de 300ms no iOS */
}

/* Containment CSS — limitar repaints ao componente */
.game-container {
  contain: layout style paint;
}

/* Scroll suave sem jank */
html {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Evitar flash branco em iOS ao carregar */
body {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

/* Respeitar preferência de movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## RESPONSIVIDADE — BREAKPOINTS

```css
/* Base: 320px (iPhone SE) */
/* sm: 375px (iPhone padrão) */
/* md: 430px (iPhone Plus) */
/* lg: 768px (iPad) */
/* xl: 1024px (desktop) */

/* Tamanhos de fonte fluidos via clamp() */
.game-title    { font-size: clamp(20px, 5vw, 32px); }
.score-display { font-size: clamp(24px, 6vw, 40px); }

/* Área de jogo: sempre quadrada e centralizada */
.game-area {
  width: min(100vw, 100vh - 120px); /* 120px = espaço da UI */
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}

/* Touch targets mínimos (WCAG 2.5.5) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

---

## COMANDOS DE INSTALAÇÃO — EXECUTE NO REPLIT

```bash
# Criar projeto
npm create vite@latest 123go-jogos -- --template react
cd 123go-jogos

# Dependências de produção
npm install

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Emojis Apple 3D
npm install emoji-datasource-apple

# Iniciar
npm run dev
```

> **Confirmar versões mínimas:**
> - React ≥ 18.2
> - Vite ≥ 5.0
> - Node.js ≥ 18 LTS
> - Tailwind ≥ 3.4

---

## CHECKLIST DE QUALIDADE

Antes de considerar cada jogo pronto, verificar:

- [ ] Roda a 60fps no Chrome DevTools com CPU throttle 4x (simula mid-low end)
- [ ] Nenhuma animação usa `top`, `left`, `width`, `height` ou `margin`
- [ ] Todos os `will-change: transform` aplicados em elementos com loop
- [ ] Touch funciona em iOS Safari e Android Chrome
- [ ] Áreas de toque ≥ 44×44px em todos os elementos interativos
- [ ] Drag funciona com dedo e com mouse
- [ ] Feedback de acerto/erro ocorre em < 50ms após a ação
- [ ] Partículas somem do DOM após a animação (sem vazamento de memória)
- [ ] `prefers-reduced-motion` desliga todas as animações decorativas
- [ ] Jogo funciona completamente offline (sem requests externos)
- [ ] Score e fase salvos em `localStorage` ao sair
- [ ] Sem `console.error` ou warnings no DevTools
