# Decisões técnicas — v0.1

23/10/2026 — EM ELABORAÇÃO.

- ADR-001: projeto independente dentro do workspace, com origin exclusivo mindHub-mvp; branch fase-2/mvp-academico. Referência remota fixada em 0cf85e52eb8740d7fa112383bf5f4e4804507db6.
- ADR-002: monólito local TypeScript, HTML renderizado no servidor e SQLite. Sem dependências de execução externas. Reduz módulos e permite fallback local. Não mantém stack Next/Supabase; mantém conceitos e identidade. Implantação remota futura exige volume persistente e HTTPS.
- ADR-003: sessões opacas aleatórias com hash no banco, cookie HttpOnly/SameSite, expiração e logout; scrypt para senha; CSRF por sessão, checagem de origem e limite de tentativas. Seed fictício somente por comando explícito.
- ADR-004: profissional possui pacientes e agenda. FK composta impede associar paciente de outra profissional. Mutação e evento na mesma transação; triggers rejeitam sobreposição inclusive fora do serviço.
- ADR-005: arquivos finais institucionais não serão simulados. Fontes preliminares recebem status explícito; RPOD e modelos ausentes constam no manifesto.
