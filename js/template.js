/* ============================================================
   template.js — template do Memorial Descritivo BeGreen.
   Reprodução fiel do protótipo hi-fi (estilos inline), com os
   placeholders [XX] substituídos pelos dados do formulário e
   pelos cálculos (calc.js). As seções são montadas em lista e
   numeradas dinamicamente (seções condicionais entram/saem sem
   quebrar numeração nem referências cruzadas).
   ============================================================ */

(function () {
  const fmt = (n, c) => window.Calc.fmt(n, c);

  // ── Cores / tokens ─────────────────────────────────────────
  const INK = '#1B1C1B', TX1 = '#2E302D', TX2 = '#3A3C39', TX3 = '#4A4C48';
  const G1 = '#6E736D', G2 = '#8A8B83', G3 = '#A9ABA4';
  const LN1 = '#D8DAD4', LN2 = '#E4E6E1', BG1 = '#F2F3F0', BG2 = '#F7F8F5';
  const GREEN = '#3AAA35', GREEN_D = '#2E8C2A', GREEN_L = '#8CD07F', RESUMO_BG = '#EEF6ED';
  const OSW = 'Oswald,sans-serif', MONO = "'IBM Plex Mono',monospace";
  const R = 'border-radius:8px'; // quadros com cantos arredondados

  // ── Utilidades ─────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function ph(v, placeholder) {
    const vazio = v === null || v === undefined || v === '' || v === 0;
    return vazio ? `<span style="color:${G2}">${esc(placeholder || '[XX]')}</span>` : esc(v);
  }
  function phn(n, sufixo, placeholder) {
    if (!n || !isFinite(n)) return `<span style="color:${G2}">${esc(placeholder || '[XX]')}${sufixo ? ' ' + sufixo : ''}</span>`;
    return esc(fmt(n)) + (sufixo ? ' ' + sufixo : '');
  }
  function manual(html, isManual) {
    return isManual ? `<span title="valor manual — sobreposto pelo engenheiro" style="border-bottom:1px dashed ${GREEN_D}">${html}</span>` : html;
  }
  function dataBr(iso, placeholder) {
    if (!iso) return `<span style="color:${G2}">${placeholder || '[XX/XX/20XX]'}</span>`;
    const [a, m, d] = String(iso).split('-');
    if (!d) return esc(iso);
    return `${d}/${m}/${a}`;
  }
  function dataBrTxt(iso) {
    if (!iso) return '[XX/XX/20XX]';
    const [a, m, d] = String(iso).split('-');
    return d ? `${d}/${m}/${a}` : iso;
  }

  // ── Fragmentos de estilo repetidos ─────────────────────────
  const TH = `text-align:left;padding:7px 9px;font-family:${OSW};font-weight:500;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase`;
  const TH8 = `text-align:left;padding:7px 8px;font-family:${OSW};font-weight:500;font-size:8px;letter-spacing:.12em;text-transform:uppercase`;
  const TD = `padding:7px 9px;border-bottom:1px solid ${LN2}`;
  const TD8 = `padding:6px 8px;border-bottom:1px solid ${LN2}`;
  const KV = `padding:6px 0;border-bottom:1px solid ${LN2}`;
  const P11 = `font-size:11px;line-height:1.7;color:${TX1};margin:0 0 11px`;
  const KICK = `font-family:${OSW};font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:500`;

  function secHeader(num, titulo, chave) {
    return `<div${chave ? ` data-sec-key="${chave}"` : ''} style="display:flex;align-items:baseline;gap:14px;border-top:3px solid ${INK};padding-top:10px;margin-bottom:14px">
      <div style="font-family:${OSW};font-weight:600;font-size:30px;line-height:1;color:${GREEN}">${num}</div>
      <h2 style="font-family:${OSW};font-weight:600;font-size:22px;line-height:1.1;text-transform:uppercase;color:${INK};margin:0;letter-spacing:.01em">${titulo}</h2>
    </div>`;
  }
  function h3(t) {
    return `<h3 style="font-family:${OSW};font-weight:500;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${INK};margin:0 0 9px;padding-bottom:5px;border-bottom:1px solid ${LN1}">${t}</h3>`;
  }
  function emResumo(html) {
    return `<div class="bg-keep" style="display:flex;gap:12px;background:${RESUMO_BG};border-left:4px solid ${GREEN};${R};padding:11px 14px;margin:0 0 14px"><div style="font-family:${OSW};font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:${GREEN_D};font-weight:600;white-space:nowrap;padding-top:1px">Em resumo</div><p style="font-size:10px;line-height:1.6;color:${TX1};margin:0">${html}</p></div>`;
  }
  function conclusao(html, mb) {
    return `<div class="bg-keep" style="border-top:2px solid ${GREEN};background:${BG2};${R};padding:11px 14px;margin-bottom:${mb || 0}px"><div style="${KICK};color:${GREEN}">Conclusão</div><p style="font-size:10.5px;line-height:1.6;color:${INK};margin:4px 0 0;font-weight:500">${html}</p></div>`;
  }
  function formula(html, nota, mb) {
    if (!nota) return `<div class="bg-keep" style="background:${BG1};${R};padding:14px 16px;margin-bottom:${mb || 12}px;text-align:center;font-family:${MONO};font-size:12.5px;color:${INK}">${html}</div>`;
    return `<div class="bg-keep" style="background:${BG1};${R};padding:14px 16px;margin-bottom:${mb || 10}px;font-family:${MONO};font-size:12px;color:${INK}">
      <div style="text-align:center;margin-bottom:9px">${html}</div>
      <div style="font-family:Montserrat,sans-serif;font-size:9px;color:${G1};line-height:1.7">${nota}</div></div>`;
  }
  function trKV(k, v, wid) {
    return `<tr><td style="${KV};color:${G1}${wid ? ';width:' + wid : ''}">${k}</td><td style="${KV};color:${INK};font-weight:500">${v}</td></tr>`;
  }

  // ══════════════════════════════════════════════════════════
  // Folhas do documento — p = formulário · c = Calc.calcularProjeto(p)
  // extras = { } (reservado)
  // ══════════════════════════════════════════════════════════
  function folhas(p, c, extras) {
    extras = extras || {};
    const pts = c.pontos;
    const pt = pts[0];
    const n = pts.length;
    const multi = n > 1;
    const infra = c.infra;
    const cliente = ph(p.cliente, '[Nome do cliente ou condomínio]');
    const endereco = ph(p.endereco, '[Rua, número, complemento — Cidade/UF]');
    const docNum = ph(p.docNum, 'BG-ME-XX-XXXX');
    const rev = p.revisao || '00';
    const tensaoCfg = `${c.rede.tensao || 220} V · ${p.config || '2F+N+T'} · 60 Hz`;
    const semAterr = p.aterramentoExistente === 'nao';
    const aterr = semAterr ? 'TT (eletrodo de aterramento próprio, executado pela BeGreen)' : esc(p.aterramento || 'TN-S');
    const naoIndica = p.alterarPadrao !== 'sim';
    const algumKit = pts.some(x => x.usaKit);
    const analiseFeita = p.analiseDemanda === 'sim';
    const temDados = pt.P > 0 && pt.V > 0;

    // Trechos dimensionados, na ordem do circuito: QGBT → QDA Transformador →
    // Transformador → QDA → kit de proteção (se houver) → estação de recarga. Sem QDA ou
    // transformador, só os trechos remanescentes entram.
    const origemCirc = c.topologia === 'quadro' ? 'QDA' : 'QGBT';
    const trechosDim = [];
    if (c.trechos && c.trechos.t1) trechosDim.push({ nome: 'QGBT – ' + (c.trafo ? 'QDA Transformador' : 'QDA'), d: c.trechos.t1 });
    if (c.trechos && c.trechos.t2) trechosDim.push({ nome: 'QDA Transformador – Transformador', d: c.trechos.t2 });
    if (c.trechos && c.trechos.t3) trechosDim.push({ nome: 'Transformador – QDA', d: c.trechos.t3 });
    pts.forEach(x => {
      if (x.usaKit) trechosDim.push({ nome: `${origemCirc} – Kit de proteção (${x.id})`, d: x });
      trechosDim.push({ nome: `${x.usaKit ? 'Kit de proteção' : origemCirc} – Estação de recarga (${x.id})`, d: x });
    });
    const listaTrechos = (fn) => trechosDim.map(tr => `<strong>${tr.nome}</strong>: ${fn(tr.d)}`).join(' · ');
    const listaCabos = listaTrechos(d => d.caboDesc || '[XX]');
    const listaTerra = listaTrechos(d => d.secaoTerra ? fmt(d.secaoTerra) + ' mm²' : '[XX]');
    const listaDutos = listaTrechos(d => d.eletroduto ? esc(d.eletroduto) : '[Ø]');
    const listaQueda = listaTrechos(d => d.quedaPct ? fmt(d.quedaPct, 2) + ' %' + (d.quedaOk ? '' : ' (acima de 2 %)') : '[XX]');
    const algumaQuedaRuim = trechosDim.some(tr => !tr.d.quedaOk);
    const infrasUsadas = Array.from(new Set(trechosDim.map(tr => tr.d.infra.chave)));

    // Lista para a demonstração de cálculo: um item por trecho físico
    // (o circuito da estação de recarga aparece uma vez, passando pelo kit quando houver)
    const trechosCalc = trechosDim.filter(tr => !/^Kit de proteção – Estação de recarga/.test(tr.nome)).map(tr => {
      if (/Kit de proteção \(/.test(tr.nome)) {
        return { nome: tr.nome.replace('Kit de proteção (', 'Kit de proteção – Estação de recarga ('), d: tr.d, circuito: true };
      }
      return { nome: tr.nome, d: tr.d, circuito: !!tr.d.id };
    });
    // Numeração sequencial: trechos de alimentação e, por último, o trecho das estações de recarga
    let nTrecho = 0;
    const nCarreg = trechosCalc.filter(tr => !tr.circuito).length + 1;
    trechosCalc.forEach(tr => { tr.num = tr.circuito ? nCarreg : ++nTrecho; tr.titulo = `Trecho ${tr.num} · ${tr.nome}`; });
    // Proteções por trecho: disjuntor (e DPS) nos quadros e disjuntor + kit nos circuitos
    const polosDe = (lig) => lig.fases === 3 ? 'tripolar' : (lig.fases === 2 ? 'bipolar' : 'monopolar');
    const dpsQuadro = (lig) => `${lig.fases + (lig.temN ? 1 : 0)} × 1P 275 V / 45 kA · Cl. II`;
    const fmtI = (I) => I ? fmt(I, I % 1 ? 1 : 0) + ' A' : '[XX] A';
    const linhasProt = [];
    const tr1 = c.trechos && c.trechos.t1, tr2 = c.trechos && c.trechos.t2, tr3 = c.trechos && c.trechos.t3;
    if (tr1) linhasProt.push(['Trecho 1 · QGBT (origem)', 'Disjuntor dedicado às estações de recarga', `${fmtI(tr1.In)} · C · ${polosDe(tr1.lig)}`, '—', '—']);
    if (tr2) linhasProt.push(['Trecho 2 · QDA Transformador', 'Disjuntor térmico e DPS do quadro', `${fmtI(tr2.In)} · C · ${polosDe(tr2.lig)}`, '—', dpsQuadro(tr2.lig)]);
    if (tr3) linhasProt.push(['Trecho 3 · QDA (entrada)', 'Disjuntor de entrada e DPS do quadro', `${fmtI(tr3.In)} · C · ${polosDe(tr3.lig)}`, '—', dpsQuadro(tr3.lig)]);
    if (tr1 && !tr3) linhasProt.push(['Trecho 1 · QDA (entrada)', 'Disjuntor de entrada e DPS do quadro', `${fmtI(c.qdGeral)} · C · ${polosDe(tr1.lig)}`, '—', dpsQuadro(tr1.lig)]);
    pts.forEach(x => linhasProt.push([
      `Trecho ${nCarreg} · ${x.id}`,
      x.usaKit ? 'Disjuntor do circuito e kit de proteção' : 'Disjuntor do circuito (demais proteções integradas à estação)',
      x.disjuntor ? `${fmt(x.disjuntor)} A · C · ${x.lig.polos}` : '[XX] A',
      x.usaKit ? (x.idr ? `${fmt(x.idr)} A · 30 mA · Tipo A` : '[XX]') : 'integrado à estação',
      x.usaKit ? `${x.lig.dpsQtd} × 1P 275 V / ${fmt(x.dpsKa)} kA · Cl. II` : 'integrado à estação',
    ]));
    const tabelaProt = `<table style="width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:18px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH8}">Trecho</th><th style="${TH8}">Disjuntor</th><th style="${TH8}">IDR</th><th style="${TH8}">DPS</th></tr></thead>
    <tbody>${linhasProt.map((l, i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD8};font-weight:600;color:${INK}">${l[0]}</td>${l.slice(2).map(v => `<td style="${TD8};color:${TX1}">${v}</td>`).join('')}</tr>`).join('\n    ')}</tbody>
  </table>`;
    const passagemTxt = trechosCalc.map(tr => `Trecho ${tr.num}${tr.circuito ? ' (' + tr.d.id + ')' : ''}: ${tr.d.infra.rotulo.toLowerCase()}`).join(' · ');
    const ok = (b) => b ? '<span style="color:' + GREEN_D + '">✓</span>' : '<span style="color:#C0392B">✗</span>';
    const cartaoTrecho = (tr) => {
      const d = tr.d;
      const In = tr.circuito ? d.alvo : d.In;
      const Iq = tr.circuito ? d.Ib : d.In;
      const ligTxt = tr.circuito ? d.lig.rotulo : `${d.ligKey} · ${d.V} V`;
      const fq = d.fatorQueda && d.fatorQueda > 1.8 ? '2' : '√3';
      const L1 = `I = ${tr.circuito ? (d.Ib ? `P / V = ${fmt(d.P * 1000)} / ${d.lig.tri ? '(' + d.V + ' × √3)' : d.V} = ${fmt(d.Ib, 1)} A · disjuntor ${fmt(In)} A` : '[XX] A') : (d.origemI ? d.origemI + ' = ' : '') + (In ? fmt(In, In % 1 ? 1 : 0) + ' A' : '[XX] A')} · ${ligTxt} · L = ${d.L ? fmt(d.L) + ' m' : '[XX] m'}`;
      const L2 = d.secao
        ? `Seção (${d.infra.rotulo.toLowerCase()}, método ${d.infra.metodo}): I<sub>z</sub>(${fmt(d.secao)} mm²) × F<sub>T</sub>${d.fA && d.fA < 1 ? ' × F<sub>A</sub>' : ''} = ${fmt(d.izTabela)} × ${fmt(d.fT, 2)}${d.fA && d.fA < 1 ? ' × ' + fmt(d.fA, 2) : ''} = ${fmt(d.izCorrigida, 1)} A ≥ ${In ? fmt(In, In % 1 ? 1 : 0) : '[XX]'} A → ${d.caboDesc}`
        : 'Seção: aguardando corrente do trecho';
      const L3 = d.quedaPct
        ? `Queda de tensão: ΔV = (${fq} × 0,0224 × ${fmt(d.L)} × ${fmt(Iq, Iq % 1 ? 1 : 0)}) / (${fmt(d.secao)} × ${d.V}) × 100 = ${fmt(d.quedaPct, 2)} % ${d.quedaOk ? '≤' : '>'} 2 %`
        : 'Queda de tensão: aguardando comprimento do trecho';
      const L4 = d.areaOcupada
        ? (d.dutoCompartilhado && c.trecho4
          ? `Eletroduto: A = (3,14 × ${fmt(d.de, 2)}² / 4) × ${d.lig.nv} = ${fmt(d.areaOcupada, 1)} mm² · circuitos agrupados (${c.trecho4.n}): A total = ${fmt(c.trecho4.areaTotal, 1)} mm² → ${c.trecho4.rotulo ? esc(c.trecho4.rotulo) : '[Ø]'}${c.trecho4.taxa ? ` (ocupação ${fmt(c.trecho4.taxa, 1)} % ${c.trecho4.taxa <= 40 ? '≤' : '>'} 40 %)` : ''}`
          : `Eletroduto: A = (3,14 × ${fmt(d.de, 2)}² / 4) × ${d.lig.nv} = ${fmt(d.areaOcupada, 1)} mm² → ${d.eletroduto ? esc(d.eletroduto) : '[Ø]'}${d.taxaOcupacao ? ` (ocupação ${fmt(d.taxaOcupacao, 1)} % ${d.taxaOcupacao <= 40 ? '≤' : '>'} 40 %)` : ''}`)
        : 'Eletroduto: aguardando seção';
      return `<div class="bg-keep" style="border:1px solid ${LN1};${R};padding:9px 12px;margin-bottom:8px">
        <div style="${KICK};color:${GREEN_D};margin-bottom:4px">${tr.titulo}</div>
        <div style="font-family:${MONO};font-size:9px;line-height:1.75;color:${INK}">${L1}<br />${L2}<br />${L3}<br />${L4}</div>
      </div>`;
    };
    const tabelaConclusao = `<table style="width:100%;border-collapse:collapse;font-size:9.5px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH8}">Trecho</th><th style="${TH8}">Passagem</th><th style="${TH8}">Corrente</th><th style="${TH8}">Cabo (HEPR 1 kV)</th><th style="${TH8}">Terra</th><th style="${TH8}">Eletroduto</th><th style="${TH8}">L</th><th style="${TH8}">ΔV</th><th style="${TH8}">Situação</th></tr></thead>
    <tbody>${trechosCalc.map((tr, i) => { const d = tr.d; const In = tr.circuito ? d.alvo : d.In;
      const motivos = [];
      if (d.secao && In && d.izCorrigida < In) motivos.push('capacidade de condução');
      if (!d.quedaOk) motivos.push('ΔV ' + fmt(d.quedaPct, 2) + ' %');
      if (d.taxaOcupacao > 40) motivos.push('ocupação ' + fmt(d.taxaOcupacao, 1) + ' % com ' + d.lig.nv + ' condutores');
      const okTudo = motivos.length === 0;
      return `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD8};font-weight:600;color:${INK}">${tr.titulo}</td><td style="${TD8};color:${TX1}">${d.infra.rotulo}</td><td style="${TD8};color:${TX1}">${In ? fmt(In, In % 1 ? 1 : 0) + ' A' : `<span style="color:${G2}">[XX]</span>`}</td><td style="${TD8};color:${TX1}">${d.caboDesc ? manual(d.caboDesc, d.secaoManual) : `<span style="color:${G2}">[XX]</span>`}</td><td style="${TD8};color:${TX1}">${d.secaoTerra ? fmt(d.secaoTerra) + ' mm²' : `<span style="color:${G2}">[XX]</span>`}</td><td style="${TD8};color:${TX1}">${d.eletroduto ? manual(esc(d.eletroduto), d.eletrodutoManual) : `<span style="color:${G2}">[Ø]</span>`}</td><td style="${TD8};color:${TX1}">${d.L ? fmt(d.L) + ' m' : `<span style="color:${G2}">[XX]</span>`}</td><td style="${TD8};color:${TX1}${d.quedaOk ? '' : ';color:#C0392B;font-weight:600'}">${d.quedaPct ? fmt(d.quedaPct, 2) + ' %' : `<span style="color:${G2}">[XX]</span>`}</td><td style="${TD8};color:${TX1}">${d.secao && d.quedaPct ? (okTudo ? `<span style="color:${GREEN_D};font-weight:600">Atende</span>` : `<span style="color:#C0392B;font-weight:600">Reavaliar</span><br /><span style="font-size:8px;color:#8a2d26">${motivos.join(' · ')}</span>`) : `<span style="color:${G2}">Pendente</span>`}</td></tr>`; }).join('\n      ')}</tbody>
  </table>`;
    const temFotos = p.fotos && p.fotos.length;

    // ── Numeração dinâmica das seções ────────────────────────
    const ordem = [
      ['intro', 'Introdução e objeto'],
      ['normas', 'Normas e referências técnicas'],
      ['descricao', 'Descrição do sistema'],
      ['criterios', 'Critérios de dimensionamento'],
      ['condutores', 'Dimensionamento dos condutores'],
      ['eletrodutos', 'Eletrodutos e infraestrutura civil'],
      ['protecao', 'Dispositivos de proteção'],
      ['memoria', 'Memória de cálculo complementar'],
      ['aterramento', 'Aterramento e equipotencialização'],
    ];
    if (analiseFeita) ordem.push(['multiponto', 'Expansão para múltiplos pontos']);
    ordem.push(
      ['sinalizacao', 'Sinalização e Bombeiros'],
      ['diagrama', 'Diagrama unifilar'],
      ['observacoes', 'Observações finais e limites'],
      ['conclusao', 'Conclusão'],
      ['art', 'Responsabilidade técnica e ART'],
      ['glossario', 'Glossário'],
    );
    const NUM = {};
    ordem.forEach(([k], i) => { NUM[k] = String(i + 1).padStart(2, '0'); });
    const TIT = {};
    ordem.forEach(([k, t]) => { TIT[k] = t; });

    const out = [];

    // ══ CAPA ══
    out.push(`<div style="min-height:238mm;display:flex;flex-direction:column;font-family:Montserrat,sans-serif">
  <img src="assets/begreen-logo-dark.png" alt="BeGreen" style="height:34px;width:auto;display:block;align-self:flex-start" />
  <div style="height:44mm"></div>
  <div style="font-family:${OSW};font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:${GREEN};font-weight:500">Documento Técnico</div>
  <h1 style="font-family:${OSW};font-weight:600;font-size:46px;line-height:1.02;letter-spacing:-0.005em;text-transform:uppercase;color:${INK};margin:10px 0 0">Memorial<br />Descritivo</h1>
  <div style="width:64px;height:4px;background:${GREEN};margin:18px 0 16px"></div>
  <p style="font-size:13.5px;line-height:1.5;color:${TX3};max-width:118mm;margin:0;font-weight:400;text-wrap:pretty">Dimensionamento da infraestrutura elétrica para instalação de estação de recarga de veículos elétricos, em conformidade com a ABNT NBR 5410 e a ABNT NBR 17019.</p>
  <div style="flex:1;min-height:22mm"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid ${INK}">
    ${capaMeta('Cliente / Contratante', cliente, 0)}
    ${capaMeta('Nº do documento', docNum, 1)}
    ${capaMeta('Endereço da obra', endereco, 0)}
    ${capaMeta('Revisão / Data', `Rev. ${esc(rev)} · ${dataBr(p.dataRevisao)}`, 1)}
    ${capaMeta('Responsável Técnico', 'Eng. Kauê B. Angeli · CREA 5070656487', 0, true)}
    ${capaMeta('Objeto', `Estação de recarga ${phn(c.totalKw, 'kW')} · ${phn(n && c.totalKw ? n : 0, '')} ponto(s)`, 1, true)}
  </div>
  <div style="margin-top:12px;font-size:8px;line-height:1.5;color:${G2};letter-spacing:.02em">Documento de propriedade da BeGreen, emitido exclusivamente para o cliente identificado acima. Sua reprodução parcial, alteração ou uso para outra finalidade depende de autorização formal. Processos certificados ISO 9001.</div>
</div>`);

    function capaMeta(k, v, right, last) {
      const bordas = `border-bottom:1px solid ${last ? INK : LN1}` + (right ? `;border-left:1px solid ${LN1}` : '');
      const pad = right ? 'padding:11px 0 11px 14px' : 'padding:11px 14px 11px 0';
      return `<div style="${pad};${bordas}">
      <div style="font-family:${OSW};font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:${G2}">${k}</div>
      <div style="font-size:12px;font-weight:600;color:${INK};margin-top:3px">${v}</div></div>`;
    }

    // ══ CONTROLE DO DOCUMENTO ══
    // Histórico de revisões: as anteriores (guardadas ao emitir nova revisão) + a atual
    const revLinhas = (p.historicoRevisoes || []).map(h => ({ rev: h.revisao, data: h.dataRevisao, desc: h.descricao || (h.revisao === '00' ? 'Emissão inicial' : 'Revisão do documento') }));
    revLinhas.push({ rev, data: p.dataRevisao, desc: (p.descricaoRevisao && p.descricaoRevisao.trim()) || (rev === '00' ? 'Emissão inicial' : 'Revisão do documento') });
    const revRows = revLinhas.map(l => `<tr><td style="${TD}">${esc(l.rev)}</td><td style="${TD}">${dataBr(l.data)}</td><td style="${TD}">${esc(l.desc)}</td><td style="${TD}">Eng. Kauê B. Angeli</td><td style="${TD}">BeGreen Mobilidade Elétrica</td></tr>`).join('')
      + Array.from({ length: Math.max(0, 3 - revLinhas.length) }, (_, i) => {
        const r = String(Number(rev) + i + 1).padStart(2, '0');
        return `<tr><td style="${TD};color:${G3}">${r}</td><td style="${TD};color:${G3}">—</td><td style="${TD};color:${G3}">—</td><td style="${TD};color:${G3}">—</td><td style="${TD};color:${G3}">—</td></tr>`;
      }).join('');

    const idxLinha = (num, t, chave) => `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;border-bottom:1px dotted ${LN1}"><span><strong style="font-family:${OSW};font-weight:500;color:${GREEN};margin-right:7px">${num}</strong>${t}</span><span data-idx-pag="${chave}" style="font-family:${OSW};font-size:9.5px;color:${G1};min-width:14px;text-align:right">00</span></div>`;

    out.push(`<div style="font-family:Montserrat,sans-serif">
  <div style="font-family:${OSW};font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:${GREEN};font-weight:500">Controle do documento</div>
  <h2 style="font-family:${OSW};font-weight:600;font-size:22px;text-transform:uppercase;color:${INK};margin:6px 0 14px;letter-spacing:.01em">Revisões e aprovações</h2>
  <table style="width:100%;border-collapse:collapse;font-size:9.5px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH}">Rev.</th><th style="${TH}">Data</th><th style="${TH}">Descrição da alteração</th><th style="${TH}">Elaborado</th><th style="${TH}">Aprovado</th></tr></thead>
    <tbody>${revRows}</tbody>
  </table>
  <h2 style="font-family:${OSW};font-weight:600;font-size:22px;text-transform:uppercase;color:${INK};margin:26px 0 14px;letter-spacing:.01em">Índice</h2>
  <div style="font-size:10px;line-height:1.9;color:${TX2};margin-bottom:2px">${idxLinha('—', 'Resumo do projeto · leitura rápida para o cliente', 'resumo')}</div>
  <div style="column-count:2;column-gap:12mm;font-size:10px;line-height:1.9;color:${TX2}">
    ${ordem.map(([k, t]) => idxLinha(NUM[k], t, k)).join('\n    ')}${(p.fotos && p.fotos.length) ? idxLinha('A', 'Anexo fotográfico', 'anexo') : ''}
  </div>
</div>`);

    // ══ RESUMO DO PROJETO ══
    const temSolo = pts.some(x => x.infra && x.infra.chave === 'solo') || ['t1', 't2', 't3'].some(k => c.trechos && c.trechos[k] && c.trechos[k].infra && c.trechos[k].infra.chave === 'solo');
    const providencias = [
      'Aprovar este memorial e assinar o contrato de execução.',
      ...(naoIndica ? [] : [`Solicitar à concessionária a adequação do padrão de entrada indicada na seção ${NUM.conclusao}.`]),
      ...(temSolo ? ['Definir, no contrato, quem executa a abertura e a recomposição do piso no trecho enterrado.'] : []),
      ...(semAterr ? ['Liberar o local para a execução do eletrodo de aterramento pela BeGreen.'] : []),
      ...(multi ? ['Definir com o condomínio as vagas que receberão os pontos de recarga e a sinalização.'] : []),
      'Disponibilizar ponto de internet (Wi-Fi ou cabo) próximo às estações para ativação e monitoramento.',
      'Garantir acesso ao QGBT, à garagem e às vagas na data combinada para a obra.',
    ];
    const barras = (() => {
      const linhas = [];
      linhas.push(`<div><div style="display:flex;justify-content:space-between;font-size:8px;color:#C9CAC4;margin-bottom:3px"><span>Entrada de energia existente</span><span style="font-family:${OSW}">${phn(c.geral, 'A')}</span></div><div style="height:6px;border-radius:3px;background:${TX2}"><div style="height:6px;border-radius:3px;width:100%;background:${G1}"></div></div></div>`);
      const itens = c.trafo ? [{ Ib: c.correnteEntrada, nome: 'Corrente na entrada do transformador (pior caso)' }] : pts.map(x => ({ Ib: x.Ib, nome: multi ? `Consumo máximo · ${x.id}` : 'Consumo máximo da estação de recarga' }));
      itens.forEach((x) => {
        const w = c.geral > 0 && x.Ib > 0 ? Math.min(100, x.Ib / c.geral * 100) : 40;
        const nome = x.nome;
        linhas.push(`<div><div style="display:flex;justify-content:space-between;font-size:8px;color:#C9CAC4;margin-bottom:3px"><span>${nome}</span><span style="font-family:${OSW};color:${GREEN_L}">${x.Ib ? fmt(x.Ib, 1) + ' A' : phn(0, 'A')}</span></div><div style="height:6px;border-radius:3px;background:${TX2}"><div style="height:6px;border-radius:3px;width:${fmt(w, 1).replace(',', '.')}%;background:${GREEN}"></div></div></div>`);
      });
      return linhas.join('\n        ');
    })();

    const conectoresTxt = Array.from(new Set(pts.map(x => x.conector).filter(Boolean))).join(' / ');
    const temAC = pts.some(x => x.tipo === 'AC');
    const temDC = pts.some(x => x.P > 0 && x.tipo === 'DC');
    const temIdrResumo = pts.some(x => x.P > 0 ? x.P <= window.Calc.AC_LIMITE_KW : true);
    const cardSpec = (v, t, d) => `<div style="background:#fff;padding:12px 13px;border-top:2px solid ${GREEN}"><div style="font-family:${OSW};font-size:21px;font-weight:500;color:${INK};line-height:1">${v}</div><div style="font-family:${OSW};font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:${GREEN};margin-top:4px">${t}</div><div style="font-size:8.5px;color:${G1};line-height:1.5;margin-top:3px">${d}</div></div>`;

    out.push(`<div style="font-family:Montserrat,sans-serif">
  <div data-sec-key="resumo" style="border-top:3px solid ${GREEN};padding-top:10px;margin-bottom:6px">
    <div style="font-family:${OSW};font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:${GREEN};font-weight:500">Leitura rápida para o cliente</div>
    <h2 style="font-family:${OSW};font-weight:600;font-size:26px;text-transform:uppercase;color:${INK};margin:4px 0 0;letter-spacing:.01em">Resumo do projeto</h2>
  </div>
  <p style="font-size:10.5px;line-height:1.65;color:${TX3};margin:0 0 16px;max-width:150mm;text-wrap:pretty">Esta página resume o projeto. As seções seguintes trazem a fundamentação técnica.</p>
  <div style="font-family:${OSW};font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:${G2};font-weight:500;margin-bottom:8px">O que será instalado</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:${LN1};${R};overflow:hidden;margin-bottom:16px">
    ${cardSpec(phn(c.totalKw, 'kW'), multi ? 'Potência total instalada' : 'Potência da estação de recarga', 'Carrega um veículo típico durante a noite')}
    ${cardSpec(phn(c.totalKw ? n : 0, ''), 'Ponto(s) de recarga', 'Cada ponto com circuito e proteções próprios')}
    ${cardSpec(conectoresTxt || `<span style="color:${G2}">[XX]</span>`, 'Conector', 'Conforme o padrão do veículo')}
    ${cardSpec('IP54', 'Uso externo', 'Resistente a chuva, poeira e impactos')}
  </div>
  <div style="font-family:${OSW};font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:${G2};font-weight:500;margin-bottom:8px">Como você fica protegido: ${temIdrResumo ? 'três' : 'duas'} camadas de segurança</div>
  <div style="display:grid;grid-template-columns:repeat(${temIdrResumo ? 3 : 2},1fr);gap:10px;margin-bottom:16px">
    ${camada(1, 'Disjuntor', `Desliga o circuito em caso de <strong>sobrecarga ou curto-circuito</strong> e protege a fiação e a instalação.`)}
    ${temIdrResumo ? camada(2, 'DR (diferencial)', `Detecta fuga de corrente e corta a energia em fração de segundo, o que protege <strong>pessoas contra choque elétrico</strong>.`) : ''}
    ${camada(temIdrResumo ? 3 : 2, 'DPS (surtos)', `Absorve picos de tensão causados por <strong>raios e oscilações da rede</strong> e protege a estação de recarga e o veículo.`)}
  </div>
  <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:10px;margin-bottom:16px">
    <div style="background:${INK};${R};padding:14px 16px">
      <div style="${KICK};color:${GREEN_L}">O local suporta essa carga?</div>
      <p style="font-size:9.5px;line-height:1.65;color:#E9EAE6;margin:6px 0 10px">Comparamos a corrente exigida pelos estações de recarga com a capacidade da entrada de energia do local:</p>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${barras}
      </div>
      ${naoIndica
        ? `<p style="font-size:9.5px;line-height:1.6;color:#fff;margin:10px 0 0;font-weight:500">Conclusão: a entrada de energia existente atende à nova carga. Detalhes na seção <span style="color:${GREEN_L}">${NUM.conclusao}</span>.</p>`
        : `<p style="font-size:9.5px;line-height:1.6;color:#fff;margin:10px 0 0;font-weight:500">Conclusão: <strong>é necessário</strong> alterar o padrão de entrada. Detalhes na seção <span style="color:${GREEN_L}">${NUM.conclusao}</span>.</p>`}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:${BG1};${R};padding:12px 14px;flex:1">
        <div style="${KICK};color:${GREEN}">Dentro das normas</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">
          ${['NBR 5410', 'NBR 17019', 'IEC 61851', 'Bombeiros', 'NR-10'].map(nm => `<span style="font-family:${OSW};font-size:8.5px;letter-spacing:.06em;padding:4px 8px;background:#fff;border:1px solid ${LN1};border-radius:5px;color:${INK}">${nm}</span>`).join('\n          ')}
        </div>
        <div style="font-size:8.5px;line-height:1.55;color:${G1};margin-top:8px">Projeto assinado por engenheiro eletricista, com ART registrada no CREA.</div>
      </div>
      <div style="background:${BG1};${R};padding:12px 14px">
        <div style="${KICK};color:${GREEN}">Garantias</div>
        <div style="font-size:9px;line-height:1.7;color:${TX2};margin-top:6px"><strong>12 meses</strong> de garantia sobre materiais e serviços · seguro de obra de <strong>R$ 1 milhão</strong> · processos certificados <strong>ISO 9001</strong></div>
      </div>
    </div>
  </div>
  <div style="font-family:${OSW};font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:${G2};font-weight:500;margin-bottom:8px">O que o cliente precisa providenciar</div>
  <div class="bg-keep" style="background:${BG1};${R};padding:10px 14px;margin-bottom:16px">
    <ol style="margin:0;padding-left:16px;font-size:9.5px;line-height:1.6;color:${TX2};column-count:2;column-gap:10mm">
      ${providencias.map(t => `<li style="break-inside:avoid;margin-bottom:3px">${t}</li>`).join('\n      ')}
    </ol>
  </div>
  <div style="font-family:${OSW};font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:${G2};font-weight:500;margin-bottom:8px">Como a obra acontece</div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
    ${etapa('1 · Vistoria', 'Levantamento no local')}
    ${etapa('2 · Projeto', 'Este memorial + diagrama e ART')}
    ${etapa('3 · Infraestrutura', 'Dutos, quadro e cabos, sem fios aparentes')}
    ${etapa('4 · Instalação', 'Fixação e energização da estação de recarga')}
    ${etapa('5 · Testes e entrega', 'Recarga assistida e relatório assinado', true)}
  </div>
</div>`);

    function camada(num, t, d) {
      return `<div style="background:${BG1};${R};padding:12px 14px"><div style="display:flex;align-items:baseline;gap:8px"><div style="font-family:${OSW};font-size:15px;font-weight:600;color:${GREEN};line-height:1">${num}</div><div style="font-family:${OSW};font-size:12px;font-weight:500;color:${INK}">${t}</div></div><div style="font-size:9px;line-height:1.6;color:${TX2};margin-top:6px">${d}</div></div>`;
    }
    function etapa(t, d, verde) {
      return `<div style="border-top:2px solid ${verde ? GREEN : INK};padding-top:7px"><div style="font-family:${OSW};font-size:10px;font-weight:500;color:${verde ? GREEN : INK}">${t}</div><div style="font-size:8.5px;color:${G1};line-height:1.5;margin-top:2px">${d}</div></div>`;
    }

    // ══ INTRODUÇÃO E OBJETO ══
    const distPartes = [];
    ['t1', 't2', 't3'].forEach((k, i) => { const tr = c.trechos && c.trechos[k]; if (tr) distPartes.push(`Trecho ${i + 1}: ${tr.L ? fmt(tr.L) + ' m' : '[XX]'}`); });
    pts.forEach(x => distPartes.push(`${x.id}: ${x.L ? fmt(x.L) + ' m' : '[XX]'}`));
    const distTxt = distPartes.join(' · ') + ' (levantadas em vistoria técnica)';
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.intro, TIT.intro, 'intro')}
  <p style="${P11}">O presente memorial descritivo refere-se ao dimensionamento dos componentes da infraestrutura elétrica destinada à instalação de estação de recarga para veículos elétricos (EVSE) de <strong>${phn(c.totalKw, 'kW')}</strong>, no endereço <strong>${endereco}</strong>, doravante denominado LOCAL DO PROJETO.</p>
  <p style="${P11}">A função da estação de recarga é transferir energia elétrica da instalação para as baterias de veículos elétricos a bateria (BEV) ou híbridos plug-in (PHEV), de forma controlada e segura, com comunicação permanente entre o equipamento e o veículo.</p>
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 16px">O documento tem por objeto: (i) caracterizar o sistema a ser implantado; (ii) demonstrar, por memória de cálculo, o dimensionamento de condutores, condutos, dispositivos de proteção e aterramento; (iii) estabelecer os critérios de execução, ensaio e comissionamento; e (iv) registrar as premissas, os limites de escopo e as responsabilidades das partes.</p>
  ${h3('1.1 · Dados de entrada do projeto')}
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:16px"><tbody>
    ${trKV('Local do projeto', endereco, '44%')}
    ${trKV('Tensão / frequência da rede', tensaoCfg)}
    ${trKV('Esquema de aterramento', aterr)}
    ${trKV('Forma de passagem', passagemTxt)}
    ${trKV('Disjuntor geral existente', phn(c.geral, 'A'))}
    ${c.trafo ? trKV('Transformador', `Sim · ${phn(c.trafo.kva, 'kVA')} · primário ${phn(c.trafo.primV, 'V')} ${ph(c.trafo.primLig, '[XX]')} → secundário ${phn(c.trafo.secV, 'V')} ${ph(c.trafo.secLig, '[XX]')} · ${ph(c.trafo.ip, '[IP]')} · disjuntor de alimentação ${phn(c.trafo.disjuntor, 'A')}`) : ''}
    ${c.topologia === 'quadro' ? trKV('QDA (quadro de distribuição das estações de recarga)', `Sim · disjuntor dedicado no QGBT ${c.alimentador ? manual(fmt(c.alimentador) + ' A', c.alimentadorManual) : phn(0, 'A')} · entrada do QDA ${c.qdGeral ? fmt(c.qdGeral, c.qdGeral % 1 ? 1 : 0) + ' A' : phn(0, 'A')} · ${phn(c.qdQuantidade, '')} estação(ões) de recarga`) : ''}
    ${trKV(multi ? 'Potência total das estações' : 'Potência da estação de recarga', phn(c.totalKw, 'kW'))}
    ${trKV('Quantidade de pontos', phn(c.totalKw ? n : 0, ''))}
    ${trKV('Distâncias dos trechos', distTxt)}
    ${trKV('Temperatura ambiente de projeto', phn(pt.temp, '°C'))}
  </tbody></table>
  ${h3('1.2 · Abrangência')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0">Este memorial abrange exclusivamente o circuito terminal dedicado à estação de recarga, desde o ponto de derivação no quadro de origem até o equipamento, incluindo condutores, condutos, dispositivos de proteção, aterramento, sinalização e comissionamento. Não abrange a adequação do padrão de entrada, do ramal de ligação ou de circuitos preexistentes, salvo indicação expressa no item ${NUM.observacoes}.</p>
</div>`);

    // ══ NORMAS ══
    const NORMAS = [
      ['ABNT NBR 5410', 'Instalações elétricas de baixa tensão. Norma base para dimensionamento de condutores, condutos, proteção contra choques e sobrecorrentes.'],
      ['ABNT NBR 17019', 'Instalações elétricas de baixa tensão, requisitos para a alimentação de veículos elétricos. Aplicada de forma <strong>complementar</strong> à NBR 5410, em especial quanto a circuito dedicado, IDR e proteções específicas.'],
      ['ABNT NBR 5419', 'Proteção contra descargas atmosféricas. Critério de seleção e classe do DPS.'],
      ['ABNT NBR 15920', 'Cabos elétricos, cálculo da corrente de condução (referência das capacidades e fatores de correção).'],
      ['IEC 61851', 'Sistema condutivo de recarga de veículos elétricos. Define os modos de recarga; o equipamento deste projeto opera em <strong>Modo 3</strong>.'],
      ['IEC 62196 / Type 2', 'Plugues, tomadas e acopladores para recarga condutiva. Padrão do conector adotado.'],
      ['NR-10', 'Segurança em instalações e serviços em eletricidade. Requisitos para a equipe de execução.'],
      ['Bombeiros', 'Instrução Técnica de inserção de veículos elétricos em edificações. Desligamentos local e geral, sinalização e interligação com o alarme.'],
      ['Concessionária', 'Normas técnicas de fornecimento em baixa tensão da distribuidora local.'],
      ['ISO 9001', 'Sistema de gestão da qualidade. Processos de projeto e obra da BeGreen auditados e certificados.'],
    ];
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.normas, TIT.normas, 'normas')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">Os dimensionamentos, a execução dos serviços e a utilização dos equipamentos obedecem às normas da ABNT (Associação Brasileira de Normas Técnicas), às instruções técnicas complementares aplicáveis e às especificações do fabricante da estação de recarga.</p>
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:14px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH};width:26%">Referência</th><th style="${TH}">Título e aplicação neste projeto</th></tr></thead>
    <tbody>${NORMAS.map(([r, t], i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD};font-weight:600;color:${INK}">${r}</td><td style="${TD};color:${TX1}">${t}</td></tr>`).join('\n      ')}</tbody>
  </table>
  <p style="font-size:9px;line-height:1.6;color:${G2};margin:0">Em caso de conflito entre referências, prevalece a exigência mais restritiva. Aplicam-se sempre as edições em vigor na data de emissão deste documento.</p>
</div>`);

    // ══ DESCRIÇÃO DO SISTEMA ══
    const card31 = (t, v, d) => `<div style="background:#fff;padding:11px 12px"><div style="font-family:${OSW};font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:${G2}">${t}</div><div style="font-family:${OSW};font-size:19px;font-weight:500;color:${INK};margin-top:2px">${v}</div><div style="font-size:8.5px;color:${G1};margin-top:2px">${d}</div></div>`;

    // Etapas 3.3 conforme o tipo de infraestrutura escolhido
    const kitEtapa = algumKit ? 'Disjuntor dedicado + kit de proteção (disj. térmico, IDR e DPS)' : 'Disjuntor dedicado do circuito';
    const ETAPAS_INFRA = {
      solo: [
        ['Etapa 3', 'Infra enterrada', 'Kanaflex corrugado no trecho subterrâneo, com envelopamento e fita de advertência'],
        ['Etapa 4', 'Subida aparente', 'Eletroduto galvanizado até a base do equipamento'],
      ],
      alvenaria: [
        ['Etapa 3', 'Infra embutida', 'Eletrodutos embutidos em alvenaria, com caixas de passagem'],
        ['Etapa 4', 'Chegada ao ponto', 'Terminação embutida e caixa junto ao equipamento'],
      ],
      aparente: [
        ['Etapa 3', 'Infra aparente', 'Eletrodutos rígidos ou perfilados aparentes, fixados à estrutura'],
        ['Etapa 4', 'Chegada ao ponto', 'Descida aparente organizada até o equipamento'],
      ],
    };
    const etapas34 = ETAPAS_INFRA[c.infraKey] || ETAPAS_INFRA.solo;
    const TXT_PERCURSO = {
      solo: 'Toda a passagem de infraestrutura no trecho externo é subterrânea, em Kanaflex, até a base da estação. Neste ponto, um eletroduto de aço galvanizado conectado ao trecho enterrado conduz os cabos até o equipamento, de modo que nenhum condutor fique aparente ao longo do percurso.',
      alvenaria: 'Toda a passagem de infraestrutura é embutida em alvenaria, em eletrodutos dedicados, do quadro de origem até o ponto de instalação da estação, de modo que nenhum condutor fique aparente ao longo do percurso.',
      aparente: 'A infraestrutura é aparente, em eletrodutos rígidos ou perfilados fixados à estrutura, do quadro de origem até a estação, com traçado identificado e protegido contra danos mecânicos em todo o percurso.',
    };
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.descricao, TIT.descricao, 'descricao')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">O local possui instalação elétrica existente. Este projeto trata do dimensionamento da infraestrutura elétrica de uma <strong>nova carga</strong>, a estação de recarga, alimentada por circuito terminal exclusivo, sem compartilhamento com quaisquer outros pontos de utilização, conforme exigido pela ABNT NBR 17019.</p>
  ${h3(multi ? '3.1 · Características das estações de recarga' : '3.1 · Características da estação de recarga')}
  ${multi ? `<table style="width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:14px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH8}">Circuito</th><th style="${TH8}">Potência</th><th style="${TH8}">Alimentação</th><th style="${TH8}">Disjuntor</th><th style="${TH8}">Conector</th><th style="${TH8}">Saída</th><th style="${TH8}">Proteção</th></tr></thead>
    <tbody>${pts.map((x, i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD8};font-weight:600;color:${INK}">${x.id}</td><td style="${TD8};color:${TX1}">${phn(x.P, 'kW')}</td><td style="${TD8};color:${TX1}">${x.lig.rotulo}</td><td style="${TD8};color:${TX1}">${x.disjuntor ? fmt(x.disjuntor) + ' A · C · ' + x.lig.polos : `<span style="color:${G2}">[XX]</span>`}</td><td style="${TD8};color:${TX1}">${x.conector ? esc(x.conector) : `<span style="color:${G2}">[XX]</span>`}</td><td style="${TD8};color:${TX1}">${x.P ? x.tipo : `<span style="color:${G2}">[XX]</span>`}</td><td style="${TD8};color:${TX1}">IP54 · IK08</td></tr>`).join('\n    ')}</tbody>
  </table>`
  : `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:${LN1};${R};overflow:hidden;margin-bottom:16px">
    ${card31('Potência nominal', phn(pt.P, 'kW'), pt.tipo === 'DC' ? 'corrente contínua' : 'corrente alternada')}
    ${card31('Alimentação', `${pt.V} V`, `${pt.lig.rotulo.split('·')[1] ? pt.lig.rotulo.split('·')[1].trim() : pt.lig.rotulo} · 60 Hz`)}
    ${card31('Disjuntor de alimentação', phn(pt.disjuntor, 'A'), 'curva C · ' + pt.lig.polos)}
    ${card31('Conector', pt.conector ? esc(pt.conector) : `<span style="color:${G2}">[XX]</span>`, 'conforme o padrão do veículo')}
    ${card31('Saída de recarga', pt.P ? pt.tipo : `<span style="color:${G2}">[XX]</span>`, pt.tipo === 'DC' ? 'corrente contínua · Modo 4' : 'corrente alternada · Modo 3')}
    ${card31('Grau de proteção', 'IP54 · IK08', 'uso externo')}
  </div>`}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">${temAC && temDC
    ? 'O projeto inclui estações em corrente alternada (AC) e em corrente contínua (DC). Nas estações AC, a conversão de energia ocorre no carregador de bordo do veículo e cada estação faz uma recarga por vez; nas estações DC, a conversão CA/CC é feita no próprio equipamento, que entrega energia diretamente à bateria. Em ambos os casos, a corrente de consumo com a bateria totalmente descarregada é a corrente de projeto de cada circuito, calculada a partir da potência nominal. Os cabos de recarga acompanham os equipamentos.'
    : (temDC
      ? `A estação em corrente contínua (DC) faz a conversão CA/CC internamente e entrega energia diretamente à bateria do veículo, com potência controlada pelo sistema de gestão da bateria. A corrente de consumo na entrada do equipamento, com a bateria totalmente descarregada, é a corrente de projeto do circuito, calculada a partir da potência nominal. O cabo de recarga acompanha o equipamento.`
      : `A estação em corrente alternada (AC) tem uma saída e faz uma recarga por vez; a conversão de energia ocorre no carregador de bordo do veículo. A corrente de consumo com a bateria totalmente descarregada é a corrente de projeto do circuito, calculada a partir da potência nominal. O cabo de recarga acompanha o equipamento.`)}</p>
  ${h3('3.2 · Modo de recarga e funções de segurança embarcadas')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 8px">${temAC && temDC
    ? 'As estações AC operam em <strong>Modo 3</strong> (IEC 61851-1): a energia é entregue por um circuito dedicado com dispositivo de controle e proteção incorporado, que dialoga permanentemente com o veículo pelo condutor-piloto. As estações DC operam em <strong>Modo 4</strong> (IEC 61851-23): a conversão CA/CC é feita na estação, que alimenta a bateria do veículo diretamente em corrente contínua, com controle e comunicação permanentes entre estação e veículo. As funções de segurança inerentes aos modos são:'
    : (temDC
      ? 'O equipamento opera em <strong>Modo 4</strong> (IEC 61851-23): a conversão CA/CC é feita na estação, que alimenta a bateria do veículo diretamente em corrente contínua, com controle e comunicação permanentes entre estação e veículo. As funções de segurança inerentes ao modo são:'
      : 'O equipamento opera em <strong>Modo 3</strong> (IEC 61851-1): a energia é entregue por um circuito dedicado com dispositivo de controle e proteção incorporado, que dialoga permanentemente com o veículo pelo condutor-piloto. As funções de segurança inerentes ao modo são:')}</p>
  <ul style="font-size:10.5px;line-height:1.65;color:${TX1};margin:0;padding-left:16px">
    <li style="margin-bottom:4px">Verificação da continuidade do condutor de proteção antes da energização;</li>
    <li style="margin-bottom:4px">Só há tensão no conector após o acoplamento e o reconhecimento mútuo veículo–estação;</li>
    <li style="margin-bottom:4px">Negociação da ${temDC && !temAC ? 'potência' : 'corrente máxima'} disponível (limitação dinâmica pela comunicação estação–veículo);</li>
    <li style="margin-bottom:4px">Interrupção imediata da recarga em caso de desconexão, falha de comunicação ou falha de isolamento;</li>
    ${temAC ? '<li>Detecção de corrente diferencial-residual contínua (≥ 6 mA DC), que permite o uso de IDR Tipo A a montante nas estações AC.</li>' : '<li>Monitoramento de isolamento do circuito de corrente contínua durante toda a recarga.</li>'}
  </ul>
</div>`);


    // ══ CRITÉRIOS ══
    const CRIT = [
      ['Capacidade de condução', 'I<sub>z</sub> corrigida ≥ I<sub>n</sub> do dispositivo de proteção ≥ I<sub>b</sub> de projeto'],
      ['Seção mínima', '2,5 mm² para circuitos de força (NBR 5410, tabela 47)'],
      ['Queda de tensão', 'ΔV ≤ 4 % do total, sendo ≤ 2 % no circuito terminal'],
      ['Sobrecarga', 'Coordenação disjuntor × condutor conforme item 5.3.4 da NBR 5410'],
      ['Curto-circuito', 'I²t suportável pelo cabo ≥ I²t deixado passar pelo disjuntor; I<sub>cn</sub> ≥ I<sub>k</sub> presumida'],
      ['Proteção contra choques', 'Seccionamento automático + proteção diferencial-residual de 30 mA Tipo A'],
      ['Ocupação do conduto', 'Taxa de ocupação ≤ 40 % para 3 ou mais condutores'],
      ['Sobretensões', 'DPS coordenado com a tensão da rede e o nível de exposição do local'],
    ];
    const prem = (t, d) => `<div style="background:${BG1};${R};padding:12px 14px"><div style="font-family:${OSW};font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:${GREEN};font-weight:500">${t}</div><p style="font-size:9.5px;line-height:1.6;color:${TX2};margin:5px 0 0">${d}</p></div>`;
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.criterios, TIT.criterios, 'criterios')}
  ${emResumo('Antes de escolher cabos e disjuntores, definimos as regras de segurança: o cabo deve aguentar a corrente com folga, a proteção deve desarmar antes de qualquer risco e a energia deve chegar à estação de recarga sem perda perceptível. Esta seção lista essas regras; as seguintes mostram que cada uma é atendida.')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">O circuito terminal da estação de recarga é dimensionado como carga de <strong>regime contínuo</strong>, com fator de demanda unitário (hipótese conservadora, pois a recarga pode se estender por várias horas na corrente máxima). Os critérios aplicados, em ordem de verificação, são:</p>
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:16px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH};width:6%">#</th><th style="${TH};width:30%">Critério</th><th style="${TH}">Condição a satisfazer</th></tr></thead>
    <tbody>${CRIT.map(([t, d], i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD};font-family:${OSW};color:${GREEN};font-weight:500">${i + 1}</td><td style="${TD};font-weight:600;color:${INK}">${t}</td><td style="${TD};color:${TX1}">${d}</td></tr>`).join('\n      ')}</tbody>
  </table>
  ${h3('4.1 · Premissas adotadas')}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    ${prem('Condutores', `Cobre, isolação HEPR 90 °C para 1 kV, não propagante de chama. Tipo de linha elétrica conforme a forma de passagem de cada trecho (método <strong>D</strong> para eletroduto enterrado; <strong>B1</strong> para eletroduto embutido em alvenaria ou aparente), método de referência da tabela 36 da NBR 5410.`)}
    ${prem('Correções', `Fator de temperatura conforme tabela 40 (temperatura do solo, referência 20 °C, para trechos enterrados; temperatura ambiente, referência 30 °C, para os demais); fator de agrupamento conforme tabela 42, quando aplicável. O resultado corrigido é o valor comparado à corrente de projeto.`)}
    ${prem('Margem de projeto', 'Aplica-se uma margem de segurança sobre a corrente nominal no dimensionamento do dispositivo de proteção, que cobre o regime contínuo e a elevação de temperatura no quadro.')}
    ${prem('Recomendação do fabricante', 'Quando a especificação do fabricante do equipamento for mais restritiva que o resultado do cálculo, adota-se a seção do fabricante.')}
  </div>
</div>`);

    // ══ CONDUTORES ══ (memória de cálculo com valores reais do ponto 1)
    const notaMulti = multi ? `<p style="font-size:9px;line-height:1.6;color:${G2};margin:0 0 12px">Memória de cálculo apresentada para o circuito C-EV-01; os demais circuitos seguem o mesmo método e constam no cálculo por trecho (item 5.5) e no resumo do dimensionamento (item 5.6).</p>` : '';
    const fasesTxt = pt.lig.tri ? `trifásico (${pt.lig.rotulo})` : (pt.lig.fases === 1 ? `monofásico (${pt.lig.rotulo})` : `bifásico (${pt.lig.rotulo})`);
    const formulaIb = pt.lig.tri ? `I<sub>b</sub> = P / (V·√3)` : `I<sub>b</sub> = P / V`;
    const calcIb = temDados
      ? `${formulaIb} = ${fmt(pt.P * 1000)} / ${pt.lig.tri ? `(${pt.V}·√3)` : pt.V} = <strong style="color:${GREEN_D}">${fmt(pt.IbCalc, 1)} A</strong>`
      : `${formulaIb} = <span style="color:${G2}">[XX] / [XX]</span> = <strong style="color:${G2}">[XX] A</strong>`;
    const secaoMaior = pt.secao > pt.secaoCapacidade;
    const resumoSec5 = pt.secao
      ? `O cabo foi escolhido para atender à corrente da estação de recarga com margem de sobra: adotamos <strong>${fmt(pt.secao)} mm² de cobre</strong>${secaoMaior ? `, uma bitola acima do mínimo pela capacidade de condução (${fmt(pt.secaoCapacidade)} mm²)` : ', a seção mínima pela capacidade de condução com o fator de temperatura aplicado'}. O fio terra tem a mesma bitola.`
      : `O cabo é escolhido para atender à corrente da estação de recarga com margem de sobra, pela capacidade de condução do método de instalação de cada trecho, com fator de temperatura. Quando a recomendação do fabricante for maior, prevalece a do fabricante. O fio terra tem a mesma bitola.`;
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.condutores, TIT.condutores, 'condutores')}
  ${emResumo(resumoSec5)}
  ${notaMulti}
  ${h3('5.1 · Corrente de projeto')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">A corrente de projeto é obtida a partir da potência nominal da estação e da tensão de alimentação. Para a estação de ${phn(pt.P, 'kW')} em ${pt.V} V ${fasesTxt}${pt.lig.tri ? ' (estações de recarga a partir de ' + fmt(window.Calc.TRIFASICO_KW) + ' kW são trifásicos e usam √3 no cálculo)' : ''}:</p>
  ${formula(calcIb)}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 16px">Adota-se como corrente de projeto o valor calculado${temDados ? ` (<strong>${fmt(pt.Ib, pt.Ib % 1 ? 1 : 0)} A</strong>)` : ''}. A distância entre o quadro de origem e a estação, levantada em vistoria técnica, é de <strong>${phn(pt.L, 'm')}</strong>.</p>
  ${h3('5.2 · Condutores de fase')}
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:12px"><tbody>
    ${trKV('Potência da estação', phn(pt.P, 'kW'), '52%')}
    ${trKV('Tensão de alimentação', `${pt.V} V ${fasesTxt}`)}
    ${trKV('Tipo de linha elétrica', pt.infra.linha)}
    ${trKV('Condutor', 'Cobre, isolação HEPR 1 kV')}
    <tr><td style="${KV};color:${G1}">Seção adotada</td><td style="${KV};font-weight:600;color:${GREEN_D}">${manual(phn(pt.secao, 'mm²'), pt.secaoManual)}</td></tr>
  </tbody></table>
  ${h3('5.3 · Fator de correção de temperatura')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">A temperatura ambiente máxima considerada para o sistema é de <strong>${phn(pt.temp, '°C')}</strong>. Havendo divergência em relação à temperatura de referência da tabela de capacidades, aplica-se o fator de correção da tabela 40 da NBR 5410. Para ${phn(pt.temp, '°C')} na condição de instalação adotada (${pt.infra.fator === 'solo' ? 'linha enterrada' : 'linha não enterrada'}), o fator é <strong>${fmt(pt.fT, 2)}</strong>:</p>
  ${formula(`I<sub>z corrigida</sub> = I<sub>z tabela</sub> × F<sub>T</sub> × F<sub>A</sub> &nbsp;≥&nbsp; I<sub>b</sub>${pt.secao && pt.izCorrigida ? ` &nbsp;→&nbsp; ${fmt(pt.izCorrigida, 1)} A ≥ ${fmt(pt.Ib, pt.Ib % 1 ? 1 : 0)} A` : ''}`)}
  ${conclusao(`Os condutores de cada trecho, em cobre com isolação HEPR 1 kV, atendem à capacidade de condução com o fator de temperatura aplicado. O cálculo de cada trecho está no item 5.5 e o resumo no item 5.6.`, 16)}
  ${h3('5.4 · Condutor de proteção (terra)')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">A seção do condutor de proteção é determinada pela tabela 58 da NBR 5410, em função da seção dos condutores de fase:</p>
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:12px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH}">Seção dos condutores de fase S</th><th style="${TH}">Seção mínima do condutor de proteção</th></tr></thead>
    <tbody>
      <tr><td style="${TD};color:${TX1}">S ≤ 16 mm²</td><td style="${TD};color:${TX1}">S (igual à fase)</td></tr>
      <tr style="background:${BG2}"><td style="${TD};color:${TX1}">16 &lt; S ≤ 35 mm²</td><td style="${TD};color:${TX1}">16 mm²</td></tr>
      <tr><td style="${TD};color:${TX1}">S &gt; 35 mm²</td><td style="${TD};color:${TX1}">S / 2</td></tr>
    </tbody>
  </table>
  ${conclusao(`O condutor de proteção de cada trecho segue a tabela 58, com isolação 1 kV, na cor verde ou verde-amarela. As seções estão no resumo do item 5.6.`, 18)}
  ${h3('5.5 · Cálculo por trecho')}
  <p style="font-size:10px;line-height:1.6;color:${G1};margin:0 0 10px">Para cada trecho: corrente considerada, seção pela capacidade de condução (I<sub>z</sub> × F<sub>T</sub> ≥ I), queda de tensão e ocupação do eletroduto.</p>
  ${trechosCalc.map(cartaoTrecho).join('\n  ')}
  ${h3('5.6 · Conclusão do dimensionamento')}
  ${tabelaConclusao}
</div>`);

    function terraSecao(s) { return s <= 16 ? s : (s <= 35 ? 16 : s / 2); }

    // ══ ELETRODUTOS ══
    const temOcup = pt.areaOcupada > 0;
    const eletrodutoTxt = pt.eletroduto ? manual(esc(pt.eletroduto), pt.eletrodutoManual) : `<span style="color:${G2}">[Ø]</span>`;
    const dutoNome = { solo: 'eletroduto (Kanaflex)', alvenaria: 'eletroduto embutido', aparente: 'eletroduto aparente' }[pt.infra.chave] || 'eletroduto';
    const EXEC_INFRA = {
      solo: [
        ['Interno / aparente', 'Eletroduto rígido ou eletrocalha pré-zincada', 'Fixação a cada 1,5 m; caixas de passagem em mudanças de direção acima de 90°'],
        ['Subterrâneo', `Kanaflex corrugado de ${pt.eletroduto ? esc(pt.eletroduto) : '[Ø]'}`, 'Profundidade mínima de 0,50 m; envelopamento em areia; fita de advertência acima do duto; reaterro compactado'],
        ['Subida à estação', `Eletroduto de aço galvanizado de ${pt.eletroduto ? esc(pt.eletroduto) : '[Ø]'}`, 'Conectado ao trecho enterrado, conduzindo os cabos até a base do equipamento sem condutores aparentes'],
        ['Travessias', 'Furos técnicos / passagens estruturais', 'Locação aprovada pelo responsável pela estrutura; vedação corta-fogo quando atravessar compartimentação'],
      ],
      alvenaria: [
        ['Embutido em alvenaria', `Eletroduto de ${pt.eletroduto ? esc(pt.eletroduto) : '[Ø]'} embutido`, 'Rasgos executados sem comprometer a estrutura; caixas de passagem acessíveis; recomposição do revestimento'],
        ['Caixas e terminações', 'Caixas de passagem e de terminação embutidas', 'Instaladas em pontos acessíveis, identificadas, com tampa'],
        ['Travessias', 'Furos técnicos / passagens estruturais', 'Locação aprovada pelo responsável pela estrutura; vedação corta-fogo quando atravessar compartimentação'],
      ],
      aparente: [
        ['Aparente', `Eletroduto rígido de ${pt.eletroduto ? esc(pt.eletroduto) : '[Ø]'} ou eletrocalha pré-zincada`, 'Fixação a cada 1,5 m; caixas de passagem em mudanças de direção acima de 90°; identificação do circuito'],
        ['Proteção mecânica', 'Traçado protegido contra danos mecânicos', 'Altura e posicionamento fora de rotas de impacto; proteção adicional em áreas de manobra'],
        ['Travessias', 'Furos técnicos / passagens estruturais', 'Locação aprovada pelo responsável pela estrutura; vedação corta-fogo quando atravessar compartimentação'],
      ],
    };
    const execRows = (infrasUsadas.length ? infrasUsadas : ['solo']).flatMap(k => EXEC_INFRA[k] || []).filter((r, i, arr) => arr.findIndex(x => x[0] === r[0]) === i);
    if (c.trecho4) execRows.push(['Encaminhamento conjunto', c.trecho4.tipo === 'eletrocalha' ? `Eletrocalha pré-zincada ${c.trecho4.nome || '[XX]'}` : `Eletroduto de ${c.trecho4.nome || '[Ø]'} compartilhado`, `Circuitos das estações de recarga encaminhados juntos até as vagas; fator de agrupamento da tabela 42 (${fmt(c.trecho4.fA, 2)} para ${c.trecho4.n} circuitos) aplicado aos condutores`]);
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.eletrodutos, TIT.eletrodutos, 'eletrodutos')}
  ${emResumo(infrasUsadas.length > 1
    ? 'Do quadro de energia até a estação de recarga, os cabos correm sempre protegidos em eletroduto, com a forma de passagem definida trecho a trecho (enterrada, embutida em alvenaria ou aparente). <strong>Nenhum fio fica exposto</strong> ao longo do percurso.'
    : {
      solo: 'Do quadro de energia até a estação de recarga, os cabos correm sempre protegidos: enterrados em duto no trecho externo e dentro de eletroduto de aço na subida ao equipamento. <strong>Nenhum fio fica exposto</strong> ao longo do percurso.',
      alvenaria: 'Do quadro de energia até a estação de recarga, os cabos correm sempre protegidos, em eletrodutos embutidos na alvenaria. <strong>Nenhum fio fica exposto</strong> ao longo do percurso.',
      aparente: 'Do quadro de energia até a estação de recarga, os cabos correm protegidos em eletrodutos aparentes, com traçado organizado, identificado e protegido contra danos mecânicos.',
    }[infrasUsadas[0] || 'solo'])}
  ${h3('6.1 · Área de ocupação dos condutores')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">Calcula-se a área total ocupada pelos condutores no interior do eletroduto, a partir do diâmetro externo de cada condutor e do número de vias:</p>
  ${formula('A = (π · De² / 4) × NV', 'A = área de ocupação total dos condutores · De = diâmetro externo do condutor (tabela do fabricante) · NV = número de vias · π = 3,14')}
  ${formula('Taxa de ocupação = A / A<sub>int</sub> ≤ 40 %', 'A<sub>int</sub> = área interna do eletroduto (π · D<sub>int</sub>² / 4) · limite de 40 % para linhas com três ou mais condutores (NBR 5410)')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 12px">O diâmetro do eletroduto de cada trecho é o menor comercial cuja área interna mantém a taxa de ocupação abaixo de <strong>40 %</strong>, considerando o diâmetro externo do condutor adotado e o número de vias do trecho (fases, neutro e terra). Os valores de cada trecho estão no item 5.5.</p>
  ${conclusao(`Os eletrodutos de cada trecho respeitam a taxa de ocupação de 40 %. O cálculo de ocupação de cada trecho está no item 5.5 e o resumo no item 5.6.`, 18)}
  ${h3('6.2 · Cálculo do eletroduto por trecho')}
  <table style="width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:18px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH8}">Trecho</th><th style="${TH8}">Condutor</th><th style="${TH8}">De</th><th style="${TH8}">NV</th><th style="${TH8}">A cond.</th><th style="${TH8}">Duto</th><th style="${TH8}">A interna</th><th style="${TH8}">Ocupação</th><th style="${TH8}">Situação</th></tr></thead>
    <tbody>${(() => {
      const areaInt = (nome) => { const e = window.Calc.ELETRODUTOS.find(x => x.nome === nome); return e ? Math.PI * e.di * e.di / 4 : 0; };
      const cel = (v) => `<td style="${TD8};color:${TX1}">${v}</td>`;
      const sit = (taxa, temDuto) => !temDuto ? `<span style="color:${G2}">Pendente</span>` : (taxa <= 40 ? `<span style="color:${GREEN_D};font-weight:600">Atende</span>` : `<span style="color:#C0392B;font-weight:600">Reavaliar</span>`);
      const linhas = [];
      trechosCalc.filter(tr => !(tr.circuito && tr.d.dutoCompartilhado)).forEach(tr => {
        const d = tr.d; const ai = areaInt(d.eletroduto);
        linhas.push([tr.titulo, d.secao ? fmt(d.secao) + ' mm²' : '[XX]', d.de ? fmt(d.de, 2) + ' mm' : '[XX]', d.lig.nv, d.areaOcupada ? fmt(d.areaOcupada, 1) + ' mm²' : '[XX]', d.eletroduto ? esc(d.eletroduto) : '[Ø]', ai ? fmt(ai, 0) + ' mm²' : '[XX]', d.taxaOcupacao ? fmt(d.taxaOcupacao, 1) + ' %' : '[XX]', sit(d.taxaOcupacao, !!d.eletroduto && !!d.areaOcupada)]);
      });
      if (c.trecho4) {
        const circ = trechosCalc.filter(tr => tr.circuito);
        linhas.push([`Trecho ${circ.length ? circ[0].num : ''} · ${origemCirc} – Estações de recarga (${c.trecho4.n} circuitos agrupados)`, circ.map(tr => tr.d.secao ? fmt(tr.d.secao) + ' mm²' : '[XX]').join(' / '), circ.map(tr => tr.d.de ? fmt(tr.d.de, 2) : '[XX]').join(' / ') + ' mm', circ.map(tr => tr.d.lig.nv).join(' / '), c.trecho4.areaTotal ? fmt(c.trecho4.areaTotal, 1) + ' mm² (Σ)' : '[XX]', c.trecho4.rotulo ? esc(c.trecho4.rotulo) : '[Ø]', c.trecho4.area ? fmt(c.trecho4.area, 0) + ' mm²' : '[XX]', c.trecho4.taxa ? fmt(c.trecho4.taxa, 1) + ' %' : '[XX]', sit(c.trecho4.taxa, !!c.trecho4.nome && !!c.trecho4.areaTotal)]);
      }
      return linhas.map((l, i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD8};font-weight:600;color:${INK}">${l[0]}</td>${l.slice(1).map(cel).join('')}</tr>`).join('\n    ');
    })()}</tbody>
  </table>
  ${h3('6.3 · Execução da infraestrutura <span style="color:' + G2 + ';letter-spacing:.06em">(' + infrasUsadas.map(k => window.Calc.INFRAS[k].rotulo.toLowerCase()).join(' · ') + ')</span>')}
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:14px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH};width:30%">Trecho</th><th style="${TH};width:32%">Solução</th><th style="${TH}">Requisitos de execução</th></tr></thead>
    <tbody>
      ${execRows.map(([t, sSol, req], i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD};font-weight:600;color:${INK}">${t}</td><td style="${TD};color:${TX1}">${sSol}</td><td style="${TD};color:${TX1}">${req}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
  ${h3('6.4 · Instalação da estação')}
  <ul style="font-size:10.5px;line-height:1.7;color:${TX1};margin:0;padding-left:16px">
    <li style="margin-bottom:4px">${temAC && temDC
      ? 'Estações AC fixadas em parede ou pedestal e estações DC instaladas diretamente no piso, sobre base nivelada e fixada; em ambos os casos, conector entre 0,80 m e 1,50 m do piso acabado, altura que dá alcance confortável e afasta o risco de alagamento;'
      : (temDC
        ? 'Instalação diretamente no piso, sobre base nivelada e fixada, com o conector entre 0,80 m e 1,50 m do piso acabado, altura que dá alcance confortável e afasta o risco de alagamento;'
        : 'Fixação em parede ou pedestal, com o conector entre 0,80 m e 1,50 m do piso acabado, altura que dá alcance confortável e afasta o risco de alagamento;')}</li>
    <li style="margin-bottom:4px">Posicionamento que permita ao cabo de recarga alcançar a entrada do veículo sem tração, torção ou apoio no piso de circulação;</li>
    <li style="margin-bottom:4px">Proteção mecânica contra impacto de veículo (batente, balizador ou pedestal reforçado) quando a estação estiver em rota de manobra;</li>
    <li>Vedação de todas as entradas de conduto no invólucro, para preservar o grau de proteção IP declarado.</li>
  </ul>
</div>`);

    // ══ PROTEÇÃO ══
    const disjTxt = pt.disjuntor ? manual(`${fmt(pt.disjuntor)} A`, pt.disjuntorManual) : `<span style="color:${G2}">[XX] A</span>`;
    const idrTxt = pt.idr ? manual(`${fmt(pt.idr)} A`, pt.idrManual) : `<span style="color:${G2}">[XX] A</span>`;
    const calc71 = 'I<sub>n</sub> = I<sub>b</sub> + margem de segurança &nbsp;→&nbsp; valor comercial imediatamente superior';
    const bloco7restante = pt.usaKit
      ? `${h3('7.3 · Interruptor diferencial-residual (IDR)')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">O IDR integra o kit de proteção do circuito, dimensionado pela corrente da carga e pela corrente do disjuntor a montante, com corrente diferencial-residual nominal de 30 mA, proteção adicional contra choques elétricos exigida pela NBR 5410 e pela NBR 17019. O IDR é <strong>exclusivo</strong> do circuito da estação: não protege nenhum outro ponto de utilização.</p>
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 12px">O tipo A é suficiente porque a estação em Modo 3 incorpora detecção de corrente diferencial contínua de 6 mA, o que dispensa o dispositivo Tipo B a montante. Essa condição deve ser confirmada na documentação do fabricante do equipamento.</p>
  ${conclusao(`O interruptor diferencial-residual adotado será ${pt.lig.polos} de ${idrTxt}, 30 mA, Tipo A (Classe A), dedicado exclusivamente ao circuito da estação de recarga.`, 18)}
  ${h3('7.4 · Dispositivo de proteção contra surtos (DPS)')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">A definição do DPS adequado segue três passos:</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">
    ${passo('1º passo', 'Tensão de operação', 'DPS unipolar (1P) de 275 V<br />em todas as ligações, um por<br />condutor vivo (fases e neutro)')}
    ${passo('2º passo', 'Corrente de descarga', 'Padrão BeGreen: 45 kA<br />Cobre áreas urbanas e<br />instalações com para-raios')}
    ${passo('3º passo', 'Local de instalação', 'Classe I → quadro primário (QGBT)<br />Classe II → quadros secundários<br />Classe III → junto aos equipamentos')}
  </div>
  ${conclusao(`Serão adotados ${pt.lig.dpsQtd} DPS 1P / ${pt.dpsTensao} V / ${fmt(pt.dpsKa)} kA / Classe II (${pt.lig.dpsDesc}, ligação ${pt.lig.rotulo}), instalados no kit de proteção da estação, com condutor de conexão ao barramento de proteção o mais curto e retilíneo possível.`, 18)}
  ${h3('7.5 · Resumo do kit de proteção')}
  <p style="font-size:10px;line-height:1.6;color:${G1};margin:0 0 10px">O kit de proteção (disjuntor térmico + IDR + DPS) é obrigatório para estações de até ${fmt(window.Calc.KIT_OBRIGATORIO_KW)} kW e opcional entre ${fmt(window.Calc.KIT_OBRIGATORIO_KW)} e ${fmt(window.Calc.KIT_LIMITE_KW)} kW.${pt.kitOpcional ? ' Neste projeto, o kit foi <strong>incluído por decisão de projeto</strong>.' : ''}</p>
  <table style="width:100%;border-collapse:collapse;font-size:10px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH}">Dispositivo</th><th style="${TH}">Especificação adotada</th><th style="${TH}">Função</th></tr></thead>
    <tbody>
      ${[
        ['Disjuntor térmico', `${cap(pt.lig.polos)} ${disjTxt}, curva C`, 'Sobrecarga e curto-circuito'],
        ['IDR', `${cap(pt.lig.polos)} ${idrTxt} · 30 mA · Tipo A`, 'Proteção adicional contra choques'],
        ['DPS', `${pt.lig.dpsQtd} × 1P · ${pt.dpsTensao} V · ${fmt(pt.dpsKa)} kA · Classe II`, 'Surtos de tensão'],
        ['Invólucro', 'Sobrepor, IP54 externo · barramentos N e PE', 'Abrigo e seccionamento local'],
      ].map(([t, e, f], i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD};font-weight:600;color:${INK}">${t}</td><td style="${TD};color:${TX1}">${e}</td><td style="${TD};color:${TX1}">${f}</td></tr>`).join('\n      ')}
    </tbody>
  </table>`
      : `${h3('7.3 · Proteções do equipamento')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 12px">O kit de proteção junto ao equipamento (disjuntor térmico + IDR + DPS) aplica-se a estações de até ${fmt(window.Calc.KIT_LIMITE_KW)} kW e é obrigatório até ${fmt(window.Calc.KIT_OBRIGATORIO_KW)} kW. Para a potência deste projeto (${phn(pt.P, 'kW')}), as proteções diferencial-residual e contra surtos são providas pelos dispositivos internos da própria estação, conforme documentação do fabricante. O disjuntor exclusivo do circuito permanece no quadro de origem.${c.topologia === 'quadro' ? ` Neste caso, a proteção é provida também pelos quadros instalados (${c.trafo ? 'QDA Transformador e QDA' : 'QDA'}), que possuem DPS e disjuntor térmico, além das proteções internas das estações de recarga.` : ''}</p>
  ${conclusao(`Não será utilizado kit de proteção externo neste circuito. As proteções são asseguradas pelo equipamento, conforme especificação do fabricante, a ser confirmada no comissionamento.`)}`;

    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.protecao, TIT.protecao, 'protecao')}
  ${emResumo(pt.usaKit
    ? 'Três dispositivos exclusivos protegem o circuito: o <strong>disjuntor</strong> (sobrecarga e curto-circuito), o <strong>DR</strong> (choque elétrico em pessoas) e o <strong>DPS</strong> (raios e surtos de tensão). Nenhum é compartilhado com outras cargas do imóvel.'
    : 'O circuito é protegido por disjuntor exclusivo no quadro de origem; as proteções diferencial e contra surtos são integradas à própria estação. Nada é compartilhado com outras cargas do imóvel.')}
  ${h3('7.1 · Disjuntor termomagnético')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">O disjuntor do circuito da estação é dimensionado a partir da potência do equipamento, da tensão de alimentação e de uma margem de segurança que cobre o regime contínuo de operação:</p>
  ${formula(calc71, `I<sub>n</sub> = corrente nominal do disjuntor · I<sub>b</sub> = corrente de projeto do trecho (P / V nos circuitos monofásicos e bifásicos; P / (V × √3) nos trifásicos) · margem de segurança = regime contínuo e elevação de temperatura`)}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 12px">A curva C acomoda a corrente de energização dos equipamentos sem atuação indevida e mantém a coordenação com a capacidade de condução do condutor de cada trecho. O número de polos segue a ligação do trecho: monopolar (F+N+T), bipolar (2F+T ou 2F+N+T) ou tripolar (3F+N+T).</p>
  ${conclusao(`Os disjuntores de cada trecho, com curva C e capacidade de interrupção compatível com a corrente de curto-circuito presumida, estão calculados e resumidos no item 7.2.`, 18)}
  ${h3('7.2 · Proteções por trecho')}
  <p style="font-size:10px;line-height:1.6;color:${G1};margin:0 0 10px">Dispositivos de proteção de cada trecho: disjuntor dedicado no QGBT, disjuntor térmico e DPS nos quadros instalados e, em cada circuito de estação de recarga, o disjuntor do circuito com o kit de proteção (IDR e DPS) quando aplicável.</p>
  ${tabelaProt}
  ${bloco7restante}
</div>`);

    function passo(e, t, d) {
      return `<div style="background:${BG1};${R};padding:12px 13px"><div style="font-family:${OSW};font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:${GREEN};font-weight:500">${e}</div><div style="font-family:${OSW};font-size:11.5px;font-weight:500;color:${INK};margin:3px 0 6px">${t}</div><div style="font-size:9px;line-height:1.75;color:${TX2}">${d}</div></div>`;
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    // ══ MEMÓRIA COMPLEMENTAR ══
    const temQueda = pt.quedaPct > 0;
    const quedaCor = pt.quedaOk ? GREEN_D : '#C0392B';
    const fq = pt.lig.tri ? '√3' : '2';
    const calc81 = temQueda
      ? `ΔV% = (${fq} × 0,0224 × ${fmt(pt.L)} × ${fmt(pt.Ib, pt.Ib % 1 ? 1 : 0)}) / (${fmt(pt.secao)} × ${pt.V}) × 100 = <strong style="color:${quedaCor}">${fmt(pt.quedaPct, 2)} %</strong>`
      : `ΔV% = (${fq} × 0,0224 × <span style="color:${G2}">[L] × [Ib]</span>) / (<span style="color:${G2}">[S]</span> × ${pt.V}) × 100 = <strong style="color:${G2}">[XX] %</strong>`;
    const quedaAlerta = !pt.quedaOk && pt.secaoSugeridaQueda
      ? `<p style="font-size:10px;line-height:1.6;color:#C0392B;margin:0 0 12px;font-weight:600">⚠ A queda de tensão excede o limite de 2 %. Recomenda-se adotar a seção de ${fmt(pt.secaoSugeridaQueda)} mm² para este circuito.</p>` : '';
    const resumoSec8 = temQueda
      ? `Duas verificações finais: a perda de energia no cabo é ${pt.quedaOk ? 'mínima' : 'verificada'} (<strong>${fmt(pt.quedaPct, 2)} %</strong>${pt.quedaOk ? ', bem abaixo do limite de 2 %' : ', acima do limite de 2 %, seção em reavaliação'}) e o cabo suporta um curto-circuito sem se danificar até a proteção atuar. ${pt.quedaOk ? 'A instalação passa nos dois testes com folga.' : 'Ver alerta no item 8.1.'}`
      : 'Duas verificações finais: a perda de energia no cabo deve ficar abaixo do limite de 2 % e o cabo deve suportar um curto-circuito sem se danificar até a proteção atuar.';
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.memoria, TIT.memoria, 'memoria')}
  ${emResumo(resumoSec8)}
  ${notaMulti}
  ${h3('8.1 · Queda de tensão')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">Verifica-se a queda de tensão no circuito terminal, cujo limite é de 2 %, com folga em relação ao limite global de 4 % previsto na NBR 5410 a partir do ponto de entrega:</p>
  ${formula(`ΔV% = (k · ρ · L · I) / (S · V) × 100`, `k = 2 em circuitos monofásicos e bifásicos, √3 em trifásicos · ρ = resistividade do cobre a 70 °C ≈ 0,0224 Ω·mm²/m · L = comprimento do trecho [m] · I = corrente do trecho [A] · S = seção do condutor [mm²] · V = tensão do trecho [V]`)}
  ${(() => {
    const fqDe = (d) => (d.fatorQueda && d.fatorQueda < 1.8) ? '√3' : '2';
    const lin = trechosCalc.map(tr => { const d = tr.d; const I = tr.circuito ? d.Ib : d.In;
      return `<strong style="color:${GREEN_D}">${tr.titulo}</strong>: ${d.quedaPct
        ? `ΔV = (${fqDe(d)} × 0,0224 × ${fmt(d.L)} × ${fmt(I, I % 1 ? 1 : 0)}) / (${fmt(d.secao)} × ${d.V}) × 100 = ${fmt(d.quedaPct, 2)} % ${d.quedaOk ? '≤' : '>'} 2 %`
        : 'aguardando comprimento ou corrente do trecho'}`; });
    const cel = (v) => `<td style="${TD8};color:${TX1}">${v}</td>`;
    const linhas = trechosCalc.map((tr, i) => { const d = tr.d; const I = tr.circuito ? d.Ib : d.In;
      return `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD8};font-weight:600;color:${INK}">${tr.titulo}</td>${cel(I ? fmt(I, I % 1 ? 1 : 0) + ' A' : '[XX]')}${cel(d.secao ? fmt(d.secao) + ' mm²' : '[XX]')}${cel(d.L ? fmt(d.L) + ' m' : '[XX]')}${cel(d.V + ' V')}${cel(fqDe(d))}<td style="${TD8};color:${TX1}${d.quedaOk ? '' : ';color:#C0392B;font-weight:600'}">${d.quedaPct ? fmt(d.quedaPct, 2) + ' %' : '[XX]'}</td>${cel(d.quedaPct ? (d.quedaOk ? `<span style="color:${GREEN_D};font-weight:600">Atende</span>` : `<span style="color:#C0392B;font-weight:600">Reavaliar</span>`) : `<span style="color:${G2}">Pendente</span>`)}</tr>`; });
    return `<div class="bg-keep" style="border:1px solid ${LN1};${R};padding:9px 12px;margin-bottom:10px;font-family:${MONO};font-size:9px;line-height:1.8;color:${INK}">${lin.join('<br />')}</div>
  <table style="width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:12px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH8}">Trecho</th><th style="${TH8}">I</th><th style="${TH8}">S</th><th style="${TH8}">L</th><th style="${TH8}">V</th><th style="${TH8}">Fator</th><th style="${TH8}">ΔV</th><th style="${TH8}">Situação</th></tr></thead>
    <tbody>${linhas.join('\n    ')}</tbody>
  </table>`;
  })()}
  ${conclusao(`${algumaQuedaRuim ? 'Há trecho com queda de tensão acima de 2 %, marcado como "Reavaliar" no item 5.6: adotar a seção seguinte ou revisar o traçado.' : 'A queda de tensão de todos os trechos fica dentro do limite de 2 %.'} O cálculo de cada trecho está no item 5.5 e o resumo no item 5.6.`, 18)}
  ${h3('8.2 · Corrente de curto-circuito e solicitação térmica')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">Verifica-se se as seções adotadas suportam a solicitação térmica do curto-circuito durante o tempo de atuação da proteção:</p>
  ${formula('S<sub>mín</sub> = √(I<sub>k</sub>² · t) / k', `I<sub>k</sub> = corrente de curto-circuito presumida no ponto [kA] · t = tempo de atuação da proteção [s] · k = 143 para cobre com isolação HEPR/EPR (NBR 5410)`)}
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:12px"><tbody>
    ${trKV('Corrente de curto-circuito presumida no quadro (I<sub>k</sub>)', p.ikPresumida ? `${esc(String(p.ikPresumida).replace('.', ','))} kA, informada pela concessionária ou calculada` : `<span style="color:${G2}">[XX] kA, informada pela concessionária ou calculada</span>`, '56%')}
    ${trKV('Tempo de atuação do disjuntor (t)', '≤ 0,1 s (atuação magnética)')}
    ${trKV('Capacidade de interrupção do disjuntor (I<sub>cn</sub>)', `≥ ${p.ikPresumida ? Math.max(5, Math.ceil(Number(String(p.ikPresumida).replace(',', '.')))) : 5} kA · a confirmar contra I<sub>k</sub> local`)}
    <tr><td style="${KV};color:${G1}">Seção mínima resultante</td><td style="${KV};font-weight:600;color:${GREEN_D}">inferior às seções adotadas em todos os trechos (item 5.6)</td></tr>
  </tbody></table>
  ${conclusao(`As seções adotadas suportam a solicitação térmica de curto-circuito com os disjuntores especificados. A capacidade de interrupção de cada dispositivo é validada contra a corrente presumida no ponto de instalação antes da aquisição.`, 18)}
  ${h3('8.3 · Impacto na demanda da unidade')}
  <table style="width:100%;border-collapse:collapse;font-size:10px"><tbody>
    ${trKV('Disjuntor geral existente', phn(c.geral, 'A'), '56%')}
    ${trKV(c.trafo ? 'Corrente na entrada do transformador (pior caso)' : (multi ? 'Consumo máximo somado das estações' : 'Consumo máximo da estação de recarga'), c.trafo && c.entradaFormula ? `${fmt(c.correnteEntrada, 1)} A (P / V / √3 = ${c.entradaFormula})`.replace(' / √3 = ', c.entradaFormula.includes('√3') ? ' / √3 = ' : ' = ') : phn(c.correnteEntrada, 'A'))}
    ${trKV('Participação da nova carga na capacidade instalada', c.participacao ? `${fmt(c.participacao, 1)} %` : `<span style="color:${G2}">[XX] %</span>`)}
    ${trKV('Janela típica de recarga', 'período noturno, com baixa coincidência com o pico da unidade')}
    ${naoIndica ? '' : `<tr><td style="${KV};color:${G1}">Necessidade de aumento de demanda</td><td style="${KV};font-weight:600;color:#C0392B">Indicada (ver conclusão, seção ${NUM.conclusao})</td></tr>`}
  </tbody></table>
</div>`);

    // ══ ATERRAMENTO ══
    const linhasAterr = semAterr ? [
      ['Esquema de aterramento', 'TT: eletrodo de aterramento próprio do circuito da estação, com condutor de proteção em todo o percurso'],
      ['Eletrodo de aterramento', 'Hastes de aço cobreado cravadas no local pela BeGreen, interligadas e com caixa de inspeção; podem ser dedicadas exclusivamente à estação de recarga'],
      ['Conexão do PE', 'Condutor de aterramento do eletrodo ao barramento PE do quadro da estação de recarga, por terminal de compressão identificado'],
      ['Equipotencialização', 'Não aplicável: não há sistema de aterramento existente no imóvel com o qual equipotencializar'],
      ['Continuidade', 'Ensaio de continuidade do PE registrado no comissionamento'],
      ['Resistência de aterramento', 'Medida e registrada; referência ≤ 10 Ω, acrescentando hastes até atingir o valor'],
      ['Identificação', 'Condutor na cor verde ou verde-amarela, jamais utilizado como condutor de retorno'],
    ] : [
      ['Esquema de aterramento', `${aterr}, com condutor de proteção próprio em todo o percurso`],
      ['Conexão do PE', 'Barramento de proteção do quadro existente, por terminal de compressão identificado'],
      ['Equipotencialização', 'Invólucro metálico do quadro, eletroduto galvanizado e carcaça da estação ligados ao PE'],
      ['Continuidade', 'Ensaio de continuidade do PE registrado no comissionamento'],
      ['Resistência de aterramento', 'Medida e registrada; valor de referência ≤ 10 Ω para o sistema da edificação'],
      ['Identificação', 'Condutor na cor verde ou verde-amarela, jamais utilizado como condutor de retorno'],
    ];
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.aterramento, TIT.aterramento, 'aterramento')}
  ${emResumo(semAterr
    ? 'O imóvel não possui sistema de aterramento. A BeGreen executa um aterramento novo, com hastes cravadas no local, que pode ser dedicado exclusivamente à estação de recarga. Como não há malha existente, não se aplica a equipotencialização com outras partes metálicas da instalação.'
    : 'O aterramento da estação de recarga é ligado ao sistema de aterramento já existente do imóvel, nunca a uma haste isolada só para a estação (prática perigosa e vedada por norma). Assim, todas as partes metálicas ficam no mesmo potencial elétrico.')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 12px">${semAterr
    ? 'Na ausência de sistema de aterramento na edificação, o condutor de proteção do circuito da estação é conectado a um eletrodo de aterramento novo, executado pela BeGreen com hastes de aço cobreado cravadas no local, interligadas e acessíveis por caixa de inspeção. Esse eletrodo pode ser exclusivo da estação de recarga, configurando esquema TT para o circuito, e sua resistência é medida e registrada no comissionamento.'
    : 'O condutor de proteção do circuito da estação é conectado ao barramento de proteção (PE) do quadro existente e integra-se ao sistema de aterramento da edificação. Não se admite eletrodo de aterramento isolado, exclusivo da estação: a prática cria diferença de potencial entre massas e é vedada pelo princípio de equipotencialização da NBR 5410.'}</p>
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:14px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH};width:36%">Requisito</th><th style="${TH}">Critério adotado</th></tr></thead>
    <tbody>
      ${linhasAterr.map(([k, v], i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD};font-weight:600;color:${INK}">${k}</td><td style="${TD};color:${TX1}">${v}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
  <div class="bg-keep" style="background:${INK};${R};padding:14px 16px"><div style="${KICK};color:${GREEN_L}">Limite de escopo</div><p style="font-size:10px;line-height:1.65;color:#E9EAE6;margin:5px 0 0">${semAterr
    ? 'O eletrodo executado atende ao circuito da estação de recarga. Este memorial não abrange o aterramento das demais instalações do imóvel nem a verificação de que a instalação preexistente atende às normas vigentes; essa adequação é responsabilidade da contratante e pode ser objeto de laudo específico, contratável à parte.'
    : 'Este memorial não se responsabiliza pelo dimensionamento do condutor de proteção do quadro existente, nem pela verificação de que a instalação preexistente atende às normas vigentes e suporta a adição da estação de recarga. A comprovação dessa adequação é responsabilidade da contratante e pode ser objeto de laudo específico, contratável à parte.'}</p></div>
</div>`);

    // ══ MULTIPONTO (apenas quando a análise de demanda foi realizada) ══
    if (analiseFeita) {
      out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.multiponto, TIT.multiponto, 'multiponto')}
  ${emResumo('Para várias estações de recarga, medimos por <strong>8 dias</strong> a energia disponível no prédio e distribuímos essa potência entre os pontos ativos. Cada usuário paga apenas a própria recarga, e a infraestrutura é dimensionada com reserva para novos pontos.')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">Quando o projeto envolver mais de um ponto de recarga (condomínios, frotas e estacionamentos coletivos), aplicam-se, além de todos os critérios anteriores, os requisitos a seguir. Nesse caso, cada ponto mantém seu <strong>circuito terminal dedicado</strong> e sua <strong>proteção individual</strong>.</p>
  ${h3(NUM.multiponto.replace(/^0/, '') + '.1 · Análise de demanda realizada')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">A BeGreen instalou equipamento próprio de medição no sistema elétrico da edificação. A medição contínua por <strong>8 dias</strong> resultou em relatório técnico com a potência disponível para recarga simultânea sem comprometer as demais cargas.</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
    ${card10('8', 'dias de medição', 'Equipamento conectado ao sistema elétrico da edificação')}
    ${card10(phn(window.Calc.num(p.potenciaDisponivel), 'kW'), 'potência disponível', 'Resultado medido, base do dimensionamento do alimentador')}
    ${card10(phn(window.Calc.num(p.pontosSimultaneos), ''), 'pontos simultâneos', 'Com balanceamento dinâmico de carga ativo')}
  </div>
  ${h3(NUM.multiponto.replace(/^0/, '') + '.2 · Requisitos adicionais')}
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:14px">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH};width:32%">Item</th><th style="${TH}">Critério</th></tr></thead>
    <tbody>
      ${[['Quadro de distribuição', 'Quadro dedicado à recarga, derivado do disjuntor da unidade consumidora correspondente a cada ponto'],
        ['Infraestrutura troncal', 'Eletrocalhas pré-zincadas de 300×100 / 100×100 / 50×50 mm, com furos técnicos entre pavimentos próximos ao centro de medição'],
        ['Ramais até as vagas', `Eletrodutos individuais por vaga, dimensionados por faixa de distância; cabeamento por ponto conforme item ${NUM.condutores}`],
        ['Fator de agrupamento', 'Aplicado conforme tabela 42 da NBR 5410 a cada trecho com múltiplos circuitos no mesmo conduto ou calha'],
        ['Balanceamento de carga', 'Gestão dinâmica que distribui a potência disponível entre as estações ativas, respeitando o limite medido'],
        ['Medição individual', 'Registro do consumo por estação, com rateio individual: cada usuário paga apenas a própria recarga'],
        ['Gestão e protocolo', 'Estações compatíveis com OCPP 1.6, integradas à plataforma de gestão e monitoramento remoto'],
        ['Expansibilidade', 'Infraestrutura troncal dimensionada com reserva para novos pontos, o que evita nova obra civil a cada adesão'],
      ].map(([t, d], i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD};font-weight:600;color:${INK}">${t}</td><td style="${TD};color:${TX1}">${d}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
  <p style="font-size:9.5px;line-height:1.65;color:${G1};margin:0 0 14px">Para projetos multiponto, o dimensionamento é apresentado por vaga nos itens 5.5 e 5.6, com identificação, seção, comprimento, proteção e queda de tensão de cada ramal.</p>
  ${(() => {
    const disp = window.Calc.num(p.potenciaDisponivel) || 0;
    const simult = window.Calc.num(p.pontosSimultaneos) || 0;
    const pots = pts.map(x => x.P).filter(Boolean);
    const pMin = pots.length ? Math.min(...pots) : 0;
    const pRef = pots.length ? (pots.every(v => v === pots[0]) ? pots[0] : c.totalKw / pots.length) : 0;
    const cabem = disp && pRef ? Math.floor(disp / pRef) : 0;
    const sobra = disp && c.totalKw ? disp - c.totalKw : 0;
    if (!disp) return conclusao('A potência disponível medida será informada ao final da análise de demanda, com a quantidade de estações de recarga que podem operar simultaneamente nessa potência.');
    const fraseCabem = pRef
      ? `Com estações de recarga de ${pots.every(v => v === pots[0]) ? fmt(pRef) + ' kW' : 'potência média de ' + fmt(pRef, 1) + ' kW'}, essa potência permite que <strong>${fmt(cabem)} estação(ões) de recarga</strong> carreguem ao mesmo tempo em potência plena.`
      : 'A quantidade de estações de recarga que podem carregar ao mesmo tempo depende da potência de cada ponto.';
    const fraseSimult = simult
      ? (cabem && simult > cabem
        ? ` O projeto prevê <strong>${fmt(simult)} pontos simultâneos</strong>, ou seja, ${fmt(simult)} estações de recarga em uso ao mesmo tempo. Como isso supera os ${fmt(cabem)} que a potência medida comporta em potência plena, o balanceamento dinâmico de carga reduz a potência de cada ponto em uso para que o conjunto nunca ultrapasse os ${fmt(disp)} kW medidos.`
        : ` O projeto prevê <strong>${fmt(simult)} pontos simultâneos</strong>, ou seja, até ${fmt(simult)} estações de recarga em uso ao mesmo tempo em potência plena; os demais pontos instalados entram conforme a potência é liberada pelo balanceamento dinâmico de carga.`)
      : '';
    const fraseTotal = c.totalKw ? (sobra >= 0
      ? ` Os ${fmt(n)} ponto(s) deste projeto somam ${fmt(c.totalKw)} kW, dentro da potência disponível, com sobra de ${fmt(sobra, 1)} kW${pMin ? (Math.floor(sobra / pMin) >= 1 ? `, suficiente para até ${fmt(Math.floor(sobra / pMin))} estação(ões) de recarga adicional(is) de ${fmt(pMin)} kW` : `, insuficiente para mais uma estação de recarga de ${fmt(pMin)} kW em potência plena`) : ''}.`
      : ` Os ${fmt(n)} ponto(s) deste projeto somam ${fmt(c.totalKw)} kW, acima da potência disponível; o balanceamento dinâmico de carga limita o conjunto aos ${fmt(disp)} kW medidos, distribuindo a potência entre os pontos em uso.`) : '';
    return conclusao(`A medição de 8 dias indicou <strong>${fmt(disp)} kW</strong> disponíveis para recarga sem comprometer as demais cargas do imóvel. ${fraseCabem}${fraseSimult}${fraseTotal}`);
  })()}
</div>`);
    }

    function card10(v, t, d) {
      return `<div style="background:${BG1};${R};padding:12px 13px"><div style="font-family:${OSW};font-size:22px;font-weight:500;color:${INK};line-height:1">${v}</div><div style="font-family:${OSW};font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:${GREEN};margin-top:3px">${t}</div><div style="font-size:9px;color:${G1};line-height:1.5;margin-top:4px">${d}</div></div>`;
    }

    // ══ SINALIZAÇÃO + ILUSTRAÇÕES PADRÃO ══
    // Fotos fixas do memorial (arquivos em assets/ilustracoes/). Se um arquivo
    // não existir, a figura é ocultada sem quebrar o layout.
    const ILUSTRACOES = [
      { src: 'assets/ilustracoes/vaga-garagem-interna.jpg', legenda: 'Padrão vaga em garagem interna' },
      { src: 'assets/ilustracoes/quadro-geral-botao-desligamento.jpg', legenda: 'Quadro geral e botão de desligamento geral próximo à saída de emergência' },
    ];
    const ilustracoesHtml = `<div style="margin-top:16px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 12px">
    ${ILUSTRACOES.map((f, i) => `<figure class="bg-keep" style="margin:0;break-inside:avoid">
      <img src="${f.src}" alt="Foto ${i + 1}" onerror="this.closest('figure').style.display='none'" style="width:100%;${R};display:block;border:1px solid ${LN1}" />
      <figcaption style="font-size:9px;line-height:1.5;color:${TX2};margin-top:5px"><strong style="font-family:${OSW};font-weight:500;color:${GREEN_D}">Foto ${i + 1}.</strong> ${esc(f.legenda)}</figcaption>
    </figure>`).join('\n    ')}
  </div></div>`;
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.sinalizacao, TIT.sinalizacao, 'sinalizacao')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">Em edificações sujeitas à Instrução Técnica de inserção de veículos elétricos do Corpo de Bombeiros, o projeto contempla os dispositivos de desligamento e a sinalização a seguir. Sua aplicabilidade é confirmada conforme a ocupação e o porte da edificação.</p>
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:0">
    <thead><tr style="background:${INK};color:#fff"><th style="${TH};width:34%">Dispositivo</th><th style="${TH}">Requisito de projeto</th></tr></thead>
    <tbody>
      ${[['Desligamento local', 'Botoeira de emergência junto à estação, de acionamento imediato e sinalizada'],
        ['Desligamento geral', 'Comando único capaz de desenergizar todas as estações, em local de fácil acesso à brigada'],
        ['Interligação com alarme', 'Corte automático da recarga ao acionamento do sistema de alarme de incêndio da edificação'],
        ['Placas de sinalização', 'Identificação de quadros, desligamento local, desligamento geral e da própria estação'],
        ['Identificação de circuitos', 'Etiquetagem indelével de cada circuito e dispositivo no quadro, com diagrama afixado internamente'],
        ['Advertência de risco', 'Placa de risco elétrico e instrução de uso visível na área de recarga'],
      ].map(([t, d], i) => `<tr${i % 2 ? ` style="background:${BG2}"` : ''}><td style="${TD};font-weight:600;color:${INK}">${t}</td><td style="${TD};color:${TX1}">${d}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
  ${ilustracoesHtml}
  <div style="height:14px"></div>
  ${conclusao('Em garagens fechadas, a BeGreen adota as regras impostas pelo Corpo de Bombeiros do estado onde a instalação é executada: desligamento local junto à estação, desligamento geral de fácil acesso à brigada, interligação com o alarme de incêndio e a sinalização correspondente, conforme a instrução técnica vigente no estado.')}
</div>`);

    // ══ DIAGRAMA UNIFILAR ══
    const resumoDiag = (() => {
      const d = pt.disjuntor ? `${fmt(pt.disjuntor)} A` : '[XX] A';
      const cabo = pt.caboDesc || '[XX] mm²';
      const el = pt.eletroduto || '[Ø]';
      const kitTrecho = pt.usaKit ? ` → kit de proteção (disj. térmico ${d} + IDR ${pt.idr ? fmt(pt.idr) + ' A' : '[XX] A'} / 30 mA Tipo A + ${pt.lig.dpsQtd} DPS ${pt.dpsTensao} V / ${fmt(pt.dpsKa)} kA Classe II)` : '';
      const aliTxt = c.alimentador ? fmt(c.alimentador) + ' A' : '[XX] A';
      const qdaTxt = c.qdGeral ? fmt(c.qdGeral, c.qdGeral % 1 ? 1 : 0) + ' A' : '[XX] A';
      const origem = c.topologia === 'quadro'
        ? (c.trafo
          ? `QGBT (disjuntor dedicado ${aliTxt}) → QDA Transformador (disjuntor ${c.trafo.disjuntor ? fmt(c.trafo.disjuntor) + ' A' : '[XX] A'}) → transformador ${c.trafo.kva ? fmt(c.trafo.kva) + ' kVA' : '[XX] kVA'} (${c.trafo.primV ? fmt(c.trafo.primV) + ' V ' + c.trafo.primLig : '[XX]'} / ${c.trafo.secV ? fmt(c.trafo.secV) + ' V ' + c.trafo.secLig : '[XX]'}${c.trafo.ip ? ', ' + c.trafo.ip : ''}) → QDA (disjuntor de entrada ${qdaTxt}) → disjuntor ${d} curva C por circuito`
          : `QGBT (disjuntor dedicado ${aliTxt}, que separa o circuito das estações de recarga das demais cargas) → QDA (disjuntor de entrada ${qdaTxt}) → disjuntor ${d} curva C por circuito`)
        : `QGBT → disjuntor exclusivo ${d} curva C`;
      return `${origem}${kitTrecho} → circuito ${cabo} HEPR 1 kV em eletroduto de ${el} → estação de recarga${multi ? ` (${n} circuitos, C-EV-01 a ${pts[n - 1].id})` : ''}`;
    })();
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.diagrama, TIT.diagrama, 'diagrama')}
  <p style="font-size:10px;line-height:1.6;color:${G1};margin:0 0 10px">Diagrama gerado a partir dos dados de projeto desta obra, com simbologia de projeto elétrico. A prancha em escala, assinada pelo responsável técnico, acompanha o documento.</p>
  <figure class="bg-keep" style="margin:0"><div style="${R};overflow:hidden;border:1px solid ${LN1};margin-bottom:8px">${window.Diagrama.gerar(c, p.docNum)}</div>
  <figcaption style="font-size:9px;line-height:1.6;color:${G2};margin:0">Figura 1. ${esc(resumoDiag)}</figcaption></figure>
</div>`);

    // ══ OBSERVAÇÕES + CONCLUSÃO ══
    const obsExtra = p.observacoes && p.observacoes.trim()
      ? `<div class="bg-keep" style="background:${BG1};${R};padding:14px 16px;margin:0 0 22px"><div style="${KICK};color:${GREEN}">Escopo e observações específicas desta obra</div>${p.observacoes.trim().split(/\n+/).map(l => `<p style="font-size:10px;line-height:1.65;color:${TX2};margin:6px 0 0">${esc(l)}</p>`).join('')}</div>` : '';
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.observacoes, 'Observações finais e limites de escopo', 'observacoes')}
  <ol style="font-size:10.5px;line-height:1.7;color:${TX1};margin:0 0 ${obsExtra ? 14 : 22}px;padding-left:18px">
    <li style="margin-bottom:5px">Este projeto é responsável pelo dimensionamento dos componentes que fazem parte da instalação elétrica descrita, não abrangendo elementos de arquitetura, estrutura ou instalações de outras disciplinas.</li>
    <li style="margin-bottom:5px">As informações da estação de recarga foram fornecidas pelo fornecedor do produto. Qualquer alteração de modelo, características ou versão do equipamento é de responsabilidade da contratante e implica revisão deste memorial.</li>
    <li style="margin-bottom:5px">A aquisição dos componentes de instalação é de responsabilidade da empresa contratada para executar a obra; o projeto determina apenas características e dimensionamentos.</li>
    <li style="margin-bottom:5px">As distâncias entre os componentes do circuito foram levantadas em vistoria técnica. Divergências encontradas em campo devem ser comunicadas ao responsável técnico antes da execução.</li>
    <li style="margin-bottom:5px">O condutor de proteção será conectado ao barramento de proteção do quadro existente.</li>
    <li style="margin-bottom:5px">Este memorial não se responsabiliza pelo dimensionamento do condutor de proteção do quadro existente, nem pela informação de que a instalação preexistente atende às normas ABNT e suporta a adição da estação de recarga, responsabilidade da contratante.</li>
    <li style="margin-bottom:5px">Não estão incluídos: adequação do padrão de entrada, aumento de demanda junto à concessionária, obras civis de recomposição de pavimento e paisagismo, salvo previsão contratual expressa.</li>
    <li>Alterações de escopo, de local de instalação ou de premissas exigem revisão formal deste documento, com nova emissão e novo número de revisão.</li>
  </ol>
  <div class="bg-keep" style="background:${RESUMO_BG};border-left:4px solid ${GREEN};${R};padding:11px 14px;margin:0 0 22px"><div style="${KICK};color:${GREEN_D}">Cabos</div><p style="font-size:10px;line-height:1.6;color:${TX1};margin:4px 0 0">A BeGreen utiliza exclusivamente cabos com <strong>dupla isolação 1 kV</strong> (classe 0,6/1 kV, isolação HEPR 90 °C e cobertura externa), em todos os trechos do circuito, do QGBT à estação de recarga.</p></div>
  ${obsExtra}
  ${secHeader(NUM.conclusao, TIT.conclusao, 'conclusao')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 10px">O disjuntor geral da unidade possui corrente de <strong>${phn(c.geral, 'A')}</strong>. ${multi ? 'As estações de recarga, operando' : 'A estação de recarga, operando'} em sua capacidade máxima (bateria do veículo completamente descarregada), apresenta${multi ? 'm' : ''} consumo de <strong>${phn(c.totalIb, 'A')}</strong>${c.trafo ? `; no primário do transformador, pior caso considerado para a entrada, a corrente é de <strong>${c.correnteEntrada ? fmt(c.correnteEntrada, 1) + ' A' : '[XX] A'}</strong>` : ''}${c.participacao ? ` (${fmt(c.participacao, 1)} % da capacidade instalada)` : ''}. As recargas ocorrem, tipicamente, no período noturno, quando o consumo da unidade é reduzido, por isso a coincidência entre a nova carga e o pico da instalação é baixa.</p>
  ${naoIndica
    ? `<p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">Considerando todos os pontos levantados, a entrada de energia existente atende à nova carga e a recarga poderá ocorrer sem prejuízo à instalação elétrica existente.</p>`
    : `<p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">Considerando todos os pontos levantados, <strong>indicamos</strong> a alteração do padrão de entrada para aumento de demanda. A adequação junto à concessionária deve preceder a energização da estação.</p>`}
  <div class="bg-keep" style="background:${INK};${R};padding:16px 18px"><div style="${KICK};color:${GREEN_L}">Parecer técnico</div><p style="font-size:11px;line-height:1.65;color:#fff;margin:6px 0 0;font-weight:500">Os dimensionamentos apresentados atendem integralmente à ABNT NBR 5410 e aos requisitos complementares da ABNT NBR 17019, com margem de segurança nos critérios de capacidade de condução, queda de tensão e solicitação térmica. A instalação está apta a ser executada conforme especificado neste memorial.</p></div>
</div>`);

    // ══ ART ══
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.art, TIT.art, 'art')}
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">O projeto e a execução são acompanhados por engenheiro eletricista responsável, com Anotação de Responsabilidade Técnica (ART) registrada no CREA, emitida para a atividade de execução. A ART é entregue ao cliente junto à documentação da obra.</p>
  <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:26px"><tbody>
    ${trKV('Responsável técnico', 'Eng. Kauê B. Angeli · CREA 5070656487 · Cel. (11) 9.5753-0797', '44%')}
    ${trKV('ART de execução', p.artExecucao ? `Nº ${esc(p.artExecucao)}` : `Nº <span style="color:${G2}">[XXXXXXXXXX]</span>`)}
    ${trKV('Garantia', '12 meses sobre materiais e serviços executados')}
    ${trKV('Seguro de obra', 'Cobertura de até R$ 1.000.000,00 para avarias a terceiros')}
    ${trKV('Sistema de gestão', 'Processos de projeto e obra certificados ISO 9001')}
  </tbody></table>
  <div class="bg-keep" style="border-top:1px solid ${LN1};padding-top:14px;display:flex;align-items:flex-end;justify-content:space-between;gap:20px">
    <img src="assets/begreen-logo-dark.png" alt="BeGreen" style="height:22px;width:auto;display:block" />
    <div style="font-size:9px;line-height:1.7;color:${G1};text-align:right">BeGreen · mybegreen.com.br<br />@my.begreen · +12.000 pontos de recarga instalados · 17 anos de setor</div>
  </div>
</div>`);

    // ══ GLOSSÁRIO ══
    const GLOS = [
      ['BEV', 'veículo elétrico a bateria, tracionado exclusivamente por energia elétrica armazenada.'],
      ['PHEV', 'veículo híbrido plug-in, recarregável pela rede elétrica.'],
      ['EVSE', 'equipamento de alimentação de veículo elétrico; a estação de recarga propriamente dita.'],
      ['Modo 3', 'recarga em corrente alternada por circuito dedicado, com controle e comunicação permanentes entre estação e veículo (IEC 61851).'],
      ['Type 2', 'padrão de conector para recarga condutiva em CA (IEC 62196-2).'],
      ['IDR', 'interruptor diferencial-residual; desliga o circuito ao detectar corrente de fuga.'],
      ['Tipo A', 'classe de IDR sensível a correntes residuais alternadas e pulsantes contínuas.'],
      ['DPS', 'dispositivo de proteção contra surtos; limita sobretensões transitórias.'],
      ['Kit de proteção', 'conjunto disjuntor térmico + IDR + DPS instalado junto ao circuito da estação de recarga (até 30 kW).'],
      ['PE', 'condutor de proteção (terra), na cor verde ou verde-amarela.'],
      ['HEPR', 'isolação de borracha etileno-propileno de alto módulo, temperatura de operação de 90 °C.'],
      ['I<sub>b</sub> · I<sub>n</sub> · I<sub>z</sub>', 'corrente de projeto do circuito · corrente nominal do dispositivo de proteção · capacidade de condução do condutor.'],
      ['I<sub>k</sub>', 'corrente de curto-circuito presumida no ponto considerado.'],
      ['Linhas tipo D e B1', 'métodos de instalação de referência da tabela 36 da NBR 5410: D para eletroduto enterrado, B1 para eletroduto embutido em alvenaria ou aparente.'],
      ['Balanceamento de carga', 'distribuição dinâmica da potência disponível entre as estações ativas.'],
      ['OCPP', 'protocolo aberto de comunicação entre estações de recarga e plataforma de gestão.'],
      ['ART', 'Anotação de Responsabilidade Técnica registrada no CREA.'],
    ];
    out.push(`<div style="font-family:Montserrat,sans-serif">
  ${secHeader(NUM.glossario, TIT.glossario, 'glossario')}
  <div style="column-count:2;column-gap:10mm;font-size:9.5px;line-height:1.6;color:${TX1}">
    ${GLOS.map(([t, d], i) => `<p style="margin:0${i === GLOS.length - 1 ? '' : ' 0 7px'}"><strong style="font-family:${OSW};font-weight:500;color:${INK}">${t}</strong>: ${d}</p>`).join('\n    ')}
  </div>
</div>`);

    // ══ ANEXO FOTOGRÁFICO (quando houver fotos) ══
    if (temFotos) {
      const fotos = p.fotos.map((f, i) => `<figure style="margin:0;break-inside:avoid">
      <img src="${f.data}" alt="Foto ${i + 1}" style="width:100%;height:62mm;object-fit:cover;display:block;border:1px solid ${LN1};${R}" />
      <figcaption style="font-size:9px;line-height:1.5;color:${TX2};margin-top:5px"><strong style="font-family:${OSW};font-weight:500;color:${GREEN_D}">Foto ${String(i + 1).padStart(2, '0')}.</strong> ${f.legenda ? esc(f.legenda) : `<span style="color:${G2}">[legenda]</span>`}</figcaption>
    </figure>`).join('\n    ');
      out.push(`<div style="font-family:Montserrat,sans-serif">
  <div data-sec-key="anexo" style="display:flex;align-items:baseline;gap:14px;border-top:3px solid ${INK};padding-top:10px;margin-bottom:14px">
    <div style="font-family:${OSW};font-weight:600;font-size:30px;line-height:1;color:${GREEN}">A</div>
    <h2 style="font-family:${OSW};font-weight:600;font-size:22px;line-height:1.1;text-transform:uppercase;color:${INK};margin:0;letter-spacing:.01em">Anexo fotográfico</h2>
  </div>
  <p style="font-size:11px;line-height:1.7;color:${TX1};margin:0 0 14px">Registro fotográfico da vistoria técnica realizada no LOCAL DO PROJETO, documentando as condições encontradas e os pontos de instalação considerados no dimensionamento.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 12px">
    ${fotos}
  </div>
</div>`);
    }

    return out;
  }

  // Cabeçalho e rodapé repetidos por página
  function header() {
    return `<div style="display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid ${LN1};font-family:Montserrat,sans-serif">
  <img src="assets/begreen-logo-dark.png" alt="BeGreen" style="height:15px;width:auto;display:block" />
  <div style="font-family:${OSW};font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:${G2}">Memorial Descritivo · Infraestrutura de Recarga para Veículos Elétricos</div>
</div>`;
  }
  function footer(p, num, total) {
    const docNum = p.docNum && p.docNum.trim() ? esc(p.docNum) : 'BG-ME-XX-XXXX';
    const pagina = num ? ` · Página ${num}${total ? ' de ' + total : ''}` : '';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid ${LN1};font-family:Montserrat,sans-serif;font-size:7.5px;letter-spacing:.06em;color:${G2}">
  <div>${docNum} · Rev. ${esc(p.revisao || '00')} · ${dataBrTxt(p.dataRevisao)}${pagina}</div>
  <div style="display:flex;align-items:center;gap:6px"><span style="width:5px;height:5px;border-radius:2px;background:${GREEN};display:inline-block"></span>BeGreen · mybegreen.com.br</div>
</div>`;
  }

  window.Template = { folhas, header, footer };
})();
