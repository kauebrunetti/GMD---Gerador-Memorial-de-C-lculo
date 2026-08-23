/* ============================================================
   paginar.js — paginação fiel do memorial em folhas A4.

   As "folhas" do template são blocos lógicos (seções). Aqui cada
   folha é quebrada em blocos atômicos (parágrafos, quadros, tabelas,
   figuras), cada bloco é medido na largura real do corpo da página e
   os blocos são distribuídos em páginas de altura fixa, com cabeçalho
   e rodapé em todas. Regras:
     • um quadro/bloco nunca é dividido: se não cabe, vai inteiro para
       a página seguinte;
     • títulos (h2/h3 e rótulos curtos) ficam junto do bloco seguinte;
     • tabelas maiores que uma página inteira são divididas por linhas,
       repetindo o cabeçalho da tabela em cada parte;
     • a prévia e a impressão usam as mesmas páginas, por isso o PDF
       sai igual ao que aparece na tela.
   ============================================================ */
(function () {
  'use strict';

  const ID_MEDIDOR = 'medidor-paginas';

  function medidor() {
    let m = document.getElementById(ID_MEDIDOR);
    if (!m) {
      m = document.createElement('div');
      m.id = ID_MEDIDOR;
      m.setAttribute('aria-hidden', 'true');
      document.body.appendChild(m);
    }
    m.innerHTML = '';
    return m;
  }

  // Altura útil do corpo de uma página (297 mm menos margens, cabeçalho e rodapé)
  function capacidadeCorpo(m, headerHtml, footerHtml) {
    const pg = document.createElement('div');
    pg.className = 'pagina';
    pg.innerHTML = `<div class="pagina-header">${headerHtml}</div><div class="pagina-corpo"></div><div class="pagina-footer">${footerHtml}</div>`;
    m.appendChild(pg);
    const h = pg.querySelector('.pagina-corpo').getBoundingClientRect().height;
    m.removeChild(pg);
    return h;
  }

  // Um elemento é só "embrulho" quando é um div sem classe cujo estilo se
  // limita à fonte: seus filhos viram blocos independentes.
  function ehEmbrulho(el) {
    if (el.tagName !== 'DIV' || el.className) return false;
    const st = (el.getAttribute('style') || '').trim();
    return !st || /^font-family:[^;]*;?$/.test(st);
  }

  function blocosDeFolha(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    const out = [];
    const visitar = (no) => {
      if (no.nodeType === 3) {
        if (!no.textContent.trim()) return;
        const d = document.createElement('div');
        d.textContent = no.textContent;
        out.push(d);
        return;
      }
      if (no.nodeType !== 1) return;
      if (ehEmbrulho(no)) { Array.from(no.childNodes).forEach(visitar); return; }
      out.push(no);
    };
    Array.from(tpl.content.childNodes).forEach(visitar);
    return out;
  }

  // Título ou rótulo curto que deve ficar junto do bloco seguinte
  function mantemComProximo(el, altura) {
    if (/^H[1-4]$/.test(el.tagName)) return true;
    if (el.tagName === 'DIV') {
      if (Array.from(el.children).some(f => /^H[1-4]$/.test(f.tagName))) return true;
      if (altura <= 34 && el.children.length <= 1 && !el.querySelector('img, table, figure')) return true;
    }
    return false;
  }

  // Divide uma tabela em partes que caibam em [restante, cheia, cheia, ...],
  // repetindo o thead. Retorna null se não for possível dividir.
  function dividirTabela(tabela, restante, cheia) {
    const thead = tabela.querySelector(':scope > thead');
    const linhas = Array.from(tabela.querySelectorAll(':scope > tbody > tr'));
    if (linhas.length < 2) return null;
    const topo = tabela.getBoundingClientRect().top;
    const altThead = thead ? thead.getBoundingClientRect().height : 0;
    const fundo = linhas.map(tr => tr.getBoundingClientRect().bottom - topo);
    const partes = [];
    let inicio = 0;
    let limite = restante;
    while (inicio < linhas.length) {
      const base = inicio === 0 ? 0 : fundo[inicio - 1] - altThead;
      let fim = inicio;
      while (fim < linhas.length && fundo[fim] - base <= limite) fim++;
      if (fim - inicio < 2) {
        // não cabem nem duas linhas: pula para uma página cheia
        if (limite === cheia) { fim = Math.max(inicio + 1, fim); } else { limite = cheia; partes.push(null); continue; }
      }
      partes.push(linhas.slice(inicio, fim));
      inicio = fim;
      limite = cheia;
    }
    if (partes.filter(Boolean).length < 2) return null;
    return partes.map(grupo => {
      if (!grupo) return null;
      const t = tabela.cloneNode(false);
      Array.from(tabela.children).forEach(f => {
        if (f.tagName === 'TBODY') return;
        if (f.tagName === 'TFOOT') return;
        t.appendChild(f.cloneNode(true));
      });
      const tb = document.createElement('tbody');
      grupo.forEach(tr => tb.appendChild(tr.cloneNode(true)));
      t.appendChild(tb);
      return t;
    });
  }

  /**
   * paginar(folhas, headerHtml, footerFn) → HTML das páginas.
   *  folhas    : array de strings (blocos lógicos do template)
   *  headerHtml: cabeçalho repetido em toda página
   *  footerFn  : (num, total) → HTML do rodapé
   */
  function paginar(folhas, headerHtml, footerFn) {
    const m = medidor();
    const cheia = capacidadeCorpo(m, headerHtml, footerFn(1, 1));

    // Medição: todos os blocos dentro de um corpo com a largura real
    const corpoMed = document.createElement('div');
    corpoMed.className = 'pagina-corpo pagina-corpo-medicao';
    m.appendChild(corpoMed);
    const blocos = [];
    folhas.forEach((f, i) => {
      blocosDeFolha(f).forEach(el => { corpoMed.appendChild(el); blocos.push({ el, folha: i }); });
    });
    const topoMed = corpoMed.getBoundingClientRect().top;
    blocos.forEach(b => {
      const r = b.el.getBoundingClientRect();
      const cs = getComputedStyle(b.el);
      b.mt = parseFloat(cs.marginTop) || 0;
      b.mb = parseFloat(cs.marginBottom) || 0;
      b.top = r.top - topoMed;
      b.bottom = r.bottom - topoMed;
      b.altura = r.height;
      b.keep = mantemComProximo(b.el, r.height);
    });

    // Distribuição em páginas.
    //  ref   : coordenada do medidor equivalente ao topo da página atual (null = sem referência)
    //  usado : altura já ocupada na página atual
    const paginas = [[]];
    let ref = null, usado = 0;
    const pagAtual = () => paginas[paginas.length - 1];
    const novaPagina = () => { if (pagAtual().length) paginas.push([]); ref = null; usado = 0; };
    const alturaSe = (b) => (ref === null ? usado + b.mt + b.altura : b.bottom - ref);
    const colocar = (b) => {
      if (ref === null) ref = b.top - usado - b.mt;
      pagAtual().push(b.el);
      usado = b.bottom - ref;
    };

    for (let i = 0; i < blocos.length; i++) {
      const b = blocos[i];
      const prox = blocos[i + 1];
      // cada folha lógica (seção) começa em página nova
      if (i > 0 && b.folha !== blocos[i - 1].folha) novaPagina();

      // título ou rótulo: precisa caber junto com o bloco seguinte
      if (b.keep && prox) {
        const alturaDupla = alturaSe(b) + (prox.bottom - b.bottom);
        const proxCabeInteiro = prox.altura + prox.mt <= cheia + 0.5;
        if (alturaDupla > cheia + 0.5 && pagAtual().length && (proxCabeInteiro || prox.el.tagName !== 'TABLE')) novaPagina();
        colocar(b);
        continue;
      }

      if (alturaSe(b) <= cheia + 0.5) { colocar(b); continue; }

      // não cabe no espaço restante: se cabe numa página inteira, vai inteiro para a próxima
      if (b.altura + b.mt <= cheia + 0.5) { novaPagina(); colocar(b); continue; }

      // maior que uma página: tabela divide por linhas (repetindo o cabeçalho)
      if (b.el.tagName === 'TABLE') {
        const restante = pagAtual().length ? cheia - usado - b.mt : cheia;
        const partes = dividirTabela(b.el, Math.max(restante, 0), cheia);
        if (partes) {
          partes.forEach((t, k) => {
            if (t === null) { novaPagina(); return; }
            if (k > 0) novaPagina();
            pagAtual().push(t);
            if (k === partes.length - 1) {
              corpoMed.appendChild(t);
              usado = (pagAtual().length > 1 ? usado + b.mt : 0) + t.getBoundingClientRect().height + b.mb;
              corpoMed.removeChild(t);
              ref = null;
            }
          });
          continue;
        }
      }
      // outros blocos maiores que a página: página própria (o excedente fica cortado)
      novaPagina();
      colocar(b);
    }

    // Índice: número da página em que cada seção começa
    const pagDe = {};
    paginas.forEach((els, i) => els.forEach(el => {
      if (el.dataset && el.dataset.secKey) pagDe[el.dataset.secKey] = i + 1;
      if (el.querySelectorAll) el.querySelectorAll('[data-sec-key]').forEach(x => { if (!pagDe[x.dataset.secKey]) pagDe[x.dataset.secKey] = i + 1; });
    }));
    paginas.forEach(els => els.forEach(el => {
      if (el.querySelectorAll) el.querySelectorAll('[data-idx-pag]').forEach(x => { x.textContent = pagDe[x.dataset.idxPag] || ''; });
    }));

    // Montagem do HTML final
    const total = paginas.length;
    return paginas.map((els, i) => {
      const corpo = document.createElement('div');
      els.forEach(el => corpo.appendChild(el));
      return `<div class="pagina"><div class="pagina-header">${headerHtml}</div><div class="pagina-corpo">${corpo.innerHTML}</div><div class="pagina-footer">${footerFn(i + 1, total)}</div></div>`;
    }).join('');
  }

  window.Paginador = { paginar };
})();
