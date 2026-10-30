import { ApiError, getJSON, mediaUrl, query } from './client';
import {
  adaptContent, adaptNews, adaptNewsItem, adaptPage, adaptUnit, brief, textOf,
} from './adapters';
import { normalizePath, virtualPages } from '../data/portalRoutes';

const API = '/v1/public';
const ROUTE_TTL = 30 * 1000;
const resolved = new Map(); // caminho -> { at, value }

const fresh = entry => entry && Date.now() - entry.at < ROUTE_TTL;
// Resultado já resolvido (síncrono): evita "Carregando" ao voltar para uma página visitada.
export const peekRoute = path => { const entry = resolved.get(normalizePath(path)); return fresh(entry) ? entry.value : null; };

// Resolve qualquer rota pública: página, notícia, curso, edital, resultado, redirecionamento (301), removido (410).
// Resolve com { type: 'page'|'redirect'|'gone'|'notfound' }; rejeita com ApiError se a API estiver fora do ar.
export async function resolveRoute(path) {
  const key = normalizePath(path);
  const cached = peekRoute(key);
  if (cached) return cached;
  let value;
  try {
    const content = await getJSON(`${API}/content` + query({ path: key }));
    const unitMatch = content.type === 'page' && /^\/unidades\/([^/]+)\/$/.exec(key);
    if (unitMatch) {
      const unit = await getJSON(`${API}/units/${encodeURIComponent(unitMatch[1])}`).catch(error => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      });
      value = { type: 'page', page: adaptPage(content.data, unit) };
    } else value = adaptContent(content);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
    const virtual = virtualPages.find(page => page.path === key);
    value = virtual ? { type: 'page', page: virtual } : { type: 'notfound' };
  }
  resolved.set(key, { at: Date.now(), value });
  return value;
}

const paged = (response, adapt) => ({
  items: (response.data || []).map(adapt), total: response.meta?.total ?? 0,
  page: response.meta?.page ?? 1, totalPages: response.meta?.total_pages ?? 1,
});

export async function listNews({ page = 1, perPage = 12, q = '', category = '' } = {}) {
  return paged(await getJSON(`${API}/news` + query({ page, per_page: perPage, q, category })), adaptNewsItem);
}
const noticeItem = item => ({ id: item.id, title: item.title, path: item.path, date: item.published_at, state: item.registration_state });
export async function listNotices({ type = 'psg', page = 1, perPage = 18, q = '' } = {}) {
  return paged(await getJSON(`${API}/notices` + query({ type, page, per_page: perPage, q })), noticeItem);
}
const resultItem = item => ({ id: item.id, title: item.title, path: item.path, date: item.result_date });
export async function listResults({ page = 1, perPage = 18, q = '' } = {}) {
  return paged(await getJSON(`${API}/results` + query({ page, per_page: perPage, q })), resultItem);
}
export async function listUnits() {
  const response = await getJSON(`${API}/units` + query({ per_page: 100 }));
  return (response.data || []).map(adaptUnit);
}
export async function listChildPages(parentPath) {
  const response = await getJSON(`${API}/pages` + query({ parent_path: parentPath, per_page: 100 }));
  return (response.data || []).map(item => ({ id: item.id, kind: 'page', title: item.title, path: item.path, cover: mediaUrl(item.cover_image_url), excerpt: '' }));
}
export async function loadSettings() {
  const settings = await getJSON(`${API}/settings`);
  return {
    facebook: settings.facebook_url || '', instagram: settings.instagram_url || '', youtube: settings.youtube_url || '',
    address: settings.address || '', phone: settings.phone || '', email: settings.email || '', name: settings.portal_name || '',
    // Destaque institucional da home (editável no admin). Nulos = o site usa a arte e o vídeo padrão.
    highlight: {
      enabled: settings.highlight?.enabled !== false,
      bannerUrl: mediaUrl(settings.highlight?.banner_url), bannerMobileUrl: mediaUrl(settings.highlight?.banner_mobile_url),
      bannerAlt: settings.highlight?.banner_alt || '', videoId: settings.highlight?.video_id || '',
    },
  };
}
export async function loadQuickLinks() {
  return ((await getJSON(`${API}/quick-links`)).data || [])
    .filter(item => item.title && item.link_url)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(item => ({ id: item.id, title: item.title, detail: item.description || '', href: item.link_url, icon: item.icon || '', newTab: item.open_in_new_tab }));
}

const canLoad = (url, timeout = 5000) => new Promise(resolve => {
  const image = new Image();
  const timer = setTimeout(() => resolve(false), timeout);
  image.onload = () => { clearTimeout(timer); resolve(true); };
  image.onerror = () => { clearTimeout(timer); resolve(false); };
  image.src = url;
});
// Banners do carrossel da home. A API pública já devolve só os ativos e dentro da janela start_at/end_at;
// aqui só ordenamos (sort_order) e descartamos o que não tem imagem carregável. Lista vazia é resposta legítima
// (a Home esconde a seção); erro de rede/HTTP rejeita a promessa (a Home usa os slides de reserva).
// placement: 'hero' (carrossel do topo, padrão) ou 'institutional' (segundo carrossel, acima das notícias).
export async function loadBanners(placement = 'hero') {
  const banners = (await getJSON(`${API}/banners` + query({ placement }), { ttl: 30 * 1000 })).data || [];
  const slides = [...banners].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(item => ({
    id: item.id, image: mediaUrl(item.desktop_image_url), mobileImage: mediaUrl(item.mobile_image_url) || undefined,
    alt: item.alt_text || 'Banner do Senac Maranhão', href: item.link_url || undefined, newTab: Boolean(item.open_in_new_tab),
    mobilePortrait: item.mobile_image_height > item.mobile_image_width,
  })).filter(slide => slide.image);
  const loadable = await Promise.all(slides.map(slide => canLoad(slide.image)));
  const mobileOk = await Promise.all(slides.map(slide => slide.mobileImage ? canLoad(slide.mobileImage) : false));
  return slides.filter((_, index) => loadable[index]).map(slide => {
    const ok = mobileOk[slides.indexOf(slide)];
    // landscape: a arte exibida no celular é horizontal (ex.: 1920x780 sem arte mobile própria): o CSS mostra inteira.
    return { ...slide, mobileImage: ok ? slide.mobileImage : undefined, mobileVerified: ok, landscape: !(ok && slide.mobilePortrait) };
  });
}
// Últimas notícias da home; a notícia principal recebe um resumo do corpo (a listagem não traz resumo).
export async function loadHomeNews(limit = 4) {
  const { items } = await listNews({ perPage: limit });
  if (items[0] && !items[0].excerpt) {
    try {
      const detail = adaptNews(await getJSON(`${API}/news/${encodeURIComponent(items[0].slug)}`));
      items[0] = { ...items[0], excerpt: brief(textOf(detail.html), 24).replace(/\s*\[…\]$/, '…') };
    } catch { /* o resumo é opcional */ }
  }
  return items;
}

// Busca do site: notícias, cursos e páginas no servidor (até 100 de cada).
export async function searchSite(term) {
  const q = term.trim();
  const settled = await Promise.allSettled([
    getJSON(`${API}/news` + query({ q, per_page: 100 })),
    getJSON(`${API}/courses` + query({ q, per_page: 100 })),
    getJSON(`${API}/pages` + query({ q, per_page: 100 })),
  ]);
  if (settled.every(result => result.status === 'rejected')) throw settled[0].reason;
  const value = index => settled[index].status === 'fulfilled' ? settled[index].value : { data: [], meta: { total: 0 } };
  const news = value(0), courses = value(1), pages = value(2);
  const items = [
    ...(courses.data || []).map(item => ({ id: item.id, kind: 'course', title: item.name, path: item.path, excerpt: item.short_description || '', carga_horaria: item.workload_hours })),
    ...(news.data || []).map(adaptNewsItem),
    ...(pages.data || []).map(item => ({ id: item.id, kind: 'page', title: item.title, path: item.path, excerpt: '' })),
  ];
  const total = response => response.meta?.total ?? (response.data || []).length;
  return { items, truncated: [news, courses, pages].some(response => total(response) > (response.data || []).length) };
}
