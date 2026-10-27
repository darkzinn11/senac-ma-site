// Helpers de rota do site. Os conteúdos (páginas, notícias, cursos, editais) vêm da API pública (src/api);
// aqui ficam só funções puras e as páginas "virtuais" que não existem no CMS.
export const virtualPages = [
  {id:'service-interest',kind:'page',parent:null,path:'/cadastro-de-interesse/',title:'Cadastro de interesse',
    excerpt:'Demonstre seu interesse em um curso do Senac Maranhão ou sugira uma nova formação.',html:'',children:[]},
  {id:'service-ead',kind:'page',parent:null,path:'/cursos-a-distancia/',title:'Cursos a distância',
    excerpt:'Conheça as opções de educação a distância do Senac.',html:'',children:[]},
];
const safeDecode = (value) => { try { return decodeURI(value); } catch { return value; } };
export const normalizePath = (path) => {
  const value = safeDecode(path || '/').split('?')[0].split('#')[0].replace(/\/+$/,'') || '/';
  return (value === '/' ? value : value + '/').toLowerCase();
};
// Caminhos do WordPress que nunca são rotas do site (arquivos e painel).
const notRoutes = /^\/(wp-content|wp-admin|wp-includes|wp-json|wp-login\.php|feed|xmlrpc\.php)(\/|$)/;
export const localHref = (url) => {
  if (!url || url.startsWith('#') || url.startsWith('?')) return url || '#';
  try {
    const parsed = new URL(url, 'https://ma.senac.br');
    if (!['ma.senac.br','www.ma.senac.br'].includes(parsed.hostname)) return url;
    if (notRoutes.test(parsed.pathname.toLowerCase())) return url;
    const path = normalizePath(parsed.pathname).replace(/^\/unidade-local\//,'/unidades/');
    return path + parsed.search + parsed.hash;
  } catch { return url; }
};
export const isCatalog = path => ['/cursos-senac/','/todos-os-cursos/','/buscar-cursos/'].includes(path);
export const isNews = path => ['/noticias/','/noticias-senac/'].includes(path);
export const isNotices = path => ['/editais-psg/','/resultados-psg/'].includes(path);
// Arquivos e mídia (PDF, imagens, /v1/media/...) abrem direto no navegador: não são rotas do app.
export const isFilePath = (href) => {
  try {
    const { pathname } = new URL(href, 'https://site.invalid');
    return /^\/(v1|media|assets|data|fonts|favicon)\//i.test(pathname) || /\.[a-z0-9]{2,5}$/i.test(pathname);
  } catch { return false; }
};
