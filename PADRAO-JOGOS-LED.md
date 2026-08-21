# Padrão de desenvolvimento dos jogos do LED

Este documento define a base comum para os jogos digitais do Laboratório de Educação Digital. A base deve dar unidade à experiência sem obrigar todos os jogos a terem a mesma mecânica.

## 1. Princípios pedagógicos

- O jogo deve ter um objetivo de aprendizagem claro e explícito para o professor.
- A mecânica deve estar a serviço do conteúdo, e não o contrário.
- Priorizar participação ativa, diálogo, tomada de decisão, tentativa, feedback e possibilidade de refazer.
- Para 2º ao 5º ano, a experiência deve também favorecer leitura, compreensão de frases curtas, ampliação de vocabulário e oralidade entre pares.
- O erro deve gerar informação e nova tentativa, nunca punição ou constrangimento.
- Evitar cronômetro por padrão. Tempo só entra quando fizer sentido pedagógico.
- O ranking é um elemento de engajamento, não o objetivo central da atividade.

## 2. Fluxo-base de entrada

1. Tela inicial simples: título do jogo e pergunta "Qual é o seu ano?".
2. Opções: 2º, 3º, 4º e 5º ano.
3. Após selecionar o ano: tela com dois campos para primeiro nome ou apelido da dupla.
4. Botão "Começar".
5. Durante todo o jogo, manter o ano visível.
6. Manter um botão "Início" visível para voltar à escolha do ano.
7. Se a partida estiver em andamento, qualquer ação que abandone o progresso — como "Início" ou "Trocar ano" — deve pedir confirmação antes de sair.
8. Ao final: resultado, medalha quando aplicável, síntese da aprendizagem, ranking e opções de jogar novamente, trocar dupla ou trocar ano.

A tela de entrada deve ser curta. Explicações mais longas só entram quando forem indispensáveis para entender a mecânica.

## 3. Identidade por ano

- 2º ano: verde.
- 3º ano: azul.
- 4º ano: roxo.
- 5º ano: laranja.

A cor do ano deve aparecer em elementos de apoio: identificação do ano, barra de progresso, botões principais, bordas ou pequenos destaques. Não depender apenas da cor para transmitir informação.

## 4. Jogo em dupla

Por padrão, os jogos são realizados em duplas.

- Solicitar apenas primeiro nome ou apelido; não pedir sobrenome ou turma.
- Alternar papéis sempre que a mecânica permitir.
- Exemplo: uma criança lê/observa e a outra explica/decide; depois trocam.
- A interface deve incentivar conversa antes da ação: "conversem", "decidam juntos", "explique para seu colega".
- Quando a mecânica for de construção, cada integrante pode assumir partes diferentes do processo.

## 5. Duração

Meta padrão: aproximadamente 15 a 25 minutos na primeira tentativa.

Não é obrigatório ter 50 perguntas. O número de ações depende da mecânica. O importante é manter quantidade suficiente de decisões significativas para ocupar esse tempo sem repetição excessiva.

## 6. Quatro níveis de dificuldade

Todo jogo deve possuir quatro níveis internos:

1. Fácil
2. Médio
3. Difícil
4. Muito difícil

O jogo não precisa mostrar esses nomes às crianças. Eles organizam o banco de desafios.

Distribuição padrão para uma jornada de 50 desafios:

| Ano | Fácil | Médio | Difícil | Muito difícil |
|---|---:|---:|---:|---:|
| 2º | 20 | 15 | 10 | 5 |
| 3º | 16 | 15 | 12 | 7 |
| 4º | 14 | 14 | 13 | 9 |
| 5º | 10 | 15 | 15 | 10 |

Em jogos com outra quantidade de desafios, manter aproximadamente as mesmas proporções.

## 7. O que muda com a dificuldade

A dificuldade não deve significar apenas "texto mais difícil". Pode aumentar por:

- número de elementos na tela;
- quantidade de possibilidades;
- presença de distratores mais plausíveis;
- quantidade de passos necessários;
- necessidade de comparar duas ou mais informações;
- abstração do conceito;
- exigência de planejar antes de agir;
- necessidade de testar e corrigir;
- redução de pistas;
- relações de causa e consequência mais complexas.

## 8. Adequação da linguagem por ano

### 2º ano
- frases curtas;
- uma ideia por frase;
- vocabulário cotidiano;
- instruções diretas;
- apoio visual forte;
- evitar períodos longos e perguntas com muitas condições.

### 3º ano
- frases ainda curtas, mas já podem relacionar duas ideias;
- introduzir vocabulário específico com contexto.

### 4º ano
- textos próximos ao 3º, com um pouco mais de inferência e comparação;
- desafios podem exigir dois passos de raciocínio.

### 5º ano
- perguntas mais abstratas;
- relações entre causa, função, consequência e estratégia;
- maior presença de informações relevantes e distratores plausíveis.

## 9. Mecânicas possíveis

O padrão não obriga o uso de perguntas de múltipla escolha. Cada jogo pode escolher a mecânica mais adequada ao conteúdo.

Exemplos:

- escolher entre alternativas;
- classificar itens em grupos;
- arrastar e soltar;
- ligar pares;
- ordenar uma sequência;
- montar uma estrutura;
- escolher partes para construir algo;
- localizar elementos em uma imagem;
- resolver caminhos ou labirintos;
- testar hipóteses em uma simulação;
- observar uma cena e identificar mudanças;
- tomar decisões e ver consequências;
- corrigir algo que não funciona;
- combinar elementos para atingir um objetivo;
- criar uma solução usando peças ou atributos;
- jogo de memória ou associação;
- narrativa interativa com escolhas.

A mecânica pode mudar dentro do mesmo jogo, desde que a interface permaneça compreensível.

## 10. Layout e interface

- Priorizar widescreen 16:9.
- Usar bem a largura da tela; evitar empilhar tudo no centro quando houver espaço lateral.
- Em atividades com imagem, preferir imagem/objeto em um lado e interação no outro.
- Botões grandes e com boa área de toque.
- Tipografia legível e consistente.
- Pouco texto por tela.
- Alto contraste.
- Responsivo para telas menores, mas projetado prioritariamente para notebooks do LED.
- Imagens essenciais devem ser internas ao projeto (SVG ou arquivos do repositório), evitando dependência de fontes ou serviços externos.
- Som é opcional e deve poder ser desligado.
- Tela cheia disponível quando útil.
- Indicadores técnicos, como estado do ranking, devem ser discretos e não competir com a atividade pedagógica.

## 11. Feedback

O feedback deve ser imediato e curto.

- Acerto: confirmação + pequena explicação quando isso acrescentar aprendizagem.
- Erro: padrão atual "Ihhhh 😢" + informação que ajude a compreender o correto.
- Nunca apenas informar "errado".
- Quando possível, permitir nova tentativa ou apresentar a solução antes de seguir.

## 12. Pontuação, medalhas e ranking

Pontuação padrão para jogos com desempenho mensurável: 1000 pontos.

Faixas:

- Ouro: acima de 950.
- Prata: acima de 800.
- Bronze: acima de 600.
- Ouro ou prata: mensagem para chamar o professor.
- Bronze ou menos: convite para jogar novamente.

Ranking:

- "Ranking da escola".
- Separado por jogo e por ano.
- Mostrar apenas a melhor pontuação da dupla.
- Top 10 na interface.
- Salvar online no Supabase e manter armazenamento local como contingência.
- Usar apenas primeiro nome ou apelido.
- Verificar a conexão com o banco já na abertura do jogo e novamente ao iniciar uma partida.
- Mostrar de forma sutil o estado do ranking, por exemplo: "● ranking online" ou "● ranking local".
- A indisponibilidade do banco nunca deve impedir o jogo: a atividade continua normalmente com armazenamento local.
- Se a conexão voltar durante a sessão, o indicador deve se atualizar automaticamente quando possível.

Nem todo jogo precisa de pontuação. Jogos autorais, criativos ou exploratórios podem substituir pontos e ranking por produto final, coleção, percurso concluído, autoavaliação ou outro fechamento coerente com a proposta.

## 13. Progressão e variedade entre tentativas

- Manter banco maior do que a quantidade usada em uma rodada.
- Sortear desafios e alternativas quando aplicável.
- Evitar repetir exatamente a mesma sequência em uma nova tentativa.
- Preservar a proporção de dificuldade do ano escolhido.
- Em jogos não baseados em perguntas, variar cenários, peças, problemas, mapas, sequências ou condições iniciais.

## 14. Estrutura técnica recomendada

Cada jogo deve ficar em uma pasta própria:

- `index.html`: estrutura das telas.
- `styles.css`: layout do jogo.
- `years.css`: identidade e adaptações visuais por ano, quando necessário.
- `data.js`: banco de conteúdos/desafios.
- `visuals.js`: SVGs e elementos visuais, quando próprios do jogo.
- `app.js`: mecânica, progressão, pontuação e integração.

Na raiz do repositório, arquivos compartilhados podem concentrar comportamentos comuns. O arquivo atual `game-base.js` cuida de proteção de navegação e verificação do estado do ranking.

Para novos jogos, cada item do banco deve declarar explicitamente seu nível (`level: 1`, `2`, `3` ou `4`) em vez de inferir dificuldade pela posição ou ID.

Elementos comuns que podem evoluir para uma biblioteca compartilhada no repositório:

- seleção de ano;
- cores por ano;
- entrada da dupla;
- alternância de papéis;
- sistema de medalhas;
- ranking Supabase;
- armazenamento local;
- verificação de conectividade do ranking;
- indicador online/local;
- confirmação antes de abandonar uma partida;
- som;
- tela cheia;
- navegação para o início;
- barra de progresso.

Assim, cada novo jogo precisará implementar principalmente sua mecânica e seu banco de conteúdo.

## 15. Critério para escolher a mecânica

Antes de programar um jogo, responder:

1. O que a criança deve compreender ou conseguir fazer ao final?
2. Qual ação no jogo representa melhor essa aprendizagem?
3. O que torna essa ação progressivamente mais complexa?
4. Como a dupla precisará conversar ou colaborar?
5. Que feedback ajuda a criança a avançar?
6. Como saberemos que a atividade terminou?
7. Pontuação/ranking fazem sentido para esse objetivo ou outro fechamento é melhor?

A escolha da mecânica vem depois dessas respostas.

## 16. Checklist antes de publicar

- objetivo pedagógico claro;
- ano(s) atendidos definidos;
- quatro níveis de dificuldade;
- linguagem revisada para cada ano;
- entrada simples;
- funcionamento em dupla;
- ano visível;
- botão de início/troca de ano;
- confirmação antes de abandonar uma partida em andamento;
- experiência widescreen;
- feedback de acerto e erro;
- duração estimada adequada;
- variedade entre novas tentativas;
- imagens funcionando sem dependências frágeis;
- funcionamento sem mouse preciso quando possível;
- ranking separado por jogo e ano, quando utilizado;
- teste de conexão do banco na abertura;
- indicador discreto de ranking online/local;
- fallback local testado quando o banco estiver indisponível;
- teste em tela de notebook;
- post do Padlet pronto com título, instrução curta e link.
