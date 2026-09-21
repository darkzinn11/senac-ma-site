import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import BannerCarousel from './components/BannerCarousel';
import CourseFinder from './components/CourseFinder';
import QuickAccess from './components/QuickAccess';
import Courses, { CourseDialog } from './components/Courses';
import { Contact, Footer, Institutional, InstitutionalVideo, News, Notices, Services } from './components/ContentSections';
import { coursePreview, heroSlides } from './data/content';
import PortalPages from './components/PortalPages';
import { getPage, localHref, normalizePath, resolvePage } from './data/portalRoutes';

const emptyFilters = { query:'', area:'', city:'', unit:'', type:'' };
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export default function App() {
  const [route,setRoute] = useState(() => normalizePath(window.location.pathname));
  const [loadingRoute,setLoadingRoute] = useState(() => window.location.pathname !== '/' && !getPage(window.location.pathname));
  const [,refreshRoute] = useState(0);
  useEffect(() => {
    if (route==='/' || getPage(route)) { setLoadingRoute(false); return; }
    let current=true;
    setLoadingRoute(true);
    resolvePage(route).then(() => {
      if (current) { refreshRoute(n=>n+1); setLoadingRoute(false); }
    }).catch(() => { if (current) setLoadingRoute(false); });
    return () => { current=false; };
  }, [route]);
  useEffect(() => {
    const onBack = () => { const path=normalizePath(window.location.pathname); setLoadingRoute(path!=='/'&&!getPage(path)); setRoute(path); };
    window.addEventListener('popstate',onBack);
    return () => window.removeEventListener('popstate',onBack);
  }, []);
  useEffect(() => {
    const current = getPage(route);
    document.title = current ? current.title + ' | Senac Maranhão' : 'Senac Maranhão';
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }, [route]);
  function navigate(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.hasAttribute('download') || anchor.target==='_blank') return;
    const href = localHref(anchor.getAttribute('href'));
    if (!href.startsWith('/') || href.startsWith('//')) return;
    const destination = normalizePath(href);
    event.preventDefault();
    if (destination === route) { window.scrollTo({top:0,behavior:'smooth'}); return; }
    window.history.pushState({},'',href);
    setLoadingRoute(destination!=='/'&&!getPage(destination));
    setRoute(destination);
  }
  useEffect(() => {
    const updateDesktopScale = () => {
      const scale = window.innerWidth > 1440 ? window.innerWidth / 1440 : 1;
      document.documentElement.style.setProperty('--wide-layout-scale', String(scale));
    };
    updateDesktopScale();
    window.addEventListener('resize', updateDesktopScale);
    return () => {
      window.removeEventListener('resize', updateDesktopScale);
      document.documentElement.style.removeProperty('--wide-layout-scale');
    };
  }, []);
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const results = useMemo(() => coursePreview.filter(course => {
    const query = normalize(applied.query);
    return (!query || normalize(course.title + ' ' + course.area).includes(query)) &&
      ['area','city','unit','type'].every(key => !applied[key] || course[key] === applied[key]);
  }), [applied]);
  function search() {
    setApplied({ ...filters }); setSearched(true);
    requestAnimationFrame(() => document.getElementById('cursos')?.scrollIntoView({
      behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start',
    }));
  }
  function reset() { setFilters({ ...emptyFilters }); setApplied({ ...emptyFilters }); setSearched(false); }
  return <>
    <a className="skip-link" href="#main">Ir para o conteúdo</a>
    <div className="site-shell" onClickCapture={navigate}><Header key={route} />
      <main id="main">
        {route==='/' ? <>
          <BannerCarousel slides={heroSlides} initial={2} label="Destaques do Senac" />
          <CourseFinder filters={filters} setFilters={setFilters} onSearch={search} onReset={reset} />
          <Courses courses={results} searched={searched} filters={applied} onReset={reset} onDetails={setSelected} />
          <QuickAccess />
          <Services /><Institutional /><News /><Notices /><InstitutionalVideo /><Contact />
        </> : loadingRoute && !getPage(route) ? <div className="container inner-not-found" role="status"><h1>Carregando página...</h1><p>Consultando informações públicas do Senac Maranhão.</p></div> : <PortalPages page={getPage(route)} path={route} />}
      </main>
      <Footer />
    </div>
    <CourseDialog course={selected} onClose={() => setSelected(null)} />
  </>;
}
