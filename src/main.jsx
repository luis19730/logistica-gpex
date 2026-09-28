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
    const url = new URL(guardada, window.location.origin)
    if (url.origin !== window.location.origin) return
    if (!url.pathname.startsWith(BASE)) return
    if (url.pathname.replace(/\/$/, '') === BASE.replace(/\/$/, '')) return
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
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
