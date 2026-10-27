import { publicUrl } from '../data/basePath';
import localMedia from '../data/localMedia.json';

// Base da API pública. Vazio = mesma origem (proxy do Vite em desenvolvimento, proxy reverso em produção).
// Preencha VITE_API_URL só se a API estiver em outro domínio (ela precisa liberar o site em PUBLIC_ALLOWED_ORIGINS).
// Nunca coloque segredo aqui: o valor entra no bundle. Só endpoints públicos de leitura, sem cookies.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = '' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const TIMEOUT_MS = 10000;
const DEFAULT_TTL = 5 * 60 * 1000;
const cache = new Map(); // caminho -> { promise, expires }
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(path, attempt = 0) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(API_URL + path, {
      method: 'GET', credentials: 'omit', referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (response.ok) return await response.json();
    let code = '';
    try { code = (await response.json())?.error?.code || ''; } catch { /* corpo não JSON */ }
    if ((response.status === 429 || response.status >= 500) && attempt < 1) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      await wait(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 3) * 1000 : 500);
      return request(path, attempt + 1);
    }
    throw new ApiError(`HTTP ${response.status} em ${path}`, { status: response.status, code });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (attempt < 1) { await wait(400); return request(path, attempt + 1); }
    throw new ApiError(error?.name === 'AbortError' ? `Tempo esgotado em ${path}` : `Sem resposta da API em ${path}`, { status: 0, code: 'network' });
  } finally {
    clearTimeout(timer);
  }
}

// GET com cache em memória (e deduplicação de requisições em voo). 404 também é cacheado;
// falhas transitórias (rede, 5xx) são descartadas para permitir nova tentativa.
export function getJSON(path, { ttl = DEFAULT_TTL, fresh = false } = {}) {
  const hit = cache.get(path);
  if (!fresh && hit && hit.expires > Date.now()) return hit.promise;
  const promise = request(path);
  cache.set(path, { promise, expires: Date.now() + ttl });
  promise.catch(error => { if (!(error instanceof ApiError) || error.status !== 404) cache.delete(path); });
  return promise;
}

export const query = params => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') search.set(key, String(value).trim());
  });
  const text = search.toString();
  return text ? '?' + text : '';
};

// Mídia: as URLs vêm como /v1/media/files/{chave}. Os 231 arquivos já baixados (public/media) são servidos
// pelo próprio site; o restante aponta para o servidor de mídia da API (que ainda não recebeu os arquivos).
export function mediaUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = /^\/v1\/media\/files\/([0-9a-f]{32}\.[a-z0-9]+)(?:[?#].*)?$/i.exec(url);
  if (match) {
    const local = localMedia[match[1].toLowerCase()];
    if (local) return publicUrl(encodeURI(local));
  }
  if (url.startsWith('/v1/')) return API_URL + url;
  return url;
}
export const isLocalMedia = url => typeof url === 'string' && url.startsWith(publicUrl('/media/'));
