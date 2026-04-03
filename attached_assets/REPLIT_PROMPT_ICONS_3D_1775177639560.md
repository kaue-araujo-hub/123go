# PROMPT PARA O REPLIT — SUBSTITUIÇÃO DE ÍCONES PARA EMOJIS 3D (ESTILO APPLE/WHATSAPP)

---

## CONTEXTO

No projeto **123GO!**, todos os emojis e ícones exibidos nos cards do catálogo e nas telas dos jogos devem ser substituídos pelos **emojis 3D no estilo Apple (iOS/WhatsApp)** — aqueles com renderização tridimensional, sombras suaves, profundidade e brilho característicos do sistema de emojis da Apple, que são os mesmos utilizados no WhatsApp no iPhone.

---

## QUAL BIBLIOTECA USAR

A fonte oficial e gratuita desses emojis é o repositório público da Apple disponibilizado via **Microsoft Fluent Emoji** e **Twemoji** com skin Apple, mas a solução mais precisa para replicar exatamente os emojis 3D do WhatsApp/iPhone é usar a biblioteca **`emoji-datasource-apple`** combinada com o renderizador **`@emoji-mart/data`** + **`emoji-mart`**, ou alternativamente o CDN do **Joypixels** / **EmojiOne** com skin Apple.

A abordagem **mais confiável, leve e visualmente fiel** para o projeto 123GO! é:

### Opção A — emoji-datasource-apple (RECOMENDADA)
Usa as imagens PNG oficiais dos emojis da Apple extraídas do iOS, exatamente iguais ao WhatsApp no iPhone.

### Opção B — Twemoji com fallback para Apple skin via CDN
Para casos onde a Opção A não estiver disponível.

---

## INSTALAÇÃO — EXECUTE OS COMANDOS ABAIXO NO REPLIT

```bash
# Dependências principais de emojis 3D Apple/WhatsApp
npm install emoji-datasource-apple
npm install emoji-mart @emoji-mart/data

# Utilitários de parsing e mapeamento de emojis
npm install emoji-regex
npm install node-emoji

# Para renderização via CDN no HTML (alternativa/fallback)
# Twemoji (Twitter Emoji — fallback universal)
# Adicionar via <script> no HTML:
# <script src="https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js"></script>

# Para otimização de imagens de emoji no build
npm install -D vite-plugin-static-copy
```

---

## COMO FUNCIONA — ARQUITETURA DE ÍCONES

### Por que emoji-datasource-apple?

O pacote `emoji-datasource-apple` contém as imagens PNG oficiais dos emojis da Apple em dois tamanhos:
- `20.png` — 20×20px (uso em texto inline)
- `64.png` — 64×64px (uso em cards e thumbnails)

Cada emoji tem um identificador único baseado no seu código Unicode. O mapeamento é feito assim:

```
Emoji unicode: 🐛 → U+1F41B → unified: "1f41b"
Caminho da imagem: node_modules/emoji-datasource-apple/img/apple/64/1f41b.png
```

---

## IMPLEMENTAÇÃO — ARQUIVO `src/utils/AppleEmoji.js`

Crie este utilitário central que será usado em TODOS os componentes:

```js
// src/utils/AppleEmoji.js
// Renderiza emojis com a aparência 3D Apple/WhatsApp

// Mapa dos emojis usados no projeto 123GO!
// Formato: 'emoji_char' → 'unified_code'
const EMOJI_MAP = {
  // Jogos — thumbnails dos cards
  '🐛': '1f41b',       // Festa da Lagarta
  '🧩': '1f9e9',       // Par ou Ímpar?
  '🔭': '1f52d',       // Caça Estrelas
  '🍬': '1f36c',       // Loja de Balas
  '🐸': '1f438',       // Rã Puladora
  '🌈': '1f308',       // Balões da Festa
  '🚂': '1f682',       // Trem dos Números
  '🍕': '1f355',       // Pizzaria Mágica
  '⭐': '2b50',         // Batalha de Constelações
  '🎨': '1f3a8',       // Ateliê da Ordem
  '🌸': '1f338',       // Jardim de Padrões
  '🚀': '1f680',       // Nave Organizadora
  '🤖': '1f916',       // Robô Perdido
  '🐾': '1f43e',       // Esconde-esconde Animal / Zoo de Tabelas
  '🏰': '1f3f0',       // Castelo das Posições
  '☀️': '2600-fe0f',   // Sol, Lua e Estrelas
  '📅': '1f4c5',       // Calendário Vivo
  '⏰': '23f0',         // Máquina do Tempo
  '🍦': '1f366',       // Sorveteria dos Dados
  '🎯': '1f3af',       // Pesquisa da Turma

  // UI — botões e interface
  '🎮': '1f3ae',       // Botão Jogar
  '🔍': '1f50d',       // Busca / No results
  '✕':  '274c',        // Fechar modal (usar ❌)
  '❌': '274c',
  '⭐': '2b50',
  '🏆': '1f3c6',       // Conquista
  '🎉': '1f389',       // Celebração / Confete
  '💡': '1f4a1',       // Dica
  '🔊': '1f50a',       // Som ligado
  '🔇': '1f507',       // Som desligado
  '↩️': '21a9-fe0f',   // Voltar
  '▶️': '25b6-fe0f',   // Play / Próximo
}

// Base URL para as imagens Apple no node_modules
const BASE_PATH = '/node_modules/emoji-datasource-apple/img/apple'

/**
 * Retorna o caminho da imagem PNG Apple para um emoji
 * @param {string} emoji — caractere emoji (ex: '🐛')
 * @param {number} size  — 20 ou 64 (default: 64)
 * @returns {string} URL da imagem
 */
export function getAppleEmojiUrl(emoji, size = 64) {
  const unified = EMOJI_MAP[emoji]
  if (!unified) {
    console.warn(`[AppleEmoji] Emoji não mapeado: ${emoji}`)
    return null
  }
  return `${BASE_PATH}/${size}/${unified}.png`
}

/**
 * Cria um elemento <img> com o emoji Apple renderizado
 * @param {string} emoji   — caractere emoji
 * @param {number} size    — tamanho em px (default: 48)
 * @param {string} alt     — texto alternativo para acessibilidade
 * @returns {HTMLImageElement}
 */
export function createAppleEmoji(emoji, size = 48, alt = '') {
  const url = getAppleEmojiUrl(emoji, size <= 32 ? 20 : 64)
  if (!url) {
    // Fallback para emoji unicode nativo se não encontrar a imagem
    const span = document.createElement('span')
    span.textContent = emoji
    span.style.fontSize = size + 'px'
    span.setAttribute('role', 'img')
    span.setAttribute('aria-label', alt || emoji)
    return span
  }

  const img = document.createElement('img')
  img.src = url
  img.alt = alt || emoji
  img.width = size
  img.height = size
  img.style.width = size + 'px'
  img.style.height = size + 'px'
  img.style.objectFit = 'contain'
  img.style.display = 'inline-block'
  img.style.verticalAlign = 'middle'
  img.setAttribute('role', 'img')
  img.setAttribute('aria-label', alt || emoji)

  // Fallback se a imagem não carregar
  img.onerror = () => {
    img.style.display = 'none'
    const span = document.createElement('span')
    span.textContent = emoji
    span.style.fontSize = size + 'px'
    img.parentNode?.insertBefore(span, img)
  }

  return img
}

/**
 * Substitui todos os emojis em texto de um elemento HTML
 * por imagens Apple PNG
 * @param {HTMLElement} container — elemento raiz para processar
 * @param {number} size — tamanho das imagens em px
 */
export function replaceEmojisInContainer(container, size = 24) {
  const emojiChars = Object.keys(EMOJI_MAP)
  const emojiRegex = new RegExp(
    emojiChars.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
    'g'
  )

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (!emojiRegex.test(text)) return
      emojiRegex.lastIndex = 0

      const fragment = document.createDocumentFragment()
      let lastIndex = 0
      let match

      while ((match = emojiRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
          )
        }
        fragment.appendChild(createAppleEmoji(match[0], size))
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
      }

      node.parentNode?.replaceChild(fragment, node)
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT', 'STYLE', 'IMG'].includes(node.tagName)
    ) {
      Array.from(node.childNodes).forEach(processNode)
    }
  }

  processNode(container)
}
```

---

## IMPLEMENTAÇÃO — COMPONENTE `AppleEmojiImg` (HTML helper)

Crie este helper para uso inline em templates HTML:

```js
// src/utils/appleEmojiHtml.js

import { getAppleEmojiUrl, EMOJI_MAP } from './AppleEmoji.js'

/**
 * Retorna string HTML de um emoji Apple para uso em innerHTML
 * @param {string} emoji  — caractere emoji
 * @param {number} size   — tamanho em px
 * @param {string} cls    — classes CSS extras
 * @returns {string} HTML string
 */
export function emojiImg(emoji, size = 48, cls = '') {
  const url = getAppleEmojiUrl(emoji, size <= 32 ? 20 : 64)
  if (!url) return `<span style="font-size:${size}px" role="img" aria-label="${emoji}">${emoji}</span>`

  return `<img
    src="${url}"
    alt="${emoji}"
    width="${size}"
    height="${size}"
    role="img"
    class="apple-emoji ${cls}"
    style="width:${size}px;height:${size}px;object-fit:contain;display:inline-block;vertical-align:middle;"
    onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=\\'font-size:${size}px\\'>${emoji}</span>')"
  />`
}
```

---

## ATUALIZAÇÃO — `src/data/games.js`

Mantenha o campo `emoji` como caractere unicode. O `emojiImg()` fará a conversão automaticamente:

```js
// Nenhuma mudança no array de dados!
// O campo 'emoji' continua sendo o caractere unicode: '🐛', '🧩', etc.
// A conversão para imagem Apple acontece nos componentes.
```

---

## ATUALIZAÇÃO — `src/components/GameCard.js`

Substitua a renderização do emoji no thumbnail:

```js
// ANTES (emoji unicode puro):
// <span class="card-thumb-emoji">${g.emoji}</span>

// DEPOIS (imagem Apple 3D):
import { emojiImg } from '../utils/appleEmojiHtml.js'

// No template do card:
`<div class="card-thumb" style="background:${g.bg}">
  <div class="card-tags">
    <span class="card-tag card-tag-bim">${g.periodo}º Bimestre</span>
    <span class="card-tag card-tag-${g.tema}">${TEMA_LABELS[g.tema]}</span>
  </div>
  <button class="card-info-btn" onclick="openModal(event,${g.id})">i</button>
  <div class="card-thumb-emoji-wrap">
    ${emojiImg(g.emoji, 64, 'card-emoji')}
  </div>
</div>`
```

CSS para o emoji no card:
```css
.card-thumb-emoji-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.card-emoji {
  filter: drop-shadow(0 6px 16px rgba(0,0,0,0.18));
  transition: transform 0.2s ease;
}

.game-card:hover .card-emoji {
  transform: scale(1.12) translateY(-3px);
}
```

---

## ATUALIZAÇÃO — `src/components/Modal.js`

Substituir o emoji no cabeçalho do modal:

```js
import { emojiImg } from '../utils/appleEmojiHtml.js'

// No header do modal:
`<div class="modal-icon" style="background:${g.bg}">
  ${emojiImg(g.emoji, 36)}
</div>`
```

---

## ATUALIZAÇÃO — TELAS DOS JOGOS

Em cada arquivo `src/games/gXX-nome/game.js`, substitua qualquer renderização de emoji de personagens, itens interativos e feedback:

```js
import { emojiImg, createAppleEmoji } from '../../utils/AppleEmoji.js'

// Para elementos criados via JS (drag targets, personagens, itens):
const item = document.createElement('div')
item.appendChild(createAppleEmoji('🐛', 80, 'lagarta'))

// Para templates HTML inline:
container.innerHTML = `
  <div class="personagem">
    ${emojiImg('🐛', 80, 'personagem-principal')}
  </div>
`
```

**Tamanhos recomendados por contexto:**
| Contexto | Tamanho |
|---|---|
| Card thumbnail (catálogo) | 64px |
| Modal de info | 36px |
| Personagem principal do jogo | 80–100px |
| Item arrastável / tocável | 56–72px |
| Ícone de feedback (acerto/erro) | 48px |
| Botão de UI (jogar, voltar) | 24px |
| Tag / badge | 16px |

---

## CSS GLOBAL PARA EMOJIS APPLE — adicionar em `src/styles/global.css`

```css
/* Apple Emoji — estilos globais */
img.apple-emoji {
  display: inline-block;
  vertical-align: middle;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;  /* permite que o elemento pai receba os eventos de toque */
}

/* Emoji como elemento interativo (drag target, botão tocável) */
img.apple-emoji.interactive {
  pointer-events: auto;
  cursor: pointer;
}

/* Sombra 3D nos personagens principais dos jogos */
img.apple-emoji.game-character {
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.20))
          drop-shadow(0 2px 4px rgba(0,0,0,0.12));
}

/* Hover em cards do catálogo */
.game-card:hover img.apple-emoji {
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.22));
  transform: scale(1.1) translateY(-4px);
  transition: transform 0.2s ease, filter 0.2s ease;
}

/* Animação de bounce ao acertar (via GSAP — gatilho JS) */
img.apple-emoji.bounce {
  animation: emojiBounce 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes emojiBounce {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.35) translateY(-8px); }
  60%  { transform: scale(0.95) translateY(2px); }
  100% { transform: scale(1); }
}

/* Shake ao errar */
img.apple-emoji.shake {
  animation: emojiShake 0.35s ease;
}

@keyframes emojiShake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-8px) rotate(-5deg); }
  40%      { transform: translateX(8px) rotate(5deg); }
  60%      { transform: translateX(-6px) rotate(-3deg); }
  80%      { transform: translateX(6px) rotate(3deg); }
}

/* Respeitar preferência de movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  img.apple-emoji,
  img.apple-emoji.bounce,
  img.apple-emoji.shake {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
```

---

## CONFIGURAÇÃO DO VITE — expor pasta de emojis

Adicione em `vite.config.js` para o Vite servir as imagens do `node_modules`:

```js
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    // ... outros plugins existentes ...
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/emoji-datasource-apple/img/apple/64',
          dest: 'emoji/apple'
        },
        {
          src: 'node_modules/emoji-datasource-apple/img/apple/20',
          dest: 'emoji/apple-sm'
        }
      ]
    })
  ],
  // Permite imports de node_modules no dev server
  server: {
    fs: { allow: ['..'] }
  }
})
```

Após essa configuração, atualizar o `BASE_PATH` em `AppleEmoji.js`:
```js
// Em desenvolvimento: acessa direto do node_modules
// Em produção: acessa da pasta /emoji/apple copiada pelo vite-plugin-static-copy
const BASE_PATH = import.meta.env.PROD
  ? '/emoji/apple'
  : '/node_modules/emoji-datasource-apple/img/apple'
```

---

## FALLBACK — CDN TWEMOJI (backup caso emoji-datasource-apple falhe)

Adicione no `index.html` como seguro de rede:

```html
<!-- Twemoji CDN como fallback -->
<script src="https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js" crossorigin="anonymous"></script>
<script>
  // Ativa Twemoji APENAS se o emoji-datasource-apple não carregar
  window.TWEMOJI_FALLBACK = true
  twemoji.parse(document.body, {
    folder: 'svg',
    ext: '.svg',
    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
  })
</script>
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

Após rodar os comandos de instalação, verificar:

- [ ] `npm install emoji-datasource-apple` executado com sucesso
- [ ] `npm install emoji-mart @emoji-mart/data` executado com sucesso
- [ ] `npm install emoji-regex node-emoji` executado com sucesso
- [ ] `npm install -D vite-plugin-static-copy` executado com sucesso
- [ ] Arquivo `src/utils/AppleEmoji.js` criado
- [ ] Arquivo `src/utils/appleEmojiHtml.js` criado
- [ ] `GameCard.js` atualizado com `emojiImg()`
- [ ] `Modal.js` atualizado com `emojiImg()`
- [ ] CSS global adicionado em `global.css`
- [ ] `vite.config.js` atualizado com `viteStaticCopy`
- [ ] Todos os 21 arquivos `game.js` atualizados com `createAppleEmoji()`
- [ ] Imagens carregando corretamente em mobile (teste em 375px)
- [ ] Fallback funcionando (desativar internet e verificar)
- [ ] `prefers-reduced-motion` respeitado

---

## COMANDOS FINAIS — EXECUTE NO REPLIT

```bash
# Instalar todas as dependências de ícones 3D Apple/WhatsApp
npm install emoji-datasource-apple emoji-mart @emoji-mart/data emoji-regex node-emoji

# Instalar plugin Vite para copiar assets de emoji no build
npm install -D vite-plugin-static-copy

# Verificar se as imagens estão disponíveis
ls node_modules/emoji-datasource-apple/img/apple/64/ | head -10

# Rodar o projeto com as novas dependências
npm run dev
```

---

## RESULTADO ESPERADO

Após a implementação, todos os emojis da plataforma 123GO! — tanto nos cards do catálogo quanto nas telas internas dos jogos — serão renderizados com as **imagens PNG oficiais da Apple**, idênticas às utilizadas no WhatsApp no iPhone: tridimensionais, com iluminação, sombra suave, profundidade e o acabamento visual característico do iOS. O tamanho, a sombra e as animações de bounce/shake serão consistentes em todos os 21 jogos.
