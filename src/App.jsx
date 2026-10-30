import React, { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import { Footer } from './components/ContentSections';
import Home from './components/Home';
import PortalPages from './components/PortalPages';
import SearchResults from './components/SearchResults';
import AccessibilityMenu from './components/AccessibilityMenu';
import { ActionLink } from './components/Ui';
import { SiteDataProvider } from './api/SiteData';
import { peekRoute, resolveRoute } from './api/content';
import { applySeo } from './api/seo';
import { appPath, routeHref } from './data/basePath';
import { isFilePath, localHref, normalizePath } from './data/portalRoutes';

// Rotas temporariamente indisponíveis; remova da lista quando forem liberadas.
const inactiveRoutes = new Set(['/solicite-uma-visita/', '/para-sua-empresa/aprendizagem/']);
const localRoutes = ['/', '/pesquisa/'];
const isLocalRoute = path => localRoutes.includes(path);
const currentRoute = () => normalizePath(appPath(window.location.pathname));
const MAX_REDIRECTS = 6;

// Segue redirecionamentos da API (301) até o destino final; 410 vira "removido".
async function follow(start) {
  let path = start;
  for (let hop = 0; hop < MAX_REDIRECTS; hop += 1) {
    if (inactiveRoutes.has(path)) return { type: 'notfound', path };
    const result = await resolveRoute(path);
    if (result.type !== 'redirect') return { ...result, path };
    if (result.status === 410 || !result.to) return { type: 'gone', path };
    if (/^[a-z][a-z0-9+.-]*:/i.test(result.to)) return { type: 'external', to: result.to, path };
    path = normalizePath(localHref(result.to));
  }
  return { type: 'notfound', path };
}
const fromResult = (route, result) => result.type === 'page' ? { route, status: 'ready', page: result.page }
  : { route, status: result.type === 'gone' ? 'gone' : 'notfound', page: null };

function initialView(route) {
  if (inactiveRoutes.has(route)) return { route, status: 'notfound', page: null };
  if (isLocalRoute(route)) return { route, status: 'ready', page: null };
  const cached = peekRoute(route);
  return cached && cached.type !== 'redirect' ? fromResult(route, cached) : null;
}

function Message({ title, children, role = 'status' }) {
  return <div className="container inner-not-found" role={role}><h1>{title}</h1>{children}</div>;
}

function PageSkeleton() {
  return <div className="container page-skeleton" role="status" aria-live="polite">
    <span className="sr-only">Carregando página</span>
    <div className="page-skeleton-layout" aria-hidden="true">
      <div className="page-skeleton-breadcrumb skeleton-block" />
      <div className="page-skeleton-title skeleton-block" />
      <div className="page-skeleton-subtitle skeleton-block" />
      <div className="page-skeleton-body">
        <div className="page-skeleton-copy">
          <div className="skeleton-block page-skeleton-heading" />
          <div className="skeleton-block page-skeleton-line" />
          <div className="skeleton-block page-skeleton-line" />
          <div className="skeleton-block page-skeleton-line is-medium" />
          <div className="skeleton-block page-skeleton-line" />
          <div className="skeleton-block page-skeleton-line is-short" />
        </div>
        <div className="page-skeleton-aside">
          <div className="skeleton-block page-skeleton-aside-title" />
          <div className="skeleton-block page-skeleton-line" />
          <div className="skeleton-block page-skeleton-line is-medium" />
          <div className="skeleton-block page-skeleton-action" />
        </div>
      </div>
    </div>
  </div>;
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const [view, setView] = useState(() => initialView(currentRoute()));
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setView(null); setAttempt(n => n + 1); }, []);

  useEffect(() => {
    const onBack = () => setRoute(currentRoute());
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, []);

  // Resolve a rota atual na API. A tela anterior continua visível enquanto a nova carrega;
  // o skeleton só substitui a tela anterior se demorar (evita piscar o layout).
  useEffect(() => {
    if (inactiveRoutes.has(route)) { setView({ route, status: 'notfound', page: null }); setSlow(false); return undefined; }
    if (isLocalRoute(route)) { setView({ route, status: 'ready', page: null }); setSlow(false); return undefined; }
    let active = true;
    setSlow(false);
    const timer = setTimeout(() => { if (active) setSlow(true); }, 250);
    follow(route).then(result => {
      if (!active) return;
      if (result.type === 'external') { window.location.replace(result.to); return; }
      if (result.path !== route) {
        // 301: troca a URL no histórico (sem criar nova entrada) e segue para o destino.
        window.history.replaceState({}, '', routeHref(result.path));
        setRoute(result.path);
        return;
      }
      setView(fromResult(route, result)); setSlow(false);
    }).catch(() => { if (active) { setView({ route, status: 'error', page: null }); setSlow(false); } });
    return () => { active = false; clearTimeout(timer); };
  }, [route, attempt]);

  // Links: rotas do site navegam sem recarregar; arquivos e hosts externos abrem à parte.
  useEffect(() => {
    const currentHost = window.location.hostname.replace(/^www\./, '');
    const updateExternalLinks = root => {
      const anchors = root?.matches?.('a[href]') ? [root] : [...(root?.querySelectorAll?.('a[href]') || [])];
      anchors.forEach(anchor => {
        const raw = anchor.getAttribute('href');
        if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
        const local = localHref(raw);
        if (local.startsWith('/') && !local.startsWith('//')) {
          if (isFilePath(local)) { // documentos (PDF etc.) abrem em nova aba
            anchor.target = '_blank';
            anchor.setAttribute('rel', 'noopener noreferrer');
            return;
          }
          const href = routeHref(local);
          if (href !== raw) anchor.setAttribute('href', href);
          // data-new-tab: o admin pediu nova aba (ex.: banner com open_in_new_tab); respeita mesmo em rota interna.
          if (anchor.hasAttribute('data-new-tab')) { anchor.target = '_blank'; anchor.setAttribute('rel', 'noopener noreferrer'); }
          else anchor.removeAttribute('target');
          return;
        }
        let url;
        try { url = new URL(raw, window.location.href); } catch { return; }
        if (!/^https?:$/.test(url.protocol)) return;
        const targetHost = url.hostname.replace(/^www\./, '');
        if (targetHost === currentHost) return;
        anchor.target = '_blank';
        const rel = new Set((anchor.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
        rel.add('noopener');
        rel.add('noreferrer');
        anchor.setAttribute('rel', [...rel].join(' '));
      });
    };
    updateExternalLinks(document);
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') updateExternalLinks(mutation.target);
        mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) updateExternalLinks(node); });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    return () => observer.disconnect();
  }, []);

  // SEO por rota (título, descrição, canonical, robots) a partir dos campos da API.
  const shown = view && view.route === route ? view : null;
  useEffect(() => {
    if (!view) return;
    const page = view.page;
    if (view.route === '/') applySeo({ path: '/' });
    else if (view.route === '/pesquisa/') applySeo({ title: 'Pesquisa', path: view.route, noindex: true });
    else if (view.status === 'ready' && page) applySeo({ title: page.seoTitle || page.title, description: page.seoDescription || page.excerpt, path: view.route });
    else if (view.status === 'gone') applySeo({ title: 'Conteúdo removido', path: view.route, noindex: true });
    else if (view.status === 'error') applySeo({ title: 'Página indisponível', path: view.route, noindex: true });
    else applySeo({ title: 'Página não encontrada', path: view.route, noindex: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view]);

  function navigate(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.hasAttribute('download') || anchor.target === '_blank') return;
    const href = localHref(appPath(anchor.getAttribute('href')));
    if (!href.startsWith('/') || href.startsWith('//') || isFilePath(href)) return;
    const destination = normalizePath(href);
    event.preventDefault();
    if (destination === route) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    window.history.pushState({}, '', routeHref(href));
    setRoute(destination);
  }

  const active = shown || view; // enquanto carrega, a tela anterior permanece
  let main;
  if (!active || (slow && !shown)) {
    main = <PageSkeleton />;
  } else if (active.route === '/') main = <Home />;
  else if (active.route === '/pesquisa/') main = <SearchResults query={new URLSearchParams(window.location.search).get('s') || ''} />;
  else if (active.status === 'error') main = <Message title="Não foi possível carregar a página" role="alert">
    <p>O serviço de conteúdo do Senac Maranhão não respondeu. Verifique sua conexão e tente novamente.</p>
    <button type="button" className="button" onClick={retry}>Tentar novamente</button>
    {' '}<ActionLink href={routeHref('/')} arrow>Voltar para a Home</ActionLink>
  </Message>;
  else if (active.status === 'gone') main = <Message title="Conteúdo removido">
    <p>Este conteúdo foi removido e não está mais disponível no portal do Senac Maranhão.</p>
    <ActionLink href={routeHref('/')} arrow>Voltar para a Home</ActionLink>
  </Message>;
  else main = <PortalPages page={active.page} path={active.route} />;
  return <SiteDataProvider>
    <a className="skip-link" href="#main">Ir para o conteúdo</a>
    <div className="site-shell" onClickCapture={navigate}><Header key={route} />
      <main id="main">{main}</main>
      <Footer />
    </div>
    <AccessibilityMenu />
  </SiteDataProvider>;
}
