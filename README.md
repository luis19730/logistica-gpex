# GPEX / Gestão de Riscos - 4ª Seção (E/4) - Cmdo Bda Inf Amv

Sistema **estático** de apoio ao mapeamento de processos e à gestão de riscos da 4ª Seção / E/4 (Seção de Logística), conforme a metodologia GPEX / Projeto Piloto 2.0 (CMSE).

- Site: https://luis19730.github.io/logistica-gpex/
- Repositório: https://github.com/luis19730/logistica-gpex

## Objetivo

Apoiar o preenchimento manual dos sistemas oficiais (GPEx/ASE) e a exportação de fluxogramas para o ARIS, com:

- 12 processos do E/4, com objetivo, etapas, riscos, controles e indicadores;
- matriz de risco Probabilidade × Impacto (EB10-P-01.004);
- campos de gestão de riscos conforme ISO 31000 (risco inerente × residual, status, KRI, próxima revisão);
- Regimento Interno (Arts. 1º a 6º) e vínculo de cada processo à competência;
- controle de combustível (Classe III), calendário de obrigações e exportações.

## Estrutura

```
index.html                 Aplicação (única página, abas)
css/gpex.css               Estilos (claro/escuro, responsivo, impressão)
js/gpex-dados.js           FONTE ÚNICA DOS DADOS (embutida, uso offline)
js/gpex-app.js             Apresentação/lógica da interface
vendor/mermaid.min.js      Mermaid local (sem CDN)
data/*.json                Artefatos de dados gerados (para validação/CI)
schemas/processo.schema.json
scripts/exportar-dados.js  Gera /data/*.json a partir de js/gpex-dados.js
scripts/validar-dados.js   Valida a integridade dos dados (falha o CI)
tests/dados.test.js        Testes (node:test)
sw.js, manifest.webmanifest  PWA / uso offline
.github/workflows/ci.yml   CI: validação + testes
AUDITORIA.md               Achados de auditoria e pendências
```

## Como atualizar os dados

1. Edite `js/gpex-dados.js` (processos, riscos, indicadores, marcos, obrigações, regimento).
2. Gere os artefatos e valide:

```bash
npm run dados     # gera /data/*.json
npm run validar   # falha se faltar risco, indicador, responsável ou fonte
npm test          # testes automatizados (inclui validação do BPMN/AML)
```

Regras da validação: **todo processo deve ter risco, indicador, responsável e fonte**; todo risco deve ter descrição, causa, consequência, controle e P/I entre 1 e 5.

## Exportar para o ARIS

- **BPMN 2.0 (.bpmn)** e **AML (.aml)** são arquivos: baixe e importe no **ARIS Cloud/Plataforma** (Importar → AML/BPMN).
- **Smart Design (.csv)** e o botão **“Copiar planilha (ARIS Express)”**: cole no Smart Design do ARIS Express.
- O **ARIS Express** não importa BPMN/EPC por XML; a importação nativa é Visio, ARISalign ou ADF.
- Há também “Copiar Mermaid” e exportação de **todos os fluxogramas** de uma vez.

No ASE, use “Copiar resumo completo (ASE)” e cole manualmente, após revisão humana.

## Limites de segurança

- **Não** há login, scraping ou envio automático ao domínio `ase.cmse.eb.mil.br` (robots.txt bloqueia).
- O sistema **apenas prepara** texto/arquivos para colagem manual por usuário autorizado.
- **Nenhum dado real da OM** é versionado: só modelos de referência. Dados digitados pelo usuário (combustível, checklist) ficam apenas no `localStorage` do navegador e podem ser exportados/restaurados em JSON.

## Uso offline (PWA)

O site funciona offline após a primeira visita (service worker, network-first com fallback ao cache). Também é possível abrir `index.html` localmente, pois os dados estão embutidos em `js/gpex-dados.js`.

## Versionamento e revisão

- Versão, data da última revisão e changelog no rodapé (aviso automático se a revisão passar de 90 dias — `meta.revisaoValidadeDias`).

## Itens sujeitos a verificação humana

- Códigos, números e datas de normas citadas (EB10-P-01.004, EB20-D-02.010, EB20-D-11.001 e outras) devem ser conferidos na fonte oficial.
- A eficácia real dos controles de risco é **pretendida**; precisa ser verificada pela S/4.
