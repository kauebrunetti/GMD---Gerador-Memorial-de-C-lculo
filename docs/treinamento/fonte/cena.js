/* Demo: monta "cenas" da interface para captura de tela (?cena=menu|modelos|etapaN|combo|pendencias|recolhido|equipe|catalogo|metricas|doc:N) */
(function () {
  const q = new URLSearchParams(location.search); const cena = q.get('cena'); if (!cena) return;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const click = (sel) => { const el = document.querySelector(sel); if (el) el.click(); return !!el; };
  const etapa = async (n) => { click(`.etapa-pt[data-etapa="${n}"]`); await wait(200); };
  window.addEventListener('load', async () => {
    await wait(900);
    const m = /^etapa(\d+)$/.exec(cena);
    if (m) { await etapa(+m[1]); }
    else if (cena === 'menu') { click('#btn-novo'); }
    else if (cena === 'modelos') { click('#btn-novo'); await wait(150); click('[data-acao="modelos"]'); }
    else if (cena === 'catalogo') { click('#btn-novo'); await wait(150); click('[data-acao="catalogo"]'); }
    else if (cena === 'metricas') { click('#btn-novo'); await wait(150); click('[data-acao="metricas"]'); }
    else if (cena === 'equipe') { click('#btn-novo'); await wait(150); click('[data-acao="equipe"]'); }
    else if (cena === 'combo') { await etapa(5); const b = document.querySelector('.combo-btn'); b && b.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); }
    else if (cena === 'pendencias') {
      const el = document.querySelector('[data-chave="cliente"]'); if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }
      const a = document.querySelector('[data-chave="artExecucao"]'); if (a) { a.value = ''; a.dispatchEvent(new Event('input', { bubbles: true })); }
      await wait(600); click('.pend-head');
    }
    else if (cena === 'recolhido') { click('#btn-recolher'); }
    else if (cena.startsWith('doc:')) { click('#btn-recolher'); await wait(300); const n = +cena.slice(4); const pg = document.querySelectorAll('.pagina')[n - 1]; if (pg) pg.scrollIntoView({ block: 'start' }); }
    await wait(500); document.documentElement.setAttribute('data-cena-pronta', '1');
  });
})();
