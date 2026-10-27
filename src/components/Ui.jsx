import React from 'react';
import {
  HambergerMenu, CloseSquare,
} from 'iconsax-react';
import { asset } from '../data/content';

// Os pictogramas usados no layout aprovado continuam sendo os SVGs originais do Figma.
const originalIcons = {
  arrow:'d85ac.svg', chevron:'1b387.svg', chevronLeft:'90a4e.svg',
  search:'d8b45.svg', searchWhite:'9f4c4.svg', cap:'22d34.svg', clock:'cbaca.svg',
  facebook:'053d5.svg', instagram:'a2dbe.svg', youtube:'cce85.svg',
};
const glyphs = { menu:HambergerMenu, close:CloseSquare };
export function Icon({ name, className = '', ...props }) {
  if (originalIcons[name]) return <img src={asset(originalIcons[name])} alt="" aria-hidden="true"
    className={'icon '+className} width="20" height="20" {...props}/>;
  const Glyph = glyphs[name];
  if (!Glyph) return null;
  return <Glyph size={20} variant="Bold" color="currentColor"
    aria-hidden="true" className={'icon '+className} {...props}/>;
}
export function ActionLink({ href, children, className = '', arrow = false, ...props }) {
  return <a href={href} className={'button ' + className} {...props}>
    {children}{arrow && <Icon name="arrow" />}
  </a>;
}
export function SectionHeading({ id, title, subtitle, action }) {
  return <div className="section-heading">
    <div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    {action && <ActionLink href={action.href}>{action.label}</ActionLink>}
  </div>;
}
export function PhotoCard({ item, notice = false }) {
  return <a className={'photo-card' + (notice ? ' notice-card' : '')} href={item.href}>
    <img className="photo-card-image" src={asset(item.image)} alt="" loading="lazy" decoding="async" />
    <div className="photo-card-shade" />
    <div className="photo-card-content">
      <h3>{item.title}</h3>
      <span className="button button-small">Veja mais<Icon name="arrow" /></span>
    </div>
  </a>;
}
