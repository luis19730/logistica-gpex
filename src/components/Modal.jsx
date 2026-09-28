import React, { useEffect, useRef } from 'react'

export function Modal({ titulo, subtitulo, children, rodape, aoFechar, largura = 720 }) {
  const caixa = useRef(null)

  useEffect(() => {
    const antes = document.activeElement
    const escutar = (ev) => {
      if (ev.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', escutar)
    const foco = caixa.current && caixa.current.querySelector('input, textarea, select, button')
    if (foco) foco.focus()
    document.body.classList.add('sem-scroll')
    return () => {
      document.removeEventListener('keydown', escutar)
      document.body.classList.remove('sem-scroll')
      if (antes && antes.focus) antes.focus()
    }
  }, [aoFechar])

  return (
    <div className="modal-fundo" onMouseDown={(ev) => ev.target === ev.currentTarget && aoFechar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} style={{ maxWidth: largura }} ref={caixa}>
        <header className="modal-cab">
          <div>
            <h2>{titulo}</h2>
            {subtitulo ? <p className="modal-sub">{subtitulo}</p> : null}
          </div>
          <button type="button" className="btn btn-icone" onClick={aoFechar} aria-label="Fechar">
            ✕
          </button>
        </header>
        <div className="modal-corpo">{children}</div>
        {rodape ? <footer className="modal-rodape">{rodape}</footer> : null}
      </div>
    </div>
  )
}

export function Confirmacao({ titulo, mensagem, rotuloOk = 'Confirmar', perigo = true, aoConfirmar, aoCancelar }) {
  return (
    <Modal
      titulo={titulo}
      largura={520}
      aoFechar={aoCancelar}
      rodape={
        <>
          <button type="button" className="btn" onClick={aoCancelar}>
            Cancelar
          </button>
          <button type="button" className={`btn ${perigo ? 'btn-perigo' : 'btn-primario'}`} onClick={aoConfirmar}>
            {rotuloOk}
          </button>
        </>
      }
    >
      <p className="texto-suave">{mensagem}</p>
    </Modal>
  )
}
