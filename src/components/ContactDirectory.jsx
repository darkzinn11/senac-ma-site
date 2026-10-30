import React, { useMemo, useState } from 'react';
import { ArrowRight, Buildings2, Call, Location, SearchNormal1, Sms } from 'iconsax-react';
import Breadcrumb from './PageBreadcrumb';
import { ActionLink } from './Ui';
import './contactDirectory.css';

const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const phonePattern=/\(\d{2}\)\s*\d{4,5}\s*[-–]\s*\d{4}/g;
const emailPattern=/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi;

// The source contact HTML is already sanitized. Preserve the supplied addresses
// and numbers; only normalize their presentation and make their actions explicit.
function contactDetails(group) {
  const doc=new DOMParser().parseFromString(group.html||'','text/html');
  doc.body.querySelectorAll('br').forEach(node=>node.replaceWith('\n'));
  doc.body.querySelectorAll('p,li').forEach(node=>node.appendChild(doc.createTextNode('\n')));
  const text=doc.body.textContent||'';
  const phones=[...text.matchAll(phonePattern)].map(match=>{
    const digits=match[0].replace(/\D/g,'');
    return {number:`(${digits.slice(0,2)}) ${digits.slice(2,-4)}-${digits.slice(-4)}`,digits,fax:/fax:\s*$/i.test(text.slice(Math.max(0,match.index-10),match.index))};
  });
  const emails=new Set(text.match(emailPattern)||[]);
  doc.body.querySelectorAll('a[href^="mailto:"]').forEach(anchor=>{
    // Prefer the address the visitor can actually see. Legacy Timon content
    // displays patimon@… but links to another unit's mailbox.
    const visible=anchor.textContent.match(emailPattern)?.[0];
    const target=anchor.getAttribute('href').slice(7).split('?')[0];
    if(visible)emails.add(visible);
    else if(/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(target))emails.add(target);
  });
  const lines=text.split(/\n/).map(line=>line.replace(phonePattern,'').replace(emailPattern,'').replace(/(?:e-?mail|fax)\s*:/gi,'').replace(/^[\s|/;,]+|[\s|/;,]+$/g,'').replace(/\s+/g,' ').trim()).filter(Boolean);
  const type=/sede|assessoria/i.test(group.title)?'sector':'unit';
  const title=group.title.replace(/\bSENAC\b/g,'Senac');
  const extraLinks=[...doc.body.querySelectorAll('a[href]')].filter(a=>!a.getAttribute('href').startsWith('mailto:')).map(a=>({label:a.textContent.trim(),href:a.getAttribute('href')})).filter(a=>a.label);
  return {title,type,phones,emails:[...emails],lines,extraLinks,search:fold(title+' '+text+' '+phones.map(p=>p.digits).join(' '))};
}

function ContactCard({ contact }) {
  const Icon=contact.type==='sector'?Buildings2:Location;
  return <article className="contact-directory-card">
    <header><Icon size={24} variant="Bulk" color="currentColor" aria-hidden="true"/><h3>{contact.title}</h3></header>
    {contact.lines.length>0&&<div className="contact-directory-address"><span>Endereço</span><p>{contact.lines.map((line,i)=><React.Fragment key={i}>{line}{i<contact.lines.length-1&&<br/>}</React.Fragment>)}</p></div>}
    <dl className="contact-directory-channels">
      {contact.phones.length>0&&<div><dt><Call size={18} color="currentColor" aria-hidden="true"/>Telefone</dt><dd>{contact.phones.map(phone=><a href={'tel:+55'+phone.digits} key={phone.digits+(phone.fax?'fax':'')}>{phone.number}{phone.fax&&<span className="contact-fax-label">Fax</span>}</a>)}</dd></div>}
      {contact.emails.length>0&&<div><dt><Sms size={18} color="currentColor" aria-hidden="true"/>E-mail</dt><dd>{contact.emails.map(email=><a href={'mailto:'+email} key={email}>{email}</a>)}</dd></div>}
    </dl>
    {(contact.lines.length>0||contact.extraLinks.length>0)&&<footer>
      {contact.lines.length>0&&<a href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(contact.title+' '+contact.lines.join(' '))} target="_blank" rel="noopener noreferrer" aria-label={'Ver '+contact.title+' no mapa'}>Ver no mapa<ArrowRight size={18} color="currentColor" aria-hidden="true"/></a>}
      {contact.extraLinks.map(link=><a href={link.href} key={link.href}>{link.label}<ArrowRight size={18} color="currentColor" aria-hidden="true"/></a>)}
    </footer>}
  </article>;
}

export default function ContactDirectory({ page, groups, ombudsman }) {
  const [query,setQuery]=useState('');
  const [type,setType]=useState('all');
  const contacts=useMemo(()=>groups.map(contactDetails),[groups]);
  const filtered=contacts.filter(contact=>(type==='all'||contact.type===type)&&fold(query.trim()).split(/\s+/).every(word=>contact.search.includes(word)));
  const hasFilters=Boolean(query||type!=='all');
  const reset=()=>{setQuery('');setType('all');};
  return <div className="contact-directory">
    <Breadcrumb page={{...page,title:'Fale conosco'}}/>
    <header className="contact-directory-heading">
      <div><h1>Fale conosco</h1><p>Encontre a unidade ou o setor que você precisa e escolha a melhor forma de entrar em contato.</p></div>
      {ombudsman&&<a href="#contact-ombudsman" className="button button-soft">Procurando a Ouvidoria?<ArrowRight size={19} color="currentColor" aria-hidden="true"/></a>}
    </header>

    <section className="contact-directory-results" aria-labelledby="contact-directory-title">
      <h2 id="contact-directory-title">Encontre um contato</h2>
      <div className="contact-directory-filters">
        <label className="contact-directory-search"><span>Buscar por unidade, setor ou endereço</span><div><SearchNormal1 size={22} color="currentColor" aria-hidden="true"/><input type="search" placeholder="Ex.: Bacabal ou imprensa" value={query} onChange={e=>setQuery(e.target.value)}/></div></label>
        <label className="contact-directory-type"><span>Tipo de atendimento</span><select value={type} onChange={e=>setType(e.target.value)}><option value="all">Todos os contatos</option><option value="unit">Unidades</option><option value="sector">Setores administrativos</option></select></label>
      </div>
      <div className="contact-directory-result-info"><p role="status">{filtered.length} {filtered.length===1?'contato encontrado':'contatos encontrados'}</p>{hasFilters&&<button type="button" onClick={reset}>Limpar filtros</button>}</div>
      <div className="contact-directory-grid">{filtered.map(contact=><ContactCard key={contact.title} contact={contact}/>)}</div>
      {!filtered.length&&<div className="contact-directory-empty"><SearchNormal1 size={32} color="currentColor" aria-hidden="true"/><h3>Nenhum contato encontrado</h3><p>Tente outro nome, endereço ou tipo de atendimento.</p><button type="button" className="button button-soft" onClick={reset}>Mostrar todos os contatos</button></div>}
    </section>

    {ombudsman&&<section className="contact-directory-ombudsman" id="contact-ombudsman" aria-labelledby="contact-ombudsman-title"><div><h2 id="contact-ombudsman-title">Ouvidoria Senac</h2><p>Para registrar solicitações, sugestões, elogios, reclamações ou denúncias, utilize o canal da Ouvidoria.</p></div><ActionLink href={ombudsman.href} arrow>Acessar ouvidoria</ActionLink></section>}
  </div>;
}
