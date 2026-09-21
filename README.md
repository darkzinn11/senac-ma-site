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

## Subpáginas — redesign integrado
- Layout reutilizável em `src/components/PortalPages.jsx` e `portalPages.css`: hero, breadcrumb, conteúdo, recursos/documentos, unidades, listagens de cursos, notícias e seus detalhes.
- Navegação interna com History API na aplicação; botão Voltar do navegador mantém o comportamento esperado.
- Conteúdo extraído da API REST pública do portal Senac/MA em `src/data/portalSnapshot.json`, produzido por `python3 .qa/snapshot_portal.py`.
- Snapshot inicial: 56 páginas institucionais/serviços, 70 notícias e 100 referências de cursos. Páginas de notícias e cursos fora do snapshot podem ser consultadas sob demanda por URL via API pública, quando essa API as expõe.
- O snapshot é uma amostra do acervo, não um catálogo completo nem uma integração de matrícula. Informações dinâmicas (vagas, turmas, preços, inscrições, editais recém-publicados) devem ser validadas no portal oficial. Os links de inscrição, documentos e serviços externos permanecem na origem.
- Páginas originalmente montadas em Elementor sem conteúdo textual acessível pela API têm fallback para o portal oficial; exigem migração editorial específica para reproduzir a totalidade dos módulos.
- Para atualizar o material de referência, execute `python3 .qa/snapshot_portal.py`, confira o conteúdo gerado e rode `npm run build` e `node .qa/verify.mjs`.
- As páginas possuem template editorial, mas a revisão visual e funcional específica de cada uma e a integração dos sistemas internos (busca de turmas, portais externos e formulários) ainda dependem de validação com o SENAC antes da publicação em produção.

### Catálogo de cursos — integração com a API pública
- A subpágina `/cursos-senac/` lê **todas as páginas** de `https://ma.senac.br/wp-json/wp/v2/curso`, consultando dados novamente durante a navegação (cache de 5 minutos por sessão). Fallback: `public/data/liveCoursesSnapshot.json`, gerado por `python3 .qa/snapshot_courses_live.py`.
- Campos efetivamente retornados pela origem: título, segmento, localidade, unidade, início, fim, horários, carga horária, modalidade, objetivo, preço, vagas originalmente cadastradas e link de matrícula. O objetivo é carregado na página individual para economizar tráfego na listagem.
- Filtros por nome, cidade, segmento e situação; cards e página de detalhes compartilham identidade visual da Home.
- A API consultada em 20/09/2026 retorna **684 turmas publicadas**: 682 já terminadas, 1 em andamento e 1 sem datas. Não se deve apresentar turmas antigas, valores publicados nem vagas cadastradas como oferta vigente. Matrícula aparece somente para turmas futuras com link oficial, e sempre exige confirmação no sistema oficial.
- As fotos da subpágina Cursos agora são fotografias ilustrativas independentes, selecionadas no Pexels, sem uso do acervo fotográfico do Senac. Foram obtidas 113 novas imagens WebP em `public/assets/courses-fresh/`, das quais 78 estão associadas às 684 turmas via `src/data/courseFreshMap.json`. O arquivo `src/data/courseFreshPhotos.json` documenta fontes, licença e categorias. As imagens antigas foram movidas para `.qa/course-images/backup-official/` e não entram no build. O catálogo e detalhes compartilham o mesmo mapeamento. Licença: https://www.pexels.com/license/. Fotos de pessoas e instalações são ilustrativas e não representam necessariamente o Senac.

### Biblioteca de ícones
- Preservar os pictogramas SVG originais do Figma (Portal do aluno, busca, setas, duração, botões e redes sociais) em `src/components/Ui.jsx`. Usar `iconsax-react` para novos controles internos, incluindo os filtros, dados dos cursos e visualização grade/lista.
- As subpáginas utilizam componentes Iconsax diretamente. `@tabler/icons-react` e `lucide-react` foram removidos das dependências.
- As logos institucionais permanecem como assets originais; não devem ser substituídas por ícones.

### Catálogo: limite de scroll e modos de visualização
- O filtro à esquerda acompanha a rolagem somente até o último card do catálogo. A paginação fica fora da região que limita o sticky, impedindo o filtro de descer até os controles de páginas.
- A alternância grade/lista, os 6 cursos por página, os filtros e a navegação mantêm o mesmo comportamento.
