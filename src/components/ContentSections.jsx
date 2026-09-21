import React, { useState } from 'react';
import { asset, links, notices, services, stories, videoId } from '../data/content';
import { ActionLink, Icon, PhotoCard, SectionHeading } from './Ui';
import BannerCarousel from './BannerCarousel';

export function Services() {
  return <section className="container section-block" id="servicos" aria-labelledby="services-heading">
    <SectionHeading id="services-heading" title="Conte com o Senac"
      subtitle="Acesse nossos cursos, serviços, programas e oportunidades no Senac Maranhão" />
    <div className="services-grid">{services.map(item => <PhotoCard key={item.title} item={item} />)}</div>
  </section>;
}
export function Institutional() {
  const slides = [
    { image:'5e143.png', title:'Ouvidoria Senac', alt:'Ouvidoria Senac — acesse nosso canal de atendimento',
      href:links.ombudsman, description:'A Ouvidoria é um canal de comunicação direto e eficiente para o recebimento de reclamações, solicitações, elogios, sugestões e denúncias.' },
    { image:'b86aa.png', alt:'Conheça o Banco de Oportunidades do Senac Maranhão.', href:links.opportunities },
  ];
  return <div className="section-block"><BannerCarousel slides={slides} variant="institutional" label="Serviços institucionais" /></div>;
}
export function News() {
  const [main, ...remaining] = stories;
  return <section className="container section-block" id="noticias" aria-labelledby="news-heading">
    <SectionHeading id="news-heading" title="Últimas notícias"
      subtitle="Fique atualizado com as notícias mais recentes do Senac Maranhão"
      action={{ label:'Ver todas', href:links.news }} />
    <div className="news-grid">
      <a className="main-story" href={main.href}>
        <img src={asset(main.image)} alt="" loading="lazy" decoding="async" />
        <div className="photo-card-shade" />
        <div className="main-story-content">
          <span className="news-tag" style={{ backgroundColor:main.color }}>{main.category}</span>
          <h3><span>Educação e Tecnologia</span>{' '}<span>foram pautas principais no</span>{' '}<span>III Congresso Sesc/Senac-MA</span></h3><p>{main.excerpt}</p>
        </div>
      </a>
      <div className="secondary-stories">{remaining.map(story => <a className="small-story" href={story.href || links.news} key={story.title}>
        <div className="small-story-photo"><img src={asset(story.image)} alt="" loading="lazy" decoding="async" /></div>
        <div><span className="news-tag" style={{ backgroundColor:story.color }}>{story.category}</span><h3>{story.title}</h3></div>
      </a>)}</div>
    </div>
  </section>;
}
export function Notices() {
  return <section className="container section-block" id="editais" aria-labelledby="notices-heading">
    <SectionHeading id="notices-heading" title="Nossos editais" subtitle="Confira as oportunidades do Senac Maranhão em aberto." />
    <div className="notices-grid">{notices.map(item => <PhotoCard key={item.title} item={item} notice />)}</div>
  </section>;
}
export function InstitutionalVideo() {
  const [playing, setPlaying] = useState(false);
  return <section className="video-section section-block" id="senac" aria-labelledby="video-heading">
    <div className="container">
      <SectionHeading id="video-heading" title="Senac 80 anos"
        subtitle="Formação profissional, inclusão e oportunidades para milhares de maranhenses." />
      <div className="video-frame">
        {playing ? <iframe title="Senac 80 anos — vídeo institucional" src={'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1'}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          : <button className="video-poster" onClick={() => setPlaying(true)} aria-label="Assistir ao vídeo Senac 80 anos">
            <img className="video-photo" src={asset('9a2a2.png')} alt="Estudante com uma câmera em frente ao Senac" loading="lazy" decoding="async" />
            <span className="youtube-play"><img src={asset('4a1b6.svg')} alt="" /><img className="youtube-triangle" src={asset('ce27e.svg')} alt="" /></span>
          </button>}
      </div>
    </div>
  </section>;
}
export function Contact() {
  return <section className="container contact-section section-block" id="contato" aria-labelledby="contact-heading">
    <div><h2 id="contact-heading">Fale conosco</h2>
      <p>Tire suas dúvidas e encontre o atendimento<br className="desktop-break" /> ideal para o que você precisa.</p>
      <ActionLink href={links.contact} className="contact-button" arrow>Entrar em contato</ActionLink>
    </div>
    <img className="contact-logo" src={asset('c775f.svg')} alt="Senac" width="278" height="152" loading="lazy" />
  </section>;
}
export function Footer() {
  const columns = [
    { title:'Sobre o Senac', items:[['Quem somos',links.about],['Onde estamos',links.units],['Carretas-Escola',links.mobileSchool],['Ouvidoria',links.ombudsman],['Privacidade e Proteção de Dados',links.privacy]] },
    { title:'Cursos', items:[['Presencial',links.courses],['EAD',links.ead],['PSG – Programa Senac de Gratuidade',links.psg]] },
    { title:'Serviços', items:[['Restaurante Senac',links.restaurant],['Banco de Oportunidades',links.opportunities],['Biblioteca',links.library],['Licitações',links.tenders]] },
  ];
  return <footer className="site-footer section-block">
    <div className="footer-top"><div className="container footer-content">
      <div className="footer-brand"><a href="/" aria-label="Senac Maranhão — início"><img src={asset('3783e.svg')} alt="Senac" width="135" height="74" /></a>
        <div className="footer-socials">
          {['facebook','instagram','youtube'].map(name => <a href={links[name]} key={name} aria-label={name + ' do Senac Maranhão'}><Icon name={name} /></a>)}
        </div>
      </div>
      <div className="footer-columns">
        {columns.map(column => <nav aria-label={column.title} className="footer-column" key={column.title}>
          <h2>{column.title}</h2><ul>{column.items.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
        </nav>)}
        <div className="footer-address"><h2>Endereço do Departamento Regional</h2>
          <address>Condomínio Fecomércio/Sesc/Senac – Edifício Francisco Guimarães e Souza. Av. dos Holandeses, S/N, Quadra 04, Bairro Jardim Renascença.<br />CEP: 65075-650 – São Luís-MA</address>
        </div>
      </div>
    </div></div>
    <div className="copyright">Copyright 2020. Todos os Direitos Reservados | Serviços Nacional de Aprendizagem Comercial - MA | <a href={links.privacy}>Política de Privacidade.</a></div>
  </footer>;
}
