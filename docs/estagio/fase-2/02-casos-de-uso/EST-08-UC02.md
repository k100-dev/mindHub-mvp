# EST-08 — Especificação UC02: Gerenciar agendamentos

Versão 0.1 · AGUARDANDO REVISÃO · 23/10/2026. Fonte autoral; modelo institucional de UC não fornecido.

Ator primário: profissional autenticada e ativa. Pré-condições: sessão válida, paciente ativo vinculado à carteira, banco disponível. Gatilho: escolher Cadastrar agendamento.

## Fluxo principal — criar

1. Profissional abre /agendamentos/novo.
2. Sistema lista somente pacientes ativos da própria carteira.
3. Profissional seleciona paciente e início futuro no horário de São Paulo.
4. Servidor valida autenticação, CSRF e data; serviço calcula fim após 60 minutos.
5. Dentro de transação BEGIN IMMEDIATE, serviço confirma paciente ativo da carteira; banco valida FK composta e trigger de conflito.
6. Serviço insere appointments com AGENDADO e events com AGENDAR; confirma transação.
7. Sistema exibe detalhe e mensagem de sucesso; recarregar conserva dados.

## Alternativas

- A1 Listar/consultar: abrir lista cronológica e detalhe com paciente, início/fim, estado e histórico. Inclui cancelados.
- A2 Remarcar: no detalhe de AGENDADO, abrir Alterar data e horário; enviar início futuro. Sistema conserva ID/paciente, valida atividade e conflito, atualiza início/fim e grava evento REMARCAR com antes/depois atomicamente.
- A3 Cancelar: acionar Cancelar agendamento no detalhe. AGENDADO → CANCELADO e evento CANCELAR na mesma transação. Intervalo liberado; registro preservado. Pode cancelar para paciente inativo. Sem reabertura do cancelado.

## Exceções

- E1 Sem pacientes ativos: formulário orienta cadastrar/reativar.
- E2 Data impossível, formato inválido ou início passado: 422; nada persistido.
- E3 Sobreposição: 409; na remarcação mantém início/fim e histórico originais. Adjacência não é conflito.
- E4 Paciente inativo: 409 na criação/remarcação; agenda preexistente permanece consultável/cancelável.
- E5 Paciente/agendamento de outra profissional ou inexistente: 404; sem vazamento de dados.
- E6 Remarcar/cancelar registro já CANCELADO: 409.
- E7 Sem sessão: página redireciona ao login, API 401; CSRF/origem inválida 403.

Pós-condição de sucesso: operação e evento persistidos. Falha: rollback. Sem regra de pagamento ou antecedência de 24h neste recorte profissional.

Rastreabilidade: RF-005 a RF-009, RNF-001 a RNF-007; MindHub.saveAppointment/appointments/appointment/cancelAppointment; migrations/001_initial.sql; T03 a T08 e e2e.
