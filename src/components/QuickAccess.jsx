import React from 'react';
import {
  Book1, Monitor, BookSaved, Location, ArrowRight2, Category, Global, Task, People, Call, Sms, Briefcase, Note, Award,
  Calendar, Message, Home as HomeIcon, Shop, Teacher, DocumentText, Link21,
} from 'iconsax-react';
import { links } from '../data/content';
import { Icon as OriginalIcon } from './Ui';
import useAsync from '../api/useAsync';
import { loadQuickLinks } from '../api/content';
import './quickAccess.css';

// Sugestões editoriais usadas só se a API estiver fora do ar ou sem atalhos cadastrados.
const fallbackShortcuts = [
  { title:'Cursos presenciais', detail:'Consulte as turmas', href:links.courses, icon:Book1 },
  { title:'Cursos a distância', detail:'Aprenda de onde estiver', href:'https://www.ead.senac.br/', icon:Monitor },
  { title:'Bolsas e gratuidade', detail:'Conheça o PSG', href:'https://www.portal-psg.ma.senac.br/#/programa-senac-de-gratuidade', icon:BookSaved },
  { title:'Portal do aluno', detail:'Acesse sua área', href:links.student, icon:null },
  { title:'Nossas unidades', detail:'Encontre a mais próxima', href:links.units, icon:Location },
];
// Nome do ícone cadastrado no painel -> pictograma Iconsax.
const iconByName = {
  category:Category, website:Global, list:Task, users:People, book:Book1, courses:Book1, monitor:Monitor, location:Location, map:Location,
  phone:Call, mail:Sms, email:Sms, briefcase:Briefcase, jobs:Briefcase, note:Note, award:Award, calendar:Calendar, message:Message,
  home:HomeIcon, shop:Shop, teacher:Teacher, student:Teacher, document:DocumentText, file:DocumentText, link:Link21,
};
const isExternal = href => /^https?:\/\//i.test(href);

export default function QuickAccess() {
  const state = useAsync(loadQuickLinks, []);
  const fromApi = state.status === 'ready' && state.data.length > 0;
  const shortcuts = fromApi
    ? state.data.map(item => ({ title:item.title, detail:item.detail, href:item.href, icon:iconByName[item.icon] || Link21, newTab:item.newTab || isExternal(item.href) }))
    : fallbackShortcuts;
  const loading = state.status === 'loading';
  return <section className="quick-links section-block" aria-labelledby="quick-links-heading" aria-busy={loading}>
    <div className="container">
      <div className="section-heading"><div>
        <h2 id="quick-links-heading">Acesso rápido</h2>
        <p>Encontre o que você precisa no Senac Maranhão.</p></div>
      </div>
      <div className="quick-links-grid" style={fromApi && shortcuts.length < 5 ? { '--quick-cols':Math.max(shortcuts.length, 1) } : undefined}>
        {loading ? [0,1,2,3,4].map(n => <div className="quick-links-card is-placeholder" key={n} aria-hidden="true" />)
          : shortcuts.map(({title,detail,href,icon:Icon,newTab})=>
          <a className="quick-links-card" href={href} key={title} {...(newTab ? { target:'_blank', rel:'noopener noreferrer' } : {})}>
            {Icon ? <Icon className="quick-links-icon" size={32} variant="Bold" color="currentColor" aria-hidden="true"/>
              : <OriginalIcon name="cap" className="quick-links-icon quick-links-icon--student"/>}
            <span className="quick-links-text"><strong>{title}</strong>{detail&&<small>{detail}</small>}</span>
            <ArrowRight2 className="quick-links-arrow" size={19} variant="Bold" color="currentColor" aria-hidden="true"/>
          </a>
        )}
      </div>
    </div>
  </section>;
}
