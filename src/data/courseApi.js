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
// O preço da API já é o valor final ("por"). Calcula o valor de referência
// ("de") dividindo por 60%, para que o desconto de 40% resulte no preço da API.
export function coursePrice(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const amount = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(amount) || amount < 0) return null;
  const currentCents = Math.round((amount + Number.EPSILON) * 100);
  const originalCents = Math.round(currentCents * 100 / (100 - COURSE_DISCOUNT_PERCENT));
  return { original:originalCents / 100, current:currentCents / 100, hasDiscount:originalCents > currentCents };
}
export const briefDate=value=>value || 'A confirmar';
