import React, { useMemo, useState } from 'react';
import { ArrowRight, Calendar as CalendarDays, CalendarTick, Clock as Clock3, Location as MapPin, People as Users, Teacher, Category, Award, InfoCircle } from 'iconsax-react';
import { brl, dateISO } from '../data/courseApi';
import { routeHref } from '../data/basePath';
import { courseVisual } from '../data/courseVisuals';
import { canEnroll, offerSituation, situationClass, textOf } from '../api/adapters';
import { searchCourses } from '../api/courses';
import useAsync from '../api/useAsync';
import { Icon, noFinalPeriod } from './Ui';
import './courseDetail.css';

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dayMonth = br => {
  const iso = dateISO(br);
  return iso ? { day: iso.slice(8, 10), month: MONTHS[Number(iso.slice(5, 7)) - 1] } : null;
};
const INITIAL_OFFERS = 4;
const RELATED_LIMIT = 4;

// O conteúdo do SIG abre com uma frase padrão e termina com o eixo tecnológico (um metadado). A frase sai do texto,
// o eixo não é exibido e o topo recebe só a primeira frase útil, como chamada.
// Aceita as variações do SIG: "objetivo (s)", "a(s)" ou "a (s)", com ou sem dois-pontos.
const BOILERPLATE = /Este curso tem como objetivo\s*\(\s*s\s*\)\s*desenvolver\s+a\s*\(\s*s\s*\)\s*seguinte\s*\(\s*s\s*\)\s*compet[eê]ncia\s*\(\s*s\s*\)\s*:?\s*/gi;
const stripBoilerplate = html => html.replace(BOILERPLATE, '').replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
const AXIS_P = /<p[^>]*>(?:\s|<[^>]+>)*Eixo tecnológico:?[\s\S]*?<\/p>/i;
const words = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]{3,}/g) || [];
// Frase que só repete o título ("Realizar design e coloração de sobrancelhas") não serve de chamada.
const echoesTitle = (text, title) => {
  const own = new Set(words(text)), base = words(title);
  return base.length > 0 && base.filter(word => own.has(word)).length / base.length >= .6 && own.size <= base.length + 3;
};
// A seção já tem título próprio: o "Objetivo" que abre o conteúdo do SIG sai.
const LEADING_OBJECTIVE = /^\s*<h[2-4][^>]*>\s*Objetivos?\s*:?\s*<\/h[2-4]>/i;
const competency = text => {
  const clean = textOf(text).replace(/\s+/g, ' ').trim().replace(/[;.,]+$/, '');
  return clean ? clean[0].toUpperCase() + clean.slice(1) : '';
};
// Depois da frase padrão vêm as competências: uma lista (ol/ul) ou parágrafos curtos. Elas saem do bloco da frase
// padrão e servem de chamada quando o texto não tem parágrafo próprio.
function extractCompetencies(source) {
  BOILERPLATE.lastIndex = 0;
  const match = BOILERPLATE.exec(source);
  if (!match) return { source, items: [] };
  const start = source.lastIndexOf('<p', match.index);
  const closing = source.indexOf('</p>', match.index);
  if (start < 0 || closing < 0) return { source, items: [] };
  const items = [competency(source.slice(match.index + match[0].length, closing))].filter(Boolean);
  let rest = source.slice(closing + 4);
  for (;;) {
    const list = /^\s*<(ol|ul)[^>]*>([\s\S]*?)<\/\1>/i.exec(rest);
    const para = /^\s*<p[^>]*>([\s\S]*?)<\/p>/i.exec(rest);
    if (list) items.push(...[...list[2].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(li => competency(li[1])).filter(Boolean));
    else if (para && textOf(para[1]).trim().length <= 140 && !/^(É|E) destinad|^Este curso|^Esta ação|^Público/i.test(textOf(para[1]).trim())) {
      const item = competency(para[1]);
      if (item) items.push(item);
    } else break;
    rest = rest.slice((list || para)[0].length);
  }
  return { source: source.slice(0, start) + rest, items };
}
function prepareContent(html, title) {
  const extracted = extractCompetencies((html || '').replace(AXIS_P, '').replace(LEADING_OBJECTIVE, ''));
  let body = stripBoilerplate(extracted.source).trim();
  const paragraphs = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(match => ({ html: match[0], text: textOf(match[1]).trim() }))
    .filter(item => item.text);
  // Rótulos ("Objetivo geral:") e frases muito curtas não funcionam como chamada.
  const leadParagraph = paragraphs.find(({ text }) => text.length >= 40 && !/:$/.test(text) && !echoesTitle(text, title));
  const lead = leadParagraph ? firstSentence(leadParagraph.text) : '';
  // Se a chamada do banner já mostra o parágrafo inteiro, ele sai do corpo do texto.
  if (leadParagraph && lead.replace(/[.…]$/, '') === leadParagraph.text.replace(/\s+/g, ' ').replace(/[.]$/, '')) body = body.replace(leadParagraph.html, '').trim();
  return { body, lead, competencies: extracted.items };
}
function firstSentence(text, limit = 240) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const sentence = (/^(.+?[.!?])(\s|$)/.exec(clean) || [, clean])[1];
  if (sentence.length <= limit) return /[.!?]$/.test(sentence) ? sentence : sentence + '.';
  return sentence.slice(0, sentence.lastIndexOf(' ', limit)).replace(/[,;:]$/, '') + '…';
}

function Fact({ icon: FactIcon, label, value }) {
  if (!value) return null;
  return <li className="course-page-fact"><FactIcon size={22} variant="Bulk" color="currentColor" aria-hidden="true" />
    <span><small>{label}</small><strong>{value}</strong></span></li>;
}

function OfferCard({ offer, status }) {
  const start = dayMonth(offer.inicio);
  const open = canEnroll(offer);
  const price = brl(offer.preco);
  return <li className={'course-offer' + (open ? '' : ' is-muted')}>
    <div className="course-offer-date" aria-hidden="true">
      {start ? <><strong>{start.day}</strong><span>{start.month}</span></> : <span>A confirmar</span>}
    </div>
    <div className="course-offer-main">
      <span className={'course-offer-status ' + situationClass(status)}>{status}</span>
      <h3>{offer.unidade || 'Unidade a confirmar'}</h3>
      <ul className="course-offer-meta">
        {offer.localidade && <li><MapPin size={16} variant="Bold" color="currentColor" aria-hidden="true" />{offer.localidade}</li>}
        <li><CalendarDays size={16} variant="Bold" color="currentColor" aria-hidden="true" />
          {offer.inicio || 'Início a confirmar'}{offer.fim ? ' a ' + offer.fim : ''}</li>
        {offer.horarios && <li><Clock3 size={16} variant="Bold" color="currentColor" aria-hidden="true" />{offer.horarios}</li>}
        {offer.total_de_vagas ? <li><Users size={16} variant="Bold" color="currentColor" aria-hidden="true" />{offer.total_de_vagas} vagas</li> : null}
      </ul>
    </div>
    <div className="course-offer-action">
      <p className="course-offer-price">{price ? <><small>Valor</small>{price}</> : <small>Valor a confirmar</small>}</p>
      {open
        ? <a className="button" href={offer.link_para_matricula} target="_blank" rel="noopener noreferrer">
          Matricular-se<ArrowRight size={18} color="currentColor" aria-hidden="true" />
          <span className="sr-only"> na turma de {offer.inicio} em {offer.unidade || offer.localidade} (abre o sistema de matrícula em nova aba)</span>
        </a>
        : <span className="course-offer-soon">Inscrições em breve</span>}
    </div>
  </li>;
}

// Outros cursos da mesma área: evita que a página termine sem caminho quando a turma não serve.
function RelatedCourses({ course }) {
  const related = useAsync(async () => {
    if (!course.categorySlug) return [];
    const list = await searchCourses({ category: course.categorySlug });
    const rank = item => (item.situation === 'Matrículas abertas' ? 0 : item.offers.length ? 1 : 2);
    return list.filter(item => item.slug !== course.slug)
      .sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title, 'pt-BR')).slice(0, RELATED_LIMIT);
  }, [course.slug, course.categorySlug]);
  if (related.status !== 'ready' || !related.data.length) return null;
  return <section className="course-related" aria-labelledby="course-related-title">
    <div className="course-related-head">
      <h2 id="course-related-title">Outros cursos de {course.category}</h2>
      <a className="button" href={routeHref('/cursos-senac/')}>Ver todos os cursos<ArrowRight size={18} color="currentColor" aria-hidden="true" /></a>
    </div>
    <div className="course-related-grid">{related.data.map(item => {
      const visual = courseVisual(item);
      return <a href={item.path} className="course-card inner-course-card" key={item.id} aria-label={'Conhecer curso ' + item.title}>
        <div className="inner-course-photo"><img className="course-photo" src={visual.image} alt="" loading="lazy" decoding="async" /></div>
        <div className="course-body">
          <span className="course-badge">{item.area || visual.area}</span>
          <h3>{visual.name}</h3>
          <div className="inner-course-facts">
            {item.carga_horaria && <span><Clock3 size={16} variant="Bold" color="currentColor" />{item.carga_horaria} horas</span>}
            {item.inicio && <span><CalendarDays size={16} variant="Bold" color="currentColor" />{item.inicio}</span>}
          </div>
          <span className={'inner-course-status ' + situationClass(item.situation)}>{item.situation}</span>
          <span className="button course-button">Saiba mais <Icon name="arrow" /></span>
        </div>
      </a>;
    })}</div>
  </section>;
}

// Página do curso (API: /v1/public/courses/{slug}): banner com dados-chave, conteúdo, turmas filtráveis
// e outros cursos da área.
export default function CourseDetail({ course, breadcrumb, image }) {
  const offers = useMemo(() => (course.offers || [])
    .map(offer => ({ offer, status: offerSituation(offer), start: dateISO(offer.inicio) || '9999', price: Number(offer.preco) }))
    .sort((a, b) => Number(canEnroll(b.offer)) - Number(canEnroll(a.offer)) || a.start.localeCompare(b.start)
      || (Number.isFinite(a.price) ? a.price : Infinity) - (Number.isFinite(b.price) ? b.price : Infinity)), [course.offers]);
  const cities = useMemo(() => [...new Set(offers.map(item => item.offer.localidade).filter(Boolean))], [offers]);
  const content = useMemo(() => prepareContent(course.html, course.title), [course.html, course.title]);
  const [city, setCity] = useState('');
  const [showAll, setShowAll] = useState(false);
  const filtered = city ? offers.filter(item => item.offer.localidade === city) : offers;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_OFFERS);
  const openOffers = offers.filter(item => canEnroll(item.offer));
  // Descrição do banner: o parágrafo do conteúdo; sem ele, as competências; por último, o resumo da API.
  const competencyText = content.competencies.map((item, i) => (i ? item[0].toLowerCase() + item.slice(1) : item)).join('; ');
  const lead = content.lead || (competencyText ? competencyText + '.' : firstSentence(textOf(course.excerpt || '').replace(BOILERPLATE, '').trim()));
  const status = course.situation;
  const extras = [['Público-alvo', course.audience, Users], ['Pré-requisitos', course.prerequisites, InfoCircle],
    ['Certificação', course.certification, Award]].filter(([, value]) => value);
  const interestHref = routeHref('/cadastro-de-interesse/');

  return <div className="course-page">
    <header className="course-page-hero">
      {breadcrumb}
      <div className="course-page-banner is-split">
        {image && <img className="course-page-banner-image" src={image} alt="" loading="eager" decoding="async" />}
        <div className="course-page-hero-copy">
          <div className="course-page-tags">
            {course.category && <span className="course-badge">{course.category}</span>}
            {status && <span className={'course-page-status ' + situationClass(status)}>{status}</span>}
          </div>
          <h1 className={course.title.length > 60 ? 'is-long' : undefined}>{course.title}</h1>
          {lead && <p className="course-page-lead">{noFinalPeriod(lead)}</p>}
          <ul className="course-page-facts" aria-label="Informações do curso">
            <Fact icon={Clock3} label="Carga horária" value={course.workload ? course.workload + ' horas' : null} />
            <Fact icon={Teacher} label="Modalidade" value={course.modality} />
            <Fact icon={Category} label="Tipo" value={course.courseType} />
            <Fact icon={CalendarTick} label="Turmas abertas" value={openOffers.length ? String(openOffers.length) : null} />
          </ul>
        </div>
      </div>
    </header>

    <div className="course-page-body">
      <div className="course-page-main">
        {extras.length > 0 && <section className="course-page-section" aria-label="Mais informações do curso">
          <dl className="course-page-extras">{extras.map(([label, value, ExtraIcon]) => <div key={label}>
            <dt><ExtraIcon size={20} variant="Bulk" color="currentColor" aria-hidden="true" />{label}</dt><dd>{value}</dd>
          </div>)}</dl>
        </section>}

        <section className="course-page-section course-offers" id="turmas" aria-labelledby="course-offers-title">
          <div className="course-offers-head">
            <div>
              <h2 id="course-offers-title">Turmas disponíveis</h2>
              <p>{offers.length
                ? `${offers.length} ${offers.length === 1 ? 'turma' : 'turmas'}${openOffers.length ? `, ${openOffers.length} com matrícula aberta` : ''}. Escolha a unidade e a data que funcionam para você.`
                : 'No momento não há turmas abertas ou programadas para este curso.'}</p>
            </div>
            {cities.length > 1 && <div className="course-offers-filter" role="group" aria-label="Filtrar turmas por cidade">
              {['', ...cities].map(name => <button type="button" key={name || 'all'} aria-pressed={city === name}
                className={city === name ? 'is-active' : ''} onClick={() => { setCity(name); setShowAll(false); }}>{name || 'Todas as cidades'}</button>)}
            </div>}
          </div>
          {offers.length
            ? <>
              <ul className="course-offer-list" aria-live="polite">{visible.map(item => <OfferCard key={item.offer.id} {...item} />)}</ul>
              {filtered.length > INITIAL_OFFERS && <button type="button" className="button button-soft course-offers-more" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Mostrar menos turmas' : `Ver mais ${filtered.length - INITIAL_OFFERS} ${filtered.length - INITIAL_OFFERS === 1 ? 'turma' : 'turmas'}`}</button>}
            </>
            : <div className="course-offers-empty">
              <p>Cadastre seu interesse para ser avisado quando novas turmas forem abertas.</p>
              <a className="button" href={interestHref}>Cadastrar interesse<ArrowRight size={18} color="currentColor" aria-hidden="true" /></a>
            </div>}
        </section>
      </div>

    </div>

    <RelatedCourses course={course} />
  </div>;
}
