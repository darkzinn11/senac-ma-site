// Helpers puros dos cursos (a leitura dos dados fica em src/api/courses.js).
export const dateISO=value => {
  const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value||'');
  return match ? match[3]+'-'+match[2]+'-'+match[1] : null;
};
export const courseStatus=(item,today=new Date().toISOString().slice(0,10))=>{
  const start=dateISO(item.inicio),end=dateISO(item.fim);
  if(end && end<today)return 'Encerrada';
  if(start && start>today)return 'Programada';
  if(start && end && start<=today && end>=today)return 'Em andamento';
  return 'A confirmar';
};
export const brl=value=>{
  if(value===null || value===undefined || String(value).trim()==='')return null;
  const number=Number(String(value).replace(',','.'));
  return Number.isFinite(number) ? new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(number) : null;
};
export const COURSE_DISCOUNT_PERCENT = 40;
// O preço da API permanece como referência; calcula a promoção uma única vez,
// em centavos, para não acumular descontos nem exibir frações de centavo.
export function coursePrice(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const amount = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(amount) || amount < 0) return null;
  const originalCents = Math.round((amount + Number.EPSILON) * 100);
  const discountPercent = originalCents > 0 ? COURSE_DISCOUNT_PERCENT : 0;
  const currentCents = Math.round(originalCents * (100 - discountPercent) / 100);
  return { original:originalCents / 100, current:currentCents / 100, discountPercent };
}
export const briefDate=value=>value || 'A confirmar';
