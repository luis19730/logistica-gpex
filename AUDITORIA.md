# Auditoria do Sistema GPEX / Gestão de Riscos - E/4

Data: 2026-09-18
Repositório: https://github.com/luis19730/logistica-gpex
Escopo: `index.html`, `css/gpex.css`, `js/gpex-dados.js`, `js/gpex-app.js`, `sw.js`, `manifest.webmanifest`.

Legenda de severidade: **Alta** / **Média** / **Baixa**.

## Achados corrigidos nesta revisão

| # | Sev. | Arquivo | Descrição | Correção |
|---|------|---------|-----------|----------|
| 1 | Alta | `css/gpex.css` × `index.html`/`js/gpex-app.js` | Nomes de classes CSS haviam sido acentuados no HTML/JS, mas o CSS permanecia ASCII: `.linha-acoes`/`linha-ações`, `.modal-acoes`/`modal-ações`, `.topo-titulo`/`topo-título`, `.topo-acoes`/`topo-ações`. Perda de estilo nas barras de ação, no rodapé do modal e no topo. | Seletores do CSS acentuados para casar com o HTML/JS. |
| 2 | Média | `index.html` (aviso), `js/gpex-dados.js` (`meta.aviso`) | Ortografia: "publicação no ASE **e** manual" (verbo) etc. | "é manual"; "consistência", "importação", "esforço", "conexões", "limitações", "domínio", "automático", "faça". |
| 3 | Alta | `index.html` (fim do `<body>`) | Dependência de CDN externa do Mermaid (`cdn.jsdelivr.net`), impedindo o uso offline (requisito inegociável). | Mermaid versionado em `vendor/mermaid.min.js` e carregado localmente. |

## Achados em aberto (planejados)

| # | Sev. | Arquivo | Descrição | Plano |
|---|------|---------|-----------|-------|
| 4 | Alta | `js/gpex-dados.js` | Dados ainda embutidos em JS, sem `/data/*.json`, sem JSON Schema e sem validação automatizada. | Gerar `/data/*.json`, JSON Schema e `scripts/validar-dados.js`; CI valida. |
| 5 | Alta | `js/gpex-app.js` | Geradores BPMN/AML não têm testes automáticos; risco de gerar XML inválido após mudanças. | Extrair para módulo reutilizável e validar com testes Node. |
| 6 | Média | `js/gpex-app.js` | Modelo de risco sem risco inerente × residual, eficácia do controle, apetite, status do tratamento, KRI e próxima revisão (ISO 31000 / EB10-P-01.004). | Ampliar o modelo de dados e a interface. |
| 7 | Média | `js/gpex-app.js` | Sem exportação `.ics` (calendário), sem backup/restauração JSON e sem relatório mensal de combustível imprimível. | Implementar exportações. |
| 8 | Média | `js/gpex-app.js` | Combustível sem validação de hodômetro crescente/duplicidade e sem alerta de desvio formalizado. | Acrescentar validações. |
| 9 | Média | Sistema | Sem PWA (offline instalável) — em implementação nesta revisão (`manifest.webmanifest`, `sw.js`). | Concluir e validar. |
| 10 | Média | Vários | Sem rodapé com versão/data de revisão/changelog e sem alerta de revisão vencida (> 90 dias). | Acrescentar. |
| 11 | Baixa | `css/gpex.css` | Sem modo claro/escuro com alternância. | Acrescentar alternância persistida. |
| 12 | Média | Repositório | Sem README/CONTRIBUTING, sem ESLint/Prettier, sem CI. | Acrescentar. |
| 13 | Alta (normativo) | `js/gpex-dados.js` | Códigos/artigos de normas e prazos podem divergir das publicações oficiais. | Marcar "VERIFICAR NA FONTE" e registrar `fonte`; conferir no Portal da Governança. |

## Riscos e observações

- **Segurança**: o sistema não realiza login, scraping ou envio a `ase.cmse.eb.mil.br`. Apenas prepara texto/arquivo para colagem manual. Aviso mantido.
- **Dados sensíveis**: nenhum dado real da OM no repositório. Dados digitados pelo usuário ficam no `localStorage` do navegador.
- **Compatibilidade**: o carregamento local (`file://`) continua suportado porque os dados seguem embutidos em `js/gpex-dados.js` (os artefatos `/data/*.json` são derivados e usados para validação/CI).
- **Acessibilidade**: matriz e níveis de risco não dependem apenas de cor (rótulos textuais), mas faltam revisões de contraste e testes com leitor de tela.
