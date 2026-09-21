import React, { useEffect, useRef, useState } from 'react';
import { asset, links, navigation } from '../data/content';
import { Icon } from './Ui';

export default function Header() {
  const [menu, setMenu] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const header = useRef(null);
  const menuButton = useRef(null);
  useEffect(() => {
    function close(event) {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && header.current?.contains(event.target)) return;
      setDropdown(null);
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
  function toggleMenu() { setMenu(!menu); setDropdown(null); }
  return <header ref={header}>
    <div className="utility-bar">
      <div className="container utility-content">
        <div className="utility-links"><a href={links.jobs}>Trabalhe conosco</a><a href={links.contact}>Contato</a></div>
        <div className="utility-socials">
          <img src={asset('34141.svg')} alt="" width="55" height="20" />
          <a href={links.facebook} aria-label="Facebook do Senac Maranhão" />
          <a href={links.instagram} aria-label="Instagram do Senac Maranhão" />
        </div>
      </div>
    </div>
    <div className="container main-header">
      <a className="logo" href="/" aria-label="Senac Maranhão — página inicial">
        <img src={asset('64710.svg')} alt="Senac" width="84" height="49" />
      </a>
      <nav className={'main-navigation' + (menu ? ' is-open' : '')} id="main-navigation" aria-label="Navegação principal">
        {navigation.map((group, i) => <div className="nav-group" key={group.label}>
          <button className="nav-trigger" aria-expanded={dropdown === i} aria-controls={'nav-group-' + i}
            onClick={() => setDropdown(dropdown === i ? null : i)}>
            {group.label}<Icon name="chevron" />
          </button>
          <ul id={'nav-group-' + i} className="nav-dropdown" hidden={dropdown !== i}>
            {group.items.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}
          </ul>
        </div>)}
        <form className="site-search mobile-search" role="search" action={links.home} method="get">
          <label className="sr-only" htmlFor="site-query-mobile">Pesquisar no site</label>
          <button type="submit" aria-label="Pesquisar no site"><Icon name="search" /></button>
          <input id="site-query-mobile" type="search" name="s" placeholder="Buscar no site" required />
        </form>
      </nav>
      <div className="header-actions">
        <form className="site-search" role="search" action={links.home} method="get">
          <label className="sr-only" htmlFor="site-query">Pesquisar no site</label>
          <button type="submit" aria-label="Pesquisar no site"><Icon name="search" /></button>
          <input id="site-query" type="search" name="s" placeholder="Buscar" required />
        </form>
        <a className="button student-link" href={links.student}><Icon name="cap" /><span>Portal do aluno</span></a>
      </div>
      <button className="menu-toggle" ref={menuButton} onClick={toggleMenu}
        aria-expanded={menu} aria-controls="main-navigation" aria-label={menu ? 'Fechar menu' : 'Abrir menu'}>
        <span aria-hidden="true"><Icon name={menu ? 'close' : 'menu'} /></span><span className="menu-label">Menu</span>
      </button>
    </div>
  </header>;
}
