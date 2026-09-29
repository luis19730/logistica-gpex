// Conteúdo inicial: 5 processos da 4ª Seção (Logística) do Cmdo Bda Inf Amv,
// preenchidos nas 11 seções textuais da Folha de Dados do Processo, cada um
// com o seu fluxograma. Tudo editável pela ficha do processo.
import { OM, SECAO, MACROPROCESSO, FLUXO_PADRAO } from './constants.js'

const processos = [
  {
    codigo: 'E4-01',
    assunto: 'elaborar o plano de apoio logístico',
    objetivo:
      'Produzir o documento único que orienta o apoio logístico da Brigada às OMDS, com organicidade, prazos e controles por classe de suprimento.',
    area: 'Gerenciais',
    processo2: 'Planejamento do apoio logístico às OMDS da Brigada',
    responsavel: 'Maj Filipe — Chefe da E/4',
    aprovSecao: true,
    aprovGestao: false,
    secoes: {
      objetivos:
        '- Consolidar em um único documento as necessidades de apoio logístico de todas as OMDS da Brigada.\n' +
        '- Definir organicidade, prazos, locais de entrega e responsáveis por cada classe de suprimento.\n' +
        '- Estabelecer os controles de execução: níveis de suprimento, pontos de controle e indicadores.\n' +
        '- Servir de referência única para a execução, o controle e a auditoria do apoio logístico.\n' +
        '- Garantir que o planejamento permaneça coerente com a situação de emprego da força e com os recursos disponíveis.',
      siglas:
        'Bda — Brigada de Infantaria\n' +
        'E/4 — 4ª Seção (Logística)\n' +
        'OMDS — Organizações Militares Diretamente Subordinadas\n' +
        'Cmt — Comandante\n' +
        'Adj — Adjunto\n' +
        'Apoio logístico — conjunto de medidas de sustentação da força\n' +
        'SIGELOG — Sistema de Gestão Logística\n' +
        'SISLOGMNT — Sistema de Gestão de Manutenção\n' +
        'Classe I — Vestes, calçados e uniformes\n' +
        'Classe III — Combustíveis e lubrificantes\n' +
        'Classe V — Munição\n' +
        'Classe IX — Peças de reposição\n' +
        'NPS — Nível de suprimento\n' +
        'FEFO — First Expired, First Out (primeiro que vence, primeiro que sai)\n' +
        'PRM — Plano de Resposta a Emergência\n' +
        'EB20-MC-10.204 — Manual de Logística do Exército\n' +
        'EB70-MC-10.238 — Manual de Campanha Logística Militar Terrestre\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico',
      campoAplicacao:
        'Aplica-se ao Cmdo Bda Inf Amv e a todas as OMDS, para as atividades de apoio logístico decorrentes da determinação do Cmt da Bda, da entrada em operação ou do início de cada ciclo de planejamento. Não se aplica ao suprimento de primeiro escalão dentro de cada OMDS, que é responsabilidade da própria OM.',
      responsabilidades:
        'Chefe da E/4 (Maj Filipe) — Responsável direto pela elaboração, consolidação, aprovação e publicação do plano.\n' +
        'Adjunto da E/4 (Ten Glauco) — Levanta as necessidades junto às OMDS e consolida os dados por classe.\n' +
        'Auxiliar 1 (ST Valter) — Atualiza os dados de material, de viaturas e da situação de manutenção.\n' +
        'Auxiliar 2 (1º Sgt Richardson) — Confere a capacidade de recepção e as condições de entrega.\n' +
        'Auxiliar 3 (Sd Ev Prado) — Atualiza os dados de estoque e de consumo já realizado.\n' +
        'Cmt da Bda — Aprova o plano e fixa os limites de alocação.\n' +
        'B Log — Batalhão Logístico: executa o suprimento conforme o plano.\n' +
        'OMDS — Informam as necessidades e confirmam o recebimento.',
      limites:
        'Fornecedores: Batalhão Logístico (B Log), depósitos de Classe I, III e V e órgãos de suprimento do nível superior.\n' +
        'Clientes: todas as OMDS da Brigada.\n' +
        'Limite superior: a dotação e o contingente alocado pela Diretriz de Logística.\n' +
        'Limite inferior: o mínimo operacional de cada OMDS para uma semana completa de operações.\n' +
        'Restrição: o processo não autoriza aquisição nem ampliação de recursos; apenas dimensiona e prioriza o que já está alocado.',
      documentos:
        'EB20-MC-10.204 — Manual de Logística do Exército, 3ª ed. 2014 (Estado-Maior do Exército).\n' +
        'EB70-MC-10.238 — Manual de Campanha Logística Militar Terrestre, 2ª ed. 2022 (COTER).\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico, 2ª ed. 2022 (COTER).\n' +
        'Portaria C Ex nº 1.822/2018 — Instrução Regulamentar das Organizações Militares.\n' +
        'Regimento Interno do Cmdo Bda Inf Amv, Art. 3º, incisos I a VI (competências da E/4).\n' +
        'Plano de emprego da força da Brigada (CICOP).\n' +
        'Padrão EPOEx.FR001.00 — Folha de Dados do Processo (modelo desta ficha).\n' +
        'Portaria C Ex nº 2.157/2014 — Sistema de Governança e Gestão.',
      descricao:
        'O processo inicia com o recebimento da determinação do Cmt da Bda, formalizada em ordem de serviço ou em documento de planejamento da DIVINF/CICOP. A E/4 abre o arquivo do ciclo e emite a requisição de dados às OMDS, contendo o quadro de pessoal, o inventário de viaturas e de material, o consumo médio das Classes I, III, V e IX e a situação de manutenção.\n' +
        'Recebidas as respostas, o Adjunto da E/4 consolida tudo num quadro único por classe e por OMDS. O Auxiliar 1 confere a coerência dos dados de manutenção com o histórico do SISLOGMNT e sinaliza as indisponibilidades críticas. O Auxiliar 2 verifica, para cada entrega prevista, se a OMDS tem condição de receber no prazo e no local indicados.\n' +
        'Com os dados fechados, o Chefe da E/4 monta o plano, contendo: situação; organicidade de apoio; quadro de necessidades por classe; cronograma de entrega; pontos de controle; responsáveis; e indicadores de acompanhamento. O plano é submetido ao Cmt da Bda. Não aprovado, o documento retorna à etapa de emissão para ajuste. Aprovado, a versão é lacrada, registrada e distribuída às OMDS, que passam a usar aquela referência.\n' +
        'O plano é revisto a cada ciclo de planejamento ou sempre que houver mudança relevante na situação de emprego ou no contingente disponível.',
      competencias:
        'Planejar e consolidar necessidades logísticas de OMDS.\n' +
        'Redigir e manter documentação técnica de logística militar.\n' +
        'Aplicar a doutrina de logística do Exército (EB20-MC-10.204).\n' +
        'Gerenciar prazos e pontos de controle.\n' +
        'Fundamentar decisões de priorização de recursos escassos.\n' +
        'Articular-se com o Batalhão Logístico e com as OMDS.\n' +
        'Conhecer o framework de governança e de controle do Exército (SIGEB e portarias C Ex).',
      registros:
        'Requisição de dados às OMDS, protocolada.\n' +
        'Quadro consolidado de necessidades por classe e por OMDS.\n' +
        'Plano de Apoio Logístico da Brigada: versão preliminar e versão aprovada.\n' +
        'Ata de aprovação do Cmt da Bda.\n' +
        'Livro de registro da E/4, com numeração de versões.\n' +
        'Lista de distribuição do plano às OMDS.\n' +
        'Relatório de revisão do ciclo, quando houver.',
      riscos:
        'Dados incompletos ou defasados das OMDS: comprometem todo o dimensionamento. Controle: prazo fixo de resposta e conferência de coerência com o histórico de consumo.\n' +
        'Mudança da situação de emprego após a aprovação: torna o plano obsoleto. Controle: cláusula de revisão e gatilho de atualização imediata.\n' +
        'Desacordo entre o previsto e o fornecido: gera fila de espera. Controle: registro de pendências e replanejamento parcial.\n' +
        'Perda da versão aprovada: gera discussão sobre qual documento é válido. Controle: numeração de versões e arquivo lacrado no SIGELOG.\n' +
        'Ponto de risco crítico: indisponibilidade de itens de Classe V em tempo de operação. Tratamento: reserva mínima permanente na OMDS.',
      controles:
        'Ambiental: a atividade de planejamento é administrativa e não gera resíduo; adota-se solução não física, com padronização de formulários e trabalho em planilha eletrônica.\n' +
        'Controle documental: todo documento do ciclo tem versão, data, responsável e destinatário registrados.\n' +
        'Controle de acesso: o plano aprovado é de uso interno da OM; a difusão fora da OM depende de autorização do Cmt.\n' +
        'Infraestrutura: estação de trabalho com acesso ao SIGELOG, ao SISCOM e ao repositório documental da Bda; impressora para cópias controladas.\n' +
        'Controle de integridade: conferência de valores nas consolidações (total por classe igual à soma por OMDS).',
    },
    fluxo: [
      's|Recebida a determinação do Cmt da Bda para o ciclo de planejamento',
      't|Requisitar dados de pessoal, de material, de viaturas e de consumo às OMDS',
      'g|Todos os dados foram recebidos e conferidos?|2',
      't|Emitir o Plano de Apoio Logístico (necessidades, organicidade, prazos e controles)',
      't|Submeter o plano à aprovação do Cmt da Bda',
      'g|O plano foi aprovado?|4',
      't|Lacrar e registrar a versão aprovada, com responsáveis e pontos de controle, no livro de registro da E/4',
      't|Distribuir a versão aprovada às OMDS e orientá-las a usar aquela referência',
      'e|Fim do processo',
    ].join('\n'),
  },
  {
    codigo: 'E4-02',
    assunto: 'consolidar as necessidades de suprimento',
    objetivo:
      'Reunir e conferir as necessidades de suprimento declaradas pelas OMDS, eliminando duplicidades e consolidando um quadro único por classe e por OM.',
    area: 'Suporte',
    processo2: 'Levantamento e consolidação de necessidades por classe de suprimento',
    responsavel: 'Ten Glauco — Adjunto da E/4',
    aprovSecao: true,
    aprovGestao: false,
    secoes: {
      objetivos:
        '- Receber as necessidades declaradas por todas as OMDS dentro do prazo estabelecido.\n' +
        '- Conferir a coerência de cada necessidade com o consumo histórico e com a dotação da OM.\n' +
        '- Eliminar duplicidades, excessos e itens fora do escopo da E/4.\n' +
        '- Consolidar um quadro único por classe (I, III, V e IX) e por OMDS.\n' +
        '- Entregar o quadro consolidado ao Chefe da E/4 em formato utilizável no plano.',
      siglas:
        'OMDS — Organizações Militares Diretamente Subordinadas\n' +
        'E/4 — 4ª Seção (Logística)\n' +
        'SIGELOG — Sistema de Gestão Logística\n' +
        'SISLOGMNT — Sistema de Gestão de Manutenção\n' +
        'Classe I — Vestes, calçados e uniformes\n' +
        'Classe III — Combustíveis e lubrificantes\n' +
        'Classe V — Munição\n' +
        'Classe IX — Peças de reposição\n' +
        'MPE — Máscara de Proteção Especial\n' +
        'NPS — Nível de suprimento\n' +
        'FEFO — First Expired, First Out (primeiro que vence, primeiro que sai)\n' +
        'EB70-MC-10.238 — Manual de Campanha Logística Militar Terrestre\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico',
      campoAplicacao:
        'Aplica-se a todas as OMDS da Brigada, em todos os ciclos de planejamento e de reposição, para todas as classes sob responsabilidade da E/4. Não se aplica ao atendimento de urgência, tratado como pedido extraordinário pelo processo de recebimento e distribuição (E4-04).',
      responsabilidades:
        'Adjunto da E/4 (Ten Glauco) — Responsável pela recepção, pela conferência e pela consolidação.\n' +
        'OMDS — Detalham a necessidade por item, quantidade e prazo.\n' +
        'Auxiliar 1 (ST Valter) — Presta os dados de material e de manutenção.\n' +
        'Auxiliar 3 (Sd Ev Prado) — Presta os dados de estoque existente e de consumo.\n' +
        'Chefe da E/4 (Maj Filipe) — Recebe o quadro consolidado e o incorpora ao plano.\n' +
        'B Log — Confirma a possibilidade de atendimento do quadro.',
      limites:
        'Fornecedores de informação: todas as OMDS da Brigada.\n' +
        'Clientes: Chefe da E/4 e, por delegação, o B Log.\n' +
        'Limite temporal: a consolidação só é encerrada após o recebimento de todas as respostas ou após o prazo máximo de 48 horas, com registro das OMDS pendentes.\n' +
        'Limite de escopo: itens fora do alcance de suprimento da E/4 são encaminhados à seção competente.\n' +
        'Limite de quantidade: nenhuma necessidade pode exceder a dotação vigente da OM sem justificativa escrita.',
      documentos:
        'EB20-MC-10.204 — Manual de Logística do Exército, 3ª ed. 2014 (Estado-Maior do Exército).\n' +
        'EB70-MC-10.238 — Manual de Campanha Logística Militar Terrestre, 2ª ed. 2022 (COTER).\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico, 2ª ed. 2022 (COTER).\n' +
        'NARSUP — Normas Administrativas Relativas ao Suprimento.\n' +
        'Formulário de Levantamento de Necessidades (modelo da E/4).\n' +
        'Histórico de consumo médio das OMDS (consulta ao SIGELOG).\n' +
        'Quadro de Dotação Vigente (documento controlado do Chefe da E/4).\n' +
        'Regimento Interno do Cmdo Bda Inf Amv, Art. 3º, incisos I e II.',
      descricao:
        'A E/4 abre a rodada de levantamento enviando o formulário às OMDS, com prazo de 48 horas. As OMDS detalham a necessidade por item, quantidade e prazo, respeitando a dotação vigente.\n' +
        'O Adjunto da E/4 recebe as respostas e confere cada uma: confronta a quantidade pedida com o consumo médio dos últimos três meses, verifica se o item pertence à classe correta e se não há duplicidade em relação ao que a própria OM já possui. As divergências são devolvidas à OM para ajuste.\n' +
        'Encerrado o levantamento, o Adjunto consolida tudo num quadro único, agrupando por classe e por OMDS, e calcula o total da Brigada por item. Paralelamente, o Auxiliar 3 informa o saldo já existente em estoque, para que o pedido final seja a diferença entre a necessidade e o saldo.\n' +
        'O quadro é entregue ao Chefe da E/4 com a relação das OMDS que não responderam no prazo e a justificativa das divergências encontradas.',
      competencias:
        'Levantar e consolidar dados quantitativos de várias fontes.\n' +
        'Trabalhar com tabelas e planilhas de controle de suprimento.\n' +
        'Aplicar o Quadro de Dotação Vigente e o consumo médio histórico.\n' +
        'Redigir correspondência e ofício de devolução de divergências.\n' +
        'Operar o SIGELOG para consulta e atualização de saldos.\n' +
        'Trabalhar com prazos e com controle de pendências.',
      registros:
        'Formulário de levantamento de necessidades, por OMDS.\n' +
        'Registro das divergências encontradas e das devoluções.\n' +
        'Quadro consolidado de necessidades por classe e por OMDS.\n' +
        'Planilha de cálculo de saldo versus necessidade.\n' +
        'Lista de OMDS pendentes de resposta.\n' +
        'Protocolo de entrega do quadro ao Chefe da E/4.',
      riscos:
        'OMDS que não responde no prazo: compromete a completude do quadro. Controle: controle diário de pendências e escalonamento ao Cmt da Bda.\n' +
        'Necessidade inflada por falta de conferência local: gera pedido acima do razoável. Controle: comparação com o consumo médio e com o saldo em estoque.\n' +
        'Duplicidade entre OMDS: gera quantidade indevida. Controle: conferência item a item contra o cadastro de material.\n' +
        'Erro de digitação nas quantidades: tem impacto direto no pedido. Controle: revisão por segundo militar e conferência de coerência com a série histórica.\n' +
        'Item informado na classe errada: atrasa o atendimento. Controle: tabela de conversão classe por item.',
      controles:
        'Ambiental: a consolidação é atividade administrativa; a opção por planilha eletrônica, em vez de impressões, reduz o consumo de papel.\n' +
        'Controle de versão: todo quadro consolidado recebe data e responsável, sendo arquivado no livro da E/4.\n' +
        'Controle de integridade: conferência da soma por item e por classe, e conferência do saldo de estoque antes do envio.\n' +
        'Infraestrutura: computador com acesso ao SIGELOG, planilha de controle e acesso ao quadro de dotação vigente.\n' +
        'Trilha de auditoria: registro de quem preencheu, quem conferiu e quem aprovou o quadro.',
    },
    fluxo: [
      's|Aberta a rodada de levantamento do ciclo',
      't|Enviar o formulário de necessidades às OMDS, com prazo de 48 horas',
      'g|Todas as OMDS responderam no prazo?|2',
      't|Registrar as OMDS pendentes, se houver, e escalar ao Cmt da Bda',
      'g|Todas as OMDS responderam após a reiteração do pedido?|2',
      't|Conferir cada resposta com o consumo médio, com a dotação vigente e com o saldo em estoque',
      't|Corrigir na E/4 o que for sanável e devolver à OM o restante das divergências encontradas',
      'g|Todas as respostas ficaram coerentes com o consumo previsto?|6',
      't|Consolidar o quadro único por classe e por OMDS',
      't|Entregar o quadro ao Chefe da E/4, com a relação das OMDS pendentes e das divergências',
      'e|Fim do processo',
    ].join('\n'),
  },
  {
    codigo: 'E4-03',
    assunto: 'controlar a manutenção de material e viaturas',
    objetivo:
      'Assegurar a disponibilidade de viaturas e de material por meio da manutenção programada, corretiva e de inspeção, com registro no SISLOGMNT.',
    area: 'Finalísticos',
    processo2: 'Manutenção de 2º escalão de viaturas, de armamento e de material',
    responsavel: 'ST Valter — Auxiliar 1 da E/4',
    aprovSecao: true,
    aprovGestao: false,
    secoes: {
      objetivos:
        '- Manter a disponibilidade do material e das viaturas em nível compatível com a missão.\n' +
        '- Programar e acompanhar a manutenção preventiva e as inspeções periódicas.\n' +
        '- Encaminhar em tempo adequado o material que exige intervenção de 2º escalão.\n' +
        '- Registrar toda intervenção, peça aplicada e hora-homem gasta no SISLOGMNT.\n' +
        '- Informar ao Chefe da E/4 a situação de indisponibilidade crítica e o prazo de recuperação.',
      siglas:
        'E/4 — 4ª Seção (Logística)\n' +
        'SISLOGMNT — Sistema de Gestão de Manutenção\n' +
        'OM — Organização Militar\n' +
        'OMDS — Organizações Militares Diretamente Subordinadas\n' +
        '1º escalão — manutenção de rotina executada pelo condutor ou pelo operador\n' +
        '2º escalão — manutenção corretiva executada pela tropa da própria OM ou por oficina designada\n' +
        '3º escalão — manutenção de maior complexidade, executada pelo B Log ou pelo CIPM\n' +
        'PM — Preventive Maintenance (manutenção preventiva)\n' +
        'MTTR — Mean Time To Repair (tempo médio de correção)\n' +
        'OS — Ordem de Serviço\n' +
        'EB20-MC-10.204 — Manual de Logística do Exército, 3ª ed. 2014.',
      campoAplicacao:
        'Aplica-se a todo o material e a todas as viaturas sob responsabilidade da E/4 e das OMDS, em tempo de paz e em operação. Cobre a manutenção de 1º e de 2º escalões. Não cobre a manutenção de 3º escalão, executada pelo Batalhão Logístico ou pelo CIPM quando a necessidade exceder a capacidade do 2º escalão.',
      responsabilidades:
        'Auxiliar 1 da E/4 (ST Valter) — Responsável pela programação, pelo acompanhamento e pelo registro da manutenção.\n' +
        'Auxiliar 2 (1º Sgt Richardson) — Executa o registro de entrada e de saída do material da manutenção.\n' +
        'Auxiliar 3 (Sd Ev Prado) — Controla o estoque de peças e de Classe IX.\n' +
        'OMDS — Executam a manutenção de 1º escalão e informam as necessidades de 2º escalão.\n' +
        'Oficina de manutenção designada — Executa a manutenção de 2º escalão.\n' +
        'Chefe da E/4 (Maj Filipe) — Aprova a reprogramação quando há indisponibilidade crítica.\n' +
        'B Log e CIPM — Executam a manutenção de 3º escalão.',
      limites:
        'Fornecedores: peças de reposição (Classe IX) do depósito do B Log; oficina de 2º escalão; serviços especializados de centro de manutenção.\n' +
        'Clientes: todas as OMDS da Brigada e, transitivamente, as unidades apoiadas.\n' +
        'Limite de escopo: manter apenas o parque mínimo necessário e a reserva estratégica.\n' +
        'Limite de tempo: prazos de recuperação por tipo de intervenção, acompanhados semanalmente.\n' +
        'Limite de recurso: o consumo de peças por viatura não pode ultrapassar a média histórica sem justificativa técnica.',
      documentos:
        'EB20-MC-10.204 — Manual de Logística do Exército, 3ª ed. 2014 (parte de manutenção).\n' +
        'NARMNT — Normas Administrativas Relativas à Manutenção.\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico, 2ª ed. 2022 (COTER).\n' +
        'Manual do SISLOGMNT (sistema de gestão de manutenção).\n' +
        'Plano de Manutenção de 1º e de 2º escalões da Bda.\n' +
        'Catálogo de peças de reposição (Classe IX).\n' +
        'Regimento Interno do Cmdo Bda Inf Amv, Art. 3º, inciso IV.',
      descricao:
        'Mensalmente o Auxiliar 1 da E/4 monta o Plano de Manutenção a partir do histórico de horas de uso registrado no SISLOGMNT, do calendário de inspeções e do programa de revisão do fabricante. O plano é publicado e as OMDS recebem as janelas de manutenção da semana.\n' +
        'A manutenção preventiva é executada nas OMDS e registrada no SISLOGMNT com data, quilometragem, horas de motor, defeito encontrado, peça aplicada e responsável.\n' +
        'Defeitos de 1º escalão são resolvidos na própria OM. Defeitos que exigem intervenção especializada são abertos como chamado de 2º escalão, com a retirada do material do parque e a comunicação ao Auxiliar 2 para substituição por uma viatura reserva.\n' +
        'O material retirado é encaminhado à oficina designada, que executa a intervenção e devolve o item pronto com o laudo. Toda peça consumida é baixa do estoque de Classe IX, com entrada automática no SISLOGMNT.\n' +
        'Semanalmente o Auxiliar 1 atualiza a situação de disponibilidade por viatura e por tipo de material e reporta ao Chefe da E/4. As indisponibilidades críticas são comunicadas imediatamente, com previsão de recuperação, para reprogramação do apoio.',
      competencias:
        'Programar e controlar manutenção preventiva e corretiva.\n' +
        'Diagnosticar defeitos mecânicos e definir o nível de intervenção.\n' +
        'Operar o SISLOGMNT para registro e consulta.\n' +
        'Controlar o estoque de peças de reposição e a sua aplicação.\n' +
        'Analisar indicadores de disponibilidade e de consumo de peças.\n' +
        'Redigir e protocolar chamados de manutenção.\n' +
        'Conhecer o parque de viaturas e a capacidade de cada tipo.',
      registros:
        'Plano de manutenção mensal publicado.\n' +
        'Registro de manutenção preventiva no SISLOGMNT.\n' +
        'Chamado de manutenção de 2º escalão (aberto, em andamento, concluído).\n' +
        'Ordem de serviço da oficina, com laudo de conclusão.\n' +
        'Baixa das peças de reposição aplicadas.\n' +
        'Boletim semanal de disponibilidade do parque.\n' +
        'Registro de manutenção corretiva de emergência.',
      riscos:
        'Defeito em sistema crítico: perda de capacidade operacional. Controle: plano de manutenção com prazo estrito e viatura reserva.\n' +
        'Falta de peça de reposição (Classe IX): manter o material fora de uso além do previsto. Controle: estoque mínimo por item e pedido antecipado ao B Log.\n' +
        'Falha no registro no SISLOGMNT: perder o histórico e distorcer os indicadores. Controle: conferência mensal de lançamentos.\n' +
        'Divergência entre horas reais e horas lançadas: gerar custo incorreto. Controle: conferência do hodômetro no retorno da intervenção.\n' +
        'Oficina indisponível: acúmulo de chamados. Controle: fila priorizada por criticidade e escalonamento ao B Log.\n' +
        'Ponto de risco crítico: munição com defeito no mecanismo de disparo. Tratamento: substituição pelo Auxiliar 2 e baixa imediata do lote.',
      controles:
        'Ambiental: descarte correto de óleo, graxa, filtros e baterias usados, conforme a legislação ambiental; separação e destinação de resíduos especiais.\n' +
        'Controle de segurança: uso de EPI e de dispositivos de bloqueio durante as intervenções; observância da NR-12 e da NR-35.\n' +
        'Controle de qualidade: conferência da peça aplicada e do teste de funcionamento antes da devolução do material ao parque.\n' +
        'Infraestrutura: acesso ao SISLOGMNT; oficina de 2º escalão com bancada, elevador e estoque mínimo de peças; sinalização de segurança.\n' +
        'Controle de rastreabilidade: número de série e placa de cada item ligados a todas as ordens de serviço.',
    },
    fluxo: [
      's|Início do ciclo mensal de manutenção',
      't|Extrair do SISLOGMNT o histórico de uso e montar o Plano de Manutenção',
      't|Publicar o plano e distribuir às OMDS as janelas de manutenção',
      't|Executar a manutenção preventiva e registrar no SISLOGMNT',
      'g|A viatura permaneceu indisponível após a manutenção preventiva?|4',
      't|Abrir chamado de 2º escalão, substituir por viatura reserva e enviar à oficina designada',
      't|Registrar a ordem de serviço e baixar as peças de reposição aplicadas',
      'g|O material está apto ao retorno ao parque?|6',
      't|Atualizar a disponibilidade do parque e reportar ao Chefe da E/4, com a previsão de recuperação',
      'e|Fim do processo',
    ].join('\n'),
  },
  {
    codigo: 'E4-04',
    assunto: 'receber e distribuir suprimentos',
    objetivo:
      'Receber, conferir, registrar e distribuir fisicamente as entregas de suprimento às OMDS, garantindo integridade, rastreabilidade e destinação correta.',
    area: 'Finalísticos',
    processo2: 'Recebimento, conferência e distribuição de Classes I, III, V e IX',
    responsavel: '1º Sgt Richardson — Auxiliar 2 da E/4',
    aprovSecao: true,
    aprovGestao: false,
    secoes: {
      objetivos:
        '- Receber e conferir fisicamente as entregas do B Log e dos depósitos de suprimento.\n' +
        '- Registrar entrada e saída no SIGELOG com rastreabilidade ao documento de origem.\n' +
        '- Distribuir às OMDS conforme o Plano de Apoio Logístico aprovado.\n' +
        '- Expedir munição e itens controlados com observância das regras de segurança e de transporte.\n' +
        '- Registrar e tratar imediatamente as divergências de quantidade, de qualidade ou de avaria.',
      siglas:
        'E/4 — 4ª Seção (Logística)\n' +
        'SIGELOG — Sistema de Gestão Logística\n' +
        'MPE — Máscara de Proteção Especial\n' +
        'Classe I — Vestes, calçados e uniformes\n' +
        'Classe III — Combustíveis e lubrificantes\n' +
        'Classe V — Munição\n' +
        'Classe IX — Peças de reposição\n' +
        'B Log — Batalhão Logístico\n' +
        'OMDS — Organizações Militares Diretamente Subordinadas\n' +
        'NOTA — Nota de Remessa\n' +
        'DANFE — Documento Auxiliar da Nota Fiscal Eletrônica\n' +
        'NPS — Nível de suprimento\n' +
        'EB70-MC-10.238 — Manual de Campanha Logística Militar Terrestre\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico',
      campoAplicacao:
        'Aplica-se ao recebimento de toda entrega destinada à E/4 ou às OMDS da Brigada, no Depósito da Seção ou no ponto de entrega designado, em tempo de paz e em operação. Aplica-se igualmente à expedição de itens de uso restrito, como munição, material de saúde e material controlado.',
      responsabilidades:
        'Auxiliar 2 da E/4 (1º Sgt Richardson) — Responsável pelo recebimento, pela conferência e pela expedição.\n' +
        'Auxiliar 3 (Sd Ev Prado) — Recebe a prévia do lançamento no SIGELOG e concilia as entradas.\n' +
        'Auxiliar 1 (ST Valter) — Recebe a peça de reposição vinda do fluxo de manutenção.\n' +
        'OMDS — Retiram a carga no prazo e no local indicados.\n' +
        'B Log e depósitos — Entregam conforme nota e prazo.\n' +
        'Chefe da E/4 (Maj Filipe) — Autoriza entregas fora do plano e assina a baixa de material controlado.',
      limites:
        'Fornecedores: Batalhão Logístico, depósitos de Classe I, de Classe III e de Classe V, e requisição direta ao SISCOM.\n' +
        'Clientes: todas as OMDS da Brigada.\n' +
        'Limite de conferência: conferência cega de 100% dos itens controlados e por amostragem de 10% dos demais.\n' +
        'Limite de guarda: prazo máximo de estocagem no Depósito da Seção, com regras de validade e de integridade da embalagem.\n' +
        'Limite de segurança: munição transportada em viatura adequada, com amarração específica e, quando determinada, escolta.',
      documentos:
        'EB20-MC-10.204 — Manual de Logística do Exército, 3ª ed. 2014.\n' +
        'EB70-MC-10.238 — Manual de Campanha Logística Militar Terrestre, 2ª ed. 2022 (COTER).\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico, 2ª ed. 2022 (COTER).\n' +
        'NARSUP — Normas Administrativas Relativas ao Suprimento.\n' +
        'Nota de Remessa e DANFE da entrega.\n' +
        'Plano de Apoio Logístico da Brigada (versão aprovada).\n' +
        'Ficha de controle de entrega por OMDS (modelo da E/4).\n' +
        'Procedimento de expedição de material controlado (uso restrito).\n' +
        'Regimento Interno do Cmdo Bda Inf Amv, Art. 3º, inciso I.',
      descricao:
        'Antes da entrega, o Auxiliar 2 recebe do B Log a nota de remessa com a relação de itens, as quantidades, os prazos e o meio de transporte. Com base nela, abre a ordem de recebimento no SIGELOG e organiza a conferência.\n' +
        'A carga é conferida fisicamente. Os itens controlados, como munição e material de saúde, são conferidos em 100% e por dupla checagem. Os demais itens são conferidos por amostragem. A verificação inclui quantidade, estado, validade, integridade da embalagem e condição do item.\n' +
        'Encontrada divergência, a conferência é interrompida e registrada em termo de divergência, que acompanha a nota de remessa. A carga divergente não entra em estoque: o excedente é devolvido ao B Log com o termo, e o recebimento fica pendente até a regularização. A falta é comunicada imediatamente ao Chefe da E/4, e a entrega complementar é solicitada.\n' +
        'Confirmada a entrega, o Auxiliar 2 dá entrada no estoque e agenda a distribuição conforme o Plano de Apoio Logístico. Cada OMDS retira no local e no prazo indicados, assinando o recebimento. Os itens de uso restrito são expedidos com conferência de destino e registro em livro de controle.\n' +
        'O Auxiliar 3 concilia, ao fim do dia, o movimento físico com o lançamento no SIGELOG, garantindo que entrada e saída tenham equivalência.',
      competencias:
        'Conferir material e registrar entrada e saída em sistema de gestão.\n' +
        'Aplicar as regras de FEFO e de inventário rotativo.\n' +
        'Manter a guarda e o transporte de material controlado.\n' +
        'Redigir termos de divergência e ofícios de devolução.\n' +
        'Organizar a expedição para múltiplos destinos.\n' +
        'Conhecer o regulamento de suprimento e as regras de segurança para itens controlados.',
      registros:
        'Nota de remessa e DANFE arquivados por entrega.\n' +
        'Ordem de recebimento e entrada no SIGELOG.\n' +
        'Termo de divergência de recebimento.\n' +
        'Ficha de controle de entrega por OMDS, assinada.\n' +
        'Livro de registro de material controlado (munição e material de saúde).\n' +
        'Conciliação diária entre movimento físico e lançamento no sistema.\n' +
        'Relatório mensal de entradas, de saídas e de saldos por classe.',
      riscos:
        'Entrega com material danificado ou com validade curta: perda de valor e indisponibilidade. Controle: conferência na entrada e recusa formal quando necessário.\n' +
        'Divergência de quantidade não detectada: torna o saldo não confiável. Controle: conferência cega e conciliação diária.\n' +
        'Erro de destino na expedição: perda de rastreabilidade. Controle: dupla checagem do destino e assinatura no recebimento.\n' +
        'Falha de segurança no transporte de munição. Controle: veículo adequado, amarração das caixas, escolta e observância da norma de transporte.\n' +
        'Atraso na entrega por parte do fornecedor: impacta a operação. Controle: controle de prazo na nota de remessa e solicitação de entrega complementar.\n' +
        'Ponto de risco crítico: material de saúde vencido. Tratamento: baixa imediata e devolução ao fornecedor.',
      controles:
        'Ambiental: armazenamento de Classes I e III em local seco e arejado; descarte adequado de embalagens e de produtos vencidos; controle de vazamento de combustíveis.\n' +
        'Controle de segurança: guarda de material controlado em área restrita, com controle de acesso e registro de entrada e de saída; combate a incêndio no Depósito da Seção.\n' +
        'Controle de inventário: inventário rotativo mensal por item, com contagem cega e ajuste autorizado pelo Chefe da E/4.\n' +
        'Infraestrutura: depósito com controle de temperatura para material de saúde, empilhadeira para Classes III e IX e controle de acesso de viaturas.\n' +
        'Controle documental: toda entrada e toda saída têm documento-fonte identificável e numeração sequencial.',
    },
    fluxo: [
      's|Recebida a comunicação de entrega do B Log ou do depósito fornecedor',
      't|Obter a nota de remessa e abrir a ordem de recebimento no SIGELOG',
      't|Executar a conferência física da carga conforme a regra da classe',
      'g|A carga está incompleta ou diverge da nota de remessa?|3',
      't|Registrar termo de divergência, devolver o excedente e solicitar a complementação do que faltar',
      'g|A carga ficou completa e conferida?|2',
      't|Dar entrada no estoque e conferir a validade e a integridade do lote',
      't|Separar e expedir a carga por OMDS conforme o Plano de Apoio Logístico, registrando as não retiradas e reprogramando a entrega das OMDS remanescentes',
      'g|Todas as OMDS retiraram e assinaram o recebimento?|8',
      't|Conciliar o movimento físico com o lançamento no SIGELOG',
      'e|Fim do processo',
    ].join('\n'),
  },
  {
    codigo: 'E4-05',
    assunto: 'controlar o estoque e registrar no sistema',
    objetivo:
      'Manter o estoque da E/4 exato, com rastreabilidade de cada item, e garantir que os movimentos reflitam fielmente no sistema de gestão.',
    area: 'Suporte',
    processo2: 'Controle de estoque, inventário e escrituração no SIGELOG',
    responsavel: 'Sd Ev Prado — Auxiliar 3 da E/4',
    aprovSecao: true,
    aprovGestao: false,
    secoes: {
      objetivos:
        '- Manter o saldo físico e o saldo sistêmico coincidentes, com divergência igual a zero.\n' +
        '- Registrar com tempestividade toda entrada, saída, baixa e ajuste de estoque.\n' +
        '- Aplicar a contagem rotativa e o inventário geral periódico com contagem cega.\n' +
        '- Zelar pela validade, pela condição de guarda e pela aplicação das regras FIFO e FEFO.\n' +
        '- Prestar a posição de estoque ao Chefe da E/4 e à Chefia de Logística sempre que solicitada.',
      siglas:
        'E/4 — 4ª Seção (Logística)\n' +
        'SIGELOG — Sistema de Gestão Logística\n' +
        'FEFO — First Expired, First Out (primeiro que vence, primeiro que sai)\n' +
        'FIFO — First In, First Out (primeiro que entra, primeiro que sai)\n' +
        'SD — Guarda de estoque\n' +
        'NPS — Nível de suprimento\n' +
        'PRM — Ponto de reposição mínimo\n' +
        'Classe I — Vestes, calçados e uniformes\n' +
        'Classe III — Combustíveis e lubrificantes\n' +
        'Classe V — Munição\n' +
        'Classe IX — Peças de reposição\n' +
        'EB70-MC-10.238 — Manual de Campanha Logística Militar Terrestre\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico',
      campoAplicacao:
        'Aplica-se ao Depósito da E/4 e ao registro de todos os movimentos de material vinculados à Seção, em todas as classes. Aplica-se igualmente ao estoque de peças de reposição utilizado pela manutenção. Não substitui o controle físico do processo de recebimento e distribuição (E4-04), com o qual é complementar.',
      responsabilidades:
        'Auxiliar 3 da E/4 (Sd Ev Prado) — Responsável pela escrita, pela contagem e pela conciliação do estoque.\n' +
        'Auxiliar 2 (1º Sgt Richardson) — Comunica toda entrada e toda saída para lançamento.\n' +
        'Auxiliar 1 (ST Valter) — Comunica as baixas de peças aplicadas em manutenção.\n' +
        'Chefe da E/4 (Maj Filipe) — Autoriza ajustes de saldo e baixa de material inservível.\n' +
        'B Log e depósitos — Fonte de atualização de saldo por reposição.\n' +
        'OMDS — Destinatárias das saídas registradas.',
      limites:
        'Fornecedores de informação: os próprios responsáveis pelos movimentos (E4-03 e E4-04).\n' +
        'Clientes: Chefe da E/4, Chefia de Logística da Bda e, por determinação, o comando superior.\n' +
        'Limite de cobertura: todos os itens sob guarda da E/4, sem exceção.\n' +
        'Limite de precisão: divergência máxima aceitável de 0,5% do valor total do estoque, com registro e tratativa.\n' +
        'Limite de periodicidade: contagem rotativa mensal por item de alto valor e inventário geral trimestral.',
      documentos:
        'EB20-MC-10.204 — Manual de Logística do Exército, 3ª ed. 2014.\n' +
        'EB70-MC-10.238 — Manual de Campanha Logística Militar Terrestre, 2ª ed. 2022 (COTER).\n' +
        'EB70-MC-10.317 — Manual de Campanha Batalhão Logístico, 2ª ed. 2022 (COTER).\n' +
        'NARSUP — Normas Administrativas Relativas ao Suprimento.\n' +
        'Manual do SIGELOG — regras de lançamento e de ajuste.\n' +
        'Livro de Registro do Depósito da E/4 (formulário próprio).\n' +
        'Termo de Inventário Geral (modelo da E/4).\n' +
        'Plano de Manutenção e de Estoque da Seção.\n' +
        'Regimento Interno do Cmdo Bda Inf Amv, Art. 3º, incisos V e VI.',
      descricao:
        'O Auxiliar 3 mantém o controle em duas frentes: o registro físico no Livro de Registro do Depósito e o registro sistêmico no SIGELOG. Toda entrada comunicada pelo Auxiliar 2 e toda baixa comunicada pelo Auxiliar 1 é lançada no mesmo dia em que ocorre o fato.\n' +
        'Semanalmente ele executa a contagem rotativa de um grupo de itens, sorteado pelo próprio sistema, em contagem cega — o conferente não consulta o saldo antes de contar. A diferença apurada é registrada em termo e, se confirmada, lançada como ajuste, com a assinatura do Chefe da E/4.\n' +
        'Mensalmente ele verifica a validade dos itens controlados e organiza a expedição segundo a regra FEFO, sinalizando e separando os lotes a vencer. Trimestralmente realiza o inventário geral, com contagem cega de todos os itens, emitindo o Termo de Inventário Geral e reconciliando a diferença total.\n' +
        'A posição de estoque é apresentada ao Chefe da E/4 em relatório mensal, com saldo por classe e por item, valor estimado, itens em vencimento e itens de baixa utilização. O Auxiliar 3 mantém o ponto de reposição mínimo (PRM) de cada item e avisa ao B Log antes de atingir o limite.',
      competencias:
        'Operar o SIGELOG para lançamento, consulta e ajuste.\n' +
        'Executar inventário e contagem cega com método estatístico.\n' +
        'Aplicar regras de armazenamento, de FEFO e de FIFO.\n' +
        'Redigir termos de divergência e de inventário.\n' +
        'Analisar indicadores de giro e de ponto de reposição.\n' +
        'Manter a guarda física e a segurança do Depósito da Seção.\n' +
        'Prestar posição de estoque com responsabilidade e exatidão.',
      registros:
        'Livro de Registro do Depósito da E/4.\n' +
        'Termos de contagem rotativa e de inventário geral.\n' +
        'Ajustes de saldo autorizados e assinados.\n' +
        'Relatório mensal de posição de estoque.\n' +
        'Registro de itens em vencimento e de baixa por inserviço.\n' +
        'Registro de baixa de material controlado (munição e material de saúde).\n' +
        'Histórico de lançamentos no SIGELOG, com usuário e data.',
      riscos:
        'Lançamento atrasado ou errado: distorce a posição de estoque e induz pedido indevido. Controle: lançamento no mesmo dia e conferência pelo Auxiliar 1.\n' +
        'Divergência entre o saldo físico e o sistêmico: perda de rastreabilidade. Controle: contagem cega rotativa e inventário geral trimestral.\n' +
        'Estoque de segurança não reposicionado: paralisa o atendimento. Controle: ponto de reposição mínimo monitorado e aviso antecipado ao B Log.\n' +
        'Item vencido mantido em estoque: perda de valor e risco de uso impróprio. Controle: relatório mensal de vencimentos, com retirada programada.\n' +
        'Acesso indevido ao Depósito: furto ou avaria. Controle: controle de acesso, registro de entrada e de saída, e inventário como detecção.\n' +
        'Ponto de risco crítico: erro de saldo de munição. Tratamento: conferência especial de Classe V a cada movimentação e dupla checagem mensal.',
      controles:
        'Ambiental: separação adequada de resíduos e de material reciclável; controle de temperatura e de ventilação do Depósito; descarte correto de material vencido.\n' +
        'Controle de segurança: acesso restrito ao Depósito, com registro; extintores e sinalização; EPI para o manuseio de Classes III e V.\n' +
        'Controle de integridade: contagem cega obrigatória em inventário, com segregação entre quem lança e quem confere.\n' +
        'Infraestrutura: computador com acesso ao SIGELOG, terminal de leitura de etiqueta, sistema de inventário e espaço de estocagem sinalizado.\n' +
        'Controle de documentação: todo ajuste no saldo tem termo assinado; todo lançamento tem usuário, data e hora registrados no sistema.',
    },
    fluxo: [
      's|Recebida a comunicação de entrada, de saída ou de baixa de material',
      't|Lançar o movimento no SIGELOG e no Livro de Registro do Depósito no mesmo dia',
      't|Executar a contagem rotativa semanal dos itens sorteados, em contagem cega',
      'g|A contagem divergiu do saldo sistêmico?|3',
      't|Registrar termo de divergência e obter autorização do Chefe da E/4 para o ajuste',
      't|Conferir validades, sinalizar os lotes a vencer e aplicar a regra FEFO na separação',
      't|Monitorar o ponto de reposição mínimo e avisar o B Log antes de atingir o limite',
      't|Elaborar o relatório mensal de posição de estoque e de itens em vencimento',
      'g|A posição foi aceita pela Chefia da E/4?|8',
      't|Recalcular a posição de estoque com as correções apontadas e reenviar para conferência',
      't|Trimestralmente, realizar o inventário geral em contagem cega e emitir o Termo de Inventário Geral',
      'e|Fim do processo',
    ].join('\n'),
  },
]

/** Gera a lista inicial completa, já com id sequencial e datas. */
export function processosIniciais() {
  const agora = new Date().toISOString()
  return processos.map((p, i) => ({
    id: i + 1,
    om: OM,
    secao: SECAO,
    macroprocesso: MACROPROCESSO,
    aprovSecao: p.aprovSecao,
    aprovGestao: p.aprovGestao,
    assunto: p.assunto,
    objetivo: p.objetivo,
    area: p.area,
    processo2: p.processo2,
    codigo: p.codigo,
    responsavel: p.responsavel,
    secoes: p.secoes,
    fluxo: p.fluxo || FLUXO_PADRAO,
    criadoEm: agora,
    atualizadoEm: agora,
  }))
}
