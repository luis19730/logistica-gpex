# GPEX E/4 — Mapeamento de Processos e Gestão de Riscos

Aplicação estática para catalogar os processos da Seção de Logisticamente da
E/4 do **Cmdo Bda Inf Amv**. React 18 + Vite, sem backend: a base de processos
fica inteira no `localStorage` do navegador e pode ser exportada/importada em
JSON a qualquer momento.

- **OM:** Cmdo Bda Inf Amv
- **Seção:** E/4
- **Macroprocesso:** 1.4 LOGÍSTICA
- **Padrão:** EPOEx.FR001.00

## Como rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # gera dist/
npm run preview   # serve dist/ localmente
npm test          # valida o BPMN 2.0 exportado pelos 5 processos de exemplo
npm run smoke     # renderiza todas as rotas em memória e falha se algo quebrar
npm run check     # test + smoke + build
```

## Publicação (GitHub Pages)

O `.github/workflows/deploy.yml` publica `dist/` no GitHub Pages a cada push na
branch `main`. O site fica em `https://luis19730.github.io/logistica-gpex/`.

Como o Pages não reescreve URLs, `public/404.html` guarda o endereço original em
`sessionStorage` e devolve o app para a raiz; `src/main.jsx` reaplica a rota
depois. É isso que permite acessar `/logistica-gpex/processo/3` direto no
navegador.

O `base` do Vite está em `/logistica-gpex/`. Para publicar num repositório com
outro nome, altere `BASE` em `src/lib/constants.js` e o caminho em
`public/404.html`.

## Telas

**Tela 1 — listagem** (`/`)

Colunas na ordem exigida: LOGO (OM), APROV. SEÇÃO, APROV. ASS. GESTÃO, ID DO
PROCESSO, ORGANIZAÇÃO MILITAR, ASSUNTO, OBJETIVOS DO PROCESSO, ÁREA,
MACROPROCESSO 1º NÍVEL, PROCESSO 2º NÍVEL, Nº DO PROCESSO e AÇÕES.

- filtros: busca livre, seção, área, OM e situação de aprovação;
- ordenação por qualquer coluna configurada como ordenável;
- "Copiar lista" gera TSV pronto para colar no Excel;
- exportação CSV da lista filtrada e exportação JSON da base completa;
- importação de base com escolha entre **substituir tudo** e **mesclar**
  (o merge casa pelo `Nº do processo`, ou pelo `id` quando não há código);
- modal **Lote** para colar um array JSON com vários processos de uma vez;
- alternância de aprovação por seção e por Assessoria de Gestão, e exclusão
  com confirmação;
- abaixo de 900 px a tabela vira cartões, sem remover nenhuma função.

**Tela 2 — ficha do processo** (`/processo/:id`)

Identificação (Nº, assunto, responsável, área, objetivo, 2º nível) e as 12
seções da Folha de Dados do Processo. As 11 seções textuais aparecem como
`textarea` editáveis no modo de edição e como texto pré-formatado no modo de
leitura. A seção 12 (Fluxograma) tem editor próprio, desenho ao vivo e
exportação.

Botões: voltar, editar, salvar, cancelar, duplicar processo, excluir processo,
ver diagrama em tela cheia, copiar/baixar `.bpmn` e copiar/baixar `.svg`.
Processo em branco: `/processo/novo`. Alterações não salvas avisam antes de
sair.

## Fluxograma

O editor usa uma linha por etapa, no formato `tipo|texto|índice`:

| Tipo | Significado                                                              |
| ---- | ------------------------------------------------------------------------ |
| `s`  | evento de início                                                         |
| `t`  | tarefa                                                                   |
| `g`  | decisão (o índice é a etapa para onde volta o ramo **Não**)              |
| `e`  | evento de fim                                                            |

Exemplo:

```
s|Início do processo
t|Registrar a demanda
g|Todos os dados foram recebidos?|2
t|Consolidar o quadro
e|Fim do processo
```

Em `g`, o "Sim" segue para a linha seguinte e o "Não" volta ao índice informado,
que precisa ser **menor** que o índice da decisão. O editor mostra a lista
numerada das etapas para não errar o índice.

Linhas em branco e linhas começadas com `#` são ignoradas. Se o texto não
declatar um evento de fim, um fim implícito é gerado no desenho e no BPMN.

Cada etapa vira um nó BPMN (`startEvent`, `task`, `exclusiveGateway`,
`endEvent`); o ramo "Não" é o `default` do gateway. O XML sai com a seção
`BPMNDiagram` completa, então importa direto no bpmn.io, no Camunda Modeler e
no ARIS Express.

## Validação

`npm test` roda `scripts/validate-bpmn.mjs`, que confere:

- boa-formação do XML gerado e dos namespaces BPMN/DI/DC;
- exatamente um `<bpmn:process>`, uma `<bpmn:collaboration>`, um
  `<bpmn:Diagram>`, um `<bpmn:Plane>` e um `<bpmn:participant>`;
- ids válidos e sem duplicidade, `name` obrigatório em todo nó;
- `sourceRef`/`targetRef` de cada `<sequenceFlow>` resolvendo para nós reais,
  sem auto-loop e sem entrada em `startEvent`;
- `default` do gateway resolvendo para um fluxo que sai dele;
- no máximo um `<bpmn:documentation>` por elemento (limite do schema);
- cada `<bpmn:incoming>`/`<bpmn:outgoing>` como um elemento por fluxo, com IDREF
  existente e sem espaços — é o que faz o nó sobreviver à importação;
- uma shape no DI para cada nó, bounds numéricos e waypoints dentro do plano;
- que os 5 fluxos de exemplo não têm nenhum erro de ramo;
- boa-formação do SVG e presença das formas esperadas.

`npm run smoke` monta as 5 rotas do app com `renderToStaticMarkup` e falha se
algum componente lançar exceção — é o que pega erro de runtime que o build não
detecta (variável não definida, hook fora de ordem, etc.).

## Estrutura

```
src/
  lib/            módulos puros, sem React (usados também pelos scripts)
    constants.js  identidade, áreas, seções da ficha, fluxo padrão
    storage.js    normalização, carga, gravação e mesclagem
    flow.js       parser, validação de ramos, layout e waypoints
    svg.js        SVG standalone
    bpmn.js       BPMN 2.0 (XML + BPMNDiagram)
    seed.js       os 5 processos de exemplo
    utils.js      clipboard, download, CSV/TSV
  state/BaseContext.jsx   estado e ações do CRUD
  components/     TabelaProcessos, FluxoSvg, Modal
  pages/          ListaPage, FichaPage
scripts/          validate-bpmn.mjs, smoke.mjs, smoke.jsx
public/404.html   redirect de rota profunda no GitHub Pages
```

## Dados

Chave do storage: `gpex.e4.processos.v1`. Os 5 processos de exemplo são semeados
na primeira visita. Nada sai do navegador sem uma ação explícita de exportação
— vale exportar a base antes de limpar os dados do navegador.
