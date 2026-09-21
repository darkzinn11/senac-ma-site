import freshPhotos from './courseFreshPhotos.json';
import freshMap from './courseFreshMap.json';

// Exclusivamente imagens novas de banco de fotos, NÃO o acervo do Senac.
// O mapeamento por ID mantém a foto coerente em todas as turmas do mesmo curso.
const subjects = [
  { pattern:/enfermagem|sa[uú]de|idos[oa]|cuidador|hospital|primeiros socorros|farm[aá]cia/i, area:'Saúde', group:'health' },
  { pattern:/barb[ea]|corte de cabelo|cabeleireir|escova|alinhamento capilar/i, area:'Beleza e bem-estar', group:'hair' },
  { pattern:/maquiag|make up|sobrancelh|manicur|pedicur|depila|drenagem|massagem|cilio|pele|est[eé]tica/i, area:'Beleza e bem-estar', group:'makeup' },
  { pattern:/confeitar|bolo|p[aã]e[s]?|pizza|cozinh|gastronom|alimento|drinque|coquetel|culin[aá]ria/i, area:'Gastronomia', group:'cooking' },
  { pattern:/redes|computad|notebook|sistemas|programa[cç]|inform[aá]tica|office|excel|autocad|intelig[eê]ncia artificial/i, area:'Tecnologia', group:'coding' },
  { pattern:/costur|modelagem|modelista|alfaiataria|moda|vestu[aá]rio/i, area:'Moda e produção', group:'sewing' },
  { pattern:/vendas|com[eé]rcio|negocia[cç]|e-commerce|marketing|atendimento|administra|lideran[cç]|mercado de trabalho|orat[oó]ria|comunica[cç]/i, area:'Gestão e negócios', group:'business' },
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
  const image=freshMap[String(course.id)] || choosePhoto(match?.group || 'business',name.toLowerCase());
  return {name,city:location || null,area:match?.area || 'Cursos Senac',image};
}
