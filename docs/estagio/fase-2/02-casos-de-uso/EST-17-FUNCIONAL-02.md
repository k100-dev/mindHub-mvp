# EST-17 — Caso de Uso Funcional 02

UC02 — Gerenciar agendamentos · v0.1 · AGUARDANDO REVISÃO.

Artefato de demonstração distinto de EST-08; formato institucional ainda precisa de confirmação.

| Passo | Ação demonstrável | Resultado esperado |
| --- | --- | --- |
| 1 | Selecionar paciente ativo da demo e início futuro | Sessão AGENDADO de 60 minutos |
| 2 | Recarregar lista e abrir detalhe | Mesmo registro persistido |
| 3 | Tentar novo agendamento 30 minutos após o início | 409 por conflito |
| 4 | Criar sessão imediatamente após o fim | Adjacência aceita |
| 5 | Remarcar primeira sessão para intervalo livre | Mesmo ID, novo horário, evento antes/depois |
| 6 | Cancelar primeira sessão | CANCELADO terminal, histórico e cadastro preservados |
| 7 | Tentar remarcar cancelado pela API | 409 sem alteração |

Evidências reais e limites em 06-evidencias/RESULTADOS.md; roteiro não equivale a teste executado.
