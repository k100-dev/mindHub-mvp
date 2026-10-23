# MindHub MVP — Fase 2, primeira banca

Versão 0.1 · AGUARDANDO REVISÃO técnica; documentação institucional EM ELABORAÇÃO · 23/10/2026.

## Controle

- [Diagnóstico do original e destino](00-controle/DIAGNOSTICO.md)
- [Decisões técnicas](00-controle/DECISOES.md)
- [Matriz única de rastreabilidade](00-controle/MATRIZ-RASTREABILIDADE.md)
- [Roteiro da demonstração local](00-controle/ROTEIRO-DEMO.md)
- [Auditoria final e limitações](00-controle/AUDITORIA-FINAL.md)
- [Histórico de revisões](00-controle/HISTORICO.md)
- [Manifesto e checksums](00-controle/MANIFESTO-ENTREGA.md)

## Fontes editáveis dos artefatos

| ID | Artefato | Fonte |
| --- | --- | --- |
| EST-01 | Solicitação dos envolvidos | 01-requisitos/EST-01-SOLICITACAO.md |
| EST-02 | Especificação suplementar | 01-requisitos/EST-02-SUPLEMENTAR.md |
| EST-03 | Visão informal | 01-requisitos/EST-03-VISAO.md |
| EST-04 | Caso de uso | 03-diagramas/EST-04-CASOS-USO.mmd e .svg |
| EST-05 | Classes | 03-diagramas/EST-05-CLASSES.mmd e .svg |
| EST-06 | DER | 03-diagramas/EST-06-DER.mmd e .svg |
| EST-07 | Especificação UC01 | 02-casos-de-uso/EST-07-UC01.md |
| EST-08 | Especificação UC02 | 02-casos-de-uso/EST-08-UC02.md |
| EST-09 | Implantação | 03-diagramas/EST-09-IMPLANTACAO.mmd e .svg |
| EST-10 | Sequência UC01 | 03-diagramas/EST-10-SEQUENCIA-UC01.mmd e .svg |
| EST-11 | Sequência UC02 | 03-diagramas/EST-11-SEQUENCIA-UC02.mmd e .svg |
| EST-12 | Estados | 03-diagramas/EST-12-ESTADOS.mmd e .svg |
| EST-13 | Glossário | 01-requisitos/EST-13-GLOSSARIO.md |
| EST-14 | Telas reais | 04-telas/EST-14-TELAS.md e PNGs identificados |
| EST-15 | RPOD | Sem definição/template; impedimento registrado |
| EST-16 | Caso de uso funcional 01 | 02-casos-de-uso/EST-16-FUNCIONAL-01.md |
| EST-17 | Caso de uso funcional 02 | 02-casos-de-uso/EST-17-FUNCIONAL-02.md |
| EST-18 | Workflow As-Is | 03-diagramas/EST-18-AS-IS.mmd, .svg e .bpmn; hipótese a validar |
| EST-19 | Relatório atualizado | 05-relatorio/EST-19-RELATORIO.md |

Requisitos detalhados: 01-requisitos/ESCOPO.md. Modelo de dados executável: migrations/001_initial.sql, relativo à raiz do projeto.

## Evidências e prévias

[Resultados](06-evidencias/RESULTADOS.md), TAP de testes, logs de lint/tipagem/build, navegador.json e rasterizações dos PDFs em 06-evidencias/pdf-render. [Prévias PDF individuais](06-evidencias/pdf-previa) são material de revisão, sem compactação. Não são finais aprovados para submissão.

07-entrega-pdf fica vazio até revisão e aprovação aplicável; não contém ZIP, fontes ou .gitkeep. Diretório vazio é recriado por npm run docs:preview e não é representado em Git. Não há comprovante de envio ou aceite.

[Pendências institucionais](99-referencias/PENDENCIAS-INSTITUCIONAIS.md): modelos DOCX ausentes, RPOD e confirmação do As-Is. Para fechar a etapa acadêmica é necessário fornecer essas referências e validar o material com o aluno.
