// Amostra das URLs antigas do sitemap do WordPress (formato `grupo<TAB>url`): navega no site e confere que cada
// uma termina em conteúdo, redirecionamento 301 ou "conteúdo removido" (410) coerentes com a resposta da API.
//   node scripts/verify-sitemap-sample.mjs [arquivo-urls.txt] [tamanho-da-amostra]
// Variáveis: SITE_URL (http://localhost:4173), API_URL (http://127.0.0.1:8080), CHROME_PATH, URLS_FILE, CONCURRENCY.
// Não acessa o ma.senac.br: só o caminho das URLs é usado; todo tráfego externo é bloqueado.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const ORIGIN = process.env.SITE_URL || 'http://localhost:4173';
const API = (process.env.API_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE = process.argv[2] || process.env.URLS_FILE || '/private/tmp/claude-501/-Users-sitwcomunicacaoemarketing-Desktop-SENAC/4b774610-fcc3-43a9-9ac2-131453399b18/scratchpad/seo/urls.txt';
const SIZE = Number(process.argv[3] || 200);
const CONCURRENCY = Number(process.env.CONCURRENCY || 4);
const ALLOWED = new Set([new URL(ORIGIN).origin, new URL(API).origin]);

let preview = null;
const reachable = async () => { try { return (await fetch(ORIGIN)).ok; } catch { return false; } };
if (!(await reachable())) {
  preview = spawn('npx', ['vite', 'preview', '--port', new URL(ORIGIN).port || '4173', '--strictPort'], { stdio: 'ignore' });
  for (let i = 0; i < 40 && !(await reachable()); i += 1) await new Promise(resolve => setTimeout(resolve, 250));
}
process.on('exit', () => preview?.kill());

const fold = value => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const norm = path => { let p; try { p = decodeURI(path); } catch { p = path; } p = p.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'; return (p === '/' ? p : p + '/').toLowerCase(); };

// Amostra estratificada e determinística: proporcional ao grupo, mínimo 3 por grupo.
const rows = fs.readFileSync(FILE, 'utf8').split('\n').map(line => line.trim()).filter(Boolean).map(line => { const [group, url] = line.split('\t'); return { group, url }; });
const groups = new Map();
rows.forEach(row => groups.set(row.group, [...(groups.get(row.group) || []), row]));
const sample = [];
for (const [, list] of groups) {
  const take = Math.min(list.length, Math.max(3, Math.round(SIZE * list.length / rows.length)));
  for (let i = 0; i < take; i += 1) sample.push(list[Math.floor((i + 0.5) * list.length / take)]);
}

// O que a API diz para cada URL (segue a cadeia de redirects).
async function expected(path) {
  let current = norm(path);
  if (current === '/') return { kind: 'home', final: '/', hops: 0 };
  for (let hop = 0; hop < 6; hop += 1) {
    const response = await fetch(API + '/v1/public/content?path=' + encodeURIComponent(current));
    if (response.status === 404) return { kind: 'notfound', final: current, hops: hop };
    if (!response.ok) throw new Error('API HTTP ' + response.status);
    const body = await response.json();
    if (body.type === 'redirect') {
      if (!body.redirect.to_path) return { kind: 'gone', final: norm(path), hops: hop };
      if (/^[a-z][a-z0-9+.-]*:/i.test(body.redirect.to_path)) return { kind: 'external', to: body.redirect.to_path, final: current, hops: hop + 1 };
      current = norm(body.redirect.to_path); continue;
    }
    if (body.type === 'gone') return { kind: 'gone', final: norm(path), hops: hop };
    const title = body.data.title || body.data.name;
    return { kind: hop ? 'redirect' : 'content', type: body.type, title, final: current, hops: hop };
  }
  return { kind: 'loop', final: current, hops: 6 };
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
await context.route(url => !ALLOWED.has(new URL(url).origin), route => route.abort());
let wpRequests = 0;
// Navegar até um destino externo de um redirect 301 da API (ex.: /acesso-rapido/ -> portal PSG) não é dependência de dados.
context.on('request', request => { if (!request.isNavigationRequest() && /(^|\.)ma\.senac\.br$/.test(new URL(request.url()).hostname)) wpRequests += 1; });

const results = [];
let cursor = 0;
async function worker() {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  while (cursor < sample.length) {
    const row = sample[cursor++];
    const url = new URL(row.url);
    const entry = { group: row.group, url: url.pathname + url.search, problems: [] };
    errors.length = 0;
    try {
      const exp = await expected(url.pathname);
      entry.expected = exp.kind + (exp.type ? ':' + exp.type : '') + (exp.hops ? ` (${exp.hops} redirect)` : '');
      const navigations = [];
      const onRequest = request => { if (request.isNavigationRequest()) navigations.push(request.url()); };
      page.on('request', onRequest);
      await page.goto(ORIGIN + url.pathname + url.search, { waitUntil: 'networkidle' });
      if (exp.kind === 'external') {
        const target = exp.to.split('#')[0];
        for (let i = 0; i < 30 && !navigations.some(u => u.startsWith(target)); i += 1) await page.waitForTimeout(100);
        page.off('request', onRequest);
        if (navigations.some(u => u.startsWith(target))) entry.outcome = '301 -> externo'; else entry.problems.push('não navegou para ' + exp.to);
        entry.final = exp.to; results.push(entry); continue;
      }
      page.off('request', onRequest);
      await page.waitForFunction(() => { const h1 = document.querySelector('h1')?.textContent || ''; return h1 && !/^Carregando/.test(h1); }, null, { timeout: 10000 });
      const got = await page.evaluate(() => ({ path: location.pathname, h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim() || '', text: document.body.innerText.length, robots: document.querySelector('meta[name="robots"]')?.content || '', canonical: document.querySelector('link[rel="canonical"]')?.href || '' }));
      entry.final = got.path; entry.h1 = got.h1.slice(0, 60);
      if (exp.kind === 'gone') { if (got.h1 !== 'Conteúdo removido') entry.problems.push('esperava "Conteúdo removido" (410), h1=' + got.h1.slice(0, 40)); else entry.outcome = '410'; }
      else if (exp.kind === 'notfound') { entry.outcome = got.h1 === 'Página não encontrada' ? '404 (API também não resolve)' : 'inesperado'; entry.problems.push('API não resolve esta URL (404)'); }
      else if (exp.kind === 'home') { if (got.path !== '/' || !/Encontre o curso ideal/.test(got.h1)) entry.problems.push('esperava a home, h1=' + got.h1.slice(0, 40)); else entry.outcome = 'home'; }
      else {
        if (norm(got.path) !== exp.final) entry.problems.push(`URL final ${got.path} != ${exp.final}`);
        const catalogTitle = ['/cursos-senac/', '/todos-os-cursos/', '/buscar-cursos/'].includes(exp.final) ? 'Encontre o curso ideal' : exp.title; // o catálogo tem h1 próprio
        if (!fold(got.h1).includes(fold(catalogTitle))) entry.problems.push(`h1 "${got.h1.slice(0, 45)}" != título "${String(exp.title).slice(0, 45)}"`);
        if (got.text < 300) entry.problems.push('pouco conteúdo');
        if (!got.canonical.endsWith(exp.final)) entry.problems.push('canonical incorreto: ' + got.canonical);
        if (/noindex/.test(got.robots)) entry.problems.push('noindex indevido');
        entry.outcome = exp.hops ? '301 -> conteúdo' : 'conteúdo';
      }
    } catch (error) { entry.problems.push(error.message.split('\n')[0]); }
    errors.forEach(message => entry.problems.push('JS: ' + message));
    results.push(entry);
  }
  await page.close();
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();

const byGroup = {};
results.forEach(entry => { const g = (byGroup[entry.group] ||= { total: 0, ok: 0, outcomes: {} }); g.total += 1; if (!entry.problems.length) g.ok += 1; g.outcomes[entry.outcome || 'falha'] = (g.outcomes[entry.outcome || 'falha'] || 0) + 1; });
console.log(`Amostra: ${results.length} URLs de ${rows.length} (${groups.size} grupos)\n`);
console.table(Object.fromEntries(Object.entries(byGroup).map(([group, g]) => [group, { total: g.total, ok: g.ok, resultados: JSON.stringify(g.outcomes) }])));
const bad = results.filter(entry => entry.problems.length);
bad.forEach(entry => console.log('PROBLEMA', entry.group, entry.url, '|', entry.expected || '', '|', entry.problems.join('; ')));
console.log(`\nRequisições ao ma.senac.br: ${wpRequests}`);
console.log(`Resumo: ${results.length - bad.length}/${results.length} corretas, ${bad.length} com problema.`);
process.exit(bad.length || wpRequests ? 1 : 0);
