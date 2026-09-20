/*
 * Base de dados GPEX / Gestão de Risco - 4ª Seção / E/4 (Seção de Logística)
 * Cmdo Bda Inf Amv - Metodologia GPEX / Projeto Piloto 2.0 (CMSE / ASE)
 *
 * Fontes: Regimento Interno da E/4 (Arts. 1º a 6º), Portais da Gestão
 * (EME / CMSE / Bda Inf Amv), GPEX, R-1 (RISG) art. 34-35,
 * MC 4.0 Log Mil Ter, EB70-MC-10.317.
 *
 * IMPORTANTE: modelos de referência. Ajustar ao processo real da OM e
 * submeter a revisão humana antes de publicar no ASE.
 */
window.GPEX_E4 = (function () {
  "use strict";

  var ORG = "E/4 (4ª Seção)";
  var ORG_CURTO = "E/4";

  var meta = {
    titulo: "Mapeamento de Processos e Gestão de Riscos",
    subtitulo: "4ª Seção / E/4 (Seção de Logística) - Cmdo Bda Inf Amv",
    metodologia: "GPEX / Projeto Piloto 2.0 de Mapeamento de Processos (CMSE)",
    versao: "2.1.0",
    atualizado: "2026-09-18",
    revisaoValidadeDias: 90,
    apetiteRisco: "Baixo",
    changelog: [
      { versao: "2.1.0", data: "2026-09-18", itens: ["P0: corrige &apos; no escXml, datas em fuso local, identificadores ASCII, remove órfãos e unifica id = código (E4-01 a E4-12)", "P1: normas com situação/verificadoEm; EB20-D-11.001 como provável revogada; Regimento marcado como MODELO", "P4: id único no combustível, prefers-color-scheme/reduced-motion, PWA; AML rotulado como experimental"] },
      { versao: "2.0.0", data: "2026-09-18", itens: ["Versionamento, PWA offline, JSON validado e testes", "Campos de risco (inerente/residual, KRI, próxima revisão)", "Exportações .ics, backup JSON e relatório de combustível"] },
      { versao: "1.1.0", data: "2026-09-18", itens: ["Ajuste ao Regimento Interno (Arts. 1º a 6º)", "Sistemas SisLogMnt e SIGELOG (WEB)"] },
      { versao: "1.0.0", data: "2026-09-18", itens: ["Versão inicial: 12 processos, matriz P×I, exportações ARIS"] }
    ],
    org: ORG,
    orgCurto: ORG_CURTO,
    subordinacao: "Chefe do Estado-Maior da Brigada (Ch EM Bda)",
    aviso:
      "Aviso: o domínio ase.cmse.eb.mil.br e as intranets citadas são de acesso restrito. " +
      "O preenchimento no ASE é manual, por usuário autorizado. Este sistema apenas prepara o " +
      "conteúdo (dados do processo, etapas, fluxo, matriz de riscos e resumo) para colagem."
  };

  /* Regimento Interno da 4ª Seção / E/4 - Arts. 1º a 6º. */
  var regimento = {
    titulo: "Regimento Interno - 4ª Seção / E/4 (Seção de Logística)",
    modelo: true,
    avisoModelo: "MODELO de referência - NÃO é o Regimento oficial. Substituir pelo Regimento Interno oficial da OM antes de publicar. Conteúdo não verificado (arts. e redação a conferir).",
    unidade: "Comando da Brigada de Infantaria Aeromóvel",
    subordinacao: "Chefe do Estado-Maior da Brigada (Ch EM Bda)",
    finalidade:
      "A 4ª Seção / E/4 e o órgão de apoio de Estado-Maior encarregado do planejamento, da coordenação, " +
      "da direção e do controle das atividades logísticas da Brigada, subordinando-se diretamente ao " +
      "Chefe do Estado-Maior da Brigada (Ch EM Bda).",
    missao:
      "Assegurar o planejamento e a execução do apoio logístico as Organizações Militares (OM) subordinadas " +
      "e diretamente apoiadas, garantindo os suprimentos, os serviços e as manutenções necessarios as " +
      "operações e a rotina administrativa.",
    competencias: [
      { inciso: "I", texto: "Planejar e coordenar as funções logísticas de suprimento, transporte, manutenção, saúde, engenharia e serviços gerais." },
      { inciso: "II", texto: "Acompanhar e controlar a execução orçamentária e financeira afeta a área logística." },
      { inciso: "III", texto: "Orientar e supervisionar os órgãos executivos e às OM subordinadas no tocante a gestão patrimonial, carga, descarga e controle de material." },
      { inciso: "IV", texto: "Manter atualizada a apreciação de situação logística e elaborar os anexos logísticos dos planos e ordens de operações." },
      { inciso: "V", texto: "Coordenar o apoio de saúde, evacuação medica e o funcionamento do sistema logístico em campanha e em tempo de paz." },
      { inciso: "VI", texto: "Manter intercâmbio contínuo com o Escalão Superior (Divisão de Exército / Comando Militar de Área) e com as OMDS apoiadas." }
    ],
    atribuicoes: [
      {
        cargo: "Chefe da E/4",
        artigo: "Art. 4º",
        itens: [
          "Dirigir, orientar e fiscalizar os trabalhos de toda a Seção.",
          "Assessorar o Comandante e o Chefe do Estado-Maior da Brigada em todos os assuntos atinentes a logística.",
          "Distribuir as tarefas entre os adjuntos e auxiliares, acompanhando o cumprimento dos prazos.",
          "Estabelecer diretrizes para a elaboracao de planos logísticos e controle de estoques e dotações.",
          "Representar a Brigada em reuniões e comissões de carater logístico, quando determinado."
        ]
      },
      {
        cargo: "Adjunto da E/4",
        artigo: "Art. 5º",
        itens: [
          "Substituir o Chefe da Seção em seus impedimentos legais e eventuais.",
          "Coordenar a elaboracao de documentos, relatórios e expedientes diários da Seção.",
          "Controlar o fluxo de correspondências, boletins e processos administrativos.",
          "Acompanhar a execução das diretrizes logísticas junto às OM subordinadas."
        ]
      },
      {
        cargo: "Auxiliares (Sargentos/Subtenentes)",
        artigo: "Art. 6º",
        itens: [
          "Executar o expediente, o arquivamento e a guarda de documentos sigilosos e ostensivos da Seção.",
          "Manter atualizados os quadros de controle de suprimentos, manutenções, movimentação de viaturas e cargas.",
          "Confeccionar minutas de boletins, partes, ofícios e notas relativas a sua área específica de atuação."
        ]
      }
    ],
    funcoesLogisticas: ["Suprimento", "Transporte", "Manutenção", "Saúde", "Engenharia", "Serviços Gerais"]
  };

  /* Vínculo de cada processo a competência (Art. 3º) e a função logística (Art. 3º, I). */
  var vinculoRegimento = {
    "E4-01": { competencia: "I", funcao: "Suprimento" },
    "E4-02": { competencia: "I", funcao: "Manutenção" },
    "E4-03": { competencia: "I", funcao: "Transporte" },
    "E4-04": { competencia: "V", funcao: "Saúde" },
    "E4-05": { competencia: "III", funcao: "Serviços Gerais" },
    "E4-06": { competencia: "II", funcao: "Suprimento" },
    "E4-07": { competencia: "IV", funcao: "Serviços Gerais" },
    "E4-08": { competencia: "III", funcao: "Suprimento" },
    "E4-09": { competencia: "III", funcao: "Manutenção" },
    "E4-10": { competencia: "III", funcao: "Suprimento" },
    "E4-11": { competencia: "III", funcao: "Suprimento" },
    "E4-12": { competencia: "I", funcao: "Suprimento" }
  };

  /* Sistemas corporativos de apoio logístico (TIC) utilizados pela E/4. */
  var sistemas = [
    {
      sigla: "SISLOGMNT",
      nome: "Sistema Logístico de Manutenção (SisLogMnt)",
      orgao: "Diretoria de Material (D Mat)",
      finalidade: "Controle da operação e da manutenção dos Materiais de Emprego Militar (MEM), com enfase na Classe IX (motomecanizados e blindados): cadastro de viaturas, emissao de ordens de serviço, controle de estoque de peças e manutenção preventiva/corretiva.",
      uso: "Manutenção e motomecanização (Classe IX).",
      acesso: "Ambiente restrito do Exército",
      url: "https://bdex.eb.mil.br/jspui/bitstream/123456789/9581/1/majkothe2021_3t.artigo.pdf"
    },
    {
      sigla: "SIGELOG (WEB)",
      nome: "Sistema Integrado de Gestão Logística",
      orgao: "Comando Logístico (COLOG)",
      finalidade: "Sistema corporativo de gestão do ciclo logístico do MEM e das classes de suprimento, da aquisição ao desfazimento; sucede o SISCOFIS, o SICATEx e o SISDOT e apoia o cadastramento de necessidades logísticas.",
      uso: "Suprimento, catalogação, dotação, gestão patrimonial e desfazimento.",
      acesso: "Ambiente restrito do Exército",
      url: "https://www.colog.eb.mil.br/images/documentos/menus/2025/Folder_SIGELOG3.pdf"
    }
  ];

  var sistemaPorProcesso = {
    "E4-01": "SIGELOG (WEB)",
    "E4-02": "SISLOGMNT",
    "E4-03": "-",
    "E4-04": "SIGELOG (WEB)",
    "E4-05": "SISLOGMNT + SIGELOG (WEB)",
    "E4-06": "SIGELOG (WEB)",
    "E4-07": "-",
    "E4-08": "SIGELOG (WEB)",
    "E4-09": "SISLOGMNT",
    "E4-10": "SIGELOG (WEB)",
    "E4-11": "SIGELOG (WEB)",
    "E4-12": "SIGELOG (WEB)"
  };

  function sistemaDe(id) { return sistemaPorProcesso[id] || "-"; }

  /* Prazo de próxima revisão do risco (ISO 31000 / EB10-P-01.004), a partir da data-base. */
  function diasRevisao(nivel) {
    return (nivel === "Extremo" || nivel === "Alto") ? 90 : nivel === "Médio" ? 180 : 365;
  }
  function dataRevisao(nivel) {
    var base = new Date((meta.atualizado || "2026-01-01") + "T00:00:00");
    base.setDate(base.getDate() + diasRevisao(nivel));
    return base.getFullYear() + "-" + String(base.getMonth() + 1).padStart(2, "0") + "-" + String(base.getDate()).padStart(2, "0");
  }
  /* Risco residual estimado (após o controle pretendido). Valor de referência - a eficácia
     real do controle deve ser verificada pela S/4 (marcado "VERIFICAR NA FONTE"). */
  function riscoResidual(p, i, nivel) {
    var fator = (nivel === "Extremo" || nivel === "Alto") ? 0.6 : nivel === "Médio" ? 0.7 : 0.9;
    return Math.max(1, Math.round(p * i * fator));
  }

  function competenciaTexto(inciso) {
    for (var i = 0; i < regimento.competencias.length; i++) {
      if (regimento.competencias[i].inciso === inciso) return regimento.competencias[i].texto;
    }
    return "";
  }
  function vinculoDe(id) { return vinculoRegimento[id] || { competencia: "", funcao: "" }; }

  var escala = [
    { min: 1, max: 4, nome: "Baixo", cor: "verde", acao: "Aceitar e monitorar periodicamente." },
    { min: 5, max: 9, nome: "Médio", cor: "amarelo", acao: "Reduzir com controles e monitorar." },
    { min: 10, max: 14, nome: "Alto", cor: "laranja", acao: "Tratamento prioritário, com responsável e prazo." },
    { min: 15, max: 25, nome: "Extremo", cor: "vermelho", acao: "Tratamento imediato e decisão do Cmt." }
  ];

  /* Modelo de riscos conforme EB10-P-01.004 (2ª ed., 2018) e EB20-D-02.010 (2019).
     Escala 5x5: Nível = Probabilidade x Impacto. Matriz obrigatória para tarefas
     de maior complexidade. Resposta: Evitar, Reduzir, Compartilhar ou Aceitar. */
  var riscoEB10 = {
    base: "EB10-P-01.004 (Política de Riscos do Exército, 2ª ed., 2018) e EB20-D-02.010 (Diretriz Reguladora da Política de Gestão de Riscos, 2019)",
    probabilidade: [
      { n: 1, rotulo: "Raro", descricao: "Pode ocorrer somente em circunstâncias excepcionais." },
      { n: 2, rotulo: "Improvável", descricao: "Pode ocorrer em algum momento, com baixa frequência." },
      { n: 3, rotulo: "Possível", descricao: "Pode ocorrer em algum momento." },
      { n: 4, rotulo: "Provável", descricao: "Provavelmente ocorrerá na maioria das circunstâncias." },
      { n: 5, rotulo: "Quase certo", descricao: "Espera-se que ocorra na maioria das circunstâncias." }
    ],
    impacto: [
      { n: 1, rotulo: "Insignificante", descricao: "Consequência irrelevante ao processo." },
      { n: 2, rotulo: "Menor", descricao: "Consequência pequena, absorvida pela rotina." },
      { n: 3, rotulo: "Moderado", descricao: "Compromete parcialmente o resultado do processo." },
      { n: 4, rotulo: "Maior", descricao: "Compromete o resultado e exige decisão do escalão superior." },
      { n: 5, rotulo: "Extremo", descricao: "Inviabiliza o processo, gera responsabilização ou risco à vida." }
    ],
    respostas: [
      { codigo: "Evitar", descricao: "Eliminar a causa ou não executar a atividade de risco." },
      { codigo: "Reduzir", descricao: "Adotar controles que diminuam probabilidade e/ou impacto." },
      { codigo: "Compartilhar", descricao: "Transferir/partilhar o risco com outro órgão ou escalão." },
      { codigo: "Aceitar", descricao: "Conviver com o risco, mantendo monitoramento." }
    ],
    categorias: [
      "Estratégico", "Operacional", "Logístico", "Financeiro/Orçamentário",
      "Integridade/Conformidade", "Pessoas", "Imagem/Reputação", "Segurança/Ambiental"
    ]
  };

  /* Hierarquia de dados GPEX (EB10-P-01.007 / EB20-N-11.002): Portfólio > Programa > Macroprocesso >
     Processo > Tarefa. Indicadores de desempenho associados a cada processo. */
  var governança = {
    portfolio: "Portfólio de Apoio Logístico - Cmdo Bda Inf Amv",
    programa: "Programa de Apoio Logístico da Brigada",
    cadeiaValor: "Macroprocesso de Apoio Logístico (Cadeia de Valor Agregado do EB)",
    macroprocesso: "Gestão Logística",
    orgao: ORG,
    subordinacao: "Ch EM Bda",
    comite: "Estado-Maior da Brigada"
  };

  var governancaProcessos = {
    "E4-01": { tarefa: "Garantir o suprimento das classes I, III e V às OMDS", indicadores: ["Prazo médio de atendimento do pedido (dias)", "Percentual de itens entregues na data prevista"] },
    "E4-02": { tarefa: "Executar a manutenção de 2º escalão de viaturas e armamento", indicadores: ["Índice de disponibilidade da frota (%)", "Tempo médio de reparo (dias)"] },
    "E4-03": { tarefa: "Planejar e executar comboios logísticos", indicadores: ["Comboios realizados no prazo (%)", "Ocorrências de avaria/extravio de carga (nº)"] },
    "E4-04": { tarefa: "Garantir o suprimento de saúde e a evacuação", indicadores: ["Itens de Classe VIII dentro da validade (%)", "Tempo médio de evacuação (min)"] },
    "E4-05": { tarefa: "Recuperar material danificado (salvamento)", indicadores: ["Índice de recuperação de material (%)", "Processos de baixa instruídos corretamente (%)"] },
    "E4-06": { tarefa: "Controlar combustíveis e lubrificantes (Classe III)", indicadores: ["Consumo real x cota (%)", "Média de consumo da frota (km/L)"] },
    "E4-07": { tarefa: "Controlar o calendário de obrigações da seção", indicadores: ["Obrigações cumpridas no prazo (%)", "Atrasos justificados (nº)"] },
    "E4-08": { tarefa: "Requisitar e distribuir munição (Classe V)", indicadores: ["Divergência de munição requisitada x devolvida (nº)", "Requisições no prazo do órgão provedor (%)"] },
    "E4-09": { tarefa: "Prover peças de reposição de viaturas (Classe IX)", indicadores: ["Viaturas paradas por falta de peça (nº)", "Tempo médio de reposição de peça (dias)"] },
    "E4-10": { tarefa: "Executar o desfazimento de material", indicadores: ["Processos de desfazimento sem nulidade (%)", "Itens inservíveis identificados no semestre (nº)"] },
    "E4-11": { tarefa: "Suprir fardamento e equipamento individual (Classe II)", indicadores: ["Praças com Classe II completa (%)", "Divergências de registro por ficha individual (nº)"] },
    "E4-12": { tarefa: "Acompanhar as demais classes de suprimento", indicadores: ["Classes com responsável e rotina definidos (%)", "Rupturas pontuais por classe (nº)"] }
  };

  /* Marcos (milestones) padrão do ciclo de gestão de um processo E/4. */
  var marcosModelo = [
    { ordem: 1, marco: "Mapeamento do processo elaborado", produto: "Processo + matriz de riscos", prazo: "T0" },
    { ordem: 2, marco: "Validação pelo chefe da seção", produto: "Processo validado", prazo: "T0 + 15 dias" },
    { ordem: 3, marco: "Publicação no ASE/GPEx", produto: "Processo publicado", prazo: "T0 + 30 dias" },
    { ordem: 4, marco: "Monitoramento e revisão", produto: "Relatório de acompanhamento", prazo: "Semestral" }
  ];

  var VERBOS_TAREFA = [
    "garantir", "assegurar", "executar", "realizar", "elaborar", "planejar", "controlar",
    "manter", "prestar", "prevenir", "requisitar", "distribuir", "prover", "suprir",
    "acompanhar", "identificar", "registrar", "fiscalizar", "vistoriar", "conferir",
    "verificar", "reportar", "atualizar", "consolidar", "encaminhar", "receber",
    "aplicar", "baixar", "solicitar", "recuperar", "integrar", "programar"
  ];

  /* Valida a nomenclatura padrão de tarefa: Verbo de ação + Objeto + Complemento. */
  function validarTarefa(título) {
    var t = String(título || "").trim();
    var r = { ok: false, verbo: "", objeto: "", complemento: "", mensagem: "" };
    if (!t) { r.mensagem = "Informe o título da tarefa."; return r; }
    var palavras = t.split(/\s+/);
    var primeira = palavras[0].toLowerCase();
    var ehVerbo = VERBOS_TAREFA.indexOf(primeira) !== -1 || /(ar|er|ir)$/.test(primeira);
    if (!ehVerbo) {
      r.mensagem = 'A tarefa deve iniciar com verbo de ação no infinitivo (ex.: "Controlar", "Elaborar").';
      return r;
    }
    r.verbo = palavras[0];
    if (palavras.length < 3) {
      r.mensagem = "Estrutura mínima: Verbo de ação + Objeto + Complemento.";
      return r;
    }
    r.objeto = palavras[1];
    r.complemento = palavras.slice(2).join(" ");
    r.ok = true;
    r.mensagem = "Nomenclatura conforme: Verbo de ação + Objeto + Complemento.";
    return r;
  }

  /* Valida consistência logica de cronograma (inicio <= fim; marcos dentro do intervalo). */
  function validarCronograma(inicio, fim, marco) {
    var r = { ok: true, avisos: [] };
    if (!inicio || !fim) { r.ok = false; r.avisos.push("Informe as datas de início e término."); return r; }
    var di = new Date(inicio + "T00:00:00"), df = new Date(fim + "T00:00:00");
    if (isNaN(di) || isNaN(df)) { r.ok = false; r.avisos.push("Data inválida."); return r; }
    if (df < di) { r.ok = false; r.avisos.push("Término anterior ao início (inconsistência de cronograma)."); }
    if (marco) {
      var dm = new Date(marco + "T00:00:00");
      if (!isNaN(dm) && (dm < di || dm > df)) { r.ok = false; r.avisos.push("Marco fora do intervalo início-término."); }
    }
    if (r.ok) r.avisos.push("Cronograma consistente.");
    return r;
  }

  function probabilidadeRotulo(n) {
    for (var i = 0; i < riscoEB10.probabilidade.length; i++) if (riscoEB10.probabilidade[i].n === Number(n)) return riscoEB10.probabilidade[i].rotulo;
    return "";
  }
  function impactoRotulo(n) {
    for (var i = 0; i < riscoEB10.impacto.length; i++) if (riscoEB10.impacto[i].n === Number(n)) return riscoEB10.impacto[i].rotulo;
    return "";
  }
  function respostaPara(nível) {
    if (nível === "Extremo") return "Evitar";
    if (nível === "Alto") return "Reduzir";
    if (nível === "Médio") return "Reduzir";
    return "Aceitar";
  }
  function prazoPara(nível) {
    if (nível === "Extremo") return "Imediato (até 30 dias)";
    if (nível === "Alto") return "Curto prazo (até 90 dias)";
    if (nível === "Médio") return "Médio prazo (até 180 dias)";
    return "Contínuo / monitoramento";
  }
  var categoriaPorArea = {
    "Suprimento": "Logístico",
    "Suprimento / Segurança": "Logístico",
    "Suprimento / Segurança": "Logístico",
    "Suprimento / Combustível": "Logístico",
    "Suprimento / Combustível": "Logístico",
    "Suprimento / Manutenção": "Logístico",
    "Suprimento / Manutenção": "Logístico",
    "Suprimento / Patrimônio": "Financeiro/Orçamentário",
    "Suprimento / Patrimônio": "Financeiro/Orçamentário",
    "Manutenção": "Operacional",
    "Manutenção": "Operacional",
    "Segurança": "Segurança/Ambiental",
    "Segurança": "Segurança/Ambiental",
    "Engenharia / Meio ambiente": "Segurança/Ambiental",
    "Engenharia": "Operacional",
    "Coordenação / Suprimento": "Operacional",
    "Coordenação / Suprimento": "Operacional",
    "Transporte": "Operacional",
    "Recursos Humanos": "Pessoas",
    "Saúde": "Pessoas",
    "Saúde": "Pessoas",
    "Salvamento": "Operacional",
    "Patrimônio": "Financeiro/Orçamentário",
    "Patrimônio": "Financeiro/Orçamentário",
    "Gestão / Controle interno": "Integridade/Conformidade",
    "Gestão / Controle interno": "Integridade/Conformidade"
  };
  function categoriaDe(área) { return categoriaPorArea[área] || "Operacional"; }

  var fontes = [
    {
      item: 1, nome: "PGE Bda Inf Amv 2024-2027",
      descricao: "Plano de Gestão Estratégica da Brigada.",
      acesso: "Intranet Bda Inf Amv - Portais da Gestão"
    },
    {
      item: 2, nome: "Plano de Gestão OMDS",
      descricao: "Plano de gestão da organização militar.",
      acesso: "Intranet Bda Inf Amv - Portais da Gestão"
    },
    {
      item: 3, nome: "PGC Bda Amv",
      descricao: "Plano de Gestão de Contratacoes.",
      acesso: "Intranet Bda Inf Amv - Portais da Gestão"
    },
    {
      item: 4, nome: "Plano de Gestão de Riscos - Integridade e Controle OMDS",
      descricao: "Riscos de integridade e controle da OM.",
      acesso: "Intranet Bda Inf Amv - Portais da Gestão"
    },
    { item: 5, nome: "Capacitação GPEX", descricao: "Treinamento na metodologia GPEX.", acesso: "Intranet Bda Inf Amv" },
    { item: 6, nome: "Capacitação Processos Organizacionais", descricao: "Mapeamento de processos.", acesso: "Intranet Bda Inf Amv" },
    { item: 7, nome: "Capacitação Gestão de Riscos", descricao: "Metodologia de gestão de riscos.", acesso: "Intranet Bda Inf Amv" },
    { item: 8, nome: "Capacitação ARIS Express", descricao: "Modelagem de processos (EPC).", acesso: "Intranet Bda Inf Amv" },
    { item: 9, nome: "Memento ARIS Express", descricao: "Guia rapido da ferramenta ARIS.", acesso: "Intranet Bda Inf Amv" },
    { item: 10, nome: "Legislação de Governança", descricao: "Normas de governança aplicaveis.", acesso: "Intranet Bda Inf Amv" },
    { item: 11, nome: "Legislação de Gestão de Riscos", descricao: "Normas de gestão de riscos.", acesso: "Intranet Bda Inf Amv" },
    { item: 12, nome: "Ordens de Serviço / Instrução / Notas de coordenação", descricao: "Atos internos da OM.", acesso: "Intranet Bda Inf Amv" },
    { item: 13, nome: "Acesso ao GPEX", descricao: "Portal da Governança e Gestão do EME.", url: "https://gpex.eb.mil.br/#init" },
    { item: 14, nome: "Acesso Projeto Piloto de Mapeamento de Processo CMSE", descricao: "Sistema ASE (login manual).", url: "http://ase.cmse.eb.mil.br/ase/processos-2.0-OM/login.php?return=true" },
    { item: 15, nome: "Modelos de Documentos", descricao: "Modelos oficiais de documentos.", acesso: "Intranet Bda Inf Amv" },
    { item: 16, nome: "Processos Prioritários das Seções Mapeados", descricao: "Processos ja mapeados pelas seções.", acesso: "Intranet Bda Inf Amv" },
    { item: 17, nome: "Portais da Gestão", descricao: "Pagina 17 da intranet - índice dos portais.", acesso: "Intranet Bda Inf Amv" }
  ];

  var doutrina = [
    {
      sigla: "Regimento Interno",
      titulo: "Regimento Interno da 4ª Seção / E/4",
      aplicacao: "Finalidade e subordinação (Art. 1º), missão (Art. 2º), competências (Art. 3º, I a VI) e atribuições dos integrantes (Arts. 4º a 6º)."
    },
    {
      sigla: "R-1 (RISG)",
      titulo: "Regulamento Interno e dos Serviços Gerais",
      aplicacao: "Atribuições da E/4 (art. 34-35): suprimento, manutenção, transporte, engenharia, serviços gerais e apoio as demais funções logísticas."
    },
    {
      sigla: "MC 4.0 Log Mil Ter",
      titulo: "Doutrina de Logística Militar Terrestre",
      aplicacao: "Funções logísticas: Suprimento, Manutenção, Transporte, Engenharia, Salvamento, Recursos Humanos e Saúde."
    },
    {
      sigla: "EB70-MC-10.317",
      titulo: "Manual de Campanha do Batalhão Logístico",
      aplicacao: "Organização e emprego do B Log de apoio às OMDS da Brigada."
    },
    {
      sigla: "GPEX / EME",
      titulo: "Portal da Governança e Gestão do EME",
      aplicacao: "Metodologia de mapeamento de processos e Política de Gestão de Riscos.",
      url: "https://portalgovernanca.eme.eb.mil.br/"
    },
    {
      sigla: "EB20-N-11.002",
      titulo: "Normas para Implementação da Política de Governança do Exército",
      aplicacao: "Normas de implementação da governança (substitui a EB20-D-11.001). Número da portaria própria: VERIFICAR NA FONTE.",
      url: ""
    },
    {
      sigla: "EB10-P-01.007",
      titulo: "Política de Governança do Exército (Portaria C Ex nº 2.508, de 14/07/2025)",
      aplicacao: "Política de governança que orienta processos, riscos e controles internos.",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/GESTAO%20ORGANIZACIONAL/NORMAS/port_2508-c%20ex_pltc_governanca_eb10-p-01.007.pdf"
    },
    {
      sigla: "Port. 2.430-C Ex",
      titulo: "Programa de Integridade do Exército",
      aplicacao: "Base para os riscos de integridade e controle (Plano de Gestão de Riscos OMDS).",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/port_2430_c_ex_prg_integridade_2025%201.pdf"
    },
    {
      sigla: "ASE / CMSE",
      titulo: "Projeto Piloto 2.0 de Mapeamento de Processos",
      aplicacao: "Fluxo de preenchimento e publicação dos processos organizacionais no ASE."
    }
  ];

  var classes = [
    { classe: "I", nome: "Víveres", area: "Suprimento", processo: "E4-01" },
    { classe: "II", nome: "Fardamento e equipamento individual", area: "Suprimento", processo: "E4-11" },
    { classe: "III", nome: "Combustíveis e lubrificantes", area: "Suprimento", processo: "E4-06" },
    { classe: "IV", nome: "Material de construcao", area: "Suprimento", processo: "E4-12" },
    { classe: "V", nome: "Munição", area: "Suprimento", processo: "E4-08" },
    { classe: "VI", nome: "Material diverso (geradores, embarcacoes)", area: "Suprimento", processo: "E4-12" },
    { classe: "VII", nome: "Material principal / comunicacoes", area: "Suprimento", processo: "E4-12" },
    { classe: "VIII", nome: "Material de saúde", area: "Suprimento / Saúde", processo: "E4-04" },
    { classe: "IX", nome: "Peças de reposicao de viaturas", area: "Suprimento / Manutenção", processo: "E4-09" },
    { classe: "X", nome: "Materiais de outras classes", area: "Suprimento", processo: "E4-12" }
  ];

  var processos = [
    {
      id: "E4-01",
      codigo: "E4-01",
      titulo: "Suprimento (Classes I, III e V) às OMDS da Bda",
      area: "Suprimento",
      classes: ["I", "III", "V"],
      objetivo:
        "Garantir o abastecimento contínuo das OMDS da Bda nas Classes I (víveres), " +
        "III (combustível/lubrificantes) e V (munição), conforme os níveis de suprimento estabelecidos.",
      etapas: [
        "Levantar as necessidades de suprimento junto às OMDS",
        "Consolidar o pedido de suprimento da Bda",
        "Encaminhar o pedido ao Batalhão Logístico (B Log)",
        "Receber e conferir o material entregue pelo B Log",
        "Distribuir o material às OMDS solicitantes",
        "Atualizar a escrituração e os níveis de estoque"
      ],
      responsaveis: ["E/4 (gestão)", "OMDS da Bda (levantamento)", "B Log (provedor)"],
      riscos: [
        {
          descricao: "Ruptura de estoque de uma classe de suprimento",
          causa: "Levantamento de necessidades feito com atraso/incompleto",
          consequencia: "OMDS sem suprimento na data prevista",
          probabilidade: 3,
          impacto: 4,
          controle: "Padronizar prazo/formulário de levantamento; acompanhar níveis de estoque semanalmente"
        },
        {
          descricao: "Recebimento de material fora de especificação ou danificado",
          causa: "Falha na conferência no recebimento",
          consequencia: "Material inutilizável chega às OMDS",
          probabilidade: 2,
          impacto: 3,
          controle: "Checklist de conferência obrigatório no recebimento"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "MC 4.0 Log Mil Ter", "EB70-MC-10.317"]
    },
    {
      id: "E4-02",
      codigo: "E4-02",
      titulo: "Manutenção de viaturas e armamento (2º escalão)",
      area: "Manutenção",
      classes: ["IX"],
      objetivo:
        "Assegurar que viaturas e armamento estejam em condições de emprego, por meio da " +
        "manutenção preventiva e corretiva de 2º escalão.",
      etapas: [
        "Programar inspeções técnicas periódicas do material",
        "Executar a manutenção de 1º escalão nas OMDS",
        "Encaminhar material que exige manutenção de 2º escalão a oficina",
        "Realizar a manutenção de 2º escalão",
        "Registrar os trabalhos executados e atualizar a escrituração",
        "Devolver o material à OMDS de origem"
      ],
      responsaveis: ["E/4 (gestão)", "Oficina de manutenção", "OMDS da Bda"],
      riscos: [
        {
          descricao: "Viatura/armamento fora de uso por atraso na manutenção",
          causa: "Falta de peças de reposicao ou ferramental na oficina",
          consequencia: "Reducao da capacidade operacional da OMDS",
          probabilidade: 3,
          impacto: 4,
          controle: "Antecipar pedido de peças criticas; manter estoque mínimo"
        },
        {
          descricao: "Acidente durante a manutenção",
          causa: "Uso incorreto de EPI/dispositivos de segurança na oficina",
          consequencia: "Lesão a militar ou dano a equipamento",
          probabilidade: 2,
          impacto: 4,
          controle: "Fiscalização do uso de EPI; instrução periódica"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "MC 4.0 Log Mil Ter", "EB70-MC-10.317"]
    },
    {
      id: "E4-03",
      codigo: "E4-03",
      titulo: "Transporte - planejamento e execução de comboio logístico",
      area: "Transporte",
      classes: ["III"],
      objetivo:
        "Planejar e executar o transporte de suprimento, material e pessoal entre a Bda, o B Log " +
        "e às OMDS, com segurança e no prazo previsto.",
      etapas: [
        "Levantar a necessidade de transporte (carga, volume, prazo)",
        "Planejar o itinerário e escalar viaturas e motoristas",
        "Verificar as condições de segurança das viaturas antes da saída",
        "Executar o deslocamento/comboio",
        "Conferir a carga na chegada ao destino",
        "Registrar consumo de combustível e ocorrências da viagem"
      ],
      responsaveis: ["E/4", "Chefe do comboio", "Motoristas escalados"],
      riscos: [
        {
          descricao: "Atraso ou acidente no deslocamento do comboio",
          causa: "Planejamento de itinerário sem levantamento previo",
          consequencia: "Atraso na entrega ou dano a viatura/carga/pessoal",
          probabilidade: 2,
          impacto: 4,
          controle: "Reconhecimento previo de itinerário; briefing de segurança"
        },
        {
          descricao: "Extravio ou avaria de carga durante o transporte",
          causa: "Fixação inadequada da carga na viatura",
          consequencia: "Perda de material e necessidade de reposicao",
          probabilidade: 2,
          impacto: 3,
          controle: "Checklist de carregamento e amarração da carga"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter", "EB70-MC-10.317", "R-1 (RISG) art. 34-35"]
    },
    {
      id: "E4-04",
      codigo: "E4-04",
      titulo: "Saúde (função logística) - suprimento e evacuação",
      area: "Saúde",
      classes: ["VIII"],
      objetivo:
        "Garantir o suprimento de material de saúde (Classe VIII) e a capacidade de evacuação " +
        "de militares doentes/feridos.",
      etapas: [
        "Levantar a necessidade de material de saúde junto a FS",
        "Solicitar reposicao do material de Classe VIII",
        "Verificar disponibilidade de viatura/meio de evacuação",
        "Planejar o fluxo de evacuação em atividades de campo/instrução",
        "Registrar consumo e validade dos medicamentos controlados"
      ],
      responsaveis: ["E/4", "Farmácia / Formação Sanitária (FS)"],
      riscos: [
        {
          descricao: "Indisponibilidade de meio de evacuação em atividade de campo",
          causa: "Ausencia de viatura/ambulância escalada para a atividade",
          consequencia: "Atraso no atendimento a militar acidentado",
          probabilidade: 2,
          impacto: 5,
          controle: "Escalar meio de evacuação dedicado em exercícios de risco"
        },
        {
          descricao: "Medicamento vencido ou fora de especificação em uso",
          causa: "Falha no controle de validade do estoque",
          consequencia: "Risco a saúde do militar atendido",
          probabilidade: 2,
          impacto: 4,
          controle: "Controle periódico de validade (FEFO) e registro de descarte"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter (função Saúde)", "Legislação sanitária"]
    },
    {
      id: "E4-05",
      codigo: "E4-05",
      titulo: "Salvamento - recuperacao de material danificado",
      area: "Salvamento",
      classes: ["IX"],
      objetivo:
        "Recuperar o máximo de material danificado (viaturas, armamento, equipamento) e dar a " +
        "destinação correta ao que não for recuperável.",
      etapas: [
        "Identificar e classificar o material danificado",
        "Encaminhar o material recuperável a oficina de manutenção",
        "Providenciar a baixa/descarte do material irrecuperável",
        "Registrar o resultado do salvamento e atualizar a escrituração"
      ],
      responsaveis: ["E/4", "Equipe de salvamento", "Oficina"],
      riscos: [
        {
          descricao: "Material recuperável descartado indevidamente",
          causa: "Classificação incorreta na triagem inicial",
          consequencia: "Prejuízo patrimonial e reposicao desnecessaria",
          probabilidade: 2,
          impacto: 3,
          controle: "Dupla avaliação técnica antes da decisão de baixa"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter (função Salvamento)", "Legislação patrimonial"]
    },
    {
      id: "E4-06",
      codigo: "E4-06",
      titulo: "Classe III - controle de combustíveis e lubrificantes",
      area: "Suprimento / Combustível",
      classes: ["III"],
      objetivo:
        "Garantir o suprimento e o controle rigoroso do consumo de combustíveis e lubrificantes " +
        "(Classe III) das viaturas e geradores da Bda.",
      etapas: [
        "Levantar o consumo mensal previsto por OMDS/viatura",
        "Solicitar a cota de combustível ao órgão provedor",
        "Controlar o abastecimento no posto de abastecimento da OM",
        "Registrar o consumo por viatura (km rodado x litros)",
        "Conferir mensalmente o saldo de cota x consumo real",
        "Reportar desvios de consumo ao Cmt"
      ],
      responsaveis: ["E/4", "Fiscal do posto de abastecimento", "OMDS da Bda"],
      riscos: [
        {
          descricao: "Consumo de combustível acima da cota sem justificativa",
          causa: "Ausencia de registro sistematico de abastecimento por viatura",
          consequencia: "Estouro de cota e falta de combustível no fim do período",
          probabilidade: 3,
          impacto: 3,
          controle: "Controle diário de abastecimento por viatura; conferência semanal do saldo de cota"
        },
        {
          descricao: "Desvio ou uso indevido de combustível",
          causa: "Fragilidade no controle de saída do posto de abastecimento",
          consequencia: "Prejuízo patrimonial e responsabilização",
          probabilidade: 2,
          impacto: 4,
          controle: "Registro assinado de cada abastecimento; auditoria periódica"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter", "Plano de Gestão de Riscos - Integridade e Controle OMDS"]
    },
    {
      id: "E4-07",
      codigo: "E4-07",
      titulo: "Controle do calendário de obrigações da Seção de Logística",
      area: "Gestão / Controle interno",
      classes: [],
      objetivo:
        "Assegurar o cumprimento, dentro do prazo, de todas as obrigações periódicas da 4ª Seção " +
        "(relatórios, prestações de contas, inventários, mapas, inspeções).",
      etapas: [
        "Levantar todas as obrigações periódicas do E/4 e suas periodicidades",
        "Consolidar o calendário anual de obrigações",
        "Definir responsável e prazo de antecedência para cada item",
        "Acompanhar mensalmente o cumprimento do calendário",
        "Registrar e justificar eventuais atrasos",
        "Atualizar o calendário conforme novas exigencias do escalão superior"
      ],
      responsaveis: ["E/4", "Encarregado do controle interno"],
      riscos: [
        {
          descricao: "Não cumprimento de prazo de obrigação periódica",
          causa: "Ausencia de calendário consolidado e de responsável por item",
          consequencia: "Cobranca do escalão superior e responsabilização",
          probabilidade: 3,
          impacto: 3,
          controle: "Calendário unico acompanhado mensalmente, com aviso de antecedência (ex.: 10 dias antes do vencimento)"
        },
        {
          descricao: "Duplicidade ou lacuna entre obrigações de diferentes classes",
          causa: "Falta de consolidação unica do calendário do E/4",
          consequencia: "Retrabalho ou item esquecido",
          probabilidade: 2,
          impacto: 2,
          controle: "Centralizar o calendário em um unico responsável, com revisão trimestral"
        }
      ],
      fontes: ["Plano de Gestão OMDS", "Legislação de Governança", "Ordens de Serviço / Instrução / Notas de coordenação"]
    },
    {
      id: "E4-08",
      codigo: "E4-08",
      titulo: "Classe V - requisição e distribuição de munição",
      area: "Suprimento",
      classes: ["V"],
      objetivo:
        "Garantir a requisição, o recebimento e a distribuição da munição necessaria a instrução " +
        "e ao emprego das OMDS da Bda (complementa o processo de custodia/segurança no paiol).",
      etapas: [
        "Levantar a necessidade de munição por atividade/OMDS",
        "Elaborar e encaminhar a requisição de Classe V ao órgão provedor",
        "Receber e conferir o lote de munição recebido",
        "Distribuir a munição às OMDS conforme autorização",
        "Recolher e registrar as sobras/estojos após a atividade",
        "Atualizar o controle de consumo por lote"
      ],
      responsaveis: ["E/4", "Órgão provedor (B Log)", "OMDS da Bda"],
      riscos: [
        {
          descricao: "Divergência entre munição requisitada, distribuida e devolvida",
          causa: "Falha no registro de distribuição/recolhimento por atividade",
          consequencia: "Responsabilização e dificuldade de auditoria",
          probabilidade: 2,
          impacto: 5,
          controle: "Ficha de controle de distribuição/devolução assinada"
        },
        {
          descricao: "Atraso na chegada da munição para atividade programada",
          causa: "Requisição feita fora do prazo do órgão provedor",
          consequencia: "Cancelamento ou remarcacao da atividade de instrução",
          probabilidade: 2,
          impacto: 3,
          controle: "Prazo mínimo padronizado de antecedência para requisição"
        }
      ],
      fontes: ["EB70-MC-10.317", "Normas técnicas de munição", "MC 4.0 Log Mil Ter"]
    },
    {
      id: "E4-09",
      codigo: "E4-09",
      titulo: "Classe IX - motomecanização (peças de reposicao de viaturas)",
      area: "Suprimento / Manutenção",
      classes: ["IX"],
      objetivo:
        "Garantir a disponibilidade de peças de reposicao (Classe IX) necessarias a manutenção " +
        "das viaturas da Bda, evitando indisponibilidade prolongada de material.",
      etapas: [
        "Identificar a peça necessaria a partir da ordem de manutenção",
        "Verificar disponibilidade em estoque local",
        "Requisitar a peça ao órgão provedor, quando não houver em estoque",
        "Receber e conferir a peça recebida",
        "Aplicar a peça na viatura e encerrar a ordem de manutenção",
        "Atualizar o controle de estoque de peças criticas"
      ],
      responsaveis: ["E/4", "Oficina de manutenção", "Órgão provedor"],
      riscos: [
        {
          descricao: "Viatura parada por falta de peça de reposicao",
          causa: "Ausencia de estoque mínimo de peças criticas/recorrentes",
          consequencia: "Reducao prolongada da frota disponível",
          probabilidade: 3,
          impacto: 4,
          controle: "Definir e manter estoque mínimo das peças de maior recorrencia de troca"
        },
        {
          descricao: "Peça recebida incompativel com a viatura",
          causa: "Erro na identificação/código da peça na requisição",
          consequencia: "Atraso adicional na manutenção e retrabalho",
          probabilidade: 2,
          impacto: 2,
          controle: "Dupla checagem do código/especificação antes da requisição"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter", "EB70-MC-10.317", "R-1 (RISG) art. 34-35"]
    },
    {
      id: "E4-10",
      codigo: "E4-10",
      titulo: "Desfazimento de material (baixa patrimonial)",
      area: "Patrimônio",
      classes: [],
      objetivo:
        "Realizar o desfazimento (baixa, alienação, doação ou destruição) de material inservível, " +
        "obsoleto ou irrecuperável, conforme a legislação patrimonial vigente.",
      etapas: [
        "Identificar e relacionar o material candidato a desfazimento",
        "Solicitar parecer técnico sobre a condição do material",
        "Instruir o processo de desfazimento conforme normas patrimoniais",
        "Submeter o processo a autoridade competente para decisão",
        "Executar a destinação definida (alienação, doação, destruição)",
        "Baixar o material da escrituração patrimonial"
      ],
      responsaveis: ["E/4", "Comissão de desfazimento", "Autoridade competente"],
      riscos: [
        {
          descricao: "Desfazimento sem a instrução processual completa",
          causa: "Falta de parecer técnico ou de documentacao exigida",
          consequencia: "Nulidade do processo e responsabilização do agente",
          probabilidade: 2,
          impacto: 4,
          controle: "Checklist de documentos obrigatórios antes de submeter o processo"
        },
        {
          descricao: "Material irrecuperável mantido indevidamente na carga",
          causa: "Ausencia de rotina periódica de identificação de itens",
          consequencia: "Ocupação de espaço e distorção do inventário",
          probabilidade: 2,
          impacto: 2,
          controle: "Levantamento periódico (semestral/anual) de itens candidatos a desfazimento"
        }
      ],
      fontes: ["Legislação patrimonial", "Plano de Gestão de Riscos - Integridade e Controle OMDS"]
    },
    {
      id: "E4-11",
      codigo: "E4-11",
      titulo: "Classe II - fardamento e equipamento individual",
      area: "Suprimento",
      classes: ["II"],
      objetivo:
        "Garantir o suprimento, a distribuição e o controle de fardamento e equipamento " +
        "individual (Classe II) ao efetivo da Bda.",
      etapas: [
        "Levantar a necessidade de fardamento por incorporação/reposicao",
        "Consolidar e encaminhar o pedido de Classe II",
        "Receber e conferir o material recebido",
        "Distribuir o fardamento/equipamento às OMDS e praças",
        "Registrar a distribuição na ficha individual",
        "Controlar a reposicao por desgaste/troca de tamanho"
      ],
      responsaveis: ["E/4", "Almoxarife", "SU"],
      riscos: [
        {
          descricao: "Praça sem fardamento completo para formatura/instrução",
          causa: "Atraso no levantamento de necessidades após incorporação",
          consequencia: "Apresentação inadequada e prejuízo a instrução",
          probabilidade: 3,
          impacto: 2,
          controle: "Levantamento de tamanhos/necessidades ja na incorporação"
        },
        {
          descricao: "Divergência entre fardamento distribuido e registrado",
          causa: "Falha no registro individual de distribuição",
          consequencia: "Dificuldade de responsabilização em caso de extravio",
          probabilidade: 2,
          impacto: 2,
          controle: "Ficha individual assinada a cada distribuição"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "MC 4.0 Log Mil Ter"]
    },
    {
      id: "E4-12",
      codigo: "E4-12",
      titulo: "Outras classes de suprimento (IV, VI, VII, VIII e X)",
      area: "Suprimento",
      classes: ["IV", "VI", "VII", "VIII", "X"],
      objetivo:
        "Acompanhar de forma consolidada o suprimento das demais classes não tratadas em modelos " +
        "específicos: Classe IV (material de construcao), VI (diversos - geradores, embarcacoes etc.), " +
        "VII (material principal/comunicacoes), VIII (saúde, quando não tratado pela FS) e X (outras classes).",
      etapas: [
        "Identificar, para cada classe, o material sob responsabilidade do E/4",
        "Levantar as necessidades específicas de cada classe junto às OMDS",
        "Consolidar e priorizar os pedidos por classe e criticidade",
        "Encaminhar as requisições aos órgãos provedores correspondentes",
        "Receber, conferir e distribuir o material recebido",
        "Manter escrituração separada por classe de suprimento"
      ],
      responsaveis: ["E/4", "SU", "Órgãos provedores"],
      riscos: [
        {
          descricao: "Classe de suprimento sem acompanhamento sistematico",
          causa: "Ausencia de responsável/rotina para classes de menor volume",
          consequencia: "Necessidades não identificadas a tempo, gerando ruptura pontual",
          probabilidade: 2,
          impacto: 3,
          controle: "Definir responsável e rotina mínima por classe"
        },
        {
          descricao: "Mistura de escrituração entre classes distintas",
          causa: "Falta de padronizacao no registro por classe",
          consequencia: "Dificuldade de auditoria e de prestação de contas",
          probabilidade: 2,
          impacto: 2,
          controle: "Padronizar planilha/registro por classe de suprimento"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter", "EB70-MC-10.317", "R-1 (RISG) art. 34-35"]
    }
  ];

  var tratamentoRisco = [
    { etapa: "1. Identificação", descricao: "Identificar os riscos do processo e suas fontes (interno/externo)." },
    { etapa: "2. Análise", descricao: "Analisar causa, consequência, probabilidade e impacto de cada risco." },
    { etapa: "3. Avaliação", descricao: "Comparar o nível de risco (P x I) com os critérios da OM e priorizar." },
    { etapa: "4. Tratamento", descricao: "Definir controle/mitigação, responsável e prazo; escolher a resposta: Evitar, Reduzir, Compartilhar ou Aceitar." },
    { etapa: "5. Monitoramento", descricao: "Acompanhar indicadores, reavaliar periodicamente e reportar ao Cmt." }
  ];

  var calendario = [
    { obrigacao: "Conferência do saldo de cota de combustível (Classe III)", periodicidade: "Semanal", responsavel: "Fiscal do posto", antecedencia: 2, processo: "E4-06" },
    { obrigacao: "Registro/consolidação de abastecimento por viatura", periodicidade: "Semanal", responsavel: "Fiscal do posto", antecedencia: 2, processo: "E4-06" },
    { obrigacao: "Saldo de cota x consumo real de combustível", periodicidade: "Mensal", responsavel: "E4", antecedencia: 5, processo: "E4-06" },
    { obrigacao: "Acompanhamento do calendário de obrigações do E4", periodicidade: "Mensal", responsavel: "Encarregado de controle interno", antecedencia: 10, processo: "E4-07" },
    { obrigacao: "Relatório mensal de manutenção (viaturas/armamento)", periodicidade: "Mensal", responsavel: "Oficina / E4", antecedencia: 5, processo: "E4-02" },
    { obrigacao: "Reconciliação de munição distribuida/recolhida (Classe V)", periodicidade: "Mensal", responsavel: "E4", antecedencia: 5, processo: "E4-08" },
    { obrigacao: "Controle de validade de medicamentos (Classe VIII / FEFO)", periodicidade: "Mensal", responsavel: "FS / E4", antecedencia: 5, processo: "E4-04" },
    { obrigacao: "Revisão do calendário unico de obrigações do E4", periodicidade: "Trimestral", responsavel: "E4", antecedencia: 10, processo: "E4-07" },
    { obrigacao: "Levantamento de material candidato a desfazimento", periodicidade: "Semestral", responsavel: "Comissão de desfazimento", antecedencia: 15, processo: "E4-10" },
    { obrigacao: "Consolidação anual de necessidades (fardamento, víveres, combustível)", periodicidade: "Anual", responsavel: "E4", antecedencia: 30, processo: "E4-11" },
    { obrigacao: "Revisão do mapeamento de processos/riscos no ASE (GPEX)", periodicidade: "Anual", responsavel: "E4", antecedencia: 30, processo: "E4-07" }
  ];

  var combustível = {
    tipos: ["Diesel S10", "Diesel S500", "Gasolina", "Etanol", "ARLA 32", "Óleo lubrificante", "Outros"],
    descricao:
      "Controle da Classe III. Registre cada abastecimento com viatura, hodômetro e litros. " +
      "O sistema calcula o consumo (km/L) e compara o total abastecido com a cota do período.",
    unidades: ["km/L", "L"]
  };

  /* Normas de referência para conformidade do cadastro no GPEx/ASE. */
  var normas = [
    {
      codigo: "EB10-P-01.004", titulo: "Política de Gestão de Riscos do Exército Brasileiro",
      edicao: "2ª ed., 2018", portaria: "Portaria C Ex nº 004, de 03/01/2019 (BE nº 32, de 09/08/2019)", data: "2019-01-03",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/Port004-CmtEx_3jan19.pdf",
      situacao: "vigente", verificadoEm: "2026-09-18",
      aplicacao: "Modelagem de riscos: probabilidade, impacto/severidade, nível (P x I) e plano de resposta (evitar, reduzir, compartilhar, aceitar).",
      observacao: "Consultada no Portal da Governança; conferir vigência no Boletim do Exército antes de publicar."
    },
    {
      codigo: "EB20-D-02.010", titulo: "Diretriz Reguladora da Política de Gestão de Riscos do Exército",
      edicao: "1ª ed., 2019", portaria: "Portaria nº 225-EME, de 26/07/2019", data: "2019-07-26",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/Port225-EME_26jul19.pdf",
      situacao: "vigente", verificadoEm: "2026-09-18",
      aplicacao: "Orientação metodológica para identificação, análise, avaliação, tratamento e monitoramento dos riscos.",
      observacao: "Consultada no Portal da Governança; conferir vigência no Boletim do Exército."
    },
    {
      codigo: "EB20-D-07.089", titulo: "Metodologia de Gestão de Riscos do Exército Brasileiro",
      edicao: "1ª ed. (conferir)", portaria: "Citada na Portaria C Ex nº 004/2019", data: "",
      url: "", situacao: "verificar", verificadoEm: "",
      aplicacao: "Metodologia de gestão de riscos do EB (probabilidade, impacto, níveis e respostas).",
      observacao: "Não localizada em fonte pública: confirmar código, edição e vigência antes de citar."
    },
    {
      codigo: "EB10-P-01.007", titulo: "Política de Governança do Exército Brasileiro",
      edicao: "2ª ed., 2025", portaria: "Portaria C Ex nº 2.508, de 14/07/2025", data: "2025-07-14",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/GESTAO%20ORGANIZACIONAL/NORMAS/port_2508-c%20ex_pltc_governanca_eb10-p-01.007.pdf",
      situacao: "vigente", verificadoEm: "2026-09-18",
      aplicacao: "Política de governança; base para processos, riscos e controles internos.",
      observacao: "Substitui a citação anterior de EB20-D-11.001 como norma de governança vigente."
    },
    {
      codigo: "EB20-N-11.002", titulo: "Normas para Implementação da Política de Governança do Exército Brasileiro",
      edicao: "1ª ed., 2025", portaria: "VERIFICAR NA FONTE (revoga a Portaria EME/C Ex nº 465/2021)", data: "",
      url: "", situacao: "verificar", verificadoEm: "",
      aplicacao: "Normas de implementação da governança; substitui a Diretriz de Governança e Gestão (D-11.001).",
      observacao: "Informar o número da portaria própria desta norma (campo pendente)."
    },
    {
      codigo: "EB20-D-11.001", titulo: "Diretriz de Governança e Gestão do Exército Brasileiro",
      edicao: "1ª ed., 2021", portaria: "Portaria EME/C Ex nº 465, de 09/08/2021", data: "2021-08-09",
      url: "", situacao: "provavel-revogada", verificadoEm: "",
      aplicacao: "Documento histórico (governança e gestão). NÃO tratar como vigente.",
      observacao: "Provavelmente REVOGADA pela EB20-N-11.002; confirmar no Boletim do Exército."
    },
    {
      codigo: "EB10-P-01.014", titulo: "Missão do Exército (Plano) - SIPLEx, ciclo 2024-2027",
      edicao: "1ª ed., 2023", portaria: "Portaria C Ex nº 2.146, de 20/12/2023", data: "2023-12-20",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/PROCESSOS/NORMAS/PORTARIA_C_Ex_2146_DE_20_DE_DEZEMBRO_DE_2023.pdf",
      situacao: "vigente", verificadoEm: "2026-09-18",
      aplicacao: "Alinhamento estratégico e de portfólio institucional (objetivos estratégicos).",
      observacao: "Consultada no Portal da Governança; conferir vigência no Boletim do Exército."
    },
    {
      codigo: "EB10-P-01.027", titulo: "Programa de Integridade do Exército Brasileiro",
      edicao: "1ª ed., 2025", portaria: "Portaria C Ex nº 2.430, de 24/02/2025", data: "2025-02-24",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/port_2430_c_ex_prg_integridade_2025%201.pdf",
      situacao: "vigente", verificadoEm: "2026-09-18",
      aplicacao: "Riscos de integridade e controles internos.",
      observacao: "Consultada no Portal da Governança; conferir vigência no Boletim do Exército."
    },
    {
      codigo: "EB20-P-11.001", titulo: "Plano de Integridade do Exército Brasileiro",
      edicao: "2ª ed., 2025", portaria: "Portaria EME/C Ex nº 1.493, de 25/02/2025", data: "2025-02-25",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/port_1493_eme_pl_integridade_2025%201.pdf",
      situacao: "vigente", verificadoEm: "2026-09-18",
      aplicacao: "Medidas de integridade e conformidade aplicáveis à E/4.",
      observacao: "Revoga a Portaria 316-EME/2018 (conferir no BE)."
    },
    {
      codigo: "EB20-D-01.016", titulo: "Diretriz de Racionalização Administrativa do Exército Brasileiro",
      edicao: "1ª ed., 2014", portaria: "Portaria nº 295-EME, de 17/12/2014", data: "2014-12-17",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/PROCESSOS/NORMAS/Portaria_295_EME.pdf",
      situacao: "verificar", verificadoEm: "2026-09-18",
      aplicacao: "Mapeamento e melhoria de processos organizacionais.",
      observacao: "Confirmar vigência e pertinência para a E/4."
    }
  ];

  function nivelRisco(p, i) {
    var v = (Number(p) || 0) * (Number(i) || 0);
    for (var k = 0; k < escala.length; k++) {
      if (v >= escala[k].min && v <= escala[k].max) return escala[k];
    }
    return escala[0];
  }

  function todosRiscos() {
    var out = [];
    processos.forEach(function (proc) {
      var gp = governancaProcessos[proc.id] || { tarefa: proc.titulo, indicadores: [] };
      proc.riscos.forEach(function (r, idx) {
        var n = nivelRisco(r.probabilidade, r.impacto);
        out.push({
          id: proc.id + "-r" + (idx + 1),
          processoId: proc.id,
          processo: proc.codigo + " - " + proc.titulo,
          area: proc.area,
          descricao: r.descricao,
          causa: r.causa,
          consequencia: r.consequencia,
          probabilidade: r.probabilidade,
          probabilidadeRotulo: probabilidadeRotulo(r.probabilidade),
          impacto: r.impacto,
          impactoRotulo: impactoRotulo(r.impacto),
          valor: r.probabilidade * r.impacto,
          nivel: n.nome,
          cor: n.cor,
          controle: r.controle,
          resposta: respostaPara(n.nome),
          responsavel: (proc.responsaveis && proc.responsaveis.length) ? proc.responsaveis[0] : "E/4",
          prazo: prazoPara(n.nome),
          categoria: categoriaDe(proc.area),
          indicador: (gp.indicadores && gp.indicadores.length) ? gp.indicadores[0] : "Monitorar indicadores do processo",
          tarefa: gp.tarefa || proc.titulo,
          competencia: vinculoDe(proc.id).competencia,
          funcaoLogistica: vinculoDe(proc.id).funcao,
          sistema: sistemaDe(proc.id),
          riscoInerente: r.probabilidade * r.impacto,
          riscoResidual: riscoResidual(r.probabilidade, r.impacto, n.nome),
          eficaciaControle: r.controle ? "Pretendida (verificar eficácia)" : "Inexistente",
          statusTratamento: (n.nome === "Extremo" || n.nome === "Alto") ? "Em tratamento prioritário" : n.nome === "Médio" ? "Em tratamento" : "Aceito / monitorado",
          apetite: meta.apetiteRisco,
          kri: (gp.indicadores && gp.indicadores.length) ? gp.indicadores[0] : "Definir KRI",
          proximaRevisao: dataRevisao(n.nome),
          diasRevisao: diasRevisao(n.nome)
        });
      });
    });
    return out;
  }

  return {
    meta: meta,
    escala: escala,
    fontes: fontes,
    doutrina: doutrina,
    normas: normas,
    riscoEB10: riscoEB10,
    governanca: governança,
    governancaProcessos: governancaProcessos,
    marcosModelo: marcosModelo,
    classes: classes,
    processos: processos,
    tratamentoRisco: tratamentoRisco,
    calendario: calendario,
    combustivel: combustível,
    nivelRisco: nivelRisco,
    todosRiscos: todosRiscos,
    validarTarefa: validarTarefa,
    validarCronograma: validarCronograma,
    probabilidadeRotulo: probabilidadeRotulo,
    impactoRotulo: impactoRotulo,
    respostaPara: respostaPara,
    prazoPara: prazoPara,
    categoriaDe: categoriaDe,
    regimento: regimento,
    vinculoRegimento: vinculoRegimento,
    vinculoDe: vinculoDe,
    competenciaTexto: competenciaTexto,
    sistemas: sistemas,
    sistemaPorProcesso: sistemaPorProcesso,
    sistemaDe: sistemaDe,
    diasRevisao: diasRevisao,
    dataRevisao: dataRevisao,
    riscoResidual: riscoResidual
  };
})();
