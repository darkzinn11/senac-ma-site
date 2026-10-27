import { publicUrl } from '../data/basePath';

const SITE = 'Senac Maranhão';
const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '');
let defaultDescription = null;

function tag(selector, create) {
  let element = document.head.querySelector(selector);
  if (!element) { element = create(); document.head.appendChild(element); }
  return element;
}
const clip = (text, limit = 160) => {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  return value.length > limit ? value.slice(0, limit - 1).replace(/\s+\S*$/, '') + '…' : value;
};

// Atualiza título, descrição, canonical e robots a partir dos campos de SEO da API
// (seo_title / seo_description). Reaproveitável quando houver renderização no servidor.
export function applySeo({ title = '', description = '', path = '/', noindex = false } = {}) {
  if (typeof document === 'undefined') return;
  const meta = tag('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }));
  if (defaultDescription === null) defaultDescription = meta.getAttribute('content') || '';
  document.title = title ? `${title} | ${SITE}` : `${SITE} — Cursos e oportunidades`;
  meta.setAttribute('content', clip(description) || defaultDescription);
  const canonical = tag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }));
  canonical.setAttribute('href', (SITE_URL || window.location.origin) + publicUrl(path));
  const robots = tag('meta[name="robots"]', () => Object.assign(document.createElement('meta'), { name: 'robots' }));
  robots.setAttribute('content', noindex ? 'noindex, follow' : 'index, follow');
}
