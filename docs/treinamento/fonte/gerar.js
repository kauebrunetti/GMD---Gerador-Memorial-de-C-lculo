// Gera o treinamento do GMD (versão 2 · set/2026) no layout BeGreen: 20 × 11,25 pol,
// slides escuros e claros alternados, cantos arredondados, Oswald + Montserrat.
const pptxgen = require('pptxgenjs');
const path = require('path');

const SHOTS = path.join(__dirname, '..', 'shots');
const ASSETS = '/Users/kauebrunetti/Desktop/AA IA/1. GMD - Gerador Memorial Descritivo/assets';
const OUT = '/Users/kauebrunetti/Desktop/AA IA/1. GMD - Gerador Memorial Descritivo/docs/treinamento/GMD - Treinamento do time de projetos.pptx';

const C = { ink: '1B1C1B', card: '343633', light: 'F2F3F0', white: 'FFFFFF', green: '3AAA35', greenD: '2E8C2A', lime: 'D2D727', g1: '6E736D', g2: '8A8B83', g3: 'A9ADA7', ln: 'D8DAD4', red: 'C0392B' };
const URL = 'gmd.mybegreen.com.br';
const TITULO = 'GMD · Treinamento do time de projetos';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'BG', width: 20, height: 11.25 });
pptx.layout = 'BG';
pptx.author = 'BeGreen Mobilidade Elétrica'; pptx.title = TITULO;

let n = 0;
const shot = (f) => path.join(SHOTS, f + '.png');
const O = (t, extra) => Object.assign({ fontFace: 'Oswald' }, extra || {});
const M = (t, extra) => Object.assign({ fontFace: 'Montserrat' }, extra || {});

// ── base: fundo, logo, rodapé, número ─────────────────────────────
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
  s.addText(kicker, { x: 1.15, y: 1.0, w: 17.7, h: 0.41, fontFace: 'Oswald', fontSize: 18, color: s.dark ? C.lime : C.green, charSpacing: 4 });
  s.addText(titulo, { x: 1.15, y: 1.55, w: 17.7, h: 0.9, fontFace: 'Oswald', fontSize: 44, bold: true, color: s.dark ? C.white : C.ink });
}
function divisor(num, titulo, sub, slides) {
  const s = pptx.addSlide(); n++; s.background = { color: C.ink };
  s.addText(`BLOCO ${num}`, { x: 1.04, y: 1.04, w: 18, h: 0.4, fontFace: 'Montserrat', fontSize: 18, color: C.lime, charSpacing: 4 });
  s.addText(num, { x: 1.04, y: 3.6, w: 18, h: 1.9, fontFace: 'Oswald', fontSize: 105, bold: true, color: C.lime });
  s.addText(titulo, { x: 1.04, y: 5.6, w: 18, h: 1.0, fontFace: 'Oswald', fontSize: 60, bold: true, color: C.white });
  s.addText(sub, { x: 1.04, y: 6.8, w: 15, h: 0.8, fontFace: 'Montserrat', fontSize: 22, color: C.g3 });
  s.addText(slides, { x: 1.04, y: 9.82, w: 18, h: 0.4, fontFace: 'Montserrat', fontSize: 14, color: C.g2 });
}
// item numerado: bolinha lime + título Oswald + texto Montserrat
function itens(s, x, y, w, lista, opts) {
  opts = opts || {}; const gap = opts.gap || 1.07, hTit = 0.36;
  lista.forEach(([tit, txt], i) => {
    const yy = y + i * gap;
    s.addShape(pptx.ShapeType.ellipse, { x, y: yy, w: 0.44, h: 0.44, fill: { color: C.lime }, line: { color: C.lime } });
    s.addText(String(i + 1), { x, y: yy, w: 0.44, h: 0.44, fontFace: 'Oswald', fontSize: 15, bold: true, color: C.ink, align: 'center', valign: 'middle', margin: 0 });
    s.addText([
      { text: tit, options: { fontFace: 'Oswald', fontSize: 17, bold: true, color: s.dark ? C.white : C.ink, breakLine: true } },
      { text: txt, options: { fontFace: 'Montserrat', fontSize: opts.fs || 14.5, color: s.dark ? C.g3 : C.g1 } },
    ], { x: x + 0.61, y: yy - 0.04, w: w - 0.61, h: gap - 0.1, valign: 'top', margin: 0, paraSpaceBefore: 0 });
  });
}
// cartão arredondado com rótulo pequeno, título e texto
function cartao(s, x, y, w, h, rotulo, tit, txt, opts) {
  opts = opts || {};
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: s.dark ? C.card : C.white }, line: { color: s.dark ? C.card : C.ln, width: 0.75 }, rectRadius: 0.18 });
  s.addText([
    { text: rotulo ? rotulo + '  ·  ' : '', options: { fontFace: 'Oswald', fontSize: 15, color: s.dark ? C.lime : C.green, charSpacing: 2 } },
    { text: tit, options: { fontFace: 'Oswald', fontSize: 20, bold: true, color: s.dark ? C.white : C.ink } },
  ], { x: x + 0.4, y: y + 0.28, w: w - 0.8, h: 0.95, margin: 0, valign: 'top' });
  s.addText(txt, { x: x + 0.4, y: y + 1.3, w: w - 0.8, h: h - 1.5, fontFace: 'Montserrat', fontSize: opts.fs || 14, color: s.dark ? C.g3 : C.g1, valign: 'top', margin: 0 });
}
// nota com ✓
function nota(s, x, y, w, h, txt) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: s.dark ? C.card : C.light }, line: { color: s.dark ? C.card : C.ln, width: 0.75 }, rectRadius: 0.24 });
  s.addText('✓', { x: x + 0.45, y: y + 0.12, w: 0.4, h: h - 0.24, fontFace: 'Montserrat', fontSize: 20, bold: true, color: s.dark ? C.lime : C.green, valign: 'middle', margin: 0 });
  s.addText(txt, { x: x + 0.95, y: y + 0.1, w: w - 1.3, h: h - 0.2, fontFace: 'Montserrat', fontSize: 15, color: s.dark ? C.white : C.ink, valign: 'middle', margin: 0 });
}
// imagem já arredondada (PNG com transparência), encaixada na caixa mantendo a proporção
const DIMS = require(path.join(SHOTS, 'dims.json'));
function img(s, f, x, y, w, h, alinhar) {
  const [iw, ih] = DIMS[f]; const k = Math.min(w / iw, h / ih); const rw = iw * k, rh = ih * k;
  const dx = alinhar === 'centro' ? (w - rw) / 2 : 0;
  s.addImage({ path: path.join(SHOTS, 'r_' + f + '.png'), x: x + dx, y, w: rw, h: rh });
}
function lista(s, x, y, w, linhas, opts) {
  opts = opts || {};
  s.addText(linhas.map((t, i) => ({ text: t, options: { bullet: { code: '25A0' }, breakLine: i < linhas.length - 1, paraSpaceAfter: 6 } })),
    { x, y, w, h: opts.h || 4, fontFace: 'Montserrat', fontSize: opts.fs || 14.5, color: s.dark ? C.g3 : C.g1, valign: 'top', margin: 0 });
}

// ══════════════════════════════════════════════════════════════════
// ABERTURA
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide(); n++; s.background = { color: C.ink };
  s.addImage({ path: path.join(ASSETS, 'begreen-logo-white.png'), x: 17.65, y: 0.5, w: 1.77, h: 0.42 });
  s.addText(`${TITULO} · Abertura`, { x: 1.15, y: 10.62, w: 12, h: 0.3, fontFace: 'Montserrat', fontSize: 10.5, color: C.g2 });
  s.addText('1', { x: 17.35, y: 10.62, w: 1.5, h: 0.3, fontFace: 'Oswald', fontSize: 11, color: C.g2, align: 'right' });
  s.addText('TREINAMENTO · TIME DE PROJETOS · VERSÃO 2', { x: 1.15, y: 2.3, w: 10, h: 0.4, fontFace: 'Oswald', fontSize: 18, color: C.lime, charSpacing: 4 });
  s.addText('GERADOR DE\nMEMORIAL\nDESCRITIVO', { x: 1.15, y: 2.9, w: 9, h: 3.9, fontFace: 'Oswald', fontSize: 72, bold: true, color: C.white, lineSpacingMultiple: 0.95 });
  s.addText('Como criar, conferir e emitir um memorial em minutos — agora com o assistente por etapas.', { x: 1.15, y: 7.2, w: 8.4, h: 1.2, fontFace: 'Montserrat', fontSize: 20, color: C.g3 });
  s.addText([{ text: URL, options: { color: C.lime, bold: true } }, { text: '   ·   BeGreen Mobilidade Elétrica · setembro/2026', options: { color: C.g1 } }], { x: 1.15, y: 9.3, w: 12, h: 0.4, fontFace: 'Montserrat', fontSize: 14 });
  img(s, 'tela', 9.9, 2.75, 9.0, 5.62);
}
{
  const s = base(false, 'Abertura'); cabecalho(s, 'POR QUE A FERRAMENTA', 'O QUE MUDA NO SEU DIA');
  cartao(s, 1.15, 3.0, 8.6, 5.6, 'ANTES', 'CADA MEMORIAL ERA UM DOCUMENTO NOVO',
    'Texto no Word, tabelas à mão, dimensionamento numa planilha à parte, numeração de cabeça, versões espalhadas por e-mail. Um erro de digitação virava um memorial errado no cliente.', { fs: 17 });
  cartao(s, 10.25, 3.0, 8.6, 5.6, 'AGORA', 'VOCÊ PREENCHE OS PARÂMETROS, O GMD ESCREVE',
    'Dez etapas guiadas. O gerador calcula correntes, cabos, disjuntores, DPS e queda de tensão pela NBR 5410, monta as tabelas, o diagrama e a memória de cálculo, numera o documento e guarda tudo na nuvem do time.\n\nO padrão BeGreen — normas, textos, cabeçalhos, revisão e aprovação — é fixo. Você cuida do que muda por obra.', { fs: 17 });
  nota(s, 1.15, 9.0, 17.7, 0.9, 'Endereço oficial: ' + URL + ' — funciona em qualquer navegador, sem instalar nada.');
}
{
  const s = base(true, 'Abertura'); cabecalho(s, 'VISÃO GERAL', 'O CAMINHO DE UM MEMORIAL');
  const passos = [['ENTRAR', 'E-mail e senha, em ' + URL], ['COMEÇAR', 'Menu ☰ → Novo em branco ou a partir de um modelo'], ['PREENCHER', 'Dez etapas, uma por vez; as que não se aplicam somem'], ['CONFERIR', 'Pendências na barra superior e o documento ao lado'], ['EMITIR', 'Rascunho → Revisado → Emitido'], ['ENTREGAR', 'Gerar PDF com o nome padrão BG-ME']];
  passos.forEach(([t, d], i) => {
    const x = 1.15 + i * 2.98;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 3.4, w: 2.75, h: 4.6, fill: { color: C.card }, line: { color: C.card }, rectRadius: 0.2 });
    s.addText(String(i + 1).padStart(2, '0'), { x: x + 0.3, y: 3.7, w: 2.2, h: 1.0, fontFace: 'Oswald', fontSize: 48, bold: true, color: C.lime, margin: 0 });
    s.addText(t, { x: x + 0.3, y: 4.8, w: 2.2, h: 0.5, fontFace: 'Oswald', fontSize: 20, bold: true, color: C.white, margin: 0 });
    s.addText(d, { x: x + 0.3, y: 5.4, w: 2.2, h: 2.3, fontFace: 'Montserrat', fontSize: 13.5, color: C.g3, margin: 0, valign: 'top' });
  });
  nota(s, 1.15, 8.6, 17.7, 0.9, 'Tempo médio para um condomínio padrão, do login ao PDF: cerca de 10 minutos.');
}

// ══════════════════════════════════════════════════════════════════
divisor('01', 'ACESSO', 'Entrar, primeiro acesso e a tela principal.', 'Slides 5 a 7');
{
  const s = base(false, 'Bloco 01 · Acesso'); cabecalho(s, 'ACESSO', 'ENTRAR NO GERADOR');
  img(s, 'login_crop', 1.15, 3.0, 7.4, 6.6, 'centro');
  itens(s, 9.21, 3.1, 9.6, [
    ['O LINK', `${URL} abre em qualquer navegador, em qualquer computador. Não instala nada. (O endereço antigo bg-gmd.vercel.app continua valendo.)`],
    ['E-MAIL', 'O e-mail que o administrador cadastrou na Equipe. Sem cadastro, o gerador recusa a entrada.'],
    ['SENHA', 'A que você criou no primeiro acesso. Esqueceu? "Esqueci a senha" manda um link para o seu e-mail.'],
    ['SESSÃO', 'Fica lembrada no navegador. Em computador compartilhado, use "sair" no canto superior direito.'],
  ], { gap: 1.2 });
  nota(s, 9.2, 8.2, 9.6, 1.0, 'Seu nome aparece como gestor em cada projeto que você cria e no campo "Elaborado" do memorial.');
}
{
  const s = base(true, 'Bloco 01 · Acesso'); cabecalho(s, 'ACESSO', 'PRIMEIRO ACESSO E SENHA');
  cartao(s, 1.15, 3.0, 5.7, 4.6, '1', 'O ADMINISTRADOR CADASTRA SEU E-MAIL', 'Menu ☰ → Equipe → Adicionar pessoa: e-mail, nome e papel (projetista, líder ou administrador).', { fs: 15 });
  cartao(s, 7.15, 3.0, 5.7, 4.6, '2', 'VOCÊ CLICA EM "PRIMEIRO ACESSO"', 'Na tela de entrada, informe o e-mail cadastrado e crie a sua senha. Chega um e-mail de confirmação: clique no link e pronto.', { fs: 15 });
  cartao(s, 13.15, 3.0, 5.7, 4.6, '3', 'ENTRE COM E-MAIL E SENHA', 'Da próxima vez é só entrar. Trocou de computador? Mesmo e-mail, mesma senha — os projetos estão na nuvem, não na máquina.', { fs: 15 });
  nota(s, 1.15, 8.1, 17.7, 0.9, 'Papéis: projetista cria e emite memoriais; líder e administrador também criam e excluem modelos do time; só o administrador cadastra pessoas.');
}
{
  const s = base(false, 'Bloco 01 · Acesso'); cabecalho(s, 'A TELA', 'TUDO O QUE VOCÊ VÊ');
  img(s, 'tela', 1.15, 2.95, 12.0, 7.5);
  itens(s, 13.91, 2.95, 4.95, [
    ['STATUS DO DOCUMENTO', 'Rascunho, Revisado ou Emitido, com os botões do fluxo.'],
    ['PENDÊNCIAS', 'Pílula vermelha com o que falta; clique e vá direto ao campo.'],
    ['BUSCA', 'Por cliente, número, endereço ou gestor.'],
    ['MENU ☰ E GERAR PDF', 'Tudo o que não é preencher fica no menu.'],
    ['CARD DE PARÂMETROS', 'Barra de etapas, a etapa atual e Anterior / Próximo.'],
    ['O DOCUMENTO', 'Página por página, igual ao PDF.'],
  ], { gap: 1.12, fs: 13.5 });
}

// ══════════════════════════════════════════════════════════════════
divisor('02', 'COMEÇAR UM PROJETO', 'O menu ☰, os modelos do time e o número do documento.', 'Slides 9 a 11');
{
  const s = base(true, 'Bloco 02 · Começar'); cabecalho(s, 'COMEÇAR', 'O MENU ☰: TRÊS JEITOS DE COMEÇAR');
  img(s, 'menu_crop', 1.15, 3.0, 6.2, 6.6, 'centro');
  cartao(s, 8.0, 3.0, 10.85, 1.95, 'O PADRÃO', 'NOVO A PARTIR DE UM MODELO', 'Abre a biblioteca do time: pesquise pelo cenário (Condomínio 2 × 7,4 kW, Frota 60 kW DC…) e clique em Usar. Vem tudo preenchido, menos cliente, endereço, fotos e ART.');
  cartao(s, 8.0, 5.2, 10.85, 1.95, 'MESMO PROJETO, OUTRO CLIENTE', 'DUPLICAR ESTE PROJETO', 'Copia o projeto aberto com um número novo. Útil para torres iguais do mesmo condomínio ou obras repetidas.');
  cartao(s, 8.0, 7.4, 10.85, 1.95, 'SÓ FORA DO PADRÃO', 'NOVO PROJETO EM BRANCO', 'Use quando nenhum modelo serve. Tudo começa vazio, com os padrões de cabo, temperatura e queda de tensão da BeGreen.');
  nota(s, 8.0, 9.6, 10.85, 0.85, 'Em qualquer um dos três, o número BG-ME é gerado na hora e o projeto já vai para a nuvem.');
}
{
  const s = base(false, 'Bloco 02 · Começar'); cabecalho(s, 'COMEÇAR', 'A BIBLIOTECA DE MODELOS');
  img(s, 'modelos_crop', 1.15, 3.0, 11.2, 4.6);
  itens(s, 13.0, 3.05, 5.85, [
    ['PESQUISE', 'Nome, potência, tensão, QDA… a lista filtra enquanto você digita.'],
    ['USAR', 'Cria o projeto com os parâmetros do modelo. Nada é sobrescrito no modelo.'],
    ['OFICIAIS E DO TIME', 'Os oficiais são os cenários BeGreen; os do time, criados por líderes e administradores.'],
    ['SALVAR COMO MODELO', 'Ficou um projeto bem montado? Menu ☰ → Salvar o projeto atual como modelo (líder/admin).'],
  ], { gap: 1.25, fs: 13.5 });
  nota(s, 1.15, 8.1, 17.7, 0.9, 'Só líderes e administradores criam e excluem modelos (botão ×). Projetistas usam.');
}
{
  const s = base(true, 'Bloco 02 · Começar'); cabecalho(s, 'COMEÇAR', 'NÚMERO DO DOCUMENTO E CLIENTE');
  const partes = [['BG-', 'BeGreen'], ['ME-', 'Mobilidade Elétrica'], ['26-', 'Ano (2026)'], ['0001', 'Sequência do ano']];
  partes.forEach(([p, d], i) => {
    const x = 1.15 + i * 4.45;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 3.0, w: 4.2, h: 2.4, fill: { color: C.card }, line: { color: C.card }, rectRadius: 0.2 });
    s.addText(p, { x: x + 0.3, y: 3.2, w: 3.6, h: 1.2, fontFace: 'Oswald', fontSize: 54, bold: true, color: C.lime, margin: 0 });
    s.addText(d, { x: x + 0.3, y: 4.45, w: 3.6, h: 0.6, fontFace: 'Montserrat', fontSize: 15, color: C.g3, margin: 0 });
  });
  itens(s, 1.15, 6.0, 8.5, [
    ['AUTOMÁTICO', 'O botão "auto" ao lado do nº pega o próximo número da sequência na nuvem — nunca repete, mesmo com duas pessoas criando ao mesmo tempo.'],
    ['NÃO INVENTE NÚMERO', 'Só digite à mão se for regularizar um documento antigo.'],
  ], { gap: 1.5 });
  itens(s, 10.35, 6.0, 8.5, [
    ['CLIENTE', 'Comece a digitar: os clientes já usados aparecem para completar. Escreva como deve sair na capa.'],
    ['ENDEREÇO E CIDADE/UF', 'Também vão para a capa e para o cabeçalho de cada página.'],
  ], { gap: 1.5 });
  nota(s, 1.15, 9.3, 17.7, 0.85, 'O arquivo PDF sai com o nome padrão: BG-ME-26-0001_Rev00_Cliente.pdf.');
}

// ══════════════════════════════════════════════════════════════════
divisor('03', 'PREENCHER', 'O assistente por etapas: uma seção por vez. O que a ferramenta calcula, você não digita.', 'Slides 13 a 18');
{
  const s = base(false, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'COMO FUNCIONA O ASSISTENTE POR ETAPAS');
  img(s, 'card_crop', 1.15, 3.0, 5.6, 6.6);
  itens(s, 7.4, 3.05, 5.5, [
    ['BARRA DE ETAPAS', 'Dez traços: verde = concluída, preto = atual, tracejado = não se aplica. Clique em qualquer um para pular.'],
    ['ANTERIOR / PRÓXIMO', 'Sempre no rodapé do card. Na última etapa vira "Concluir".'],
    ['ETAPAS AUTOMÁTICAS', 'Transformador (3), QDA (4) e Análise de demanda (7) só aparecem se você marcar "Sim" na etapa 2.'],
  ], { gap: 1.55, fs: 13.5 });
  itens(s, 13.4, 3.05, 5.5, [
    ['NADA SE PERDE', 'Cada campo é salvo na nuvem ao sair dele. A etapa em que você parou é lembrada.'],
    ['RECOLHER PARÂMETROS', 'O card vira a bola BeGreen no canto; clique nela para voltar. Sobra tela para ler o documento.'],
    ['O DOCUMENTO ACOMPANHA', 'Cada campo alterado redesenha o memorial ao lado, com paginação real.'],
  ], { gap: 1.55, fs: 13.5 });
  img(s, 'bola_crop', 15.6, 7.9, 3.2, 2.38);
}
{
  const s = base(true, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPAS 1 E 2 · CLIENTE E ENTRADA DE ENERGIA');
  img(s, 'etapa2_crop', 1.15, 3.0, 5.6, 6.6);
  cartao(s, 7.4, 3.0, 5.5, 6.7, 'ETAPA 1', 'IDENTIFICAÇÃO DO CLIENTE',
    'Cliente, endereço, cidade/UF, nº do documento (auto), revisão e data, ART de execução e descrição da revisão.\n\n"Emitir nova revisão" guarda a versão atual no histórico antes de você alterar o documento.', { fs: 13.5 });
  cartao(s, 13.4, 3.0, 5.5, 6.7, 'ETAPA 2', 'ENTRADA DE ENERGIA',
    'Tensão e configuração (127/220/380 V · F+N+T, 2F+T, 2F+N+T, 3F+N+T), disjuntor geral do QGBT, corrente de curto presumida Ik (kA), aterramento existente e esquema TN-S / TT.\n\nAqui você também liga as etapas opcionais: transformador, QDA e análise de demanda.', { fs: 13.5 });
}
{
  const s = base(false, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPAS 3 E 4 · TRANSFORMADOR E QDA (SÓ QUANDO SE APLICAM)');
  cartao(s, 1.15, 3.0, 8.6, 4.6, 'ETAPA 3', 'TRANSFORMADOR',
    'Aparece só com "Necessidade de transformador = Sim". Potência (kVA), tensões e modos de ligação do primário e secundário, grau de proteção.\n\nCom transformador, o QDA é incluído automaticamente e a tensão de saída passa a ser a referência dos circuitos.', { fs: 15 });
  cartao(s, 10.25, 3.0, 8.6, 4.6, 'ETAPA 4', 'QDA · QUADRO DE DISTRIBUIÇÃO DAS ESTAÇÕES',
    'Aparece com "Quadro de distribuição dedicado = Sim". Informe a quantidade de estações de recarga: o gerador cria um ponto para cada uma e dimensiona o Trecho 2 (QGBT → QDA) para a soma delas.\n\nSem QDA, cada estação sai direto do QGBT (Trecho 1).', { fs: 15 });
  nota(s, 1.15, 8.0, 17.7, 0.9, 'Não se aplica? A etapa nem aparece: a barra mostra o traço tracejado e o Próximo pula por cima.');
}
{
  const s = base(true, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPA 5 · ESTAÇÕES DE RECARGA E CIRCUITOS');
  img(s, 'combo_crop', 1.15, 3.0, 5.6, 6.6);
  itens(s, 7.4, 3.05, 5.5, [
    ['MARCA E MODELO', 'Digite ou escolha no catálogo (▾): Wallbox AC 7,4 / 11 / 22 kW e estações DC de 30 a 360 kW. Potência, conector e AC/DC vêm junto.'],
    ['POTÊNCIA E CONECTOR', 'Definem corrente, disjuntor e cabo do circuito. DC muda o memorial para Modo 4 (IEC 61851).'],
    ['DISJUNTOR', 'Calculado. Só preencha para forçar um valor diferente.'],
  ], { gap: 1.7, fs: 13.5 });
  itens(s, 13.4, 3.05, 5.5, [
    ['APLICAR AO RESTANTE', 'Copia marca, modelo e potência do 1º ponto para os demais.'],
    ['DPS (kA)', '45 kA é o padrão BeGreen; 20 kA quando for o kit Clamper.'],
    ['CONEXÃO DAS ESTAÇÕES', 'Ponto de internet do cliente ou "não se aplica" — muda as providências do cliente no memorial.'],
  ], { gap: 1.7, fs: 13.5 });
  nota(s, 7.4, 8.6, 11.5, 0.9, 'As características de cada carga (marca, modelo, tensão, corrente, potência, FP) entram em texto corrido no memorial.');
}
{
  const s = base(false, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPA 6 · TRECHOS E DIMENSIONAMENTO');
  img(s, 'etapa6_crop', 1.15, 3.0, 5.6, 6.6);
  itens(s, 7.4, 3.05, 5.5, [
    ['CLASSE DO CABO', 'HEPR 1 kV (padrão BeGreen, tabelas 37/39 da NBR 5410) ou PVC 750 V (tabela 36). Muda o cálculo e as premissas do texto.'],
    ['TEMPERATURAS', 'Ambiente e do solo: aplicam o fator de correção da norma.'],
    ['LIMITE DE QUEDA DE TENSÃO', '4 % por padrão; edite se o projeto exigir outro limite.'],
  ], { gap: 1.7, fs: 13.5 });
  itens(s, 13.4, 3.05, 5.5, [
    ['TRECHOS', 'QGBT → QDA e QDA → estações (ou QGBT → estação). Informe a distância de cada um.'],
    ['MÉTODO DE REFERÊNCIA', 'A1 a G (tabela 33): embutido, eletroduto aparente, enterrado, bandeja… define a capacidade do cabo.'],
    ['RESULTADO', 'Seção do cabo, eletroduto, ΔV e "Atende / Reavaliar" aparecem no próprio card e na tabela 5.6.'],
  ], { gap: 1.7, fs: 13.5 });
  nota(s, 7.4, 8.6, 11.5, 0.9, 'Só edite seção ou disjuntor à mão em caso justificado — o valor manual passa a valer no memorial.');
}
{
  const s = base(true, 'Bloco 03 · Preencher'); cabecalho(s, 'PREENCHER', 'ETAPAS 7 A 10 · DEMANDA, CONCLUSÃO, FOTOS E OBSERVAÇÕES');
  cartao(s, 1.15, 3.0, 4.2, 4.6, 'ETAPA 7', 'ANÁLISE DE DEMANDA', 'Só se marcada na etapa 2. Potência disponível medida (kW) e pontos simultâneos → seção própria no memorial.', { fs: 13.5 });
  cartao(s, 5.55, 3.0, 4.2, 4.6, 'ETAPA 8', 'CONCLUSÃO', 'Precisa alterar o padrão de entrada? O card mostra a participação das estações na carga instalada.', { fs: 13.5 });
  cartao(s, 9.95, 3.0, 4.2, 4.6, 'ETAPA 9', 'FOTOS DO LOCAL', 'Opcionais. Se colocar, a legenda é obrigatória (vira pendência). ★ guarda a foto na biblioteca do time para reutilizar.', { fs: 13.5 });
  cartao(s, 14.35, 3.0, 4.5, 4.6, 'ETAPA 10', 'OBSERVAÇÕES', 'Texto livre da obra. Clique numa frase pronta para inserir; "+ nova frase" guarda uma frase sua para o time.', { fs: 13.5 });
  nota(s, 1.15, 8.0, 17.7, 0.9, 'Última etapa: "Concluir" volta ao topo e abre a lista de pendências — é a deixa para conferir.');
}

// ══════════════════════════════════════════════════════════════════
divisor('04', 'CONFERIR E EMITIR', 'Pendências, o documento, o fluxo de aprovação e as revisões.', 'Slides 20 a 23');
{
  const s = base(false, 'Bloco 04 · Conferir e emitir'); cabecalho(s, 'CONFERIR', 'PENDÊNCIAS: O QUE FALTA E ONDE ESTÁ');
  img(s, 'pend_crop', 1.15, 3.0, 11.0, 3.42);
  img(s, 'topo_crop', 1.15, 6.7, 17.7, 1.48);
  itens(s, 12.8, 3.05, 6.05, [
    ['A PÍLULA', 'Na barra superior: vermelha com a contagem, verde quando está tudo certo.'],
    ['A LISTA', 'Clique na pílula: cada item diz a seção e o campo. Clique no item e o GMD abre a etapa e foca o campo.'],
    ['[XX] NO DOCUMENTO', 'Marcadores que ainda aparecem no texto: falta algum dado que alimenta aquele trecho.'],
  ], { gap: 1.2, fs: 13.5 });
  nota(s, 1.15, 8.7, 17.7, 0.9, 'Com pendências não há emissão nem PDF. Navegar entre as etapas é livre — o bloqueio é só na saída.');
}
{
  const s = base(true, 'Bloco 04 · Conferir e emitir'); cabecalho(s, 'CONFERIR', 'O QUE VOCÊ VÊ É O PDF');
  img(s, 'doc3_crop', 1.15, 3.0, 5.9, 6.6);
  img(s, 'doc7_crop', 7.3, 3.0, 5.9, 6.6);
  itens(s, 13.5, 3.05, 5.4, [
    ['PÁGINAS REAIS', 'A4 com cabeçalho e rodapé em todas; nada quebra no meio de uma tabela.'],
    ['ÍNDICE COM PÁGINAS', 'Numeração dos itens acompanha as seções incluídas.'],
    ['TABELA 5.6', 'Trecho, método, corrente, cabo, terra, distância, ΔV e situação.'],
    ['ELABORADO / APROVADO', 'Elaborado = você (gestor). Aprovado = Eng. Kauê B. Angeli.'],
  ], { gap: 1.45, fs: 13.5 });
}
{
  const s = base(false, 'Bloco 04 · Conferir e emitir'); cabecalho(s, 'EMITIR', 'RASCUNHO → REVISADO → EMITIDO');
  const est = [['RASCUNHO', C.g1, 'Editando. Sem pendências, clique em "Marcar como revisado".'], ['REVISADO', 'B8860B', 'Alguém confere o documento. "Voltar a rascunho" para ajustar, "Emitir" para fechar.'], ['EMITIDO', C.greenD, 'Campos travados, PDF liberado. Quem emitiu e quando ficam registrados no documento.']];
  est.forEach(([t, cor, d], i) => {
    const x = 1.15 + i * 6.0;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 3.1, w: 5.7, h: 4.4, fill: { color: C.white }, line: { color: C.ln, width: 0.75 }, rectRadius: 0.2 });
    s.addShape(pptx.ShapeType.roundRect, { x: x + 0.4, y: 3.5, w: 2.6, h: 0.6, fill: { color: cor }, line: { color: cor }, rectRadius: 0.1 });
    s.addText(t, { x: x + 0.4, y: 3.5, w: 2.6, h: 0.6, fontFace: 'Oswald', fontSize: 15, bold: true, color: C.white, align: 'center', valign: 'middle', charSpacing: 3, margin: 0 });
    s.addText(d, { x: x + 0.4, y: 4.4, w: 4.9, h: 2.8, fontFace: 'Montserrat', fontSize: 15, color: C.g1, valign: 'top', margin: 0 });
    if (i < 2) s.addText('›', { x: x + 5.7, y: 4.6, w: 0.3, h: 1.0, fontFace: 'Oswald', fontSize: 40, color: C.g3, align: 'center', margin: 0 });
  });
  nota(s, 1.15, 8.1, 17.7, 0.9, 'Os botões do fluxo ficam na barra superior, ao lado do status. Gerar PDF só funciona com o documento Emitido e sem pendências.');
}
{
  const s = base(true, 'Bloco 04 · Conferir e emitir'); cabecalho(s, 'EMITIR', 'MUDOU ALGO DEPOIS? NOVA REVISÃO');
  cartao(s, 1.15, 3.0, 5.7, 4.6, '1', 'CLIQUE EM "NOVA REVISÃO"', 'Na barra superior, com o documento Emitido. O status volta a Rascunho e os campos destravam.', { fs: 15 });
  cartao(s, 7.15, 3.0, 5.7, 4.6, '2', 'A VERSÃO ANTERIOR FICA GUARDADA', 'Rev. 00 vai para o histórico da etapa 1 ("abrir cópia" mostra a versão antiga). A revisão sobe para 01 com a data de hoje.', { fs: 15 });
  cartao(s, 13.15, 3.0, 5.7, 4.6, '3', 'DESCREVA O QUE MUDOU', 'O campo "Descrição desta revisão" vai para a tabela de revisões do memorial. Depois: revisar e emitir de novo.', { fs: 15 });
  nota(s, 1.15, 8.0, 17.7, 0.9, 'Nunca edite um documento Emitido "por fora": o PDF antigo já pode estar com o cliente. Sempre nova revisão.');
}

// ══════════════════════════════════════════════════════════════════
divisor('05', 'PADRÕES DA CASA', 'O que é fixo, o que muda por obra e o que o time compartilha.', 'Slides 25 a 27');
{
  const s = base(false, 'Bloco 05 · Padrões da casa'); cabecalho(s, 'PADRÃO', 'O QUE É FIXO E O QUE MUDA');
  cartao(s, 1.15, 3.0, 8.6, 5.4, 'FIXO · NÃO SE EDITA', 'O QUE GARANTE O PADRÃO',
    '• Normas e referências (NBR 5410, 17019, IEC 61851, 61439…)\n• Textos das seções, critérios e premissas\n• Tabelas de capacidade (36 a 39), fatores de temperatura, queda de tensão\n• Cabeçalho, rodapé, capa, índice, revisões, Aprovado\n• Numeração BG-ME e nome do arquivo', { fs: 16 });
  cartao(s, 10.25, 3.0, 8.6, 5.4, 'MUDA POR OBRA · VOCÊ PREENCHE', 'O QUE VEM DAS DEZ ETAPAS',
    '• Cliente, endereço, ART, revisão\n• Rede: tensão, configuração, disjuntor, Ik, aterramento\n• Transformador, QDA, análise de demanda (quando houver)\n• Estações: marca, modelo, potência, DPS, conexão\n• Cabo (1 kV / 750 V), temperaturas, limite de ΔV, distâncias e métodos\n• Fotos com legenda e observações', { fs: 16 });
  nota(s, 1.15, 8.8, 17.7, 0.9, 'Na dúvida se algo é fixo ou variável: se não está nas dez etapas, é padrão da casa — fale com o administrador para mudar.');
}
{
  const s = base(true, 'Bloco 05 · Padrões da casa'); cabecalho(s, 'PADRÃO', 'CATÁLOGO, EQUIPE E PAPÉIS');
  img(s, 'catalogo_crop', 1.15, 3.0, 6.6, 5.6);
  img(s, 'equipe_crop', 8.0, 3.0, 10.85, 3.05);
  itens(s, 8.0, 6.4, 5.2, [
    ['CATÁLOGO DE EQUIPAMENTOS', 'Menu ☰ → Catálogo: marca, modelo, kW, conector, AC/DC e IP. Compartilhado com todo o time; "+ adicionar" e "Salvar catálogo".'],
  ], { gap: 1.6, fs: 13.5 });
  itens(s, 13.6, 6.4, 5.25, [
    ['EQUIPE E PAPÉIS', 'Projetista: cria e emite. Líder: também cria/exclui modelos. Administrador: tudo isso e cadastra pessoas. Desativar bloqueia o acesso na hora.'],
  ], { gap: 1.6, fs: 13.5 });
  nota(s, 8.0, 8.9, 10.85, 0.85, 'Frases prontas e fotos padrão também são do time: o que você guarda aparece para todos.');
}
{
  const s = base(false, 'Bloco 05 · Padrões da casa'); cabecalho(s, 'PADRÃO', 'MÉTRICAS DO TIME');
  img(s, 'metricas_crop', 1.15, 3.0, 11.0, 5.2);
  itens(s, 12.8, 3.05, 6.05, [
    ['POR GESTOR', 'Criados, emitidos, em aberto e tempo médio até emitir.'],
    ['POR SEMANA', 'Memoriais criados e emitidos nas últimas 8 semanas.'],
    ['PENDÊNCIAS MAIS COMUNS', 'O que mais trava os projetos em aberto — bom para treinar o time.'],
  ], { gap: 1.3, fs: 13.5 });
  nota(s, 1.15, 8.6, 17.7, 0.9, 'Menu ☰ → Métricas. Os dados vêm da nuvem compartilhada; todo mundo vê os mesmos números.');
}

// ══════════════════════════════════════════════════════════════════
divisor('06', 'PRÁTICA', 'Exercício guiado, erros comuns e a última conferência.', 'Slides 29 a 31');
{
  const s = base(false, 'Bloco 06 · Prática'); cabecalho(s, 'PRÁTICA', 'EXERCÍCIO GUIADO · 10 MINUTOS');
  itens(s, 1.15, 3.05, 8.5, [
    ['ENTRAR', `${URL} com seu e-mail e senha.`],
    ['MENU ☰ → NOVO A PARTIR DE UM MODELO', 'Escolha "Condomínio · 2 × 7,4 kW · 220 V 2F+N+T · QDA" e clique em Usar.'],
    ['ETAPA 1', 'Cliente "Condomínio Treinamento", endereço, cidade/UF, nº "auto", ART 000000.'],
    ['ETAPA 2', 'Confira tensão e disjuntor geral; Ik = 6 kA; aterramento existente = Sim.'],
  ], { gap: 1.45 });
  itens(s, 10.35, 3.05, 8.5, [
    ['ETAPA 5', 'Modelo Wallbox AC 7,4 kW nos dois pontos ("Aplicar ao restante"). DPS 45 kA.'],
    ['ETAPA 6', 'Trecho 1: 15 m, método B1. Circuitos: 20 m e 30 m. Veja a seção do cabo mudar.'],
    ['CONFERIR', 'Zere as pendências pela pílula da barra. Olhe a tabela 5.6 e o diagrama.'],
    ['EMITIR', 'Marcar como revisado → Emitir → Gerar PDF. Confira o nome do arquivo.'],
  ], { gap: 1.45 });
  nota(s, 1.15, 9.0, 17.7, 0.9, 'Depois do exercício, exclua o projeto de treino ou mantenha-o como rascunho para consulta — nunca o emita para um cliente real.');
}
{
  const s = base(true, 'Bloco 06 · Prática'); cabecalho(s, 'PRÁTICA', 'DEU ERRADO? O QUE FAZER');
  const erros = [
    ['● NUVEM INDISPONÍVEL', 'Sem internet ou Supabase pausado. Os dados ficam no navegador e sobem quando voltar. Avise o administrador se persistir.'],
    ['NÃO CONSIGO ENTRAR', 'E-mail não cadastrado na Equipe, ou senha errada. Use "Esqueci a senha"; se não chegar e-mail, peça o cadastro.'],
    ['PRÓXIMO PULOU UMA ETAPA', 'É normal: transformador, QDA e análise de demanda só aparecem quando marcados "Sim" na etapa 2.'],
    ['GERAR PDF NÃO FAZ NADA', 'Há pendências ou o documento não está Emitido. Veja a pílula na barra superior.'],
    ['CABO "REAVALIAR"', 'Queda de tensão acima do limite: aumente a seção, reduza a distância ou revise o método de referência.'],
    ['ERREI DEPOIS DE EMITIR', 'Nova revisão. Nunca edite o PDF nem apague o projeto emitido.'],
  ];
  erros.forEach(([t, d], i) => {
    const col = i % 2, row = Math.floor(i / 2); const x = 1.15 + col * 9.1, y = 3.0 + row * 2.05;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 8.6, h: 1.85, fill: { color: C.card }, line: { color: C.card }, rectRadius: 0.18 });
    s.addText(t, { x: x + 0.4, y: y + 0.22, w: 7.8, h: 0.4, fontFace: 'Oswald', fontSize: 17, bold: true, color: C.lime, margin: 0 });
    s.addText(d, { x: x + 0.4, y: y + 0.68, w: 7.8, h: 1.05, fontFace: 'Montserrat', fontSize: 13.5, color: C.g3, valign: 'top', margin: 0 });
  });
  nota(s, 1.15, 9.3, 17.7, 0.85, 'Dúvida que não está aqui: fale com o administrador do gerador (contato no próximo slide).');
}
{
  const s = base(true, 'Encerramento'); cabecalho(s, 'ANTES DE ENVIAR', 'ÚLTIMA CONFERÊNCIA');
  const checks = ['Cliente, endereço e cidade estão como devem sair na capa?', 'Número e revisão corretos? A ART está preenchida?', 'Tabela 5.6 toda "Atende"? Diagrama unifilar com todos os pontos?', 'Fotos com legenda e observações específicas da obra?', 'Status Emitido, com a pílula de pendências verde?', 'Arquivo com o nome padrão BG-ME-AA-NNNN_RevNN_Cliente.pdf?'];
  checks.forEach((t, i) => {
    s.addText('✓', { x: 1.15, y: 3.0 + i * 0.95, w: 0.5, h: 0.7, fontFace: 'Montserrat', fontSize: 24, bold: true, color: C.lime, margin: 0 });
    s.addText(t, { x: 1.8, y: 3.0 + i * 0.95, w: 11.5, h: 0.7, fontFace: 'Montserrat', fontSize: 19, color: C.white, valign: 'middle', margin: 0 });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 13.7, y: 3.0, w: 5.15, h: 5.6, fill: { color: C.card }, line: { color: C.card }, rectRadius: 0.2 });
  s.addText('LINK', { x: 14.1, y: 3.35, w: 4.4, h: 0.35, fontFace: 'Oswald', fontSize: 14, color: C.lime, charSpacing: 3, margin: 0 });
  s.addText(URL, { x: 14.1, y: 3.75, w: 4.4, h: 0.6, fontFace: 'Oswald', fontSize: 24, bold: true, color: C.white, margin: 0 });
  s.addText('DÚVIDAS E CADASTROS', { x: 14.1, y: 4.75, w: 4.4, h: 0.35, fontFace: 'Oswald', fontSize: 14, color: C.lime, charSpacing: 3, margin: 0 });
  s.addText('Kauê Brunetti\nadministrador do gerador\nkba@mybegreen.com.br', { x: 14.1, y: 5.15, w: 4.4, h: 1.4, fontFace: 'Montserrat', fontSize: 14, color: C.g3, margin: 0 });
  s.addText('MATERIAL', { x: 14.1, y: 6.85, w: 4.4, h: 0.35, fontFace: 'Oswald', fontSize: 14, color: C.lime, charSpacing: 3, margin: 0 });
  s.addText('Esta apresentação fica na pasta do time para consulta (docs/treinamento).', { x: 14.1, y: 7.25, w: 4.4, h: 1.2, fontFace: 'Montserrat', fontSize: 13, color: C.g3, margin: 0 });
  s.addText('Obrigado. Agora é só emitir.', { x: 1.15, y: 9.2, w: 12, h: 0.7, fontFace: 'Oswald', fontSize: 30, bold: true, color: C.lime, margin: 0 });
}

pptx.writeFile({ fileName: OUT }).then(f => console.log('ok', n, 'slides →', f));
