# MindHub MVP acadêmico — Fase 2

CRUD administrativo de pacientes e agendamentos para demonstração local da primeira banca. Projeto independente do [MindHub original](https://github.com/k100-dev/mindHub), estudado no commit `0cf85e52eb8740d7fa112383bf5f4e4804507db6`. Não acessa seu banco nem suas integrações.

## Executar no Windows, Linux ou macOS

Requisito: Node >=22.23.4 com `node:sqlite`. No Node 22 o módulo emite aviso experimental. Abra um terminal nesta pasta.

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run build
npm start
```

No PowerShell com bloqueio de scripts, use `npm.cmd` no lugar de `npm`. Acesse **http://127.0.0.1:3100** (usar esse host evita divergência da verificação de origem). Login sintético: `demo@mindhub.test` / `DemoMindHub2026!`. O seed é explícito, idempotente e não sobrescreve dados. Não utilizar a conta pública de demonstração para dados reais.

Alternativa sem instalar ferramentas de desenvolvimento: `node --experimental-strip-types scripts/seed.ts` e `node --experimental-strip-types src/server.ts`. Não há dependências externas em execução. O comando seed também aplica as migrações pendentes. `npm run dev` executa as fontes TypeScript.

Banco efetivo: `data/mindhub.sqlite`, ignorado pelo Git, com migrações em `migrations/`. Não é localStorage. Todos os caminhos de execução partem da raiz do projeto. `MINDHUB_DB`, `PORT` e `HOST` podem ser definidos como variáveis do processo; `.env.example` é apenas referência e não é carregado automaticamente.

## Recorte

- UC01: cadastrar, pesquisar, consultar, editar, inativar e reativar paciente.
- UC02: criar sessão de 60 minutos para paciente ativo, consultar, remarcar e cancelar preservando histórico.
- Início futuro, hora de São Paulo UTC−03; intervalos adjacentes permitidos, sobrepostos rejeitados no banco. Cancelamento é terminal. Inativação não cancela agenda existente.
- Apenas acesso profissional. Cada profissional vê e altera sua carteira; não há cadastro público de profissionais ou pacientes. Fixture com segunda profissional existe somente nos testes.
- Não inclui prontuário, pagamentos, comunicação automática, teleconsulta, assinatura ou limite de 24h para paciente.

## Validação

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Testes usam bancos temporários independentes. E2E inicia servidor na porta 3101 e banco em diretório temporário; não toca o banco da demonstração. Usa Edge/Chrome/Chromium instalado, via CDP nativo (defina BROWSER_PATH se necessário). Relatórios e capturas ficam em `docs/estagio/fase-2/06-evidencias` e `04-telas`.

## Arquitetura e limites

Navegador → HTTP Node → serviço MindHub → SQLite em disco local. HTML e CSS responsivos renderizados no servidor; não depende de JavaScript no navegador. TypeScript estrito compila para `dist`. Sessões opacas de 8h, senha scrypt, CSRF, escopo por profissional, FK composta, transações e triggers de conflito. SQLite não tem RLS; o arquivo é privado ao processo do servidor. Consultas parametrizadas e escape de HTML.

Servidor escuta apenas loopback por padrão. Para uma implantação remota futura: volume persistente, backup, HTTPS, `COOKIE_SECURE=1` e `APP_ORIGIN=https://dominio-escolhido`. Não usar filesystem efêmero de funções serverless. Rate limiting é local ao processo, não distribuído; não há recuperação de senha, gestão de contas, auditoria externa ou validação para uso clínico. Esta entrega é acadêmica com dados sintéticos.

Fontes, rastreabilidade, bloqueios institucionais e situação da entrega: [índice](docs/estagio/fase-2/INDICE.md). Nenhum PDF é considerado enviado ou aprovado sem comprovação.
