// Persistência em localStorage. Sem backend: a base vive inteira no navegador
// e pode ser exportada/importada em JSON a qualquer momento.
import { STORAGE_KEY, OM, SECAO, MACROPROCESSO, FLUXO_PADRAO, SECOES_FICHA } from './constants.js'
import { processosIniciais } from './seed.js'

const CHAVES_TEXTO = ['assunto', 'objetivo', 'area', 'processo2', 'codigo', 'responsavel', 'fluxo']
const CHAVES_BOOL = ['aprovSecao', 'aprovGestao']

function storageDisponivel() {
  try {
    const k = `${STORAGE_KEY}.teste`
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

export const temStorage = typeof window !== 'undefined' && storageDisponivel()

/** Normaliza um objeto vindo do storage ou de um JSON importado. */
export function normalizar(entrada, indice = 0) {
  const p = entrada && typeof entrada === 'object' ? entrada : {}
  const secoes = {}
  for (const s of SECOES_FICHA) {
    if (s.chave === 'fluxograma') continue
    const v = p.secoes && typeof p.secoes === 'object' ? p.secoes[s.chave] : p[s.chave]
    secoes[s.chave] = typeof v === 'string' ? v : ''
  }
  const out = {
    id: Number.isFinite(Number(p.id)) ? Number(p.id) : indice + 1,
    om: OM,
    secao: SECAO,
    macroprocesso: MACROPROCESSO,
    secoes,
    fluxo: typeof p.fluxo === 'string' && p.fluxo.trim() ? p.fluxo : FLUXO_PADRAO,
    criadoEm: typeof p.criadoEm === 'string' ? p.criadoEm : new Date().toISOString(),
    atualizadoEm: typeof p.atualizadoEm === 'string' ? p.atualizadoEm : new Date().toISOString(),
  }
  for (const k of CHAVES_TEXTO) out[k] = typeof p[k] === 'string' ? p[k] : ''
  for (const k of CHAVES_BOOL) out[k] = Boolean(p[k])
  if (!out.codigo) out.codigo = `E4-${String(out.id).padStart(2, '0')}`
  if (!out.area) out.area = 'Finalísticos'
  return out
}

export function carregar() {
  if (!temStorage) return processosIniciais().map((p, i) => normalizar(p, i))
  try {
    const bruto = window.localStorage.getItem(STORAGE_KEY)
    if (!bruto) return semear()
    const dados = JSON.parse(bruto)
    if (!Array.isArray(dados) || !dados.length) return semear()
    return dados.map((p, i) => normalizar(p, i))
  } catch (erro) {
    console.warn('Base localStorage ilegível; recriando com os processos de exemplo.', erro)
    return semear()
  }
}

function semear() {
  const inicial = processosIniciais().map((p, i) => normalizar(p, i))
  gravar(inicial)
  return inicial
}

export function gravar(lista) {
  if (!temStorage) return false
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lista, null, 2))
    return true
  } catch (erro) {
    console.error('Falha ao gravar no localStorage.', erro)
    return false
  }
}

export function restaurarExemplos() {
  const inicial = processosIniciais().map((p, i) => normalizar(p, i))
  gravar(inicial)
  return inicial
}

/** Próximo id sequencial livre. */
export function proximoId(lista) {
  return lista.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1
}

/** Próximo "Nº do processo" livre no padrão E4-XX. */
export function proximoCodigo(lista) {
  const usados = new Set(lista.map((p) => String(p.codigo || '').trim().toUpperCase()))
  let n = 1
  let codigo = `E4-${String(n).padStart(2, '0')}`
  while (usados.has(codigo)) {
    n += 1
    codigo = `E4-${String(n).padStart(2, '0')}`
  }
  return codigo
}

export function processoVazio(lista) {
  const id = proximoId(lista)
  const agora = new Date().toISOString()
  return normalizar(
    {
      id,
      codigo: proximoCodigo(lista),
      assunto: '',
      objetivo: '',
      area: 'Finalísticos',
      processo2: '',
      responsavel: '',
      fluxo: FLUXO_PADRAO,
      secoes: {},
      criadoEm: agora,
      atualizadoEm: agora,
    },
    id - 1,
  )
}

/**
 * Mescla a lista importada com a existente. Processos são considerados iguais
 * pelo par (código, assunto) quando o código existir; caso contrário, por id.
 */
export function mesclar(atual, incoming) {
  const resultado = atual.map((p) => ({ ...p }))
  let adicionados = 0
  let atualizados = 0
  for (const bruto of incoming) {
    const novo = normalizar(bruto)
    const pos = resultado.findIndex(
      (p) =>
        (novo.codigo && p.codigo && novo.codigo.toUpperCase() === p.codigo.toUpperCase()) ||
        (!novo.codigo && Number(p.id) === Number(novo.id)),
    )
    if (pos >= 0) {
      resultado[pos] = { ...resultado[pos], ...novo, id: resultado[pos].id, atualizadoEm: new Date().toISOString() }
      atualizados += 1
    } else {
      resultado.push({ ...novo, id: proximoId(resultado) })
      adicionados += 1
    }
  }
  return { lista: resultado, adicionados, atualizados }
}

/** Interpreta um texto colado como JSON e devolve um array de processos. */
export function interpretarJson(texto) {
  const limpo = String(texto || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  if (!limpo) throw new Error('O conteúdo está vazio.')
  let dados
  try {
    dados = JSON.parse(limpo)
  } catch (erro) {
    throw new Error(`JSON inválido: ${erro.message}`)
  }
  if (Array.isArray(dados)) {
    if (!dados.length) throw new Error('O array está vazio.')
    return dados
  }
  if (dados && Array.isArray(dados.processos)) return dados.processos
  if (dados && typeof dados === 'object') return [dados]
  throw new Error('Formato não reconhecido. Cole um array JSON de processos ou um objeto único.')
}
