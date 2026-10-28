import React, { useEffect, useMemo, useRef, useState } from 'react';
import BannerCarousel from './BannerCarousel';
import CourseFinder from './CourseFinder';
import QuickAccess from './QuickAccess';
import Courses from './Courses';
import { Contact, Institutional, InstitutionalVideo, News, Notices, Services } from './ContentSections';
import { coursePreview, heroSlides } from '../data/content';
import useAsync from '../api/useAsync';
import { useSiteData } from '../api/SiteData';
import { loadBanners } from '../api/content';
import { loadCategories, loadFeaturedCourses, searchCourses, toPreview } from '../api/courses';

const emptyFilters = { query:'', area:'', city:'', unit:'', type:'' };

function HeroBanner() {
  const banners = useAsync(loadBanners, []);
  // Mostra a arte local imediatamente enquanto a API valida as imagens dos banners.
  if (banners.status === 'loading') return <BannerCarousel slides={heroSlides} initial={0} label="Destaques do Senac" />;
  // API fora do ar: vale a arte aprovada no layout (reserva). API respondeu com lista vazia: o admin não quer
  // banners, então a seção some (sem carrossel quebrado).
  if (banners.status === 'error') return <BannerCarousel slides={heroSlides} initial={2} label="Destaques do Senac" />;
  if (!banners.data?.length) return <div className="hero-empty" hidden />;
  return <BannerCarousel slides={banners.data} initial={0} label="Destaques do Senac" />;
}

export default function Home() {
  const { units } = useSiteData();
  const categories = useAsync(() => loadCategories().catch(() => []), []);
  const featured = useAsync(async () => (await loadFeaturedCourses()).map(toPreview), []);
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState({ status:'idle', items:[] });
  const searchSeq = useRef(0);
  const cities = useMemo(() => [...new Set(units.map(unit => unit.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [units]);
  const areas = useMemo(() => categories.data?.length ? categories.data.map(category => category.name) : [...new Set(coursePreview.map(course => course.area))], [categories.data]);

  useEffect(() => {
    if (!searched) return undefined;
    const seq = ++searchSeq.current;
    setFound(current => ({ ...current, status:'loading' }));
    const slug = (categories.data || []).find(category => category.name === applied.area)?.id || '';
    searchCourses({ q:applied.query, category:slug, type:applied.type }).then(list => {
      if (seq !== searchSeq.current) return;
      // Cidade e unidade vêm das turmas públicas (a API só filtra nome, área e tipo).
      const items = list.filter(course => (!applied.city || course.cities.includes(applied.city)) && (!applied.unit || course.units.includes(applied.unit)));
      setFound({ status:'ready', items:items.map(toPreview) });
    }).catch(() => { if (seq === searchSeq.current) setFound({ status:'error', items:[] }); });
    return () => { searchSeq.current += 1; };
  }, [applied, searched, categories.data]);

  function search() {
    setApplied({ ...filters }); setSearched(true);
    requestAnimationFrame(() => document.getElementById('cursos')?.scrollIntoView({
      behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start',
    }));
  }
  function reset() { setFilters({ ...emptyFilters }); setApplied({ ...emptyFilters }); setSearched(false); setFound({ status:'idle', items:[] }); }
  const featuredItems = featured.status === 'error' || (featured.status === 'ready' && !featured.data.length) ? coursePreview : featured.data || [];
  const showing = searched ? found.items : featuredItems;
  const loading = searched ? found.status === 'loading' || found.status === 'idle' : featured.status === 'loading';
  return <>
    <HeroBanner />
    <CourseFinder filters={filters} setFilters={setFilters} onSearch={search} onReset={reset} cities={cities} areas={areas} units={units} />
    <QuickAccess />
    <Courses courses={showing} searched={searched} filters={applied} onReset={reset} loading={loading} error={searched && found.status === 'error'} units={units} />
    <Services /><Institutional /><News /><Notices /><InstitutionalVideo /><Contact />
  </>;
}
