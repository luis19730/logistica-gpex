// Renderização do fluxograma como SVG. Gera uma string SVG autônoma (com
// <defs>, seta e fundo) usada tanto na tela quanto na exportação "Copiar SVG"
// e "Baixar SVG".
import { caminhoAresta, pontosDaAresta } from './flow.js'

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

function formaNo(n) {
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

function rotuloMultilinha(n, max) {
  const linhas = quebrar(n.texto, max).slice(0, 4)
  const alturaLinha = 15
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
      const rotulo = e.rotulo
        ? `\n  <text class="rot" x="${pts[0].x + 10}" y="${pts[0].y - 8}" text-anchor="start">${escaparXml(e.rotulo)}</text>`
        : ''
      return `  <path d="${d}" class="aresta" fill="none" stroke="#3f4a2b" stroke-width="1.8" ${seta}/>${rotulo}`
    })
    .join('\n')

  const nos = modelo.nodes.map((n) => `  ${formaNo(n)}`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
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
${arestas}
${nos}
  </g>
</svg>`
}
