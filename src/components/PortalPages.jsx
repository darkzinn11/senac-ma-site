import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowRight2 as ArrowUpRight, Book as BookOpen, Calendar as CalendarDays, ArrowRight2 as ChevronRight, ClipboardText as ClipboardList, DocumentText as FileText, Teacher as GraduationCap, Location as MapPin, SearchNormal1 as Search } from 'iconsax-react';
import { articles, catalog, getPage, isCatalog, isNews, isNotices, localHref, pages, unitPages } from '../data/portalRoutes';
import { asset, links } from '../data/content';
import { courseVisual } from '../data/courseVisuals';
import CourseCatalog from './CourseCatalog';
import CourseDetail from './CourseDetail';
import { ActionLink } from './Ui';
import './portalPages.css';

const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const prettyDate = value => value ? new Date(value).toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'}) : '';
const cleanTitle = text => String(text || '').replace(/\s+/g,' ').trim();
const AreaIcon = ({type}) => type === 'unidades' ? <MapPin /> : type === 'noticias' ? <BookOpen /> : <GraduationCap />;
const dest = (link) => localHref(link);
const safeImage = (image) => image?.startsWith('https://') ? image : null;

function Breadcrumb({ page }) {
  const ancestor = page.path.startsWith('/unidades/') ? {title:'Unidades',path:'/unidades/'}
    : page.path.startsWith('/institucional/') ? {title:'O Senac',path:'/institucional/'}
    : page.kind==='post' ? {title:'Notícias',path:'/noticias/'}
    : page.kind==='course' ? {title:'Cursos',path:'/cursos-senac/'} : null;
  return <nav className="inner-breadcrumb" aria-label="Você está aqui">
    <a href="/">Início</a><ChevronRight size={15}/>
    {ancestor && <><a href={ancestor.path}>{ancestor.title}</a><ChevronRight size={15}/></>}
    <span aria-current="page">{page.title}</span>
  </nav>;
}
function Intro({page,subtitle,eyebrow}) {
  return <header className="inner-page-heading">
    <Breadcrumb page={page}/>
    <h1>{page.title}</h1>
    <p>{subtitle || page.excerpt || 'Conheça informações, serviços e oportunidades do Senac Maranhão.'}</p>
  </header>;
}
function TextBlocks({blocks,limit}) {
  const section = (limit ? blocks.slice(0,limit) : blocks);
  return <div className="inner-prose">{section.map((block,i) => {
    const Tag = ['h2','h3','h4'].includes(block.type) ? block.type : block.type==='li'?'li':'p';
    return <Tag key={i}>{block.href ? <a href={dest(block.href)}>{block.text}</a> : block.text}</Tag>;
  })}</div>;
}

function LinkTile({item,detail=false}) {
  return <a className={'inner-tile'+(detail?' is-detail':'')} href={dest(item.path || item.href)}>
    <div className="inner-tile-art">
      {safeImage(item.cover) ? <img src={item.cover} alt="" loading="lazy" onError={e=>e.currentTarget.style.display='none'}/>
        : <AreaIcon type={item.kind==='post'?'noticias':item.path?.startsWith('/unidades/')?'unidades':'cursos'}/>}
    </div>
    <div className="inner-tile-text"><h3>{item.title || item.label}</h3>
      {item.excerpt && <p>{item.excerpt}</p>}
      <span>{detail ? 'Conhecer unidade' : 'Saiba mais'} <ArrowRight size={18}/></span>
    </div>
  </a>;
}
function ResourceLinks({items,title='Acessos e documentos'}) {
  const filtered=items.filter(item=>item.label && item.href && item.href!=='#');
  if (!filtered.length) return null;
  return <section className="inner-resources" aria-label={title}>
    <h2>{title}</h2><div className="inner-resource-list">
      {filtered.map((item,i)=><a key={i} href={dest(item.href)} className="inner-resource">
        <FileText size={21}/><span>{item.label}</span><ArrowUpRight size={19}/>
      </a>)}
    </div>
  </section>;
}
function UnitListing() {
  return <section className="inner-stack">
    <div className="inner-section-title"><div><h2>Encontre uma unidade</h2>
      <p>Escolha a unidade e confira estrutura, localização e informações de contato.</p></div></div>
    <div className="inner-tile-grid">{unitPages.map(item=><LinkTile item={item} detail key={item.id}/>)}</div>
  </section>;
}
function ContentPage({page}) {
  const child=pages.filter(p=>p.parent===page.id);
  const relatives=page.path.startsWith('/unidades/') && page.path!=='/unidades/'
    ? unitPages.filter(p=>p.id!==page.id).slice(0,3)
    : page.path.startsWith('/institucional/') ? pages.filter(p=>p.parent===114 && p.id!==page.id).slice(0,3) : [];
  const blocks=page.blocks.filter(b=>!b.href || !b.href.includes('/author/'));
  const actionLabel=page.path.includes('unidades/')?'Consultar cursos':page.path.includes('psg')?'Consultar editais':'Explorar cursos';
  const actionUrl=page.path.includes('unidades/')?links.courses:page.path.includes('psg')?links.notices:links.courses;
  return <>
    <Intro page={page}/>
    {page.path==='/unidades/' && <UnitListing/>}
    <div className="inner-layout">
      <article className="inner-content">
        {blocks.length ? <TextBlocks blocks={blocks}/> : <div className="inner-empty">
          <h2>Informações e atendimento</h2>
          <p>Novas informações desta área serão disponibilizadas aqui.</p>
        </div>}
        <ResourceLinks items={page.links} title={page.path.includes('psg')?'Editais e documentos':'Acessos e documentos'}/>
      </article>
      <aside className="inner-aside">
        <div className="inner-aside-card">
          <h2>Continue sua jornada</h2><p>Encontre outros serviços e conteúdos relacionados à sua busca.</p>
          <ActionLink href={dest(actionUrl)} arrow>{actionLabel}</ActionLink>
        </div>
        {child.length>0 && <div className="inner-aside-links"><h3>Nesta seção</h3>
          {child.map(c=><a href={c.path} key={c.id}>{c.title}<ChevronRight size={16}/></a>)}
        </div>}
      </aside>
    </div>
    {relatives.length>0 && <section className="inner-stack"><div className="inner-section-title"><h2>Explore também</h2></div>
      <div className="inner-tile-grid">{relatives.map(item=><LinkTile item={item} key={item.id}/>)}</div>
    </section>}
  </>;
}

function NewsListing() {
  const [search,setSearch]=useState('');
  const [limit,setLimit]=useState(12);
  const filtered=useMemo(()=>articles.filter(a=>fold(a.title+' '+a.excerpt).includes(fold(search))),[search]);
  return <section className="inner-stack">
    <div className="inner-section-title"><div>
      <h2>Últimas notícias</h2><p>Informações e acontecimentos do Senac Maranhão.</p></div>
      <label className="inner-search"><Search size={20}/><input type="search" value={search}
        onChange={e=>{setSearch(e.target.value);setLimit(12)}} placeholder="Buscar notícia" aria-label="Buscar notícia"/></label>
    </div>
    <div className="inner-news-grid">{filtered.slice(0,limit).map((a,i)=><a className="inner-news-card" href={a.path} key={a.id}>
      <div className="inner-news-photo">
        {safeImage(a.cover)?<img src={a.cover} alt="" loading="lazy" onError={e=>e.currentTarget.style.display='none'}/>:<BookOpen size={36}/>}
      </div><div className="inner-news-body"><span className="inner-news-date"><CalendarDays size={15}/>{prettyDate(a.date)}</span>
        <h3>{a.title}</h3>{a.excerpt&&<p>{a.excerpt}</p>}<span className="inner-news-link">Ler notícia <ArrowRight size={17}/></span></div>
    </a>)}</div>
    {!filtered.length && <p className="inner-no-results">Nenhuma notícia encontrada para esta busca.</p>}
    <div className="inner-list-actions">{filtered.length>limit && <button className="button" onClick={()=>setLimit(v=>v+12)}>Carregar mais notícias <ArrowRight size={18}/></button>}</div>
  </section>;
}
function ArticlePage({page}) {
  const related=articles.filter(a=>a.id!==page.id).slice(0,3);
  const articleImage=safeImage(page.image) || safeImage(page.cover);
  return <>
    <header className="inner-article-heading">
      <Breadcrumb page={page}/>
      <div className="inner-article-lead">
        <div className="inner-article-copy">
          <h1>{page.title}</h1>
          <p>{page.excerpt || prettyDate(page.date)}</p>
        </div>
        {articleImage && <figure className="inner-article-cover">
          <img src={articleImage} alt={page.title} loading="eager" decoding="async"
            onError={e=>{if(page.cover && e.currentTarget.src!==page.cover)e.currentTarget.src=page.cover;}}/>
        </figure>}
      </div>
    </header>
    <div className="inner-layout inner-article-layout"><article className="inner-content">
      <div className="inner-article-meta"><CalendarDays size={18}/>{prettyDate(page.date)}</div>
      <TextBlocks blocks={page.blocks}/>
      <div className="inner-article-end"><a href="/noticias/" className="button button-outline">Voltar para notícias</a></div>
    </article><aside className="inner-aside"><div className="inner-aside-card"><h2>Fique por dentro</h2>
      <p>Acompanhe as notícias, cursos e oportunidades do Senac Maranhão.</p>
      <ActionLink href="/noticias/" arrow>Ver outras notícias</ActionLink></div></aside></div>
    <section className="inner-stack"><div className="inner-section-title"><h2>Outras notícias</h2></div>
      <div className="inner-tile-grid">{related.map(item=><LinkTile item={item} key={item.id}/>)}</div></section>
  </>;
}

function CoursePage({page}) {
  const visual=courseVisual(page);
  return <>
    <header className="inner-article-heading inner-course-heading">
      <Breadcrumb page={page}/>
      <div className="inner-article-lead inner-course-lead">
        <div className="inner-article-copy inner-course-copy">
          <h1>{page.title}</h1>
          <p>Confira as informações da turma, carga horária, datas, unidade e condições de matrícula.</p>
        </div>
        <figure className="inner-article-cover inner-course-cover">
          <img src={visual.image} alt="" loading="eager" decoding="async"/>
        </figure>
      </div>
    </header>
    <CourseDetail page={page}/>
  </>;
}

function NoticesPage({page}) {
  const [query,setQuery]=useState('');
  const [limit,setLimit]=useState(18);
  const entries=page.blocks.filter(b=>b.type.startsWith('h')&&b.href && !b.href.includes('/author/'));
  const filtered=entries.filter(item=>fold(item.text).includes(fold(query)));
  return <section className="inner-stack">
    <div className="inner-section-title"><div><h2>Consulte os documentos</h2>
      <p>Consulte editais, documentos e comunicados disponíveis nesta página.</p></div>
      <label className="inner-search"><Search size={20}/><input type="search" aria-label="Buscar edital" value={query}
        onChange={e=>{setQuery(e.target.value);setLimit(18)}} placeholder="Buscar edital"/></label>
    </div>
    <div className="inner-resource-list">
      {filtered.slice(0,limit).map((b,i)=><a key={i} href={dest(b.href)} className="inner-resource">
        <ClipboardList size={23}/><span>{b.text}</span><ArrowUpRight size={20}/>
      </a>)}
    </div>
    {!filtered.length && <p className="inner-no-results">Nenhum documento encontrado nesta seleção.</p>}
    <div className="inner-list-actions">{filtered.length>limit&&<button className="button" onClick={()=>setLimit(v=>v+18)}>Carregar mais</button>}</div>
  </section>;
}
export default function PortalPages({page,path}) {
  if (!page) return <div className="container inner-not-found"><h1>Página não encontrada</h1>
    <p>Não foi possível localizar esta página nesta versão do portal.</p>
    <ActionLink href="/" arrow>Voltar para a Home</ActionLink>
  </div>;
  return <div className={'container inner-page'+(isCatalog(page.path)?' is-course-catalog':'')} key={page.path}>
    {page.kind==='post' ? <ArticlePage page={page}/> :
      page.kind==='course' ? <CoursePage page={page}/> :
      isNews(page.path) ? <><Intro page={page} eyebrow="Notícias" subtitle="Notícias e acontecimentos do Senac Maranhão."/><NewsListing/></> :
      isCatalog(page.path) ? <>
        <nav className="inner-catalog-breadcrumb" aria-label="Você está aqui">
          <a href="/">Início</a><ChevronRight size={16}/><span aria-current="page">Cursos</span>
        </nav>
        <CourseCatalog/>
      </> :
      isNotices(page.path) ? <><Intro page={page}/><NoticesPage page={page}/></> :
      <ContentPage page={page}/>}
  </div>;
}
