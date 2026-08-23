/* ============================================================
   sync.js — acesso ao Supabase (REST) para o armazenamento
   compartilhado do time: projetos, modelos, configurações,
   numeração sem conflito e eventos para métricas.
   Sem conexão, o app continua funcionando com o cache local.
   ============================================================ */
(function () {
  'use strict';
  const cfg = window.GMD_CONFIG || {};
  const ativo = !!(cfg.supabaseUrl && cfg.supabaseKey);

  function cabecalhos(prefer) {
    const h = { apikey: cfg.supabaseKey, Authorization: 'Bearer ' + cfg.supabaseKey, 'Content-Type': 'application/json' };
    if (prefer) h.Prefer = prefer;
    return h;
  }
  async function req(metodo, caminho, corpo, prefer) {
    if (!ativo) throw new Error('nuvem desativada');
    const r = await fetch(cfg.supabaseUrl + '/rest/v1/' + caminho, {
      method: metodo, headers: cabecalhos(prefer),
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }
  const q = (v) => encodeURIComponent(v);

  window.Sync = {
    ativo,
    // projetos
    listarProjetos: () => req('GET', 'memorial_projetos?select=*&order=atualizado_em.desc'),
    listarResumoProjetos: () => req('GET', 'memorial_projetos?select=id,cliente,doc_num,gestor,status,pendencias,criado_em,atualizado_em,emitido_em&excluido=eq.false&order=criado_em.desc&limit=5000'),
    salvarProjeto: (linha) => req('POST', 'memorial_projetos', linha, 'resolution=merge-duplicates,return=minimal'),
    excluirProjeto: (id) => req('PATCH', `memorial_projetos?id=eq.${q(id)}`, { excluido: true, atualizado_em: new Date().toISOString() }, 'return=minimal'),
    // modelos
    listarModelos: () => req('GET', 'memorial_modelos?select=*&order=oficial.desc,ordem.asc,nome.asc'),
    salvarModelo: (linha) => req('POST', 'memorial_modelos', linha, 'resolution=merge-duplicates,return=minimal'),
    excluirModelo: (id) => req('DELETE', `memorial_modelos?id=eq.${q(id)}&oficial=eq.false`),
    // configurações compartilhadas (frases, fotos padrão, catálogo, gestores)
    lerConfig: () => req('GET', 'memorial_config?select=chave,valor'),
    gravarConfig: (chave, valor) => req('POST', 'memorial_config', { chave, valor, atualizado_em: new Date().toISOString() }, 'resolution=merge-duplicates,return=minimal'),
    // numeração BG-ME-AA-NNNN
    proximoNumero: (ano) => req('POST', 'rpc/memorial_proximo_numero', { p_ano: ano }),
    // eventos para métricas
    evento: (tipo, dados) => req('POST', 'memorial_eventos', Object.assign({ tipo }, dados || {}), 'return=minimal').catch(() => null),
    listarEventos: (desdeIso) => req('GET', `memorial_eventos?select=tipo,gestor,projeto_id,doc_num,criado_em,detalhes&criado_em=gte.${q(desdeIso)}&order=criado_em.desc&limit=5000`),
  };
})();
