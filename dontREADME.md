# Gerador de Sentenças — .docx

Aplicativo desktop (Electron) que converte sentenças judiciais em formato JavaScript para documentos .docx formatados.

## Formato esperado do texto colado

O texto deve usar as funções e constantes abaixo — idênticas às que você já gera no seu fluxo:

```js
const PROCESSO = 'Processo nº 1044897-05.2021.8.26.0053';

const RELATORIO = [
  bp('Parágrafo normal do relatório...'),
  el(),
  bp('É o relatório.'),
];

const FUNDAMENTACAO = [
  sh('I. DO JULGAMENTO ANTECIPADO'),
  el(),
  bp('Parágrafo normal...'),
  cp('Citação em itálico...'),
];

const DISPOSITIVO = [
  bp('Ante o exposto...'),
];
```

Significado de cada função:

| Função | Tipo | Formatação aplicada no .docx |
|--------|------|------------------------------|
| `bp(texto)` | parágrafo | justificado, recuo 1ª linha 2,5cm |
| `sh(texto)` | subtítulo | negrito, justificado |
| `cp(texto)` | citação | itálico, recuo à esquerda 2,5cm |
| `el()` | linha em branco | parágrafo vazio |

Formatação global: **Times New Roman 12pt**, espaçamento entrelinhas 1,5.

## Instalação

Requer Node.js instalado (já feito, no seu caso).

```bash
npm install
```

## Uso

```bash
npm start
```

Na janela que abrir:
1. Cole o texto no campo grande
2. Clique em **Gerar .docx**
3. Escolha onde salvar o arquivo

## Estrutura

```
src/
  main.js       # processo principal do Electron
  preload.js    # ponte IPC
  index.html    # interface
  parser.js     # executa o JS colado em sandbox
  gerador.js    # monta o .docx
```
