import React from 'react';
import { cities, coursePreview, units } from '../data/content';
import { Icon } from './Ui';

const areas = [...new Set(coursePreview.map(course => course.area))];
export default function CourseFinder({ filters, setFilters, onSearch, onReset }) {
  const availableUnits = units.filter(unit => !filters.city || unit.city === filters.city);
  function update(key, value) {
    setFilters(current => ({ ...current, [key]:value, ...(key === 'city' ? { unit:'' } : {}) }));
  }
  function select(key, label, placeholder, options) {
    return <div className="field">
      <label htmlFor={'course-' + key}>{label}</label>
      <select id={'course-' + key} value={filters[key]} onChange={e => update(key, e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>;
  }
  return <section className="container course-finder" aria-labelledby="finder-heading">
    <h1 id="finder-heading">Encontre o curso ideal para você</h1>
    <p>Busque por curso, cidade ou unidade e veja as turmas disponíveis no Senac Maranhão</p>
    <form onSubmit={e => { e.preventDefault(); onSearch(); }}>
      <div className="filter-fields">
        <div className="field">
          <label htmlFor="course-query">O que você quer aprender?</label>
          <input id="course-query" type="search" placeholder="Digite um curso ou tema"
            value={filters.query} onChange={e => update('query', e.target.value)} />
        </div>
        {select('area', 'Área', 'Todas as áreas', areas)}
        {select('city', 'Cidade', 'Todas as cidades', cities)}
        {select('unit', 'Unidade', 'Todas as unidades', availableUnits.map(unit => unit.name))}
        {select('type', 'Tipo de curso', 'Todos os tipos', ['Curso livre','Curso técnico','Aprendizagem','EAD'])}
      </div>
      <div className="filter-actions">
        <button className="button" type="submit"><Icon name="searchWhite" />Buscar cursos próximos de mim</button>
        <button className="button button-outline" type="button" onClick={onReset}>Limpar</button>
      </div>
    </form>
  </section>;
}
