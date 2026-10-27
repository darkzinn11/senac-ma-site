import React from 'react';
import { ArrowRight, Calendar as CalendarDays, Clock as Clock3, Location as MapPin, People as Users, Wallet, Teacher, Category, Book1 } from 'iconsax-react';
import {brl} from '../data/courseApi';
import {routeHref} from '../data/basePath';
import {ActionLink} from './Ui';
import {canEnroll,offerSituation} from '../api/adapters';
import Html from './Html';
function Info({icon:Icon,label,value}) {
  if(!value)return null;
  return <div className="inner-detail-fact"><Icon size={21} variant="Bold" color="currentColor"/><div><span>{label}</span><strong>{value}</strong></div></div>;
}
// Detalhe do curso (API: /v1/public/courses/{slug}): dados do curso + turmas abertas/programadas.
export default function CourseDetail({course}) {
  const offers=course.offers||[];
  const withStatus=offers.map(offer=>({offer,status:offerSituation(offer)}));
  const enrollable=withStatus.find(item=>canEnroll(item.offer));
  const hasAbout=Boolean(course.html&&course.html.replace(/<[^>]*>/g,'').trim());
  return <div className="inner-layout">
    <article className="inner-content">
      <div className="inner-detail-overview">
        <h2 className="inner-detail-info-title">Informações do curso</h2>
        <div className="inner-detail-grid">
          <Info icon={Clock3} label="Carga horária" value={course.workload?course.workload+' horas':null}/>
          <Info icon={Teacher} label="Modalidade" value={course.modality}/>
          <Info icon={Category} label="Tipo de curso" value={course.courseType}/>
          <Info icon={Book1} label="Área" value={course.category}/>
          <Info icon={Users} label="Público-alvo" value={course.audience}/>
          <Info icon={Book1} label="Pré-requisitos" value={course.prerequisites}/>
          <Info icon={Teacher} label="Certificação" value={course.certification}/>
        </div>
      </div>
      {hasAbout&&<section className="inner-detail-about" aria-labelledby="course-about-title">
        <h2 id="course-about-title" className="inner-detail-info-title">Objetivos e detalhes</h2>
        <Html html={course.html}/>
      </section>}
      <div className="inner-detail-overview">
        <h2 className="inner-detail-info-title">Turmas</h2>
        {withStatus.length ? withStatus.map(({offer,status})=><div className="inner-detail-offer" key={offer.id}>
          <div className="inner-detail-grid">
            <Info icon={MapPin} label="Cidade" value={offer.localidade}/>
            <Info icon={MapPin} label="Unidade" value={offer.unidade}/>
            <Info icon={CalendarDays} label="Início" value={offer.inicio}/>
            <Info icon={CalendarDays} label="Término" value={offer.fim}/>
            <Info icon={Wallet} label="Valor" value={brl(offer.preco)}/>
            <Info icon={Users} label="Vagas" value={offer.total_de_vagas}/>
            <Info icon={Clock3} label="Horários" value={offer.horarios}/>
            <Info icon={Teacher} label="Situação" value={status}/>
          </div>
          {canEnroll(offer)&&<ActionLink href={offer.link_para_matricula} arrow>Matricule-se</ActionLink>}
        </div>) : <p>No momento não há turmas abertas ou programadas para este curso. Confira outros cursos ou cadastre seu interesse.</p>}
      </div>
    </article>
    <aside className="inner-aside">
      <div className="inner-aside-card">
        <h2>Interessado neste curso?</h2>
        {enrollable
          ? <p>Há turma com matrícula aberta. Confira as condições e faça sua matrícula online.</p>
          : <p>Ainda não há turma com matrícula aberta. Cadastre seu interesse para ser avisado sobre novas turmas.</p>}
        {enrollable&&<ActionLink href={enrollable.offer.link_para_matricula} arrow>Matricule-se</ActionLink>}
        {!enrollable&&<ActionLink href={routeHref('/cadastro-de-interesse/')} arrow>Cadastrar interesse</ActionLink>}
        <ActionLink href={routeHref('/cursos-senac/')} arrow>Explorar outros cursos</ActionLink>
      </div>
    </aside>
  </div>;
}
