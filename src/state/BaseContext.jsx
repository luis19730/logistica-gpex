import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { carregar, gravar, mesclar, normalizar, proximoCodigo, proximoId, processoVazio, restaurarExemplos } from '../lib/storage.js'
import { TITULO, SUBTITULO, OM, SECAO } from '../lib/constants.js'

const Ctx = createContext(null)

export function useBase() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useBase precisa estar dentro de <BaseProvider>')
  return ctx
}

export function BaseProvider({ children }) {
  const [processos, setProcessos] = useState(() => carregar())
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    gravar(processos)
  }, [processos])

  useEffect(() => {
    if (!aviso) return undefined
    const t = setTimeout(() => setAviso(null), 4200)
    return () => clearTimeout(t)
  }, [aviso])

  const avisar = useCallback((texto, tipo = 'ok') => setAviso({ texto, tipo, chave: Date.now() }), [])

  const salvar = useCallback((processo) => {
    setProcessos((atual) => {
      const i = atual.findIndex((p) => Number(p.id) === Number(processo.id))
      const registro = { ...processo, atualizadoEm: new Date().toISOString() }
      if (i < 0) return [...atual, registro]
      const copia = atual.slice()
      copia[i] = registro
      return copia
    })
    return processo.id
  }, [])

  const excluir = useCallback((id) => {
    setProcessos((atual) => atual.filter((p) => Number(p.id) !== Number(id)))
  }, [])

  const alternarAprovacao = useCallback((id, campo) => {
    setProcessos((atual) =>
      atual.map((p) => (Number(p.id) === Number(id) ? { ...p, [campo]: !p[campo] } : p)),
    )
  }, [])

  const novoProcesso = useCallback(() => {
    const atual = carregar()
    const vazio = processoVazio(atual)
    return vazio
  }, [])

  const duplicar = useCallback((id) => {
    const atual = carregar()
    const base = atual.find((p) => Number(p.id) === Number(id))
    if (!base) return null
    const copia = normalizar(
      {
        ...base,
        id: proximoId(atual),
        codigo: proximoCodigo(atual),
        assunto: base.assunto ? `${base.assunto} (cópia)` : 'novo processo (cópia)',
        criadoEm: new Date().toISOString(),
      },
      proximoId(atual) - 1,
    )
    return copia
  }, [])

  const substituirBase = useCallback((lista) => {
    const base = lista.map((p, i) => normalizar(p, i))
    setProcessos(base)
    return { adicionados: base.length, atualizados: 0 }
  }, [])

  // Calcula a mesclagem de forma síncrona para devolver as contagens ao
  // chamador. Fazer isso dentro do updater do setState não funciona: o React
  // pode invocá-lo mais de uma vez (StrictMode) e o valor seria descartado.
  const mesclarBase = useCallback(
    (lista) => {
      const { lista: resultante, adicionados, atualizados } = mesclar(processos, lista)
      setProcessos(resultante)
      return { adicionados, atualizados }
    },
    [processos],
  )

  const restaurar = useCallback(() => {
    setProcessos(restaurarExemplos())
  }, [])

  const valor = useMemo(
    () => ({
      processos,
      salvar,
      excluir,
      alternarAprovacao,
      novoProcesso,
      duplicar,
      substituirBase,
      mesclarBase,
      restaurar,
      avisar,
      aviso,
      metadados: { titulo: TITULO, subtitulo: SUBTITULO, om: OM, secao: SECAO },
    }),
    [processos, salvar, excluir, alternarAprovacao, novoProcesso, duplicar, substituirBase, mesclarBase, restaurar, avisar, aviso],
  )

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}
