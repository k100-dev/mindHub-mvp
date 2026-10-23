# EST-13 — Glossário

Versão 0.1 · EM ELABORAÇÃO · 23/10/2026. Fonte editável autoral; rup_gloss.docx ausente.

| Termo | Definição no MVP |
| --- | --- |
| MindHub original | Produto usado como referência, remoto 0cf85e52eb8740d7fa112383bf5f4e4804507db6, preservado |
| MindHub MVP | Projeto acadêmico independente; não acessa banco ou integrações do original |
| Profissional | Único ator de acesso; registro professionals ativo; proprietário de carteira e agenda |
| Paciente | Cadastro administrativo em patients; não possui login no MVP |
| Carteira | Conjunto de pacientes cujo professional_id corresponde à sessão |
| ATIVO | Estado de paciente que permite criar/remarcar agendamentos |
| INATIVO | Cadastro preservado; novos agendamentos/remarcações bloqueados |
| Agendamento | Sessão de 60 minutos em appointments, vinculada a paciente da mesma profissional |
| AGENDADO | Agendamento preservado que bloqueia seu intervalo; pode ser remarcado ou cancelado |
| CANCELADO | Estado terminal; registro preservado e intervalo liberado |
| Remarcar | Alterar início/fim conservando ID e paciente; gravar antes/depois em events |
| Exclusão lógica | Mudança de estado, sem DELETE de pacientes ou agendamentos |
| Conflito | Sobreposição de intervalos de AGENDADO da mesma profissional; adjacência é permitida |
| Evento | Registro de ação com proprietário, entidade/ID, antes/depois JSON e data; não é prontuário |
| Sessão | Acesso autenticado de até 8h; token opaco cujo hash está em sessions |
| CSRF | Token de formulário vinculado à sessão, usado na proteção de mutações |
| SQLite | Banco efetivo em arquivo privado, acessado somente pelo servidor |
| RLS | Políticas de linhas do PostgreSQL usadas pelo original; não existem no SQLite do MVP |
| Seed | Comando explícito e idempotente de criação de dados fictícios |
| As-Is | Processo manual anterior à solução; neste projeto ainda exige validação factual do aluno |
| RF / RNF | Requisito funcional / não funcional, identificados de modo único |
| UC01 / UC02 | Gerenciar pacientes / Gerenciar agendamentos |
| RPOD | Sigla informada na missão; significado e modelo institucional não identificados |
| Evidência histórica | Teste declarado no original ou em relatório anterior; não prova execução atual |
| AGUARDANDO REVISÃO | Material produzido para conferência, ainda não aprovado para submissão |
