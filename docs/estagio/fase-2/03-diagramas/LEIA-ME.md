# Modelagem editável

Diagramas descrevem o MVP, não a arquitetura completa do original. Fontes Mermaid (.mmd), vetores SVG e layout em scripts/diagrams.mjs. Regenerar: node scripts/diagrams.mjs. Não foi usado um renderizador Mermaid externo: os SVGs são layouts vetoriais próprios, revisáveis em paralelo com as fontes semânticas.

DER: unicidade composta patients(professional_id,email) e patients(professional_id,id); FK composta na agenda. events tem FK do proprietário, mas entity/entity_id é vínculo lógico polimórfico, sem FK. schema_migrations(name,applied_at) é tabela técnica de migração, fora do domínio. SQLite não implementa RLS.
