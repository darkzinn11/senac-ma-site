import freshPhotos from './courseFreshPhotos.json';
import freshMap from './courseFreshMap.json';
import { publicUrl } from './basePath';

// Exclusivamente imagens novas de banco de fotos, NÃO o acervo do Senac.
// O mapeamento por ID mantém a foto coerente em todas as turmas do mesmo curso.
const subjects = [
  // A primeira regra que casa vence: as mais específicas vêm antes. Grupos = categorias de courseFreshPhotos.json.
  { pattern:/barb[ea]|corte masculino|cabelos masculinos|side part|razor/i, area:'Beleza e bem-estar', group:'barber' },
  { pattern:/unha|manicur|pedicur|spa de m[aã]os/i, area:'Beleza e bem-estar', group:'nails' },
  { pattern:/sobrancelh|microblading|lash|c[ií]lios|brow/i, area:'Beleza e bem-estar', group:'brows' },
  { pattern:/maquia|make ?up|cut crease|maquiador/i, area:'Beleza e bem-estar', group:'makeup' },
  { pattern:/massag|reflexolog|pedras quentes|shantala|drenagem|banho de lua/i, area:'Beleza e bem-estar', group:'massage' },
  { pattern:/skincare|peeling|rejuvenesc|clareamento|jato de plasma|est[eé]tic|depila|pele\b/i, area:'Beleza e bem-estar', group:'skincare' },
  { pattern:/cabel|penteado|tran[cç]as|colorimetria|mechas|capilar|escova|visagismo|corte e |mundo da beleza/i, area:'Beleza e bem-estar', group:'hair' },
  { pattern:/idos[oa]|cuidador/i, area:'Saúde', group:'elderly' },
  { pattern:/enfermagem|sa[uú]de|hospital|primeiros socorros|farm[aá]cia|instrumenta[cç][aã]o|suporte b[aá]sico de vida|salva vidas|brigada|inc[eê]ndio/i, area:'Saúde', group:'health' },
  { pattern:/bombon|trufa|chocolat|cake|ovos de p[aá]scoa|rosca|panetone|guirlanda|sobremesa|torta|doces|confeitar|bolo/i, area:'Gastronomia', group:'pastry' },
  { pattern:/\bp[aã]e?s?\b|panifica|empad[aã]o|salgado/i, area:'Gastronomia', group:'bakery' },
  { pattern:/caf[eé]s?\b|coquet|mocktail|drinque|gar[cç]om|bem servir|barista|mesa posta|bares e restaurantes/i, area:'Gastronomia', group:'coffee' },
  { pattern:/cozinh|culin|gastronom|alimento|alimenta[cç][aã]o|hamb[uú]rguer|cachorro|crepe|panqueca|saladas?|sopas|caldos|massas|boteco|lanches|pizza/i, area:'Gastronomia', group:'cooking' },
  { pattern:/hospedagem|governan[cç]a|receptivo|tur[ií]stic|cerimonial|eventos|limpeza e conserva/i, area:'Turismo e hospitalidade', group:'hotel' },
  { pattern:/pintura em tela/i, area:'Design e comunicação', group:'design' },
  { pattern:/costur|modelagem|bordado|croch[eê]|tecido|bonecas de pano|bolsas|bijuteria|tapetes|pe[cç]as [ií]ntimas/i, area:'Moda e produção', group:'sewing' },
  { pattern:/moda|vestu[aá]rio|alfaiataria|modelista/i, area:'Moda e produção', group:'fashion' },
  { pattern:/fotograf|lightroom|v[ií]deo|premiere|after effects/i, area:'Design e comunicação', group:'photo' },
  { pattern:/\bcad\b|autocad|revit|autodesk|arquitet|\bbim\b/i, area:'Construção e projetos', group:'construction' },
  { pattern:/design|corel|illustrator|adobe|canva|photoshop|ux\/ui|ilustra[cç]|vetorial/i, area:'Design e comunicação', group:'design' },
  { pattern:/cabeamento|\bredes\b|5g/i, area:'Tecnologia', group:'network' },
  { pattern:/loja virtual|e-commerce|influenciador|empreendedorismo digital|marketing/i, area:'Tecnologia', group:'ecommerce' },
  { pattern:/programa[cç]|aplicativo|android|\bsql\b|banco de dados|power ?bi|business intelligence|intelig[eê]ncia de neg|metodologia [aá]gil|office|excel|\bword\b|power ?point|microsoft|internet|inform[aá]tica|digita[cç][aã]o|tecnologia|rob[oó]tica|\biot\b|chatgpt|intelig[eê]ncia artificial|computad|notebook|sistemas|ms project|\bproject\b|seguran[cç]a da informa|empregabilidade digital|\bia\b|\bweb\b|nuvem|automa[cç][aã]o|linkedin/i, area:'Tecnologia', group:'coding' },
  { pattern:/log[ií]stic|estoque|almoxarif|armaz[eé]n|compras/i, area:'Logística e estoque', group:'warehouse' },
  { pattern:/financ|pre[cç]o|crise|contab|legisla[cç][aã]o trabalhista/i, area:'Gestão e negócios', group:'finance' },
  { pattern:/supermercado|operador de caixa|loja|vendas|vendedor|quem atende|cliente|p[oó]s-venda|prospec|com[eé]rcio|atendimento/i, area:'Comércio e vendas', group:'store' },
  { pattern:/orat[oó]ria|comunica[cç]|palestra|entrevista|ingl[eê]s|reda[cç][aã]o|portugu[eê]s|libras|comunicar/i, area:'Gestão e negócios', group:'speaking' },
  { pattern:/docente|educa[cç][aã]o|escola|educador|aprendizagens|sala inovadora|enem|seminário/i, area:'Educação', group:'teaching' },
  { pattern:/empreend|gest[aã]o|planejamento|neg[oó]cio|lideran|equipes|tempo|motiva|carreira|curr[ií]culo|empregabilidade|trabalho|assistente|secretari|pessoal|jur[ií]dic|[eé]tica|etiqueta|rela[cç]|imagem|\bmei\b|sustentab|produtividade|performance|mercado|administra|corporativ|organiza[cç][aã]o|qualifica[cç][aã]o|diferen[cç]a/i, area:'Gestão e negócios', group:'business' },
];
const locations=['São Luís','Imperatriz','Bacabal','Caxias','Santa Inês','Santa Ines','Pinheiro','Açailândia','Balsas','Timon','Governador Edison Lobão'];
const choosePhoto=(group,key)=>{
  const pool=freshPhotos.categories[group] || freshPhotos.categories.business;
  const hash=Array.from(key).reduce((acc,char)=>((acc*31)+char.charCodeAt(0))>>>0,0);
  return freshPhotos.photos[String(pool[hash%pool.length])].src;
};
export function courseVisual(course) {
  const title=course.title || '';
  const location=course.localidade || locations.find(city=>title.toLowerCase().endsWith('– '+city.toLowerCase()));
  const trimSuffix=location && title.toLowerCase().endsWith(location.toLowerCase());
  const name=trimSuffix ? title.slice(0,-location.length).replace(/\s*[–-]\s*$/,'').trim() : title;
  const match=subjects.find(rule=>rule.pattern.test(name));
  // A foto cadastrada no painel (course.image, vinda da API) tem prioridade; sem ela, usa a foto de banco de imagens.
  const image=course.image || publicUrl(freshMap[String(course.id)] || choosePhoto(match?.group || 'business',name.toLowerCase()));
  return {name,city:location || null,area:match?.area || 'Cursos Senac',image};
}
