# SDT-ONLINE-001 — ponto de retomada (CFT-002)

Estado em 08/10/2026: **fundação privada criada, isolamento RLS comprovado em transação, interface de prévia implementada e GitHub Pages publicado; cadastro/login reais por e-mail aguardam teste humano. Não lançado.**

## Endereços e alterações
- Prévia isolada: https://marklienista.github.io/led/somdaturma/conta-teste/
- Ferramenta coletiva corrente preservada: https://marklienista.github.io/led/somdaturma/
- Fontes novas: `somdaturma/conta-teste/index.html` e `conta.js` (rota não vinculada ao menu público atual; `noindex`).
- Manual vigente: `somdaturma/manual/index.html`; pedagogia: `somdaturma/possibilidades-pedagogicas/`.
- Hospedagem: GitHub Pages na branch `main`; rota de teste separada, **sem substituir a página pública**.
- Novo caminho de código não chama microfone nem grava áudio; o botão **Experimentar** abre o fluxo coletivo atual, sem salvar dados no modo experiência. A versão pública usa seus arquivos originais e não foi modificada.

## Entradas e autoria
- Problema: percepção e autorregulação coletiva do som conforme atividade. Não medir atenção.
- Entrada principal: experimentar a aula gratuitamente, com acesso opcional à conta adulta; estado visível `Em desenvolvimento · ambiente de teste`.
- Links: manual, possibilidades pedagógicas, página profissional e formações sob consulta.
- Autoria: Marcelo Santos, sem interferir no monitor da aula.
- Nenhum preço, limite de plano, assinatura, lançamento ou login estudantil.

## Banco aplicado ao projeto led-ranking (eyfmhnlzduoobdmwexmc)
Migration `sdt_online_001_contas_privadas_rls` aplicada somente a estruturas novas do Som da Turma:

| Tabela | Chave / dados | Privilégios do cliente |
|---|---|---|
| `som_turma_conta_preferencias` | `usuario_id` FK `auth.users`; nome de exibição do adulto, mostrar dicas | SELECT, INSERT, UPDATE próprios |
| `som_turma_conta_configuracoes` | `usuario_id` FK; período, pontos por período, medalha, trabalho e bônus | SELECT, INSERT, UPDATE próprios |
| `som_turma_conta_sessoes` | `id` UUID e `usuario_id` FK; apenas `tipo='teste'`, `turma_ficticia='TURMA TESTE'`, duração e agregados | SELECT e INSERT próprios |
| `som_turma_conta_entitlements` | `usuario_id` FK; `plano=free/premium`, `status=ativo/suspenso/expirado`, validade | SELECT próprio, INSERT só de `free/ativo/validade null`; **sem UPDATE** pelo cliente |

Todas: RLS ativa; políticas com `(select auth.uid()) = usuario_id` para `authenticated`; nenhuma permissão `anon`. Não há trigger global em `auth.users`: cada aplicativo continua independente. Chave publicada no frontend é somente `sb_publishable_...`; nenhum service role, segredo ou credencial de administrador foi colocado no código. Sem migração do histórico.

**Preservados com políticas anteriores**, inclusive sua natureza pública experimental: `invencoes_ranking`, `som_turma_eventos` e `som_turma_configuracoes`. A confidencialidade nova se aplica só às quatro tabelas privadas, não retroativamente ao legado. Não alterar essas três nem outros aplicativos nesta etapa.

## Testes realizados
1. SQL transacional: duas identidades de usuário fictícias em `auth.users` dentro de BEGIN/ROLLBACK; `authenticated` com JWT subject A e B; cada uma inseriu/leu preferências, configurações, sessão agregada e acesso Free; B não viu A, A não viu B; INSERT com `usuario_id` alheio negado por RLS; INSERT próprio de Premium negado; papel `anon` sem SELECT nas quatro tabelas. **PASS de isolamento do banco.**
2. ROLLBACK confirmado: `auth.users` e as quatro tabelas privadas voltaram a 0 linhas. Nenhum cadastro artificial permaneceu.
3. Mock funcional do cliente JS: login A, preferências, configurações e sessão fictícia; sair; login B sem visualizar esses dados; área privada oculta sem login. **PASS do fluxo simulado; não equivale a login real no Supabase.**
4. JavaScript: sintaxe válida, 0 IDs de DOM ausentes, separação de tabelas conferida, nenhuma API de gravação de áudio nos arquivos novos.
5. GitHub Pages publicou com sucesso o commit da prévia. Security Advisor = sem alertas; Performance Advisor = sem alertas no recorte consultado.
6. Código `somdaturma/control-core.js` foi relido e permaneceu no SHA `d53393a50a8278fac4001c7c197a018ae72f1ed0`, sem alteração da aula.

## Limitações e teste seguinte
- **Não há conta Auth real criada/testada** nesta rodada (`auth.users=0`). Fluxos de cadastro, confirmação por e-mail, URL de redirecionamento, entrada por senha, reentrada em outro computador e interface com Supabase real ainda requerem duas contas adultas de teste. Não declarar esses cenários homologados.
- Verificar em Supabase Authentication → URL Configuration se a URL `https://marklienista.github.io/led/somdaturma/conta-teste/` é permitida para redirecionamento da confirmação de e-mail; a ferramenta de gerenciamento disponível não expõe essa configuração.
- Teste real mínimo: criar/confirmar conta A e B de adultos; A salvar preferências, configurações e uma sessão fictícia; B entrar e não ver nada de A; A retornar e recuperar tudo; anônimo deve permanecer sem acesso. Conferir botões e mensagens no celular e desktop.
- Uma sessão da prévia é **fictícia** e não representa os dados do monitor coletivo. Integrar, em fase posterior e com decisão explícita, conta privada às aulas reais; não migrar ranking automaticamente.
- Este registro não autoriza publicação oficial, cobrança, exclusão de legado nem mudança do backend das outras ferramentas.

## Parada e handoff
A parte de **esquema/RLS** do SDT-ONLINE-001 está pronta e validada. **Banco liberado para a etapa sequencial do ApertaLetra**, que deve alterar somente as suas próprias tabelas/artefatos. Som da Turma encerra escritas no banco nesta etapa; qualquer teste complementar deve coordenar exclusividade de escrita e não modificar os objetos do ApertaLetra.

Próximo passo no Som da Turma: validação real de duas contas e correção pontual, se houver falha. Manter versão pública atual até decisão de substituição.


## Adendo visual CFT-003 — 08/10/2026

**Diretriz recebida de Crafting:** a identidade autoral transversal entrou em auditoria. O trabalho funcional aprovado em CFT-002 **não fica bloqueado** por decisões gráficas; conservar o que já existe, sem reiniciar ou desfazer a implementação. Não lançar.

### 1. Funcional concluído/preservado
- Entrada de teste, link para aula coletiva gratuita, seção de conta adulta, fluxo de autenticação implementado e as quatro tabelas privadas com RLS por `auth.uid()` permanecem como estavam.
- Isolamento do banco e testes de interface simulados anteriores são evidências preservadas; **não transformar esses testes em prova de cadastro/login reais.**
- Perfil antigo e ranking público não foram migrados. O código da aula/microfone, resumo, ausência de gravação de áudio e o uso coletivo permanecem intocados.
- Próxima validação funcional pendente: duas contas adultas reais, confirmação por e-mail/redirect, acesso próprio e cruzado, repetição em outro dispositivo e conferência de acessibilidade/responsividade quando pertinente. Corrigir apenas falhas reproduzidas.

### 2. Visual provisório, não homologado como identidade
- Paleta, fontes, acabamento dos cartões, ilustração esquemática dos níveis, assinatura textual `Marcelo Santos`, posição da seção `Sobre/Autoria` e links para outras criações e formações são **hipóteses de interface**, não padrões definitivos.
- A entrada da prévia já tem variáveis em `:root` (`--ink`, `--muted`, `--line`, `--bg`, `--brand`, `--blue`, `--sun`). Reutilizar ou ampliar esses tokens somente quando uma alteração funcional pedir; **não fazer uma refatoração cosmética neste adendo**.
- Preservar distinção cromática e textual dos níveis funcionais (foco, conversa, muito alto, ouvir), legibilidade, foco de teclado, contraste, redução de movimento e reflow; não mudar o monitor coletivo para inserir autoria.
- Conteúdo factual, estado `Em desenvolvimento`, links e caminho de retorno rápido podem ser corrigidos normalmente, mesmo antes da decisão gráfica.

### 3. Aguardando decisão de CFT-003
- Logotipo/símbolo novo, paleta transversal, tipografia e sistema comum de ícones, assinatura gráfica autoral, templates definitivos de e-mail/apresentação/vídeo, animação/movimento e migração visual ampla.
- Não alterar perceptivelmente o logotipo do Apertaquem nem inferir que decisões deste produto governam os demais.
- Após decisão visual consolidada, ajustar tokens e posicionamentos em tarefa curta e testar a interface afetada. O adendo **não** autoriza preços, limites, lançamento, conta universal ou mudança no banco do ApertaLetra.

**Resultado deste adendo:** atualização de orientação no condutor do Som da Turma, sem mudança do banco, do código funcional, da versão pública ou dos testes anteriores. Banco permanece liberado para a etapa sequencial do ApertaLetra.
