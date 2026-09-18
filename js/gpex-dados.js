/*
 * Base de dados GPEX / Gestao de Risco - 4a Secao / E/4 (Secao de Logistica)
 * Cmdo Bda Inf Amv - Metodologia GPEX / Projeto Piloto 2.0 (CMSE / ASE)
 *
 * Fontes: Regimento Interno da E/4 (Arts. 1o a 6o), Portais da Gestao
 * (EME / CMSE / Bda Inf Amv), GPEX, R-1 (RISG) art. 34-35,
 * MC 4.0 Log Mil Ter, EB70-MC-10.317.
 *
 * IMPORTANTE: modelos de referencia. Ajustar ao processo real da OM e
 * submeter a revisao humana antes de publicar no ASE.
 */
window.GPEX_E4 = (function () {
  "use strict";

  var ORG = "E/4 (4a Secao)";
  var ORG_CURTO = "E/4";

  var meta = {
    titulo: "Mapeamento de Processos e Gestao de Riscos",
    subtitulo: "4a Secao / E/4 (Secao de Logistica) - Cmdo Bda Inf Amv",
    metodologia: "GPEX / Projeto Piloto 2.0 de Mapeamento de Processos (CMSE)",
    versao: "1.1.0",
    atualizado: "2026-09-18",
    org: ORG,
    orgCurto: ORG_CURTO,
    subordinacao: "Chefe do Estado-Maior da Brigada (Ch EM Bda)",
    aviso:
      "Aviso: o dominio ase.cmse.eb.mil.br e as intranets citadas sao de acesso restrito. " +
      "O preenchimento no ASE e manual, por usuario autorizado. Este sistema apenas prepara o " +
      "conteudo (dados do processo, etapas, fluxo, matriz de riscos e resumo) para colagem."
  };

  /* Regimento Interno da 4a Secao / E/4 - Arts. 1o a 6o. */
  var regimento = {
    titulo: "Regimento Interno - 4a Secao / E/4 (Secao de Logistica)",
    unidade: "Comando da Brigada de Infantaria Aeromovel",
    subordinacao: "Chefe do Estado-Maior da Brigada (Ch EM Bda)",
    finalidade:
      "A 4a Secao / E/4 e o orgao de apoio de Estado-Maior encarregado do planejamento, da coordenacao, " +
      "da direcao e do controle das atividades logisticas da Brigada, subordinando-se diretamente ao " +
      "Chefe do Estado-Maior da Brigada (Ch EM Bda).",
    missao:
      "Assegurar o planejamento e a execucao do apoio logistico as Organizacoes Militares (OM) subordinadas " +
      "e diretamente apoiadas, garantindo os suprimentos, os servicos e as manutencoes necessarios as " +
      "operacoes e a rotina administrativa.",
    competencias: [
      { inciso: "I", texto: "Planejar e coordenar as funcoes logisticas de suprimento, transporte, manutencao, saude, engenharia e servicos gerais." },
      { inciso: "II", texto: "Acompanhar e controlar a execucao orcamentaria e financeira afeta a area logistica." },
      { inciso: "III", texto: "Orientar e supervisionar os orgaos executivos e as OM subordinadas no tocante a gestao patrimonial, carga, descarga e controle de material." },
      { inciso: "IV", texto: "Manter atualizada a apreciacao de situacao logistica e elaborar os anexos logisticos dos planos e ordens de operacoes." },
      { inciso: "V", texto: "Coordenar o apoio de saude, evacuacao medica e o funcionamento do sistema logistico em campanha e em tempo de paz." },
      { inciso: "VI", texto: "Manter intercambio continuo com o Escalao Superior (Divisao de Exercito / Comando Militar de Area) e com as unidades apoiadas." }
    ],
    atribuicoes: [
      {
        cargo: "Chefe da E/4",
        artigo: "Art. 4o",
        itens: [
          "Dirigir, orientar e fiscalizar os trabalhos de toda a Secao.",
          "Assessorar o Comandante e o Chefe do Estado-Maior da Brigada em todos os assuntos atinentes a logistica.",
          "Distribuir as tarefas entre os adjuntos e auxiliares, acompanhando o cumprimento dos prazos.",
          "Estabelecer diretrizes para a elaboracao de planos logisticos e controle de estoques e dotacoes.",
          "Representar a Brigada em reunioes e comissoes de carater logistico, quando determinado."
        ]
      },
      {
        cargo: "Adjunto da E/4",
        artigo: "Art. 5o",
        itens: [
          "Substituir o Chefe da Secao em seus impedimentos legais e eventuais.",
          "Coordenar a elaboracao de documentos, relatorios e expedientes diarios da Secao.",
          "Controlar o fluxo de correspondencias, boletins e processos administrativos.",
          "Acompanhar a execucao das diretrizes logisticas junto as OM subordinadas."
        ]
      },
      {
        cargo: "Auxiliares (Sargentos/Subtenentes)",
        artigo: "Art. 6o",
        itens: [
          "Executar o expediente, o arquivamento e a guarda de documentos sigilosos e ostensivos da Secao.",
          "Manter atualizados os quadros de controle de suprimentos, manutencoes, movimentacao de viaturas e cargas.",
          "Confeccionar minutas de boletins, partes, oficios e notas relativas a sua area especifica de atuacao."
        ]
      }
    ],
    funcoesLogisticas: ["Suprimento", "Transporte", "Manutencao", "Saude", "Engenharia", "Servicos Gerais"]
  };

  /* Vinculo de cada processo a competencia (Art. 3o) e a funcao logistica (Art. 3o, I). */
  var vinculoRegimento = {
    p01: { competencia: "I", funcao: "Suprimento" },
    p02: { competencia: "I", funcao: "Manutencao" },
    p03: { competencia: "III", funcao: "Suprimento" },
    p04: { competencia: "I", funcao: "Servicos Gerais" },
    p05: { competencia: "I", funcao: "Engenharia" },
    p06: { competencia: "IV", funcao: "Suprimento" },
    p07: { competencia: "I", funcao: "Transporte" },
    p08: { competencia: "I", funcao: "Servicos Gerais" },
    p09: { competencia: "V", funcao: "Saude" },
    p10: { competencia: "I", funcao: "Engenharia" },
    p11: { competencia: "III", funcao: "Servicos Gerais" },
    p12: { competencia: "III", funcao: "Suprimento" },
    p13: { competencia: "II", funcao: "Suprimento" },
    p14: { competencia: "IV", funcao: "Servicos Gerais" },
    p15: { competencia: "III", funcao: "Suprimento" },
    p16: { competencia: "III", funcao: "Manutencao" },
    p17: { competencia: "III", funcao: "Suprimento" },
    p18: { competencia: "III", funcao: "Suprimento" },
    p19: { competencia: "I", funcao: "Suprimento" }
  };

  /* Sistemas corporativos de apoio logistico (TIC) utilizados pela E/4. */
  var sistemas = [
    {
      sigla: "SISLOGMNT",
      nome: "Sistema Logístico de Manutenção (SisLogMnt)",
      orgao: "Diretoria de Material (D Mat)",
      finalidade: "Controle da operacao e da manutencao dos Materiais de Emprego Militar (MEM), com enfase na Classe IX (motomecanizados e blindados): cadastro de viaturas, emissao de ordens de servico, controle de estoque de pecas e manutencao preventiva/corretiva.",
      uso: "Manutencao e motomecanizacao (Classe IX).",
      acesso: "Ambiente restrito do Exercito",
      url: "https://bdex.eb.mil.br/jspui/bitstream/123456789/9581/1/majkothe2021_3t.artigo.pdf"
    },
    {
      sigla: "SIGELOG (WEB)",
      nome: "Sistema Integrado de Gestao Logistica",
      orgao: "Comando Logistico (COLOG)",
      finalidade: "Sistema corporativo de gestao do ciclo logistico do MEM e das classes de suprimento, da aquisicao ao desfazimento; sucede o SISCOFIS, o SICATEx e o SISDOT e apoia o cadastramento de necessidades logisticas.",
      uso: "Suprimento, catalogacao, dotacao, gestao patrimonial e desfazimento.",
      acesso: "Ambiente restrito do Exercito",
      url: "https://www.colog.eb.mil.br/images/documentos/menus/2025/Folder_SIGELOG3.pdf"
    }
  ];

  var sistemaPorProcesso = {
    p01: "SIGELOG (WEB)",
    p02: "SISLOGMNT",
    p07: "-",
    p09: "SIGELOG (WEB)",
    p11: "SISLOGMNT + SIGELOG (WEB)",
    p13: "SIGELOG (WEB)",
    p14: "-",
    p15: "SIGELOG (WEB)",
    p16: "SISLOGMNT",
    p17: "SIGELOG (WEB)",
    p18: "SIGELOG (WEB)",
    p19: "SIGELOG (WEB)"
  };

  function sistemaDe(id) { return sistemaPorProcesso[id] || "-"; }

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

  /* Modelo de riscos conforme EB10-P-01.004 (2a ed., 2018) e EB20-D-02.010 (2019).
     Escala 5x5: Nível = Probabilidade x Impacto. Matriz obrigatória para tarefas
     de maior complexidade. Resposta: Evitar, Reduzir, Compartilhar ou Aceitar. */
  var riscoEB10 = {
    base: "EB10-P-01.004 (Política de Riscos do Exército, 2a ed., 2018) e EB20-D-02.010 (Diretriz Reguladora da Política de Gestão de Riscos, 2019)",
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

  /* Hierarquia de dados GPEX (EB20-D-11.001): Portfólio > Programa > Macroprocesso >
     Processo > Tarefa. Indicadores de desempenho associados a cada processo. */
  var governanca = {
    portfolio: "Portfólio de Apoio Logístico - Cmdo Bda Inf Amv",
    programa: "Programa de Apoio Logístico da Brigada",
    cadeiaValor: "Macroprocesso de Apoio Logístico (Cadeia de Valor Agregado do EB)",
    macroprocesso: "Gestão Logística",
    orgao: ORG,
    subordinacao: "Ch EM Bda",
    comite: "Estado-Maior da Brigada"
  };

  var governancaProcessos = {
    p01: { tarefa: "Garantir o suprimento das classes I, III e V às unidades", indicadores: ["Prazo médio de atendimento do pedido (dias)", "Percentual de itens entregues na data prevista"] },
    p02: { tarefa: "Executar a manutenção de 2o escalão de viaturas e armamento", indicadores: ["Índice de disponibilidade da frota (%)", "Tempo médio de reparo (dias)"] },
    p03: { tarefa: "Controlar o armamento e a munição sob custódia", indicadores: ["Divergências na revista diária (nº)", "Conformidade de temperatura/umidade do paiol (%)"] },
    p04: { tarefa: "Prevenir acidentes nas atividades de risco", indicadores: ["Acidentes de trabalho registrados (nº)", "Inspeções de segurança realizadas no mês (nº)"] },
    p05: { tarefa: "Controlar os aspectos ambientais do aquartelamento", indicadores: ["Não conformidades ambientais registradas (nº)", "Ações corretivas concluídas (%)"] },
    p06: { tarefa: "Prestar apoio material à instrução", indicadores: ["Atividades de instrução apoiadas sem falta de meio (%)", "Antecedência média do planejamento E3-E4 (dias)"] },
    p07: { tarefa: "Planejar e executar comboios logísticos", indicadores: ["Comboios realizados no prazo (%)", "Ocorrências de avaria/extravio de carga (nº)"] },
    p08: { tarefa: "Assegurar o bem-estar e o apoio material ao efetivo", indicadores: ["Efetivo com fardamento completo (%)", "Não conformidades de alojamento/rancho (nº)"] },
    p09: { tarefa: "Garantir o suprimento de saúde e a evacuação", indicadores: ["Itens de Classe VIII dentro da validade (%)", "Tempo médio de evacuação (min)"] },
    p10: { tarefa: "Manter a infraestrutura do aquartelamento", indicadores: ["Demandas de manutenção concluídas (%)", "Intervenções em itens críticos no prazo (%)"] },
    p11: { tarefa: "Recuperar material danificado (salvamento)", indicadores: ["Índice de recuperação de material (%)", "Processos de baixa instruídos corretamente (%)"] },
    p12: { tarefa: "Controlar o almoxarifado (classes II e IV)", indicadores: ["Acurácia do inventário (%)", "Divergências físico x escriturado (nº)"] },
    p13: { tarefa: "Controlar combustíveis e lubrificantes (Classe III)", indicadores: ["Consumo real x cota (%)", "Média de consumo da frota (km/L)"] },
    p14: { tarefa: "Controlar o calendário de obrigações da seção", indicadores: ["Obrigações cumpridas no prazo (%)", "Atrasos justificados (nº)"] },
    p15: { tarefa: "Requisitar e distribuir munição (Classe V)", indicadores: ["Divergência de munição requisitada x devolvida (nº)", "Requisições no prazo do órgão provedor (%)"] },
    p16: { tarefa: "Prover peças de reposição de viaturas (Classe IX)", indicadores: ["Viaturas paradas por falta de peça (nº)", "Tempo médio de reposição de peça (dias)"] },
    p17: { tarefa: "Executar o desfazimento de material", indicadores: ["Processos de desfazimento sem nulidade (%)", "Itens inservíveis identificados no semestre (nº)"] },
    p18: { tarefa: "Suprir fardamento e equipamento individual (Classe II)", indicadores: ["Praças com Classe II completa (%)", "Divergências de registro por ficha individual (nº)"] },
    p19: { tarefa: "Acompanhar as demais classes de suprimento", indicadores: ["Classes com responsável e rotina definidos (%)", "Rupturas pontuais por classe (nº)"] }
  };

  /* Marcos (milestones) padrao do ciclo de gestao de um processo E/4. */
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

  /* Valida a nomenclatura padrao de tarefa: Verbo de acao + Objeto + Complemento. */
  function validarTarefa(titulo) {
    var t = String(titulo || "").trim();
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

  /* Valida consistencia logica de cronograma (inicio <= fim; marcos dentro do intervalo). */
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
  function respostaPara(nivel) {
    if (nivel === "Extremo") return "Evitar";
    if (nivel === "Alto") return "Reduzir";
    if (nivel === "Médio") return "Reduzir";
    return "Aceitar";
  }
  function prazoPara(nivel) {
    if (nivel === "Extremo") return "Imediato (até 30 dias)";
    if (nivel === "Alto") return "Curto prazo (até 90 dias)";
    if (nivel === "Médio") return "Médio prazo (até 180 dias)";
    return "Contínuo / monitoramento";
  }
  var categoriaPorArea = {
    "Suprimento": "Logístico",
    "Suprimento / Seguranca": "Logístico",
    "Suprimento / Segurança": "Logístico",
    "Suprimento / Combustivel": "Logístico",
    "Suprimento / Combustível": "Logístico",
    "Suprimento / Manutencao": "Logístico",
    "Suprimento / Manutenção": "Logístico",
    "Suprimento / Patrimonio": "Financeiro/Orçamentário",
    "Suprimento / Patrimônio": "Financeiro/Orçamentário",
    "Manutencao": "Operacional",
    "Manutenção": "Operacional",
    "Seguranca": "Segurança/Ambiental",
    "Segurança": "Segurança/Ambiental",
    "Engenharia / Meio ambiente": "Segurança/Ambiental",
    "Engenharia": "Operacional",
    "Coordenacao / Suprimento": "Operacional",
    "Coordenação / Suprimento": "Operacional",
    "Transporte": "Operacional",
    "Recursos Humanos": "Pessoas",
    "Saude": "Pessoas",
    "Saúde": "Pessoas",
    "Salvamento": "Operacional",
    "Patrimonio": "Financeiro/Orçamentário",
    "Patrimônio": "Financeiro/Orçamentário",
    "Gestao / Controle interno": "Integridade/Conformidade",
    "Gestão / Controle interno": "Integridade/Conformidade"
  };
  function categoriaDe(area) { return categoriaPorArea[area] || "Operacional"; }

  var fontes = [
    {
      item: 1, nome: "PGE Bda Inf Amv 2024-2027",
      descricao: "Plano de Gestao Estrategica da Brigada.",
      acesso: "Intranet Bda Inf Amv - Portais da Gestao"
    },
    {
      item: 2, nome: "Plano de Gestao OMDS",
      descricao: "Plano de gestao da organizacao militar.",
      acesso: "Intranet Bda Inf Amv - Portais da Gestao"
    },
    {
      item: 3, nome: "PGC Bda Amv",
      descricao: "Plano de Gestao de Contratacoes.",
      acesso: "Intranet Bda Inf Amv - Portais da Gestao"
    },
    {
      item: 4, nome: "Plano de Gestao de Riscos - Integridade e Controle OMDS",
      descricao: "Riscos de integridade e controle da OM.",
      acesso: "Intranet Bda Inf Amv - Portais da Gestao"
    },
    { item: 5, nome: "Capacitacao GPEX", descricao: "Treinamento na metodologia GPEX.", acesso: "Intranet Bda Inf Amv" },
    { item: 6, nome: "Capacitacao Processos Organizacionais", descricao: "Mapeamento de processos.", acesso: "Intranet Bda Inf Amv" },
    { item: 7, nome: "Capacitacao Gestao de Riscos", descricao: "Metodologia de gestao de riscos.", acesso: "Intranet Bda Inf Amv" },
    { item: 8, nome: "Capacitacao ARIS Express", descricao: "Modelagem de processos (EPC).", acesso: "Intranet Bda Inf Amv" },
    { item: 9, nome: "Memento ARIS Express", descricao: "Guia rapido da ferramenta ARIS.", acesso: "Intranet Bda Inf Amv" },
    { item: 10, nome: "Legislacao de Governanca", descricao: "Normas de governanca aplicaveis.", acesso: "Intranet Bda Inf Amv" },
    { item: 11, nome: "Legislacao de Gestao de Riscos", descricao: "Normas de gestao de riscos.", acesso: "Intranet Bda Inf Amv" },
    { item: 12, nome: "Ordens de Servico / Instrucao / Notas de coordenacao", descricao: "Atos internos da OM.", acesso: "Intranet Bda Inf Amv" },
    { item: 13, nome: "Acesso ao GPEX", descricao: "Portal da Governanca e Gestao do EME.", url: "https://gpex.eb.mil.br/#init" },
    { item: 14, nome: "Acesso Projeto Piloto de Mapeamento de Processo CMSE", descricao: "Sistema ASE (login manual).", url: "http://ase.cmse.eb.mil.br/ase/processos-2.0-OM/login.php?return=true" },
    { item: 15, nome: "Modelos de Documentos", descricao: "Modelos oficiais de documentos.", acesso: "Intranet Bda Inf Amv" },
    { item: 16, nome: "Processos Prioritarios das Secoes Mapeados", descricao: "Processos ja mapeados pelas secoes.", acesso: "Intranet Bda Inf Amv" },
    { item: 17, nome: "Portais da Gestao", descricao: "Pagina 17 da intranet - indice dos portais.", acesso: "Intranet Bda Inf Amv" }
  ];

  var doutrina = [
    {
      sigla: "Regimento Interno",
      titulo: "Regimento Interno da 4a Secao / E/4",
      aplicacao: "Finalidade e subordinacao (Art. 1o), missao (Art. 2o), competencias (Art. 3o, I a VI) e atribuicoes dos integrantes (Arts. 4o a 6o)."
    },
    {
      sigla: "R-1 (RISG)",
      titulo: "Regulamento Interno e dos Servicos Gerais",
      aplicacao: "Atribuicoes da E/4 (art. 34-35): suprimento, manutencao, transporte, engenharia, servicos gerais e apoio as demais funcoes logisticas."
    },
    {
      sigla: "MC 4.0 Log Mil Ter",
      titulo: "Doutrina de Logistica Militar Terrestre",
      aplicacao: "Funcoes logisticas: Suprimento, Manutencao, Transporte, Engenharia, Salvamento, Recursos Humanos e Saude."
    },
    {
      sigla: "EB70-MC-10.317",
      titulo: "Manual de Campanha do Batalhao Logistico",
      aplicacao: "Organizacao e emprego do B Log de apoio as unidades da Brigada."
    },
    {
      sigla: "GPEX / EME",
      titulo: "Portal da Governanca e Gestao do EME",
      aplicacao: "Metodologia de mapeamento de processos e Politica de Gestao de Riscos.",
      url: "https://portalgovernanca.eme.eb.mil.br/"
    },
    {
      sigla: "Port. 1.582-EME",
      titulo: "Politica de Governanca do Exercito (EB20-N-11.002)",
      aplicacao: "Diretrizes de governanca publica aplicaveis a gestao de riscos e controles internos.",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/GESTAO%20ORGANIZACIONAL/NORMAS/port_1582-eme_imptc_politica_gov_eb20-n-11.002.pdf"
    },
    {
      sigla: "Port. 2.508-C Ex",
      titulo: "Plano de Longo Prazo de Governanca (EB10-P-01.007)",
      aplicacao: "Norma de governanca e gestao que orienta o mapeamento de processos organizacionais.",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/GESTAO%20ORGANIZACIONAL/NORMAS/port_2508-c%20ex_pltc_governanca_eb10-p-01.007.pdf"
    },
    {
      sigla: "Port. 2.430-C Ex",
      titulo: "Programa de Integridade do Exercito",
      aplicacao: "Base para os riscos de integridade e controle (Plano de Gestao de Riscos OMDS).",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/port_2430_c_ex_prg_integridade_2025%201.pdf"
    },
    {
      sigla: "ASE / CMSE",
      titulo: "Projeto Piloto 2.0 de Mapeamento de Processos",
      aplicacao: "Fluxo de preenchimento e publicacao dos processos organizacionais no ASE."
    }
  ];

  var classes = [
    { classe: "I", nome: "Viveres", area: "Suprimento", processo: "p01" },
    { classe: "II", nome: "Fardamento e equipamento individual", area: "Suprimento", processo: "p18" },
    { classe: "III", nome: "Combustiveis e lubrificantes", area: "Suprimento", processo: "p13" },
    { classe: "IV", nome: "Material de construcao", area: "Suprimento", processo: "p19" },
    { classe: "V", nome: "Municao", area: "Suprimento", processo: "p15" },
    { classe: "VI", nome: "Material diverso (geradores, embarcacoes)", area: "Suprimento", processo: "p19" },
    { classe: "VII", nome: "Material principal / comunicacoes", area: "Suprimento", processo: "p19" },
    { classe: "VIII", nome: "Material de saude", area: "Suprimento / Saude", processo: "p09" },
    { classe: "IX", nome: "Pecas de reposicao de viaturas", area: "Suprimento / Manutencao", processo: "p16" },
    { classe: "X", nome: "Materiais de outras classes", area: "Suprimento", processo: "p19" }
  ];

  var processos = [
    {
      id: "p01",
      codigo: "E4-01",
      titulo: "Suprimento (Classes I, III e V) as unidades da Bda",
      area: "Suprimento",
      classes: ["I", "III", "V"],
      objetivo:
        "Garantir o abastecimento continuo das unidades da Bda nas Classes I (viveres), " +
        "III (combustivel/lubrificantes) e V (municao), conforme os niveis de suprimento estabelecidos.",
      etapas: [
        "Levantar as necessidades de suprimento junto as unidades",
        "Consolidar o pedido de suprimento da Bda",
        "Encaminhar o pedido ao Batalhao Logistico (B Log)",
        "Receber e conferir o material entregue pelo B Log",
        "Distribuir o material as unidades solicitantes",
        "Atualizar a escrituracao e os niveis de estoque"
      ],
      responsaveis: ["E/4 (gestao)", "Unidades da Bda (levantamento)", "B Log (provedor)"],
      riscos: [
        {
          descricao: "Ruptura de estoque de uma classe de suprimento",
          causa: "Levantamento de necessidades feito com atraso/incompleto",
          consequencia: "Unidade sem suprimento na data prevista",
          probabilidade: 3,
          impacto: 4,
          controle: "Padronizar prazo/formulario de levantamento; acompanhar niveis de estoque semanalmente"
        },
        {
          descricao: "Recebimento de material fora de especificacao ou danificado",
          causa: "Falha na conferencia no recebimento",
          consequencia: "Material inutilizavel chega as unidades",
          probabilidade: 2,
          impacto: 3,
          controle: "Checklist de conferencia obrigatorio no recebimento"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "MC 4.0 Log Mil Ter", "EB70-MC-10.317"]
    },
    {
      id: "p02",
      codigo: "E4-02",
      titulo: "Manutencao de viaturas e armamento (2o escalao)",
      area: "Manutencao",
      classes: ["IX"],
      objetivo:
        "Assegurar que viaturas e armamento estejam em condicoes de emprego, por meio da " +
        "manutencao preventiva e corretiva de 2o escalao.",
      etapas: [
        "Programar inspecoes tecnicas periodicas do material",
        "Executar a manutencao de 1o escalao nas unidades",
        "Encaminhar material que exige manutencao de 2o escalao a oficina",
        "Realizar a manutencao de 2o escalao",
        "Registrar os trabalhos executados e atualizar a escrituracao",
        "Devolver o material a unidade de origem"
      ],
      responsaveis: ["E/4 (gestao)", "Oficina de manutencao", "Unidades da Bda"],
      riscos: [
        {
          descricao: "Viatura/armamento fora de uso por atraso na manutencao",
          causa: "Falta de pecas de reposicao ou ferramental na oficina",
          consequencia: "Reducao da capacidade operacional da unidade",
          probabilidade: 3,
          impacto: 4,
          controle: "Antecipar pedido de pecas criticas; manter estoque minimo"
        },
        {
          descricao: "Acidente durante a manutencao",
          causa: "Uso incorreto de EPI/dispositivos de seguranca na oficina",
          consequencia: "Lesao a militar ou dano a equipamento",
          probabilidade: 2,
          impacto: 4,
          controle: "Fiscalizacao do uso de EPI; instrucao periodica"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "MC 4.0 Log Mil Ter", "EB70-MC-10.317"]
    },
    {
      id: "p07",
      codigo: "E4-03",
      titulo: "Transporte - planejamento e execucao de comboio logistico",
      area: "Transporte",
      classes: ["III"],
      objetivo:
        "Planejar e executar o transporte de suprimento, material e pessoal entre a Bda, o B Log " +
        "e as unidades, com seguranca e no prazo previsto.",
      etapas: [
        "Levantar a necessidade de transporte (carga, volume, prazo)",
        "Planejar o itinerario e escalar viaturas e motoristas",
        "Verificar as condicoes de seguranca das viaturas antes da saida",
        "Executar o deslocamento/comboio",
        "Conferir a carga na chegada ao destino",
        "Registrar consumo de combustivel e ocorrencias da viagem"
      ],
      responsaveis: ["E/4", "Chefe do comboio", "Motoristas escalados"],
      riscos: [
        {
          descricao: "Atraso ou acidente no deslocamento do comboio",
          causa: "Planejamento de itinerario sem levantamento previo",
          consequencia: "Atraso na entrega ou dano a viatura/carga/pessoal",
          probabilidade: 2,
          impacto: 4,
          controle: "Reconhecimento previo de itinerario; briefing de seguranca"
        },
        {
          descricao: "Extravio ou avaria de carga durante o transporte",
          causa: "Fixacao inadequada da carga na viatura",
          consequencia: "Perda de material e necessidade de reposicao",
          probabilidade: 2,
          impacto: 3,
          controle: "Checklist de carregamento e amarracao da carga"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter", "EB70-MC-10.317", "R-1 (RISG) art. 34-35"]
    },
    {
      id: "p09",
      codigo: "E4-04",
      titulo: "Saude (funcao logistica) - suprimento e evacuacao",
      area: "Saude",
      classes: ["VIII"],
      objetivo:
        "Garantir o suprimento de material de saude (Classe VIII) e a capacidade de evacuacao " +
        "de militares doentes/feridos.",
      etapas: [
        "Levantar a necessidade de material de saude junto a FS",
        "Solicitar reposicao do material de Classe VIII",
        "Verificar disponibilidade de viatura/meio de evacuacao",
        "Planejar o fluxo de evacuacao em atividades de campo/instrucao",
        "Registrar consumo e validade dos medicamentos controlados"
      ],
      responsaveis: ["E/4", "Farmacia / Formacao Sanitaria (FS)"],
      riscos: [
        {
          descricao: "Indisponibilidade de meio de evacuacao em atividade de campo",
          causa: "Ausencia de viatura/ambulancia escalada para a atividade",
          consequencia: "Atraso no atendimento a militar acidentado",
          probabilidade: 2,
          impacto: 5,
          controle: "Escalar meio de evacuacao dedicado em exercicios de risco"
        },
        {
          descricao: "Medicamento vencido ou fora de especificacao em uso",
          causa: "Falha no controle de validade do estoque",
          consequencia: "Risco a saude do militar atendido",
          probabilidade: 2,
          impacto: 4,
          controle: "Controle periodico de validade (FEFO) e registro de descarte"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter (funcao Saude)", "Legislacao sanitaria"]
    },
    {
      id: "p11",
      codigo: "E4-05",
      titulo: "Salvamento - recuperacao de material danificado",
      area: "Salvamento",
      classes: ["IX"],
      objetivo:
        "Recuperar o maximo de material danificado (viaturas, armamento, equipamento) e dar a " +
        "destinacao correta ao que nao for recuperavel.",
      etapas: [
        "Identificar e classificar o material danificado",
        "Encaminhar o material recuperavel a oficina de manutencao",
        "Providenciar a baixa/descarte do material irrecuperavel",
        "Registrar o resultado do salvamento e atualizar a escrituracao"
      ],
      responsaveis: ["E/4", "Equipe de salvamento", "Oficina"],
      riscos: [
        {
          descricao: "Material recuperavel descartado indevidamente",
          causa: "Classificacao incorreta na triagem inicial",
          consequencia: "Prejuizo patrimonial e reposicao desnecessaria",
          probabilidade: 2,
          impacto: 3,
          controle: "Dupla avaliacao tecnica antes da decisao de baixa"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter (funcao Salvamento)", "Legislacao patrimonial"]
    },
    {
      id: "p13",
      codigo: "E4-06",
      titulo: "Classe III - controle de combustiveis e lubrificantes",
      area: "Suprimento / Combustivel",
      classes: ["III"],
      objetivo:
        "Garantir o suprimento e o controle rigoroso do consumo de combustiveis e lubrificantes " +
        "(Classe III) das viaturas e geradores da Bda.",
      etapas: [
        "Levantar o consumo mensal previsto por unidade/viatura",
        "Solicitar a cota de combustivel ao orgao provedor",
        "Controlar o abastecimento no posto de abastecimento da OM",
        "Registrar o consumo por viatura (km rodado x litros)",
        "Conferir mensalmente o saldo de cota x consumo real",
        "Reportar desvios de consumo ao Cmt"
      ],
      responsaveis: ["E/4", "Fiscal do posto de abastecimento", "Unidades da Bda"],
      riscos: [
        {
          descricao: "Consumo de combustivel acima da cota sem justificativa",
          causa: "Ausencia de registro sistematico de abastecimento por viatura",
          consequencia: "Estouro de cota e falta de combustivel no fim do periodo",
          probabilidade: 3,
          impacto: 3,
          controle: "Controle diario de abastecimento por viatura; conferencia semanal do saldo de cota"
        },
        {
          descricao: "Desvio ou uso indevido de combustivel",
          causa: "Fragilidade no controle de saida do posto de abastecimento",
          consequencia: "Prejuizo patrimonial e responsabilizacao",
          probabilidade: 2,
          impacto: 4,
          controle: "Registro assinado de cada abastecimento; auditoria periodica"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter", "Plano de Gestao de Riscos - Integridade e Controle OMDS"]
    },
    {
      id: "p14",
      codigo: "E4-07",
      titulo: "Controle do calendario de obrigacoes da Secao de Logistica",
      area: "Gestao / Controle interno",
      classes: [],
      objetivo:
        "Assegurar o cumprimento, dentro do prazo, de todas as obrigacoes periodicas da 4a Secao " +
        "(relatorios, prestacoes de contas, inventarios, mapas, inspecoes).",
      etapas: [
        "Levantar todas as obrigacoes periodicas do E/4 e suas periodicidades",
        "Consolidar o calendario anual de obrigacoes",
        "Definir responsavel e prazo de antecedencia para cada item",
        "Acompanhar mensalmente o cumprimento do calendario",
        "Registrar e justificar eventuais atrasos",
        "Atualizar o calendario conforme novas exigencias do escalao superior"
      ],
      responsaveis: ["E/4", "Encarregado do controle interno"],
      riscos: [
        {
          descricao: "Nao cumprimento de prazo de obrigacao periodica",
          causa: "Ausencia de calendario consolidado e de responsavel por item",
          consequencia: "Cobranca do escalao superior e responsabilizacao",
          probabilidade: 3,
          impacto: 3,
          controle: "Calendario unico acompanhado mensalmente, com aviso de antecedencia (ex.: 10 dias antes do vencimento)"
        },
        {
          descricao: "Duplicidade ou lacuna entre obrigacoes de diferentes classes",
          causa: "Falta de consolidacao unica do calendario do E/4",
          consequencia: "Retrabalho ou item esquecido",
          probabilidade: 2,
          impacto: 2,
          controle: "Centralizar o calendario em um unico responsavel, com revisao trimestral"
        }
      ],
      fontes: ["Plano de Gestao OMDS", "Legislacao de Governanca", "Ordens de Servico / Instrucao / Notas de coordenacao"]
    },
    {
      id: "p15",
      codigo: "E4-08",
      titulo: "Classe V - requisicao e distribuicao de municao",
      area: "Suprimento",
      classes: ["V"],
      objetivo:
        "Garantir a requisicao, o recebimento e a distribuicao da municao necessaria a instrucao " +
        "e ao emprego das unidades da Bda (complementa o processo de custodia/seguranca no paiol).",
      etapas: [
        "Levantar a necessidade de municao por atividade/unidade",
        "Elaborar e encaminhar a requisicao de Classe V ao orgao provedor",
        "Receber e conferir o lote de municao recebido",
        "Distribuir a municao as unidades conforme autorizacao",
        "Recolher e registrar as sobras/estojos apos a atividade",
        "Atualizar o controle de consumo por lote"
      ],
      responsaveis: ["E/4", "Orgao provedor (B Log)", "Unidades da Bda"],
      riscos: [
        {
          descricao: "Divergencia entre municao requisitada, distribuida e devolvida",
          causa: "Falha no registro de distribuicao/recolhimento por atividade",
          consequencia: "Responsabilizacao e dificuldade de auditoria",
          probabilidade: 2,
          impacto: 5,
          controle: "Ficha de controle de distribuicao/devolucao assinada"
        },
        {
          descricao: "Atraso na chegada da municao para atividade programada",
          causa: "Requisicao feita fora do prazo do orgao provedor",
          consequencia: "Cancelamento ou remarcacao da atividade de instrucao",
          probabilidade: 2,
          impacto: 3,
          controle: "Prazo minimo padronizado de antecedencia para requisicao"
        }
      ],
      fontes: ["EB70-MC-10.317", "Normas tecnicas de municao", "MC 4.0 Log Mil Ter"]
    },
    {
      id: "p16",
      codigo: "E4-09",
      titulo: "Classe IX - motomecanizacao (pecas de reposicao de viaturas)",
      area: "Suprimento / Manutencao",
      classes: ["IX"],
      objetivo:
        "Garantir a disponibilidade de pecas de reposicao (Classe IX) necessarias a manutencao " +
        "das viaturas da Bda, evitando indisponibilidade prolongada de material.",
      etapas: [
        "Identificar a peca necessaria a partir da ordem de manutencao",
        "Verificar disponibilidade em estoque local",
        "Requisitar a peca ao orgao provedor, quando nao houver em estoque",
        "Receber e conferir a peca recebida",
        "Aplicar a peca na viatura e encerrar a ordem de manutencao",
        "Atualizar o controle de estoque de pecas criticas"
      ],
      responsaveis: ["E/4", "Oficina de manutencao", "Orgao provedor"],
      riscos: [
        {
          descricao: "Viatura parada por falta de peca de reposicao",
          causa: "Ausencia de estoque minimo de pecas criticas/recorrentes",
          consequencia: "Reducao prolongada da frota disponivel",
          probabilidade: 3,
          impacto: 4,
          controle: "Definir e manter estoque minimo das pecas de maior recorrencia de troca"
        },
        {
          descricao: "Peca recebida incompativel com a viatura",
          causa: "Erro na identificacao/codigo da peca na requisicao",
          consequencia: "Atraso adicional na manutencao e retrabalho",
          probabilidade: 2,
          impacto: 2,
          controle: "Dupla checagem do codigo/especificacao antes da requisicao"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter", "EB70-MC-10.317", "R-1 (RISG) art. 34-35"]
    },
    {
      id: "p17",
      codigo: "E4-10",
      titulo: "Desfazimento de material (baixa patrimonial)",
      area: "Patrimonio",
      classes: [],
      objetivo:
        "Realizar o desfazimento (baixa, alienacao, doacao ou destruicao) de material inservivel, " +
        "obsoleto ou irrecuperavel, conforme a legislacao patrimonial vigente.",
      etapas: [
        "Identificar e relacionar o material candidato a desfazimento",
        "Solicitar parecer tecnico sobre a condicao do material",
        "Instruir o processo de desfazimento conforme normas patrimoniais",
        "Submeter o processo a autoridade competente para decisao",
        "Executar a destinacao definida (alienacao, doacao, destruicao)",
        "Baixar o material da escrituracao patrimonial"
      ],
      responsaveis: ["E/4", "Comissao de desfazimento", "Autoridade competente"],
      riscos: [
        {
          descricao: "Desfazimento sem a instrucao processual completa",
          causa: "Falta de parecer tecnico ou de documentacao exigida",
          consequencia: "Nulidade do processo e responsabilizacao do agente",
          probabilidade: 2,
          impacto: 4,
          controle: "Checklist de documentos obrigatorios antes de submeter o processo"
        },
        {
          descricao: "Material irrecuperavel mantido indevidamente na carga",
          causa: "Ausencia de rotina periodica de identificacao de itens",
          consequencia: "Ocupacao de espaco e distorcao do inventario",
          probabilidade: 2,
          impacto: 2,
          controle: "Levantamento periodico (semestral/anual) de itens candidatos a desfazimento"
        }
      ],
      fontes: ["Legislacao patrimonial", "Plano de Gestao de Riscos - Integridade e Controle OMDS"]
    },
    {
      id: "p18",
      codigo: "E4-11",
      titulo: "Classe II - fardamento e equipamento individual",
      area: "Suprimento",
      classes: ["II"],
      objetivo:
        "Garantir o suprimento, a distribuicao e o controle de fardamento e equipamento " +
        "individual (Classe II) ao efetivo da Bda.",
      etapas: [
        "Levantar a necessidade de fardamento por incorporacao/reposicao",
        "Consolidar e encaminhar o pedido de Classe II",
        "Receber e conferir o material recebido",
        "Distribuir o fardamento/equipamento as unidades e pracas",
        "Registrar a distribuicao na ficha individual",
        "Controlar a reposicao por desgaste/troca de tamanho"
      ],
      responsaveis: ["E/4", "Almoxarife", "SU"],
      riscos: [
        {
          descricao: "Praca sem fardamento completo para formatura/instrucao",
          causa: "Atraso no levantamento de necessidades apos incorporacao",
          consequencia: "Apresentacao inadequada e prejuizo a instrucao",
          probabilidade: 3,
          impacto: 2,
          controle: "Levantamento de tamanhos/necessidades ja na incorporacao"
        },
        {
          descricao: "Divergencia entre fardamento distribuido e registrado",
          causa: "Falha no registro individual de distribuicao",
          consequencia: "Dificuldade de responsabilizacao em caso de extravio",
          probabilidade: 2,
          impacto: 2,
          controle: "Ficha individual assinada a cada distribuicao"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "MC 4.0 Log Mil Ter"]
    },
    {
      id: "p19",
      codigo: "E4-12",
      titulo: "Outras classes de suprimento (IV, VI, VII, VIII e X)",
      area: "Suprimento",
      classes: ["IV", "VI", "VII", "VIII", "X"],
      objetivo:
        "Acompanhar de forma consolidada o suprimento das demais classes nao tratadas em modelos " +
        "especificos: Classe IV (material de construcao), VI (diversos - geradores, embarcacoes etc.), " +
        "VII (material principal/comunicacoes), VIII (saude, quando nao tratado pela FS) e X (outras classes).",
      etapas: [
        "Identificar, para cada classe, o material sob responsabilidade do E/4",
        "Levantar as necessidades especificas de cada classe junto as unidades",
        "Consolidar e priorizar os pedidos por classe e criticidade",
        "Encaminhar as requisicoes aos orgaos provedores correspondentes",
        "Receber, conferir e distribuir o material recebido",
        "Manter escrituracao separada por classe de suprimento"
      ],
      responsaveis: ["E/4", "SU", "Orgaos provedores"],
      riscos: [
        {
          descricao: "Classe de suprimento sem acompanhamento sistematico",
          causa: "Ausencia de responsavel/rotina para classes de menor volume",
          consequencia: "Necessidades nao identificadas a tempo, gerando ruptura pontual",
          probabilidade: 2,
          impacto: 3,
          controle: "Definir responsavel e rotina minima por classe"
        },
        {
          descricao: "Mistura de escrituracao entre classes distintas",
          causa: "Falta de padronizacao no registro por classe",
          consequencia: "Dificuldade de auditoria e de prestacao de contas",
          probabilidade: 2,
          impacto: 2,
          controle: "Padronizar planilha/registro por classe de suprimento"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter", "EB70-MC-10.317", "R-1 (RISG) art. 34-35"]
    }
  ];

  var tratamentoRisco = [
    { etapa: "1. Identificacao", descricao: "Identificar os riscos do processo e suas fontes (interno/externo)." },
    { etapa: "2. Analise", descricao: "Analisar causa, consequencia, probabilidade e impacto de cada risco." },
    { etapa: "3. Avaliacao", descricao: "Comparar o nivel de risco (P x I) com os criterios da OM e priorizar." },
    { etapa: "4. Tratamento", descricao: "Definir controle/mitigacao, responsavel e prazo; decidir tratar, transferir, evitar ou aceitar." },
    { etapa: "5. Monitoramento", descricao: "Acompanhar indicadores, reavaliar periodicamente e reportar ao Cmt." }
  ];

  var calendario = [
    { obrigacao: "Conferencia do saldo de cota de combustivel (Classe III)", periodicidade: "Semanal", responsavel: "Fiscal do posto", antecedencia: 2, processo: "p13" },
    { obrigacao: "Registro/consolidacao de abastecimento por viatura", periodicidade: "Semanal", responsavel: "Fiscal do posto", antecedencia: 2, processo: "p13" },
    { obrigacao: "Saldo de cota x consumo real de combustivel", periodicidade: "Mensal", responsavel: "E4", antecedencia: 5, processo: "p13" },
    { obrigacao: "Acompanhamento do calendario de obrigacoes do E4", periodicidade: "Mensal", responsavel: "Encarregado de controle interno", antecedencia: 10, processo: "p14" },
    { obrigacao: "Relatorio mensal de manutencao (viaturas/armamento)", periodicidade: "Mensal", responsavel: "Oficina / E4", antecedencia: 5, processo: "p02" },
    { obrigacao: "Reconciliacao de municao distribuida/recolhida (Classe V)", periodicidade: "Mensal", responsavel: "E4", antecedencia: 5, processo: "p15" },
    { obrigacao: "Controle de validade de medicamentos (Classe VIII / FEFO)", periodicidade: "Mensal", responsavel: "FS / E4", antecedencia: 5, processo: "p09" },
    { obrigacao: "Revisao do calendario unico de obrigacoes do E4", periodicidade: "Trimestral", responsavel: "E4", antecedencia: 10, processo: "p14" },
    { obrigacao: "Levantamento de material candidato a desfazimento", periodicidade: "Semestral", responsavel: "Comissao de desfazimento", antecedencia: 15, processo: "p17" },
    { obrigacao: "Consolidacao anual de necessidades (fardamento, viveres, combustivel)", periodicidade: "Anual", responsavel: "E4", antecedencia: 30, processo: "p18" },
    { obrigacao: "Revisao do mapeamento de processos/riscos no ASE (GPEX)", periodicidade: "Anual", responsavel: "E4", antecedencia: 30, processo: "p14" }
  ];

  var combustivel = {
    tipos: ["Diesel S10", "Diesel S500", "Gasolina", "Etanol", "ARLA 32", "Oleo lubrificante", "Outros"],
    descricao:
      "Controle da Classe III. Registre cada abastecimento com viatura, hodometro e litros. " +
      "O sistema calcula o consumo (km/L) e compara o total abastecido com a cota do periodo.",
    unidades: ["km/L", "L"]
  };

  /* Normas de referencia para conformidade do cadastro no GPEx/ASE. */
  var normas = [
    {
      codigo: "EB10-P-01.004", titulo: "Política de Riscos do Exército Brasileiro",
      edicao: "2ª ed., 2018", portaria: "Portaria Nº 004-Cmt Ex, de 3 de janeiro de 2019",
      aplicacao: "Modelagem de riscos: probabilidade, impacto/severidade, nível (P x I) e plano de resposta (evitar, reduzir, compartilhar, aceitar).",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/Port004-CmtEx_3jan19.pdf"
    },
    {
      codigo: "EB20-D-02.010", titulo: "Diretriz Reguladora da Política de Gestão de Riscos do Exército",
      edicao: "1ª ed., 2019", portaria: "Portaria Nº 225-EME, de 26 de julho de 2019",
      aplicacao: "Orientação metodológica para identificação, análise, avaliação, tratamento e monitoramento dos riscos.",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/Port225-EME_26jul19.pdf"
    },
    {
      codigo: "EB10-P-01.014", titulo: "Missão do Exército (Plano) - Planejamento Estratégico 2024-2027",
      edicao: "1ª ed., 2023", portaria: "Portaria Nº 2.146-C Ex, de 20 de dezembro de 2023",
      aplicacao: "Alinhamento estratégico e de portfólio institucional (base dos objetivos estratégicos).",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/PROCESSOS/NORMAS/PORTARIA_C_Ex_2146_DE_20_DE_DEZEMBRO_DE_2023.pdf"
    },
    {
      codigo: "Cadeia de Valor (EME)", titulo: "Cadeia de Valor Agregado do Estado-Maior do Exército",
      edicao: "2026", portaria: "Portaria EME/C Ex nº 1.729, de 30 de abril de 2026",
      aplicacao: "Referência de macroprocessos e processos organizacionais.",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/sepbe19_port1729-cva-eme%201.pdf"
    },
    {
      codigo: "EB20-D-01.016", titulo: "Diretriz de Racionalização Administrativa do Exército",
      edicao: "1ª ed., 2014", portaria: "Portaria nº 295-EME, de 17 de dezembro de 2014",
      aplicacao: "Mapeamento e melhoria de processos organizacionais.",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/PROCESSOS/NORMAS/Portaria_295_EME.pdf"
    },
    {
      codigo: "EB20-D-11.001", titulo: "Diretriz de Governança e Gestão do Exército (SG2Ex)",
      edicao: "conforme citado no prompt", portaria: "Confirmar número/vigência no Portal da Governança",
      aplicacao: "Alinhamento com macroprocessos, processos, indicadores de desempenho e portfólios institucionais.",
      verificar: true
    },
    {
      codigo: "EB10-P-01.027", titulo: "Programa de Integridade do Exército",
      edicao: "1ª ed., 2025", portaria: "Portaria C Ex nº 2.430, de 24 de fevereiro de 2025",
      aplicacao: "Riscos de integridade e controles internos.",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/port_2430_c_ex_prg_integridade_2025%201.pdf"
    },
    {
      codigo: "EB20-P-11.001", titulo: "Plano de Integridade do Exército",
      edicao: "2ª ed., 2025", portaria: "Portaria EME/C Ex nº 1.493, de 25 de fevereiro de 2025",
      aplicacao: "Medidas de integridade e conformidade aplicáveis ao E/4.",
      url: "https://portalgovernanca.eme.eb.mil.br/images/documentos/RISCOS/NORMAS/port_1493_eme_pl_integridade_2025%201.pdf"
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
          sistema: sistemaDe(proc.id)
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
    governanca: governanca,
    governancaProcessos: governancaProcessos,
    marcosModelo: marcosModelo,
    classes: classes,
    processos: processos,
    tratamentoRisco: tratamentoRisco,
    calendario: calendario,
    combustivel: combustivel,
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
    sistemaDe: sistemaDe
  };
})();
