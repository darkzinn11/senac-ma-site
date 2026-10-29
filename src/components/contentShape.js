// Reorganiza o HTML herdado do WordPress para leitura, sem mudar o conteúdo:
// parágrafos só em negrito viram títulos, perguntas viram sanfona, grupos curtos viram cards,
// a lista "nome / Início / Término" vira tabela e o bloco "Contato" pode ser separado para a lateral.
const text = node => (node?.textContent || '').replace(/\s+/g, ' ').trim();
const isCaps = value => /[A-ZÀ-Ý]{3}/.test(value) && value === value.toLocaleUpperCase('pt-BR');
const isHeading = node => /^H[1-6]$/.test(node?.tagName || '');
const isSection = node => /^H[1-3]$/.test(node?.tagName || '');

// <p><strong>TÍTULO</strong></p>: o negrito ocupa o parágrafo inteiro e o texto é curto.
function isBoldLine(node) {
  if (node?.tagName !== 'P' || node.querySelector('img,a')) return false;
  // Sem o negrito não sobra texto: a linha inteira está em negrito.
  const rest = node.cloneNode(true);
  rest.querySelectorAll('strong,b').forEach(bold => bold.remove());
  return text(node).length > 1 && !text(rest);
}
const isPseudoHeading = node => isBoldLine(node) && text(node).length <= 90 && !/[.:;,]$/.test(text(node));
// Linha curta toda em maiúsculas, sem negrito (ex.: "OUTRAS UNIDADES"): subtítulo.
const isCapsLabel = node => node?.tagName === 'P' && !node.querySelector('img,a,strong,b') && text(node).length <= 60 && isCaps(text(node));
function rename(node, tag) {
  const next = node.ownerDocument.createElement(tag);
  next.textContent = text(node);
  node.replaceWith(next);
  return next;
}
// Tudo que vem depois de um nó até o próximo título (ou até `stop`).
function until(node, stop = isHeading) {
  const nodes = [];
  for (let next = node.nextElementSibling; next && !stop(next); next = next.nextElementSibling) nodes.push(next);
  return nodes;
}

function partnersTable(body) {
  const rows = [];
  [...body.children].forEach(node => {
    const start = node.nextElementSibling, end = start?.nextElementSibling;
    if (isBoldLine(node) && /^In[ií]cio:/i.test(text(start)) && /^T[ée]rmino:/i.test(text(end))) rows.push([node, start, end]);
  });
  if (rows.length < 4) return;
  const doc = body.ownerDocument;
  const wrap = doc.createElement('div'); wrap.className = 'prose-table';
  const table = doc.createElement('table');
  table.innerHTML = '<thead><tr><th>Parceiro</th><th>Início</th><th>Término</th></tr></thead><tbody></tbody>';
  rows.forEach(([name, start, end]) => {
    const row = doc.createElement('tr');
    [text(name), text(start).replace(/^[^:]*:\s*/, ''), text(end).replace(/^[^:]*:\s*/, '')].forEach(value => {
      const cell = doc.createElement('td'); cell.textContent = value; row.appendChild(cell);
    });
    table.tBodies[0].appendChild(row);
  });
  wrap.appendChild(table);
  rows[0][0].before(wrap);
  rows.flat().forEach(node => node.remove());
}

function faq(body) {
  const questions = [...body.children].filter(node => node.tagName === 'P' && /\?$/.test(text(node)) && text(node).length <= 160);
  if (questions.length < 3) return;
  const doc = body.ownerDocument;
  const list = doc.createElement('div'); list.className = 'prose-faq';
  questions[0].before(list);
  questions.forEach((question, index) => {
    const answer = until(question, node => isHeading(node) || questions.includes(node));
    const item = doc.createElement('details');
    if (index === 0) item.open = true;
    const summary = doc.createElement('summary'); summary.textContent = text(question);
    item.appendChild(summary);
    const content = doc.createElement('div');
    answer.forEach(node => content.appendChild(node));
    item.appendChild(content);
    list.appendChild(item);
    question.remove();
  });
}

// Páginas com muitos grupos curtos (ex.: Administração Regional) viram uma grade de cards.
function cards(body) {
  const headings = [...body.querySelectorAll(':scope > h3')];
  if (headings.length < 4) return;
  const groups = headings.map(heading => [heading, ...until(heading, isSection)]);
  if (groups.some(group => group.some(node => node.querySelector?.('img')) || group.map(text).join(' ').length > 2500)) return;
  const doc = body.ownerDocument;
  let grid = null;
  groups.forEach(group => {
    const card = doc.createElement('section'); card.className = 'prose-card';
    const previous = group[0].previousElementSibling;
    if (!grid || previous !== grid) { grid = doc.createElement('div'); grid.className = 'prose-card-grid'; group[0].before(grid); }
    group.forEach(node => card.appendChild(node));
    grid.appendChild(card);
  });
}

// Missão, Visão e Valores (títulos soltos, cada um com um parágrafo) viram um bloco próprio: a missão em destaque e
// visão e valores lado a lado, na ordem usual. Os valores, separados por ";", viram etiquetas.
const PURPOSE = [['missao', /^miss[aã]o$/i], ['visao', /^vis[aã]o$/i], ['valores', /^valores$/i]];
function purpose(body) {
  const found = PURPOSE.map(([key, rule]) => {
    const heading = [...body.children].find(node => isHeading(node) && rule.test(text(node).replace(/:$/, '')));
    const answer = heading && until(heading);
    return heading && answer.length ? { key, heading, answer } : null;
  });
  if (found.some(item => !item)) return;
  const doc = body.ownerDocument;
  const block = doc.createElement('div'); block.className = 'prose-purpose';
  found.forEach(({ key, heading, answer }) => {
    const card = doc.createElement('section'); card.className = 'prose-purpose-card is-' + key;
    const title = doc.createElement('h3'); title.textContent = text(heading).replace(/:$/, '');
    card.appendChild(title);
    const statement = answer.map(text).join(' ');
    if (key === 'valores' && statement.includes(';')) {
      const list = doc.createElement('ul');
      statement.replace(/\.$/, '').split(';').map(item => item.trim()).filter(Boolean).forEach(item => {
        const li = doc.createElement('li'); li.textContent = item[0].toUpperCase() + item.slice(1); list.appendChild(li);
      });
      card.appendChild(list);
    } else {
      const p = doc.createElement('p'); p.textContent = statement; card.appendChild(p);
    }
    block.appendChild(card);
  });
  found[0].heading.before(block);
  found.forEach(({ heading, answer }) => [heading, ...answer].forEach(node => node.remove()));
}

export function shapeContent(html, { extractContact = false } = {}) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  const body = doc.body;
  // Marcação que o editor antigo salvou como texto (ex.: "<span style=...>Nome</span>" aparecendo na tela).
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (/<\/?[a-z][^<>]*>/i.test(node.nodeValue)) node.nodeValue = node.nodeValue.replace(/<\/?[a-z][^<>]*>/gi, '');
  }
  // Quebras e parágrafos vazios herdados do editor antigo.
  body.querySelectorAll('p').forEach(p => {
    while (p.firstChild?.nodeName === 'BR') p.firstChild.remove();
    if (!text(p) && !p.querySelector('img')) p.remove();
  });
  partnersTable(body);
  [...body.children].forEach(node => {
    if (isPseudoHeading(node)) rename(node, 'h3');
    else if (isCapsLabel(node)) rename(node, 'h4').textContent = text(node).replace(/:$/, '');
  });
  body.querySelectorAll('h2,h3,h4').forEach(heading => {
    if (heading.querySelector('b,strong')) heading.textContent = text(heading);
    if (isCaps(text(heading))) heading.classList.add('is-caps');
  });
  let contact = '';
  if (extractContact) {
    const heading = [...body.children].find(node => isHeading(node) && /^contatos?:?$/i.test(text(node)));
    if (heading) {
      const nodes = until(heading);
      contact = nodes.map(node => node.outerHTML).join('');
      [heading, ...nodes].forEach(node => node.remove());
    }
  }
  purpose(body);
  faq(body);
  cards(body);
  return { html: body.innerHTML, contact };
}
