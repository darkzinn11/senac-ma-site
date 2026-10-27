import React, { useEffect, useRef, useState } from 'react';
import { asset, links, navigation } from '../data/content';
import { routeHref } from '../data/basePath';
import { Icon } from './Ui';
import { useSiteData } from '../api/SiteData';
import { SearchNormal1 } from 'iconsax-react';

// Item do menu: link simples ou grupo com subitens. No desktop o grupo abre um painel lateral (ao passar o mouse,
// focar ou clicar); no celular vira um acordeão. Grupo com `href` (ex.: PSG) mantém o link e ganha um botão de seta.
function NavItem({ item, openSub, setOpenSub }) {
  if (!item.items) return <li><a href={item.href}>{item.label}</a></li>;
  const open = openSub === item.label;
  const toggle = () => setOpenSub(open ? null : item.label);
  return <li className={'has-sub' + (open ? ' is-open' : '')}>
    {item.href
      ? <div className="nav-row"><a href={item.href}>{item.label}</a>
          <button type="button" className="sub-toggle" aria-expanded={open} aria-label={'Mostrar opções de ' + item.label} onClick={toggle}><Icon name="chevron" /></button></div>
      : <button type="button" className="nav-row nav-group-button" aria-expanded={open} onClick={toggle}><span>{item.label}</span><Icon name="chevron" /></button>}
    <ul className="nav-sub">{item.items.map(sub => <li key={sub.label}><a href={sub.href}>{sub.label}</a></li>)}</ul>
  </li>;
}

export default function Header() {
  const { settings } = useSiteData();
  const groups = navigation;
  const [menu, setMenu] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const header = useRef(null);
  const menuButton = useRef(null);
  useEffect(() => {
    function close(event) {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && header.current?.contains(event.target)) return;
      setDropdown(null);
      setOpenSub(null);
      if (event.type === 'keydown') {
        const trigger = header.current?.querySelector('.nav-trigger[aria-expanded="true"]');
        setMenu(false);
        if (window.matchMedia('(max-width:1100px)').matches) menuButton.current?.focus();
        else trigger?.focus();
      }
    }
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, []);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener('scroll', update, { passive:true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  function toggleMenu() { setMenu(!menu); setDropdown(null); setOpenSub(null); }
  return <>
    <div className="utility-bar">
      <div className="container utility-content">
        <div className="utility-links"><a href={links.jobs}>Trabalhe conosco</a><a href={links.contact}>Contato</a></div>
        <div className="utility-socials">
          <img src={asset('34141.svg')} alt="" width="55" height="20" />
          <a href={settings.facebook || links.facebook} aria-label="Facebook do Senac Maranhão" />
          <a href={settings.instagram || links.instagram} aria-label="Instagram do Senac Maranhão" />
        </div>
      </div>
    </div>
    <header ref={header} className={'navigation-shell' + (scrolled ? ' is-scrolled' : '')}>
    <div className="container main-header">
      <a className="logo" href={routeHref('/')} aria-label="Senac Maranhão — página inicial">
        <img src={asset('64710.svg')} alt="Senac" width="84" height="49" />
      </a>
      <nav className={'main-navigation' + (menu ? ' is-open' : '')} id="main-navigation" aria-label="Navegação principal">
        {groups.map((group, i) => <div className="nav-group" key={group.label}>
          <button className="nav-trigger" aria-expanded={dropdown === i} aria-controls={'nav-group-' + i}
            onClick={() => { setDropdown(dropdown === i ? null : i); setOpenSub(null); }}>
            {group.label}<Icon name="chevron" />
          </button>
          <ul id={'nav-group-' + i} className="nav-dropdown" hidden={dropdown !== i}>
            {group.items.map(item => <NavItem item={item} key={item.label} openSub={openSub} setOpenSub={setOpenSub} />)}
          </ul>
        </div>)}
        <form className="site-search mobile-search" role="search" action="/pesquisa/" method="get">
          <label className="sr-only" htmlFor="site-query-mobile">Pesquisar no site</label>
          <button type="submit" aria-label="Pesquisar no site"><SearchNormal1 className="site-search-icon" size={18} variant="Linear" color="currentColor" aria-hidden="true" /></button>
          <input id="site-query-mobile" type="search" name="s" placeholder="Buscar no site" required />
        </form>
      </nav>
      <div className="header-actions">
        <form className="site-search" role="search" action="/pesquisa/" method="get">
          <label className="sr-only" htmlFor="site-query">Pesquisar no site</label>
          <button type="submit" aria-label="Pesquisar no site"><SearchNormal1 className="site-search-icon" size={18} variant="Linear" color="currentColor" aria-hidden="true" /></button>
          <input id="site-query" type="search" name="s" placeholder="Buscar" required />
        </form>
        <a className="button student-link" href={links.student}><Icon name="cap" /><span>Portal do aluno</span></a>
      </div>
      <button className="menu-toggle" ref={menuButton} onClick={toggleMenu}
        aria-expanded={menu} aria-controls="main-navigation" aria-label={menu ? 'Fechar menu' : 'Abrir menu'}>
        <span aria-hidden="true"><Icon name={menu ? 'close' : 'menu'} /></span><span className="menu-label">Menu</span>
      </button>
    </div>
    </header>
  </>;
}
