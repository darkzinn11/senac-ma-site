import { publicUrl } from './basePath';

// Conteúdo de apresentação extraído do frame 54:10460.
// Integração do catálogo: substituir coursePreview por dados da API do Senac.
export const asset = (name) => publicUrl('/assets/figma/' + name.replace(/\.png$/i, '.webp'));
export const links = {
  home: '/',
  about: '/institucional/',
  units: '/unidades/',
  courses: '/cursos-senac/',
  contact: '/fale-conosco/',
  jobs: '/trabalhe-conosco-new/',
  student: 'https://cloud.plataforma.senac.br/senacportalaluno/#/login?returnUrl=',
  opportunities: '/encaminhamento-ao-mercado-de-trabalho/',
  interest: '/cadastro-de-interesse/',
  ead: '/cursos-a-distancia/',
  psg: '/psg/',
  notices: '/editais-psg/',
  results: '/resultados-psg/',
  tenders: '/licitacoes-2016/',
  news: '/noticias/',
  privacy: '/privacidade-e-protecao-de-dados/',
  library: '/biblioteca/',
  restaurant: '/unidades/restaurante-escola/',
  mobileSchool: '/carretas-escola/',
  ombudsman: 'http://189.20.80.26:5000',
  company: '/solicite-uma-visita/',
  facebook: 'https://www.facebook.com/senacmaranhao',
  instagram: 'https://www.instagram.com/senacmaranhao',
  youtube: 'https://www.youtube.com/@senacmaranhao7779',
};
export const heroSlides = [
  { image:'b2300.png', mobileImage:publicUrl('/assets/mobile-banners/mobile-selecao-senac.png'), alt:'Senac Maranhão: educação profissional e novas oportunidades.', href:links.courses },
  { image:'6c1ad.png', mobileImage:publicUrl('/assets/mobile-banners/mobile-senac-80-anos.png'), alt:'Há 80 anos, o Senac transforma histórias e futuros.', href:links.about },
  { image:'08919.png', mobileImage:publicUrl('/assets/mobile-banners/mobile-orango.png'), alt:'Descubra seu caminho. Vem pro Orango. Cursos gratuitos e 100% online.', href:links.ead },
  { image:'93d0b.png', mobileImage:publicUrl('/assets/mobile-banners/mobile-psg.png'), alt:'Educação profissional para todos. Conheça o Programa Senac de Gratuidade.', href:links.psg },
  { image:'500dd.png', mobileImage:publicUrl('/assets/mobile-banners/mobile-nova-unidade.png'), alt:'Nova unidade em São Luís, na região Forquilha/Cohab.', href:links.units },
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
  { city:'São Luís', name:'Centro de Educação Profissional de São Luís', href:'/unidades/centro-de-educacao-profissional-de-sao-luis/' },
  { city:'São Luís', name:'Posto Avançado São Luís', href:'/unidades/posto-avancado-sao-luis/' },
  { city:'Açailândia', name:'Açailândia', href:'/unidades/centro-de-educacao-profissional-de-acailandia/' },
  { city:'Bacabal', name:'Bacabal', href:'/unidades/centro-de-educacao-profissional-de-bacabal/' },
  { city:'Balsas', name:'Balsas', href:'/unidades/posto-avancado-de-balsas/' },
  { city:'Caxias', name:'Caxias', href:'/unidades/centro-de-educacao-profissional-de-caxias/' },
  { city:'Imperatriz', name:'Imperatriz', href:'/unidades/centro-de-educacao-profissional-de-imperatriz/' },
  { city:'Pinheiro', name:'Pinheiro', href:'/unidades/centro-de-educacao-profissional-de-pinheiro/' },
  { city:'Santa Inês', name:'Santa Inês', href:'/unidades/centro-de-educacao-profissional-de-santa-ines/' },
  { city:'Timon', name:'Timon', href:'/unidades/posto-avancado-de-timon/' },
];
export const services = [
  { title:'Banco de Oportunidades', image:'ff2a6.png', href:links.opportunities },
  { title:'Cadastro de interesse', image:'966ba.png', href:'https://acic.ma.senac.br/' },
  { title:'Cursos à Distância', image:'dbc66.png', href:'https://www.ead.senac.br/' },
  { title:'Programa Senac de Gratuidade', image:'79629.png', href:'https://www.portal-psg.ma.senac.br/#/programa-senac-de-gratuidade' },
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
    href:'/iii-congresso-sesc-senac-ma-promove-reflexoes-sobre-educacao-tecnologia-e-equilibrio-emocional/' },
  { category:'Inovação', color:'#fa1466', image:'0d710.png',
    title:'Alunos do Senac apresentam projetos integradores em noite de conexões, aprendizado e inovação',
    href:'/alunos-do-senac-apresentam-projetos-integradores-em-noite-de-conexoes-aprendizado-e-inovacao/' },
  { category:'Tecnologia', color:'#004b8d', image:'87afe.png',
    title:'III Congresso Sesc e Senac promoverá reflexões sobre educação e tecnologia',
    href:'/iii-congresso-sesc-e-senac-promovera-reflexoes-sobre-educacao-e-tecnologia/' },
  { category:'Empresas', color:'#a3cc00', image:'1ed50.png',
    title:'Senac Maranhão participa da Semana Empresarial de Açailândia 2026',
    href:'/senac-maranhao-participa-da-semana-empresarial-de-acailandia-2026/' },
];
// Menu principal: mesma estrutura do site atual (seções, ordem e destinos). `items` pode ter um nível a mais
// (grupos como "Capital" e "Interior", ou as etapas do PSG). Itens sem `href` são só títulos de grupo.
export const navigation = [
  { label:'O Senac', items:[
    { label:'Quem somos', href:links.about },
    { label:'Missão e Visão', href:'/institucional/missao-e-visao/' },
    { label:'Fecomércio MA', href:'http://www.fecomercio-ma.com.br/' },
    { label:'Estrutura Organizacional', href:'/institucional/administracao-regional/' },
    { label:'Gestão e Transparência', href:'https://transparencia.senac.br/' },
    { label:'Privacidade e Proteção de Dados', href:links.privacy },
    { label:'Perguntas Frequentes', href:'/faq/' },
    { label:'Legislação', href:'/institucional/projeto-politico-pedagogico/' },
  ] },
  { label:'Unidade', items:[
    { label:'Capital', items:[
      { label:'Centro de Educação Profissional de São Luís', href:'/unidades/centro-de-educacao-profissional-de-sao-luis/' },
      { label:'Posto Avançado São Luís', href:'/unidades/posto-avancado-sao-luis/' },
      { label:'Restaurante Escola', href:'/unidades/restaurante-escola/' },
    ] },
    { label:'Interior', items:[
      { label:'Açailândia', href:'/unidades/centro-de-educacao-profissional-de-acailandia/' },
      { label:'Bacabal', href:'/unidades/centro-de-educacao-profissional-de-bacabal/' },
      { label:'Balsas', href:'/unidades/posto-avancado-de-balsas/' },
      { label:'Caxias', href:'/unidades/centro-de-educacao-profissional-de-caxias/' },
      { label:'Imperatriz', href:'/unidades/centro-de-educacao-profissional-de-imperatriz/' },
      { label:'Pinheiro', href:'/unidades/centro-de-educacao-profissional-de-pinheiro/' },
      { label:'Santa Inês', href:'/unidades/centro-de-educacao-profissional-de-santa-ines/' },
      { label:'Timon', href:'/unidades/posto-avancado-de-timon/' },
    ] },
    { label:'Unidades Móveis', items:[
      { label:'Carreta Escola', href:links.mobileSchool },
    ] },
    { label:'Educação a distância', href:'https://www.ead.senac.br/' },
  ] },
  { label:'Para você', items:[
    { label:'Cursos', href:links.courses },
    { label:'PSG – Programa Senac de Gratuidade', href:'https://www.portal-psg.ma.senac.br/#/programa-senac-de-gratuidade', items:[
      { label:'O que é o PSG?', href:links.psg },
      { label:'Inscrição', href:'https://www.psg.ma.senac.br/Inscrevase.aspx' },
      { label:'Editais', href:links.notices },
      { label:'Resultados de Editais', href:links.results },
    ] },
    { label:'Aprendizagem', href:'/aprendizagem/' },
    { label:'Parcerias e Política de Descontos', href:'/programa-de-beneficios-do-senac/' },
    { label:'Biblioteca', href:links.library },
    { label:'Banco de Oportunidades', href:links.opportunities },
    { label:'Notícias', href:links.news },
    { label:'Trabalhe Conosco', href:links.jobs },
  ] },
  { label:'Para sua empresa', items:[
    { label:'Solicite uma Visita', href:links.company },
    { label:'Banco de Oportunidades', href:links.opportunities },
    { label:'Aprendizagem', href:'/aprendizagem/' },
    { label:'Licitações', href:links.tenders },
    { label:'Compras e contratos', href:'http://www.processo.ma.senac.br/Admin/Cadastros/Fornecedores.aspx' },
  ] },
];
export const videoId = 'si7hKHgLuSw';
