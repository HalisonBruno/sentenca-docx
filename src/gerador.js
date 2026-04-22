const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  convertInchesToTwip
} = require('docx');

// 2,5 cm em twips. 1 cm = 567 twips (aprox). 2,5 cm = 1417 twips.
const CM_2_5 = 1417;
const FONT = 'Times New Roman';
const FONT_SIZE = 24; // half-points => 12pt

/**
 * Constrói o documento .docx a partir da estrutura parseada.
 * Regras de formatação:
 *  - Times New Roman 12pt em tudo (inclusive citações)
 *  - Parágrafos normais: justificado, recuo especial 1ª linha 2,5cm
 *  - Citações (cp): itálico, recuo à esquerda 2,5cm, sem recuo à direita,
 *    sem recuo de 1ª linha adicional
 *  - Subtítulos (sh): negrito, centralizado
 *  - el(): linha em branco
 */
async function gerarDocx(estrutura) {
  const filhos = [];

  if (estrutura.processo) {
    filhos.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: estrutura.processo,
            bold: true,
            font: FONT,
            size: FONT_SIZE
          })
        ],
        spacing: { after: 400 }
      })
    );
  }

  // Título da sentença
  filhos.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'SENTENÇA',
          bold: true,
          font: FONT,
          size: FONT_SIZE
        })
      ],
      spacing: { after: 400 }
    })
  );

  // Seções
  adicionarSecao(filhos, 'RELATÓRIO', estrutura.relatorio);
  adicionarSecao(filhos, 'FUNDAMENTAÇÃO', estrutura.fundamentacao);
  adicionarSecao(filhos, 'DISPOSITIVO', estrutura.dispositivo);

  const doc = new Document({
    creator: 'Gerador de Sentenças',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FONT_SIZE }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.18),   // ~3cm
              bottom: convertInchesToTwip(0.79), // ~2cm
              left: convertInchesToTwip(1.18),   // ~3cm
              right: convertInchesToTwip(0.79)   // ~2cm
            }
          }
        },
        children: filhos
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

function adicionarSecao(filhos, titulo, itens) {
  if (!itens || itens.length === 0) return;

  // Cabeçalho de seção
  filhos.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: titulo,
          bold: true,
          font: FONT,
          size: FONT_SIZE
        })
      ],
      spacing: { before: 300, after: 200 }
    })
  );

  for (const item of itens) {
    filhos.push(converterItem(item));
  }
}

function converterItem(item) {
  if (!item || typeof item !== 'object') {
    return paragrafoVazio();
  }

  switch (item.tipo) {
    case 'paragrafo':
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: CM_2_5 },
        spacing: { line: 360 }, // 1.5 (240 = simples, 360 = 1.5)
        children: [
          new TextRun({
            text: item.texto,
            font: FONT,
            size: FONT_SIZE
          })
        ]
      });

    case 'subtitulo':
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360, before: 200, after: 100 },
        children: [
          new TextRun({
            text: item.texto,
            bold: true,
            font: FONT,
            size: FONT_SIZE
          })
        ]
      });

    case 'citacao':
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: CM_2_5, right: 0 },
        spacing: { line: 360 },
        children: [
          new TextRun({
            text: item.texto,
            italics: true,
            font: FONT,
            size: FONT_SIZE
          })
        ]
      });

    case 'linha-vazia':
      return paragrafoVazio();

    default:
      return paragrafoVazio();
  }
}

function paragrafoVazio() {
  return new Paragraph({
    children: [new TextRun({ text: '', font: FONT, size: FONT_SIZE })],
    spacing: { line: 360 }
  });
}

module.exports = { gerarDocx };
