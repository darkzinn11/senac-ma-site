import { getJSON, mediaUrl, query } from './client';
import { adaptOffer, courseSituation } from './adapters';
import { courseVisual } from '../data/courseVisuals';
import { sentenceCase } from '../utils/sentenceCase';

const MAX_PAGES = 6;

// Percorre todas as páginas de uma listagem (per_page=100). O catálogo tem ~170 cursos: 2 requisições.
async function listAll(path, params) {
  const items = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await getJSON(path + query({ ...params, page, per_page: 100 }));
    items.push(...(response.data || []));
    if (page >= (response.meta?.total_pages || 1)) break;
  }
  return items;
}

// Turmas públicas (a API só expõe as abertas/programadas) agrupadas por curso.
export async function loadOffers() {
  const offers = (await listAll('/v1/public/course-offers', {})).map(adaptOffer);
  const bySlug = new Map();
  offers.forEach(offer => bySlug.set(offer.courseSlug, [...(bySlug.get(offer.courseSlug) || []), offer]));
  return { offers, bySlug };
}
export const loadCategories = async () =>
  ((await getJSON('/v1/public/course-categories')).data || []).map(item => ({ id: item.slug, name: item.name }));

// Tipo de curso da home -> filtros do servidor.
const typeFilters = {
  'Curso livre': { type: 'livre' }, 'Curso técnico': { type: 'tecnico' }, Aprendizagem: { type: 'aprendizagem' }, EAD: { modality: 'ead' },
};
const firstDate = (offers) => offers.map(offer => offer.inicio).find(Boolean) || null;

function adaptCatalogItem(item, offers) {
  const cities = [...new Set(offers.map(offer => offer.localidade).filter(Boolean))];
  return {
    id: item.id, slug: item.slug, title: sentenceCase(item.name), path: item.path,
    segmento: item.category_slug || '', area: item.category_name || '',
    carga_horaria: item.workload_hours, localidade: cities.join(', '), cities,
    units: [...new Set(offers.map(offer => offer.unidade).filter(Boolean))],
    inicio: firstDate(offers), situation: courseSituation(offers), offers, image: mediaUrl(item.image_url),
    modality: item.modality, courseType: item.course_type, description: item.short_description || '',
  };
}
// Consulta no servidor (nome, área, tipo/modalidade); cidade, unidade e situação vêm do cruzamento com as turmas.
export async function searchCourses({ q = '', category = '', type = '' } = {}) {
  const [items, { bySlug }] = await Promise.all([
    listAll('/v1/public/courses', { q, category, ...(typeFilters[type] || {}) }),
    loadOffers().catch(() => ({ bySlug: new Map() })),
  ]);
  return items.map(item => adaptCatalogItem(item, bySlug.get(item.slug) || []));
}
// Destaques da home: a API não tem marcação de destaque; priorizamos cursos com turma e carga horária.
export async function loadFeaturedCourses(limit = 7) {
  const all = await searchCourses({});
  const ranked = [...all].sort((a, b) => (b.offers.length - a.offers.length) || a.title.localeCompare(b.title, 'pt-BR'));
  return ranked.filter(course => course.carga_horaria).slice(0, limit);
}
// Formato do carrossel da home (Courses.jsx).
export function toPreview(course) {
  const visual = courseVisual({ id: course.id, title: course.title, localidade: course.localidade, image: course.image });
  return {
    id: course.id, title: course.title, area: course.area || visual.area, hours: course.carga_horaria,
    imageUrl: visual.image, path: course.path, city: course.cities?.[0] || null, units: course.units || [],
    cities: course.cities || [],
  };
}
