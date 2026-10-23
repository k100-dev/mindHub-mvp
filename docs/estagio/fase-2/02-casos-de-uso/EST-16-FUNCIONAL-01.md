# EST-16 — Caso de Uso Funcional 01

UC01 — Gerenciar pacientes · v0.1 · AGUARDANDO REVISÃO.

Artefato de demonstração funcional distinto de EST-07. Formato autoral provisório; confirmar interpretação institucional.

| Passo | Ação demonstrável | Resultado esperado |
| --- | --- | --- |
| 1 | Entrar como profissional demo | Lista protegida de pacientes |
| 2 | Cadastrar Clara Demonstração, clara@example.invalid, (43) 99999-0003 | Detalhe com ATIVO e sucesso |
| 3 | Recarregar e pesquisar Clara | Mesmo cadastro encontrado |
| 4 | Editar nome para Clara Revisada | Alteração persistida, evento ATUALIZAR |
| 5 | Inativar | INATIVO; cadastro e histórico continuam visíveis |
| 6 | Reativar | ATIVO; agenda novamente permitida |
| 7 | Tentar nome de 1 caractere pela API | 422; cadastro anterior conservado |

Dados inteiramente sintéticos. Evidências executadas e seus limites constam em 06-evidencias/RESULTADOS.md; esta tabela é roteiro esperado, não comprovação de execução.
