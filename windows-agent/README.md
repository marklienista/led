# Som da Turma • agente Windows

Aplicativo complementar ao [Som da Turma](https://marklienista.github.io/led/barulho/).

## O que faz

- `OUVIR`: cobre todos os monitores em azul com **👂 OUVIR — FIQUE ATENTO**.
- `AULA PARADA`: cobre todos os monitores em vermelho com **⛔ AULA PARADA — OLHE PARA O PROFESSOR**.
- Ao voltar ao estado normal no painel, as telas são liberadas.
- Durante a tela de atenção, bloqueia atalhos comuns de fuga: tecla Windows, Alt+Tab, Ctrl+Esc, Alt+Esc e Alt+F4.
- Não interfere em `Ctrl+Alt+Del`, que continua sendo a saída de segurança do próprio Windows.
- Atalho local de emergência: **Ctrl+Alt+Shift+F12** libera aquele computador por 5 minutos.
- Se o agente perder contato com o servidor por mais de 8 segundos, ele **libera a tela automaticamente** (fail-open).
- Um comando com mais de 2 horas é considerado vencido.

## Privacidade

O agente não lê arquivos, histórico, páginas abertas, textos digitados ou nomes de estudantes. Ele consulta somente o último estado do painel (`OFF`, `OUVIR` ou `AULA PARADA`) e a identificação da turma.

## Compilar

Requer .NET SDK 8 ou superior.

```powershell
dotnet publish .\SomDaTurma.WindowsAgent.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

O executável será criado em `bin\Release\net8.0-windows\win-x64\publish\`.

## Instalar em um computador de teste

1. Coloque `SomDaTurma.WindowsAgent.exe`, `instalar.ps1` e `desinstalar.ps1` na mesma pasta.
2. Clique com o botão direito em `instalar.ps1` e execute com PowerShell. Se a política do Windows impedir scripts, use um PowerShell autorizado pela escola.
3. O agente será copiado para `%LOCALAPPDATA%\SomDaTurmaLED` e ganhará um atalho na pasta Inicializar do usuário.
4. Abra o painel Som da Turma no computador do professor e teste **PAUSAR**, **CONTINUAR** e o disparo de **AULA PARADA**.

## Limites da primeira versão

Este é um bloqueio de atenção em nível de sessão do usuário, não uma substituição do bloqueio de segurança do Windows. Telas seguras do sistema, como `Ctrl+Alt+Del`, ficam fora do alcance do aplicativo por projeto.
