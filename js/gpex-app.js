/* GPEX / Gestao de Riscos - E/4 | aplicacao (vanilla JS) */
(function () {
  "use strict";

  var DB = window.GPEX_E4;
  if (!DB) { console.error("Base GPEX nao carregada."); return; }

  var MATRIZ_FILTRO = null;
  var PROC_ATUAL = null;

  /* ---------------- utilidades ---------------- */
  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function mmLabel(s) {
    return String(s == null ? "" : s).replace(/"/g, "'").replace(/\n/g, " ").trim();
  }

  function nivelTag(n) {
    var cor = { "Baixo": "verde", "Médio": "amarelo", "Alto": "laranja", "Extremo": "vermelho" }[n] || "cinza";
    return '<span class="tag ' + cor + '">' + esc(n) + "</span>";
  }

  function copiarTexto(txt, btn) {
    function ok() { if (btn) { var o = btn.textContent; btn.textContent = "Copiado!"; setTimeout(function () { btn.textContent = o; }, 1500); } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok).catch(function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { alert("Nao foi possivel copiar."); }
      document.body.removeChild(ta);
    }
  }

  /* ---------------- abas ---------------- */
  document.querySelectorAll(".gpex-aba").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".gpex-aba").forEach(function (x) { x.classList.remove("active"); });
      document.querySelectorAll(".painel").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      $("painel-" + b.getAttribute("data-painel")).classList.add("active");
    });
  });

  /* ---------------- Mermaid ---------------- */
  var mermaidPronto = false;
  function initMermaid() {
    if (mermaidPronto || typeof window.mermaid === "undefined") return;
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base",
      fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
      themeVariables: {
        primaryColor: "#eef3df",
        primaryTextColor: "#2f3a1e",
        primaryBorderColor: "#6b8e23",
        lineColor: "#6b8e23",
        secondaryColor: "#f5f7ee",
        tertiaryColor: "#fbfcf6",
        mainBkg: "#eef3df",
        nodeBorder: "#6b8e23",
        clusterBkg: "#f7faf0"
      },
      flowchart: { useMaxWidth: true, htmlLabels: true }
    });
    mermaidPronto = true;
  }
  function renderMermaid(pre, code) {
    if (!pre) return;
    pre.removeAttribute("data-processed");
    pre.textContent = code;
    if (typeof window.mermaid === "undefined") { return; }
    initMermaid();
    try {
      var out = window.mermaid.run ? window.mermaid.run({ nodes: [pre] }) : null;
      if (out && out.catch) out.catch(function () { pre.textContent = code; });
    } catch (e) { pre.textContent = code; }
  }

  function mmFluxoProcesso(proc) {
    var l = ["flowchart TD", '  I(["Inicio"])'];
    var ant = "I";
    proc.etapas.forEach(function (et, i) {
      var id = "E" + (i + 1);
      l.push('  ' + ant + ' --> ' + id + '["' + (i + 1) + ". " + mmLabel(et) + '"]');
      ant = id;
    });
    l.push('  ' + ant + ' --> D{"Risco identificado?"}');
    l.push('  D -- "Sim" --> RT["Aplicar tratamento de risco em 5 etapas"]');
    l.push('  D -- "Nao" --> F(["Fim"])');
    l.push("  RT --> F");
    return l.join("\n");
  }

  function mmFluxoTratamento() {
    var l = ["flowchart LR"];
    DB.tratamentoRisco.forEach(function (t, i) {
      var id = "R" + (i + 1);
      l.push('  ' + id + '["' + mmLabel(t.etapa) + '"]');
      if (i > 0) l.push("  R" + i + " --> " + id);
    });
    l.push("  R" + DB.tratamentoRisco.length + ' --> M["Monitoramento continuo"]');
    l.push('  M -. "Reavaliar" .-> R2');
    return l.join("\n");
  }

  /* ---------------- VISaO GERAL ---------------- */
  function initVisao() {
    var riscos = DB.todosRiscos();
    var altos = riscos.filter(function (r) { return r.nivel === "Alto" || r.nivel === "Extremo"; });
    var media = riscos.length ? (riscos.reduce(function (a, r) { return a + r.valor; }, 0) / riscos.length) : 0;

    $("cardsVisao").innerHTML = [
      card("Processos mapeados", DB.processos.length, "Tarefas da Secao de Logistica"),
      card("Riscos identificados", riscos.length, "Com causa, consequencia e controle"),
      card("Riscos Alto/Extremo", altos.length, "Tratamento prioritário (EB10-P-01.004)", altos.length ? "var(--red)" : "var(--green)"),
      card("Classes de suprimento", DB.classes.length, "I a X"),
      card("Obrigacoes periodicas", DB.calendario.length, "Calendario do E/4"),
      card("Nivel medio (P x I)", media.toFixed(1), "Escala de 1 a 25", "var(--yellow)")
    ].join("");

    var cont = { "Baixo": 0, "Médio": 0, "Alto": 0, "Extremo": 0 };
    riscos.forEach(function (r) { cont[r.nivel]++; });
    $("distRiscos").innerHTML = DB.escala.map(function (e) {
      var q = cont[e.nome] || 0;
      var pct = riscos.length ? Math.round((q / riscos.length) * 100) : 0;
      return '<div style="margin-bottom:12px;">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">' +
        '<span>' + nivelTag(e.nome) + ' <span style="color:var(--text-muted);">(' + e.min + "-" + e.max + ')</span></span>' +
        '<span style="color:var(--text-secondary);">' + q + " risco(s) - " + pct + "%</span></div>" +
        '<div class="barra"><span class="' + (e.cor === "amarelo" ? "alerta" : e.cor === "vermelho" || e.cor === "laranja" ? "excesso" : "") +
        '" style="width:' + pct + '%;background:' + (e.cor === "verde" ? "var(--green)" : e.cor === "amarelo" ? "var(--yellow)" : e.cor === "laranja" ? "var(--orange)" : "var(--red)") + ';"></span></div></div>';
    }).join("") + '<p class="sub" style="margin-top:14px;">' + esc(DB.escala.map(function (e) { return e.nome + ": " + e.acao; }).join("  |  ")) + "</p>";

    var pri = altos.slice().sort(function (a, b) { return b.valor - a.valor; });
    $("tbodyPrioritarios").innerHTML = pri.length ? pri.map(function (r) {
      return "<tr><td>" + esc(r.processo) + "</td><td>" + esc(r.descricao) + "</td><td>" + r.probabilidade +
        "</td><td>" + r.impacto + "</td><td>" + nivelTag(r.nivel) + "</td><td>" + esc(r.controle) + "</td></tr>";
    }).join("") : '<tr><td colspan="6" class="vazio">Nenhum risco Alto/Extremo.</td></tr>';

    renderMermaid($("mermaidTratamento"), mmFluxoTratamento());

    function card(label, valor, sub, cor) {
      return '<div class="mini"><div class="label">' + esc(label) + '</div><div class="valor"' +
        (cor ? ' style="color:' + cor + '"' : "") + ">" + esc(valor) + '</div><div class="sub">' + esc(sub) + "</div></div>";
    }
  }

  /* ---------------- PROCESSOS ---------------- */
  function initProcessos() {
    var areas = [], classes = [];
    DB.processos.forEach(function (p) {
      if (areas.indexOf(p.area) === -1) areas.push(p.area);
      p.classes.forEach(function (c) { if (classes.indexOf(c) === -1) classes.push(c); });
    });
    areas.sort(); classes.sort();

    $("filtroArea").innerHTML = '<option value="">Todas as areas</option>' + areas.map(function (a) { return '<option>' + esc(a) + "</option>"; }).join("");
    $("filtroClasse").innerHTML = '<option value="">Todas as classes</option>' + classes.map(function (c) { return '<option>' + esc(c) + "</option>"; }).join("");

    ["buscaProc", "filtroArea", "filtroClasse", "filtroNivel"].forEach(function (id) { $(id).addEventListener("input", renderListaProc); });
    renderListaProc();
  }

  function procNiveis(p) {
    return p.riscos.map(function (r) { return DB.nivelRisco(r.probabilidade, r.impacto).nome; });
  }

  function renderListaProc() {
    var q = ($("buscaProc").value || "").toLowerCase();
    var area = $("filtroArea").value;
    var classe = $("filtroClasse").value;
    var nivel = $("filtroNivel").value;

    var lista = DB.processos.filter(function (p) {
      if (area && p.area !== area) return false;
      if (classe && p.classes.indexOf(classe) === -1) return false;
      if (nivel && procNiveis(p).indexOf(nivel) === -1) return false;
      if (q) {
        var blob = (p.titulo + " " + p.objetivo + " " + p.area + " " + p.etapas.join(" ") + " " +
          p.riscos.map(function (r) { return r.descricao + " " + r.causa + " " + r.consequencia; }).join(" ")).toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });

    $("listaProcessos").innerHTML = lista.length ? lista.map(function (p) {
      var niveis = procNiveis(p);
      var pior = ["Extremo", "Alto", "Médio", "Baixo"].filter(function (n) { return niveis.indexOf(n) !== -1; })[0] || "Baixo";
      var tags = p.classes.length ? p.classes.map(function (c) { return '<span class="tag cinza">Classe ' + esc(c) + "</span>"; }).join(" ") : '<span class="tag cinza">Sem classe</span>';
      return '<div class="proc-item' + (PROC_ATUAL === p.id ? " active" : "") + '" data-id="' + p.id + '">' +
        '<div class="cod">' + esc(p.codigo) + " - " + esc(p.area) + "</div>" +
        '<div class="tit">' + esc(p.titulo) + '</div>' +
        '<div class="meta">' + tags + " " + nivelTag(pior) +
        '<span class="tag cinza">' + p.riscos.length + " risco(s)</span></div></div>";
    }).join("") : '<div class="card"><div class="vazio">Nenhum processo encontrado.</div></div>';

    $("listaProcessos").querySelectorAll(".proc-item").forEach(function (el) {
      el.addEventListener("click", function () { abrirProcesso(el.getAttribute("data-id")); });
    });

    if (PROC_ATUAL) {
      var ainda = lista.some(function (p) { return p.id === PROC_ATUAL; });
      if (ainda) { abrirProcesso(PROC_ATUAL, true); } else { PROC_ATUAL = null; }
    }
  }

  function abrirProcesso(id, silencioso) {
    PROC_ATUAL = id;
    if (!silencioso) {
      document.querySelectorAll(".proc-item").forEach(function (e) { e.classList.toggle("active", e.getAttribute("data-id") === id); });
    }
    var p = DB.processos.filter(function (x) { return x.id === id; })[0];
    if (!p) return;

    var gp = DB.governancaProcessos[p.id] || { tarefa: p.titulo, indicadores: [] };
    var respPadrao = (p.responsaveis && p.responsaveis.length) ? p.responsaveis[0] : "E/4";
    var riscosHtml = p.riscos.map(function (r) {
      var n = DB.nivelRisco(r.probabilidade, r.impacto);
      return '<div class="risco-card b-' + n.cor + '">' +
        '<div class="rc-top"><span class="rc-tit">' + esc(r.descricao) + "</span><span>" + nivelTag(n.nome) +
        ' <span class="tag cinza">P ' + r.probabilidade + " x I " + r.impacto + " = " + (r.probabilidade * r.impacto) + "</span></span></div>" +
        "<dl><dt>Causa</dt><dd>" + esc(r.causa) + "</dd>" +
        "<dt>Consequência</dt><dd>" + esc(r.consequencia) + "</dd>" +
        "<dt>Probabilidade</dt><dd>" + r.probabilidade + " - " + esc(DB.probabilidadeRotulo(r.probabilidade)) + " (" + esc(DB.riscoEB10.probabilidade[r.probabilidade - 1].descricao) + ")</dd>" +
        "<dt>Impacto</dt><dd>" + r.impacto + " - " + esc(DB.impactoRotulo(r.impacto)) + " (" + esc(DB.riscoEB10.impacto[r.impacto - 1].descricao) + ")</dd>" +
        "<dt>Controle / Mitigação</dt><dd>" + esc(r.controle) + "</dd>" +
        "<dt>Resposta (EB10)</dt><dd><strong>" + esc(DB.respostaPara(n.nome)) + "</strong> - " + esc(DB.prazoPara(n.nome)) + " | Responsável: " + esc(respPadrao) + "</dd>" +
        "<dt>Categoria</dt><dd>" + esc(DB.categoriaDe(p.area)) + "</dd>" +
        "<dt>Indicador</dt><dd>" + esc((gp.indicadores && gp.indicadores.length) ? gp.indicadores[0] : "Monitorar indicadores do processo") + "</dd></dl></div>";
    }).join("");

    var hierarquiaHtml = [
      ["Portfólio", DB.governanca.portfolio],
      ["Programa", DB.governanca.programa],
      ["Macroprocesso", DB.governanca.macroprocesso],
      ["Processo", p.codigo + " - " + p.titulo],
      ["Tarefa (nomenclatura)", gp.tarefa || p.titulo]
    ].map(function (x) { return "<dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd>"; }).join("");
    var indicadoresHtml = (gp.indicadores && gp.indicadores.length)
      ? gp.indicadores.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("")
      : "<li>Definir indicador de desempenho do processo.</li>";

    var html = '<div class="card">' +
      '<div class="detalhe-topo"><div><div class="cod">' + esc(p.codigo) + " - " + esc(p.area) + '</div><h2>' + esc(p.titulo) + "</h2></div>" +
      '<div>' + (p.classes.length ? p.classes.map(function (c) { return '<span class="tag">Classe ' + esc(c) + "</span>"; }).join(" ") : "") + "</div></div>" +
      '<div class="linha-acoes">' +
      '<button class="btn btn-sm" data-exp="dados">Copiar dados do processo</button>' +
      '<button class="btn btn-sm" data-exp="etapas">Copiar etapas</button>' +
      '<button class="btn btn-sm" data-exp="fluxo">Copiar fluxo (Mermaid)</button>' +
      '<button class="btn btn-sm" data-exp="matriz">Copiar matriz de riscos</button>' +
      '<button class="btn btn-sm btn-primary" data-exp="resumo">Copiar resumo completo (ASE)</button>' +
      "</div>" +
      "<h3>Objetivo</h3><p style=\"font-size:13px;color:var(--text-secondary);\">" + esc(p.objetivo) + "</p>" +
      '<h3>Hierarquia GPEX / Governança (EB20-D-11.001)</h3><dl class="hierarquia">' + hierarquiaHtml + "</dl>" +
      '<h3>Indicadores de desempenho</h3><ul class="lista-simples">' + indicadoresHtml + "</ul>" +
      "<h3>Responsáveis</h3><p style=\"font-size:13px;color:var(--text-secondary);\">" + esc(p.responsaveis.join("; ")) + "</p>" +
      "<h3>Etapas do processo</h3><ol class=\"etapas\">" + p.etapas.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ol>" +
      "<h3>Fluxograma do processo (Mermaid / base BPMN)</h3>" +
      '<div class="mermaid-box"><pre class="mermaid" id="mmProc"></pre></div>' +
      "<h3>Riscos e controles</h3>" + riscosHtml +
      "<h3>Fluxograma de tratamento do risco</h3>" +
      '<div class="mermaid-box"><pre class="mermaid" id="mmRisco"></pre></div>' +
      "<h3>Fontes do mapeamento</h3><p style=\"font-size:12.5px;color:var(--text-secondary);\">" + esc(p.fontes.join("; ")) + "</p>" +
      "</div>";

    $("detalheProcesso").innerHTML = html;
    renderMermaid($("mmProc"), mmFluxoProcesso(p));
    renderMermaid($("mmRisco"), mmFluxoTratamento());

    $("detalheProcesso").querySelectorAll("[data-exp]").forEach(function (b) {
      b.addEventListener("click", function () { copiarTexto(exportar(b.getAttribute("data-exp"), p), b); });
    });
  }

  /* ---------------- exportacao de texto (para o ASE) ---------------- */
  function textoDados(p) {
    var gp = DB.governancaProcessos[p.id] || { tarefa: p.titulo, indicadores: [] };
    return "DADOS DO PROCESSO\n" +
      "Codigo: " + p.codigo + "\n" +
      "Titulo: " + p.titulo + "\n" +
      "Tarefa (Verbo + Objeto + Complemento): " + (gp.tarefa || p.titulo) + "\n" +
      "Area: " + p.area + "\n" +
      "Portfolio: " + DB.governanca.portfolio + "\n" +
      "Programa: " + DB.governanca.programa + "\n" +
      "Macroprocesso: " + DB.governanca.macroprocesso + "\n" +
      "Classes de suprimento: " + (p.classes.length ? p.classes.join(", ") : "Nao aplicavel") + "\n" +
      "Objetivo: " + p.objetivo + "\n" +
      "Responsaveis: " + p.responsaveis.join("; ") + "\n" +
      "Indicadores: " + ((gp.indicadores && gp.indicadores.length) ? gp.indicadores.join("; ") : "Definir") + "\n" +
      "Fonte: " + p.fontes.join("; ");
  }
  function textoEtapas(p) {
    return "ETAPAS DO PROCESSO - " + p.codigo + "\n" +
      p.etapas.map(function (e, i) { return (i + 1) + ". " + e; }).join("\n");
  }
  function textoFluxo(p) {
    return "FLUXO DO PROCESSO - " + p.codigo + " (Mermaid)\n\n" + mmFluxoProcesso(p);
  }
  function textoMatriz(p) {
    var gp = DB.governancaProcessos[p.id] || { indicadores: [] };
    var respPadrao = (p.responsaveis && p.responsaveis.length) ? p.responsaveis[0] : "E/4";
    var linhas = ["MATRIZ DE RISCOS (EB10-P-01.004) - " + p.codigo + " - " + p.titulo, ""];
    p.riscos.forEach(function (r, i) {
      var n = DB.nivelRisco(r.probabilidade, r.impacto);
      linhas.push("Risco " + (i + 1) + ": " + r.descricao);
      linhas.push("  Categoria: " + DB.categoriaDe(p.area));
      linhas.push("  Causa: " + r.causa);
      linhas.push("  Consequência: " + r.consequencia);
      linhas.push("  Probabilidade: " + r.probabilidade + " - " + DB.probabilidadeRotulo(r.probabilidade));
      linhas.push("  Impacto: " + r.impacto + " - " + DB.impactoRotulo(r.impacto));
      linhas.push("  Nível de risco (P x I): " + n.nome + " (" + (r.probabilidade * r.impacto) + ")");
      linhas.push("  Controle/Mitigação: " + r.controle);
      linhas.push("  Resposta: " + DB.respostaPara(n.nome) + " | Prazo: " + DB.prazoPara(n.nome) + " | Responsável: " + respPadrao);
      linhas.push("  Indicador: " + ((gp.indicadores && gp.indicadores.length) ? gp.indicadores[0] : "Monitorar indicadores do processo"));
      linhas.push("");
    });
    return linhas.join("\n");
  }
  function textoResumo(p) {
    return "============================================\n" +
      "MAPEAMENTO DE PROCESSO - GPEX / E4\n" +
      "============================================\n\n" +
      textoDados(p) + "\n\n" +
      textoEtapas(p) + "\n\n" +
      textoMatriz(p) +
      "TRATAMENTO DO RISCO (fluxo padrao EME)\n" +
      DB.tratamentoRisco.map(function (t) { return "  " + t.etapa + " - " + t.descricao; }).join("\n") + "\n\n" +
      "FLUXO (Mermaid - colar no ASE/ARIS como referencia)\n\n" + mmFluxoProcesso(p) + "\n\n" +
      "--------------------------------------------\n" +
      "Escala de risco (EB10-P-01.004): 1-4 Baixo | 5-9 Médio | 10-14 Alto | 15-25 Extremo\n" +
      "Respostas: Evitar | Reduzir | Compartilhar | Aceitar\n" +
      "Normas: " + DB.riscoEB10.base + "\n" +
      "Fonte: " + DB.meta.metodologia + "\n" +
      "Gerado em: " + new Date().toLocaleString("pt-BR") + "\n" +
      "VALIDACAO HUMANA OBRIGATORIA ANTES DE PUBLICAR NO ASE.\n" +
      "============================================";
  }
  function exportar(tipo, p) {
    if (tipo === "dados") return textoDados(p);
    if (tipo === "etapas") return textoEtapas(p);
    if (tipo === "fluxo") return textoFluxo(p);
    if (tipo === "matriz") return textoMatriz(p);
    return textoResumo(p);
  }

  /* ---------------- MATRIZ ---------------- */
  function initMatriz() {
    var riscos = DB.todosRiscos();
    var counts = {};
    riscos.forEach(function (r) { var k = r.probabilidade + "-" + r.impacto; counts[k] = (counts[k] || 0) + 1; });

    var html = "<thead><tr><th>Prob \\ Impacto</th>";
    for (var i = 1; i <= 5; i++) html += "<th>I " + i + "</th>";
    html += "</tr></thead><tbody>";
    for (var p = 5; p >= 1; p--) {
      html += "<tr><th>P " + p + "</th>";
      for (var im = 1; im <= 5; im++) {
        var n = DB.nivelRisco(p, im);
        var q = counts[p + "-" + im] || 0;
        html += '<td class="v-' + n.cor + '" data-p="' + p + '" data-i="' + im + '" title="' + n.nome + ' (' + (p * im) + ')">' +
          (q ? '<span class="qtd">' + q + "</span>" : "") + "</td>";
      }
      html += "</tr>";
    }
    html += "</tbody>";
    $("tabelaMatriz").innerHTML = html;
    $("tabelaMatriz").querySelectorAll("td").forEach(function (td) {
      td.addEventListener("click", function () { filtrarMatriz(Number(td.getAttribute("data-p")), Number(td.getAttribute("data-i"))); });
    });

    $("limparFiltroMatriz").addEventListener("click", function () { MATRIZ_FILTRO = null; renderMatrizLista(); });
    renderMatrizLista();
  }

  function filtrarMatriz(p, i) {
    MATRIZ_FILTRO = { p: p, i: i };
    renderMatrizLista();
    document.querySelectorAll("#tabelaMatriz td").forEach(function (td) {
      td.style.outline = (Number(td.getAttribute("data-p")) === p && Number(td.getAttribute("data-i")) === i) ? "2px solid #fff" : "none";
    });
  }

  function renderMatrizLista() {
    var riscos = DB.todosRiscos();
    if (MATRIZ_FILTRO) {
      riscos = riscos.filter(function (r) { return r.probabilidade === MATRIZ_FILTRO.p && r.impacto === MATRIZ_FILTRO.i; });
      $("tituloMatrizLista").textContent = "Riscos em P " + MATRIZ_FILTRO.p + " x I " + MATRIZ_FILTRO.i;
      $("subMatrizLista").textContent = riscos.length + " risco(s) - nivel " + DB.nivelRisco(MATRIZ_FILTRO.p, MATRIZ_FILTRO.i).nome;
    } else {
      $("tituloMatrizLista").textContent = "Riscos mapeados";
      $("subMatrizLista").textContent = riscos.length + " riscos nos " + DB.processos.length + " processos do E/4";
      document.querySelectorAll("#tabelaMatriz td").forEach(function (td) { td.style.outline = "none"; });
    }
    riscos.sort(function (a, b) { return b.valor - a.valor; });
    $("tbodyMatriz").innerHTML = riscos.length ? riscos.map(function (r) {
      return "<tr><td>" + esc(r.processo) + "</td><td>" + esc(r.descricao) + "</td><td>" + esc(r.causa) +
        "</td><td>" + esc(r.consequencia) + "</td><td>" + r.probabilidade + "</td><td>" + r.impacto +
        "</td><td>" + nivelTag(r.nivel) + "</td><td>" + esc(r.controle) + "</td></tr>";
    }).join("") : '<tr><td colspan="8" class="vazio">Nenhum risco nesta combinacao.</td></tr>';
  }

  /* ---------------- COMBUSTIVEL (CLASSE III) ---------------- */
  var CBO_KEY = "gpex_combustivel_v1";
  var cbo = carregarCbo();

  function carregarCbo() {
    try { var s = JSON.parse(localStorage.getItem(CBO_KEY)); if (s && s.itens) return s; } catch (e) { }
    return { cota: 0, mes: "", itens: [] };
  }
  function salvarCbo() { try { localStorage.setItem(CBO_KEY, JSON.stringify(cbo)); } catch (e) { } }
  function hojeISO() { var d = new Date(); return d.toISOString().slice(0, 10); }
  function mesAtual() { return new Date().toISOString().slice(0, 7); }

  function initCombustivel() {
    $("descCombustivel").textContent = DB.combustivel.descricao;
    $("cboTipo").innerHTML = DB.combustivel.tipos.map(function (t) { return "<option>" + esc(t) + "</option>"; }).join("");
    $("cboData").value = hojeISO();
    if (!cbo.mes) cbo.mes = mesAtual();
    $("cboMes").value = cbo.mes;
    $("cboCota").value = cbo.cota || "";

    $("cboAdd").addEventListener("click", addAbastecimento);
    $("cboLimpar").addEventListener("click", function () {
      if (confirm("Remover todos os abastecimentos registrados?")) { cbo.itens = []; salvarCbo(); renderCombustivel(); }
    });
    $("cboMes").addEventListener("change", function () { cbo.mes = $("cboMes").value; salvarCbo(); renderCombustivel(); });
    $("cboCota").addEventListener("input", function () { cbo.cota = Number($("cboCota").value) || 0; salvarCbo(); renderCombustivel(); });

    renderCombustivel();
  }

  function addAbastecimento() {
    var data = $("cboData").value || hojeISO();
    var viatura = $("cboViatura").value.trim();
    var litros = Number($("cboLitros").value);
    if (!viatura) { alert("Informe a viatura/equipamento."); return; }
    if (!litros || litros <= 0) { alert("Informe os litros abastecidos."); return; }
    cbo.itens.push({
      id: Date.now(), data: data, viatura: viatura, tipo: $("cboTipo").value,
      litros: litros, km: Number($("cboKm").value) || 0, resp: $("cboResp").value.trim()
    });
    salvarCbo();
    $("cboViatura").value = ""; $("cboLitros").value = ""; $("cboKm").value = "";
    renderCombustivel();
  }

  function consumos() {
    var ordenado = cbo.itens.slice().sort(function (a, b) {
      return (a.data + String(a.id)).localeCompare(b.data + String(b.id));
    });
    var ultimo = {};
    var mapa = {};
    ordenado.forEach(function (it) {
      var kml = null;
      if (it.km && ultimo[it.viatura] && it.km > ultimo[it.viatura] && it.litros > 0) {
        kml = ((it.km - ultimo[it.viatura]) / it.litros).toFixed(2);
      }
      if (it.km) ultimo[it.viatura] = it.km;
      mapa[it.id] = kml;
    });
    return mapa;
  }

  function renderCombustivel() {
    var kml = consumos();
    var itens = cbo.itens.slice().sort(function (a, b) { return b.data.localeCompare(a.data); });

    $("tbodyCombustivel").innerHTML = itens.length ? itens.map(function (it) {
      return "<tr><td>" + esc(it.data) + "</td><td>" + esc(it.viatura) + "</td><td>" + esc(it.tipo) +
        "</td><td>" + it.litros.toFixed(2) + "</td><td>" + (it.km || "-") + "</td><td>" + (kml[it.id] || "-") +
        "</td><td>" + esc(it.resp || "-") + '</td><td><button class="btn btn-sm" data-del="' + it.id + '">x</button></td></tr>';
    }).join("") : '<tr><td colspan="8" class="vazio">Nenhum abastecimento registrado.</td></tr>';

    $("tbodyCombustivel").querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = Number(b.getAttribute("data-del"));
        cbo.itens = cbo.itens.filter(function (x) { return x.id !== id; });
        salvarCbo(); renderCombustivel();
      });
    });

    var doMes = cbo.itens.filter(function (it) { return it.data.slice(0, 7) === cbo.mes; });
    var totalLitros = doMes.reduce(function (a, it) { return a + it.litros; }, 0);
    var porTipo = {};
    doMes.forEach(function (it) { porTipo[it.tipo] = (porTipo[it.tipo] || 0) + it.litros; });
    var porViatura = {};
    doMes.forEach(function (it) { porViatura[it.viatura] = (porViatura[it.viatura] || 0) + it.litros; });

    var cota = Number(cbo.cota) || 0;
    var pct = cota > 0 ? Math.min(100, Math.round((totalLitros / cota) * 100)) : 0;
    var cls = pct >= 100 ? "excesso" : pct >= 85 ? "alerta" : "";

    $("cboResumoObs").textContent = "Mes " + (cbo.mes || "-") + " - " + doMes.length + " abastecimento(s)";
    var linhas = "";
    if (cota > 0) {
      linhas += '<div style="display:flex;justify-content:space-between;font-size:13px;"><span>Consumido: <strong>' +
        totalLitros.toFixed(2) + " L</strong></span><span>Cota: <strong>" + cota.toFixed(0) + " L</strong> - " + pct + "%</span></div>" +
        '<div class="barra"><span class="' + cls + '" style="width:' + pct + '%;"></span></div>';
      if (totalLitros > cota) linhas += '<p class="sub" style="color:var(--red);margin-top:8px;">Consumo acima da cota. Registrar justificativa e reportar ao Cmt (risco do processo E4-13).</p>';
    } else {
      linhas += '<p class="sub">Informe a cota mensal para comparar o consumo.</p>';
    }
    linhas += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:16px;">';
    linhas += blocoLista("Por tipo", porTipo, "L");
    linhas += blocoLista("Por viatura/equipamento", porViatura, "L");
    linhas += "</div>";
    $("cboPainelResumo").innerHTML = linhas;

    function blocoLista(titulo, obj, un) {
      var ks = Object.keys(obj).sort();
      return '<div class="fonte"><div class="nome">' + esc(titulo) + '</div><div style="margin-top:6px;font-size:12.5px;">' +
        (ks.length ? ks.map(function (k) { return esc(k) + " - <strong>" + obj[k].toFixed(2) + " " + un + "</strong>"; }).join("<br>") : '<span class="vazio" style="padding:4px;">Sem dados</span>') +
        "</div></div>";
    }
  }

  /* ---------------- CALENDARIO ---------------- */
  var CAL_KEY = "gpex_calendario_v1";
  var calDone = carregarCal();
  function carregarCal() { try { return JSON.parse(localStorage.getItem(CAL_KEY)) || {}; } catch (e) { return {}; } }
  function salvarCal() { try { localStorage.setItem(CAL_KEY, JSON.stringify(calDone)); } catch (e) { } }

  var PERIODOS = null;
  function initCalendario() {
    var per = [], resps = [];
    DB.calendario.forEach(function (c) {
      if (per.indexOf(c.periodicidade) === -1) per.push(c.periodicidade);
      if (resps.indexOf(c.responsavel) === -1) resps.push(c.responsavel);
    });
    PERIODOS = per;
    $("calPeriodicidade").innerHTML = '<option value="">Todas</option>' + per.map(function (x) { return "<option>" + esc(x) + "</option>"; }).join("");
    $("calResp").innerHTML = '<option value="">Todos</option>' + resps.sort().map(function (x) { return "<option>" + esc(x) + "</option>"; }).join("");

    $("calMes").value = mesAtual();
    ["calMes", "calPeriodicidade", "calResp"].forEach(function (id) { $(id).addEventListener("change", renderCalendario); });

    $("tbodyCalCadastro").innerHTML = DB.calendario.map(function (c) {
      var p = DB.processos.filter(function (x) { return x.id === c.processo; })[0];
      return "<tr><td>" + esc(c.obrigacao) + "</td><td>" + esc(c.periodicidade) + "</td><td>" + esc(c.responsavel) +
        "</td><td>" + c.antecedencia + "</td><td>" + esc(p ? p.codigo + " - " + p.titulo : c.processo) + "</td></tr>";
    }).join("");

    renderCalendario();
  }

  function ocorrencias(mesStr) {
    var partes = (mesStr || mesAtual()).split("-");
    var ano = Number(partes[0]), mes = Number(partes[1]);
    var diasNoMes = new Date(ano, mes, 0).getDate();
    var out = [];
    DB.calendario.forEach(function (c) {
      function add(dia, extra) {
        dia = Math.min(Math.max(1, dia), diasNoMes);
        var d = new Date(ano, mes - 1, dia);
        out.push({ obrigacao: c.obrigacao, periodicidade: c.periodicidade, responsavel: c.responsavel, processo: c.processo, dia: dia, data: d, rotulo: extra || "" });
      }
      if (c.periodicidade === "Diaria") {
        for (var d = 1; d <= diasNoMes; d++) {
          var dow = new Date(ano, mes - 1, d).getDay();
          if (dow !== 0 && dow !== 6) add(d);
        }
      } else if (c.periodicidade === "Semanal") {
        for (var w = 1; w <= diasNoMes; w++) if (new Date(ano, mes - 1, w).getDay() === 1) add(w, "segunda");
      } else if (c.periodicidade === "Mensal") { add(5); }
      else if (c.periodicidade === "Trimestral") { if ([1, 4, 7, 10].indexOf(mes) !== -1) add(10); }
      else if (c.periodicidade === "Semestral") { if ([1, 7].indexOf(mes) !== -1) add(15); }
      else if (c.periodicidade === "Anual") { if (mes === 1) add(30); }
    });
    out.sort(function (a, b) { return a.dia - b.dia; });
    return out;
  }

  function renderCalendario() {
    var mes = $("calMes").value || mesAtual();
    var per = $("calPeriodicidade").value;
    var resp = $("calResp").value;
    var oc = ocorrencias(mes).filter(function (o) {
      if (per && o.periodicidade !== per) return false;
      if (resp && o.responsavel !== resp) return false;
      return true;
    });

    var feitos = 0;
    $("tbodyCalendario").innerHTML = oc.length ? oc.map(function (o, idx) {
      var key = mes + "|" + o.dia + "|" + o.obrigacao;
      var done = !!calDone[key];
      if (done) feitos++;
      var p = DB.processos.filter(function (x) { return x.id === o.processo; })[0];
      var dataFmt = String(o.dia).padStart(2, "0") + "/" + mes.split("-")[1] + "/" + mes.split("-")[0];
      return '<tr><td><input type="checkbox" data-key="' + esc(key) + '"' + (done ? " checked" : "") + "></td>" +
        "<td>" + dataFmt + (o.rotulo ? " <span class=\"tag cinza\">" + esc(o.rotulo) + "</span>" : "") + "</td>" +
        "<td>" + esc(o.obrigacao) + "</td><td>" + esc(o.periodicidade) + "</td><td>" + esc(o.responsavel) +
        '</td><td>' + esc(p ? p.codigo : o.processo) + "</td></tr>";
    }).join("") : '<tr><td colspan="6" class="vazio">Sem obrigacoes para os filtros selecionados.</td></tr>';

    $("tbodyCalendario").querySelectorAll("input[data-key]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var k = cb.getAttribute("data-key");
        if (cb.checked) calDone[k] = true; else delete calDone[k];
        salvarCal(); renderCalendario();
      });
    });

    var pct = oc.length ? Math.round((feitos / oc.length) * 100) : 0;
    $("calTitulo").textContent = "Agenda de " + mes;
    $("calProgresso").textContent = feitos + " de " + oc.length + " itens cumpridos (" + pct + "%)";
    var barra = $("calBarra");
    barra.style.width = pct + "%";
    barra.className = pct >= 85 ? "" : pct >= 60 ? "alerta" : "excesso";
  }

  /* ---------------- FONTES ---------------- */
  function initFontes() {
    $("gridFontes").innerHTML = DB.fontes.map(function (f) {
      return '<div class="fonte"><div class="n">Item ' + f.item + "</div><div class=\"nome\">" + esc(f.nome) + "</div>" +
        '<div class="desc">' + esc(f.descricao || "") + "</div>" +
        (f.url ? '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.url) + "</a>"
          : '<div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">' + esc(f.acesso || "") + "</div>") +
        "</div>";
    }).join("");
    if ($("gridNormas")) {
      $("gridNormas").innerHTML = DB.normas.map(function (n) {
        return '<div class="fonte"><div class="n">' + esc(n.codigo) + (n.edicao ? " - " + esc(n.edicao) : "") + '</div>' +
          '<div class="nome">' + esc(n.titulo) + "</div>" +
          '<div class="desc">' + esc(n.aplicacao) + "</div>" +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">' + esc(n.portaria) + "</div>" +
          (n.url ? '<a href="' + esc(n.url) + '" target="_blank" rel="noopener">Acessar norma</a>'
            : '<span class="tag amarelo" style="margin-top:6px;">confirmar vigência</span>') + "</div>";
      }).join("");
    }
    $("gridDoutrina").innerHTML = DB.doutrina.map(function (d) {
      return '<div class="fonte"><div class="n">' + esc(d.sigla) + '</div><div class="nome">' + esc(d.titulo) + "</div>" +
        '<div class="desc">' + esc(d.aplicacao) + "</div>" +
        (d.url ? '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">Acessar documento</a>' : "") + "</div>";
    }).join("");
  }

  /* ---------------- GOVERNANCA (EB10 / EB20) ---------------- */
  function baixarArquivo(nome, conteudo, tipo) {
    var blob = new Blob([conteudo], { type: tipo || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  function planoRiscosTexto() {
    var riscos = DB.todosRiscos().slice().sort(function (a, b) { return b.valor - a.valor; });
    var l = [
      "PLANO DE GESTAO DE RISCOS - SECAO DE LOGISTICA (E/4)",
      "Cmdo Bda Inf Amv",
      "Base legal: " + DB.riscoEB10.base,
      "Portfolio: " + DB.governanca.portfolio,
      "Macroprocesso: " + DB.governanca.macroprocesso,
      "Gerado em: " + new Date().toLocaleString("pt-BR"),
      "Escala: 1-4 Baixo | 5-9 Medio | 10-14 Alto | 15-25 Extremo",
      ""
    ];
    var porNivel = { "Baixo": 0, "Médio": 0, "Alto": 0, "Extremo": 0 };
    riscos.forEach(function (r) { porNivel[r.nivel] = (porNivel[r.nivel] || 0) + 1; });
    l.push("Resumo: Baixo " + porNivel["Baixo"] + " | Médio " + porNivel["Médio"] + " | Alto " + porNivel["Alto"] + " | Extremo " + porNivel["Extremo"]);
    l.push("");
    riscos.forEach(function (r, i) {
      l.push((i + 1) + ". [" + r.processoId.toUpperCase() + "] " + r.descricao);
      l.push("   Categoria: " + r.categoria + " | Nivel: " + r.nivel + " (P " + r.probabilidade + " x I " + r.impacto + " = " + r.valor + ")");
      l.push("   P: " + r.probabilidade + " - " + r.probabilidadeRotulo + " | I: " + r.impacto + " - " + r.impactoRotulo);
      l.push("   Causa: " + r.causa);
      l.push("   Consequencia: " + r.consequencia);
      l.push("   Controle/Mitigacao: " + r.controle);
      l.push("   Resposta: " + r.resposta + " | Prazo: " + r.prazo + " | Responsavel: " + r.responsavel);
      l.push("   Indicador: " + r.indicador);
      l.push("");
    });
    l.push("VALIDACAO HUMANA OBRIGATORIA ANTES DE PUBLICAR NO ASE.");
    return l.join("\n");
  }

  function riscosCSV() {
    var cols = ["Processo", "Categoria", "Risco", "Causa", "Consequencia", "Probabilidade", "P_rotulo", "Impacto", "I_rotulo", "Nivel", "Valor", "Controle", "Resposta", "Prazo", "Responsavel", "Indicador"];
    function c(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
    var linhas = [cols.map(c).join(";")];
    DB.todosRiscos().slice().sort(function (a, b) { return b.valor - a.valor; }).forEach(function (r) {
      linhas.push([
        r.processo, r.categoria, r.descricao, r.causa, r.consequencia,
        r.probabilidade, r.probabilidadeRotulo, r.impacto, r.impactoRotulo,
        r.nivel, r.valor, r.controle, r.resposta, r.prazo, r.responsavel, r.indicador
      ].map(c).join(";"));
    });
    return "\ufeff" + linhas.join("\r\n");
  }

  function initGovernanca() {
    var g = DB.governanca;
    if ($("governancaHierarquia")) {
      $("governancaHierarquia").innerHTML = [
        ["Portfólio", g.portfolio], ["Programa", g.programa],
        ["Macroprocesso", g.macroprocesso], ["Cadeia de valor", g.cadeiaValor]
      ].map(function (x) { return '<div class="hier-item"><span>' + esc(x[0]) + "</span><strong>" + esc(x[1]) + "</strong></div>"; }).join("");
    }

    if ($("tbodyGovernancaIndicadores")) {
      $("tbodyGovernancaIndicadores").innerHTML = DB.processos.map(function (p) {
        var gp = DB.governancaProcessos[p.id] || { tarefa: p.titulo, indicadores: [] };
        return "<tr><td>" + esc(p.codigo) + "</td><td>" + esc(gp.tarefa || p.titulo) + "</td><td>" +
          ((gp.indicadores && gp.indicadores.length) ? gp.indicadores.map(function (i) { return esc(i); }).join("<br>") : "-") + "</td></tr>";
      }).join("");
    }

    if ($("tbodyMarcos")) {
      $("tbodyMarcos").innerHTML = DB.marcosModelo.map(function (m) {
        return "<tr><td>" + m.ordem + "</td><td>" + esc(m.marco) + "</td><td>" + esc(m.produto) + "</td><td>" + esc(m.prazo) + "</td></tr>";
      }).join("");
    }

    if ($("governancaFiltroResposta")) {
      var respostas = DB.riscoEB10.respostas.map(function (r) { return r.codigo; });
      $("governancaFiltroResposta").innerHTML = '<option value="">Todas as respostas</option>' + respostas.map(function (r) { return "<option>" + esc(r) + "</option>"; }).join("");
      $("governancaFiltroResposta").addEventListener("change", renderRegistroRiscos);
    }
    if ($("governancaFiltroCategoria")) {
      $("governancaFiltroCategoria").innerHTML = '<option value="">Todas as categorias</option>' + DB.riscoEB10.categorias.map(function (r) { return "<option>" + esc(r) + "</option>"; }).join("");
      $("governancaFiltroCategoria").addEventListener("change", renderRegistroRiscos);
    }
    renderRegistroRiscos();

    if ($("btnPlanoRiscos")) $("btnPlanoRiscos").addEventListener("click", function () { copiarTexto(planoRiscosTexto(), $("btnPlanoRiscos")); });
    if ($("btnBaixarPlano")) $("btnBaixarPlano").addEventListener("click", function () { baixarArquivo("plano-gestao-riscos-e4.txt", planoRiscosTexto()); });
    if ($("btnCsvRiscos")) $("btnCsvRiscos").addEventListener("click", function () { baixarArquivo("matriz-riscos-e4.csv", riscosCSV(), "text/csv;charset=utf-8"); });

    if ($("valTarefaBtn")) {
      $("valTarefaBtn").addEventListener("click", function () {
        var r = DB.validarTarefa($("valTarefaInput").value);
        var cls = r.ok ? "aviso" : "aviso forte";
        var detalhe = r.ok
          ? "<br><strong>Verbo:</strong> " + esc(r.verbo) + " | <strong>Objeto:</strong> " + esc(r.objeto) + " | <strong>Complemento:</strong> " + esc(r.complemento)
          : "";
        $("valTarefaOut").innerHTML = '<div class="' + cls + '" style="margin:10px 0 0;">' + esc(r.mensagem) + detalhe + "</div>";
      });
    }
    if ($("valCronBtn")) {
      $("valCronBtn").addEventListener("click", function () {
        var r = DB.validarCronograma($("valInicio").value, $("valFim").value, $("valMarco").value);
        var cls = r.ok ? "aviso" : "aviso forte";
        $("valCronOut").innerHTML = '<div class="' + cls + '" style="margin:10px 0 0;">' + r.avisos.map(esc).join("<br>") + "</div>";
      });
    }
  }

  function renderRegistroRiscos() {
    if (!$("tbodyGovernancaRiscos")) return;
    var fr = $("governancaFiltroResposta") ? $("governancaFiltroResposta").value : "";
    var fc = $("governancaFiltroCategoria") ? $("governancaFiltroCategoria").value : "";
    var riscos = DB.todosRiscos().filter(function (r) {
      if (fr && r.resposta !== fr) return false;
      if (fc && r.categoria !== fc) return false;
      return true;
    }).sort(function (a, b) { return b.valor - a.valor; });

    $("tbodyGovernancaRiscos").innerHTML = riscos.length ? riscos.map(function (r) {
      return "<tr><td>" + esc(r.processoId.toUpperCase()) + "</td><td>" + esc(r.descricao) + "</td><td>" + esc(r.categoria) +
        "</td><td>" + r.probabilidade + " (" + esc(r.probabilidadeRotulo) + ")</td><td>" + r.impacto + " (" + esc(r.impactoRotulo) + ")" +
        "</td><td>" + nivelTag(r.nivel) + "</td><td><strong>" + esc(r.resposta) + "</strong></td><td>" + esc(r.prazo) +
        "</td><td>" + esc(r.responsavel) + "</td><td>" + esc(r.indicador) + "</td></tr>";
    }).join("") : '<tr><td colspan="10" class="vazio">Nenhum risco nos filtros selecionados.</td></tr>';

    if ($("governancaResumo")) {
      var porResp = {};
      riscos.forEach(function (r) { porResp[r.resposta] = (porResp[r.resposta] || 0) + 1; });
      $("governancaResumo").textContent = riscos.length + " riscos - " +
        DB.riscoEB10.respostas.map(function (x) { return x.codigo + ": " + (porResp[x.codigo] || 0); }).join(" | ");
    }
  }

  /* ---------------- boot ---------------- */
  try { initVisao(); } catch (e) { console.error(e); }
  try { initProcessos(); } catch (e) { console.error(e); }
  try { initMatriz(); } catch (e) { console.error(e); }
  try { initCombustivel(); } catch (e) { console.error(e); }
  try { initCalendario(); } catch (e) { console.error(e); }
  try { initGovernanca(); } catch (e) { console.error(e); }
  try { initFontes(); } catch (e) { console.error(e); }
})();
