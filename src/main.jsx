import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { BaseProvider } from './state/BaseContext.jsx'
import { BASE } from './lib/constants.js'
import './styles.css'

// GitHub Pages não reescreve URLs: um 404.html guarda o endereço original e
// devolve o app para a raiz, que então repete a navegação. Ver public/404.html.
function recuperarRedirect() {
  try {
    const guardada = window.sessionStorage.getItem('gpex:redirect')
    if (!guardada) return
    window.sessionStorage.removeItem('gpex:redirect')

    // Só aceitamos caminho interno: nada de "//site" (protocolo relativo) nem "..".
    if (!guardada.startsWith('/') || guardada.startsWith('//')) return
    const caminho = guardada.split(/[?#]/)[0]
    if (!caminho || caminho.includes('..')) return

    // Aceita "/logistica-gpex/processo/3" e também "/processo/3" (relativo à base).
    let relativo = caminho.startsWith(BASE) ? caminho.slice(BASE.length) : caminho
    if (!relativo.startsWith('/')) relativo = '/' + relativo
    if (relativo === '/') return

    const sufixo = guardada.slice(caminho.length)
    window.history.replaceState(null, '', BASE.replace(/\/$/, '') + relativo + sufixo)
  } catch {
    /* sem redirect pendente */
  }
}

recuperarRedirect()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={BASE}>
      <BaseProvider>
        <App />
      </BaseProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
