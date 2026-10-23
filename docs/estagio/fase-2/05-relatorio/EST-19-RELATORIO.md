# EST-19 — Relatório de estágio: MindHub MVP

Versão 0.1 · EM ELABORAÇÃO · atividades desta sessão de 23/10/2026.

Fonte autoral baseada no código e nas verificações desta execução. Os relatórios acadêmicos de exemplo e demais modelos DOCX não foram disponibilizados. Esta minuta não declara adoção do template institucional. Não informa horas, orientador, assinaturas ou datas de entrega não comprovadas.

## 1. Contexto, problema e justificativa

O MindHub original organiza agenda e administração de pacientes. Sua versão atual possui autenticação por perfil, cadastro, disponibilidade, agendamentos e pagamentos manuais. A missão da Fase 2 solicita sistema simples, com CRUD e funcionalidades complementares, acompanhado de requisitos e modelagem coerentes. Reproduzir todo o produto ampliaria o trabalho além do recorte da primeira banca.

## 2. Objetivos

Objetivo geral: implementar e demonstrar MVP acadêmico independente para gestão administrativa de pacientes e agendamentos. Objetivos específicos: preservar o original; selecionar UC01/UC02; manter persistência; validar autorização e conflitos; documentar regras e evidências; produzir fontes editáveis e prévias individuais para revisão.

## 3. Diagnóstico e escopo

O original local estava em b9487eff01100d9048644c17b31fcb73baf80586, diferente do remoto 0cf85e52eb8740d7fa112383bf5f4e4804507db6. O remoto foi estudado em clone isolado. Seu README, escopo vigente e validação de banca foram confrontados com rotas, autorização e migrações. As evidências históricas não foram reclassificadas como testes atuais. O destino mindHub-mvp estava sem branches na API consultada.

UC01 inclui cadastrar, pesquisar, consultar, editar, inativar e reativar pacientes. UC02 inclui criar, consultar, remarcar e cancelar sessões de 60 minutos. A profissional é o único ator autenticado. O paciente é entidade administrativa. Não há prontuário, integração de pagamento, WhatsApp, teleconsulta ou SaaS.

## 4. Modelagem

As fontes de caso de uso, classes, DER, sequência, estados e implantação estão em 03-diagramas. Profissional possui pacientes e agendamentos. FK composta garante que o agendamento aponte para paciente da mesma carteira. events registra alterações; sessions implementa autenticação. ATIVO e INATIVO são estados do paciente; AGENDADO e CANCELADO são estados do agendamento. Matriz central relaciona requisitos, diagramas, telas, serviços, tabelas e testes.

## 5. Processo As-Is

Nenhuma entrevista ou observação de processo manual foi realizada nesta sessão. O artefato EST-18 representa hipótese explicitamente identificada de cadastro/agenda manuais, a validar com o aluno; não descreve como fato a operação atual da profissional nem o fluxo do software. Seu fechamento é pendência institucional/factual.

## 6. Implementação e telas

Aplicação TypeScript com servidor HTTP Node, HTML renderizado e CSS responsivo. A identidade visual adapta tokens teal do original. Serviço MindHub valida entradas e aplica transações. SQLite privado em arquivo mantém pacientes, agendamentos, profissionais, sessões e eventos. Os formulários e API usam as mesmas operações de domínio.

Nome, e-mail e telefone são obrigatórios; nascimento opcional. Agendamentos exigem início futuro e paciente ativo. Entrada e exibição no horário de São Paulo, armazenamento UTC. Triggers rejeitam sobreposição e exclusão física; cancelamento terminal libera horário. Remarcação conserva registro e grava antes/depois. Capturas reais da versão testada estão em 04-telas.

## 7. Tecnologias, recursos e ambiente

Windows, PowerShell, Node 22.23.4, npm 10.9.9, TypeScript e SQLite 3.53.4 (node:sqlite experimental no Node 22). Navegador Edge/Chromium instalado, automatizado por CDP. Sem dependências externas de execução e sem credenciais do original. Ferramentas de lint e compilação são dependências de desenvolvimento. O funcionamento local reduz dependência de rede para apresentação.

## 8. Atividades efetivamente realizadas

Em 23/10/2026: busca e leitura da missão; diagnóstico local/remoto; fixação de baseline; registro de decisões; criação do Git independente; implementação dos UCs, autenticação e banco; execução de testes de domínio/HTTP e navegação; captura das interfaces; elaboração de fontes de requisitos, UCs e modelagem. A duração em horas não foi medida. Resultados finais de instalação, lint, tipagem, build e revisão de prévias devem ser consultados no registro de evidências, atualizado ao encerrar a execução.

## 9. Testes, resultados e limitações

Os dez testes de domínio e HTTP passaram nesta sessão, incluindo concorrência real com dois workers. O navegador percorreu o fluxo completo, inclusive conflito e histórico, e verificou sete páginas em quatro larguras, com recarga e texto ampliado. Lint, tipagem, build e reinstalação limpa com lockfile passaram. A instalação inicial sofreu ECONNRESET no registro npm e foi recuperada com pacotes oficiais já presentes no cache local, conforme RESULTADOS.md. Testes do banco original e produção NÃO EXECUTADOS por preservação e independência.

Não há homologação clínica, auditoria de segurança completa, teste de carga, envio de e-mail, recuperação de senha ou implantação pública. Conta demo é exclusivamente sintética. Templates ausentes, RPOD e validação do As-Is impedem considerar a documentação uma entrega institucional final.

## 10. Conclusões e evolução

O recorte permite demonstrar operações administrativas persistentes com autorização e controle de agenda. A independência do banco e do Git protege o original. A conclusão acadêmica depende de revisão pelo aluno, incorporação dos modelos reais, esclarecimento do RPOD e aprovação dos documentos para submissão. Gestão de contas, backup/restore, implantação HTTPS e domínio mais amplo podem constituir etapas futuras.

## Referências

- Missão CODEX-INSTRUCOES-MINDHUB-MVP-FASE2.md fornecida no workspace.
- https://github.com/k100-dev/mindHub/tree/0cf85e52eb8740d7fa112383bf5f4e4804507db6 — README, escopo vigente, documentação e código estudados.
- Código e migração deste repositório; matriz e resultados da presente execução.
- https://nodejs.org/api/sqlite.html — referência oficial do módulo SQLite; a consulta web nesta sessão encontrou indisponibilidade na URL versionada, sem substituir a verificação executável local.
