// Executa scripts/smoke.jsx empacotando-o com esbuild, porque o Node não
// entende JSX. Mantido separado do app: nada aqui entra no bundle do site.
//   node scripts/smoke.mjs
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const raiz = process.cwd()
// Fica dentro do projeto para que o Node resolva 'react' pelos node_modules
// locais; um bundle em %TEMP% não acharia as dependências.
const pasta = join(raiz, 'node_modules', '.cache', 'gpex-smoke')
const destino = join(pasta, 'smoke.mjs')
mkdirSync(pasta, { recursive: true })

try {
  await build({
    entryPoints: [join(raiz, 'scripts', 'smoke.jsx')],
    outfile: destino,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    logLevel: 'error',
    loader: { '.js': 'jsx', '.jsx': 'jsx', '.css': 'empty' },
    external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom'],
    jsx: 'automatic',
    absWorkingDir: raiz,
  })
} catch (erro) {
  console.error('Falha ao empacotar o smoke test:', erro.message)
  process.exit(1)
}

// Stubs de browser: definidos ANTES do import do bundle (imports ESM são
// içados, por isso a atribuição precisa vir no módulo que faz o import). O app
// só precisa de localStorage para montar a árvore inicial.
const memoria = () => {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  }
}
globalThis.localStorage = memoria()
globalThis.sessionStorage = memoria()
globalThis.location = { href: 'http://localhost/', pathname: '/', origin: 'http://localhost', search: '', hash: '' }
globalThis.history = { replaceState() {}, pushState() {} }
globalThis.isSecureContext = false

// react-router chama useLayoutEffect, que não existe em renderização estática.
// O aviso é esperado e não indica problema no app; qualquer outro erro passa.
const erroOriginal = console.error
console.error = (...args) => {
  if (String(args[0] || '').includes('useLayoutEffect does nothing on the server')) return
  erroOriginal(...args)
}

try {
  await import(pathToFileURL(destino).href)
} finally {
  rmSync(pasta, { recursive: true, force: true })
}
