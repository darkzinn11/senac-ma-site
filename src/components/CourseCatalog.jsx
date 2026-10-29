import React, {useEffect,useMemo,useRef,useState} from 'react';
import { ArrowRight, ArrowLeft2 as ChevronLeft, ArrowRight2 as ChevronRight, Element4 as LayoutGrid, TextalignLeft as ListIcon, Calendar as CalendarDays, Clock as Clock3, Location as MapPin, SearchNormal1 as Search } from 'iconsax-react';
import { courseVisual } from '../data/courseVisuals';
import { loadCategories, loadOffers, searchCourses } from '../api/courses';
import { useSiteData } from '../api/SiteData';
import { situationClass } from '../api/adapters';
import { Icon } from './Ui';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
// A API só expõe turmas abertas ou programadas; turmas encerradas não são públicas.
const SITUATIONS=['Matrículas abertas','Programada','Em andamento','A confirmar'];
// Telas largas (1600px+) mostram 4 cursos por linha; a página tem 2 linhas completas em qualquer largura.
const WIDE_GRID='(min-width:1600px)';
function usePageSize() {
  const query=typeof window==='undefined'?null:window.matchMedia(WIDE_GRID);
  const [wide,setWide]=useState(()=>Boolean(query?.matches));
  useEffect(()=>{
    if(!query)return undefined;
    const update=()=>setWide(query.matches);
    query.addEventListener('change',update);
    return ()=>query.removeEventListener('change',update);
  },[]);
  return wide?8:6;
}
function paginationNumbers(current,total) {
  if (total<=7) return Array.from({length:total},(_,i)=>i+1);
  const start=Math.max(2,Math.min(current-1,total-3));
  const end=Math.min(total-1,start+2);
  const pages=[1];
  if(start>2)pages.push('start-ellipsis');
  for(let n=start;n<=end;n++)pages.push(n);
  if(end<total-1)pages.push('end-ellipsis');
  pages.push(total);
  return pages;
}

export default function CourseCatalog() {
  const [items,setItems]=useState([]),[status,setStatus]=useState('loading'),[error,setError]=useState('');
  const [segments,setSegments]=useState([]),[offerCities,setOfferCities]=useState([]);
  const [query,setQuery]=useState(''),[city,setCity]=useState('');
  const [segment,setSegment]=useState(''),[period,setPeriod]=useState('');
  const [page,setPage]=useState(1);
  const PAGE_SIZE=usePageSize();
  const [view,setView]=useState('grid');
  const resultsRef=useRef(null);
  const { units }=useSiteData();
  const [term,setTerm]=useState('');
  // Nome digitado vai ao servidor com pequeno atraso; área também. Cidade e situação cruzam com as turmas.
  useEffect(()=>{const timer=setTimeout(()=>setTerm(query),300);return()=>clearTimeout(timer)},[query]);
  useEffect(()=>{
    let active=true;
    loadCategories().then(list=>{if(active)setSegments(list)}).catch(()=>{});
    loadOffers().then(({offers})=>{if(active)setOfferCities([...new Set(offers.map(o=>o.localidade).filter(Boolean))])}).catch(()=>{});
    return ()=>{active=false};
  },[]);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true;
    setStatus('loading');
    searchCourses({q:term,category:segment}).then(list=>{if(active){setItems(list);setStatus('ready');setError('')}})
      .catch(()=>{if(active){setItems([]);setStatus('error');setError('Não foi possível consultar o catálogo do Senac Maranhão neste momento.')}});
    return ()=>{active=false};
  },[term,segment,attempt]);
  const cities=useMemo(()=>[...new Set([...units.map(u=>u.city),...offerCities].filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[units,offerCities]);
  const filtered=useMemo(()=>items.filter(item=>
    (!city||item.cities.some(name=>fold(name)===fold(city))) && (!period||item.situation===period)
  ),[items,city,period]);
  const data={source:status};
  const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const safePage=Math.min(page,pageCount);
  const firstIndex=(safePage-1)*PAGE_SIZE;
  const visibleCourses=filtered.slice(firstIndex,firstIndex+PAGE_SIZE);
  useEffect(()=>{setPage(current=>Math.min(current,pageCount));},[pageCount]);
  const navigatePage=target=>{
    if(target<1||target>pageCount||target===safePage)return;
    setPage(target);
    requestAnimationFrame(()=>resultsRef.current?.scrollIntoView({behavior:'instant',block:'start'}));
  };
  const reset=()=>{setQuery('');setCity('');setSegment('');setPeriod('');setPage(1)};
  return <section className="inner-stack" aria-labelledby="catalog-title">
    <div className="inner-section-title"><div>
      <h1 id="catalog-title">Encontre o curso ideal</h1>
      <p>Consulte cursos, datas, valores e turmas disponíveis no Senac Maranhão</p>
    </div></div>
    <div className="inner-catalog-layout">
      <aside className="inner-catalog-sidebar" aria-label="Filtros de cursos">
        <form className="inner-catalog-filter" role="search" onSubmit={e=>e.preventDefault()}>
          <div className="inner-filter-heading"><h3>Filtrar cursos</h3><p>Refine sua busca</p></div>
      <label><span>Qual curso você procura?</span><div className="inner-search">
        <Search size={20} variant="Linear" color="currentColor"/><input type="search" value={query} placeholder="Nome do curso"
          onChange={e=>{setQuery(e.target.value);setPage(1)}}/>
      </div></label>
      <label><span>Cidade</span><select value={city} onChange={e=>{setCity(e.target.value);setPage(1)}}>
        <option value="">Todas as cidades</option>{cities.map(name=><option value={name} key={name}>{name}</option>)}
      </select></label>
      <label><span>Área</span><select value={segment} onChange={e=>{setSegment(e.target.value);setPage(1)}}>
        <option value="">Todas as áreas</option>{segments.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}
      </select></label>
      <label><span>Situação da turma</span><select value={period} onChange={e=>{setPeriod(e.target.value);setPage(1)}}>
        <option value="">Todas as turmas</option>
        {SITUATIONS.map(x=><option key={x}>{x}</option>)}
      </select></label>
      <button type="button" className="button button-outline" onClick={reset}>Limpar filtros</button>
        </form>
      </aside>
      <div className="inner-catalog-results" ref={resultsRef}>
    {error && <p className="inner-catalog-warning" role="alert">{error} <button type="button" className="button button-outline" onClick={()=>setAttempt(n=>n+1)}>Tentar novamente</button></p>}
    <div className="inner-results-toolbar">
      <div className="inner-results-location" aria-live="polite" aria-atomic="true">
        <strong>{data.source==='loading' ? 'Carregando cursos…' : `${filtered.length} ${filtered.length===1?'curso encontrado':'cursos encontrados'}`}</strong>
        {data.source!=='loading' && <span>Mostrando {filtered.length ? `${firstIndex+1}–${Math.min(firstIndex+PAGE_SIZE,filtered.length)}` : '0'} de {filtered.length} · Página {safePage} de {pageCount}</span>}
      </div>
      <div className="inner-view-switch" role="group" aria-label="Visualização dos cursos">
        <button type="button" className={view==='grid'?'is-active':''} aria-label="Visualizar em grade" aria-pressed={view==='grid'} title="Visualizar em grade" onClick={()=>setView('grid')}><LayoutGrid size={20} variant="Bold" color="currentColor"/></button>
        <button type="button" className={view==='list'?'is-active':''} aria-label="Visualizar em lista" aria-pressed={view==='list'} title="Visualizar em lista" onClick={()=>setView('list')}><ListIcon size={20} variant="Bold" color="currentColor"/></button>
      </div>
    </div>
    <div key={view} className={"inner-course-grid inner-catalog-grid"+(view==='list'?' is-list':'')}>
      {visibleCourses.map(item=>{
        const visual=courseVisual(item),status=item.situation;
        const area=item.area || visual.area;
        return <a href={item.path} className="course-card inner-course-card"
          key={item.id} aria-label={'Conhecer curso '+item.title}>
          <div className="inner-course-photo">
            <img className="course-photo" src={visual.image} alt="" loading="lazy" decoding="async"/>
          </div>
          <div className="course-body">
            <span className="course-badge">{area}</span>
            <h3>{visual.name}</h3>
            <div className="inner-course-facts">
              {item.localidade&&<span><MapPin size={16} variant="Bold" color="currentColor"/>{item.localidade}</span>}
              {item.carga_horaria&&<span><Clock3 size={16} variant="Bold" color="currentColor"/>{item.carga_horaria} horas</span>}
              {item.inicio&&<span><CalendarDays size={16} variant="Bold" color="currentColor"/>{item.inicio}</span>}
            </div>
            <span className={'inner-course-status '+situationClass(status)}>{status}</span>
            <span className="button course-button">Saiba mais <Icon name="arrow"/></span>
          </div>
        </a>;
      })}
    </div>
    {!filtered.length && data.source!=='loading' && <div className="inner-no-results">
      Nenhum curso corresponde aos filtros selecionados. Tente outra busca.
    </div>}
      </div>
    </div>
    <div className="inner-catalog-paging">
    {filtered.length>0 && <nav className="inner-catalog-pagination" aria-label="Paginação dos cursos">
      <button type="button" className="inner-page-button inner-page-arrow" disabled={safePage===1}
        onClick={()=>navigatePage(safePage-1)} aria-label="Página anterior"><ChevronLeft size={19} variant="Bold" color="currentColor"/></button>
      {paginationNumbers(safePage,pageCount).map(value=>typeof value==='number'
        ? <button type="button" key={value} className={'inner-page-button'+(value===safePage?' is-active':'')}
            onClick={()=>navigatePage(value)} aria-label={'Página '+value}
            aria-current={value===safePage?'page':undefined}>{value}</button>
        : <span key={value} className="inner-page-ellipsis" aria-hidden="true">…</span>)}
      <button type="button" className="inner-page-button inner-page-arrow" disabled={safePage===pageCount}
        onClick={()=>navigatePage(safePage+1)} aria-label="Próxima página"><ChevronRight size={19} variant="Bold" color="currentColor"/></button>
    </nav>}
    {filtered.length>0 && <p className="inner-page-summary">Página {safePage} de {pageCount}</p>}
    </div>
  </section>;
}
