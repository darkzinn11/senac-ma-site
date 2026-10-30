import React from 'react';
import { ArrowRight, ArrowRight2, Book1, Briefcase, DocumentText, EmptyWallet, InfoCircle, Monitor, People, Teacher, Location, Call, Sms } from 'iconsax-react';
import { asset, links } from '../data/content';
import { routeHref } from '../data/basePath';
import { ActionLink, PhotoCard, noFinalPeriod } from './Ui';
import './courseDetail.css';
import './serviceDetails.css';

export const servicePaths = new Set([
  '/encaminhamento-ao-mercado-de-trabalho/','/cadastro-de-interesse/',
  '/cursos-a-distancia/','/psg/',
]);
const details = {
  '/encaminhamento-ao-mercado-de-trabalho/': {
    // Banner no layout do Figma (node 11123:136): foto na metade direita sob um degradê azul, sem os cards de informação.
    image:'ff2a6.png', split:true, tag:'Empregabilidade',
    description:'O Banco de Oportunidades aproxima profissionais formados pelo Senac e empresas que procuram pessoas qualificadas.',
    summary:'O serviço oferece orientação profissional aos estudantes e egressos e apoia o recrutamento de candidatos para empresas.',
    // Mesmas três entradas do site antigo, cada uma com sua página de orientações. Fotos do Unsplash (licença livre para uso comercial).
    cards:[
      {title:'Para empresas',image:'banco-empresas.png',href:'/banco-de-oportunidades-empresas/'},
      {title:'Para egressos',image:'banco-egressos.png',href:'/banco-de-oportunidades-egressos/'},
      {title:'Para estudantes',image:'banco-estudantes.png',href:'/banco-de-oportunidades-estudantes/'},
    ],
    contact:{title:'Atendimento do Banco',address:'Rua do Passeio, nº 495 – Centro, Bloco A, São Luís – MA',phones:['(98) 3198-1537','(98) 3198-1538'],email:'baopo@ma.senac.br'},
    actions:[{label:'Cadastrar empresa e vaga',href:'https://www.bancodeoportunidade.ma.senac.br/Cadastros/Empresas.aspx',primary:true},{label:'Conhecer nossos cursos',href:links.courses}],
    aside:{title:'Quer participar?',text:'Se você concluiu um curso do Senac, procure o Banco de Oportunidades com sua documentação. Empresas podem solicitar candidatos pelo cadastro específico.'},
  },
  '/cadastro-de-interesse/': {
    image:'966ba.png', tag:'Cursos',
    facts:[['Cadastro','Online','monitor'],['Você escolhe','Curso, unidade e turno','book']],
    description:'Informe os cursos que deseja fazer no Senac Maranhão e, se quiser, sugira uma nova formação.',
    summary:'O cadastro de interesse permite indicar curso, unidade e turno de preferência e deixar seus dados para um futuro contato.',
    sections:[
      {title:'Escolha sua formação',text:'Selecione a unidade, o turno e o curso de seu interesse na plataforma de cadastro.'},
      {title:'Preencha seus dados',text:'Informe nome, celular e e-mail para que a equipe possa entrar em contato com você.'},
      {title:'Sugira um novo curso',text:'Se não encontrar o curso desejado, utilize o campo de sugestão da plataforma.'},
    ],
    notice:'O cadastro de interesse não é reserva de vaga nem pré-matrícula. Consulte a programação e as condições de cada turma antes de se matricular.',
    actions:[{label:'Preencher cadastro de interesse',href:'https://acic.ma.senac.br/',primary:true},{label:'Ver cursos disponíveis',href:links.courses}],
    aside:{title:'Cadastre seu interesse',text:'O preenchimento é feito no sistema de interesse em cursos do Senac. Você poderá escolher unidade, turno e formação.'},
  },
  '/cursos-a-distancia/': {
    image:'dbc66.png', tag:'Educação a distância',
    facts:[['Modalidade','A distância','monitor'],['Níveis','Livres à pós-graduação','book']],
    description:'Conheça as opções de formação online do Senac e estude com mais flexibilidade.',
    summary:'A educação a distância do Senac oferece cursos em diferentes níveis e áreas de conhecimento, para quem deseja desenvolver novas competências.',
    sections:[
      {title:'Cursos livres',text:'Opções para quem busca qualificação ou atualização profissional em diferentes áreas.'},
      {title:'Cursos técnicos',text:'Formações técnicas para desenvolver conhecimentos e competências profissionais.'},
      {title:'Graduação',text:'Cursos superiores na modalidade a distância, conforme a oferta do Senac EAD.'},
      {title:'Pós-graduação e extensão',text:'Opções de continuidade dos estudos para aprofundamento e atualização profissional.'},
    ],
    contact:{title:'Polo EAD São Luís',address:'Rua do Passeio, nº 495 – Centro, São Luís – MA',phones:['(98) 3198-1518'],email:'unead@ma.senac.br'},
    actions:[{label:'Explorar cursos EAD',href:'https://www.ead.senac.br/',primary:true},{label:'Cursos presenciais',href:links.courses}],
    aside:{title:'Estude de onde estiver',text:'Consulte a oferta, os requisitos e as condições de matrícula na plataforma de cursos a distância do Senac.'},
  },
  '/psg/': {
    image:'79629.png', split:true, tag:'Gratuidade',
    description:'Conheça o Programa Senac de Gratuidade e consulte a programação de formação profissional gratuita.',
    actions:[{label:'Consultar editais PSG',href:'/editais-psg/',primary:true},{label:'Consultar resultados',href:'/resultados-psg/'}],
  },
};
const FACT_ICONS={people:People,location:Location,briefcase:Briefcase,monitor:Monitor,book:Book1,wallet:EmptyWallet,document:DocumentText};
const STEP_ICONS=[Teacher,Book1,DocumentText];
const stepsTitle=path=>path==='/cadastro-de-interesse/'||path==='/psg/'?'Como funciona':path==='/cursos-a-distancia/'?'Opções de formação':'Como participar';

function PsgContent() {
  return <div className="psg-content">
    <section className="psg-overview" aria-labelledby="psg-about-title">
      <div className="psg-overview-copy">
        <h2 id="psg-about-title">O que é o PSG?</h2>
        <p>O Programa Senac de Gratuidade oferece cursos gratuitos de formação inicial e continuada e cursos técnicos de nível médio, ampliando o acesso à educação profissional.</p>
        <a className="psg-inline-link" href="https://www.portal-psg.ma.senac.br/#/programa-senac-de-gratuidade">Conheça o programa <ArrowRight size={19} color="currentColor" aria-hidden="true"/></a>
      </div>
      <aside className="psg-audience">
        <h3>Para quem é o programa?</h3>
        <p>O PSG é voltado a pessoas de baixa renda, incluindo estudantes e egressos da educação básica e trabalhadores empregados ou desempregados.</p>
        <p>Os critérios de participação e os documentos necessários devem ser conferidos no edital de cada seleção.</p>
      </aside>
    </section>

    <section className="psg-participation" aria-labelledby="psg-steps-title">
      <div className="psg-section-heading"><h2 id="psg-steps-title">Como participar</h2><p>Consulte as oportunidades disponíveis e acompanhe cada etapa da seleção.</p></div>
      <ol className="psg-steps">
        <li><span className="psg-step-number" aria-hidden="true">1</span><div><h3>Consulte os editais</h3><p>Confira os cursos, as unidades, os prazos e as regras da seleção.</p><a className="psg-inline-link" href={routeHref('/editais-psg/')}>Ver editais <ArrowRight size={19} color="currentColor" aria-hidden="true"/></a></div></li>
        <li><span className="psg-step-number" aria-hidden="true">2</span><div><h3>Faça sua inscrição</h3><p>Leia as orientações do edital e siga as instruções de inscrição da seleção escolhida.</p><a className="psg-inline-link" href={routeHref('/editais-psg/')}>Ver orientações no edital <ArrowRight size={19} color="currentColor" aria-hidden="true"/></a></div></li>
        <li><span className="psg-step-number" aria-hidden="true">3</span><div><h3>Acompanhe o resultado</h3><p>Consulte os resultados e comunicados para saber os próximos passos.</p><a className="psg-inline-link" href={routeHref('/resultados-psg/')}>Ver resultados <ArrowRight size={19} color="currentColor" aria-hidden="true"/></a></div></li>
      </ol>
      <div className="psg-notice"><InfoCircle size={24} variant="Bulk" color="currentColor" aria-hidden="true"/><p>As vagas e as condições de participação variam conforme o edital. Antes de se inscrever, confira os requisitos e os prazos da seleção.</p></div>
    </section>
    <section className="psg-more" aria-labelledby="psg-more-title">
      <div><h2 id="psg-more-title">Acompanhe as oportunidades</h2><p>Acesse os editais e encontre as informações da próxima seleção.</p></div>
      <ActionLink href={routeHref('/editais-psg/')} arrow>Consultar editais PSG</ActionLink>
    </section>
  </div>;
}

// Páginas de serviço no mesmo formato da página do curso: banner com foto, selo, dados-chave e ações;
// depois as etapas, o aviso e o atendimento em seções de coluna única.
export default function ServiceDetails({page}) {
  const data=details[page.path];
  if(!data)return null;
  const [main,...others]=data.actions;
  const contact=data.contact;
  return <div className="course-page service-detail">
    <header className="course-page-hero">
      <nav className="inner-breadcrumb" aria-label="Você está aqui">
        <a href={routeHref('/')}>Início</a><ArrowRight2 size={15} variant="Bold" color="currentColor"/><span aria-current="page">{page.title}</span>
      </nav>
      <div className={'course-page-banner'+(data.split?' is-split':'')}>
        <img className="course-page-banner-image" src={asset(data.image)} alt="" loading="eager" decoding="async"/>
        <div className="course-page-hero-copy">
          <div className="course-page-tags"><span className="course-badge">{data.tag}</span></div>
          <h1 className={page.title.length>60?'is-long':undefined}>{page.title}</h1>
          <p className="course-page-lead">{noFinalPeriod(data.description)}</p>
          {data.facts&&<ul className="course-page-facts" aria-label="Informações do serviço">
            {data.facts.map(([label,value,icon])=>{const FactIcon=FACT_ICONS[icon];return <li className="course-page-fact" key={label}>
              <FactIcon size={22} variant="Bulk" color="currentColor" aria-hidden="true"/><span><small>{label}</small><strong>{value}</strong></span>
            </li>})}
          </ul>}
          <div className="service-hero-actions">
            <ActionLink href={main.href} arrow>{main.label}</ActionLink>
            {others[0]&&<a className="button service-hero-secondary" href={others[0].href}>{others[0].label}<ArrowRight size={18} variant="Linear" color="currentColor"/></a>}
          </div>
        </div>
      </div>
    </header>

    {page.path==='/psg/' ? <PsgContent/> : <div className="course-page-body">
      <div className="course-page-main">
        <section className="course-page-section" aria-labelledby="service-steps-title">
          <h2 id="service-steps-title">{stepsTitle(page.path)}</h2>
          {data.cards
            ? <div className="service-photo-grid">{data.cards.map(card=><PhotoCard item={card} key={card.href}/>)}</div>
            : <div className={'service-steps-grid is-'+data.sections.length}>
              {data.sections.map((section,index)=>{const StepIcon=STEP_ICONS[index%3];return <article className="service-step" key={section.title}>
                <span className="service-step-icon" aria-hidden="true"><StepIcon size={24} variant="Bulk" color="currentColor"/></span>
                <h3>{section.title}</h3><p>{section.text}</p>
                {section.href&&<a className="service-text-link" href={section.href}>{section.label}<ArrowRight size={18} variant="Linear" color="currentColor"/></a>}
              </article>})}
            </div>}
          {data.notice&&<div className="service-notice"><InfoCircle size={22} variant="Bulk" color="currentColor"/><p>{data.notice}</p></div>}
        </section>

        <section className="course-page-section" aria-labelledby="service-contact-title">
          <h2 id="service-contact-title">{contact?contact.title:data.aside.title}</h2>
          <div className="service-contact-card">
            <div className="service-contact-copy">
              <p>{data.aside.text}</p>
              {contact&&<ul className="service-contact-lines">
                <li><Location size={20} variant="Bold" color="currentColor"/>{contact.address}</li>
                {contact.phones.map(phone=><li key={phone}><Call size={20} variant="Bold" color="currentColor"/><a href={'tel:+55'+phone.replace(/\D/g,'')}>{phone}</a></li>)}
                {contact.email&&<li><Sms size={20} variant="Bold" color="currentColor"/><a href={'mailto:'+contact.email}>{contact.email}</a></li>}
              </ul>}
            </div>
            <div className="service-contact-actions">
              <ActionLink href={main.href} arrow>{main.label}</ActionLink>
              {others.slice(1).map(action=><a href={action.href} key={action.href} className="button service-hero-secondary is-light">{action.label}<ArrowRight size={18} variant="Linear" color="currentColor"/></a>)}
            </div>
          </div>
        </section>
      </div>
    </div>}
  </div>;
}
