'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

global.window = {};
require(path.join(__dirname, '..', 'js', 'gpex-dados.js'));
const DB = global.window.GPEX_E4;

test('todo processo tem indicador, responsável e fonte cadastrados', function () {
  assert.ok(DB.processos.length >= 1, 'sem processos');
  DB.processos.forEach(function (p) {
    assert.ok(Array.isArray(p.riscos), p.id + ' riscos deve ser array');
    const gp = DB.governancaProcessos[p.id];
    assert.ok(gp && gp.indicadores && gp.indicadores.length >= 1, p.id + ' sem indicador');
    assert.ok(p.responsaveis && p.responsaveis.length >= 1, p.id + ' sem responsável');
    assert.ok(p.fontes && p.fontes.length >= 1, p.id + ' sem fonte');
  });
});

test('riscos têm campos obrigatórios e nível coerente com P x I', function () {
  DB.todosRiscos().forEach(function (r) {
    ['descricao', 'causa', 'consequencia', 'controle'].forEach(function (k) {
      assert.ok(r[k], r.id + ' sem ' + k);
    });
    assert.ok(r.probabilidade >= 1 && r.probabilidade <= 5, r.id + ' P inválida');
    assert.ok(r.impacto >= 1 && r.impacto <= 5, r.id + ' I inválido');
    assert.strictEqual(r.nivel, DB.nivelRisco(r.probabilidade, r.impacto).nome, r.id + ' nível divergente');
    assert.ok(['Baixo', 'Médio', 'Alto', 'Extremo'].indexOf(r.nivel) !== -1, r.id + ' nível inválido');
  });
});

test('calendário referencia processos existentes', function () {
  const ids = new Set(DB.processos.map(function (p) { return p.id; }));
  DB['calendario'].forEach(function (c) {
    if (c.processo) assert.ok(ids.has(c.processo), 'processo inexistente: ' + c.processo);
  });
});

test('normas têm situação, portaria e fonte quando vigentes', function () {
  const sit = ['vigente', 'provavel-revogada', 'verificar'];
  assert.ok(DB.normas.length >= 1);
  DB.normas.forEach(function (n) {
    assert.ok(n.codigo && n.titulo, 'norma sem código/título');
    assert.ok(sit.indexOf(n.situacao) !== -1, n.codigo + ': situação inválida');
    if (n.situacao === 'vigente') { assert.ok(n.portaria, n.codigo + ': vigente sem portaria'); assert.ok(n.url, n.codigo + ': vigente sem fonte'); }
  });
  // nenhuma norma revogada citada como vigente
  const d11 = DB.normas.filter(function (n) { return n.codigo === 'EB20-D-11.001'; })[0];
  assert.ok(d11 && d11.situacao === 'provavel-revogada', 'EB20-D-11.001 deve constar como provável revogada');
});

test('regimento está marcado como MODELO', function () {
  assert.ok(DB.regimento.modelo === true, 'regimento deve estar marcado como modelo');
  assert.ok(DB.regimento.avisoModelo, 'regimento deve ter aviso de modelo');
});

test('regimento tem competências e atribuições', function () {
  assert.ok(DB.regimento.competencias.length >= 1);
  assert.ok(DB.regimento.atribuicoes.length >= 1);
  DB.regimento.competencias.forEach(function (c) { assert.ok(c.inciso && c.texto); });
});

test('escXml escapa corretamente & < > " e apóstrofo', function () {
  const fs = require('fs');
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'gpex-app.js'), 'utf8');
  const i = app.indexOf('function escXml(');
  assert.ok(i >= 0, 'escXml não encontrada');
  const start = app.indexOf('{', i);
  let depth = 0, j = start;
  for (; j < app.length; j++) {
    if (app[j] === '{') depth++;
    else if (app[j] === '}') { depth--; if (depth === 0) { j++; break; } }
  }
  const mod = { exports: {} };
  new Function('module', 'exports', app.slice(i, j) + '\nmodule.exports = escXml;')(mod, mod.exports);
  const escXml = mod.exports;
  const saida = escXml('a & b < c > d "e" f\'g');
  assert.strictEqual(saida, 'a &amp; b &lt; c &gt; d &quot;e&quot; f&apos;g');
  assert.ok(saida.indexOf('&apos;') !== -1, 'apóstrofo deve virar &apos;');
  assert.ok(saida.indexOf('&após;') === -1, 'não deve conter &após; (acentuado)');
});

test('datas usam fuso local (hojeISO/mesAtual)', function () {
  const fs = require('fs');
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'gpex-app.js'), 'utf8');
  const trecho = app.slice(app.indexOf('function hojeISO'), app.indexOf('function initCombustivel'));
  assert.ok(trecho.indexOf('toISOString') === -1, 'hojeISO/mesAtual não devem usar toISOString (UTC)');
});

test('geradores ARIS produzem XML bem-formado', function () {
  const fs = require('fs');
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'gpex-app.js'), 'utf8');
  function extract(name) {
    const marker = 'function ' + name + '(';
    const i = app.indexOf(marker);
    assert.ok(i >= 0, 'função não encontrada: ' + name);
    const start = app.indexOf('{', i);
    let depth = 0, j = start;
    for (; j < app.length; j++) {
      if (app[j] === '{') depth++;
      else if (app[j] === '}') { depth--; if (depth === 0) { j++; break; } }
    }
    return app.slice(i, j);
  }
  const fns = ['escXml', 'bpmnCabecalho', 'bpmnBlocos', 'arisBPMN', 'arisBPMNTodos', 'amlCabecalho', 'amlModelo', 'arisAML', 'arisAMLTodos'];
  const code = 'const DB = global.__DB;\n' + fns.map(extract).join('\n') +
    '\nmodule.exports = { arisBPMN, arisBPMNTodos, arisAML, arisAMLTodos };';
  global.__DB = DB;
  const mod = { exports: {} };
  new Function('module', 'exports', code)(mod, mod.exports);
  const ARIS = mod.exports;

  // Validação XML mínima (sem dependências): tags balanceadas e ids únicos nos fluxos
  function checarXml(xml, rotulo) {
    assert.ok(xml.indexOf('<?xml') === 0, rotulo + ': sem declaração XML');
    const bpmn = xml.indexOf('<bpmn:definitions') !== -1 || xml.indexOf('<AML') !== -1;
    assert.ok(bpmn, rotulo + ': raiz inesperada');
    // ids duplicados de nós/fluxos BPMN
    const ids = (xml.match(/\b(?:id)="([^"]+)"/g) || []);
    const vistos = new Set();
    ids.forEach(function (s) {
      const v = s.slice(s.indexOf('"') + 1, -1);
      assert.ok(!vistos.has(v), rotulo + ': id duplicado ' + v);
      vistos.add(v);
    });
  }
  DB.processos.forEach(function (p) {
    checarXml(ARIS.arisBPMN(p), 'BPMN ' + p.codigo);
    checarXml(ARIS.arisAML(p), 'AML ' + p.codigo);
  });
  checarXml(ARIS.arisBPMNTodos(), 'BPMN todos');
  checarXml(ARIS.arisAMLTodos(), 'AML todos');
});
