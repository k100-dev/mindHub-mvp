# Etapa A — Diagnóstico

Data: 23/10/2026. Estado: AGUARDANDO REVISÃO.

## Baselines verificados nesta sessão

- Original remoto: `k100-dev/mindHub`, main `0cf85e52eb8740d7fa112383bf5f4e4804507db6` (release v1.0). Obtido pelo conector GitHub e clone isolado em `.referencia-original`, checkout destacado. Nenhum acesso à produção ou ao banco original.
- Original local: diretório irmão `../mindhub`, Git no pai, commit `b9487eff01100d9048644c17b31fcb73baf80586`. Alteração preexistente em `mindhub/package-lock.json`. Não representa a versão remota atual.
- Destino remoto: `k100-dev/mindHub-mvp`, público, criado em 23/10/2026. API de branches retornou `[]`: sem branch/commit na inspeção. Pasta de trabalho inicialmente continha apenas as instruções e o registro preliminar. Será inicializado Git independente, evitando commits no Git pai.
- Nenhum template acadêmico DOCX foi encontrado no workspace ou na busca acessível em Documents. Documento de missão lido integralmente. Ausência de template impede documentos finais que aleguem aderência institucional. RPOD permanece sem definição.

## Fatos observados no original atual

Fontes: caminhos abaixo relativos ao checkout `0cf85e5`.

| Área | Evidência no código | Implicação para MVP |
| --- | --- | --- |
| Stack | package.json: Next 16.3.2, React 19.2.8, TypeScript, Tailwind, Zod, Supabase, pnpm 11; Node >=24 | Ambiente disponível é Node 22.23.4; não copiar configuração inteira |
| Autorização | src/lib/authz.ts: sessão, perfil ativo, role PSYCHOLOGIST, profissional verificado e allowlist no servidor | Manter acesso profissional ativo e escopo por proprietário |
| Pacientes | src/app/api/patients/route.ts e [id]/route.ts: vínculo psychologist_patients, validação, convite por e-mail e consultas administrativas | Reutilizar conceito e limites de nome; omitir conta/convite do paciente |
| Inativação | [id]/deactivate/route.ts altera status do vínculo, sem excluir | Adotar ATIVO/INATIVO preservando dados |
| Agenda | appointments/holds e [id]/manage usam RPC; domain/appointments.ts diferencia intervalos adjacentes e sobrepostos | Manter atomicidade e regra de sobreposição; simplificar estados |
| Banco | Migração inicial: profiles, patient_profiles, psychologist_patients, appointments, eventos, pagamentos; constraint GiST de exclusão; RLS | Modelar entidades menores em banco local privado, sem copiar schema de produção |
| Evolução SQL | 20260906224742_manual_booking_workflow.sql substitui expiração por pendência persistente, com cancelamento/remarcação e pagamentos manuais; 20260906225836 restringe privilégios | Não interpretar migração inicial isoladamente como regra atual |
| UI | src/app/globals.css: teal #117f72, canvas #f4f7f8, cards, foco, controles com altura mínima, adaptação móvel | Reutilizar tokens e padrões CSS, sem fotografias ou dados reais |
| Testes existentes | e2e/smoke.spec.ts; domain/appointments.test.ts; supabase/tests/rls.sql e manual-booking.sql | Referências de desenho; não executados contra original |

## Documentos versus evidência

README.md e docs/ESCOPO-VIGENTE.md descrevem produto de uma profissional, sem prontuário, pagamento manual, limite de 24h para paciente. docs/VALIDACAO-BANCA.md e CHANGELOG.md afirmam validações anteriores, incluindo banco e navegação. São relatos históricos, não testes executados nesta sessão. Não se atribui ao MVP a aprovação desses testes.

O diagnóstico preliminar anterior descreveu apenas a cópia local antiga (Next 15, agendamentos sem paciente normalizado). Esse achado continua válido para aquela cópia e não caracteriza o original remoto atual.

## Decisões e riscos

1. Recorte: UC01 paciente administrativo; UC02 agenda profissional; autenticação profissional. Sem acesso do paciente, pagamentos, convite, notas clínicas, perfil pessoal, disponibilidade pública, WhatsApp ou SaaS.
2. Implementação independente em TypeScript/Node HTTP e SQLite em arquivo privado. Reutilização conceitual de validação, exclusão lógica, intervalos [início,fim), autorização no servidor e tokens CSS. Não copiar código dependente de Supabase/Next que ampliaria o escopo. O objetivo é demo local reproduzível, sem credenciais ou infraestrutura original.
3. SQLite disponível no Node instalado foi verificado por consulta `select sqlite_version()`: 3.53.4. Módulo emite aviso experimental no Node 22; registrar limite e exigir Node >=22.23.4. A aplicação não será implantada em filesystem efêmero/serverless.
4. Banco sem Data API: somente servidor acessa o arquivo; autorização por professional_id nas consultas. SQLite não tem RLS; não alegar equivalência a RLS PostgreSQL. Testar isolamento e chaves compostas.
5. Agendamento terá duração fixa de 60 minutos, início futuro, status AGENDADO/CANCELADO, sem limite de 24h por ser operado pela profissional. Cancelamento terminal; remarcação preserva ID e grava evento. Paciente inativo não recebe novos agendamentos nem remarcações; agendamentos anteriores são conservados e podem ser cancelados.
6. Templates, fatos institucionais, comprovação do processo As-Is e significado de RPOD são bloqueios editoriais. Podem existir fontes preliminares sem inventar entrevistas, horas ou aprovações. Pasta de PDFs finais ficará vazia até revisão/validação aplicável.

## Verificações desta etapa

Leitura de fontes e documentos; consulta Git local e GitHub remoto; consulta SQLite em memória. Instalação, testes do MVP, build e navegação ainda NÃO EXECUTADOS nesta etapa. Original não recebeu instalação, build, migração ou alteração.
