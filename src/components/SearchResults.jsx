import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowRight2, SearchNormal1, Book1, DocumentText, Calendar, Teacher } from 'iconsax-react';
import { routeHref } from '../data/basePath';
import { searchSite } from '../api/content';
import { courseVisual } from '../data/courseVisuals';
import './searchResults.css';

const PAGE_SIZE=9;
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const types=[{id:'all',label:'Todos'},{id:'course',label:'Cursos'},{id:'post',label:'Notícias'},{id:'page',label:'Páginas'}];
const snippet=value=>String(value||'').replace(/\s+/g,' ').trim().replace(/\s*\[…\]$/,'');
const hrefFor=item=>item.path||'/cursos-senac/';
const imageOk=src=>src&&(src.startsWith('https://')||(src.startsWith('/')&&!src.startsWith('//')))?src:null;
const sections={course:'Curso',post:'Notícia',page:'Página'};
function score(item,tokens,phrase) {
  const title=fold(item.title),details=fold([item.excerpt,item.localidade].filter(Boolean).join(' '));
  // O servidor já filtrou (também pelo corpo do texto); aqui só ordenamos por relevância do título.
  return 1+(title===phrase?500:0)+(title.includes(phrase)?220:0)
    +tokens.filter(token=>title.includes(token)).length*45+tokens.filter(token=>details.includes(token)).length*5;
}
function ResultCard({item}) {
  const kind=item.kind,visual=kind==='course'?courseVisual({id:item.id,title:item.title,image:item.image}):null;
  const cover=visual?.image||imageOk(item.cover);
  const description=kind==='course'
    ? [item.carga_horaria&&item.carga_horaria+' horas',snippet(item.excerpt).slice(0,110)].filter(Boolean).join(' · ')
    : snippet(item.excerpt);
  return <a className="site-result-card" href={hrefFor(item)} aria-label={'Abrir '+sections[kind]+': '+item.title}>
    <div className="site-result-art">
      {cover?<img src={cover} alt="" loading="lazy" decoding="async" onError={e=>{e.currentTarget.style.display='none';}}/>:
        kind==='course'?<Teacher size={38} variant="Bold" color="currentColor"/>:kind==='post'?<Book1 size={38} variant="Bold" color="currentColor"/>:<DocumentText size={38} variant="Bold" color="currentColor"/>}
    </div>
    <div className="site-result-body">
      <span className="site-result-type">{sections[kind]}</span>
      <h3>{item.title}</h3>
      {description&&<p>{description}</p>}
      <span className="site-result-link">{kind==='course'?'Conhecer curso':kind==='post'?'Ler notícia':'Acessar página'} <ArrowRight size={18} variant="Bold" color="currentColor"/></span>
    </div>
  </a>;
}

export default function SearchResults({query=''}) {
  const term=query.trim(),phrase=fold(term);
  const tokens=phrase.split(' ').filter(Boolean);
  const [input,setInput]=useState(term);
  const [kind,setKind]=useState('all');
  const [page,setPage]=useState(1);
  const [found,setFound]=useState({status:term?'loading':'idle',items:[],truncated:false});
  const results=useRef(null);
  useEffect(()=>{
    if(!term){setFound({status:'idle',items:[],truncated:false});return undefined;}
    let active=true;
    setFound(current=>({...current,status:'loading'}));
    searchSite(term).then(value=>{if(active)setFound({status:'ready',...value})})
      .catch(()=>{if(active)setFound({status:'error',items:[],truncated:false})});
    return ()=>{active=false;};
  },[term]);
  const matches=useMemo(()=>{
    if(!tokens.length)return [];
    return found.items.map(item=>({item,rank:score(item,tokens,phrase)}))
      .sort((a,b)=>b.rank-a.rank || a.item.title.localeCompare(b.item.title,'pt-BR'))
      .map(entry=>entry.item);
  },[phrase,found.items]);
  const counts=Object.fromEntries(types.map(type=>[type.id,type.id==='all'?matches.length:matches.filter(item=>item.kind===type.id).length]));
  const filtered=kind==='all'?matches:matches.filter(item=>item.kind===kind);
  const pagesCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const current=Math.min(page,pagesCount);
  const visible=filtered.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE);
  const changeKind=value=>{setKind(value);setPage(1)};
  const changePage=value=>{setPage(value);results.current?.scrollIntoView({behavior:'instant',block:'start'})};
  return <div className="container inner-page site-search-page">
    <nav className="inner-breadcrumb" aria-label="Você está aqui">
      <a href={routeHref('/')}>Início</a><ArrowRight2 size={15} variant="Bold" color="currentColor"/><span aria-current="page">Pesquisa</span>
    </nav>
    <header className="inner-page-heading">
      <h1>Pesquisa no site</h1><p>Encontre cursos, notícias e informações do Senac Maranhão</p>
    </header>
    <form className="site-search-page-form" role="search" action="/pesquisa/" method="get">
      <label htmlFor="search-page-input">O que você está procurando?</label>
      <div className="site-search-page-fields">
        <div className="site-search-page-input"><SearchNormal1 size={23} variant="Linear" color="currentColor" aria-hidden="true"/>
          <input id="search-page-input" type="search" name="s" value={input} onChange={e=>setInput(e.target.value)}
            placeholder="Busque por curso, notícia ou serviço" required autoComplete="off"/>
        </div><button type="submit" className="button"><SearchNormal1 className="site-search-icon" size={18} variant="Linear" color="currentColor" aria-hidden="true"/> Buscar</button>
      </div>
    </form>
    <section className="site-search-results" aria-labelledby="search-results-heading" ref={results}>
      <div className="site-search-results-heading">
        <h2 id="search-results-heading">{!term?'Faça sua pesquisa':found.status==='loading'?'Buscando…':found.status==='error'?'Pesquisa indisponível':matches.length+' '+(matches.length===1?'resultado encontrado':'resultados encontrados')}</h2>
        {term&&<p>Resultados para <strong>“{term}”</strong></p>}
      </div>
      {found.status==='error'&&<p role="alert" className="site-search-empty">Não foi possível realizar a pesquisa agora. Tente novamente em instantes.</p>}
      {!!term&&found.status!=='error'&&<>
        <div className="site-search-filters" aria-label="Filtrar resultados">
          {types.map(type=><button type="button" key={type.id} className={kind===type.id?'is-active':''}
            aria-pressed={kind===type.id} onClick={()=>changeKind(type.id)}>
              {type.label}<span>{counts[type.id]}</span></button>)}
        </div>
        {found.status==='loading'&&!visible.length?<p role="status" className="site-search-empty">Buscando no site…</p>:visible.length?<div className="site-search-grid">{visible.map((item,i)=><ResultCard item={item} key={item.kind+'-'+item.id+'-'+i}/>)}</div>
          :<div className="site-search-empty">
            <SearchNormal1 size={35} variant="Linear" color="currentColor"/><h3>Nenhum resultado encontrado</h3>
            <p>Tente outro termo ou escolha uma categoria diferente.</p>
            <a href={routeHref('/cursos-senac/')} className="button">Explorar cursos <ArrowRight size={18} variant="Bold" color="currentColor"/></a>
          </div>}
        {found.truncated&&<p className="site-search-note">Mostrando os primeiros resultados de cada categoria. Refine o termo para ver outros.</p>}
        {filtered.length>PAGE_SIZE&&<nav className="site-search-pagination" aria-label="Paginação da pesquisa">
          <button type="button" disabled={current===1} onClick={()=>changePage(current-1)}>Anterior</button>
          <span>Página {current} de {pagesCount}</span>
          <button type="button" disabled={current===pagesCount} onClick={()=>changePage(current+1)}>Próxima</button>
        </nav>}
      </>}
    </section>
  </div>;
}
