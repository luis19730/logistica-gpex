// Validador do BPMN 2.0 gerado pelo sistema.
//   node scripts/validate-bpmn.mjs
//
// Não depende de rede nem de serviço externo: confere boa-formação XML, a
// estrutura exigida pelo schema BPMN 2.0, a integridade referencial das
// <sequenceFlow> e a coerência da seção <bpmndi:BPMNDiagram> (formas,
// waypoints e contenção no plano). É o mesmo arquivo que roda em `npm test`.
import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { gerarBpmn } from '../src/lib/bpmn.js'
import { gerarSvg } from '../src/lib/svg.js'
import { montarFluxo, validarFluxo, parseFluxo } from '../src/lib/flow.js'
import { processosIniciais } from '../src/lib/seed.js'
import { FLUXO_PADRAO } from '../src/lib/constants.js'

const NS_BPMN = 'bpmn:definitions'
const parser = new XMLParser({
  ignoreAttributes: false,
  ignoreDeclaration: true,
  attributeNamePrefix: '@',
  isArray: (name) =>
    [
      'bpmn:process',
      'bpmn:collaboration',
      'bpmn:startEvent',
      'bpmn:task',
      'bpmn:exclusiveGateway',
      'bpmn:endEvent',
      'bpmn:sequenceFlow',
      'bpmn:documentation',
      'bpmn:incoming',
      'bpmn:outgoing',
      'bpmndi:BPMNDiagram',
      'bpmndi:BPMNPlane',
      'bpmndi:BPMNShape',
      'bpmndi:BPMNEdge',
      'bpmn:participant',
      'di:waypoint',
      'dc:Bounds',
    ].includes(name),
})

const comoArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])
let falhas = 0
let verificacoes = 0

function ok(cond, msg, contexto) {
  verificacoes += 1
  if (!cond) {
    falhas += 1
    console.error(`  FALHA  ${msg}${contexto ? ` [${contexto}]` : ''}`)
  }
  return cond
}

/** Percorre a árvore e devolve todos os elementos bpmn:/bpmndi:/dc:/di:. */
function coletar(no, saida = [], chavePai = '') {
  if (Array.isArray(no)) {
    no.forEach((n) => coletar(n, saida, chavePai))
    return saida
  }
  if (!no || typeof no !== 'object') return saida
  for (const [k, v] of Object.entries(no)) {
    const ehTag = k.startsWith('bpmn:') || k.startsWith('bpmndi:') || k === 'dc:Bounds' || k === 'di:waypoint'
    if (ehTag) {
      if (Array.isArray(v)) v.forEach((el) => saida.push({ tag: k, node: el, pai: chavePai }))
      else saida.push({ tag: k, node: v, pai: chavePai })
    }
    if (v && typeof v === 'object') coletar(v, saida, k)
  }
  return saida
}

function validar(xml, rotulo, exigirTarefas = false) {
  console.log(`\n— ${rotulo}`)

  const check = XMLValidator.validate(xml)
  ok(check === true, `XML mal formado: ${check === true ? '' : check.err.msg} (linha ${check === true ? '-' : check.err.line})`, rotulo)

  const arvore = parser.parse(xml)
  const defs = arvore[NS_BPMN]
  ok(!!defs, 'elemento raiz <bpmn:definitions> ausente', rotulo)
  if (!defs) return
  for (const attr of ['@id', '@targetNamespace', '@xmlns:bpmn', '@xmlns:bpmndi', '@xmlns:dc', '@xmlns:di']) {
    ok(defs[attr] != null, `atributo obrigatório ausente: ${attr}`, rotulo)
  }
  ok(
    defs['@xmlns:bpmn'] === 'http://www.omg.org/spec/BPMN/20100524/MODEL',
    'namespace BPMN_MODEL incorreto',
    rotulo,
  )
  ok(
    defs['@xmlns:bpmndi'] === 'http://www.omg.org/spec/BPMN/20100524/DI' &&
      defs['@xmlns:dc'] === 'http://www.omg.org/spec/DD/20100524/DC' &&
      defs['@xmlns:di'] === 'http://www.omg.org/spec/DD/20100524/DI',
    'namespaces DI/DC incorretos',
    rotulo,
  )

  const todos = coletar(arvore)
  const tag = (t) => todos.filter((n) => n.tag === t)
  const processos = tag('bpmn:process')
  ok(processos.length === 1, `deve existir exatamente 1 <bpmn:process> (encontrado ${processos.length})`, rotulo)
  const collabs = tag('bpmn:collaboration')
  ok(collabs.length === 1, `deve existir exatamente 1 <bpmn:collaboration> (encontrado ${collabs.length})`, rotulo)
  const diagramas = tag('bpmndi:BPMNDiagram')
  ok(diagramas.length === 1, `deve existir exatamente 1 <bpmndi:BPMNDiagram> (encontrado ${diagramas.length})`, rotulo)
  const planos = tag('bpmndi:BPMNPlane')
  ok(planos.length === 1, `deve existir exatamente 1 <bpmndi:BPMNPlane> (encontrado ${planos.length})`, rotulo)

  const nos = [...tag('bpmn:startEvent'), ...tag('bpmn:task'), ...tag('bpmn:exclusiveGateway'), ...tag('bpmn:endEvent')]
  const fluxos = tag('bpmn:sequenceFlow')
  const gateways = tag('bpmn:exclusiveGateway')
  const starts = tag('bpmn:startEvent')
  const ends = tag('bpmn:endEvent')
  const tarefas = tag('bpmn:task')

  ok(starts.length >= 1, 'nenhum <startEvent> gerado', rotulo)
  ok(ends.length >= 1, 'nenhum <endEvent> gerado', rotulo)
  ok(fluxos.length >= 1, 'nenhuma <sequenceFlow> gerada', rotulo)

  const ids = new Set()
  for (const n of nos) {
    const id = n.node['@id']
    ok(typeof id === 'string' && /^[A-Za-z_][\w.\-]*$/.test(id), `id inválido ou ausente em <${n.tag}>: ${id}`, rotulo)
    ok(!ids.has(id), `id duplicado: ${id}`, rotulo)
    ids.add(id)
    ok(n.node['@name'] != null && String(n.node['@name']).length > 0, `<${n.tag} id="${id}"> sem atributo name`, rotulo)
  }

  // Integridade referencial das conexões.
  for (const f of fluxos) {
    const src = f.node['@sourceRef']
    const dst = f.node['@targetRef']
    ok(ids.has(src), `sequenceFlow ${f.node['@id']}: sourceRef "${src}" inexistente`, rotulo)
    ok(ids.has(dst), `sequenceFlow ${f.node['@id']}: targetRef "${dst}" inexistente`, rotulo)
    ok(src !== dst, `sequenceFlow ${f.node['@id']}: auto-loop (sourceRef = targetRef)`, rotulo)
  }
  for (const g of gateways) {
    const def = g.node['@default']
    // `default` é opcional no schema; quando presente precisa resolver.
    if (def != null) {
      ok(
        fluxos.some((f) => f.node['@id'] === def),
        `default "${def}" não corresponde a nenhuma sequenceFlow`,
        rotulo,
      )
      const dono = fluxos.find((f) => f.node['@id'] === def)
      ok(
        dono && dono.node['@sourceRef'] === g.node['@id'],
        `default "${def}" não parte do gateway ${g.node['@id']}`,
        rotulo,
      )
    }
    ok(g.node['@gatewayDirection'] != null, `exclusiveGateway ${g.node['@id']} sem gatewayDirection`, rotulo)
  }

  // <bpmn:documentation> é maxOccurs=1 em tBaseElement. Vários elementos
  // diretos sob <bpmn:process> invalidam o arquivo contra o BPMN20.xsd.
  for (const p of processos) {
    const docs = tag('bpmn:documentation').filter((d) => d.pai === 'bpmn:process' && d.node === p.node)
    ok(docs.length <= 1, `<bpmn:process> com ${docs.length} <bpmn:documentation> (máximo 1)`, rotulo)
  }
  for (const n of nos) {
    const docs = tag('bpmn:documentation').filter((d) => d.pai === n.tag && d.node === n.node)
    ok(docs.length <= 1, `<${n.tag} id="${n.node['@id']}"> com ${docs.length} <bpmn:documentation> (máximo 1)`, rotulo)
  }

  // <bpmn:incoming>/<bpmn:outgoing> são IDREF: um elemento por fluxo, e cada
  // referência precisa resolver para uma sequenceFlow existente. Concatenar
  // vários IDs num único elemento gera um ID inexistente e o nó é descartado
  // na importação.
  const fluxoIds = new Set(fluxos.map((f) => f.node['@id']))
  for (const ref of ['bpmn:incoming', 'bpmn:outgoing']) {
    for (const r of tag(ref)) {
      const alvo = String(r.node)
      ok(
        fluxoIds.has(alvo),
        `<${ref}> com IDREF "${alvo}" que não corresponde a nenhuma sequenceFlow (pai ${r.pai})`,
        rotulo,
      )
      ok(!/\s/.test(alvo), `<${ref}> contém espaços no IDREF: "${alvo}" — deve haver um elemento por fluxo`, rotulo)
    }
  }
  // Cada sequenceFlow aparece exatamente uma vez como outgoing na origem e
  // uma vez como incoming no destino.
  for (const f of fluxos) {
    const id = f.node['@id']
    const comoOutgoing = tag('bpmn:outgoing').filter((r) => r.node === id)
    const comoIncoming = tag('bpmn:incoming').filter((r) => r.node === id)
    ok(comoOutgoing.length === 1, `sequenceFlow ${id} declarada como outgoing ${comoOutgoing.length}x (esperado 1)`, rotulo)
    ok(comoIncoming.length === 1, `sequenceFlow ${id} declarada como incoming ${comoIncoming.length}x (esperado 1)`, rotulo)
  }

  // Todo nó precisa de shape no DI, e o nó de entrada não pode ter incoming.
  const formas = tag('bpmndi:BPMNShape').map((n) => n.node)
  const formaIds = new Set(formas.map((f) => f['@bpmnElement']))
  for (const n of nos) ok(formaIds.has(n.node['@id']), `nó ${n.node['@id']} sem <bpmndi:BPMNShape>`, rotulo)
  // A faixa da pool é a shape cujo bpmnElement é o participant da collaboration.
  const participantes = tag('bpmn:participant')
  ok(participantes.length === 1, `deve existir exatamente 1 <bpmn:participant> (encontrado ${participantes.length})`, rotulo)
  ok(
    participantes.length === 1 && formaIds.has(participantes[0].node['@id']),
    'falta a shape da pool (bpmn:participant sem <bpmndi:BPMNShape>)',
    rotulo,
  )
  if (participantes.length === 1 && collabs.length === 1) {
    ok(planos[0].node['@bpmnElement'] === collabs[0].node['@id'], 'BPMNPlane não referencia a collaboration', rotulo)
    ok(
      participantes[0].node['@processRef'] === processos[0].node['@id'],
      'processRef do participant não referencia o <bpmn:process>',
      rotulo,
    )
  }
  for (const s of starts) {
    const entrada = fluxos.filter((f) => f.node['@targetRef'] === s.node['@id'])
    ok(entrada.length === 0, `startEvent ${s.node['@id']} possui incoming`, rotulo)
  }

  // Bounds numéricos e positivos.
  const todosBounds = coletar(arvore).filter((n) => n.tag === 'dc:Bounds')
  ok(todosBounds.length >= formas.length, 'faltam <dc:Bounds> para as shapes', rotulo)
  for (const b of todosBounds) {
    const w = Number(b.node['@width'])
    const h = Number(b.node['@height'])
    const x = Number(b.node['@x'])
    const y = Number(b.node['@y'])
    ok(Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0, `Bounds inválido em ${b.pai}: ${b.node['@width']}x${b.node['@height']}`, rotulo)
    ok(Number.isFinite(x) && Number.isFinite(y), `Bounds sem coordenada numérica em ${b.pai}`, rotulo)
  }

  // Arestas com waypoints, todos contidos no plano.
  const arestas = tag('bpmndi:BPMNEdge').map((n) => n.node)
  ok(arestas.length === fluxos.length, `há ${fluxos.length} sequenceFlow e ${arestas.length} BPMNEdge`, rotulo)
  const plano = planos[0] ? planos[0].node : null
  const pool = formas.find((f) => participantes.length === 1 && f['@bpmnElement'] === participantes[0].node['@id'])
  const poolBounds = pool ? comoArray(pool['dc:Bounds'])[0] : null
  const limite = poolBounds
    ? { w: Number(poolBounds['@width']), h: Number(poolBounds['@height']) }
    : { w: Infinity, h: Infinity }
  for (const e of arestas) {
    const pts = comoArray(e['di:waypoint'])
    ok(pts.length >= 2, `BPMNEdge ${e['@bpmnElement']} com menos de 2 waypoints`, rotulo)
    for (const p of pts) {
      const x = Number(p['@x'])
      const y = Number(p['@y'])
      ok(Number.isFinite(x) && Number.isFinite(y), `waypoint não numérico em ${e['@bpmnElement']}`, rotulo)
      ok(x >= 0 && y >= 0 && x <= limite.w && y <= limite.h, `waypoint (${x}, ${y}) fora dos limites do plano`, rotulo)
    }
  }
  for (const n of nos) {
    const shape = formas.find((f) => f['@bpmnElement'] === n.node['@id'])
    if (!shape) continue
    const sb = comoArray(shape['dc:Bounds'])[0]
    if (!sb) continue
    const x = Number(sb['@x'])
    const y = Number(sb['@y'])
    const w = Number(sb['@width'])
    const h = Number(sb['@height'])
    ok(x >= 0 && y >= 0 && x + w <= limite.w && y + h <= limite.h, `shape ${n.node['@id']} excede os limites do plano`, rotulo)
  }

  if (exigirTarefas) ok(tarefas.length > 0, 'nenhuma <task> gerada', rotulo)
  ok(todos.some((n) => n.tag === 'bpmn:documentation'), 'nenhuma <bpmn:documentation> gerada', rotulo)
  console.log(
    `  nós=${nos.length} (start=${starts.length} task=${tarefas.length} gateway=${gateways.length} end=${ends.length}) ` +
      `fluxos=${fluxos.length} formas=${formas.length} arestas=${arestas.length}`,
  )
}

console.log('=== GPEX E/4 — validação do export BPMN 2.0 ===')

// 1) Os 5 processos de exemplo.
console.log('\n— fluxogramas de exemplo (nenhum erro de ramo)')
for (const p of processosIniciais()) {
  const { avisos } = validarFluxo(p.fluxo)
  const erros = avisos.filter((a) => a.nivel === 'erro')
  ok(erros.length === 0, `fluxo com ${erros.length} erro(s): ${erros.map((e) => e.msg).join(' / ')}`, p.codigo)
  if (!avisos.length) console.log(`  ${p.codigo}: ${parseFluxo(p.fluxo).length} etapas, sem avisos`)
}
for (const p of processosIniciais()) {
  const xml = gerarBpmn(p.fluxo, { codigo: p.codigo, assunto: p.assunto, responsavel: p.responsavel })
  validar(xml, `${p.codigo} — ${p.assunto}`, true)
}

// 2) Casos-limite do parser/layout.
const casos = [
  ['fluxo padrão de processo novo', FLUXO_PADRAO],
  ['somente início e fim', 's|Início\ne|Fim'],
  ['tarefa única sem fim explícito', 's|Início\nt|Fazer a coisa'],
  ['decisão sem ramo válido (índice inexistente)', 's|Início\nt|A\ng|Continua?|9\ne|Fim'],
  ['decisão sem índice informado', 's|Início\nt|A\ng|Continua?|e|Fim'],
  ['decisão apontando para si mesma', 's|Início\ng|Repete?|2\ne|Fim'],
  ['múltiplas decisões em sequência', 's|Início\ng|A?|2\nt|Ação\ng|B?|2\nt|B2\ng|C?|1\ne|Fim'],
  ['texto compipe e aspas', 's|Início & "teste"\nt|Fazer 100% | do plano\ne|Fim'],
]
for (const [rotulo, fluxo] of casos) {
  const xml = gerarBpmn(fluxo, { codigo: 'E4-99', assunto: rotulo })
  validar(xml, `caso-limite: ${rotulo}`)
}

// 3) SVG: boa-formação e presença das formas.
console.log('\n— SVG dos 5 processos')
const parserXml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@' })
for (const p of processosIniciais()) {
  const modelo = montarFluxo(p.fluxo)
  const svg = gerarSvg(modelo, { titulo: `${p.codigo} — ${p.assunto}`, subtitulo: p.responsavel })
  const check = XMLValidator.validate(svg)
  ok(check === true, `SVG mal formado: ${check === true ? '' : check.err.msg}`, p.codigo)
  const arv = parserXml.parse(svg)['svg']
  ok(!!arv, 'raiz <svg> ausente', p.codigo)
  ok(arv['@xmlns'] === 'http://www.w3.org/2000/svg', 'namespace SVG ausente', p.codigo)
  const xml = svg
  ok(xml.includes('<path d="M') || modelo.edges.length === 0, 'nenhuma aresta desenhada', p.codigo)
  ok(/<rect[^>]+rx="10"/.test(xml) || modelo.nodes.every((n) => n.kind !== 'task'), 'nenhuma forma de tarefa desenhada', p.codigo)
  ok(xml.includes('<polygon') || modelo.nodes.every((n) => n.kind !== 'gateway'), 'nenhum losango de decisão desenhado', p.codigo)
  console.log(`  ${p.codigo}: ${modelo.nodes.length} nós, ${modelo.edges.length} arestas, ${modelo.width}x${modelo.height}`)
}

console.log(`\n=== ${verificacoes} verificações, ${falhas} falha(s) ===`)
if (falhas) {
  console.error('VALIDAÇÃO FALHOU')
  process.exit(1)
}
console.log('VALIDAÇÃO OK — BPMN 2.0 estruturalmente válido e SVG bem formado.')
