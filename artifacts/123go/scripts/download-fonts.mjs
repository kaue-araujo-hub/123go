import https from 'https';
import fs    from 'fs';
import path  from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FONTS = [
  { url: 'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDDsmRTM.woff2', file: 'nunito-800.woff2' },
  { url: 'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLsmRTM.woff2', file: 'nunito-900.woff2' },
  { url: 'https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_86Y.woff2', file: 'nunito-sans-400.woff2' },
  { url: 'https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_g6c.woff2', file: 'nunito-sans-600.woff2' },
  { url: 'https://fonts.gstatic.com/s/nunitosans/v15/pe0TMImSLYBIv1o4X1M8cc8WAc5jU1ECVZl_sqc.woff2', file: 'nunito-sans-700.woff2' },
];

const outDir = path.join(__dirname, '..', 'src', 'fonts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

for (const font of FONTS) {
  const dest = path.join(outDir, font.file);
  process.stdout.write(`Baixando ${font.file}...`);
  await download(font.url, dest);
  const size = (fs.statSync(dest).size / 1024).toFixed(1);
  console.log(` ✓ ${size} KB`);
}
console.log('\nFontes baixadas com sucesso!');
