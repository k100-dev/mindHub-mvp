# Auditoria técnica e editorial — v0.1

23/10/2026 · código MVP 923f5b0844113a3863b1e5fa9231cd9fadad7a83 · AGUARDANDO REVISÃO técnica. Documentação institucional ainda EM ELABORAÇÃO.

## Situação por etapa

| Etapa | Resultado |
| --- | --- |
| A — diagnóstico | Concluída: original remoto atual e cópia local diferenciados; commits fixados; destino inicialmente vazio; templates ausentes registrados |
| B — baseline | Concluída: Git independente, origin mindHub-mvp, branch fase-2/mvp-academico, README, escopo e decisões |
| C — implementação | Concluída para revisão: UC01/UC02, autenticação profissional, SQLite, migração e seed sintético; sem serviços de produção |
| D — modelagem | Fontes Mermaid/SVG alinhadas ao domínio; fonte BPMN manual não executável. As-Is é hipótese explicitamente pendente de confirmação factual |
| E — documentação | Fontes autorais e 18 PDFs individuais de prévia, não finais. Templates oficiais e RPOD impedem fechamento institucional |
| F — auditoria | Verificações técnicas e revisão visual realizadas; manifesto com checksum; limites e pendências mantidos |

## Evidências técnicas verificadas

- Instalação: 122 dependências de desenvolvimento instaladas. Registro npm indisponível (ECONNRESET), recuperado a partir de tarballs oficiais já no cache local. Registro temporário loopback não faz parte do produto; lockfile usa URLs oficiais e integridades. Reinstalação limpa `npm.cmd ci --offline --cache=.tools-cache/npm --no-audit --no-fund`: código 0, 122 pacotes em 13s. Esse cache local não é necessário em uma máquina com acesso normal ao npm; não é versionado.
- `npm.cmd run lint`: passou, inclusive os geradores de documentos. `npm.cmd run typecheck`: passou. `npm.cmd run build`: passou. Logs em 06-evidencias.
- `npm.cmd test`: dez testes, dez aprovados, zero falhas. Domínio, persistência entre conexões/reinício, integridade, autorização, sessão, CSRF, erros e concorrência real em dois workers.
- Navegador instalado, via CDP: 17 verificações aprovadas, código 0. Fluxo completo UC01/02, recarga, conflito, histórico, logout; sete páginas em quatro larguras, texto ampliado 200%; sem exceções JS não tratadas. Dez capturas reais.
- `npm.cmd run db:migrate` e `npm.cmd run db:seed`: passaram. Segunda execução de seed informou que já havia sido aplicado, sem sobrescrever cadastros.
- `npm.cmd start`: executou `node dist/server.js` em http://127.0.0.1:3100. Smoke do compilado: login 303, consulta autenticada 200 com dois pacientes fictícios, logout 303 e acesso posterior 401. Evidência em compilado.json.
- Banco: T06 registra integrity_check=ok e foreign_key_check vazio. T10 comprova uma reserva e um conflito com exatamente um evento na agenda para a disputa de intervalo. Não existe teste de produção ou de carga.

## Revisão editorial e PDFs

Foram geradas 18 prévias PDF, totalizando 31 páginas, fora de 07-entrega-pdf. Todas possuem fontes editáveis e identificação de versão/estado/referência de código. Os oito diagramas cabem em uma página cada; telas ocupam dez páginas identificadas; relatório tem três páginas. Não há pacote ZIP.

Cada PDF foi aberto pelo renderizador Windows.Data.Pdf e todas as páginas foram rasterizadas em 06-evidencias/pdf-render. Revisão visual de títulos, legendas, tabelas, estados, margens, rodapés e imagens realizada em pranchas de contato, com inspeção individual das páginas de diagrama e telas quando necessário. Fontes Markdown foram lidas para revisão de conteúdo. Não se alegou revisão do PDF apenas pela inspeção do HTML.

Correções realizadas: diagramas originalmente ocupavam três páginas, corrigidos para uma; legenda da autochamada SQLite estava cortada, reposicionada; relação profissional/agenda sobrepunha o título do DER, reroteada; cabeçalhos foram separados do SVG para exportação previsível; UC02 deixou de ter página residual só de rastreabilidade; workflow visual foi alinhado à fonte BPMN. O relatório foi atualizado para dez testes aprovados. Exportações posteriores foram rasterizadas novamente e os checksums atualizados.

Não há sumário paginado exigido em template disponível; o relatório curto usa seções numeradas e o índice de artefatos fica separado. Aderência à estrutura acadêmica definitiva permanece pendente dos modelos. A revisão técnica/editorial não substitui aprovação do aluno ou da banca.

## Preservação e isolamento

Original local permanece em b9487eff01100d9048644c17b31fcb73baf80586. Comparação final do Git pai mostrou apenas a alteração preexistente mindhub/package-lock.json e a nova pasta independente mindhub - mvp como não rastreada pelo pai. Nenhuma alteração adicional em arquivo original. Clone remoto de referência em 0cf85e52eb8740d7fa112383bf5f4e4804507db6 permaneceu sem alterações rastreadas.

Nenhum `.env`, chave, dado pessoal ou banco foi copiado do original. Nenhuma migração, build, instalação ou teste foi executado no original. Nenhum acesso à aplicação/banco de produção e nenhum envio de mensagem, convite ou pagamento foi realizado. Exceções Git de safe.directory foram limitadas aos comandos necessários, sem configuração global.

## Impedimentos e próximo fechamento

1. Fornecer os DOCX institucionais listados em 99-referencias/PENDENCIAS-INSTITUCIONAIS.md. As minutas EST-01/02/03/13/19 não alegam seguir arquivos ausentes.
2. Definir RPOD com orientação institucional. EST-15 não foi inventado.
3. Confirmar o processo manual As-Is com o aluno/envolvidos e revisar EST-18; não transformar hipótese em observação fictícia.
4. Confirmar o formato institucional dos casos funcionais EST-16/17, mantidos separados de EST-07/08.
5. Revisar e aprovar as versões finais antes de promover PDFs para 07-entrega-pdf. Não existe comprovante de envio/aceite.

Status de publicação do Git dedicado é registrado em PUBLICACAO.md, separadamente dos testes e da submissão acadêmica.
