import React, { useEffect, useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';
import { mediaUrl } from '../api/client';
import { sentenceCase } from '../utils/sentenceCase';

// O HTML dos conteúdos (notícias, páginas, cursos) vem da API já sanitizado (bluemonday). Mesmo assim ele é
// sanitizado de novo aqui (defesa em profundidade: a API pode mudar, e o conteúdo é de editores) com DOMPurify
// e só então injetado via dangerouslySetInnerHTML. Sem iframe/form/style/script; imagens só do site, da API ou https.
const WP_HOST = /^https?:\/\/(www\.)?ma\.senac\.br(\/|$)/i;
let hooked = false;
function installHooks() {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook('afterSanitizeAttributes', node => {
    if (node.tagName === 'IMG') {
      node.removeAttribute('srcset'); node.removeAttribute('sizes');
      const src = node.getAttribute('src') || '';
      // Imagem do WordPress antigo: o site não pode depender do ma.senac.br; some em vez de quebrar.
      if (!src || WP_HOST.test(src) || !/^(\/(?!\/)|https:\/\/|data:image\/)/i.test(src)) { node.parentNode?.removeChild(node); return; }
      node.setAttribute('src', mediaUrl(src));
      node.setAttribute('loading', 'lazy'); node.setAttribute('decoding', 'async');
      if (!node.hasAttribute('alt')) node.setAttribute('alt', '');
    }
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') || '';
      if (href.startsWith('/v1/')) node.setAttribute('href', mediaUrl(href));
      if (/\/author\//.test(href)) node.removeAttribute('href'); // páginas de autor não existem mais (410)
      if (node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}
export const sanitizeHtml = (html) => {
  installHooks();
  return DOMPurify.sanitize(String(html || ''), {
    USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed', 'svg', 'math'],
    FORBID_ATTR: ['style', 'srcdoc', 'formaction'], ALLOW_DATA_ATTR: false, ADD_ATTR: ['target'],
  });
};

// Imagens que falham (mídia ainda não copiada) são ocultadas junto do link/parágrafo que só as continha.
export function hideBrokenImage(img) {
  if (img.dataset.broken) return;
  img.dataset.broken = '1'; img.hidden = true;
  const link = img.closest('a');
  if (link && !link.textContent.trim() && !link.querySelector('img:not([hidden])')) link.hidden = true;
  const parent = (link || img).parentElement;
  if (parent && parent.tagName === 'P' && !parent.textContent.trim() && !parent.querySelector('img:not([hidden])')) parent.hidden = true;
}

export default function Html({ html, className = 'inner-prose' }) {
  const ref = useRef(null);
  const safe = useMemo(() => {
    const sanitized = sanitizeHtml(html);
    const doc = new DOMParser().parseFromString(sanitized, 'text/html');
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.nodeValue = sentenceCase(node.nodeValue);
    return doc.body.innerHTML;
  }, [html]);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const onError = event => { if (event.target?.tagName === 'IMG') hideBrokenImage(event.target); };
    root.addEventListener('error', onError, true);
    root.querySelectorAll('img').forEach(img => { if (img.complete && img.naturalWidth === 0) hideBrokenImage(img); });
    return () => root.removeEventListener('error', onError, true);
  }, [safe]);
  // eslint-disable-next-line react/no-danger
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
