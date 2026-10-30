import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowDown2, Book1, Clock, Location, SearchNormal1, Sms } from 'iconsax-react';
import { links } from '../data/content';
import { localHref } from '../data/portalRoutes';
import { routeHref } from '../data/basePath';
import Html, { sanitizeHtml } from './Html';
import Breadcrumb from './PageBreadcrumb';
import { ActionLink } from './Ui';
import { contentKey, contentText, informationContent, libraryContent, libraryRanking, parseHtml } from './informationContent';
import './informationPages.css';

const profiles = {
  '/banco-de-oportunidades-egressos/': { title:'Informações para egressos', description:'Orientação profissional e apoio para conectar sua formação às oportunidades de trabalho.', overview:'Sobre o serviço', action:{label:'Ver como participar',href:'#informacoes-2'} },
  '/banco-de-oportunidades-empresas/': { title:'Informações para empresas', description:'Encontre profissionais formados pelo Senac para as oportunidades da sua empresa.', overview:'Apoio à contratação' },
  '/banco-de-oportunidades-estudantes/': { title:'Informações para estudantes', description:'Conte com orientação profissional durante o curso e prepare seus próximos passos.', overview:'Orientação para sua carreira', action:{label:'Consultar cursos',href:links.courses} },
  '/carretas-escola/': { title:'Carretas-escola', description:'Educação profissional que percorre o Maranhão e chega a diferentes comunidades.', overview:'Conheça as unidades móveis' },
  '/privacidade-e-protecao-de-dados/': { title:'Privacidade e proteção de dados', description:'Consulte a política de privacidade e os canais de atendimento aos titulares de dados.' },
  '/institucional/projeto-politico-pedagogico/': { description:'Conheça o documento que orienta as concepções e as práticas educacionais do Senac Maranhão.' },
  '/institucional/parcerias/': { description:'Consulte os termos de cooperação técnica e os períodos de vigência informados pelo Senac Maranhão.' },
  '/idiomas/': { description:'Conheça a formação em línguas e a metodologia de ensino do Senac Maranhão.', overview:'Aprender para se comunicar', action:{label:'Consultar cursos',href:links.courses} },
};
const audiences = [
  {label:'Estudantes',path:'/banco-de-oportunidades-estudantes/'},
  {label:'Egressos',path:'/banco-de-oportunidades-egressos/'},
  {label:'Empresas',path:'/banco-de-oportunidades-empresas/'},
];
const Arrow = () => <ArrowRight size={20} variant="Linear" color="currentColor" aria-hidden="true"/>;

function Heading({ page, title = page.title, description, children }) {
  return <header className="info-heading">
    <h1>{title}</h1>
    {description && <p>{description}</p>}
    {children}
  </header>;
}

function SectionLinks({ items }) {
  if (items.length < 2) return null;
  return <nav className="info-section-nav" aria-label="Navegue nesta página">
    {items.map(item => <a href={'#'+item.id} key={item.id}>{item.title}<ArrowDown2 size={14} color="currentColor" aria-hidden="true"/></a>)}
  </nav>;
}

function RelatedPages({ items = [], title = 'Continue explorando' }) {
  if (!items.length) return null;
  return <section className="info-related" aria-label={title}>
    <h2>{title}</h2>
    <div>{items.map(item => <a href={localHref(item.path)} key={item.path}><span>{item.title}</span><Arrow/></a>)}</div>
  </section>;
}

function LibraryPage({ page, data }) {
  return <div className="information-page library-page">
    <Breadcrumb page={page}/>
    <div className="library-intro">
      <Heading page={page} description={data.description}/>
      <section className="library-online" aria-labelledby="library-online-title">
        <Book1 size={30} variant="Bulk" color="currentColor" aria-hidden="true"/>
        <div><h2 id="library-online-title">Sua próxima leitura começa aqui</h2>
          <p>Pesquise no acervo ou acesse a biblioteca digital do Senac.</p>
          <div className="library-online-actions">
            {data.catalog && <ActionLink href={data.catalog} arrow>Consultar acervo</ActionLink>}
            {data.digital && <a className="info-text-link" href={data.digital}>Biblioteca digital<Arrow/></a>}
          </div>
        </div>
      </section>
    </div>
    <SectionLinks items={[{id:'acervo-servicos',title:'Acervo e serviços'},{id:'acesso-horarios',title:'Acesso e horários'},{id:'bibliotecas',title:'Onde encontrar'}]}/>
    <div className="library-overview">
      <section className="info-section" id="acervo-servicos" aria-labelledby="library-collection-title">
        <h2 id="library-collection-title">Conhecimento para sua formação</h2>
        <Html html={data.collection} className="inner-prose info-prose"/>
        <h3>Como a biblioteca pode ajudar</h3>
        <Html html={data.services} className="inner-prose info-prose library-services"/>
      </section>
      <aside className="library-access" id="acesso-horarios" aria-labelledby="library-access-title">
        <h2 id="library-access-title">Planeje sua visita</h2>
        <div><h3>Quem pode utilizar</h3><p>{data.access}</p></div>
        <div className="library-hours"><Clock size={24} color="currentColor" aria-hidden="true"/><div><h3>Horário de funcionamento</h3><p>{data.hours}</p></div></div>
        <a className="info-text-link" href="#bibliotecas">Encontre uma biblioteca<Arrow/></a>
      </aside>
    </div>
    <section className="info-section library-locations" id="bibliotecas" aria-labelledby="library-locations-title">
      <div className="info-section-heading"><h2 id="library-locations-title">Onde encontrar</h2><a className="info-text-link" href={routeHref('/unidades/')}>Ver unidades<Arrow/></a></div>
      <div className="library-location-grid">
        <div className="library-location"><Location size={25} variant="Bulk" color="currentColor" aria-hidden="true"/><h3>Em São Luís</h3><Html html={'<ul>'+data.places+'</ul>'} className="inner-prose info-prose"/></div>
        <div className="library-location"><Book1 size={25} variant="Bulk" color="currentColor" aria-hidden="true"/><h3>Nas demais unidades</h3><Html html={'<ul>'+data.otherPlaces+'</ul>'} className="inner-prose info-prose"/></div>
      </div>
    </section>
    {data.extra.map(section => <section className="info-section" key={section.id}><h2>{section.title}</h2><Html html={section.html} className="inner-prose info-prose"/></section>)}
    <RelatedPages items={page.children} title="Conteúdos da biblioteca"/>
  </div>;
}

function FaqPage({ page, data }) {
  const [query,setQuery] = useState('');
  const questions = useMemo(() => {
    const body = parseHtml(data.sections.map(section=>section.html).join(''));
    return [...body.querySelectorAll('details')].map((item,index) => {
      const summary=item.querySelector('summary');
      const title=contentText(summary); summary?.remove();
      return { title, html:item.innerHTML, text:contentKey(title+' '+contentText(item)), id:`pergunta-${index}` };
    });
  },[data]);
  const filtered=questions.filter(item=>item.text.includes(contentKey(query.trim())));
  return <div className="information-page faq-page">
    <Breadcrumb page={{...page,title:'Perguntas frequentes'}}/>
    <Heading page={page} title="Perguntas frequentes" description="Encontre respostas sobre o Senac, os cursos e as oportunidades de formação."/>
    <div className="info-reading-layout has-aside">
      <div>
        <label className="info-search"><span className="sr-only">Buscar nas perguntas frequentes</span><SearchNormal1 size={22} color="currentColor" aria-hidden="true"/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Busque por um assunto"/></label>
        <p className="info-result-count" role="status">{filtered.length} {filtered.length===1?'pergunta encontrada':'perguntas encontradas'}</p>
        <div className="info-faq-list">{filtered.map(item => <details key={item.id} open={query.trim()?true:undefined}>
          <summary>{item.title}<ArrowDown2 size={20} color="currentColor" aria-hidden="true"/></summary>
          <Html html={item.html} className="inner-prose info-prose"/>
        </details>)}</div>
        {!filtered.length && <div className="info-no-results"><h2>Nenhuma pergunta encontrada</h2><p>Tente outro termo ou entre em contato com nossa equipe.</p><button onClick={()=>setQuery('')} type="button" className="info-text-link">Limpar busca<Arrow/></button></div>}
      </div>
      <aside className="info-help"><Sms size={28} color="currentColor" aria-hidden="true"/><h2>Ainda precisa de ajuda?</h2><p>Encontre o contato da sua unidade e fale com a equipe do Senac Maranhão.</p><ActionLink href={routeHref(links.contact)} arrow>Fale conosco</ActionLink><a className="info-text-link" href={routeHref(links.courses)}>Conheça os cursos<Arrow/></a></aside>
    </div>
  </div>;
}

function RankingPage({ page, data }) {
  return <div className="information-page">
    <Breadcrumb page={page}/><Heading page={page}/>
    <Html html={data.intro} className="inner-prose info-prose info-ranking-intro"/>
    <div className="info-table-scroll" role="region" aria-label="Ranking de profissionais e sugestões de cursos" tabIndex={0}>
      <table className="info-table"><caption>Profissionais mais solicitados</caption><thead><tr><th scope="col">Posição</th><th scope="col">Profissão</th><th scope="col">Perfil do profissional</th><th scope="col">Sugestão de cursos</th></tr></thead>
        <tbody>{data.rows.map(row=><tr key={row.position}><td>{row.position}</td>{row.values.map((value,i)=>i===0?<th scope="row" key={i}>{value}</th>:<td key={i}>{value}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <RelatedPages items={[{title:'Voltar à biblioteca',path:'/biblioteca/'},{title:'Consultar cursos',path:links.courses}]}/>
  </div>;
}

function EditorialPage({ page, data }) {
  const profile=profiles[page.path]||{};
  const opportunity=page.path.startsWith('/banco-de-oportunidades-');
  const unit=page.path.startsWith('/unidades/');
  const body=parseHtml(sanitizeHtml(page.html));
  const registration=opportunity && [...body.querySelectorAll('a[href]')].find(a=>/bancodeoportunidade/.test(a.getAttribute('href')));
  const participation=data.sections.find(section=>/participar/i.test(section.title));
  const action=registration?{label:'Cadastrar empresa e vaga',href:registration.getAttribute('href')}:profile.action;
  const actionHref=participation&&action?.href.startsWith('#')?'#'+participation.id:action?.href;
  const sections=data.sections.map(section=>({...section,title:section.title||profile.overview||''}));
  const titled=sections.filter(section=>section.title);
  const isPrivacy=page.path==='/privacidade-e-protecao-de-dados/';
  const dpoEmail=isPrivacy?(body.textContent.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)||[])[0]:null;
  const navigation=titled.length>1;
  const hasAside=Boolean(data.contact)||navigation;
  return <div className="information-page">
    <Breadcrumb page={{...page,title:profile.title||page.title}}/>
    <Heading page={page} title={profile.title||page.title} description={profile.description || (unit?'':page.excerpt||page.seoDescription)}>
      {action && <ActionLink className="info-primary-action" href={localHref(actionHref)} arrow>{action.label}</ActionLink>}
    </Heading>
    {opportunity && <nav className="info-audiences" aria-label="Públicos do Banco de Oportunidades">{audiences.map(item=><a href={routeHref(item.path)} key={item.path} aria-current={page.path===item.path?'page':undefined}>{item.label}</a>)}</nav>}
    {navigation && <details className="info-mobile-toc"><summary>Nesta página<ArrowDown2 size={18} color="currentColor" aria-hidden="true"/></summary><nav aria-label="Seções da página">{titled.map(section=><a href={'#'+section.id} key={section.id}>{section.title}</a>)}</nav></details>}
    <div className={'info-reading-layout'+(hasAside?' has-aside':'')}>
      <article className="info-reading-main">
        {sections.length ? sections.map(section=><section className="info-section" id={section.id} key={section.id}>
          {section.title && <h2>{section.title}</h2>}
          <Html html={section.html} className="inner-prose info-prose"/>
        </section>) : <div className="inner-empty"><h2>Informações e atendimento</h2><p>Novas informações desta área serão disponibilizadas aqui.</p></div>}
        {opportunity && !registration && <a className="info-text-link" href={routeHref(links.courses)}>Consulte a programação de cursos<Arrow/></a>}
        {dpoEmail && <section className="info-contact-request" aria-label="Contato para solicitações sobre dados pessoais"><h2>Solicitação do titular</h2><p>Entre em contato com o encarregado de proteção de dados para encaminhar sua solicitação.</p><a className="info-text-link" href={'mailto:'+dpoEmail}>{dpoEmail}<Arrow/></a></section>}
      </article>
      {hasAside && <aside className="info-sidebar">
        {navigation && <nav className="info-toc" aria-label="Nesta página"><h2>Nesta página</h2>{titled.map(section=><a href={'#'+section.id} key={section.id}>{section.title}<ArrowDown2 size={14} color="currentColor" aria-hidden="true"/></a>)}</nav>}
        {data.contact && <section className="info-contact"><h2>{unit?'Contato da unidade':'Fale com a equipe'}</h2><Html html={data.contact} className="inner-prose info-prose"/>{unit && <ActionLink href={routeHref(links.courses)} arrow>Consultar cursos</ActionLink>}</section>}
      </aside>}
    </div>
    <RelatedPages items={page.children} title={page.path.startsWith('/biblioteca/')?'Conteúdos da biblioteca':'Explore esta seção'}/>
  </div>;
}

export default function InformationPage({ page }) {
  const data=useMemo(()=>informationContent(page.html,{path:page.path}),[page.html,page.path]);
  const library=useMemo(()=>page.path==='/biblioteca/'?libraryContent(page.html):null,[page.html,page.path]);
  const ranking=useMemo(()=>page.path==='/biblioteca/fique-ligado/'?libraryRanking(page.html):null,[page.html,page.path]);
  if(library)return <LibraryPage page={page} data={library}/>;
  if(ranking)return <RankingPage page={page} data={ranking}/>;
  if(page.path==='/faq/' && data.sections.some(section=>section.html.includes('<details')))return <FaqPage page={page} data={data}/>;
  return <EditorialPage page={page} data={data}/>;
}
