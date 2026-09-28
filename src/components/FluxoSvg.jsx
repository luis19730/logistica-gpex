import React, { useMemo } from 'react'
import { gerarSvg } from '../lib/svg.js'
import { montarFluxo } from '../lib/flow.js'

/**
 * Desenha o fluxograma. O markup vem de src/lib/svg.js (que também gera a
 * exportação), e todo texto é escapado por escaparXml antes de ser injetado.
 */
export default function FluxoSvg({ fluxo, titulo, subtitulo, comTitulo = false, apenasSvg = false }) {
  const modelo = useMemo(() => montarFluxo(fluxo), [fluxo])
  const svg = useMemo(
    () => gerarSvg(modelo, comTitulo ? { titulo, subtitulo } : {}),
    [modelo, titulo, subtitulo, comTitulo],
  )
  if (apenasSvg) {
    return <div className="fluxo-svg" dangerouslySetInnerHTML={{ __html: svg }} />
  }
  return (
    <div className="fluxo-caixa">
      {comTitulo ? (
        <header className="fluxo-titulo">
          <strong>{titulo}</strong>
          {subtitulo ? <span>{subtitulo}</span> : null}
        </header>
      ) : null}
      <div className="fluxo-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      {modelo.avisos.length ? (
        <ul className="lista-avisos">
          {modelo.avisos.map((a) => (
            <li key={`${a.nivel}-${a.msg}`} className={a.nivel}>
              {a.msg}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
