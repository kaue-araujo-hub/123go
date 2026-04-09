# PROMPT PARA O REPLIT — CORREÇÃO DE TAMANHO DE ÍCONES EM DESKTOP
## Plataforma 123GO! · Todos os 24 Jogos · Problema exclusivo em viewport ≥ 1024px

---

## O PROBLEMA — O QUE FOI OBSERVADO NAS IMAGENS

Em **viewport desktop (≥ 1024px)**, os ícones/emojis interativos dos jogos estão
desproporcionalmente grandes, prejudicando a jogabilidade:

| Jogo | Problema observado |
|---|---|
| **Loja de Balas** | Balas e pirulitos ocupam quase metade da área do pote — impossível ver quantos itens há |
| **Festa da Lagarta** | Folhas gigantes sobrepostas umas nas outras — drag confuso, alvos imprecisos |
| **Par ou Ímpar?** | Meias e luvas tão grandes que ultrapassam o card — toque dificultado |
| **Caça Estrelas** | Estrelas enormes no céu negro — perdem o efeito de "constelação distante" |
| **Rã Puladora** | Flores tão grandes que enchem toda a lagoa — não dá para comparar quantidade visualmente |

**Causa raiz:** os tamanhos dos ícones foram definidos em `px` fixos otimizados
para mobile (375px), sem breakpoint para desktop. Em telas de 1280px+, o mesmo
valor em `px` ocupa uma proporção muito maior da área de jogo.

**Solução:** substituir todos os tamanhos fixos de ícones interativos por valores
responsivos usando `clamp()`, com cap máximo para desktop.

---

## REGRA GERAL A APLICAR EM TODOS OS 24 JOGOS

### Princípio

```
Mobile (< 768px):  ícone = tamanho atual (não alterar)
Tablet (768–1023px): ícone = 85% do atual
Desktop (≥ 1024px): ícone = 55–65% do atual (cap máximo)
```

### Fórmula `clamp()` padrão

```css
/* ANTES (fixo, só bom no mobile): */
font-size: 52px;
width: 64px;
height: 64px;

/* DEPOIS (responsivo com cap no desktop): */
font-size: clamp(28px, 4vw, 44px);
width:     clamp(32px, 4.5vw, 52px);
height:    clamp(32px, 4.5vw, 52px);
```

**Tabela de conversão rápida:**

| Tamanho original | `clamp()` correto | Resultado em 1280px |
|---|---|---|
| 80px | `clamp(40px, 5.5vw, 56px)` | 56px |
| 64px | `clamp(32px, 4.5vw, 48px)` | 48px |
| 52px | `clamp(28px, 3.8vw, 44px)` | 44px |
| 48px | `clamp(26px, 3.5vw, 40px)` | 40px |
| 40px | `clamp(24px, 3vw, 36px)` | 36px |
| 36px | `clamp(22px, 2.8vw, 32px)` | 32px |

---

## MÉTODO DE BUSCA — COMO ENCONTRAR OS ÍCONES EM CADA ARQUIVO

Execute uma busca global no projeto pelos padrões abaixo.
**Cada ocorrência encontrada é um candidato a corrigir.**

```bash
# Buscar todos os tamanhos fixos de font-size acima de 24px nos arquivos de jogo
grep -r "font-size: [3-9][0-9]px\|font-size: [1-9][0-9][0-9]px" src/games/

# Buscar width/height fixos de ícones
grep -r "width: [3-9][0-9]px\|height: [3-9][0-9]px" src/games/

# Buscar nos CSS Modules
grep -rn "font-size\|width.*px\|height.*px" src/games/ --include="*.module.css"

# Buscar emoji sizes inline (style props no JSX)
grep -rn "fontSize\|width.*px\|height.*px" src/games/ --include="*.jsx"
```

---

## CORREÇÕES POR JOGO — ARQUIVO A ARQUIVO

### JOGO G01 — Festa da Lagarta

**Arquivo:** `src/games/g01-festa-lagarta/Folha.module.css`

```css
/* ─── ANTES ────────────────────────────────────────── */
.folha {
  font-size: 52px;
  width:     64px;
  height:    64px;
}

/* ─── DEPOIS ───────────────────────────────────────── */
.folha {
  font-size: clamp(28px, 3.8vw, 44px);
  width:     clamp(32px, 4.5vw, 52px);
  height:    clamp(32px, 4.5vw, 52px);
}
```

**Arquivo:** `src/games/g01-festa-lagarta/Lagarta.module.css`
```css
/* Personagem principal — não reduzir muito (é decorativo, não interativo) */
.lagarta {
  font-size: clamp(48px, 6vw, 72px);   /* era: 80px ou similar */
}
```

**Arquivo:** `src/games/g01-festa-lagarta/FestaLagarta.module.css`
```css
/* Zona de drop (boca da lagarta) — manter grande o suficiente para ser alvo */
.dropZone {
  width:  clamp(80px, 10vw, 120px);
  height: clamp(80px, 10vw, 120px);
}

/* Grid de folhas — espaçamento responsivo */
.folhasGrid {
  gap: clamp(8px, 1.5vw, 16px);
}
```

---

### JOGO G02 — Par ou Ímpar?

**Arquivo:** `src/games/g02-par-impar/ItemCard.module.css`

```css
/* ─── ANTES ────────────────────────────────────────── */
.itemEmoji {
  font-size: 64px;   /* ou equivalente em width/height de img */
}
.itemCard {
  width:  120px;
  height: 120px;
}

/* ─── DEPOIS ───────────────────────────────────────── */
.itemEmoji {
  font-size: clamp(32px, 4.5vw, 52px);
}
.itemCard {
  width:  clamp(72px, 8vw, 100px);
  height: clamp(72px, 8vw, 100px);
}
```

**Arquivo:** `src/games/g02-par-impar/ParImpar.module.css`
```css
/* Grid de cards — ajustar para caber mais itens em desktop */
.grid {
  grid-template-columns: repeat(auto-fit, minmax(clamp(72px, 8vw, 100px), 1fr));
  gap: clamp(8px, 1.5vw, 16px);
}
```

---

### JOGO G03 — Caça Estrelas

**Arquivo:** `src/games/g03-caca-estrelas/Estrela.module.css`

```css
/* ─── ANTES ────────────────────────────────────────── */
.estrela {
  font-size: 48px;
  width:     56px;
  height:    56px;
}

/* ─── DEPOIS ───────────────────────────────────────── */
.estrela {
  font-size: clamp(22px, 2.8vw, 36px);
  width:     clamp(28px, 3.2vw, 44px);
  height:    clamp(28px, 3.2vw, 44px);
}
/* Estrelas menores no desktop criam efeito visual de "distância no céu" */
```

**Arquivo:** `src/games/g03-caca-estrelas/CacaEstrelas.module.css`
```css
/* Botões de resposta numérica */
.optionBtn {
  min-width:  clamp(56px, 7vw, 80px);
  min-height: clamp(56px, 7vw, 80px);
  font-size:  clamp(20px, 2.5vw, 28px);
}
```

---

### JOGO G04 — Loja de Balas

**Arquivo:** `src/games/g04-loja-balas/LojaBalas.module.css`

```css
/* ─── ANTES — balas grandes demais nos potes ────────── */
.bala {
  font-size: 40px;   /* ou width: 48px em img */
  width:     48px;
  height:    48px;
}
.pote {
  min-height: 300px;
}

/* ─── DEPOIS ───────────────────────────────────────── */
.bala {
  font-size: clamp(18px, 2.2vw, 28px);
  width:     clamp(22px, 2.8vw, 36px);
  height:    clamp(22px, 2.8vw, 36px);
}

/* Grid interno do pote — permite encaixar mais balas visivelmente */
.balaGrid {
  display:               grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(22px, 2.8vw, 36px), 1fr));
  gap:                   clamp(4px, 0.6vw, 8px);
  padding:               clamp(8px, 1vw, 16px);
}

/* Altura do pote proporcional à viewport */
.pote {
  min-height: clamp(180px, 30vh, 280px);
}
```

---

### JOGO G05 — Rã Puladora

**Arquivo:** `src/games/g05-ra-puladora/RaPuladora.module.css`

```css
/* ─── ANTES — flores gigantes na lagoa ─────────────── */
.flor {
  font-size: 40px;
  width:     48px;
  height:    48px;
}
.lagoa {
  min-height: 320px;
}

/* ─── DEPOIS ───────────────────────────────────────── */
.flor {
  font-size: clamp(16px, 1.8vw, 28px);
  width:     clamp(20px, 2.2vw, 32px);
  height:    clamp(20px, 2.2vw, 32px);
}

/* Grid interno da lagoa — mais flores por linha em desktop */
.florGrid {
  display:               grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(20px, 2.2vw, 32px), 1fr));
  gap:                   clamp(4px, 0.5vw, 8px);
  padding:               clamp(12px, 1.5vw, 20px);
}

/* Altura da lagoa */
.lagoa {
  min-height: clamp(180px, 35vh, 300px);
}

/* Rã (personagem — reduzir menos, é decorativa) */
.ra {
  font-size: clamp(36px, 4.5vw, 56px);
}
```

---

### JOGO G06 — Balões da Festa

**Arquivo:** `src/games/g06-baloes-festa/BaloFesta.module.css`

```css
.balao {
  font-size: clamp(28px, 3.5vw, 44px);
  width:     clamp(36px, 4vw, 52px);
  height:    clamp(36px, 4vw, 52px);
}

/* Container dos grupos */
.grupoBaloes {
  gap: clamp(6px, 0.8vw, 12px);
}
```

---

### JOGO G07 — Trem dos Números

**Arquivo:** `src/games/g07-trem-numeros/TremNumeros.module.css`

```css
/* Números arrastáveis */
.numeroItem {
  font-size:  clamp(20px, 2.5vw, 32px);
  min-width:  clamp(48px, 5.5vw, 64px);
  min-height: clamp(48px, 5.5vw, 64px);
}

/* Vagões */
.vagao {
  width:  clamp(72px, 9vw, 100px);
  height: clamp(72px, 9vw, 100px);
}
```

---

### JOGO G08 — Pizzaria Mágica

**Arquivo:** `src/games/g08-pizzaria-magica/PizzariaMagica.module.css`

```css
/* Fatias arrastáveis */
.fatia {
  font-size: clamp(28px, 3.5vw, 44px);
  width:     clamp(40px, 5vw, 56px);
  height:    clamp(40px, 5vw, 56px);
}

/* Prato (zona de drop) */
.prato {
  width:  clamp(140px, 18vw, 200px);
  height: clamp(140px, 18vw, 200px);
}
```

---

### JOGO G09 — Batalha de Constelações

**Arquivo:** `src/games/g09-batalha-constelacoes/BatalhaConstelacoes.module.css`

```css
/* Estrelas no canvas — ajuste via JS (não CSS) */
/* Encontrar onde o raio das estrelas é definido em JS e aplicar: */
/* ANTES: const starRadius = 20 */
/* DEPOIS: */
const starRadius = window.innerWidth >= 1024 ? 10 : window.innerWidth >= 768 ? 14 : 18
```

---

### JOGO G10 — Ateliê da Ordem

**Arquivo:** `src/games/g10-atelie-ordem/AtelieOrdem.module.css`

```css
/* Objetos arrastáveis */
.objeto {
  font-size: clamp(24px, 3vw, 40px);
  width:     clamp(48px, 6vw, 68px);
  height:    clamp(48px, 6vw, 68px);
}

/* Gavetas */
.gaveta {
  width:  clamp(72px, 9vw, 100px);
  height: clamp(72px, 9vw, 100px);
}
```

---

### JOGO G11 — Jardim de Padrões

**Arquivo:** `src/games/g11-jardim-padroes/JardimPadroes.module.css`

```css
/* Flores arrastáveis */
.flor {
  font-size: clamp(28px, 3.5vw, 44px);
  width:     clamp(44px, 5.5vw, 60px);
  height:    clamp(44px, 5.5vw, 60px);
}

/* Vasos */
.vaso {
  width:  clamp(56px, 7vw, 80px);
  height: clamp(64px, 8vw, 88px);
}
```

---

### JOGO G12 — Nave Organizadora

**Arquivo:** `src/games/g12-nave-organizadora/NaveOrganizadora.module.css`

```css
/* Aliens arrastáveis */
.alien {
  font-size: clamp(28px, 3.5vw, 44px);
  width:     clamp(44px, 5.5vw, 60px);
  height:    clamp(44px, 5.5vw, 60px);
}

/* Compartimentos */
.compartimento {
  width:  clamp(80px, 10vw, 112px);
  height: clamp(80px, 10vw, 112px);
}
```

---

### JOGO G13 — Robô Perdido

**Arquivo:** `src/games/g13-robo-perdido/RoboPerdido.module.css`

```css
/* Robô no labirinto */
.robo {
  font-size: clamp(24px, 3vw, 36px);
  width:     clamp(36px, 4vw, 48px);
  height:    clamp(36px, 4vw, 48px);
}

/* Setas de controle */
.seta {
  font-size:  clamp(18px, 2.2vw, 28px);
  min-width:  clamp(48px, 6vw, 64px);
  min-height: clamp(48px, 6vw, 64px);
}

/* Células do labirinto */
.celula {
  width:  clamp(44px, 5.5vw, 60px);
  height: clamp(44px, 5.5vw, 60px);
}
```

---

### JOGO G14 — Esconde-esconde Animal

**Arquivo:** `src/games/g14-esconde-esconde/EscondeEsconde.module.css`

```css
/* Animal escondido */
.animal {
  font-size: clamp(36px, 4.5vw, 52px);
}

/* Zonas de toque (regiões clicáveis do cenário) */
.zona {
  min-width:  clamp(80px, 10vw, 120px);
  min-height: clamp(80px, 10vw, 120px);
}
```

---

### JOGO G15 — Castelo das Posições

**Arquivo:** `src/games/g15-castelo-posicoes/CasteloPos.module.css`

```css
/* Cavaleiro arrastável */
.cavaleiro {
  font-size: clamp(28px, 3.5vw, 44px);
  width:     clamp(44px, 5.5vw, 60px);
  height:    clamp(44px, 5.5vw, 60px);
}

/* Zonas de posição */
.zona {
  width:  clamp(64px, 8vw, 88px);
  height: clamp(64px, 8vw, 88px);
}
```

---

### JOGO G16 — Sol, Lua e Estrelas

**Arquivo:** `src/games/g16-sol-lua-estrelas/SolLuaEstrelas.module.css`

```css
/* Sol arrastável */
.sol {
  font-size: clamp(36px, 4.5vw, 52px);
  width:     clamp(52px, 6.5vw, 72px);
  height:    clamp(52px, 6.5vw, 72px);
}

/* Atividades arrastáveis */
.atividade {
  font-size: clamp(28px, 3.5vw, 44px);
  width:     clamp(44px, 5.5vw, 60px);
  height:    clamp(44px, 5.5vw, 60px);
}
```

---

### JOGO G17 — Calendário Vivo

**Arquivo:** `src/games/g17-calendario-vivo/CalendarioVivo.module.css`

```css
/* Personagens dos dias */
.personagem {
  font-size: clamp(28px, 3.5vw, 44px);
  width:     clamp(52px, 6.5vw, 72px);
  height:    clamp(52px, 6.5vw, 72px);
}

/* Slots da semana */
.slot {
  width:  clamp(52px, 6.5vw, 72px);
  height: clamp(64px, 8vw, 88px);
}
```

---

### JOGO G18 — Máquina do Tempo

**Arquivo:** `src/games/g18-maquina-tempo/MaquinaTempo.module.css`

```css
/* Botões de dia/período */
.itemBtn {
  font-size:  clamp(13px, 1.6vw, 18px);
  min-width:  clamp(60px, 7.5vw, 88px);
  min-height: clamp(48px, 6vw, 64px);
  padding:    clamp(6px, 0.8vw, 12px) clamp(8px, 1vw, 16px);
}
```

---

### JOGO G19 — Sorveteria dos Dados

**Arquivo:** `src/games/g19-sorveteria-dados/SorveteriaDados.module.css`

```css
/* Bolas de sorvete no gráfico */
.bola {
  width:  clamp(20px, 2.5vw, 32px);
  height: clamp(20px, 2.5vw, 32px);
}

/* Barras do gráfico */
.barra {
  width: clamp(40px, 5vw, 60px);
}
```

---

### JOGO G20 — Zoo de Tabelas

**Arquivo:** `src/games/g20-zoo-tabelas/ZooTabelas.module.css`

```css
/* Ícones de animais nas linhas da tabela */
.animalIcon {
  font-size: clamp(20px, 2.5vw, 32px);
  width:     clamp(32px, 4vw, 44px);
  height:    clamp(32px, 4vw, 44px);
}

/* Linhas clicáveis */
.tabelaLinha {
  min-height: clamp(48px, 6vw, 64px);
  font-size:  clamp(14px, 1.8vw, 20px);
}
```

---

### JOGO G21 — Pesquisa da Turma

**Arquivo:** `src/games/g21-pesquisa-turma/PesquisaTurma.module.css`

```css
/* Avatares clicáveis */
.avatar {
  font-size: clamp(24px, 3vw, 36px);
  width:     clamp(44px, 5.5vw, 60px);
  height:    clamp(44px, 5.5vw, 60px);
}
```

---

### JOGO G22 — Mais ou Menos?

**Arquivo:** `src/games/g22-mais-ou-menos/MaisOuMenos.module.css`

```css
/* Itens nos grupos */
.item {
  font-size: clamp(20px, 2.5vw, 32px);
}

/* Polegar arrastável */
.thumb {
  font-size: clamp(36px, 4.5vw, 52px);
  width:     clamp(52px, 6.5vw, 72px);
  height:    clamp(52px, 6.5vw, 72px);
}
```

---

### JOGO G23 — Conecte o Igual

**Arquivo:** `src/games/g23-conecte-igual/ConecteIgual.module.css`

```css
/* Formas geométricas clicáveis */
.forma {
  width:  clamp(48px, 6vw, 68px);
  height: clamp(48px, 6vw, 68px);
}

/* SVG interno da forma */
.formaSvg {
  width:  100%;
  height: 100%;
}
```

---

### JOGO G24 — Qual Cabe Aqui?

**Arquivo:** `src/games/g24-qual-cabe-aqui/QualCabeAqui.module.css`

```css
/* Objetos clicáveis */
.objeto {
  font-size: clamp(28px, 3.5vw, 44px);
  min-width:  clamp(64px, 8vw, 88px);
  min-height: clamp(64px, 8vw, 88px);
}

/* Buracos (tamanhos diferentes) */
.buracoGrande  { width: clamp(100px, 14vw, 140px); height: clamp(100px, 14vw, 140px); }
.buracoMedio   { width: clamp(76px, 10vw, 108px);  height: clamp(76px, 10vw, 108px); }
.buracoPequeno { width: clamp(56px, 7vw, 80px);    height: clamp(56px, 7vw, 80px); }
```

---

### JOGO G25 — Alimente o Monstro

**Arquivo:** `src/games/g25-alimente-monstro/AlimenteMonstro.module.css`

```css
/* Itens arrastáveis */
.item {
  font-size: clamp(24px, 3vw, 40px);
  width:     clamp(44px, 5.5vw, 60px);
  height:    clamp(44px, 5.5vw, 60px);
}

/* Monstro (personagem — pode ser um pouco maior) */
.monstro {
  font-size: clamp(52px, 6.5vw, 72px);
}

/* Boca (zona de drop) */
.boca {
  width:  clamp(72px, 9vw, 100px);
  height: clamp(44px, 5.5vw, 60px);
}
```

---

### JOGO G26 — Ligue o Número

**Arquivo:** `src/games/g26-ligue-numero/LigueNumero.module.css`

```css
/* Números clicáveis */
.numero {
  font-size:  clamp(24px, 3vw, 36px);
  min-width:  clamp(52px, 6.5vw, 72px);
  min-height: clamp(52px, 6.5vw, 72px);
}

/* Itens nos grupos */
.grupoItem {
  font-size: clamp(16px, 2vw, 24px);
  width:     clamp(24px, 3vw, 36px);
  height:    clamp(24px, 3vw, 36px);
}
```

---

### JOGO G27 — Quantos Tem?

**Arquivo:** `src/games/g27-quantos-tem/QuantosTem.module.css`

```css
/* Objetos contáveis */
.objeto {
  font-size: clamp(20px, 2.5vw, 32px);
}

/* Botões de resposta */
.opcaoBtn {
  font-size:  clamp(20px, 2.5vw, 32px);
  min-width:  clamp(60px, 7.5vw, 80px);
  min-height: clamp(60px, 7.5vw, 80px);
}
```

---

## ARQUIVO GLOBAL — `src/styles/game-shell.css`

Adicionar as regras responsivas globais que se aplicam a todos os jogos.
**Inserir ao final do arquivo existente, sem remover nada:**

```css
/* ═══════════════════════════════════════════════════════════════════════
   CORREÇÃO DE ÍCONES — DESKTOP (≥ 1024px)
   Garante que ícones interativos nunca fiquem desproporcionais em telas grandes.
   Estas regras complementam os CSS Modules de cada jogo.
   ═══════════════════════════════════════════════════════════════════════ */

/* Classe utilitária para qualquer emoji/ícone interativo */
.game-icon {
  font-size: clamp(24px, 3.5vw, 44px);
  display:   inline-block;
  line-height: 1;
}

/* Classe para ícones de item arrastável */
.game-drag-item {
  font-size: clamp(22px, 3vw, 40px);
}

/* Classe para ícones de contagem (muitos na tela ao mesmo tempo) */
.game-count-item {
  font-size: clamp(16px, 2vw, 28px);
}

/* Imagens Apple Emoji usadas como ícones de jogo */
img.apple-emoji.game-character {
  width:  clamp(44px, 6vw, 72px);
  height: clamp(44px, 6vw, 72px);
}

img.apple-emoji.game-item {
  width:  clamp(28px, 3.5vw, 48px);
  height: clamp(28px, 3.5vw, 48px);
}

img.apple-emoji.game-count-item {
  width:  clamp(18px, 2.2vw, 30px);
  height: clamp(18px, 2.2vw, 30px);
}

/* ─── Áreas de jogo com layout responsivo ──────────────────────────── */

/* Área principal de jogo — proporcional à viewport */
.game-area {
  width:  min(100%, calc(100vh - 160px));
  margin: 0 auto;
}

/* Grid de itens — responsivo sem quebrar touch targets */
.game-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(44px, 6vw, 72px), 1fr));
  gap: clamp(6px, 1vw, 14px);
  justify-items: center;
  align-items: center;
}

/* ─── Breakpoints explícitos (fallback para navegadores sem suporte a clamp) */
@media (min-width: 1024px) {
  .game-icon          { font-size: 40px; }
  .game-drag-item     { font-size: 36px; }
  .game-count-item    { font-size: 24px; }
  img.apple-emoji.game-character  { width: 64px; height: 64px; }
  img.apple-emoji.game-item       { width: 44px; height: 44px; }
  img.apple-emoji.game-count-item { width: 26px; height: 26px; }
}

@media (min-width: 1440px) {
  .game-icon          { font-size: 44px; }
  .game-drag-item     { font-size: 38px; }
  .game-count-item    { font-size: 26px; }
  img.apple-emoji.game-character  { width: 68px; height: 68px; }
  img.apple-emoji.game-item       { width: 46px; height: 46px; }
  img.apple-emoji.game-count-item { width: 28px; height: 28px; }
}
```

---

## VERIFICAÇÃO — COMO TESTAR APÓS AS CORREÇÕES

```bash
# 1. Iniciar o servidor de desenvolvimento
npm run dev

# 2. Abrir o Chrome em http://localhost:3000
# 3. Para cada jogo, testar TRÊS viewports:
#
#    DevTools → Device Toolbar → definir dimensões manualmente:
#    a) 375 × 812  → iPhone SE/14 (mobile)
#    b) 768 × 1024 → iPad (tablet)
#    c) 1280 × 800 → Desktop laptop
#    d) 1920 × 1080→ Desktop full HD
#
# 4. Em cada viewport, verificar:
#    [ ] Ícones interativos ocupam no máximo 25% da largura de seu container
#    [ ] Itens de contagem (flores, balas, estrelas) são menores que itens de ação
#    [ ] Drag targets ≥ 44px em TODOS os viewports (nunca abaixo disso)
#    [ ] Tap targets ≥ 44px em TODOS os viewports
#    [ ] Não há overflow horizontal em nenhum jogo
#    [ ] Em 1920px, ícones não excedem 50% do tamanho mobile (regra geral)
```

---

## CHECKLIST FINAL DE VALIDAÇÃO

```
G01 Festa da Lagarta:
[ ] Folhas individuais claramente distintas (não sobrepostas) em 1280px
[ ] Drag das folhas funciona sem atingir a zona errada por acidente

G02 Par ou Ímpar?:
[ ] Cada card de item cabe dentro do container sem overflow
[ ] Grid reorganiza automaticamente em viewports largos

G03 Caça Estrelas:
[ ] Estrelas parecem pequenas no céu (efeito de profundidade restaurado)
[ ] Botões de resposta acessíveis mas não dominantes

G04 Loja de Balas:
[ ] Balas visualmente contáveis (não cobrindo o pote inteiro)
[ ] Diferença de quantidade entre potes perceptível visualmente

G05 Rã Puladora:
[ ] Flores menores permitem mostrar 15–20 flores claramente em desktop
[ ] Comparação visual entre lagoas funciona corretamente

G06–G27:
[ ] Todos os ícones interativos usam clamp() ou breakpoint explícito
[ ] Touch targets ≥ 44×44px mantidos em TODOS os viewports
[ ] Nenhuma animação quebrou (classes CSS dos itens mantidas)
[ ] Nenhum jogo tem console.error relacionado a CSS
```
