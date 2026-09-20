#!/usr/bin/env node
/*
 * Valida a integridade dos dados do sistema GPEX / E/4.
 * Regras mínimas (falha o CI):
 *  - Todo processo tem: risco, indicador, responsável e fonte.
 *  - Todo risco tem: descrição, causa, consequência, controle e P/I em 1..5.
 *  - Níveis válidos (Baixo/Médio/Alto/Extremo) coerentes com P x I.
 *  - Obrigações do calendário referenciam processos existentes.
 *  - Competências, atribuições, normas e sistemas têm campos obrigatórios.
 * Uso: node scripts/validar-dados.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

global.window = {};
require(path.join(__dirname, '..', 'js', 'gpex-dados.js'));
const DB = global.window.GPEX_E4;

const erros = [];
const avisos = [];
function erro(m) { erros.push(m); }
function aviso(m) { avisos.push(m); }

if (!DB) { console.error('ERRO: GPEX_E4 não carregado.'); process.exit(1); }

const NIVEIS = ['Baixo', 'Médio', 'Alto', 'Extremo'];

// 1) Processos
const ids = new Set();
(DB.processos || []).forEach(function (p) {
  if (!p.id) erro('processo sem id');
  if (ids.has(p.id)) erro('id de processo duplicado: ' + p.id);
  ids.add(p.id);
  if (!p.codigo) erro(p.id + ': sem código');
  if (!p.titulo) erro(p.id + ': sem título');
  if (!p.objetivo) erro(p.id + ': sem objetivo');
  if (!Array.isArray(p.etapas) || !p.etapas.length) erro(p.id + ': sem etapas');
  if (!Array.isArray(p.riscos) || !p.riscos.length) erro(p.id + ': SEM RISCO');
  if (!Array.isArray(p.responsaveis) || !p.responsaveis.length) erro(p.id + ': SEM RESPONSÁVEL');
  if (!Array.isArray(p.fontes) || !p.fontes.length) erro(p.id + ': SEM FONTE');
  const gp = DB.governancaProcessos[p.id];
  if (!gp || !Array.isArray(gp.indicadores) || !gp.indicadores.length) erro(p.id + ': SEM INDICADOR');
  const v = DB.vinculoDe(p.id);
  if (!v.competencia) aviso(p.id + ': sem competência (Art. 3º) vinculada');
});

// 2) Riscos
(DB.todosRiscos ? DB.todosRiscos() : []).forEach(function (r) {
  ['descricao', 'causa', 'consequencia', 'controle'].forEach(function (k) {
    if (!r[k]) erro(r.id + ': risco sem ' + k);
  });
  if (!(r.probabilidade >= 1 && r.probabilidade <= 5)) erro(r.id + ': probabilidade inválida');
  if (!(r.impacto >= 1 && r.impacto <= 5)) erro(r.id + ': impacto inválido');
  if (NIVEIS.indexOf(r.nivel) === -1) erro(r.id + ': nível inválido (' + r.nivel + ')');
  const esperado = DB.nivelRisco(r.probabilidade, r.impacto).nome;
  if (esperado !== r.nivel) erro(r.id + ': nível incoerente com P x I (' + r.nivel + ' != ' + esperado + ')');
});

// 3) Calendário
(DB['calendario'] || []).forEach(function (c, i) {
  if (!c.obrigacao) erro('calendario[' + i + ']: sem obrigação');
  if (!c.periodicidade) erro('calendario[' + i + ']: sem periodicidade');
  if (c.processo && !ids.has(c.processo)) erro('calendario[' + i + ']: processo inexistente ' + c.processo);
});

// 4) Regimento
const reg = DB.regimento || {};
if (!reg.competencias || !reg.competencias.length) erro('regimento sem competências');
if (!reg.atribuicoes || !reg.atribuicoes.length) erro('regimento sem atribuições');
(reg.competencias || []).forEach(function (c) { if (!c.inciso || !c.texto) erro('competência incompleta'); });

// 5) Normas / fontes / sistemas
(DB.normas || []).forEach(function (n) { if (!n.codigo || !n.titulo) erro('norma sem código/título'); if (!n.url && !n.verificar) aviso('norma sem link oficial: ' + n.codigo); });
(DB.fontes || []).forEach(function (f) { if (!f.nome) erro('fonte sem nome'); });
(DB.sistemas || []).forEach(function (s) { if (!s.sigla || !s.nome) erro('sistema sem sigla/nome'); });

// 6) JSON derivado (se existir, conferir que processa)
const dataDir = path.join(__dirname, '..', 'data');
if (fs.existsSync(dataDir)) {
  ['processos.json', 'riscos.json', 'regimento.json', 'calendario.json'].forEach(function (arq) {
    const f = path.join(dataDir, arq);
    if (!fs.existsSync(f)) { aviso('data/' + arq + ' ausente (rode npm run dados)'); return; }
    try { JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { erro('data/' + arq + ' inválido: ' + e.message); }
  });
}

// Saída
avisos.forEach(function (a) { console.warn('AVISO: ' + a); });
if (erros.length) {
  console.error('\nFALHA na validação (' + erros.length + ' erro(s)):');
  erros.forEach(function (e) { console.error(' - ' + e); });
  process.exit(1);
}
console.log('OK: dados válidos (' + DB.processos.length + ' processos, ' + DB.todosRiscos().length + ' riscos).');
