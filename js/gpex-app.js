/* GPEX / Gestão de Riscos - E/4 | aplicação (vanilla JS) */
(function () {
  "use strict";

  var DB = window.GPEX_E4;
  if (!DB) { console.error("Base GPEX não carregada."); return; }

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
    function ok() { toast("Copiado para a área de transferencia."); if (btn) { var o = btn.textContent; btn.textContent = "Copiado!"; setTimeout(function () { btn.textContent = o; }, 1500); } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok).catch(function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { alert("Não foi possível copiar."); }
      document.body.removeChild(ta);
    }
  }

  /* ---------------- UI: toasts, overlays, rotas e atalhos ---------------- */
  var TABS = ["visao", "processos", "matriz", "governanca", "regimento", "combustivel", "calendario", "fontes"];

  function toast(msg, tipo) {
    var box = $("toasts"); if (!box) return;
    var el = document.createElement("div");
    el.className = "toast" + (tipo ? " " + tipo : "");
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.classList.add("sai"); }, 2600);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3200);
  }

  function abrirOverlay(id) { var o = $(id); if (o) { o.hidden = false; requestAnimationFrame(function () { o.classList.add("aberto"); }); } }
  function fecharOverlay(id) { var o = $(id); if (o) { o.classList.remove("aberto"); setTimeout(function () { o.hidden = true; }, 160); } }
  document.querySelectorAll(".overlay").forEach(function (o) {
    o.addEventListener("click", function (e) { if (e.target === o) fecharOverlay(o.id); });
  });

  function confirmar(msg, onOk) {
    if (!$("overlayConfirm")) { if (window.confirm(msg)) onOk(); return; }
    $("confirmMsg").textContent = msg;
    abrirOverlay("overlayConfirm");
    var sim = $("overlayConfirm").querySelector("[data-confirm-sim]");
    var nao = $("overlayConfirm").querySelector("[data-confirm-nao]");
    function done(ok) { fecharOverlay("overlayConfirm"); sim.onclick = não.onclick = null; if (ok && onOk) onOk(); }
    sim.onclick = function () { done(true); };
    não.onclick = function () { done(false); };
  }

  function ativarPainel(nome, opts) {
    if (TABS.indexOf(nome) === -1) nome = "visao";
    document.querySelectorAll(".gpex-aba").forEach(function (x) {
      var on = x.getAttribute("data-painel") === nome;
      x.classList.toggle("active", on);
      x.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".painel").forEach(function (x) { x.classList.remove("active"); });
    var painel = $("painel-" + nome); if (painel) painel.classList.add("active");
    try { localStorage.setItem("gpex_tab", nome); } catch (e) { }
    if (!opts || !opts.noHash) {
      var h = "#" + nome;
      if (location.hash !== h) { try { history.pushState({ tab: nome }, "", h); } catch (e) { location.hash = h; } }
    }
  }

  function irPara(nome, proc) {
    ativarPainel(nome);
    if (nome === "processos" && proc) abrirProcesso(proc);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".gpex-aba").forEach(function (b) {
    b.addEventListener("click", function () { irPara(b.getAttribute("data-painel")); });
  });

  function aplicarRota() {
    var h = (location.hash || "").replace(/^#/, "");
    var partes = h.split("/");
    var nome = TABS.indexOf(partes[0]) !== -1 ? partes[0] : null;
    if (!nome) { try { nome = localStorage.getItem("gpex_tab"); } catch (e) { } }
    if (TABS.indexOf(nome) === -1) nome = "visao";
    ativarPainel(nome, { noHash: true });
    if (nome === "processos" && partes[1] && PROC_ATUAL !== partes[1]) abrirProcesso(partes[1]);
  }
  window.addEventListener("popstate", aplicarRota);

  function digitando(el) {
    if (!el) return false;
    var t = (el.tagName || "").toLowerCase();
    return t === "input" || t === "select" || t === "textarea" || el.isContentEditable;
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { fecharOverlay("overlayBusca"); fecharOverlay("overlayAjuda"); fecharOverlay("overlayConfirm"); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); abrirBusca(); return; }
    if (e.key === "/" && !digitando(document.activeElement)) { e.preventDefault(); abrirBusca(); return; }
    if (!digitando(document.activeElement) && /^[1-9]$/.test(e.key)) { var n = Number(e.key); if (n <= TABS.length) irPara(TABS[n - 1]); }
  });

  /* ---------------- busca global ---------------- */
  var IDX_BUSCA = null, BUSCA_SEL = 0, BUSCA_ITENS = [];

  function norm(s) {
    return String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function montarIndice() {
    if (IDX_BUSCA) return IDX_BUSCA;
    IDX_BUSCA = [];
    DB.processos.forEach(function (p) {
      IDX_BUSCA.push({ tipo: "Processo", titulo: p.titulo, sub: p.codigo + " - " + p.area, acao: function () { irPara("processos", p.id); } });
      p.riscos.forEach(function (r) {
        IDX_BUSCA.push({ tipo: "Risco", titulo: r.descricao, sub: p.codigo + " - " + p.titulo, acao: function () { irPara("processos", p.id); } });
      });
    });
    DB.calendario.forEach(function (c) {
      IDX_BUSCA.push({ tipo: "Obrigação", titulo: c.obrigacao, sub: c.periodicidade + " - " + c.responsavel, acao: function () { irPara("calendario"); } });
    });
    DB.normas.forEach(function (n) {
      IDX_BUSCA.push({ tipo: "Norma", titulo: n.codigo + " - " + n.titulo, sub: n.aplicacao, acao: function () { irPara("governanca"); } });
    });
    DB.fontes.forEach(function (f) {
      IDX_BUSCA.push({ tipo: "Fonte", titulo: f.nome, sub: f.descricao || f.acesso || "", acao: function () { irPara("fontes"); } });
    });
    return IDX_BUSCA;
  }

  function abrirBusca() {
    if (!$("overlayBusca")) return;
    abrirOverlay("overlayBusca");
    var inp = $("buscaGlobal");
    inp.value = ""; renderBusca("");
    setTimeout(function () { inp.focus(); }, 30);
  }

  function renderBusca(q) {
    var box = $("resultadosBusca"); if (!box) return;
    var nq = norm(q);
    var base = montarIndice();
    BUSCA_ITENS = (nq ? base.filter(function (i) { return norm(i.titulo).indexOf(nq) !== -1 || norm(i.sub).indexOf(nq) !== -1; }) : base).slice(0, 40);
    if (!BUSCA_ITENS.length) { box.innerHTML = '<div class="vazio">Nada encontrado.</div>'; return; }
    BUSCA_SEL = 0;
    box.innerHTML = BUSCA_ITENS.map(function (i, k) {
      return '<button class="res' + (k === 0 ? " sel" : "") + '" data-k="' + k + '"><span class="res-tipo">' + esc(i.tipo) + '</span>' +
        '<span class="res-tit">' + esc(i.titulo) + '</span><small>' + esc(i.sub) + "</small></button>";
    }).join("");
    box.querySelectorAll(".res").forEach(function (b) {
      b.addEventListener("click", function () { executarBusca(Number(b.getAttribute("data-k"))); });
    });
  }

  function executarBusca(k) {
    var i = BUSCA_ITENS[k]; if (!i) return;
    fecharOverlay("overlayBusca");
    i.acao();
    toast(i.tipo + ": " + i.titulo);
  }

  function moverBusca(d) {
    var items = $("resultadosBusca").querySelectorAll(".res");
    if (!items.length) return;
    BUSCA_SEL = (BUSCA_SEL + d + items.length) % items.length;
    items.forEach(function (el, k) { el.classList.toggle("sel", k === BUSCA_SEL); });
    items[BUSCA_SEL].scrollIntoView({ block: "nearest" });
  }

  function initBusca() {
    if ($("btnBusca")) $("btnBusca").addEventListener("click", abrirBusca);
    if ($("buscaGlobal")) {
      $("buscaGlobal").addEventListener("input", function () { renderBusca(this.value); });
      $("buscaGlobal").addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); moverBusca(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); moverBusca(-1); }
        else if (e.key === "Enter") { e.preventDefault(); executarBusca(BUSCA_SEL); }
      });
    }
    if ($("btnAjuda")) $("btnAjuda").addEventListener("click", function () { abrirOverlay("overlayAjuda"); });
    document.querySelectorAll("[data-fechar]").forEach(function (b) { b.addEventListener("click", function () { fecharOverlay(b.closest(".overlay").id); }); });
    document.querySelectorAll("#passos [data-ir]").forEach(function (li) { li.addEventListener("click", function () { irPara(li.getAttribute("data-ir")); }); });
  }

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
    l.push('  D -- "Não" --> F(["Fim"])');
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
    l.push("  R" + DB.tratamentoRisco.length + ' --> M["Monitoramento contínuo"]');
    l.push('  M -. "Reavaliar" .-> R2');
    return l.join("\n");
  }

  /* ---------------- VISaO GERAL ---------------- */
  function initVisao() {
    var riscos = DB.todosRiscos();
    var altos = riscos.filter(function (r) { return r.nivel === "Alto" || r.nivel === "Extremo"; });
    var média = riscos.length ? (riscos.reduce(function (a, r) { return a + r.valor; }, 0) / riscos.length) : 0;

    $("cardsVisao").innerHTML = [
      card("Processos mapeados", DB.processos.length, "Tarefas da E/4 (4ª Seção)"),
      card("Riscos identificados", riscos.length, "Com causa, consequência e controle"),
      card("Riscos Alto/Extremo", altos.length, "Tratamento prioritário (EB10-P-01.004)", altos.length ? "var(--red)" : "var(--green)"),
      card("Classes de suprimento", DB.classes.length, "I a X"),
      card("Obrigações periódicas", DB.calendario.length, "Calendário da E/4"),
      card("Nível medio (P x I)", média.toFixed(1), "Escala de 1 a 25", "var(--yellow)")
    ].join("");

    var cont = { "Baixo": 0, "Médio": 0, "Alto": 0, "Extremo": 0 };
    riscos.forEach(function (r) { cont[r.nivel]++; });
    renderDonut(cont, riscos.length);
    renderConformidade(riscos);
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

  function corVar(c) {
    return c === "verde" ? "#6b8e23" : c === "amarelo" ? "#d9a300" : c === "laranja" ? "#e8842a" : "#dc2626";
  }

  function renderDonut(cont, total) {
    var el = $("donutRiscos"); if (!el) return;
    var dados = DB.escala.map(function (e) { return { nome: e.nome, q: cont[e.nome] || 0, cor: corVar(e.cor) }; });
    var C = 2 * Math.PI * 54, acc = 0;
    var segs = dados.filter(function (d) { return d.q > 0; }).map(function (d) {
      var dash = (d.q / total) * C;
      var s = '<circle cx="70" cy="70" r="54" fill="none" stroke="' + d.cor + '" stroke-width="18" stroke-dasharray="' +
        dash.toFixed(2) + " " + (C - dash).toFixed(2) + '" stroke-dashoffset="' + (-acc).toFixed(2) + '" transform="rotate(-90 70 70)"></circle>';
      acc += dash;
      return s;
    }).join("");
    var legenda = dados.map(function (d) {
      return '<span><i style="background:' + d.cor + '"></i>' + esc(d.nome) + " <b>" + d.q + "</b></span>";
    }).join("");
    el.innerHTML = '<svg viewBox="0 0 140 140" class="donut" role="img" aria-label="Distribuição de riscos por nível">' + segs +
      '<text x="70" y="67" text-anchor="middle" class="donut-num">' + total + '</text>' +
      '<text x="70" y="85" text-anchor="middle" class="donut-lbl">riscos</text></svg>' +
      '<div class="donut-legenda">' + legenda + "</div>";
  }

  function renderConformidade(riscos) {
    var el = $("conformidade"); if (!el) return;
    var total = riscos.length || 1;
    var comControle = riscos.filter(function (r) { return r.controle; }).length;
    var comResposta = riscos.filter(function (r) { return r.resposta; }).length;
    var procsComInd = DB.processos.filter(function (p) {
      var g = DB.governancaProcessos[p.id]; return g && g.indicadores && g.indicadores.length;
    }).length;
    var procsComRisco = DB.processos.filter(function (p) { return p.riscos.length > 0; }).length;
    var itens = [
      ["Riscos com controle/mitigação", comControle, total],
      ["Riscos com plano de resposta (EB10)", comResposta, total],
      ["Processos com indicador de desempenho", procsComInd, DB.processos.length],
      ["Processos com riscos mapeados", procsComRisco, DB.processos.length]
    ];
    el.innerHTML = '<h3>Conformidade do mapeamento</h3><div class="conf-grid">' + itens.map(function (it) {
      var pct = Math.round((it[1] / it[2]) * 100);
      var cls = pct >= 100 ? "" : pct >= 80 ? "alerta" : "excesso";
      return '<div class="conf-item"><div class="conf-top"><span>' + esc(it[0]) + "</span><strong>" + it[1] + "/" + it[2] +
        " (" + pct + '%)</strong></div><div class="barra"><span class="' + cls + '" style="width:' + pct + '%"></span></div></div>';
    }).join("") + "</div>";
  }

  /* ---------------- PROCESSOS ---------------- */
  function initProcessos() {
    var áreas = [], classes = [];
    DB.processos.forEach(function (p) {
      if (áreas.indexOf(p.area) === -1) áreas.push(p.area);
      p.classes.forEach(function (c) { if (classes.indexOf(c) === -1) classes.push(c); });
    });
    áreas.sort(); classes.sort();

    $("filtroArea").innerHTML = '<option value="">Todas as áreas</option>' + áreas.map(function (a) { return '<option>' + esc(a) + "</option>"; }).join("");
    $("filtroClasse").innerHTML = '<option value="">Todas as classes</option>' + classes.map(function (c) { return '<option>' + esc(c) + "</option>"; }).join("");

    ["buscaProc", "filtroArea", "filtroClasse", "filtroNivel"].forEach(function (id) { $(id).addEventListener("input", renderListaProc); });
    renderListaProc();
  }

  function procNiveis(p) {
    return p.riscos.map(function (r) { return DB.nivelRisco(r.probabilidade, r.impacto).nome; });
  }

  function renderListaProc() {
    var q = ($("buscaProc").value || "").toLowerCase();
    var área = $("filtroArea").value;
    var classe = $("filtroClasse").value;
    var nível = $("filtroNivel").value;

    var lista = DB.processos.filter(function (p) {
      if (área && p.area !== área) return false;
      if (classe && p.classes.indexOf(classe) === -1) return false;
      if (nível && procNiveis(p).indexOf(nível) === -1) return false;
      if (q) {
        var blob = (p.titulo + " " + p.objetivo + " " + p.area + " " + p.etapas.join(" ") + " " +
          p.riscos.map(function (r) { return r.descricao + " " + r.causa + " " + r.consequencia; }).join(" ")).toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });

    $("listaProcessos").innerHTML = lista.length ? lista.map(function (p) {
      var níveis = procNiveis(p);
      var pior = ["Extremo", "Alto", "Médio", "Baixo"].filter(function (n) { return níveis.indexOf(n) !== -1; })[0] || "Baixo";
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
    try { history.replaceState({ tab: "processos", proc: id }, "", "#processos/" + id); } catch (e) { }

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

    var vinc = DB.vinculoDe(p.id);
    var hierarquiaHtml = [
      ["Órgão", DB.governanca.orgao],
      ["Subordinação", DB.governanca.subordinacao],
      ["Portfólio", DB.governanca.portfolio],
      ["Programa", DB.governanca.programa],
      ["Macroprocesso", DB.governanca.macroprocesso],
      ["Função logística", vinc.funcao || "-"],
      ["Sistema de apoio", DB.sistemaDe(p.id)],
      ["Competência (Art. 3º)", vinc.competencia ? vinc.competencia + " - " + DB.competenciaTexto(vinc.competencia) : "-"],
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
      '<button class="btn btn-sm" data-aris="bpmn">ARIS: BPMN (.bpmn)</button>' +
      '<button class="btn btn-sm" data-aris="aml">ARIS: AML (.aml) - experimental</button>' +
      '<button class="btn btn-sm" data-aris="smart">ARIS: Smart Design (.csv)</button>' +
      '<button class="btn btn-sm" id="btnImprimir"><svg class="ico"><use href="#i-print"/></svg>Imprimir / PDF</button>' +
      "</div>" +
      "<h3>Objetivo</h3><p style=\"font-size:13px;color:var(--text-secondary);\">" + esc(p.objetivo) + "</p>" +
      '<h3>Hierarquia GPEX / Governança (EB10-P-01.007 / EB20-N-11.002)</h3><dl class="hierarquia">' + hierarquiaHtml + "</dl>" +
      '<h3>Indicadores de desempenho</h3><ul class="lista-simples">' + indicadoresHtml + "</ul>" +
      "<h3>Responsáveis</h3><p style=\"font-size:13px;color:var(--text-secondary);\">" + esc(p.responsaveis.join("; ")) + "</p>" +
      "<h3>Etapas do processo</h3><ol class=\"etapas\">" + p.etapas.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ol>" +
      "<h3>Fluxograma do processo (Mermaid / base BPMN)</h3>" +
      '<div class="mermaid-box"><pre class="mermaid" id="mmProc"></pre></div>' +
      '<div class="aris-toolbar">' +
      '<span class="aris-lbl">Exportar fluxograma para o ARIS:</span>' +
      '<button class="btn btn-sm" data-aris="bpmn">BPMN (.bpmn)</button>' +
      '<button class="btn btn-sm" data-aris="aml">AML / EPC (.aml)</button>' +
      '<button class="btn btn-sm" data-aris="smart">Baixar Smart Design (.csv)</button>' +
      '<button class="btn btn-sm btn-primary" data-aris="smartcopy">Copiar planilha (ARIS Express)</button>' +
      '<button class="btn btn-sm" data-aris="mermaid">Copiar Mermaid</button>' +
      "</div>" +
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
    $("detalheProcesso").querySelectorAll("[data-aris]").forEach(function (b) {
      b.addEventListener("click", function () { exportarARIS(p, b.getAttribute("data-aris")); });
    });
    if ($("btnImprimir")) $("btnImprimir").addEventListener("click", function () { toast("Abrindo impressão / salvar em PDF..."); setTimeout(function () { window.print(); }, 300); });
  }

  /* ---------------- exportação de texto (para o ASE) ---------------- */
  function textoDados(p) {
    var gp = DB.governancaProcessos[p.id] || { tarefa: p.titulo, indicadores: [] };
    var vinc = DB.vinculoDe(p.id);
    return "DADOS DO PROCESSO\n" +
      "Código: " + p.codigo + "\n" +
      "Título: " + p.titulo + "\n" +
      "Tarefa (Verbo + Objeto + Complemento): " + (gp.tarefa || p.titulo) + "\n" +
      "Órgão: " + DB.governanca.orgao + " - subordinada ao " + DB.governanca.subordinacao + "\n" +
      "Função logística (Art. 3º, I): " + (vinc.funcao || "-") + "\n" +
      "Sistema de apoio (TIC): " + DB.sistemaDe(p.id) + "\n" +
      "Competência (Art. 3º): " + (vinc.competencia ? vinc.competencia + " - " + DB.competenciaTexto(vinc.competencia) : "-") + "\n" +
      "Área: " + p.area + "\n" +
      "Portfólio: " + DB.governanca.portfolio + "\n" +
      "Programa: " + DB.governanca.programa + "\n" +
      "Macroprocesso: " + DB.governanca.macroprocesso + "\n" +
      "Classes de suprimento: " + (p.classes.length ? p.classes.join(", ") : "Não aplicavel") + "\n" +
      "Objetivo: " + p.objetivo + "\n" +
      "Responsáveis: " + p.responsaveis.join("; ") + "\n" +
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
      "TRATAMENTO DO RISCO (fluxo padrão EME)\n" +
      DB.tratamentoRisco.map(function (t) { return "  " + t.etapa + " - " + t.descricao; }).join("\n") + "\n\n" +
      "FLUXO (Mermaid - colar no ASE/ARIS como referência)\n\n" + mmFluxoProcesso(p) + "\n\n" +
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
      $("subMatrizLista").textContent = riscos.length + " risco(s) - nível " + DB.nivelRisco(MATRIZ_FILTRO.p, MATRIZ_FILTRO.i).nome;
    } else {
      $("tituloMatrizLista").textContent = "Riscos mapeados";
      $("subMatrizLista").textContent = riscos.length + " riscos nos " + DB.processos.length + " processos da E/4";
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
  function novoId() {
    try { if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID(); } catch (e) { }
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
  }
  function hojeISO() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function mesAtual() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }

  function initCombustivel() {
    $("descCombustivel").textContent = DB.combustivel.descricao;
    $("cboTipo").innerHTML = DB.combustivel.tipos.map(function (t) { return "<option>" + esc(t) + "</option>"; }).join("");
    $("cboData").value = hojeISO();
    if (!cbo.mes) cbo.mes = mesAtual();
    $("cboMes").value = cbo.mes;
    $("cboCota").value = cbo.cota || "";

    $("cboAdd").addEventListener("click", addAbastecimento);
    $("cboLimpar").addEventListener("click", function () {
      confirmar("Remover todos os abastecimentos registrados?", function () {
        cbo.itens = []; salvarCbo(); renderCombustivel(); toast("Abastecimentos removidos.");
      });
    });
    $("cboMes").addEventListener("change", function () { cbo.mes = $("cboMes").value; salvarCbo(); renderCombustivel(); });
    $("cboCota").addEventListener("input", function () { cbo.cota = Number($("cboCota").value) || 0; salvarCbo(); renderCombustivel(); });
    if ($("cboRelatorio")) $("cboRelatorio").addEventListener("click", relatorioCombustivel);
    if ($("cboExportar")) $("cboExportar").addEventListener("click", cboExportarCSV);
    if ($("cboImportar") && $("cboArquivo")) {
      $("cboImportar").addEventListener("click", function () { $("cboArquivo").click(); });
      $("cboArquivo").addEventListener("change", function (e) {
        var f = e.target.files && e.target.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () { cboImportarCSV(String(r.result)); e.target.value = ""; };
        r.readAsText(f);
      });
    }

    renderCombustivel();
  }

  function addAbastecimento() {
    var data = $("cboData").value || hojeISO();
    var viatura = $("cboViatura").value.trim();
    var litros = Number($("cboLitros").value);
    var km = Number($("cboKm").value) || 0;
    if (!viatura) { toast("Informe a viatura/equipamento."); return; }
    if (!litros || litros <= 0) { toast("Informe os litros abastecidos (maior que zero)."); return; }
    if (litros > 2000) { toast("Litros suspeito (> 2000). Verifique o valor."); return; }
    // Hodômetro deve ser crescente para a mesma viatura
    var anteriores = cbo.itens.filter(function (x) { return x.viatura.toLowerCase() === viatura.toLowerCase() && x.km > 0; });
    var ultimo = anteriores.length ? Math.max.apply(null, anteriores.map(function (x) { return x.km; })) : 0;
    if (km > 0 && ultimo > 0 && km < ultimo) {
      toast("Hodômetro menor que o último registro (" + ultimo + "). Verifique a viatura/valor.");
      return;
    }
    // Duplicidade
    var dup = cbo.itens.some(function (x) {
      return x.viatura.toLowerCase() === viatura.toLowerCase() && x.data === data && Math.abs(x.litros - litros) < 0.01 && (x.km || 0) === km;
    });
    if (dup) { toast("Registro duplicado (mesma viatura, data, litros e hodômetro)."); return; }
    cbo.itens.push({ id: novoId(), data: data, viatura: viatura, tipo: $("cboTipo").value, litros: litros, km: km, resp: $("cboResp").value.trim() });
    salvarCbo();
    $("cboViatura").value = ""; $("cboLitros").value = ""; $("cboKm").value = "";
    renderCombustivel();
    toast("Abastecimento registrado.");
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

    $("cboResumoObs").textContent = "Mês " + (cbo.mes || "-") + " - " + doMes.length + " abastecimento(s)";
    var linhas = "";
    if (cota > 0) {
      linhas += '<div style="display:flex;justify-content:space-between;font-size:13px;"><span>Consumido: <strong>' +
        totalLitros.toFixed(2) + " L</strong></span><span>Cota: <strong>" + cota.toFixed(0) + " L</strong> - " + pct + "%</span></div>" +
        '<div class="barra"><span class="' + cls + '" style="width:' + pct + '%;"></span></div>';
      if (totalLitros > cota) linhas += '<p class="sub" style="color:var(--red);margin-top:8px;">Consumo acima da cota. Registrar justificativa e reportar ao Cmt (risco do processo E4-06).</p>';
    } else {
      linhas += '<p class="sub">Informe a cota mensal para comparar o consumo.</p>';
    }
    linhas += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:16px;">';
    linhas += blocoLista("Por tipo", porTipo, "L");
    linhas += blocoLista("Por viatura/equipamento", porViatura, "L");
    linhas += "</div>";
    $("cboPainelResumo").innerHTML = linhas;

    function blocoLista(título, obj, un) {
      var ks = Object.keys(obj).sort();
      return '<div class="fonte"><div class="nome">' + esc(título) + '</div><div style="margin-top:6px;font-size:12.5px;">' +
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
    var ano = Number(partes[0]), mês = Number(partes[1]);
    var diasNoMes = new Date(ano, mês, 0).getDate();
    var out = [];
    DB.calendario.forEach(function (c) {
      function add(dia, extra) {
        dia = Math.min(Math.max(1, dia), diasNoMes);
        var d = new Date(ano, mês - 1, dia);
        out.push({ obrigacao: c.obrigacao, periodicidade: c.periodicidade, responsavel: c.responsavel, processo: c.processo, dia: dia, data: d, rotulo: extra || "" });
      }
      if (c.periodicidade === "Diária") {
        for (var d = 1; d <= diasNoMes; d++) {
          var dow = new Date(ano, mês - 1, d).getDay();
          if (dow !== 0 && dow !== 6) add(d);
        }
      } else if (c.periodicidade === "Semanal") {
        for (var w = 1; w <= diasNoMes; w++) if (new Date(ano, mês - 1, w).getDay() === 1) add(w, "segunda");
      } else if (c.periodicidade === "Mensal") { add(5); }
      else if (c.periodicidade === "Trimestral") { if ([1, 4, 7, 10].indexOf(mês) !== -1) add(10); }
      else if (c.periodicidade === "Semestral") { if ([1, 7].indexOf(mês) !== -1) add(15); }
      else if (c.periodicidade === "Anual") { if (mês === 1) add(30); }
    });
    out.sort(function (a, b) { return a.dia - b.dia; });
    return out;
  }

  function renderCalendario() {
    var mês = $("calMes").value || mesAtual();
    var per = $("calPeriodicidade").value;
    var resp = $("calResp").value;
    var oc = ocorrencias(mês).filter(function (o) {
      if (per && o.periodicidade !== per) return false;
      if (resp && o.responsavel !== resp) return false;
      return true;
    });

    var feitos = 0;
    $("tbodyCalendario").innerHTML = oc.length ? oc.map(function (o, idx) {
      var key = mês + "|" + o.dia + "|" + o.obrigacao;
      var done = !!calDone[key];
      if (done) feitos++;
      var p = DB.processos.filter(function (x) { return x.id === o.processo; })[0];
      var dataFmt = String(o.dia).padStart(2, "0") + "/" + mês.split("-")[1] + "/" + mês.split("-")[0];
      return '<tr><td><input type="checkbox" data-key="' + esc(key) + '"' + (done ? " checked" : "") + "></td>" +
        "<td>" + dataFmt + (o.rotulo ? " <span class=\"tag cinza\">" + esc(o.rotulo) + "</span>" : "") + "</td>" +
        "<td>" + esc(o.obrigacao) + "</td><td>" + esc(o.periodicidade) + "</td><td>" + esc(o.responsavel) +
        '</td><td>' + esc(p ? p.codigo : o.processo) + "</td></tr>";
    }).join("") : '<tr><td colspan="6" class="vazio">Sem obrigações para os filtros selecionados.</td></tr>';

    $("tbodyCalendario").querySelectorAll("input[data-key]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var k = cb.getAttribute("data-key");
        if (cb.checked) calDone[k] = true; else delete calDone[k];
        salvarCal(); renderCalendario();
      });
    });

    var pct = oc.length ? Math.round((feitos / oc.length) * 100) : 0;
    $("calTitulo").textContent = "Agenda de " + mês;
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
        var badge = n.situacao === "vigente" ? '<span class="tag verde">vigente</span>'
          : n.situacao === "provavel-revogada" ? '<span class="tag vermelho">provável revogada</span>'
            : '<span class="tag amarelo">verificar vigência</span>';
        var verif = n.verificadoEm ? "Verificado em " + formatarData(n.verificadoEm) : "Não verificado";
        return '<div class="fonte"><div class="n">' + esc(n.codigo) + (n.edicao ? " - " + esc(n.edicao) : "") + '</div>' +
          '<div class="nome">' + esc(n.titulo) + "</div>" +
          '<div style="margin:6px 0;">' + badge + '</div>' +
          '<div class="desc">' + esc(n.aplicacao || "") + "</div>" +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">' + esc(n.portaria || "") +
          " | " + esc(verif) + "</div>" +
          (n.observacao ? '<div style="font-size:11.5px;color:var(--text-secondary);margin-top:4px;">' + esc(n.observacao) + "</div>" : "") +
          (n.url ? '<a href="' + esc(n.url) + '" target="_blank" rel="noopener">Acessar norma</a>' : "") + "</div>";
      }).join("");
    }
    $("gridDoutrina").innerHTML = DB.doutrina.map(function (d) {
      return '<div class="fonte"><div class="n">' + esc(d.sigla) + '</div><div class="nome">' + esc(d.titulo) + "</div>" +
        '<div class="desc">' + esc(d.aplicacao) + "</div>" +
        (d.url ? '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">Acessar documento</a>' : "") + "</div>";
    }).join("");
  }

  /* ---------------- GOVERNANCA (EB10 / EB20) ---------------- */
  function baixarArquivo(nome, conteúdo, tipo) {
    var blob = new Blob([conteúdo], { type: tipo || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* ---------------- integração ARIS (BPMN 2.0 / AML / Smart Design) ---------------- */
  function slug(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
  }
  function escXml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }

  /* BPMN 2.0 - importavel no ARIS Cloud/Plataforma ARIS e ferramentas BPMN. */
  function bpmnCabecalho() {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_E4" targetNamespace="http://bda-inf-amv.eb.mil.br/gpex/e4" exporter="GPEX E4 - Bda Inf Amv" exporterVersion="1.0">\n';
  }

  /* Blocos BPMN de um processo (ids prefixados pelo id do processo). */
  function bpmnBlocos(p) {
    var pre = p.id + "_";
    var gwId = pre + "Gateway_1";
    var nodes = [], flows = [], cur = 220, cy = 260, gap = 50, fid = 1;
    function node(id, type, name, w, h) { nodes.push({ id: pre + id, type: type, name: name, w: w, h: h, x: cur, y: cy - h / 2 }); cur += w + gap; }
    node("StartEvent_1", "startEvent", "Processo " + p.codigo + " iniciado", 36, 36);
    p.etapas.forEach(function (et, i) { node("Task_" + (i + 1), "task", (i + 1) + ". " + et, 160, 88); });
    node("Gateway_1", "exclusiveGateway", "Risco identificado?", 50, 50);
    node("Task_Risco", "task", "Tratar risco (EB10-P-01.004)", 170, 88);
    node("EndEvent_1", "endEvent", "Processo encerrado", 36, 36);

    function flow(from, to, name) { flows.push({ id: pre + "Flow_" + (fid++), from: from, to: to, name: name || "" }); }
    for (var i = 0; i < nodes.length - 1; i++) flow(nodes[i].id, nodes[i + 1].id, nodes[i].id === gwId ? "Sim" : "");
    flow(gwId, pre + "EndEvent_1", "Não");

    var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
    var procId = "Process_" + p.id, collId = "Collaboration_" + p.id, partId = "Participant_" + p.id;

    var coll = '  <bpmn:collaboration id="' + collId + '">\n    <bpmn:participant id="' + partId + '" name="E/4 - ' + escXml(DB.governanca.macroprocesso) + '" processRef="' + procId + '"/>\n  </bpmn:collaboration>\n';

    var proc = '  <bpmn:process id="' + procId + '" name="' + escXml(p.codigo + " - " + p.titulo) + '" isExecutable="false">\n';
    proc += '    <bpmn:documentation>' + escXml(p.objetivo + " || Normas: " + DB.riscoEB10.base) + '</bpmn:documentation>\n';
    nodes.forEach(function (n) {
      if (n.type === "startEvent") proc += '    <bpmn:startEvent id="' + n.id + '" name="' + escXml(n.name) + '"/>\n';
      else if (n.type === "endEvent") proc += '    <bpmn:endEvent id="' + n.id + '" name="' + escXml(n.name) + '"/>\n';
      else if (n.type === "exclusiveGateway") proc += '    <bpmn:exclusiveGateway id="' + n.id + '" name="' + escXml(n.name) + '"/>\n';
      else proc += '    <bpmn:task id="' + n.id + '" name="' + escXml(n.name) + '"/>\n';
    });
    flows.forEach(function (f) {
      proc += '    <bpmn:sequenceFlow id="' + f.id + '"' + (f.name ? ' name="' + escXml(f.name) + '"' : "") + ' sourceRef="' + f.from + '" targetRef="' + f.to + '"/>\n';
    });
    proc += '  </bpmn:process>\n';

    var last = nodes[nodes.length - 1];
    var minX = 160, minY = 120, maxX = last.x + last.w + 60, maxY = 430;
    var dia = '  <bpmndi:BPMNDiagram id="BPMNDiagram_' + p.id + '">\n    <bpmndi:BPMNPlane id="BPMNPlane_' + p.id + '" bpmnElement="' + collId + '">\n';
    dia += '      <bpmndi:BPMNShape id="' + partId + '_di" bpmnElement="' + partId + '" isHorizontal="true"><dc:Bounds x="' + minX + '" y="' + minY + '" width="' + (maxX - minX) + '" height="' + (maxY - minY) + '"/></bpmndi:BPMNShape>\n';
    nodes.forEach(function (n) {
      dia += '      <bpmndi:BPMNShape id="' + n.id + '_di" bpmnElement="' + n.id + '"><dc:Bounds x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '"/></bpmndi:BPMNShape>\n';
    });
    flows.forEach(function (f) {
      var a = byId[f.from], b = byId[f.to];
      dia += '      <bpmndi:BPMNEdge id="' + f.id + '_di" bpmnElement="' + f.id + '"><di:waypoint x="' + (a.x + a.w) + '" y="' + (a.y + a.h / 2) + '"/><di:waypoint x="' + b.x + '" y="' + (b.y + b.h / 2) + '"/></bpmndi:BPMNEdge>\n';
    });
    dia += '    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n';
    return { coll: coll, proc: proc, dia: dia };
  }

  function arisBPMN(p) {
    var b = bpmnBlocos(p);
    return bpmnCabecalho() + b.coll + b.proc + b.dia + '</bpmn:definitions>\n';
  }

  function arisBPMNTodos() {
    var cols = "", procs = "", dias = "";
    DB.processos.forEach(function (p) { var b = bpmnBlocos(p); cols += b.coll; procs += b.proc; dias += b.dia; });
    return bpmnCabecalho() + cols + procs + dias + '</bpmn:definitions>\n';
  }

  function amlCabecalho() {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<AML xmlns="http://www.aris.com/AML" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n' +
      '  <Header>\n    <Created>' + new Date().toISOString() + '</Created>\n    <Creator>GPEX E4 - Bda Inf Amv</Creator>\n    <AmlVersion>1.0</AmlVersion>\n  </Header>\n';
  }

  /* Modelo EPC (AML) de um processo - ids prefixados pelo id do processo. */
  function amlModelo(p) {
    var pre = p.id + "_";
    var objs = [], conns = [], k = 1;
    function obj(id, type, name) { objs.push({ id: pre + id, type: type, name: name }); }
    function con(type, from, to) { conns.push({ id: pre + "Conn_" + (k++), type: type, from: pre + from, to: pre + to }); }
    obj("Obj_ORG_E4", "OT_ORG_UNIT", "E/4 - 4ª Seção (Logística)");
    obj("Obj_EVT_Start", "OT_EVT", "Processo " + p.codigo + " iniciado");
    var prev = "Obj_EVT_Start";
    p.etapas.forEach(function (et, i) {
      var fid = "Obj_FUNC_" + (i + 1), eid = "Obj_EVT_" + (i + 1);
      obj(fid, "OT_FUNC", et);
      obj(eid, "OT_EVT", "Etapa " + (i + 1) + " concluída");
      con("CT_ACTIV_1", prev, fid);
      con("CT_ACTIV_2", fid, eid);
      con("CT_EXEC_1", fid, "Obj_ORG_E4");
      prev = eid;
    });
    obj("Obj_RULE_1", "OT_RULE", "Risco identificado? (XOR)");
    obj("Obj_FUNC_RISCO", "OT_FUNC", "Tratar risco conforme EB10-P-01.004");
    obj("Obj_EVT_Fim", "OT_EVT", "Processo encerrado");
    con("CT_ACTIV_1", prev, "Obj_RULE_1");
    con("CT_ACTIV_1", "Obj_RULE_1", "Obj_FUNC_RISCO");
    con("CT_EXEC_1", "Obj_FUNC_RISCO", "Obj_ORG_E4");
    con("CT_ACTIV_2", "Obj_FUNC_RISCO", "Obj_EVT_Fim");
    con("CT_ACTIV_2", "Obj_RULE_1", "Obj_EVT_Fim");

    var riscos = p.riscos.map(function (r, i) {
      var n = DB.nivelRisco(r.probabilidade, r.impacto);
      return '        <AttrDef id="Attr_' + pre + 'Risco_' + (i + 1) + '" name="Risco"><Value>' + escXml(r.descricao + " (Nível " + n.nome + ")") + "</Value></AttrDef>";
    }).join("\n");

    var m = '    <Model id="Model_' + p.id + '" name="' + escXml(p.codigo + " - " + p.titulo) + '" modeltype="EPC">\n';
    m += "      <Attributes>\n" + riscos + "\n      </Attributes>\n";
    m += "      <Objects>\n";
    objs.forEach(function (o) { m += '        <Object id="' + o.id + '" type="' + o.type + '" name="' + escXml(o.name) + '"/>\n'; });
    m += "      </Objects>\n      <Connections>\n";
    conns.forEach(function (c) { m += '        <Connection id="' + c.id + '" type="' + c.type + '" from="' + c.from + '" to="' + c.to + '"/>\n'; });
    m += "      </Connections>\n    </Model>\n";
    return m;
  }

  function arisAML(p) { return amlCabecalho() + "  <Models>\n" + amlModelo(p) + "  </Models>\n</AML>\n"; }
  function arisAMLTodos() {
    var ms = "";
    DB.processos.forEach(function (p) { ms += amlModelo(p); });
    return amlCabecalho() + "  <Models>\n" + ms + "  </Models>\n</AML>\n";
  }

  /* Planilha para o "Smart Design" do ARIS Express (baixar em CSV ou copiar em TSV). */
  function arisSmartRows(procNome) {
    var cols = ["Passo", "Evento de entrada", "Função", "Evento de saída", "Responsável", "Sistema de apoio", "Risco relacionado", "Controle"];
    if (procNome) cols.unshift("Processo");
    var linhas = [cols];
    DB.processos.forEach(function (p) {
      if (procNome && p.titulo !== procNome) return;
      var resp = (p.responsaveis && p.responsaveis.length) ? p.responsaveis[0] : "E/4";
      var evIn = "Processo " + p.codigo + " iniciado";
      p.etapas.forEach(function (et, i) {
        var r = p.riscos[Math.min(i, p.riscos.length - 1)] || { descricao: "", controle: "" };
        var linha = [(i + 1), evIn, et, "Etapa " + (i + 1) + " concluída", resp, DB.sistemaDe(p.id), r.descricao, r.controle];
        if (procNome) linha.unshift(p.codigo + " - " + p.titulo);
        linhas.push(linha);
        evIn = "Etapa " + (i + 1) + " concluída";
      });
    });
    return linhas;
  }
  function arisSmartLinhas(procNome) {
    function c(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
    return "\ufeff" + arisSmartRows(procNome).map(function (l) { return l.map(c).join(";"); }).join("\r\n");
  }
  function arisSmartTSV(procNome) {
    return arisSmartRows(procNome).map(function (l) {
      return l.map(function (v) { return String(v == null ? "" : v).replace(/\t/g, " "); }).join("\t");
    }).join("\n");
  }

  function baixar(conteúdo, nome, tipo) { baixarArquivo(nome, conteúdo, tipo); }
  function exportarARIS(p, formato) {
    var base = p.codigo.toLowerCase() + "-" + slug(p.titulo);
    if (formato === "bpmn") { baixar(arisBPMN(p), base + ".bpmn", "application/xml"); toast("BPMN gerado - importe no ARIS."); }
    else if (formato === "aml") { baixar(arisAML(p), base + ".aml", "application/xml"); toast("AML gerado - importe no ARIS."); }
    else if (formato === "mermaid") copiarTexto(mmFluxoProcesso(p));
    else if (formato === "smartcopy") copiarTexto(arisSmartTSV(p.titulo));
    else { baixar(arisSmartLinhas(p.titulo), base + "-smart-design.csv", "text/csv;charset=utf-8"); toast("Planilha gerada - cole no Smart Design do ARIS Express."); }
  }

  function exportarARISTodos(formato) {
    if (formato === "bpmn") { baixar(arisBPMNTodos(), "gpex-e4-fluxogramas-todos.bpmn", "application/xml"); toast("BPMN (todos) gerado - importe no ARIS."); }
    else if (formato === "aml") { baixar(arisAMLTodos(), "gpex-e4-fluxogramas-todos.aml", "application/xml"); toast("AML (todos) gerado - importe no ARIS."); }
    else if (formato === "smartcopy") copiarTexto(arisSmartTSV(null));
    else { baixar(arisSmartLinhas(null), "gpex-e4-smart-design-todos.csv", "text/csv;charset=utf-8"); toast("Planilha (todos) gerada - cole no Smart Design do ARIS Express."); }
  }

  function guiaARIS() {
    return [
      "GUIA DE EXPORTAÇÃO PARA O ARIS - SEÇÃO DE LOGÍSTICA (E/4)",
      "Cmdo Bda Inf Amv",
      "",
      "1) ESCOLHA O PROCESSO",
      "   Em 'Processos e Riscos', selecione o processo e confira objetivo, etapas e riscos.",
      "   Ou, na aba 'Governança (EB10/EB20)', use o seletor do card 'Integração ARIS'.",
      "",
      "2) GERE O ARQUIVO",
      "   Em cada processo, logo abaixo do fluxograma, use a barra 'Exportar fluxograma para o ARIS'.",
      "   - BPMN 2.0 (.bpmn): formato aberto; importar no ARIS Cloud/ARIS Platform, bpmn.io ou Camunda.",
      "   - AML (.aml): EXPERIMENTAL - o formato pode não ser aceito pelo ARIS; gerar a partir de um AML de exemplo exportado do ARIS antes de usar (ver pendências no README).",
      "   - Smart Design (.csv): arquivo de planilha para o ARIS Express.",
      "   - Copiar planilha (ARIS Express): copia a planilha em colunas; cole com Ctrl+V no Smart Design.",
      "   - Copiar Mermaid: copia o fluxo em texto (Mermaid/EPC) para outra ferramenta.",
      "   BPMN e AML são ARQUIVOS (baixar e IMPORTAR no ARIS); Smart Design e texto (colar).",
      "   Para TODOS os fluxogramas de uma vez, use os botoes do card 'Integração ARIS'",
      "   (BPMN, AML/EPC, Smart Design ou 'Copiar planilha' com os 12 processos).",
      "",
      "3) IMPORTAR NO ARIS",
      "   ARIS Cloud / ARIS Platform:",
      "     a) Abra o repositorio (grupo) de destino.",
      "     b) Menu Importar > AML/BPMN e selecione o arquivo gerado.",
      "     c) Confira o modelo EPC criado e ajuste nomes/atributos, se necessario.",
      "   ARIS Express (gratuito):",
      "     a) NAO importa BPMN/EPC por XML; a importação nativa é Visio, ARISalign ou ADF.",
      "     b) Abra um modelo de Smart Design compatível (cadeia de valor / processo).",
      "     c) Clique em 'Copiar planilha (ARIS Express)' e cole com Ctrl+V na tabela do Smart Design",
      "        (colunas: Processo, Passo, Evento de entrada, Função, Evento de saída, Responsável, Sistema de apoio, Risco, Controle).",
      "     d) Salve em .adf para reutilizar.",
      "",
      "4) CONFERIR E PUBLICAR",
      "   - Revise eventos, funções, responsáveis e conexões.",
      "   - Registre a fonte (documento e item do Portal da Gestão) no modelo.",
      "   - Submeta a revisão humana antes de publicar.",
      "",
      "OBSERVAÇÕES",
      "   - Nada é enviado automaticamente; o domínio ase.cmse.eb.mil.br não recebe automação.",
      "   - Formatos recomendados: BPMN 2.0 (interoperabilidade) e AML (nativo ARIS).",
      "   - O Smart Design do ARIS Express tem limitações de tipos de modelo.",
      "   - Sistemas citados nos modelos: SISLOGMNT (manutenção) e SIGELOG (WEB) (suprimento/gestão patrimonial)."
    ].join("\n");
  }

  function planoRiscosTexto() {
    var riscos = DB.todosRiscos().slice().sort(function (a, b) { return b.valor - a.valor; });
    var l = [
      "PLANO DE GESTÃO DE RISCOS - SEÇÃO DE LOGÍSTICA (E/4 - 4ª Seção)",
      "Cmdo Bda Inf Amv",
      "Órgão: " + DB.governanca.orgao + " - subordinada ao " + DB.governanca.subordinacao,
      "Regimento Interno: finalidade (Art. 1º), missão (Art. 2º), competências (Art. 3º) e atribuições (Arts. 4º a 6º)",
      "Base legal de riscos: " + DB.riscoEB10.base,
      "Portfólio: " + DB.governanca.portfolio,
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
      l.push("   Categoria: " + r.categoria + " | Nível: " + r.nivel + " (P " + r.probabilidade + " x I " + r.impacto + " = " + r.valor + ")");
      l.push("   P: " + r.probabilidade + " - " + r.probabilidadeRotulo + " | I: " + r.impacto + " - " + r.impactoRotulo);
      l.push("   Causa: " + r.causa);
      l.push("   Consequencia: " + r.consequencia);
      l.push("   Controle/Mitigação: " + r.controle);
      l.push("   Resposta: " + r.resposta + " | Prazo: " + r.prazo + " | Responsavel: " + r.responsavel);
      l.push("   Indicador: " + r.indicador);
      l.push("");
    });
    l.push("VALIDACAO HUMANA OBRIGATORIA ANTES DE PUBLICAR NO ASE.");
    return l.join("\n");
  }

  function riscosCSV() {
    var cols = ["Processo", "Funcao_logistica", "Competencia_Art3", "Categoria", "Risco", "Causa", "Consequência", "Probabilidade", "P_rotulo", "Impacto", "I_rotulo", "Nível", "Inerente", "Residual", "Controle", "Resposta", "Status", "Prazo", "Responsável", "KRI", "Proxima_revisao"];
    function c(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
    var linhas = [cols.map(c).join(";")];
    DB.todosRiscos().slice().sort(function (a, b) { return b.valor - a.valor; }).forEach(function (r) {
      linhas.push([
        r.processo, r.funcaoLogistica, r.competencia, r.categoria, r.descricao, r.causa, r.consequencia,
        r.probabilidade, r.probabilidadeRotulo, r.impacto, r.impactoRotulo,
        r.nivel, r.riscoInerente, r.riscoResidual, r.controle, r.resposta, r.statusTratamento, r.prazo, r.responsavel, r.kri, r.proximaRevisao
      ].map(c).join(";"));
    });
    return "\ufeff" + linhas.join("\r\n");
  }

  function initGovernanca() {
    var g = DB.governanca;
    if ($("governancaHierarquia")) {
      $("governancaHierarquia").innerHTML = [
        ["Órgão", g.orgao], ["Subordinação", g.subordinacao], ["Portfólio", g.portfolio],
        ["Programa", g.programa], ["Macroprocesso", g.macroprocesso], ["Cadeia de valor", g.cadeiaValor]
      ].map(function (x) { return '<div class="hier-item"><span>' + esc(x[0]) + "</span><strong>" + esc(x[1]) + "</strong></div>"; }).join("");
    }

    if ($("tbodyGovernancaIndicadores")) {
      $("tbodyGovernancaIndicadores").innerHTML = DB.processos.map(function (p) {
        var gp = DB.governancaProcessos[p.id] || { tarefa: p.titulo, indicadores: [] };
        var v = DB.vinculoDe(p.id);
        return "<tr><td>" + esc(p.codigo) + "</td><td>" + esc(gp.tarefa || p.titulo) + "</td><td>" + esc(v.funcao || "-") +
          '</td><td><span class="tag">' + esc(v.competencia || "-") + "</span></td><td>" +
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

    if ($("btnGuiaAris")) $("btnGuiaAris").addEventListener("click", function () { copiarTexto(guiaARIS(), $("btnGuiaAris")); });
    if ($("btnGuiaArisTxt")) $("btnGuiaArisTxt").addEventListener("click", function () { baixarArquivo("guia-exportacao-aris.txt", guiaARIS()); });
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

    if ($("arisProcesso")) {
      $("arisProcesso").innerHTML = DB.processos.map(function (p) { return '<option value="' + p.id + '">' + esc(p.codigo + " - " + p.titulo) + "</option>"; }).join("");
      function arisSel() { return DB.processos.filter(function (x) { return x.id === $("arisProcesso").value; })[0] || DB.processos[0]; }
      if ($("arisBpmn")) $("arisBpmn").addEventListener("click", function () { exportarARIS(arisSel(), "bpmn"); });
      if ($("arisAml")) $("arisAml").addEventListener("click", function () { exportarARIS(arisSel(), "aml"); });
      if ($("arisSmart")) $("arisSmart").addEventListener("click", function () { exportarARIS(arisSel(), "smart"); });
      if ($("arisBpmnTodos")) $("arisBpmnTodos").addEventListener("click", function () { exportarARISTodos("bpmn"); });
      if ($("arisAmlTodos")) $("arisAmlTodos").addEventListener("click", function () { exportarARISTodos("aml"); });
      if ($("arisSmartTodos")) $("arisSmartTodos").addEventListener("click", function () { exportarARISTodos("smart"); });
      if ($("arisSmartCopy")) $("arisSmartCopy").addEventListener("click", function () { exportarARISTodos("smartcopy"); });
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
        "</td><td>" + nivelTag(r.nivel) + "</td><td>" + r.riscoInerente + "</td><td>" + r.riscoResidual +
        "</td><td><strong>" + esc(r.resposta) + "</strong></td><td>" + esc(r.statusTratamento) + "</td><td>" + esc(r.prazo) +
        "</td><td>" + esc(r.responsavel) + "</td><td>" + esc(r.kri) + "</td><td>" + esc(r.proximaRevisao) + "</td></tr>";
    }).join("") : '<tr><td colspan="10" class="vazio">Nenhum risco nos filtros selecionados.</td></tr>';

    if ($("governancaResumo")) {
      var porResp = {};
      riscos.forEach(function (r) { porResp[r.resposta] = (porResp[r.resposta] || 0) + 1; });
      $("governancaResumo").textContent = riscos.length + " riscos - " +
        DB.riscoEB10.respostas.map(function (x) { return x.codigo + ": " + (porResp[x.codigo] || 0); }).join(" | ");
    }
  }

  /* ---------------- REGIMENTO INTERNO ---------------- */
  var ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  function regimentoTexto() {
    var r = DB.regimento;
    var l = [r.titulo, r.unidade];
    if (r.modelo) l.push("*** " + (r.avisoModelo || "MODELO - substituir pelo Regimento oficial da OM.") + " ***");
    l.push("Subordinação: " + r.subordinacao, "");
    l.push("FINALIDADE E SUBORDINACAO (Art. 1º)"); l.push(r.finalidade); l.push("");
    l.push("MISSAO (Art. 2º)"); l.push(r.missao); l.push("");
    l.push("COMPETENCIAS (Art. 3º)");
    r.competencias.forEach(function (c) { l.push("  " + c.inciso + " - " + c.texto); });
    l.push("");
    r.atribuicoes.forEach(function (a) {
      l.push(a.cargo.toUpperCase() + " (" + a.artigo + ")");
      a.itens.forEach(function (it, i) { l.push("  " + ROMANOS[i] + " - " + it); });
      l.push("");
    });
    return l.join("\n");
  }

  function initRegimento() {
    var r = DB.regimento;
    if ($("regimentoFinalidade")) {
      $("regimentoFinalidade").innerHTML = "<p>" + esc(r.finalidade) + "</p>" +
        '<p style="margin-top:10px;"><strong>Subordinação:</strong> ' + esc(r.subordinacao) + "</p>";
    }
    if ($("regimentoMissao")) $("regimentoMissao").innerHTML = "<p>" + esc(r.missao) + "</p>";
    if ($("regimentoFuncoes")) {
      $("regimentoFuncoes").innerHTML = r.funcoesLogisticas.map(function (f) { return '<span class="tag">' + esc(f) + "</span>"; }).join(" ");
    }
    if ($("regimentoCompetencias")) {
      $("regimentoCompetencias").innerHTML = r.competencias.map(function (c) {
        var procs = DB.processos.filter(function (p) { return DB.vinculoDe(p.id).competencia === c.inciso; });
        return '<div class="comp-card"><div class="comp-top"><span class="comp-inc">Art. 3º, ' + esc(c.inciso) + '</span></div>' +
          "<p>" + esc(c.texto) + "</p>" +
          '<div class="comp-procs">' + (procs.length ? procs.map(function (p) { return '<button class="tag btn-proc" data-proc="' + p.id + '">' + esc(p.codigo) + "</button>"; }).join(" ") : '<span class="tag cinza">Sem processo vinculado</span>') + "</div></div>";
      }).join("");
      $("regimentoCompetencias").querySelectorAll("[data-proc]").forEach(function (b) {
        b.addEventListener("click", function () { irPara("processos", b.getAttribute("data-proc")); });
      });
    }
    if ($("regimentoAtribuicoes")) {
      $("regimentoAtribuicoes").innerHTML = r.atribuicoes.map(function (a) {
        return '<div class="atrib-card"><div class="atrib-top"><h3>' + esc(a.cargo) + '</h3><span class="tag">' + esc(a.artigo) + "</span></div>" +
          "<ol>" + a.itens.map(function (it, i) { return "<li><b>" + ROMANOS[i] + "</b> " + esc(it) + "</li>"; }).join("") + "</ol></div>";
      }).join("");
    }
    if ($("tbodyRegimentoVinculos")) {
      $("tbodyRegimentoVinculos").innerHTML = DB.processos.map(function (p) {
        var v = DB.vinculoDe(p.id);
        return "<tr><td>" + esc(p.codigo) + "</td><td>" + esc(p.titulo) + "</td><td>" + esc(v.funcao || "-") +
          "</td><td>" + esc(DB.sistemaDe(p.id)) + '</td><td><span class="tag">' + esc(v.competencia || "-") + "</span></td></tr>";
      }).join("");
    }
    if ($("regimentoSistemas")) {
      $("regimentoSistemas").innerHTML = DB.sistemas.map(function (s) {
        var procs = DB.processos.filter(function (p) { return DB.sistemaDe(p.id).indexOf(s.sigla.replace(" (WEB)", "")) !== -1; });
        return '<div class="fonte"><div class="n">' + esc(s.sigla) + " - " + esc(s.orgao) + '</div><div class="nome">' + esc(s.nome) + "</div>" +
          '<div class="desc">' + esc(s.finalidade) + "</div>" +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">Uso: ' + esc(s.uso) + " | Acesso: " + esc(s.acesso) + "</div>" +
          '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">' +
          procs.map(function (p) { return '<button class="tag btn-proc" data-proc="' + p.id + '">' + esc(p.codigo) + "</button>"; }).join(" ") +
          "</div>" +
          (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">Fonte pública</a>' : "") + "</div>";
      }).join("");
      $("regimentoSistemas").querySelectorAll("[data-proc]").forEach(function (b) {
        b.addEventListener("click", function () { irPara("processos", b.getAttribute("data-proc")); });
      });
    }
    if ($("btnRegimento")) $("btnRegimento").addEventListener("click", function () { copiarTexto(regimentoTexto(), $("btnRegimento")); });
    if ($("btnRegimentoTxt")) $("btnRegimentoTxt").addEventListener("click", function () { baixarArquivo("regimento-interno-e4.txt", regimentoTexto()); });
  }

  /* ---------------- RODAPÉ, TEMA, BACKUP, ICS E COMBUSTÍVEL ---------------- */
  function formatarData(iso) {
    var p = String(iso || "").split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }

  function initRodape() {
    var el = $("rodapeVersao");
    if (el) {
      el.textContent = "Versão " + DB.meta.versao + " - Última revisão: " + formatarData(DB.meta.atualizado) +
        " - " + DB.processos.length + " processos / " + DB.todosRiscos().length + " riscos";
    }
    var aviso = $("revisaoAviso");
    document.querySelectorAll("[data-qtd-processos]").forEach(function (e) { e.textContent = DB.processos.length; });
    if (aviso && DB.meta.atualizado) {
      var dias = Math.floor((Date.now() - new Date(DB.meta.atualizado + "T00:00:00").getTime()) / 86400000);
      var limite = DB.meta.revisaoValidadeDias || 90;
      if (dias > limite) {
        aviso.hidden = false;
        aviso.textContent = "Atenção: a última revisão do conteúdo foi há " + dias + " dias (limite de " + limite +
          " dias). Revisar os dados e atualizar a versão.";
      }
    }
    if ($("btnChangelog")) {
      $("btnChangelog").addEventListener("click", function () {
        var c = $("changelogConteudo");
        if (c) {
          c.innerHTML = (DB.meta.changelog || []).map(function (v) {
            return '<div class="fonte" style="margin-bottom:10px;"><div class="n">v' + esc(v.versao) + " - " + esc(v.data) +
              '</div><ul class="lista-simples">' + v.itens.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
          }).join("");
        }
        abrirOverlay("overlayChangelog");
      });
    }
  }

  function initTema() {
    var btn = $("btnTema");
    function aplicar(t) {
      document.documentElement.setAttribute("data-tema", t);
      try { localStorage.setItem("gpex_tema", t); } catch (e) { }
      if (btn) btn.setAttribute("aria-pressed", t === "escuro" ? "true" : "false");
    }
    var salvo = null;
    try { salvo = localStorage.getItem("gpex_tema"); } catch (e) { }
    if (!salvo) salvo = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "escuro" : "claro";
    aplicar(salvo);
    if (btn) btn.addEventListener("click", function () {
      aplicar(document.documentElement.getAttribute("data-tema") === "escuro" ? "claro" : "escuro");
    });
  }

  function initBackup() {
    if ($("btnBackup")) $("btnBackup").addEventListener("click", function () {
      var pacote = { sistema: "logistica-gpex", versao: DB.meta.versao, geradoEm: new Date().toISOString(), dados: {} };
      ["gpex_combustivel_v1", "gpex_calendario_v1", "gpex_tema", "gpex_tab"].forEach(function (k) {
        try { var v = localStorage.getItem(k); if (v !== null) pacote.dados[k] = v; } catch (e) { }
      });
      baixarArquivo("backup-gpex-e4.json", JSON.stringify(pacote, null, 2), "application/json");
      toast("Backup gerado.");
    });
    if ($("btnRestaurar") && $("arquivoBackup")) {
      $("btnRestaurar").addEventListener("click", function () { $("arquivoBackup").click(); });
      $("arquivoBackup").addEventListener("change", function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var p = JSON.parse(r.result);
            if (!p || !p.dados) throw new Error("formato");
            confirmar("Restaurar backup e substituir os dados locais deste navegador?", function () {
              Object.keys(p.dados).forEach(function (k) { try { localStorage.setItem(k, p.dados[k]); } catch (err) { } });
              toast("Backup restaurado. Recarregando...");
              setTimeout(function () { location.reload(); }, 900);
            });
          } catch (err) { toast("Arquivo de backup inválido."); }
        };
        r.readAsText(f);
      });
    }
  }

  function gerarICS() {
    function d8(d) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
    var agora = new Date();
    var l = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GPEX E4//Calendario de Obrigacoes//PT-BR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    for (var m = 0; m < 12; m++) {
      var base = new Date(agora.getFullYear(), agora.getMonth() + m, 1);
      var mes = base.getFullYear() + "-" + String(base.getMonth() + 1).padStart(2, "0");
      ocorrencias(mes).forEach(function (o) {
        var limpo = o.obrigacao.replace(/[;,\n]/g, " ");
        l.push("BEGIN:VEVENT");
        l.push("UID:gpex-e4-" + mes + "-" + o.dia + "-" + norm(o.obrigacao).replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "@bda-inf-amv");
        l.push("DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z");
        l.push("DTSTART;VALUE=DATE:" + d8(o.data));
        l.push("DTEND;VALUE=DATE:" + d8(new Date(o.data.getTime() + 86400000)));
        l.push("SUMMARY:" + limpo + " (" + o.periodicidade + ")");
        l.push("DESCRIPTION:Responsável: " + o.responsavel.replace(/[;,\n]/g, " ") + " - Processo " + o.processo);
        if (o.periodicidade !== "Diária") {
          l.push("BEGIN:VALARM", "TRIGGER:-P5D", "ACTION:DISPLAY", "DESCRIPTION:Lembrete: " + limpo, "END:VALARM");
        }
        l.push("END:VEVENT");
      });
    }
    l.push("END:VCALENDAR");
    return l.join("\r\n");
  }

  function initICS() {
    if ($("btnICS")) $("btnICS").addEventListener("click", function () {
      baixarArquivo("calendario-obrigacoes-e4.ics", gerarICS(), "text/calendar;charset=utf-8");
      toast("Calendário .ics gerado (12 meses).");
    });
  }

  function relatorioCombustivel() {
    var mes = cbo.mes;
    var itens = cbo.itens.filter(function (it) { return it.data.slice(0, 7) === mes; })
      .sort(function (a, b) { return a.data.localeCompare(b.data); });
    var kml = consumos();
    var total = itens.reduce(function (a, it) { return a + it.litros; }, 0);
    var cota = Number(cbo.cota) || 0;
    var linhas = itens.map(function (it) {
      return "<tr><td>" + esc(it.data) + "</td><td>" + esc(it.viatura) + "</td><td>" + esc(it.tipo) + "</td><td>" +
        it.litros.toFixed(2) + "</td><td>" + (it.km || "-") + "</td><td>" + (kml[it.id] || "-") + "</td><td>" + esc(it.resp || "-") + "</td></tr>";
    }).join("");
    var html = "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'><title>Relatório de Combustível - E/4</title>" +
      "<style>body{font-family:'Segoe UI',Arial,sans-serif;color:#24301a;padding:24px}h1{font-size:18px}h2{font-size:14px;color:#556b2f}" +
      "table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px;text-align:left}" +
      "th{background:#eef3df}.rodape{margin-top:20px;font-size:11px;color:#555}</style></head><body>" +
      "<h1>Relatório Mensal de Combustível (Classe III)</h1>" +
      "<p>4ª Seção / E/4 (Seção de Logística) - Cmdo Bda Inf Amv<br>Mês: " + esc(mes) + "</p>" +
      "<h2>Resumo</h2><p>Total abastecido: <strong>" + total.toFixed(2) + " L</strong> - Cota: <strong>" + (cota ? cota.toFixed(0) + " L (" + Math.round(total / cota * 100) + "%)" : "não informada") + "</strong></p>" +
      "<h2>Abastecimentos</h2><table><thead><tr><th>Data</th><th>Viatura</th><th>Tipo</th><th>Litros</th><th>Hodômetro</th><th>Km/L</th><th>Responsável</th></tr></thead><tbody>" + linhas + "</tbody></table>" +
      "<div class='rodape'>Documento de trabalho - sujeito a revisão humana. Gerado em " + new Date().toLocaleString("pt-BR") + ".</div>" +
      "</body></html>";
    var w = window.open("", "_blank");
    if (!w) { toast("Permita pop-ups para gerar o relatório."); return; }
    w.document.write(html); w.document.close(); w.focus(); w.print();
  }

  function cboExportarCSV() {
    function c(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
    var linhas = [["Data", "Viatura", "Tipo", "Litros", "Hodometro", "Responsavel"].map(c).join(";")];
    cbo.itens.slice().sort(function (a, b) { return a.data.localeCompare(b.data); }).forEach(function (it) {
      linhas.push([it.data, it.viatura, it.tipo, it.litros, it.km, it.resp].map(c).join(";"));
    });
    baixarArquivo("combustivel-e4.csv", "\ufeff" + linhas.join("\r\n"), "text/csv;charset=utf-8");
    toast("CSV de combustível gerado.");
  }

  function cboImportarCSV(texto) {
    var linhas = texto.replace(/\r/g, "").split("\n").filter(function (l) { return l.trim(); });
    var importados = 0, erros = 0;
    linhas.forEach(function (l, idx) {
      if (idx === 0 && /data/i.test(l)) return;
      var campos = l.split(/[;,]/).map(function (s) { return s.replace(/^"|"$/g, "").trim(); });
      if (campos.length < 4) { erros++; return; }
      var data = campos[0], viatura = campos[1], tipo = campos[2] || "Outros", litros = Number(String(campos[3]).replace(",", ".")), km = Number(campos[4]) || 0, resp = campos[5] || "";
      if (!viatura || !(litros > 0)) { erros++; return; }
      cbo.itens.push({ id: novoId(), data: data, viatura: viatura, tipo: tipo, litros: litros, km: km, resp: resp });
      importados++;
    });
    salvarCbo(); renderCombustivel();
    toast("Importados: " + importados + " registro(s)" + (erros ? " | ignorados: " + erros : ""));
  }

  /* ---------------- boot ---------------- */
  try { initVisao(); } catch (e) { console.error(e); }
  try { initProcessos(); } catch (e) { console.error(e); }
  try { initMatriz(); } catch (e) { console.error(e); }
  try { initCombustivel(); } catch (e) { console.error(e); }
  try { initCalendario(); } catch (e) { console.error(e); }
  try { initGovernanca(); } catch (e) { console.error(e); }
  try { initRegimento(); } catch (e) { console.error(e); }
  try { initFontes(); } catch (e) { console.error(e); }
  try { initRodape(); } catch (e) { console.error(e); }
  try { initTema(); } catch (e) { console.error(e); }
  try { initBackup(); } catch (e) { console.error(e); }
  try { initICS(); } catch (e) { console.error(e); }
  try { initBusca(); } catch (e) { console.error(e); }
  try { aplicarRota(); } catch (e) { console.error(e); }
})();
