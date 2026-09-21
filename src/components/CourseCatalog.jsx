import React, {useEffect,useMemo,useRef,useState} from 'react';
import { ArrowRight, ArrowLeft2 as ChevronLeft, ArrowRight2 as ChevronRight, Element4 as LayoutGrid, TextalignLeft as ListIcon, Calendar as CalendarDays, Clock as Clock3, Location as MapPin, SearchNormal1 as Search } from 'iconsax-react';
import { courseVisual } from '../data/courseVisuals';
import { courseStatus, loadLiveCourses } from '../data/courseApi';
import { Icon } from './Ui';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const initial={items:[],segments:[],units:[],source:'loading',fetchedAt:null,total:0};
const PAGE_SIZE=6;
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
  const [data,setData]=useState(initial),[error,setError]=useState('');
  const [query,setQuery]=useState(''),[city,setCity]=useState('');
  const [segment,setSegment]=useState(''),[period,setPeriod]=useState('');
  const [page,setPage]=useState(1);
  const [view,setView]=useState('grid');
  const resultsRef=useRef(null);
  useEffect(()=>{
    let active=true;
    loadLiveCourses({onCached:value=>{if(active)setData(value)},onLive:value=>{if(active){setData(value);setError('')}}})
      .then(result=>{if(active&&result.error)setError('Não foi possível atualizar agora. Exibindo o último catálogo consultado.')})
      .catch(()=>{if(active)setError('Não foi possível consultar o catálogo do Senac Maranhão neste momento.')});
    return ()=>{active=false};
  },[]);
  const segments=new Map(data.segments.map(item=>[item.id,item.name]));
  const cities=useMemo(()=>[...new Set(data.items.map(c=>c.localidade).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[data.items]);
  const filtered=useMemo(()=>data.items.filter(item=>{
    const area=(item.segmento||[]).map(id=>segments.get(id)||'').join(' ');
    return fold(item.title+' '+item.localidade+' '+area).includes(fold(query)) &&
      (!city||fold(item.localidade)===fold(city)) &&
      (!segment||(item.segmento||[]).includes(Number(segment))) &&
      (!period||courseStatus(item)===period);
  }),[data,query,city,segment,period]);
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
      <h2 id="catalog-title">Encontre o curso ideal</h2>
      <p>Consulte as informações publicadas pelo Senac Maranhão. Datas e valores correspondem a cada turma cadastrada.</p>
    </div></div>
    <div className="inner-catalog-layout">
      <aside className="inner-catalog-sidebar" aria-label="Filtros de cursos">
        <form className="inner-catalog-filter" role="search" onSubmit={e=>e.preventDefault()}>
          <div className="inner-filter-heading"><h3>Filtrar cursos</h3><p>Refine sua busca</p></div>
      <label><span>Qual curso você procura?</span><div className="inner-search">
        <Search size={20}/><input type="search" value={query} placeholder="Nome do curso"
          onChange={e=>{setQuery(e.target.value);setPage(1)}}/>
      </div></label>
      <label><span>Cidade</span><select value={city} onChange={e=>{setCity(e.target.value);setPage(1)}}>
        <option value="">Todas as cidades</option>{cities.map(name=><option value={name} key={name}>{name}</option>)}
      </select></label>
      <label><span>Área</span><select value={segment} onChange={e=>{setSegment(e.target.value);setPage(1)}}>
        <option value="">Todas as áreas</option>{data.segments.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}
      </select></label>
      <label><span>Situação da turma</span><select value={period} onChange={e=>{setPeriod(e.target.value);setPage(1)}}>
        <option value="">Todas as turmas</option>
        {['Programada','Em andamento','Encerrada','A confirmar'].map(x=><option key={x}>{x}</option>)}
      </select></label>
      <button type="button" className="button button-outline" onClick={reset}>Limpar filtros</button>
        </form>
      </aside>
      <div className="inner-catalog-results" ref={resultsRef}>
    {error && <p className="inner-catalog-warning" role="alert">{error}</p>}
    <div className="inner-results-toolbar">
      <div className="inner-results-location" aria-live="polite" aria-atomic="true">
        <strong>{data.source==='loading' ? 'Carregando cursos…' : `${filtered.length} ${filtered.length===1?'curso encontrado':'cursos encontrados'}`}</strong>
        {data.source!=='loading' && <span>Mostrando {filtered.length ? `${firstIndex+1}–${Math.min(firstIndex+PAGE_SIZE,filtered.length)}` : '0'} de {filtered.length} · Página {safePage} de {pageCount}</span>}
      </div>
      <div className="inner-view-switch" role="group" aria-label="Visualização dos cursos">
        <button type="button" className={view==='grid'?'is-active':''} aria-label="Visualizar em grade" aria-pressed={view==='grid'} title="Visualizar em grade" onClick={()=>setView('grid')}><LayoutGrid size={20}/></button>
        <button type="button" className={view==='list'?'is-active':''} aria-label="Visualizar em lista" aria-pressed={view==='list'} title="Visualizar em lista" onClick={()=>setView('list')}><ListIcon size={20}/></button>
      </div>
    </div>
    <div key={view} className={"inner-course-grid inner-catalog-grid"+(view==='list'?' is-list':'')}>
      {visibleCourses.map(item=>{
        const visual=courseVisual(item),status=courseStatus(item);
        const area=(item.segmento||[]).map(id=>segments.get(id)).filter(Boolean).join(' / ') || visual.area;
        return <a href={new URL(item.link).pathname} className="course-card inner-course-card"
          key={item.id} aria-label={'Conhecer curso '+item.title}>
          <div className="inner-course-photo">
            <img className="course-photo" src={visual.image} alt="" loading="lazy" decoding="async"/>
          </div>
          <div className="course-body">
            <span className="course-badge">{area}</span>
            <h3>{visual.name}</h3>
            <div className="inner-course-facts">
              {item.localidade&&<span><MapPin size={16}/>{item.localidade}</span>}
              {item.carga_horaria&&<span><Clock3 size={16}/>{item.carga_horaria} horas</span>}
              {item.inicio&&<span><CalendarDays size={16}/>{item.inicio}</span>}
            </div>
            <span className={'inner-course-status '+(status==='Encerrada'?'is-past':'')}>{status}</span>
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
        onClick={()=>navigatePage(safePage-1)} aria-label="Página anterior"><ChevronLeft size={19}/></button>
      {paginationNumbers(safePage,pageCount).map(value=>typeof value==='number'
        ? <button type="button" key={value} className={'inner-page-button'+(value===safePage?' is-active':'')}
            onClick={()=>navigatePage(value)} aria-label={'Página '+value}
            aria-current={value===safePage?'page':undefined}>{value}</button>
        : <span key={value} className="inner-page-ellipsis" aria-hidden="true">…</span>)}
      <button type="button" className="inner-page-button inner-page-arrow" disabled={safePage===pageCount}
        onClick={()=>navigatePage(safePage+1)} aria-label="Próxima página"><ChevronRight size={19}/></button>
    </nav>}
    {filtered.length>0 && <p className="inner-page-summary">Página {safePage} de {pageCount}</p>}
    </div>
  </section>;
}
