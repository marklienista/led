# Som da Turma • extensão Chrome (protótipo)

Extensão do Laboratório de Educação Digital que recebe os estados do painel **Som da Turma** e mostra uma tela sobre as páginas abertas nos computadores dos estudantes.

## Estados

- `MONITOR`: uso normal do navegador.
- `LISTEN`: tela azul — **👂 OUVIR / FIQUE ATENTO**.
- `BLOCK`: tela vermelha — **⛔ AULA PARADA / OLHE PARA O PROFESSOR**.
- `OFF`: aula encerrada; uso normal.

## Privacidade

A extensão não registra histórico, conteúdo das páginas, texto digitado, identidade do estudante nem atividade de navegação. O acesso às páginas é usado somente para desenhar a tela de atenção/bloqueio por cima do site aberto.

## Teste em modo desenvolvedor

1. Baixe esta pasta e descompacte-a.
2. Abra `chrome://extensions`.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta `chrome-extension`.
6. Abra um site comum e deixe a aba ativa.
7. No computador do professor, abra `https://marklienista.github.io/led/barulho/` e teste **OUVIR** e **AULA PARADA**.

A extensão não é injetada na própria página de controle do professor para que ele sempre consiga liberar a turma.

## Distribuição

O modo desenvolvedor serve apenas para teste e precisa ser carregado manualmente em cada computador usado no piloto. Para distribuição e sincronização normal entre computadores logados no Chrome, a extensão deverá ser publicada na Chrome Web Store. Uma publicação não listada pode ser usada para evitar que ela apareça nas buscas públicas.
