export const OM = 'Cmdo Bda Inf Amv'
export const SECAO = 'E/4'
export const PADRAO = 'EPOEx.FR001.00'
export const TITULO = 'MAPEAMENTO DE PROCESSOS — GPEX'
export const SUBTITULO = `4ª Seção / Logística · Padrão ${PADRAO}`
export const BASE = '/logistica-gpex/'

// Combos preparedos para outras seções no futuro.
export const OPCOES_SECAO = [SECAO]
export const OPCOES_OM = [OM]

export const AREAS = ['Gerenciais', 'Finalísticos', 'Suporte']

export const MACROPROCESSO = '1.4 LOGÍSTICA'

export const APROVACAO = ['Todas', 'Aprovado', 'Não aprovado']

export const STORAGE_KEY = 'gpex.e4.processos.v1'
export const STORAGE_PREF = 'gpex.e4.'

// As 11 seções textuais da Folha de Dados do Processo. A 12ª (Fluxograma) é
// editada em bloco próprio porque tem editor e renderizador próprios.
export const SECOES_FICHA = [
  { chave: 'objetivos', numero: 1, titulo: 'Objetivos' },
  { chave: 'siglas', numero: 2, titulo: 'Siglas e definições' },
  { chave: 'campoAplicacao', numero: 3, titulo: 'Campo de aplicação' },
  { chave: 'responsabilidades', numero: 4, titulo: 'Responsabilidades' },
  { chave: 'limites', numero: 5, titulo: 'Limites (fornecedores e clientes)' },
  { chave: 'documentos', numero: 6, titulo: 'Documentos de referência' },
  { chave: 'descricao', numero: 7, titulo: 'Descrição do processo' },
  { chave: 'competencias', numero: 8, titulo: 'Competências necessárias' },
  { chave: 'registros', numero: 9, titulo: 'Registros gerados' },
  { chave: 'riscos', numero: 10, titulo: 'Pontos de alerta e riscos' },
  { chave: 'controles', numero: 11, titulo: 'Controles, ambientais e infraestrutura' },
  { chave: 'fluxograma', numero: 12, titulo: 'Fluxograma' },
]

export const FLUXO_PADRAO = ['s|Início do processo', 't|Executar a atividade', 'e|Fim do processo'].join('\n')
