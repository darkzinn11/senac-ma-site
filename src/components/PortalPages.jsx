import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowRight2 as ArrowUpRight, Book as BookOpen, Calendar as CalendarDays, ArrowRight2 as ChevronRight, ClipboardText as ClipboardList, DocumentText as FileText, Teacher as GraduationCap, Location as MapPin, SearchNormal1 as Search } from 'iconsax-react';
import { isCatalog, isNews, isNotices, localHref } from '../data/portalRoutes';
import { asset, links } from '../data/content';
import { publicUrl, routeHref } from '../data/basePath';
import { courseVisual } from '../data/courseVisuals';
import { courseStatus } from '../data/courseApi';
import useAsync from '../api/useAsync';
import { listChildPages, listNews, listNotices, listResults, listUnits } from '../api/content';
import Html, { sanitizeHtml } from './Html';
import CourseCatalog from './CourseCatalog';
import CourseDetail from './CourseDetail';
import ServiceDetails, { servicePaths } from './ServiceDetails';
import { ActionLink } from './Ui';
import './portalPages.css';
import './articlePage.css';

const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const prettyDate = value => value ? new Date(value).toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'}) : '';
const cleanTitle = text => String(text || '').replace(/\s+/g,' ').trim();
const AreaIcon = ({type}) => type === 'unidades' ? <MapPin  variant="Bold" color="currentColor"/> : type === 'noticias' ? <BookOpen  variant="Bold" color="currentColor"/> : <GraduationCap  variant="Bold" color="currentColor"/>;
const dest = (link) => localHref(link);
const safeImage = (image) => image && (image.startsWith('https://') || (image.startsWith('/') && !image.startsWith('//'))) ? image : null;

function Breadcrumb({ page }) {
  const ancestor = page.path.startsWith('/unidades/') ? {title:'Unidades',path:'/unidades/'}
    : page.path.startsWith('/institucional/') ? {title:'O Senac',path:'/institucional/'}
    : page.kind==='post' ? {title:'Notícias',path:'/noticias/'}
    : page.kind==='course' ? {title:'Cursos',path:'/cursos-senac/'}
    : page.kind==='notice' ? {title:page.parent==='/resultados-psg/'?'Resultados PSG':page.parent==='/licitacoes-2016/'?'Licitações':'Editais PSG',path:page.parent} : null;
  return <nav className="inner-breadcrumb" aria-label="Você está aqui">
    <a href={routeHref('/')}>Início</a><ChevronRight size={15} variant="Bold" color="currentColor"/>
    {ancestor && <><a href={ancestor.path}>{ancestor.title}</a><ChevronRight size={15} variant="Bold" color="currentColor"/></>}
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
// Imagem de card: se o arquivo ainda não existe no servidor de mídia, cai no pictograma (sem imagem quebrada).
function TileImage({src,alt='',className,eager=false,fallback=null}) {
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[src]);
  if(failed||!safeImage(src))return fallback;
  return <img className={className} src={src} alt={alt} loading={eager?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>;
}
function LinkTile({item,detail=false}) {
  return <a className={'inner-tile'+(detail?' is-detail':'')} href={dest(item.path || item.href)}>
    <div className="inner-tile-art">
      <TileImage src={item.cover} fallback={<AreaIcon type={item.kind==='post'?'noticias':item.path?.startsWith('/unidades/')?'unidades':'cursos'}/>}/>
    </div>
    <div className="inner-tile-text"><h3>{item.title || item.label}</h3>
      {item.excerpt && <p>{item.excerpt}</p>}
      <span>{detail ? 'Conhecer unidade' : 'Saiba mais'} <ArrowRight size={18} variant="Bold" color="currentColor"/></span>
    </div>
  </a>;
}
function ResourceLinks({items,title='Acessos e documentos'}) {
  const filtered=items.filter(item=>item.label && item.href && item.href!=='#');
  if (!filtered.length) return null;
  return <section className="inner-resources" aria-label={title}>
    <h2>{title}</h2><div className="inner-resource-list">
      {filtered.map((item,i)=><a key={i} href={dest(item.href)} className="inner-resource">
        <FileText size={21} variant="Bold" color="currentColor"/><span>{item.label}</span><ArrowUpRight size={19} variant="Bold" color="currentColor"/>
      </a>)}
    </div>
  </section>;
}
function UnitListing() {
  const units=useAsync(listUnits,[]);
  return <section className="inner-stack">
    <div className="inner-section-title"><div><h2>Encontre uma unidade</h2>
      <p>Escolha a unidade e confira estrutura, localização e informações de contato.</p></div></div>
    {units.status==='loading'&&<p role="status" className="inner-no-results">Carregando unidades…</p>}
    {units.status==='error'&&<p role="alert" className="inner-no-results">Não foi possível carregar a lista de unidades agora.</p>}
    <div className="inner-tile-grid">{(units.data||[]).map(item=><LinkTile item={item} detail key={item.id}/>)}</div>
  </section>;
}
function ContentPage({page}) {
  const child=page.children||[];
  const isUnit=page.path.startsWith('/unidades/') && page.path!=='/unidades/';
  const isInstitutional=page.path.startsWith('/institucional/');
  // "Explore também": outras unidades ou páginas irmãs, vindas da API (sem bloquear a página).
  const related=useAsync(async()=>{
    if(isUnit)return (await listUnits()).filter(unit=>unit.path!==page.path).slice(0,3);
    if(isInstitutional)return (await listChildPages('/institucional/')).filter(item=>item.path!==page.path).slice(0,3);
    return [];
  },[page.path]);
  const relatives=related.data||[];
  const hasText=Boolean(page.html && page.html.replace(/<[^>]*>/g,'').trim());
  const hasImage=Boolean(page.html && /<img\s/i.test(page.html));
  const actionLabel=page.path.includes('unidades/')?'Consultar cursos':page.path.includes('psg')?'Consultar editais':'Explorar cursos';
  const actionUrl=page.path.includes('unidades/')?links.courses:page.path.includes('psg')?links.notices:links.courses;
  return <>
    <div className="inner-content-frame">
      <div className="inner-content-primary">
        <Intro page={page}/>
        {page.path==='/unidades/' && <UnitListing/>}
        <article className="inner-content">
        {hasText||hasImage ? <Html html={page.html}/> : <div className="inner-empty">
          <h2>Informações e atendimento</h2>
          <p>Novas informações desta área serão disponibilizadas aqui.</p>
        </div>}
        <ResourceLinks items={page.links||[]} title={page.path.includes('psg')?'Editais e documentos':'Acessos e documentos'}/>
        </article>
        {page.path==='/licitacoes-2016/' && <NoticesPage kind="licitacao" heading="Editais de licitação"/>}
      </div>
      <aside className="inner-aside">
        <div className="inner-aside-card">
          <h2>Continue sua jornada</h2><p>Encontre outros serviços e conteúdos relacionados à sua busca.</p>
          <ActionLink href={dest(actionUrl)} arrow>{actionLabel}</ActionLink>
        </div>
        {child.length>0 && <div className="inner-aside-links"><h3>Nesta seção</h3>
          {child.map(c=><a href={c.path} key={c.id}>{c.title}<ChevronRight size={16} variant="Bold" color="currentColor"/></a>)}
        </div>}
      </aside>
    </div>
    {relatives.length>0 && <section className="inner-stack"><div className="inner-section-title"><h2>Explore também</h2></div>
      <div className="inner-tile-grid">{relatives.map(item=><LinkTile item={item} key={item.id}/>)}</div>
    </section>}
  </>;
}

// Contatos: reproduz o conteúdo da página oficial (cada unidade com endereço, CEP, telefones e e-mail em linhas
// separadas). O HTML vem da API e é sanitizado de novo antes de ser exibido.
const escapeHtml=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
// A Ouvidoria já tem bloco próprio no fim da página: o link solto no texto de um cartão é removido.
function withoutOmbudsmanLink(html) {
  const doc=new DOMParser().parseFromString(html,'text/html');
  doc.body.querySelectorAll('a').forEach(link=>{ if(fold(link.textContent).includes('ouvidoria')) link.remove(); });
  return doc.body.innerHTML.replace(/(?:\s|&nbsp;)+(<\/p>)/g,'$1');
}
function contactGroups(page) {
  const doc=new DOMParser().parseFromString(sanitizeHtml(page.html||''),'text/html');
  const groups=[];
  doc.body.querySelectorAll('h3').forEach(heading=>{
    const title=(heading.textContent||'').replace(/\s+/g,' ').trim();
    let html='',node=heading.nextElementSibling;
    while(node&&node.tagName!=='H3') { if(node.tagName==='P') html+=node.outerHTML; node=node.nextElementSibling; }
    if(title) groups.push({title,html:withoutOmbudsmanLink(html)});
  });
  if(groups.length) return groups;
  // Sem HTML estruturado na origem: usa o texto já extraído da página.
  for (let i=0;i<page.blocks.length;i++) {
    const block=page.blocks[i];
    if (block.type==='h3') groups.push({title:block.text,html:page.blocks[i+1]?.type==='p'?'<p>'+escapeHtml(page.blocks[i+1].text)+'</p>':''});
  }
  return groups;
}

function ContactPage({page}) {
  const groups=useMemo(()=>contactGroups(page),[page]);
  const ombudsman=page.links.find(item=>fold(item.label).includes('ouvidoria'));
  return <>
    <Intro page={page} subtitle="Encontre os canais de atendimento, endereços e contatos das unidades do Senac Maranhão."/>
    <section className="inner-contact-section" aria-labelledby="contact-units-heading">
      <div className="inner-section-title"><div>
        <h2 id="contact-units-heading">Canais e unidades</h2>
        <p>Escolha a unidade ou setor que você precisa e consulte as informações de atendimento.</p>
      </div></div>
      <div className="inner-contact-grid">
        {groups.map(({title,html})=><article className="inner-contact-card" key={title}>
          <span className="inner-contact-icon"><MapPin size={26} variant="Bold" color="currentColor"/></span>
          <div className="inner-contact-card-copy"><h3>{title}</h3>
            {html&&<Html html={html} className="inner-contact-lines"/>}
          </div>
        </article>)}
      </div>
    </section>
    {ombudsman&&<section className="inner-contact-support">
      <div>
        <h2>Ouvidoria Senac</h2>
        <p>Use a Ouvidoria para registrar solicitações, sugestões, elogios, reclamações ou denúncias.</p>
      </div>
      <ActionLink href={ombudsman.href} arrow>Acessar ouvidoria</ActionLink>
    </section>}
  </>;
}

// Busca com atraso: evita uma requisição a cada tecla digitada.
function useDebounced(value,delay=300) {
  const [debounced,setDebounced]=useState(value);
  useEffect(()=>{const timer=setTimeout(()=>setDebounced(value),delay);return()=>clearTimeout(timer)},[value,delay]);
  return debounced;
}
// Listagem paginada no servidor: busca (q) + "carregar mais". Mantém o que já foi carregado ao pedir a próxima página.
function usePagedList(fetchPage,query,perPage) {
  const [state,setState]=useState({items:[],total:0,page:0,totalPages:1,status:'loading',more:false});
  const seq=useRef(0);
  const load=(page,reset)=>{
    const mine=++seq.current;
    setState(current=>({...(reset?{items:[],total:0,page:0,totalPages:1}:current),status:'loading',more:!reset}));
    fetchPage({page,perPage,q:query}).then(result=>{
      if(mine!==seq.current)return;
      setState(current=>({items:reset?result.items:[...current.items,...result.items],total:result.total,page:result.page,totalPages:result.totalPages,status:'ready',more:false}));
    }).catch(()=>{if(mine===seq.current)setState(current=>({...current,status:'error',more:false}))});
  };
  useEffect(()=>{load(1,true);},[query]);
  return {...state,loadMore:()=>load(state.page+1,false),retry:()=>state.page<1?load(1,true):load(state.page+1,false)};
}
function NewsCard({item}) {
  return <a className="inner-news-card" href={item.path}>
    <div className="inner-news-photo">
      <TileImage src={item.cover} fallback={<BookOpen size={36} variant="Bold" color="currentColor"/>}/>
    </div><div className="inner-news-body"><span className="inner-news-date"><CalendarDays size={15} variant="Bold" color="currentColor"/>{prettyDate(item.date)}</span>
      <h3>{item.title}</h3>{item.excerpt&&<p>{item.excerpt}</p>}<span className="inner-news-link">Ler notícia <ArrowRight size={17} variant="Bold" color="currentColor"/></span></div>
  </a>;
}
function NewsListing() {
  const [search,setSearch]=useState('');
  const query=useDebounced(search);
  const list=usePagedList(listNews,query,12);
  return <section className="inner-stack">
    <div className="inner-section-title"><div>
      <h2>Últimas notícias</h2><p>Informações e acontecimentos do Senac Maranhão.</p></div>
      <label className="inner-search"><Search size={20} variant="Linear" color="currentColor"/><input type="search" value={search}
        onChange={e=>setSearch(e.target.value)} placeholder="Buscar notícia" aria-label="Buscar notícia"/></label>
    </div>
    <div className="inner-news-grid">{list.items.map(a=><NewsCard item={a} key={a.id}/>)}</div>
    {list.status==='loading'&&<p role="status" className="inner-no-results">{list.items.length?'Carregando mais notícias…':'Carregando notícias…'}</p>}
    {list.status==='error'&&<p role="alert" className="inner-no-results">Não foi possível carregar as notícias agora. <button type="button" className="button button-outline" onClick={list.retry}>Tentar novamente</button></p>}
    {list.status==='ready'&&!list.items.length && <p className="inner-no-results">Nenhuma notícia encontrada para esta busca.</p>}
    <div className="inner-list-actions">{list.status==='ready'&&list.page<list.totalPages && <button className="button" onClick={list.loadMore}>Carregar mais notícias <ArrowRight size={18} variant="Bold" color="currentColor"/></button>}</div>
  </section>;
}
// Fotos seguidas no corpo (parágrafos só com imagem) viram uma galeria lado a lado.
const IMAGE_P=/<p>\s*(?:<a [^>]*>\s*)?<img [^>]*>\s*(?:<\/a>\s*)?<\/p>/;
const groupImages=html=>String(html||'').replace(new RegExp('(?:'+IMAGE_P.source+'\\s*){2,}','g'),
  run=>'<div class="article-gallery">'+run.match(new RegExp(IMAGE_P.source,'g')).join('')+'</div>');

function ArticlePage({page}) {
  const related=useAsync(async()=>(await listNews({perPage:5})).items.filter(a=>a.id!==page.id).slice(0,4),[page.id]);
  const articleImage=safeImage(page.image) || safeImage(page.cover);
  const [coverFailed,setCoverFailed]=useState(false);
  const body=useMemo(()=>groupImages(page.html),[page.html]);
  return <>
    <Breadcrumb page={page}/>
      <article className="article-page">
        <header className="article-heading">
          {page.date&&<ul className="article-meta"><li><CalendarDays size={16} variant="Bold" color="currentColor"/><time dateTime={page.date}>{prettyDate(page.date)}</time></li></ul>}
          <h1>{page.title}</h1>
          {articleImage && !coverFailed && <figure className="article-cover">
            <img src={articleImage} alt={page.coverAlt||''} loading="eager" decoding="async" onError={()=>setCoverFailed(true)}/>
          </figure>}
        </header>
        <div className="article-body"><Html html={body}/></div>
        <footer className="article-end">
          <a href={routeHref('/noticias/')} className="button button-soft"><ArrowLeft size={18} variant="Linear" color="currentColor"/>Voltar para notícias</a>
        </footer>
      </article>
    {(related.data||[]).length>0&&<section className="article-related" aria-labelledby="article-related-title">
      <div className="article-related-head"><h2 id="article-related-title">Outras notícias</h2>
        <a className="button" href={routeHref('/noticias/')}>Ver todas as notícias <ArrowRight size={18} variant="Linear" color="currentColor"/></a></div>
      <div className="inner-news-grid article-related-grid">{related.data.map(item=><NewsCard item={item} key={item.id}/>)}</div>
    </section>}
  </>;
}

function CoursePage({page}) {
  const visual=courseVisual({id:page.id,title:page.title,image:page.image});
  return <CourseDetail course={{...page,category:page.category||visual.area}} breadcrumb={<Breadcrumb page={page}/>} image={visual.image}/>;
}

// Lista de editais/resultados com busca e paginação no servidor.
function NoticesPage({kind='psg',heading='Consulte os documentos'}) {
  const [query,setQuery]=useState('');
  const term=useDebounced(query);
  const fetcher=React.useMemo(()=>kind==='results'?listResults:(params=>listNotices({...params,type:kind==='licitacao'?'licitacao':'psg'})),[kind]);
  const list=usePagedList(fetcher,term,18);
  return <section className="inner-stack">
    <div className="inner-section-title"><div><h2>{heading}</h2>
      <p>Consulte editais, documentos e comunicados disponíveis nesta página.</p></div>
      <label className="inner-search"><Search size={20} variant="Linear" color="currentColor"/><input type="search" aria-label="Buscar edital" value={query}
        onChange={e=>setQuery(e.target.value)} placeholder={kind==='results'?'Buscar resultado':'Buscar edital'}/></label>
    </div>
    <div className="inner-resource-list">
      {list.items.map(b=><a key={b.id} href={b.path} className="inner-resource">
        <ClipboardList size={23} variant="Bold" color="currentColor"/><span>{b.title}</span><ArrowUpRight size={20} variant="Bold" color="currentColor"/>
      </a>)}
    </div>
    {list.status==='loading'&&<p role="status" className="inner-no-results">{list.items.length?'Carregando mais…':'Carregando documentos…'}</p>}
    {list.status==='error'&&<p role="alert" className="inner-no-results">Não foi possível carregar a lista agora. <button type="button" className="button button-outline" onClick={list.retry}>Tentar novamente</button></p>}
    {list.status==='ready'&&!list.items.length && <p className="inner-no-results">Nenhum documento encontrado nesta seleção.</p>}
    <div className="inner-list-actions">{list.status==='ready'&&list.page<list.totalPages&&<button className="button" onClick={list.loadMore}>Carregar mais</button>}</div>
  </section>;
}

function NoticeDetailPage({page}) {
  const isResult=page.parent==='/resultados-psg/' || /^RESULTADO/i.test(page.title);
  const isPsg=page.parent!=='/licitacoes-2016/';
  const typeLabel=isResult?'Resultado PSG':/^COMUNICADO/i.test(page.title)?(isPsg?'Comunicado PSG':'Comunicado'):/^TERMO/i.test(page.title)?'Termo aditivo':isPsg?'Edital PSG':'Licitação';
  const documents=(page.links||[]).filter(item=>/\.(pdf|docx?|xlsx?|pptx?|odt|ods|csv)($|\?)/i.test(item.href)||/\/media\//i.test(item.href));
  const actions=(page.links||[]).filter(item=>!documents.some(doc=>doc.href===item.href));
  const paragraphs=(page.blocks||[]).filter(block=>block.type==='p'&&block.text.length>30&&
    !documents.some(doc=>fold(doc.label)===fold(block.text))&&!actions.some(action=>fold(action.label)===fold(block.text)));
  const primaryDoc=documents[0];
  return <>
    <header className="notice-detail-heading">
      <Breadcrumb page={page}/>
      <span className="notice-detail-type">{typeLabel}</span>
      <h1>{page.title}</h1>
      {page.excerpt&&<p>{page.excerpt}</p>}
    </header>
    <div className="notice-detail-layout">
      <article className="notice-detail-main">
        <section className="notice-detail-summary">
          <h2>Informações do {isResult?'resultado':'documento'}</h2>
          {paragraphs.length ? paragraphs.map((block,index)=><p key={index}>{block.text}</p>)
            : <p>Consulte abaixo os documentos e acessos relacionados a esta publicação{isPsg?' do Programa Senac de Gratuidade':''}.</p>}
        </section>
        {!!documents.length&&<section className="notice-detail-documents" aria-labelledby="notice-documents-title">
          <div className="notice-detail-section-heading"><div><h2 id="notice-documents-title">Documentos</h2>
            <p>Acesse os arquivos oficiais relacionados a esta publicação.</p></div></div>
          <div className="notice-document-grid">{documents.map((item,index)=><a href={item.href} className="notice-document-card" key={item.href}>
            <span className="notice-document-icon"><FileText size={25} variant="Bold" color="currentColor"/></span>
            <span className="notice-document-copy"><strong>{item.label||('Documento '+(index+1))}</strong><small>{/\.pdf($|\?)/i.test(item.href)?'Documento oficial em PDF':'Documento oficial'}</small></span>
            <span className="notice-document-action">Abrir documento <ArrowRight size={18} variant="Linear" color="currentColor"/></span>
          </a>)}</div>
        </section>}
      </article>
      <aside className="notice-detail-side">
        <h2>Acessos rápidos</h2>
        <p>Consulte o documento oficial{isPsg?' e acompanhe as etapas do Programa Senac de Gratuidade':''}.</p>
        {primaryDoc&&<ActionLink href={primaryDoc.href} arrow>Abrir documento</ActionLink>}
        {actions.map(action=><a className="notice-detail-secondary" href={action.href} key={action.href}>
          {action.label||'Acessar serviço'} <ArrowRight size={17} variant="Linear" color="currentColor"/>
        </a>)}
        <a className="notice-detail-back" href={page.parent}>{isResult?'Voltar para resultados':isPsg?'Voltar para editais':'Voltar para licitações'} <ArrowRight size={17} variant="Linear" color="currentColor"/></a>
      </aside>
    </div>
  </>;
}

export default function PortalPages({page,path}) {
  if (!page) return <div className="container inner-not-found"><h1>Página não encontrada</h1>
    <p>Não foi possível localizar esta página nesta versão do portal.</p>
      <ActionLink href={routeHref('/')} arrow>Voltar para a Home</ActionLink>
  </div>;
  return <div className={'container inner-page'+(isCatalog(page.path)?' is-course-catalog':'')} key={page.path}>
    {page.kind==='post' ? <ArticlePage page={page}/> :
      page.kind==='course' ? <CoursePage page={page}/> :
      page.kind==='notice' ? <NoticeDetailPage page={page}/> :
      isNews(page.path) ? <><Intro page={page} eyebrow="Notícias" subtitle="Notícias e acontecimentos do Senac Maranhão."/><NewsListing/></> :
      isCatalog(page.path) ? <>
        <nav className="inner-catalog-breadcrumb" aria-label="Você está aqui">
          <a href={routeHref('/')}>Início</a><ChevronRight size={16} variant="Bold" color="currentColor"/><span aria-current="page">Cursos</span>
        </nav>
        <CourseCatalog/>
      </> :
      page.path==='/fale-conosco/' ? <ContactPage page={page}/> :
      servicePaths.has(page.path) ? <ServiceDetails page={page}/> :
      isNotices(page.path) ? <><Intro page={page}/><NoticesPage kind={page.path==='/resultados-psg/'?'results':'psg'}/></> :
      <ContentPage page={page}/>}
  </div>;
}
