# EST-02 — Especificação suplementar

Versão 0.1 · EM ELABORAÇÃO · 23/10/2026. Minuta autoral; rup_sspec.docx ausente. Não declara aderência ao modelo institucional.

## Aplicabilidade

Sistema acadêmico local para profissional autenticada; dados sintéticos. Requisitos funcionais em ESCOPO.md e UCs EST-07/08. RNFs não constituem garantia de ausência de vulnerabilidades.

| ID | Requisito não funcional e critério | Evidência planejada/registrada |
| --- | --- | --- |
| RNF-001 | Persistência entre requisições e reinício do banco | T06 e recargas E03/E07 |
| RNF-002 | Isolamento de carteira no servidor e FK composta | T03 e T08 |
| RNF-003 | Validação no servidor; sem alterações parciais em erro | T02/T04/T05/T08 |
| RNF-004 | Senhas derivadas com scrypt, sessões opacas hasheadas, CSRF, expiração, logout e limite de tentativas | src/security.ts, src/server.ts, T08/T09 |
| RNF-005 | Uso em 320,375,768,1366px sem overflow das páginas testadas; labels HTML, foco e teclado | E11; estilos e formulários nativos; não equivale a auditoria WCAG |
| RNF-006 | Migrações, seed, lockfile e comandos documentados | README e resultados de instalação/build |
| RNF-007 | Rejeitar sobreposição na transação e no banco; preservar evento e registro original em falha | T04/T07 e E08 |

## Restrições de ambiente

Node >=22.23.4; node:sqlite experimental nesta versão; um processo HTTP e arquivo SQLite local. Não há suporte homologado a múltiplas réplicas, carga elevada ou armazenamento efêmero. UTC em disco; entrada e exibição no horário de São Paulo UTC−03. Banco e credenciais de teste não pertencem ao original.

## Restrições de segurança e operação

Servidor loopback por padrão. Senha demo pública somente para dados sintéticos. HTTPS, cookie Secure, APP_ORIGIN e volume persistente são pré-condições para futura implantação pública; não executada. Rate limiting reinicia com o processo. Não existe recuperação de senha ou administração de profissionais pela interface. Eventos não são trilha inviolável contra administrador do arquivo SQLite. Backup e restauração operacionais ainda não homologados.

Não há requisito quantitativo de desempenho: não foi fornecido volume ou SLA que justifique métrica arbitrária. Resultados efetivamente executados constam exclusivamente em 06-evidencias/RESULTADOS.md.
