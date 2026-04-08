import sharp from 'sharp';
import fs    from 'fs';
import path  from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SVG_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fundo escuro arredondado -->
  <rect width="512" height="512" rx="96" fill="#1A1A2E"/>
  <!-- Número 1 -->
  <rect x="68"  y="130" width="38" height="20" rx="7" fill="#F97316"/>
  <rect x="87"  y="130" width="20" height="168" rx="7" fill="#22C55E"/>
  <rect x="68"  y="280" width="72" height="20" rx="7" fill="#22C55E"/>
  <!-- Número 2 -->
  <path d="M174 148 A50 50 0 0 1 274 148 Q274 196 224 228 L174 278 L278 278"
        stroke="#E91E8C" stroke-width="24" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Número 3 -->
  <path d="M312 148 A44 44 0 0 1 400 148 Q400 196 356 214 Q400 232 400 278 A44 44 0 0 1 312 278"
        stroke="#6366F1" stroke-width="24" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
  <!-- GO! -->
  <text x="256" y="392" font-family="Arial Black,sans-serif" font-weight="900"
        font-size="84" fill="white" text-anchor="middle" letter-spacing="-2">GO!</text>
</svg>
`;

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const svgBuffer = Buffer.from(SVG_ICON);

for (const size of SIZES) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

console.log('\nÍcones gerados em public/icons/');
