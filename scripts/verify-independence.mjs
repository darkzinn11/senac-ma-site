// Prova que o site funciona só com o site + a API própria (sem o WordPress).
// Todo tráfego para fora do site e da API é bloqueado (inclusive ma.senac.br); qualquer tentativa de acesso ao
// ma.senac.br reprova o teste. Carrega uma amostra de rotas reais e exige conteúdo, h1, zero erros de JS.
//
// Pré-requisitos: API no ar (padrão http://127.0.0.1:8080) e o site servido com proxy de /v1 para a API:
//   npm run build && npx vite preview --port 4173      (o vite.config.mjs já faz o proxy de /v1)
//   node scripts/verify-independence.mjs
// Variáveis: SITE_URL (padrão http://localhost:4173), API_URL (padrão http://127.0.0.1:8080), CHROME_PATH.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const ORIGIN = process.env.SITE_URL || 'http://localhost:4173';
const API = (process.env.API_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ALLOWED = new Set([new URL(ORIGIN).origin, new URL(API).origin]);

// Se o site ainda não estiver no ar, sobe o `vite preview` (que faz o proxy de /v1 para a API) e derruba no fim.
let preview = null;
const reachable = async () => { try { return (await fetch(ORIGIN)).ok; } catch { return false; } };
if (!(await reachable())) {
  preview = spawn('npx', ['vite', 'preview', '--port', new URL(ORIGIN).port || '4173', '--strictPort'], { stdio: 'ignore' });
  for (let i = 0; i < 40 && !(await reachable()); i += 1) await new Promise(resolve => setTimeout(resolve, 250));
}
const stopPreview = () => preview?.kill();
process.on('exit', stopPreview);

const api = async path => {
  const response = await fetch(API + path);
  if (!response.ok) throw new Error(`API ${path}: HTTP ${response.status}`);
  return response.json();
};
const fold = value => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

// ---- Amostra de rotas reais, escolhidas na própria API ---------------------------------------------------
let sample;
try {
  const [news, notices, results, units, courses, offers, pagesList] = await Promise.all([
    api('/v1/public/news?per_page=3'), api('/v1/public/notices?type=psg&per_page=1'), api('/v1/public/results?per_page=1'),
    api('/v1/public/units?per_page=100'), api('/v1/public/courses?per_page=100'), api('/v1/public/course-offers?per_page=100'),
    api('/v1/public/pages?per_page=100'),
  ]);
  const licitacao = await api('/v1/public/notices?type=licitacao&per_page=1');
  const withOffer = offers.data.length ? await api('/v1/public/courses/' + offers.data[0].course_slug) : courses.data[0];
  const unit = units.data.find(item => /bacabal/.test(item.slug)) || units.data[0];
  const institutional = pagesList.data.find(page => page.path === '/institucional/missao-e-visao/') || pagesList.data.find(page => page.path !== '/');
  sample = { news: news.data[0], notice: notices.data[0], result: results.data[0], unit, course: withOffer, licitacao: licitacao.data[0], institutional, anyCourse: courses.data[5] };
} catch (error) {
  console.error('API indisponível ou resposta inesperada:', error.message);
  process.exit(2);
}

// ---- Rotas e expectativas --------------------------------------------------------------------------------
// h1: texto esperado (comparado sem acento/caixa); final: caminho esperado após redirecionamento (301).
const ROUTES = [
  { path: '/', label: 'home', h1: 'Encontre o curso ideal para você', needs: ['Acesso rápido', 'Últimas notícias', 'Cursos em destaque'] },
  { path: '/cursos-senac/', label: 'catálogo', h1: 'Encontre o curso ideal', needs: ['cursos encontrados'] },
  { path: sample.course.path, label: 'curso (com turma)', h1: sample.course.name, needs: ['Informações do curso', 'Turmas'] },
  { path: sample.anyCourse.path, label: 'curso', h1: sample.anyCourse.name, needs: ['Informações do curso'] },
  { path: '/noticias/', label: 'notícias (lista)', h1: 'Notícias', needs: [sample.news.title] },
  { path: sample.news.path, label: 'notícia (detalhe)', h1: sample.news.title, needs: ['Voltar para notícias'] },
  { path: '/editais-psg/', label: 'editais PSG (lista)', h1: 'Editais do Programa Senac de Gratuidade', needs: [sample.notice.title] },
  { path: sample.notice.path, label: 'edital PSG (detalhe)', h1: sample.notice.title, needs: ['Documentos'] },
  { path: '/resultados-psg/', label: 'resultados (lista)', h1: 'Resultados', needs: [sample.result.title] },
  { path: sample.result.path, label: 'resultado (detalhe)', h1: sample.result.title, needs: ['Documentos'] },
  { path: '/licitacoes-2016/', label: 'licitações', h1: 'Licitações', needs: sample.licitacao ? [sample.licitacao.title] : [] },
  ...(sample.licitacao ? [{ path: sample.licitacao.path, label: 'licitação (detalhe)', h1: sample.licitacao.title, needs: [] }] : []),
  { path: '/unidades/', label: 'unidades (lista)', h1: 'Unidades', needs: [sample.unit.name] },
  { path: `/unidades/${sample.unit.slug}/`, label: 'unidade (detalhe)', h1: sample.unit.name, needs: ['Contato'] },
  { path: sample.institutional.path, label: 'página institucional', h1: sample.institutional.title, needs: [] },
  { path: '/fale-conosco/', label: 'fale conosco', h1: 'Fale Conosco', needs: ['Canais e unidades'] },
  { path: '/psg/', label: 'serviço PSG', h1: 'Programa Senac de Gratuidade', needs: [] },
  { path: '/noticias-senac/', label: 'redirect 301 (página)', h1: 'Notícias', final: '/noticias/' },
  { path: '/quem-somos/', label: 'redirect 301 (página)', h1: 'Quem somos', final: '/institucional/' },
  { path: '/categoria/noticias/', label: 'redirect 301 (taxonomia)', h1: 'Notícias', final: '/noticias/' },
  { path: '/depoimentos-teste/', label: '410 removido', h1: 'Conteúdo removido', final: '/depoimentos-teste/', gone: true },
  { path: '/rota-que-nao-existe-xyz/', label: '404 inexistente', h1: 'Página não encontrada', final: '/rota-que-nao-existe-xyz/', expect404: true },
  { path: '/pesquisa/?s=enfermagem', label: 'busca', h1: 'Pesquisa no site', needs: ['resultado'] },
];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const blocked = new Map();
await context.route(url => !ALLOWED.has(new URL(url).origin), route => {
  const host = new URL(route.request().url()).host;
  blocked.set(host, (blocked.get(host) || 0) + 1);
  return route.abort();
});

const failures = [], brokenImages = [], warnings = [];
const isMedia = url => /\/(v1\/media\/files|media)\//.test(new URL(url).pathname);
function report(ok, label, path, extra = '') {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label.padEnd(26)} ${path.slice(0, 80)}${extra ? ' | ' + extra : ''}`);
}

for (const route of ROUTES) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push('JS: ' + error.message));
  page.on('console', message => {
    // 404 de imagem/arquivo de mídia ainda não copiado é esperado (relatado à parte); qualquer outro erro reprova.
    if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push('console: ' + message.text().slice(0, 140));
  });
  page.on('response', response => {
    const url = response.url();
    if (response.status() < 400 || !ALLOWED.has(new URL(url).origin)) return;
    if (isMedia(url)) return;
    if (route.expect404 && response.status() === 404 && /\/v1\/public\/content/.test(url)) return;
    if (route.path === '/cadastro-de-interesse/' && response.status() === 404) return;
    errors.push(`HTTP ${response.status()} ${new URL(url).pathname}${new URL(url).search}`.slice(0, 160));
  });
  await page.goto(ORIGIN + route.path, { waitUntil: 'networkidle' });
  await page.evaluate(() => { for (const image of document.images) image.loading = 'eager'; });
  await page.waitForTimeout(700);
  const info = await page.evaluate(() => ({
    path: location.pathname, h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim() || null,
    text: document.body.innerText, title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
    description: document.querySelector('meta[name="description"]')?.content || '',
    robots: document.querySelector('meta[name="robots"]')?.content || '',
    images: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => ({
      src: image.getAttribute('src'), visible: !image.hidden && image.offsetParent !== null && getComputedStyle(image).display !== 'none',
    })),
    wpLinks: [...document.querySelectorAll('a[href]')].filter(anchor => /^https?:\/\/(www\.)?ma\.senac\.br(\/|$)/.test(anchor.getAttribute('href'))).length,
  }));
  const problems = [...errors];
  if (!info.h1) problems.push('sem h1');
  else if (!fold(info.h1).includes(fold(route.h1))) problems.push(`h1 "${info.h1.slice(0, 50)}" != "${route.h1.slice(0, 50)}"`);
  if (info.text.length < 400) problems.push('pouco conteúdo (' + info.text.length + ' caracteres)');
  (route.needs || []).forEach(needle => { if (!fold(info.text).includes(fold(needle))) problems.push(`falta "${needle.slice(0, 40)}"`); });
  if (route.final && info.path !== route.final) problems.push(`URL final ${info.path} != ${route.final}`);
  if (!info.title || !info.canonical) problems.push('SEO ausente (title/canonical)');
  if (route.gone || route.expect404) { if (!/noindex/.test(info.robots)) problems.push('sem noindex'); }
  else if (/noindex/.test(info.robots) && route.path !== '/pesquisa/?s=enfermagem') problems.push('noindex indevido');
  const visibleBroken = info.images.filter(image => image.visible);
  if (visibleBroken.length) problems.push(`${visibleBroken.length} imagem(ns) quebrada(s) visível(is)`);
  info.images.forEach(image => brokenImages.push({ route: route.path, ...image }));
  if (info.wpLinks) warnings.push(`${route.path}: ${info.wpLinks} link(s) <a> para ma.senac.br (não são requisições)`);
  report(!problems.length, route.label, route.path, `${info.h1 ? info.h1.slice(0, 45) : '(sem h1)'}${info.images.length ? ` | imagens sem arquivo: ${info.images.length}` : ''}`);
  if (problems.length) failures.push({ path: route.path, problems });
  await page.close();
}

// ---- Interações: filtros do catálogo, busca na home, "carregar mais" ---------------------------------------
async function interaction(label, fn) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push('JS: ' + error.message));
  try { await fn(page); report(!errors.length, 'interação', label, errors.join('; ')); if (errors.length) failures.push({ path: label, problems: errors }); }
  catch (error) { report(false, 'interação', label, error.message.split('\n')[0]); failures.push({ path: label, problems: [error.message.split('\n')[0]] }); }
  await page.close();
}
const countText = async page => (await page.locator('.inner-results-location strong').first().textContent()).trim();
await interaction('catálogo: filtro por nome e área', async page => {
  await page.goto(ORIGIN + '/cursos-senac/', { waitUntil: 'networkidle' });
  const all = await countText(page);
  await page.fill('input[placeholder="Nome do curso"]', 'enfermagem');
  await page.waitForFunction(old => { const t = document.querySelector('.inner-results-location strong')?.textContent.trim(); return /^\d+ curso/.test(t) && t !== old; }, all, { timeout: 8000 });
  const byName = await countText(page);
  if (!/^\d+ curso/.test(byName) || byName === all) throw new Error(`filtro por nome não mudou o total (${all} -> ${byName})`);
  await page.fill('input[placeholder="Nome do curso"]', '');
  await page.selectOption('select >> nth=1', { index: 1 });
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(400);
  const byArea = await countText(page);
  if (byArea === all) throw new Error('filtro por área não mudou o total');
  await page.selectOption('select >> nth=2', 'Em andamento');
  await page.waitForTimeout(300);
});
await interaction('catálogo: paginação', async page => {
  await page.goto(ORIGIN + '/cursos-senac/', { waitUntil: 'networkidle' });
  await page.click('button[aria-label="Próxima página"]');
  const summary = await page.locator('.inner-page-summary').textContent();
  if (!/Página 2 de/.test(summary)) throw new Error('paginação não avançou: ' + summary);
});
await interaction('home: busca de cursos por tipo/área', async page => {
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
  await page.fill('#course-query', 'curso');
  await page.click('button[type="submit"]:has-text("Buscar cursos")');
  await page.waitForFunction(() => /Resultados da busca/.test(document.querySelector('#courses-heading')?.textContent || ''), null, { timeout: 8000 });
  await page.waitForFunction(() => !/Carregando cursos/.test(document.querySelector('#cursos')?.textContent || ''), null, { timeout: 8000 });
});
await interaction('notícias: carregar mais + busca no servidor', async page => {
  await page.goto(ORIGIN + '/noticias/', { waitUntil: 'networkidle' });
  const before = await page.locator('.inner-news-card').count();
  await page.click('button:has-text("Carregar mais notícias")');
  await page.waitForFunction(count => document.querySelectorAll('.inner-news-card').length > count, before, { timeout: 8000 });
  await page.fill('input[aria-label="Buscar notícia"]', 'confeitaria');
  await page.waitForTimeout(900); await page.waitForLoadState('networkidle');
  const after = await page.locator('.inner-news-card').count();
  if (!after || after >= before) throw new Error(`busca de notícias não filtrou (${before} -> ${after})`);
});
await interaction('navegação interna sem recarregar + 301 limpo no histórico', async page => {
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' });
  const marker = await page.evaluate(() => { window.__spa = 1; return history.length; });
  await page.evaluate(() => { const a = document.createElement('a'); a.href = '/noticias-senac/'; a.textContent = 'x'; document.querySelector('main').appendChild(a); });
  await page.click('main a:has-text("x")');
  await page.waitForFunction(() => location.pathname === '/noticias/', null, { timeout: 8000 });
  const state = await page.evaluate(() => ({ spa: window.__spa, length: history.length }));
  if (state.spa !== 1) throw new Error('a navegação recarregou a página');
  if (state.length !== marker + 1) throw new Error(`histórico com ${state.length - marker} entradas novas (esperado 1)`);
});

await browser.close();

// ---- Resumo ----------------------------------------------------------------------------------------------
console.log('\nHosts externos bloqueados (tentativas):', Object.fromEntries(blocked));
const wp = [...blocked.keys()].filter(host => /(^|\.)ma\.senac\.br$/.test(host));
const hidden = brokenImages.filter(image => !image.visible);
console.log(`\nImagens sem arquivo (404 em ${'/v1/media/files'} ou /media; tratadas): ${brokenImages.length} ocorrências em ${new Set(brokenImages.map(i => i.src)).size} arquivos únicos; ${hidden.length} ocultadas, ${brokenImages.length - hidden.length} visíveis`);
[...new Set(brokenImages.map(image => image.src))].slice(0, 12).forEach(src => console.log('   ', src));
warnings.forEach(text => console.log('aviso:', text));
if (wp.length || failures.length) {
  console.log('\nFALHAS:', JSON.stringify({ requisicoesParaWordPress: wp, failures }, null, 1));
  process.exit(1);
}
console.log('\nOK: rotas reais carregadas só com site + API, sem requisições ao ma.senac.br e sem erros de JS.');
