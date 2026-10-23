# Roteiro de demonstração

Versão 0.1 · AGUARDANDO REVISÃO. Utilizar somente dados fictícios.

Preparação: Node >=22.23.4; migrações e seed executados; iniciar servidor conforme README. Manter aplicação e banco no computador para evitar dependência de serviço remoto. Abrir http://127.0.0.1:3100. Se a instalação das ferramentas falhar, usar os comandos diretos Node documentados; não há dependências externas de execução.

1. Abrir Pacientes sem sessão e mostrar redirecionamento para login.
2. Entrar com demo@mindhub.test / DemoMindHub2026!.
3. Cadastrar Clara Demonstração com e-mail sintético ainda não utilizado e telefone fictício.
4. Recarregar detalhe; pesquisar nome na lista; editar telefone/nome.
5. Inativar, mostrar histórico e preservação dos dados; reativar.
6. Cadastrar agendamento futuro de 60 minutos e recarregar.
7. Tentar outro início 30 minutos depois para mostrar conflito. Horários adjacentes são permitidos.
8. Remarcar para intervalo livre; mostrar evento com antes/depois.
9. Cancelar e mostrar estado terminal/histórico; paciente permanece cadastrado.
10. Sair e mostrar bloqueio de acesso.

Escolher datas futuras no momento da banca. Os testes automatizados usam janeiro de 2099 para permanecerem determinísticos. Se uma execução anterior já cadastrou o e-mail da demo manual, use outro e-mail sintético; não apague banco ou histórico para limpar a apresentação.
