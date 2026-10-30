import React from 'react';
import { ArrowRight2 } from 'iconsax-react';
import { routeHref } from '../data/basePath';

export default function PageBreadcrumb({ page }) {
  const ancestor = page.path !== '/unidades/' && page.path.startsWith('/unidades/') ? {title:'Unidades',path:'/unidades/'}
    : page.path !== '/institucional/' && page.path.startsWith('/institucional/') ? {title:'O Senac',path:'/institucional/'}
    : page.path !== '/biblioteca/' && page.path.startsWith('/biblioteca/') ? {title:'Biblioteca',path:'/biblioteca/'}
    : page.path.startsWith('/banco-de-oportunidades-') ? {title:'Banco de Oportunidades',path:'/encaminhamento-ao-mercado-de-trabalho/'}
    : page.kind==='post' ? {title:'Notícias',path:'/noticias/'}
    : page.kind==='course' ? {title:'Cursos',path:'/cursos-senac/'}
    : page.kind==='notice' ? {title:page.parent==='/resultados-psg/'?'Resultados PSG':page.parent==='/licitacoes-2016/'?'Licitações':'Editais PSG',path:page.parent} : null;
  return <nav className="inner-breadcrumb" aria-label="Você está aqui">
    <a href={routeHref('/')}>Início</a><ArrowRight2 size={15} variant="Bold" color="currentColor" aria-hidden="true"/>
    {ancestor && <><a href={routeHref(ancestor.path)}>{ancestor.title}</a><ArrowRight2 size={15} variant="Bold" color="currentColor" aria-hidden="true"/></>}
    <span aria-current="page">{page.title}</span>
  </nav>;
}
