import React, { useEffect, useRef, useState } from 'react';
import { Clock as ClockIcon } from 'iconsax-react';
import { asset, links } from '../data/content';
import { ActionLink, Icon, SectionHeading } from './Ui';

export function CourseDialog({ course, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!course) return;
    dialog.current.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [course]);
  if (!course) return null;
  return <dialog ref={dialog} className="course-dialog" aria-labelledby="dialog-title"
    onClose={onClose} onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}>
    <div className="dialog-content">
      <button className="dialog-close" aria-label="Fechar detalhes do curso" onClick={() => dialog.current.close()}><Icon name="close" /></button>
      <img className="dialog-photo" src={course.imageUrl || asset(course.image)} alt="" />
      <div className="dialog-copy">
        <span className="course-badge">{course.area}</span><h2 id="dialog-title">{course.title}</h2>
        {course.hours&&<p className="course-duration"><ClockIcon className="icon" size={18} variant="Bold" color="currentColor" aria-hidden="true"/>{course.hours} horas</p>}
        <p>Consulte as unidades, datas e condições de inscrição disponíveis para este curso.</p>
        <ActionLink href={course.path || links.courses} arrow>{course.path ? 'Ver detalhes do curso' : 'Consultar programação'}</ActionLink>
      </div>
    </div>
  </dialog>;
}
export default function Courses({ courses, searched, filters, onReset, onDetails, loading=false, error=false, units=[] }) {
  const viewport = useRef(null);
  const [activeIndex,setActiveIndex] = useState(0);
  const [snapCount,setSnapCount] = useState(1);
  const [position, setPosition] = useState({ start:true, end:false });

  function metrics(element=viewport.current) {
    const card=element?.querySelector('.course-card');
    if(!element||!card)return {step:1,maxIndex:0};
    const gap=parseFloat(getComputedStyle(element).columnGap)||25;
    const step=card.getBoundingClientRect().width+gap;
    const visible=Math.max(1,Math.round((element.clientWidth+gap)/step));
    return {step,maxIndex:Math.max(0,courses.length-visible)};
  }
  function goTo(index,behavior) {
    const element=viewport.current;
    if(!element)return;
    const {step,maxIndex}=metrics(element);
    const target=Math.max(0,Math.min(maxIndex,index));
    element.scrollTo({left:target*step,behavior:behavior||(window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth')});
  }
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    element.scrollLeft = 0;
    setActiveIndex(0);
    let settleTimer;
    const update = () => {
      const {step,maxIndex}=metrics(element);
      const current=Math.max(0,Math.min(maxIndex,Math.round(element.scrollLeft/step)));
      setActiveIndex(current);
      setSnapCount(maxIndex+1);
      setPosition({start:current===0,end:current===maxIndex});
    };
    const settle=()=>goTo(Math.round(element.scrollLeft/metrics(element).step));
    const onScroll=()=>{
      update();
      if(!('onscrollend' in element)){
        clearTimeout(settleTimer);
        settleTimer=setTimeout(settle,110);
      }
    };
    update();
    element.addEventListener('scroll',onScroll,{passive:true});
    if('onscrollend' in element)element.addEventListener('scrollend',settle);
    const observer=new ResizeObserver(()=>{update();goTo(activeIndex,'instant')}); observer.observe(element);
    return()=>{clearTimeout(settleTimer);element.removeEventListener('scroll',onScroll);element.removeEventListener('scrollend',settle);observer.disconnect()};
  }, [courses, loading]);
  function move(direction) { goTo(activeIndex+direction); }
  const unit = units.find(item => item.name === filters.unit);
  return <section id="cursos" className="container courses-section section-block" aria-labelledby="courses-heading">
    <SectionHeading id="courses-heading" title={searched ? 'Resultados da busca' : 'Cursos em destaque'}
      subtitle={searched ? (loading ? 'Buscando cursos…' : courses.length + (courses.length === 1 ? ' curso encontrado' : ' cursos encontrados')) : 'Busque por curso, cidade ou unidade e veja as turmas disponíveis no Senac Maranhão'}
      action={{ label:'Ver todos', href:links.courses }} />
    <span className="sr-only" role="status">{searched && !loading ? courses.length + ' cursos encontrados com os filtros selecionados.' : ''}</span>
    {loading ? <div className="empty-results" role="status"><h3>Carregando cursos…</h3><p>Consultando a programação do Senac Maranhão.</p></div> : error ? <div className="empty-results" role="alert">
      <h3>Não foi possível buscar os cursos agora.</h3><p>Tente novamente em instantes ou consulte a programação completa.</p>
      <div><button className="button button-outline" onClick={onReset}>Limpar filtros</button><ActionLink href={links.courses}>Consultar programação</ActionLink></div>
    </div> : courses.length ? <>
      <div className="course-viewport" ref={viewport} aria-label="Cursos em destaque" tabIndex="0">
        {courses.map(course => <article className="course-card" key={course.id}>
          <img className="course-photo" src={course.imageUrl || asset(course.image)} alt="" loading="lazy" decoding="async" width="291" height="182" />
          <div className="course-body">
            <span className="course-badge">{course.area}</span><h3>{course.title}</h3>
            {course.hours&&<p className="course-duration"><ClockIcon className="icon" size={18} variant="Bold" color="currentColor" aria-hidden="true"/>{course.hours} horas</p>}
            <button className="button course-button" onClick={() => onDetails(course)} aria-label={'Saiba mais sobre ' + course.title}>
              Saiba mais<Icon name="arrow" />
            </button>
          </div>
        </article>)}
      </div>
      <div className="course-controls">
        <button className="course-arrow course-previous" disabled={position.start} onClick={() => move(-1)} aria-label="Cursos anteriores"><Icon name="chevronLeft" /></button>
        <button className="course-arrow course-next" disabled={position.end} onClick={() => move(1)} aria-label="Próximos cursos"><Icon name="chevronLeft" /></button>
      </div>
      {snapCount>1&&<div className="course-pagination" aria-label="Navegação do carrossel de cursos">
        {Array.from({length:snapCount},(_,i)=><button key={i} type="button" className={i===activeIndex?'is-active':''}
          onClick={()=>goTo(i)} aria-label={'Mostrar posição '+(i+1)+' de '+snapCount}
          aria-current={i===activeIndex?'true':undefined}><span/></button>)}
      </div>}
    </> : <div className="empty-results">
      <h3>Nenhum curso encontrado com esses filtros.</h3>
      <p>Experimente outra busca ou consulte a programação completa do Senac.</p>
      <div><button className="button button-outline" onClick={onReset}>Limpar filtros</button>
        <ActionLink href={unit?.href || (filters.type === 'EAD' ? links.ead : links.courses)}>Consultar programação</ActionLink></div>
    </div>}
  </section>;
}
