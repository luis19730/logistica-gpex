import React, { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBase } from '../state/BaseContext.jsx'
import TabelaProcessos from '../components/TabelaProcessos.jsx'
import { Modal, Confirmacao } from '../components/Modal.jsx'
import { AREAS, APROVACAO, MACROPROCESSO, OM, OPCOES_OM, OPCOES_SECAO, PADRAO, SECAO, TITULO } from '../lib/constants.js'
import { interpretarJson, normalizar, temStorage } from '../lib/storage.js'
import { baixarArquivo, carimboDeData, copiarTexto, paraCsv, paraTsv, COLUNAS_CSV, valorColuna } from '../lib/utils.js'

// Exemplo mostrado na ajuda do modal de lote. Vive aqui para não ter chaves
// soltas dentro do JSX.
const EXEMPLO_LOTE = `{ "codigo": "E4-06", "assunto": "controlar os combustíveis (classe iii)", "area": "Suporte", "responsavel": "Sd Ev Prado", "secoes": { "objetivos": "…" } }`

function ordenar(lista, { chave, dir }) {
  const copia = lista.slice()
  const sinal = dir === 'asc' ? 1 : -1
  copia.sort((a, b) => {
    const va = valorColuna(a, chave)
    const vb = valorColuna(b, chave)
    if (typeof va === 'number' || typeof vb === 'number') {
      return (Number(va) - Number(vb)) * sinal
    }
    return String(va).localeCompare(String(vb), 'pt-BR', { sensitivity: 'base', numeric: true }) * sinal
  })
  return copia
}

export default function ListaPage() {
  const { processos, salvar, excluir, alternarAprovacao, substituirBase, mesclarBase, avisar, aviso, metadados } = useBase()
  const navegar = useNavigate()

  const [busca, setBusca] = useState('')
  const [secao, setSecao] = useState(OPCOES_SECAO[0])
  const [area, setArea] = useState('Todas')
  const [om, setOm] = useState(OPCOES_OM[0])
  const [aprovacao, setAprovacao] = useState('Todas')
  const [ordenacao, setOrdenacao] = useState({ chave: 'id', dir: 'asc' })
  const [confirmarExclusao, setConfirmarExclusao] = useState(null)
  const [modalImportar, setModalImportar] = useState(false)
  const [modalLote, setModalLote] = useState(false)
  const [textoLote, setTextoLote] = useState('')
  const [erroLote, setErroLote] = useState(null)
  const [pendentes, setPendentes] = useState(null)
  const [erroImportar, setErroImportar] = useState(null)
  const inputArquivo = useRef(null)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    let lista = processos.filter((p) => {
      if (secao && p.secao !== secao) return false
      if (om && p.om !== om) return false
      if (area !== 'Todas' && p.area !== area) return false
      if (aprovacao === 'Aprovado' && !(p.aprovSecao && p.aprovGestao)) return false
      if (aprovacao === 'Não aprovado' && p.aprovSecao && p.aprovGestao) return false
      if (!termo) return true
      return COLUNAS_CSV.some((c) =>
        String(valorColuna(p, c.chave) || '')
          .toLowerCase()
          .includes(termo),
      )
    })
    return ordenar(lista, ordenacao)
  }, [processos, busca, secao, om, area, aprovacao, ordenacao])

  const ordenados = useMemo(() => ordenar(processos, ordenacao), [processos, ordenacao])

  const trocarOrdem = (chave) =>
    setOrdenacao((atual) =>
      atual.chave === chave ? { chave, dir: atual.dir === 'asc' ? 'desc' : 'asc' } : { chave, dir: 'asc' },
    )

  const novoProcesso = () => navegar('/processo/novo')

  const copiarLista = async () => {
    const ok = await copiarTexto(paraTsv(ordenados))
    avisar(
      ok
        ? `Lista com ${ordenados.length} processo(s) copiada (separador TAB, pronto para colar no Excel).`
        : 'Não foi possível copiar. Use "Exportar base" para gerar um arquivo.',
      ok ? 'ok' : 'erro',
    )
  }

  const exportarBase = () => {
    baixarArquivo(`gpex-e4-base-${carimboDeData()}.json`, JSON.stringify(processos, null, 2))
    avisar(`Base exportada com ${processos.length} processo(s).`)
  }

  const exportarCsv = () => {
    baixarArquivo(`gpex-e4-lista-${carimboDeData()}.csv`, paraCsv(ordenados), 'text/csv')
    avisar(`Lista exportada com ${ordenados.length} processo(s).`)
  }

  const receberArquivo = (ev) => {
    const arquivo = ev.target.files && ev.target.files[0]
    ev.target.value = ''
    if (!arquivo) return
    const leitor = new FileReader()
    leitor.onload = () => {
      try {
        const lista = interpretarJson(String(leitor.result))
        setErroImportar(null)
        setPendentes(lista)
      } catch (erro) {
        setErroImportar(erro.message)
        setModalImportar(true)
      }
    }
    leitor.onerror = () => {
      setErroImportar('Não foi possível ler o arquivo.')
      setModalImportar(true)
    }
    leitor.readAsText(arquivo, 'utf-8')
  }

  const confirmarSubstituir = () => {
    const total = pendentes.length
    substituirBase(pendentes)
    setPendentes(null)
    avisar(`Base substituída: ${total} processo(s).`)
  }

  const confirmarMesclar = () => {
    const { adicionados, atualizados } = mesclarBase(pendentes)
    setPendentes(null)
    avisar(`Base mesclada: ${atualizados} atualizado(s) e ${adicionados} novo(s).`)
  }

  const enviarLote = () => {
    setErroLote(null)
    try {
      const lista = interpretarJson(textoLote)
      const validos = lista.filter((p) => p && typeof p === 'object' && (p.assunto || p.codigo || p.id))
      if (!validos.length) {
        setErroLote('Nenhum item reconhecido como processo. Cada item deve ter ao menos "codigo", "id" ou "assunto".')
        return
      }
      validos.forEach((bruto, i) => salvar(normalizar(bruto, processos.length + i)))
      setTextoLote('')
      setModalLote(false)
      avisar(`Lote aplicado: ${validos.length} processo(s) gravados.`)
    } catch (erro) {
      setErroLote(erro.message)
    }
  }

  const filtrosAtivos = busca || area !== 'Todas' || aprovacao !== 'Todas'
  const limparFiltros = () => {
    setBusca('')
    setArea('Todas')
    setAprovacao('Todas')
    setSecao(OPCOES_SECAO[0])
    setOm(OPCOES_OM[0])
  }

  return (
    <>
      <header className="topo">
        <div className="topo-id">
          <span className="selo-om">{SECAO}</span>
          <div>
            <h1>{metadados.titulo || TITULO}</h1>
            <p>{metadados.subtitulo}</p>
          </div>
        </div>
        <div className="topo-acoes">
          <span className="contador" title="Total de processos na base">
            ● {processos.length} processo{processos.length === 1 ? '' : 's'}
          </span>
          <button type="button" className="btn" onClick={copiarLista} title="Copia a lista filtrada (TSV) para a área de transferência">
            Copiar lista
          </button>
          <button type="button" className="btn" onClick={exportarCsv} title="Baixa a lista filtrada em CSV">
            CSV
          </button>
          <button type="button" className="btn" onClick={exportarBase} title="Baixa todos os processos em JSON">
            Exportar base
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setErroImportar(null)
              setModalImportar(true)
            }}
            title="Importa uma base JSON exportada anteriormente"
          >
            Importar base
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setErroLote(null)
              setModalLote(true)
            }}
            title="Colar vários processos de uma vez em JSON"
          >
            Lote
          </button>
          <button type="button" className="btn btn-primario" onClick={novoProcesso}>
            + Novo processo
          </button>
        </div>
      </header>

      <section className="filtros" aria-label="Filtros">
        <label className="campo campo-busca">
          <span>Buscar</span>
          <input
            type="search"
            value={busca}
            placeholder="Buscar por assunto, nº, processo 2º nível..."
            onChange={(ev) => setBusca(ev.target.value)}
          />
        </label>
        <label className="campo">
          <span>Seção</span>
          <select value={secao} onChange={(ev) => setSecao(ev.target.value)}>
            {OPCOES_SECAO.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Área</span>
          <select value={area} onChange={(ev) => setArea(ev.target.value)}>
            <option value="Todas">Todas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>OM</span>
          <select value={om} onChange={(ev) => setOm(ev.target.value)}>
            {OPCOES_OM.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Aprovação</span>
          <select value={aprovacao} onChange={(ev) => setAprovacao(ev.target.value)}>
            {APROVACAO.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        {filtrosAtivos ? (
          <button type="button" className="btn btn-fantasma" onClick={limparFiltros}>
            Limpar filtros
          </button>
        ) : null}
        <span className="contagem">
          {filtrados.length} de {processos.length}
        </span>
      </section>

      <main className="conteudo">
        <TabelaProcessos
          lista={filtrados}
          ordenacao={ordenacao}
          aoOrdenar={trocarOrdem}
          aoAlternar={alternarAprovacao}
          aoExcluir={setConfirmarExclusao}
        />
      </main>

      <footer className="rodape">
        <span>
          {OM} · {SECAO} · {MACROPROCESSO} · Padrão {PADRAO}
        </span>
        <span>
          {temStorage ? 'Dados salvos no localStorage deste navegador' : 'Sem localStorage: exporte a base para não perder dados'}
        </span>
        <Link to="/processo/novo" className="link-suave">
          Ficha em branco
        </Link>
      </footer>

      {aviso ? (
        <div className={`torresmo ${aviso.tipo}`} role="status">
          {aviso.texto}
        </div>
      ) : null}

      {confirmarExclusao ? (
        <Confirmacao
          titulo="Excluir processo"
          mensagem={`Excluir "${confirmarExclusao.codigo} — ${confirmarExclusao.assunto}"? Esta ação não pode ser desfeita. Se quiser, use "Exportar base" antes.`}
          rotuloOk="Excluir"
          aoConfirmar={() => {
            excluir(confirmarExclusao.id)
            avisar(`Processo ${confirmarExclusao.codigo} excluído.`, 'erro')
            setConfirmarExclusao(null)
          }}
          aoCancelar={() => setConfirmarExclusao(null)}
        />
      ) : null}

      {modalImportar ? (
        <Modal
          titulo="Importar base"
          subtitulo="Selecione um .json exportado por este sistema."
          aoFechar={() => {
            setModalImportar(false)
            setErroImportar(null)
          }}
          rodape={
            <>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setModalImportar(false)
                  setErroImportar(null)
                }}
              >
                Fechar
              </button>
              <button
                type="button"
                className="btn btn-primario"
                onClick={() => {
                  setModalImportar(false)
                  setErroImportar(null)
                  inputArquivo.current.click()
                }}
              >
                Escolher arquivo…
              </button>
              <input
                ref={inputArquivo}
                type="file"
                accept="application/json,.json"
                onChange={receberArquivo}
                hidden
              />
            </>
          }
        >
          <p>
            O arquivo pode ser um <strong>array</strong> de processos ou um <strong>objeto único</strong>. Depois de lido, você
            escolhe entre <strong>substituir toda a base</strong> ou <strong>mesclar</strong> com o que já existe.
          </p>
          <p className="dica">
            O merge identifica processos pelo <code>Nº do processo</code> (ou pelo <code>id</code>, se o código não existir): o
            que já estiver na base é atualizado; o que for novo é acrescentado.
          </p>
          {erroImportar ? <p className="alerta erro">{erroImportar}</p> : null}
        </Modal>
      ) : null}

      {pendentes ? (
        <Modal
          titulo="Confirmar importação"
          largura={560}
          subtitulo={`${pendentes.length} processo(s) lido(s) do arquivo.`}
          aoFechar={() => setPendentes(null)}
          rodape={
            <>
              <button type="button" className="btn" onClick={() => setPendentes(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                onClick={confirmarMesclar}
                title="Atualiza os processos já existentes e acrescenta os novos"
              >
                Mesclar com a base
              </button>
              <button type="button" className="btn btn-perigo" onClick={confirmarSubstituir}>
                Substituir tudo
              </button>
            </>
          }
        >
          <p>
            O arquivo tem {pendentes.length} processo(s). <strong>Substituir tudo</strong> apaga os {processos.length}{' '}
            processo(s) atuais. <strong>Mesclar</strong> atualiza os homônimos e acrescenta os demais.
          </p>
          <ul className="previa">
            {pendentes.slice(0, 8).map((p, i) => (
              <li key={`${p.id}-${i}`}>
                <span className="codigo">{p.codigo || `id ${p.id}`}</span> {p.assunto || '(sem assunto)'}
              </li>
            ))}
            {pendentes.length > 8 ? <li className="texto-suave">… e mais {pendentes.length - 8}.</li> : null}
          </ul>
        </Modal>
      ) : null}

      {modalLote ? (
        <Modal
          titulo="Lote de processos"
          subtitulo="Cole um array JSON com um ou vários processos. Útil para enviar processos aos poucos, em lotes."
          largura={860}
          aoFechar={() => {
            setModalLote(false)
            setErroLote(null)
          }}
          rodape={
            <>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setModalLote(false)
                  setErroLote(null)
                }}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn-primario" onClick={enviarLote}>
                Aplicar lote
              </button>
            </>
          }
        >
          <p className="dica">
            Formato de cada item: <code>{EXEMPLO_LOTE}</code>. Campos ausentes assumem o padrão do sistema. O{' '}
            <code>id</code> e o <code>Nº do processo</code> são gerados automaticamente quando não vierem.
          </p>
          <textarea
            className="editor-lote"
            rows={14}
            spellCheck={false}
            value={textoLote}
            placeholder='[\n  {\n    "codigo": "E4-06",\n    "assunto": "controlar os combustíveis (classe iii)",\n    "area": "Suporte",\n    "responsavel": "Sd Ev Prado",\n    "secoes": { "objetivos": "- …" }\n  }\n]'
            onChange={(ev) => setTextoLote(ev.target.value)}
          />
          {erroLote ? <p className="alerta erro">{erroLote}</p> : null}
        </Modal>
      ) : null}
    </>
  )
}
