# Contribuindo

Obrigado por contribuir. Mantenha as restrições inegociáveis do projeto.

## Regras

1. **100% estático** (HTML/CSS/JS). Sem backend, sem CDN externa, sem rastreadores. Deve funcionar offline.
2. **Nunca** automatizar login, scraping ou envio ao domínio `ase.cmse.eb.mil.br`.
3. **Nenhum dado sensível/real** da OM no repositório. Só modelos de referência.
4. **Não inventar** normas, artigos ou prazos. Onde não houver certeza, marcar “VERIFICAR NA FONTE”.
5. Preservar funcionalidades existentes (zero regressões).

## Fluxo

```bash
git checkout -b minha-melhoria
# editar
npm run dados && npm run validar && npm test
git commit -m "Descrição clara em português"
git push origin minha-melhoria
```

Abra um Pull Request. O CI (`.github/workflows/ci.yml`) roda a geração de JSON, a validação e os testes.

## Onde alterar

- Conteúdo (processos, riscos, indicadores, normas, regimento): `js/gpex-dados.js`.
- Interface/comportamento: `js/gpex-app.js`, `index.html`, `css/gpex.css`.
- Nunca edite `data/*.json` à mão: são gerados por `npm run dados`.

## Ortografia

Texto em português, UTF-8, com acentuação correta e `lang="pt-BR"`. Evite alterar nomes de `id`, `class` e atributos `data-*` (podem quebrar CSS/JS).
