# Changelog

Todas as mudanças relevantes do sistema. Formato baseado em Keep a Changelog; versão em `js/gpex-dados.js` (`meta.versao`).

## [2.2.0] - 2026-09-21

### Adicionado
- Quadro de Integrantes e Missões da 4ª Seção (E/4): Chefe de Seção (Maj), Adjunto (Ten), Auxiliar 1 (ST), Auxiliar 2 (1º Sgt) e Auxiliar 3 (Sd Ev).
- Riscos por integrante (INT-01 a INT-05) e novos sistemas de apoio (SPED, SISLOGMANUT, SISCANELO, SCA, SISGLOG, SISCOFIS WEB, SISBOL, SG7 e SCDP).
- Arquivo `data/integrantes.json` gerado pelo exportador de dados.

### Alterado
- Matriz de riscos e plano de tratamento atualizados, com remoção de riscos descontinuados em E4-04 (Saúde) e E4-08 (Classe V).
- Atualizada a suíte de validação e testes automáticos para 44 riscos e 12 processos.

## [2.1.0] - 2026-09-18

### Corrigido (P0)
- `escXml`: apóstrofo agora gera `&apos;` (antes `&após;`, o que invalidava o XML). Teste adicionado com `& < > " '`.
- Datas: `hojeISO`/`mesAtual`/`dataRevisao` usam **fuso local** (antes `toISOString`, UTC).
- Identificadores de código, chaves e ids de ícones revertidos para **ASCII** (`titulo`, `conteudo`, `calendario`, `combustivel`, `governanca`), mantendo o texto exibido acentuado.
- Ortografia: `públicar/públicado/públicação` → `publicar/publicado/publicação`; `periódicamente` → `periodicamente`; `com às OMDS` → `com as OMDS`; `as OM subordinadas` → `às OM subordinadas`.
- Dados órfãos removidos (`p03`–`p12`) e **id = código** unificado (**E4-01 a E4-12**) em todas as estruturas.

### Alterado (P1)
- `normas` reestruturadas com `codigo, titulo, edicao, portaria, data, url, situacao, verificadoEm, observacao`.
- **EB20-D-11.001** passa a constar como **provável revogada**; citações como vigente substituídas por **EB10-P-01.007** e **EB20-N-11.002**.
- Removida a citação não confirmada da "Portaria 1.729/2026".
- Aba **Fontes** exibe **situação** e **verificado em** por norma.
- **Regimento Interno** marcado como **MODELO** (interface e exportações).

### Alterado (P2–P4, parcial)
- Combustível: id único (`crypto.randomUUID`), validação de hodômetro/duplicidade, import/export CSV, relatório imprimível.
- Tema inicial segue `prefers-color-scheme`; `prefers-reduced-motion` respeitado.
- PWA (manifest + service worker) e Mermaid local (sem CDN).
- **AML rotulado como experimental** (formato a validar com AML de exemplo do ARIS).
- Quantidade de processos derivada dos dados (não fixa no HTML).

## [2.0.0] - 2026-09-18
- Versionamento, PWA offline, JSON em `/data` com schema e validação, testes (node:test) e CI.
- Campos de risco ISO 31000 (inerente/residual, status, KRI, próxima revisão).
- Exportações `.ics`, backup/restauração JSON e relatório de combustível.

## [1.0.0] - 2026-09-18
- Versão inicial: 12 processos, matriz P×I, exportações ARIS.
