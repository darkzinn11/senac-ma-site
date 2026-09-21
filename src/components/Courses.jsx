import React, { useEffect, useRef, useState } from 'react';
import { asset, links, units } from '../data/content';
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
      <img className="dialog-photo" src={asset(course.image)} alt="" />
      <div className="dialog-copy">
        <span className="course-badge">{course.area}</span><h2 id="dialog-title">{course.title}</h2>
        <p className="course-duration"><Icon name="clock" />{course.hours} horas</p>
        <p>Consulte as unidades, datas e condições de inscrição na programação oficial do Senac Maranhão.</p>
        <ActionLink href={links.courses} arrow>Consultar programação</ActionLink>
      </div>
    </div>
  </dialog>;
}
export default function Courses({ courses, searched, filters, onReset, onDetails }) {
  const viewport = useRef(null);
  const [position, setPosition] = useState({ start:true, end:false });
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    element.scrollLeft = 0;
    const update = () => setPosition({
      start:element.scrollLeft < 2,
      end:element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
    });
    update();
    element.addEventListener('scroll', update, { passive:true });
    const observer = new ResizeObserver(update); observer.observe(element);
    return () => { element.removeEventListener('scroll', update); observer.disconnect(); };
  }, [courses]);
  function move(direction) {
    const element = viewport.current;
    const card = element.querySelector('.course-card');
    const gap = parseFloat(getComputedStyle(element).columnGap) || 25;
    const distance = (card?.getBoundingClientRect().width || 290) + gap;
    element.scrollBy({ left:direction * distance, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  const unit = units.find(item => item.name === filters.unit);
  return <section id="cursos" className="container courses-section section-block" aria-labelledby="courses-heading">
    <SectionHeading id="courses-heading" title={searched ? 'Resultados da busca' : 'Cursos em destaque em São Luís'}
      subtitle={searched ? courses.length + (courses.length === 1 ? ' curso encontrado' : ' cursos encontrados') : 'Busque por curso, cidade ou unidade e veja as turmas disponíveis no Senac Maranhão'}
      action={{ label:'Ver todos', href:links.courses }} />
    <span className="sr-only" role="status">{searched ? courses.length + ' cursos encontrados com os filtros selecionados.' : ''}</span>
    {courses.length ? <>
      <div className="course-viewport" ref={viewport} aria-label="Cursos em destaque" tabIndex="0">
        {courses.map(course => <article className="course-card" key={course.id}>
          <img className="course-photo" src={asset(course.image)} alt="" loading="lazy" decoding="async" width="291" height="182" />
          <div className="course-body">
            <span className="course-badge">{course.area}</span><h3>{course.title}</h3>
            <p className="course-duration"><Icon name="clock" />{course.hours} horas</p>
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
    </> : <div className="empty-results">
      <h3>Nenhum curso encontrado com esses filtros.</h3>
      <p>Experimente outra busca ou consulte a programação completa do Senac.</p>
      <div><button className="button button-outline" onClick={onReset}>Limpar filtros</button>
        <ActionLink href={unit?.href || (filters.type === 'EAD' ? links.ead : links.courses)}>Consultar programação</ActionLink></div>
    </div>}
  </section>;
}
