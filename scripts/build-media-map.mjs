// Gera src/data/localMedia.json: chave de mídia da API -> arquivo já baixado em public/media.
// A API nomeia cada arquivo importado como sha256("wp-uploads:" + caminho-em-uploads)[:16] (hex) + extensão
// (docs/IMPORTACAO.md, seção 11). Enquanto o rsync dos uploads para o servidor de mídia não acontece,
// o site usa as 231 cópias locais. Depois do rsync este arquivo pode ser esvaziado (`{}`).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('public/media');
const map = {};
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (entry.name === 'MANIFEST.json' || entry.name.startsWith('.')) continue;
    const rel = path.relative(root, full).split(path.sep).join('/');
    const key = crypto.createHash('sha256').update('wp-uploads:' + rel).digest('hex').slice(0, 32)
      + path.extname(entry.name).toLowerCase();
    map[key] = '/media/' + rel;
  }
};
walk(root);
fs.writeFileSync('src/data/localMedia.json', JSON.stringify(map, Object.keys(map).sort()) + '\n');
console.log('localMedia.json:', Object.keys(map).length, 'arquivos');
