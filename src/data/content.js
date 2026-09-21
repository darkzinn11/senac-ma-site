// Conteúdo de apresentação extraído do frame 54:10460.
// Integração do catálogo: substituir coursePreview por dados da API do Senac.
export const asset = (name) => '/assets/figma/' + name.replace(/\.png$/i, '.webp');
export const links = {
  home: 'https://ma.senac.br/',
  about: 'https://ma.senac.br/institucional/',
  units: 'https://ma.senac.br/unidades/',
  courses: 'https://ma.senac.br/cursos-senac/',
  contact: 'https://ma.senac.br/fale-conosco/',
  jobs: 'https://ma.senac.br/trabalhe-conosco-new/',
  student: 'https://cloud.plataforma.senac.br/senacportalaluno/#/login?returnUrl=',
  opportunities: 'https://ma.senac.br/encaminhamento-ao-mercado-de-trabalho/',
  interest: 'http://www.acic.ma.senac.br/',
  ead: 'https://www.ead.senac.br/',
  psg: 'https://www.portal-psg.ma.senac.br/#/programa-senac-de-gratuidade',
  notices: 'https://ma.senac.br/editais-psg/',
  results: 'https://ma.senac.br/resultados-psg/',
  tenders: 'https://ma.senac.br/licitacoes-2016/',
  news: 'https://ma.senac.br/noticias/',
  privacy: 'https://ma.senac.br/privacidade-e-protecao-de-dados/',
  library: 'https://ma.senac.br/biblioteca/',
  restaurant: 'https://ma.senac.br/unidades/restaurante-escola/',
  mobileSchool: 'https://ma.senac.br/carretas-escola/',
  ombudsman: 'http://189.20.80.26:5000',
  company: 'https://ma.senac.br/solicite-uma-visita/',
  facebook: 'https://www.facebook.com/senacmaranhao',
  instagram: 'https://www.instagram.com/senacmaranhao',
  youtube: 'https://www.youtube.com/@senacmaranhao7779',
};
export const heroSlides = [
  { image:'b2300.png', alt:'Senac Maranhão: educação profissional e novas oportunidades.', href:links.courses },
  { image:'6c1ad.png', alt:'Há 80 anos, o Senac transforma histórias e futuros.', href:links.about },
  { image:'08919.png', alt:'Descubra seu caminho. Vem pro Orango. Cursos gratuitos e 100% online.', href:links.ead },
  { image:'93d0b.png', alt:'Educação profissional para todos. Conheça o Programa Senac de Gratuidade.', href:links.psg },
  { image:'500dd.png', alt:'Nova unidade em São Luís, na região Forquilha/Cohab.', href:links.units },
];
export const coursePreview = [
  { id:'paes', title:'Pães e Fermentação Artesanal', area:'Produção de alimentos', hours:10, image:'f964e.png' },
  { id:'excel', title:'Excel para o Mercado de Trabalho', area:'Tecnologia e negócios', hours:12, image:'11592.png' },
  { id:'bolos', title:'Bolos Decorados e Confeitaria', area:'Gastronomia', hours:16, image:'c186e.png' },
  { id:'barbearia', title:'Corte Masculino e Barbearia', area:'Beleza e bem-estar', hours:20, image:'4be9a.png' },
  { id:'enfermagem', title:'Cuidados Básicos de Enfermagem', area:'Saúde', hours:24, image:'b30c8.png' },
  { id:'atendimento', title:'Atendimento Humanizado em Saúde', area:'Saúde e atendimento', hours:8, image:'d0145.png' },
  { id:'gestao', title:'Gestão de Serviços Hospitalares', area:'Gestão em saúde', hours:14, image:'8acaf.png' },
].map(course => ({ ...course, city:'São Luís', unit:null, type:null }));
export const cities = ['São Luís','Açailândia','Bacabal','Balsas','Caxias','Imperatriz','Pinheiro','Santa Inês','Timon'];
// Os destinos de unidades são públicos e foram consultados no portal oficial.
export const units = [
  { city:'São Luís', name:'Centro de Educação Profissional de São Luís', href:'https://ma.senac.br/unidades/centro-de-educacao-profissional-de-sao-luis/' },
  { city:'São Luís', name:'Posto Avançado São Luís', href:'https://ma.senac.br/unidades/posto-avancado-sao-luis/' },
  { city:'Açailândia', name:'Açailândia', href:'https://ma.senac.br/unidades/centro-de-educacao-profissional-de-acailandia/' },
  { city:'Bacabal', name:'Bacabal', href:'https://ma.senac.br/unidade-local/centro-de-educacao-profissional-de-bacabal/' },
  { city:'Balsas', name:'Balsas', href:'https://ma.senac.br/unidades/posto-avancado-de-balsas/' },
  { city:'Caxias', name:'Caxias', href:'https://ma.senac.br/unidade-local/centro-de-educacao-profissional-de-caxias/' },
  { city:'Imperatriz', name:'Imperatriz', href:'https://ma.senac.br/unidade-local/centro-de-educacao-profissional-de-imperatriz/' },
  { city:'Pinheiro', name:'Pinheiro', href:'https://ma.senac.br/unidade-local/centro-de-educacao-profissional-de-pinheiro/' },
  { city:'Santa Inês', name:'Santa Inês', href:'https://ma.senac.br/unidade-local/centro-de-educacao-profissional-de-santa-ines/' },
  { city:'Timon', name:'Timon', href:'https://ma.senac.br/unidades/posto-avancado-de-timon/' },
];
export const services = [
  { title:'Banco de Oportunidades', image:'ff2a6.png', href:links.opportunities },
  { title:'Cadastro de interesse', image:'966ba.png', href:links.interest },
  { title:'Cursos à Distância', image:'dbc66.png', href:links.ead },
  { title:'Programa Senac de Gratuidade', image:'79629.png', href:links.psg },
];
export const notices = [
  { title:'Programa Senac de Gratuidade', image:'53fc9.png', href:links.notices },
  { title:'Resultados do Programa Senac de Gratuidade', image:'76a19.png', href:links.results },
  { title:'Licitações', image:'1b182.png', href:links.tenders },
];
export const stories = [
  { category:'Educação', color:'#4f7afa', image:'5ecbf.png',
    title:'Educação e Tecnologia foram pautas principais no III Congresso Sesc/Senac-MA',
    excerpt:'O III Congresso Sesc/Senac-MA – Educação que Transforma foi realizado nos dias 10 e 11 de setembro, em São Luís, …',
    href:'https://ma.senac.br/iii-congresso-sesc-senac-ma-promove-reflexoes-sobre-educacao-tecnologia-e-equilibrio-emocional/' },
  { category:'Inovação', color:'#fa1466', image:'0d710.png',
    title:'Alunos do Senac apresentam projetos integradores em noite de conexões, aprendizado e inovação',
    href:'https://ma.senac.br/alunos-do-senac-apresentam-projetos-integradores-em-noite-de-conexoes-aprendizado-e-inovacao/' },
  { category:'Tecnologia', color:'#004b8d', image:'87afe.png',
    title:'III Congresso Sesc e Senac promoverá reflexões sobre educação e tecnologia',
    href:'https://ma.senac.br/iii-congresso-sesc-e-senac-promovera-reflexoes-sobre-educacao-e-tecnologia/' },
  { category:'Empresas', color:'#a3cc00', image:'1ed50.png',
    title:'Senac Maranhão participa da Semana Empresarial de Açailândia 2026',
    href:'https://ma.senac.br/senac-maranhao-participa-da-semana-empresarial-de-acailandia-2026/' },
];
export const navigation = [
  { label:'O Senac', items:[['Quem somos',links.about],['Onde estamos',links.units],['Carretas-Escola',links.mobileSchool],['Ouvidoria',links.ombudsman]] },
  { label:'Unidade', items:[['Todas as unidades',links.units],...units.map(u=>[u.name,u.href])] },
  { label:'Para você', items:[['Cursos presenciais',links.courses],['Cursos a distância',links.ead],['Programa Senac de Gratuidade',links.psg],['Biblioteca',links.library],['Banco de Oportunidades',links.opportunities]] },
  { label:'Para sua empresa', items:[['Solicite uma visita',links.company],['Banco de Oportunidades',links.opportunities],['Licitações',links.tenders]] },
];
export const videoId = 'si7hKHgLuSw';
