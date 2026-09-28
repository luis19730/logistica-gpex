// Motor do fluxograma: parser do formato "tipo|texto|índice", layout para SVG
// e infraestrutura de BPMN 2.0. Módulo puro (sem DOM) para poder ser
// importado tanto pelo app quanto pelos scripts de validação em Node.

export const ROTULO_TIPO = {
  s: 'Início',
  t: 'Tarefa',
  g: 'Decisão',
  e: 'Fim',
}

export const FORMAS = {
  s: { w: 48, h: 48, kind: 'circle' },
  e: { w: 52, h: 52, kind: 'circle-fim' },
  t: { w: 264, h: 66, kind: 'task' },
  g: { w: 196, h: 100, kind: 'gateway' },
}

const V_GAP = 48
const LANE_GAP = 76
const PAD = 18

export function vazioParaTipo(codigo) {
  const c = String(codigo || '').trim().toLowerCase()
  return Object.prototype.hasOwnProperty.call(ROTULO_TIPO, c) ? c : 't'
}

export function prefixoBpmn(tipo) {
  return { s: 'Start', t: 'Task', g: 'Gw', e: 'End' }[tipo] || 'Task'
}

/** Converte o texto do editor em etapas indexadas (1-based, sem linhas vazias). */
export function parseFluxo(texto) {
  const linhas = String(texto == null ? '' : texto).split(/\r?\n/)
  const etapas = []
  for (const linha of linhas) {
    const bruto = linha.trim()
    if (!bruto || bruto.startsWith('#')) continue
    const partes = bruto.split('|').map((p) => p.trim())
    const tipo = vazioParaTipo(partes[0])
    const conteudo = (partes[1] || '').trim()
    const textoEtapa = conteudo || (partes.length > 1 ? partes.slice(1).join(' | ') : bruto)
    let voltar = null
    if (tipo === 'g' && partes.length > 2) {
      const n = parseInt(partes[2].replace(/[^\d-]/g, ''), 10)
      voltar = Number.isFinite(n) ? n : null
    }
    etapas.push({ indice: etapas.length + 1, tipo, texto: textoEtapa, voltar })
  }
  return etapas
}

/** Analisa o texto do fluxograma devolvendo etapas e lista de avisos/erros. */
export function validarFluxo(texto) {
  const etapas = parseFluxo(texto)
  const avisos = []
  const ultimo = etapas[etapas.length - 1]

  if (!etapas.length) {
    avisos.push({ nivel: 'erro', msg: 'O fluxograma precisa de pelo menos uma etapa.' })
    return { etapas, avisos }
  }
  if (etapas[0].tipo !== 's') {
    avisos.push({ nivel: 'aviso', msg: 'O fluxograma não começa com um evento de início (s).' })
  }
  if (ultimo.tipo !== 'e') {
    avisos.push({
      nivel: 'aviso',
      msg: 'O fluxograma não termina com um evento de fim (e). Um fim será gerado automaticamente no desenho e no BPMN.',
    })
  }
  for (const et of etapas) {
    if (et.tipo !== 'g') continue
    if (et.voltar == null) {
      avisos.push({
        nivel: 'erro',
        msg: `Etapa ${et.indice} (decisão): informe o índice do ramo "Não" no formato g|pergunta|índice.`,
      })
    } else if (et.voltar < 1 || et.voltar > etapas.length) {
      avisos.push({
        nivel: 'erro',
        msg: `Etapa ${et.indice}: o índice ${et.voltar} do ramo "Não" não existe (válido de 1 a ${etapas.length}).`,
      })
      } else if (et.voltar >= et.indice) {
        avisos.push({
          nivel: 'erro',
          msg: `Etapa ${et.indice}: o ramo "Não" precisa voltar para uma etapa anterior (índice menor que ${et.indice}).`,
        })
      } else if (etapas[et.voltar - 1].tipo === 's') {
        avisos.push({
          nivel: 'erro',
          msg: `Etapa ${et.indice}: o ramo "Não" não pode apontar para o evento de início (etapa ${et.voltar}); BPMN 2.0 proíbe fluxo de entrada em startEvent. Aponte para a primeira tarefa.`,
        })
      }
  }
  return { etapas, avisos }
}

/**
 * Calcula posições de todos os nós e arestas do diagrama.
 * A espinha principal fica vertical e centralizada; cada ramo "Não" usa uma
 * faixa (lane) própria à direita para não se sobrepor aos demais.
 */
export function layoutFluxo(etapas) {
  const lista = etapas.map((e) => ({ ...e }))
  let fimImplicito = false
  if (!lista.length || lista[lista.length - 1].tipo !== 'e') {
    lista.push({
      indice: lista.length + 1,
      tipo: 'e',
      texto: 'Fim do processo',
      voltar: null,
      implicito: true,
    })
    fimImplicito = true
  }
  if (!lista.length) return { nodes: [], edges: [], width: 0, height: 0, fimImplicito }

  let y = PAD
  let maxW = 0
  for (const et of lista) {
    const f = FORMAS[et.tipo]
    et.w = f.w
    et.h = f.h
    et.kind = f.kind
    et.y = y
    et.cy = y + f.h / 2
    maxW = Math.max(maxW, f.w)
    y += f.h + V_GAP
  }
  const altura = y - V_GAP + PAD

  const espinhaX = PAD + maxW / 2
  const nodes = lista.map((et) => {
    const n = { ...et }
    n.cx = espinhaX
    n.x = espinhaX - et.w / 2
    return n
  })

  const bordaEspinha = espinhaX + maxW / 2
  const edges = []
  let lane = 0
  for (let i = 0; i < nodes.length; i += 1) {
    const from = nodes[i]
    const prox = nodes[i + 1]
    if (prox) {
      const voltar = from.tipo === 'g' ? nodes.find((n) => n.indice === from.voltar) : null
      // Um ramo "Não" só é desenhado se o alvo for válido: BPMN 2.0 proíbe
      // auto-loop e proíbe fluxo de entrada em startEvent.
      const ramoValido = voltar && voltar !== from && voltar.tipo !== 's'
      if (ramoValido) {
        lane += 1
        edges.push({
          id: `Fluxo_${from.indice}_${prox.indice}`,
          from,
          to: prox,
          rotulo: 'Sim',
          tipo: 'principal',
          laneX: bordaEspinha + LANE_GAP * lane,
        })
        edges.push({
          id: `Fluxo_${from.indice}_${voltar.indice}`,
          from,
          to: voltar,
          rotulo: 'Não',
          tipo: 'volta',
          laneX: bordaEspinha + LANE_GAP * lane,
        })
      } else {
        edges.push({
          id: `Fluxo_${from.indice}_${prox.indice}`,
          from,
          to: prox,
          tipo: 'principal',
        })
      }
    }
  }

  const laneMax = edges.reduce((acc, e) => Math.max(acc, e.laneX || 0), 0)
  const largura = Math.max(laneMax, bordaEspinha) + PAD
  return { nodes, edges, width: Math.round(largura), height: Math.round(altura), fimImplicito }
}

/** Waypoints de uma aresta: os mesmos pontos usados no desenho e no BPMN. */
export function pontosDaAresta(edge) {
  if (edge.tipo === 'volta') {
    const x1 = edge.from.cx + edge.from.w / 2
    const y1 = edge.from.cy
    const x2 = edge.to.cx + edge.to.w / 2
    const y2 = edge.to.cy
    return [
      { x: x1, y: y1 },
      { x: edge.laneX, y: y1 },
      { x: edge.laneX, y: y2 },
      { x: x2, y: y2 },
    ]
  }
  const x1 = edge.from.cx
  const y1 = edge.from.y + edge.from.h
  const x2 = edge.to.cx
  const y2 = edge.to.y
  if (Math.abs(x1 - x2) < 0.5) return [{ x: x1, y: y1 }, { x: x2, y: y2 }]
  return [
    { x: x1, y: y1 },
    { x: x1, y: y1 + V_GAP / 2 },
    { x: x2, y: y1 + V_GAP / 2 },
    { x: x2, y: y2 },
  ]
}

export function caminhoAresta(pontos) {
  return pontos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${Math.round(p.x * 100) / 100} ${Math.round(p.y * 100) / 100}`)
    .join(' ')
}

/** Retorna o diagrama já validado e posicionado (etapas + nós + arestas). */
export function montarFluxo(texto) {
  const { etapas, avisos } = validarFluxo(texto)
  const layout = layoutFluxo(etapas)
  return { ...layout, etapas, avisos }
}
