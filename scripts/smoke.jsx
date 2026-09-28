// Smoke test de renderização: monta cada rota do app em memória e falha se
// qualquer componente lançar exceção. Executado por scripts/smoke.mjs, que
// empacota este arquivo com esbuild antes de rodar no Node (não há loader de
// JSX no Node puro).
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { BaseProvider } from '../src/state/BaseContext.jsx'
import App from '../src/App.jsx'

const CASOS = [
  ['listagem', '/'],
  ['ficha existente', '/processo/1'],
  ['ficha inexistente', '/processo/9999'],
  ['ficha em branco', '/processo/novo'],
  ['rota desconhecida', '/qualquer/coisa'],
]

const falhas = []
const marcas = []

CASOS.forEach(([nome, entrada]) => {
  try {
    const html = renderToStaticMarkup(
      React.createElement(MemoryRouter, { initialEntries: [entrada] }, React.createElement(BaseProvider, null, React.createElement(App))),
    )
    marcas.push([nome, html.length])
  } catch (erro) {
    falhas.push(`${nome} (${entrada}): ${erro && erro.stack ? erro.stack : erro}`)
  }
})

marcas.forEach(([nome, tamanho]) => console.log(`  ok  ${nome.padEnd(20)} ${tamanho} bytes de HTML`))

// Confere que a listagem realmente saiu com as 5 fichas de exemplo.
try {
  const html = renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(BaseProvider, null, React.createElement(App))),
  )
  const etapas = (html.match(/E4-0\d/g) || []).length
  if (etapas < 5) falhas.push(`listagem deveria citar os 5 códigos E4-0x, encontrou ${etapas}`)
  else console.log(`  ok  listagem cita os ${etapas} códigos de exemplo`)
} catch (erro) {
  falhas.push(`re-render da listagem: ${erro && erro.stack ? erro.stack : erro}`)
}

if (falhas.length) {
  console.error('\nSMOKE FALHOU:')
  falhas.forEach((f) => console.error(`  - ${f}`))
  process.exitCode = 1
} else {
  console.log(`\nSMOKE OK — ${CASOS.length} rotas renderizadas sem erro.`)
}
