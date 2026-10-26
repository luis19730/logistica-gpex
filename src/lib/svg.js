// Renderização do fluxograma como SVG. Gera uma string SVG autônoma (com
// <defs>, seta e fundo) usada tanto na tela quanto na exportação "Copiar SVG"
// e "Baixar SVG".
import { caminhoAresta, pontosDaAresta, RAIAS } from './flow.js'

export function escaparXml(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function quebrar(texto, max) {
  const palavras = String(texto).split(/\s+/).filter(Boolean)
  const linhas = []
  let atual = ''
  for (const p of palavras) {
    if (!atual) atual = p
    else if ((atual + ' ' + p).length <= max) atual += ' ' + p
    else {
      linhas.push(atual)
      atual = p
    }
  }
  if (atual) linhas.push(atual)
  return linhas
}

function rotuloAbaixo(n, max) {
  const lateral = n.saidaBase && n.kind === 'gateway'
  return quebrar(n.texto, lateral ? 16 : max)
    .slice(0, lateral ? 6 : 4)
    .map(
      (l, i) =>
        `<text class="rot pe" x="${n.saidaBase && n.kind === 'gateway' ? n.cx - 10 : n.cx}" y="${n.y + n.h + 14 + i * 12}" text-anchor="${n.saidaBase && n.kind === 'gateway' ? 'end' : 'middle'}">${escaparXml(l)}</text>`,
    )
}

function bandeiras(n) {
  return (n.riscos || [])
    .map((r, i) => {
      const bx = n.x - 6 + i * 52
      const by = n.y - 30
      return `<line x1="${bx}" y1="${by}" x2="${bx}" y2="${by + 24}" stroke="#555" stroke-width="2"/><path d="M${bx} ${by} h18 l-5 6 l5 6 h-18z" fill="#e02020"/><text class="pe" x="${bx + 22}" y="${by + 10}" font-weight="bold">${escaparXml(r)}</text>`
    })
    .join('\n')
}

function formaNoRaia(n) {
  const idx = escaparXml(String(n.indice))
  let corpo
  if (n.kind === 'circle' || n.kind === 'circle-fim') {
    const ini = n.kind === 'circle'
    corpo = [
      `<circle cx="${n.cx}" cy="${n.cy}" r="${n.w / 2}" fill="${ini ? '#7ddc4a' : '#e53935'}" stroke="${ini ? '#2e6b14' : '#7a1010'}" stroke-width="${ini ? 2 : 4}"/>`,
      ...rotuloAbaixo(n, 22),
    ]
  } else if (n.kind === 'gateway') {
    const p = `${n.cx},${n.y} ${n.x + n.w},${n.cy} ${n.cx},${n.y + n.h} ${n.x},${n.cy}`
    corpo = [
      `<polygon points="${p}" fill="#f4e58a" stroke="#8a7a10" stroke-width="1.5"/>`,
      `<path d="M${n.cx - 9} ${n.cy - 9} L${n.cx + 9} ${n.cy + 9} M${n.cx + 9} ${n.cy - 9} L${n.cx - 9} ${n.cy + 9}" stroke="#555" stroke-width="3"/>`,
      ...rotuloAbaixo(n, 26),
    ]
  } else {
    corpo = [
      `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="8" ry="8" fill="#cfe2fb" stroke="#4a6fa5" stroke-width="1.5"/>`,
      ...rotuloMultilinha(n, 19, 13),
      `<text class="idx" x="${n.x + n.w - 5}" y="${n.y + 12}" text-anchor="end">${idx}</text>`,
    ]
  }
  return [...corpo, bandeiras(n)].filter(Boolean).join('\n')
}

function faixasRaias(modelo, opcoes) {
  const { LABEL } = RAIAS
  const w = modelo.width
  const h = modelo.height
  const partes = [`<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="#555"/>`]
  if (opcoes.pool) {
    partes.push(
      `<rect x="0" y="0" width="30" height="${h}" fill="#dfe5cf" stroke="#555"/><text class="pe" font-weight="bold" transform="translate(16 ${h / 2}) rotate(-90)" text-anchor="middle">${escaparXml(opcoes.pool)}</text>`,
    )
  }
  const x0 = opcoes.pool ? 30 : 0
  modelo.raias.forEach((r) => {
    partes.push(
      `<rect x="${x0}" y="${r.y}" width="${w - x0}" height="${r.h}" fill="none" stroke="#999"/>`,
      `<rect x="${x0}" y="${r.y}" width="${LABEL - x0}" height="${r.h}" fill="#eef1e6" stroke="#555"/>`,
      `<text class="pe" font-size="10" font-weight="bold" transform="translate(${x0 + (LABEL - x0) / 2 + 4} ${r.y + r.h / 2}) rotate(-90)" text-anchor="middle">${escaparXml(r.nome.length > 26 ? r.nome.slice(0, 25) + '…' : r.nome)}</text>`,
    )
  })
  return partes.join('\n')
}

function formaNo(n, raias) {
  if (raias) return formaNoRaia(n)
  const rotulo = escaparXml(n.texto)
  const idx = escaparXml(String(n.indice))
  if (n.kind === 'circle' || n.kind === 'circle-fim') {
    const r = n.w / 2
    const preenchimento = n.kind === 'circle-fim' ? '#ffffff' : '#e8ecd8'
    const traço = n.kind === 'circle-fim' ? 'stroke-width="4"' : 'stroke-width="2"'
    return [
      `<circle cx="${n.cx}" cy="${n.cy}" r="${r}" fill="${preenchimento}" stroke="#3f4a2b" ${traço}/>`,
      `<text class="rot" x="${n.cx}" y="${n.cy}" text-anchor="middle" dominant-baseline="middle">${rotulo}</text>`,
    ].join('\n')
  }
  if (n.kind === 'gateway') {
    const p = `${n.cx},${n.y} ${n.x + n.w},${n.cy} ${n.cx},${n.y + n.h} ${n.x},${n.cy}`
    return [
      `<polygon points="${p}" fill="#f4f6e6" stroke="#3f4a2b" stroke-width="2"/>`,
      ...rotuloMultilinha(n, 22),
    ].join('\n')
  }
  return [
    `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="10" ry="10" fill="#ffffff" stroke="#3f4a2b" stroke-width="2"/>`,
    ...rotuloMultilinha(n, 30),
    `<text class="idx" x="${n.x + n.w - 6}" y="${n.y + 13}" text-anchor="end">${idx}</text>`,
  ].join('\n')
}

function rotuloMultilinha(n, max, alturaLinha = 15) {
  const linhas = quebrar(n.texto, max).slice(0, 7)
  const topo = n.cy - ((linhas.length - 1) * alturaLinha) / 2
  return linhas.map(
    (l, i) =>
      `<text class="rot" x="${n.cx}" y="${topo + i * alturaLinha}" text-anchor="middle" dominant-baseline="middle">${escaparXml(l)}</text>`,
  )
}

function idUnico(base, usados) {
  let id = base
  let i = 2
  while (usados.has(id)) {
    id = `${base}_${i}`
    i += 1
  }
  usados.add(id)
  return id
}

/**
 * Gera o SVG completo do diagrama.
 * @param {object} modelo retorno de montarFluxo()
 * @param {object} opcoes {titulo, subtitulo, fundo, escala}
 */
export function gerarSvg(modelo, opcoes = {}) {
  const { titulo = '', subtitulo = '', fundo = '#fbfcf5' } = opcoes
  const raias = !!modelo.raias
  const pool = opcoes.pool || 'Cmdo Bda Inf Amv · E/4'
  if (!modelo.nodes.length) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80"><rect width="320" height="80" fill="#fbfcf5"/><text x="160" y="44" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#5b6444">Fluxograma vazio</text></svg>'
  }
  const tituloAltura = titulo ? 54 : 0
  const w = modelo.width
  const h = modelo.height + tituloAltura
  const usados = new Set()
  const marcadorId = idUnico('gpex-seta', usados)

  const arestas = modelo.edges
    .map((e) => {
      const pts = pontosDaAresta(e)
      const d = caminhoAresta(pts)
      const seta = `marker-end="url(#${marcadorId})"`
      const baixo = pts.length > 1 && pts[1].y > pts[0].y + 1 && Math.abs(pts[1].x - pts[0].x) < 1
      const rotulo = e.rotulo
        ? `\n  <text class="rot" font-weight="bold" x="${pts[0].x + 8}" y="${baixo ? pts[0].y + 16 : pts[0].y - 8}" text-anchor="start">${escaparXml(e.rotulo)}</text>`
        : ''
      return `  <path d="${d}" class="aresta" fill="none" stroke="#3f4a2b" stroke-width="1.8" ${seta}/>${rotulo}`
    })
    .join('\n')

  const nos = modelo.nodes.map((n) => `  ${formaNo(n, raias)}`).join('\n')
  const faixas = raias ? faixasRaias(modelo, { pool }) : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <style>
    .rot { font-family: Segoe UI, Arial, sans-serif; font-size: 12px; fill: #22271a; }
    .pe { font-family: Segoe UI, Arial, sans-serif; font-size: 11px; fill: #22271a; }
    .idx { font-family: Consolas, monospace; font-size: 10px; fill: #8a8f7c; }
  </style>
  <defs>
    <marker id="${marcadorId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3f4a2b"/>
    </marker>
  </defs>
  <rect width="${w}" height="${h}" fill="${fundo}"/>
${
  titulo
    ? `  <text x="${w / 2}" y="24" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="bold" fill="#3f4a2b">${escaparXml(titulo)}</text>
  <text x="${w / 2}" y="42" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#5b6444">${escaparXml(subtitulo)}</text>`
    : ''
}
${tituloAltura ? `  <g transform="translate(0, ${tituloAltura})">` : '  <g>'}
${faixas}
${arestas}
${nos}
  </g>
</svg>`
}
