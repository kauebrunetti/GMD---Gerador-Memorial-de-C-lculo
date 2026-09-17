/* ============================================================
   diagram.js — diagrama unifilar (SVG) com simbologia padrão de
   projeto elétrico (unifilar): disjuntor = chave com × no contato
   fixo; IDR = bloco retangular "DR"; DPS = caixa com raio
   ao terra (quantidade conforme a ligação); medidor = círculo M; quadros = caixas tracejadas de
   cantos arredondados.

   Cenários:
   · individual — cada carregador tem disjuntor exclusivo no
     quadro do cliente → kit de proteção (disj. térmico + IDR +
     DPS, quando houver) → carregador;
   · quadro — um disjuntor dimensionado para a carga total no
     quadro do cliente alimenta um quadro de distribuição dos
     carregadores, de onde sai um circuito por carregador.
   ============================================================ */

(function () {
  const INK = '#1B1C1B';
  const GREEN = '#3AAA35';
  const GREEN_D = '#2E8C2A';
  const GRAY = '#8A8B83';
  const LN = '#D8DAD4';
  const LINE = `stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"`;
  const THIN = `stroke="${GRAY}" stroke-width="0.9" fill="none" stroke-dasharray="4 3"`;

  const fmt = (n, c) => window.Calc.fmt(n, c);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  function val(v, sufixo) {
    if (v === null || v === undefined || v === '' || v === 0) return { t: '[XX]' + (sufixo ? ' ' + sufixo : ''), c: GRAY };
    return { t: v + (sufixo ? ' ' + sufixo : ''), c: INK };
  }

  function label(x, y, partes, opts) {
    opts = opts || {};
    const anchor = opts.anchor || 'start';
    const size = opts.size || 6.4;
    const weight = opts.weight || 500;
    let spans = '';
    for (const p of partes) spans += `<tspan fill="${p.c}">${esc(p.t)}</tspan>`;
    return `<text x="${x}" y="${y}" font-family="Oswald,sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing=".08em" text-anchor="${anchor}" style="text-transform:uppercase">${spans}</text>`;
  }

  // ── Simbologia unifilar ───────────────────────────────────
  // Disjuntor (vertical, ocupa 18px): terminais, lâmina inclinada,
  // × no contato fixo (símbolo unifilar de disjuntor)
  function simDisjuntor(x, y) {
    const y2 = y + 18;
    return `<circle cx="${x}" cy="${y}" r="1.3" fill="${INK}"/>` +
      `<line x1="${x - 2.6}" y1="${y - 2.6}" x2="${x + 2.6}" y2="${y + 2.6}" ${LINE}/>` +
      `<line x1="${x - 2.6}" y1="${y + 2.6}" x2="${x + 2.6}" y2="${y - 2.6}" ${LINE}/>` +
      `<line x1="${x}" y1="${y2}" x2="${x - 6.5}" y2="${y + 4}" ${LINE}/>` +
      `<circle cx="${x}" cy="${y2}" r="1.3" fill="${INK}"/>`;
  }
  // IDR: bloco retangular com a sigla "DR" (unifilar simplificado), ocupa 18px
  function simIdr(x, y) {
    return `<rect x="${x - 11}" y="${y}" width="22" height="18" rx="3" fill="#fff" ${LINE}/>` +
      `<text x="${x}" y="${y + 12.2}" font-family="Oswald,sans-serif" font-size="7.5" font-weight="600" letter-spacing=".06em" text-anchor="middle" fill="${INK}">DR</text>`;
  }
  // Terra: três traços decrescentes
  function simTerra(x, y) {
    return `<line x1="${x - 6}" y1="${y}" x2="${x + 6}" y2="${y}" ${LINE}/>` +
      `<line x1="${x - 4}" y1="${y + 3}" x2="${x + 4}" y2="${y + 3}" ${LINE}/>` +
      `<line x1="${x - 2}" y1="${y + 6}" x2="${x + 2}" y2="${y + 6}" ${LINE}/>`;
  }
  // DPS em derivação: caixa com raio (descarga) e aterramento
  function simDps(x, yNo) {
    const yb = yNo + 12, h = 14;
    return `<line x1="${x}" y1="${yNo}" x2="${x}" y2="${yb}" ${LINE}/>` +
      `<rect x="${x - 6}" y="${yb}" width="12" height="${h}" rx="2" ${LINE}/>` +
      `<path d="M ${x + 2.2} ${yb + 2.2} L ${x - 1.8} ${yb + 6.6} L ${x + 1.8} ${yb + 6.6} L ${x - 2.2} ${yb + 11.4}" ${LINE} stroke-linejoin="round"/>` +
      `<line x1="${x}" y1="${yb + h}" x2="${x}" y2="${yb + h + 6}" ${LINE}/>` +
      simTerra(x, yb + h + 6);
  }
  // Transformador: dois círculos entrelaçados (símbolo unifilar), ocupa 36px
  function simTrafo(x, y) {
    return `<circle cx="${x}" cy="${y - 7}" r="11" ${LINE}/>` +
      `<circle cx="${x}" cy="${y + 7}" r="11" ${LINE}/>`;
  }
  // Medidor de energia
  function simMedidor(x, y) {
    return `<circle cx="${x}" cy="${y}" r="8" ${LINE}/>` +
      `<text x="${x}" y="${y + 2.6}" font-family="Oswald,sans-serif" font-size="7.5" font-weight="500" text-anchor="middle" fill="${INK}">kWh</text>`;
  }
  // Estação de recarga: bloco retangular com a sigla "EVSE" (mesma linguagem
  // dos blocos DR e DPS do kit de proteção), destaque verde
  function simEstacao(x, y, w, h) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#EEF6ED" stroke="${GREEN}" stroke-width="1.4"/>` +
      `<text x="${x + w / 2}" y="${y + h / 2 + 3.2}" font-family="Oswald,sans-serif" font-size="9" font-weight="600" letter-spacing=".08em" text-anchor="middle" fill="${GREEN_D}">EVSE</text>`;
  }
  // Marcas de cabo conforme o número de fases: 1F = / · 2F = // · 3F = ///
  function marcasCabo(x, y, horizontal, fases) {
    const n = Math.max(1, Math.min(3, fases || 2));
    const passo = 6;
    let s = '';
    for (let i = 0; i < n; i++) {
      const d = (i - (n - 1) / 2) * passo;
      if (horizontal) s += `<line x1="${x + d - 2.5}" y1="${y + 5}" x2="${x + d + 2.5}" y2="${y - 5}" ${LINE}/>`;
      else s += `<line x1="${x - 5}" y1="${y + d + 2}" x2="${x + 5}" y2="${y + d - 2}" ${LINE}/>`;
    }
    return s;
  }
  // Nome do cabo do projeto, definido em gerar() e usado pelos rótulos
  let nomeCabo = 'HEPR 1 kV';

  // Rótulo de um trecho de alimentação: cabo / eletroduto · comprimento
  function rotuloTrecho(tr, x, y, opts) {
    opts = opts || {};
    const l1 = tr && tr.secao ? [{ t: tr.caboDesc + ' ' + nomeCabo, c: INK }] : [{ t: '[XX] mm² ' + nomeCabo, c: GRAY }];
    const l2 = [tr && tr.eletroduto ? { t: tr.eletroduto, c: INK } : { t: '[Ø]', c: GRAY }, { t: ' · ', c: GRAY }, tr && tr.L ? { t: fmt(tr.L) + ' m', c: INK } : { t: '[XX] m', c: GRAY }];
    return label(x, y, l1, Object.assign({ size: 5.9 }, opts)) + label(x, y + 8, l2, Object.assign({ size: 5.9, weight: 400 }, opts));
  }
  // Barra de quadro (barramento)
  function barramento(x1, x2, y) {
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${INK}" stroke-width="2.6"/>`;
  }
  // Caixa tracejada de quadro — título à esquerda (dx desloca) ou à direita
  function quadroBox(x, y, w, h, titulo, opts) {
    opts = opts || {};
    const tLabel = opts.direita
      ? label(x + w - 6, y + 10, [{ t: titulo, c: GRAY }], { size: 6, weight: 500, anchor: 'end' })
      : label(x + 6 + (opts.dx || 0), y + 10, [{ t: titulo, c: GRAY }], { size: 6, weight: 500 });
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ${THIN}/>` + tLabel;
  }

  // ── Ramal de um carregador ────────────────────────────────
  // Desenha do ponto (x, yIni) até a estação. Retorna SVG.
  function ramal(pt, x, yIni, opts) {
    opts = opts || {};
    let s = '';
    const y0 = yIni;

    // Nó no barramento e identificação do circuito (à direita, acima do rótulo do disjuntor)
    s += `<circle cx="${x}" cy="${y0}" r="1.7" fill="${INK}"/>`;
    if (opts.mostrarId) s += label(x + 12, y0 + 9, [{ t: pt.id, c: GREEN_D }], { size: 6.8, weight: 600 });

    // Disjuntor exclusivo do circuito (no quadro de origem/distribuição)
    s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 12}" ${LINE}/>`;
    s += simDisjuntor(x, y0 + 12);
    s += label(x + 12, y0 + (opts.mostrarId ? 18 : 14), [val(pt.disjuntor || null, 'A'), { t: ' · C · ' + pt.lig.polos, c: INK }], { size: 6 });
    let y = y0 + 30;

    // Cabo / eletroduto (trecho até o kit ou até a estação)
    const caboY1 = y, caboY2 = y + 56, cm = (caboY1 + caboY2) / 2;
    s += `<line x1="${x}" y1="${caboY1}" x2="${x}" y2="${caboY2}" ${LINE}/>`;
    s += marcasCabo(x, cm - 3, false, pt.lig.fases);
    const caboLbl = pt.secao
      ? [{ t: pt.caboDesc + ' ' + nomeCabo, c: INK }]
      : [{ t: '[XX] mm² ' + nomeCabo, c: GRAY }];
    s += label(x + 12, cm - 3, caboLbl, { size: 5.9 });
    const infra = [];
    infra.push(pt.eletroduto ? { t: pt.eletroduto, c: INK } : { t: '[Ø]', c: GRAY });
    infra.push({ t: ' · ', c: GRAY });
    infra.push(pt.L ? { t: fmt(pt.L) + ' m', c: INK } : { t: '[XX] m', c: GRAY });
    s += label(x + 12, cm + 6, infra, { size: 5.9, weight: 400 });
    y = caboY2;

    // Kit de proteção (disj. térmico + IDR + DPS), quando houver
    if (pt.usaKit) {
      const kitY = y, kitH = 118, kitW = 156, kitX = x - 28;
      s += quadroBox(kitX, kitY, kitW, kitH, 'Kit de proteção ' + pt.id, { direita: true });
      // Disjuntor térmico
      let ky = kitY + 18;
      s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${ky}" ${LINE}/>`;
      s += simDisjuntor(x, ky);
      s += label(x + 12, ky + 12, [val(pt.disjuntor || null, 'A')], { size: 5.7 });
      ky += 18;
      // IDR
      s += `<line x1="${x}" y1="${ky}" x2="${x}" y2="${ky + 8}" ${LINE}/>`;
      ky += 8;
      s += simIdr(x, ky);
      s += label(x + 16, ky + 12, [val(pt.idr || null, 'A'), { t: ' · 30 mA · Tipo A', c: INK }], { size: 5.7 });
      ky += 18;
      // Nó e DPS em derivação, para a direita, contido no kit
      s += `<line x1="${x}" y1="${ky}" x2="${x}" y2="${ky + 10}" ${LINE}/>`;
      ky += 10;
      const dx = x + 36;
      s += `<circle cx="${x}" cy="${ky}" r="1.5" fill="${INK}"/>`;
      s += `<line x1="${x}" y1="${ky}" x2="${dx}" y2="${ky}" ${LINE}/>`;
      s += simDps(dx, ky);
      s += label(dx + 11, ky + 18, [{ t: pt.lig.dpsQtd + ' × ', c: INK }, val(pt.dpsTensao || null, 'V')], { size: 5.7 });
      s += label(dx + 11, ky + 26, [val(pt.dpsKa || null, 'kA'), { t: ' · Cl. II', c: INK }], { size: 5.4 });
      // Linha principal segue até a saída do kit
      s += `<line x1="${x}" y1="${ky}" x2="${x}" y2="${kitY + kitH}" ${LINE}/>`;
      y = kitY + kitH;
    }

    // Descida final: do kit de proteção até a estação, com o cabo do trecho
    // (mesmo cabo do circuito, marcas por fase); sem kit, descida curta
    const desce = pt.usaKit ? 46 : 14;
    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + desce}" ${LINE}/>`;
    if (pt.usaKit) {
      const ym = y + desce / 2;
      s += marcasCabo(x, ym, false, pt.lig.fases);
      s += label(x + 12, ym - 1, caboLbl, { size: 5.9 });
      s += label(x + 12, ym + 7, [pt.eletroduto ? { t: pt.eletroduto, c: INK } : { t: '[Ø]', c: GRAY }], { size: 5.9, weight: 400 });
    }
    y += desce;
    const ew = 46, eh = 24;
    s += simEstacao(x - ew / 2, y, ew, eh);
    const potLbl = pt.P ? [{ t: fmt(pt.P) + ' kW', c: GREEN_D }] : [{ t: '[XX] kW', c: GRAY }];
    s += label(x, y + eh + 11, potLbl.concat([{ t: ' · ' + pt.lig.rotulo, c: GRAY }]), { anchor: 'middle', size: 6.1 });
    // Terra da estação
    s += `<line x1="${x + ew / 2}" y1="${y + eh / 2}" x2="${x + ew / 2 + 10}" y2="${y + eh / 2}" ${LINE}/>`;
    s += `<line x1="${x + ew / 2 + 10}" y1="${y + eh / 2}" x2="${x + ew / 2 + 10}" y2="${y + eh / 2 + 8}" ${LINE}/>`;
    s += simTerra(x + ew / 2 + 10, y + eh / 2 + 8);

    return { svg: s, yFim: y + eh + 26 };
  }

  // ── Diagrama completo ─────────────────────────────────────
  function gerar(calc, docNum) {
    nomeCabo = (calc.cabo && calc.cabo.nome) || 'HEPR 1 kV';
    const pontos = calc.pontos;
    const n = Math.max(1, pontos.length);
    const multi = n > 1;
    const comQuadro = calc.topologia === 'quadro';

    const colW = 190;
    const baseX = 36;
    const primeiroX = baseX + 96;
    const W = Math.max(480, primeiroX + (n - 1) * colW + 150);

    let s = '';
    const entradaX = baseX + 14;

    // ── Entrada: rede → medidor → disjuntor geral
    s += label(entradaX - 4, 20, [val(calc.rede.tensao ? calc.rede.tensao + ' V' : null, '')], {});
    s += label(entradaX - 4, 28, [{ t: (calc.rede.config || '2F+N+T') + ' · 60 Hz', c: GRAY }], { size: 5.6, weight: 400 });
    s += `<line x1="${entradaX}" y1="32" x2="${entradaX}" y2="42" ${LINE}/>`;
    const oy = 0;
    s += simMedidor(entradaX, 50 + oy);
    s += `<line x1="${entradaX}" y1="${58 + oy}" x2="${entradaX}" y2="${66 + oy}" ${LINE}/>`;
    s += simDisjuntor(entradaX, 66 + oy);
    s += label(entradaX + 11, 74 + oy, [val(calc.geral || null, 'A')], { size: 6 });
    const busY = 96 + oy;
    s += `<line x1="${entradaX}" y1="${84 + oy}" x2="${entradaX}" y2="${busY}" ${LINE}/>`;

    let alturaMax = 0;

    if (!comQuadro) {
      // ── Cenário 1: circuitos individuais do quadro do cliente
      const busX2 = primeiroX + (n - 1) * colW + 40;
      s += barramento(entradaX, busX2, busY);
      // Caixa do quadro do cliente englobando entrada + disjuntores dos ramais
      s += quadroBox(baseX - 16, 34 + oy, W - baseX, 96, 'QGBT', { direita: true });
      pontos.forEach((pt, i) => {
        const x = primeiroX + i * colW;
        const r = ramal(pt, x, busY, { mostrarId: multi });
        s += r.svg;
        alturaMax = Math.max(alturaMax, r.yFim);
      });
    } else {
      // ── Cenário 2: quadro de distribuição dos carregadores
      const qdX = baseX - 16, qdW = W - 16 - qdX;
      const tituloQd = 'QDA';
      const busX2 = primeiroX + (n - 1) * colW + 30;
      const tre = calc.trechos || {};
      let busY2;
      if (calc.trafo) {
        // Quadro geral → [trecho 1] → quadro de distribuição (disj. alimentador)
        // → [trecho 2] → transformador → [trecho 3] → retorno ao quadro
        // (disj. geral de distribuição) → [trecho 4] → carregadores
        s += quadroBox(baseX - 16, 34, 190, 86, 'QGBT', { direita: true });
        // Disjuntor dedicado aos carregadores, no quadro do cliente
        s += `<line x1="${entradaX}" y1="${busY - 12}" x2="${entradaX}" y2="${busY}" ${LINE}/>`;
        s += simDisjuntor(entradaX, busY);
        s += label(entradaX + 11, busY + 8, [val(calc.alimentador || null, 'A')], { size: 6 });
        const distY = 170;
        s += `<line x1="${entradaX}" y1="${busY + 18}" x2="${entradaX}" y2="${distY}" ${LINE}/>`;
        s += marcasCabo(entradaX, 143, false, tre.t1 && tre.t1.lig.fases);
        s += rotuloTrecho(tre.t1, entradaX + 10, 140);
        // Parte superior do quadro: disjuntor alimentador
        s += quadroBox(qdX, distY, 252, 64, 'QDA Transformador', { direita: true });
        s += `<line x1="${entradaX}" y1="${distY}" x2="${entradaX}" y2="${distY + 16}" ${LINE}/>`;
        s += simDisjuntor(entradaX, distY + 16);
        s += label(entradaX + 11, distY + 24, [val(calc.trafo.disjuntor || null, 'A')], { size: 6 });
        const saidaY = distY + 48;
        s += `<line x1="${entradaX}" y1="${distY + 34}" x2="${entradaX}" y2="${saidaY}" ${LINE}/>`;
        // Trecho 2: saída do quadro para o transformador, à direita
        const tx = qdX + 230 + 50;
        s += `<line x1="${entradaX}" y1="${saidaY}" x2="${tx}" y2="${saidaY}" ${LINE}/>`;
        s += marcasCabo(entradaX + 118, saidaY, true, tre.t2 && tre.t2.lig.fases);
        s += rotuloTrecho(tre.t2, entradaX + 130, saidaY - 13);
        s += `<line x1="${tx}" y1="${saidaY}" x2="${tx}" y2="${saidaY + 10}" ${LINE}/>`;
        s += simTrafo(tx, saidaY + 28);
        const tr = calc.trafo;
        const tens = (tr.primV ? fmt(tr.primV) : '[XX]') + '/' + (tr.secV ? fmt(tr.secV) : '[XX]') + ' V';
        s += label(tx + 17, saidaY + 26, [val(tr.kva || null, 'kVA'), { t: ' - ', c: INK }, { t: tens, c: (tr.primV && tr.secV) ? INK : GRAY }], { size: 6.4 });
        s += label(tx + 17, saidaY + 35, [{ t: (tr.primLig || '[XX]') + ' / ' + (tr.secLig || '[XX]') + (tr.ip ? ' · ' + tr.ip : ''), c: GRAY }], { size: 5.6, weight: 400 });
        // Trecho 3: retorno do transformador ao quadro
        const retornoY = saidaY + 64;
        s += `<line x1="${tx}" y1="${saidaY + 46}" x2="${tx}" y2="${retornoY}" ${LINE}/>`;
        s += `<line x1="${tx}" y1="${retornoY}" x2="${entradaX}" y2="${retornoY}" ${LINE}/>`;
        s += marcasCabo(entradaX + 118, retornoY, true, tre.t3 && tre.t3.lig.fases);
        s += rotuloTrecho(tre.t3, entradaX + 130, retornoY - 13);
        // Retorno ao quadro: disjuntor geral de distribuição dos carregadores
        const qd2Y = retornoY + 8;
        s += quadroBox(qdX, qd2Y, qdW, 100, tituloQd, { direita: true });
        s += `<line x1="${entradaX}" y1="${retornoY}" x2="${entradaX}" y2="${qd2Y + 16}" ${LINE}/>`;
        s += simDisjuntor(entradaX, qd2Y + 16);
        s += label(entradaX + 11, qd2Y + 24, [val(calc.qdGeral ? fmt(calc.qdGeral, calc.qdGeral % 1 ? 1 : 0) : null, 'A')], { size: 6 });
        busY2 = qd2Y + 52;
        s += `<line x1="${entradaX}" y1="${qd2Y + 34}" x2="${entradaX}" y2="${busY2}" ${LINE}/>`;
      } else {
        s += quadroBox(baseX - 16, 34, 190, 86, 'QGBT', { direita: true });
        // Disjuntor dedicado aos carregadores, no quadro do cliente
        s += `<line x1="${entradaX}" y1="${busY - 12}" x2="${entradaX}" y2="${busY}" ${LINE}/>`;
        s += simDisjuntor(entradaX, busY);
        s += label(entradaX + 11, busY + 8, [val(calc.alimentador || null, 'A')], { size: 6 });
        const y = busY + 18;
        // Trecho 1: alimentador até o quadro de distribuição
        const distY = y + 52;
        s += `<line x1="${entradaX}" y1="${y}" x2="${entradaX}" y2="${distY}" ${LINE}/>`;
        s += marcasCabo(entradaX, (y + distY) / 2 + 3, false, tre.t1 && tre.t1.lig.fases);
        s += rotuloTrecho(tre.t1, entradaX + 10, (y + distY) / 2);
        // Quadro de distribuição dos carregadores: disjuntor geral + barramento +
        // disjuntor de cada circuito
        s += quadroBox(qdX, distY, qdW, 104, tituloQd, { direita: true });
        s += `<line x1="${entradaX}" y1="${distY}" x2="${entradaX}" y2="${distY + 18}" ${LINE}/>`;
        s += simDisjuntor(entradaX, distY + 18);
        s += label(entradaX + 11, distY + 26, [val(calc.qdGeral ? fmt(calc.qdGeral, calc.qdGeral % 1 ? 1 : 0) : null, 'A')], { size: 6 });
        busY2 = distY + 60;
        s += `<line x1="${entradaX}" y1="${distY + 36}" x2="${entradaX}" y2="${busY2}" ${LINE}/>`;
      }
      s += barramento(entradaX, busX2, busY2);
      pontos.forEach((pt, i) => {
        const x = primeiroX + i * colW;
        const r = ramal(pt, x, busY2, { mostrarId: true });
        s += r.svg;
        alturaMax = Math.max(alturaMax, r.yFim);
      });
    }

    const H = alturaMax + 26;
    const titulo = 'Diagrama unifilar · ' + (docNum && docNum.indexOf('XX') === -1 ? docNum.replace('BG-ME', 'BG-DU') : 'BG-DU-XX-XXXX');
    s += label(W - 12, H - 10, [{ t: titulo, c: GRAY }], { anchor: 'end', size: 6 });

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:188mm;display:block;background:#fff">` +
      `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="8" fill="none" stroke="${LN}" stroke-width="1"/>` + s + `</svg>`;
  }

  window.Diagrama = { gerar };
})();
