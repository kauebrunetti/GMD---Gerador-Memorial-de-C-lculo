/* ============================================================
   auth.js — login com Supabase Auth (e-mail + senha).
   Sessão guardada no navegador e renovada automaticamente.
   Só fala com o serviço de autenticação; quem decide se a
   pessoa pode usar o gerador é a lista memorial_usuarios (RLS).
   ============================================================ */
(function () {
  'use strict';
  const cfg = window.GMD_CONFIG || {};
  const LS = 'begreen-sessao';
  const base = () => cfg.supabaseUrl + '/auth/v1';

  let sessao = null;
  try { sessao = JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) { sessao = null; }

  function guardar(s) {
    sessao = s;
    try { if (s) localStorage.setItem(LS, JSON.stringify(s)); else localStorage.removeItem(LS); } catch (e) { /* ignora */ }
  }
  function normalizar(r) {
    if (!r || !r.access_token) return null;
    return {
      access_token: r.access_token,
      refresh_token: r.refresh_token || (sessao && sessao.refresh_token) || null,
      expires_at: Math.floor(Date.now() / 1000) + (Number(r.expires_in) || 3600),
      user: r.user || (sessao && sessao.user) || null,
    };
  }
  function traduzir(m) {
    const s = String(m || '');
    if (/invalid login credentials/i.test(s)) return 'E-mail ou senha incorretos.';
    if (/email not confirmed/i.test(s)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
    if (/already registered|already been registered/i.test(s)) return 'Este e-mail já tem conta. Use "Entrar" ou "Esqueci a senha".';
    if (/password should be at least|weak password/i.test(s)) return 'A senha precisa ter pelo menos 6 caracteres.';
    if (/for security purposes|rate limit|too many/i.test(s)) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
    if (/signups not allowed/i.test(s)) return 'Cadastro desativado no painel do Supabase (Authentication → Providers → Email).';
    if (/invalid refresh token|refresh_token_not_found/i.test(s)) return 'Sessão expirada. Entre novamente.';
    if (/unable to validate email|invalid email/i.test(s)) return 'E-mail inválido.';
    return s;
  }
  async function chamar(metodo, caminho, corpo, bearer) {
    const h = { apikey: cfg.supabaseKey, 'Content-Type': 'application/json' };
    if (bearer) h.Authorization = 'Bearer ' + bearer;
    const r = await fetch(base() + caminho, { method: metodo, headers: h, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
    const txt = await r.text();
    let dados = null;
    try { dados = txt ? JSON.parse(txt) : null; } catch (e) { dados = { msg: txt }; }
    if (!r.ok) {
      const m = (dados && (dados.msg || dados.error_description || dados.message || dados.error)) || ('erro ' + r.status);
      const e = new Error(traduzir(m));
      e.status = r.status;
      throw e;
    }
    return dados;
  }
  const redirect = () => encodeURIComponent(location.origin + location.pathname);

  const Auth = {
    ativo: !!(cfg.supabaseUrl && cfg.supabaseKey),
    token: () => (sessao && sessao.access_token) || null,
    usuario: () => (sessao && sessao.user) || null,
    email: () => (sessao && sessao.user && sessao.user.email) || '',

    async entrar(email, senha) {
      const r = await chamar('POST', '/token?grant_type=password', { email, password: senha });
      guardar(normalizar(r));
      return sessao;
    },
    // Primeiro acesso: a pessoa cria a própria senha. Se o projeto exigir
    // confirmação de e-mail, a sessão só vem depois do clique no link.
    async criarConta(email, senha, nome) {
      const r = await chamar('POST', '/signup?redirect_to=' + redirect(), { email, password: senha, data: { nome } });
      const s = normalizar(r);
      if (s) guardar(s);
      return { sessao: s, precisaConfirmar: !s };
    },
    async recuperarSenha(email) {
      await chamar('POST', '/recover?redirect_to=' + redirect(), { email });
    },
    async definirSenha(nova) {
      const u = await chamar('PUT', '/user', { password: nova }, Auth.token());
      if (u && sessao) { sessao.user = u; guardar(sessao); }
    },
    async carregarUsuario() {
      if (!sessao) return null;
      try { const u = await chamar('GET', '/user', undefined, Auth.token()); sessao.user = u; guardar(sessao); return u; } catch (e) { return null; }
    },
    async renovar() {
      if (!sessao || !sessao.refresh_token) return null;
      try {
        const r = await chamar('POST', '/token?grant_type=refresh_token', { refresh_token: sessao.refresh_token });
        guardar(normalizar(r));
        return sessao;
      } catch (e) {
        if (e.status === 400 || e.status === 401 || e.status === 403) guardar(null);
        return null;
      }
    },
    async garantirSessao() {
      if (!sessao) return null;
      const agora = Math.floor(Date.now() / 1000);
      if ((sessao.expires_at || 0) - agora < 120) return await Auth.renovar();
      return sessao;
    },
    async sair() {
      try { await chamar('POST', '/logout', {}, Auth.token()); } catch (e) { /* ignora */ }
      guardar(null);
    },
    // Links de e-mail (confirmação, recuperação) chegam com
    // #access_token=…&refresh_token=…&type=recovery|signup
    tratarLink() {
      const h = location.hash || '';
      if (!/access_token=/.test(h)) return null;
      const p = new URLSearchParams(h.replace(/^#/, ''));
      guardar(normalizar({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_in: Number(p.get('expires_in') || 3600) }));
      const tipo = p.get('type') || 'link';
      history.replaceState(null, '', location.pathname + location.search);
      return tipo;
    },
  };
  window.Auth = Auth;
})();
