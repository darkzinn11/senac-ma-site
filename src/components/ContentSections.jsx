import React, { useEffect, useState } from 'react';
import { ArrowUp2 } from 'iconsax-react';
import { asset, links, notices, services, stories, videoId } from '../data/content';
import useAsync from '../api/useAsync';
import { loadBanners, loadHomeNews } from '../api/content';
import { useSiteData } from '../api/SiteData';
import { publicUrl, routeHref } from '../data/basePath';
import { ActionLink, Icon, PhotoCard, SectionHeading } from './Ui';
import BannerCarousel from './BannerCarousel';

export function Services() {
  return <section className="container section-block" id="servicos" aria-labelledby="services-heading">
    <SectionHeading id="services-heading" title="Conte com o Senac"
      subtitle="Acesse nossos cursos, serviços, programas e oportunidades no Senac Maranhão" />
    <div className="services-grid">{services.map(item => <PhotoCard key={item.title} item={item} />)}</div>
  </section>;
}
const opportunitiesSlide = { image:'a7d1b.png', title:'Conheça o banco de oportunidades', alt:'Conheça o Banco de Oportunidades do Senac Maranhão.',
  href:links.opportunities, description:'O Banco de Oportunidades tem como objetivo realizar a intermediação entre os alunos egressos do Senac e as oportunidades existentes no mundo do trabalho.' };
export function Institutional() {
  const banners = useAsync(() => loadBanners('institutional'), []);
  const fallback = [
    { image:'5e143.png', title:'Ouvidoria Senac', alt:'Ouvidoria Senac — acesse nosso canal de atendimento',
      href:links.ombudsman, description:'A Ouvidoria é um canal de comunicação direto e eficiente para o recebimento de reclamações, solicitações, elogios, sugestões e denúncias.' },
    opportunitiesSlide,
  ];
  // Carrega do admin (aba "Carrossel institucional"). API fora do ar: slides de reserva. Lista vazia: o admin não
  // quer banners aqui, então o bloco some. Enquanto carrega, reserva a altura para evitar salto de layout.
  if (banners.status === 'loading') return <div className="section-block container institutional-placeholder" aria-hidden="true" />;
  // O admin manda em TODOS os slides (imagem, link e texto alternativo). O layout do Figma do Banco de Oportunidades
  // (foto + logo e texto em HTML) só entra como reserva, quando a API está fora do ar (veja `fallback`).
  const slides = banners.status === 'error' ? fallback : banners.data;
  if (!slides?.length) return null;
  return <div className="section-block container"><BannerCarousel slides={slides} variant="institutional" label="Serviços institucionais" /></div>;
}
const tagColors = ['#4f7afa', '#fa1466', '#004b8d', '#a3cc00'];
// Foto da notícia; se o arquivo ainda não existe no servidor de mídia, mostra um fundo neutro (sem imagem quebrada).
function StoryPhoto({ src, className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return null;
  return <img className={className} src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}
function toStories(items) {
  return items.map((item, index) => ({ category:item.category || 'Notícias', color:tagColors[index % tagColors.length], cover:item.cover,
    title:item.title, excerpt:item.excerpt, href:item.path }));
}
export function News() {
  const state = useAsync(loadHomeNews, []);
  const loading = state.status === 'loading';
  // API fora do ar ou sem notícias: mantém as chamadas aprovadas no layout.
  const list = state.status === 'ready' && state.data.length ? toStories(state.data)
    : state.status === 'loading' ? [] : stories.map(story => ({ ...story, cover:asset(story.image) }));
  const [main, ...remaining] = list;
  return <section className="container section-block" id="noticias" aria-labelledby="news-heading" aria-busy={loading}>
    <SectionHeading id="news-heading" title="Últimas notícias"
      subtitle="Fique atualizado com as notícias mais recentes do Senac Maranhão"
      action={{ label:'Ver todas', href:links.news }} />
    <div className="news-grid">
      {main ? <a className="main-story" href={main.href}>
        <StoryPhoto src={main.cover} />
        <div className="photo-card-shade" />
        <div className="main-story-content">
          <span className="news-tag" style={{ backgroundColor:main.color }}>{main.category}</span>
          <h3 className={main.title.length > 70 ? 'is-long' : undefined}>{main.title}</h3>{main.excerpt && <p>{main.excerpt}</p>}
        </div>
      </a> : <div className="main-story is-placeholder" aria-hidden="true" />}
      <div className="secondary-stories">{main ? remaining.map(story => <a className="small-story" href={story.href || links.news} key={story.href + story.title}>
        <div className="small-story-photo"><StoryPhoto src={story.cover} /></div>
        <div><span className="news-tag" style={{ backgroundColor:story.color }}>{story.category}</span><h3>{story.title}</h3></div>
      </a>) : [0,1,2].map(n => <div className="small-story is-placeholder" key={n} aria-hidden="true"><div className="small-story-photo" /></div>)}</div>
    </div>
  </section>;
}
export function Notices() {
  return <section className="container section-block" id="editais" aria-labelledby="notices-heading">
    <SectionHeading id="notices-heading" title="Nossos editais" subtitle="Confira as oportunidades do Senac Maranhão em aberto" />
    <div className="notices-grid">{notices.map(item => <PhotoCard key={item.title} item={item} notice />)}</div>
  </section>;
}
export function InstitutionalVideo() {
  const [playing, setPlaying] = useState(false);
  const { highlight = {} } = useSiteData().settings;
  if (highlight.enabled === false) return null;
  const banner = highlight.bannerUrl;
  const id = highlight.videoId || videoId;
  const customPoster = highlight.videoId ? 'https://i.ytimg.com/vi/' + highlight.videoId : '';
  return <section className={'video-section senac80-section section-block' + (banner ? ' has-banner' : '')} id="senac" aria-label="Senac 80 anos">
    {banner
      ? <picture>
        {highlight.bannerMobileUrl && <source media="(max-width: 768px)" srcSet={highlight.bannerMobileUrl} />}
        <img className="senac80-background senac80-custom-banner" src={banner} alt={highlight.bannerAlt} />
      </picture>
      : <img className="senac80-background" src={publicUrl('/assets/senac80/453e1.png')} alt="" aria-hidden="true" />}
    <div className="container senac80-inner">
      {banner ? <div className="senac80-brand-spacer" aria-hidden="true" /> : <div className="senac80-brand" aria-hidden="true">
        <div className="senac80-brand-row">
          <div className="senac80-lockup">
            <img className="senac80-senac-logo" src={publicUrl('/assets/senac80/5f907.svg')} alt="" />
            <img className="senac80-system-logo" src={publicUrl('/assets/senac80/40437.svg')} alt="" />
          </div>
          <img className="senac80-divider" src={publicUrl('/assets/senac80/a00a2.svg')} alt="" />
          <img className="senac80-mark" src={publicUrl('/assets/senac80/0d0d4.svg')} alt="" />
        </div>
        <img className="senac80-tagline" src={publicUrl('/assets/senac80/63eeb.png')} alt="" />
      </div>}
      <div className="video-frame senac80-video-frame">
        {playing ? <iframe title="Senac 80 anos — vídeo institucional" src={'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1'}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          : <button className="video-poster" onClick={() => setPlaying(true)} aria-label="Assistir ao vídeo Senac 80 anos">
            {customPoster
              ? <img className="video-photo video-photo-yt" src={customPoster + '/maxresdefault.jpg'} alt="" loading="lazy" decoding="async"
                onError={event => { if (!event.currentTarget.src.endsWith('/hqdefault.jpg')) event.currentTarget.src = customPoster + '/hqdefault.jpg'; }} />
              : <img className="video-photo" src={publicUrl('/assets/senac80/9a2a2.png')} alt="Estudante com uma câmera em frente ao Senac" loading="lazy" decoding="async" />}
            <span className="youtube-play"><img className="youtube-play-bg" src={publicUrl('/assets/senac80/ac7ff.svg')} alt="" /><img className="youtube-triangle" src={publicUrl('/assets/senac80/ddbc7.svg')} alt="" /></span>
          </button>}
      </div>
    </div>
  </section>;
}
export function Contact() {
  return <section className="container contact-section section-block" id="contato" aria-labelledby="contact-heading">
    <div><h2 id="contact-heading">Fale conosco</h2>
      <p>Tire suas dúvidas e encontre o atendimento<br className="desktop-break" /> ideal para o que você precisa</p>
      <ActionLink href={links.contact} className="contact-button" arrow>Entrar em contato</ActionLink>
    </div>
    <img className="contact-logo" src={publicUrl('/assets/logo-branca-senac.svg')} alt="Senac" width="342" height="163" loading="lazy" />
  </section>;
}
export function Footer() {
  const { settings } = useSiteData();
  const social = { facebook:settings.facebook || links.facebook, instagram:settings.instagram || links.instagram, youtube:settings.youtube || links.youtube };
  const columns = [
    { title:'Sobre o Senac', items:[['Quem somos',links.about],['Onde estamos',links.units],['Carretas-Escola',links.mobileSchool],['Ouvidoria',links.ombudsman],['Privacidade e Proteção de Dados',links.privacy]] },
    { title:'Cursos', items:[['Presencial',links.courses],['EAD',links.ead],['PSG – Programa Senac de Gratuidade',links.psg]] },
    { title:'Serviços', items:[['Restaurante Senac',links.restaurant],['Banco de Oportunidades',links.opportunities],['Biblioteca',links.library],['Licitações',links.tenders]] },
  ];
  return <footer className="site-footer section-block">
    <div className="footer-top"><div className="container footer-content">
      <div className="footer-brand"><a href={routeHref('/')} aria-label="Senac Maranhão — início"><img src={asset('3783e.svg')} alt="Senac" width="135" height="74" /></a>
        <div className="footer-socials">
          {['facebook','instagram','youtube'].map(name => <a href={social[name]} key={name} aria-label={name + ' do Senac Maranhão'}><Icon name={name} /></a>)}
        </div>
      </div>
      <div className="footer-columns">
        {columns.map(column => <nav aria-label={column.title} className="footer-column" key={column.title}>
          <h2>{column.title}</h2><ul>{column.items.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
        </nav>)}
        <div className="footer-address"><h2>Endereço do Departamento Regional</h2>
          {settings.address ? <address>{settings.address}</address> : <address>Condomínio Fecomércio/Sesc/Senac – Edifício Francisco Guimarães e Souza. Av. dos Holandeses, S/N, Quadra 04, Bairro Jardim Renascença.<br />CEP: 65075-650 – São Luís-MA</address>}
          <p className="footer-phone">Central de atendimento: <a href={'tel:+55' + String((settings.phone || '(98) 3194-6400')).replace(/\D/g, '')}>{(settings.phone || '(98) 3194-6400')}</a></p>
        </div>
      </div>
    </div>
      <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top:0, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })} aria-label="Voltar ao topo">
        <ArrowUp2 size={24} variant="Bold" color="currentColor"/>
      </button>
    </div>
    <div className="copyright">
      <p className="footer-company"><strong>Razão Social:</strong> Serviço Nacional de Aprendizagem Comercial - Senac <span aria-hidden="true">|</span> <strong>CNPJ:</strong> 03.760.035/0001-17</p>
      <p>Copyright {new Date().getFullYear()}. Todos os Direitos Reservados | Serviço Nacional de Aprendizagem Comercial - MA | <a href={links.privacy}>Política de Privacidade.</a></p>
      <a className="footer-credit" href="https://sitw.com.br/" target="_blank" rel="noopener noreferrer">
        <span>Desenvolvido por</span>
        <img src={publicUrl('/assets/sitw.svg')} alt="SITW Soluções Digitais" width="59" height="20" loading="lazy" />
      </a>
    </div>
  </footer>;
}
