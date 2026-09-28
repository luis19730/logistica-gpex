import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBase } from '../state/BaseContext.jsx'
import FluxoSvg from '../components/FluxoSvg.jsx'
import { Modal, Confirmacao } from '../components/Modal.jsx'
import { AREAS, MACROPROCESSO, OM, PADRAO, SECAO, SECOES_FICHA } from '../lib/constants.js'
import { validarFluxo, ROTULO_TIPO, montarFluxo } from '../lib/flow.js'
import { gerarBpmn } from '../lib/bpmn.js'
import { gerarSvg } from '../lib/svg.js'
import { baixarArquivo, carimboDeData, copiarTexto } from '../lib/utils.js'

function TextoLeitura({ texto }) {
  if (!String(texto || '').trim()) return <p className="vazio-secao">Sem conteúdo.</p>
  return <div className="texto-secao">{texto}</div>
}

function AjudaFluxo({ etapas }) {
  if (!etapas.length) return null
  return (
    <div className="ajuda-fluxo">
      <strong>Índices das etapas (use-os no ramo “Não”):</strong>
      <ol>
        {etapas.map((e) => (
          <li key={e.indice}>
            <code>{e.indice}</code> <em>{ROTULO_TIPO[e.tipo]}</em> — {e.texto}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function FichaPage() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { processos, salvar, excluir, novoProcesso, duplicar, avisar, aviso } = useBase()

  const ehNovo = id === 'novo'
  const existente = useMemo(() => processos.find((p) => String(p.id) === String(id)), [processos, id])

  const [rascunho, setRascunho] = useState(() => (ehNovo ? novoProcesso() : existente || null))
  const [editando, setEditando] = useState(ehNovo)
  const [sujo, setSujo] = useState(false)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [confirmarSaida, setConfirmarSaida] = useState(null)
  const [diagramaCheio, setDiagramaCheio] = useState(false)

  // Todos os hooks precisam vir ANTES de qualquer return antecipado, senão a
  // contagem de hooks muda entre renders e o React derruba a tela.
  const textoFluxo = rascunho ? rascunho.fluxo : ''
  const { etapas, avisos } = useMemo(() => validarFluxo(textoFluxo), [textoFluxo])
  const modeloFluxo = useMemo(() => montarFluxo(textoFluxo), [textoFluxo])

  const tituloSvg = rascunho ? `${rascunho.codigo} — ${rascunho.assunto || '(sem assunto)'}` : ''
  const subtituloSvg = `${OM} · ${SECAO} · Padrão ${PADRAO}`
  const svgTexto = useMemo(
    () => gerarSvg(modeloFluxo, { titulo: tituloSvg, subtitulo: subtituloSvg }),
    [modeloFluxo, tituloSvg, subtituloSvg],
  )

  // Ao trocar de processo pela própria rota, recarrega o rascunho.
  useEffect(() => {
    setRascunho(ehNovo ? novoProcesso() : existente || null)
    setEditando(ehNovo)
    setSujo(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const avisarSaida = (ev) => {
      if (sujo) {
        ev.preventDefault()
        ev.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', avisarSaida)
    return () => window.removeEventListener('beforeunload', avisarSaida)
  }, [sujo])

  if (!rascunho) {
    return (
      <div className="pagina">
        <header className="topo">
          <div className="topo-id">
            <span className="selo-om">{SECAO}</span>
            <div>
              <h1>Processo não encontrado</h1>
              <p>Nenhum processo com id “{id}” está na base deste navegador.</p>
            </div>
          </div>
        </header>
        <main className="conteudo">
          <p>
            <Link className="btn btn-primario" to="/">
              Voltar para a lista
            </Link>
          </p>
        </main>
      </div>
    )
  }

  const alterar = (campo, valor) => {
    setSujo(true)
    setRascunho((r) => ({ ...r, [campo]: valor }))
  }
  const alterarSecao = (chave, valor) => {
    setSujo(true)
    setRascunho((r) => ({ ...r, secoes: { ...r.secoes, [chave]: valor } }))
  }

  const errosFluxo = avisos.filter((a) => a.nivel === 'erro')

  const dadosFluxo = { codigo: rascunho.codigo, assunto: rascunho.assunto, responsavel: rascunho.responsavel }

  const aoSalvar = () => {
    if (errosFluxo.length) {
      avisar('Corrija os erros do fluxograma antes de salvar.', 'erro')
      return
    }
    salvar({ ...rascunho, assunto: rascunho.assunto.trim() || 'processo sem assunto' })
    setSujo(false)
    setEditando(false)
    avisar(`Processo ${rascunho.codigo} salvo.`)
    if (ehNovo) navegar(`/processo/${rascunho.id}`, { replace: true })
  }

  const aoCancelar = () => {
    if (ehNovo) {
      navegar('/')
      return
    }
    setRascunho(existente)
    setSujo(false)
    setEditando(false)
  }

  const voltar = () => {
    if (sujo) {
      setConfirmarSaida('/')
      return
    }
    navegar('/')
  }

  const aoDuplicar = () => {
    const base = existente || rascunho
    const copia = duplicar(base.id)
    if (!copia) {
      avisar('Salve o processo antes de duplicá-lo.', 'erro')
      return
    }
    salvar(copia)
    avisar(`Processo duplicado como ${copia.codigo}.`)
    navegar(`/processo/${copia.id}`)
  }

  const copiarBpmn = async () => {
    const ok = await copiarTexto(gerarBpmn(rascunho.fluxo, dadosFluxo))
    avisar(ok ? 'BPMN 2.0 copiado (XML). Cole no bpmn.io, Camunda Modeler ou ARIS Express.' : 'Não foi possível copiar o BPMN.', ok ? 'ok' : 'erro')
  }

  const baixarBpmn = () => {
    baixarArquivo(`${rascunho.codigo || 'fluxo'}-${carimboDeData()}.bpmn`, gerarBpmn(rascunho.fluxo, dadosFluxo), 'application/xml')
    avisar('Arquivo .bpmn gerado.')
  }

  const copiarSvg = async () => {
    const ok = await copiarTexto(svgTexto)
    avisar(ok ? 'SVG copiado. Cole no Word, no PowerPoint ou no Inkscape.' : 'Não foi possível copiar o SVG.', ok ? 'ok' : 'erro')
  }

  const baixarSvg = () => {
    baixarArquivo(`${rascunho.codigo || 'fluxo'}-${carimboDeData()}.svg`, svgTexto, 'image/svg+xml')
    avisar('Arquivo .svg gerado.')
  }

  return (
    <div className="pagina">
      <header className="topo">
        <div className="topo-id">
          <span className="selo-om">{SECAO}</span>
          <div>
            <h1>
              {rascunho.codigo || 'sem número'} — {rascunho.assunto || 'Processo sem assunto'}
            </h1>
            <p>
              {OM} · Seção {SECAO} · {MACROPROCESSO} · Padrão {PADRAO}
            </p>
          </div>
        </div>
        <div className="topo-acoes">
          <button type="button" className="btn" onClick={voltar}>
            Voltar
          </button>
          {!editando ? (
            <button type="button" className="btn btn-primario" onClick={() => setEditando(true)}>
              Editar
            </button>
          ) : null}
          {editando ? (
            <>
              <button type="button" className="btn btn-primario" onClick={aoSalvar} disabled={Boolean(errosFluxo.length)}>
                Salvar
              </button>
              <button type="button" className="btn" onClick={aoCancelar}>
                Cancelar
              </button>
            </>
          ) : null}
          <button type="button" className="btn" onClick={aoDuplicar}>
            Duplicar processo
          </button>
          {!ehNovo ? (
            <button type="button" className="btn btn-perigo-suave" onClick={() => setConfirmarExclusao(true)}>
              Excluir processo
            </button>
          ) : null}
        </div>
      </header>

      <main className="conteudo ficha">
        <section className="selos">
          <span className="selo-om grande">{SECAO}</span>
          <span className="selo-texto">
            OM <strong>{OM}</strong>
          </span>
          <span className="selo-texto">
            Seção <strong>{SECAO}</strong> (fixa)
          </span>
          <span className="selo-texto">
            Macroprocesso <strong>{MACROPROCESSO}</strong>
          </span>
          <span className="selo-texto">
            Padrão <strong>{PADRAO}</strong>
          </span>
          {sujo ? <span className="selo-texto aviso-alteracoes">Alterações não salvas</span> : null}
        </section>

        <section className="bloco">
          <h2>Identificação do processo</h2>
          <div className="grade-campos">
            <label className="campo">
              <span>Nº do processo</span>
              <input
                value={rascunho.codigo}
                disabled={!editando}
                placeholder="E4-01"
                onChange={(ev) => alterar('codigo', ev.target.value)}
              />
            </label>
            <label className="campo">
              <span>Assunto (processo 3º nível)</span>
              <input
                value={rascunho.assunto}
                disabled={!editando}
                placeholder="em minúsculas, ex.: requisitar e distribuir munição (classe v)"
                onChange={(ev) => alterar('assunto', ev.target.value)}
              />
            </label>
            <label className="campo">
              <span>Responsável (nome e posto/graduação)</span>
              <input
                value={rascunho.responsavel}
                disabled={!editando}
                placeholder="Maj Filipe — Chefe da E/4"
                onChange={(ev) => alterar('responsavel', ev.target.value)}
              />
            </label>
            <label className="campo">
              <span>Área</span>
              <select value={rascunho.area} disabled={!editando} onChange={(ev) => alterar('area', ev.target.value)}>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo largo">
              <span>Objetivos do processo (resumo de uma linha, exibido na listagem)</span>
              <input value={rascunho.objetivo} disabled={!editando} onChange={(ev) => alterar('objetivo', ev.target.value)} />
            </label>
            <label className="campo largo">
              <span>Processo 2º nível (nome descritivo)</span>
              <input
                value={rascunho.processo2}
                disabled={!editando}
                onChange={(ev) => alterar('processo2', ev.target.value)}
              />
            </label>
          </div>
        </section>

        {SECOES_FICHA.filter((s) => s.chave !== 'fluxograma').map((secao) => (
          <section className="bloco" key={secao.chave}>
            <h2>
              <span className="numero-secao">{secao.numero}</span> {secao.titulo}
            </h2>
            {editando ? (
              <textarea
                rows={Math.min(18, Math.max(5, String(rascunho.secoes[secao.chave] || '').split('\n').length + 1))}
                value={rascunho.secoes[secao.chave] || ''}
                placeholder="Um item por linha. Use “- ” para itens de lista."
                onChange={(ev) => alterarSecao(secao.chave, ev.target.value)}
              />
            ) : (
              <TextoLeitura texto={rascunho.secoes[secao.chave]} />
            )}
          </section>
        ))}

        <section className="bloco">
          <h2>
            <span className="numero-secao">12</span> Fluxograma
          </h2>
          <p className="dica">
            Uma etapa por linha, no formato <code>tipo|texto|índice</code>. Tipos: <code>s</code> início, <code>t</code>{' '}
            tarefa, <code>g</code> decisão, <code>e</code> fim. Em <code>g</code>, o campo índice é a etapa para onde volta o
            ramo “Não”; o “Sim” segue para a linha seguinte. Exemplo: <code>g|Todos os dados foram recebidos?|2</code>
          </p>
          {editando ? (
            <>
              <textarea
                rows={Math.min(20, Math.max(6, rascunho.fluxo.split('\n').length + 2))}
                spellCheck={false}
                className="editor-fluxo"
                value={rascunho.fluxo}
                onChange={(ev) => alterar('fluxo', ev.target.value)}
              />
              <AjudaFluxo etapas={etapas} />
            </>
          ) : null}

          {avisos.length ? (
            <ul className="lista-avisos">
              {avisos.map((a) => (
                <li key={`${a.nivel}-${a.msg}`} className={a.nivel}>
                  {a.msg}
                </li>
              ))}
            </ul>
          ) : null}

          <FluxoSvg fluxo={rascunho.fluxo} titulo={tituloSvg} subtitulo={subtituloSvg} comTitulo={!editando} />

          <div className="barra-botoes">
            <button type="button" className="btn" onClick={() => setDiagramaCheio(true)}>
              Ver em tela cheia
            </button>
            <button type="button" className="btn" onClick={copiarBpmn}>
              Copiar BPMN 2.0
            </button>
            <button type="button" className="btn" onClick={baixarBpmn}>
              Baixar .bpmn
            </button>
            <button type="button" className="btn" onClick={copiarSvg}>
              Copiar SVG
            </button>
            <button type="button" className="btn" onClick={baixarSvg}>
              Baixar SVG
            </button>
          </div>
        </section>
      </main>

      <footer className="rodape">
        <span>
          {OM} · {SECAO} · {MACROPROCESSO} · Padrão {PADRAO}
        </span>
        <span>Ficha {SECOES_FICHA.length} seções — EPOEx.FR001.00</span>
      </footer>

      {aviso ? (
        <div className={`torresmo ${aviso.tipo}`} role="status">
          {aviso.texto}
        </div>
      ) : null}

      {diagramaCheio ? (
        <Modal
          titulo={tituloSvg}
          subtitulo={subtituloSvg}
          largura={1100}
          aoFechar={() => setDiagramaCheio(false)}
          rodape={
            <>
              <button type="button" className="btn btn-primario" onClick={() => setDiagramaCheio(false)}>
                Fechar
              </button>
              <button type="button" className="btn" onClick={copiarBpmn}>
                Copiar BPMN 2.0
              </button>
              <button type="button" className="btn" onClick={baixarBpmn}>
                Baixar .bpmn
              </button>
              <button type="button" className="btn" onClick={copiarSvg}>
                Copiar SVG
              </button>
              <button type="button" className="btn" onClick={baixarSvg}>
                Baixar SVG
              </button>
            </>
          }
        >
          <FluxoSvg fluxo={rascunho.fluxo} />
        </Modal>
      ) : null}

      {confirmarExclusao ? (
        <Confirmacao
          titulo="Excluir processo"
          mensagem={`Excluir "${rascunho.codigo} — ${rascunho.assunto}"? Esta ação não pode ser desfeita.`}
          rotuloOk="Excluir"
          aoConfirmar={() => {
            excluir(rascunho.id)
            avisar(`Processo ${rascunho.codigo} excluído.`, 'erro')
            navegar('/')
          }}
          aoCancelar={() => setConfirmarExclusao(false)}
        />
      ) : null}

      {confirmarSaida ? (
        <Confirmacao
          titulo="Há alterações não salvas"
          mensagem="Você fez alterações nesta ficha e não salvou. Sair agora descarta essas alterações."
          rotuloOk="Sair sem salvar"
          aoConfirmar={() => {
            setSujo(false)
            setConfirmarSaida(null)
            navegar(confirmarSaida)
          }}
          aoCancelar={() => setConfirmarSaida(null)}
        />
      ) : null}
    </div>
  )
}
