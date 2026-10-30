// O conteúdo legado às vezes chega inteiramente em maiúsculas. Ajusta apenas essas
// frases para leitura, preservando siglas conhecidas e textos que já têm capitalização.
const abbreviations = new Map(Object.entries({
  SENAC:'Senac', SESC:'Sesc', SENAR:'Senar', SEBRAE:'Sebrae', FECOMERCIO:'Fecomércio',
  PSG:'PSG', INSS:'INSS', MEC:'MEC', CNC:'CNC', EAD:'EAD', CNPJ:'CNPJ', CPF:'CPF',
  CEP:'CEP', RH:'RH', TI:'TI', MA:'MA', SIG:'SIG', UF:'UF', ONG:'ONG',
}));

export function sentenceCase(value) {
  const text = String(value ?? '');
  const letters = text.match(/\p{L}/gu) || [];
  if (letters.length < 4 || text !== text.toLocaleUpperCase('pt-BR') || /(?:https?:\/\/|www\.|@)/i.test(text)) return text;
  const words = text.match(/[\p{L}]+/gu) || [];
  if (words.length === 1 && text.trim().length <= 4) return abbreviations.get(text.trim()) || text;
  let result = text.toLocaleLowerCase('pt-BR').replace(/[\p{L}]+/gu, word => abbreviations.get(word.toLocaleUpperCase('pt-BR')) || word);
  result = result.replace(/\p{L}/u, char => char.toLocaleUpperCase('pt-BR'))
    .replace(/ministério da educação/gi, 'Ministério da Educação')
    .replace(/ministério do trabalho e emprego/gi, 'Ministério do Trabalho e Emprego')
    .replace(/instituto nacional do seguro social/gi, 'Instituto Nacional do Seguro Social');
  return result;
}
