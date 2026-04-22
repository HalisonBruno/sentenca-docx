const vm = require('vm');

/**
 * Executa o texto JS colado pelo usuário num sandbox seguro,
 * com as funções bp/sh/cp/el definidas para marcar cada parágrafo
 * com seu tipo. Retorna a estrutura pronta para virar docx.
 */
function parseSentenca(textoJS) {
  const sandbox = {
    bp: (texto) => ({ tipo: 'paragrafo', texto: String(texto) }),
    sh: (texto) => ({ tipo: 'subtitulo', texto: String(texto) }),
    cp: (texto) => ({ tipo: 'citacao', texto: String(texto) }),
    el: () => ({ tipo: 'linha-vazia' }),
    PROCESSO: undefined,
    RELATORIO: undefined,
    FUNDAMENTACAO: undefined,
    DISPOSITIVO: undefined,
    console: { log: () => {} }
  };

  const contexto = vm.createContext(sandbox);

  // Remove `const`/`let`/`var` do topo para que as atribuições
  // caiam direto no sandbox (ou mantém — vm.runInContext aceita
  // ambos, mas precisamos garantir acesso às variáveis depois).
  const codigoPreparado = prepararCodigo(textoJS);

  try {
    vm.runInContext(codigoPreparado, contexto, {
      timeout: 2000,
      displayErrors: true
    });
  } catch (erro) {
    throw new Error(
      `Erro ao interpretar o texto colado: ${erro.message}\n\n` +
      `Verifique se o texto está no formato esperado, com as funções bp(), sh(), cp(), el() e as constantes RELATORIO, FUNDAMENTACAO, DISPOSITIVO.`
    );
  }

  const estrutura = {
    processo: sandbox.PROCESSO || '',
    relatorio: sandbox.RELATORIO || [],
    fundamentacao: sandbox.FUNDAMENTACAO || [],
    dispositivo: sandbox.DISPOSITIVO || []
  };

  if (
    estrutura.relatorio.length === 0 &&
    estrutura.fundamentacao.length === 0 &&
    estrutura.dispositivo.length === 0
  ) {
    throw new Error(
      'Nenhuma seção foi encontrada. Esperava-se pelo menos um de: RELATORIO, FUNDAMENTACAO, DISPOSITIVO.'
    );
  }

  return estrutura;
}

/**
 * Converte `const X = ...` em `X = ...` (sem const) para que
 * a variável fique acessível via sandbox. Faz o mesmo para let/var.
 * Só substitui no início de linha (ou após espaços iniciais)
 * para as constantes conhecidas.
 */
function prepararCodigo(codigo) {
  const nomes = ['PROCESSO', 'RELATORIO', 'FUNDAMENTACAO', 'DISPOSITIVO'];
  let resultado = codigo;
  for (const nome of nomes) {
    const regex = new RegExp(`^\\s*(?:const|let|var)\\s+${nome}\\s*=`, 'm');
    resultado = resultado.replace(regex, `${nome} =`);
  }
  return resultado;
}

module.exports = { parseSentenca };
