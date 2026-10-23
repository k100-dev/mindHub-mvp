# Instruções para o Codex — MindHub MVP Acadêmico | Estágio Fase 2

> **Missão:** estudar o MindHub original e desenvolver, em repositório independente, um MVP simples e demonstrável para a primeira banca da Fase 2 do estágio, com coerência integral entre requisitos, código, banco, UML, relatórios e PDFs de entrega.
>
> **Início recomendado:** leia este documento integralmente, faça o diagnóstico inicial e execute as etapas na ordem descrita. Não modifique o projeto original.

## 1. Repositórios e regras de preservação

- **Original (referência; somente leitura):** https://github.com/k100-dev/mindHub
- **MVP (destino de todas as implementações):** https://github.com/k100-dev/mindHub-mvp
- O repositório MVP foi criado separadamente para **não comprometer a versão atual do produto**.
- Inspecione ambos os repositórios e registre o commit exato do original usado como referência. Não pressuponha que os conteúdos e commits continuam iguais aos de inspeções anteriores.
- Não envie commits, pull requests nem altere configuração, ambiente ou banco do repositório original.
- No repositório MVP, prefira uma branch de trabalho, commits pequenos e `main` estável.
- Não copie `.env`, chaves, segredos ou dados pessoais. Use **dados sintéticos** e infraestrutura de teste independente.

## 2. Objetivo acadêmico e recorte funcional

A fase atual é **Fase 2, primeira banca**, cujo sistema demonstrável deve ser **simples: CRUD e algumas funcionalidades complementares**. O MVP não precisa reproduzir o produto inteiro.

**Proposta de recorte (validar tecnicamente após estudar o original):**

### UC01 — Gerenciar pacientes
1. Cadastrar paciente.
2. Listar, pesquisar e consultar detalhes.
3. Editar dados administrativos.
4. Inativar e reativar, preservando histórico (exclusão lógica, não exclusão física, caso corresponda ao modelo adotado).
5. Validar entrada, autorização e persistência após recarregar a página.

### UC02 — Gerenciar agendamentos
1. Cadastrar agendamento vinculado a paciente.
2. Listar e consultar agendamentos.
3. Alterar data/horário.
4. Cancelar e preservar o histórico.
5. Validar conflitos de horário e persistência.

### Apoio mínimo
- Login e proteção do acesso profissional.
- Interface responsiva, consistente, com mensagens de sucesso/erro.
- Banco de dados efetivo e independente, com migrações reproduzíveis.
- Dados fictícios/seed para demonstração.

**Fora do escopo obrigatório:** pagamento automático, Mercado Pago, WhatsApp, prontuário clínico, teleconsulta, SaaS, integrações externas complexas e automações sofisticadas. Não implementar esses recursos para a banca. Documente-os, se pertinentes, como evolução futura.

**Importante:** o código original é uma *referência de implementação*, mas as regras do MVP precisam estar documentadas em seu próprio escopo. O estado atual e o histórico do produto não podem ser confundidos.

## 3. Etapa A — Estudo e diagnóstico obrigatório

Antes de alterar código:

1. Estude estrutura, linguagem, framework, dependências, UI e arquitetura do original.
2. Leia `README.md`, `docs/ESCOPO-VIGENTE.md`, `docs/VALIDACAO-BANCA.md` e demais documentos relevantes disponíveis.
3. Inspecione migrações SQL, entidades, operações CRUD, regras de autorização, RLS, rotas e testes relativos a pacientes e agendamentos.
4. Separe fatos observados no código, evidências de testes executados por você, afirmações presentes em documentos e propostas ainda não implementadas.
5. Identifique componentes reutilizáveis e funcionalidades que devem ser omitidas para reduzir a complexidade.
6. Confira a existência e o estado do repositório MVP antes de inicializá-lo.
7. Produza `docs/estagio/fase-2/00-controle/DIAGNOSTICO.md` com achados, decisões, riscos e referências de commits/arquivos.

Não confunda evidência registrada em um relatório histórico com teste executado nesta sessão.

## 4. Etapa B — Construir o MVP no repositório dedicado

- Inicialize a aplicação do MVP, priorizando **reaproveitamento responsável** do código existente quando reduzir risco e esforço.
- Preserve consistência de nomenclatura, padrões de validação, autorização e identidade visual do MindHub.
- Simplifique dependências e módulos sem comprometer o funcionamento de UC01 e UC02.
- Implemente a persistência de verdade, não apenas estado local de interface.
- Garanta segurança básica: acesso autenticado, autorização no servidor, isolamento apropriado dos dados e proteção de segredos.
- Projete o roteiro de demonstração para funcionar com dados sintéticos e de forma reproduzível.
- Execute e registre instalação, lint, tipagem, build, testes de fluxo, integridade do banco e navegação.

## 5. Entregáveis acadêmicos obrigatórios

A faculdade determina entrega **SEM compactar**. Documentos textuais, imagens, diagramas, workflow e DER devem estar **em PDF individual**. Preserve fontes editáveis separadamente.

| ID | Artefato obrigatório | Observação |
|---|---|---|
| EST-01 | Solicitação dos Principais Envolvidos / Pedido dos Investidores | Usar modelo RUP correspondente |
| EST-02 | Especificação Suplementar (Requisitos Não Funcionais) | Usar modelo fornecido |
| EST-03 | Documento de Visão (Informal) | Usar modelo fornecido |
| EST-04 | Diagrama de Caso de Uso | Coerente com os atores e UCs do MVP |
| EST-05 | Diagrama de Classes | Coerente com o domínio efetivamente adotado |
| EST-06 | Diagrama Entidade-Relacionamento (DER) | Coerente com as tabelas do MVP |
| EST-07 | Especificação de Caso de Uso — UC01 | Fluxos normais, alternativas, pré/pós-condições |
| EST-08 | Especificação de Caso de Uso — UC02 | Fluxos normais, alternativas, pré/pós-condições |
| EST-09 | Diagrama de Implantação | Refletir a topologia real do MVP |
| EST-10 | Diagrama de Sequência — UC01 | Refletir chamadas reais do CRUD |
| EST-11 | Diagrama de Sequência — UC02 | Refletir criação/alteração de agendamento |
| EST-12 | Diagrama de Estado | Uma entidade implementada, estados/transições reais |
| EST-13 | Glossário | Nomes padronizados em todos os documentos |
| EST-14 | Telas | Capturas fiéis das interfaces reais, identificadas |
| EST-15 | RPOD | **Pendente**: não inventar significado/template; identificar modelo institucional |
| EST-16 | Caso de Uso Funcional — 01 | Manter como artefato distinto da especificação, até orientação contrária |
| EST-17 | Caso de Uso Funcional — 02 | Manter como artefato distinto da especificação, até orientação contrária |
| EST-18 | Workflow As-Is | Processo **manual atual/anterior à solução**, não fluxo To-Be |
| EST-19 | Relatório de Estágio atualizado | Baseado no estágio MindHub, não no conteúdo de outros projetos |

**Fontes acadêmicas fornecidas pelo aluno:**
- `rup_stkreq.docx` — Pedidos do Investidor.
- `rup_sspec.docx` — Especificação Complementar/Suplementar.
- `rup_devcase.docx` — Caso de Desenvolvimento (modelo metodológico; não está explicitamente na lista de entrega).
- `rup_gloss.docx` — Glossário.
- `vision_informal (3).dot.docx` — Visão informal.
- `Relatorio de estagio_01.docx`, `_02.docx`, `_03.docx`, `_04.docx` — **exemplos estruturais de outros projetos**, não fontes de fatos para o MindHub.

Esses arquivos precisam estar acessíveis no workspace do Codex, por exemplo em `referencias-faculdade/`, **antes de produzir os documentos finais**. Se não estiverem disponíveis, registre o impedimento; não finja ter seguido o modelo.

Ao preencher templates, remova orientações de preenchimento, placeholders, textos de exemplo e campos pendentes apenas quando existirem informações verificadas. Nunca invente entrevistas, dados do orientador, número de horas, datas de entrega, assinaturas, decisões de investidores ou aprovação de banca.

## 6. Matriz única de rastreabilidade

Crie e mantenha `docs/estagio/fase-2/00-controle/MATRIZ-RASTREABILIDADE.md`, cobrindo:

**Necessidade → RF/RNF → UC → Diagrama → Tela → API/Serviço → Entidade/Tabela → Teste → Evidência.**

IDs iniciais sugeridos (ajuste após confrontar com o modelo real):

- `RF-001` — Cadastrar paciente.
- `RF-002` — Consultar/listar pacientes.
- `RF-003` — Atualizar paciente.
- `RF-004` — Inativar/reativar paciente.
- `RF-005` — Criar agendamento.
- `RF-006` — Consultar agendamentos.
- `RF-007` — Alterar agendamento.
- `RF-008` — Cancelar agendamento.

Defina também RNFs específicos e testáveis. Evite métricas arbitrárias ou garantias de segurança não verificadas. Use os mesmos nomes, regras, cardinalidades, atributos e estados em documentos, banco e software.

## 7. Organização canônica do repositório MVP

Estrutura sugerida, adaptável à organização técnica encontrada:

```text
docs/
  estagio/
    fase-2/
      00-controle/
      01-requisitos/
      02-casos-de-uso/
      03-diagramas/
      04-telas/
      05-relatorio/
      06-evidencias/
      07-entrega-pdf/
      99-referencias/
```

- Coloque fontes editáveis fora de `07-entrega-pdf`.
- Armazene em `07-entrega-pdf` **somente os PDFs individuais finais e aprovados para submissão**, sem ZIP.
- Mantenha `INDICE.md`, histórico de revisões e `MANIFESTO-ENTREGA.md`, contendo arquivo, versão, status, data, commit de referência e checksum.
- Use estados explícitos: `EM ELABORAÇÃO`, `AGUARDANDO REVISÃO`, `PRONTO PARA ENVIO`, `ENVIADO` (com comprovante), `ACEITO` (com comprovação).
- Não declare que a faculdade recebeu ou aprovou materiais sem evidência.

## 8. Relatório de estágio e apresentação

Produza relatório autoral e atualizado do **MindHub MVP**, seguindo estrutura do modelo acadêmico aplicável:

1. Contexto, problema e justificativa.
2. Objetivo geral e objetivos específicos.
3. Escopo, requisitos e casos de uso.
4. Modelagem (caso de uso, classes, DER, sequência, estados, implantação).
5. Workflow As-Is.
6. Telas e descrição da implementação.
7. Tecnologias, recursos e ambiente.
8. Cronograma e atividades efetivamente realizadas (sem inventar datas/horas).
9. Evidências, testes, resultados e limitações.
10. Conclusões, trabalhos futuros e referências.

Prepare um roteiro de demonstração curto: login → cadastro de paciente → listagem/pesquisa → edição → inativação/reativação → cadastro/alteração/cancelamento de agendamento. Use dados fictícios e prever alternativa local se ambiente remoto falhar.

## 9. Validação técnica e editorial

### Verificações obrigatórias
- Instalação e execução reproduzíveis.
- Lint, tipagem, testes automatizados e build, quando aplicáveis.
- CRUD de pacientes e agendamentos com persistência após recarga.
- Autorização de rotas e operações no servidor.
- Rejeição de dados inválidos e conflitos de horário.
- Testes de interfaces principais em tamanhos usuais de tela.
- Capturas reais e evidências identificadas por versão/commit.
- Consistência de terminologia e de escopo em todos os artefatos.
- Leitura e revisão visual de **cada PDF**: paginação, sumário, legibilidade dos diagramas, tabelas, títulos, ausência de placeholders e exportação correta.

Testes não executados devem constar como `NÃO EXECUTADO`, com justificativa. Não simule resultados.

## 10. Ordem de execução e entregas intermediárias

**A. Diagnóstico:** leitura dos repositórios e templates, identificação de baseline e mapa do que será reutilizado.

**B. Baseline:** inicialização do novo projeto, `README.md`, decisões técnicas e escopo congelado para banca.

**C. Implementação:** UC01, UC02, autenticação mínima e persistência, com testes e demo funcional.

**D. Modelagem:** UML, DER e BPMN com fontes editáveis e rastreabilidade.

**E. Documentação:** templates oficiais preenchidos, relatório, capturas e exportações PDF.

**F. Auditoria final:** revisão cruzada, checklist e manifesto da entrega; registrar bloqueios institucionais.

Trabalhe autonomamente nas etapas tecnicamente seguras e reporte impedimentos sem paralisar tarefas independentes. Solicite confirmação antes de qualquer ação destrutiva, acesso a produção ou decisão acadêmica que exija o aluno/orientador.

## 11. Critérios de conclusão

A execução está pronta para revisão do aluno quando:

1. O MVP roda de forma reproduzível no repositório dedicado.
2. UC01 e UC02 funcionam, com autorização e dados persistidos.
3. Regras de negócio e fluxos de erro possuem testes/evidências reais.
4. Diagrama de Classes, DER, sequência, estados e implantação correspondem ao sistema.
5. Os documentos de requisitos usam uma terminologia única.
6. Os PDFs obrigatórios têm fontes editáveis, estão individualizados, legíveis e sem placeholders indevidos.
7. O Relatório de Estágio reflete o projeto e a fase atuais.
8. A matriz de rastreabilidade não tem divergências críticas não explicadas.
9. As pendências acadêmicas, inclusive RPOD, estão explicitamente identificadas.
10. O MindHub original permanece intocado.

**Primeira ação:** inspecione o `k100-dev/mindHub`, registre o commit de referência, estude o `k100-dev/mindHub-mvp`, analise os modelos da faculdade disponíveis e inicie a Etapa A. Em seguida, execute as demais etapas, documentando decisões, testes e bloqueios.
