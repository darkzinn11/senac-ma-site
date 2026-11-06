// Preços conferidos em 06/11/2026 nos PDFs de Bacabal e Santa Inês,
// campanha do trimestre IV/2026. A API destas quatro turmas ainda retorna
// o valor integral. Remover os ajustes quando o cadastro/SIG for corrigido.
const corrections = new Map([
  // Santa Inês: Informática Avançada Office e Mobile, 16/11 a 04/12.
  ['01a16960-9a7b-7d5a-a231-abef313a02d3', { original:273, promotional:163.8 }],
  // Bacabal: Oratória avançada, 23/11 a 04/12.
  ['01a16960-98b2-7a42-a89f-fbb655ae129d', { original:214, promotional:128.4 }],
  // Santa Inês: Preparando-se para o Mercado de Trabalho, 14/12 a 18/12.
  ['01a1965e-e16a-7097-af45-0d40d66e40cc', { original:103, promotional:61.8 }],
  // Santa Inês: Massagem Modeladora e Turbinada, 16/12 a 24/12.
  ['01a1965e-e271-799c-af71-5716bbcb8bfa', { original:70, promotional:42 }],
]);

export function offerPrice(offer) {
  const correction = corrections.get(offer.id);
  // Respeita mudanças posteriores na API e não reaplica desconto em preços
  // que já vierem corrigidos. Outras turmas do mesmo curso não são afetadas.
  return correction && Number(offer.price) === correction.original
    ? correction.promotional
    : offer.price;
}
