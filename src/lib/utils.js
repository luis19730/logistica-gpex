// Utilidades de área de transferência e de download de arquivos.
// Tudo com fallback: a API Clipboard exige contexto seguro (https), então há
// um caminho alternativo via textarea + execCommand.
export async function copiarTexto(texto) {
  const conteudo = String(texto ?? '')
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(conteudo)
      return true
    } catch {
      /* cai no fallback */
    }
  }
  try {
    const area = document.createElement('textarea')
    area.value = conteudo
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

export function baixarArquivo(nomeArquivo, conteudo, tipo = 'application/json') {
  const blob = new Blob([conteudo], { type: `${tipo};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function hoje() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function carimboDeData() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

function celula(valor) {
  const s = String(valor == null ? '' : valor).replace(/\r?\n/g, ' ').trim()
  return `"${s.replace(/"/g, '""')}"`
}

export const COLUNAS_CSV = [
  { chave: 'logo', titulo: 'LOGO (OM)' },
  { chave: 'aprovSecao', titulo: 'APROV. SEÇÃO' },
  { chave: 'aprovGestao', titulo: 'APROV. ASS. GESTÃO' },
  { chave: 'id', titulo: 'ID DO PROCESSO' },
  { chave: 'om', titulo: 'ORGANIZAÇÃO MILITAR' },
  { chave: 'assunto', titulo: 'ASSUNTO (PROCESSO 3º NÍVEL)' },
  { chave: 'objetivo', titulo: 'OBJETIVOS DO PROCESSO' },
  { chave: 'area', titulo: 'ÁREA' },
  { chave: 'macroprocesso', titulo: 'MACROPROCESSO 1º NÍVEL' },
  { chave: 'processo2', titulo: 'PROCESSO 2º NÍVEL' },
  { chave: 'codigo', titulo: 'Nº DO PROCESSO' },
  { chave: 'responsavel', titulo: 'RESPONSÁVEL' },
]

/** Valor legível de um processo para uma coluna da tabela. */
export function valorColuna(p, chave) {
  switch (chave) {
    case 'logo':
      return p.secao
    case 'aprovSecao':
      return p.aprovSecao ? 'Sim' : 'Não'
    case 'aprovGestao':
      return p.aprovGestao ? 'Sim' : 'Não'
    default:
      return p[chave] == null ? '' : p[chave]
  }
}

export function paraCsv(lista) {
  const cabecalho = COLUNAS_CSV.map((c) => celula(c.titulo)).join(';')
  const linhas = lista.map((p) => COLUNAS_CSV.map((c) => celula(valorColuna(p, c.chave))).join(';'))
  return `﻿${[cabecalho, ...linhas].join('\r\n')}`
}

export function paraTsv(lista) {
  return lista
    .map((p) => COLUNAS_CSV.map((c) => String(valorColuna(p, c.chave)).replace(/\t/g, ' ')).join('\t'))
    .join('\n')
}
