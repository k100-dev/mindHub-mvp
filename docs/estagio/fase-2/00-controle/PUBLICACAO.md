# Controle de publicação do repositório dedicado

Elaboração em 23/10/2026; conferência de publicação em 26/10/2026. Origin exclusivo do MVP: https://github.com/k100-dev/mindHub-mvp.git.

Baseline local main: 289285e (diagnóstico). Trabalho na branch fase-2/mvp-academico. Código de referência: 923f5b0844113a3863b1e5fa9231cd9fadad7a83. A branch de trabalho contém implementação e materiais de revisão; main não recebeu a implementação sem revisão.

Commits locais preparados: 289285e (diagnóstico), 923f5b0 (implementação) e 705b468 (modelagem, documentação e evidências).

## Resultado da tentativa de envio

Comando direcionado exclusivamente ao MVP: `git push origin main fase-2/mvp-academico`. A primeira tentativa foi impedida pela conectividade do sandbox; repetido com autorização para acesso externo, o GitHub respondeu `Invalid username or token` e `Authentication failed`. Nenhuma credencial foi exibida ou inserida no código.

Conferência em 26/10/2026 pelo conector GitHub: a API de branches do MVP retornou `[]`. Não houve publicação parcial. Os commits permanecem no Git independente local, com árvore de trabalho limpa antes deste registro.

Estado ao término da primeira tentativa: envio impedido pela autenticação do Git. Esse impedimento foi resolvido na retomada descrita a seguir. Nenhuma senha/token foi compartilhada no chat ou gravada nos documentos.

## Retomada em 26/10/2026 — publicação concluída

Após o pedido de retomada do aluno, foi verificado que não havia conta GitHub cadastrada no Git Credential Manager do Windows. A autenticação oficial pelo navegador foi iniciada com autorização e concluída com código 0. Não houve alteração de configuração do repositório original.

O comando de push, sem force, concluiu com código 0 e criou exclusivamente no repositório dedicado:

- `main`: 289285e504954591102e9205943b8687b3753006, baseline de diagnóstico.
- `fase-2/mvp-academico`: 6c41ea5a3bbd135976b3103bbed8ecd9dff57d17 na primeira publicação bem-sucedida, incluindo código, documentação, evidências e registro da tentativa anterior.

Esses hashes foram conferidos por leitura da API GitHub e coincidiram com os locais. A atualização deste registro constitui um commit documental posterior na branch de trabalho. A implementação permanece sem merge em main, para revisão.

Revisão do trabalho: https://github.com/k100-dev/mindHub-mvp/tree/fase-2/mvp-academico. A publicação Git está concluída; continuam pendentes modelos institucionais, RPOD, confirmação do As-Is e aprovação acadêmica.

Publicação no GitHub não é submissão acadêmica nem implantação da aplicação. Nenhum commit ou pull request foi direcionado ao repositório original.
