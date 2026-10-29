import React from 'react';
import {
  HambergerMenu,
} from 'iconsax-react';
import { asset } from '../data/content';

// Os pictogramas usados no layout aprovado continuam sendo os SVGs originais do Figma.
const originalIcons = {
  arrow:'d85ac.svg', chevron:'1b387.svg', chevronLeft:'90a4e.svg',
  search:'d8b45.svg', searchWhite:'9f4c4.svg', cap:'22d34.svg', clock:'cbaca.svg',
  facebook:'053d5.svg', instagram:'a2dbe.svg', youtube:'cce85.svg',
};
// O iconsax não tem um "X" simples; este segue o traço do HambergerMenu Linear (1.5px, pontas arredondadas).
function CloseLinear({ size = 20, color = 'currentColor', variant, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}
const glyphs = { menu:HambergerMenu, close:CloseLinear };
// Menu e fechar usam os ícones clássicos de traço, não as versões preenchidas.
const glyphVariants = { menu:'Linear' };
export function Icon({ name, className = '', ...props }) {
  if (originalIcons[name]) return <img src={asset(originalIcons[name])} alt="" aria-hidden="true"
    className={'icon '+className} width="20" height="20" {...props}/>;
  const Glyph = glyphs[name];
  if (!Glyph) return null;
  return <Glyph size={20} variant={glyphVariants[name] || 'Bold'} color="currentColor"
    aria-hidden="true" className={'icon '+className} {...props}/>;
}
export function ActionLink({ href, children, className = '', arrow = false, ...props }) {
  return <a href={href} className={'button ' + className} {...props}>
    {children}{arrow && <Icon name="arrow" />}
  </a>;
}
// Subtítulo não leva ponto final. Só tira o ponto de uma frase única: texto com mais de uma frase, reticências ou
// abreviação (etc., Ltda., S.A.) fica como está.
export function noFinalPeriod(text) {
  const t = String(text ?? '').trim();
  if (!/[^.\s]\.$/.test(t)) return t;
  if (/\b(etc|ltda|s\.a|sr|sra|dr|dra|av|nº)\.$/i.test(t) || /[.!?]\s+\S/.test(t.slice(0, -1))) return t;
  return t.slice(0, -1);
}
export function SectionHeading({ id, title, subtitle, action }) {
  return <div className="section-heading">
    <div><h2 id={id}>{title}</h2>{subtitle && <p>{noFinalPeriod(subtitle)}</p>}</div>
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
