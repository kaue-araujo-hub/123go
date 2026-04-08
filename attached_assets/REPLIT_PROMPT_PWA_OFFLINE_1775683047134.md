# PROMPT PARA O REPLIT — PWA COMPLETO + OFFLINE TOTAL
## Plataforma 123GO! · Funcionar sem internet após primeiro acesso

---

## CONTEXTO — PROBLEMA A RESOLVER

O site `https://123-go.replit.app/` tem três pontos críticos que impedem uso
em escolas com internet fraca ou ausente:

1. **Service Worker ausente ou não registrado** — sem SW, o navegador não faz
   cache do bundle. Cada novo dispositivo precisa de internet do zero.

2. **Google Fonts carregadas de CDN externo** — `fonts.googleapis.com` falha
   offline, degradando o visual da plataforma.

3. **Replit hiberna projetos gratuitos** — após inatividade, o servidor demora
   10–20s para responder, causando timeout em conexões lentas.

**Objetivo:** após uma única visita com internet boa, o site deve funcionar
completamente offline em qualquer dispositivo — tablet escolar, Chromebook,
celular Android.

---

## O QUE JÁ EXISTE (não alterar)

```
vite.config.js          ← tem VitePWA importado mas incompleto
package.json            ← vite-plugin-pwa e workbox-window já instalados
src/                    ← todos os componentes e jogos intactos
public/                 ← pasta pública do Vite
index.html              ← entry point da SPA
```

---

## ARQUIVOS A CRIAR OU MODIFICAR

```
vite.config.js              ← SUBSTITUIR configuração completa
index.html                  ← ADICIONAR meta tags PWA + fontes locais
public/
├── manifest.json           ← CRIAR (ou confirmar se existe e corrigir)
├── offline.html            ← CRIAR página de fallback offline
├── icons/
│   ├── icon-72.png         ← GERAR ícone 72×72
│   ├── icon-96.png         ← GERAR ícone 96×96
│   ├── icon-128.png        ← GERAR ícone 128×128
│   ├── icon-144.png        ← GERAR ícone 144×144
│   ├── icon-152.png        ← GERAR ícone 152×152
│   ├── icon-192.png        ← GERAR ícone 192×192 (obrigatório)
│   ├── icon-384.png        ← GERAR ícone 384×384
│   └── icon-512.png        ← GERAR ícone 512×512 (obrigatório)
src/
├── fonts/                  ← CRIAR — fontes locais
│   ├── nunito-800.woff2
│   ├── nunito-900.woff2
│   ├── nunito-sans-400.woff2
│   ├── nunito-sans-600.woff2
│   └── nunito-sans-700.woff2
└── styles/
    └── fonts.css           ← CRIAR — @font-face locais
```

---

## PASSO 1 — BAIXAR E HOSPEDAR AS FONTES LOCALMENTE

Execute este script Node.js no terminal do Replit para baixar as fontes
diretamente do Google Fonts e salvá-las em `src/fonts/`:

```bash
# Criar a pasta de fontes
mkdir -p src/fonts

# Baixar cada variante necessária do Nunito via curl
# (substitui a dependência do CDN fonts.googleapis.com)

curl -L "https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDDsmRTM.woff2" \
  -o src/fonts/nunito-800.woff2

curl -L "https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLsmRTM.woff2" \
  -o src/fonts/nunito-900.woff2

curl -L "https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_86Y.woff2" \
  -o src/fonts/nunito-sans-400.woff2

curl -L "https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_g6c.woff2" \
  -o src/fonts/nunito-sans-600.woff2

curl -L "https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_sqc.woff2" \
  -o src/fonts/nunito-sans-700.woff2
```

**Se o curl não funcionar no ambiente Replit**, use este script Node alternativo:

```js
// scripts/download-fonts.js
// Rodar com: node scripts/download-fonts.js

import https from 'https'
import fs    from 'fs'
import path  from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const FONTS = [
  {
    url:  'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDDsmRTM.woff2',
    file: 'nunito-800.woff2'
  },
  {
    url:  'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLsmRTM.woff2',
    file: 'nunito-900.woff2'
  },
  {
    url:  'https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_86Y.woff2',
    file: 'nunito-sans-400.woff2'
  },
  {
    url:  'https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_g6c.woff2',
    file: 'nunito-sans-600.woff2'
  },
  {
    url:  'https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_sqc.woff2',
    file: 'nunito-sans-700.woff2'
  },
]

const outDir = path.join(__dirname, '..', 'src', 'fonts')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, res => {
      // Seguir redirecionamentos
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        download(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', err => {
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

for (const font of FONTS) {
  const dest = path.join(outDir, font.file)
  console.log(`Baixando ${font.file}...`)
  await download(font.url, dest)
  const size = (fs.statSync(dest).size / 1024).toFixed(1)
  console.log(`  ✓ ${font.file} — ${size} KB`)
}

console.log('\nTodas as fontes baixadas com sucesso!')
```

Adicionar ao `package.json` em `scripts`:
```json
"download-fonts": "node scripts/download-fonts.js"
```

Rodar: `npm run download-fonts`

---

## PASSO 2 — CRIAR `src/styles/fonts.css`

Substituir a tag `<link>` do Google Fonts por `@font-face` apontando para os
arquivos locais. O Vite vai incluir esses arquivos no bundle automaticamente.

```css
/* src/styles/fonts.css
   Fontes locais — sem dependência de CDN externo
   Importar em src/main.js ou src/styles/global.css:
   import './fonts.css'
*/

/* ─── Nunito (display / títulos) ────────────────────────────────────────────── */
@font-face {
  font-family:  'Nunito';
  font-style:   normal;
  font-weight:  800;
  font-display: swap;   /* mostra fallback enquanto carrega — sem FOIT */
  src: url('../fonts/nunito-800.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
                 U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
                 U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
                 U+FEFF, U+FFFD;
}

@font-face {
  font-family:  'Nunito';
  font-style:   normal;
  font-weight:  900;
  font-display: swap;
  src: url('../fonts/nunito-900.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
                 U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
                 U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
                 U+FEFF, U+FFFD;
}

/* ─── Nunito Sans (corpo / UI) ───────────────────────────────────────────────── */
@font-face {
  font-family:  'Nunito Sans';
  font-style:   normal;
  font-weight:  400;
  font-display: swap;
  src: url('../fonts/nunito-sans-400.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
                 U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
                 U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
                 U+FEFF, U+FFFD;
}

@font-face {
  font-family:  'Nunito Sans';
  font-style:   normal;
  font-weight:  600;
  font-display: swap;
  src: url('../fonts/nunito-sans-600.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
                 U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
                 U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
                 U+FEFF, U+FFFD;
}

@font-face {
  font-family:  'Nunito Sans';
  font-style:   normal;
  font-weight:  700;
  font-display: swap;
  src: url('../fonts/nunito-sans-700.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
                 U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
                 U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
                 U+FEFF, U+FFFD;
}
```

**Em `src/main.js` ou `src/styles/global.css`, adicionar no topo:**
```js
// main.js — primeira linha após os imports de React
import './styles/fonts.css'
```

**Em `index.html`, REMOVER a tag do Google Fonts:**
```html
<!-- REMOVER esta linha do <head>: -->
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">

<!-- As fontes agora são carregadas pelo CSS local — nenhuma tag <link> de fonte é necessária -->
```

---

## PASSO 3 — GERAR OS ÍCONES PWA

Execute este script para gerar todos os ícones necessários a partir de um
único SVG base, usando apenas módulos Node nativos:

```js
// scripts/generate-icons.js
// Rodar com: node scripts/generate-icons.js
// Requer: npm install -D sharp

import sharp  from 'sharp'
import fs     from 'fs'
import path   from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// SVG base do ícone 123GO! — fundo roxo escuro com o "1" em destaque
const SVG_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fundo -->
  <rect width="512" height="512" rx="96" fill="#1A1A2E"/>
  <!-- Arte dos números geométricos centralizada -->
  <!-- Número 1 -->
  <rect x="80"  y="140" width="36" height="18" rx="6" fill="#FF6B35" opacity="0.9"/>
  <rect x="98"  y="140" width="18" height="156" rx="6" fill="#4CAF50" opacity="0.85"/>
  <rect x="80"  y="278" width="66" height="18" rx="6" fill="#4CAF50" opacity="0.7"/>
  <!-- Número 2 -->
  <path d="M176 158 A48 48 0 0 1 272 158 Q272 204 224 234 L176 278 L272 278"
        stroke="#E91E8C" stroke-width="22" fill="none" stroke-linecap="round"/>
  <!-- Número 3 -->
  <path d="M312 158 A42 42 0 0 1 396 158 Q396 204 354 218 Q396 232 396 278 A42 42 0 0 1 312 278"
        stroke="#00B4D8" stroke-width="22" fill="none" stroke-linecap="round"/>
  <!-- GO! simples -->
  <text x="256" y="390" font-family="Arial Black,sans-serif" font-weight="900"
        font-size="80" fill="white" text-anchor="middle" opacity="0.9">GO!</text>
</svg>
`

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const outDir = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const svgBuffer = Buffer.from(SVG_ICON)

for (const size of SIZES) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`))
  console.log(`✓ icon-${size}.png`)
}

console.log('\nÍcones gerados em public/icons/')
```

Adicionar ao `package.json`:
```json
"generate-icons": "node scripts/generate-icons.js"
```

Instalar e rodar:
```bash
npm install -D sharp
npm run generate-icons
```

---

## PASSO 4 — CRIAR `public/manifest.json`

```json
{
  "name": "123GO! Matemática",
  "short_name": "123GO!",
  "description": "Jogos de matemática para o Ensino Fundamental — Currículo Paulista",
  "lang": "pt-BR",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1A1A2E",
  "background_color": "#1A1A2E",
  "categories": ["education", "games", "kids"],
  "icons": [
    { "src": "/icons/icon-72.png",  "sizes": "72x72",   "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-96.png",  "sizes": "96x96",   "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ],
  "screenshots": [
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "123GO! — Jogos de Matemática"
    }
  ]
}
```

---

## PASSO 5 — CRIAR `public/offline.html`

Página exibida pelo Service Worker quando o usuário tenta acessar uma rota
que não está em cache e está sem internet:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>123GO! — Sem conexão</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Nunito Sans', Arial, sans-serif;
      background:  #1A1A2E;
      color:       #ffffff;
      min-height:  100dvh;
      display:     flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap:         24px;
      padding:     24px;
      text-align:  center;
    }
    .icon   { font-size: 72px; line-height: 1; }
    h1 {
      font-family: 'Nunito', Arial Black, sans-serif;
      font-weight: 900;
      font-size:   32px;
      letter-spacing: -1px;
    }
    h1 span:nth-child(1) { color: #5B4FCF; }
    h1 span:nth-child(2) { color: #E91E8C; }
    h1 span:nth-child(3) { color: #FF6B35; }
    h1 span:nth-child(4) { color: #ffffff; }
    h1 span:nth-child(5) { color: #4CAF50; }
    h1 span:nth-child(6) { color: #E91E8C; }
    p { font-size: 16px; color: rgba(255,255,255,0.65); max-width: 300px; line-height: 1.6; }
    .btn {
      background:    linear-gradient(135deg, #5B4FCF, #E91E8C);
      color:         white;
      border:        none;
      border-radius: 50px;
      padding:       14px 32px;
      font-family:   'Nunito', Arial Black, sans-serif;
      font-weight:   800;
      font-size:     16px;
      cursor:        pointer;
      min-height:    52px;
      touch-action:  manipulation;
    }
    .hint { font-size: 13px; color: rgba(255,255,255,0.35); }
  </style>
</head>
<body>
  <div class="icon">📶</div>
  <h1>
    <span>1</span><span>2</span><span>3</span><span>G</span><span>O</span><span>!</span>
  </h1>
  <p>Você está sem internet no momento.</p>
  <button class="btn" onclick="window.location.reload()">
    Tentar novamente
  </button>
  <p class="hint">
    Após carregar o site uma vez com internet,<br>
    os jogos funcionam completamente offline.
  </p>
</body>
</html>
```

---

## PASSO 6 — SUBSTITUIR `vite.config.js` COMPLETAMENTE

Este é o arquivo mais importante. Substituir todo o conteúdo:

```js
// vite.config.js — configuração completa com PWA offline total

import { defineConfig }  from 'vite'
import react             from '@vitejs/plugin-react'
import legacy            from '@vitejs/plugin-legacy'
import { VitePWA }       from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    // Compatibilidade com navegadores antigos de tablets escolares
    legacy({
      targets:          ['defaults', 'not IE 11', 'Android >= 8', 'iOS >= 13'],
      modernPolyfills:  true,
    }),

    // ─── PWA — configuração completa offline ─────────────────────────────────
    VitePWA({
      // 'autoUpdate': atualiza o SW silenciosamente em segundo plano
      registerType: 'autoUpdate',

      // Incluir o SW no bundle de produção
      injectRegister: 'auto',

      // Mostrar o SW durante desenvolvimento (para testar)
      devOptions: {
        enabled:  true,
        type:     'module',
      },

      // ─── Manifest ─────────────────────────────────────────────────────────
      // Usar o manifest.json que criamos em public/
      // O VitePWA vai injetar o <link rel="manifest"> no index.html
      manifest: false,         // false = usar o public/manifest.json existente
      manifestFilename: 'manifest.json',

      // ─── Workbox — estratégia de cache ────────────────────────────────────
      workbox: {

        // Arquivos a pré-cachear no primeiro acesso (precache list)
        // O Workbox gera a lista automaticamente a partir desses padrões
        globPatterns: [
          '**/*.{js,jsx,ts,tsx}',    // código JavaScript
          '**/*.{css}',              // estilos
          '**/*.{html}',             // HTML
          '**/*.{woff,woff2}',       // fontes locais
          '**/*.{png,jpg,jpeg,svg,ico,webp}', // imagens e ícones
          '**/*.{json}',             // dados (games.js compilado, manifest)
        ],

        // Tamanho máximo de arquivo para pré-cache (5MB — cobre emojis Apple)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // Página de fallback offline para navegação sem cache
        navigateFallback:             '/offline.html',
        navigateFallbackDenylist:     [/^\/api\//], // não cachear rotas de API

        // ─── Runtime caching — recursos externos ──────────────────────────
        runtimeCaching: [

          // Fontes do Google Fonts (fallback — caso ainda exista alguma referência)
          // Estratégia: CacheFirst — usa cache, só busca na rede se não tiver
          {
            urlPattern:  /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler:     'CacheFirst',
            options: {
              cacheName:       'google-fonts-stylesheets',
              expiration: {
                maxEntries:    10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
            },
          },
          {
            urlPattern:  /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler:     'CacheFirst',
            options: {
              cacheName:       'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries:    30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
            },
          },

          // Emojis Apple (se servidos como assets estáticos)
          {
            urlPattern:  /\/emoji\//i,
            handler:     'CacheFirst',
            options: {
              cacheName:       '123go-emoji-cache',
              expiration: {
                maxEntries:    200,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
            },
          },

          // Assets JavaScript e CSS do Vite (versioned — imutáveis)
          {
            urlPattern:  /\/assets\//i,
            handler:     'CacheFirst',
            options: {
              cacheName:       '123go-assets',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries:    100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
            },
          },

          // Rota raiz e navegação SPA
          {
            urlPattern:  ({ request }) => request.mode === 'navigate',
            handler:     'NetworkFirst',
            options: {
              cacheName:       '123go-pages',
              networkTimeoutSeconds: 5,  // após 5s sem resposta, usa cache
              expiration: {
                maxEntries:    10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 dias
              },
            },
          },
        ],

        // Limpar caches antigos automaticamente ao atualizar o SW
        cleanupOutdatedCaches: true,

        // Ativar o SW imediatamente sem aguardar o usuário fechar a aba
        skipWaiting:    true,
        clientsClaim:   true,
      },
    }),
  ],

  // ─── Build ──────────────────────────────────────────────────────────────────
  build: {
    target:    'es2015',
    sourcemap: false,           // desabilitar sourcemaps em produção (reduz tamanho)
    rollupOptions: {
      output: {
        // Code splitting manual — separa os jogos do bundle principal
        // Isso permite que o catálogo carregue rápido e os jogos sejam
        // carregados sob demanda
        manualChunks: {
          // Vendor: bibliotecas de terceiros (raramente mudam)
          'vendor-react':   ['react', 'react-dom'],
          'vendor-audio':   ['tone'],
          'vendor-confetti':['canvas-confetti'],

          // Engine: código compartilhado dos jogos
          'engine': [
            './src/engine/GameEngine.js',
            './src/engine/AudioSystem.js',
            './src/engine/PhaseManager.js',
            './src/engine/FeedbackSystem.js',
            './src/engine/TimerSystem.js',
            './src/engine/TimerStore.js',
            './src/engine/ModeConfig.js',
          ],

          // Jogos: cada jogo em seu próprio chunk (lazy loading)
          'game-g01': ['./src/games/g01-festa-lagarta/game.js'],
          'game-g02': ['./src/games/g02-par-impar/game.js'],
          'game-g03': ['./src/games/g03-caca-estrelas/game.js'],
          'game-g04': ['./src/games/g04-loja-balas/game.js'],
          'game-g05': ['./src/games/g05-ra-puladora/game.js'],
          'game-g06': ['./src/games/g06-baloes-festa/game.js'],
          'game-g07': ['./src/games/g07-trem-numeros/game.js'],
          'game-g08': ['./src/games/g08-pizzaria-magica/game.js'],
          'game-g09': ['./src/games/g09-batalha-constelacoes/game.js'],
          'game-g10': ['./src/games/g10-atelie-ordem/game.js'],
          'game-g11': ['./src/games/g11-jardim-padroes/game.js'],
          'game-g12': ['./src/games/g12-nave-organizadora/game.js'],
          'game-g13': ['./src/games/g13-robo-perdido/game.js'],
          'game-g14': ['./src/games/g14-esconde-esconde/game.js'],
          'game-g15': ['./src/games/g15-castelo-posicoes/game.js'],
          'game-g16': ['./src/games/g16-sol-lua-estrelas/game.js'],
          'game-g17': ['./src/games/g17-calendario-vivo/game.js'],
          'game-g18': ['./src/games/g18-maquina-tempo/game.js'],
          'game-g19': ['./src/games/g19-sorveteria-dados/game.js'],
          'game-g20': ['./src/games/g20-zoo-tabelas/game.js'],
          'game-g21': ['./src/games/g21-pesquisa-turma/game.js'],
        },
      },
    },
  },

  // ─── Dev server ─────────────────────────────────────────────────────────────
  server: {
    host: true,
    port: 3000,
  },

  // ─── Preview (testar build localmente) ──────────────────────────────────────
  preview: {
    host: true,
    port: 4173,
  },
})
```

---

## PASSO 7 — ATUALIZAR `index.html`

Remover o link do Google Fonts e adicionar as meta tags PWA corretas:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- REMOVER esta linha (Google Fonts CDN): -->
  <!-- <link href="https://fonts.googleapis.com/css2?family=Nunito..."> -->

  <!-- PWA — meta tags obrigatórias -->
  <meta name="theme-color"              content="#1A1A2E" />
  <meta name="apple-mobile-web-app-capable"           content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style"  content="black-translucent" />
  <meta name="apple-mobile-web-app-title"             content="123GO!" />
  <meta name="mobile-web-app-capable"                 content="yes" />
  <meta name="application-name"                       content="123GO!" />

  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json" />

  <!-- Ícones Apple (iOS não usa manifest para ícones) -->
  <link rel="apple-touch-icon" href="/icons/icon-152.png" />
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
  <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
  <link rel="icon" type="image/png" sizes="32x32"   href="/icons/icon-96.png" />
  <link rel="shortcut icon"                          href="/icons/icon-96.png" />

  <!-- Splash screen iOS -->
  <meta name="apple-mobile-web-app-title" content="123GO!" />

  <!-- OG tags para compartilhamento -->
  <meta property="og:title"       content="123GO! — Jogos de Matemática" />
  <meta property="og:description" content="Jogos de matemática para o Ensino Fundamental — Currículo Paulista" />
  <meta property="og:image"       content="/icons/icon-512.png" />
  <meta property="og:type"        content="website" />

  <title>123GO! — Plataforma de Jogos de Matemática</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

## PASSO 8 — ADICIONAR REGISTRO DO SW EM `src/main.jsx`

O `vite-plugin-pwa` com `injectRegister: 'auto'` cuida do registro automático,
mas adicionar o listener de atualização para notificar o professor quando
uma nova versão estiver disponível:

```jsx
// src/main.jsx — adicionar no final do arquivo, após o ReactDOM.createRoot(...)

import { registerSW } from 'virtual:pwa-register'

// Registrar o Service Worker
const updateSW = registerSW({
  // Chamado quando uma nova versão do SW está disponível
  onNeedRefresh() {
    // Notificação discreta para o professor atualizar
    // (alunos não precisam saber disso)
    if (confirm('Nova versão do 123GO! disponível. Atualizar agora?')) {
      updateSW(true)
    }
  },

  // Chamado quando o SW está instalado e o app está offline-ready
  onOfflineReady() {
    console.log('[123GO!] App pronto para uso offline!')
    // Opcional: mostrar toast discreto informando que está pronto offline
  },

  // Erro no registro
  onRegistered(registration) {
    console.log('[123GO!] Service Worker registrado:', registration)
  },

  onRegisterError(error) {
    console.error('[123GO!] Erro ao registrar Service Worker:', error)
  },
})
```

---

## PASSO 9 — EXECUTAR E VERIFICAR

```bash
# 1. Baixar fontes locais
npm run download-fonts

# 2. Gerar ícones PWA
npm run generate-icons

# 3. Build de produção (gera o sw.js e o manifest)
npm run build

# 4. Preview local para testar o PWA (IMPORTANTE: usar preview, não dev)
# O Service Worker só funciona em build de produção
npm run preview

# 5. Abrir http://localhost:4173 no Chrome e verificar:
#    DevTools → Application → Service Workers → deve mostrar "activated and running"
#    DevTools → Application → Cache Storage → deve mostrar os caches do Workbox
#    DevTools → Application → Manifest → deve mostrar todos os campos corretos
```

---

## PASSO 10 — VERIFICAÇÃO MANUAL OFFLINE

Após o `npm run preview` confirmar que tudo funciona:

```
1. Abrir http://localhost:4173 no Chrome
2. Navegar pelo catálogo e abrir 2–3 jogos diferentes
   (isso força o cache de todos os chunks dos jogos visitados)
3. DevTools → Network → marcar "Offline"
4. Recarregar a página (F5)
5. Verificar:
   [ ] Catálogo carrega normalmente
   [ ] Fontes Nunito carregam (não degradam para Arial)
   [ ] Emojis Apple carregam nos cards
   [ ] Abrindo um jogo que foi visitado: funciona completamente
   [ ] Abrindo um jogo NÃO visitado: mostra a página offline.html
       (comportamento correto — jogos não visitados não foram cacheados)
6. DevTools → Network → desmarcar "Offline"
```

---

## PASSO 11 — FAZER DEPLOY NO REPLIT COM O BUILD

Após validar localmente, fazer o deploy da versão buildada:

```bash
# O Replit deve servir a pasta dist/ gerada pelo Vite
# Verificar se o arquivo .replit ou replit.nix está configurado
# para servir arquivos estáticos da pasta dist/

# Opção A: Se o Replit usa um servidor Node customizado
# Adicionar em server.js (ou equivalente):
import express from 'express'
import path    from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3000

// Servir arquivos estáticos com cache headers corretos
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',           // assets versionados: 1 ano de cache
  etag:   true,
  setHeaders(res, filePath) {
    // Service Worker NUNCA deve ser cacheado pelo browser (só pelo SW)
    if (filePath.endsWith('sw.js') || filePath.endsWith('workbox-*.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Service-Worker-Allowed', '/')
    }
    // HTML: sem cache (para garantir que o SW atualizado seja detectado)
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache')
    }
  }
}))

// SPA fallback — todas as rotas servem o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`123GO! rodando na porta ${PORT}`))
```

```bash
# Opção B: Se o Replit usa configuração estática
# Criar arquivo .replit com:
# [deployment]
# deploymentTarget = "static"
# publicDir = "dist"
# build = ["npm", "run", "build"]
```

---

## CHECKLIST FINAL DE VALIDAÇÃO

```
FONTES:
[ ] src/fonts/ contém os 5 arquivos .woff2
[ ] src/styles/fonts.css importado no main.jsx/global.css
[ ] index.html NÃO contém mais a tag <link> do Google Fonts
[ ] Fonte Nunito visível offline (DevTools Network → Offline → recarregar)

MANIFEST:
[ ] public/manifest.json existe e é JSON válido
[ ] index.html tem <link rel="manifest" href="/manifest.json">
[ ] DevTools → Application → Manifest mostra todos os campos sem erros
[ ] Ícones 192px e 512px existem em public/icons/
[ ] "Add to Home Screen" funciona em Chrome Android

SERVICE WORKER:
[ ] npm run build gera dist/sw.js e dist/workbox-*.js
[ ] DevTools → Application → Service Workers → "Status: activated and running"
[ ] DevTools → Application → Cache Storage → caches do Workbox visíveis
[ ] Nenhum erro vermelho no console relacionado ao SW

OFFLINE:
[ ] Site carrega com DevTools Network → Offline após primeiro acesso
[ ] Fontes Nunito carregam offline (não degradam para Arial/sans-serif)
[ ] Emojis Apple carregam offline
[ ] Catálogo de jogos carrega offline
[ ] Jogos visitados anteriormente abrem e jogam offline
[ ] Jogos NÃO visitados mostram offline.html (comportamento correto)
[ ] localStorage persiste progresso offline (timer, fases, tutorial)

BUILD:
[ ] dist/ tem subpasta assets/ com chunks separados por jogo
[ ] Chunk principal (index-*.js) tem menos de 300KB gzip
[ ] Nenhum console.error no build
[ ] npm run preview funciona sem erros
```
