import React,{useEffect,useState} from 'react';
import { ArrowRight, Calendar as CalendarDays, Clock as Clock3, Location as MapPin, People as Users, Wallet } from 'iconsax-react';
import {brl,courseStatus,fetchCourseDetails} from '../data/courseApi';
import {courseVisual} from '../data/courseVisuals';
import {ActionLink} from './Ui';
const textOf=html=>{
  const doc=new DOMParser().parseFromString(String(html||''),'text/html');
  return (doc.body.textContent||'').replace(/\s+/g,' ').trim();
};
function Info({icon:Icon,label,value}) {
  if(!value)return null;
  return <div className="inner-detail-fact"><Icon size={21}/><div><span>{label}</span><strong>{value}</strong></div></div>;
}
export default function CourseDetail({page}) {
  const [state,setState]=useState({item:null,source:'loading',error:''});
  useEffect(()=>{
    let active=true;setState({item:null,source:'loading',error:''});
    fetchCourseDetails(page.id).then(value=>{if(active)setState({...value,error:''})})
      .catch(()=>{if(active)setState({item:null,source:'error',error:'Não foi possível consultar as informações detalhadas deste curso.'})});
    return ()=>{active=false};
  },[page.id]);
  const item=state.item;
  const status=item?courseStatus(item):null;
  const city=item?.localidade||null;
  const unitName=item?.unidade?.map(id=>state.units?.find(u=>u.id===id)?.name).filter(Boolean).join(' / ')||null;
  const objective=item?textOf(item.objetivo):'';
  const visual=item?courseVisual(item):null;
  return <div className="inner-layout">
    <article className="inner-content">
      {state.source==='loading'&&<div role="status" className="inner-empty"><h2>Consultando informações do curso…</h2></div>}
      {state.error&&<div role="alert" className="inner-empty"><p>{state.error}</p>
        <ActionLink href="/cursos-senac/" arrow>Ver outros cursos</ActionLink></div>}
      {item&&<>
        <div className="inner-detail-overview">
          <div className="inner-detail-heading"><span className="course-badge">{item.eixo_tecnologico||visual.area}</span>
            <span className={'inner-course-status '+(status==='Encerrada'?'is-past':'')}>{status}</span></div>
          <h2>Informações da turma</h2>
          <div className="inner-detail-grid">
            <Info icon={MapPin} label="Cidade" value={city}/>
            <Info icon={MapPin} label="Unidade" value={unitName}/>
            <Info icon={Clock3} label="Carga horária" value={item.carga_horaria?item.carga_horaria+' horas':null}/>
            <Info icon={CalendarDays} label="Início" value={item.inicio}/>
            <Info icon={CalendarDays} label="Término" value={item.fim}/>
            <Info icon={Wallet} label="Valor" value={brl(item.preco)}/>
            <Info icon={Users} label="Vagas" value={item.total_de_vagas}/>
          </div>
          {item.horarios&&<p className="inner-detail-schedule"><strong>Horários:</strong> {item.horarios}</p>}
          {item.modalidade&&<p className="inner-detail-schedule"><strong>Modalidade:</strong> {item.modalidade}</p>}
          {objective&&<section className="inner-detail-objective"><h3>Sobre o curso</h3><p>{objective}</p></section>}
        </div>
      </>}
    </article>
    <aside className="inner-aside">
      <div className="inner-aside-card">
        <h2>Interessado neste curso?</h2>
        {item && status==='Encerrada'
          ? <p>O período desta turma já terminou. Confira outras turmas disponíveis.</p>
          : <p>Confira as condições e, quando disponível, faça sua matrícula online.</p>}
        {item && status==='Programada' && item.link_para_matricula &&
          <ActionLink href={item.link_para_matricula} arrow>Fazer matrícula</ActionLink>}
        <ActionLink href="/cursos-senac/" arrow>Explorar outros cursos</ActionLink>
      </div>
    </aside>
  </div>;
}
