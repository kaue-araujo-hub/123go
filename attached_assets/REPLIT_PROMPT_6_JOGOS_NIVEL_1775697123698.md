# PROMPT PARA O REPLIT — 6 NOVOS JOGOS + CARDS DE NÍVEL
## Plataforma 123GO! · Pré-numérico & Numérico · 1º Ano EF

---

## CONTEXTO — O QUE JÁ EXISTE (NÃO ALTERAR)

```
src/
├── data/
│   └── games.js               ← array dos 21 jogos — ADICIONAR os 6 novos
├── engine/
│   ├── GameEngine.js          ← motor base — HERDAR em todos os 6 jogos
│   ├── AudioSystem.js         ← Web Audio API nativa — USAR para sons
│   ├── FeedbackSystem.js      ← successBounce, errorShake, partículas
│   ├── PhaseManager.js        ← fases 1–5 — USAR em todos os 6 jogos
│   ├── TimerSystem.js         ← cronômetro por fase
│   └── TimerStore.js          ← localStorage
├── hooks/
│   ├── useSwipe.js            ← useDragFixed com Pointer Events API
│   └── useTap.js              ← tap, doubleTap, hold
├── auth/
│   └── SessionManager.js      ← professor/aluno, PIN
└── components/
    ├── GameShell.jsx           ← wrapper com timer, badge, fases
    ├── HowToPlay/             ← tela "Como Jogar" + mini desafios
    ├── StartCountdown/        ← animação 1→2→3→GO!
    └── ModeBadge.jsx          ← badge de modalidade
```

**Design System já definido (OBRIGATÓRIO manter consistência):**
```css
--c1: #FF6B35  /* laranja — Geometria */
--c2: #E91E8C  /* rosa — Álgebra */
--c3: #5B4FCF  /* roxo — Números */
--c4: #00B4D8  /* azul — Grandezas */
--c5: #4CAF50  /* verde — Probabilidade */
--c6: #FF9800  /* âmbar — bimestre */
--bg: #F7F8FC
--text: #1A1A2E
--radius: 16px
Fonte: Nunito 800/900 (display) + Nunito Sans 400/600/700 (corpo)
```

**Regra de performance INVIOLÁVEL:**
- Animações: apenas `transform` e `opacity` — nunca `top/left/width/height`
- `will-change: transform` em todo elemento com animação contínua
- Touch targets ≥ 44×44px
- `setPointerCapture` obrigatório no drag
- `touch-action: none` no elemento arrastável

---

## PARTE 1 — ADICIONAR OS 6 JOGOS AO `src/data/games.js`

Adicionar os seguintes objetos ao array `GAMES` existente,
após os 21 jogos já cadastrados (ids 22 a 27):

```js
// ─── NÍVEL PRÉ-NUMÉRICO ───────────────────────────────────────────────────────

{
  id:              22,
  title:           "Mais ou Menos?",
  desc:            "Arraste o polegar para o grupo com mais ou menos objetos!",
  emoji:           "👍",
  bg:              "#E6F1FB",
  ano:             1,
  periodo:         1,
  tema:            "numeros",
  unidade:         "Números",
  codigo:          "EF01MA03",
  habilidade:      "Estimar e comparar quantidades de objetos de dois conjuntos para indicar 'tem mais', 'tem menos' ou 'tem a mesma quantidade'.",
  objeto:          "Quantificação de elementos de uma coleção: estimativas, contagem um a um, pareamento e comparação.",
  path:            "/games/g22-mais-ou-menos/",
  interactionType: "drag",
  nivel:           "pre-numerico",   // ← CAMPO NOVO
  tutorialTheme:   { bg: "#E6F1FB", emoji: "👍", color: "#00B4D8" }
},

{
  id:              23,
  title:           "Conecte o Igual",
  desc:            "Ligue as formas iguais desenhando uma linha entre elas!",
  emoji:           "🔵",
  bg:              "#FBEAF0",
  ano:             1,
  periodo:         1,
  tema:            "algebra",
  unidade:         "Álgebra",
  codigo:          "EF01MA09",
  habilidade:      "Organizar e ordenar objetos do cotidiano ou representações por figuras, por meio de atributos, tais como cor, forma e medida.",
  objeto:          "Padrões figurais e numéricos: investigação de regularidades ou padrões em sequências.",
  path:            "/games/g23-conecte-igual/",
  interactionType: "gesture",
  nivel:           "pre-numerico",
  tutorialTheme:   { bg: "#FBEAF0", emoji: "🔵", color: "#E91E8C" }
},

{
  id:              24,
  title:           "Qual Cabe Aqui?",
  desc:            "Toque no objeto que cabe no espaço! Descubra qual tem o tamanho certo.",
  emoji:           "📦",
  bg:              "#E1F5EE",
  ano:             1,
  periodo:         1,
  tema:            "grandezas",
  unidade:         "Grandezas e Medidas",
  codigo:          "EF01MA15",
  habilidade:      "Comparar comprimentos, capacidades ou massas, utilizando termos como mais alto, mais baixo, mais comprido, mais curto, para ordenar objetos de uso cotidiano.",
  objeto:          "Medidas de comprimento, massa e capacidade: comparações e unidades de medidas não convencionais.",
  path:            "/games/g24-qual-cabe-aqui/",
  interactionType: "tap",
  nivel:           "pre-numerico",
  tutorialTheme:   { bg: "#E1F5EE", emoji: "📦", color: "#4CAF50" }
},

// ─── NÍVEL NUMÉRICO ───────────────────────────────────────────────────────────

{
  id:              25,
  title:           "Alimente o Monstro",
  desc:            "O monstro está com fome! Arraste exatamente o número de itens que ele pediu.",
  emoji:           "👾",
  bg:              "#FAECE7",
  ano:             1,
  periodo:         1,
  tema:            "numeros",
  unidade:         "Números",
  codigo:          "EF01MA02",
  habilidade:      "Contar de maneira exata ou aproximada, utilizando diferentes estratégias como o pareamento e outros agrupamentos.",
  objeto:          "Quantificação de elementos de uma coleção: estimativas, contagem um a um, pareamento ou outros agrupamentos e comparação.",
  path:            "/games/g25-alimente-monstro/",
  interactionType: "drag",
  nivel:           "numerico",
  tutorialTheme:   { bg: "#FAECE7", emoji: "👾", color: "#FF6B35" }
},

{
  id:              26,
  title:           "Ligue o Número",
  desc:            "Ligue o número ao grupo que tem aquela quantidade de objetos!",
  emoji:           "🔢",
  bg:              "#EEEDFE",
  ano:             1,
  periodo:         1,
  tema:            "numeros",
  unidade:         "Números",
  codigo:          "EF01MA02",
  habilidade:      "Contar de maneira exata ou aproximada e estimar quantidades para indicar correspondência número-quantidade.",
  objeto:          "Quantificação de elementos de uma coleção: estimativas, contagem um a um, pareamento ou outros agrupamentos e comparação.",
  path:            "/games/g26-ligue-numero/",
  interactionType: "gesture",
  nivel:           "numerico",
  tutorialTheme:   { bg: "#EEEDFE", emoji: "🔢", color: "#5B4FCF" }
},

{
  id:              27,
  title:           "Quantos Tem?",
  desc:            "Conte os objetos e escolha a resposta certa! Quantos você vê?",
  emoji:           "🍎",
  bg:              "#EAF3DE",
  ano:             1,
  periodo:         1,
  tema:            "numeros",
  unidade:         "Números",
  codigo:          "EF01MA02",
  habilidade:      "Contar de maneira exata ou aproximada, utilizando diferentes estratégias como o pareamento e outros agrupamentos.",
  objeto:          "Quantificação de elementos de uma coleção: estimativas, contagem um a um, pareamento ou outros agrupamentos e comparação.",
  path:            "/games/g27-quantos-tem/",
  interactionType: "tap",
  nivel:           "numerico",
  tutorialTheme:   { bg: "#EAF3DE", emoji: "🍎", color: "#4CAF50" }
},
```

---

## PARTE 2 — CARDS DE NÍVEL ACIMA DO CARROSSEL

### Localização no layout

```
CatalogPage.jsx — estrutura atual:
  <HeroCard />
  <FilterBar />          ← filtros Ano / Período / Temas
  <div> "Trilha de Matemática" + Carrossel de temas </div>   ← INSERIR ANTES DAQUI
  <GamesGrid />
  <Pagination />

INSERIR o componente <NivelCards /> ENTRE o FilterBar e o carrossel de Trilha.
```

### Criar `src/components/NivelCards/NivelCards.jsx`

```jsx
/**
 * NivelCards.jsx
 * Dois cards de nível (Pré-numérico e Numérico) exibidos acima do carrossel
 * de Trilha de Matemática. Clicar em um card abre um modal com os 3 jogos
 * correspondentes a aquele nível.
 */

import { useState }         from 'react'
import { GAMES }            from '../../data/games'
import { NivelModal }       from './NivelModal'
import { getAppleEmojiUrl } from '../../utils/AppleEmoji'
import styles               from './NivelCards.module.css'

const NIVEIS = [
  {
    id:          'pre-numerico',
    label:       'Pré-numérico',
    sublabel:    'Comparar, classificar e perceber',
    emoji:       '🌱',
    color:       '#00B4D8',
    colorBg:     '#E6F1FB',
    colorDark:   '#0C447C',
    descricao:   'Antes de contar, a criança aprende a comparar tamanhos, reconhecer formas e perceber "mais" e "menos" de forma visual.',
    tag:         '3 jogos',
  },
  {
    id:          'numerico',
    label:       'Numérico',
    sublabel:    'Contar, nomear e relacionar',
    emoji:       '🔢',
    color:       '#5B4FCF',
    colorBg:     '#EEEDFE',
    colorDark:   '#26215C',
    descricao:   'A criança conta objetos, associa números a quantidades e começa a construir os primeiros fatos matemáticos.',
    tag:         '3 jogos',
  },
]

export function NivelCards() {
  const [activeNivel, setActiveNivel] = useState(null)

  const jogosDoNivel = activeNivel
    ? GAMES.filter(g => g.nivel === activeNivel)
    : []

  return (
    <>
      <section className={styles.section} aria-label="Níveis de aprendizagem">
        <h2 className={styles.sectionTitle}>Nível</h2>

        <div className={styles.grid}>
          {NIVEIS.map((nivel, i) => (
            <button
              key={nivel.id}
              className={styles.card}
              style={{
                '--nivel-color':    nivel.color,
                '--nivel-bg':       nivel.colorBg,
                '--nivel-dark':     nivel.colorDark,
                '--card-delay':     `${i * 0.08}s`,
              }}
              onPointerUp={() => setActiveNivel(nivel.id)}
              aria-label={`Nível ${nivel.label} — ${nivel.tag}`}
              aria-haspopup="dialog"
              style={{
                '--nivel-color': nivel.color,
                '--nivel-bg':    nivel.colorBg,
                '--nivel-dark':  nivel.colorDark,
                animationDelay:  `${i * 0.08}s`,
                touchAction:     'manipulation',
              }}
            >
              {/* Ícone */}
              <span className={styles.cardEmoji} aria-hidden="true">
                {nivel.emoji}
              </span>

              {/* Textos */}
              <div className={styles.cardText}>
                <span className={styles.cardLabel}>{nivel.label}</span>
                <span className={styles.cardSub}>{nivel.sublabel}</span>
              </div>

              {/* Tag de contagem */}
              <span className={styles.cardTag} aria-hidden="true">
                {nivel.tag}
              </span>

              {/* Seta */}
              <span className={styles.cardArrow} aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </section>

      {/* Modal */}
      {activeNivel && (
        <NivelModal
          nivel={NIVEIS.find(n => n.id === activeNivel)}
          jogos={jogosDoNivel}
          onClose={() => setActiveNivel(null)}
        />
      )}
    </>
  )
}
```

### Criar `src/components/NivelCards/NivelModal.jsx`

```jsx
/**
 * NivelModal.jsx
 * Modal que aparece ao clicar em um card de nível.
 * Exibe os 3 jogos do nível com emoji Apple, nome, descrição e botão Jogar.
 * Mobile: sheet de baixo para cima. Desktop: modal centralizado.
 */

import { useEffect, useRef }    from 'react'
import { getAppleEmojiUrl }     from '../../utils/AppleEmoji'
import { audio }                from '../../engine/AudioSystem'
import styles                   from './NivelModal.module.css'

export function NivelModal({ nivel, jogos, onClose, onGameSelect }) {
  const modalRef = useRef(null)

  // Fechar com ESC
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // Bloquear scroll do body enquanto o modal está aberto
    document.body.style.overflow = 'hidden'
    // Focar o modal para acessibilidade
    modalRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function handleGameTap(jogo) {
    audio.tap?.()
    onClose()
    onGameSelect?.(jogo)  // passa para o App.jsx iniciar o fluxo HowToPlay → Countdown → Jogo
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nivel-modal-title"
        tabIndex={-1}
        style={{ '--modal-color': nivel.color, '--modal-bg': nivel.colorBg }}
      >
        {/* Handle mobile */}
        <div className={styles.handle} aria-hidden="true" />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEmoji} aria-hidden="true">{nivel.emoji}</span>
            <div>
              <h2 id="nivel-modal-title" className={styles.headerTitle}>
                Nível {nivel.label}
              </h2>
              <p className={styles.headerDesc}>{nivel.descricao}</p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onPointerUp={onClose}
            aria-label="Fechar modal"
            style={{ touchAction: 'manipulation' }}
          >
            ✕
          </button>
        </div>

        {/* Lista de jogos */}
        <div className={styles.jogosList} role="list">
          {jogos.map((jogo, i) => (
            <button
              key={jogo.id}
              className={styles.jogoCard}
              style={{ animationDelay: `${i * 0.07}s` }}
              onPointerUp={() => handleGameTap(jogo)}
              role="listitem"
              aria-label={`Jogar ${jogo.title}`}
              style={{
                animationDelay: `${i * 0.07}s`,
                touchAction: 'manipulation',
              }}
            >
              {/* Thumbnail do jogo */}
              <div
                className={styles.jogoThumb}
                style={{ background: jogo.bg }}
                aria-hidden="true"
              >
                <img
                  className={styles.jogoEmoji}
                  src={getAppleEmojiUrl(jogo.emoji, 64)}
                  alt={jogo.title}
                  width="48"
                  height="48"
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.insertAdjacentHTML('afterend',
                      `<span style="font-size:40px">${jogo.emoji}</span>`)
                  }}
                />
              </div>

              {/* Info do jogo */}
              <div className={styles.jogoInfo}>
                <span className={styles.jogoTitle}>{jogo.title}</span>
                <span className={styles.jogoDesc}>{jogo.desc}</span>
                <span className={styles.jogoCodigo}>{jogo.codigo}</span>
              </div>

              {/* Seta de ação */}
              <span className={styles.jogoArrow} aria-hidden="true">▶</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Criar `src/components/NivelCards/NivelCards.module.css`

```css
/* ─── Seção ──────────────────────────────────────────────────────────────────── */
.section {
  margin-bottom: 24px;
}

.sectionTitle {
  font-family:  'Nunito', sans-serif;
  font-weight:  800;
  font-size:    16px;
  color:        var(--text, #1A1A2E);
  margin-bottom: 12px;
}

/* ─── Grid dos dois cards ─────────────────────────────────────────────────────── */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .grid { gap: 16px; }
}

/* ─── Card de nível ──────────────────────────────────────────────────────────── */
.card {
  display:       flex;
  align-items:   center;
  gap:           12px;
  padding:       14px 16px;
  border-radius: var(--radius, 16px);
  border:        1.5px solid var(--border, #E8E8F0);
  background:    var(--nivel-bg, #F7F8FC);
  cursor:        pointer;
  text-align:    left;
  position:      relative;
  overflow:      hidden;

  /* Performance GPU */
  will-change:   transform;
  transform:     translateZ(0);
  touch-action:  manipulation;
  user-select:   none;
  -webkit-user-select: none;

  /* Transições */
  transition:    transform 0.15s ease, border-color 0.15s ease;

  /* Entrada animada */
  animation:     cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
}

@keyframes cardIn {
  from { transform: translateY(12px) scale(0.95) translateZ(0); opacity: 0; }
  to   { transform: translateY(0)    scale(1)    translateZ(0); opacity: 1; }
}

/* Hover — apenas mouse */
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform:    translateY(-2px) translateZ(0);
    border-color: var(--nivel-color);
  }
}

.card:active { transform: scale(0.96) translateZ(0); }

/* Brilho de fundo decorativo */
.card::before {
  content:     '';
  position:    absolute;
  inset:       0;
  background:  linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%);
  pointer-events: none;
}

/* ─── Conteúdo do card ───────────────────────────────────────────────────────── */
.cardEmoji {
  font-size:    28px;
  flex-shrink:  0;
  line-height:  1;
  will-change:  transform;
  animation:    emojiFloat 3s ease-in-out infinite;
}

@keyframes emojiFloat {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50%      { transform: translateY(-4px) translateZ(0); }
}

.cardText {
  flex:           1;
  display:        flex;
  flex-direction: column;
  gap:            2px;
  min-width:      0;
}

.cardLabel {
  font-family:  'Nunito', sans-serif;
  font-weight:  800;
  font-size:    clamp(13px, 3.5vw, 15px);
  color:        var(--nivel-dark, #1A1A2E);
  white-space:  nowrap;
  overflow:     hidden;
  text-overflow: ellipsis;
}

.cardSub {
  font-size:    clamp(10px, 2.5vw, 12px);
  color:        var(--text2, #5A5A7A);
  line-height:  1.3;
}

.cardTag {
  font-family:   'Nunito', sans-serif;
  font-weight:   700;
  font-size:     11px;
  color:         var(--nivel-color);
  background:    rgba(0,0,0,0.04);
  padding:       3px 8px;
  border-radius: 50px;
  flex-shrink:   0;
  white-space:   nowrap;
}

.cardArrow {
  font-size:   20px;
  color:       var(--nivel-color);
  flex-shrink: 0;
  will-change: transform;
  animation:   arrowPulse 1.5s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% { transform: translateX(0) translateZ(0); }
  50%      { transform: translateX(3px) translateZ(0); }
}

@media (prefers-reduced-motion: reduce) {
  .card, .cardEmoji, .cardArrow { animation: none !important; transition: none !important; }
}
```

### Criar `src/components/NivelCards/NivelModal.module.css`

```css
/* ─── Overlay ────────────────────────────────────────────────────────────────── */
.overlay {
  position:        fixed;
  inset:           0;
  background:      rgba(26,26,46,0.6);
  z-index:         300;
  display:         flex;
  align-items:     flex-end;     /* mobile: sheet de baixo */
  justify-content: center;
  padding:         0;
  animation:       overlayIn 0.2s ease both;
  will-change:     opacity;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Desktop: centralizado */
@media (min-width: 600px) {
  .overlay { align-items: center; padding: 24px; }
}

/* ─── Modal ──────────────────────────────────────────────────────────────────── */
.modal {
  background:    var(--white, #ffffff);
  width:         100%;
  max-width:     480px;
  max-height:    88vh;
  border-radius: 24px 24px 0 0;
  overflow-y:    auto;
  -webkit-overflow-scrolling: touch;
  outline:       none;
  animation:     modalUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  will-change:   transform, opacity;
}

@media (min-width: 600px) {
  .modal {
    border-radius: 24px;
    max-height:    80vh;
    animation:     modalScale 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  }
}

@keyframes modalUp {
  from { transform: translateY(100%) translateZ(0); opacity: 0; }
  to   { transform: translateY(0)    translateZ(0); opacity: 1; }
}

@keyframes modalScale {
  from { transform: scale(0.88) translateZ(0); opacity: 0; }
  to   { transform: scale(1)    translateZ(0); opacity: 1; }
}

/* ─── Handle mobile ──────────────────────────────────────────────────────────── */
.handle {
  width:         36px;
  height:        4px;
  background:    #E8E8F0;
  border-radius: 2px;
  margin:        12px auto 0;
}

@media (min-width: 600px) { .handle { display: none; } }

/* ─── Header ─────────────────────────────────────────────────────────────────── */
.header {
  display:         flex;
  align-items:     flex-start;
  justify-content: space-between;
  gap:             12px;
  padding:         16px 20px 14px;
  border-bottom:   1px solid #E8E8F0;
}

.headerLeft {
  display:     flex;
  align-items: flex-start;
  gap:         12px;
  flex:        1;
}

.headerEmoji {
  font-size:   40px;
  line-height: 1;
  flex-shrink: 0;
}

.headerTitle {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size:   18px;
  color:       #1A1A2E;
  margin:      0 0 4px;
}

.headerDesc {
  font-size:   13px;
  color:       #5A5A7A;
  line-height: 1.5;
  margin:      0;
}

.closeBtn {
  width:         36px;
  height:        36px;
  border-radius: 50%;
  border:        1.5px solid #E8E8F0;
  background:    transparent;
  font-size:     14px;
  color:         #9090B0;
  cursor:        pointer;
  display:       flex;
  align-items:   center;
  justify-content: center;
  flex-shrink:   0;
  touch-action:  manipulation;
  will-change:   transform;
  transition:    transform 0.15s ease;
}
.closeBtn:active { transform: scale(0.92) translateZ(0); }

/* ─── Lista de jogos ─────────────────────────────────────────────────────────── */
.jogosList {
  padding: 12px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ─── Card de jogo dentro do modal ──────────────────────────────────────────── */
.jogoCard {
  display:       flex;
  align-items:   center;
  gap:           14px;
  padding:       12px 14px;
  border-radius: 14px;
  border:        1.5px solid #E8E8F0;
  background:    #ffffff;
  cursor:        pointer;
  text-align:    left;
  width:         100%;
  will-change:   transform;
  transition:    transform 0.15s ease, border-color 0.15s ease;
  touch-action:  manipulation;
  user-select:   none;
  -webkit-user-select: none;

  animation:     jogoIn 0.35s ease both;
}

@keyframes jogoIn {
  from { transform: translateX(-12px) translateZ(0); opacity: 0; }
  to   { transform: translateX(0)     translateZ(0); opacity: 1; }
}

@media (hover: hover) and (pointer: fine) {
  .jogoCard:hover {
    border-color: var(--modal-color);
    transform:    translateY(-1px) translateZ(0);
  }
}

.jogoCard:active { transform: scale(0.97) translateZ(0); }

/* Thumbnail */
.jogoThumb {
  width:         56px;
  height:        56px;
  border-radius: 12px;
  flex-shrink:   0;
  display:       flex;
  align-items:   center;
  justify-content: center;
  overflow:      hidden;
}

.jogoEmoji {
  width:      42px;
  height:     42px;
  object-fit: contain;
  will-change: transform;
  transition: transform 0.2s ease;
  filter:     drop-shadow(0 3px 8px rgba(0,0,0,0.18));
}

.jogoCard:hover .jogoEmoji {
  transform: scale(1.1) translateZ(0);
}

/* Textos */
.jogoInfo {
  flex:           1;
  display:        flex;
  flex-direction: column;
  gap:            2px;
  min-width:      0;
}

.jogoTitle {
  font-family:   'Nunito', sans-serif;
  font-weight:   800;
  font-size:     15px;
  color:         #1A1A2E;
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
}

.jogoDesc {
  font-size:     12px;
  color:         #5A5A7A;
  line-height:   1.4;
  display:       -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow:      hidden;
}

.jogoCodigo {
  font-size:     10px;
  font-weight:   700;
  color:         var(--modal-color);
  background:    var(--modal-bg);
  padding:       2px 7px;
  border-radius: 50px;
  display:       inline-block;
  width:         fit-content;
  margin-top:    2px;
}

.jogoArrow {
  font-size:   18px;
  color:       var(--modal-color);
  flex-shrink: 0;
}

@media (prefers-reduced-motion: reduce) {
  .modal, .overlay, .jogoCard, .jogoEmoji { animation: none !important; transition: none !important; }
}
```

---

## PARTE 3 — OS 6 JOGOS COMPLETOS

### Estrutura de pastas

```
src/games/
├── g22-mais-ou-menos/
│   ├── MaisOuMenos.jsx
│   ├── MaisOuMenos.module.css
│   └── phases.js
├── g23-conecte-igual/
│   ├── ConecteIgual.jsx
│   ├── ConecteIgual.module.css
│   └── phases.js
├── g24-qual-cabe-aqui/
│   ├── QualCabeAqui.jsx
│   ├── QualCabeAqui.module.css
│   └── phases.js
├── g25-alimente-monstro/
│   ├── AlimenteMonstro.jsx
│   ├── AlimenteMonstro.module.css
│   └── phases.js
├── g26-ligue-numero/
│   ├── LigueNumero.jsx
│   ├── LigueNumero.module.css
│   └── phases.js
└── g27-quantos-tem/
    ├── QuantosTem.jsx
    ├── QuantosTem.module.css
    └── phases.js
```

---

### JOGO G22 — "Mais ou Menos?" (Drag & Drop)

**Habilidade:** EF01MA03 | **Interação:** arrastar polegar para grupo correto

#### `phases.js`
```js
export const PHASES = [
  { id:1, item:'🍎', grupos:[3,7],   pergunta:'mais',  dica:true  },
  { id:2, item:'⭐', grupos:[5,9],   pergunta:'menos', dica:true  },
  { id:3, item:'🐟', grupos:[6,10],  pergunta:'mais',  dica:false },
  { id:4, item:'🌸', grupos:[8,11],  pergunta:'menos', dica:false },
  { id:5, item:'🍌', grupos:[9,12],  pergunta:null,    dica:false }, // fase 5: aleatório
]
// pergunta:null na fase 5 = sortear 'mais' ou 'menos' aleatoriamente a cada rodada
```

#### `MaisOuMenos.jsx` — especificação completa
```jsx
/**
 * Dois grupos de objetos (emojis) aparecem na tela.
 * A pergunta no topo diz "Qual tem MAIS?" ou "Qual tem MENOS?"
 * A criança arrasta o polegar 👍 para o grupo correto.
 *
 * DRAG com useDragFixed (Pointer Events API — já implementado):
 * - pointerdown → setPointerCapture → inicia drag
 * - pointermove → transform: translate(dx,dy)
 * - pointerup → verificar hitbox com getBoundingClientRect()
 * - Se correto: successBounce + som + partículas + avança
 * - Se errado: errorShake + retorna à posição original suavemente
 *
 * LAYOUT:
 * ┌────────────────────────────────┐
 * │  "Qual grupo tem MAIS? 🌟"      │  ← pergunta dinâmica
 * ├─────────────┬──────────────────┤
 * │  🍎🍎🍎     │  🍎🍎🍎🍎🍎🍎🍎 │  ← dois grupos
 * │  (grupo A)  │  (grupo B)       │
 * └─────────────┴──────────────────┘
 *         👍                        ← arrastável, começa centralizado
 *
 * Fases:
 * 1: diferença grande (4 items), dica de seta animada
 * 2: diferença grande, pergunta muda para "menos"
 * 3: diferença média (4 items), sem dica
 * 4: diferença média, pergunta aleatória
 * 5: diferença pequena (3 items), pergunta aleatória, 3 rodadas para completar
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { GameShell }       from '../shared/GameShell'
import { audio }           from '../../engine/AudioSystem'
import { ParticlesBurst }  from '../shared/ParticlesBurst'
import { PHASES }          from './phases'
import styles              from './MaisOuMenos.module.css'

// Usar o useDragFixed já implementado no projeto:
// import { useDragFixed } from '../../hooks/useSwipe'

export function MaisOuMenos({ phase, modeConfig, onPhaseComplete }) {
  const config       = PHASES[phase - 1]
  const [round,      setRound]     = useState(0)   // rodadas completadas
  const [pergunta,   setPergunta]  = useState(config.pergunta ?? 'mais')
  const [particles,  setParticles] = useState(false)
  const [answered,   setAnswered]  = useState(false)
  const phaseCompletedRef = useRef(false)
  const thumbRef          = useRef(null)
  const zonaARef          = useRef(null)
  const zonaBRef          = useRef(null)

  // Determinar qual grupo é a resposta correta
  const [grupoA, grupoB] = config.grupos
  const correto = pergunta === 'mais'
    ? (grupoA > grupoB ? 'A' : 'B')
    : (grupoA < grupoB ? 'A' : 'B')

  function handleDrop({ finalAbsX, finalAbsY }) {
    if (answered || phaseCompletedRef.current) return

    const zonasRef = { A: zonaARef, B: zonaBRef }
    let dropped = null

    for (const [key, ref] of Object.entries(zonasRef)) {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) continue
      if (
        finalAbsX >= rect.left - 24 && finalAbsX <= rect.right  + 24 &&
        finalAbsY >= rect.top  - 24 && finalAbsY <= rect.bottom + 24
      ) { dropped = key; break }
    }

    if (!dropped) {
      // Solto fora — retorna à origem
      returnThumbToOrigin()
      return
    }

    setAnswered(true)

    if (dropped === correto) {
      audio.success()
      setParticles(true)
      setTimeout(() => {
        setParticles(false)
        const newRound = round + 1
        const roundsNeeded = phase === 5 ? 3 : 1
        if (newRound >= roundsNeeded && !phaseCompletedRef.current) {
          phaseCompletedRef.current = true
          setTimeout(onPhaseComplete, 800)
        } else {
          setRound(newRound)
          resetRound()
        }
      }, 900)
    } else {
      audio.error()
      shakeThumb()
      setTimeout(resetRound, 600)
    }
  }

  function returnThumbToOrigin() {
    const el = thumbRef.current
    if (!el) return
    el.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    el.style.transform  = 'translate(0,0) translateZ(0) scale(1)'
    setTimeout(() => { if (el) el.style.transition = '' }, 350)
  }

  function shakeThumb() {
    const el = thumbRef.current
    if (!el) return
    el.classList.add(styles.shake)
    setTimeout(() => {
      el?.classList.remove(styles.shake)
      returnThumbToOrigin()
    }, 500)
  }

  function resetRound() {
    returnThumbToOrigin()
    setAnswered(false)
    if (config.pergunta === null) {
      setPergunta(Math.random() > 0.5 ? 'mais' : 'menos')
    }
  }

  return (
    <div className={styles.arena}>
      {/* Pergunta */}
      <p className={styles.pergunta}>
        Qual grupo tem <strong>{pergunta === 'mais' ? 'MAIS' : 'MENOS'}?</strong>
      </p>

      {/* Grupos de objetos */}
      <div className={styles.grupos}>
        <div ref={zonaARef} className={`${styles.grupo} ${answered && correto==='A' ? styles.grupoCorrect : ''}`}>
          <div className={styles.itens}>
            {Array.from({ length: grupoA }).map((_, i) => (
              <span key={i} className={styles.item}>{config.item}</span>
            ))}
          </div>
          <span className={styles.grupoCount}>{grupoA}</span>
        </div>

        <div ref={zonaBRef} className={`${styles.grupo} ${answered && correto==='B' ? styles.grupoCorrect : ''}`}>
          <div className={styles.itens}>
            {Array.from({ length: grupoB }).map((_, i) => (
              <span key={i} className={styles.item}>{config.item}</span>
            ))}
          </div>
          <span className={styles.grupoCount}>{grupoB}</span>
        </div>
      </div>

      {/* Polegar arrastável */}
      <div
        ref={thumbRef}
        className={styles.thumb}
        style={{ touchAction: 'none', userSelect: 'none', willChange: 'transform' }}
        // Implementar drag usando useDragFixed — passar handleDrop como onDragEnd
      >
        👍
      </div>

      {/* Dica de seta (fases 1 e 2) */}
      {config.dica && !answered && (
        <p className={styles.dica}>Arraste o polegar para um dos grupos!</p>
      )}

      {particles && <ParticlesBurst count={12} color="#5B4FCF" />}
    </div>
  )
}
```

---

### JOGO G23 — "Conecte o Igual" (Ligar pontos com SVG/Canvas)

**Habilidade:** EF01MA09 | **Interação:** desenhar linha entre formas iguais

#### `phases.js`
```js
export const PHASES = [
  { id:1, formas:['círculo','círculo','triângulo','triângulo'],         dica:true  },
  { id:2, formas:['círculo','quadrado','quadrado','triângulo','círculo','triângulo'], dica:true  },
  { id:3, formas:['estrela','círculo','estrela','quadrado','quadrado','círculo'],    dica:false },
  { id:4, formas:['triângulo','coração','coração','triângulo','círculo','círculo'],  dica:false },
  { id:5, formas:['círculo','quadrado','triângulo','estrela','quadrado','triângulo','círculo','estrela'], dica:false },
]

export const FORMA_CORES = {
  círculo:   '#5B4FCF',
  triângulo: '#FF6B35',
  quadrado:  '#4CAF50',
  estrela:   '#FF9800',
  coração:   '#E91E8C',
}
```

#### `ConecteIgual.jsx` — especificação completa
```jsx
/**
 * Formas geométricas aparecem embaralhadas em duas colunas (esquerda e direita).
 * A criança toca em uma forma (coluna esquerda) e arrastra até a forma igual
 * (coluna direita) — a linha é desenhada em tempo real num <canvas> sobreposto.
 *
 * IMPLEMENTAÇÃO:
 * - <canvas> posicionado com position:absolute sobre o layout, pointer-events:none
 * - Formas: elementos <button> com SVG inline (círculo, triângulo, quadrado, etc.)
 * - Pointer Events: pointerdown na forma → inicia linha, pointermove → desenha,
 *   pointerup sobre forma oposta → valida conexão
 * - Linha em tempo real: ctx.clearRect + ctx.beginPath + ctx.lineTo
 * - Conexão correta: linha muda de cor para verde + fade out + par some
 * - Conexão errada: linha vira vermelha + fade out + não remove
 * - Fase completa: todos os pares conectados
 *
 * CORES: cada forma tem cor fixa (FORMA_CORES)
 * Linha em tempo real: stroke = cor da forma selecionada, opacity 0.6
 * Linha confirmada: stroke verde (#4CAF50), opacity 1, largura 4px
 *
 * LAYOUT:
 * ┌──────────────────────────────────┐
 * │  🔵    [canvas]    🔺           │
 * │  🔺               🔵           │  ← formas embaralhadas
 * └──────────────────────────────────┘
 *
 * Fases:
 * 1: 2 pares (4 formas) com dica de "toque aqui!"
 * 2: 3 pares (6 formas) com dica
 * 3: 3 pares, formas adicionais (estrela)
 * 4: 3 pares, coração incluído
 * 5: 4 pares (8 formas), sem dica
 */

// Cada forma é renderizada como SVG inline para ser visível e clara:
const FORMAS_SVG = {
  círculo:   <circle cx="24" cy="24" r="20" />,
  triângulo: <polygon points="24,4 44,44 4,44" />,
  quadrado:  <rect x="4" y="4" width="40" height="40" rx="4" />,
  estrela:   <polygon points="24,2 30,18 46,18 34,28 38,44 24,34 10,44 14,28 2,18 18,18" />,
  coração:   <path d="M24 40 C10 28 2 20 2 14 A10 10 0 0 1 24 10 A10 10 0 0 1 46 14 C46 20 38 28 24 40Z" />,
}
```

---

### JOGO G24 — "Qual Cabe Aqui?" (Clique/Tap)

**Habilidade:** EF01MA15 | **Interação:** tap no objeto de tamanho correto

#### `phases.js`
```js
export const PHASES = [
  { id:1, buraco:'grande',  opcoes:[{item:'📦',tam:'grande'},{item:'📫',tam:'pequeno'}], dica:true  },
  { id:2, buraco:'pequeno', opcoes:[{item:'🪨',tam:'pequeno'},{item:'🗿',tam:'grande'}], dica:true  },
  { id:3, buraco:'grande',  opcoes:[{item:'🛁',tam:'grande'},{item:'🧸',tam:'pequeno'},{item:'🪑',tam:'médio'}], dica:false },
  { id:4, buraco:'pequeno', opcoes:[{item:'🪄',tam:'pequeno'},{item:'🚪',tam:'grande'},{item:'🛋️',tam:'grande'}], dica:false },
  { id:5, buraco:'médio',   opcoes:[{item:'💼',tam:'médio'},{item:'🛻',tam:'grande'},{item:'🪬',tam:'pequeno'}],  dica:false },
]
```

#### `QualCabeAqui.jsx` — especificação completa
```jsx
/**
 * Um "buraco" animado aparece no centro da tela (representado por um contorno
 * pulsante com o tamanho definido: pequeno, médio, grande).
 * Abaixo, 2–3 objetos de tamanhos diferentes ficam disponíveis.
 * A criança toca no objeto que cabe no buraco.
 *
 * IMPLEMENTAÇÃO:
 * - Buraco: div com borda tracejada animada (strokeDasharray pulsante via CSS)
 * - Objetos: botões com emoji grande (56px)
 * - Tap: useTapFixed — toque registra na primeira tentativa
 * - Correto: objeto "entra" no buraco com animação scale down + translateY
 *   buraco "fecha" com scale zero + partículas
 * - Errado: objeto shake lateral, buraco sacode (errorShake)
 * - Progresso: 3 acertos para completar a fase
 * - A cada rodada, embaralhar a ordem dos objetos
 *
 * VISUAL DOS TAMANHOS:
 * - buraco pequeno: 80×80px
 * - buraco médio:   120×120px
 * - buraco grande:  160×160px
 * - objetos escalam conforme tamanho:
 *   pequeno=40px, médio=60px, grande=80px font-size
 *
 * FEEDBACK:
 * - Correto: som ding + bounce + partículas saindo do buraco
 * - Errado: som womp + shake no objeto + buraco fica vermelho por 400ms
 */
```

---

### JOGO G25 — "Alimente o Monstro" (Drag & Drop)

**Habilidade:** EF01MA02 | **Interação:** arrastar exatamente N itens para a boca

#### `phases.js`
```js
export const PHASES = [
  { id:1, pedido:2, item:'🍕', maxItens:5,  dica:true  },
  { id:2, pedido:3, item:'🍎', maxItens:6,  dica:true  },
  { id:3, pedido:4, item:'🍌', maxItens:7,  dica:false },
  { id:4, pedido:5, item:'🧁', maxItens:8,  dica:false },
  { id:5, pedido:null, item:'🍬', maxItens:9, dica:false }, // pedido aleatório 2-6
]
```

#### `AlimenteMonstro.jsx` — especificação completa
```jsx
/**
 * Um monstro animado aparece com um balão dizendo "Me dê X [itens]!"
 * Vários itens (emojis) ficam espalhados na parte inferior.
 * A criança arrasta um item por vez para a boca do monstro.
 * Um contador visual mostra quantos já foram entregues vs o pedido.
 *
 * MECÂNICA:
 * - Cada item é arrastável individualmente (useDragFixed)
 * - Boca do monstro: zona de drop com hitbox de 80px
 * - Ao soltar na boca com count < pedido: item some + monstro faz "munch"
 * - Ao atingir o pedido exato: monstro faz animação de satisfação + fase avança
 * - Ao soltar a mais (count > pedido): monstro faz "bleh" + devolve o item
 * - Ao soltar fora da boca: item retorna à posição original
 *
 * CONTADOR VISUAL:
 * - Linha de círculos no topo: ○○○ (pedido) → ●○○ → ●●○ → ●●● (completo)
 * - Cada círculo preenchido ao entregar um item
 *
 * MONSTRO:
 * - Emoji 👾 em tamanho grande (80px) com idle animation (breathe)
 * - Boca: div oval abaixo do emoji com borda tracejada pulsante
 * - Estado "comendo": scale(1.2) + rotate(10deg) por 300ms
 * - Estado "satisfeito" (pedido completo): scale(1.3) + celebrationSpin
 * - Estado "cheio demais": scale(0.8) + shake
 *
 * FASES:
 * 1: pedir 2, 5 itens disponíveis, dica de seta
 * 2: pedir 3, 6 itens disponíveis
 * 3: pedir 4, 7 itens disponíveis
 * 4: pedir 5, 8 itens disponíveis
 * 5: pedido aleatório 2-6, 9 itens disponíveis, 3 rodadas para completar
 */
```

---

### JOGO G26 — "Ligue o Número" (Ligar com linha)

**Habilidade:** EF01MA02 + EF01MA03 | **Interação:** ligar número ao grupo correto

#### `phases.js`
```js
export const PHASES = [
  { id:1, pares:[{num:2,item:'🌟',qtd:2},{num:4,item:'🍎',qtd:4}],                        dica:true  },
  { id:2, pares:[{num:3,item:'🐟',qtd:3},{num:5,item:'🌸',qtd:5},{num:2,item:'🍌',qtd:2}], dica:true  },
  { id:3, pares:[{num:4,item:'🐸',qtd:4},{num:6,item:'🍬',qtd:6},{num:3,item:'⭐',qtd:3}], dica:false },
  { id:4, pares:[{num:5,item:'🦋',qtd:5},{num:7,item:'🎈',qtd:7},{num:4,item:'🍕',qtd:4}], dica:false },
  { id:5, pares:[{num:3,item:'🌙',qtd:3},{num:6,item:'🔮',qtd:6},{num:4,item:'🦊',qtd:4},{num:8,item:'🌺',qtd:8}], dica:false },
]
```

#### `LigueNumero.jsx` — especificação completa
```jsx
/**
 * Lado esquerdo: números (2, 4, 5...)
 * Lado direito: grupos de objetos embaralhados (não na ordem dos números)
 * A criança arrasta do número ao grupo correspondente (ou vice-versa).
 *
 * LAYOUT:
 * ┌────────┬────────────────────────────────┐
 * │   2    │  🌟🌟🌟🌟🌟 (5 itens)         │
 * │   4    │  🌟🌟 (2 itens)               │
 * │   5    │  🌟🌟🌟🌟 (4 itens)           │
 * └────────┴────────────────────────────────┘
 *          canvas overlay para linhas
 *
 * MECÂNICA (igual ao ConecteIgual mas com número↔grupo):
 * - pointerdown no número → inicia linha
 * - pointermove → desenha linha no canvas
 * - pointerup sobre grupo → valida: num === qtd do grupo
 * - Correto: linha verde permanente + par travado (não pode desconectar)
 * - Errado: linha vermelha + desaparece + tenta de novo
 * - Fase completa: todos os pares ligados
 *
 * VISUAL DOS GRUPOS:
 * - Renderizar os objetos em grade (max 4 por linha)
 * - Número de objetos visível e contável
 * - Fundo colorido diferente para cada grupo
 *
 * NÚMEROS:
 * - Fonte Nunito 900, tamanho grande (40px), fundo colorido com borda
 * - Cor do número corresponde à cor da linha ao conectar
 */
```

---

### JOGO G27 — "Quantos Tem?" (Quiz visual)

**Habilidade:** EF01MA02 | **Interação:** tap na opção numérica correta

#### `phases.js`
```js
export const PHASES = [
  { id:1, maxQtd:5,  opcoes:3, item:'🍎', dica:true,  flashMode:false },
  { id:2, maxQtd:8,  opcoes:3, item:'⭐', dica:false, flashMode:false },
  { id:3, maxQtd:10, opcoes:4, item:'🐟', dica:false, flashMode:false },
  { id:4, maxQtd:12, opcoes:4, item:'🌸', dica:false, flashMode:false },
  { id:5, maxQtd:15, opcoes:4, item:'🍬', dica:false, flashMode:true  }, // flash: mostra e some
]

export function generateRound(phase) {
  const { maxQtd, opcoes } = PHASES[phase - 1]
  const correct = 1 + Math.floor(Math.random() * maxQtd)
  const opts    = new Set([correct])
  while (opts.size < opcoes) {
    const cand = Math.max(1, correct + Math.floor(Math.random() * 5) - 2)
    if (cand !== correct) opts.add(cand)
  }
  return {
    correct,
    options: shuffle([...opts])
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
```

#### `QuantosTem.jsx` — especificação completa
```jsx
/**
 * Objetos aparecem na tela em grade (máx 5 por linha).
 * Pergunta: "Quantos [item] você vê?"
 * 3–4 botões com números aparecem abaixo.
 * A criança toca no número correto.
 *
 * FASE 5 (flashMode):
 * - Objetos aparecem por 1.5s e somem
 * - Botões só aparecem depois que os objetos somem
 * - Criança precisa ter memorizado a quantidade
 *
 * MECÂNICA:
 * - Toque no botão correto: successBounce + partículas + som + próxima rodada
 * - Toque no botão errado: errorShake no botão + som womp
 *   (objetos PERMANECEM visíveis — não é punitivo)
 * - 4 acertos consecutivos = fase completa
 *   (contador de acertos reseta se errar na fase 4 e 5)
 *
 * LAYOUT:
 * ┌────────────────────────────────┐
 * │  "Quantos 🍎 você vê?"         │
 * │  🍎🍎🍎🍎🍎                   │
 * │  🍎🍎🍎                       │  ← grade de objetos
 * ├────────────────────────────────┤
 * │  [3]  [8]  [7]  [5]           │  ← opções (botões grandes)
 * └────────────────────────────────┘
 *
 * BOTÕES DE RESPOSTA:
 * - Nunito 900, tamanho 24px
 * - min 72×72px (touch target generoso)
 * - Fundo colorido diferente para cada botão
 * - Ao tocar: scale(0.94) imediato como feedback visual (< 16ms)
 *
 * PROGRESSO:
 * - Mini barra de progresso no topo: 4 estrelinhas ☆☆☆☆
 * - A cada acerto: ★☆☆☆ → ★★☆☆ → etc.
 * - Ao completar 4: fase avança com celebração
 */
```

---

## PARTE 4 — INTEGRAR NO `CatalogPage.jsx`

Adicionar o componente `<NivelCards />` entre o `FilterBar` e o carrossel de trilhas:

```jsx
// CatalogPage.jsx — localizar a seção do carrossel e INSERIR ANTES:

import { NivelCards } from '../components/NivelCards/NivelCards'

// No JSX, entre o FilterBar e o carrossel existente:
<FilterBar />

{/* ← INSERIR AQUI */}
<NivelCards onGameSelect={onGameSelect} />

<section className="trilha-section">
  <h2>Trilha de Matemática</h2>
  {/* carrossel existente ... */}
</section>
```

Passar `onGameSelect` como prop para o `NivelCards` e depois para o `NivelModal`,
para que clicar em "Jogar" no modal inicie o fluxo:
`App.jsx → handleGameSelected(game) → screen = GAME → GameShell`

---

## CHECKLIST DE VALIDAÇÃO

```
DATA MODEL:
[ ] games.js tem os 6 novos jogos (ids 22–27) com campo 'nivel'
[ ] Todos os 6 têm interactionType correto (drag/gesture/tap)
[ ] Todos os 6 têm tutorialTheme com bg, emoji e color

NIVEL CARDS:
[ ] Dois cards visíveis acima do carrossel de Trilha de Matemática
[ ] Card "Pré-numérico" com emoji 🌱 e cor azul (#00B4D8)
[ ] Card "Numérico" com emoji 🔢 e cor roxa (#5B4FCF)
[ ] Clicar em qualquer card abre o modal correspondente
[ ] Modal mostra exatamente 3 jogos do nível selecionado
[ ] Clicar fora do modal ou no ✕ fecha o modal
[ ] Tecla ESC fecha o modal
[ ] Scroll do body bloqueado enquanto modal está aberto

MODAL:
[ ] Emojis Apple carregam corretamente nos 3 cards de jogo
[ ] Código da habilidade (EF01MA03 etc.) visível em cada card
[ ] Clicar em qualquer jogo no modal inicia o fluxo correto
[ ] Animação de entrada do modal: slide de baixo (mobile) / scale (desktop)
[ ] Cards de jogo entram com animação staggerada

OS 6 JOGOS:
[ ] G22 (Mais ou Menos): drag do polegar funciona em touch e mouse
[ ] G22: resposta correta determinada pela pergunta (mais/menos)
[ ] G23 (Conecte Igual): canvas sobreposto sem bloquear pointer events nos botões
[ ] G23: linha desenhada em tempo real ao arrastar
[ ] G23: pares corretos ficam com linha verde permanente
[ ] G24 (Qual Cabe Aqui): tap registra na primeira tentativa
[ ] G24: objeto correto "entra" no buraco com animação
[ ] G25 (Alimente Monstro): contador visual atualiza a cada item entregue
[ ] G25: não aceita mais itens que o pedido
[ ] G26 (Ligue Número): canvas para linhas + botões de número e grupos funcionam
[ ] G26: conexão correta trava o par (não permite desconectar)
[ ] G27 (Quantos Tem): botões ≥ 72×72px, tap sem delay
[ ] G27 fase 5: objetos somem antes de mostrar os botões (flashMode)

TODOS OS 6 JOGOS:
[ ] 5 fases progressivas funcionando
[ ] successBounce ao acertar (GSAP ou CSS animation)
[ ] errorShake ao errar (nunca punitivo — sem game over)
[ ] Som de acerto < 100ms após ação (AudioSystem.js)
[ ] Som de erro < 100ms após ação
[ ] phaseCompletedRef protege contra duplo avanço de fase
[ ] key={`g${id}-phase${phase}`} reseta estado entre fases
[ ] Timer do GameShell funcionando normalmente
[ ] ModeBadge visível no topo do jogo
[ ] Botão ← volta para o catálogo
[ ] Funciona em 375px mobile (iPhone SE)
[ ] Funciona em 768px (iPad)
[ ] Sem console.error nos 6 jogos
```
