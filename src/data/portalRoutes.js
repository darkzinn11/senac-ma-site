import snapshot from './portalSnapshot.json';
const all = [...snapshot.pages,...snapshot.posts,...snapshot.courses];
const byPath = new Map(all.map(entry => [decodeURI(entry.path).toLowerCase(),entry]));
const dynamicPages = new Map();
export const normalizePath = (path) => {
  const value = decodeURI(path || '/').split('?')[0].replace(/\/+$/,'') || '/';
  return (value === '/' ? value : value + '/').toLowerCase();
};
export const getPage = (path) => byPath.get(normalizePath(path)) || dynamicPages.get(normalizePath(path));
export const localHref = (url) => {
  if (!url || url.startsWith('#') || url.startsWith('?')) return url || '#';
  try {
    const parsed = new URL(url, 'https://ma.senac.br');
    if (!['ma.senac.br','www.ma.senac.br'].includes(parsed.hostname)) return url;
    const path = normalizePath(parsed.pathname);
    const dynamic = /^\/cursos\/[^/]+\/$/.test(path) || /^\/[^/]+\/$/.test(path);
    return path==='/' || byPath.has(path) || dynamicPages.has(path) || dynamic
      ? path + parsed.search + parsed.hash : url;
  } catch { return url; }
};
export const pages = snapshot.pages;
export const articles = snapshot.posts;
export const catalog = snapshot.courses;
export const sourceDate = snapshot.generatedAt;
export const unitPages = pages.filter(item => item.path.startsWith('/unidades/') && item.path !== '/unidades/');
export const isCatalog = path => ['/cursos-senac/','/todos-os-cursos/','/buscar-cursos/'].includes(path);
export const isNews = path => ['/noticias/','/noticias-senac/'].includes(path);
export const isNotices = path => ['/editais-psg/','/resultados-psg/'].includes(path);

const api = 'https://ma.senac.br/wp-json/wp/v2/';
const textOf = value => {
  const node = new DOMParser().parseFromString(value || '', 'text/html');
  return (node.body.textContent || '').replace(/\s+/g,' ').trim();
};
function parseContent(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  doc.querySelectorAll('script,style,noscript,form,iframe,svg').forEach(n=>n.remove());
  const seen = new Set(), blocks = [], links = [];
  doc.querySelectorAll('h2,h3,h4,p,li').forEach(element => {
    if (element.parentElement?.closest('h2,h3,h4,p,li')) return;
    const value = (element.textContent || '').replace(/\s+/g,' ').trim();
    if (!value || value.length < 3 || seen.has(value)) return;
    seen.add(value);
    blocks.push({type:element.tagName.toLowerCase(),text:value.slice(0,1800),href:element.querySelector('a[href]')?.href || null});
  });
  doc.querySelectorAll('a[href]').forEach(element => {
    const href=element.href, label=(element.textContent || '').replace(/\s+/g,' ').trim();
    if (href && label && label.length<110 && !links.some(link=>link.href===href)) links.push({label,href});
  });
  return {blocks:blocks.slice(0,220),links:links.slice(0,90),
    image:doc.querySelector('img[src*="/wp-content/uploads/"]')?.src || null};
}

export async function resolvePage(path) {
  const key = normalizePath(path);
  if (getPage(key)) return getPage(key);
  const slug = key.split('/').filter(Boolean).at(-1);
  if (!slug) return null;
  const kinds = key.startsWith('/cursos/') ? ['curso'] : ['pages','posts'];
  for (const kind of kinds) {
    try {
      const url = api + kind + '?slug=' + encodeURIComponent(slug) +
        '&_fields=id,slug,link,title,content,excerpt,parent,date,featured_media';
      const response = await fetch(url, {signal:AbortSignal.timeout(12000)});
      if (!response.ok) continue;
      const items=await response.json();
      const match=items.find(item=>normalizePath(new URL(item.link).pathname)===key);
      if (!match) continue;
      const parsed=parseContent(match.content?.rendered);
      let cover=parsed.image;
      if (match.featured_media) {
        const mediaResponse=await fetch(api+'media/'+match.featured_media+'?_fields=source_url',{signal:AbortSignal.timeout(8000)});
        if (mediaResponse.ok) cover=(await mediaResponse.json()).source_url || cover;
      }
      const entry={id:match.id,kind:kind==='posts'?'post':kind==='curso'?'course':'page',
        title:textOf(match.title?.rendered),slug:match.slug,path:key,original:match.link,
        parent:match.parent||0,date:match.date||'',excerpt:textOf(match.excerpt?.rendered).slice(0,400),
        image:parsed.image,cover,blocks:parsed.blocks,links:parsed.links};
      dynamicPages.set(key,entry);
      return entry;
    } catch (error) { console.warn('Falha ao consultar página pública:',kind,slug,error); }
  }
  return null;
}
