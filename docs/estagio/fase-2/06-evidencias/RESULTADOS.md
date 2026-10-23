# Resultados técnicos desta execução

23/10/2026 · AGUARDANDO REVISÃO · código MVP 923f5b0. Não utilizar validações históricas do original como resultados desta sessão.

## História verificada

Profissional autentica e usa formulários de pacientes/agendamentos → rotas HTML no servidor Node → serviço MindHub e banco SQLite privado → redirecionamento/detalhe com dados persistidos. API JSON compartilha os mesmos serviços e foi exercitada em testes HTTP.

| Fronteira / comando | Resultado observado |
| --- | --- |
| Node e banco | Node 22.23.4, SQLite 3.53.4; node:sqlite emite aviso experimental |
| Instalação inicial | npm.ps1 bloqueado pela política do PowerShell; usado npm.cmd. Registro npm retornou ECONNRESET, inclusive após escalonamento |
| Recuperação de instalação | Pacotes oficiais já presentes no cache npm foram servidos por registro temporário loopback; 122 pacotes de desenvolvimento instalados; URLs do lockfile normalizadas para registry.npmjs.org e hashes preservados |
| Lint | npm run lint passou; primeira execução tinha glob *.ts sem arquivo raiz, corrigido |
| Tipagem | npm run typecheck passou com strict e verificação de variáveis/parâmetros não usados |
| Build | npm run build passou: TypeScript para dist e cópia de CSS |
| Testes de domínio/HTTP | 10 testes passaram, 0 falharam; TAP registrado em testes.tap |
| Navegador | 17 verificações passaram via Edge/Chromium CDP; log em navegador.json; dez capturas reais |
| Responsividade | Sete páginas em 320,375,768,1366px sem overflow; texto ampliado 200% na lista; sem exceções JS não tratadas |
| Persistência | T06 fecha e reabre arquivo; E03/E07 recarregam paciente/agendamento no navegador |
| Autorização | T03 rejeita leitura e mutações cruzadas; T08/T09 verificam sessão, CSRF, origem, logout, expiração e inatividade |
| Concorrência | T10 inicia dois workers sobre mesmo arquivo; exatamente um cadastro de sessão e um conflito; um evento de agenda |
| Integridade | T06: PRAGMA integrity_check=ok e foreign_key_check vazio; FK composta e preservação por trigger verificadas |

## Correções e limites da verificação

- A primeira execução do navegador concluiu os fluxos, mas demorou a encerrar; cleanup passou a fechar o navegador via CDP e as conexões do servidor. Nova execução terminou com código 0.
- Mutações API sem sessão foram ajustadas para responder 401 antes da validação CSRF; teste HTTP acrescentado e aprovado.
- T07 usa duas conexões em sequência; a concorrência real é exclusivamente T10, com workers. Não confundir essas evidências.
- Autorização ocorre no servidor; não há RLS SQLite. Nenhuma alegação de homologação clínica, conformidade legal, segurança completa, WCAG ou desempenho sob carga.
- O build não precisa de Supabase, rede, fontes externas ou dados do original. Ambiente de teste é temporário e sintético.

## Não executado

- Testes, build, migração ou escrita no original/produção: NÃO EXECUTADO por preservação explícita.
- Implantação pública, HTTPS operacional, backup/restauração e teste de carga: NÃO EXECUTADO, fora do recorte local.
- Aderência aos DOCX institucionais: NÃO EXECUTADO; modelos não disponibilizados.
- Validação factual do As-Is e definição RPOD: NÃO EXECUTADO; dependem do aluno/instituição.
- Envio à faculdade e aceite: NÃO EXECUTADO; sem autorização/comprovante.

Resultados adicionais de instalação limpa, seed e prévias PDF são registrados em AUDITORIA-FINAL.md ao terminar as verificações correspondentes.
