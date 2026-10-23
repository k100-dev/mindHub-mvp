# Escopo congelado para banca — v0.1

Estado: AGUARDANDO REVISÃO. Data: 23/10/2026. Decisão técnica do MVP, sujeita à revisão do aluno; não é aprovação institucional.

## Necessidades e requisitos funcionais

N01: organizar cadastros administrativos sem perder histórico. N02: organizar a agenda sem sobreposição. N03: restringir o acesso e reproduzir a demonstração.

| ID | Requisito | Critério de aceitação |
| --- | --- | --- |
| RF-001 | Cadastrar paciente | Nome 3–120, e-mail válido até 254, telefone normalizado; nascimento opcional válido e não futuro; e-mail único na carteira |
| RF-002 | Consultar/listar pacientes | Nome, e-mail e telefone pesquisáveis; busca insensível a acentos e caixa; detalhe com agenda e eventos |
| RF-003 | Atualizar paciente | Altera dados administrativos; mantém ID, proprietário e status; registra evento |
| RF-004 | Inativar/reativar paciente | ATIVO ↔ INATIVO; não exclui nem cancela agendamentos existentes |
| RF-005 | Criar agendamento | Paciente ativo da própria carteira, início futuro, 60 minutos; estado inicial AGENDADO |
| RF-006 | Consultar agendamentos | Lista cronológica, detalhe e histórico; inclui CANCELADO |
| RF-007 | Alterar agendamento | Muda apenas início/fim, conserva ID/paciente e registra valor anterior; conflito não altera original |
| RF-008 | Cancelar agendamento | AGENDADO → CANCELADO, terminal; preserva registro e libera intervalo |
| RF-009 | Autenticar profissional | Login com senha, sessão ativa expira em 8h; logout revoga; nenhuma operação pública de dados |

## RNFs testáveis

| ID | Requisito | Verificação prevista |
| --- | --- | --- |
| RNF-001 | Persistir em SQLite privado | Fechar/reabrir banco e recarregar página sem perder alterações; integridade e FKs |
| RNF-002 | Autorizar no servidor por professional_id | Profissional B não lê/altera paciente ou agendamento de A; FK composta rejeita associação cruzada |
| RNF-003 | Validar toda mutação no servidor | API rejeita nome/e-mail/telefone/data inválidos, início passado, conflito e transição terminal |
| RNF-004 | Proteger sessão/formulários | Cookie HttpOnly/SameSite, token opaco hasheado, expiração, logout, CSRF e origem; tentativas de login limitadas |
| RNF-005 | Responsividade e acesso por teclado | Navegação e formulários em 320,375,768,1366px sem overflow; labels e foco visíveis; HTML nativo |
| RNF-006 | Instalação reproduzível | Lockfile, Node mínimo, migração versionada idempotente, seed explícito, comandos de validação |
| RNF-007 | Integridade da agenda e eventos | Trigger de sobreposição, transação BEGIN IMMEDIATE, rollback preserva original e eventos; adjacência permitida |

## Regras do domínio

Datas de atendimento são digitadas no horário de São Paulo (UTC−03) e persistidas como ISO UTC. Intervalos são [início,fim): 09h–10h e 10h–11h não conflitam. Duração fixa de 60 minutos. Não há grade de disponibilidade ou restrição por dia da semana. A profissional pode cancelar registros existentes, inclusive de paciente inativo. Somente agendamentos AGENDADO podem ser remarcados; paciente deve estar ATIVO. Não há transição automática para realizado ou expirado; horários passados permanecem AGENDADO até cancelamento, uma limitação explícita do recorte. Nome/e-mail/telefone são obrigatórios; nascimento é opcional. A edição usa formulário completo (PATCH da API recebe campos administrativos completos).

## Fora do escopo e limites

Não reproduzir regras financeiras e de autoatendimento da versão original. Pagamentos, prontuário clínico, conta de paciente, convite por e-mail, WhatsApp, teleconsulta, SaaS, foto/hobbies e confirmação por banca estão fora. Exclusão física não é oferecida e é bloqueada por triggers para pacientes/agendamentos. Retenção legal, uso com pessoas reais, backup operacional e implantação pública não foram homologados.
