// Contato de uma unidade a partir do CADASTRO de Unidades do admin (única fonte): endereço, CEP, telefones, e-mail.
// Devolve HTML seguro (tudo escapado) ou '' quando o cadastro não tem nenhum dado de contato.
const esc = text => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Aceita o objeto da API (snake_case) ou o já adaptado (camelCase).
export function unitContactFields(unit) {
  if (!unit) return null;
  return {
    address: unit.address || '', zip: unit.zip_code || unit.zip || '', phone: unit.phone || '',
    otherPhones: unit.other_phones || unit.otherPhones || '', whatsapp: unit.whatsapp || '', email: unit.email || '',
    hours: unit.opening_hours || unit.hours || '',
  };
}

export function unitContactHtml(unit) {
  const f = unitContactFields(unit);
  if (!f) return '';
  const lines = [];
  if (f.address) lines.push(esc(f.address));
  if (f.zip) lines.push('CEP: ' + esc(f.zip));
  const phones = [f.phone, f.otherPhones].filter(Boolean).join(' / ');
  if (phones) lines.push(esc(phones));
  if (f.whatsapp) lines.push('WhatsApp: ' + esc(f.whatsapp));
  if (f.email) lines.push('Email: <a href="mailto:' + esc(f.email) + '">' + esc(f.email) + '</a>');
  if (f.hours) lines.push('Horário: ' + esc(f.hours).replace(/\r?\n/g, ' · '));
  return lines.length ? '<p>' + lines.join('<br>') + '</p>' : '';
}
