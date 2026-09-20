#!/usr/bin/env node
/*
 * Exporta os dados de js/gpex-dados.js para /data/*.json.
 * Uso: node scripts/exportar-dados.js
 * Fonte única de verdade do runtime continua sendo js/gpex-dados.js (offline-safe).
 */
'use strict';

const fs = require('fs');
const path = require('path');

global.window = {};
require(path.join(__dirname, '..', 'js', 'gpex-dados.js'));
const DB = global.window.GPEX_E4;

if (!DB) {
  console.error('ERRO: GPEX_E4 não carregado de js/gpex-dados.js');
  process.exit(1);
}

const outDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(outDir, { recursive: true });

function escrever(nome, obj) {
  fs.writeFileSync(path.join(outDir, nome), JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

escrever('meta.json', { meta: DB.meta, escala: DB.escala, riscoEB10: DB.riscoEB10 });
escrever('processos.json', DB.processos);
escrever('riscos.json', DB.todosRiscos());
escrever('regimento.json', DB.regimento);
escrever('governanca.json', { governanca: DB.governanca, governancaProcessos: DB.governancaProcessos, marcosModelo: DB.marcosModelo });
escrever('normas.json', DB.normas);
escrever('fontes.json', DB.fontes);
escrever('doutrina.json', DB.doutrina);
escrever('sistemas.json', DB.sistemas);
escrever('calendario.json', DB['calendario']);
escrever('combustivel.json', DB.combustivel);
escrever('tratamento-risco.json', DB.tratamentoRisco);

console.log('OK: dados exportados para /data (' + fs.readdirSync(outDir).length + ' arquivos).');
