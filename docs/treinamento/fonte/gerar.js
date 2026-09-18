// Gera o treinamento do GMD (versão 2 · set/2026) no layout BeGreen: 20 × 11,25 pol,
// slides escuros e claros alternados, cantos arredondados, Oswald + Montserrat.
// Marcadores numerados são desenhados SOBRE as capturas, nas posições medidas no app (RECTS).
const pptxgen = require('pptxgenjs');
const path = require('path');

const SHOTS = path.join(__dirname, '..', 'shots');
const ASSETS = '/Users/kauebrunetti/Desktop/AA IA/1. GMD - Gerador Memorial Descritivo/assets';
const OUT = '/Users/kauebrunetti/Desktop/AA IA/1. GMD - Gerador Memorial Descritivo/docs/treinamento/GMD - Treinamento do time de projetos.pptx';
const FOTO = path.join(ASSETS, 'fundo.png');

const C = { ink: '1B1C1B', card: '343633', light: 'F2F3F0', white: 'FFFFFF', green: '3AAA35', greenD: '2E8C2A', lime: 'D2D727', g1: '6E736D', g2: '8A8B83', g3: 'A9ADA7', ln: 'D8DAD4' };
const URL = 'gmd.mybegreen.com.br';
const TITULO = 'GMD · Treinamento do time de projetos';

// Capturas: janela 1440×860 CSS px em 2×. Recortes = deslocamento (px 2×) de cada imagem dentro da captura cheia.
const CROPS = {
  tela: [0, 0], login_crop: [960, 300], menu_crop: [1560, 0], modelos_crop: [534, 491], catalogo_crop: [534, 99], equipe_crop: [534, 606],
  metricas_crop: [534, 434], card_crop: [0, 240], combo_crop: [0, 240], etapa2_crop: [0, 240], etapa6_crop: [0, 240], pend_crop: [1150, 0], topo_crop: [0, 0],
  bola_crop: [0, 240], doc2_crop: [750, 172], doc9_crop: [750, 172], doc17_crop: [750, 172],
  tira_rev: [870, 470], tira_tab56: [870, 1540], tira_diagrama: [870, 550], tira_tela: [0, 560], tira_recolhido: [0, 240], tira_catalogo: [534, 399],
};
// Posições [x, y, w, h] em CSS px na janela 1440×860 (medidas no navegador com a mesma cena)
const R = {
  fluxo: [346, 19, 230, 28], pend: [597, 19, 223, 27], busca: [891, 10, 340, 31], menu: [1245, 15, 75, 35], pdf: [1334, 16, 90, 34], card: [18, 104, 418, 738], preview: [440, 86, 1000, 774],
  etapas: [34, 156, 386, 6], nav: [32, 778, 390, 52], recolher: [32, 116, 390, 28], cliente: [49, 301, 356, 35], pulada: [112, 156, 35, 6], novaRev: [49, 594, 356, 33],
  m_modelos: [1109, 111, 308, 38], m_duplicar: [1099, 185, 328, 34], m_branco: [1109, 67, 308, 38], m_catalogo: [1099, 310, 328, 34], m_equipe: [1099, 402, 328, 34], m_metricas: [1099, 369, 328, 34],
  mod_busca: [286, 308, 868, 35], mod_usar: [1056, 394, 51, 29], mod_grupo: [287, 354, 866, 30], mod_excluir: [1115, 396, 26, 25], mod_salvar: [835, 542, 160, 24],
  c_combo: [232, 343, 160, 35], c_lista: [62, 382, 330, 320], c_potencia: [62, 394, 103, 37], c_conector: [175, 394, 103, 37], c_disjuntor: [289, 394, 103, 35], c_aplicar: [283, 297, 109, 21], c_dps: [49, 685, 356, 37], c_internet: [49, 749, 356, 37],
  t_cabo: [49, 301, 356, 37], t_temp: [49, 364, 173, 35], t_queda: [49, 426, 173, 35], t_trecho: [62, 484, 330, 15], t_metodo: [289, 548, 103, 37], t_resumo: [62, 655, 330, 31], t_L: [175, 523, 103, 35],
  p_head: [597, 19, 225, 27], p_lista: [597, 54, 380, 89], p_ultimo: [598, 111, 378, 25],
  metr_cards: [286, 280, 868, 65], metr_gestor: [286, 355, 868, 15], metr_semana: [286, 441, 868, 15], metr_pend: [286, 554, 868, 15],
  l_email: [558, 407, 324, 35], l_senha: [558, 468, 324, 35], l_btn: [558, 519, 324, 38], l_links: [558, 571, 324, 14],
  d_cab: [443, 131, 658, 52], d_indice: [443, 381, 658, 33], d_rev: [443, 249, 658, 106], d_rod: [443, 1116, 658, 47], d_tab56: [443, 800, 658, 146], d_svg: [444, 285, 656, 711],
  bola: [18, 122, 68, 68],
};

const pptx = new pptxgen();
pptx.defineLayout({ name: 'BG', width: 20, height: 11.25 });
pptx.layout = 'BG';
pptx.author = 'BeGreen Mobilidade Elétrica'; pptx.title = TITULO;
let n = 0;

// ── base ─────────────────────────────────────────────────────────
function base(dark, secao) {
  const s = pptx.addSlide(); n++;
  s.background = { color: dark ? C.ink : C.light };
  s.addImage({ path: path.join(ASSETS, dark ? 'begreen-logo-white.png' : 'begreen-logo-dark.png'), x: 17.65, y: 0.5, w: 1.77, h: 0.42 });
  s.addText(`${TITULO} · ${secao}`, { x: 1.15, y: 10.62, w: 12, h: 0.3, fontFace: 'Montserrat', fontSize: 10.5, color: dark ? C.g2 : C.g3 });
  s.addText(String(n), { x: 17.35, y: 10.62, w: 1.5, h: 0.3, fontFace: 'Oswald', fontSize: 11, color: dark ? C.g2 : C.g3, align: 'right' });
  s.dark = dark;
  return s;
}
function cabecalho(s, kicker, titulo) {
  s.addShape(pptx.ShapeType.roundRect, { x: 1.15, y: 1.06, w: 0.5, h: 0.28, fill: { color: s.dark ? C.lime : C.green }, line: { color: s.dark ? C.lime : C.green }, rectRadius: 0.14 });
  s.addText(kicker, { x: 1.8, y: 1.0, w: 17, h: 0.41, fontFace: 'Oswald', fontSize: 18, color: s.dark ? C.lime : C.green, charSpacing: 4 });
  s.addText(titulo, { x: 1.15, y: 1.55, w: 17.7, h: 0.9, fontFace: 'Oswald', fontSize: 44, bold: true, color: s.dark ? C.white : C.ink });
}
// foto de fundo com véu escuro (separadores, capa, encerramento)
function fotoFundo(s, veu) {
  s.addImage({ path: FOTO, x: 0, y: 0, w: 20, h: 11.25, sizing: { type: 'cover', w: 20, h: 11.25 } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 20, h: 11.25, fill: { color: C.ink, transparency: veu == null ? 28 : veu }, line: { color: C.ink, transparency: 100 } });
}
function divisor(num, titulo, sub, slides) {
  const s = pptx.addSlide(); n++; s.background = { color: C.ink }; fotoFundo(s, 30);
  s.addShape(pptx.ShapeType.roundRect, { x: 1.04, y: 2.6, w: 9.6, h: 6.4, fill: { color: C.ink, transparency: 18 }, line: { color: C.ink, transparency: 100 }, rectRadius: 0.3 });
  s.addText(`BLOCO ${num}`, { x: 1.6, y: 3.0, w: 8, h: 0.4, fontFace: 'Montserrat', fontSize: 18, color: C.lime, charSpacing: 4 });
  s.addText(num, { x: 1.6, y: 3.5, w: 8, h: 1.9, fontFace: 'Oswald', fontSize: 105, bold: true, color: C.lime });
  s.addText(titulo, { x: 1.6, y: 5.5, w: 8.6, h: 1.0, fontFace: 'Oswald', fontSize: 54, bold: true, color: C.white });
  s.addText(sub, { x: 1.6, y: 6.6, w: 8.4, h: 1.4, fontFace: 'Montserrat', fontSize: 20, color: C.g3 });
  s.addText(slides, { x: 1.6, y: 8.3, w: 8, h: 0.4, fontFace: 'Montserrat', fontSize: 14, color: C.g2 });
}
// bolinha numerada (lime)
function bolinha(s, x, y, num, d) {
  d = d || 0.44;
  s.addShape(pptx.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: C.lime }, line: { color: C.ink, width: 1.25 }, shadow: { type: 'outer', blur: 4, offset: 1, angle: 90, color: '000000', opacity: 0.35 } });
  s.addText(String(num), { x, y, w: d, h: d, fontFace: 'Oswald', fontSize: d > 0.4 ? 15 : 12, bold: true, color: C.ink, align: 'center', valign: 'middle', margin: 0 });
}
// lista numerada: título + uma linha curta
function itens(s, x, y, w, lista, opts) {
  opts = opts || {}; const gap = opts.gap || 1.0; const inicio = opts.inicio || 1;
  lista.forEach(([tit, txt], i) => {
    const yy = y + i * gap;
    bolinha(s, x, yy, inicio + i);
    s.addText([
      { text: tit, options: { fontFace: 'Oswald', fontSize: 17, bold: true, color: s.dark ? C.white : C.ink, breakLine: true } },
      { text: txt, options: { fontFace: 'Montserrat', fontSize: opts.fs || 14, color: s.dark ? C.g3 : C.g1 } },
    ], { x: x + 0.61, y: yy - 0.04, w: w - 0.61, h: gap - 0.08, valign: 'top', margin: 0 });
  });
}
function cartao(s, x, y, w, h, rotulo, tit, txt, opts) {
  opts = opts || {};
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: s.dark ? C.card : C.white }, line: { color: s.dark ? C.card : C.ln, width: 0.75 }, rectRadius: 0.18 });
  s.addText([
    { text: rotulo ? rotulo + '  ·  ' : '', options: { fontFace: 'Oswald', fontSize: 15, color: s.dark ? C.lime : C.green, charSpacing: 2 } },
    { text: tit, options: { fontFace: 'Oswald', fontSize: 20, bold: true, color: s.dark ? C.white : C.ink } },
  ], { x: x + 0.4, y: y + 0.28, w: w - 0.8, h: 0.95, margin: 0, valign: 'top' });
  s.addText(txt, { x: x + 0.4, y: y + 1.25, w: w - 0.8, h: h - 1.45, fontFace: 'Montserrat', fontSize: opts.fs || 14.5, color: s.dark ? C.g3 : C.g1, valign: 'top', margin: 0 });
}
function nota(s, x, y, w, h, txt) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: s.dark ? C.card : C.white }, line: { color: s.dark ? C.card : C.ln, width: 0.75 }, rectRadius: 0.24 });
  s.addText('✓', { x: x + 0.45, y: y + 0.12, w: 0.4, h: h - 0.24, fontFace: 'Montserrat', fontSize: 20, bold: true, color: s.dark ? C.lime : C.green, valign: 'middle', margin: 0 });
  s.addText(txt, { x: x + 0.95, y: y + 0.1, w: w - 1.3, h: h - 0.2, fontFace: 'Montserrat', fontSize: 15, color: s.dark ? C.white : C.ink, valign: 'middle', margin: 0 });
}
// imagem arredondada encaixada na caixa; devolve a colocação para os marcadores
const DIMS = require(path.join(SHOTS, 'dims.json'));
function img(s, f, x, y, w, h, alinhar) {
  const [iw, ih] = DIMS[f]; const k = Math.min(w / iw, h / ih); const rw = iw * k, rh = ih * k;
  const dx = alinhar === 'centro' ? (w - rw) / 2 : 0;
  s.addImage({ path: path.join(SHOTS, 'r_' + f + '.png'), x: x + dx, y, w: rw, h: rh });
  return { f, x: x + dx, y, k };
}
// marcador numerado sobre a imagem, no canto superior-direito do elemento medido (ou no centro se "centro")
function marca(s, pl, rect, num, onde) {
  const [cx, cy] = CROPS[pl.f]; const [x, y, w, h] = rect;
  const px = (x * 2 - cx), py = (y * 2 - cy); const pw = w * 2, ph = h * 2;
  const d = 0.4;
  let mx, my;
  if (onde === 'centro') { mx = pl.x + (px + pw / 2) * pl.k - d / 2; my = pl.y + (py + ph / 2) * pl.k - d / 2; }
  else if (onde === 'esq') { mx = pl.x + px * pl.k - d / 2; my = pl.y + (py + ph / 2) * pl.k - d / 2; }
  else { mx = pl.x + (px + pw) * pl.k - d * 0.7; my = pl.y + py * pl.k - d * 0.3; }
  bolinha(s, mx, my, num, d);
}

// ══════════════════════════════════════════════════════════════════
// ABERTURA
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide(); n++; s.background = { color: C.ink }; fotoFundo(s, 42);
  s.addImage({ path: path.join(ASSETS, 'begreen-logo-white.png'), x: 17.65, y: 0.5, w: 1.77, h: 0.42 });
  s.addText(`${TITULO} · Abertura`, { x: 1.15, y: 10.62, w: 12, h: 0.3, fontFace: 'Montserrat', fontSize: 10.5, color: C.g3 });
  s.addText('1', { x: 17.35, y: 10.62, w: 1.5, h: 0.3, fontFace: 'Oswald', fontSize: 11, color: C.g3, align: 'right' });
  s.addText('TREINAMENTO · TIME DE PROJETOS · VERSÃO 2', { x: 1.15, y: 2.3, w: 10, h: 0.4, fontFace: 'Oswald', fontSize: 18, color: C.lime, charSpacing: 4 });
  s.addText('GERADOR DE\nMEMORIAL\nDESCRITIVO', { x: 1.15, y: 2.9, w: 9, h: 3.9, fontFace: 'Oswald', fontSize: 72, bold: true, color: C.white, lineSpacingMultiple: 0.95 });
  s.addText('Criar, conferir e emitir um memorial em minutos.', { x: 1.15, y: 7.2, w: 8.4, h: 0.8, fontFace: 'Montserrat', fontSize: 20, color: C.white });
  s.addText([{ text: URL, options: { color: C.lime, bold: true } }, { text: '   ·   BeGreen Mobilidade Elétrica · setembro/2026', options: { color: C.g3 } }], { x: 1.15, y: 9.3, w: 12, h: 0.4, fontFace: 'Montserrat', fontSize: 14 });
  img(s, 'tela', 9.9, 2.75, 9.0, 5.62);
}
{
  const s = base(false, 'Abertura'); cabecalho(s, 'POR QUE A FERRAMENTA', 'O QUE MUDA NO SEU DIA');
  cartao(s, 1.15, 3.0, 5.6, 4.9, 'ANTES', 'UM WORD POR OBRA', 'Tabelas à mão, planilha de cálculo à parte, numeração de cabeça, versões por e-mail.', { fs: 16 });
  cartao(s, 7.2, 3.0, 5.6, 4.9, 'AGORA', 'VOCÊ PREENCHE, O GMD ESCREVE', 'Dez etapas guiadas. Cálculos pela NBR 5410, tabelas, diagrama, numeração e nuvem do time — automáticos.', { fs: 16 });
  cartao(s, 13.25, 3.0, 5.6, 4.9, 'SEMPRE', 'O PADRÃO É FIXO', 'Normas, textos, cabeçalhos, revisão e aprovação não mudam. Você cuida só do que muda por obra.', { fs: 16 });
  img(s, 'tira_tela', 1.15, 8.2, 17.7, 2.0);
}
{
  const s = base(true, 'Abertura'); cabecalho(s, 'VISÃO GERAL', 'O CAMINHO DE UM MEMORIAL');
  const passos = [['ENTRAR', 'E-mail e senha'], ['COMEÇAR', 'Menu ☰ → modelo, duplicar ou em branco'], ['PREENCHER', 'Dez etapas, uma por vez'], ['CONFERIR', 'Pendências e documento ao lado'], ['EMITIR', 'Rascunho → Revisado → Emitido'], ['ENTREGAR', 'Gerar PDF com nome padrão']];
  passos.forEach(([t, d], i) => {
    const x = 1.15 + i * 2.98;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 3.4, w: 2.75, h: 3.6, fill: { color: C.card }, line: { color: C.card }, rectRadius: 0.2 });
    s.addText(String(i + 1).padStart(2, '0'), { x: x + 0.3, y: 3.7, w: 2.2, h: 1.0, fontFace: 'Oswald', fontSize: 48, bold: true, color: C.lime, margin: 0 });
    s.addText(t, { x: x + 0.3, y: 4.8, w: 2.2, h: 0.5, fontFace: 'Oswald', fontSize: 20, bold: true, color: C.white, margin: 0 });
    s.addText(d, { x: x + 0.3, y: 5.4, w: 2.2, h: 1.4, fontFace: 'Montserrat', fontSize: 13.5, color: C.g3, margin: 0, valign: 'top' });
  });
  img(s, 'topo_crop', 1.15, 7.5, 17.7, 1.5);
  nota(s, 1.15, 9.3, 17.7, 0.85, 'Do login ao PDF, um condomínio padrão leva cerca de 10 minutos.');
}

// ══════════════════════════════════════════════════════════════════
divisor('01', 'ACESSO', 'Entrar, primeiro acesso e a tela principal.', 'Slides 5 a 7');
{
  const s = base(false, 'Bloco 01 · Acesso'); cabecalho(s, 'ACESSO', 'ENTRAR NO GERADOR');
  const pl = img(s, 'login_crop', 1.15, 3.0, 7.4, 6.6, 'centro');
  itens(s, 9.21, 3.1, 9.6, [
    ['O LINK', `${URL} — qualquer navegador, sem instalar nada.`],
    ['E-MAIL', 'O que o administrador cadastrou na Equipe.'],
    ['SENHA', 'Criada no primeiro acesso. "Esqueci a senha" envia um link.'],
    ['ENTRAR', 'A sessão fica lembrada. Computador compartilhado? Use "sair".'],
  ], { gap: 1.15 });
  marca(s, pl, R.l_email, 2); marca(s, pl, R.l_senha, 3); marca(s, pl, R.l_btn, 4); marca(s, pl, R.l_links, 3, 'esq');
  nota(s, 9.2, 8.0, 9.6, 0.9, 'Seu nome vira o gestor do projeto e o "Elaborado" do memorial.');
}
{
  const s = base(true, 'Bloco 01 · Acesso'); cabecalho(s, 'ACESSO', 'PRIMEIRO ACESSO E SENHA');
  cartao(s, 1.15, 3.0, 5.7, 3.9, '1', 'CADASTRO', 'O administrador inclui seu e-mail em Menu ☰ → Equipe.', { fs: 16 });
  cartao(s, 7.15, 3.0, 5.7, 3.9, '2', '"PRIMEIRO ACESSO"', 'Na tela de entrada: e-mail cadastrado + senha nova. Confirme pelo link do e-mail.', { fs: 16 });
  cartao(s, 13.15, 3.0, 5.7, 3.9, '3', 'ENTRAR', 'Da próxima vez é só e-mail e senha — em qualquer computador.', { fs: 16 });
  img(s, 'equipe_crop', 1.15, 7.3, 11.6, 3.0);
  nota(s, 13.15, 7.3, 5.7, 3.0, 'Projetista: cria e emite.\nLíder: também cria e exclui modelos.\nAdministrador: tudo isso e cadastra pessoas.');
}
{
  const s = base(false, 'Bloco 01 · Acesso'); cabecalho(s, 'A TELA', 'TUDO O QUE VOCÊ VÊ');
  const pl = img(s, 'tela', 1.15, 2.95, 12.0, 7.5);
  itens(s, 13.91, 2.95, 4.95, [
    ['STATUS', 'Rascunho, Revisado ou Emitido.'],
    ['PENDÊNCIAS', 'O que falta; clique e vá ao campo.'],
    ['BUSCA', 'Cliente, número, endereço, gestor.'],
    ['MENU ☰ E GERAR PDF', 'Tudo o que não é preencher.'],
    ['CARD DE PARÂMETROS', 'Etapas, campos, Anterior / Próximo.'],
    ['O DOCUMENTO', 'Página por página, igual ao PDF.'],
  ], { gap: 1.12, fs: 13.5 });
  marca(s, pl, R.fluxo, 1); marca(s, pl, R.pend, 2); marca(s, pl, R.busca, 3); marca(s, pl, R.menu, 4); marca(s, pl, R.card, 5); marca(s, pl, R.preview, 6, 'centro');
}

// ══════════════════════════════════════════════════════════════════
divisor('02', 'COMEÇAR UM PROJETO', 'O menu ☰, os modelos do time e o número do documento.', 'Slides 9 a 11');
{
  const s = base(true, 'Bloco 02 · Começar'); cabecalho(s, 'COMEÇAR', 'O MENU ☰: TRÊS JEITOS DE COMEÇAR');
  const pl = img(s, 'menu_crop', 1.15, 3.0, 7.2, 6.6, 'centro');
  itens(s, 9.2, 3.1, 9.6, [
    ['NOVO A PARTIR DE UM MODELO', 'O padrão: escolha o cenário na biblioteca e clique em Usar.'],
    ['DUPLICAR ESTE PROJETO', 'Mesmo projeto, outro cliente ou outra torre.'],
    ['NOVO PROJETO EM BRANCO', 'Só quando nenhum modelo serve.'],
    ['BIBLIOTECA E TIME', 'Catálogo de equipamentos, métricas e equipe.'],
  ], { gap: 1.15 });
  marca(s, pl, R.m_modelos, 1); marca(s, pl, R.m_duplicar, 2); marca(s, pl, R.m_branco, 3); marca(s, pl, R.m_catalogo, 4);
  nota(s, 9.2, 8.0, 9.6, 0.9, 'Em qualquer um dos três, o número BG-ME é gerado na hora.');
}
{
  const s = base(false, 'Bloco 02 · Começar'); cabecalho(s, 'COMEÇAR', 'A BIBLIOTECA DE MODELOS');
  const pl = img(s, 'modelos_crop', 1.15, 3.0, 11.2, 4.6);
  itens(s, 13.0, 3.05, 5.85, [
    ['PESQUISE', 'Nome, potência, tensão, QDA…'],
    ['USAR', 'Cria o projeto com os parâmetros do modelo.'],
    ['OFICIAIS E DO TIME', 'Cenários BeGreen + os criados por líderes.'],
    ['SALVAR COMO MODELO', 'Projeto bem montado vira modelo (líder/admin).'],
  ], { gap: 1.15, fs: 13.5 });
  marca(s, pl, R.mod_busca, 1); marca(s, pl, R.mod_usar, 2); marca(s, pl, R.mod_grupo, 3, 'esq'); marca(s, pl, R.mod_salvar, 4);
  nota(s, 1.15, 8.1, 17.7, 0.9, 'Só líderes e administradores criam e excluem modelos (botão ×). Projetistas usam.');
}
{
  const s = base(true, 'Bloco 02 · Começar'); cabecalho(s, 'COMEÇAR', 'NÚMERO DO DOCUMENTO E CLIENTE');
  const partes = [['BG-', 'BeGreen'], ['ME-', 'Mobilidade Elétrica'], ['26-', 'Ano'], ['0001', 'Sequência do ano']];
  partes.forEach(([p, d], i) => {
    const x = 1.15 + i * 4.45;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 3.0, w: 4.2, h: 2.4, fill: { color: C.card }, line: { color: C.card }, rectRadius: 0.2 });
    s.addText(p, { x: x + 0.3, y: 3.2, w: 3.6, h: 1.2, fontFace: 'Oswald', fontSize: 54, bold: true, color: C.lime, margin: 0 });
    s.addText(d, { x: x + 0.3, y: 4.45, w: 3.6, h: 0.6, fontFace: 'Montserrat', fontSize: 15, color: C.g3, margin: 0 });
  });
  const pl = img(s, 'card_crop', 1.15, 6.0, 4.0, 4.3);
  itens(s, 5.6, 6.1, 6.4, [
    ['"AUTO"', 'Pega o próximo número da nuvem. Nunca repete.'],
    ['CLIENTE', 'Digite: os já usados aparecem para completar.'],
  ], { gap: 1.2 });
  itens(s, 12.4, 6.1, 6.4, [
    ['ENDEREÇO E CIDADE/UF', 'Vão para a capa e o cabeçalho.'],
    ['ARQUIVO', 'BG-ME-26-0001_Rev00_Cliente.pdf'],
  ], { gap: 1.2, inicio: 3 });
  marca(s, pl, [364, 361, 42, 33], 1); marca(s, pl, R.cliente, 2); marca(s, pl, [49, 365, 300, 35], 3, 'esq');
}

// ══════════════════════════════════════════════════════════════════
divisor('03', 'PREENCHER', 'O assistente por etapas: uma seção por vez. O que a ferramenta calcula, você não digita.', 'Slides 13 a 18');
{
  const s = base(false, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'COMO FUNCIONA O ASSISTENTE POR ETAPAS');
  const pl = img(s, 'card_crop', 1.15, 3.0, 5.6, 7.3);
  itens(s, 7.4, 3.05, 5.5, [
    ['BARRA DE ETAPAS', 'Verde = feita · preto = atual · tracejado = não se aplica.'],
    ['ANTERIOR / PRÓXIMO', 'Sempre no rodapé. No fim vira "Concluir".'],
    ['ETAPAS AUTOMÁTICAS', 'Transformador, QDA e demanda só se marcadas na etapa 2.'],
  ], { gap: 1.3, fs: 13.5 });
  itens(s, 13.4, 3.05, 5.5, [
    ['NADA SE PERDE', 'Cada campo é salvo na nuvem ao sair dele.'],
    ['RECOLHER PARÂMETROS', 'O card vira a bola BeGreen; clique para voltar.'],
    ['O DOCUMENTO ACOMPANHA', 'Cada campo redesenha o memorial ao lado.'],
  ], { gap: 1.3, fs: 13.5, inicio: 4 });
  marca(s, pl, R.etapas, 1, 'esq'); marca(s, pl, R.nav, 2); marca(s, pl, R.pulada, 3, 'centro'); marca(s, pl, R.cliente, 4); marca(s, pl, R.recolher, 5);
  const pb = img(s, 'bola_crop', 7.4, 7.2, 4.4, 3.2); marca(s, pb, R.bola, 5, 'centro');
  const pd = img(s, 'tira_rev', 12.2, 7.2, 6.7, 3.2); marca(s, pd, R.d_rev, 6, 'esq');
}
{
  const s = base(true, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPAS 1 E 2 · CLIENTE E ENTRADA DE ENERGIA');
  const pl = img(s, 'etapa2_crop', 1.15, 3.0, 5.6, 7.3);
  cartao(s, 7.4, 3.0, 5.5, 4.4, 'ETAPA 1', 'IDENTIFICAÇÃO', 'Cliente, endereço, cidade/UF, nº (auto), revisão e data, ART e descrição da revisão.', { fs: 14.5 });
  cartao(s, 13.4, 3.0, 5.5, 4.4, 'ETAPA 2', 'ENTRADA DE ENERGIA', 'Tensão e configuração, disjuntor geral, Ik (kA), aterramento TN-S / TT.', { fs: 14.5 });
  itens(s, 7.4, 7.8, 11.5, [['LIGA AS ETAPAS OPCIONAIS', 'Transformador, QDA e análise de demanda: marque "Sim" aqui e as etapas 3, 4 e 7 aparecem.']], { gap: 1.2 });
  marca(s, pl, [49, 301, 175, 37], 1, 'esq'); marca(s, pl, [49, 490, 175, 37], 2, 'esq');
  s.addText('1  tensão / configuração        2  necessidade de transformador · QDA · análise de demanda', { x: 7.4, y: 9.4, w: 11.5, h: 0.4, fontFace: 'Montserrat', fontSize: 12, color: C.g3 });
}
{
  const s = base(false, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPAS 3 E 4 · TRANSFORMADOR E QDA');
  cartao(s, 1.15, 3.0, 5.9, 4.4, 'ETAPA 3', 'TRANSFORMADOR', 'Só com "Necessidade de transformador = Sim". kVA, tensões, ligações e IP. Com transformador, o QDA entra automaticamente.', { fs: 15 });
  cartao(s, 7.3, 3.0, 5.9, 4.4, 'ETAPA 4', 'QDA', 'Só com "Quadro dedicado = Sim". Informe quantas estações: o gerador cria um ponto para cada uma e dimensiona QGBT → QDA.', { fs: 15 });
  img(s, 'tira_diagrama', 13.5, 3.0, 5.4, 7.3);
  nota(s, 1.15, 7.8, 12.05, 0.9, 'Não se aplica? A etapa nem aparece: a barra mostra o traço tracejado e o Próximo pula por cima.');
  s.addText('Diagrama unifilar gerado automaticamente.', { x: 13.5, y: 9.6, w: 5.4, h: 0.4, fontFace: 'Montserrat', fontSize: 12, color: C.g1, align: 'center' });
}
{
  const s = base(true, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPA 5 · ESTAÇÕES DE RECARGA E CIRCUITOS');
  const pl = img(s, 'combo_crop', 1.15, 3.0, 5.6, 7.3);
  itens(s, 7.4, 3.05, 5.5, [
    ['MARCA E MODELO', 'Digite ou escolha no catálogo: AC 7,4 a 22 kW, DC 30 a 360 kW.'],
    ['POTÊNCIA E CONECTOR', 'Definem corrente, disjuntor e cabo. DC = Modo 4.'],
    ['DISJUNTOR', 'Calculado; preencha só para forçar.'],
  ], { gap: 1.3, fs: 13.5 });
  itens(s, 13.4, 3.05, 5.5, [
    ['APLICAR AO RESTANTE', 'Copia o 1º ponto para os demais.'],
    ['DPS (kA)', '45 kA padrão · 20 kA no kit Clamper.'],
    ['CONEXÃO', 'Internet do cliente ou "não se aplica".'],
  ], { gap: 1.3, fs: 13.5, inicio: 4 });
  marca(s, pl, R.c_combo, 1); marca(s, pl, R.c_potencia, 2, 'esq'); marca(s, pl, R.c_disjuntor, 3); marca(s, pl, R.c_aplicar, 4); marca(s, pl, R.c_dps, 5); marca(s, pl, R.c_internet, 6);
  nota(s, 7.4, 7.6, 11.5, 0.9, 'Marca, modelo, tensão, corrente, potência e FP de cada carga entram em texto corrido no memorial.');
  img(s, 'tira_catalogo', 7.4, 8.8, 11.5, 1.6);
}
{
  const s = base(false, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPA 6 · TRECHOS E DIMENSIONAMENTO');
  const pl = img(s, 'etapa6_crop', 1.15, 3.0, 5.6, 7.3);
  itens(s, 7.4, 3.05, 5.5, [
    ['CLASSE DO CABO', 'HEPR 1 kV (tab. 37/39) ou PVC 750 V (tab. 36).'],
    ['TEMPERATURAS', 'Ambiente e solo → fator de correção.'],
    ['LIMITE DE ΔV', '4 % por padrão; editável.'],
  ], { gap: 1.3, fs: 13.5 });
  itens(s, 13.4, 3.05, 5.5, [
    ['TRECHOS', 'Distância de cada um.'],
    ['MÉTODO DE REFERÊNCIA', 'A1 a G (tabela 33).'],
    ['RESULTADO', 'Seção, eletroduto, ΔV e Atende / Reavaliar.'],
  ], { gap: 1.3, fs: 13.5, inicio: 4 });
  marca(s, pl, R.t_cabo, 1); marca(s, pl, R.t_temp, 2); marca(s, pl, R.t_queda, 3); marca(s, pl, R.t_L, 4); marca(s, pl, R.t_metodo, 5); marca(s, pl, R.t_resumo, 6);
  const pd = img(s, 'tira_tab56', 7.4, 7.5, 11.5, 2.9); marca(s, pd, R.d_tab56, 6, 'esq');
}
{
  const s = base(true, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPAS 7 A 10');
  cartao(s, 1.15, 3.0, 4.2, 3.6, 'ETAPA 7', 'DEMANDA', 'kW disponível e pontos simultâneos, se marcada na etapa 2.', { fs: 14 });
  cartao(s, 5.55, 3.0, 4.2, 3.6, 'ETAPA 8', 'CONCLUSÃO', 'Alterar padrão de entrada? Participação das estações.', { fs: 14 });
  cartao(s, 9.95, 3.0, 4.2, 3.6, 'ETAPA 9', 'FOTOS', 'Opcionais; legenda obrigatória. ★ guarda na biblioteca.', { fs: 14 });
  cartao(s, 14.35, 3.0, 4.5, 3.6, 'ETAPA 10', 'OBSERVAÇÕES', 'Texto livre + frases prontas do time.', { fs: 14 });
  img(s, 'etapa9_crop', 1.15, 7.0, 4.2, 3.4); img(s, 'etapa10_crop', 5.55, 7.0, 4.2, 3.4); img(s, 'etapa8_crop', 9.95, 7.0, 4.2, 3.4);
  nota(s, 14.35, 7.0, 4.5, 3.4, '"Concluir" volta ao topo e abre as pendências — hora de conferir.');
}

// ══════════════════════════════════════════════════════════════════
divisor('04', 'CONFERIR E EMITIR', 'Pendências, o documento, o fluxo de aprovação e as revisões.', 'Slides 20 a 23');
{
  const s = base(false, 'Bloco 04 · Conferir e emitir'); cabecalho(s, 'CONFERIR', 'PENDÊNCIAS: O QUE FALTA E ONDE ESTÁ');
  const pl = img(s, 'pend_crop', 1.15, 3.0, 11.0, 3.42);
  itens(s, 12.8, 3.05, 6.05, [
    ['A PÍLULA', 'Vermelha com a contagem; verde quando está tudo certo.'],
    ['A LISTA', 'Seção e campo. Clique: o GMD abre a etapa e foca o campo.'],
    ['[XX] NO DOCUMENTO', 'Falta o dado que alimenta aquele trecho do texto.'],
  ], { gap: 1.2, fs: 13.5 });
  marca(s, pl, R.p_head, 1); marca(s, pl, R.p_lista, 2, 'esq'); marca(s, pl, R.p_ultimo, 3);
  img(s, 'topo_crop', 1.15, 6.9, 17.7, 1.48);
  nota(s, 1.15, 8.7, 17.7, 0.9, 'Com pendências não há emissão nem PDF. Navegar entre as etapas é livre.');
}
{
  const s = base(true, 'Bloco 04 · Conferir e emitir'); cabecalho(s, 'CONFERIR', 'O QUE VOCÊ VÊ É O PDF');
  const p1 = img(s, 'doc2_crop', 1.15, 3.0, 5.9, 7.2); const p2 = img(s, 'doc9_crop', 7.3, 3.0, 5.9, 7.2);
  itens(s, 13.5, 3.05, 5.4, [
    ['CABEÇALHO E RODAPÉ', 'Em todas as páginas A4.'],
    ['ÍNDICE COM PÁGINAS', 'Numeração segue as seções incluídas.'],
    ['ELABORADO / APROVADO', 'Você (gestor) / Eng. Kauê B. Angeli.'],
    ['TABELA 5.6', 'Trecho, método, cabo, ΔV e situação.'],
  ], { gap: 1.3, fs: 13.5 });
  marca(s, p1, R.d_cab, 1); marca(s, p1, R.d_indice, 2, 'esq'); marca(s, p1, R.d_rev, 3); marca(s, p2, R.d_tab56, 4);
}
{
  const s = base(false, 'Bloco 04 · Conferir e emitir'); cabecalho(s, 'EMITIR', 'RASCUNHO → REVISADO → EMITIDO');
  const est = [['RASCUNHO', C.g1, 'Editando. Sem pendências → "Marcar como revisado".'], ['REVISADO', 'B8860B', 'Alguém confere. "Voltar a rascunho" ou "Emitir".'], ['EMITIDO', C.greenD, 'Campos travados, PDF liberado, quem e quando registrados.']];
  est.forEach(([t, cor, d], i) => {
    const x = 1.15 + i * 6.0;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 3.1, w: 5.7, h: 3.4, fill: { color: C.white }, line: { color: C.ln, width: 0.75 }, rectRadius: 0.2 });
    s.addShape(pptx.ShapeType.roundRect, { x: x + 0.4, y: 3.5, w: 2.6, h: 0.6, fill: { color: cor }, line: { color: cor }, rectRadius: 0.1 });
    s.addText(t, { x: x + 0.4, y: 3.5, w: 2.6, h: 0.6, fontFace: 'Oswald', fontSize: 15, bold: true, color: C.white, align: 'center', valign: 'middle', charSpacing: 3, margin: 0 });
    s.addText(d, { x: x + 0.4, y: 4.4, w: 4.9, h: 1.9, fontFace: 'Montserrat', fontSize: 15, color: C.g1, valign: 'top', margin: 0 });
    if (i < 2) s.addText('›', { x: x + 5.7, y: 4.3, w: 0.3, h: 1.0, fontFace: 'Oswald', fontSize: 40, color: C.g3, align: 'center', margin: 0 });
  });
  const pl = img(s, 'topo_crop', 1.15, 7.0, 17.7, 1.48); marca(s, pl, R.fluxo, 1); marca(s, pl, R.pdf, 2);
  nota(s, 1.15, 8.8, 17.7, 0.9, '1  Status e botões do fluxo na barra superior.   2  Gerar PDF só com o documento Emitido e sem pendências.');
}
{
  const s = base(true, 'Bloco 04 · Conferir e emitir'); cabecalho(s, 'EMITIR', 'MUDOU ALGO DEPOIS? NOVA REVISÃO');
  cartao(s, 1.15, 3.0, 5.7, 3.6, '1', '"NOVA REVISÃO"', 'Na barra superior, com o documento Emitido. Volta a Rascunho.', { fs: 15 });
  cartao(s, 7.15, 3.0, 5.7, 3.6, '2', 'HISTÓRICO', 'A Rev. 00 fica guardada ("abrir cópia" na etapa 1). Sobe para Rev. 01.', { fs: 15 });
  cartao(s, 13.15, 3.0, 5.7, 3.6, '3', 'DESCREVA', '"Descrição desta revisão" vai para a tabela de revisões. Revise e emita de novo.', { fs: 15 });
  const pl = img(s, 'card_crop', 1.15, 7.0, 4.2, 3.4); marca(s, pl, R.novaRev, 2);
  const pd = img(s, 'tira_rev', 5.7, 7.0, 7.0, 3.4); marca(s, pd, R.d_rev, 3, 'esq');
  nota(s, 13.15, 7.0, 5.7, 3.4, 'Nunca edite um Emitido "por fora": o PDF antigo já pode estar com o cliente.');
}

// ══════════════════════════════════════════════════════════════════
divisor('05', 'PADRÕES DA CASA', 'O que é fixo, o que muda por obra e o que o time compartilha.', 'Slides 25 a 27');
{
  const s = base(false, 'Bloco 05 · Padrões da casa'); cabecalho(s, 'PADRÃO', 'O QUE É FIXO E O QUE MUDA');
  cartao(s, 1.15, 3.0, 5.9, 4.4, 'FIXO', 'O QUE GARANTE O PADRÃO', '• Normas e referências\n• Textos, critérios e premissas\n• Tabelas 36–39 e fatores da NBR 5410\n• Capa, índice, cabeçalho, revisões, Aprovado', { fs: 15 });
  cartao(s, 7.3, 3.0, 5.9, 4.4, 'MUDA POR OBRA', 'AS DEZ ETAPAS', '• Cliente, endereço, ART, revisão\n• Rede, transformador, QDA, demanda\n• Estações, DPS, conexão\n• Cabo, temperaturas, ΔV, trechos, fotos', { fs: 15 });
  img(s, 'doc9_crop', 13.5, 3.0, 5.4, 7.3);
  img(s, 'tira_tab56', 1.15, 7.8, 12.05, 2.5);
}
{
  const s = base(true, 'Bloco 05 · Padrões da casa'); cabecalho(s, 'PADRÃO', 'CATÁLOGO, EQUIPE E PAPÉIS');
  const p1 = img(s, 'catalogo_crop', 1.15, 3.0, 6.6, 6.2);
  const p2 = img(s, 'equipe_crop', 8.0, 3.0, 10.85, 3.05);
  itens(s, 8.0, 6.5, 5.2, [['CATÁLOGO', 'Menu ☰ → Catálogo: marca, modelo, kW, conector, AC/DC, IP. "+ adicionar" e "Salvar".']], { gap: 1.6, fs: 13.5 });
  itens(s, 13.6, 6.5, 5.25, [['EQUIPE E PAPÉIS', 'Projetista · Líder · Administrador. Desativar bloqueia na hora.']], { gap: 1.6, fs: 13.5, inicio: 2 });
  marca(s, p1, [267, 50, 900, 40], 1, 'esq'); marca(s, p2, [267, 303, 900, 40], 2, 'esq');
  nota(s, 8.0, 8.9, 10.85, 0.85, 'Frases prontas e fotos padrão também são do time.');
}
{
  const s = base(false, 'Bloco 05 · Padrões da casa'); cabecalho(s, 'PADRÃO', 'MÉTRICAS DO TIME');
  const pl = img(s, 'metricas_crop', 1.15, 3.0, 11.0, 5.4);
  itens(s, 12.8, 3.05, 6.05, [
    ['RESUMO', 'Cadastrados, emissões, em aberto.'],
    ['POR GESTOR', 'Criados, emitidos, tempo médio até emitir.'],
    ['POR SEMANA', 'Últimas 8 semanas.'],
    ['PENDÊNCIAS COMUNS', 'O que mais trava os projetos.'],
  ], { gap: 1.15, fs: 13.5 });
  marca(s, pl, R.metr_cards, 1, 'esq'); marca(s, pl, R.metr_gestor, 2, 'esq'); marca(s, pl, R.metr_semana, 3, 'esq'); marca(s, pl, R.metr_pend, 4, 'esq');
  nota(s, 1.15, 8.7, 17.7, 0.9, 'Menu ☰ → Métricas. Mesmos números para todo o time.');
}

// ══════════════════════════════════════════════════════════════════
divisor('06', 'PRÁTICA', 'Exercício guiado, erros comuns e a última conferência.', 'Slides 29 a 31');
{
  const s = base(false, 'Bloco 06 · Prática'); cabecalho(s, 'PRÁTICA', 'EXERCÍCIO GUIADO · 10 MINUTOS');
  itens(s, 1.15, 3.05, 8.5, [
    ['ENTRAR', `${URL}`],
    ['MENU ☰ → NOVO A PARTIR DE UM MODELO', '"Condomínio · 2 × 7,4 kW · 220 V 2F+N+T · QDA" → Usar.'],
    ['ETAPA 1', 'Cliente "Condomínio Treinamento", endereço, nº "auto", ART 000000.'],
    ['ETAPA 2', 'Confira tensão e disjuntor; Ik = 6 kA.'],
  ], { gap: 1.2 });
  itens(s, 10.35, 3.05, 8.5, [
    ['ETAPA 5', 'Wallbox AC 7,4 kW nos dois pontos ("Aplicar ao restante").'],
    ['ETAPA 6', 'Trecho 1: 15 m, B1. Circuitos: 20 m e 30 m.'],
    ['CONFERIR', 'Zere as pendências pela pílula. Veja a tabela 5.6.'],
    ['EMITIR', 'Revisado → Emitir → Gerar PDF.'],
  ], { gap: 1.2, inicio: 5 });
  img(s, 'combo_crop', 1.15, 8.0, 2.6, 2.4); img(s, 'etapa6_crop', 3.95, 8.0, 2.6, 2.4); img(s, 'pend_crop', 6.75, 8.0, 5.0, 2.4); img(s, 'doc9_crop', 12.0, 8.0, 2.6, 2.4);
  nota(s, 14.9, 8.0, 3.95, 2.4, 'Depois, exclua o projeto de treino — nunca emita para um cliente real.');
}
{
  const s = base(true, 'Bloco 06 · Prática'); cabecalho(s, 'PRÁTICA', 'DEU ERRADO? O QUE FAZER');
  const erros = [
    ['● NUVEM INDISPONÍVEL', 'Sem internet. Os dados sobem quando voltar.'],
    ['NÃO CONSIGO ENTRAR', 'E-mail não cadastrado ou senha errada → "Esqueci a senha".'],
    ['PRÓXIMO PULOU UMA ETAPA', 'Normal: só aparece o que foi marcado "Sim" na etapa 2.'],
    ['GERAR PDF NÃO FAZ NADA', 'Há pendências ou o documento não está Emitido.'],
    ['CABO "REAVALIAR"', 'ΔV acima do limite: seção maior, distância menor ou outro método.'],
    ['ERREI DEPOIS DE EMITIR', 'Nova revisão. Nunca edite o PDF nem apague o projeto.'],
  ];
  erros.forEach(([t, d], i) => {
    const col = i % 2, row = Math.floor(i / 2); const x = 1.15 + col * 9.1, y = 3.0 + row * 1.75;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 8.6, h: 1.55, fill: { color: C.card }, line: { color: C.card }, rectRadius: 0.18 });
    s.addText(t, { x: x + 0.4, y: y + 0.2, w: 7.8, h: 0.4, fontFace: 'Oswald', fontSize: 17, bold: true, color: C.lime, margin: 0 });
    s.addText(d, { x: x + 0.4, y: y + 0.65, w: 7.8, h: 0.8, fontFace: 'Montserrat', fontSize: 13.5, color: C.g3, valign: 'top', margin: 0 });
  });
  img(s, 'tira_recolhido', 1.15, 8.4, 17.7, 1.9);
}
{
  const s = pptx.addSlide(); n++; s.background = { color: C.ink }; fotoFundo(s, 40); s.dark = true;
  s.addImage({ path: path.join(ASSETS, 'begreen-logo-white.png'), x: 17.65, y: 0.5, w: 1.77, h: 0.42 });
  s.addText(`${TITULO} · Encerramento`, { x: 1.15, y: 10.62, w: 12, h: 0.3, fontFace: 'Montserrat', fontSize: 10.5, color: C.g3 });
  s.addText(String(n), { x: 17.35, y: 10.62, w: 1.5, h: 0.3, fontFace: 'Oswald', fontSize: 11, color: C.g3, align: 'right' });
  cabecalho(s, 'ANTES DE ENVIAR', 'ÚLTIMA CONFERÊNCIA');
  s.addShape(pptx.ShapeType.roundRect, { x: 1.15, y: 2.8, w: 12.0, h: 6.3, fill: { color: C.ink, transparency: 18 }, line: { color: C.ink, transparency: 100 }, rectRadius: 0.3 });
  const checks = ['Cliente, endereço e cidade como devem sair na capa?', 'Número, revisão e ART preenchidos?', 'Tabela 5.6 toda "Atende"? Diagrama com todos os pontos?', 'Fotos com legenda e observações da obra?', 'Status Emitido e pílula de pendências verde?', 'Arquivo BG-ME-AA-NNNN_RevNN_Cliente.pdf?'];
  checks.forEach((t, i) => {
    s.addText('✓', { x: 1.6, y: 3.2 + i * 0.95, w: 0.5, h: 0.7, fontFace: 'Montserrat', fontSize: 24, bold: true, color: C.lime, margin: 0 });
    s.addText(t, { x: 2.25, y: 3.2 + i * 0.95, w: 10.5, h: 0.7, fontFace: 'Montserrat', fontSize: 19, color: C.white, valign: 'middle', margin: 0 });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 13.7, y: 2.8, w: 5.15, h: 6.3, fill: { color: C.card }, line: { color: C.card }, rectRadius: 0.2 });
  s.addText('LINK', { x: 14.1, y: 3.2, w: 4.4, h: 0.35, fontFace: 'Oswald', fontSize: 14, color: C.lime, charSpacing: 3, margin: 0 });
  s.addText(URL, { x: 14.1, y: 3.6, w: 4.4, h: 0.6, fontFace: 'Oswald', fontSize: 24, bold: true, color: C.white, margin: 0 });
  s.addText('DÚVIDAS E CADASTROS', { x: 14.1, y: 4.7, w: 4.4, h: 0.35, fontFace: 'Oswald', fontSize: 14, color: C.lime, charSpacing: 3, margin: 0 });
  s.addText('Kauê Brunetti\nadministrador do gerador\nkba@mybegreen.com.br', { x: 14.1, y: 5.1, w: 4.4, h: 1.4, fontFace: 'Montserrat', fontSize: 14, color: C.g3, margin: 0 });
  s.addText('MATERIAL', { x: 14.1, y: 6.9, w: 4.4, h: 0.35, fontFace: 'Oswald', fontSize: 14, color: C.lime, charSpacing: 3, margin: 0 });
  s.addText('Esta apresentação fica na pasta do time (docs/treinamento).', { x: 14.1, y: 7.3, w: 4.4, h: 1.2, fontFace: 'Montserrat', fontSize: 13, color: C.g3, margin: 0 });
  s.addText('Obrigado. Agora é só emitir.', { x: 1.15, y: 9.5, w: 12, h: 0.7, fontFace: 'Oswald', fontSize: 30, bold: true, color: C.lime, margin: 0 });
}

pptx.writeFile({ fileName: OUT }).then(f => console.log('ok', n, 'slides →', f));
