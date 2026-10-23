# Matriz única de rastreabilidade — v0.1

AGUARDANDO REVISÃO · 23/10/2026 · código de referência MVP: 923f5b0. Fontes em src/; schema em migrations/001_initial.sql. Evidências executadas em 06-evidencias/RESULTADOS.md e navegador.json. Txx são testes de domínio/HTTP; Exx são verificações reais no navegador.

| Necessidade | RF/RNF | UC | Diagrama EST | Tela | API / serviço MindHub | Entidade / tabela | Teste | Evidência |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N01 manter cadastro | RF-001 | UC01 | 04,05,06,10 | TELA-02/03 | POST /api/patients; savePatient | Patient / patients, events | T01,T02,T08,E03 | TAP; captura cadastro e detalhe |
| N01 localizar cadastro | RF-002 | UC01 | 04,05,06,10 | TELA-04 | GET /api/patients?q; GET /api/patients/:id; patients, patient, history | Patient / patients, events | T01,T03,E04 | TAP; pesquisa real |
| N01 atualizar cadastro | RF-003 | UC01 | 05,06,10 | TELA-03 | PATCH /api/patients/:id; savePatient | Patient / patients, events | T01,T03,E05 | TAP; E05 no navegador.json |
| N01 preservar histórico | RF-004 | UC01 | 05,06,10 | TELA-05 | POST /api/patients/:id/status; setPatientStatus | Patient / patients, events | T01,T05,E06 | TAP; captura INATIVO |
| N02 criar horário | RF-005 | UC02 | 04,05,06,11,12 | TELA-06/07 | POST /api/appointments; saveAppointment | Appointment / appointments, patients, events | T03,T04,T05,T10,E07,E08 | TAP; capturas horário e conflito |
| N02 consultar agenda | RF-006 | UC02 | 05,06,11 | TELA-07/09 | GET /api/appointments; GET /api/appointments/:id; appointments, appointment, history | Appointment / appointments, events | T04,T06,E07 | TAP; recarga e histórico |
| N02 remarcar | RF-007 | UC02 | 05,06,11,12 | TELA-07 | PATCH /api/appointments/:id; saveAppointment | Appointment / appointments, events | T04,T05,E09 | TAP; E09 e evento antes/depois |
| N02 cancelar | RF-008 | UC02 | 05,06,11,12 | TELA-09 | POST /api/appointments/:id/cancel; cancelAppointment | Appointment / appointments, events | T04,T05,E10 | TAP; captura CANCELADO |
| N03 acesso restrito | RF-009 | Apoio UC01/02 | 04,06,09 | TELA-01 | POST /entrar, /sair; session no servidor | professionals, sessions | T08,T09,E01,E02,E13 | TAP; navegação real |
| N03 persistir | RNF-001 | UC01/02 | 06,09,10,11 | TELA-03/07 | openDatabase, transações | patients, appointments, events | T06,E03,E07 | Fechamento/reabertura e recarga |
| N03 isolar carteira | RNF-002 | UC01/02 | 05,06,09 | Todas protegidas | owner obtido exclusivamente da sessão; filtro servidor | FK composta; professional_id | T03,T08,T09 | Testes de isolamento, sessão inativa/expirada |
| N01/N02 validar | RNF-003 | UC01/02 | 10,11,12 | Formulários e TELA-08 | validatePatient, validateStart | CHECK/FK/trigger; serviços | T02,T04,T05,T08 | TAP e 409 visível |
| N03 sessão segura | RNF-004 | Apoio | 06,09 | TELA-01 | scrypt, tokens, CSRF, origem, rate limit | professionals, sessions | T08,T09 | Cookie/expiração/logout e rejeição de origem/CSRF |
| N03 usabilidade | RNF-005 | UC01/02 | 04 | TELA-01 a 10 | HTML/CSS SSR, labels e foco | Não se aplica | E11,E12,E14 | Quatro larguras, sete páginas; 200%; sem exceções JS |
| N03 reproduzir | RNF-006 | Apoio | 09 | Login e demo | npm ci, build, seed idempotente | schema_migrations, dados sintéticos | T06; comandos documentados | Logs de instalação, compilação e execução |
| N02 integridade | RNF-007 | UC02 | 06,11,12 | TELA-08/09 | BEGIN IMMEDIATE e rollback | triggers de conflito, events | T04,T07,T10 | Concorrência com dois workers: 1 sucesso e 1 conflito |

As rotas HTML /pacientes e /agendamentos são as usadas pelo navegador; chamam os mesmos serviços da API listada. Detalhes completos das rotas em src/server.ts. TELA-07 é o detalhe e acesso à edição; E09 comprova remarcação sem inventar captura específica da edição.

Limites: acessibilidade formal, carga, produção e backup operacional NÃO EXECUTADOS. EST-18 é hipótese As-Is aguardando validação, não requisito implementado. EST-15 depende de orientação. A ausência de templates impede afirmar conformidade institucional das minutas EST-01/02/03/13/19.
