# EST-07 — Especificação UC01: Gerenciar pacientes

Versão 0.1 · AGUARDANDO REVISÃO · 23/10/2026. Fonte autoral; modelo institucional de UC não fornecido.

Ator primário: profissional autenticada e ativa. Objetivo: manter cadastro administrativo da própria carteira. Pré-condição: aplicação e banco disponíveis, sessão válida. Gatilho: abrir Pacientes.

## Fluxo principal — cadastrar

1. Profissional abre /pacientes e escolhe Cadastrar paciente.
2. Sistema apresenta nome, e-mail, telefone e nascimento opcional.
3. Profissional preenche e confirma Salvar paciente.
4. Servidor valida sessão, CSRF e campos, normaliza e-mail/telefone, inicia transação.
5. Serviço persiste patients e evento CADASTRAR em events, confirma a transação.
6. Sistema redireciona ao detalhe e apresenta sucesso. Recarregar conserva os dados.

## Alternativas

- A1 Consultar: lista/pesquisa por nome, e-mail ou telefone; abrir detalhe exibe dados, estado, agenda vinculada e eventos. Busca sem resultados informa estado vazio.
- A2 Editar: abrir detalhe → Editar paciente → preencher formulário completo → Salvar; atualizar dados e evento ATUALIZAR atomicamente. Proprietário, ID e estado não são alterados pela edição.
- A3 Inativar: no detalhe, Inativar paciente altera ATIVO para INATIVO e grava evento INATIVAR. Mantém dados e agendamentos. Impede novo agendamento/remarcação.
- A4 Reativar: Reativar paciente altera INATIVO para ATIVO e grava evento REATIVAR. Ações de agenda voltam a ser permitidas.

## Exceções

- E1 Campos inválidos: 422, mensagem específica e formulário de cadastro/edição conserva valores (senha nunca é reapresentada).
- E2 E-mail repetido na carteira: 409 e nenhuma alteração/evento parcial.
- E3 Recurso de outra profissional ou inexistente: 404; dados não revelados.
- E4 Sem sessão: redirecionamento ao login em páginas; API responde 401. CSRF inválido: 403.
- E5 Repetição de status atual: 409. Banco indisponível: erro genérico sem segredo, sem sucesso fictício.

Pós-condição de sucesso: cadastro/alteração e evento persistidos. Pós-condição de falha: transação revertida. Exclusão física não disponível.

Rastreabilidade: RF-001 a RF-004, RNF-001 a RNF-007; src/domain.ts (savePatient, patients, patient, setPatientStatus), src/server.ts, src/views.ts; tests/domain.test.ts T01/T02/T03/T05/T06 e e2e.
