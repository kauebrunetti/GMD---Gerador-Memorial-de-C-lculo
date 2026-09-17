/* ============================================================
   calc.js — cálculos NBR 5410 / NBR 17019
   Todos os resultados podem ser sobrepostos manualmente pelo
   engenheiro (override no formulário — "valor manual").
   ============================================================ */

// Capacidade de condução de corrente [A] — cobre, isolação EPR/HEPR 90 °C.
// NBR 5410, tabela 37. Chave: seção mm² → [2 cond. carregados, 3 cond. carregados]
// Capacidade de condução de corrente por método de referência da NBR 5410
// (tabela 33), em ampères: [2 condutores carregados, 3 condutores carregados].
// Cobre, isolação EPR/XLPE (90 °C) — tabelas 37 (A1 a D) e 39 (E, F e G).
// Métodos F e G só são tabelados a partir de 25 mm².
const CAPACIDADE = {
  // A1 — condutores isolados em eletroduto embutido em parede termicamente isolante
  A1: {
    1.5: [19, 17], 2.5: [26, 23], 4: [35, 31], 6: [45, 40],
    10: [61, 54], 16: [81, 73], 25: [106, 95], 35: [131, 117],
    50: [158, 141], 70: [200, 179], 95: [241, 216], 120: [278, 249],
    150: [318, 285], 185: [362, 324], 240: [424, 380],
  },
  // A2 — cabo multipolar em eletroduto embutido em parede termicamente isolante
  A2: {
    1.5: [18, 16], 2.5: [25, 22], 4: [33, 29], 6: [42, 37],
    10: [57, 51], 16: [76, 68], 25: [99, 89], 35: [121, 109],
    50: [145, 130], 70: [183, 164], 95: [220, 197], 120: [253, 227],
    150: [290, 259], 185: [329, 295], 240: [386, 346],
  },
  // B1 — condutores isolados em eletroduto sobre parede ou embutido em alvenaria
  B1: {
    1.5: [23, 20], 2.5: [31, 28], 4: [42, 37], 6: [54, 48],
    10: [75, 66], 16: [100, 88], 25: [133, 117], 35: [164, 144],
    50: [198, 175], 70: [253, 222], 95: [306, 269], 120: [354, 312],
    150: [402, 355], 185: [458, 405], 240: [538, 476],
  },
  // B2 — cabo multipolar em eletroduto sobre parede ou embutido em alvenaria
  B2: {
    1.5: [22, 19], 2.5: [30, 26], 4: [40, 35], 6: [51, 44],
    10: [69, 60], 16: [91, 80], 25: [119, 105], 35: [146, 128],
    50: [175, 154], 70: [221, 194], 95: [265, 233], 120: [305, 268],
    150: [334, 300], 185: [384, 340], 240: [459, 398],
  },
  // C — cabos sobre parede, teto ou bandeja não perfurada
  C: {
    1.5: [24, 22], 2.5: [33, 30], 4: [45, 40], 6: [58, 52],
    10: [80, 71], 16: [107, 96], 25: [138, 119], 35: [171, 147],
    50: [209, 179], 70: [269, 229], 95: [328, 278], 120: [382, 322],
    150: [441, 371], 185: [506, 424], 240: [599, 500],
  },
  // D — cabo em eletroduto enterrado no solo
  D: {
    1.5: [26, 22], 2.5: [34, 29], 4: [44, 37], 6: [56, 46],
    10: [73, 61], 16: [95, 79], 25: [121, 101], 35: [146, 122],
    50: [173, 144], 70: [213, 178], 95: [252, 211], 120: [287, 240],
    150: [324, 271], 185: [363, 304], 240: [419, 351],
  },
  // E — cabo multipolar ao ar livre (bandeja perfurada, suportes, leito)
  E: {
    1.5: [26, 23], 2.5: [36, 32], 4: [49, 42], 6: [63, 54],
    10: [86, 75], 16: [115, 100], 25: [149, 127], 35: [185, 158],
    50: [225, 192], 70: [289, 246], 95: [352, 298], 120: [410, 346],
    150: [473, 399], 185: [542, 456], 240: [641, 538],
  },
  // F — cabos unipolares justapostos ao ar livre
  F: {
    25: [161, 141], 35: [200, 176], 50: [242, 216], 70: [310, 279],
    95: [377, 342], 120: [437, 400], 150: [504, 464], 185: [575, 533],
    240: [679, 634],
  },
  // G — cabos unipolares espaçados ao ar livre
  G: {
    25: [182, 161], 35: [226, 201], 50: [275, 246], 70: [353, 318],
    95: [430, 389], 120: [500, 454], 150: [577, 527], 185: [661, 605],
    240: [781, 719],
  },
};
// Capacidade de condução para cabo de 750 V (isolação PVC, 70 °C) —
// tabelas 36 (A1 a D) e 38 (E, F e G) da NBR 5410, cobre.
const CAPACIDADE_750 = {
  A1: {
    1.5: [15.5, 14], 2.5: [21, 18.5], 4: [28, 25], 6: [36, 32],
    10: [50, 44], 16: [68, 59], 25: [89, 77], 35: [110, 96],
    50: [134, 117], 70: [171, 149], 95: [207, 180], 120: [239, 208],
    150: [275, 239], 185: [314, 272], 240: [370, 320],
  },
  A2: {
    1.5: [15, 13.5], 2.5: [20, 18], 4: [27, 24], 6: [34, 31],
    10: [46, 42], 16: [62, 56], 25: [80, 73], 35: [99, 89],
    50: [118, 108], 70: [149, 136], 95: [179, 164], 120: [206, 188],
    150: [236, 216], 185: [268, 245], 240: [315, 286],
  },
  B1: {
    1.5: [17.5, 15.5], 2.5: [24, 21], 4: [32, 28], 6: [41, 36],
    10: [57, 50], 16: [76, 68], 25: [101, 89], 35: [125, 110],
    50: [151, 134], 70: [192, 171], 95: [232, 207], 120: [269, 239],
    150: [309, 275], 185: [353, 314], 240: [415, 370],
  },
  B2: {
    1.5: [16.5, 15], 2.5: [23, 20], 4: [30, 27], 6: [38, 34],
    10: [52, 46], 16: [69, 62], 25: [90, 80], 35: [111, 99],
    50: [133, 118], 70: [168, 149], 95: [201, 179], 120: [232, 206],
    150: [258, 230], 185: [294, 262], 240: [344, 307],
  },
  C: {
    1.5: [19.5, 17.5], 2.5: [27, 24], 4: [36, 32], 6: [46, 41],
    10: [63, 57], 16: [85, 76], 25: [112, 96], 35: [138, 119],
    50: [168, 144], 70: [213, 184], 95: [258, 223], 120: [299, 259],
    150: [344, 299], 185: [392, 341], 240: [461, 403],
  },
  D: {
    1.5: [22, 18], 2.5: [29, 24], 4: [38, 31], 6: [47, 39],
    10: [63, 52], 16: [81, 67], 25: [104, 86], 35: [125, 103],
    50: [148, 122], 70: [183, 151], 95: [216, 179], 120: [246, 203],
    150: [278, 230], 185: [312, 258], 240: [361, 297],
  },
  E: {
    1.5: [22, 18.5], 2.5: [30, 25], 4: [40, 34], 6: [51, 43],
    10: [70, 60], 16: [94, 80], 25: [119, 101], 35: [148, 126],
    50: [180, 153], 70: [232, 196], 95: [282, 238], 120: [328, 276],
    150: [379, 319], 185: [434, 364], 240: [514, 430],
  },
  F: {
    25: [131, 114], 35: [162, 143], 50: [196, 174], 70: [251, 225],
    95: [304, 275], 120: [352, 321], 150: [406, 372], 185: [463, 427],
    240: [546, 507],
  },
  G: {
    25: [146, 130], 35: [181, 162], 50: [219, 197], 70: [281, 254],
    95: [341, 311], 120: [396, 362], 150: [456, 419], 185: [521, 480],
    240: [615, 569],
  },
};

// Classe de isolação do cabo escolhida no projeto
const CABOS = {
  '1kV': {
    chave: '1kV', nome: 'HEPR 1 kV', desc: 'cobre, isolação HEPR 90 °C, classe 0,6/1 kV',
    isolacao: 'HEPR', tempCondutor: 90, fatorTemp: 'epr',
    capacidade: CAPACIDADE, tabelaBase: 37, tabelaAr: 39,
  },
  '750V': {
    chave: '750V', nome: 'PVC 750 V', desc: 'cobre, isolação PVC 70 °C, classe 450/750 V',
    isolacao: 'PVC', tempCondutor: 70, fatorTemp: 'pvc',
    capacidade: CAPACIDADE_750, tabelaBase: 36, tabelaAr: 38,
  },
};
const caboDe = (chave) => CABOS[chave] || CABOS['1kV'];

const SECOES = Object.keys(CAPACIDADE.B1).map(Number).sort((a, b) => a - b);

// Fator de correção de temperatura — NBR 5410, tabela 40 (EPR/XLPE).
const FATOR_TEMP = {
  // EPR/XLPE 90 °C (cabo de 1 kV) — linha enterrada, referência 20 °C
  solo: { 10: 1.07, 15: 1.04, 20: 1.00, 25: 0.96, 30: 0.93, 35: 0.89, 40: 0.85, 45: 0.80, 50: 0.76, 55: 0.71, 60: 0.65 },
  // EPR/XLPE 90 °C — demais linhas, temperatura ambiente, referência 30 °C
  ar:   { 10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71 },
  // PVC 70 °C (cabo de 750 V) — enterrada e ao ar
  solo_pvc: { 10: 1.10, 15: 1.05, 20: 1.00, 25: 0.95, 30: 0.89, 35: 0.84, 40: 0.77, 45: 0.71, 50: 0.63, 55: 0.55, 60: 0.45 },
  ar_pvc:   { 10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50 },
};

// Tipos de infraestrutura (parâmetro do projeto)
// Métodos de referência de instalação — NBR 5410, tabela 33.
// "familia" indica como a obra é descrita no memorial (enterrada, embutida ou aparente).
const INFRAS = {
  A1: {
    chave: 'A1', metodo: 'A1', familia: 'alvenaria', fator: 'ar', tempRef: 30,
    rotulo: 'A1 · condutores em eletroduto embutido em parede isolante',
    linha: 'A1 (condutores isolados em eletroduto embutido em parede termicamente isolante)',
    desc: 'condutores isolados em eletroduto embutido em parede termicamente isolante',
  },
  A2: {
    chave: 'A2', metodo: 'A2', familia: 'alvenaria', fator: 'ar', tempRef: 30,
    rotulo: 'A2 · cabo multipolar em eletroduto embutido em parede isolante',
    linha: 'A2 (cabo multipolar em eletroduto embutido em parede termicamente isolante)',
    desc: 'cabo multipolar em eletroduto embutido em parede termicamente isolante',
  },
  B1: {
    chave: 'B1', metodo: 'B1', familia: 'alvenaria', fator: 'ar', tempRef: 30,
    rotulo: 'B1 · condutores em eletroduto em alvenaria ou sobre parede',
    linha: 'B1 (condutores isolados em eletroduto embutido em alvenaria ou sobre parede)',
    desc: 'condutores isolados em eletroduto embutido em alvenaria ou aparente sobre parede',
  },
  B2: {
    chave: 'B2', metodo: 'B2', familia: 'alvenaria', fator: 'ar', tempRef: 30,
    rotulo: 'B2 · cabo multipolar em eletroduto em alvenaria ou sobre parede',
    linha: 'B2 (cabo multipolar em eletroduto embutido em alvenaria ou sobre parede)',
    desc: 'cabo multipolar em eletroduto embutido em alvenaria ou aparente sobre parede',
  },
  C: {
    chave: 'C', metodo: 'C', familia: 'aparente', fator: 'ar', tempRef: 30,
    rotulo: 'C · cabos sobre parede, teto ou bandeja não perfurada',
    linha: 'C (cabos fixados sobre parede, teto ou em bandeja não perfurada)',
    desc: 'cabos fixados diretamente sobre parede, teto ou em bandeja não perfurada',
  },
  D: {
    chave: 'D', metodo: 'D', familia: 'solo', fator: 'solo', tempRef: 20,
    rotulo: 'D · cabo em eletroduto enterrado no solo',
    linha: 'D (cabo em eletroduto enterrado no solo)',
    desc: 'cabo em eletroduto enterrado no solo',
  },
  E: {
    chave: 'E', metodo: 'E', familia: 'aparente', fator: 'ar', tempRef: 30,
    rotulo: 'E · cabo multipolar ao ar livre (leito, bandeja perfurada)',
    linha: 'E (cabo multipolar ao ar livre, em leito, bandeja perfurada ou suportes)',
    desc: 'cabo multipolar ao ar livre, em leito, bandeja perfurada ou suportes',
  },
  F: {
    chave: 'F', metodo: 'F', familia: 'aparente', fator: 'ar', tempRef: 30,
    rotulo: 'F · cabos unipolares justapostos ao ar livre',
    linha: 'F (cabos unipolares justapostos ao ar livre)',
    desc: 'cabos unipolares justapostos ao ar livre',
  },
  G: {
    chave: 'G', metodo: 'G', familia: 'aparente', fator: 'ar', tempRef: 30,
    rotulo: 'G · cabos unipolares espaçados ao ar livre',
    linha: 'G (cabos unipolares espaçados ao ar livre)',
    desc: 'cabos unipolares espaçados ao ar livre',
  },
};

// Diâmetro externo aproximado do condutor flexível PVC 450/750 V [mm] — catálogo do fabricante.
const DIAMETRO_EXTERNO_750 = {
  1.5: 3.1, 2.5: 3.6, 4: 4.2, 6: 4.8, 10: 6.2, 16: 7.4,
  25: 9.2, 35: 10.4, 50: 12.3, 70: 14.2, 95: 16.5, 120: 18.4,
  150: 20.6, 185: 23.0, 240: 26.2,
};

// Diâmetro externo aproximado do condutor HEPR 0,6/1 kV [mm] — catálogo do fabricante.
const DIAMETRO_EXTERNO = {
  1.5: 4.0, 2.5: 4.7, 4: 5.3, 6: 6.0, 10: 7.72, 16: 8.9,
  25: 11.0, 35: 12.4, 50: 14.4, 70: 16.5, 95: 19.0, 120: 21.2,
  150: 23.6, 185: 26.4, 240: 30.0,
};

// Eletrodutos comerciais — diâmetro interno aproximado [mm]
const ELETRODUTOS = [
  { nome: '3/4"', di: 20.9 },
  { nome: '1"', di: 26.6 },
  { nome: '1.1/4"', di: 35.1 },
  { nome: '1.1/2"', di: 40.9 },
  { nome: '2"', di: 52.5 },
  { nome: '2.1/2"', di: 62.7 },
  { nome: '3"', di: 77.9 },
];

// Eletrocalhas comerciais (largura × altura) e área útil [mm²]
const ELETROCALHAS = [
  { nome: '50×50 mm', area: 2500 }, { nome: '100×50 mm', area: 5000 }, { nome: '100×100 mm', area: 10000 },
  { nome: '150×100 mm', area: 15000 }, { nome: '200×100 mm', area: 20000 }, { nome: '300×100 mm', area: 30000 },
  { nome: '400×100 mm', area: 40000 },
];

// Fator de agrupamento (NBR 5410, tabela 42) por número de circuitos no mesmo duto/calha
const AGRUPAMENTO = { 1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50 };

const DISJUNTORES = [16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125, 150, 175, 200, 225, 250];
const IDRS = [25, 40, 63, 80, 100, 125];

// DPS padrão BeGreen: sempre 1P 275 V, um por condutor vivo (qualquer tensão)
const DPS_TENSAO = { 127: 275, 220: 275, 380: 275, 440: 275 };
const DPS_KA = 45; // padrão BeGreen: 45 kA Classe II

// Potências comerciais de estação de recarga [kW]
const POTENCIAS = [3.7, 7.4, 11, 22, 30, 40, 50, 60, 80, 90, 100, 120, 150, 180, 240, 360];

// Kit de proteção (disjuntor térmico + IDR + DPS):
// obrigatório até 22 kW · opcional de 22 a 30 kW · inexistente acima de 30 kW
const KIT_OBRIGATORIO_KW = 22;
const KIT_LIMITE_KW = 30;

// Potência a partir da qual o carregador é trifásico (usa √3 no cálculo)
const TRIFASICO_KW = 11;

// Tipo de saída: AC até 22 kW; acima, DC (Modo 4)
const AC_LIMITE_KW = 22;

// Conectores disponíveis
const CONECTORES = ['Tipo 1', 'Tipo 2', 'CCS 1', 'CCS 2', 'CHAdeMO', 'GBT'];

// Fator de potência das estações de recarga (correção ativa no próprio equipamento)
const FP = 1;

// Ligação elétrica do carregador, derivada da potência e da rede disponível:
// · ≥ 11 kW → trifásico (3F+N+T), √3 no cálculo
// · rede com uma só fase (F+N+T) → monofásico na tensão da rede (127 ou 220 V)
// · rede 380 V 3F+N+T → 220 V entre fase e neutro: 1F+N+T, proteção MONOPOLAR
// · demais redes (2F+T ou 3F+N+T em 127/220 V) → 220 V entre fases: 2F+T, BIPOLAR
// DPS por ligação: 1F+N+T → 2 · 2F+T → 2 · 3F+N+T → 4
function ligacaoPonto(P, rede) {
  const tensaoRede = Number(rede.tensao) || 220;
  const config = String(rede.config || '2F+T');
  if (P >= TRIFASICO_KW) {
    // ≥ 11 kW: alimentação sempre em 380 V 3F+N+T
    return { tri: true, V: 380, fases: 3, temN: true, carregados: 3, nv: 5, polos: 'tripolar', caboPrefixo: 4, rotulo: '380 V · 3F+N+T', dpsQtd: 4, dpsDesc: 'um por fase e um no neutro' };
  }
  // Rede de uma fase: o carregador fica na própria tensão fase-neutro do local
  if (config === 'F+N+T' && tensaoRede !== 380) {
    return { tri: false, V: tensaoRede, fases: 1, temN: true, carregados: 2, nv: 3, polos: 'monopolar', caboPrefixo: 2, rotulo: `${tensaoRede} V · 1F+N+T`, dpsQtd: 2, dpsDesc: 'um na fase e um no neutro' };
  }
  // Rede 380 V 3F+N+T: 220 V entre fase e neutro
  const mono = config === '3F+N+T' && tensaoRede === 380;
  return mono
    ? { tri: false, V: 220, fases: 1, temN: true, carregados: 2, nv: 3, polos: 'monopolar', caboPrefixo: 2, rotulo: '220 V · 1F+N+T', dpsQtd: 2, dpsDesc: 'um na fase e um no neutro' }
    : { tri: false, V: 220, fases: 2, temN: false, carregados: 2, nv: 3, polos: 'bipolar', caboPrefixo: 2, rotulo: '220 V · 2F+T', dpsQtd: 2, dpsDesc: 'um por fase' };
}

// Seção do condutor de proteção (NBR 5410, tabela 58)
function terraSecao(s) {
  if (s <= 16) return s;
  if (s <= 35) return 16;
  // S/2 arredondado à seção comercial imediatamente superior
  const alvo = s / 2;
  for (const c of SECOES) if (c >= alvo - 1e-9) return c;
  return SECOES[SECOES.length - 1];
}

// Descrição do cabo no padrão BeGreen:
//   25mm(FN) + 16mm(T)  → terra com seção diferente
//   6mm(FNT) / 6mm(FT)  → todos na mesma seção (com ou sem neutro)
function descCabo(secao, lig) {
  if (!secao) return '';
  const st = terraSecao(secao);
  const fn = 'F' + (lig.temN ? 'N' : '');
  if (st === secao) return `${fmt(secao)}mm(${fn}T)`;
  return `${fmt(secao)}mm(${fn}) + ${fmt(st)}mm(T)`;
}

function fatorTemperatura(tempC, tabela, cabo) {
  if (cabo && cabo.fatorTemp === 'pvc') tabela = (tabela === 'solo' ? 'solo_pvc' : 'ar_pvc');
  const tab = FATOR_TEMP[tabela] || FATOR_TEMP.solo;
  if (!isFinite(tempC)) return 1.0;
  const chaves = Object.keys(tab).map(Number);
  let melhor = chaves[0];
  for (const k of chaves) {
    if (Math.abs(k - tempC) < Math.abs(melhor - tempC) || (Math.abs(k - tempC) === Math.abs(melhor - tempC) && k > melhor)) melhor = k;
  }
  return tab[melhor];
}

function proximoComercial(lista, valor) {
  for (const v of lista) if (v >= valor - 1e-9) return v;
  return lista[lista.length - 1];
}

// Valor comercial mais próximo de "alvo", nunca inferior a "minimo"
// (caso-base do protótipo: 40,36 A ≈ 40 A)
function comercialMaisProximo(lista, alvo, minimo) {
  const candidatos = lista.filter(v => v >= (minimo || 0) - 1e-9);
  if (!candidatos.length) return lista[lista.length - 1];
  let melhor = candidatos[0];
  for (const v of candidatos) if (Math.abs(v - alvo) < Math.abs(melhor - alvo)) melhor = v;
  return melhor;
}

// Calcula um ponto de recarga completo.
function calcularPonto(ponto, rede, infra, indice, fA, cabo) {
  cabo = caboDe(cabo && cabo.chave);
  fA = fA || 1;
  const P = Number(ponto.potencia) || 0;          // kW
  const lig = ligacaoPonto(P, rede);
  const V = lig.V;
  const L = Number(ponto.distancia) || 0;
  const temp = Number(ponto.temperatura) || infra.tempRef;

  // Corrente de projeto (√3 apenas para carregadores trifásicos, ≥ 11 kW)
  const IbCalc = P > 0 ? (lig.tri ? (P * 1000) / (V * Math.sqrt(3)) : (P * 1000) / V) : 0;
  const Ib = IbCalc;

  // Disjuntor: Ib × 1,20 → valor comercial mais próximo (nunca abaixo de Ib)
  const InBruto = Ib * 1.20;
  const disjuntorCalc = Ib > 0 ? comercialMaisProximo(DISJUNTORES, InBruto, Ib) : 0;
  const disjuntor = num(ponto.disjuntorManual) ?? disjuntorCalc;

  // Kit de proteção: obrigatório ≤ 22 kW · opcional 22–30 kW · sem kit > 30 kW
  const usaKit = P > 0
    ? (P <= KIT_OBRIGATORIO_KW ? true : (P <= KIT_LIMITE_KW ? !!ponto.incluirKit : false))
    : true;
  const kitOpcional = P > KIT_OBRIGATORIO_KW && P <= KIT_LIMITE_KW;

  // IDR (integra o kit): mesma corrente do disjuntor ou próxima acima
  const idrCalc = (usaKit && disjuntor > 0) ? proximoComercial(IDRS, disjuntor) : 0;
  const idr = usaKit ? (num(ponto.idrManual) ?? idrCalc) : 0;

  // Fator de temperatura conforme o tipo de linha (solo × ambiente)
  const fT = fatorTemperatura(temp, infra.fator, cabo);

  // Seção mínima pela capacidade de condução: Iz·fT ≥ In (≥ Ib)
  const tabelaCap = cabo.capacidade[infra.metodo] || cabo.capacidade.B1;
  let secaoCapacidade = 0;
  const alvo = Math.max(disjuntor, Ib);
  const idxCap = lig.carregados >= 3 ? 1 : 0;
  if (alvo > 0) {
    for (const s of SECOES) {
      if (s < 2.5) continue; // seção mínima de força
      if (!tabelaCap[s]) continue;
      if (tabelaCap[s][idxCap] * fT * fA >= alvo) { secaoCapacidade = s; break; }
    }
    if (!secaoCapacidade) secaoCapacidade = SECOES[SECOES.length - 1];
  }

  // Queda de tensão: fator 2 (mono/bifásico) ou √3 (trifásico ≥ 11 kW)
  const fatorQueda = lig.tri ? Math.sqrt(3) : 2;
  const quedaDe = (s) => (s > 0 && V > 0 && Ib > 0 && L > 0)
    ? (fatorQueda * 0.0224 * L * Ib) / (s * V) * 100 : 0;

  // Seção sugerida = mínima pela capacidade; ΔV excedente apenas sinaliza
  const secaoCalc = secaoCapacidade;
  const secao = num(ponto.secaoManual) ?? secaoCalc;

  const izTabela = secao && tabelaCap[secao] ? tabelaCap[secao][idxCap] : 0;
  const izCorrigida = izTabela * fT * fA;

  const quedaPct = quedaDe(secao);
  const quedaOk = quedaPct <= 2 || quedaPct === 0;
  let secaoSugeridaQueda = null;
  if (!quedaOk) {
    for (const s of SECOES) {
      if (s > secao && quedaDe(s) <= 2) { secaoSugeridaQueda = s; break; }
    }
  }

  // Ocupação do eletroduto: A = (π·De²/4)·NV ≤ 40 % da área interna
  const de = (cabo.chave === '750V' ? DIAMETRO_EXTERNO_750[secao] : DIAMETRO_EXTERNO[secao]) || 0;
  const areaOcupada = de ? (3.14 * de * de / 4) * lig.nv : 0; // π = 3,14 como exibido
  let eletrodutoCalc = null;
  for (const e of ELETRODUTOS) {
    const areaInterna = Math.PI * e.di * e.di / 4;
    if (areaOcupada > 0 && areaOcupada / areaInterna <= 0.40) { eletrodutoCalc = e; break; }
  }
  const eletroduto = ponto.eletrodutoManual || (eletrodutoCalc ? eletrodutoCalc.nome : '');
  const taxaOcupacao = (() => {
    const e = ELETRODUTOS.find(x => x.nome === eletroduto);
    if (!e || !areaOcupada) return 0;
    return areaOcupada / (Math.PI * e.di * e.di / 4) * 100;
  })();

  // DPS — padrão fixo: 45 kA Classe II, tensão pela alimentação do ponto
  const dpsTensao = 275;
  const dpsKa = DPS_KA;

  const id = 'C-EV-' + String(indice + 1).padStart(2, '0');
  const tipo = P > AC_LIMITE_KW ? 'DC' : 'AC';
  const modo = tipo === 'AC' ? 3 : 4;
  const conector = ponto.conector || '';
  const marca = (ponto.marca || '').trim();
  const modelo = (ponto.modelo || '').trim();
  const caboDesc = descCabo(secao, lig);
  const secaoTerra = secao ? terraSecao(secao) : 0;

  return {
    id, lig, cfg: lig, V, P, L, temp, fT, fA, infra, fatorQueda, izTabela, alvo,
    IbCalc, Ib, InBruto,
    disjuntor, disjuntorCalc, disjuntorManual: num(ponto.disjuntorManual) != null,
    usaKit, kitOpcional, usaIdr: usaKit,
    idr, idrCalc, idrManual: num(ponto.idrManual) != null,
    secao, secaoCalc, secaoCapacidade, secaoManual: num(ponto.secaoManual) != null,
    izCorrigida, quedaPct, quedaOk, secaoSugeridaQueda,
    de, areaOcupada, eletroduto, eletrodutoCalc: eletrodutoCalc ? eletrodutoCalc.nome : '',
    eletrodutoManual: !!ponto.eletrodutoManual, taxaOcupacao,
    dpsTensao, dpsKa,
    modelo: ponto.modelo || '', cabo: Number(ponto.cabo) || 0,
    tipo, modo, conector, marca, modelo, fp: FP,
    caboDesc, secaoTerra,
  };
}

// Ligações dos trechos de alimentação (quadro → quadro / transformador)
const LIG_TRECHO = {
  '3F+N+T': { tri: true, fases: 3, temN: true, carregados: 3, nv: 5, caboPrefixo: 4 },
  '2F+N+T': { tri: false, fases: 2, temN: true, carregados: 2, nv: 4, caboPrefixo: 3 },
  '3F+T':   { tri: true, fases: 3, temN: false, carregados: 3, nv: 4, caboPrefixo: 3 },
  '2F+T':   { tri: false, fases: 2, temN: false, carregados: 2, nv: 3, caboPrefixo: 2 },
  '1F+N+T': { tri: false, fases: 1, temN: true, carregados: 2, nv: 3, caboPrefixo: 2 },
  'F+N+T':  { tri: false, fases: 1, temN: true, carregados: 2, nv: 3, caboPrefixo: 2 },
};

// Dimensiona um trecho de alimentação (cabo + eletroduto) pela corrente In
function dimensionarTrecho(t, In, V, ligKey, infra, origemI, cabo) {
  t = t || {};
  cabo = caboDe(cabo && cabo.chave);
  const lig = LIG_TRECHO[ligKey] || LIG_TRECHO['3F+N+T'];
  const L = Number(t.L) || 0;
  const fT = fatorTemperatura(infra.tempRef, infra.fator, cabo);
  const tabelaCap = cabo.capacidade[infra.metodo] || cabo.capacidade.B1;
  const idx = lig.carregados >= 3 ? 1 : 0;
  let secaoCalc = 0;
  if (In > 0) {
    for (const s of SECOES) {
      if (s < 2.5) continue;
      if (!tabelaCap[s]) continue;
      if (tabelaCap[s][idx] * fT >= In) { secaoCalc = s; break; }
    }
    if (!secaoCalc) secaoCalc = SECOES[SECOES.length - 1];
  }
  const secao = num(t.secao) ?? secaoCalc;
  const fq = lig.tri ? Math.sqrt(3) : 2;
  const quedaPct = (secao > 0 && V > 0 && In > 0 && L > 0) ? (fq * 0.0224 * L * In) / (secao * V) * 100 : 0;
  const de = (cabo.chave === '750V' ? DIAMETRO_EXTERNO_750[secao] : DIAMETRO_EXTERNO[secao]) || 0;
  const areaOcupada = de ? (3.14 * de * de / 4) * lig.nv : 0;
  let eletrodutoCalc = '';
  for (const e of ELETRODUTOS) {
    if (areaOcupada > 0 && areaOcupada / (Math.PI * e.di * e.di / 4) <= 0.40) { eletrodutoCalc = e.nome; break; }
  }
  const eletroduto = t.eletroduto || eletrodutoCalc;
  const taxaOcupacao = (() => {
    const e = ELETRODUTOS.find(x => x.nome === eletroduto);
    if (!e || !areaOcupada) return 0;
    return areaOcupada / (Math.PI * e.di * e.di / 4) * 100;
  })();
  const izTabela = secao && tabelaCap[secao] ? tabelaCap[secao][idx] : 0;
  return {
    In, V, ligKey, lig, L, fT, infra, secao, secaoCalc, secaoManual: num(t.secao) != null, origemI: origemI || '',
    izTabela, izCorrigida: izTabela * fT, fatorQueda: fq, de, areaOcupada, taxaOcupacao,
    caboDesc: descCabo(secao, lig), secaoTerra: secao ? terraSecao(secao) : 0,
    eletroduto, eletrodutoCalc, eletrodutoManual: !!t.eletroduto,
    quedaPct, quedaOk: quedaPct <= 2 || quedaPct === 0,
  };
}

// Cálculo global do projeto
function calcularProjeto(p) {
  const rede = { tensao: p.tensao, config: p.config, ikPresumida: p.ikPresumida };
  const infra = INFRAS[p.infra] || INFRAS.B1;
  const cabo = caboDe(p.cabo1kv || p.classeCabo);
  // Forma de passagem: definida por trecho (padrão: infra do projeto)
  const infraDe = (obj) => (obj && INFRAS[obj.infra]) || infra;
  // Trecho 4 agrupado: todos os circuitos no mesmo eletroduto/eletrocalha →
  // fator de agrupamento na capacidade e duto dimensionado pela área total
  const agrupado = p.trecho4Modo === 'agrupado';
  const nCirc = (p.carregadores && p.carregadores.length) || 1;
  const fA = agrupado ? (AGRUPAMENTO[Math.min(nCirc, 9)] || 0.5) : 1;
  const pontos = (p.carregadores && p.carregadores.length ? p.carregadores : [{}])
    .map((c, i) => calcularPonto(c, rede, infraDe(c), i, fA, cabo));
  let trecho4 = null;
  if (agrupado) {
    const tipo = p.trecho4Duto === 'eletrocalha' ? 'eletrocalha' : 'eletroduto';
    const areaTotal = pontos.reduce((s, x) => s + x.areaOcupada, 0);
    let calcNome = '';
    if (tipo === 'eletroduto') {
      for (const e of ELETRODUTOS) { if (areaTotal > 0 && areaTotal / (Math.PI * e.di * e.di / 4) <= 0.40) { calcNome = e.nome; break; } }
    } else {
      for (const e of ELETROCALHAS) { if (areaTotal > 0 && areaTotal / e.area <= 0.40) { calcNome = e.nome; break; } }
    }
    const nome = p.trecho4Tamanho || calcNome;
    const area = tipo === 'eletroduto'
      ? (() => { const e = ELETRODUTOS.find(x => x.nome === nome); return e ? Math.PI * e.di * e.di / 4 : 0; })()
      : (() => { const e = ELETROCALHAS.find(x => x.nome === nome); return e ? e.area : 0; })();
    const taxa = area ? areaTotal / area * 100 : 0;
    const rotulo = nome ? (tipo === 'eletrocalha' ? 'Eletrocalha ' + nome : nome) : '';
    trecho4 = { modo: 'agrupado', tipo, nome, calcNome, manual: !!p.trecho4Tamanho, areaTotal, area, taxa, fA, n: nCirc, rotulo };
    pontos.forEach(x => {
      x.eletroduto = rotulo; x.eletrodutoCalc = calcNome; x.eletrodutoManual = !!p.trecho4Tamanho;
      x.taxaOcupacao = taxa; x.dutoCompartilhado = true;
    });
  }
  const totalKw = pontos.reduce((s, x) => s + x.P, 0);
  const totalIb = pontos.reduce((s, x) => s + x.Ib, 0);
  const geral = Number(p.disjuntorGeral) || 0;

  // Transformador na entrada (parâmetro Sim/Não). Com transformador, a
  // alimentação passa obrigatoriamente por um quadro de distribuição:
  // quadro geral → disj. alimentador → transformador → disj. geral de
  // distribuição → carregadores
  const trafo = p.transformador === 'sim'
    ? {
        kva: num(p.trafoPotencia) || 0, disjuntor: num(((p.trechos || {}).t2 || {}).I) || 0,
        primV: num(p.trafoPrimV) || 0, primLig: p.trafoPrimLig || '',
        secV: num(p.trafoSecV) || 0, secLig: p.trafoSecLig || '',
        ip: p.trafoIp || '',
      }
    : null;

  // Corrente na entrada (pior caso): sem transformador, soma das correntes dos
  // carregadores; com transformador, a corrente no primário pela potência
  // total dos carregadores: P / (V_prim × √3) no primário trifásico, P / V_prim
  // no bifásico
  let correnteEntrada = totalIb, entradaFormula = '';
  if (trafo) {
    const Vp = trafo.primV || Number(rede.tensao) || 220;
    const triP = (LIG_TRECHO[trafo.primLig] || LIG_TRECHO['3F+T']).tri;
    correnteEntrada = totalKw > 0 ? (totalKw * 1000) / (Vp * (triP ? Math.sqrt(3) : 1)) : 0;
    entradaFormula = totalKw > 0 ? `${fmt(totalKw * 1000)} / ${Vp}${triP ? ' / √3' : ''}` : '';
  }
  const participacao = geral > 0 ? correnteEntrada / geral * 100 : 0;

  // Topologia: circuitos individuais do quadro do cliente, ou
  // quadro de distribuição dedicado aos carregadores (parâmetro Sim/Não)
  const topologia = (p.quadroDistribuicao === 'sim' || trafo) ? 'quadro' : 'individual';
  // Disjuntor alimentador do quadro de distribuição: calculado para a carga
  // total (Ib somado × 1,20) ou informado pelo engenheiro
  const alimentadorCalc = topologia === 'quadro' && totalIb > 0
    ? comercialMaisProximo(DISJUNTORES, totalIb * 1.20, totalIb) : 0;
  const tp = p.trechos || {};
  // Corrente do trecho 1 (campo do trecho); vazio = calculada pela carga total
  const alimentador = topologia === 'quadro' ? (num((tp.t1 || {}).I) ?? alimentadorCalc) : 0;
  const alimentadorManual = topologia === 'quadro' && num((tp.t1 || {}).I) != null;
  if (trafo && !trafo.disjuntor) trafo.disjuntor = alimentador;
  // Quantidade de carregadores atendidos pelo quadro (pode exceder os detalhados)
  const qdQuantidade = topologia === 'quadro' ? (num(p.qdQuantidade) || pontos.length) : 0;
  // Disjuntor geral do quadro de distribuição: com transformador é o disjuntor
  // do secundário; sem transformador, informado ou igual ao alimentador
  // Disjuntor de entrada do QDA = disjuntor alimentador (mesmo valor)
  // Trecho 3 (transformador → QDA): corrente do campo do trecho; vazio =
  // P / (V × √3), com V = tensão do secundário (380 V)
  const secVTrafo = trafo ? (trafo.secV || 380) : 0;
  const I3calc = trafo && totalKw > 0 ? (totalKw * 1000) / (secVTrafo * Math.sqrt(3)) : 0;
  const I3 = trafo ? (num((tp.t3 || {}).I) ?? I3calc) : 0;
  // Disjuntor de entrada do QDA: trecho 3 com transformador, trecho 1 sem
  const qdGeral = topologia === 'quadro' ? (trafo ? I3 : alimentador) : 0;
  const qdGeralManual = false;
  // Disjuntor dedicado no quadro do cliente: separa o circuito dos carregadores
  // das demais cargas (informado ou igual ao alimentador)
  // Disjuntor dedicado no QGBT = disjuntor alimentador (mesmo valor)
  const clienteDisj = topologia === 'quadro' ? alimentador : 0;
  const clienteDisjManual = false;

  // Trechos de alimentação: 1 quadro do cliente → quadro de distribuição;
  // 2 quadro de distribuição → transformador; 3 transformador → quadro de
  // distribuição; 4 quadro de distribuição → carregadores (= circuitos)
  const trechos = {};
  if (topologia === 'quadro') {
    trechos.t1 = dimensionarTrecho(tp.t1, alimentador, Number(rede.tensao) || 220, String(rede.config), infraDe(tp.t1), alimentadorManual ? 'corrente informada' : 'carga total', cabo);
    if (trafo) {
      const primV = trafo.primV || Number(rede.tensao) || 220;
      trechos.t2 = dimensionarTrecho(tp.t2, trafo.disjuntor, primV, trafo.primLig || '2F+T', infraDe(tp.t2), num((tp.t2 || {}).I) != null ? 'corrente informada' : 'igual ao trecho 1', cabo);
      const secLig = trafo.secLig || '3F+N+T';
      trechos.t3 = dimensionarTrecho(tp.t3, I3, secVTrafo, secLig, infraDe(tp.t3),
        num((tp.t3 || {}).I) != null ? 'corrente informada' : (totalKw > 0 ? `P / (V × √3) = ${fmt(totalKw * 1000)} / (${secVTrafo} × √3)` : 'P / (V × √3)'), cabo);
    }
  }

  return { pontos, totalKw, totalIb, correnteEntrada, entradaFormula, geral, cabo, participacao, rede, infra, infraKey: (INFRAS[p.infra] || INFRAS.B1).familia, topologia, alimentador, alimentadorCalc, alimentadorManual, qdQuantidade, qdGeral, qdGeralManual, clienteDisj, clienteDisjManual, trafo, trechos, trecho4, fA };
}

function num(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(',', '.'));
  return isFinite(n) ? n : null;
}

// Formatação pt-BR
function fmt(n, casas) {
  if (n === null || n === undefined || !isFinite(n)) return '';
  if (casas === undefined) casas = (Math.round(n * 100) % 100 === 0) ? 0 : (Math.round(n * 100) % 10 === 0 ? 1 : 2);
  return n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

window.Calc = {
  calcularProjeto, calcularPonto, fmt, num, ligacaoPonto, descCabo, terraSecao,
  ELETRODUTOS, ELETROCALHAS, SECOES, DIAMETRO_EXTERNO, DPS_TENSAO, POTENCIAS, INFRAS,
  KIT_OBRIGATORIO_KW, KIT_LIMITE_KW, TRIFASICO_KW, AC_LIMITE_KW, CONECTORES, FP, CABOS,
};
