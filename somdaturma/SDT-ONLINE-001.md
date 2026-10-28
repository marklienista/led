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


## SDT-PROJECAO-001 — telas de projeção e saldo da turma (14/10/2026)

**Escopo:** correção funcional/visual solicitada: interrupção com controles acessíveis, quadro de medalhas maior, pontos da turma e saldo de medalhas durante e ao encerrar a aula. Identidade gráfica permanece provisória conforme CFT-003; sem lançamento.

**Arquivos desta execução:**
- \`somdaturma/projecao.css\`: CSS complementar com tokens reversíveis, escala da interrupção limitada também por altura, botões sem corte e quadro de medalhas em 1–3 colunas conforme largura; compactação do resumo em projetores 720p/768p e do monitor em celulares baixos.
- \`somdaturma/control-core.js\`: emite eventos apenas de apresentação \`somturma:pontos-aula\` e \`somturma:aula-encerrada\`; o ranking de medalhas passa a mostrar também quantas estão livres, sem mudar o cálculo ou persistência.
- \`somdaturma/profiles.js\`: usa o mesmo estado \`stateForRoom\` e o mesmo objetivo de pontos de medalha; mostra saldo atual para a próxima medalha, medalhas conquistadas e disponíveis; o saldo da turma permanece anterior à aula durante a execução (ajuste de 15/10); os pontos da aula aparecem separadamente e só são somados ao encerramento, depois das eventuais paralisações e do bônus real. Quando a rede falha, informa que o saldo pode refletir apenas os dados daquele navegador.
- \`somdaturma/index.html\` e \`control-sync.js\`: carregam CSS e JS versionados, sem alterar entrada/autenticação ou o processo de áudio.

**Semântica preservada:** pontos da aula ≠ saldo da turma. O saldo exibido é o restante até a próxima medalha, após converter pontos suficientes; medalhas conquistadas não diminuem quando uma é usada, apenas o número de disponíveis. O bônus por aula sem paralisação conta somente no encerramento. Pontos de foco perdidos por paralisação confirmada não voltam; pontos de trabalho persistem.

**Verificações:**
- JavaScript dos três arquivos de execução com sintaxe válida, eventos vinculados, elementos IDs únicos e referências versionadas presentes.
- Oito cenários determinísticos de pontuação com resultado correto: saldo zero; cruzamento do limite, inclusive medalha usada; trabalho preservado após paralisação; bônus que converte medalha; ajuste negativo sem apagar medalha; consumo de medalha; múltiplas medalhas e filtro por turma.
- Renderização responsiva em HTML de teste representativo com CSS equivalente ao patch, usando Chromium nas larguras 1920, 1366, 1024, 800, 390 e 320. Em 1366×768, os três botões da interrupção e os dois controles do resumo ficam dentro da tela; quadro maior tem duas colunas e em >=1730 usa três. Em 390×667 e 320×568, botões da interrupção e controles da aula permanecem alcançáveis. Em alturas muito pequenas, o resumo pode exigir rolagem vertical.
- **Limite de prova:** renderizações com fixture representativa e testes matemáticos/sintáticos; não foram realizadas uma aula real com microfone, votação de medalha em escola ou validação física no projetor. Não declarar homologação integrada em hardware.

**Proteções:** dados reais, tabelas Supabase, políticas RLS, ranking histórico, autenticação experimental, microfone, gravação de áudio e telas de outras ferramentas inalterados. Não houve novo projeto, preço, restrição premium, cobrança ou lançamento. Alterações aplicadas somente ao fluxo visual existente, preservando o status de produto em desenvolvimento.

**Próximo passo mínimo:** conferir no projetor real a visibilidade dos botões e o saldo de uma turma conhecida, fazendo uma aula curta de teste em que o encerramento confirme pontos/medalhas/medalhas disponíveis. Corrigir apenas divergência comprovada; sem redesign antes do CFT-003.


## SDT-PROJECAO-002 — soma somente ao encerrar (15/10/2026)

**Solicitação:** não antecipar o acréscimo dos pontos da aula ao saldo acumulado da turma. Durante a aula, `PONTOS DA TURMA` e medalhas permanecem no estado inicial conhecido; `PONTOS DA AULA` evoluem independentemente na interface existente. Somente ao encerrar o Som da Turma aplica a soma, incluindo o bônus de aula sem paralisação quando existir, e atualiza pontos remanescentes para a próxima medalha, medalhas conquistadas e disponíveis. Penalidades de foco já ocorrem dentro do cálculo dos pontos da aula; medalhas usadas permanecem separadas.

**Implementação:** mudança restrita a `somdaturma/profiles.js` (o placar ao vivo passa a renderizar somente `projectionBase.state`; removida a atualização do placar em cada evento de pontos), com renovação de cache em `control-sync.js` e `index.html` para `20261015-1`. `control-core.js`, CSS, microfone, persistência de dados, contas e banco intactos. Identidade visual ainda provisória CFT-003.

**Testes:** sintaxe JS válida e 11 casos determinísticos de apresentação: cinco progressões de pontos da aula preservam os mesmos valores de turma no placar ao vivo; seis resultados finais somam corretamente e convertem pontos em medalhas. Exemplo: saldo inicial 38/40 e 2 medalhas (1 livre), aula acrescenta 5 pontos → durante a aula mantém 38/40 e 2 medalhas; no encerramento passa a 3/40 e 3 medalhas (2 livres). Testes de código/simulação, ainda sem prova física de aula e projetor. Status: alteração integrada à página pública, mas não constitui lançamento do produto.

**Próximo passo:** testar em uma aula curta de verdade a separação entre saldo da turma e pontos da aula; conferir o resumo final no projetor. Não reabrir desenho das demais telas por esta mudança.


## SDT-IDENTIDADE-B-001 — aplicação integral e configurações em aba (25/10/2026)

**Decisão e fonte:** CFT-003 «Identidade Autoral Marcelo Santos — auditoria e plataforma v0.1» (Drive 1orLrGtAJgBBZBhgsxEn5rcXoUX4C11pf1TFfGMN3IRw), direção B «Recortes em uso» aprovada. «Criado por Marcelo Santos» e «Invenções práticas para a educação» são assinaturas textuais adultas. CFT-004 / ARC-001 mantém a arquitetura de destino de conta única no Supabase conta_base e serviços Render independentes; esta tarefa **não** migra hospedagem, Auth, usuários, dados nem promete SSO. O nome público da conta é apenas «Conta», conforme revisão de 22/10.

**Escopo entregue na branch `sdt-identidade-b-20261025` sobre `main`:**
- `identidade-b.css` nova folha local de tokens B: papel claro (#faf9f5), branco (#fffdf9), texto (#232922), amarelo pontual (#f2c641), terracota (#ad4b3b), verde de apoio (#20685d), placas/recortes **apenas decorativos**. Sem logo e sem arquivos/fontes externos.
- `profiles.js` atualiza entrada, conteúdo de autoria, preparação adulta e alternância acessível **Preparar aula / Configurações**. Aula abre com **Turma + Níveis**, sem terceira coluna. Ao acionar Configurações, esses painéis se ocultam e entra um **painel compacto independente** (até 650px) com os mesmos cinco parâmetros, sem mudança no salvamento ou na fonte de dados. O estado da escolha está em `aria-pressed` e não é persistido; retorna a Preparar aula ao entrar/voltar à configuração geral. Sobre/Autoria acessível também na preparação, sem ocupar o monitor da turma.
- No monitor coletivo, interrupção, resumo e medalhas, a B chega à tipografia, placas, espaços e contornos; **verde/conversa/amarelo/vermelho/ouvir/azul mantidos como códigos sonoros**, sem assinatura ou promoção na projeção. Preservadas as escalas de projetor e o ajuste numérico do microfone.
- Prévia adulta `conta-teste/index.html` alinhada só visualmente. `manual/index.html` e `possibilidades-pedagogicas/index.html` recebem `identidade-b-leitura.css`; o manual avisa que o antigo esquema de três colunas é histórico. Texto pedagógico integral mantido.
- `control-sync.js` e `index.html` carregam `profiles.js?v=20261025-b1` e `control-sync.js?v=20261025-b1`. Não alterar `control-core.js`, `microphone.js`, cálculos de pontos, agregados, sincronização, licenças, banco, ranking, contas, senhas, uploads nem permissões.

**Testes executados:** sintaxe JavaScript do perfil, núcleo e carregador; referências da folha de identidade, rotas e identificadores únicos; verificação do ciclo de alternância da configuração (aberta/fechada/retorno) e atributo `aria-pressed`; CSS equilibrado (196 regras principais e 35 de leitura), medidas responsivas e `prefers-reduced-motion`; contraste da amostra principal (14,12:1 texto/papel; 6,15:1 secundário/papel; 9,47:1 branco/verde escuro; 9,16:1 texto/amarelo; 10,02:1 branco/interrupção vermelha). São provas estáticas e de lógica; **aulas reais, leitor de tela físico, projetor e toda a navegação completa não foram homologados nesta execução**.

**Limite/segurança:** implementação de apresentação, não lançamento comercial. Os links profissionais continuam em áreas adultas. Não foi criada conta universal nem mexido nas tabelas `som_turma_*`, Render, Supabase ou em outras ferramentas. Não foi aplicada nova identidade ao Apertaquem.

**Próximo passo:** conferir visualmente em um projetor e no celular a entrada, o ciclo da aba Configurações, a interrupção, medalhas e resumo. Corrigir apenas diferenças observadas. A CFT-004 continua dona das futuras transições de conta/hospedagem.


## SDT-MEDALHAS-001 — turma primeiro e medalhas por troca manual (28/10/2026)

**Pedido:** após entrar no perfil, dar primazia à turma, colocar os níveis abaixo e tornar intuitivos os dois atos distintos: (1) converter pontos em medalha e (2) usar uma medalha já disponível. **Medalhas novas não surgem automaticamente** ao atingir o alvo de pontos.

**Interface implementada:** a preparação da aula passa a uma coluna principal de Turma (escolha, pontos acumulados, conquistadas, disponíveis, ações), com Níveis em uma faixa compacta **abaixo** e Configurações preservada em aba separada. Os pontos/medalhas aparecem somente depois da seleção da turma. Ajuste manual de pontos foi recolhido em «Ajustar pontos manualmente». Ações separadas e confirmadas: «Trocar X pontos por 1 medalha» (debita X, incrementa conquista e disponível) e «Usar 1 medalha disponível» (não altera total conquistado). As duas ações guardam evento com ID único; se a rede falha, guardam no navegador para sincronização já existente. Nenhuma ação automática de conversão acontece no fim da aula ou no ranking. Controles ficam indisponíveis enquanto uma ação é executada.

**Semântica, preservação e migração mínima:** `somdaturma/medal-ledger.js` é o cálculo único usado por turma e ranking. Eventos **anteriores a 28/10/2026 17:52:11.350655 UTC** mantêm o comportamento histórico de medalhas já conquistadas; o corte considera a data original contida no identificador de sessão quando disponível e usa `criado_em` como alternativa. Eventos posteriores acumulam pontos até a troca **explícita**. Uma troca é um evento `tipo='medalha_trocada'`, com `pontos=-valor_da_troca` registrado no próprio evento, para que mudar futuramente a configuração não altere o preço histórico da conquista. O uso de medalha continua como `tipo='medalha_usada'`. Não se migrou, zerou ou reescreveu evento anterior. A área coletiva atual continua usando perfil experimental legado, sem afirmar que constitui autenticação segura de conta adulta.

**Banco:** migração aplicada somente em `public.som_turma_eventos` no projeto `led-ranking`: CHECK de `tipo` passou a permitir `medalha_trocada`, novo CHECK valida custo negativo entre 1 e 10.000 e os demais campos zerados, e policy INSERT mantém as regras preexistentes para sessões/ajustes/usos, permitindo também esse novo evento. A policy SELECT, as tabelas `invencoes_ranking`, `som_turma_configuracoes`, as tabelas privadas e as do ApertaLetra não foram modificadas. **O perfil/senha do app legado não substitui Supabase Auth nem dá autorização forte no banco; a migração para a conta adulta aprovada permanece frente técnica separada.**

**Arquivos:** novos `medal-ledger.js`; atualizados `profiles.js`, `control-core.js`, `identidade-b.css`, `index.html`, `control-sync.js`, `manual/index.html` e `possibilidades-pedagogicas/index.html`. `microphone.js`, captura de som e persistência de aula não alterados. Versões de cache de JS/CSS revisadas.

**Testes executados:** 11 casos determinísticos do cálculo (não converter automaticamente, meta exata, uma e duas trocas, uso de medalha, legado, ajustes manuais e isolamento por turma); teste simulado de clique com confirmação, cancelamento, insuficiência de pontos, registro local sem rede e ID de evento; histórico 38 pontos + 10 novos = 48 pontos sem medalha nova; troca de 40 = 8 pontos e +1 medalha; uso subsequente baixa apenas medalha disponível. Sintaxe JS, referências de DOM sem IDs duplicados, ordem de carregamento do ledger e estrutura CSS conferidas. Teste SQL com role `anon` e ROLLBACK: troca válida permitida, custo inválido/positivo negados e três tipos antigos preservados. Após o ROLLBACK, 0 linhas de teste ficaram no banco. **Não houve teste ponta a ponta de conversão real na interface da escola/projetor.**

**Avisos reais:** Security Advisor nesta consulta mostrou `auth_leaked_password_protection` desativado e três tabelas `apertaletra_*` com RLS sem política (informações de outro módulo). Nenhum desses avisos foi introduzido nem corrigido nesta tarefa; encaminhar à frente proprietária quando relevante. Não reconfigurar Auth do Supabase nem políticas de outro aplicativo por um ajuste de medalhas.

**Próximo passo:** conferir no projetor real a nova hierarquia, selecionar turma com saldo suficiente, confirmar uma única troca e conferir ponto/medalha no resumo e ranking; conferir cancelamento e uso. **Evitar converter pontos da mesma turma simultaneamente em dois computadores**, pois o mecanismo público experimental ainda não tem transação de saldo bloqueada por conta autenticada. A identidade B foi preservada, sem novo logo, preço ou lançamento.
