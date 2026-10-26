// Exportação BPMN 2.0 (XML real) do fluxograma.
// Gera <startEvent>, <task>, <exclusiveGateway>, <endEvent>, <sequenceFlow> e a
// seção <bpmndi:BPMNDiagram> com coordenadas — importável no bpmn.io,
// Camunda Modeler e ARIS Express.
import { montarFluxo, prefixoBpmn, pontosDaAresta } from './flow.js'
import { escaparXml } from './svg.js'
import { OM, SECAO, PADRAO } from './constants.js'

// Margem da faixa (participant) em volta dos nós, em coordenadas BPMN DI.
const POOL_PAD_X = 40
const POOL_PAD_Y = 66
const POOL_PAD_BOTTOM = 30

const NS_BPMN_MODEL = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
const NS_BPMN_DI = 'http://www.omg.org/spec/BPMN/20100524/DI'
const NS_DC = 'http://www.omg.org/spec/DD/20100524/DC'
const NS_DI = 'http://www.omg.org/spec/DD/20100524/DI'
const NS_XSI = 'http://www.w3.org/2001/XMLSchema-instance'

function idSeguro(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

// <bpmn:incoming> e <bpmn:outgoing> são elementos de referência IDREF: um por
// fluxo de sequência. Juntar vários IDs num único elemento produziria um ID
// inexistente e o importador (bpmn.io, Camunda) descartaria o nó.
function refsXml(tag, ids) {
  return (ids || []).map((id) => `        <bpmn:${tag}>${id}</bpmn:${tag}>`).join('\n')
}

function elementoBpmn(n) {
  const nome = escaparXml(n.texto)
  const doc = escaparXml(
    n.implicito
      ? 'Evento de fim adicionado automaticamente (o texto não declarava um evento de fim).'
      : `Etapa ${n.indice} do fluxograma.`,
  )
  const docXml = `        <bpmn:documentation>${doc}</bpmn:documentation>`
  const inXml = refsXml('incoming', n.bpmnIn)
  const outXml = refsXml('outgoing', n.bpmnOut)
  const corpo = [docXml, inXml, outXml].filter(Boolean).join('\n')
  switch (n.tipo) {
    case 's':
      return `      <bpmn:startEvent id="${n.bpmnId}" name="${nome}">
${corpo}
      </bpmn:startEvent>`
    case 'e':
      return `      <bpmn:endEvent id="${n.bpmnId}" name="${nome}">
${corpo}
      </bpmn:endEvent>`
    case 'g':
      return `      <bpmn:exclusiveGateway id="${n.bpmnId}" name="${nome}" gatewayDirection="Down"${
        n.bpmnDefault ? ` default="${n.bpmnDefault}"` : ''
      }>
${corpo}
      </bpmn:exclusiveGateway>`
    default:
      return `      <bpmn:task id="${n.bpmnId}" name="${nome}">
${corpo}
      </bpmn:task>`
  }
}

function formaDi(n) {
  return `        <bpmndi:BPMNShape id="${n.bpmnId}_di" bpmnElement="${n.bpmnId}" isHorizontal="true">
          <dc:Bounds x="${n.bpmnX}" y="${n.bpmnY}" width="${n.bpmnW}" height="${n.bpmnH}" />
        </bpmndi:BPMNShape>`
}

function arestaDi(e, ox = POOL_PAD_X, oy = POOL_PAD_Y) {
  const pts = pontosDaAresta(e)
    .map((p) => `<di:waypoint x="${Math.round((p.x + ox) * 100) / 100}" y="${Math.round((p.y + oy) * 100) / 100}" />`)
    .join('\n            ')
  return `        <bpmndi:BPMNEdge id="${e.id}_di" bpmnElement="${e.id}">
            ${pts}
        </bpmndi:BPMNEdge>`
}

/**
 * @param {string} textoFluxo conteúdo do editor de fluxograma
 * @param {object} processo {assunto, codigo, responsavel}
 */
export function gerarBpmn(textoFluxo, processo = {}) {
  const modelo = montarFluxo(textoFluxo)
  const raias = !!modelo.raias
  const OX = raias ? 0 : POOL_PAD_X
  const OY = raias ? 0 : POOL_PAD_Y
  const codigo = processo.codigo || 'E4-00'
  const titulo = processo.assunto || 'Fluxograma de processo'
  const sufixo = idSeguro(codigo) || 'fluxo'
  const processId = `Process_${sufixo}`
  const collabId = `Collaboration_${sufixo}`

  const usados = new Set()
  for (const n of modelo.nodes) {
    let base = `${prefixoBpmn(n.tipo)}_${sufixo}_${n.indice}`
    let id = base
    let i = 2
    while (usados.has(id)) {
      id = `${base}_${i}`
      i += 1
    }
    usados.add(id)
    n.bpmnId = id
  }

  for (const e of modelo.edges) {
    let id = e.id
    let i = 2
    while (usados.has(id)) {
      id = `${e.id}_${i}`
      i += 1
    }
    usados.add(id)
    e.id = id
  }

  for (const n of modelo.nodes) {
    n.bpmnX = Math.round((n.x + OX) * 100) / 100
    n.bpmnY = Math.round((n.y + OY) * 100) / 100
    n.bpmnW = n.w
    n.bpmnH = n.h
    const entradas = modelo.edges.filter((e) => e.to === n).map((e) => e.id)
    const saidas = modelo.edges.filter((e) => e.from === n).map((e) => e.id)
    n.bpmnIn = entradas
    n.bpmnOut = saidas
    const padrao = modelo.edges.find((e) => e.from === n && e.tipo === 'volta')
    n.bpmnDefault = padrao ? padrao.id : ''
  }

  const poolW = raias ? modelo.width : modelo.width + POOL_PAD_X * 2
  const poolH = raias ? modelo.height : modelo.height + POOL_PAD_Y + POOL_PAD_BOTTOM
  const nomePool = `${SECAO} — ${OM}`
  // <bpmn:process> aceita no máximo um <bpmn:documentation> (tBaseElement),
  // então os metadados vão juntos num único elemento, separados por quebras.
  const metadados = [
    ['Processo', codigo],
    ['Assunto', titulo],
    ['Responsável', processo.responsavel || ''],
    ['Organização Militar', OM],
    ['Seção', SECAO],
    ['Padrão', PADRAO],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => escaparXml(`${k}: ${v}`))
    .join('\n')

  const elementos = modelo.nodes.map(elementoBpmn).join('\n')
  const fluxos = modelo.edges
    .map((e) => {
      const rotulo = e.rotulo ? escaparXml(e.rotulo) : ''
      const cond =
        e.from.tipo === 'g' && e.tipo === 'principal'
          ? `\n        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[Sim]]></bpmn:conditionExpression>`
          : ''
      const doc = `\n        <bpmn:documentation>Ramo ${rotulo || 'de sequência'} da etapa ${e.from.indice} para a etapa ${e.to.indice}.</bpmn:documentation>`
      return `      <bpmn:sequenceFlow id="${e.id}"${rotulo ? ` name="${rotulo}"` : ''} sourceRef="${e.from.bpmnId}" targetRef="${e.to.bpmnId}">${doc}${cond}
      </bpmn:sequenceFlow>`
    })
    .join('\n')

  let laneSet = ''
  let lanesDi = ''
  let riscosXml = ''
  let riscosDi = ''
  if (raias) {
    const laneId = (i) => `Lane_${sufixo}_${i + 1}`
    laneSet = `    <bpmn:laneSet id="LaneSet_${sufixo}">\n${modelo.raias
      .map(
        (r, i) =>
          `      <bpmn:lane id="${laneId(i)}" name="${escaparXml(r.nome)}">\n${modelo.nodes
            .filter((n) => n.raia === r.nome)
            .map((n) => `        <bpmn:flowNodeRef>${n.bpmnId}</bpmn:flowNodeRef>`)
            .join('\n')}\n      </bpmn:lane>`,
      )
      .join('\n')}\n    </bpmn:laneSet>\n`
    lanesDi = modelo.raias
      .map(
        (r, i) =>
          `      <bpmndi:BPMNShape id="${laneId(i)}_di" bpmnElement="${laneId(i)}" isHorizontal="true">\n        <dc:Bounds x="30" y="${r.y}" width="${poolW - 30}" height="${r.h}" />\n      </bpmndi:BPMNShape>`,
      )
      .join('\n')
    const anot = []
    const ass = []
    const di = []
    modelo.nodes.forEach((n) =>
      (n.riscos || []).forEach((r, k) => {
        const id = `Risco_${sufixo}_${n.indice}_${k + 1}`
        const bx = n.bpmnX - 6 + k * 52
        const by = n.bpmnY - 34
        anot.push(`    <bpmn:textAnnotation id="${id}"><bpmn:text>${escaparXml(r)}</bpmn:text></bpmn:textAnnotation>`)
        ass.push(`    <bpmn:association id="${id}_as" sourceRef="${n.bpmnId}" targetRef="${id}" />`)
        di.push(
          `      <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}"><dc:Bounds x="${bx}" y="${by}" width="46" height="22" /></bpmndi:BPMNShape>`,
          `      <bpmndi:BPMNEdge id="${id}_as_di" bpmnElement="${id}_as"><di:waypoint x="${bx + 23}" y="${by + 22}" /><di:waypoint x="${n.bpmnX + n.bpmnW / 2}" y="${n.bpmnY}" /></bpmndi:BPMNEdge>`,
        )
      }),
    )
    riscosXml = [...anot, ...ass].join('\n')
    riscosDi = di.join('\n')
  }
  const formas = modelo.nodes.map(formaDi).join('\n')
  const arestasDi = modelo.edges.map((e) => arestaDi(e, OX, OY)).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="${NS_BPMN_MODEL}" xmlns:bpmndi="${NS_BPMN_DI}" xmlns:dc="${NS_DC}" xmlns:di="${NS_DI}" xmlns:xsi="${NS_XSI}" xsi:schemaLocation="${NS_BPMN_MODEL} http://www.omg.org/spec/BPMN/20100524/MODEL/BPMN20.xsd" id="Definitions_${sufixo}" targetNamespace="https://gpex.e4.exercito.br/logistica" exporter="GPEX E/4 - Mapeamento de Processos" exporterVersion="1.0.0">
  <bpmn:process id="${processId}" name="${escaparXml(titulo)}" isExecutable="false">
    <bpmn:documentation>${metadados}</bpmn:documentation>
${laneSet}${elementos}
${fluxos}
${riscosXml}
  </bpmn:process>
  <bpmn:collaboration id="${collabId}">
    <bpmn:participant id="Participant_${sufixo}" name="${escaparXml(nomePool)}" processRef="${processId}" />
  </bpmn:collaboration>
  <bpmndi:BPMNDiagram id="BPMNDiagram_${sufixo}">
    <bpmndi:BPMNPlane id="BPMNPlane_${sufixo}" bpmnElement="${collabId}">
      <bpmndi:BPMNShape id="Participant_${sufixo}_di" bpmnElement="Participant_${sufixo}" isHorizontal="true">
        <dc:Bounds x="0" y="0" width="${poolW}" height="${poolH}" />
${raias ? '' : `        <bpmndi:BPMNLabel>
          <dc:Bounds x="8" y="4" width="${Math.max(120, poolW - 16)}" height="20" />
        </bpmndi:BPMNLabel>
`}      </bpmndi:BPMNShape>
${lanesDi}
${formas}
${arestasDi}
${riscosDi}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`
}
