/* ============================================================
   app.js — formulário, estado, persistência (localStorage),
   preview ao vivo, histórico pesquisável de projetos e
   exportação (PDF via impressão nativa · download em HTML).
   ============================================================ */

(function () {
  const LS_KEY = 'begreen-memoriais';
  const fmt = window.Calc.fmt;

  // ── Estado ─────────────────────────────────────────────────
  function novoCarregador() {
    return { potencia: '', infra: 'B1', marca: '', modelo: '', conector: '', cabo: '', distancia: '', temperatura: '', incluirKit: false, secaoManual: '', disjuntorManual: '', idrManual: '', eletrodutoManual: '' };
  }
  function novoProjeto() {
    return {
      id: 'p' + Date.now().toString(36),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      cliente: '', endereco: '', cidadeUf: '', docNum: proximoDocNum(),
      revisao: '00', dataRevisao: hoje(), descricaoRevisao: 'Emissão inicial', historicoRevisoes: [],
      tensao: 220, config: '2F+N+T', disjuntorGeral: '', ikPresumida: '', aterramento: 'TN-S', aterramentoExistente: 'sim', internetCliente: 'sim', dpsKa: '45',
      infra: 'B1', classeCabo: '1kV', tempAmbiente: '30', tempSolo: '20', quedaMax: '4', quadroDistribuicao: 'nao', qdQuantidade: '',
      trecho4Modo: 'individual', trecho4Duto: 'eletroduto', trecho4Tamanho: '',
      transformador: 'nao', trafoPotencia: '',
      trafoPrimV: '', trafoPrimLig: '', trafoSecV: '', trafoSecLig: '', trafoIp: '',
      trechos: { t1: { I: '', L: '', secao: '', eletroduto: '', infra: 'B1' }, t2: { I: '', L: '', secao: '', eletroduto: '', infra: 'B1' }, t3: { I: '', L: '', secao: '', eletroduto: '', infra: 'B1' } },
      analiseDemanda: 'nao', potenciaDisponivel: '', pontosSimultaneos: '',
      carregadores: [novoCarregador()],
      alterarPadrao: 'nao', artExecucao: '',
      fotos: [], observacoes: '',
      status: 'rascunho', gestor: gestorAtual(), emitidoEm: '', emitidoPor: '',
    };
  }

  // Migra projetos salvos com esquemas antigos
  function migrar(p) {
    // Configurações válidas: F+N+T · 2F+T · 2F+N+T · 3F+N+T, em 127, 220 ou 380 V
    if (p.config === '1F+N+T') p.config = 'F+N+T';
    if (Number(p.tensao) === 380 && p.config !== '3F+N+T') p.config = '3F+N+T';
    // Formas de passagem antigas passam a ser métodos de referência (NBR 5410, tabela 33)
    const METODO_ANTIGO = { solo: 'D', alvenaria: 'B1', aparente: 'B1' };
    if (METODO_ANTIGO[p.infra]) p.infra = METODO_ANTIGO[p.infra];
    if (!p.infra) p.infra = 'B1';
    if (!window.Calc.CABOS[p.classeCabo]) p.classeCabo = '1kV';
    if (p.tempAmbiente === undefined || p.tempAmbiente === '') p.tempAmbiente = '30';
    if (p.tempSolo === undefined || p.tempSolo === '') p.tempSolo = '20';
    if (!(Number(p.quedaMax) > 0)) p.quedaMax = String(window.Calc.QUEDA_MAX);
    (p.carregadores || []).forEach(cg => { if (METODO_ANTIGO[cg.infra]) cg.infra = METODO_ANTIGO[cg.infra]; });
    ['t1', 't2', 't3'].forEach(k => { const tr = (p.trechos || {})[k]; if (tr && METODO_ANTIGO[tr.infra]) tr.infra = METODO_ANTIGO[tr.infra]; });
    if (!p.quadroDistribuicao) p.quadroDistribuicao = p.topologia === 'quadro' ? 'sim' : 'nao';
    if (p.qdCorrente === undefined) p.qdCorrente = '';
    if (p.qdQuantidade === undefined) p.qdQuantidade = '';
    if (p.qdGeral === undefined) p.qdGeral = '';
    if (p.qdClienteDisj === undefined) p.qdClienteDisj = '';
    if (!p.transformador) p.transformador = 'nao';
    if (p.trafoPotencia === undefined) p.trafoPotencia = '';
    if (p.trafoDisjuntor === undefined) p.trafoDisjuntor = '';
    ['trafoPrimV', 'trafoPrimLig', 'trafoSecV', 'trafoSecLig', 'trafoIp'].forEach(k => { if (p[k] === undefined) p[k] = ''; });
    if (!p.trechos) p.trechos = {};
    ['t1', 't2', 't3'].forEach(k => {
      if (!p.trechos[k]) p.trechos[k] = { I: '', L: '', secao: '', eletroduto: '', infra: p.infra || 'B1' };
      if (p.trechos[k].I === undefined) p.trechos[k].I = '';
      if (!p.trechos[k].infra) p.trechos[k].infra = p.infra || 'B1';
    });
    if (p.qdCorrente && !p.trechos.t1.I) p.trechos.t1.I = p.qdCorrente;
    if (p.trafoDisjuntor && !p.trechos.t2.I) p.trechos.t2.I = p.trafoDisjuntor;
    (p.carregadores || []).forEach(cg => { if (!cg.infra) cg.infra = p.infra || 'B1'; if (cg.marca === undefined) cg.marca = ''; });
    if (!p.analiseDemanda) p.analiseDemanda = (p.potenciaDisponivel || p.pontosSimultaneos) ? 'sim' : 'nao';
    if (p.artExecucao === undefined) p.artExecucao = '';
    if (!p.trecho4Modo) p.trecho4Modo = 'individual';
    if (!p.aterramentoExistente) p.aterramentoExistente = 'sim';
    if (!p.internetCliente) p.internetCliente = 'sim';
    if (!(Number(p.dpsKa) > 0)) p.dpsKa = String(window.Calc.DPS_KA);
    if (!['TN-S', 'TT'].includes(p.aterramento)) p.aterramento = p.aterramentoExistente === 'nao' ? 'TT' : 'TN-S';
    if (!p.trecho4Duto) p.trecho4Duto = 'eletroduto';
    if (p.trecho4Tamanho === undefined) p.trecho4Tamanho = '';
    if (!p.atualizadoEm) p.atualizadoEm = p.criadoEm || new Date().toISOString();
    if (!Array.isArray(p.historicoRevisoes)) p.historicoRevisoes = [];
    if (!['rascunho', 'revisado', 'emitido'].includes(p.status)) p.status = 'rascunho';
    if (p.gestor === undefined) p.gestor = '';
    if (p.emitidoEm === undefined) p.emitidoEm = '';
    if (p.emitidoPor === undefined) p.emitidoPor = '';
    if (p.descricaoRevisao === undefined) p.descricaoRevisao = (!p.revisao || p.revisao === '00') ? 'Emissão inicial' : 'Revisão do documento';
    const mapaEl = { '1 1/4"': '1.1/4"', '1 1/2"': '1.1/2"', '2 1/2"': '2.1/2"' };
    (p.carregadores || []).forEach(cg => {
      if (cg.incluirKit === undefined) cg.incluirKit = !!cg.incluirIdr;
      if (mapaEl[cg.eletrodutoManual]) cg.eletrodutoManual = mapaEl[cg.eletrodutoManual];
    });
    Object.values(p.trechos || {}).forEach(tr => { if (tr && mapaEl[tr.eletroduto]) tr.eletroduto = mapaEl[tr.eletroduto]; });
    return p;
  }

  // ── Utilidades de produtividade ───────────────────────────
  function hoje() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function dataBrCurta(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? `${m[3]}/${m[2]}/${m[1]}` : '—';
  }
  function slug(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'Cliente';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function lerLS(k, padrao) {
    try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? padrao : v; } catch (e) { return padrao; }
  }
  function gravarLS(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { setStatus('⚠ Não foi possível salvar: armazenamento cheio.'); }
  }
  function novoId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  // Numeração automática BG-ME-AA-NNNN: sequência por ano; um número usado não se repete
  const LS_NUMERO = 'begreen-ultimo-numero';
  function proximoDocNum() {
    const ano = String(new Date().getFullYear()).slice(-2);
    const contador = lerLS(LS_NUMERO, {});
    let maior = Number(contador[ano] || 0);
    (Array.isArray(projetos) ? projetos : []).forEach(p => {
      const m = /^BG-ME-(\d{2})-(\d{4})$/.exec(String(p.docNum || '').trim());
      if (m && m[1] === ano) maior = Math.max(maior, Number(m[2]));
    });
    contador[ano] = maior + 1;
    gravarLS(LS_NUMERO, contador);
    return `BG-ME-${ano}-${String(maior + 1).padStart(4, '0')}`;
  }

  // Gestor de projeto que está usando a ferramenta (fica neste navegador)
  const LS_GESTOR = 'begreen-gestor';
  function gestorAtual() { return (localStorage.getItem(LS_GESTOR) || '').trim(); }

  function carregarTodos() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; }
  }

  let projetos = [];
  projetos = carregarTodos().map(migrar);
  let projeto = projetos.length ? projetos[projetos.length - 1] : novoProjeto();
  if (!projetos.length) projetos.push(projeto);

  let salvarTimer = null;
  function salvar() {
    projeto.atualizadoEm = new Date().toISOString();
    if (!(projeto.gestor || '').trim()) projeto.gestor = gestorAtual(); // quem elabora entra no controle do documento
    clearTimeout(salvarTimer);
    salvarTimer = setTimeout(() => {
      try { projeto.pendenciasSalvas = listarPendencias().map(x => x.texto); } catch (e) { /* antes do preview */ }
      enviarProjeto(projeto); // a nuvem é a cópia principal e guarda as fotos
      const local = guardarCache();
      setStatus(local
        ? 'Salvo automaticamente · ' + new Date().toLocaleTimeString('pt-BR')
        : (nuvemAtiva()
          ? 'Salvo na nuvem · ' + new Date().toLocaleTimeString('pt-BR') + ' (cache deste navegador cheio)'
          : '⚠ Não foi possível salvar: armazenamento do navegador cheio. Remova fotos ou conecte a nuvem.'));
    }, 400);
  }

  // O cache do navegador guarda os projetos sem o conteúdo das fotos: elas são
  // grandes (centenas de kB cada) e estouram o limite do localStorage.
  function semFotos(p) {
    if (!p.fotos || !p.fotos.length) return p;
    return Object.assign({}, p, { fotos: p.fotos.map(f => ({ legenda: f.legenda || '', data: '' })) });
  }
  function guardarCache() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(projetos.map(semFotos)));
      return true;
    } catch (e) {
      try { localStorage.removeItem(LS_KEY); } catch (e2) { /* ignora */ }
      return false;
    }
  }
  function setStatus(t) { const el = document.getElementById('status-texto'); if (el) el.textContent = t; }

  // ── Nuvem (Supabase): envio, mesclagem e numeração ─────────
  const nuvemAtiva = () => !!(window.Sync && window.Sync.ativo);
  function nuvemOk(ok, erro) {
    const el = document.getElementById('nuvem');
    if (!el) return;
    if (!nuvemAtiva()) { el.textContent = '● só neste navegador'; el.className = 'nuvem'; return; }
    el.textContent = ok ? '● nuvem sincronizada' : '● nuvem indisponível';
    el.className = 'nuvem ' + (ok ? 'ok' : 'erro');
    if (!ok && erro) { el.title = String(erro.message || erro); setStatus('⚠ Nuvem indisponível: salvando só neste navegador. ' + String(erro.message || '').slice(0, 80)); }
  }
  function linhaDe(p) {
    return {
      id: p.id, dados: p, cliente: p.cliente || '', doc_num: p.docNum || '', gestor: p.gestor || '',
      status: p.status || 'rascunho', pendencias: p.pendenciasSalvas || [],
      criado_em: p.criadoEm || new Date().toISOString(), atualizado_em: p.atualizadoEm || new Date().toISOString(),
      emitido_em: p.emitidoEm || null, excluido: false,
    };
  }
  const enviosPendentes = new Map();
  function enviarProjeto(p) {
    if (!nuvemAtiva() || !p) return;
    clearTimeout(enviosPendentes.get(p.id));
    enviosPendentes.set(p.id, setTimeout(async () => {
      try { await window.Sync.salvarProjeto(linhaDe(p)); nuvemOk(true); } catch (e) { nuvemOk(false, e); }
    }, 800));
  }
  function temConteudo(p) {
    return !!((p.cliente || '').trim() || (p.endereco || '').trim() || (p.carregadores || []).some(c => c.potencia) || (p.fotos || []).length);
  }
  async function numerarNaNuvem(p) {
    if (!nuvemAtiva()) return;
    try {
      const ano = String(new Date().getFullYear()).slice(-2);
      const n = await window.Sync.proximoNumero(ano);
      if (typeof n !== 'number') return;
      p.docNum = `BG-ME-${ano}-${String(n).padStart(4, '0')}`;
      if (p === projeto) {
        const el = $form.querySelector('input[data-chave="docNum"]');
        if (el) el.value = p.docNum;
        atualizarProjetoAtual();
        clearTimeout(previewTimer);
        previewTimer = setTimeout(renderPreview, 100);
      }
      p.atualizadoEm = new Date().toISOString();
      try { guardarCache(); } catch (e) { /* ignora */ }
      enviarProjeto(p);
    } catch (e) { nuvemOk(false, e); }
  }
  function registrarNovo(p, focar, origem) {
    projetos.push(p);
    abrirProjeto(p, focar);
    salvar();
    numerarNaNuvem(p);
    if (nuvemAtiva()) window.Sync.evento('criado', { gestor: gestorAtual(), projeto_id: p.id, doc_num: p.docNum, detalhes: { origem: origem || 'novo' } });
  }
  // Configurações compartilhadas (frases, fotos padrão, catálogo, gestores): cache local + nuvem
  function gravarConfigCompartilhada(chave, valor) {
    gravarLS('begreen-' + chave, valor);
    if (nuvemAtiva()) window.Sync.gravarConfig(chave, valor).then(() => nuvemOk(true)).catch(e => nuvemOk(false, e));
  }
  async function carregarNuvem() {
    nuvemOk(true);
    if (!nuvemAtiva()) { setStatus('Pronto. Nuvem desativada: os dados ficam só neste navegador.'); return; }
    setStatus('Sincronizando com a nuvem…');
    try {
      const [linhas, mods, cfg] = await Promise.all([window.Sync.listarProjetos(), window.Sync.listarModelos(), window.Sync.lerConfig()]);
      // Projetos: vence o mais recente; locais que a nuvem não conhece sobem; excluídos na nuvem somem
      const remotos = new Map((linhas || []).map(l => [l.id, l]));
      const mesclados = [];
      const vistos = new Set();
      remotos.forEach((l, id) => {
        vistos.add(id);
        if (l.excluido) return;
        const loc = projetos.find(x => x.id === id);
        const rem = migrar(l.dados);
        if (loc && (loc.atualizadoEm || '') > (rem.atualizadoEm || '')) { mesclados.push(loc); enviarProjeto(loc); }
        else mesclados.push(rem);
      });
      const resetEm = (cfg || []).find(r => r.chave === 'reset_em');
      const marco = resetEm && typeof resetEm.valor === 'string' ? resetEm.valor : '';
      projetos.forEach(loc => {
        if (vistos.has(loc.id) || !temConteudo(loc)) return;
        if (marco && (loc.atualizadoEm || '') < marco) return; // base zerada: cache antigo é descartado
        mesclados.push(loc); enviarProjeto(loc);
      });
      {
        const idAtual = projeto.id;
        projetos = mesclados.sort((a, b) => (a.atualizadoEm || '').localeCompare(b.atualizadoEm || ''));
        if (!projetos.length) projetos.push(novoProjeto());
        projeto = projetos.find(x => x.id === idAtual) || projetos[projetos.length - 1];
        try { guardarCache(); } catch (e) { /* ignora */ }
      }
      // Modelos (oficiais primeiro); cria os oficiais na primeira vez
      modelos = (mods || []).map(m => ({ id: m.id, nome: m.nome, dados: m.dados, oficial: !!m.oficial, ordem: m.ordem }));
      gravarLS(LS_MODELOS, modelos);
      // Configurações
      const mapa = {}; (cfg || []).forEach(r => { mapa[r.chave] = r.valor; });
      const usa = (chave, atual, padrao) => {
        if (Array.isArray(mapa[chave])) { gravarLS('begreen-' + chave, mapa[chave]); return mapa[chave]; }
        const v = atual && atual.length ? atual : padrao;
        window.Sync.gravarConfig(chave, v).catch(() => {});
        return v;
      };
      frases = usa('frases', frases, FRASES_PADRAO.slice());
      fotosPadrao = usa('fotos_padrao', fotosPadrao, []);
      catalogo = usa('catalogo', catalogo, CATALOGO_PADRAO.slice());
      gestores = usa('gestores', gestores, []);
      sincronizarCarregadores();
      renderTudo(); atualizarProjetoAtual(); renderLista($busca.value);
      nuvemOk(true);
      setStatus(`Sincronizado com a nuvem · ${projetos.length} projeto(s) · ${modelos.length} modelo(s)`);
    } catch (e) { nuvemOk(false, e); }
  }

  // Cópia de um projeto: mesmos parâmetros, novo número, revisão 00, sem fotos nem ART.
  // Com limparIdentificacao, zera também cliente, endereço e observações da obra.
  function clonarProjeto(origem, limparIdentificacao, opcoes) {
    opcoes = opcoes || {};
    const p = migrar(JSON.parse(JSON.stringify(origem)));
    p.id = novoId();
    p.criadoEm = p.atualizadoEm = new Date().toISOString();
    p.docNum = opcoes.docNum || proximoDocNum();
    p.revisao = opcoes.revisao || '00';
    p.dataRevisao = opcoes.dataRevisao || hoje();
    p.historicoRevisoes = [];
    p.descricaoRevisao = opcoes.descricaoRevisao || 'Emissão inicial';
    if (!opcoes.manterFotos) p.fotos = [];
    if (!opcoes.manterArt) p.artExecucao = '';
    if (limparIdentificacao) { p.cliente = ''; p.endereco = ''; p.cidadeUf = ''; p.observacoes = ''; }
    p.status = 'rascunho'; p.emitidoEm = ''; p.emitidoPor = ''; p.gestor = gestorAtual(); p.pendenciasSalvas = [];
    return p;
  }
  function abrirProjeto(p, focarCliente) {
    projeto = p;
    sincronizarCarregadores();
    renderTudo();
    atualizarProjetoAtual();
    if (focarCliente) {
      irEtapa(1);
      const el = $form.querySelector('[data-chave="cliente"]');
      if (el) el.focus();
    }
  }

  // Modelos (templates) de projeto
  const LS_MODELOS = 'begreen-modelos';
  let modelos = lerLS(LS_MODELOS, []);

  // Frases prontas para as observações
  const LS_FRASES = 'begreen-frases';
  const FRASES_PADRAO = [
    'O cliente será responsável pela abertura e recomposição do piso no trecho enterrado.',
    'A infraestrutura civil (rasgos, caixas de passagem e recomposição de acabamentos) será executada pelo cliente, conforme orientação da BeGreen.',
    'A alimentação do QDA partirá de disjuntor dedicado no QGBT, fornecido e instalado pela BeGreen.',
    'Os carregadores serão fixados em parede. Pedestais não fazem parte deste escopo.',
    'O cliente deverá providenciar a adequação do padrão de entrada junto à concessionária antes da execução.',
    'A execução ocorrerá em horário comercial, com desligamento programado e comunicado previamente ao condomínio.',
    'A ativação dos carregadores e o cadastro no aplicativo serão realizados após a energização do circuito.',
  ];
  let frases = lerLS(LS_FRASES, null) || FRASES_PADRAO.slice();

  // Biblioteca de fotos padrão (reutilizadas entre projetos)
  const LS_FOTOS = 'begreen-fotos_padrao';
  let fotosPadrao = lerLS(LS_FOTOS, []);

  // Catálogo de equipamentos BeGreen (escolher o modelo preenche potência e conector)
  const CATALOGO_PADRAO = [
    { nome: 'Wallbox AC 7,4 kW · Tipo 2', marca: '', potencia: 7.4, conector: 'Tipo 2', tipo: 'AC', ip: 'IP54' },
    { nome: 'Wallbox AC 11 kW · Tipo 2', marca: '', potencia: 11, conector: 'Tipo 2', tipo: 'AC', ip: 'IP54' },
    { nome: 'Wallbox AC 22 kW · Tipo 2', marca: '', potencia: 22, conector: 'Tipo 2', tipo: 'AC', ip: 'IP54' },
    { nome: 'Estação DC 30 kW · CCS 2', marca: '', potencia: 30, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 40 kW · CCS 2', marca: '', potencia: 40, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 60 kW · CCS 2', marca: '', potencia: 60, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 80 kW · CCS 2', marca: '', potencia: 80, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 90 kW · CCS 2', marca: '', potencia: 90, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 100 kW · CCS 2', marca: '', potencia: 100, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 120 kW · CCS 2', marca: '', potencia: 120, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 150 kW · CCS 2', marca: '', potencia: 150, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 180 kW · CCS 2', marca: '', potencia: 180, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 240 kW · CCS 2', marca: '', potencia: 240, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
    { nome: 'Estação DC 360 kW · CCS 2', marca: '', potencia: 360, conector: 'CCS 2', tipo: 'DC', ip: 'IP54' },
  ];
  let catalogo = lerLS('begreen-catalogo', null) || CATALOGO_PADRAO.slice();
  let gestores = lerLS('begreen-gestores', []);

  const REVISOES = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];

  // ── Formulário ─────────────────────────────────────────────
  const $form = document.getElementById('form');

  function campo(label, inputHtml, hint) {
    return `<label class="campo">${label ? `<span class="campo-label">${label}</span>` : ''}${inputHtml}</label>`;
  }
  const campoAv = campo; // formulário sempre completo (modo essencial foi removido)
  function inp(chave, opts) {
    opts = opts || {};
    const v = chave.split('.').reduce((o, k) => (o == null ? '' : o[k]), projeto);
    const attrs = `data-chave="${chave}" type="${opts.type || 'text'}" value="${String(v == null ? '' : v).replace(/"/g, '&quot;')}"${opts.step ? ` step="${opts.step}"` : ''}`;
    return `<input ${attrs} />`;
  }
  function sel(chave, opcoes) {
    const v = chave.split('.').reduce((o, k) => (o == null ? '' : o[k]), projeto);
    const q = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    return `<select data-chave="${chave}">${opcoes.map(([val, lbl]) => `<option value="${q(val)}"${String(v) === String(val) ? ' selected' : ''}>${q(lbl)}</option>`).join('')}</select>`;
  }
  // ── Seletor de modelo: catálogo à vista, com busca e digitação livre ──
  function comboModeloHtml(i) {
    return `<div class="combo" data-combo="${i}">
      ${inp(`carregadores.${i}.modelo`).replace('<input ', '<input class="combo-input" autocomplete="off" placeholder="Escolha do catálogo ou escreva o modelo" ')}
      <button type="button" class="combo-btn" tabindex="-1" aria-expanded="false" title="Ver catálogo de equipamentos">▾</button>
      <div class="combo-lista" hidden></div>
    </div>`;
  }
  const semAcento = (t) => String(t == null ? '' : t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let comboPos = -1; // item destacado pelo teclado
  function comboItens(filtro) {
    const q = semAcento(filtro).trim();
    return catalogo.map((e, k) => ({ e, k }))
      .filter(({ e }) => !q || semAcento(`${e.nome} ${e.marca || ''} ${e.potencia} ${e.conector || ''} ${e.tipo || ''}`).includes(q));
  }
  function comboFechar() {
    $form.querySelectorAll('.combo').forEach(w => {
      w.classList.remove('aberto');
      const l = w.querySelector('.combo-lista'); if (l) l.hidden = true;
      const b = w.querySelector('.combo-btn'); if (b) b.setAttribute('aria-expanded', 'false');
    });
    comboPos = -1;
  }
  function comboAbrir(i, filtro) {
    const wrap = $form.querySelector(`.combo[data-combo="${i}"]`);
    if (!wrap) return;
    $form.querySelectorAll('.combo').forEach(w => { if (w !== wrap) { w.classList.remove('aberto'); w.querySelector('.combo-lista').hidden = true; } });
    const lista = wrap.querySelector('.combo-lista');
    const itens = comboItens(filtro);
    const grupos = [['AC', 'Carregadores AC'], ['DC', 'Estações DC']];
    let html = '';
    let pos = 0;
    grupos.forEach(([tipo, titulo]) => {
      const g = itens.filter(({ e }) => (e.tipo || 'AC') === tipo);
      if (!g.length) return;
      html += `<div class="combo-grupo">${titulo}</div>`;
      html += g.map(({ e, k }) => `<div class="combo-item" data-k="${k}" data-pos="${pos++}"><span class="nome">${esc(e.nome)}</span><span class="det">${fmt(e.potencia)} kW · ${esc(e.conector || '—')}${e.marca ? ' · ' + esc(e.marca) : ''}</span></div>`).join('');
    });
    if (!pos) html = '<div class="combo-vazio">Nenhum equipamento do catálogo com esse texto. Pode escrever o modelo livremente.</div>';
    else html += '<div class="combo-rodape">Não está na lista? Escreva o modelo no campo. Novos equipamentos entram em Novo ▾ → Catálogo.</div>';
    lista.innerHTML = html;
    lista.hidden = false;
    wrap.classList.add('aberto');
    const btn = wrap.querySelector('.combo-btn'); if (btn) btn.setAttribute('aria-expanded', 'true');
    comboPosicionar(wrap);
    comboPos = -1;
  }
  // A lista fica fixa na tela, ancorada ao campo: não é cortada pelo painel
  function comboPosicionar(wrap) {
    const campo = wrap.getBoundingClientRect();
    const lista = wrap.querySelector('.combo-lista');
    if (!lista) return;
    const larg = Math.min(330, window.innerWidth - 24);
    const abaixo = window.innerHeight - campo.bottom - 12;
    const acima = campo.top - 12;
    const paraCima = abaixo < 200 && acima > abaixo;
    const altura = Math.max(140, Math.min(320, paraCima ? acima : abaixo));
    lista.style.width = larg + 'px';
    lista.style.maxHeight = altura + 'px';
    lista.style.left = Math.max(12, Math.min(campo.right - larg, window.innerWidth - larg - 12)) + 'px';
    if (paraCima) { lista.style.top = 'auto'; lista.style.bottom = (window.innerHeight - campo.top + 4) + 'px'; }
    else { lista.style.bottom = 'auto'; lista.style.top = (campo.bottom + 4) + 'px'; }
  }
  function comboDestacar(delta) {
    const lista = $form.querySelector('.combo.aberto .combo-lista');
    if (!lista) return;
    const itens = Array.from(lista.querySelectorAll('.combo-item'));
    if (!itens.length) return;
    comboPos = (comboPos + delta + itens.length + 1) % (itens.length + 1) - (delta > 0 ? 0 : 0);
    if (comboPos < 0) comboPos = itens.length - 1;
    if (comboPos >= itens.length) comboPos = 0;
    itens.forEach((el, k) => el.classList.toggle('ativo', k === comboPos));
    const alvo = itens[comboPos];
    if (alvo) alvo.scrollIntoView({ block: 'nearest' });
  }
  let comboIgnorarFoco = false;
  function comboAplicar(i, k) {
    const eq = catalogo[k];
    const cg = projeto.carregadores[i];
    if (!eq || !cg) return;
    cg.modelo = eq.nome;
    cg.potencia = String(eq.potencia);
    cg.conector = eq.conector || cg.conector;
    if (eq.marca) cg.marca = eq.marca;
    comboFechar();
    salvar(); renderTudo();
    const el = $form.querySelector(`.combo[data-combo="${i}"] .combo-input`);
    if (el) {
      comboIgnorarFoco = true; // devolver o foco não pode reabrir a lista
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      setTimeout(() => { comboIgnorarFoco = false; }, 0);
    }
  }

  // Características da carga em texto corrido: marca, modelo, tensão, corrente, potência e FP
  function caracteristicasHtml(cg, pt) {
    const falta = (t) => `<span class="falta">${t}</span>`;
    const lig = pt && pt.lig ? pt.lig.rotulo.split('·').slice(1).join('·').trim() : '';
    return [
      (cg.marca || '').trim() ? esc(cg.marca.trim()) : falta('marca'),
      (cg.modelo || '').trim() ? esc(cg.modelo.trim()) : falta('modelo'),
      pt && pt.Ib ? `<strong>${pt.V} V</strong> ${lig}` : falta('tensão'),
      pt && pt.Ib ? `<strong>${fmt(pt.Ib, 1)} A</strong>` : falta('corrente'),
      pt && pt.P ? `<strong>${fmt(pt.P)} kW</strong>` : falta('potência'),
      `FP <strong>${fmt(window.Calc.FP, 2)}</strong>`,
    ].join(' · ');
  }
  function participacaoHtml(c) {
    return `Participação da nova carga: <strong>${fmt(c.participacao, 1)} %</strong> da capacidade instalada (${fmt(c.correnteEntrada, 1)} A / ${fmt(c.geral)} A)`;
  }

  function renderForm() {
    const c = window.Calc.calcularProjeto(projeto);
    const multi = projeto.carregadores.length > 1;
    const trafoSim = projeto.transformador === 'sim';
    const quadroSim = projeto.quadroDistribuicao === 'sim' || trafoSim;
    const nTrechoCarreg = quadroSim ? (trafoSim ? 4 : 2) : 1;
    const agrupado = projeto.trecho4Modo === 'agrupado';
    const opcoesEletroduto = [['', '']].concat(window.Calc.ELETRODUTOS.map(e => [e.nome, e.nome]));

    // Bloco de um trecho: distância, seção do cabo e eletroduto
    const opcoesInfra = Object.entries(window.Calc.INFRAS).map(([k, v]) => [k, v.rotulo]);
    const blocoTrecho = (titulo, chaveI, chaveL, chaveS, chaveE, chaveInfra, d, circuito) => `<div class="sub-item">
        <div class="sub-titulo">${titulo}</div>
        <div class="grid3">
          ${campoAv('Corrente (A)', inp(chaveI, { type: 'number', step: '1' }))}
          ${campo('Distância (m)', inp(chaveL, { type: 'number', step: '1' }))}
          ${campoAv('Método de referência (NBR 5410)', sel(chaveInfra, opcoesInfra))}
          ${campoAv('Seção do cabo (mm²)', inp(chaveS, { type: 'number', step: '0.5' }))}
          ${chaveE ? campoAv('Eletroduto', sel(chaveE, opcoesEletroduto)) : ''}
        </div>
        ${d && d.secao ? `<div class="calc-resumo">${d.caboDesc} ${c.cabo.nome} · ${d.eletroduto || '[Ø]'}${d.quedaPct ? ` · ΔV <strong${d.quedaOk ? '' : ' class="ruim"'}>${fmt(d.quedaPct, 2)} %</strong>` : ''}</div>` : ''}
        ${d && !d.quedaOk ? `<div class="alerta">⚠ ΔV ${fmt(d.quedaPct, 2)} % &gt; ${fmt(c.quedaMax, c.quedaMax % 1 ? 1 : 0)} %${d.secaoSugeridaQueda ? `: sugerido ${fmt(d.secaoSugeridaQueda)} mm²` : ''}</div>` : ''}
      </div>`;

    // Cards dos carregadores: potência, conector, disjuntor (+ kit opcional de 22 a 30 kW)
    const cartoes = projeto.carregadores.map((cg, i) => {
      const pt = c.pontos[i];
      const P = Number(cg.potencia) || 0;
      const kitOpcional = P > window.Calc.KIT_OBRIGATORIO_KW && P <= window.Calc.KIT_LIMITE_KW;
      const kitHtml = kitOpcional
        ? `<label class="campo campo-check"><input type="checkbox" data-chave="carregadores.${i}.incluirKit"${cg.incluirKit ? ' checked' : ''} /> <span>Incluir kit de proteção (opcional de ${fmt(window.Calc.KIT_OBRIGATORIO_KW)} a ${fmt(window.Calc.KIT_LIMITE_KW)} kW)</span></label>`
        : '';
      return `<div class="ponto" data-i="${i}">
        <div class="ponto-head"><span class="ponto-id">C-EV-${String(i + 1).padStart(2, '0')}</span>
          <span>${i === 0 && multi ? `<button type="button" class="btn-mini" id="aplicar-restante" title="Copia modelo, potência, conector, distância, forma de passagem e kit deste ponto para todos os outros">aplicar ao restante</button> ` : ''}${multi && !quadroSim ? `<button type="button" class="btn-mini rm-ponto" data-i="${i}">remover</button>` : ''}</span></div>
        <div class="grid2">
          ${campo('Marca', inp(`carregadores.${i}.marca`).replace('<input ', '<input list="lista-marcas" autocomplete="off" '))}
          ${campo('Modelo', comboModeloHtml(i))}
        </div>
        <div class="grid3">
          ${campo('Potência (kW)', sel(`carregadores.${i}.potencia`, [['', '—']].concat(window.Calc.POTENCIAS.map(p => [p, fmt(p) + ' kW']))))}
          ${campo('Conector', sel(`carregadores.${i}.conector`, [['', '—']].concat(window.Calc.CONECTORES.map(k => [k, k]))))}
          ${campoAv('Disjuntor (A)', inp(`carregadores.${i}.disjuntorManual`, { type: 'number', step: '1' }))}
        </div>
        ${kitHtml}
        <div class="carga-info">${caracteristicasHtml(cg, pt)}</div>
      </div>`;
    }).join('');

    // Trechos, em sequência
    const origemCarreg = quadroSim ? 'QDA' : 'QGBT';
    const trechosHtml = [
      quadroSim ? blocoTrecho('Trecho 1 · QGBT → ' + (trafoSim ? 'QDA Transformador' : 'QDA'), 'trechos.t1.I', 'trechos.t1.L', 'trechos.t1.secao', 'trechos.t1.eletroduto', 'trechos.t1.infra', c.trechos.t1) : '',
      quadroSim && trafoSim ? blocoTrecho('Trecho 2 · QDA Transformador → Transformador', 'trechos.t2.I', 'trechos.t2.L', 'trechos.t2.secao', 'trechos.t2.eletroduto', 'trechos.t2.infra', c.trechos.t2) : '',
      quadroSim && trafoSim ? blocoTrecho('Trecho 3 · Transformador → QDA', 'trechos.t3.I', 'trechos.t3.L', 'trechos.t3.secao', 'trechos.t3.eletroduto', 'trechos.t3.infra', c.trechos.t3) : '',
      `<div class="sub-item">
        <div class="sub-titulo">Trecho ${nTrechoCarreg} · ${origemCarreg} → Estações de recarga</div>
        <div class="grid3">
          ${campo('Circuitos', sel('trecho4Modo', [['individual', 'Individuais (um eletroduto por circuito)'], ['agrupado', 'Agrupados (todos juntos até as vagas)']]))}
          ${agrupado ? campo('Tipo de duto', sel('trecho4Duto', [['eletroduto', 'Eletroduto'], ['eletrocalha', 'Eletrocalha']])) : ''}
          ${agrupado ? campo('Tamanho', sel('trecho4Tamanho', [['', '']].concat((projeto.trecho4Duto === 'eletrocalha' ? window.Calc.ELETROCALHAS : window.Calc.ELETRODUTOS).map(e => [e.nome, e.nome])))) : ''}
        </div>
        ${agrupado && c.trecho4 && c.trecho4.nome ? `<div class="calc-resumo">${c.trecho4.rotulo} · ${c.trecho4.n} circuito(s) · ocupação <strong${c.trecho4.taxa <= 40 ? '' : ' class="ruim"'}>${fmt(c.trecho4.taxa, 1)} %</strong> · fator de agrupamento ${fmt(c.trecho4.fA, 2)}</div>` : ''}
        ${projeto.carregadores.map((cg, i) => { const d = c.pontos[i]; return `<div class="sub-circuito">
          <div class="sub-circuito-id">C-EV-${String(i + 1).padStart(2, '0')}</div>
          <div class="grid3">
            ${campoAv('Corrente (A)', inp(`carregadores.${i}.disjuntorManual`, { type: 'number', step: '1' }))}
            ${campo('Distância (m)', inp(`carregadores.${i}.distancia`, { type: 'number', step: '1' }))}
            ${campoAv('Método de referência (NBR 5410)', sel(`carregadores.${i}.infra`, opcoesInfra))}
            ${campoAv('Seção do cabo (mm²)', inp(`carregadores.${i}.secaoManual`, { type: 'number', step: '0.5' }))}
            ${agrupado ? '' : campoAv('Eletroduto', sel(`carregadores.${i}.eletrodutoManual`, opcoesEletroduto))}
          </div>
          ${d && d.secao ? `<div class="calc-resumo">${d.caboDesc} ${c.cabo.nome} · ${d.eletroduto || '[Ø]'}${d.quedaPct ? ` · ΔV <strong${d.quedaOk ? '' : ' class="ruim"'}>${fmt(d.quedaPct, 2)} %</strong>` : ''}</div>` : ''}
          ${d && !d.quedaOk ? `<div class="alerta">⚠ ΔV ${fmt(d.quedaPct, 2)} % &gt; ${fmt(c.quedaMax, c.quedaMax % 1 ? 1 : 0)} %${d.secaoSugeridaQueda ? `: sugerido ${fmt(d.secaoSugeridaQueda)} mm²` : ''}</div>` : ''}
        </div>`; }).join('')}
      </div>`,
    ].join('');

    const fotosHtml = projeto.fotos.map((f, i) => `<div class="foto-item">
      <img src="${f.data}" alt="" />
      <input data-foto-legenda="${i}" type="text" placeholder="Legenda da foto ${i + 1}" value="${String(f.legenda || '').replace(/"/g, '&quot;')}" />
      <button type="button" class="btn-mini fav-foto" data-i="${i}" title="Guardar na biblioteca de fotos padrão">★</button>
      <button type="button" class="btn-mini rm-foto" data-i="${i}">×</button>
    </div>`).join('');
    const biblioHtml = fotosPadrao.length
      ? `<div class="biblio">${fotosPadrao.map((f, i) => `<div class="biblio-item" data-biblio="${i}" title="${esc(f.legenda || 'Inserir no projeto')}"><img src="${f.data}" alt="" /><button type="button" class="btn-mini" data-rm-biblio="${i}" title="Remover da biblioteca">×</button></div>`).join('')}</div>`
      : '<div class="campo-hint" style="margin-top:6px">Nenhuma foto padrão guardada. Use ★ em uma foto do projeto para reaproveitá-la em outros.</div>';
    const frasesHtml = `<div class="frases">${frases.map((f, i) => `<span class="frase" data-frase="${i}" title="Inserir nas observações">${esc(f)}<span class="x" data-rm-frase="${i}" title="Remover da biblioteca">×</span></span>`).join('')}<span class="frase add" id="add-frase">+ nova frase</span></div>`;

    $form.innerHTML = `${etapasHtml()}
    <details data-sec="1"><summary><span class="sec-num">1</span>Identificação do cliente</summary><div class="sec-body">
      ${campo('Cliente / condomínio', inp('cliente').replace('<input ', '<input list="lista-clientes" autocomplete="off" '))}
      ${campo('Endereço da obra', inp('endereco'))}
      <div class="grid2">
        ${campo('Cidade/UF', inp('cidadeUf'))}
        ${campoAv('Nº do documento', `<div class="campo-linha">${inp('docNum')}<button type="button" class="btn-mini" id="btn-doc-auto" title="Gerar o próximo número da sequência do ano">auto</button></div>`)}
        ${campoAv('Revisão', sel('revisao', REVISOES.map(r => [r, 'Rev. ' + r])))}
        ${campoAv('Data da revisão', inp('dataRevisao', { type: 'date' }))}
        ${campo('ART de execução (nº)', inp('artExecucao'))}
        ${campoAv('Descrição desta revisão', inp('descricaoRevisao'))}
      </div>
      <button type="button" class="btn-sec" id="btn-nova-revisao" style="margin-top:10px">+ Emitir nova revisão (guarda a versão atual no histórico)</button>
      ${projeto.historicoRevisoes.length ? `<div class="rev-lista">${projeto.historicoRevisoes.map((h, i) => `<div class="rev-item"><span class="nome"><strong>Rev. ${esc(h.revisao)}</strong> · ${dataBrCurta(h.dataRevisao)} · ${esc(h.descricao)}</span><button type="button" class="btn-mini rev-abrir" data-i="${i}" title="Abre a versão guardada como um projeto separado, para consulta ou impressão">abrir cópia</button></div>`).join('')}</div>` : ''}
    </div></details>
    <details data-sec="2"><summary><span class="sec-num">2</span>Entrada de energia do cliente</summary><div class="sec-body">
      <div class="grid2">
        ${campo('Tensão / configuração', `<select data-chave="par-rede">${[['127|F+N+T', '127 V · F+N+T'], ['127|2F+T', '127 V · 2F+T'], ['127|2F+N+T', '127 V · 2F+N+T'], ['220|F+N+T', '220 V · F+N+T'], ['220|2F+T', '220 V · 2F+T'], ['220|2F+N+T', '220 V · 2F+N+T'], ['220|3F+N+T', '220 V · 3F+N+T'], ['380|3F+N+T', '380 V · 3F+N+T']].map(([v, l]) => `<option value="${v}"${v === `${projeto.tensao}|${projeto.config}` ? ' selected' : ''}>${l}</option>`).join('')}</select>`)}
        ${campo('Disjuntor geral do QGBT (A)', inp('disjuntorGeral', { type: 'number', step: '1' }))}
        ${campoAv('Curto-circuito presumido no quadro, Ik (kA)', inp('ikPresumida', { type: 'number', step: '0.1' }))}
        ${campoAv('Necessidade de transformador?', sel('transformador', [['nao', 'Não'], ['sim', 'Sim']]))}
        ${campoAv('Aterramento existente no cliente?', sel('aterramentoExistente', [['sim', 'Sim (integrar ao aterramento existente)'], ['nao', 'Não (BeGreen executa aterramento com hastes)']]))}
        ${campoAv('Esquema de aterramento', sel('aterramento', [['TN-S', 'TN-S (integrado ao aterramento existente)'], ['TT', 'TT (eletrodo próprio, haste exclusiva)']]))}
      </div>
    </div></details>
    ${trafoSim ? `<details data-sec="3"><summary><span class="sec-num">3</span>Transformador</summary><div class="sec-body">
      <div class="grid2">
        ${campo('Potência (kVA)', inp('trafoPotencia', { type: 'number', step: '0.5' }))}
        ${campo('Tensão do primário', sel('trafoPrimV', [['', '—'], ['127', '127 V'], ['220', '220 V'], ['380', '380 V'], ['440', '440 V']]))}
        ${campo('Modo de ligação do primário', sel('trafoPrimLig', [['', '—'], ['3F+T', '3F+T'], ['2F+T', '2F+T']]))}
        ${campo('Tensão do secundário', sel('trafoSecV', [['', '—'], ['127', '127 V'], ['220', '220 V'], ['380', '380 V'], ['440', '440 V']]))}
        ${campo('Modo de ligação do secundário', sel('trafoSecLig', [['', '—'], ['3F+N+T', '3F+N+T'], ['1F+N+T', '1F+N+T']]))}
        ${campo('Grau de proteção', sel('trafoIp', [['', '—'], ['IP00', 'IP00'], ['IP21', 'IP21'], ['IP65', 'IP65']]))}
      </div>
    </div></details>` : `<details data-sec="3"><summary><span class="sec-num">3</span>Transformador</summary><div class="sec-body"><div class="campo-hint">Marque "Sim" em "Necessidade de transformador" para preencher.</div></div></details>`}
    <details data-sec="4"><summary><span class="sec-num">4</span>QDA</summary><div class="sec-body">
      <div class="grid2">
        ${campo('Quadro de distribuição dedicado?', sel('quadroDistribuicao', [['nao', 'Não'], ['sim', 'Sim']]))}
        ${quadroSim ? campo('Quantidade de estações de recarga', inp('qdQuantidade', { type: 'number', step: '1' })) : ''}
      </div>
    </div></details>
    <details data-sec="5"><summary><span class="sec-num">5</span>Estações de recarga e circuitos</summary><div class="sec-body">
      ${cartoes}
      ${quadroSim ? '' : '<button type="button" class="btn-sec" id="add-ponto">+ adicionar ponto de recarga</button>'}
      ${campo('Corrente de descarga do DPS (kA)', sel('dpsKa', window.Calc.DPS_KAS.map(k => [String(k), fmt(k) + ' kA' + (k === window.Calc.DPS_KA ? ' · padrão BeGreen' : (k === 20 ? ' · kit Clamper' : ''))])))}
      ${campo('Conexão das estações', sel('internetCliente', [['sim', 'Ponto de internet do cliente (Wi-Fi ou cabo)'], ['nao', 'Não se aplica (4G próprio ou sem conexão)']]))}
    </div></details>
    <details data-sec="6"><summary><span class="sec-num">6</span>Trechos e dimensionamento</summary><div class="sec-body">
      ${campo('Classe do cabo', sel('classeCabo', Object.values(window.Calc.CABOS).map(cb => [cb.chave, cb.chave === '1kV' ? 'HEPR 1 kV · dupla isolação (padrão BeGreen)' : 'PVC 750 V · isolação simples'])))}
      <div class="grid2">
        ${campo('Temperatura ambiente (°C)', inp('tempAmbiente', { type: 'number', step: '1' }))}
        ${campo('Temperatura do solo (°C)', inp('tempSolo', { type: 'number', step: '1' }))}
        ${campo('Limite de queda de tensão (%)', inp('quedaMax', { type: 'number', step: '0.5' }))}
      </div>
      ${trechosHtml}
    </div></details>
    <details data-sec="7"${projeto.analiseDemanda === 'sim' ? '' : ''}><summary><span class="sec-num">7</span>Análise de demanda</summary><div class="sec-body">
      <div class="grid2">
        ${campo('Análise de demanda realizada?', sel('analiseDemanda', [['nao', 'Não (seção omitida do memorial)'], ['sim', 'Sim (incluir no memorial)']]))}
        ${projeto.analiseDemanda === 'sim' ? campo('Potência disponível medida (kW)', inp('potenciaDisponivel', { type: 'number', step: '0.5' })) : ''}
        ${projeto.analiseDemanda === 'sim' ? campo('Pontos simultâneos', inp('pontosSimultaneos', { type: 'number', step: '1' })) : ''}
      </div>
    </div></details>
    <details data-sec="8"><summary><span class="sec-num">8</span>Conclusão</summary><div class="sec-body">
      <div class="grid2">
        ${campo('Alterar padrão de entrada?', sel('alterarPadrao', [['nao', 'Não (informações omitidas)'], ['sim', 'Sim (indicamos a alteração)']]))}
      </div>
      <div class="calc-resumo" id="resumo-participacao"${c.geral && c.totalIb ? '' : ' style="display:none"'}>${participacaoHtml(c)}</div>
    </div></details>
    <details data-sec="9"><summary><span class="sec-num">9</span>Fotos do local</summary><div class="sec-body">
      <input type="file" id="fotos-input" accept="image/*" multiple style="display:none" />
      <button type="button" class="btn-sec" id="add-fotos">+ adicionar fotos</button>
      <div class="fotos">${fotosHtml}</div>
      <div class="campo-label" style="margin-top:12px">Biblioteca de fotos padrão (clique para inserir)</div>
      ${biblioHtml}
    </div></details>
    <details data-sec="10"><summary><span class="sec-num">10</span>Observações</summary><div class="sec-body">
      ${campo('', `<textarea data-chave="observacoes" rows="5">${(projeto.observacoes || '').replace(/</g, '&lt;')}</textarea>`)}
      <div class="campo-label">Frases prontas (clique para inserir)</div>
      ${frasesHtml}
    </div></details>
    ${etapasNavHtml()}`;
    renderListaCatalogo();
    renderListaClientes();
    aplicarEtapa();
    travarFormulario();
  }
  // Documento emitido: campos travados até abrir uma nova revisão
  function travarFormulario() {
    const travado = projeto.status === 'emitido';
    $form.classList.toggle('travado', travado);
    $form.querySelectorAll('input, select, textarea, button').forEach(el => {
      if (el.classList.contains('rev-abrir') || el.closest('.etapas, .etapas-nav')) return;
      el.disabled = travado;
    });
    $form.querySelectorAll('.frase, .biblio-item').forEach(el => el.classList.toggle('off', travado));
  }

  // Assistente por etapas: uma seção do formulário por vez, com barra de progresso
  // e botões Anterior/Próximo. A etapa atual sobrevive a re-renderizações e recargas.
  const ETAPAS = [
    [1, 'Identificação do cliente', 'Como deve sair na capa do memorial.'],
    [2, 'Entrada de energia do cliente', 'Rede do cliente, disjuntor geral e aterramento.'],
    [3, 'Transformador', 'Só quando houver transformador dedicado.'],
    [4, 'QDA', 'Quadro de distribuição das estações.'],
    [5, 'Estações de recarga e circuitos', 'Carregadores, potências, DPS e conexão.'],
    [6, 'Trechos e dimensionamento', 'Cabos, métodos de instalação e temperaturas.'],
    [7, 'Análise de demanda', 'Medição de demanda, quando realizada.'],
    [8, 'Conclusão', 'Padrão de entrada e participação das estações.'],
    [9, 'Fotos do local', 'Opcionais, mas toda foto precisa de legenda.'],
    [10, 'Observações', 'Texto livre e frases prontas.'],
  ];
  const LS_ETAPA = 'begreen-etapa-atual';
  let etapaAtual = 1;
  try { etapaAtual = Math.min(ETAPAS.length, Math.max(1, parseInt(localStorage.getItem(LS_ETAPA), 10) || 1)); } catch (e) { etapaAtual = 1; }
  function etapasHtml() {
    return `<div class="etapas">
      <div class="etapas-barra">${ETAPAS.map(([n, t]) => `<button type="button" class="etapa-pt${n < etapaAtual ? ' ok' : ''}${n === etapaAtual ? ' atual' : ''}" data-etapa="${n}" title="${n} · ${t}"></button>`).join('')}</div>
      <div class="etapas-rot"><span>Etapa ${etapaAtual} de ${ETAPAS.length}</span><span class="etapas-pend"></span></div>
    </div>`;
  }
  function etapasNavHtml() {
    const ultima = etapaAtual >= ETAPAS.length;
    const bloq = pendenciasDaEtapa(etapaAtual).length > 0;
    return `<div class="etapas-nav">
      <button type="button" class="etapa-btn" data-nav="ant"${etapaAtual <= 1 ? ' disabled' : ''}>‹ Anterior</button>
      <button type="button" class="etapa-btn pri${bloq ? ' bloqueado' : ''}" data-nav="${ultima ? 'fim' : 'prox'}"${bloq ? ' title="Complete esta etapa para avançar"' : ''}>${ultima ? 'Concluir ✓' : 'Próximo ›'}</button>
    </div>`;
  }
  // Só avança quando a etapa atual (e as intermediárias) não têm pendência
  function pendenciasDaEtapa(n) { return listarPendencias().filter(x => x.sec === n); }
  function etapaBloqueante(destino) {
    for (let k = etapaAtual; k < destino; k++) if (pendenciasDaEtapa(k).length) return k;
    return 0;
  }
  function avisarEtapaIncompleta(k) {
    if (k !== etapaAtual) irEtapa(k, false);
    const L = pendenciasDaEtapa(k);
    pendAberta = true; renderPendencias();
    setStatus(`⚠ Complete a etapa ${k} antes de avançar: ${L.map(x => x.texto).join(', ')}.`);
    const btn = $form.querySelector('[data-nav="prox"], [data-nav="fim"]');
    if (btn) { btn.classList.remove('tremer'); void btn.offsetWidth; btn.classList.add('tremer'); }
    const el = L[0] && L[0].chave ? $form.querySelector(`[data-chave="${L[0].chave}"]`) : null;
    if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); }
  }
  function aplicarEtapa() {
    $form.querySelectorAll('details[data-sec]').forEach(d => {
      const n = +d.dataset.sec, ativa = n === etapaAtual;
      d.open = ativa; d.hidden = !ativa;
      const corpo = d.querySelector('.sec-body');
      const e = ETAPAS.find(x => x[0] === n);
      if (corpo && e && !corpo.querySelector('.sec-sub')) corpo.insertAdjacentHTML('afterbegin', `<div class="sec-sub">${e[2]}</div>`);
    });
    $form.querySelectorAll('.etapa-pt').forEach(b => {
      const n = +b.dataset.etapa;
      b.classList.toggle('ok', n < etapaAtual); b.classList.toggle('atual', n === etapaAtual);
    });
    const rot = $form.querySelector('.etapas-rot span'); if (rot) rot.textContent = `Etapa ${etapaAtual} de ${ETAPAS.length}`;
    const nav = $form.querySelector('.etapas-nav'); if (nav) nav.outerHTML = etapasNavHtml();
    if (typeof marcarEtapasPendentes === 'function') marcarEtapasPendentes();
    atualizarFade();
  }
  // Marca a etapa quando ainda há campos abaixo (o corpo rola por dentro do card, sem barra)
  function atualizarFade() {
    const d = $form.querySelector('details[data-sec]:not([hidden])'); if (!d) return;
    const b = d.querySelector('.sec-body'); if (!b) return;
    d.classList.toggle('mais', b.scrollTop + b.clientHeight < b.scrollHeight - 4);
  }
  $form.addEventListener('scroll', atualizarFade, true);
  window.addEventListener('resize', atualizarFade);
  function irEtapa(n, focar) {
    etapaAtual = Math.min(ETAPAS.length, Math.max(1, n || 1));
    try { localStorage.setItem(LS_ETAPA, String(etapaAtual)); } catch (err) { /* ignora */ }
    aplicarEtapa();
    const painel = document.getElementById('painel-form');
    if (painel && focar !== false) painel.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $form.addEventListener('click', (e) => {
    if (e.target.closest('summary')) { e.preventDefault(); return; }
    const pt = e.target.closest('.etapa-pt');
    if (pt) { const n = +pt.dataset.etapa, k = n > etapaAtual ? etapaBloqueante(n) : 0; if (k) avisarEtapaIncompleta(k); else irEtapa(n); return; }
    const nav = e.target.closest('[data-nav]'); if (!nav) return;
    if (nav.dataset.nav === 'ant') irEtapa(etapaAtual - 1);
    else if (pendenciasDaEtapa(etapaAtual).length) avisarEtapaIncompleta(etapaAtual);
    else if (nav.dataset.nav === 'prox') irEtapa(etapaAtual + 1);
    else { pendAberta = true; renderPendencias(); const painel = document.getElementById('painel-form'); if (painel) painel.scrollTo({ top: 0, behavior: 'smooth' }); }
  });

  // ── Preview ────────────────────────────────────────────────
  const $preview = document.getElementById('preview');
  let previewTimer = null;

  function folhasHtmlDe(p) {
    const c = window.Calc.calcularProjeto(p);
    const folhas = window.Template.folhas(p, c, {});
    return window.Paginador.paginar(folhas, window.Template.header(), (n, t) => window.Template.footer(p, n, t));
  }
  function folhasHtml() { return folhasHtmlDe(projeto); }
  // Imagens que terminam de carregar depois da paginação mudam a altura dos
  // blocos: repagina uma vez por imagem nova (carregada ou com erro).
  const imagensVistas = new Set();
  function renderPreview() {
    $preview.innerHTML = folhasHtml();
    renderPendencias();
    const pendentes = Array.from($preview.querySelectorAll('img')).filter(im => !im.complete && !imagensVistas.has(im.src));
    if (!pendentes.length) return;
    let agendado = false;
    const repaginar = (e) => {
      imagensVistas.add(e.target.src);
      if (agendado) return;
      agendado = true;
      setTimeout(renderPreview, 30);
    };
    pendentes.forEach(im => {
      im.addEventListener('load', repaginar, { once: true });
      im.addEventListener('error', repaginar, { once: true });
    });
  }
  function renderTudo() {
    renderForm();
    renderPreview();
  }

  // Ajusta a lista de carregadores à quantidade informada no quadro de distribuição
  function sincronizarCarregadores() {
    if (projeto.quadroDistribuicao !== 'sim') return false;
    const n = Math.max(1, Math.min(60, parseInt(projeto.qdQuantidade, 10) || 0));
    if (!projeto.qdQuantidade || n === projeto.carregadores.length) return false;
    while (projeto.carregadores.length < n) projeto.carregadores.push(novoCarregador());
    while (projeto.carregadores.length > n) projeto.carregadores.pop();
    return true;
  }

  // ── Eventos do formulário ──────────────────────────────────
  function aplicarValor(chave, valor) {
    const partes = chave.split('.');
    let o = projeto;
    for (let i = 0; i < partes.length - 1; i++) o = o[partes[i]];
    o[partes[partes.length - 1]] = valor;
  }

  $form.addEventListener('input', (e) => {
    if (e.target.type === 'checkbox') return; // tratado no change
    const chave = e.target.dataset.chave;
    if (chave === 'qdQuantidade') {
      aplicarValor(chave, e.target.value);
      salvar();
      if (sincronizarCarregadores()) {
        renderTudo();
        const el = $form.querySelector('[data-chave="qdQuantidade"]');
        if (el) el.focus();
      } else {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(renderPreview, 150);
      }
      return;
    }
    if (chave) {
      aplicarValor(chave, e.target.value);
      if (chave === 'cliente' || chave === 'docNum') atualizarProjetoAtual();
      if (chave === 'cliente') preencherCliente(e.target.value);
      if (e.target.classList.contains('combo-input')) comboAbrir(e.target.closest('.combo').dataset.combo, e.target.value);
      if (/^carregadores\.\d+\.disjuntorManual$/.test(chave)) {
        $form.querySelectorAll(`[data-chave="${chave}"]`).forEach(el => { if (el !== e.target) el.value = e.target.value; });
      }
      salvar();
      clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        renderPreview();
        atualizarResumosForm();
      }, 150);
      return;
    }
    const iLeg = e.target.dataset.fotoLegenda;
    if (iLeg !== undefined) {
      projeto.fotos[Number(iLeg)].legenda = e.target.value;
      salvar();
      clearTimeout(previewTimer);
      previewTimer = setTimeout(renderPreview, 300);
      return;
    }
  });

  $form.addEventListener('change', (e) => {
    const chave = e.target.dataset.chave;
    if (chave === 'par-rede') {
      const [v, cfg] = e.target.value.split('|');
      projeto.tensao = Number(v);
      projeto.config = cfg;
      salvar();
      renderTudo();
      return;
    }
    if (chave && e.target.type === 'checkbox') {
      aplicarValor(chave, e.target.checked);
      salvar();
      renderTudo();
      return;
    }
    if (chave && e.target.tagName === 'SELECT') {
      aplicarValor(chave, e.target.value);
      if (chave === 'transformador' && e.target.value === 'sim') projeto.quadroDistribuicao = 'sim';
      if (chave === 'aterramentoExistente') projeto.aterramento = e.target.value === 'nao' ? 'TT' : 'TN-S';
      if (chave === 'quadroDistribuicao' || chave === 'transformador') sincronizarCarregadores();
      salvar();
      renderTudo();
      return;
    }
    if (e.target.id === 'fotos-input') lerImagens(e.target.files, 1200, (img) => { projeto.fotos.push(img); });
  });

  function lerImagens(fileList, larguraMax, aoLer) {
    const arquivos = Array.from(fileList || []);
    let pendentes = arquivos.length;
    if (!pendentes) return;
    arquivos.forEach((f) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const escala = Math.min(1, larguraMax / img.width);
          canvas.width = Math.round(img.width * escala);
          canvas.height = Math.round(img.height * escala);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          aoLer({ data: canvas.toDataURL('image/jpeg', 0.78), legenda: '' });
          if (--pendentes === 0) { salvar(); renderTudo(); }
        };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(f);
    });
  }

  // Atualiza apenas os textos de cálculo no formulário sem re-renderizar (não perde foco)
  function atualizarResumosForm() {
    const c = window.Calc.calcularProjeto(projeto);
    const $part = document.getElementById('resumo-participacao');
    if ($part) {
      if (c.geral && c.totalIb) { $part.style.display = ''; $part.innerHTML = participacaoHtml(c); }
      else $part.style.display = 'none';
    }
    document.querySelectorAll('.ponto').forEach((el) => {
      const i = Number(el.dataset.i);
      const pt = c.pontos[i];
      if (!pt) return;
      const info = el.querySelector('.carga-info');
      if (info) info.innerHTML = caracteristicasHtml(projeto.carregadores[i] || {}, pt);
    });
  }

  $form.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('.combo-btn');
    if (btn) {
      e.preventDefault();
      const wrap = btn.closest('.combo');
      const i = wrap.dataset.combo;
      if (wrap.classList.contains('aberto')) comboFechar();
      else { comboAbrir(i, ''); wrap.querySelector('.combo-input').focus(); }
      return;
    }
    const item = e.target.closest('.combo-item');
    if (item) {
      e.preventDefault();
      comboAplicar(Number(item.closest('.combo').dataset.combo), Number(item.dataset.k));
      return;
    }
    if (!e.target.closest('.combo')) comboFechar();
  });
  $form.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('combo-input')) {
      if (comboIgnorarFoco) return;
      comboAbrir(e.target.closest('.combo').dataset.combo, '');
    }
    else if (!e.target.closest('.combo')) comboFechar();
  });
  $form.addEventListener('keydown', (e) => {
    if (!e.target.classList.contains('combo-input')) return;
    const wrap = e.target.closest('.combo');
    const aberto = wrap.classList.contains('aberto');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!aberto) { comboAbrir(wrap.dataset.combo, e.target.value); return; }
      comboDestacar(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Enter') {
      const ativo = wrap.querySelector('.combo-item.ativo');
      if (aberto && ativo) { e.preventDefault(); comboAplicar(Number(wrap.dataset.combo), Number(ativo.dataset.k)); }
      else comboFechar();
    } else if (e.key === 'Escape') {
      if (aberto) { e.stopPropagation(); comboFechar(); }
    } else if (e.key === 'Tab') comboFechar();
  });
  document.addEventListener('mousedown', (e) => { if (!e.target.closest('.combo')) comboFechar(); });
  const reposicionar = () => { const w = $form.querySelector('.combo.aberto'); if (w) comboPosicionar(w); };
  document.getElementById('painel-form').addEventListener('scroll', reposicionar, { passive: true });
  window.addEventListener('resize', reposicionar);

  $form.addEventListener('click', (e) => {
    if (e.target.id === 'add-ponto') {
      projeto.carregadores.push(novoCarregador());
      salvar(); renderTudo();
    } else if (e.target.classList.contains('rm-ponto')) {
      projeto.carregadores.splice(Number(e.target.dataset.i), 1);
      salvar(); renderTudo();
    } else if (e.target.id === 'add-fotos') {
      document.getElementById('fotos-input').click();
    } else if (e.target.classList.contains('rm-foto')) {
      projeto.fotos.splice(Number(e.target.dataset.i), 1);
      salvar(); renderTudo();
    } else if (e.target.classList.contains('fav-foto')) {
      const f = projeto.fotos[Number(e.target.dataset.i)];
      if (f && !fotosPadrao.some(x => x.data === f.data)) { fotosPadrao.push({ data: f.data, legenda: f.legenda || '' }); gravarConfigCompartilhada('fotos_padrao', fotosPadrao); renderTudo(); setStatus('Foto guardada na biblioteca de fotos padrão.'); }
    } else if (e.target.dataset.rmBiblio !== undefined) {
      if (!confirm('Remover esta foto da biblioteca?')) return;
      fotosPadrao.splice(Number(e.target.dataset.rmBiblio), 1); gravarConfigCompartilhada('fotos_padrao', fotosPadrao); renderTudo();
    } else if (e.target.closest('.biblio-item') && projeto.status !== 'emitido') {
      const f = fotosPadrao[Number(e.target.closest('.biblio-item').dataset.biblio)];
      if (f) { projeto.fotos.push({ data: f.data, legenda: f.legenda || '' }); salvar(); renderTudo(); }
    } else if (e.target.dataset.rmFrase !== undefined) {
      e.stopPropagation();
      if (!confirm('Remover esta frase da biblioteca?')) return;
      frases.splice(Number(e.target.dataset.rmFrase), 1); gravarConfigCompartilhada('frases', frases); renderTudo();
    } else if (e.target.id === 'add-frase') {
      const t = prompt('Nova frase pronta para as observações:');
      if (t && t.trim()) { frases.push(t.trim()); gravarConfigCompartilhada('frases', frases); renderTudo(); }
    } else if (e.target.closest('.frase') && !e.target.closest('.frase').classList.contains('add') && projeto.status !== 'emitido') {
      const f = frases[Number(e.target.closest('.frase').dataset.frase)];
      if (f) {
        const atual = (projeto.observacoes || '').replace(/\s+$/, '');
        projeto.observacoes = atual ? atual + '\n' + f : f;
        salvar(); renderTudo();
      }
    } else if (e.target.id === 'aplicar-restante') {
      const base = projeto.carregadores[0];
      projeto.carregadores.slice(1).forEach(cg => {
        ['marca', 'modelo', 'potencia', 'conector', 'distancia', 'infra', 'incluirKit'].forEach(k => { cg[k] = base[k]; });
      });
      salvar(); renderTudo();
      setStatus(`Dados do C-EV-01 aplicados aos outros ${projeto.carregadores.length - 1} ponto(s).`);
    } else if (e.target.id === 'btn-doc-auto') {
      projeto.docNum = proximoDocNum();
      salvar(); renderTudo(); atualizarProjetoAtual();
    } else if (e.target.id === 'btn-nova-revisao') {
      novaRevisao();
    } else if (e.target.classList.contains('rev-abrir')) {
      const h = projeto.historicoRevisoes[Number(e.target.dataset.i)];
      if (!h) return;
      const copia = clonarProjeto(h.snapshot, false, { docNum: projeto.docNum, revisao: h.revisao, dataRevisao: h.dataRevisao, descricaoRevisao: h.descricao, manterFotos: true, manterArt: true });
      copia.fotos = JSON.parse(JSON.stringify(projeto.fotos || []));
      copia.cliente = (copia.cliente || '') + ` (cópia da Rev. ${h.revisao})`;
      projetos.push(copia);
      salvar(); abrirProjeto(copia);
      setStatus(`Rev. ${h.revisao} aberta como projeto separado. As fotos são as atuais (fotos não são versionadas).`);
    }
  });

  // ── Revisões: guarda a versão atual e avança o número ─────
  function novaRevisao() {
    const desc = prompt(`Emitir a Rev. ${String(Number(projeto.revisao || '0') + 1).padStart(2, '0')}.\nO que mudou nesta revisão? (aparece no controle do documento)`, '');
    if (desc === null) return;
    const snap = JSON.parse(JSON.stringify(projeto));
    delete snap.historicoRevisoes;
    snap.fotos = [];
    projeto.historicoRevisoes.push({
      revisao: projeto.revisao, dataRevisao: projeto.dataRevisao, gestor: projeto.gestor || gestorAtual(),
      descricao: (projeto.descricaoRevisao && projeto.descricaoRevisao.trim()) || (projeto.revisao === '00' ? 'Emissão inicial' : 'Revisão do documento'),
      emitidoEm: new Date().toISOString(), snapshot: snap,
    });
    projeto.revisao = String(Math.min(99, Number(projeto.revisao || '0') + 1)).padStart(2, '0');
    projeto.dataRevisao = hoje();
    projeto.descricaoRevisao = desc.trim() || 'Revisão do documento';
    projeto.status = 'rascunho'; projeto.emitidoEm = ''; projeto.emitidoPor = '';
    if (nuvemAtiva()) window.Sync.evento('revisao', { gestor: gestorAtual(), projeto_id: projeto.id, doc_num: projeto.docNum, detalhes: { revisao: projeto.revisao, descricao: projeto.descricaoRevisao } });
    salvar(); renderTudo();
    setStatus(`Rev. ${projeto.revisao} emitida. A versão anterior ficou guardada no histórico da seção 1.`);
  }

  // ── Cadastro de clientes (reaproveita endereço e cidade) ──
  // Sugestões do catálogo (modelo) e das marcas já usadas
  function renderListaCatalogo() {
    const dlM = document.getElementById('lista-marcas');
    if (dlM) {
      const marcas = new Set();
      catalogo.forEach(e => { if ((e.marca || '').trim()) marcas.add(e.marca.trim()); });
      projetos.forEach(pr => (pr.carregadores || []).forEach(cg => { if ((cg.marca || '').trim()) marcas.add(cg.marca.trim()); }));
      dlM.innerHTML = Array.from(marcas).sort().map(m => `<option value="${esc(m)}"></option>`).join('');
    }
  }
  function renderListaClientes() {
    const dl = document.getElementById('lista-clientes');
    if (!dl) return;
    const nomes = new Set();
    projetos.slice().sort((a, b) => (b.atualizadoEm || '').localeCompare(a.atualizadoEm || '')).forEach(p => {
      const n = (p.cliente || '').trim();
      if (n && p.id !== projeto.id && !/\(cópia da Rev\./.test(n)) nomes.add(n);
    });
    dl.innerHTML = Array.from(nomes).map(n => `<option value="${esc(n)}"></option>`).join('');
  }
  function preencherCliente(nome) {
    const n = (nome || '').trim().toLowerCase();
    if (!n) return;
    const ref = projetos.slice().sort((a, b) => (b.atualizadoEm || '').localeCompare(a.atualizadoEm || ''))
      .find(p => p.id !== projeto.id && (p.cliente || '').trim().toLowerCase() === n);
    if (!ref) return;
    let mudou = false;
    [['endereco', ref.endereco], ['cidadeUf', ref.cidadeUf]].forEach(([k, v]) => {
      if (v && !(projeto[k] || '').trim()) {
        projeto[k] = v; mudou = true;
        const el = $form.querySelector(`[data-chave="${k}"]`);
        if (el) el.value = v;
      }
    });
    if (mudou) setStatus('Endereço e cidade preenchidos a partir do último projeto deste cliente.');
  }

  // ── Pendências antes de emitir ────────────────────────────
  const $pend = document.getElementById('pendencias');
  let pendAberta = false;
  function listarPendencias() {
    const c = window.Calc.calcularProjeto(projeto);
    const L = [];
    const add = (sec, chave, texto) => L.push({ sec, chave, texto });
    const vazio = (v) => !String(v == null ? '' : v).trim();
    if (vazio(projeto.cliente)) add(1, 'cliente', 'Nome do cliente');
    if (vazio(projeto.endereco)) add(1, 'endereco', 'Endereço da obra');
    if (vazio(projeto.cidadeUf)) add(1, 'cidadeUf', 'Cidade/UF');
    if (vazio(projeto.docNum) || /X/.test(projeto.docNum)) add(1, 'docNum', 'Nº do documento');
    if (vazio(projeto.dataRevisao)) add(1, 'dataRevisao', 'Data da revisão');
    if (vazio(projeto.artExecucao)) add(1, 'artExecucao', 'Nº da ART de execução');
    if (vazio(projeto.disjuntorGeral)) add(2, 'disjuntorGeral', 'Disjuntor geral do QGBT');
    if (vazio(projeto.ikPresumida)) add(2, 'ikPresumida', 'Corrente de curto-circuito presumida (Ik) no quadro');
    if (projeto.transformador === 'sim') {
      if (vazio(projeto.trafoPotencia)) add(3, 'trafoPotencia', 'Potência do transformador');
      if (vazio(projeto.trafoPrimV)) add(3, 'trafoPrimV', 'Tensão do primário');
      if (vazio(projeto.trafoSecV)) add(3, 'trafoSecV', 'Tensão do secundário');
    }
    projeto.carregadores.forEach((cg, i) => {
      const id = 'C-EV-' + String(i + 1).padStart(2, '0');
      if (vazio(cg.potencia)) add(5, `carregadores.${i}.potencia`, `Potência do ${id}`);
      if (vazio(cg.conector)) add(5, `carregadores.${i}.conector`, `Conector do ${id}`);
      if (vazio(cg.distancia)) add(6, `carregadores.${i}.distancia`, `Distância do circuito do ${id}`);
    });
    ['t1', 't2', 't3'].forEach((k, i) => {
      if (c.trechos && c.trechos[k] && vazio(projeto.trechos[k].L)) add(6, `trechos.${k}.L`, `Distância do Trecho ${i + 1}`);
    });
    if (projeto.analiseDemanda === 'sim') {
      if (vazio(projeto.potenciaDisponivel)) add(7, 'potenciaDisponivel', 'Potência disponível (análise de demanda)');
      if (vazio(projeto.pontosSimultaneos)) add(7, 'pontosSimultaneos', 'Carregadores simultâneos (análise de demanda)');
    }
    c.pontos.forEach((pt, i) => {
      if (pt.secao && pt.quedaPct && !pt.quedaOk) add(6, `carregadores.${i}.distancia`, `${pt.id}: queda de tensão de ${fmt(pt.quedaPct, 2)} % (Reavaliar)`);
    });
    (projeto.fotos || []).forEach((f, i) => { if (vazio(f.legenda)) add(9, `foto-legenda-${i}`, `Legenda da foto ${i + 1}`); });
    const texto = $preview.textContent || '';
    const marc = (texto.match(/\[(XX|Ø|IP|L|Ib|S)\]/g) || []).length;
    if (marc) add(0, '', `${marc} marcador(es) [XX] ainda aparecem no documento`);
    return L;
  }
  // Emissão só sem pendências: mostra a lista e impede PDF/HTML enquanto houver algo em aberto
  function bloqueadoPorPendencias(oque) {
    const pend = listarPendencias();
    if (!pend.length && projeto.status === 'emitido') return false;
    if (!pend.length) {
      renderPendencias();
      document.getElementById('fluxo').scrollIntoView({ block: 'start', behavior: 'smooth' });
      setStatus(`⚠ ${oque} só é liberado para documentos com status Emitido. Marque como revisado e emita.`);
      alert(`${oque} só é liberado para documentos com status "Emitido".\n\nNo topo do formulário: marque como revisado e clique em Emitir.`);
      return true;
    }
    pendAberta = true;
    aplicarRecolhido(false);
    renderPendencias();
    $pend.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setStatus(`⚠ ${oque} só pode ser gerado sem pendências. Faltam ${pend.length} item(ns), listados no topo do formulário.`);
    alert(`${oque} só pode ser gerado depois de resolver todas as pendências.\n\nFaltam ${pend.length}:\n${pend.slice(0, 12).map(x => '• ' + x.texto).join('\n')}${pend.length > 12 ? '\n• …' : ''}`);
    return true;
  }
  function renderPendencias() {
    if (!$pend) return;
    const L = listarPendencias();
    $pend.classList.toggle('ok', !L.length);
    const emitido = projeto.status === 'emitido';
    const $pdf = document.getElementById('btn-pdf');
    if ($pdf) { $pdf.classList.toggle('bloqueado', !emitido || L.length > 0); $pdf.title = L.length ? `${L.length} pendência(s) impedem a emissão` : (emitido ? 'Gerar PDF' : 'Marque como revisado e emita o documento para liberar o PDF'); }
    renderFluxo(L.length);
    $pend.innerHTML = `<div class="pend-head"><span>${L.length ? `${L.length} pendência(s) antes de emitir` : 'Sem pendências: pronto para emitir'}</span><span>${L.length ? (pendAberta ? '▾' : '▸') : '✓'}</span></div>`
      + (L.length && pendAberta ? `<div class="pend-lista">${L.map(x => `<div class="pend-item" data-sec="${x.sec}" data-chave="${esc(x.chave)}"><span class="pend-sec">${x.sec ? 'Seção ' + x.sec : 'Doc.'}</span><span>${esc(x.texto)}</span></div>`).join('')}</div>` : '');
    marcarEtapasPendentes(L);
  }
  // Na barra de etapas, pinta de vermelho as seções que ainda têm pendência
  function marcarEtapasPendentes(L) {
    L = L || listarPendencias();
    const secs = new Set(L.map(x => String(x.sec)));
    $form.querySelectorAll('.etapa-pt').forEach(b => b.classList.toggle('falta', secs.has(b.dataset.etapa)));
    const r = $form.querySelector('.etapas-pend');
    if (r) { r.textContent = L.length ? `${L.length} pendência(s)` : 'Sem pendências'; r.classList.toggle('falta', L.length > 0); }
    const prox = $form.querySelector('[data-nav="prox"], [data-nav="fim"]');
    if (prox) { const b = secs.has(String(etapaAtual)); prox.classList.toggle('bloqueado', b); prox.title = b ? 'Complete esta etapa para avançar' : ''; }
  }
  let cliqueNasPendencias = false; // o clique re-renderiza a lista; evita que o fechamento global a feche na hora
  if ($pend) $pend.addEventListener('click', (e) => {
    cliqueNasPendencias = true;
    if (e.target.closest('.pend-head')) { pendAberta = !pendAberta; renderPendencias(); return; }
    const it = e.target.closest('.pend-item');
    if (!it) return;
    const sec = it.dataset.sec, chave = it.dataset.chave;
    if (sec && sec !== '0') irEtapa(+sec, false);
    let el = chave ? $form.querySelector(`[data-chave="${chave}"]`) : null;
    const mf = /^foto-legenda-(\d+)$/.exec(chave || '');
    if (!el && mf) el = $form.querySelector(`[data-foto-legenda="${mf[1]}"]`);
    if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); }
  });

  // ── Fluxo de aprovação: rascunho → revisado → emitido ─────
  function renderFluxo(nPend) {
    const $f = document.getElementById('fluxo');
    if (!$f) return;
    const st = projeto.status || 'rascunho';
    const rot = { rascunho: 'Rascunho', revisado: 'Revisado', emitido: 'Emitido' };
    let acoes = '';
    if (st === 'rascunho') acoes = `<span class="fluxo-info">Resolva as pendências, marque como revisado e emita para liberar o PDF.</span><button type="button" class="btn-mini" data-fluxo="revisado"${nPend ? ' disabled title="Resolva as pendências primeiro"' : ''}>Marcar como revisado</button>`;
    else if (st === 'revisado') acoes = `<span class="fluxo-info">Revisado. Emitir trava os campos e libera o PDF.</span><button type="button" class="btn-mini" data-fluxo="rascunho">Voltar a rascunho</button><button type="button" class="btn-mini destaque" data-fluxo="emitido"${nPend ? ' disabled' : ''}>Emitir</button>`;
    else acoes = `<span class="fluxo-info">Emitido por ${esc(projeto.emitidoPor || '—')} em ${dataCurta(projeto.emitidoEm)}. Para alterar, abra uma nova revisão.</span><button type="button" class="btn-mini" data-fluxo="nova-revisao">Nova revisão</button>`;
    $f.className = 'fluxo ' + st;
    $f.innerHTML = `<span class="fluxo-status">${rot[st]}</span>${acoes}`;
    const info = $f.querySelector('.fluxo-info'); $f.title = info ? info.textContent : '';
  }
  document.getElementById('fluxo').addEventListener('click', (e) => {
    const b = e.target.closest('[data-fluxo]');
    if (!b || b.disabled) return;
    const acao = b.dataset.fluxo;
    if (acao === 'nova-revisao') { novaRevisao(); return; }
    if (acao === 'emitido') {
      if (listarPendencias().length) { renderPendencias(); return; }
      const g = definirGestor(false);
      if (!confirm(`Emitir ${projeto.docNum} Rev. ${projeto.revisao} como ${g || 'gestor não informado'}?\nOs campos ficam travados até uma nova revisão.`)) return;
      projeto.status = 'emitido'; projeto.emitidoEm = new Date().toISOString(); projeto.emitidoPor = g;
      if (nuvemAtiva()) window.Sync.evento('emitido', { gestor: g, projeto_id: projeto.id, doc_num: projeto.docNum, detalhes: { revisao: projeto.revisao, cliente: projeto.cliente } });
      salvar(); renderTudo();
      setStatus(`${projeto.docNum} emitido. O PDF está liberado.`);
      return;
    }
    projeto.status = acao;
    salvar(); renderTudo();
  });

  // ── Gestor de projeto = usuário logado ────────────────────
  let usuarioAtual = null; // { email, nome, papel }
  function definirGestor() { return gestorAtual(); }
  function atualizarGestor() {
    const el = document.getElementById('gestor-atual');
    if (!el) return;
    el.textContent = gestorAtual() ? `${gestorAtual()}${usuarioAtual && usuarioAtual.papel === 'admin' ? ' (admin)' : ''} · sair` : 'Entrar';
    el.title = usuarioAtual ? usuarioAtual.email : '';
  }
  document.getElementById('gestor-atual').addEventListener('click', () => { if (usuarioAtual) sair(); else mostrarLogin('entrar'); });

  // ── Login (Supabase Auth) ─────────────────────────────────
  const $login = document.getElementById('login');
  let modoLogin = 'entrar';
  const FORMAS_LOGIN = {
    entrar: { titulo: 'Entrar', email: true, senha: true, nome: false, botao: 'Entrar', auto: 'current-password' },
    primeiro: { titulo: 'Primeiro acesso', email: true, senha: true, nome: true, botao: 'Criar minha senha', auto: 'new-password' },
    esqueci: { titulo: 'Recuperar senha', email: true, senha: false, nome: false, botao: 'Enviar link por e-mail', auto: 'off' },
    'nova-senha': { titulo: 'Nova senha', email: false, senha: true, nome: false, botao: 'Salvar nova senha', auto: 'new-password' },
  };
  function mostrarLogin(modo, msg, erro) {
    modoLogin = FORMAS_LOGIN[modo] ? modo : 'entrar';
    const f = FORMAS_LOGIN[modoLogin];
    $login.style.display = 'flex';
    document.body.classList.add('sem-sessao');
    document.getElementById('login-titulo').textContent = f.titulo;
    document.getElementById('login-email-wrap').style.display = f.email ? '' : 'none';
    document.getElementById('login-senha-wrap').style.display = f.senha ? '' : 'none';
    document.getElementById('login-nome-wrap').style.display = f.nome ? '' : 'none';
    document.getElementById('login-senha').autocomplete = f.auto;
    document.getElementById('login-senha').value = '';
    document.getElementById('login-entrar').textContent = f.botao;
    const m = document.getElementById('login-msg');
    m.textContent = msg || '';
    m.className = 'login-msg' + (erro ? ' erro' : '');
    document.getElementById('login-primeiro').style.display = modoLogin === 'entrar' ? '' : 'none';
    document.getElementById('login-esqueci').style.display = modoLogin === 'entrar' ? '' : 'none';
    document.getElementById('login-voltar').style.display = modoLogin === 'entrar' || modoLogin === 'nova-senha' ? 'none' : '';
    setTimeout(() => { const el = document.getElementById(f.email ? 'login-email' : 'login-senha'); if (el) el.focus(); }, 50);
  }
  function ocultarLogin() { $login.style.display = 'none'; document.body.classList.remove('sem-sessao'); }
  document.getElementById('login-primeiro').addEventListener('click', () => mostrarLogin('primeiro', 'Seu e-mail precisa estar cadastrado pelo administrador. Informe-o e crie sua senha (mínimo 6 caracteres).'));
  document.getElementById('login-esqueci').addEventListener('click', () => mostrarLogin('esqueci', 'Informe o e-mail cadastrado. Você receberá um link para definir uma nova senha.'));
  document.getElementById('login-voltar').addEventListener('click', () => mostrarLogin('entrar'));
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = document.getElementById('login-senha').value;
    const nome = document.getElementById('login-nome').value.trim();
    const btn = document.getElementById('login-entrar');
    btn.disabled = true;
    try {
      if (modoLogin === 'entrar') {
        if (!email || !senha) throw new Error('Informe e-mail e senha.');
        await window.Auth.entrar(email, senha);
        await aposLogin();
      } else if (modoLogin === 'primeiro') {
        if (!email || !senha) throw new Error('Informe e-mail e senha.');
        if (!nome) throw new Error('Informe seu nome.');
        const ok = await window.Sync.emailAutorizado(email);
        if (!ok) throw new Error('Este e-mail não está na lista de autorizados. Peça ao administrador para cadastrá-lo em Novo ▾ → Equipe.');
        const r = await window.Auth.criarConta(email, senha, nome);
        if (r.precisaConfirmar) mostrarLogin('entrar', `Enviamos um e-mail de confirmação para ${email}. Abra o link que está nele e depois entre com sua senha.`);
        else await aposLogin();
      } else if (modoLogin === 'esqueci') {
        if (!email) throw new Error('Informe o e-mail.');
        await window.Auth.recuperarSenha(email);
        mostrarLogin('entrar', `Se ${email} estiver cadastrado, você receberá um link para definir a nova senha.`);
      } else if (modoLogin === 'nova-senha') {
        if (!senha) throw new Error('Informe a nova senha.');
        await window.Auth.definirSenha(senha);
        await aposLogin();
      }
    } catch (err) {
      mostrarLogin(modoLogin, err.message || String(err), true);
    } finally { btn.disabled = false; }
  });
  async function aposLogin() {
    let u = null;
    try { u = await window.Sync.meuUsuario(); } catch (e) { u = null; }
    if (!u) {
      const email = window.Auth.email();
      await window.Auth.sair();
      mostrarLogin('entrar', `${email || 'Este e-mail'} não está autorizado a usar o gerador. Fale com o administrador.`, true);
      return;
    }
    usuarioAtual = u;
    try { localStorage.setItem(LS_GESTOR, u.nome); } catch (e) { /* ignora */ }
    ocultarLogin();
    atualizarGestor();
    await carregarNuvem();
  }
  async function sair() {
    if (!confirm('Sair do gerador? O cache deste navegador será limpo (os projetos continuam na nuvem).')) return;
    await window.Auth.sair();
    try { [LS_KEY, LS_GESTOR, LS_MODELOS].forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignora */ }
    location.reload();
  }
  window.addEventListener('gmd-sessao-expirada', () => { usuarioAtual = null; mostrarLogin('entrar', 'Sua sessão expirou. Entre novamente.'); });

  // ── Equipe (admin): quem pode entrar ──────────────────────
  async function abrirEquipe() {
    abrirModal('Equipe · quem pode usar o gerador', '<p style="color:var(--g1)">Carregando…</p>');
    let lista = [];
    try { lista = await window.Sync.listarUsuarios(); } catch (e) { abrirModal('Equipe', `<p class="login-msg erro">Não foi possível carregar: ${esc(e.message)}</p>`); return; }
    const linhas = lista.map(u => `<tr><td>${esc(u.email)}</td><td>${esc(u.nome)}</td><td>${({ admin: 'Administrador', lider: 'Líder', projetista: 'Projetista' }[u.papel] || u.papel)}</td><td>${u.ativo ? '<span style="color:var(--green-d);font-weight:600">ativo</span>' : '<span style="color:var(--g2)">inativo</span>'}</td><td style="white-space:nowrap"><button type="button" class="btn-mini" data-eq-toggle="${esc(u.email)}">${u.ativo ? 'desativar' : 'ativar'}</button> <select class="eq-papel-sel" data-eq-papel="${esc(u.email)}" title="Papel na ferramenta">${['projetista', 'lider', 'admin'].map(v => `<option value="${v}"${u.papel === v ? ' selected' : ''}>${{ projetista: 'Projetista', lider: 'Líder', admin: 'Administrador' }[v]}</option>`).join('')}</select> ${u.email.toLowerCase() !== (usuarioAtual.email || '').toLowerCase() ? `<button type="button" class="btn-mini" data-eq-rm="${esc(u.email)}">×</button>` : ''}</td></tr>`).join('');
    abrirModal('Equipe · quem pode usar o gerador', `
      <p style="margin:0 0 10px;color:var(--g1)">Cadastre o e-mail de cada pessoa. Ela cria a própria senha em <strong>Primeiro acesso</strong> na tela de entrada. Desativar bloqueia o acesso na hora.</p>
      <table class="tab"><thead><tr><th>E-mail</th><th>Nome</th><th>Papel</th><th>Situação</th><th></th></tr></thead><tbody>${linhas || '<tr><td colspan="5">Ninguém cadastrado.</td></tr>'}</tbody></table>
      <div class="metr-titulo">Adicionar pessoa</div>
      <div style="display:grid;grid-template-columns:1.3fr 1fr auto auto;gap:8px;align-items:end">
        <label class="campo"><span class="campo-label">E-mail</span><input type="email" id="eq-email" autocomplete="off" /></label>
        <label class="campo"><span class="campo-label">Nome</span><input type="text" id="eq-nome" autocomplete="off" /></label>
        <label class="campo"><span class="campo-label">Papel</span><select id="eq-papel"><option value="projetista">Projetista</option><option value="lider">Líder</option><option value="admin">Administrador</option></select></label>
        <button type="button" class="btn primario" id="eq-add" style="padding:8px 14px">Adicionar</button>
      </div>`);
  }
  document.getElementById('modal-corpo').addEventListener('click', async (e) => {
    const t = e.target;
    try {
      if (t.id === 'eq-add') {
        const email = document.getElementById('eq-email').value.trim().toLowerCase();
        const nome = document.getElementById('eq-nome').value.trim();
        const papel = document.getElementById('eq-papel').value;
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { alert('Informe um e-mail válido.'); return; }
        if (!nome) { alert('Informe o nome.'); return; }
        await window.Sync.salvarUsuario({ email, nome, papel, ativo: true });
        abrirEquipe();
      } else if (t.dataset.eqToggle) {
        const lista = await window.Sync.listarUsuarios();
        const u = lista.find(x => x.email === t.dataset.eqToggle);
        if (u) { await window.Sync.salvarUsuario({ email: u.email, nome: u.nome, papel: u.papel, ativo: !u.ativo }); abrirEquipe(); }
      } else if (t.dataset.eqRm) {
        if (!confirm(`Remover ${t.dataset.eqRm} da equipe? A pessoa perde o acesso na hora.`)) return;
        await window.Sync.excluirUsuario(t.dataset.eqRm);
        abrirEquipe();
      }
    } catch (err) { alert('Não foi possível salvar: ' + err.message); }
  });

  // ── Modal genérico ────────────────────────────────────────
  const $modal = document.getElementById('modal');
  function abrirModal(titulo, html) {
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('modal-corpo').innerHTML = html;
    $modal.style.display = 'flex';
  }
  function fecharModal() { $modal.style.display = 'none'; }
  document.getElementById('modal-fechar').addEventListener('click', fecharModal);
  $modal.addEventListener('click', (e) => { if (e.target === $modal) fecharModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $modal.style.display !== 'none') fecharModal(); });

  // ── Catálogo de equipamentos (compartilhado) ──────────────
  function abrirCatalogo() {
    const linhas = catalogo.map((e, i) => `<tr><td><input data-cat-campo="marca" data-i="${i}" value="${esc(e.marca || '')}" style="width:110px" /></td><td><input data-cat-campo="nome" data-i="${i}" value="${esc(e.nome)}" /></td><td><input data-cat-campo="potencia" data-i="${i}" type="number" step="0.1" value="${esc(e.potencia)}" style="width:80px" /></td><td><select data-cat-campo="conector" data-i="${i}">${window.Calc.CONECTORES.map(k => `<option${k === e.conector ? ' selected' : ''}>${k}</option>`).join('')}</select></td><td><select data-cat-campo="tipo" data-i="${i}"><option${e.tipo === 'AC' ? ' selected' : ''}>AC</option><option${e.tipo === 'DC' ? ' selected' : ''}>DC</option></select></td><td><input data-cat-campo="ip" data-i="${i}" value="${esc(e.ip || '')}" style="width:70px" /></td><td><button type="button" class="btn-mini" data-cat-rm="${i}">×</button></td></tr>`).join('');
    abrirModal('Catálogo de equipamentos', `<p style="margin:0 0 10px;color:var(--g1)">Os modelos aparecem como sugestão no campo "Modelo" de cada ponto e preenchem marca, potência e conector. O campo aceita qualquer texto: se o equipamento não estiver aqui, escreva direto no ponto. O catálogo é compartilhado com todo o time.</p>
      <table class="tab"><thead><tr><th>Marca</th><th>Modelo</th><th>kW</th><th>Conector</th><th>Tipo</th><th>IP</th><th></th></tr></thead><tbody>${linhas}</tbody></table>
      <div style="display:flex;gap:8px"><button type="button" class="btn-mini" id="cat-add">+ adicionar</button><button type="button" class="btn primario" id="cat-salvar" style="padding:6px 14px">Salvar catálogo</button></div>`);
  }
  document.getElementById('modal-corpo').addEventListener('click', (e) => {
    if (e.target.id === 'cat-add') { catalogo.push({ nome: 'Novo equipamento', marca: '', potencia: 7.4, conector: 'Tipo 2', tipo: 'AC', ip: 'IP54' }); abrirCatalogo(); return; }
    if (e.target.dataset.catRm !== undefined) { catalogo.splice(Number(e.target.dataset.catRm), 1); abrirCatalogo(); return; }
    if (e.target.id === 'cat-salvar') {
      document.querySelectorAll('#modal-corpo [data-cat-campo]').forEach(el => {
        const it = catalogo[Number(el.dataset.i)];
        if (!it) return;
        it[el.dataset.catCampo] = el.dataset.catCampo === 'potencia' ? Number(el.value) : el.value.trim();
      });
      catalogo = catalogo.filter(x => x.nome);
      gravarConfigCompartilhada('catalogo', catalogo);
      fecharModal(); renderTudo();
      setStatus('Catálogo salvo e compartilhado com o time.');
    }
  });

  // ── Métricas ──────────────────────────────────────────────
  function inicioSemana(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  async function abrirMetricas() {
    abrirModal('Métricas do time', '<p style="color:var(--g1)">Carregando…</p>');
    let linhas = projetos.map(p => ({ id: p.id, gestor: p.gestor || '—', status: p.status, pendencias: p.pendenciasSalvas || [], criado_em: p.criadoEm, emitido_em: p.emitidoEm || null, cliente: p.cliente }));
    let eventos = [];
    if (nuvemAtiva()) {
      try {
        const desde = new Date(); desde.setDate(desde.getDate() - 120);
        const [rl, ev] = await Promise.all([window.Sync.listarResumoProjetos(), window.Sync.listarEventos(desde.toISOString())]);
        if (rl && rl.length) linhas = rl.map(r => ({ id: r.id, gestor: r.gestor || '—', status: r.status, pendencias: r.pendencias || [], criado_em: r.criado_em, emitido_em: r.emitido_em, cliente: r.cliente }));
        eventos = ev || [];
      } catch (e) { nuvemOk(false, e); }
    }
    const emissoes = eventos.filter(e => e.tipo === 'emitido');
    const agora = new Date();
    const semanas = Array.from({ length: 8 }, (_, i) => { const d = inicioSemana(agora); d.setDate(d.getDate() - 7 * (7 - i)); return d; });
    const chaveSem = (iso) => { if (!iso) return null; const d = inicioSemana(new Date(iso)); return d.getTime(); };
    const porSemana = semanas.map(d => {
      const k = d.getTime();
      return { rotulo: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), criados: linhas.filter(l => chaveSem(l.criado_em) === k).length, emitidos: (emissoes.length ? emissoes.filter(e => chaveSem(e.criado_em) === k) : linhas.filter(l => chaveSem(l.emitido_em) === k)).length };
    });
    const gestoresSet = new Set(linhas.map(l => l.gestor).concat(emissoes.map(e => e.gestor || '—')));
    const porGestor = Array.from(gestoresSet).map(g => {
      const meus = linhas.filter(l => l.gestor === g);
      const emit = emissoes.length ? emissoes.filter(e => (e.gestor || '—') === g).length : meus.filter(l => l.status === 'emitido').length;
      const tempos = meus.filter(l => l.emitido_em && l.criado_em).map(l => (new Date(l.emitido_em) - new Date(l.criado_em)) / 36e5);
      const media = tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : null;
      return { g, criados: meus.length, emitidos: emit, rascunho: meus.filter(l => l.status !== 'emitido').length, media };
    }).sort((a, b) => b.emitidos - a.emitidos || b.criados - a.criados);
    const contPend = {};
    linhas.filter(l => l.status !== 'emitido').forEach(l => (l.pendencias || []).forEach(t => { const k = t.replace(/C-EV-\d+/g, 'C-EV').replace(/\d+ marcador/, 'N marcador'); contPend[k] = (contPend[k] || 0) + 1; }));
    const topPend = Object.entries(contPend).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const fmtH = (h) => h == null ? '—' : (h < 48 ? `${fmt(h, 1)} h` : `${fmt(h / 24, 1)} dias`);
    const totalEmit = emissoes.length || linhas.filter(l => l.status === 'emitido').length;
    abrirModal('Métricas do time', `
      <div class="metr-cards">
        <div class="metr-card"><b>${linhas.length}</b><span>memoriais cadastrados</span></div>
        <div class="metr-card"><b>${totalEmit}</b><span>emissões${emissoes.length ? ' (120 dias)' : ''}</span></div>
        <div class="metr-card"><b>${linhas.filter(l => l.status !== 'emitido').length}</b><span>em rascunho/revisão</span></div>
        <div class="metr-card"><b>${porSemana.slice(-4).reduce((a, s) => a + s.emitidos, 0)}</b><span>emitidos nas últimas 4 semanas</span></div>
      </div>
      <div class="metr-titulo">Por gestor de projeto</div>
      <table class="tab"><thead><tr><th>Gestor</th><th>Criados</th><th>Emitidos</th><th>Em aberto</th><th>Tempo médio até emitir</th></tr></thead><tbody>
        ${porGestor.map(r => `<tr><td><strong>${esc(r.g)}</strong></td><td>${r.criados}</td><td>${r.emitidos}</td><td>${r.rascunho}</td><td>${fmtH(r.media)}</td></tr>`).join('') || '<tr><td colspan="5">Sem dados ainda.</td></tr>'}
      </tbody></table>
      <div class="metr-titulo">Por semana (início da semana)</div>
      <table class="tab"><thead><tr><th>Semana</th>${porSemana.map(s => `<th>${s.rotulo}</th>`).join('')}</tr></thead><tbody>
        <tr><td>Criados</td>${porSemana.map(s => `<td>${s.criados}</td>`).join('')}</tr>
        <tr><td>Emitidos</td>${porSemana.map(s => `<td>${s.emitidos}</td>`).join('')}</tr>
      </tbody></table>
      <div class="metr-titulo">Pendências mais comuns (projetos em aberto)</div>
      <table class="tab"><tbody>${topPend.map(([t, n]) => `<tr><td>${esc(t)}</td><td style="width:60px;text-align:right">${n}</td></tr>`).join('') || '<tr><td>Nenhuma pendência registrada.</td></tr>'}</tbody></table>
      <p style="font-size:10.5px;color:var(--g2);margin:6px 0 0">${nuvemAtiva() ? 'Dados da nuvem compartilhada (Supabase).' : 'Dados só deste navegador (nuvem desativada).'}</p>`);
  }


  // ── Histórico de projetos (painel pesquisável) ─────────────
  const $painel = document.getElementById('painel-projetos');
  const $busca = document.getElementById('busca-projetos');
  const $lista = document.getElementById('lista-projetos');

  function dataCurta(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  function renderLista(filtro) {
    const q = (filtro || '').trim().toLowerCase();
    const ordenados = projetos.slice().sort((a, b) => (b.atualizadoEm || '').localeCompare(a.atualizadoEm || ''));
    const vistos = ordenados.filter(p => {
      if (!q) return true;
      return [p.cliente, p.docNum, p.endereco, p.cidadeUf, p.gestor, p.status].some(v => String(v || '').toLowerCase().includes(q));
    });
    $lista.innerHTML = vistos.length ? vistos.map(p => `
      <div class="proj-item${p.id === projeto.id ? ' ativo' : ''}" data-id="${p.id}">
        <div class="proj-info">
          <div class="proj-nome">${p.cliente ? p.cliente.replace(/</g, '&lt;') : '<span class="proj-vazio">Projeto sem cliente</span>'}</div>
          <div class="proj-meta">${(p.docNum || 'BG-ME-XX-XXXX').replace(/</g, '&lt;')} · Rev. ${esc(p.revisao || '00')} · ${{ rascunho: 'rascunho', revisado: 'revisado', emitido: 'emitido' }[p.status] || 'rascunho'} · ${p.carregadores ? p.carregadores.length : 1} ponto(s)${p.gestor ? ' · ' + esc(p.gestor) : ''} · ${dataCurta(p.atualizadoEm)}</div>
        </div>
        <button type="button" class="btn-mini proj-duplicar" data-id="${p.id}" title="Duplicar: mesmos parâmetros, novo cliente">⧉</button>
        <button type="button" class="btn-mini proj-excluir" data-id="${p.id}" title="Excluir projeto">×</button>
      </div>`).join('') + `<div class="proj-acoes"><button type="button" class="btn-mini" id="btn-baixar-lote" title="Gera o HTML de cada projeto listado (um download por projeto)">Baixar HTML dos ${vistos.length} projeto(s) listados</button></div>` : '<div class="proj-nenhum">Nenhum projeto encontrado.</div>';
    $lista.dataset.ids = vistos.map(p => p.id).join(',');
  }
  function abrirPainel() {
    const r = $busca.getBoundingClientRect();
    $painel.style.left = Math.max(8, r.left) + 'px';
    $painel.style.display = 'block';
    renderLista($busca.value);
  }
  function atualizarProjetoAtual() {
    const el = document.getElementById('projeto-atual');
    if (el) el.textContent = 'Projeto atual: ' + (projeto.cliente || projeto.docNum || 'sem nome');
  }
  $busca.addEventListener('focus', abrirPainel);
  $busca.addEventListener('input', abrirPainel);
  $busca.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $painel.style.display = 'none'; $busca.blur(); } });
  document.addEventListener('click', (e) => {
    if (!$painel.contains(e.target) && e.target !== $busca && $painel.style.display !== 'none') {
      $painel.style.display = 'none';
    }
    if (!$painelNovo.contains(e.target) && $painelNovo.style.display !== 'none') $painelNovo.style.display = 'none';
    if (cliqueNasPendencias) { cliqueNasPendencias = false; return; }
    if (pendAberta && $pend) { pendAberta = false; renderPendencias(); }
  });
  $lista.addEventListener('click', async (e) => {
    const dup = e.target.closest('.proj-duplicar');
    if (dup) {
      const origem = projetos.find(p => p.id === dup.dataset.id);
      if (!origem) return;
      const p = clonarProjeto(origem, true);
      $painel.style.display = 'none'; $busca.value = '';
      registrarNovo(p, true, 'duplicado');
      setStatus(`Cópia de "${origem.cliente || origem.docNum}" criada. Informe o novo cliente.`);
      return;
    }
    if (e.target.id === 'btn-baixar-lote') {
      const ids = ($lista.dataset.ids || '').split(',').filter(Boolean);
      const todos = ids.map(id => projetos.find(p => p.id === id)).filter(Boolean);
      const lista = todos.filter(p => p.status === 'emitido');
      if (!lista.length) { alert('Nenhum projeto emitido na lista. Só documentos com status "Emitido" são exportados.'); return; }
      if (!confirm(`Baixar o HTML de ${lista.length} projeto(s) emitido(s)${todos.length > lista.length ? ` (${todos.length - lista.length} não emitido(s) ficam de fora)` : ''}? O navegador pode pedir permissão para vários downloads.`)) return;
      $painel.style.display = 'none';
      for (let i = 0; i < lista.length; i++) {
        setStatus(`Gerando ${i + 1} de ${lista.length}: ${lista[i].cliente || lista[i].docNum}…`);
        try { await baixarHtml(lista[i]); } catch (err) { setStatus('⚠ Falha em ' + (lista[i].docNum || '') + ': ' + err.message); }
        await new Promise(r => setTimeout(r, 600));
      }
      setStatus(`${lista.length} documento(s) baixado(s).`);
      return;
    }
    const del = e.target.closest('.proj-excluir');
    if (del) {
      if (!confirm('Excluir este projeto?')) return;
      projetos = projetos.filter(p => p.id !== del.dataset.id);
      if (nuvemAtiva()) window.Sync.excluirProjeto(del.dataset.id).then(() => nuvemOk(true)).catch(e => nuvemOk(false, e));
      if (!projetos.length) projetos.push(novoProjeto());
      if (!projetos.find(p => p.id === projeto.id)) projeto = projetos[projetos.length - 1];
      guardarCache();
      renderLista($busca.value); renderTudo(); atualizarProjetoAtual();
      return;
    }
    const item = e.target.closest('.proj-item');
    if (item) {
      const p = projetos.find(x => x.id === item.dataset.id);
      if (p) { projeto = p; $painel.style.display = 'none'; $busca.value = ''; sincronizarCarregadores(); renderTudo(); atualizarProjetoAtual(); }
    }
  });
  // Menu "Novo": em branco ou a partir de um modelo
  const $painelNovo = document.getElementById('painel-novo');
  function renderMenuNovo() {
    $painelNovo.innerHTML = `<div class="menu-principal">
        <button type="button" class="btn primario menu-btn" data-acao="branco">+ Novo projeto em branco</button>
        <button type="button" class="btn menu-btn" data-acao="modelos">Novo a partir de um modelo${modelos.length ? ` (${modelos.length})` : ''}</button>
      </div>
      <div class="menu-titulo">Projeto atual</div>
      <div class="menu-item" data-acao="duplicar"><span class="nome">Duplicar este projeto</span></div>
      <div class="menu-item" data-acao="baixar"><span class="nome">Baixar HTML</span></div>
      <div class="menu-titulo">Biblioteca do time</div>
      ${podeModelo() ? '<div class="menu-item" data-acao="salvar-modelo"><span class="nome">Salvar o projeto atual como modelo…</span></div>' : ''}
      <div class="menu-item" data-acao="catalogo"><span class="nome">Catálogo de equipamentos…</span></div>
      <div class="menu-titulo">Time</div>
      <div class="menu-item" data-acao="metricas"><span class="nome">Métricas</span></div>
      ${usuarioAtual && usuarioAtual.papel === 'admin' ? '<div class="menu-item" data-acao="equipe"><span class="nome">Equipe (quem pode entrar)…</span></div>' : ''}`;
  }

  // ── Biblioteca de modelos: busca e escolha em janela própria ──
  let modelosFiltro = '';
  function resumoModelo(m) {
    const d = m.dados || {};
    const cg = (d.carregadores || []);
    const pots = Array.from(new Set(cg.map(x => x.potencia).filter(Boolean)));
    const partes = [
      cg.length ? `${cg.length} × ${pots.length === 1 ? fmt(Number(pots[0])) + ' kW' : 'potências variadas'}` : null,
      d.tensao ? `${d.tensao} V · ${d.config || ''}`.trim() : null,
      d.transformador === 'sim' ? 'com transformador' : null,
      d.quadroDistribuicao === 'sim' ? 'com QDA' : 'sem QDA',
      d.trecho4Modo === 'agrupado' ? 'circuitos agrupados' : null,
      cg.some(x => x.modelo) ? esc(cg[0].modelo) : null,
    ].filter(Boolean);
    return partes.join(' · ');
  }
  function listaModelosHtml() {
    const q = semAcento(modelosFiltro).trim();
    const casa = (m) => !q || semAcento(`${m.nome} ${resumoModelo(m)}`).includes(q);
    const grupos = [
      ['Modelos oficiais BeGreen', modelos.filter(m => m.oficial && casa(m)), 'Modelos oficiais ficam disponíveis com a nuvem conectada.'],
      ['Modelos do time', modelos.filter(m => !m.oficial && casa(m)), 'Nenhum modelo do time ainda. Use "Salvar o projeto atual como modelo".'],
    ];
    const total = grupos.reduce((a, g) => a + g[1].length, 0);
    if (q && !total) return `<div class="mod-vazio">Nenhum modelo encontrado para "${esc(modelosFiltro)}".</div>`;
    return grupos.map(([titulo, lista, vazio]) => `<div class="mod-grupo">${titulo}<span>${lista.length}</span></div>`
      + (lista.length ? lista.map(m => `<div class="mod-item" data-modelo="${m.id}">
          <div class="mod-info"><div class="mod-nome">${esc(m.nome)}</div><div class="mod-det">${resumoModelo(m)}</div></div>
          ${m.oficial ? '<span class="menu-tag">oficial</span>' : ''}
          <button type="button" class="mod-usar" data-usar="${m.id}">Usar</button>
          ${podeModelo() ? `<button type="button" class="mod-excluir" data-excluir-modelo="${m.id}" title="Excluir modelo">×</button>` : ''}
        </div>`).join('') : `<div class="mod-vazio">${q ? 'Nenhum resultado neste grupo.' : vazio}</div>`)).join('');
  }
  // Modelos de projeto são mantidos por líderes e administradores
  const podeModelo = () => !!(usuarioAtual && ['admin', 'lider'].includes(usuarioAtual.papel));

  // Cria um modelo a partir do projeto aberto (sem cliente, fotos e ART)
  function salvarComoModelo() {
    if (!podeModelo()) { alert('Somente líderes e administradores criam modelos de projeto.'); return null; }
    const cg = projeto.carregadores[0] || {};
    const sugestao = `${projeto.carregadores.length} × ${cg.potencia || '?'} kW · ${projeto.tensao} V ${projeto.config}${projeto.transformador === 'sim' ? ' · com transformador' : ''}${projeto.quadroDistribuicao === 'sim' ? ' · QDA' : ''}`;
    const nome = prompt('Nome do modelo (como vai aparecer na biblioteca):', sugestao);
    if (!nome || !nome.trim()) return null;
    const dados = clonarProjeto(projeto, true, { docNum: 'BG-ME-XX-XXXX' });
    dados.status = 'rascunho'; dados.gestor = ''; dados.fotos = [];
    const m = { id: novoId(), nome: nome.trim(), criadoEm: new Date().toISOString(), dados, oficial: false, ordem: 100 };
    modelos.push(m);
    gravarLS(LS_MODELOS, modelos);
    if (nuvemAtiva()) window.Sync.salvarModelo({ id: m.id, nome: m.nome, dados: m.dados, oficial: false, ordem: 100, gestor: gestorAtual() }).then(() => nuvemOk(true)).catch(e => nuvemOk(false, e));
    setStatus(`Modelo "${m.nome}" salvo e disponível para o time.`);
    return m;
  }

  function abrirModelos(foco) {
    abrirModal('Modelos de projeto', `
      <input type="search" id="mod-busca" class="mod-busca" placeholder="Buscar modelo: nome, potência, tensão, QDA…" value="${esc(modelosFiltro)}" autocomplete="off" />
      <div id="mod-lista" class="mod-lista">${listaModelosHtml()}</div>
      ${podeModelo() ? '<div class="mod-acoes"><button type="button" class="btn primario" id="mod-novo">+ Salvar o projeto atual como modelo</button></div>' : ''}
      <p class="mod-rodape">Um modelo cria um projeto novo com os mesmos parâmetros, sem cliente, fotos e ART. ${podeModelo() ? 'Como líder ou administrador, você pode criar e excluir modelos para todo o time.' : 'Criar e excluir modelos é função de líderes e administradores.'}</p>`);
    const b = document.getElementById('mod-busca');
    if (b) b.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter') return;
      ev.preventDefault();
      const primeiro = document.querySelector('#mod-lista .mod-item');
      if (primeiro) primeiro.querySelector('[data-usar]').click();
    });
    if (b && foco !== false) setTimeout(() => b.focus(), 30);
  }
  function atualizarListaModelos() {
    const el = document.getElementById('mod-lista');
    if (el) el.innerHTML = listaModelosHtml();
  }
  document.getElementById('modal-corpo').addEventListener('input', (e) => {
    if (e.target.id === 'mod-busca') { modelosFiltro = e.target.value; atualizarListaModelos(); }
  });
  document.getElementById('modal-corpo').addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-eq-papel]');
    if (!sel) return;
    try {
      const lista = await window.Sync.listarUsuarios();
      const u = lista.find(x => x.email === sel.dataset.eqPapel);
      if (u) { await window.Sync.salvarUsuario({ email: u.email, nome: u.nome, papel: sel.value, ativo: u.ativo }); abrirEquipe(); }
    } catch (err) { alert('Não foi possível mudar o papel: ' + err.message); }
  });
  document.getElementById('modal-corpo').addEventListener('click', (e) => {
    if (e.target.id === 'mod-novo') {
      const m = salvarComoModelo();
      if (m) { modelosFiltro = ''; abrirModelos(false); }
      return;
    }
    const ex = e.target.closest('[data-excluir-modelo]');
    if (ex) {
      if (!podeModelo()) { alert('Somente líderes e administradores excluem modelos.'); return; }
      const m = modelos.find(x => x.id === ex.dataset.excluirModelo);
      if (!confirm(`Excluir o modelo "${m ? m.nome : ''}"? Ele deixa de aparecer para todo o time.`)) return;
      modelos = modelos.filter(x => x.id !== ex.dataset.excluirModelo);
      gravarLS(LS_MODELOS, modelos);
      if (nuvemAtiva()) window.Sync.excluirModelo(ex.dataset.excluirModelo).catch(err => nuvemOk(false, err));
      atualizarListaModelos();
      return;
    }
    const alvo = e.target.closest('[data-usar]') || e.target.closest('.mod-item');
    if (!alvo) return;
    const id = alvo.dataset.usar || alvo.dataset.modelo;
    const m = modelos.find(x => x.id === id);
    if (!m) return;
    fecharModal();
    registrarNovo(clonarProjeto(m.dados, true), true, 'modelo: ' + m.nome);
    setStatus(`Projeto criado a partir do modelo "${m.nome}".`);
  });
  function posicionarMenu() {
    const btn = document.getElementById('btn-novo');
    const r = btn.getBoundingClientRect();
    const larg = Math.min(330, window.innerWidth - 24);
    $painelNovo.style.width = larg + 'px';
    $painelNovo.style.left = Math.max(12, Math.min(r.left, window.innerWidth - larg - 12)) + 'px';
    $painelNovo.style.top = (r.bottom + 6) + 'px';
    $painelNovo.style.maxHeight = Math.max(200, window.innerHeight - r.bottom - 24) + 'px';
  }
  document.getElementById('btn-novo').addEventListener('click', (e) => {
    e.stopPropagation();
    const aberto = $painelNovo.style.display !== 'none';
    $painel.style.display = 'none';
    if (aberto) { $painelNovo.style.display = 'none'; return; }
    renderMenuNovo();
    $painelNovo.style.display = 'block';
    posicionarMenu();
  });
  window.addEventListener('resize', () => { if ($painelNovo.style.display !== 'none') posicionarMenu(); });
  $painelNovo.addEventListener('click', (e) => {
    const ex = e.target.closest('[data-excluir-modelo]');
    if (ex) {
      if (!confirm('Excluir este modelo?')) return;
      modelos = modelos.filter(m => m.id !== ex.dataset.excluirModelo);
      gravarLS(LS_MODELOS, modelos); renderMenuNovo();
      if (nuvemAtiva()) window.Sync.excluirModelo(ex.dataset.excluirModelo).catch(e => nuvemOk(false, e));
      return;
    }
    const item = e.target.closest('.menu-item, .menu-btn');
    if (!item) return;
    $painelNovo.style.display = 'none';
    if (item.dataset.acao === 'branco') {
      registrarNovo(novoProjeto(), true, 'branco');
    } else if (item.dataset.acao === 'modelos') {
      modelosFiltro = '';
      abrirModelos();
    } else if (item.dataset.acao === 'duplicar') {
      duplicarAtual();
    } else if (item.dataset.acao === 'baixar') {
      baixarHtmlAtual();
    } else if (item.dataset.acao === 'metricas') {
      abrirMetricas();
    } else if (item.dataset.acao === 'catalogo') {
      abrirCatalogo();
    } else if (item.dataset.acao === 'equipe') {
      abrirEquipe();
    } else if (item.dataset.acao === 'salvar-modelo') {
      salvarComoModelo();
    } else if (item.dataset.modelo) {
      const m = modelos.find(x => x.id === item.dataset.modelo);
      if (!m) return;
      const p = clonarProjeto(m.dados, true);
      registrarNovo(p, true, 'modelo: ' + m.nome);
      setStatus(`Projeto criado a partir do modelo "${m.nome}".`);
    }
  });
  function duplicarAtual() {
    const origem = projeto;
    registrarNovo(clonarProjeto(origem, true), true, 'duplicado');
    setStatus(`Cópia de "${origem.cliente || origem.docNum}" criada. Informe o novo cliente.`);
  }

  // ── Exportação ─────────────────────────────────────────────
  // Nome padronizado: BG-ME-25-0812_Rev00_Jardim-das-Acacias.pdf
  function nomeArquivoDe(p, ext) {
    const doc = (p.docNum && !/X/.test(p.docNum)) ? p.docNum.trim() : 'BG-ME';
    return `${doc}_Rev${p.revisao || '00'}_${slug(p.cliente)}.${ext}`;
  }
  function nomeArquivo(ext) { return nomeArquivoDe(projeto, ext); }

  document.getElementById('btn-pdf').addEventListener('click', () => {
    if (bloqueadoPorPendencias('O PDF')) return;
    const tituloAntigo = document.title;
    document.title = nomeArquivo('pdf').replace(/\.pdf$/, '');
    window.print();
    setTimeout(() => { document.title = tituloAntigo; }, 1000);
  });

  // Download em HTML autônomo (abre em qualquer navegador; imprime em A4)
  async function urlParaDataUri(url, larguraMax) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('arquivo não encontrado: ' + url);
    const blob = await resp.blob();
    const bruto = await new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.readAsDataURL(blob);
    });
    if (!larguraMax) return bruto;
    // Reduz a imagem (o logo repete em todas as páginas do HTML exportado)
    return await new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, larguraMax / img.width);
        if (escala === 1) { res(bruto); return; }
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        res(canvas.toDataURL('image/png'));
      };
      img.onerror = () => res(bruto);
      img.src = bruto;
    });
  }
  async function baixarHtml(p) {
      const logo = await urlParaDataUri('assets/begreen-logo-dark.png', 600);
      let corpo = folhasHtmlDe(p).split('assets/begreen-logo-dark.png').join(logo);
      for (const caminho of ['assets/ilustracoes/vaga-garagem-interna.jpg', 'assets/ilustracoes/quadro-geral-botao-desligamento.jpg']) {
        try { corpo = corpo.split(caminho).join(await urlParaDataUri(caminho, 1400)); } catch (e) { /* foto ausente: fica oculta */ }
      }
      const css = `
  body{margin:0;background:#e8e9e4;font-family:Montserrat,sans-serif;font-size:13px;color:#2E302D}
  *{box-sizing:border-box}
  .pagina{width:210mm;height:297mm;margin:0 auto 18px;padding:12mm 18mm;background:#fff;box-shadow:0 1px 4px rgba(27,28,27,.14);display:flex;flex-direction:column;overflow:hidden;position:relative}
  .pagina-header > div{margin-bottom:8mm}
  .pagina-corpo{flex:1 1 auto;min-height:0;width:174mm;display:flow-root;overflow:hidden}
  .pagina-footer > div{margin-top:8mm}
  @page{size:A4;margin:0}
  @media print{
    body{background:#fff}
    .pagina{margin:0;box-shadow:none;break-after:page;page-break-after:always}
    .pagina:last-child{break-after:auto;page-break-after:auto}
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }`;
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${nomeArquivoDe(p, 'html').replace(/\.html$/, '')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>${css}</style>
</head>
<body>
${corpo}
</body>
</html>`;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nomeArquivoDe(p, 'html');
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  async function baixarHtmlAtual() {
    if (bloqueadoPorPendencias('O HTML')) return;
    setStatus('Gerando documento…');
    try {
      await baixarHtml(projeto);
      setStatus('Documento baixado. Abra o arquivo em qualquer navegador e use Ctrl/Cmd+P para gerar o PDF.');
    } catch (err) {
      setStatus('⚠ Falha ao gerar o download: ' + err.message);
    }
  }

  // ── Painel de parâmetros recolhível ────────────────────────
  const LS_RECOLHIDO = 'begreen-parametros-recolhidos';
  function aplicarRecolhido(recolhido) {
    document.getElementById('main').classList.toggle('recolhido', recolhido);
    try { localStorage.setItem(LS_RECOLHIDO, recolhido ? '1' : '0'); } catch (e) { /* ignora */ }
  }
  document.getElementById('btn-recolher').addEventListener('click', () => aplicarRecolhido(true));
  document.getElementById('btn-expandir').addEventListener('click', () => aplicarRecolhido(false));
  aplicarRecolhido(localStorage.getItem(LS_RECOLHIDO) === '1');

  // ── Inicialização ──────────────────────────────────────────
  sincronizarCarregadores();
  renderTudo();
  atualizarProjetoAtual();
  atualizarGestor();
  setStatus('Pronto. Os dados são salvos automaticamente.');
  (async function iniciarSessao() {
    if (!window.Auth || !window.Auth.ativo) { carregarNuvem(); return; }
    const tipo = window.Auth.tratarLink();
    if (tipo === 'recovery') { mostrarLogin('nova-senha', 'Defina sua nova senha (mínimo 6 caracteres).'); return; }
    if (tipo) await window.Auth.carregarUsuario();
    const s = await window.Auth.garantirSessao();
    if (!s) { mostrarLogin('entrar'); return; }
    await aposLogin();
  })();
})();
