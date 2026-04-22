# Gerador de Sentenças — .docx

Aplicativo desktop (Electron) que converte sentenças judiciais estruturadas em formato JavaScript para documentos Word (.docx) formatados conforme padrão forense.

## Por que JavaScript como formato intermediário?

Uma pergunta razoável: por que gerar sentenças em JS e depois converter, ao invés de pedir o `.docx` diretamente a um modelo de linguagem?

**Resposta: economia significativa de tokens em sessões com LLMs.**

Pedir que o modelo gere um `.docx` formatado exige que ele produza (direta ou indiretamente) toda a estrutura XML do OpenXML — tags de parágrafo, propriedades de run, formatação de fonte, espaçamento, recuos — repetidas a cada bloco. Isso consome muitos tokens por sentença.

Já o formato JS deste projeto reduz a saída do modelo ao essencial:

```js
bp('Trata-se de mandado de segurança...')
cp('Art. 156. Compete aos Municípios...')
sh('I. DO JULGAMENTO ANTECIPADO')
el()
```

A formatação (Times 12, recuo 2,5cm, itálico em citações, espaçamento 1,5, etc.) fica codificada **uma única vez** neste aplicativo, não precisa ser repetida pelo modelo a cada parágrafo.

> **Observação do autor:** em minhas próprias sessões no Claude Pro, observei que pedir a geração direta de um `.docx` consome aproximadamente **7% a mais da capacidade da sessão** em comparação com gerar o mesmo conteúdo em formato JS para posterior conversão por este aplicativo. A métrica é empírica e baseada em uso pessoal, mas a diferença se confirmou em múltiplas sessões. Em fluxos com várias sentenças por sessão, essa economia libera contexto para o que importa: a fundamentação.

## O formato esperado

O texto colado na janela deve seguir esta estrutura:

```js
const PROCESSO = 'Processo nº 0000000-00.0000.0.00.0000';

const RELATORIO = [
  bp('Trata-se de ação proposta por Fulano de Tal em face de Beltrano...'),
  bp('Narra a parte autora que...'),
  el(),
  bp('É o relatório.'),
];

const FUNDAMENTACAO = [
  sh('I. DO JULGAMENTO ANTECIPADO'),
  el(),
  bp('A controvérsia é de direito e de fato demonstrável documentalmente...'),
  sh('II. DO MÉRITO'),
  el(),
  bp('A Constituição Federal dispõe:'),
  cp('Art. 5º, LIV - ninguém será privado da liberdade ou de seus bens sem o devido processo legal.'),
  bp('No caso concreto...'),
];

const DISPOSITIVO = [
  bp('Ante o exposto, JULGO PROCEDENTE o pedido...'),
];
```

Cada função marca um tipo de parágrafo:

| Função | Tipo | Formatação no .docx |
|--------|------|------------------------------|
| `bp(texto)` | parágrafo comum | Times New Roman 12, justificado, recuo 1ª linha 2,5cm, espaçamento 1,5 |
| `sh(texto)` | subtítulo | Times New Roman 12, **negrito**, justificado |
| `cp(texto)` | citação legal/doutrinária | Times New Roman 12, *itálico*, justificado, recuo esquerdo 2,5cm |
| `el()` | linha em branco | parágrafo vazio |

As seções `RELATÓRIO`, `FUNDAMENTAÇÃO` e `DISPOSITIVO` são renderizadas como títulos centralizados em negrito, no corpo do documento.

## Instalação

Requer [Node.js](https://nodejs.org/) instalado.

Na pasta do projeto, pelo PowerShell ou CMD:

```
npm install
```

## Uso em modo desenvolvimento

```
npm start
```

A janela abre, você cola o texto no campo grande, clica em **Gerar .docx** e escolhe onde salvar.

## Gerando um executável (.exe) para Windows

Se quiser um `.exe` autônomo (sem precisar abrir o terminal toda vez):

```
npm install --save-dev electron-builder
npm run build
```

O executável portable é gerado em `dist\`.

## Estrutura do projeto

```
sentenca-docx/
├── package.json
├── README.md
├── .gitignore
└── src/
    ├── main.js       # processo principal do Electron (janela, IPC, salvar arquivo)
    ├── preload.js    # ponte segura entre interface e backend
    ├── index.html    # interface gráfica
    ├── parser.js     # executa o JS colado num sandbox seguro (vm)
    └── gerador.js    # monta o .docx com a biblioteca `docx`
```

## Como funciona por dentro

O parser **executa o código JS colado** num sandbox isolado (módulo `vm` do Node), com as funções `bp`, `sh`, `cp`, `el` redefinidas para marcar cada parágrafo com seu tipo. Não há regex frágil tentando interpretar o texto — o próprio JS do usuário é interpretado pelo Node, com segurança. O gerador então aplica a formatação certa para cada tipo identificado.

Isso significa que adicionar novas funções auxiliares (ex: uma `ct()` para conclusão de tópico) é só adicionar a linha correspondente em `parser.js` e o estilo em `gerador.js`.

## Licença

MIT
