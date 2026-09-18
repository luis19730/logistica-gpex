/*
 * Base de dados GPEX / Gestao de Risco - Secao de Logistica (E/4)
 * Cmdo Bda Inf Amv - Metodologia GPEX / Projeto Piloto 2.0 (CMSE / ASE)
 *
 * Fontes: Portais da Gestao (EME / CMSE / Bda Inf Amv), GPEX,
 * R-1 (RISG) art. 34-35, MC 4.0 Log Mil Ter, EB70-MC-10.317.
 *
 * IMPORTANTE: modelos de referencia. Ajustar ao processo real da OM e
 * submeter a revisao humana antes de publicar no ASE.
 */
window.GPEX_E4 = (function () {
  "use strict";

  var meta = {
    titulo: "Mapeamento de Processos e Gestao de Riscos",
    subtitulo: "Secao de Logistica (E/4) - Cmdo Bda Inf Amv",
    metodologia: "GPEX / Projeto Piloto 2.0 de Mapeamento de Processos (CMSE)",
    versao: "1.0.0",
    atualizado: "2026-09-18",
    aviso:
      "Aviso: o dominio ase.cmse.eb.mil.br e as intranets citadas sao de acesso restrito. " +
      "O preenchimento no ASE e manual, por usuario autorizado. Este sistema apenas prepara o " +
      "conteudo (dados do processo, etapas, fluxo, matriz de riscos e resumo) para colagem."
  };

  var escala = [
    { min: 1, max: 4, nome: "Baixo", cor: "verde", acao: "Aceitar / monitorar periodicamente." },
    { min: 5, max: 9, nome: "Moderado", cor: "amarelo", acao: "Mitigar com controles e monitorar." },
    { min: 10, max: 14, nome: "Alto", cor: "laranja", acao: "Tratamento prioritario com responsavel e prazo." },
    { min: 15, max: 25, nome: "Critico", cor: "vermelho", acao: "Tratamento imediato e decisao do Cmt." }
  ];

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
      sigla: "R-1 (RISG)",
      titulo: "Regulamento Interno e dos Servicos Gerais",
      aplicacao: "Atribuicoes do S4/E4 (art. 34-35): suprimento, manutencao, transporte, engenharia, salvamento e apoio as demais funcoes logisticas."
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
      id: "p03",
      codigo: "E4-03",
      titulo: "Controle de armamento e municao (paiois/depositos)",
      area: "Suprimento / Seguranca",
      classes: ["V"],
      objetivo:
        "Manter o controle preciso e seguro do armamento e da municao sob custodia da Bda, " +
        "em conformidade com as normas tecnicas.",
      etapas: [
        "Realizar a revista diaria de armamento",
        "Controlar temperatura e umidade dos paiois/depositos",
        "Atualizar o fichario de movimento de municao por lote",
        "Realizar inspecao mensal do armamento e da municao",
        "Elaborar mapa termo-higrometrico e relatorio mensal"
      ],
      responsaveis: ["E/4", "Armeiro / responsavel pelo paiol", "Fiscal administrativo"],
      riscos: [
        {
          descricao: "Extravio ou divergencia no controle de armamento/municao",
          causa: "Falha na escrituracao ou na revista diaria",
          consequencia: "Responsabilizacao administrativa/disciplinar",
          probabilidade: 2,
          impacto: 5,
          controle: "Dupla checagem na revista diaria; auditoria interna"
        },
        {
          descricao: "Deterioracao de municao armazenada",
          causa: "Condicoes inadequadas de temperatura/umidade no paiol",
          consequencia: "Perda de material e risco de acidente",
          probabilidade: 2,
          impacto: 4,
          controle: "Monitoramento periodico das condicoes do paiol"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "Normas tecnicas de armamento e municao"]
    },
    {
      id: "p04",
      codigo: "E4-04",
      titulo: "Prevencao de acidentes em atividades de risco",
      area: "Seguranca",
      classes: [],
      objetivo:
        "Garantir que as normas de prevencao de acidentes sejam cumpridas nas oficinas, " +
        "depositos e demais dependencias sob responsabilidade da 4a Secao.",
      etapas: [
        "Elaborar/atualizar o plano de prevencao de acidentes logisticas",
        "Verificar o uso correto de EPI nas oficinas e depositos",
        "Realizar inspecoes periodicas das condicoes de seguranca",
        "Registrar ocorrencias e propor medidas corretivas",
        "Reportar ao Cmt as nao conformidades identificadas"
      ],
      responsaveis: ["E/4", "Chefes de oficina/deposito"],
      riscos: [
        {
          descricao: "Acidente de trabalho em oficina ou deposito",
          causa: "Descumprimento das normas de prevencao de acidentes",
          consequencia: "Lesao a militar e possivel interrupcao da atividade",
          probabilidade: 2,
          impacto: 4,
          controle: "Inspecoes periodicas com checklist; reciclagem periodica"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "Normas de seguranca do trabalho"]
    },
    {
      id: "p05",
      codigo: "E4-05",
      titulo: "Controle ambiental do aquartelamento",
      area: "Engenharia / Meio ambiente",
      classes: [],
      objetivo:
        "Assegurar o cumprimento da legislacao ambiental federal, estadual e municipal nas " +
        "atividades e instalacoes da Bda.",
      etapas: [
        "Elaborar/atualizar as normas de controle ambiental",
        "Difundir as normas as SU e demais dependencias",
        "Fiscalizar o cumprimento durante exercicios e manobras",
        "Registrar nao conformidades e encaminhar providencias"
      ],
      responsaveis: ["E/4", "E/3 (coordenacao de exercicios)", "SU"],
      riscos: [
        {
          descricao: "Nao conformidade ambiental em exercicio ou manobra",
          causa: "Desconhecimento das normas ambientais pela tropa",
          consequencia: "Passivo ambiental e possivel sancao legal",
          probabilidade: 2,
          impacto: 3,
          controle: "Orientacao ambiental no briefing; checklist com o E3"
        }
      ],
      fontes: ["Legislacao ambiental federal/estadual/municipal", "MC 4.0 Log Mil Ter"]
    },
    {
      id: "p06",
      codigo: "E4-06",
      titulo: "Apoio material a instrucao (ligacao com o E/3)",
      area: "Coordenacao / Suprimento",
      classes: ["I", "III", "V"],
      objetivo:
        "Garantir que os meios materiais (viaturas, municao de instrucao, alimentacao em campo etc.) " +
        "estejam disponiveis conforme o planejamento do E/3.",
      etapas: [
        "Receber do E/3 o calendario e as necessidades de apoio material",
        "Levantar a disponibilidade de meios (viaturas, municao, racao)",
        "Planejar a distribuicao dos meios entre as unidades",
        "Executar a distribuicao e o transporte necessario",
        "Recolher e conferir o material ao termino da atividade"
      ],
      responsaveis: ["E/4", "E/3", "Unidades apoiadas"],
      riscos: [
        {
          descricao: "Falta de meio logistico no inicio da instrucao",
          causa: "Falha na comunicacao entre E/3 e E/4 sobre o cronograma",
          consequencia: "Atraso ou cancelamento de atividade de instrucao",
          probabilidade: 3,
          impacto: 3,
          controle: "Reuniao de coordenacao E/3-E/4 com antecedencia minima"
        }
      ],
      fontes: ["R-1 (RISG) art. 34-35", "Programa de Instrucao e Adestramento"]
    },
    {
      id: "p07",
      codigo: "E4-07",
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
      id: "p08",
      codigo: "E4-08",
      titulo: "Recursos Humanos (funcao logistica) - bem-estar e apoio material",
      area: "Recursos Humanos",
      classes: ["II"],
      objetivo:
        "Assegurar o apoio material ao efetivo da Bda (fardamento, alojamento, alimentacao) em " +
        "condicoes adequadas de bem-estar.",
      etapas: [
        "Levantar necessidades de fardamento e material individual",
        "Solicitar e distribuir o material de Classe II",
        "Verificar condicoes de alojamento e do rancho",
        "Acompanhar indicadores de bem-estar junto as unidades",
        "Reportar nao conformidades ao Cmt"
      ],
      responsaveis: ["E/4", "SU", "Rancho / alojamento"],
      riscos: [
        {
          descricao: "Falta de fardamento/material individual para tropa recem-incorporada",
          causa: "Levantamento com atraso em relacao ao calendario de incorporacao",
          consequencia: "Efetivo sem condicoes adequadas de apresentacao/instrucao",
          probabilidade: 3,
          impacto: 3,
          controle: "Antecipar levantamento; manter estoque minimo de reserva"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter (funcao RH)", "R-1 (RISG) art. 34-35"]
    },
    {
      id: "p09",
      codigo: "E4-09",
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
      id: "p10",
      codigo: "E4-10",
      titulo: "Engenharia (funcao logistica) - infraestrutura do aquartelamento",
      area: "Engenharia",
      classes: ["IV"],
      objetivo:
        "Manter a infraestrutura fisica do aquartelamento (instalacoes, redes, vias internas) " +
        "em condicoes adequadas de uso.",
      etapas: [
        "Levantar demandas de manutencao predial/infraestrutura junto as SU",
        "Priorizar e planejar as intervencoes conforme criticidade",
        "Solicitar material de Classe IV quando necessario",
        "Executar ou contratar a obra/reparo",
        "Vistoriar e registrar a conclusao do servico"
      ],
      responsaveis: ["E/4", "SU", "Fiscal de contrato/obra"],
      riscos: [
        {
          descricao: "Instalacao critica (eletrica, hidraulica) sem manutencao",
          causa: "Ausencia de levantamento periodico de demandas",
          consequencia: "Risco de acidente ou interrupcao de atividades",
          probabilidade: 2,
          impacto: 4,
          controle: "Vistoria periodica programada; priorizacao de itens de seguranca"
        }
      ],
      fontes: ["MC 4.0 Log Mil Ter (funcao Engenharia)", "PGC Bda Amv"]
    },
    {
      id: "p11",
      codigo: "E4-11",
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
      id: "p12",
      codigo: "E4-12",
      titulo: "Gestao patrimonial - almoxarifado (Classes II e IV)",
      area: "Suprimento / Patrimonio",
      classes: ["II", "IV"],
      objetivo:
        "Manter o controle preciso do material de Classe II e IV em deposito, assegurando " +
        "disponibilidade e rastreabilidade.",
      etapas: [
        "Receber e conferir o material que entra no almoxarifado",
        "Lancar o material no controle de estoque",
        "Atender as requisicoes das unidades/SU",
        "Realizar inventario periodico do deposito",
        "Reportar divergencias e propor reposicao"
      ],
      responsaveis: ["E/4", "Almoxarife", "Fiscal administrativo"],
      riscos: [
        {
          descricao: "Divergencia entre estoque fisico e escriturado",
          causa: "Falha no lancamento das movimentacoes de entrada/saida",
          consequencia: "Responsabilizacao do almoxarife; dificuldade de planejamento",
          probabilidade: 3,
          impacto: 3,
          controle: "Inventario periodico obrigatorio; dupla conferencia"
        }
      ],
      fontes: ["Legislacao patrimonial", "Plano de Gestao de Riscos - Integridade e Controle OMDS"]
    },
    {
      id: "p13",
      codigo: "E4-13",
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
      codigo: "E4-14",
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
      codigo: "E4-15",
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
      codigo: "E4-16",
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
      codigo: "E4-17",
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
      codigo: "E4-18",
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
      codigo: "E4-19",
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
    { obrigacao: "Revista diaria de armamento", periodicidade: "Diaria", responsavel: "Armeiro / E4", antecedencia: 0, processo: "p03" },
    { obrigacao: "Mapa termo-higrometrico dos paiois", periodicidade: "Semanal", responsavel: "Especialista de municao", antecedencia: 2, processo: "p03" },
    { obrigacao: "Conferencia do saldo de cota de combustivel (Classe III)", periodicidade: "Semanal", responsavel: "Fiscal do posto", antecedencia: 2, processo: "p13" },
    { obrigacao: "Registro/consolidacao de abastecimento por viatura", periodicidade: "Semanal", responsavel: "Fiscal do posto", antecedencia: 2, processo: "p13" },
    { obrigacao: "Inspecao de seguranca de oficinas e depositos", periodicidade: "Mensal", responsavel: "E4 / chefes de oficina", antecedencia: 5, processo: "p04" },
    { obrigacao: "Inspecao mensal de armamento e municao", periodicidade: "Mensal", responsavel: "E4 / armeiro", antecedencia: 5, processo: "p03" },
    { obrigacao: "Saldo de cota x consumo real de combustivel", periodicidade: "Mensal", responsavel: "E4", antecedencia: 5, processo: "p13" },
    { obrigacao: "Acompanhamento do calendario de obrigacoes do E4", periodicidade: "Mensal", responsavel: "Encarregado de controle interno", antecedencia: 10, processo: "p14" },
    { obrigacao: "Inventario do almoxarifado (Classes II e IV)", periodicidade: "Mensal", responsavel: "Almoxarife / fiscal", antecedencia: 5, processo: "p12" },
    { obrigacao: "Relatorio mensal de manutencao (viaturas/armamento)", periodicidade: "Mensal", responsavel: "Oficina / E4", antecedencia: 5, processo: "p02" },
    { obrigacao: "Reconciliacao de municao distribuida/recolhida (Classe V)", periodicidade: "Mensal", responsavel: "E4", antecedencia: 5, processo: "p15" },
    { obrigacao: "Controle de validade de medicamentos (Classe VIII / FEFO)", periodicidade: "Mensal", responsavel: "FS / E4", antecedencia: 5, processo: "p09" },
    { obrigacao: "Vistoria de infraestrutura do aquartelamento", periodicidade: "Trimestral", responsavel: "E4 / SU", antecedencia: 10, processo: "p10" },
    { obrigacao: "Revisao do calendario unico de obrigacoes do E4", periodicidade: "Trimestral", responsavel: "E4", antecedencia: 10, processo: "p14" },
    { obrigacao: "Levantamento de material candidato a desfazimento", periodicidade: "Semestral", responsavel: "Comissao de desfazimento", antecedencia: 15, processo: "p17" },
    { obrigacao: "Atualizacao do Plano de Prevencao de Acidentes", periodicidade: "Semestral", responsavel: "E4", antecedencia: 15, processo: "p04" },
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
          impacto: r.impacto,
          valor: r.probabilidade * r.impacto,
          nivel: n.nome,
          cor: n.cor,
          controle: r.controle
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
    classes: classes,
    processos: processos,
    tratamentoRisco: tratamentoRisco,
    calendario: calendario,
    combustivel: combustivel,
    nivelRisco: nivelRisco,
    todosRiscos: todosRiscos
  };
})();
