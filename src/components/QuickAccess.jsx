import React from 'react';
import { Book1, Monitor, BookSaved, Teacher, Location, ArrowRight2 } from 'iconsax-react';
import { links } from '../data/content';
import './quickAccess.css';

// Sugestões editoriais de atalhos; não representam um ranking obtido de analytics.
const shortcuts = [
  { title:'Cursos presenciais', detail:'Consulte as turmas', href:links.courses, icon:Book1 },
  { title:'Cursos a distância', detail:'Aprenda de onde estiver', href:links.ead, icon:Monitor },
  { title:'Bolsas e gratuidade', detail:'Conheça o PSG', href:links.psg, icon:BookSaved },
  { title:'Portal do aluno', detail:'Acesse sua área', href:links.student, icon:Teacher },
  { title:'Nossas unidades', detail:'Encontre a mais próxima', href:links.units, icon:Location },
];

export default function QuickAccess() {
  return <section className="quick-links section-block" aria-labelledby="quick-links-heading">
    <div className="container">
      <div className="quick-links-heading">
        <h2 id="quick-links-heading">Acesso rápido</h2>
        <p>Encontre o que você precisa no Senac Maranhão.</p>
      </div>
      <div className="quick-links-grid">
        {shortcuts.map(({title,detail,href,icon:Icon})=>
          <a className="quick-links-card" href={href} key={title}>
            <Icon className="quick-links-icon" size={32} variant="Linear" color="currentColor" aria-hidden="true"/>
            <span className="quick-links-text"><strong>{title}</strong><small>{detail}</small></span>
            <ArrowRight2 className="quick-links-arrow" size={19} variant="Linear" color="currentColor" aria-hidden="true"/>
          </a>
        )}
      </div>
    </div>
  </section>;
}
