# EST-03 — Documento de visão informal

Versão 0.1 · EM ELABORAÇÃO · 23/10/2026. Minuta autoral; vision_informal (3).dot.docx ausente. Estrutura institucional não verificada.

## Contexto e oportunidade

MindHub organiza dados administrativos de pacientes e atendimentos psicológicos. O original atual tem fluxo público de paciente, disponibilidade, pagamentos manuais e configurações profissionais. Para a primeira banca da Fase 2, a missão solicita uma aplicação menor, demonstrável e coerente com sua modelagem.

## Objetivo e público

Entregar MVP independente para uma profissional manter sua carteira e agenda, com persistência e histórico. O aluno utiliza a aplicação e os artefatos para revisão acadêmica. Paciente é entidade de cadastro; não é ator de acesso nesta versão.

## Produto proposto e implementado

UC01 mantém dados administrativos (nome, e-mail, telefone, nascimento opcional) e alterna ATIVO/INATIVO. UC02 mantém agendamentos de 60 minutos, de início futuro, com estados AGENDADO/CANCELADO. Sistema rejeita sobreposições, aceita adjacência, conserva a agenda ao inativar paciente e registra alterações.

Acesso profissional com sessão; persistência SQLite local; interface HTML/CSS responsiva com identidade teal do MindHub. Migrações e seed sintético permitem apresentação sem serviços externos. Repositório dedicado evita alterações no original.

## Limites e evolução

Não inclui prontuário, pagamentos, conta de paciente, mensagens, teleconsulta, assinatura, disponibilidade pública ou integrações complexas. Gestão de contas, banco remoto, backup operacional e implantação HTTPS podem ser futuras evoluções, sujeitas a novo escopo.

## Aceitação

Software deve cumprir critérios de ESCOPO.md, UCs, matriz e testes. Documentos precisam de templates reais, revisão do aluno e conferência dos PDFs antes de submissão. Não existe comprovação de aceite acadêmico nesta execução.
