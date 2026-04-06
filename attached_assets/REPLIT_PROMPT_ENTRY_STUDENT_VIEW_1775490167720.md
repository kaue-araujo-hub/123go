# PROMPT PARA O REPLIT — TELA DE ENTRADA + VISÃO ALUNO
## Plataforma 123GO! · Entry Screen · Student View · Reestruturação de Rotas

---

## CONTEXTO — O QUE JÁ EXISTE NA PLATAFORMA

A plataforma **123GO!** já possui toda esta arquitetura implementada:

```
src/
├── pages/
│   └── CatalogPage.jsx          ← catálogo atual com filtros, hero, paginação
├── auth/
│   └── SessionManager.js        ← professor/aluno, PIN de 4 dígitos, sessão de aula
├── data/
│   └── games.js                 ← array dos 21 jogos com emoji, bg, titulo, desc, tema...
├── engine/
│   ├── ModeConfig.js            ← prática / desafio / tempo
│   └── TimerSystem.js           ← cronômetro por fase
├── components/
│   ├── GameShell.jsx            ← wrapper com timer, badge, fases
│   ├── ModalitySelector/        ← painel do professor (modalidade + dificuldade)
│   ├── ModeBadge.jsx            ← badge do modo no jogo
│   ├── HowToPlay/               ← tela "Como Jogar" + mini desafios
│   └── StartCountdown/          ← animação 1 → 2 → 3 → GO!
└── styles/
    └── global.css               ← design system: Nunito, paleta --c1 a --c6
```

**Design System já definido:**
```css
--c1: #FF6B35  /* laranja */
--c2: #E91E8C  /* rosa */
--c3: #5B4FCF  /* roxo */
--c4: #00B4D8  /* azul */
--c5: #4CAF50  /* verde */
--c6: #FF9800  /* âmbar */
--bg: #F7F8FC
--text: #1A1A2E
--radius: 16px
Fonte display: Nunito 800/900
Fonte corpo: Nunito Sans 400/600/700
```

---

## O QUE ESTE PROMPT CRIA

Três coisas novas, sem quebrar nada existente:

1. **`EntryScreen`** — tela de boas-vindas que aparece ao abrir a plataforma,
   com dois botões de acesso: Aluno/Visitante e Professor/Instrutor

2. **`StudentCatalog`** — catálogo simplificado para alunos: apenas logo + grid
   de cards compactos (ícone + nome), sem filtros, sem descrição, sem modal de info.
   Clicar num card vai direto para a animação `StartCountdown` (1→2→3→GO!)

3. **Reestruturação de rotas** — o `CatalogPage.jsx` existente (com filtros, hero,
   paginação, ModalitySelector) passa a ser acessível **apenas pelo fluxo Professor**

---

## ESTRUTURA DE ARQUIVOS — O QUE CRIAR

```
src/
├── pages/
│   ├── EntryScreen.jsx           ← CRIAR — tela de seleção de perfil
│   ├── EntryScreen.module.css    ← CRIAR
│   ├── StudentCatalog.jsx        ← CRIAR — catálogo simplificado do aluno
│   ├── StudentCatalog.module.css ← CRIAR
│   └── CatalogPage.jsx           ← JÁ EXISTE — mover para rota /professor
├── components/
│   ├── StudentGameCard.jsx       ← CRIAR — card compacto (ícone + nome)
│   └── StudentGameCard.module.css← CRIAR
└── App.jsx                       ← JÁ EXISTE — ATUALIZAR rotas
```

---

## ARQUIVO 1 — `src/App.jsx` (ATUALIZAR ROTAS)

O App.jsx controla qual tela é exibida. Atualizar o sistema de rotas:

```jsx
// App.jsx — controle de telas via useState (SPA sem React Router obrigatório)

import { useState, useEffect }  from 'react'
import { SessionManager }       from './auth/SessionManager'
import { EntryScreen }          from './pages/EntryScreen'
import { StudentCatalog }       from './pages/StudentCatalog'
import { CatalogPage }          from './pages/CatalogPage'    // já existe
import { TeacherDashboard }     from './pages/TeacherDashboard' // já existe
import { GameShell }            from './components/GameShell'  // já existe

// Telas possíveis da aplicação
const SCREENS = {
  ENTRY:           'entry',        // tela de boas-vindas — ponto de partida
  STUDENT_CATALOG: 'studentCatalog', // catálogo simplificado do aluno
  TEACHER_CATALOG: 'teacherCatalog', // catálogo completo do professor (CatalogPage atual)
  TEACHER_PIN:     'teacherPin',   // tela de PIN para elevação de perfil
  GAME:            'game',         // jogo em execução
}

export default function App() {
  const [screen,       setScreen]      = useState(SCREENS.ENTRY)
  const [selectedGame, setSelectedGame] = useState(null)

  // Se já há sessão ativa de professor, não pedir PIN novamente
  useEffect(() => {
    // Não pular a tela de entrada — sempre mostrar ao carregar a página
    // Isso garante que professor e aluno sempre escolhem o perfil conscientemente
  }, [])

  // ─── Navegação ─────────────────────────────────────────────────────────────

  function handleSelectStudent() {
    SessionManager.logoutTeacher()  // garante perfil aluno
    setScreen(SCREENS.STUDENT_CATALOG)
  }

  function handleSelectTeacher() {
    // Se já é professor autenticado nesta sessão, vai direto
    if (SessionManager.isTeacher()) {
      setScreen(SCREENS.TEACHER_CATALOG)
    } else {
      setScreen(SCREENS.TEACHER_PIN)
    }
  }

  function handleTeacherAuthenticated() {
    setScreen(SCREENS.TEACHER_CATALOG)
  }

  function handleGameSelected(game) {
    setSelectedGame(game)
    setScreen(SCREENS.GAME)
  }

  function handleBackToEntry() {
    setScreen(SCREENS.ENTRY)
    setSelectedGame(null)
  }

  function handleBackFromGame() {
    // Ao sair do jogo: voltar para o catálogo correto conforme o perfil
    if (SessionManager.isTeacher()) {
      setScreen(SCREENS.TEACHER_CATALOG)
    } else {
      setScreen(SCREENS.STUDENT_CATALOG)
    }
    setSelectedGame(null)
  }

  // ─── Renderização ───────────────────────────────────────────────────────────

  if (screen === SCREENS.ENTRY) {
    return (
      <EntryScreen
        onSelectStudent={handleSelectStudent}
        onSelectTeacher={handleSelectTeacher}
      />
    )
  }

  if (screen === SCREENS.STUDENT_CATALOG) {
    return (
      <StudentCatalog
        onGameSelect={handleGameSelected}
        onBack={handleBackToEntry}
      />
    )
  }

  if (screen === SCREENS.TEACHER_PIN) {
    return (
      <TeacherPinScreen
        onSuccess={handleTeacherAuthenticated}
        onBack={handleBackToEntry}
      />
    )
  }

  if (screen === SCREENS.TEACHER_CATALOG) {
    return (
      <CatalogPage
        onGameSelect={handleGameSelected}
        onBack={handleBackToEntry}
      />
    )
  }

  if (screen === SCREENS.GAME && selectedGame) {
    return (
      <GameShell
        game={selectedGame}
        onBackToCatalog={handleBackFromGame}
      />
    )
  }

  return null
}
```

---

## ARQUIVO 2 — `src/pages/EntryScreen.jsx`

```jsx
/**
 * EntryScreen.jsx
 * Tela de boas-vindas — primeiro contato do usuário com a plataforma.
 * Dois botões: Aluno/Visitante e Professor/Instrutor.
 * Visual imersivo com o logo 123GO! em destaque e fundo animado.
 */

import { useRef }             from 'react'
import { audio }              from '../engine/AudioSystem'
import styles                 from './EntryScreen.module.css'

export function EntryScreen({ onSelectStudent, onSelectTeacher }) {

  function handleStudentClick() {
    audio.init?.()
    audio.tap?.()
    onSelectStudent()
  }

  function handleTeacherClick() {
    audio.init?.()
    audio.tap?.()
    onSelectTeacher()
  }

  return (
    <div className={styles.screen} role="main">

      {/* Fundo animado com partículas flutuantes */}
      <div className={styles.bg} aria-hidden="true">
        {/* 8 bolinhas coloridas flutuando — decorativas */}
        {['#5B4FCF','#E91E8C','#FF6B35','#4CAF50','#00B4D8','#FF9800','#5B4FCF','#E91E8C'].map((color, i) => (
          <span
            key={i}
            className={styles.bubble}
            style={{
              '--bubble-color': color,
              '--bubble-x':     `${10 + i * 11}%`,
              '--bubble-size':  `${24 + (i % 3) * 16}px`,
              '--bubble-delay': `${i * 0.4}s`,
              '--bubble-dur':   `${4 + (i % 3)}s`,
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Logo 123GO! — igual ao header existente mas maior */}
      <div className={styles.logoWrap} aria-label="123GO! Plataforma de jogos de matemática">
        {/* SVG dos números geométricos — idêntico ao HeroCard já implementado */}
        <div className={styles.numbersArt} aria-hidden="true">
          <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="200" height="120">
            {/* Número 1 */}
            <rect x="4"  y="2"  width="12" height="6"  rx="2" fill="#FF6B35" opacity="0.9"/>
            <rect x="10" y="2"  width="6"  height="52" rx="2" fill="#4CAF50" opacity="0.85"/>
            <rect x="4"  y="50" width="22" height="6"  rx="2" fill="#4CAF50" opacity="0.7"/>
            {/* Número 2 */}
            <path d="M38 8 A16 16 0 0 1 70 8 Q70 22 55 32 L38 48 L70 48" stroke="#E91E8C" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <rect x="38" y="22" width="32" height="7" rx="3" fill="#5B4FCF" opacity="0.5"/>
            <rect x="46" y="36" width="24" height="7" rx="3" fill="#FF9800" opacity="0.6"/>
            {/* Número 3 */}
            <path d="M88 8 A14 14 0 0 1 116 8 Q116 22 102 26 Q116 30 116 44 A14 14 0 0 1 88 44" stroke="#00B4D8" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <rect x="100" y="6"  width="18" height="14" rx="3" fill="#FF9800" opacity="0.55"/>
            <ellipse cx="110" cy="26" rx="10" ry="8"  fill="#5B4FCF" opacity="0.35"/>
            <ellipse cx="110" cy="44" rx="10" ry="10" fill="#E91E8C" opacity="0.4"/>
            {/* Número 6 */}
            <line x1="14" y1="68" x2="2"  y2="82"  stroke="#5B4FCF" strokeWidth="7" strokeLinecap="round"/>
            <ellipse cx="14" cy="100" rx="14" ry="14" fill="#4CAF50" opacity="0.8"/>
            <ellipse cx="14" cy="100" rx="9"  ry="9"  fill="#2D6A30" opacity="0.4"/>
            <path d="M14 86 A14 14 0 0 1 28 100" stroke="#5B4FCF" strokeWidth="6" fill="none" strokeLinecap="round"/>
            {/* Número 7 */}
            <rect x="46" y="66" width="30" height="7" rx="3" fill="#00B8A0"/>
            <rect x="58" y="66" width="7"  height="8" rx="2" fill="#3D4A3D" opacity="0.5"/>
            <line x1="76" y1="68" x2="52" y2="118" stroke="#E91E8C" strokeWidth="7" strokeLinecap="round"/>
            {/* Número 8 */}
            <ellipse cx="166" cy="84"  rx="16" ry="16" fill="#FF6B35" opacity="0.85"/>
            <ellipse cx="166" cy="104" rx="16" ry="16" fill="#00B4D8" opacity="0.85"/>
            <ellipse cx="166" cy="96"  rx="10" ry="8"  fill="#3D3D3D" opacity="0.3"/>
          </svg>
        </div>

        {/* Nome e tagline */}
        <h1 className={styles.logoText} aria-label="123GO!">
          <span style={{ color: '#5B4FCF' }}>1</span>
          <span style={{ color: '#E91E8C' }}>2</span>
          <span style={{ color: '#FF6B35' }}>3</span>
          <span style={{ color: '#1A1A2E' }}>G</span>
          <span style={{ color: '#4CAF50' }}>O</span>
          <span style={{ color: '#E91E8C' }}>!</span>
        </h1>
        <p className={styles.tagline}>Jogos de Matemática</p>
      </div>

      {/* Botões de seleção de perfil */}
      <div className={styles.buttons} role="group" aria-label="Escolha seu perfil">

        {/* Botão Aluno / Visitante */}
        <button
          className={`${styles.btn} ${styles.btnStudent}`}
          onPointerUp={handleStudentClick}
          aria-label="Entrar como Aluno ou Visitante"
          style={{ touchAction: 'manipulation' }}
        >
          <span className={styles.btnIcon} aria-hidden="true">🎮</span>
          <div className={styles.btnText}>
            <span className={styles.btnTitle}>Aluno / Visitante</span>
            <span className={styles.btnSub}>Jogar agora</span>
          </div>
          <span className={styles.btnArrow} aria-hidden="true">→</span>
        </button>

        {/* Botão Professor / Instrutor */}
        <button
          className={`${styles.btn} ${styles.btnTeacher}`}
          onPointerUp={handleTeacherClick}
          aria-label="Entrar como Professor ou Instrutor"
          style={{ touchAction: 'manipulation' }}
        >
          <span className={styles.btnIcon} aria-hidden="true">🎓</span>
          <div className={styles.btnText}>
            <span className={styles.btnTitle}>Professor / Instrutor</span>
            <span className={styles.btnSub}>Gerenciar turma</span>
          </div>
          <span className={styles.btnArrow} aria-hidden="true">→</span>
        </button>

      </div>

      {/* Rodapé discreto */}
      <p className={styles.footer} aria-hidden="true">
        Currículo Paulista · 1º ao 3º ano · Matemática
      </p>

    </div>
  )
}
```

---

## ARQUIVO 3 — `src/pages/EntryScreen.module.css`

```css
/* ─── Tela base ─────────────────────────────────────────────────────────────── */
.screen {
  min-height:      100dvh;
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             32px;
  padding:         24px 20px 40px;
  background:      #1A1A2E;
  position:        relative;
  overflow:        hidden;
}

/* ─── Fundo animado ──────────────────────────────────────────────────────────── */
.bg {
  position: absolute;
  inset:    0;
  pointer-events: none;
  z-index:  0;
}

.bubble {
  position:      absolute;
  width:         var(--bubble-size, 32px);
  height:        var(--bubble-size, 32px);
  border-radius: 50%;
  background:    var(--bubble-color, #5B4FCF);
  left:          var(--bubble-x, 50%);
  bottom:        -60px;
  opacity:       0.12;
  will-change:   transform, opacity;
  animation:     bubbleFloat var(--bubble-dur, 5s) ease-in-out var(--bubble-delay, 0s) infinite alternate;
}

@keyframes bubbleFloat {
  0%   { transform: translateY(0) scale(1) translateZ(0); opacity: 0.08; }
  100% { transform: translateY(-70vh) scale(1.15) translateZ(0); opacity: 0.18; }
}

/* ─── Logo ───────────────────────────────────────────────────────────────────── */
.logoWrap {
  position:        relative;
  z-index:         1;
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  gap:             8px;
  animation:       logoAppear 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  will-change:     transform, opacity;
}

@keyframes logoAppear {
  from { transform: scale(0.6) translateY(-20px) translateZ(0); opacity: 0; }
  to   { transform: scale(1)   translateY(0)     translateZ(0); opacity: 1; }
}

.numbersArt {
  /* Animação suave de flutuação — fica "vivo" em loop */
  animation:   artFloat 4s ease-in-out infinite;
  will-change: transform;
}

@keyframes artFloat {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50%      { transform: translateY(-8px) translateZ(0); }
}

.logoText {
  font-family:    'Nunito', sans-serif;
  font-weight:    900;
  font-size:      clamp(48px, 14vw, 80px);
  letter-spacing: -2px;
  line-height:    1;
  margin:         0;
}

.tagline {
  font-family: 'Nunito Sans', sans-serif;
  font-weight: 600;
  font-size:   clamp(13px, 3.5vw, 16px);
  color:       rgba(255,255,255,0.5);
  margin:      0;
  text-align:  center;
  letter-spacing: 0.04em;
}

/* ─── Botões de perfil ───────────────────────────────────────────────────────── */
.buttons {
  position:        relative;
  z-index:         1;
  display:         flex;
  flex-direction:  column;
  gap:             14px;
  width:           100%;
  max-width:       380px;
  animation:       buttonsAppear 0.5s ease 0.3s both;
  will-change:     transform, opacity;
}

@keyframes buttonsAppear {
  from { transform: translateY(24px) translateZ(0); opacity: 0; }
  to   { transform: translateY(0)    translateZ(0); opacity: 1; }
}

/* Base de ambos os botões */
.btn {
  display:       flex;
  align-items:   center;
  gap:           16px;
  width:         100%;
  min-height:    72px;
  padding:       16px 20px;
  border-radius: 20px;
  border:        none;
  cursor:        pointer;
  text-align:    left;
  position:      relative;
  overflow:      hidden;
  will-change:   transform;
  transition:    transform 0.15s ease, opacity 0.15s ease;
}

/* Efeito de brilho ao hover (apenas dispositivos com mouse) */
@media (hover: hover) and (pointer: fine) {
  .btn:hover {
    transform: translateY(-2px) translateZ(0);
    opacity:   0.95;
  }
}

.btn:active {
  transform: scale(0.97) translateZ(0);
  opacity:   0.9;
}

/* Shimmer decorativo no fundo do botão */
.btn::before {
  content:    '';
  position:   absolute;
  inset:      0;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
  pointer-events: none;
}

/* Botão Aluno — roxo para verde */
.btnStudent {
  background: linear-gradient(135deg, #5B4FCF 0%, #4CAF50 100%);
  color:      #ffffff;
  animation:  btnStudentIn 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.35s both;
}

@keyframes btnStudentIn {
  from { transform: translateX(-30px) translateZ(0); opacity: 0; }
  to   { transform: translateX(0) translateZ(0); opacity: 1; }
}

/* Botão Professor — rosa para laranja */
.btnTeacher {
  background: linear-gradient(135deg, #E91E8C 0%, #FF6B35 100%);
  color:      #ffffff;
  animation:  btnTeacherIn 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.48s both;
}

@keyframes btnTeacherIn {
  from { transform: translateX(30px) translateZ(0); opacity: 0; }
  to   { transform: translateX(0) translateZ(0); opacity: 1; }
}

/* Ícone do botão */
.btnIcon {
  font-size:   36px;
  flex-shrink: 0;
  line-height: 1;
  will-change: transform;
  animation:   iconBreathe 2.5s ease-in-out infinite;
}

@keyframes iconBreathe {
  0%, 100% { transform: scale(1) translateZ(0); }
  50%      { transform: scale(1.1) translateZ(0); }
}

.btnStudent .btnIcon { animation-delay: 0s; }
.btnTeacher .btnIcon { animation-delay: 0.6s; }

/* Textos do botão */
.btnText {
  flex:           1;
  display:        flex;
  flex-direction: column;
  gap:            2px;
}

.btnTitle {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size:   clamp(16px, 4.5vw, 20px);
  line-height: 1.2;
}

.btnSub {
  font-family: 'Nunito Sans', sans-serif;
  font-weight: 600;
  font-size:   clamp(12px, 3vw, 14px);
  opacity:     0.75;
}

/* Seta */
.btnArrow {
  font-size:   22px;
  opacity:     0.7;
  flex-shrink: 0;
  will-change: transform;
  animation:   arrowSlide 1.5s ease-in-out infinite;
}

@keyframes arrowSlide {
  0%, 100% { transform: translateX(0) translateZ(0); }
  50%      { transform: translateX(4px) translateZ(0); }
}

/* ─── Rodapé ─────────────────────────────────────────────────────────────────── */
.footer {
  position:    relative;
  z-index:     1;
  font-family: 'Nunito Sans', sans-serif;
  font-size:   11px;
  color:       rgba(255,255,255,0.2);
  text-align:  center;
  margin:      0;
  letter-spacing: 0.05em;
}

/* ─── Responsividade ──────────────────────────────────────────────────────────── */
@media (max-width: 360px) {
  .btn       { min-height: 64px; padding: 12px 16px; gap: 12px; }
  .btnIcon   { font-size: 28px; }
  .numbersArt svg { width: 160px; height: 96px; }
}

@media (min-height: 800px) {
  .screen { gap: 40px; }
}

/* ─── Movimento reduzido ──────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .bubble, .numbersArt, .logoWrap, .buttons,
  .btnStudent, .btnTeacher, .btnIcon, .btnArrow {
    animation: none !important;
  }
  .btn { transition: none !important; }
}
```

---

## ARQUIVO 4 — `src/pages/StudentCatalog.jsx`

```jsx
/**
 * StudentCatalog.jsx
 * Catálogo simplificado para alunos e visitantes.
 * Visual inspirado no FRIV: logo em destaque + grid de cards compactos.
 * Cards mostram apenas ícone Apple emoji + nome do jogo.
 * Clicar em qualquer card vai direto para StartCountdown (sem HowToPlay).
 * Sem filtros, sem descrição, sem modal de info, sem paginação visível inicialmente.
 */

import { useState, useMemo }        from 'react'
import { GAMES }                    from '../data/games'
import { StudentGameCard }          from '../components/StudentGameCard'
import { StartCountdown }           from '../components/StartCountdown/StartCountdown'
import { audio }                    from '../engine/AudioSystem'
import styles                       from './StudentCatalog.module.css'

export function StudentCatalog({ onGameSelect, onBack }) {
  const [selectedGame,   setSelectedGame]   = useState(null)
  const [showCountdown,  setShowCountdown]  = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [visibleCount,   setVisibleCount]   = useState(21) // mostrar todos de início

  // Filtragem por busca (apenas por nome do jogo)
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return GAMES
    const q = searchQuery.toLowerCase()
    return GAMES.filter(g => g.title.toLowerCase().includes(q))
  }, [searchQuery])

  function handleCardTap(game) {
    audio.init?.()
    audio.tap?.()
    setSelectedGame(game)
    setShowCountdown(true)
  }

  function handleCountdownComplete() {
    // Countdown terminou → passa para o jogo real
    onGameSelect(selectedGame)
  }

  // ─── Tela de countdown (sobrepõe o catálogo) ───────────────────────────────
  if (showCountdown && selectedGame) {
    return (
      <StartCountdown
        game={selectedGame}
        onComplete={handleCountdownComplete}
      />
    )
  }

  // ─── Catálogo do aluno ──────────────────────────────────────────────────────
  return (
    <div className={styles.screen}>

      {/* Header compacto: apenas logo e busca */}
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onPointerUp={onBack}
          aria-label="Voltar à tela inicial"
          style={{ touchAction: 'manipulation' }}
        >
          ←
        </button>

        {/* Logo 123GO! — compacto */}
        <h1 className={styles.logo} aria-label="123GO!">
          <span style={{ color: '#5B4FCF' }}>1</span>
          <span style={{ color: '#E91E8C' }}>2</span>
          <span style={{ color: '#FF6B35' }}>3</span>
          <span style={{ color: '#1A1A2E' }}>G</span>
          <span style={{ color: '#4CAF50' }}>O</span>
          <span style={{ color: '#E91E8C' }}>!</span>
        </h1>

        {/* Campo de busca — apenas por nome */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar jogo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Buscar jogo por nome"
          />
        </div>
      </header>

      {/* Grid de jogos — compacto, sem descrição */}
      <main className={styles.main}>
        {filteredGames.length === 0 ? (
          <div className={styles.empty} role="status">
            <span aria-hidden="true">🔍</span>
            <p>Nenhum jogo encontrado para "{searchQuery}"</p>
          </div>
        ) : (
          <div
            className={styles.grid}
            role="list"
            aria-label={`${filteredGames.length} jogos disponíveis`}
          >
            {filteredGames.map((game, index) => (
              <StudentGameCard
                key={game.id}
                game={game}
                index={index}
                onTap={handleCardTap}
              />
            ))}
          </div>
        )}
      </main>

    </div>
  )
}
```

---

## ARQUIVO 5 — `src/pages/StudentCatalog.module.css`

```css
/* ─── Tela base ──────────────────────────────────────────────────────────────── */
.screen {
  min-height:     100dvh;
  display:        flex;
  flex-direction: column;
  background:     #1A1A2E;  /* fundo escuro igual referência FRIV */
}

/* ─── Header ─────────────────────────────────────────────────────────────────── */
.header {
  display:         flex;
  align-items:     center;
  gap:             12px;
  padding:         12px 16px;
  background:      rgba(255,255,255,0.04);
  border-bottom:   1px solid rgba(255,255,255,0.06);
  position:        sticky;
  top:             0;
  z-index:         10;
  backdrop-filter: blur(0px); /* sem blur — performance mobile */
}

.backBtn {
  width:        40px;
  height:       40px;
  border-radius: 50%;
  border:       1px solid rgba(255,255,255,0.12);
  background:   transparent;
  color:        rgba(255,255,255,0.6);
  font-size:    18px;
  cursor:       pointer;
  display:      flex;
  align-items:  center;
  justify-content: center;
  flex-shrink:  0;
  touch-action: manipulation;
  will-change:  transform;
  transition:   transform 0.15s ease;
}

.backBtn:active { transform: scale(0.92) translateZ(0); }

/* Logo compacto */
.logo {
  font-family:    'Nunito', sans-serif;
  font-weight:    900;
  font-size:      28px;
  letter-spacing: -1px;
  line-height:    1;
  margin:         0;
  flex-shrink:    0;
}

/* Campo de busca */
.searchWrap {
  flex:     1;
  position: relative;
  max-width: 320px;
  margin-left: auto;
}

.searchIcon {
  position:       absolute;
  left:           10px;
  top:            50%;
  transform:      translateY(-50%) translateZ(0);
  font-size:      14px;
  pointer-events: none;
}

.searchInput {
  width:         100%;
  background:    rgba(255,255,255,0.08);
  border:        1px solid rgba(255,255,255,0.1);
  border-radius: 50px;
  padding:       8px 12px 8px 34px;
  font-family:   'Nunito Sans', sans-serif;
  font-size:     14px;
  color:         rgba(255,255,255,0.85);
  outline:       none;
  transition:    border-color 0.2s ease, background 0.2s ease;
}

.searchInput::placeholder { color: rgba(255,255,255,0.3); }

.searchInput:focus {
  border-color: rgba(91,79,207,0.6);
  background:   rgba(255,255,255,0.1);
}

/* ─── Main / Grid ────────────────────────────────────────────────────────────── */
.main {
  flex:    1;
  padding: 16px 12px 32px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Grid FRIV-style: muitas colunas pequenas */
.grid {
  display:               grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap:                   10px;
}

/* Mais colunas em telas maiores */
@media (min-width: 480px) {
  .grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }
}
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; }
}
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; max-width: 1100px; margin: 0 auto; }
}

/* Estado vazio */
.empty {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            12px;
  padding:        60px 20px;
  color:          rgba(255,255,255,0.3);
  font-family:    'Nunito', sans-serif;
  font-size:      16px;
  text-align:     center;
}

.empty span { font-size: 36px; }

/* ─── Movimento reduzido ──────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .backBtn { transition: none !important; }
}
```

---

## ARQUIVO 6 — `src/components/StudentGameCard.jsx`

```jsx
/**
 * StudentGameCard.jsx
 * Card compacto para a visão aluno.
 * Mostra: ícone Apple emoji (grande) + nome do jogo (só o nome).
 * Sem descrição, sem tags, sem botão de info.
 * Tap → inicia o jogo diretamente.
 */

import { useRef }        from 'react'
import { getAppleEmojiUrl } from '../utils/AppleEmoji'  // já existe
import styles            from './StudentGameCard.module.css'

export function StudentGameCard({ game, index, onTap }) {
  const cardRef = useRef(null)

  function handlePointerUp(e) {
    // Prevenir zoom acidental em double-tap no iOS
    e.preventDefault()
    onTap(game)
  }

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        '--card-bg':    game.bg,
        '--card-index': index,
        animationDelay: `${Math.min(index * 30, 600)}ms`
      }}
      role="button"
      tabIndex={0}
      aria-label={`Jogar ${game.title}`}
      onPointerUp={handlePointerUp}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onTap(game)}
    >
      {/* Fundo colorido com círculo decorativo */}
      <div className={styles.thumb} aria-hidden="true">
        <div className={styles.thumbBg} />
        <div className={styles.thumbCircle} />

        {/* Emoji Apple 3D */}
        <img
          className={styles.emoji}
          src={getAppleEmojiUrl(game.emoji, 64)}
          alt={game.title}
          width="52"
          height="52"
          loading={index < 12 ? 'eager' : 'lazy'}
          onError={e => {
            // Fallback para emoji unicode se imagem Apple não carregar
            e.target.style.display = 'none'
            e.target.insertAdjacentHTML('afterend',
              `<span style="font-size:44px;line-height:1">${game.emoji}</span>`
            )
          }}
        />
      </div>

      {/* Nome do jogo — apenas o nome, nada mais */}
      <p className={styles.name}>{game.title}</p>

    </div>
  )
}
```

---

## ARQUIVO 7 — `src/components/StudentGameCard.module.css`

```css
/* ─── Card base ─────────────────────────────────────────────────────────────── */
.card {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            6px;
  cursor:         pointer;
  border-radius:  14px;
  overflow:       hidden;
  background:     rgba(255,255,255,0.04);
  border:         1px solid rgba(255,255,255,0.06);

  /* Entrada staggerada */
  animation:  cardAppear 0.35s ease both;
  will-change: transform, opacity;

  /* GPU-only transitions */
  transition: transform 0.15s ease, border-color 0.15s ease;

  touch-action: manipulation;
  user-select:  none;
  -webkit-user-select: none;

  /* Foco acessível */
  outline: none;
}

.card:focus-visible {
  border-color: rgba(91,79,207,0.7);
  box-shadow:   0 0 0 2px rgba(91,79,207,0.4);
}

@keyframes cardAppear {
  from { transform: scale(0.85) translateZ(0); opacity: 0; }
  to   { transform: scale(1)    translateZ(0); opacity: 1; }
}

/* Hover — apenas ponteiro fino (mouse) */
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform:    translateY(-3px) scale(1.03) translateZ(0);
    border-color: rgba(255,255,255,0.15);
  }

  .card:hover .emoji {
    transform: scale(1.12) translateY(-3px) translateZ(0);
  }
}

/* Touch active */
.card:active {
  transform: scale(0.95) translateZ(0);
}

/* ─── Thumbnail ──────────────────────────────────────────────────────────────── */
.thumb {
  width:      100%;
  /* Altura proporcional — quadrado */
  aspect-ratio: 1;
  position:   relative;
  display:    flex;
  align-items:   center;
  justify-content: center;
  overflow:   hidden;
  background: var(--card-bg, #EEEDFE);
}

/* Círculo decorativo de fundo */
.thumbBg {
  position:      absolute;
  inset:         0;
  background:    var(--card-bg, #EEEDFE);
}

.thumbCircle {
  position:      absolute;
  width:         70%;
  height:        70%;
  border-radius: 50%;
  background:    rgba(255,255,255,0.15);
  will-change:   transform;
  animation:     circlePulse 3s ease-in-out infinite;
  animation-delay: calc(var(--card-index, 0) * 0.15s);
}

@keyframes circlePulse {
  0%, 100% { transform: scale(1) translateZ(0); }
  50%      { transform: scale(1.08) translateZ(0); }
}

/* Emoji Apple */
.emoji {
  position:     relative;
  z-index:      1;
  width:        52px;
  height:       52px;
  object-fit:   contain;
  will-change:  transform;
  transition:   transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  /* Sombra 3D característica dos emojis Apple */
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.2));
}

/* Idle animation — cada card tem delay diferente */
.emoji {
  animation: emojiIdle 3.5s ease-in-out infinite;
  animation-delay: calc(var(--card-index, 0) * 0.2s);
}

@keyframes emojiIdle {
  0%, 100% { transform: translateY(0) rotate(0deg) translateZ(0); }
  30%      { transform: translateY(-4px) rotate(-3deg) translateZ(0); }
  70%      { transform: translateY(-3px) rotate(2deg) translateZ(0); }
}

/* ─── Nome ───────────────────────────────────────────────────────────────────── */
.name {
  font-family:  'Nunito', sans-serif;
  font-weight:  700;
  font-size:    clamp(10px, 2.5vw, 12px);
  color:        rgba(255,255,255,0.85);
  text-align:   center;
  line-height:  1.3;
  margin:       0;
  padding:      0 6px 8px;
  /* Quebra nomes longos em 2 linhas max */
  display:      -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow:     hidden;
}

/* ─── Estados responsivos ────────────────────────────────────────────────────── */
@media (min-width: 480px) {
  .emoji { width: 56px; height: 56px; }
  .name  { font-size: 12px; padding: 0 8px 10px; }
}

@media (min-width: 768px) {
  .emoji { width: 64px; height: 64px; }
  .name  { font-size: 13px; }
}

/* ─── Movimento reduzido ─────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .card, .emoji, .thumbCircle { animation: none !important; transition: none !important; }
  .card:hover { transform: none; }
}
```

---

## ARQUIVO 8 — ATUALIZAR `src/pages/CatalogPage.jsx`

O `CatalogPage` já existe e não muda visualmente.
Apenas adicionar a prop `onBack` para permitir retorno à tela de entrada:

```jsx
// CatalogPage.jsx — adicionar apenas estas linhas:

// No topo da função:
export function CatalogPage({ onGameSelect, onBack }) {
  // ... código existente ...
}

// No header existente — adicionar botão de voltar discreto:
// (não alterar nenhum outro elemento do catálogo do professor)
<button
  className="btn-back-entry"
  onPointerUp={onBack}
  aria-label="Voltar à tela inicial"
  style={{ touchAction: 'manipulation' }}
>
  ← Sair
</button>

// CSS a adicionar em catalog.css:
// .btn-back-entry {
//   font-size: 13px; color: var(--text3); background: transparent;
//   border: none; cursor: pointer; padding: 8px; min-height: 44px;
// }
```

---

## FLUXO COMPLETO — DIAGRAMA

```
┌─────────────────────────────────────────────────────────┐
│                   ABERTURA DA PLATAFORMA                │
│                        (App.jsx)                        │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    ENTRY SCREEN                         │
│     Logo 123GO! + Arte SVG + Fundo escuro animado       │
│                                                         │
│   ┌─────────────────────┐  ┌─────────────────────────┐ │
│   │  🎮 Aluno/Visitante  │  │ 🎓 Professor/Instrutor   │ │
│   │   "Jogar agora"     │  │  "Gerenciar turma"      │ │
│   └──────────┬──────────┘  └────────────┬────────────┘ │
└──────────────┼─────────────────────────┼───────────────┘
               │                         │
               ▼                         ▼
┌──────────────────────┐    ┌────────────────────────────┐
│   STUDENT CATALOG    │    │   TELA DE PIN (4 dígitos)  │
│                      │    │   (se não autenticado)     │
│  Header escuro:      │    └────────────┬───────────────┘
│  ← logo 123GO! 🔍   │                 │ PIN correto
│                      │                 ▼
│  Grid FRIV-style:    │    ┌────────────────────────────┐
│  ┌──┐┌──┐┌──┐┌──┐   │    │   TEACHER CATALOG          │
│  │🐛││🧩││🔭││🍬│   │    │   (CatalogPage.jsx atual)  │
│  └──┘└──┘└──┘└──┘   │    │                            │
│  ┌──┐┌──┐┌──┐┌──┐   │    │  Hero + Filtros + Modais   │
│  │🐸││🌈││🚂││🍕│   │    │  ModalitySelector          │
│  └──┘└──┘└──┘└──┘   │    │  Paginação                 │
│  (ícone + nome)      │    └────────────┬───────────────┘
└──────────┬───────────┘                 │
           │ tap em qualquer card        │ click em jogo
           ▼                             ▼
┌──────────────────────────────────────────────────────────┐
│                  START COUNTDOWN                         │
│              1 → 2 → 3 → GO!  (~2.6s)                  │
│           (StartCountdown.jsx — já existe)               │
└──────────────────────────────┬───────────────────────────┘
                               │ onComplete
                               ▼
┌──────────────────────────────────────────────────────────┐
│                     GAME SHELL                           │
│          (GameShell.jsx — já existe)                     │
│   Timer + ModeBadge + Fases + HowToPlay (se necessário) │
└──────────────────────────────────────────────────────────┘
```

**Diferença chave entre os dois fluxos:**
- **Aluno**: catálogo → tap → countdown → jogo (3 passos, máximo direto)
- **Professor**: catálogo com filtros → clica no card → HowToPlay → countdown → jogo

---

## CHECKLIST DE VALIDAÇÃO

```
ENTRY SCREEN:
[ ] Aparece sempre ao abrir a plataforma (não pula para nenhuma tela)
[ ] Botão Aluno: navega para StudentCatalog e chama SessionManager.logoutTeacher()
[ ] Botão Professor: verifica isTeacher() → vai para CatalogPage ou TeacherPin
[ ] Bolinhas flutuantes não causam scroll nem overflow horizontal
[ ] Logo e botões aparecem com animação staggerada
[ ] Funciona em 375px mobile e 1280px desktop
[ ] Nenhum elemento interativo < 44×44px

STUDENT CATALOG:
[ ] Fundo escuro (#1A1A2E) igual referência FRIV
[ ] Header com ← + logo 123GO! + campo de busca
[ ] Grid auto-fill: mínimo 3 colunas em 375px, mais colunas em telas maiores
[ ] Cards mostram APENAS ícone Apple emoji + nome do jogo
[ ] Nenhum card mostra descrição, tags, botão de info ou filtros
[ ] Tap em qualquer card → StartCountdown imediato (sem HowToPlay)
[ ] Busca filtra por nome em tempo real
[ ] Emoji Apple carrega corretamente (fallback unicode se falhar)
[ ] Animação idle dos emojis (flutuação suave) com delay staggerado
[ ] Animação de entrada dos cards com delay máximo 600ms

TEACHER CATALOG (CatalogPage existente):
[ ] Visual não mudou absolutamente nada
[ ] Botão "← Sair" discreto no header retorna à EntryScreen
[ ] ModalitySelector, filtros, hero, paginação, modal — tudo funcionando igual

FLUXO ALUNO → JOGO:
[ ] Tap no card → ShowCountdown === true imediatamente
[ ] StartCountdown recebe game corretamente
[ ] onComplete do countdown chama onGameSelect(selectedGame)
[ ] GameShell recebe o jogo e inicia normalmente
[ ] Timer começa após o countdown (não antes)
[ ] SessionManager.isStudent() === true durante o jogo do aluno

FLUXO PROFESSOR → JOGO:
[ ] Fluxo original preservado: catálogo → clique → HowToPlay → countdown → jogo
[ ] ModeConfig aplicado corretamente no jogo
[ ] Timer e ModeBadge funcionando normalmente

PERFORMANCE:
[ ] Todas animações usam apenas transform e opacity
[ ] will-change em todos elementos com animação contínua
[ ] Emojis carregados com loading="lazy" a partir do card 13
[ ] prefers-reduced-motion desliga todas animações decorativas
[ ] 60fps em CPU throttle 4x no Chrome DevTools
[ ] Sem console.error na navegação entre telas
```
