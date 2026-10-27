import React from 'react';
import { ArrowRight, Book1, DocumentText, Teacher, Location, Call, Sms } from 'iconsax-react';
import { asset, links } from '../data/content';
import { routeHref } from '../data/basePath';
import { ActionLink } from './Ui';
import './serviceDetails.css';

export const servicePaths = new Set([
  '/encaminhamento-ao-mercado-de-trabalho/','/cadastro-de-interesse/',
  '/cursos-a-distancia/','/psg/',
]);
const details = {
  '/encaminhamento-ao-mercado-de-trabalho/': {
    image:'ff2a6.png',
    description:'O Banco de Oportunidades aproxima profissionais formados pelo Senac e empresas que procuram pessoas qualificadas.',
    summary:'O serviço oferece orientação profissional aos estudantes e egressos e apoia o recrutamento de candidatos para empresas.',
    sections:[
      {title:'Para ex-alunos',text:'Faça seu cadastro presencialmente no setor, levando CPF, certificado de conclusão de curso do Senac e currículo atualizado. Depois, aguarde o contato sobre possíveis encaminhamentos.'},
      {title:'Para estudantes',text:'Receba orientação profissional durante o curso e atendimento individualizado. Após obter a certificação, procure o setor para realizar seu cadastro.'},
      {title:'Para empresas',text:'Cadastre a empresa e suas vagas para solicitar profissionais formados pelo Senac.',href:'https://www.bancodeoportunidade.ma.senac.br/Cadastros/Empresas.aspx',label:'Cadastrar empresa e vaga'},
    ],
    contact:{title:'Atendimento do Banco',address:'Rua do Passeio, nº 495 – Centro, Bloco A, São Luís – MA',phones:['(98) 3198-1537','(98) 3198-1538'],email:'baopo@ma.senac.br'},
    actions:[{label:'Conhecer nossos cursos',href:links.courses,primary:true}],
    aside:{title:'Quer participar?',text:'Se você concluiu um curso do Senac, procure o Banco de Oportunidades com sua documentação. Empresas podem solicitar candidatos pelo cadastro específico.'},
  },
  '/cadastro-de-interesse/': {
    image:'966ba.png',
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
    image:'dbc66.png',
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
    image:'79629.png',
    description:'Conheça o Programa Senac de Gratuidade e consulte a programação de formação profissional gratuita.',
    summary:'O PSG oferece ações educacionais gratuitas a pessoas de baixa renda, ampliando o acesso à educação profissional.',
    sections:[
      {title:'O que é o PSG?',text:'O programa oferece cursos de formação inicial e continuada e cursos técnicos de nível médio sem custo, conforme suas regras e ofertas.'},
      {title:'Como participar',text:'Acompanhe os editais para consultar cursos, localidades, público atendido, critérios e etapas de inscrição de cada seleção.',href:'/editais-psg/',label:'Consultar editais'},
      {title:'Resultados',text:'Consulte os resultados e comunicados das seleções do programa.',href:'/resultados-psg/',label:'Ver resultados'},
    ],
    notice:'A oferta de vagas e as condições de participação variam conforme o edital. Verifique os requisitos e os prazos da seleção desejada.',
    actions:[{label:'Consultar editais PSG',href:'/editais-psg/',primary:true},{label:'Consultar resultados',href:'/resultados-psg/'},{label:'Portal PSG',href:'https://www.portal-psg.ma.senac.br/#/programa-senac-de-gratuidade'}],
    aside:{title:'Encontre sua oportunidade',text:'Acesse os editais e confira as seleções, os documentos e as orientações para participar.'},
  },
};
function ContactInfo({contact}) {
  if(!contact)return null;
  return <section className="service-contact" aria-labelledby="service-contact-heading">
    <h2 id="service-contact-heading">{contact.title}</h2>
    <div className="service-contact-lines"><p><Location size={20} variant="Bold" color="currentColor"/>{contact.address}</p>
      {contact.phones.map(phone=><p key={phone}><Call size={20} variant="Bold" color="currentColor"/><a href={'tel:+55'+phone.replace(/\D/g,'')}>{phone}</a></p>)}
      {contact.email&&<p><Sms size={20} variant="Bold" color="currentColor"/><a href={'mailto:'+contact.email}>{contact.email}</a></p>}
    </div>
  </section>;
}
export default function ServiceDetails({page}) {
  const data=details[page.path];
  if(!data)return null;
  const [main,...others]=data.actions;
  return <div className="service-detail">
    <nav className="inner-breadcrumb" aria-label="Você está aqui">
      <a href={routeHref('/')}>Início</a><ArrowRight size={16} variant="Bold" color="currentColor"/><span aria-current="page">{page.title}</span>
    </nav>
    <header className="service-detail-hero">
      <div className="service-hero-copy"><h1>{page.title}</h1><p>{data.description}</p>
        <section className="service-intro" aria-labelledby="service-about-heading">
          <h2 id="service-about-heading">Saiba mais</h2><p>{data.summary}</p>
        </section>
        <div className="service-hero-actions">
          <ActionLink href={main.href} arrow>{main.label}</ActionLink>
          {others[0]&&<a className="service-secondary-action" href={others[0].href}>{others[0].label}<ArrowRight size={19} variant="Linear" color="currentColor"/></a>}
        </div>
      </div>
      <figure className="service-hero-image"><img src={asset(data.image)} alt="" loading="eager" decoding="async"/></figure>
    </header>
    <div className="service-main-layout">
      <div className="service-main-copy">
        <section className="service-steps" aria-labelledby="service-steps-title">
          <h2 id="service-steps-title">{page.path==='/cadastro-de-interesse/'?'Como funciona':page.path==='/psg/'?'Sobre o programa':'Informações e serviços'}</h2>
          <div className="service-steps-grid">
            {data.sections.map((section,index)=><article className="service-step" key={section.title}>
              <span className="service-step-icon" aria-hidden="true">{index%3===0?<Teacher size={25} variant="Bold" color="currentColor"/>:index%3===1?<Book1 size={25} variant="Bold" color="currentColor"/>:<DocumentText size={25} variant="Bold" color="currentColor"/>}</span>
              <h3>{section.title}</h3><p>{section.text}</p>
              {section.href&&<a className="service-text-link" href={section.href}>{section.label}<ArrowRight size={19} variant="Linear" color="currentColor"/></a>}
            </article>)}
          </div>
        </section>
        {data.notice&&<div className="service-notice"><Book1 size={22} variant="Bold" color="currentColor"/><p>{data.notice}</p></div>}
        <ContactInfo contact={data.contact}/>
      </div>
      <aside className="service-side" aria-label="Próximos passos">
        <h2>{data.aside.title}</h2><p>{data.aside.text}</p>
        <div className="service-side-actions">
          <ActionLink href={main.href} arrow>{main.label}</ActionLink>
          {others.map(action=><a href={action.href} key={action.href} className="service-side-link">{action.label}<ArrowRight size={18} variant="Linear" color="currentColor"/></a>)}
        </div>
      </aside>
    </div>
  </div>;
}
