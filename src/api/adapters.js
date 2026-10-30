// Adaptadores: transformam o formato da API pública no formato que os componentes já esperam
// (o mesmo dos antigos snapshots: kind, title, path, excerpt, date, cover, links, blocks...).
import { mediaUrl } from './client';
import { courseStatus } from '../data/courseApi';
import { normalizePath } from '../data/portalRoutes';

export const textOf = (html) => {
  if (!html) return '';
  if (typeof document === 'undefined') return String(html).replace(/<[^>]+>/g, ' ');
  return (new DOMParser().parseFromString(String(html), 'text/html').body.textContent || '').replace(/\s+/g, ' ').trim();
};
export const brief = (text, limit = 55) => {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  return words.length > limit ? words.slice(0, limit).join(' ') + ' […]' : words.join(' ');
};
export const brDate = (iso) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null;
};
const paragraphs = (text) => String(text || '').split(/\n{2,}|\n/).map(part => part.trim()).filter(Boolean);

export const courseTypeLabels = {
  livre: 'Curso livre', tecnico: 'Curso técnico', graduacao: 'Graduação', pos_graduacao: 'Pós-graduação',
  aprendizagem: 'Aprendizagem', idiomas: 'Idiomas', outros: 'Outros',
};
export const modalityLabels = { presencial: 'Presencial', ead: 'EAD', semipresencial: 'Semipresencial' };

export function adaptNewsItem(item) {
  const cover = mediaUrl(item.cover_image_url);
  return {
    id: item.id, kind: 'post', title: item.title, slug: item.slug, path: item.path,
    date: item.published_at, excerpt: item.subtitle || '', cover, image: cover,
    category: item.category_name || '', categorySlug: item.category_slug || '',
  };
}
export function adaptNews(data) {
  return {
    ...adaptNewsItem(data), html: data.content_html || '', blocks: [], links: [], parent: '/noticias/',
    seoTitle: data.seo_title || '', seoDescription: data.seo_description || '', coverAlt: data.cover_image_alt || '',
    tags: data.tags || [],
  };
}
export function adaptPage(data, unit = null) {
  const cover = mediaUrl(unit?.image_url || data.cover_image_url);
  return {
    id: data.id, kind: 'page', title: data.title, slug: data.slug, path: data.path, parent: data.parent_path || null,
    excerpt: unit ? brief(unit.description) : '', html: data.content_html || '', ...htmlToBlocks(data.path === '/fale-conosco/' ? data.content_html : ''),
    children: (data.children || []).map(child => ({ id: child.path, title: child.title, path: child.path })),
    cover, image: cover, unit,
    seoTitle: data.seo_title || '', seoDescription: data.seo_description || '',
  };
}
export function adaptUnit(unit) {
  const cover = mediaUrl(unit.image_url);
  return {
    id: unit.id, kind: 'page', title: unit.name, path: `/unidades/${unit.slug}/`, slug: unit.slug, city: unit.city || '',
    excerpt: brief(unit.description), cover, image: cover, name: unit.name,
    address: unit.address || '', zip: unit.zip_code || '', phone: unit.phone || '', otherPhones: unit.other_phones || '',
    whatsapp: unit.whatsapp || '', email: unit.email || '', hours: unit.opening_hours || '', order: unit.sort_order ?? 0,
  };
}
export function adaptOffer(offer) {
  return {
    id: offer.id, courseSlug: offer.course_slug, courseName: offer.course_name,
    localidade: offer.unit_city || '', unidade: offer.unit_name || '', unitSlug: offer.unit_slug || '',
    inicio: brDate(offer.start_date), fim: brDate(offer.end_date), preco: offer.price,
    total_de_vagas: offer.seats, horarios: offer.schedule || '', link_para_matricula: offer.enrollment_url || '',
    apiStatus: offer.status,
  };
}
// Turma com matrícula online aberta: decisão do SIG (status 'open' + link), independente de a turma já ter começado.
export const canEnroll = offer => offer.apiStatus === 'open' && Boolean(offer.link_para_matricula);
export const offerSituation = offer => (canEnroll(offer) ? 'Matrículas abertas' : courseStatus(offer));
// Cor da etiqueta de situação (uma regra só, usada no catálogo, na página do curso e na lista de turmas):
// matrículas abertas = verde, em andamento = amarelo, a confirmar = vermelho, encerrada = cinza; as demais seguem o estilo padrão.
export const situationClass = situation => ({ 'Matrículas abertas':'is-open', 'Em andamento':'is-ongoing', 'A confirmar':'is-tbd', 'Encerrada':'is-past' }[situation] || '');
// Situação do curso a partir das turmas que a API expõe (só abertas/programadas; as encerradas não são públicas).
export function courseSituation(offers) {
  const states = (offers || []).map(offerSituation);
  if (states.includes('Matrículas abertas')) return 'Matrículas abertas';
  if (states.includes('Programada')) return 'Programada';
  if (states.includes('Em andamento')) return 'Em andamento';
  if (states.length && states.every(state => state === 'Encerrada')) return 'Encerrada';
  return 'A confirmar';
}
// A API devolve o texto 'None' em campos opcionais vazios do SIG.
const filled = value => (value && String(value).trim() !== 'None' ? String(value).trim() : '');
export function adaptCourse(data) {
  const offers = (data.offers || []).map(adaptOffer);
  return {
    id: data.id, kind: 'course', title: data.name, slug: data.slug, path: data.path,
    excerpt: data.short_description || '', html: data.about_html || '', blocks: [], links: [], parent: '/cursos-senac/',
    category: data.category_name || '', categorySlug: data.category_slug || '',
    workload: data.workload_hours, modality: modalityLabels[data.modality] || data.modality || '',
    courseType: courseTypeLabels[data.course_type] || '',
    audience: filled(data.target_audience), prerequisites: filled(data.prerequisites), certification: filled(data.certification),
    offers, situation: courseSituation(offers), cover: mediaUrl(data.image_url), image: mediaUrl(data.image_url),
    seoTitle: '', seoDescription: data.short_description || '',
  };
}
const noticeParent = (type) => type === 'psg' ? '/editais-psg/' : '/licitacoes-2016/';
export function adaptNotice(data) {
  const documents = (data.documents || []).map(doc => ({
    label: doc.name || doc.file_name, href: mediaUrl(doc.url), mime: doc.mime_type || '', type: doc.type || '',
  }));
  return {
    id: data.id, kind: 'notice', title: data.title, slug: data.slug, path: data.path, parent: noticeParent(data.notice_type),
    noticeType: data.notice_type, excerpt: data.description || '', date: data.published_at,
    blocks: paragraphs(data.description).map(text => ({ type: 'p', text })), links: documents,
    seoTitle: '', seoDescription: brief(data.description, 30),
  };
}
export function adaptResult(data) {
  const links = [];
  if (data.file_url) links.push({ label: data.file_name || data.title, href: mediaUrl(data.file_url), mime: data.mime_type || '' });
  if (data.notice_slug) links.push({ label: data.notice_title ? 'Ver ' + data.notice_title : 'Ver edital', href: `/editais_psg/${data.notice_slug}/` });
  const summary = [data.notice_title, data.result_date && 'Resultado de ' + brDate(data.result_date)].filter(Boolean).join(' · ');
  return {
    id: data.id, kind: 'notice', title: data.title, slug: data.slug, path: data.path, parent: '/resultados-psg/',
    noticeType: 'result', excerpt: summary, date: data.result_date,
    blocks: summary ? [{ type: 'p', text: summary }] : [], links, seoTitle: '', seoDescription: summary,
  };
}
// Resposta de /v1/public/content -> objeto de página (ou redirecionamento/removido).
export function adaptContent(content) {
  switch (content.type) {
    case 'redirect': return { type: 'redirect', to: content.redirect?.to_path || null, status: content.redirect?.status || 301 };
    case 'gone': return { type: 'gone' };
    case 'news': return { type: 'page', page: adaptNews(content.data) };
    case 'page': return { type: 'page', page: adaptPage(content.data) };
    case 'course': return { type: 'page', page: adaptCourse(content.data) };
    case 'notice': return { type: 'page', page: adaptNotice(content.data) };
    case 'result': return { type: 'page', page: adaptResult(content.data) };
    default: return { type: 'notfound' };
  }
}

// Extrai blocos (h2-h4, p, li) e links de um trecho de HTML; usado nas páginas que dependem da estrutura
// do texto (Fale conosco). Quebras de linha (<br>) viram espaço, como nos antigos snapshots.
export function htmlToBlocks(html) {
  if (!html || typeof document === 'undefined') return { blocks: [], links: [] };
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  const blocks = [];
  doc.body.querySelectorAll('h2,h3,h4,p,li').forEach(element => {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    const text = clone.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    blocks.push({ type: element.tagName.toLowerCase(), text, href: element.querySelector('a[href]')?.getAttribute('href') || null });
  });
  const links = [...doc.body.querySelectorAll('a[href]')].map(anchor => ({
    label: anchor.textContent.replace(/\s+/g, ' ').trim(), href: anchor.getAttribute('href'),
  })).filter(link => link.label);
  return { blocks, links };
}
