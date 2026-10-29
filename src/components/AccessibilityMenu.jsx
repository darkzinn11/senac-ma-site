import React,{useEffect,useState} from 'react';
import {AddCircle,MinusCirlce,Colorfilter,Eye,EyeSlash,Sun,Link,Text,Refresh,CloseSquare} from 'iconsax-react';

const AccessibilityMark=()=> <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
  <circle cx="12" cy="4.2" r="2.25" fill="currentColor"/>
  <path fill="currentColor" d="M4.25 7.2c-.68 0-1.25.56-1.25 1.24 0 .53.34 1 .85 1.17l4.48 1.49v3.18l-2.57 5a1.3 1.3 0 0 0 2.31 1.19L12 14.83l3.93 5.64a1.3 1.3 0 0 0 2.31-1.19l-2.57-5V11.1l4.48-1.49c.51-.17.85-.64.85-1.17 0-.68-.57-1.24-1.25-1.24-.13 0-.26.02-.39.06L13.7 9.14a5.55 5.55 0 0 1-3.4 0L4.64 7.26a1.3 1.3 0 0 0-.39-.06Z"/>
</svg>;

const defaults={textScale:1,grayscale:false,contrast:false,negative:false,background:false,links:false,legible:false};
const readPrefs=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem('senac-a11y')||'{}')}}catch{return defaults}};
const textSelector='h1,h2,h3,h4,p,a,button,label,input,select,textarea,span,strong,small,li,address';
const scaledTextSelector=textSelector.split(',').map(selector=>'.site-shell '+selector).join(',');

function applyTextScale(scale){
  document.querySelectorAll(scaledTextSelector).forEach(el=>{
    if(el.closest('.accessibility-widget')||el.closest('[vw]'))return;
    if(scale===1){
      if(el.dataset.a11yBaseFont){el.style.fontSize=el.dataset.a11yInlineFont==='__none__'?'':el.dataset.a11yInlineFont;delete el.dataset.a11yBaseFont;delete el.dataset.a11yInlineFont}
      return;
    }
    if(!el.dataset.a11yBaseFont){
      el.dataset.a11yBaseFont=getComputedStyle(el).fontSize;
      el.dataset.a11yInlineFont=el.style.fontSize||'__none__';
    }
    el.style.fontSize=(parseFloat(el.dataset.a11yBaseFont)*scale).toFixed(2)+'px';
  });
}

// VLibras 7.x: o painel fica no shadow DOM de #vlibras-app-root; fechado, o #vlibras-app recebe o atributo inert.
const vlibrasShadow=()=>document.getElementById('vlibras-app-root')?.shadowRoot;
const vlibrasIsOpen=()=>{const app=vlibrasShadow()?.getElementById('vlibras-app');return Boolean(app&&!app.hasAttribute('inert'))};
// Os ícones do painel (inclusive o X de fechar) são máscaras CSS sem o prefixo -webkit-, que o Safari do iPhone exige:
// sem isso o botão Fechar fica invisível. O painel também é limitado à largura da tela.
const VLIBRAS_FIX='i[style*="--icon"]{-webkit-mask-image:var(--icon);-webkit-mask-size:contain;-webkit-mask-position:center;-webkit-mask-repeat:no-repeat}'
  +'#vlibras-app{max-width:calc(100vw - 16px)}';
function patchVlibrasApp(){
  const shadow=vlibrasShadow();
  if(!shadow)return false;
  if(!shadow.getElementById('senac-vlibras-fix')){
    const style=document.createElement('style');style.id='senac-vlibras-fix';style.textContent=VLIBRAS_FIX;shadow.appendChild(style);
  }
  return true;
}

export default function AccessibilityMenu(){
  const [open,setOpen]=useState(false);
  const [prefs,setPrefs]=useState(readPrefs);
  useEffect(()=>{
    const root=document.documentElement;
    ['grayscale','contrast','negative','background','links','legible'].forEach(key=>root.classList.toggle('a11y-'+key,prefs[key]));
    localStorage.setItem('senac-a11y',JSON.stringify(prefs));
  },[prefs]);
  useEffect(()=>{
    applyTextScale(prefs.textScale);
    const shell=document.querySelector('.site-shell'); if(!shell)return;
    const observer=new MutationObserver(()=>applyTextScale(prefs.textScale));
    observer.observe(shell,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[prefs.textScale]);
  useEffect(()=>{
    const onKey=e=>{if(e.key==='Escape')setOpen(false)};
    window.addEventListener('keydown',onKey);
    // O botão do VLibras fica num shadow DOM fixado no meio da tela, onde cobre as setas do banner
    // principal; um estilo dentro do shadow root o leva para baixo, na altura do botão de acessibilidade.
    const placeVlibras=()=>{
      const root=document.getElementById('vlibras-access-wrapper')?.shadowRoot;
      if(!root)return false;
      if(!root.getElementById('senac-vlibras-position')){
        const style=document.createElement('style');style.id='senac-vlibras-position';
        style.textContent='#vlibras-access{top:auto;bottom:37px}@media (max-width:640px){#vlibras-access{bottom:22px}}';
        root.appendChild(style);
      }
      return true;
    };
    // O painel do VLibras só é criado quando aberto pela primeira vez (ou ao recarregar, se ficou aberto).
    let placed=placeVlibras(),patched=patchVlibrasApp();
    const vlibrasObserver=new MutationObserver(()=>{
      placed=placed||placeVlibras();patched=patched||patchVlibrasApp();
      if(placed&&patched)vlibrasObserver.disconnect();
    });
    if(!placed||!patched)vlibrasObserver.observe(document.body,{childList:true});
    if(!document.getElementById('vlibras-plugin-script')){
      const script=document.createElement('script');
      script.id='vlibras-plugin-script';script.src='https://vlibras.gov.br/app/vlibras-plugin.js';script.async=true;
      script.onload=()=>{if(window.VLibras?.Widget&&!window.__senacVlibras)window.__senacVlibras=new window.VLibras.Widget('https://vlibras.gov.br/app')};
      document.body.appendChild(script);
    }else if(window.VLibras?.Widget&&!window.__senacVlibras) window.__senacVlibras=new window.VLibras.Widget('https://vlibras.gov.br/app');
    return()=>{window.removeEventListener('keydown',onKey);vlibrasObserver.disconnect()};
  },[]);

  const toggle=key=>setPrefs(value=>({...value,[key]:!value[key]}));
  const visualMode=key=>setPrefs(value=>({
    ...value,grayscale:false,contrast:false,negative:false,[key]:!value[key]
  }));
  const textStep=delta=>setPrefs(value=>({...value,textScale:Math.min(1.4,Math.max(.8,Math.round((value.textScale+delta)*10)/10))}));
  const row=(label,Icon,onClick,active=false,extra='')=><button type="button" className={'a11y-menu-row '+(active?'is-active':'')} aria-pressed={active||undefined} onClick={onClick}>
    <Icon size={19} variant="Bold" color="currentColor" aria-hidden="true"/><span>{label}</span>{extra&&<small>{extra}</small>}
  </button>;
  // Abre o VLibras ou, se já estiver aberto, fecha: uma saída garantida mesmo se o X do painel não aparecer.
  const [vlibrasOpen,setVlibrasOpen]=useState(false);
  useEffect(()=>{if(open)setVlibrasOpen(vlibrasIsOpen())},[open]);
  const toggleVlibras=()=>{
    if(vlibrasIsOpen())vlibrasShadow()?.querySelector('button[aria-label="Fechar"]')?.click();
    else if(window.VLibrasWidget?.open)window.VLibrasWidget.open();
    else document.getElementById('vlibras-access-wrapper')?.shadowRoot?.getElementById('vlibras-button')?.click();
    setOpen(false);
  };
  const reset=()=>{setPrefs(defaults);applyTextScale(1)};
  return <>
    <div className="accessibility-widget">
      <button type="button" className="accessibility-trigger" aria-label="Abrir opções de acessibilidade" aria-expanded={open}
        aria-controls="accessibility-panel" onClick={()=>setOpen(value=>!value)}><AccessibilityMark/></button>
      {open&&<div className="accessibility-panel" id="accessibility-panel" role="dialog" aria-label="Opções de acessibilidade">
        <div className="accessibility-panel-heading"><strong>Acessibilidade</strong>
          <button type="button" className="accessibility-close" aria-label="Fechar opções de acessibilidade" onClick={()=>setOpen(false)}>
            <CloseSquare size={21} variant="Bold" color="currentColor" aria-hidden="true"/>
          </button></div>
        <div className="a11y-menu-list">
          {row('Aumentar o Texto',AddCircle,()=>textStep(.1),false,Math.round(prefs.textScale*100)+'%')}
          {row('Diminuir o Texto',MinusCirlce,()=>textStep(-.1))}
          {row('Escala de Cinza',Colorfilter,()=>visualMode('grayscale'),prefs.grayscale)}
          {row('Alto Contraste',Eye,()=>visualMode('contrast'),prefs.contrast)}
          {row('Contraste Negativo',EyeSlash,()=>visualMode('negative'),prefs.negative)}
          {row('Luz de Cor de Fundo',Sun,()=>toggle('background'),prefs.background)}
          {row('Links Sublinhados',Link,()=>toggle('links'),prefs.links)}
          {row('Fonte Legível',Text,()=>toggle('legible'),prefs.legible)}
          <button type="button" className="a11y-menu-row a11y-vlibras-row" onClick={toggleVlibras}>
            <AccessibilityMark/><span>{vlibrasOpen?'Fechar VLibras':'VLibras'}</span><small>Libras</small>
          </button>
        </div>
        <button type="button" className="accessibility-reset" onClick={reset}>
          <Refresh size={18} variant="Bold" color="currentColor" aria-hidden="true"/> Redefinir
        </button>
      </div>}
    </div>
    <div vw="" className="enabled">
      <div {...{'vw-access-button':''}} className="active"></div>
      <div {...{'vw-plugin-wrapper':''}}><div className="vw-plugin-top-wrapper"></div></div>
    </div>
  </>;
}
