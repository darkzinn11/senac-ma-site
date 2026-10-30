import { sanitizeHtml } from './Html';
import { shapeContent } from './contentShape';
import { sentenceCase } from '../utils/sentenceCase';

export const contentText = node => (node?.textContent || '').replace(/\s+/g, ' ').trim();
export const contentKey = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const parseHtml = html => new DOMParser().parseFromString(html || '', 'text/html').body;

// Keep the API as the source of truth. The information layout changes structure, not
// stored content; unfamiliar/new sections still render instead of being discarded.
export function informationContent(html, { extractContact = true, path = '' } = {}) {
  const shaped = shapeContent(sanitizeHtml(html), { extractContact, groupCards:false });
  const body = parseHtml(shaped.html);
  body.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(node => { if (!contentText(node)) node.remove(); });
  if (path === '/institucional/projeto-politico-pedagogico/') formatProjectOutline(body);
  if (path === '/privacidade-e-protecao-de-dados/') {
    // The legacy form is not part of the portal. Use the contact channel actually
    // supplied by the same content, without promising a form that cannot be sent.
    body.querySelectorAll('p').forEach(node => {
      const value=contentText(node);
      if (/^Para acessar suas informa[çc][õo]es/i.test(value) && /preenchendo o formul[aá]rio/i.test(value) && /dpo@[\w.-]+/i.test(body.textContent)) {
        node.textContent=value.replace(/voc[eê] pode entrar em contato[\s\S]*$/i,'entre em contato com o encarregado de proteção de dados pelo e-mail informado nesta página.');
      }
    });
  }
  body.querySelectorAll('p').forEach(node => {
    const anchors = node.querySelectorAll('a[href]');
    if (anchors.length === 1 && contentText(node) === contentText(anchors[0]) && !node.querySelector('img')) {
      anchors[0].classList.add('info-document-link');
    }
    // A short bold label followed by prose is a section, not a bold paragraph.
    const label = node.firstElementChild;
    if (label && /^(B|STRONG)$/.test(label.tagName) && contentText(label).length < 70 && /\s[-–:]\s*$/.test(label.textContent)) {
      const heading = body.ownerDocument.createElement('h3');
      heading.textContent = contentText(label).replace(/\s*[-–:]\s*$/, '');
      label.remove(); node.before(heading);
    }
  });
  const topLevel = [...body.children].some(node => /^H[23]$/.test(node.tagName)) ? /^H[23]$/ : /^H[234]$/;
  const sections = [];
  let current = { title:'', id:'sobre', html:'' };
  for (const node of body.children) {
    if (topLevel.test(node.tagName)) {
      if (current.html) sections.push(current);
      current = { title:sentenceCase(contentText(node)), id:`informacoes-${sections.length + 1}`, html:'' };
    } else current.html += node.outerHTML;
  }
  if (current.html) sections.push(current);
  return { sections, contact:shaped.contact };
}

export function libraryContent(html) {
  const content = informationContent(html, { extractContact:false });
  const find = key => content.sections.find(section => contentKey(section.title).includes(key));
  const location = find('localizacao');
  const services = find('servicos');
  const catalog = find('acervo online');
  const digital = find('biblioteca digital');
  if (!location || !services || !catalog || !digital) return null;
  const intro = content.sections.find(section => !section.title);
  const introBody = parseHtml(intro?.html);
  const lead = introBody.querySelector('p');
  const description = contentText(lead);
  lead?.remove();
  // This legacy label was saved in the middle of a paragraph, not as a heading.
  const first = introBody.querySelector('p');
  if (first?.firstChild?.nodeType === 3) first.firstChild.nodeValue = first.firstChild.nodeValue.replace(/^\s*O ACERVO\s+Reúne/i, 'O acervo reúne');
  const placeBody = parseHtml(location.html);
  const paragraphs = [...placeBody.querySelectorAll(':scope > p')];
  const hours = paragraphs.find(node => /^hor[aá]rio/i.test(contentText(node)));
  const access = paragraphs.find(node => /^acess[ií]vel/i.test(contentText(node)));
  const lists = [...placeBody.querySelectorAll(':scope > ul')];
  // A different editorial structure falls back to the shared renderer, so no new
  // locations or content disappear when the CMS changes.
  if (lists.length !== 2 || !hours || !access) return null;
  const recognized = new Set([...lists, hours, access]);
  if ([...placeBody.children].some(node => !recognized.has(node) && !/^H[34]$/.test(node.tagName))) return null;
  const known = new Set([intro, location, services, catalog, digital]);
  return {
    description, collection:introBody.innerHTML, services:services.html,
    hours:contentText(hours).replace(/^Hor[aá]rio de funcionamento:\s*/i, ''),
    access:contentText(access), places:lists[0].innerHTML.replace(/São Luis/g,'São Luís'), otherPlaces:lists[1].innerHTML.replace(/\bBalas\b/g,'Balsas'),
    catalog:parseHtml(catalog.html).querySelector('a[href]')?.getAttribute('href'),
    digital:parseHtml(digital.html).querySelector('a[href]')?.getAttribute('href'),
    extra:content.sections.filter(section => !known.has(section)),
  };
}

export function libraryRanking(html) {
  const body = parseHtml(sanitizeHtml(html));
  body.querySelectorAll('h1,h2,h3,h4,p').forEach(node => { if (!contentText(node) && !node.querySelector('img')) node.remove(); });
  const nodes = [...body.children];
  const starts = nodes.filter(node => /^\d+[º°]\s*Lugar$/i.test(contentText(node)));
  if (!starts.length) return null;
  const rows = starts.map(start => {
    const index = nodes.indexOf(start);
    const end = nodes.findIndex((node, i) => i > index && starts.includes(node));
    const group = nodes.slice(index + 1, end < 0 ? undefined : end);
    const values = ['profissao', 'perfil do profissional', 'sugestao de cursos'].map(label => {
      const i = group.findIndex(node => contentKey(contentText(node)) === label);
      return i >= 0 ? contentText(group[i + 1]) : '';
    });
    return { position:contentText(start), values };
  });
  if (rows.some(row => row.values.some(value => !value))) return null;
  return { intro:nodes.slice(0, nodes.indexOf(starts[0])).map(node => node.outerHTML).join(''), rows };
}

function formatProjectOutline(body) {
  const heading = [...body.children].find(node => /^H[234]$/.test(node.tagName) && /sum[aá]rio/i.test(contentText(node)));
  const paragraph = heading?.nextElementSibling;
  if (paragraph?.tagName !== 'P' || !paragraph.querySelector('br')) return;
  const lines = [];
  paragraph.innerHTML.split(/<br\s*\/?\s*>/i).map(html => contentText(parseHtml(html))).filter(Boolean).forEach(line => {
    if (lines.length && /\bE$/.test(lines.at(-1)) && !/^\d/.test(line)) lines[lines.length-1] += ' '+line;
    else lines.push(line);
  });
  const doc=body.ownerDocument;
  const root=doc.createElement('ol'); root.className='info-outline'; root.setAttribute('role','list');
  const stack=[root];
  lines.forEach(line => {
    const match=/^(\d+(?:\.\d+)*)(?:\.)?\s+(.+)$/.exec(line);
    const depth=match?match[1].split('.').length:1;
    while(stack.length>depth)stack.pop();
    while(stack.length<depth && stack.at(-1).lastElementChild){const list=doc.createElement('ol');list.setAttribute('role','list');stack.at(-1).lastElementChild.appendChild(list);stack.push(list);}
    const item=doc.createElement('li');
    if(match){const number=doc.createElement('span');number.className='info-outline-number';number.textContent=match[1];item.appendChild(number);}
    item.appendChild(doc.createTextNode(sentenceCase(match?match[2]:line)));
    stack.at(-1).appendChild(item);
  });
  heading.textContent='Sumário do projeto';
  paragraph.replaceWith(root);
}
