# Portal Senac Maranhão
Implementação da home aprovada no Figma em React + Vite e CSS, com assets exportados do arquivo e fontes locais.
Referência: https://www.figma.com/design/SyVFeWICGytcsUzjhd2RWV?node-id=54-10460

## Executar
```bash
cd "/Users/jorranpetrus/SITE SENAC"
npm install
npm run dev -- --host 127.0.0.1
```
Build: `npm run build`. A pasta `dist` contém a versão compilada.

## Organização
- `src/components`: navegação, carrosséis, busca, cursos e seções institucionais.
- `src/data/content.js`: conteúdo, destinos oficiais e dados de apresentação.
- `src/styles.css`: tokens visuais, recortes do Figma e regras responsivas.
- `public/assets/figma`: SVGs do Figma e imagens WebP otimizadas (31 imagens, cerca de 3 MB).
- `.design/figma-originals`: PNGs originais preservados (cerca de 41 MB).
- `public/fonts`: Nexa Pro Trial da instalação local e Poppins.
- `.qa`: verificação automatizada, capturas e relatório de resultados.

## Integrações
Os sete cursos e cargas horárias reproduzem o conteúdo do layout, sem afirmar disponibilidade atual de turmas. A busca por nome, área e cidade funciona sobre esse conjunto local. O título do Figma associa os destaques a São Luís. Unidade e tipo permanecem sem vinculação nos registros, pois o design não informa esses dados; filtros por esses campos exigem a integração do catálogo real. Não foram inventadas matrículas, vagas, datas ou associações a unidades.
Os detalhes dos cursos encaminham à programação oficial. Serviços, Portal do Aluno, notícias e editais usam os destinos consultados em https://ma.senac.br/ em 20/09/2026. O vídeo utiliza o ID encontrado no portal oficial e carrega o player após o clique.

## Verificação
Execute `node .qa/verify.mjs` com a prévia em http://localhost:5173. A verificação usa Playwright e o Chrome instalado no Mac, com sessão de navegador isolada. Cobre cinco larguras, recursos, menus, carrosséis, busca, diálogo e ativação do vídeo.

## Revisão editorial e recuperação
Foi corrigida a grafia “gratuitidade” para “Gratuidade”. O copyright 2020 segue o layout e merece revisão editorial antes da publicação.
A versão anterior foi preservada em `.senac-backups/pre-figma-20260920-150201`.

## Dados: API própria (fonte única)
O site consome somente a API pública (`/v1/public/...`); não há snapshots no bundle (os antigos foram movidos para fora do projeto).
- `src/api/client.js`: GET com timeout (10 s), 1 nova tentativa em falha de rede/5xx/429, cache em memória (5 min), sem cookies/credenciais. `mediaUrl()` resolve `/v1/media/files/...`.
- `src/api/content.js`: resolução de rotas (`/v1/public/content?path=`), listagens (notícias, editais, resultados, unidades), home (banners, acesso rápido, notícias), busca. `src/api/courses.js`: catálogo (consulta no servidor + cruzamento com turmas). `src/api/adapters.js`: formato da API -> formato dos componentes. `src/api/seo.js`: title/description/canonical/robots por rota.
- `src/components/Html.jsx`: HTML da API renderizado via `dangerouslySetInnerHTML` somente após DOMPurify (3.4.16, fixa); imagens quebradas são ocultadas.
- 301 da API: o site troca a URL (`replaceState`) e segue; 410: "Conteúdo removido"; inexistente: 404; API fora do ar: mensagem com "Tentar novamente" (a home cai nos conteúdos de apresentação de `src/data/content.js`).
- Desenvolvimento: `npm run dev` faz proxy de `/v1` para `http://127.0.0.1:8080` (`API_PROXY_TARGET` altera). Em produção publique o site e a API na mesma origem (proxy reverso em `/v1`) ou defina `VITE_API_URL` (a API precisa liberar a origem em `PUBLIC_ALLOWED_ORIGINS`). `VITE_SITE_URL` define o domínio do canonical.
- Mídia: enquanto os uploads não são copiados para o servidor de mídia, `src/data/localMedia.json` (gerado por `npm run media:map`) aponta as 231 mídias de `public/media` para as chaves da API. Depois do rsync, esvazie esse arquivo (`{}`).
- Verificação: `npm run verify:independence` (rotas reais, tráfego externo bloqueado) e `npm run verify:sitemap` (amostra do sitemap antigo). Ambos exigem a API no ar.

### Biblioteca de ícones
- Preservar os pictogramas SVG originais do Figma (Portal do aluno, busca, setas, duração, botões e redes sociais) em `src/components/Ui.jsx`. Usar `iconsax-react` para novos controles internos, incluindo os filtros, dados dos cursos e visualização grade/lista.
- As subpáginas utilizam componentes Iconsax diretamente. `@tabler/icons-react` e `lucide-react` foram removidos das dependências.
- As logos institucionais permanecem como assets originais; não devem ser substituídas por ícones.

### Catálogo: limite de scroll e modos de visualização
- O filtro à esquerda acompanha a rolagem somente até o último card do catálogo. A paginação fica fora da região que limita o sticky, impedindo o filtro de descer até os controles de páginas.
- A alternância grade/lista, os 6 cursos por página, os filtros e a navegação mantêm o mesmo comportamento.

## Rodar o site local apontando para a API online (web designer)

```bash
npm install
API_PROXY_TARGET=https://api.senac.sitw.tech npm run dev -- --host 127.0.0.1 --port 5174
```
O Vite encaminha `/v1` para a API hospedada (sem CORS). Dados e mídia vêm do servidor; só leitura pública.
