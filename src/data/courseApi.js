const BASE='https://ma.senac.br/wp-json/wp/v2/';
const FIELDS='id,slug,link,title,localidade,inicio,fim,preco,carga_horaria,horarios,total_de_vagas,modalidade,eixo_tecnologico,segmento,unidade,link_para_matricula,objetivo';
const LIST_FIELDS=FIELDS.replace(',objetivo','');
const CACHE='/data/liveCoursesSnapshot.json';
let dataPromise=null,livePromise=null,liveUntil=0;
const entity = s => {
  if (typeof document==='undefined') return String(s||'');
  return new DOMParser().parseFromString(String(s||''),'text/html').body.textContent?.trim() || '';
};
const normalize = item => ({ ...item,title:entity(item.title?.rendered || item.title || '') });
const request=async(url,signal)=>{
  const res=await fetch(url,{signal});
  if(!res.ok)throw Error('Falha na API de cursos: HTTP '+res.status);
  return {value:await res.json(),total:Number(res.headers.get('X-WP-Total') || 0)};
};
const fetchSnapshot=async()=>{
  const response=await fetch(CACHE);
  if(!response.ok)throw Error('Snapshot local indisponível');
  return response.json();
};
export async function loadLiveCourses({onCached,onLive}={}) {
  if (!dataPromise) dataPromise = fetchSnapshot().catch(()=>null);
  const cached=await dataPromise;
  if(cached) onCached?.({items:cached.courses.map(normalize),segments:cached.segments,units:cached.units,
    fetchedAt:cached.fetchedAt,source:'snapshot',total:cached.total});
  try {
    if (!livePromise || Date.now()>liveUntil) {
      liveUntil=Date.now()+5*60*1000;
      livePromise=(async()=>{
        const first=await request(BASE+'curso?per_page=100&page=1&_fields='+LIST_FIELDS,AbortSignal.timeout(20000));
        const pages=Math.ceil(first.total/100);
        const rest=await Promise.all(Array.from({length:Math.max(0,pages-1)},(_,i)=>
          request(BASE+'curso?per_page=100&page='+(i+2)+'&_fields='+LIST_FIELDS,AbortSignal.timeout(24000))));
        const items=[...first.value,...rest.flatMap(x=>x.value)];
        if(items.length!==first.total || new Set(items.map(x=>x.id)).size!==items.length)
          throw Error('Dados incompletos: '+items.length+'/'+first.total);
        return {items:items.map(normalize),fetchedAt:new Date().toISOString(),source:'live',total:first.total};
      })();
    }
    const output={...(await livePromise),segments:cached?.segments||[],units:cached?.units||[]};
    onLive?.(output);
    return output;
  } catch(err) {
    livePromise=null;
    if(!cached)throw err;
    return {error:err.message,source:'snapshot'};
  }
}
export async function fetchCourseDetails(id) {
  if (!dataPromise) dataPromise=fetchSnapshot().catch(()=>null);
  const snapshot=await dataPromise;
  const units=snapshot?.units||[];
  try {
    const response=await request(BASE+'curso/'+encodeURIComponent(id)+'?_fields='+FIELDS,AbortSignal.timeout(12000));
    return {item:normalize(response.value),source:'live',units};
  } catch(err) {
    const found=snapshot?.courses.find(item=>String(item.id)===String(id));
    if(!found)throw err;
    return {item:normalize(found),source:'snapshot',units};
  }
}
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
export const briefDate=value=>value || 'A confirmar';
