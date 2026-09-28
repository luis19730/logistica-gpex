import React from 'react'
import { useNavigate } from 'react-router-dom'
import { COLUNAS_CSV } from '../lib/utils.js'

const ORDENAIVEIS = new Set(['id', 'assunto', 'area', 'codigo', 'processo2', 'objetivo', 'responsavel'])

const ROTULOS_ORDENACAO = {
  id: 'ID',
  assunto: 'Assunto',
  area: 'Área',
  codigo: 'Nº',
  processo2: '2º nível',
  objetivo: 'Objetivo',
  responsavel: 'Responsável',
}

function SeloAprovacao({ ativo, aoAlternar, titulo }) {
  return (
    <button
      type="button"
      className={`selo-aprov ${ativo ? 'sim' : 'nao'}`}
      onClick={(ev) => {
        ev.stopPropagation()
        aoAlternar()
      }}
      title={`${titulo}: clique para alternar`}
      aria-pressed={ativo}
    >
      ● {ativo ? 'Sim' : 'Não'}
    </button>
  )
}

export default function TabelaProcessos({ lista, ordenacao, aoOrdenar, aoAlternar, aoExcluir }) {
  const navegar = useNavigate()
  const abrir = (p) => navegar(`/processo/${p.id}`)

  if (!lista.length) {
    return (
      <p className="vazio">
        Nenhum processo corresponde aos filtros. Ajuste a busca ou os dropdowns acima, ou clique em{' '}
        <strong>+ Novo processo</strong>.
      </p>
    )
  }

  return (
    <>
      <div className="tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              {COLUNAS_CSV.map((c) => {
                const ordenavel = ORDENAIVEIS.has(c.chave)
                const ativo = ordenacao.chave === c.chave
                return (
                  <th
                    key={c.chave}
                    className={ordenavel ? 'ordenavel' : ''}
                    aria-sort={ativo ? (ordenacao.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type="button"
                      className={`th-btn ${ativo ? 'ativa' : ''}`}
                      onClick={() => ordenavel && aoOrdenar(c.chave)}
                      disabled={!ordenavel}
                    >
                      {c.titulo}
                      {ativo ? <span aria-hidden="true">{ordenacao.dir === 'asc' ? ' ▲' : ' ▼'}</span> : null}
                    </button>
                  </th>
                )
              })}
              <th className="col-acoes">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} onClick={() => abrir(p)} tabIndex={0} onKeyDown={(ev) => ev.key === 'Enter' && abrir(p)}>
                <td data-rotulo="LOGO (OM)">
                  <span className="selo-secao">{p.secao}</span>
                </td>
                <td data-rotulo="APROV. SEÇÃO">
                  <SeloAprovacao
                    ativo={p.aprovSecao}
                    titulo="Aprovado na Seção"
                    aoAlternar={() => aoAlternar(p.id, 'aprovSecao')}
                  />
                </td>
                <td data-rotulo="APROV. ASS. GESTÃO">
                  <SeloAprovacao
                    ativo={p.aprovGestao}
                    titulo="Aprovado na Assessoria de Gestão"
                    aoAlternar={() => aoAlternar(p.id, 'aprovGestao')}
                  />
                </td>
                <td data-rotulo="ID DO PROCESSO" className="num">
                  {p.id}
                </td>
                <td data-rotulo="ORGANIZAÇÃO MILITAR">{p.om}</td>
                <td data-rotulo="ASSUNTO (PROCESSO 3º NÍVEL)" className="col-assunto">
                  {p.assunto}
                </td>
                <td data-rotulo="OBJETIVOS DO PROCESSO" className="col-objetivo">
                  {p.objetivo}
                </td>
                <td data-rotulo="ÁREA">
                  <span className={`selo-area ${(p.area || '').toLowerCase().replace(/[^a-z]/g, '')}`}>{p.area}</span>
                </td>
                <td data-rotulo="MACROPROCESSO 1º NÍVEL">{p.macroprocesso}</td>
                <td data-rotulo="PROCESSO 2º NÍVEL">{p.processo2}</td>
                <td data-rotulo="Nº DO PROCESSO">
                  <span className="codigo">{p.codigo}</span>
                </td>
                <td className="col-acoes">
                  <button
                    type="button"
                    className="btn btn-mini"
                    title="Editar processo"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      abrir(p)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-mini btn-perigo-suave"
                    title="Excluir processo"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      aoExcluir(p)
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cartoes">
        {lista.map((p) => (
          <article key={p.id} className="cartao" onClick={() => abrir(p)}>
            <header>
              <span className="codigo">{p.codigo}</span>
              <span className="selo-secao">{p.secao}</span>
              <span className={`selo-area ${(p.area || '').toLowerCase().replace(/[^a-z]/g, '')}`}>{p.area}</span>
            </header>
            <h3>{p.assunto}</h3>
            <p className="cartao-objetivo">{p.objetivo}</p>
            <dl>
              <div>
                <dt>2º nível</dt>
                <dd>{p.processo2}</dd>
              </div>
              <div>
                <dt>Macroprocesso</dt>
                <dd>{p.macroprocesso}</dd>
              </div>
              <div>
                <dt>OM</dt>
                <dd>{p.om}</dd>
              </div>
              <div>
                <dt>Responsável</dt>
                <dd>{p.responsavel || '—'}</dd>
              </div>
            </dl>
            <footer>
              <SeloAprovacao
                ativo={p.aprovSecao}
                titulo="Aprovado na Seção"
                aoAlternar={() => aoAlternar(p.id, 'aprovSecao')}
              />
              <SeloAprovacao
                ativo={p.aprovGestao}
                titulo="Aprovado na Assessoria de Gestão"
                aoAlternar={() => aoAlternar(p.id, 'aprovGestao')}
              />
              <span className="cartao-acoes">
                <button
                  type="button"
                  className="btn btn-mini"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    abrir(p)
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-mini btn-perigo-suave"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    aoExcluir(p)
                  }}
                >
                  Excluir
                </button>
              </span>
            </footer>
          </article>
        ))}
      </div>
    </>
  )
}
