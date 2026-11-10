/**
 * LECASU, LDA. - Sistema Financeiro ERP
 * Lógica de Negócio, Cálculos e Controladores de Ecrã (app.js)
 * Conforme especificação em agentes.md
 */

const $ = s => document.querySelector(s);
const nf = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Formatação Monetária Estrita: 232.000,00 MZN (ponto para milhar, vírgula para decimal, sufixo MZN)
const m = (v, withSuffix = true) => {
  if (v === null || v === undefined || isNaN(v)) return withSuffix ? "0,00 MZN" : "0,00";
  const formatted = nf.format(v);
  return withSuffix ? `${formatted} MZN` : formatted;
};

// Conversão de texto monetário para número (suporta 232.000,00 MZN, 232000, 232000.00, etc.)
function parseMoney(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  let s = String(val).replace(/MZN/gi, "").trim();
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  return parseFloat(s) || 0;
}


// Definições de Períodos Dinâmicos (Janeiro a Dezembro, Exercício por Exercício)
const MESES = [
  { id: "all", nome: "Ano Completo" },
  { id: "01", nome: "Janeiro" },
  { id: "02", nome: "Fevereiro" },
  { id: "03", nome: "Março" },
  { id: "04", nome: "Abril" },
  { id: "05", nome: "Maio" },
  { id: "06", nome: "Junho" },
  { id: "07", nome: "Julho" },
  { id: "08", nome: "Agosto" },
  { id: "09", nome: "Setembro" },
  { id: "10", nome: "Outubro" },
  { id: "11", nome: "Novembro" },
  { id: "12", nome: "Dezembro" }
];

const ANOS = ["2026", "2027", "2028", "2029", "2030", "2031", "2032"];

// Obtenção da data oficial em tempo real no fuso de Moçambique (Africa/Maputo, CAT: UTC+2)
function getRealTimeDate() {
  const now = new Date();
  const catFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Maputo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const isoDate = catFormatter.format(now);
  const [ano, mes, dia] = isoDate.split("-");
  const mesObj = MESES.find(m => m.id === mes) || { id: mes, nome: "Novembro" };
  return {
    now,
    isoDate,
    ano,
    mes,
    dia,
    mesNome: mesObj.nome,
    dataFormatada: `${dia}/${mes}/${ano}`
  };
}

function getActivePeriod() {
  if (!S || typeof S !== "object") {
    if (typeof loadData === "function") S = loadData();
    else S = {};
  }
  if (!S.config) S.config = {};
  const rt = getRealTimeDate();

  // Se o mês estiver em '09' (Setembro residual) ou sem seleção explícita nesta sessão, sincroniza para o mês actual
  if (S.config.mes === "09" && !S.config.userSessionSelected) {
    S.config.mes = rt.mes;
    S.config.exercicio = rt.ano;
  }

  const ano = S.config.exercicio || rt.ano;
  const mes = S.config.mes || rt.mes;
  const mesObj = MESES.find(m => m.id === mes) || MESES.find(m => m.id === rt.mes) || MESES[11];
  const isRealTime = (mes === rt.mes && ano === rt.ano);

  let refDate, dataFormatada, dataInicio, labelPeriodo;
  if (mes === "all") {
    refDate = `${ano}-12-31`;
    dataFormatada = `31/12/${ano}`;
    dataInicio = `01/01/${ano}`;
    labelPeriodo = `Exercício ${ano}`;
  } else if (isRealTime) {
    refDate = rt.isoDate;
    dataFormatada = rt.dataFormatada;
    dataInicio = `01/${mes}/${ano}`;
    labelPeriodo = `${mesObj.nome} de ${ano}`;
  } else {
    const lastDay = new Date(parseInt(ano, 10), parseInt(mes, 10), 0).getDate();
    refDate = `${ano}-${mes}-${String(lastDay).padStart(2, "0")}`;
    dataFormatada = `${String(lastDay).padStart(2, "0")}/${mes}/${ano}`;
    dataInicio = `01/${mes}/${ano}`;
    labelPeriodo = `${mesObj.nome} de ${ano}`;
  }

  return { ano, mes, mesNome: mesObj.nome, refDate, dataFormatada, dataInicio, labelPeriodo, isRealTime };
}

function syncHeaderPeriodSelector() {
  try {
    const selMes = document.getElementById("header-periodo-mes");
    const selAno = document.getElementById("header-periodo-ano");
    if (!selMes || !selAno) return;

    const P = getActivePeriod();
    const rt = getRealTimeDate();

    // Preenche opções de mês se vazio
    if (!selMes.options.length) {
      selMes.innerHTML = MESES.map(m => {
        const isCur = m.id === rt.mes;
        return `<option value="${m.id}">${m.nome}${isCur ? " (Atual)" : ""}</option>`;
      }).join("");
      selMes.addEventListener("change", (e) => {
        if (!S.config) S.config = {};
        S.config.mes = e.target.value;
        S.config.userSelectedPeriod = true;
        S.config.userSessionSelected = true;
        saveData();
        renderCurrentPage();
        toast(`Período alterado para: ${getActivePeriod().labelPeriodo}`);
      });
    }
    selMes.value = P.mes;

    // Preenche opções de ano se vazio
    if (!selAno.options.length) {
      selAno.innerHTML = ANOS.map(a => {
        const isCur = a === rt.ano;
        return `<option value="${a}">${a}${isCur ? " (Atual)" : ""}</option>`;
      }).join("");
      selAno.addEventListener("change", (e) => {
        if (!S.config) S.config = {};
        S.config.exercicio = e.target.value;
        S.config.userSelectedPeriod = true;
        S.config.userSessionSelected = true;
        saveData();
        renderCurrentPage();
        toast(`Exercício fiscal alterado para: ${getActivePeriod().labelPeriodo}`);
      });
    }
    selAno.value = P.ano;
  } catch (err) {
    console.error("Erro ao sincronizar seletor de período:", err);
  }
}

const d = s => s ? s.split("-").reverse().join("/") : "";
const r2 = x => Math.round((x + Number.EPSILON) * 100) / 100;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const T = c => S.ter.find(t => t.cod === c);
const P = c => (S.pc.find(p => p.cod === c) || {}).des || "";

const stc = {
  "Reconciliado": "ok",
  "Em trânsito": "wa",
  "Só no extracto": "er",
  "Por identificar": "er",
  "Liquidada": "ok",
  "Parcial": "wa",
  "Em aberto": "in",
  "Vencida": "er",
  "Activo": "ok",
  "Férias": "wa",
  "Licença": "in",
  "Rescindido": "er",
  "Novo": "ok",
  "Excelente": "ok",
  "Bom": "ok",
  "Razoável": "wa",
  "Regular": "wa",
  "Em Manutenção": "wa",
  "Avariado": "er",
  "Abatido": "er",
  "Cliente": "in",
  "Fornecedor": "wa",
  "Estado": "ok",
  "Sócio": "in",
  "Banco": "in",
  "Pessoal": "in",
  "Stock Normal": "ok",
  "Stock Baixo": "er"
};

const badge = t => `<span class="b ${stc[t] || "in"}">${esc(t)}</span>`;

// Cálculo de Facturas (Contas a Receber / Contas a Pagar)
function inv(L, k) {
  if (!Array.isArray(L)) return [];
  const movs = (S && Array.isArray(S.mov)) ? S.mov : [];
  return L.map(i => {
    const iva = r2((i.base || 0) * (i.rate || 0.16));
    const tot = r2((i.base || 0) + iva);
    const pd = r2(movs.filter(x => x.doc === i.no).reduce((a, x) => a + ((k === "ar" ? x.in : x.out) || 0), 0));
    const sal = r2(tot - pd);
    const P_act = getActivePeriod();
    const dias = sal > 0.005 ? Math.max(0, Math.round((new Date(P_act.refDate) - new Date(i.due)) / 864e5)) : 0;
    const st = sal <= 0.005 ? "Liquidada" : dias > 0 ? "Vencida" : pd > 0 ? "Parcial" : "Em aberto";
    return { ...i, iva, tot, pd, sal, dias, st };
  });
}

// Cálculo do Balancete e Reconciliação
function calc() {
  const P_act = getActivePeriod();
  const allMv = [...S.mov].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const isx = x => x.estado === "Só no extracto" || x.estado === "Por identificar";
  
  // Saldo inicial acumulado: parte de S.ini e soma todas as movimentações anteriores ao período ativo
  let bal = S.ini;
  const priorMv = allMv.filter(x => {
    if (!x.date || isx(x)) return false;
    if (P_act.mes === "all") return x.date < `${P_act.ano}-01-01`;
    return x.date < `${P_act.ano}-${P_act.mes}-01`;
  });
  for (const px of priorMv) {
    bal = r2(bal + (px.in || 0) - (px.out || 0));
  }

  // Filtragem dinâmica por período (Ano e Mês)
  const mv = allMv.filter(x => {
    if (!x.date) return true;
    if (P_act.mes === "all") return x.date.startsWith(P_act.ano);
    return x.date.startsWith(`${P_act.ano}-${P_act.mes}`);
  });

  const book = [];
  const ex = [];

  for (const x of mv) {
    if (isx(x)) {
      ex.push(x);
    } else {
      bal = r2(bal + (x.in || 0) - (x.out || 0));
      book.push({ ...x, bal });
    }
  }

  const s = (a, f, c) => r2(a.filter(c || (() => 1)).reduce((t, x) => t + (x[f] || 0), 0));
  const tr = x => x.estado === "Em trânsito";

  const cr = s(ex, "in");
  const db = s(ex, "out");
  const dep = s(book, "in", tr);
  const pag = s(book, "out", tr);
  const adj = r2(bal + cr - db);
  
  // Saldo bancário ajustado (reconciliação contábil)
  const hasExtInPeriod = ex.length > 0;
  const bankExt = (P_act.mes === "09") ? S.ext : (hasExtInPeriod ? S.ext : r2(adj - (dep - pag)));
  const bank = r2(bankExt + dep - pag);

  const ar = inv(S.ar, "ar");
  const ap = inv(S.ap, "ap");
  const op = a => a.filter(x => x.sal > 0.005);
  const sum = a => r2(a.reduce((t, x) => t + x.sal, 0));

  return {
    book,
    ex,
    tin: s(book, "in"),
    tout: s(book, "out"),
    contab: bal,
    cr,
    db,
    dep,
    pag,
    adj,
    bank,
    diff: r2(adj - bank),
    ar,
    ap,
    pa: sum(op(ap)),
    pr: sum(op(ar)),
    oa: op(ap),
    or: op(ar),
    liq: r2(adj + sum(op(ar)) - sum(op(ap)))
  };
}

// Helpers para Renderização de Tabelas com Linhas Verticais e Horizontais
const btnEdit = (k, id) => `<button class="btn-sm" data-a="edit" data-k="${k}" data-id="${esc(id)}" title="Editar registo"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>Editar</span></button>`;
const btnDel = (k, id) => `<button class="btn-sm del" data-a="del" data-k="${k}" data-id="${esc(id)}" title="Apagar registo"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg><span>Apagar</span></button>`;
const btns = (k, id) => `<td class="col-actions ac"><div class="actions-cell">${btnEdit(k, id)} ${btnDel(k, id)}</div></td>`;
const kpi = (l, v, c = "", s = "") => `<div class="k ${c}"><span>${l}</span><b>${v}</b>${s ? `<small>${s}</small>` : ""}</div>`;
const mrow = (x, bal) => {
  const t = T(x.terc);
  const c = x.in > 0 ? [S.bank, x.conta] : [x.conta, S.bank];
  return `<tr><td>${d(x.date)}</td><td class="w">${esc(x.desc)}</td><td>${esc(x.cat)}</td><td class="n">${x.in ? m(x.in) : ""}</td><td class="n">${x.out ? m(x.out) : ""}</td><td class="n">${bal ? m(x.bal) : "—"}</td><td>${esc(x.ref)}</td><td>${esc(x.tipo)}</td><td>${esc(x.conta)} <small>${esc(P(x.conta))}</small></td><td>${t ? esc(t.nome) + "<br><small>NUIT " + esc(t.nuit) + "</small>" : ""}</td><td>${esc(x.doc)}</td><td>${d(x.ext)}</td><td>${badge(x.estado)}</td><td>${esc(c[0])}</td><td>${esc(c[1])}</td>${btns("mov", x.id)}</tr>`;
};
const MH = ["Data", "Descrição", "Categoria", "Entrada (MZN)", "Saída (MZN)", "Saldo (MZN)", "REF.", "Tipo de movimento", "Conta contrapartida", "Terceiro", "Nº Documento", "Data no extracto", "Estado reconciliação", "Conta débito", "Conta crédito", "Ações"];
const head = (H, nc) => "<tr>" + H.map((h, i) => {
  const isLastAction = i === H.length - 1 && (h === "Ações" || h === "" || h === "Acoes" || h === "Acções");
  const cls = [
    nc && nc.includes(h) ? "n" : "",
    isLastAction ? "col-actions ac" : ""
  ].filter(Boolean).join(" ");
  return `<th class="${cls}">${h || "Ações"}</th>`;
}).join("") + "</tr>";
const sc = h => `<div class="sc"><table>${h}</table></div>`;
const row = (l, v, c) => `<tr${c ? ' class="t"' : ""}><td class="w">${l}</td><td class="n">${v}</td></tr>`;
const card = (t, b) => `<div class="cd"><h3>${t}</h3>${b}</div>`;
const bars = (a, c) => {
  const mx = Math.max(...a.map(x => x[1]), 1);
  return a.map(([l, v]) => `<div class="br"><span>${esc(l)}</span><i><u style="width:${(v / mx) * 100}%;background:${c}"></u></i><b>${m(v)}</b></div>`).join("");
};

const BK = [
  ["Não vencido", x => x.dias === 0],
  ["1 a 30 dias", x => x.dias >= 1 && x.dias <= 30],
  ["31 a 60 dias", x => x.dias >= 31 && x.dias <= 60],
  ["61 a 90 dias", x => x.dias >= 61 && x.dias <= 90],
  ["Mais de 90 dias", x => x.dias > 90]
];

// Views de Conteúdo: Dashboard
function renderDashboardView(R) {
  if (!R) R = calc();
  const P_act = getActivePeriod();
  const ok = Math.abs((R && R.diff) || 0) < 0.01;
  const cats = {};
  ((R && R.book) || []).concat((R && R.ex) || []).forEach(x => {
    if (x.out) cats[x.cat] = r2((cats[x.cat] || 0) + x.out);
  });
  const ag = L => BK.map(([l, f]) => [l, r2(((L || []).filter(f)).reduce((s, x) => s + (x.sal || 0), 0))]);
  const orList = (R && R.or) || [];
  const oaList = (R && R.oa) || [];
  const prox = [...orList.map(x => ({ ...x, k: "A receber" })), ...oaList.map(x => ({ ...x, k: "A pagar" }))].sort((a, b) => (a.due < b.due ? -1 : 1));
  const venc = orList.filter(x => x.st === "Vencida").length + oaList.filter(x => x.st === "Vencida").length;
  const totStockVal = ((S && S.materia) || []).reduce((a, x) => a + ((x.qtd || 0) * (x.custo || 0)), 0);
  const totAtivosVal = ((S && S.ativos) || []).reduce((a, x) => a + ((parseFloat(x.qtd) || 1) * (parseFloat(x.valor_unitario) || 0)), 0);
  const totColabs = ((S && S.rh) || []).length;

  return `
    <div class="kpis">
      ${kpi("Saldo contabilístico ajustado", m(R.adj))}
      ${kpi("Saldo bancário ajustado", m(R.bank))}
      ${kpi("Diferença de reconciliação", m(R.diff), ok ? "" : "er", ok ? "Reconciliado (OK)" : "Divergência detetada")}
      ${kpi("A receber em aberto", m(R.pr), "", `${R.or.length} facturas`)}
      ${kpi("A pagar em aberto", m(R.pa), "er", `${R.oa.length} facturas`)}
      ${kpi("Saldo líquido", m(R.liq), "", `${venc} factura(s) vencida(s)`)}
    </div>

    <!-- Gráficos Visuais do Dashboard: Linha & Pizza -->
    <div class="dashboard-charts-grid">
      <div class="cd chart-card">
        <div class="chart-header">
          <div>
            <h3>Evolução de Fluxo – Entradas vs. Saídas (${P_act.labelPeriodo})</h3>
            <small>Movimentações diárias ao longo do mês</small>
          </div>
          <div class="chart-legend-custom">
            <span class="legend-pill" style="--c:#fe8100">Entradas</span>
            <span class="legend-pill" style="--c:#18202f">Saídas</span>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="chart-fluxo-linha"></canvas>
        </div>
      </div>

      <div class="cd chart-card">
        <div class="chart-header">
          <div>
            <h3>Saídas por Categoria (${P_act.labelPeriodo})</h3>
            <small>Distribuição percentual das despesas</small>
          </div>
        </div>
        <div class="chart-container chart-container-pie">
          <canvas id="chart-despesas-pizza"></canvas>
        </div>
      </div>
    </div>

    <div class="grid2" style="margin-top:14px">
      ${card("Estado dos movimentos", EST.map(e => `<div class="ln">${badge(e)}<b>${S.mov.filter(x => x.estado === e).length}</b></div>`).join("") + `<div class="ln"><span>Depósitos em trânsito</span><b>${m(R.dep)}</b></div><div class="ln"><span>Pagamentos em trânsito</span><b>${m(R.pag)}</b></div>`)}
      ${card("Antiguidade – Contas a receber", bars(ag(R.ar), "#fe8100"))}
      ${card("Antiguidade – Contas a pagar", bars(ag(R.ap), "#b42318"))}
      ${card("Património & Activos LECASU", `
        <div class="ln"><span>Meios Monetários / Bancos</span><b>${m(R.adj)}</b></div>
        <div class="ln"><span>Facturas a Receber (Clientes)</span><b>${m(R.pr)}</b></div>
        <div class="ln"><span>Facturas a Pagar (Fornecedores)</span><b>${m(R.pa)}</b></div>
        <div class="ln"><span>Materiais & Stock em Armazém</span><b>${m(totStockVal)}</b></div>
        <div class="ln"><span>Activos Imobilizados / Equipamentos</span><b>${m(totAtivosVal)}</b></div>
        <div class="ln"><span>Quadro de Pessoal (RH)</span><b>${totColabs} Colaboradores</b></div>
      `)}
    </div>
    <h2>Facturas em aberto por vencimento</h2>
    ${sc(head(["Tipo", "Documento", "Terceiro", "Saldo em aberto", "Vencimento", "Dias em atraso", "Estado"], ["Saldo em aberto", "Dias em atraso"]) + (prox.map(x => `<tr><td>${badge(x.k).replace(/class="b [a-z]+"/, `class="b ${x.k === "A pagar" ? "wa" : "in"}"`)}</td><td>${esc(x.no)}</td><td>${esc((T(x.terc) || {}).nome)}</td><td class="n">${m(x.sal)}</td><td>${d(x.due)}</td><td class="n">${x.dias}</td><td>${badge(x.st)}</td></tr>`).join("") || '<tr><td colspan="7"><small>Sem facturas em aberto.</small></td></tr>'))}
  `;
}

// Views de Conteúdo: Reconciliação Bancária
function recTab(R) {
  const P_act = getActivePeriod();
  const ok = Math.abs(R.diff) < 0.01;
  const q = searchQ.trim().toLowerCase();
  const filterMv = (arr) => q ? arr.filter(x => (x.ent + " " + (x.ref || "") + " " + (x.desc || "") + " " + (x.cat || "")).toLowerCase().includes(q)) : arr;
  const filteredBook = filterMv(R.book || []);
  const filteredEx = filterMv(R.ex || []);
  const pend = (a, t) => sc(head(["Nº Documento", "Terceiro", "Estado", "Saldo em aberto", "Vencimento"], ["Saldo em aberto"]) + a.map(x => `<tr><td>${esc(x.no)}</td><td>${esc((T(x.terc) || {}).nome)}</td><td>${badge(x.st)}</td><td class="n">${m(x.sal)}</td><td>${d(x.due)}</td></tr>`).join("") + `<tr class="t"><td colspan="3">${t}</td><td class="n">${m(a.reduce((s, x) => s + x.sal, 0))}</td><td></td></tr>`);

  return `
    <div class="kpis">
      ${kpi("Saldo contabilístico ajustado", m(R.adj))}
      ${kpi("Saldo bancário ajustado", m(R.bank))}
      ${kpi("Diferença de reconciliação", m(R.diff), ok ? "ok" : "er", ok ? "Reconciliado (OK)" : "Divergência detetada")}
      ${kpi("Total Entradas no Mês", m(R.tin), "in")}
      ${kpi("Total Saídas no Mês", m(R.tout), "wa")}
      ${kpi("Saldo líquido", m(R.liq))}
    </div>

    <!-- Contas Bancárias Oficiais LECASU -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:14px 0">
      ${(S.bank || []).map(b => `
        <div class="cd" style="padding:12px 14px;border-left:4px solid var(--ac)">
          <div style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase">${esc(b.nome)}</div>
          <div style="font-size:18px;font-weight:700;margin:4px 0;color:var(--tx)">${m(b.saldo || 0)}</div>
          <div style="font-size:11.5px;color:var(--mu)">Conta: <code>${esc(b.num || "—")}</code> · ${esc(b.moeda || "MZN")}</div>
        </div>
      `).join("")}
    </div>

    ${sc(head(MH, ["Entrada (MZN)", "Saída (MZN)", "Saldo (MZN)"]) + filteredBook.map(x => mrow(x, 1)).join("") + `<tr class="t"><td></td><td>Total do mês</td><td></td><td class="n">${m(R.tin)}</td><td class="n">${m(R.tout)}</td><td class="n">${m(R.contab)}</td><td colspan="9"></td><td class="col-actions ac"></td></tr>`)}
    <h2>Movimentos no extracto ainda não registados na contabilidade (a lançar no ERP)</h2>
    ${sc(head(MH, ["Entrada (MZN)", "Saída (MZN)", "Saldo (MZN)"]) + (filteredEx.map(x => mrow(x, 0)).join("") || '<tr><td colspan="16"><small>Sem movimentos.</small></td></tr>'))}
    <h2>Reconciliação bancária – ${P_act.dataFormatada}</h2>
    <div class="recon-compare-grid">
      <!-- Lado Esquerdo: Livro Razão Contabilístico -->
      <div class="recon-side-box">
        <div class="recon-side-header">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <b>1. Ajuste do Saldo Contabilístico (Livro Razão)</b>
        </div>
        ${sc(
          head(["Descrição da Operação Contabilística", "Valor (MZN)"], ["Valor (MZN)"]) +
          row(`Saldo contabilístico inicial (${P_act.dataInicio})`, `<input type="text" data-f="ini" class="money-input" placeholder="0,00 MZN" value="${m(S.ini)}">`) +
          row(`Saldo contabilístico em ${P_act.dataFormatada} (antes de ajustes)`, m(R.contab)) +
          row("(+) Créditos no extracto ainda não registados", m(R.cr)) +
          row("(−) Débitos no extracto ainda não registados", m(R.db)) +
          row("Saldo contabilístico ajustado", m(R.adj), 1)
        )}
      </div>

      <!-- Lado Direito: Extracto Bancário -->
      <div class="recon-side-box">
        <div class="recon-side-header">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <b>2. Ajuste do Saldo Bancário (Extracto Bancário)</b>
        </div>
        ${sc(
          head(["Descrição da Operação Bancária", "Valor (MZN)"], ["Valor (MZN)"]) +
          row(`Saldo segundo o extracto bancário em ${P_act.dataFormatada}`, `<input type="text" data-f="ext" class="money-input" placeholder="0,00 MZN" value="${m(S.ext)}">`) +
          row("(+) Depósitos em trânsito (na contabilidade, ainda não no banco)", m(R.dep)) +
          row("(−) Pagamentos em trânsito (emitidos, ainda não debitados)", m(R.pag)) +
          row("Saldo bancário ajustado", m(R.bank), 1)
        )}
      </div>
    </div>

    <!-- Comparação / Resumo da Reconciliação dos Dois Lados -->
    <div class="recon-summary-card ${ok ? "recon-ok" : "recon-er"}">
      <div class="recon-summary-details">
        <span class="recon-status-badge ${ok ? "ok" : "er"}">
          ${ok ? "CONCILIADO COM SUCESSO" : "DIVERGÊNCIA A VERIFICAR"}
        </span>
        <div class="recon-summary-values">
          <span>Saldo Contabilístico Ajustado: <b>${m(R.adj)}</b></span>
          <span class="recon-equal-sign">=</span>
          <span>Saldo Bancário Ajustado: <b>${m(R.bank)}</b></span>
        </div>
      </div>
      <div class="recon-diff-block">
        <span class="recon-diff-label">Diferença (deve ser zero):</span>
        <b class="recon-diff-val">${m(R.diff)}</b>
        <span class="b ${ok ? "ok" : "er"}">${ok ? "0,00 MZN OK" : "VERIFICAR"}</span>
      </div>
    </div>
    <h2>Pendentes implementação – Contas a Pagar em aberto</h2>
    ${pend(R.oa, "TOTAL Obrigações (Pendentes Implementação)")}
    <h2>Pendentes entradas – Contas a Receber em aberto</h2>
    ${pend(R.or, "TOTAL Pendentes Entradas")}
  `;
}

// Views de Conteúdo: Facturas (AR e AP)
function invTab(k, L) {
  const ar = k === "ar";
  const sum = f => m(L.reduce((s, x) => s + x[f], 0));
  const H = [
    ar ? "Nº Factura" : "Nº Factura Fornecedor",
    ar ? "Data emissão" : "Data factura",
    ar ? "Cód. Cliente" : "Cód. Fornecedor",
    ar ? "Cliente" : "Fornecedor",
    "NUIT",
    "Conta",
    "Descrição",
    "Valor s/ IVA (MZN)",
    "Taxa IVA",
    "IVA (MZN)",
    "Total (MZN)",
    ar ? "Recebido (MZN)" : "Pago (MZN)",
    "Saldo em aberto (MZN)",
    "Data vencimento",
    "Dias em atraso",
    "Estado",
    ""
  ];
  const N = ["Valor s/ IVA (MZN)", "IVA (MZN)", "Total (MZN)", H[11], "Saldo em aberto (MZN)", "Dias em atraso"];

  return `

    ${sc(head(H, N) + L.map(x => {
      const t = T(x.terc) || {};
      return `<tr><td>${esc(x.no)}</td><td>${d(x.date)}</td><td>${esc(x.terc)}</td><td>${esc(t.nome)}</td><td>${esc(t.nuit)}</td><td>${esc(x.conta)}</td><td class="w">${esc(x.desc)}</td><td class="n">${m(x.base)}</td><td class="n">${Math.round(x.rate * 100)}%</td><td class="n">${m(x.iva)}</td><td class="n">${m(x.tot)}</td><td class="n">${m(x.pd)}</td><td class="n">${m(x.sal)}</td><td>${d(x.due)}</td><td class="n">${x.dias}</td><td>${badge(x.st)}</td>${btns(k, x.id)}</tr>`;
    }).join("") + `<tr class="t"><td colspan="7">TOTAL</td><td class="n">${sum("base")}</td><td></td><td class="n">${sum("iva")}</td><td class="n">${sum("tot")}</td><td class="n">${sum("pd")}</td><td class="n">${sum("sal")}</td><td colspan="3"></td><td class="col-actions ac"></td></tr>`)}
    <h2>Antiguidade dos saldos em aberto</h2>
    ${sc(head(["Escalão de Antiguidade", "Saldo em Aberto (MZN)"], ["Saldo em Aberto (MZN)"]) + BK.map(([l, f]) => row(l, m(L.filter(f).reduce((s, x) => s + x.sal, 0)))).join("") + row("Total (controlo)", m(L.reduce((s, x) => s + x.sal, 0)), 1))}
  `;
}

// Views de Conteúdo: Terceiros
function terTab() {
  const q = searchQ.trim().toLowerCase();
  const list = q ? S.ter.filter(t => (t.cod + " " + t.nome + " " + t.tipo + " " + t.nuit + " " + t.prov).toLowerCase().includes(q)) : S.ter;
  return `

    ${sc(head(["Código", "Nome / Designação", "Tipo", "NUIT", "Conta por defeito", "Província", ""]) + list.map(t => `<tr><td>${esc(t.cod)}</td><td>${esc(t.nome)}</td><td>${esc(t.tipo)}</td><td>${esc(t.nuit)}</td><td>${esc(t.conta)}</td><td>${esc(t.prov)}</td>${btns("ter", t.id)}</tr>`).join(""))}
  `;
}

// Views de Conteúdo: Plano de Contas
let searchQ = "";
function pcTab() {
  const f = searchQ.toLowerCase();
  const L = S.pc.filter(p => !f || (p.cod + " " + p.des).toLowerCase().includes(f));
  return `

    ${sc(head(["Código", "Designação", "Nível", "Tipo", "Origem", ""]) + L.map(p => `<tr><td>${esc(p.cod)}</td><td>${esc(p.des)}</td><td>${esc(p.niv)}</td><td>${esc(p.tipo)}</td><td>${esc(p.orig)}</td>${btns("pc", p.id)}</tr>`).join(""))}
  `;
}

// Abas do Módulo Financeiro
const TABS = [
  ["rec", "Reconciliação bancária"],
  ["ar", "Contas a Receber"],
  ["ap", "Contas a Pagar"],
  ["ter", "Terceiros"],
  ["pc", "Plano de Contas"]
];

let activeTab = "rec";

// Modais e Formulários de Edição / Criação com Placeholders Obrigatórios
const pcO = () => S.pc.map(p => [p.cod, p.cod + " – " + p.des]);
const tO = t => [["", "— sem terceiro —"], ...S.ter.filter(x => !t || x.tipo === t).map(x => [x.cod, x.cod + " – " + x.nome])];

const invF = t => [
  { k: "no", l: "Nº Factura", t: "text", r: 1, p: "Ex: FT 2026/047 ou ST-8840" },
  { k: "date", l: "Data", t: "date", r: 1, p: "AAAA-MM-DD" },
  { k: "terc", l: t, t: "select", o: tO(t).slice(1), w: 1, r: 1 },
  { k: "conta", l: "Conta", t: "select", o: pcO() },
  { k: "rate", l: "Taxa IVA", t: "select", o: [[0.16, "16% (taxa normal)"], [0, "0% (isento)"]] },
  { k: "desc", l: "Descrição", t: "text", w: 1, p: "Ex: Fornecimento de equipamentos solares" },
  { k: "base", l: "Valor s/ IVA (MZN)", t: "number", r: 1, p: "0.00" },
  { k: "due", l: "Data vencimento", t: "date", r: 1, p: "AAAA-MM-DD" }
];

const SC = {
  mov: () => [
    { k: "date", l: "Data", t: "date", r: 1, p: "AAAA-MM-DD" },
    { k: "desc", l: "Descrição", t: "text", w: 1, r: 1, p: "Ex: Recebimento FT 2026/041 – Pousada Maré Alta" },
    { k: "cat", l: "Categoria", t: "select", o: CAT },
    { k: "tipo", l: "Tipo de movimento", t: "select", o: TIPO },
    { k: "in", l: "Entrada (MZN)", t: "number", p: "0.00" },
    { k: "out", l: "Saída (MZN)", t: "number", p: "0.00" },
    { k: "ref", l: "REF.", t: "text", p: "Ex: TRF-IN-0903 ou POS-0912" },
    { k: "doc", l: "Nº Documento", t: "text", p: "Ex: FT 2026/041 ou ST-8812" },
    { k: "conta", l: "Conta contrapartida (PGC-NIRF)", t: "select", o: pcO(), w: 1, r: 1 },
    { k: "terc", l: "Terceiro", t: "select", o: tO(), w: 1 },
    { k: "ext", l: "Data no extracto", t: "date", p: "AAAA-MM-DD" },
    { k: "estado", l: "Estado reconciliação", t: "select", o: EST }
  ],
  ar: () => invF("Cliente"),
  ap: () => invF("Fornecedor"),
  ter: () => [
    { k: "cod", l: "Código", t: "text", r: 1, p: "Ex: CLI-006 ou FOR-008" },
    { k: "nome", l: "Nome / Designação", t: "text", r: 1, p: "Ex: SolarTech Moçambique, Lda." },
    { k: "tipo", l: "Tipo", t: "select", o: ["Cliente", "Fornecedor", "Estado", "Sócio", "Banco", "Pessoal", "Outro"] },
    { k: "nuit", l: "NUIT", t: "text", p: "Ex: 400123451 ou 500345673" },
    { k: "conta", l: "Conta por defeito", t: "select", o: pcO() },
    { k: "prov", l: "Província / Cidade", t: "text", p: "Ex: Maputo, Matola, Gaza, Inhambane..." },
    { k: "contacto", l: "Telefone / Contacto", t: "text", p: "Ex: +258 84 123 4567" },
    { k: "email", l: "Email", t: "text", p: "Ex: contacto@empresa.co.mz" }
  ],
  pc: () => [
    { k: "cod", l: "Código", t: "text", r: 1, p: "Ex: 63.6 ou 12.1.3" },
    { k: "des", l: "Designação", t: "text", r: 1, w: 1, p: "Ex: Subscrições de software na nuvem" },
    { k: "niv", l: "Nível", t: "select", o: ["Classe", "Conta", "Subconta", "Movimento"] },
    { k: "tipo", l: "Tipo", t: "select", o: ["Balanço", "Resultados"] },
    { k: "orig", l: "Origem", t: "select", o: ["PGC-NIRF", "Interna LECASU"] }
  ],
  materia: () => [
    { k: "cod", l: "Código do Produto", t: "text", r: 1, p: "Ex: MAT-007" },
    { k: "nome", l: "Nome / Descrição do Produto", t: "text", r: 1, w: 1, p: "Ex: Painel Solar 550W Tier-1" },
    { k: "cat", l: "Categoria", t: "select", o: ["Painéis Solares", "Baterias", "Inversores", "Cabos", "Estruturas", "Acessórios", "Ferramentas", "Outros"] },
    { k: "unidade", l: "Unidade de Medida", t: "select", o: ["un", "m", "kg", "kit", "cx", "l"] },
    { k: "qtd", l: "Quantidade em Stock", t: "number", r: 1, p: "0" },
    { k: "custo", l: "Custo Unitário (MZN)", t: "number", r: 1, p: "0.00" },
    { k: "preco", l: "Preço de Venda (MZN)", t: "number", p: "0.00" },
    { k: "min", l: "Stock Mínimo (Alerta)", t: "number", p: "5" },
    { k: "forn", l: "Fornecedor Habitual", t: "select", o: S.ter.filter(t => t.tipo === "Fornecedor").map(t => [t.cod, `${t.cod} – ${t.nome}`]) }
  ],
  rh: () => [
    { k: "cod", l: "Código do Colaborador", t: "text", r: 1, p: "Ex: COL-005" },
    { k: "nome", l: "Nome Completo", t: "text", r: 1, w: 1, p: "Ex: Amélia Zimba" },
    { k: "cargo", l: "Cargo / Função", t: "text", r: 1, p: "Ex: Técnica Instaladora Solar" },
    { k: "dept", l: "Departamento", t: "select", o: ["Engenharia & Obra", "Operações & Campo", "Administração & Finanças", "Comercial & Vendas", "Direcção"] },
    { k: "salario", l: "Salário Base Mensal (MZN)", t: "number", r: 1, p: "0.00" },
    { k: "nuit", l: "NUIT", t: "text", p: "Ex: 109876543" },
    { k: "bi", l: "Nº BI / Identificação", t: "text", p: "Ex: 110100987654A" },
    { k: "data_adm", l: "Data de Admissão", t: "date", r: 1, p: "AAAA-MM-DD" },
    { k: "estado", l: "Estado do Colaborador", t: "select", o: ["Activo", "Férias", "Licença", "Rescindido"] },
    { k: "contacto", l: "Telefone", t: "text", p: "Ex: +258 84 999 8888" },
    { k: "email", l: "Email Institucional", t: "text", p: "Ex: colaborador@lecasu.co.mz" }
  ],
  ativos: () => [
    { k: "cod", l: "Código do Bem *", t: "text", r: 1, p: "Ex: LEC-INF-012, LEC-MOB-013" },
    { k: "nome", l: "Descrição do Bem *", t: "text", r: 1, w: 1, p: "Ex: Cadeira de escritorio, Mesa para duas pessoas" },
    { k: "cat", l: "Categoria", t: "select", o: ["Equipamento informático", "Mobiliário", "Ferramentas", "Equipamento de medição", "Stock solar/eléctrico", "Viaturas", "EPI", "Outros"] },
    { k: "marca", l: "Marca / Modelo", t: "text", p: "Ex: N/A, Depoint, DEFY, Dell, Apple" },
    { k: "serie", l: "Nº de Série", t: "text", p: "Ex: JJ848B, JJ-HZ1023A, 2162, N/A" },
    { k: "qtd", l: "Quantidade *", t: "number", r: 1, p: "1" },
    { k: "unidade", l: "Unidade", t: "text", p: "un" },
    { k: "localizacao", l: "Localização", t: "text", p: "Ex: Escritório, Armazém, Obra" },
    { k: "responsavel", l: "Utilizador / Responsável", t: "text", p: "Ex: N/A ou nome do colaborador" },
    { k: "data_aquisicao", l: "Data de Aquisição *", t: "date", r: 1, p: "AAAA-MM-DD" },
    { k: "valor_unitario", l: "Valor Unitário (MZN) *", t: "number", r: 1, p: "0.00" },
    { k: "fornecedor", l: "Fornecedor", t: "text", p: "Ex: Home Store, Lda, Ifresh, Lda, Nabil" },
    { k: "factura", l: "Factura nº", t: "text", p: "Ex: 6089, 339, 621, 965895" },
    { k: "estado", l: "Estado do Bem", t: "select", o: ["Novo", "Bom", "Razoável", "Avariado", "Abatido"] },
    { k: "ultima_verif", l: "Última Verificação", t: "date", p: "AAAA-MM-DD" },
    { k: "obs", l: "Observações", t: "text", w: 1, p: "Observações adicionais sobre o bem" }
  ]
};

const LST = {
  mov: () => S.mov,
  ar: () => S.ar,
  ap: () => S.ap,
  ter: () => S.ter,
  pc: () => S.pc,
  materia: () => S.materia,
  rh: () => S.rh,
  ativos: () => S.ativos
};

const TT = {
  mov: "movimento",
  ar: "factura de cliente",
  ap: "factura de fornecedor",
  ter: "terceiro (cliente / fornecedor)",
  pc: "conta",
  materia: "material / produto",
  rh: "colaborador",
  ativos: "bem / ativo do inventário"
};

const DEF = {
  mov: () => ({ date: getActivePeriod().refDate, estado: "Reconciliado", cat: CAT[0], tipo: TIPO[0], conta: "41.1", in: 0, out: 0 }),
  ar: () => ({ date: getActivePeriod().refDate, due: getActivePeriod().refDate, conta: "41.1", rate: 0.16, base: 0 }),
  ap: () => ({ date: getActivePeriod().refDate, due: getActivePeriod().refDate, conta: "42.1", rate: 0.16, base: 0 }),
  ter: () => ({ tipo: "Cliente", conta: "41.1" }),
  pc: () => ({ niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" }),
  materia: () => ({ cat: "Painéis Solares", unidade: "un", qtd: 0, custo: 0, preco: 0, min: 5, forn: "FOR-001" }),
  rh: () => ({ dept: "Engenharia & Obra", salario: 25000, estado: "Activo", data_adm: new Date().toISOString().slice(0, 10) }),
  ativos: () => ({ cod: "LEC-INF-012", nome: "", cat: "Mobiliário", marca: "N/A", serie: "N/A", qtd: 1, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: new Date().toISOString().slice(0, 10), valor_unitario: 0, fornecedor: "Home Store, Lda", factura: "", estado: "Bom", ultima_verif: new Date().toISOString().slice(0, 10), obs: "" })
};

let cur = null;

function field(f, v, ed) {
  const i = "f_" + f.k;
  let h;
  if (f.t === "select") {
    h = `<select id="${i}">${f.o.map(o => {
      const [a, b] = Array.isArray(o) ? o : [o, o];
      return `<option value="${esc(a)}"${String(a) === String(v ?? "") ? " selected" : ""}>${esc(b)}</option>`;
    }).join("")}</select>`;
  } else {
    const pl = f.p ? `placeholder="${esc(f.p)}"` : "";
    h = `<input id="${i}" type="${f.t}" ${f.t === "number" ? 'step="0.01" min="0"' : ""} ${pl} value="${esc(f.t === "number" && !v ? "" : v ?? "")}"${f.k === "cod" && ed ? " disabled" : ""}>`;
  }
  return `<label class="${f.w ? "full" : ""}">${f.l}${f.r ? " *" : ""}${h}</label>`;
}

function openF(k, id) {
  const rec = id ? LST[k]().find(x => x.id === id) : DEF[k]();
  cur = { k, id };
  $("#dt").textContent = (id ? "Editar " : "Novo ") + TT[k];
  $("#df").innerHTML = SC[k]().map(f => field(f, rec[f.k], id)).join("");
  $("#dlg").showModal();
}

function submitForm() {
  const { k, id } = cur;
  const fs = SC[k]();
  const o = {};

  fs.forEach(f => {
    let v = $("#f_" + f.k).value.trim();
    if (f.t === "number") v = v ? parseFloat(v) : 0;
    if (f.k === "rate") v = parseFloat(v);
    o[f.k] = v;
  });

  for (const f of fs) {
    if (f.r && !o[f.k] && o[f.k] !== 0) return toast("Preencha: " + f.l);
  }

  const L = LST[k]();
  if (k === "mov" && ((o.in > 0) === (o.out > 0))) return toast("Preencha apenas Entrada ou apenas Saída (valor positivo).");
  if ((k === "ar" || k === "ap") && o.base <= 0) return toast("O valor s/ IVA tem de ser positivo.");

  const key = (k === "ter" || k === "pc" || k === "materia" || k === "rh" || k === "ativos") ? "cod" : (k === "ar" || k === "ap") ? "no" : null;
  if (key && L.some(x => x[key] === o[key] && x.id !== id)) return toast("Já existe um registo com esse código/número.");

  if (k === "ativos") {
    o.qtd = parseFloat(o.qtd) || 1;
    o.valor_unitario = parseFloat(o.valor_unitario) || 0;
    o.valor_total = r2(o.qtd * o.valor_unitario);
    o.valor_aquisicao = o.valor_total;
    o.valor_atual = o.valor_total;
  }

  if (id) {
    Object.assign(L.find(x => x.id === id), o);
  } else {
    o.id = (k === "ter" || k === "pc" || k === "materia" || k === "rh" || k === "ativos") ? (o.cod || uid()) : uid();
    L.push(o);
  }

  saveData();
  $("#dlg").close();
  renderCurrentPage();
  toast(id ? "Registo actualizado com sucesso." : "Novo registo guardado com sucesso.");
}

function delItem(k, id) {
  const L = LST[k]();
  const x = L.find(r => r.id === id);
  if (!x) return;
  if (k === "ter" && [...S.mov, ...S.ar, ...S.ap].some(r => r.terc === x.cod)) return toast("Terceiro em uso em movimentos ou facturas.");
  if (k === "pc" && ([...S.mov, ...S.ar, ...S.ap, ...S.ter].some(r => r.conta === x.cod) || S.bank === x.cod)) return toast("Conta em uso.");
  if (k === "materia" && S.mov.some(m => m.desc.toLowerCase().includes(x.cod.toLowerCase()))) return toast("Material referenciado em movimentos.");

  L.splice(L.indexOf(x), 1);
  saveData();
  renderCurrentPage();
  toast("Registo apagado com sucesso.");
}

let toastTimer;
function toast(t) {
  const e = $("#toast");
  if (!e) return;
  e.textContent = t;
  e.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { e.style.display = "none"; }, 3200);
}

// Modal Popup de Confirmação de Ações
let pendingConfirmAction = null;

function showConfirm(title, msg, onOk, okText = "Sim, Eliminar", isDanger = true) {
  const dlg = $("#dlg-confirm");
  if (!dlg) {
    if (confirm(msg)) onOk();
    return;
  }
  const titEl = $("#confirm-title");
  const msgEl = $("#confirm-msg");
  const okBtn = $("#confirm-ok");
  if (titEl) titEl.textContent = title;
  if (msgEl) msgEl.textContent = msg;
  if (okBtn) {
    okBtn.textContent = okText;
    okBtn.className = isDanger ? "btn-danger" : "p";
  }
  pendingConfirmAction = onOk;
  dlg.showModal();
}

// Helper para linhas de tabelas de relatórios com múltiplas colunas
const rowMulti = (cols, isTotal) => `<tr class="${isTotal ? "t" : ""}">` + cols.map((c, i) => `<td class="${i >= cols.length - 1 ? "n" : ""}">${c}</td>`).join("") + "</tr>";

// View: Clientes e Fornecedores
let terFilter = "all";

function renderClientesFornecedoresView() {
  const q = searchQ.trim().toLowerCase();
  let list = S.ter || [];
  if (terFilter === "cli") list = list.filter(t => t.tipo === "Cliente");
  else if (terFilter === "for") list = list.filter(t => t.tipo === "Fornecedor");
  else if (terFilter === "out") list = list.filter(t => t.tipo !== "Cliente" && t.tipo !== "Fornecedor");

  if (q) {
    list = list.filter(t => 
      (t.cod && t.cod.toLowerCase().includes(q)) ||
      (t.nome && t.nome.toLowerCase().includes(q)) ||
      (t.nuit && t.nuit.toLowerCase().includes(q)) ||
      (t.prov && t.prov.toLowerCase().includes(q)) ||
      (t.tipo && t.tipo.toLowerCase().includes(q))
    );
  }

  const allTer = S.ter || [];
  const totalTer = allTer.length;
  const totalCli = allTer.filter(t => t.tipo === "Cliente").length;
  const totalFor = allTer.filter(t => t.tipo === "Fornecedor").length;
  const totalOut = totalTer - totalCli - totalFor;

  const rows = list.map(t => `
    <tr>
      <td><b>${esc(t.cod)}</b></td>
      <td>${badge(t.tipo)}</td>
      <td class="w"><b>${esc(t.nome)}</b></td>
      <td>${esc(t.nuit || "—")}</td>
      <td><code>${esc(t.conta || "—")}</code></td>
      <td>${esc(t.prov || "—")}</td>
      <td>${esc(t.contacto || "—")}</td>
      <td>${esc(t.email || "—")}</td>
      ${btns("ter", t.id)}
    </tr>
  `).join("");

  return `
    <div class="kpis">
      ${kpi("Total Terceiros", totalTer, "", "Base Geral de Contactos")}
      ${kpi("Clientes Registados", totalCli, "in", "Carteira de Clientes")}
      ${kpi("Fornecedores Homologados", totalFor, "wa", "Cadeia de Suprimentos")}
      ${kpi("Estado & Sócios", totalOut, "ok", "Entidades Reguladoras e Sócios")}
    </div>

    <div class="bar">
      <div class="filters-wrap">
        <button class="btn-sec ${terFilter === "all" ? "on" : ""}" data-filter-ter="all">Todos (${totalTer})</button>
        <button class="btn-sec ${terFilter === "cli" ? "on" : ""}" data-filter-ter="cli">Clientes (${totalCli})</button>
        <button class="btn-sec ${terFilter === "for" ? "on" : ""}" data-filter-ter="for">Fornecedores (${totalFor})</button>
        <button class="btn-sec ${terFilter === "out" ? "on" : ""}" data-filter-ter="out">Estado & Outros (${totalOut})</button>
      </div>
      <div class="bar-search-actions">
        <input type="search" id="q" placeholder="Pesquisar por nome, código, NUIT, província..." value="${esc(searchQ)}">
        <button class="p" data-a="new" data-k="ter">+ Novo Terceiro</button>
      </div>
    </div>

    ${sc(head(["Código", "Tipo", "Designação / Razão Social", "NUIT", "Conta", "Província", "Contacto", "Email", "Ações"]) + (rows || '<tr><td colspan="9"><small>Nenhum terceiro encontrado.</small></td></tr>'))}
  `;
}

// View: Matéria e Stock
let materiaCatFilter = "all";

function renderMateriaView() {
  const q = searchQ.trim().toLowerCase();
  let list = S.materia || [];
  if (materiaCatFilter !== "all") list = list.filter(m => m.cat === materiaCatFilter);

  if (q) {
    list = list.filter(m => 
      (m.cod && m.cod.toLowerCase().includes(q)) ||
      (m.nome && m.nome.toLowerCase().includes(q)) ||
      (m.cat && m.cat.toLowerCase().includes(q)) ||
      (m.forn && m.forn.toLowerCase().includes(q))
    );
  }

  const allItems = S.materia || [];
  const totalArtigos = allItems.length;
  const totalCusto = r2(allItems.reduce((a, x) => a + (x.qtd * x.custo), 0));
  const totalVenda = r2(allItems.reduce((a, x) => a + (x.qtd * (x.preco || x.custo * 1.3)), 0));
  const alertaStock = allItems.filter(x => x.qtd <= (x.min || 5)).length;

  const rows = list.map(mItem => {
    const isBaixo = mItem.qtd <= (mItem.min || 5);
    const totC = r2(mItem.qtd * mItem.custo);
    const fornObj = S.ter.find(t => t.cod === mItem.forn);
    const fornName = fornObj ? fornObj.nome : (mItem.forn || "—");

    return `
      <tr>
        <td><b>${esc(mItem.cod)}</b></td>
        <td class="w"><b>${esc(mItem.nome)}</b></td>
        <td>${badge(mItem.cat)}</td>
        <td><code>${esc(mItem.unidade)}</code></td>
        <td class="n"><b>${mItem.qtd}</b></td>
        <td class="n">${m(mItem.custo)}</td>
        <td class="n">${m(mItem.preco)}</td>
        <td class="n"><b>${m(totC)}</b></td>
        <td class="n">${mItem.min || 0}</td>
        <td>${isBaixo ? badge("Stock Baixo") : badge("Stock Normal")}</td>
        <td>${esc(fornName)}</td>
        ${btns("materia", mItem.id)}
      </tr>
    `;
  }).join("");

  const cats = ["all", "Painéis Solares", "Baterias", "Inversores", "Cabos", "Estruturas", "Acessórios"];

  return `
    <div class="kpis">
      ${kpi("Total de Artigos", totalArtigos, "", "Itens no Catálogo")}
      ${kpi("Valor Total em Stock (Custo)", m(totalCusto), "in", "Investimento em Inventário")}
      ${kpi("Potencial de Venda", m(totalVenda), "ok", "Receita Estimada")}
      ${kpi("Alertas de Stock Baixo", alertaStock, alertaStock > 0 ? "er" : "ok", alertaStock > 0 ? "Repor Encomenda" : "Stock Normal")}
    </div>

    <div class="bar">
      <div class="filters-wrap">
        ${cats.map(c => `<button class="btn-sec ${materiaCatFilter === c ? "on" : ""}" data-filter-materia="${c}">${c === "all" ? "Todas as Categorias" : c}</button>`).join("")}
      </div>
      <div class="bar-search-actions">
        <input type="search" id="q" placeholder="Pesquisar por produto, código, fornecedor..." value="${esc(searchQ)}">
        <button class="p" data-a="new" data-k="materia">+ Novo Material / Produto</button>
      </div>
    </div>

    ${sc(head(["Código", "Designação do Material / Produto", "Categoria", "Unidade", "Qtd em Stock", "Custo Unitário", "Preço Venda", "Valor Total (Custo)", "Stock Mín.", "Estado", "Fornecedor", "Ações"], ["Qtd em Stock", "Custo Unitário", "Preço Venda", "Valor Total (Custo)", "Stock Mín."]) + (rows || '<tr><td colspan="12"><small>Nenhum produto encontrado.</small></td></tr>'))}
  `;
}

// View: Recursos Humanos (RH)
let rhDeptFilter = "all";

function renderRHView() {
  const P_act = getActivePeriod();
  const q = searchQ.trim().toLowerCase();
  let list = S.rh || [];

  if (rhDeptFilter !== "all") {
    list = list.filter(r => (r.dept || "").toLowerCase() === rhDeptFilter.toLowerCase());
  }

  if (q) {
    list = list.filter(r => 
      (r.cod && r.cod.toLowerCase().includes(q)) ||
      (r.nome && r.nome.toLowerCase().includes(q)) ||
      (r.cargo && r.cargo.toLowerCase().includes(q)) ||
      (r.dept && r.dept.toLowerCase().includes(q)) ||
      (r.nuit && r.nuit.toLowerCase().includes(q))
    );
  }

  const allRH = S.rh || [];
  const totalColab = allRH.length;
  const totalSalBruto = r2(allRH.reduce((a, x) => a + (x.salario || 0), 0));
  const inssPatronal = r2(totalSalBruto * 0.04);
  const mediaSal = totalColab > 0 ? r2(totalSalBruto / totalColab) : 0;
  const depts = ["all", ...new Set(allRH.map(r => r.dept).filter(Boolean))];

  const rows = list.map(c => `
    <tr>
      <td><b>${esc(c.cod)}</b></td>
      <td class="w"><b>${esc(c.nome)}</b></td>
      <td>${esc(c.cargo)}</td>
      <td>${badge(c.dept)}</td>
      <td>${d(c.data_adm)}</td>
      <td class="n"><b>${m(c.salario)}</b></td>
      <td>${esc(c.nuit || "—")}</td>
      <td>${esc(c.bi || "—")}</td>
      <td>${badge(c.estado || "Activo")}</td>
      <td>${esc(c.contacto || "—")}</td>
      ${btns("rh", c.id)}
    </tr>
  `).join("");

  // Folha de Salários Sintética (INSS 3% trabalhador, 4% patronal, IRPS)
  const folhaRows = allRH.map(c => {
    const bruto = c.salario || 0;
    const inssTrab = r2(bruto * 0.03);
    const inssPat = r2(bruto * 0.04);
    let irps = 0;
    if (bruto > 50000) irps = r2(bruto * 0.15);
    else if (bruto > 30000) irps = r2(bruto * 0.10);
    else if (bruto > 20000) irps = r2(bruto * 0.05);

    const liquido = r2(bruto - inssTrab - irps);
    const custoEmpresa = r2(bruto + inssPat);

    return `
      <tr>
        <td><b>${esc(c.cod)}</b></td>
        <td class="w">${esc(c.nome)}</td>
        <td class="n">${m(bruto)}</td>
        <td class="n">${m(inssTrab)}</td>
        <td class="n">${m(inssPat)}</td>
        <td class="n">${m(irps)}</td>
        <td class="n"><b>${m(liquido)}</b></td>
        <td class="n"><b>${m(custoEmpresa)}</b></td>
      </tr>
    `;
  }).join("");

  const totInssTrab = r2(totalSalBruto * 0.03);
  const totInssPat = inssPatronal;
  const totIRPS = r2(allRH.reduce((a, c) => {
    const b = c.salario || 0;
    return a + (b > 50000 ? b * 0.15 : b > 30000 ? b * 0.1 : b > 20000 ? b * 0.05 : 0);
  }, 0));
  const totLiquido = r2(totalSalBruto - totInssTrab - totIRPS);
  const totCustoEmp = r2(totalSalBruto + totInssPat);

  return `
    <div class="kpis">
      ${kpi("Colaboradores Activos", totalColab, "", "Quadro de Pessoal")}
      ${kpi("Massa Salarial Mensal", m(totalSalBruto), "in", "Vencimentos Base")}
      ${kpi("INSS Patronal", m(inssPatronal), "wa", "Segurança Social")}
      ${kpi("Média Salarial Mensal", m(mediaSal), "ok", "Média por Colaborador")}
    </div>

    <div class="bar">
      <div class="filters-wrap">
        ${depts.map(d => `<button class="btn-sec ${rhDeptFilter === d ? "on" : ""}" data-filter-rh="${d}">${d === "all" ? `Todos (${totalColab})` : d}</button>`).join("")}
      </div>
      <div class="bar-search-actions">
        <input type="search" id="q" placeholder="Pesquisar por colaborador, cargo, departamento..." value="${esc(searchQ)}">
        <button class="p" data-a="new" data-k="rh">+ Novo Colaborador</button>
      </div>
    </div>

    ${sc(head(["Código", "Nome do Colaborador", "Cargo", "Departamento", "Data Admissão", "Salário Base", "NUIT", "Nº BI", "Estado", "Contacto", "Ações"], ["Salário Base"]) + (rows || '<tr><td colspan="11"><small>Nenhum colaborador encontrado.</small></td></tr>'))}

    <h2 style="margin-top:28px">Folha de Salários & Encargos Sociais (${P_act.labelPeriodo})</h2>
    ${sc(
      head(["Cód.", "Colaborador", "Salário Bruto", "INSS Trabalhador", "INSS Empresa", "IRPS Retido", "Salário Líquido", "Custo Empresa"], ["Salário Bruto", "INSS Trabalhador", "INSS Empresa", "IRPS Retido", "Salário Líquido", "Custo Empresa"]) +
      folhaRows +
      `<tr class="t">
        <td colspan="2">TOTAL FOLHA DE SALÁRIOS</td>
        <td class="n">${m(totalSalBruto)}</td>
        <td class="n">${m(totInssTrab)}</td>
        <td class="n">${m(totInssPat)}</td>
        <td class="n">${m(totIRPS)}</td>
        <td class="n">${m(totLiquido)}</td>
        <td class="n">${m(totCustoEmp)}</td>
      </tr>`
    )}
  `;
}

// View: Ativos e Inventários
let ativosCatFilter = "all";

function renderAtivosView() {
  const q = searchQ.trim().toLowerCase();
  let list = S.ativos || [];

  if (ativosCatFilter !== "all") {
    list = list.filter(a => a.cat === ativosCatFilter);
  }

  if (q) {
    list = list.filter(a => 
      (a.cod && a.cod.toLowerCase().includes(q)) ||
      (a.nome && a.nome.toLowerCase().includes(q)) ||
      (a.cat && a.cat.toLowerCase().includes(q)) ||
      (a.marca && a.marca.toLowerCase().includes(q)) ||
      (a.serie && a.serie.toLowerCase().includes(q)) ||
      (a.localizacao && a.localizacao.toLowerCase().includes(q)) ||
      (a.responsavel && a.responsavel.toLowerCase().includes(q)) ||
      (a.fornecedor && a.fornecedor.toLowerCase().includes(q)) ||
      (a.factura && a.factura.toLowerCase().includes(q)) ||
      (a.estado && a.estado.toLowerCase().includes(q)) ||
      (a.obs && a.obs.toLowerCase().includes(q))
    );
  }

  const allAt = S.ativos || [];
  const totalItens = allAt.length;
  const totalQtd = allAt.reduce((a, x) => a + (parseFloat(x.qtd) || 1), 0);
  const totalValor = r2(allAt.reduce((a, x) => a + ((parseFloat(x.qtd) || 1) * (parseFloat(x.valor_unitario) || 0)), 0));
  const bensOperacionais = allAt.filter(x => x.estado === "Bom" || x.estado === "Novo").length;

  const rows = list.map(a => {
    const qtd = parseFloat(a.qtd) || 1;
    const vUnit = parseFloat(a.valor_unitario) || 0;
    const vTot = r2(qtd * vUnit);

    return `
      <tr>
        <td><b>${esc(a.cod)}</b></td>
        <td class="w"><b>${esc(a.nome)}</b></td>
        <td>${badge(a.cat)}</td>
        <td>${esc(a.marca || "N/A")}</td>
        <td><code>${esc(a.serie || "—")}</code></td>
        <td class="n"><b>${qtd}</b></td>
        <td><code>${esc(a.unidade || "un")}</code></td>
        <td>${esc(a.localizacao || "Escritório")}</td>
        <td>${esc(a.responsavel || "N/A")}</td>
        <td>${d(a.data_aquisicao)}</td>
        <td class="n">${m(vUnit)}</td>
        <td class="n"><b>${m(vTot)}</b></td>
        <td>${esc(a.fornecedor || "—")}</td>
        <td><code>${esc(a.factura || "—")}</code></td>
        <td>${badge(a.estado || "Bom")}</td>
        <td>${a.ultima_verif ? d(a.ultima_verif) : "—"}</td>
        <td style="max-width:200px;white-space:normal;font-size:12px;color:var(--mu)">${esc(a.obs || "—")}</td>
        ${btns("ativos", a.id)}
      </tr>
    `;
  }).join("");

  const sumFilteredQtd = list.reduce((a, x) => a + (parseFloat(x.qtd) || 1), 0);
  const sumFilteredVal = r2(list.reduce((a, x) => a + ((parseFloat(x.qtd) || 1) * (parseFloat(x.valor_unitario) || 0)), 0));

  const totalRow = rows ? `
    <tr class="t">
      <td colspan="5"><b>TOTAL</b></td>
      <td class="n"><b>${sumFilteredQtd}</b></td>
      <td></td>
      <td colspan="3"></td>
      <td class="n"></td>
      <td class="n"><b>${m(sumFilteredVal)}</b></td>
      <td colspan="5"></td>
      <td class="col-actions ac"></td>
    </tr>
  ` : "";

  const cats = [
    "all",
    "Equipamento informático",
    "Mobiliário",
    "Ferramentas",
    "Equipamento de medição",
    "Stock solar/eléctrico",
    "Viaturas",
    "EPI",
    "Outros"
  ];

  return `
    <div class="kpis">
      ${kpi("Total de Itens Cadastrados", totalItens, "", "Linhas de Bens")}
      ${kpi("Quantidade Total em Stock/Uso", totalQtd, "", "Unidades Físicas")}
      ${kpi("Valor Total do Património", m(totalValor), "in", "Avaliação de Inventário")}
      ${kpi("Bens em Bom Estado", `${bensOperacionais} / ${totalItens}`, "ok", "Operacionais")}
    </div>

    <div class="bar">
      <div class="filters-wrap">
        ${cats.map(c => `<button class="btn-sec ${ativosCatFilter === c ? "on" : ""}" data-filter-ativos="${c}">${c === "all" ? "Todas as Categorias" : c}</button>`).join("")}
      </div>
      <div class="bar-search-actions">
        <input type="search" id="q" placeholder="Pesquisar por bem, código, marca, responsável..." value="${esc(searchQ)}">
        <button class="p" data-a="new" data-k="ativos">+ Novo Bem / Ativo</button>
      </div>
    </div>

    ${sc(head(
      [
        "Código",
        "Descrição do bem",
        "Categoria",
        "Marca / Modelo",
        "Nº de série",
        "Qtd",
        "Unidade",
        "Localização",
        "Utilizador / Responsável",
        "Data de aquisição",
        "Valor unitário (MZN)",
        "Valor total (MZN)",
        "Fornecedor",
        "Factura nº",
        "Estado",
        "Última verificação",
        "Observações",
        "Ações"
      ],
      ["Qtd", "Valor unitário (MZN)", "Valor total (MZN)"]
    ) + (rows ? (rows + totalRow) : '<tr><td colspan="18"><small>Nenhum bem patrimonial encontrado.</small></td></tr>'))}
  `;
}

// View: Relatórios
let repTabActive = "balancete";

function renderRelatoriosView() {
  const P_act = getActivePeriod();
  const R = calc();
  const repTabs = [
    ["balancete", "Balancete de Verificação"],
    ["dre", "Demonstração de Resultados (DRE)"],
    ["iva", "Mapa Resumo de IVA"],
    ["fluxo", "Fluxo de Caixa Realizado"],
    ["aging", "Antiguidade de Saldos (Aging)"]
  ];

  let contentHtml = "";

  if (repTabActive === "balancete") {
    const classes = [
      { cod: "1", des: "Meios Monetários", deb: R.tin + S.ini, cred: R.tout, salD: R.adj, salC: 0 },
      { cod: "2", des: "Inventários e Produtos", deb: 85000, cred: 0, salD: 85000, salC: 0 },
      { cod: "3", des: "Investimentos de Capital", deb: 1935000, cred: 0, salD: 1935000, salC: 0 },
      { cod: "4", des: "Contas de Terceiros", deb: R.pr, cred: R.pa, salD: R.pr, salC: R.pa },
      { cod: "6", des: "Gastos e Perdas", deb: R.tout, cred: 0, salD: R.tout, salC: 0 },
      { cod: "7", des: "Rendimentos e Ganhos", deb: 0, cred: R.tin, salD: 0, salC: R.tin }
    ];

    contentHtml = `
      ${sc(
        head(["Código", "Designação da Conta", "Total Débito", "Total Crédito", "Saldo Devedor", "Saldo Credor"], ["Total Débito", "Total Crédito", "Saldo Devedor", "Saldo Credor"]) +
        classes.map(c => `
          <tr>
            <td><b>${c.cod}</b></td>
            <td><b>${esc(c.des)}</b></td>
            <td class="n">${m(c.deb)}</td>
            <td class="n">${m(c.cred)}</td>
            <td class="n">${m(c.salD)}</td>
            <td class="n">${m(c.salC)}</td>
          </tr>
        `).join("") +
        `<tr class="t">
          <td colspan="2">TOTAL DO BALANCETE</td>
          <td class="n">${m(classes.reduce((a, x) => a + x.deb, 0))}</td>
          <td class="n">${m(classes.reduce((a, x) => a + x.cred, 0))}</td>
          <td class="n">${m(classes.reduce((a, x) => a + x.salD, 0))}</td>
          <td class="n">${m(classes.reduce((a, x) => a + x.salC, 0))}</td>
        </tr>`
      )}
    `;
  } else if (repTabActive === "dre") {
    const periodMv = (R.book || []).concat(R.ex || []);
    const rendimentos = R.tin;
    const custosOper = r2(periodMv.filter(x => x.cat === "Despesa Operacional").reduce((a, x) => a + (x.out || 0), 0));
    const custosSalarios = r2(periodMv.filter(x => x.cat === "Salários" || x.tipo === "Salários").reduce((a, x) => a + (x.out || 0), 0));
    const custosExtras = r2(periodMv.filter(x => x.cat === "Despesas Extras").reduce((a, x) => a + (x.out || 0), 0));
    const impostos = r2(periodMv.filter(x => x.cat === "Impostos e Encargos" || x.tipo === "Impostos e Contribuições").reduce((a, x) => a + (x.out || 0), 0));
    const totalGastos = r2(custosOper + custosSalarios + custosExtras + impostos);
    const resultadoOper = r2(rendimentos - custosOper);
    const resultadoLiq = r2(rendimentos - totalGastos);

    contentHtml = `
      <h2>Demonstração de Resultados (DRE) – ${P_act.labelPeriodo}</h2>
      ${sc(
        head(["Rubrica Contabilística", "Valor (MZN)"], ["Valor (MZN)"]) +
        row("1. Vendas e Serviços Prestados", m(rendimentos), 1) +
        row("2. (-) Custos Operacionais e Serviços de Terceiros", m(custosOper)) +
        row("= Margem Operacional Bruta", m(resultadoOper), 1) +
        row("3. (-) Remunerações do Pessoal", m(custosSalarios)) +
        row("4. (-) Despesas Gerais e Administrativas", m(custosExtras)) +
        row("5. (-) Impostos e Encargos", m(impostos)) +
        row("= RESULTADO LÍQUIDO DO PERÍODO (LUCRO / PREJUÍZO)", m(resultadoLiq), 1)
      )}
    `;
  } else if (repTabActive === "iva") {
    const arIva = r2(S.ar.reduce((a, x) => a + (x.base * (x.rate || 0.16)), 0));
    const apIva = r2(S.ap.reduce((a, x) => a + (x.base * (x.rate || 0.16)), 0));
    const saldoIva = r2(arIva - apIva);

    contentHtml = `
      <h2>Mapa de Apuramento do IVA – ${P_act.labelPeriodo}</h2>
      ${sc(
        head(["Operação Tributária", "Base Tributável (MZN)", "Taxa", "Valor do IVA (MZN)"], ["Base Tributável (MZN)", "Valor do IVA (MZN)"]) +
        rowMulti(["IVA Liquidado (Facturação a Clientes)", m(S.ar.reduce((a, x) => a + x.base, 0)), "16%", m(arIva)]) +
        rowMulti(["IVA Suportado / Dedutível (Compras e Fornecedores)", m(S.ap.reduce((a, x) => a + x.base, 0)), "16%", m(apIva)]) +
        rowMulti(["SALDO DE IVA APURADO A ENTREGAR AO ESTADO", "—", "—", m(saldoIva)], 1)
      )}
    `;
  } else if (repTabActive === "fluxo") {
    const periodMv = (R.book || []).concat(R.ex || []);
    const pagFornecedores = r2(periodMv.filter(x => x.tipo === "Pagamento a Fornecedor" || x.conta === "42.1").reduce((a, x) => a + (x.out || 0), 0));
    const despOper = r2(periodMv.filter(x => x.cat === "Despesa Operacional" && x.tipo !== "Pagamento a Fornecedor" && x.tipo !== "Salários").reduce((a, x) => a + (x.out || 0), 0));
    const salarios = r2(periodMv.filter(x => x.cat === "Salários" || x.tipo === "Salários").reduce((a, x) => a + (x.out || 0), 0));
    const impostos = r2(periodMv.filter(x => x.cat === "Impostos e Encargos" || x.tipo === "Impostos e Contribuições").reduce((a, x) => a + (x.out || 0), 0));
    const trfOutras = r2(periodMv.filter(x => x.tipo === "Transferência Interna" || x.tipo === "Movimento de Sócios" || x.cat === "Despesas Extras").reduce((a, x) => a + (x.out || 0), 0));

    contentHtml = `
      <h2>Fluxo de Caixa Realizado – ${P_act.labelPeriodo}</h2>
      ${sc(
        head(["Fluxo", "Descrição", "Valor Realizado (MZN)"], ["Valor Realizado (MZN)"]) +
        rowMulti(["(+) Entradas", "Recebimentos de Clientes & Vendas Solares", m(R.tin)]) +
        rowMulti(["(−) Saídas", "Pagamentos a Fornecedores de Equipamento", m(pagFornecedores)]) +
        rowMulti(["(−) Saídas", "Despesas Operacionais e FST", m(despOper)]) +
        rowMulti(["(−) Saídas", "Remunerações de Pessoal (Salários Líquidos)", m(salarios)]) +
        rowMulti(["(−) Saídas", "Obrigações Tributárias (INSS / IRPS / IVA)", m(impostos)]) +
        rowMulti(["(−) Saídas", "Transferências Internas, Sócios & Extras", m(trfOutras)]) +
        rowMulti(["= Variação Líquida", "Saldo Líquido Gerado no Período", m(R.tin - R.tout)], 1)
      )}
    `;
  } else if (repTabActive === "aging") {
    contentHtml = `
      <h2>Antiguidade de Saldos (Aging de Facturas) – Contas a Receber e a Pagar</h2>
      ${sc(
        head(["Escalão de Vencimento", "Contas a Receber (Clientes)", "Contas a Pagar (Fornecedores)"], ["Contas a Receber (Clientes)", "Contas a Pagar (Fornecedores)"]) +
        rowMulti(["Corrente (A vencer)", m(R.or.filter(x => x.dias === 0).reduce((a, x) => a + x.sal, 0)), m(R.oa.filter(x => x.dias === 0).reduce((a, x) => a + x.sal, 0))]) +
        rowMulti(["1 a 30 dias em atraso", m(R.or.filter(x => x.dias > 0 && x.dias <= 30).reduce((a, x) => a + x.sal, 0)), m(R.oa.filter(x => x.dias > 0 && x.dias <= 30).reduce((a, x) => a + x.sal, 0))]) +
        rowMulti(["31 a 60 dias em atraso", m(R.or.filter(x => x.dias > 30 && x.dias <= 60).reduce((a, x) => a + x.sal, 0)), m(R.oa.filter(x => x.dias > 30 && x.dias <= 60).reduce((a, x) => a + x.sal, 0))]) +
        rowMulti(["Mais de 60 dias em atraso", m(R.or.filter(x => x.dias > 60).reduce((a, x) => a + x.sal, 0)), m(R.oa.filter(x => x.dias > 60).reduce((a, x) => a + x.sal, 0))]) +
        rowMulti(["TOTAL EM ABERTO", m(R.pr), m(R.pa)], 1)
      )}
    `;
  }

  return `
    <div class="bar">
      <div class="filters-wrap">
        ${repTabs.map(([k, l]) => `<button class="btn-sec ${repTabActive === k ? "on" : ""}" data-rep-tab="${k}">${l}</button>`).join("")}
      </div>
      <div class="bar-search-actions">
        <button class="p" id="prt-rep">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          <span>Imprimir Relatório / PDF</span>
        </button>
      </div>
    </div>

    ${contentHtml}
  `;
}

// View: Configurações
function renderConfiguracoesView() {
  const cfg = S.config || {};
  const totMov = S.mov.length;
  const totAR = S.ar.length;
  const totAP = S.ap.length;
  const totTer = S.ter.length;
  const totPC = S.pc.length;
  const totMat = (S.materia || []).length;
  const totRH = (S.rh || []).length;
  const totAt = (S.ativos || []).length;

  return `
    <div class="bar" style="justify-content: flex-end;">
      <div class="bar-search-actions">
        <button class="p" id="save-config">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>Guardar Configurações</span>
        </button>
      </div>
    </div>

    <div class="config-grid">
      <!-- Card 1: Dados da Empresa -->
      <div class="config-card" id="card-empresa" style="grid-column: 1 / -1;">
        <h3>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/>
            <path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/>
            <path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/>
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
          </svg>
          <span>Identificação da Empresa</span>
        </h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div class="form-group-row">
            <label>Nome Comercial / Denominação Social *</label>
            <input type="text" id="cfg_empresa" value="${esc(cfg.empresa || "LECASU, LDA.")}" placeholder="Ex: LECASU, LDA.">
          </div>
          <div class="form-group-row">
            <label>NUIT (Número Único de Identificação Tributária) *</label>
            <input type="text" id="cfg_nuit" value="${esc(cfg.nuit || "400999888")}" placeholder="Ex: 400999888">
          </div>
          <div class="form-group-row">
            <label>Ramo de Actividade / Objeto Social</label>
            <input type="text" id="cfg_actividade" value="${esc(cfg.actividade || "")}" placeholder="Ex: Energia Solar e Instalações Elétricas">
          </div>
          <div class="form-group-row">
            <label>Morada da Sede Social</label>
            <input type="text" id="cfg_morada" value="${esc(cfg.morada || "")}" placeholder="Ex: Av. 24 de Julho, n.º 1250, Maputo">
          </div>
          <div class="form-group-row">
            <label>Contacto Telefónico Corporativo</label>
            <input type="text" id="cfg_contacto" value="${esc(cfg.contacto || "")}" placeholder="Ex: +258 84 123 4567">
          </div>
          <div class="form-group-row">
            <label>Email Institucional / Faturação</label>
            <input type="email" id="cfg_email" value="${esc(cfg.email || "")}" placeholder="Ex: financeiro@lecasu.co.mz">
          </div>
        </div>
      </div>

      <!-- Card 2: Parâmetros Fiscais e Contábeis -->
      <div class="config-card" id="card-fiscal">
        <h3>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v12"/>
            <path d="M6 12h12"/>
          </svg>
          <span>Parâmetros Contabilísticos e Fiscais (Moçambique)</span>
        </h3>
        <div class="form-group-row">
          <label>Moeda Padrão do Sistema</label>
          <input type="text" id="cfg_moeda" value="${esc(cfg.moeda || "MZN")}" placeholder="Ex: MZN">
        </div>
        <div class="form-group-row">
          <label>Taxa Padrão de IVA (%) *</label>
          <input type="number" step="0.01" id="cfg_taxa_iva" value="${(cfg.taxa_iva || 0.16) * 100}" placeholder="16">
        </div>
        <div class="form-group-row">
          <label>Exercício Económico / Ano Fiscal</label>
          <input type="text" id="cfg_exercicio" value="${esc(cfg.exercicio || "2026")}" placeholder="Ex: 2026">
        </div>
        <div class="form-group-row">
          <label>Conta Bancária Principal de Reconciliação</label>
          <select id="cfg_banco_padrao">
            ${S.pc.filter(p => p.cod.startsWith("12.1")).map(p => `<option value="${p.cod}" ${cfg.banco_padrao === p.cod ? "selected" : ""}>${p.cod} – ${esc(p.des)}</option>`).join("")}
          </select>
        </div>
        <div class="form-group-row">
          <label>Responsável Contábil / Gabinete Certificado</label>
          <input type="text" id="cfg_contabilista" value="${esc(cfg.contabilista || "")}" placeholder="Ex: Gabinete Contas Certas (OCAM)">
        </div>
      </div>

      <!-- Card 3: Base de Dados Neon PostgreSQL (Ao lado de Parâmetros) -->
      <div class="config-card" id="card-neon" style="border-left: 4px solid #047857; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#047857" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            <span>Base de Dados PostgreSQL (Neon Cloud)</span>
          </h3>
          <p style="margin:4px 0 14px;color:var(--mu);font-size:13px;line-height:1.5">
            O ERP está conectado à instância gerenciada Neon PostgreSQL (AWS us-east-2) com persistência em tempo real e sincronização híbrida com o cache local.
          </p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
            <div style="background:var(--bg);padding:9px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
              <small style="color:var(--mu)">Provedor Cloud</small>
              <span style="font-weight:600;color:var(--tx);font-size:13px">Neon Serverless PostgreSQL</span>
            </div>
            <div style="background:var(--bg);padding:9px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
              <small style="color:var(--mu)">Região AWS</small>
              <span style="font-weight:600;color:var(--tx);font-size:13px">us-east-2 (Ohio)</span>
            </div>
            <div style="background:var(--bg);padding:9px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
              <small style="color:var(--mu)">Segurança & Canal</small>
              <span style="font-weight:600;color:#047857;font-size:13px">SSL Require & Channel Binding</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;padding-top:10px">
          <button class="btn-sec" id="btn-test-db" type="button" style="flex:1;min-width:130px;justify-content:center">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>Testar Conexão</span>
          </button>
          <button class="p" id="btn-sync-db" type="button" style="flex:1;min-width:170px;justify-content:center">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            <span>Sincronizar com Neon PostgreSQL</span>
          </button>
        </div>
      </div>

      <!-- Card 3: Estatísticas de Dados e Segurança -->
      <div class="config-card" id="card-backup" style="grid-column: 1 / -1">
        <h3>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Estado da Base de Dados e Cópia de Segurança</span>
        </h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:18px">
          <div style="background:var(--bg);padding:10px 14px;border-radius:8px"><b>${totMov}</b> <small style="display:block;color:var(--mu)">Movimentos Bancários</small></div>
          <div style="background:var(--bg);padding:10px 14px;border-radius:8px"><b>${totAR}</b> <small style="display:block;color:var(--mu)">Facturas a Receber</small></div>
          <div style="background:var(--bg);padding:10px 14px;border-radius:8px"><b>${totAP}</b> <small style="display:block;color:var(--mu)">Facturas a Pagar</small></div>
          <div style="background:var(--bg);padding:10px 14px;border-radius:8px"><b>${totTer}</b> <small style="display:block;color:var(--mu)">Terceiros</small></div>
          <div style="background:var(--bg);padding:10px 14px;border-radius:8px"><b>${totMat}</b> <small style="display:block;color:var(--mu)">Materiais em Stock</small></div>
          <div style="background:var(--bg);padding:10px 14px;border-radius:8px"><b>${totRH}</b> <small style="display:block;color:var(--mu)">Colaboradores RH</small></div>
          <div style="background:var(--bg);padding:10px 14px;border-radius:8px"><b>${totAt}</b> <small style="display:block;color:var(--mu)">Activos Imobilizados</small></div>
          <div style="background:var(--bg);padding:10px 14px;border-radius:8px"><b>${totPC}</b> <small style="display:block;color:var(--mu)">Contas PGC</small></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <input type="file" id="file-import" accept=".json" style="display:none">
          <button class="btn-sec" id="cfg-btn-exp">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Exportar Cópia (JSON)</span>
          </button>
          <button class="btn-sec" id="cfg-btn-imp">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Restaurar Cópia</span>
          </button>
          <button class="btn-sec del" id="cfg-btn-rst">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            <span>Zerar / Repor Sistema a Zero</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Instâncias dos Gráficos do Dashboard
let chartFluxoInstance = null;
let chartPizzaInstance = null;

function initDashboardCharts(R) {
  if (typeof Chart === "undefined") {
    return;
  }

  const P_act = getActivePeriod();

  // Destruir instâncias existentes para evitar erro de Canvas reutilizado
  if (chartFluxoInstance) {
    try { chartFluxoInstance.destroy(); } catch (e) {}
    chartFluxoInstance = null;
  }
  if (chartPizzaInstance) {
    try { chartPizzaInstance.destroy(); } catch (e) {}
    chartPizzaInstance = null;
  }

  // 1. Gráfico de Linha: Evolução de Entradas e Saídas ao Longo do Período Ativo
  const canvasLinha = document.getElementById("chart-fluxo-linha");
  if (canvasLinha) {
    const periodMv = (R.book || []).concat(R.ex || []).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const dateMap = {};
    for (const mItem of periodMv) {
      const d = mItem.date || P_act.refDate;
      if (!dateMap[d]) dateMap[d] = { in: 0, out: 0 };
      dateMap[d].in += (mItem.in || 0);
      dateMap[d].out += (mItem.out || 0);
    }

    const sortedDates = Object.keys(dateMap).sort();
    let labels, dataIn, dataOut;
    if (sortedDates.length > 0) {
      labels = sortedDates.map(d => {
        const p = d.split("-");
        return p.length === 3 ? `${p[2]}/${p[1]}` : d;
      });
      dataIn = sortedDates.map(d => r2(dateMap[d].in));
      dataOut = sortedDates.map(d => r2(dateMap[d].out));
    } else {
      const p = (P_act.dataFormatada || "").split("/");
      labels = [p.length === 3 ? `${p[0]}/${p[1]}` : (P_act.dataFormatada || "Hoje")];
      dataIn = [0];
      dataOut = [0];
    }

    const ctxLinha = canvasLinha.getContext("2d");

    // Gradientes elegantes sob as curvas
    const gradIn = ctxLinha.createLinearGradient(0, 0, 0, 240);
    gradIn.addColorStop(0, "rgba(254, 129, 0, 0.28)");
    gradIn.addColorStop(1, "rgba(254, 129, 0, 0.0)");

    const gradOut = ctxLinha.createLinearGradient(0, 0, 0, 240);
    gradOut.addColorStop(0, "rgba(24, 32, 47, 0.18)");
    gradOut.addColorStop(1, "rgba(24, 32, 47, 0.0)");

    chartFluxoInstance = new Chart(ctxLinha, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Entradas",
            data: dataIn,
            borderColor: "#fe8100",
            backgroundColor: gradIn,
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: "#fe8100",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Saídas",
            data: dataOut,
            borderColor: "#18202f",
            backgroundColor: gradOut,
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: "#18202f",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "#18202f",
            titleColor: "#ffffff",
            bodyColor: "#f4f6f9",
            borderColor: "#fed7aa",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: "Inter, system-ui", size: 12, weight: "bold" },
            bodyFont: { family: "Inter, system-ui", size: 12 },
            callbacks: {
              label: function(ctx) {
                return ` ${ctx.dataset.label}: ${m(ctx.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "Inter, system-ui", size: 11 },
              color: "#64748b"
            }
          },
          y: {
            grid: {
              color: "#e2e8f0",
              drawBorder: false
            },
            ticks: {
              font: { family: "Inter, system-ui", size: 11 },
              color: "#64748b",
              callback: function(val) {
                if (val >= 1000) return (val / 1000).toLocaleString("pt-MZ") + "k";
                return val;
              }
            }
          }
        }
      }
    });
  }

  // 2. Gráfico de Pizza / Donut: Saídas por Categoria no Período Selecionado
  const canvasPizza = document.getElementById("chart-despesas-pizza");
  if (canvasPizza) {
    const cats = {};
    (R.book || []).concat(R.ex || []).forEach(x => {
      if (x.out) cats[x.cat] = r2((cats[x.cat] || 0) + x.out);
    });

    const sortedEntries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    let labels = sortedEntries.map(e => e[0]);
    let dataValues = sortedEntries.map(e => e[1]);

    const colors = [
      "#fe8100", // Laranja Oficial LECASU
      "#18202f", // Preto Grafite
      "#ea580c", // Laranja Queimado
      "#64748b", // Ardósia Neutro
      "#f59e0b", // Âmbar Solar
      "#334155"  // Grafite
    ];

    let bgColors = colors.slice(0, labels.length);
    let isPlaceholder = false;

    if (labels.length === 0) {
      labels = ["Sem saídas registadas no período"];
      dataValues = [1];
      bgColors = ["#e2e8f0"];
      isPlaceholder = true;
    }

    const ctxPizza = canvasPizza.getContext("2d");

    chartPizzaInstance = new Chart(ctxPizza, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: bgColors,
            borderColor: "#ffffff",
            borderWidth: 2.5,
            hoverOffset: isPlaceholder ? 0 : 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            display: !isPlaceholder,
            position: "right",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              borderRadius: 3,
              padding: 14,
              font: { family: "Inter, system-ui", size: 12, weight: "500" },
              color: "#18202f"
            }
          },
          tooltip: {
            backgroundColor: "#18202f",
            titleColor: "#ffffff",
            bodyColor: "#f4f6f9",
            borderColor: "#fed7aa",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: "Inter, system-ui", size: 12, weight: "bold" },
            bodyFont: { family: "Inter, system-ui", size: 12 },
            callbacks: {
              label: function(ctx) {
                if (isPlaceholder) return " Sem saídas no período: 0,00 MZN";
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const val = ctx.parsed;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";
                return ` ${ctx.label}: ${m(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }
}

// Mapeamento e Navegação SPA Suave (Estilo Desktop / Photoshop / Explorador de Ficheiros)
const PAGE_MODULES = {
  "dashboard.html": "dash",
  "financeiro.html": "fin",
  "clientes-fornecedores.html": "terceiros",
  "materia.html": "materia",
  "rh.html": "rh",
  "ativos-inventarios.html": "ativos",
  "relatorios.html": "relatorios",
  "configuracoes.html": "config"
};

const PAGE_TITLES = {
  dash: "Dashboard",
  fin: "Financeiro",
  terceiros: "Cliente e fornecedor",
  materia: "Material e Produtos",
  rh: "RH",
  ativos: "Ativos e inventários",
  relatorios: "Relatórios",
  config: "Configurações"
};

let currentPage = "dash";

function navigateToPage(url, pushState = true) {
  if (!url) return;
  const cleanUrl = url.split("?")[0];
  const fileName = cleanUrl.split("/").pop().split("#")[0] || "dashboard.html";
  const mod = PAGE_MODULES[fileName];
  if (!mod) {
    window.location.href = url;
    return;
  }

  currentPage = mod;

  // Atualizar classe ativa na barra lateral instantaneamente (sem movimento ou recarregamento)
  const navLinks = document.querySelectorAll("#nav a");
  navLinks.forEach(a => {
    const aHref = a.getAttribute("href") || "";
    const aFile = aHref.split("/").pop().split("?")[0].split("#")[0];
    a.classList.toggle("on", aFile === fileName);
  });

  // Atualizar título do cabeçalho e título da janela
  const h1 = document.querySelector(".header-info h1");
  if (h1 && PAGE_TITLES[mod]) {
    h1.textContent = PAGE_TITLES[mod];
  }
  if (PAGE_TITLES[mod]) {
    document.title = `LECASU – ${PAGE_TITLES[mod]}`;
  }

  // Se houver hash na URL para abas financeiras
  if (mod === "fin") {
    const hash = (cleanUrl.split("#")[1] || window.location.hash.replace("#", "") || "").trim();
    if (hash && TABS.some(t => t[0] === hash)) {
      activeTab = hash;
    }
  }

  // Atualizar URL sem reload no navegador
  if (pushState && window.history && window.history.pushState) {
    try {
      window.history.pushState({ page: mod, fileName }, "", fileName + (mod === "fin" && activeTab ? "#" + activeTab : ""));
    } catch (e) {}
  }

  // Seletor de abas financeiras (#tabs)
  const tabsEl = document.getElementById("tabs");
  if (tabsEl) {
    tabsEl.style.display = mod === "fin" ? "flex" : "none";
  }

  // Reset do termo de busca
  searchQ = "";

  // Renderizar o conteúdo da página
  renderCurrentPage();

  // Reset de scroll suave
  const scrollTarget = document.querySelector(".main-wrapper") || window;
  if (scrollTarget.scrollTo) {
    scrollTarget.scrollTo({ top: 0, behavior: "instant" });
  }
}

function renderCurrentPage() {
  try {
    const R = calc();
    const mainEl = $("#main");
    if (!mainEl) return;

    const tabsRowEl = $("#tabs-bar-row");
    const tabsEl = $("#tabs");
    const tabsActionsEl = $("#tabs-actions");

    if (tabsRowEl) {
      tabsRowEl.style.display = (currentPage === "fin") ? "flex" : "none";
    }

    if (tabsEl) {
      if (currentPage === "fin") {
        tabsEl.style.display = "flex";
        const existingBtns = tabsEl.querySelectorAll("button[data-tab]");
        if (existingBtns.length === TABS.length) {
          existingBtns.forEach(btn => {
            btn.classList.toggle("on", btn.dataset.tab === activeTab);
          });
        } else {
          tabsEl.innerHTML = TABS.map(([k, l]) => `<button data-tab="${k}" class="${k === activeTab ? "on" : ""}">${l}</button>`).join("");
        }
      } else {
        tabsEl.style.display = "none";
      }
    }

    if (tabsActionsEl) {
      if (currentPage === "fin") {
        tabsActionsEl.style.display = "flex";
        if (activeTab === "rec") {
          tabsActionsEl.innerHTML = `
            <input type="search" id="q" placeholder="Pesquisar movimento, entidade..." value="${esc(searchQ)}">
            <button class="p" data-a="new" data-k="mov">+ Novo movimento</button>
          `;
        } else if (activeTab === "ar" || activeTab === "ap") {
          tabsActionsEl.innerHTML = `
            <label class="tab-action-label">
              Data de referência
              <input type="date" data-f="ref" value="${esc(S.ref || '')}">
            </label>
            <button class="p" data-a="new" data-k="${activeTab}">+ Nova factura</button>
          `;
        } else if (activeTab === "ter") {
          tabsActionsEl.innerHTML = `
            <input type="search" id="q" placeholder="Pesquisar terceiro, NUIT..." value="${esc(searchQ)}">
            <button class="p" data-a="new" data-k="ter">+ Novo terceiro</button>
          `;
        } else if (activeTab === "pc") {
          tabsActionsEl.innerHTML = `
            <input type="search" id="q" placeholder="Pesquisar por código ou designação..." value="${esc(searchQ)}">
            <button class="p" data-a="new" data-k="pc">+ Nova conta</button>
          `;
        }
      } else {
        tabsActionsEl.style.display = "none";
        tabsActionsEl.innerHTML = "";
      }
    }

    if (currentPage === "dash") {
      mainEl.innerHTML = renderDashboardView(R);
      requestAnimationFrame(() => initDashboardCharts(R));
    } else if (currentPage === "fin") {
      const tabFns = {
        rec: () => recTab(R),
        ar: () => invTab("ar", R.ar),
        ap: () => invTab("ap", R.ap),
        ter: terTab,
        pc: pcTab
      };
      mainEl.innerHTML = tabFns[activeTab] ? tabFns[activeTab]() : recTab(R);
    } else if (currentPage === "terceiros") {
      mainEl.innerHTML = renderClientesFornecedoresView();
    } else if (currentPage === "materia") {
      mainEl.innerHTML = renderMateriaView();
    } else if (currentPage === "rh") {
      mainEl.innerHTML = renderRHView();
    } else if (currentPage === "ativos") {
      mainEl.innerHTML = renderAtivosView();
    } else if (currentPage === "relatorios") {
      mainEl.innerHTML = renderRelatoriosView();
    } else if (currentPage === "config") {
      mainEl.innerHTML = renderConfiguracoesView();
    }
  } catch (err) {
    console.error("Erro ao renderizar ecrã:", err);
    const mainEl = $("#main");
    if (mainEl && !mainEl.innerHTML.trim()) {
      mainEl.innerHTML = `<div class="sc" style="padding:24px;text-align:center"><h3>A carregar dados do sistema...</h3><p style="color:var(--mu);margin-top:8px">${esc(err.message)}</p></div>`;
    }
  }
  try { initNotifications(); } catch (e) {}
  try { syncHeaderPeriodSelector(); } catch (e) {}
}

// Inicializadores
function initDashboard() {
  currentPage = "dash";
  renderCurrentPage();
}

function initFinanceiro() {
  currentPage = "fin";
  if (window.location.hash) {
    const h = window.location.hash.replace("#", "");
    if (TABS.some(t => t[0] === h)) {
      activeTab = h;
    }
  }
  renderCurrentPage();
}

function initClientesFornecedores() {
  currentPage = "terceiros";
  renderCurrentPage();
}

function initMateria() {
  currentPage = "materia";
  renderCurrentPage();
}

function initRH() {
  currentPage = "rh";
  renderCurrentPage();
}

function initAtivos() {
  currentPage = "ativos";
  renderCurrentPage();
}

function initRelatorios() {
  currentPage = "relatorios";
  renderCurrentPage();
}

function initConfiguracoes() {
  currentPage = "config";
  renderCurrentPage();
}

// Controle da Barra Lateral (Recolher / Expandir)
function toggleSidebar() {
  const sb = $("#sidebar");
  if (!sb) return;
  sb.classList.add("animating");
  sb.classList.toggle("collapsed");
  const isCollapsed = sb.classList.contains("collapsed");
  try {
    localStorage.setItem("lecasu_sidebar_collapsed", isCollapsed ? "1" : "0");
  } catch (e) {}
  setTimeout(() => {
    sb.classList.remove("animating");
  }, 260);
}

function restoreSidebarState() {
  try {
    const sb = $("#sidebar");
    if (!sb) return;
    if (localStorage.getItem("lecasu_sidebar_collapsed") === "1") {
      sb.classList.add("collapsed");
    } else {
      sb.classList.remove("collapsed");
    }
  } catch (e) {}
}

// Relógio em Tempo Real (Horas no fuso horário Africa/Maputo, CAT: UTC+2)
function updateClock() {
  const el = $("#clock-time");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString("pt-MZ", { timeZone: "Africa/Maputo", hour12: false });
}

// Central de Notificações
function initNotifications() {
  const countEl = $("#notif-count");
  const listEl = $("#notif-list");
  if (!countEl || !listEl) return;

  const R = calc();
  const vencidas = [...R.or, ...R.oa].filter(x => x.st === "Vencida");
  const diffOk = Math.abs(R.diff) < 0.01;

  const notifs = [];
  if (!diffOk) {
    notifs.push({
      tit: "Ajuste na Reconciliação",
      desc: `Diferença de ${m(R.diff)} MZN a verificar.`,
      href: "financeiro.html#rec"
    });
  }
  if (vencidas.length > 0) {
    notifs.push({
      tit: "Faturas Vencidas",
      desc: `${vencidas.length} fatura(s) ultrapassaram o vencimento.`,
      href: "financeiro.html#ar"
    });
  }
  notifs.push({
    tit: "Estado NedBank",
    desc: diffOk ? "Reconciliação bancária 100% equilibrada." : "Existem pendências em trânsito.",
    href: "financeiro.html#rec"
  });

  countEl.textContent = notifs.length;
  listEl.innerHTML = notifs.map(n => `
    <div class="notif-item" data-href="${n.href}">
      <b>${esc(n.tit)}</b>
      <p>${esc(n.desc)}</p>
    </div>
  `).join("");
}

// Exportação e Importação de Backup
function exportBackup() {
  const json = JSON.stringify(S, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `lecasu_backup_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Backup exportado com sucesso.");
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!parsed || !parsed.mov || !parsed.bank) {
        return toast("Ficheiro inválido. Estrutura de dados não reconhecida.");
      }
      S = parsed;
      saveData();
      renderCurrentPage();
      toast("Dados restaurados com sucesso.");
    } catch (err) {
      toast("Erro ao ler o ficheiro JSON.");
    }
  };
  reader.readAsText(file);
}

// Importação de Planilha Excel (.xlsx, .xls, .csv)
let pendingExcelData = null;

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ";" : ",";
  const parseLine = line => {
    const regex = new RegExp(`(?:^|${sep})(\"(?:[^\"]|\"\")*\"|[^${sep}]*)`, "g");
    const fields = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1] || "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      fields.push(val.trim());
    }
    return fields;
  };
  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = cols[idx] !== undefined ? cols[idx] : "";
    });
    rows.push(obj);
  }
  return rows;
}

function handleExcelFile(file) {
  if (!file) return;
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      const rows = parseCSV(text);
      if (!rows.length) return toast("Planilha CSV vazia ou formato não reconhecido.");
      showExcelImportDialog(file.name, rows);
    };
    reader.readAsText(file, "UTF-8");
  } else {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        if (typeof XLSX === "undefined") {
          return toast("Biblioteca XLSX indisponível. Exporte como .CSV no Excel para importar.");
        }
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        if (!json || !json.length) {
          return toast("A folha do Excel está vazia.");
        }
        showExcelImportDialog(file.name, json);
      } catch (err) {
        console.error(err);
        toast("Erro ao ler o ficheiro Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

function showExcelImportDialog(fileName, rows) {
  pendingExcelData = rows;
  const dlg = $("#dlg-excel");
  if (!dlg) return;

  $("#excel-file-info").textContent = `Ficheiro: ${fileName} · ${rows.length} linha(s) encontrada(s)`;

  // Sugestão automática de módulo conforme cabeçalhos
  const colKeys = Object.keys(rows[0] || {}).map(k => k.toLowerCase());
  const selectTarget = $("#excel-target-module");
  
  if (colKeys.some(k => k.includes("salario") || k.includes("salário") || k.includes("colaborador") || k.includes("cargo") || k.includes("bi") || k.includes("admissao") || k.includes("admissão"))) {
    selectTarget.value = "rh";
  } else if (colKeys.some(k => k.includes("stock") || k.includes("armazem") || k.includes("armazém") || k.includes("custo") || k.includes("produto") || k.includes("material"))) {
    selectTarget.value = "materia";
  } else if (colKeys.some(k => k.includes("ativo") || k.includes("activo") || k.includes("inventario") || k.includes("inventário") || k.includes("patrimonio") || k.includes("património") || k.includes("serie") || k.includes("série"))) {
    selectTarget.value = "ativos";
  } else if (colKeys.some(k => k.includes("fornecedor") && (k.includes("factura") || k.includes("fatura") || k.includes("compra")))) {
    selectTarget.value = "ap";
  } else if (colKeys.some(k => k.includes("cliente") || k.includes("factura") || k.includes("fatura"))) {
    selectTarget.value = activeTab === "ap" ? "ap" : "ar";
  } else if (colKeys.some(k => k.includes("nuit") || k.includes("provincia") || k.includes("província") || k.includes("terceiro"))) {
    selectTarget.value = "ter";
  } else if (colKeys.some(k => k.includes("plano") || k.includes("classe") || k.includes("rubrica"))) {
    selectTarget.value = "pc";
  } else if (colKeys.some(k => k.includes("extrato") || k.includes("debito") || k.includes("débito") || k.includes("credito") || k.includes("crédito") || k.includes("entrada") || k.includes("saida") || k.includes("saída"))) {
    selectTarget.value = "mov";
  } else {
    // Fallback inteligente para a página ou aba ativa
    const page = window.location.pathname.split("/").pop() || "";
    if (page.includes("materia")) selectTarget.value = "materia";
    else if (page.includes("rh")) selectTarget.value = "rh";
    else if (page.includes("ativos")) selectTarget.value = "ativos";
    else if (page.includes("clientes")) selectTarget.value = "ter";
    else if (activeTab === "ar" || activeTab === "ap" || activeTab === "ter" || activeTab === "pc") selectTarget.value = activeTab;
    else selectTarget.value = "mov";
  }

  // Pré-visualização das colunas e 4 primeiras linhas
  const previewCols = Object.keys(rows[0] || {}).slice(0, 8);
  let tableHtml = "<table><thead><tr>" + previewCols.map(c => `<th>${esc(c)}</th>`).join("") + "</tr></thead><tbody>";
  rows.slice(0, 4).forEach(r => {
    tableHtml += "<tr>" + previewCols.map(c => `<td>${esc(String(r[c] ?? ""))}</td>`).join("") + "</tr>";
  });
  tableHtml += "</tbody></table>";
  $("#excel-preview-container").innerHTML = tableHtml;

  dlg.showModal();
}

function confirmExcelImport() {
  if (!pendingExcelData || !pendingExcelData.length) return;
  const target = $("#excel-target-module").value;
  const mode = ($("#excel-import-mode") && $("#excel-import-mode").value) || "upsert";
  let inserted = 0;
  let updated = 0;

  const normalizeDate = val => {
    if (!val) return new Date().toISOString().slice(0, 10);
    if (val instanceof Date && !isNaN(val)) {
      return val.toISOString().slice(0, 10);
    }
    // Se for número serial do Excel (ex: 45200 ~ 2023, 46000 ~ 2025/2026)
    if (typeof val === "number" && val > 20000 && val < 80000) {
      try {
        const utcDays = Math.floor(val - 25569);
        const utcValue = utcDays * 86400;
        const dateInfo = new Date(utcValue * 1000);
        if (!isNaN(dateInfo)) return dateInfo.toISOString().slice(0, 10);
      } catch(e) {}
    }
    val = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // Formatos DD/MM/YYYY ou DD-MM-YYYY ou DD.MM.YYYY
    const parts = val.split(/[/-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    return new Date().toISOString().slice(0, 10);
  };

  const normalizeNum = val => {
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    if (!val) return 0;
    let clean = String(val).replace(/MZN|MT|MTn|R\$|\$|\s/gi, "").trim();
    if (clean.includes(",") && clean.includes(".")) {
      if (clean.indexOf(".") < clean.indexOf(",")) {
        clean = clean.replace(/\./g, "").replace(",", ".");
      } else {
        clean = clean.replace(/,/g, "");
      }
    } else if (clean.includes(",")) {
      clean = clean.replace(",", ".");
    }
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  };

  const getCol = (row, names) => {
    if (!row) return "";
    for (const name of names) {
      for (const k of Object.keys(row)) {
        if (k.toLowerCase().trim() === name.toLowerCase().trim()) return row[k];
      }
    }
    for (const name of names) {
      for (const k of Object.keys(row)) {
        if (k.toLowerCase().includes(name.toLowerCase().trim())) return row[k];
      }
    }
    return "";
  };

  // Se o modo for substituição total, zera o array de destino
  if (mode === "replace") {
    if (target === "mov") S.mov = [];
    else if (target === "ar") S.ar = [];
    else if (target === "ap") S.ap = [];
    else if (target === "ter") S.ter = [];
    else if (target === "materia") S.materia = [];
    else if (target === "rh") S.rh = [];
    else if (target === "ativos") S.ativos = [];
    else if (target === "pc") S.pc = [];
  }

  // 1. MÓDULO MOVIMENTOS BANCÁRIOS / TESOURARIA
  if (target === "mov") {
    if (!Array.isArray(S.mov)) S.mov = [];
    pendingExcelData.forEach(r => {
      const desc = getCol(r, ["descrição", "descricao", "desc", "historico", "detalhe"]);
      if (!desc) return;
      const entrada = normalizeNum(getCol(r, ["entrada", "in", "credito", "crédito", "recebimento"]));
      const saida = normalizeNum(getCol(r, ["saída", "saida", "out", "debito", "débito", "pagamento"]));
      if (entrada <= 0 && saida <= 0) return;

      const date = normalizeDate(getCol(r, ["data", "date", "data valor", "data movimento"]));
      const cat = getCol(r, ["categoria", "cat", "rubrica"]) || (entrada > 0 ? "Receita" : "Despesa Operacional");
      const tipo = getCol(r, ["tipo", "tipo de movimento", "operação", "operacao"]) || (entrada > 0 ? "Recebimento de Cliente" : "Pagamento a Fornecedor");
      const doc = getCol(r, ["documento", "doc", "nº documento", "factura", "fatura", "recibo"]);
      const ref = getCol(r, ["ref", "referencia", "referência"]) || ("IMP-" + uid().slice(0, 6).toUpperCase());
      const estado = getCol(r, ["estado", "status"]) || "Reconciliado";
      const conta = getCol(r, ["conta", "conta contábil", "conta contabil"]) || (entrada > 0 ? "41.1" : "42.1");
      const terc = getCol(r, ["terceiro", "cliente", "fornecedor", "entidade"]) || "";

      let existing = null;
      if (mode !== "replace") {
        existing = S.mov.find(m => 
          (doc && m.doc && String(m.doc).toLowerCase().trim() === String(doc).toLowerCase().trim()) ||
          (ref && ref !== "IMP-EXCEL" && m.ref && String(m.ref).toLowerCase().trim() === String(ref).toLowerCase().trim()) ||
          (m.date === date && String(m.desc).toLowerCase().trim() === String(desc).toLowerCase().trim() && Math.abs(m.in - entrada) < 0.01 && Math.abs(m.out - saida) < 0.01)
        );
      }

      if (existing && mode === "upsert") {
        existing.date = date;
        existing.desc = desc;
        existing.cat = cat;
        existing.tipo = tipo;
        existing.in = entrada;
        existing.out = saida;
        if (doc) existing.doc = doc;
        if (ref) existing.ref = ref;
        if (conta) existing.conta = conta;
        if (terc) existing.terc = terc;
        existing.estado = EST.includes(estado) ? estado : existing.estado;
        updated++;
      } else if (!existing) {
        S.mov.push({
          id: uid(),
          date,
          desc,
          cat,
          tipo,
          in: entrada,
          out: saida,
          ref,
          doc,
          conta,
          terc,
          ext: date,
          estado: EST.includes(estado) ? estado : "Reconciliado"
        });
        inserted++;
      }
    });
  } 

  // 2. MÓDULOS DE CONTAS A RECEBER (AR) E CONTAS A PAGAR (AP)
  else if (target === "ar" || target === "ap") {
    const isAr = target === "ar";
    if (isAr && !Array.isArray(S.ar)) S.ar = [];
    if (!isAr && !Array.isArray(S.ap)) S.ap = [];
    const list = isAr ? S.ar : S.ap;

    pendingExcelData.forEach(r => {
      const no = getCol(r, ["nº factura", "factura", "fatura", "doc", "nº documento", "numero", "número"]);
      if (!no) return;
      const base = normalizeNum(getCol(r, ["valor s/ iva", "base", "valor", "subtotal", "montante"]));
      if (base <= 0) return;
      const date = normalizeDate(getCol(r, ["data", "data emissão", "data emissao", "date"]));
      const due = normalizeDate(getCol(r, ["vencimento", "data vencimento", "due", "prazo"]));
      const desc = getCol(r, ["descrição", "descricao", "desc", "artigo", "serviço"]) || `Factura ${no} importada via Excel`;
      const terc = getCol(r, [isAr ? "cliente" : "fornecedor", "terceiro", "entidade", "nome"]) || "";
      let rate = normalizeNum(getCol(r, ["taxa iva", "iva", "taxa", "alíquota", "aliquota"]));
      if (rate > 1) rate = rate / 100;
      if (rate <= 0) rate = 0.16;
      const conta = getCol(r, ["conta", "conta contábil"]) || (isAr ? "41.1" : "42.1");

      let existing = mode !== "replace" ? list.find(x => x.no && String(x.no).toLowerCase().trim() === String(no).toLowerCase().trim()) : null;

      if (existing && mode === "upsert") {
        existing.date = date;
        existing.due = due;
        existing.desc = desc;
        existing.base = base;
        existing.rate = rate;
        if (terc) existing.terc = terc;
        if (conta) existing.conta = conta;
        updated++;
      } else if (!existing) {
        list.push({
          id: uid(),
          no,
          date,
          due,
          desc,
          base,
          rate,
          conta,
          terc
        });
        inserted++;
      }
    });
  } 

  // 3. MÓDULO TERCEIROS (CLIENTES, FORNECEDORES E ESTADO)
  else if (target === "ter") {
    if (!Array.isArray(S.ter)) S.ter = [];
    pendingExcelData.forEach(r => {
      const nome = getCol(r, ["nome", "designação", "designacao", "terceiro", "empresa", "entidade"]);
      if (!nome) return;
      const cod = getCol(r, ["código", "codigo", "cod", "ref"]) || ("TER-" + uid().slice(0, 4).toUpperCase());
      const tipo = getCol(r, ["tipo", "categoria"]) || "Cliente";
      const nuit = getCol(r, ["nuit", "nif"]) || "-";
      const prov = getCol(r, ["província", "provincia", "cidade", "localidade", "endereço", "morada"]) || "Maputo";
      const tel = getCol(r, ["telefone", "tel", "contacto", "celular"]) || "";
      const email = getCol(r, ["email", "e-mail", "correio"]) || "";
      const conta = getCol(r, ["conta", "conta contábil"]) || (tipo.toLowerCase().includes("fornec") ? "42.1" : "41.1");

      let existing = null;
      if (mode !== "replace") {
        existing = S.ter.find(x => 
          (x.cod && String(x.cod).toLowerCase().trim() === String(cod).toLowerCase().trim()) ||
          (nuit && nuit !== "-" && x.nuit && String(x.nuit).trim() === String(nuit).trim()) ||
          (x.nome && String(x.nome).toLowerCase().trim() === String(nome).toLowerCase().trim())
        );
      }

      if (existing && mode === "upsert") {
        existing.nome = nome;
        existing.tipo = tipo;
        if (nuit && nuit !== "-") existing.nuit = nuit;
        if (prov) existing.prov = prov;
        if (tel) existing.tel = tel;
        if (email) existing.email = email;
        if (conta) existing.conta = conta;
        updated++;
      } else if (!existing) {
        S.ter.push({
          id: cod,
          cod,
          nome,
          tipo,
          nuit,
          conta,
          prov,
          tel,
          email,
          cidade: prov
        });
        inserted++;
      }
    });
  } 

  // 4. MÓDULO MATERIAL E PRODUTOS (ESTOQUE & EQUIPAMENTOS SOLARES)
  else if (target === "materia") {
    if (!Array.isArray(S.materia)) S.materia = [];
    pendingExcelData.forEach(r => {
      const nome = getCol(r, ["nome", "designação", "designacao", "produto", "material", "artigo", "descrição", "descricao"]);
      if (!nome) return;
      const cod = getCol(r, ["código", "codigo", "cod", "ref", "referencia", "id"]) || ("MAT-" + uid().slice(0, 4).toUpperCase());
      const cat = getCol(r, ["categoria", "cat", "tipo", "grupo"]) || "Geral";
      const unidade = getCol(r, ["unidade", "unid", "un", "medida"]) || "un";
      const qtd = normalizeNum(getCol(r, ["quantidade", "qtd", "stock", "estoque", "saldo"]));
      const custo = normalizeNum(getCol(r, ["preço de custo", "preco de custo", "custo", "valor compra", "custo unitario", "unitario"]));
      const preco = normalizeNum(getCol(r, ["preço de venda", "preco de venda", "preco", "preço", "venda", "pvp"])) || (custo > 0 ? Math.round(custo * 1.3) : 0);
      const min = normalizeNum(getCol(r, ["stock mínimo", "stock minimo", "minimo", "mínimo", "min"])) || 5;
      const forn = getCol(r, ["fornecedor", "forn", "marca", "origem"]) || "";

      let existing = null;
      if (mode !== "replace") {
        existing = S.materia.find(x => 
          (x.cod && String(x.cod).toLowerCase().trim() === String(cod).toLowerCase().trim()) ||
          (x.nome && String(x.nome).toLowerCase().trim() === String(nome).toLowerCase().trim())
        );
      }

      if (existing && mode === "upsert") {
        existing.nome = nome;
        if (cat) existing.cat = cat;
        if (unidade) existing.unidade = unidade;
        existing.qtd = qtd;
        if (custo > 0) existing.custo = custo;
        if (preco > 0) existing.preco = preco;
        if (min > 0) existing.min = min;
        if (forn) existing.forn = forn;
        updated++;
      } else if (!existing) {
        S.materia.push({
          id: cod,
          cod,
          nome,
          cat,
          unidade,
          qtd,
          custo,
          preco,
          min,
          forn
        });
        inserted++;
      }
    });
  }

  // 5. MÓDULO RECURSOS HUMANOS (COLABORADORES & FOLHA)
  else if (target === "rh") {
    if (!Array.isArray(S.rh)) S.rh = [];
    pendingExcelData.forEach(r => {
      const nome = getCol(r, ["nome", "nome completo", "colaborador", "funcionario", "trabalhador"]);
      if (!nome) return;
      const cod = getCol(r, ["código", "codigo", "cod", "id", "nº", "numero"]) || ("COL-" + uid().slice(0, 4).toUpperCase());
      const cargo = getCol(r, ["cargo", "função", "funcao", "posto", "ocupação"]) || "Técnico";
      const dept = getCol(r, ["departamento", "dept", "sector", "área", "area"]) || "Operações & Campo";
      const salario = normalizeNum(getCol(r, ["salário", "salario", "vencimento", "salário base", "salario base", "remuneração"]));
      const nuit = getCol(r, ["nuit", "nif"]) || "-";
      const bi = getCol(r, ["bi", "bilhete de identidade", "doc identificação", "identificação"]) || "";
      const data_adm = normalizeDate(getCol(r, ["data admissão", "data admissao", "admissão", "admissao", "data início", "data"]));
      const estado = getCol(r, ["estado", "status", "situação"]) || "Activo";
      const contacto = getCol(r, ["contacto", "telefone", "celular", "tel"]) || "";
      const email = getCol(r, ["email", "e-mail", "correio"]) || "";

      let existing = null;
      if (mode !== "replace") {
        existing = S.rh.find(x => 
          (x.cod && String(x.cod).toLowerCase().trim() === String(cod).toLowerCase().trim()) ||
          (nuit && nuit !== "-" && x.nuit && String(x.nuit).trim() === String(nuit).trim()) ||
          (bi && x.bi && String(x.bi).toLowerCase().trim() === String(bi).toLowerCase().trim()) ||
          (x.nome && String(x.nome).toLowerCase().trim() === String(nome).toLowerCase().trim())
        );
      }

      if (existing && mode === "upsert") {
        existing.nome = nome;
        if (cargo) existing.cargo = cargo;
        if (dept) existing.dept = dept;
        if (salario > 0) existing.salario = salario;
        if (nuit && nuit !== "-") existing.nuit = nuit;
        if (bi) existing.bi = bi;
        if (data_adm) existing.data_adm = data_adm;
        if (estado) existing.estado = estado;
        if (contacto) existing.contacto = contacto;
        if (email) existing.email = email;
        updated++;
      } else if (!existing) {
        S.rh.push({
          id: cod,
          cod,
          nome,
          cargo,
          dept,
          salario,
          nuit,
          bi,
          data_adm,
          estado,
          contacto,
          email
        });
        inserted++;
      }
    });
  }

  // 6. MÓDULO ATIVOS E INVENTÁRIOS (PATRIMÓNIO IMOBILIZADO)
  else if (target === "ativos") {
    if (!Array.isArray(S.ativos)) S.ativos = [];
    pendingExcelData.forEach(r => {
      const nome = getCol(r, ["nome", "designação", "designacao", "bem", "artigo", "descrição", "item"]);
      if (!nome) return;
      const cod = getCol(r, ["código", "codigo", "cod", "num inventario", "inventario", "id"]) || ("LEC-INF-" + uid().slice(0, 4).toUpperCase());
      const cat = getCol(r, ["categoria", "cat", "tipo", "grupo"]) || "Mobiliário";
      const marca = getCol(r, ["marca", "fabricante"]) || "N/A";
      const serie = getCol(r, ["nº de série", "nº serie", "serie", "número de série"]) || "";
      const qtd = normalizeNum(getCol(r, ["quantidade", "qtd"])) || 1;
      const unidade = getCol(r, ["unidade", "unid", "un"]) || "un";
      const localizacao = getCol(r, ["localização", "localizacao", "local", "sala", "sector"]) || "Escritório";
      const responsavel = getCol(r, ["responsável", "responsavel", "atribuído a", "posse", "usuario"]) || "N/A";
      const data_aquisicao = normalizeDate(getCol(r, ["data aquisição", "data aquisicao", "aquisicao", "data compra", "data"]));
      const valor_unitario = normalizeNum(getCol(r, ["valor unitário", "valor unitario", "custo", "valor", "preço"]));
      const fornecedor = getCol(r, ["fornecedor", "forn", "vendedor"]) || "";
      const factura = getCol(r, ["factura", "fatura", "doc", "nº factura", "documento"]) || "";
      const estado = getCol(r, ["estado", "condição", "condicao", "status"]) || "Bom";
      const ultima_verif = normalizeDate(getCol(r, ["última verificação", "ultima verificacao", "verificação", "revisão"]));
      const obs = getCol(r, ["observações", "observacoes", "notas", "obs"]) || "";

      let existing = null;
      if (mode !== "replace") {
        existing = S.ativos.find(x => 
          (x.cod && String(x.cod).toLowerCase().trim() === String(cod).toLowerCase().trim()) ||
          (serie && serie !== "N/A" && x.serie && String(x.serie).toLowerCase().trim() === String(serie).toLowerCase().trim()) ||
          (x.nome && String(x.nome).toLowerCase().trim() === String(nome).toLowerCase().trim() && x.marca === marca)
        );
      }

      if (existing && mode === "upsert") {
        existing.nome = nome;
        if (cat) existing.cat = cat;
        if (marca) existing.marca = marca;
        if (serie) existing.serie = serie;
        if (qtd > 0) existing.qtd = qtd;
        if (unidade) existing.unidade = unidade;
        if (localizacao) existing.localizacao = localizacao;
        if (responsavel) existing.responsavel = responsavel;
        if (data_aquisicao) existing.data_aquisicao = data_aquisicao;
        if (valor_unitario > 0) existing.valor_unitario = valor_unitario;
        if (fornecedor) existing.fornecedor = fornecedor;
        if (factura) existing.factura = factura;
        if (estado) existing.estado = estado;
        if (ultima_verif) existing.ultima_verif = ultima_verif;
        if (obs) existing.obs = obs;
        updated++;
      } else if (!existing) {
        S.ativos.push({
          id: cod,
          cod,
          nome,
          cat,
          marca,
          serie,
          qtd,
          unidade,
          localizacao,
          responsavel,
          data_aquisicao,
          valor_unitario,
          fornecedor,
          factura,
          estado,
          ultima_verif,
          obs
        });
        inserted++;
      }
    });
  }

  // 7. MÓDULO PLANO DE CONTAS (PGC-NIRF)
  else if (target === "pc") {
    if (!Array.isArray(S.pc)) S.pc = [];
    pendingExcelData.forEach(r => {
      const cod = getCol(r, ["código", "codigo", "cod", "conta", "numero"]);
      const des = getCol(r, ["designação", "designacao", "descricao", "descrição", "nome"]);
      if (!cod || !des) return;
      const niv = getCol(r, ["classe", "nível", "nivel", "grau"]) || "Movimento";
      const tipo = getCol(r, ["tipo", "tipo de conta"]) || "Balanço";
      const saldo = normalizeNum(getCol(r, ["saldo", "saldo inicial", "valor"]));

      let existing = mode !== "replace" ? S.pc.find(x => x.cod && String(x.cod).trim() === String(cod).trim()) : null;

      if (existing && mode === "upsert") {
        existing.des = des;
        if (niv) existing.niv = niv;
        if (tipo) existing.tipo = tipo;
        if (saldo !== 0) existing.saldo = saldo;
        updated++;
      } else if (!existing) {
        S.pc.push({
          id: cod,
          cod,
          des,
          niv,
          tipo,
          orig: "Importado via Excel",
          saldo
        });
        inserted++;
      }
    });
  }

  saveData();
  const dlg = $("#dlg-excel");
  if (dlg) dlg.close();
  renderCurrentPage();

  if (mode === "replace") {
    toast(`Módulo substituído com sucesso! ${inserted} registo(s) importado(s) da planilha.`);
  } else if (updated > 0) {
    toast(`Sucesso: ${inserted} novo(s) registo(s) adicionado(s) e ${updated} registo(s) actualizado(s)!`);
  } else {
    toast(`${inserted} registo(s) importado(s) com sucesso da planilha Excel!`);
  }
}

// Event Listeners Globais
function setupGlobalListeners() {
  try { restoreSidebarState(); } catch (e) {}
  try { updateClock(); } catch (e) {}
  try { setInterval(updateClock, 1000); } catch (e) {}
  try { syncHeaderPeriodSelector(); } catch (e) {}
  try { initNotifications(); } catch (e) {}

  document.addEventListener("click", e => {
    // Dropdown de Notificações
    const btnNotif = e.target.closest("#btn-notif");
    const notifDrop = $("#notif-dropdown");
    if (btnNotif) {
      if (notifDrop) notifDrop.classList.toggle("show");
      return;
    } else if (notifDrop && !notifDrop.contains(e.target)) {
      notifDrop.classList.remove("show");
    }

    // Intercetar cliques nos links da barra lateral para navegação SPA instantânea e fluida
    const navLink = e.target.closest("#nav a");
    if (navLink) {
      const href = navLink.getAttribute("href");
      if (href && !href.startsWith("http") && !href.startsWith("#") && !href.includes("login")) {
        e.preventDefault();
        navigateToPage(href, true);
        return;
      }
    }

    const brandLink = e.target.closest(".brand-link");
    if (brandLink) {
      e.preventDefault();
      navigateToPage("dashboard.html", true);
      return;
    }

    // Toggle da Sidebar (Recolher / Expandir)
    if (e.target.closest("#toggle-sidebar")) {
      toggleSidebar();
      return;
    }

    const b = e.target.closest("button");
    if (!b) return;

    if (b.dataset.tab) {
      activeTab = b.dataset.tab;
      try {
        history.replaceState(null, "", "#" + activeTab);
      } catch (err) {}
      searchQ = "";
      renderCurrentPage();
      return;
    }

    if (b.id === "dc") return $("#dlg").close();
    if (b.id === "ds") return submitForm();

    // Filtros de Módulos e Abas de Relatório
    if (b.dataset.filterTer) {
      terFilter = b.dataset.filterTer;
      renderCurrentPage();
      return;
    }
    if (b.dataset.filterMateria) {
      materiaCatFilter = b.dataset.filterMateria;
      renderCurrentPage();
      return;
    }
    if (b.dataset.filterAtivos) {
      ativosCatFilter = b.dataset.filterAtivos;
      renderCurrentPage();
      return;
    }
    if (b.dataset.filterRh) {
      rhDeptFilter = b.dataset.filterRh;
      renderCurrentPage();
      return;
    }
    if (b.dataset.scrollTo) {
      const target = document.getElementById(b.dataset.scrollTo);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
        target.style.borderColor = "var(--ac)";
        target.style.boxShadow = "0 0 0 4px rgba(254, 129, 0, 0.25)";
        setTimeout(() => {
          target.style.borderColor = "";
          target.style.boxShadow = "";
        }, 1500);
      }
      return;
    }
    if (b.dataset.repTab) {
      repTabActive = b.dataset.repTab;
      renderCurrentPage();
      return;
    }
    if (b.id === "prt-rep") return window.print();

    // Importação Excel
    if (b.id === "btn-import-excel") {
      const f = $("#file-excel-import");
      if (f) f.click();
      return;
    }
    if (b.id === "excel-cancel") {
      const dlg = $("#dlg-excel");
      if (dlg) dlg.close();
      pendingExcelData = null;
      return;
    }
    if (b.id === "excel-confirm") {
      confirmExcelImport();
      return;
    }

    // Configurações e Backup
    if (b.id === "save-config") {
      if (!S.config) S.config = {};
      const empresa = $("#cfg_empresa")?.value?.trim() || S.config.empresa;
      const nuit = $("#cfg_nuit")?.value?.trim() || S.config.nuit;
      const actividade = $("#cfg_actividade")?.value?.trim() || "";
      const morada = $("#cfg_morada")?.value?.trim() || "";
      const contacto = $("#cfg_contacto")?.value?.trim() || "";
      const email = $("#cfg_email")?.value?.trim() || "";
      const moeda = $("#cfg_moeda")?.value?.trim() || "MZN";
      const taxaIvaVal = parseFloat($("#cfg_taxa_iva")?.value);
      const taxa_iva = !isNaN(taxaIvaVal) ? r2(taxaIvaVal / 100) : (S.config.taxa_iva || 0.16);
      const exercicio = $("#cfg_exercicio")?.value?.trim() || S.config.exercicio;
      const banco_padrao = $("#cfg_banco_padrao")?.value || S.config.banco_padrao;
      const contabilista = $("#cfg_contabilista")?.value?.trim() || "";

      S.config = {
        ...S.config,
        empresa,
        nuit,
        actividade,
        morada,
        contacto,
        email,
        moeda,
        taxa_iva,
        exercicio,
        banco_padrao,
        contabilista
      };
      saveData();
      renderCurrentPage();
      toast("Configurações corporativas gravadas com sucesso!");
      return;
    }

    if (b.id === "btn-test-db") {
      const fetchCall = (typeof DBClient !== "undefined" && DBClient.fetchApi) ? DBClient.fetchApi("health") : fetch("/api/health");
      Promise.resolve(fetchCall)
        .then(r => r ? r.json() : Promise.reject())
        .then(d => {
          if (d && d.status === "online") {
            toast(`Conexão bem-sucedida ao Neon PostgreSQL (${d.database})!`);
          } else {
            toast("Erro: " + ((d && d.message) || "Não foi possível conectar."));
          }
        })
        .catch(() => toast("Não foi possível conectar ao Neon PostgreSQL."));
      return;
    }
    if (b.id === "btn-sync-db") {
      if (typeof DBClient !== "undefined" && DBClient.pushState) {
        toast("A enviar dados para a base de dados Neon...");
        DBClient.pushState(S).then(() => {
          toast("Sincronização concluída com sucesso no Neon PostgreSQL!");
        });
      }
      return;
    }
    if (b.id === "cfg-btn-exp") return exportBackup();
    if (b.id === "cfg-btn-imp") {
      const f = $("#file-import");
      if (f) f.click();
      return;
    }
    if (b.id === "confirm-cancel") {
      const dlg = $("#dlg-confirm");
      if (dlg) dlg.close();
      pendingConfirmAction = null;
      return;
    }
    if (b.id === "confirm-ok") {
      if (pendingConfirmAction) {
        pendingConfirmAction();
        pendingConfirmAction = null;
      }
      const dlg = $("#dlg-confirm");
      if (dlg) dlg.close();
      return;
    }

    if (b.id === "cfg-btn-rst" || b.id === "rst") {
      showConfirm(
        "Zerar / Repor Sistema a Zero",
        "Tem a certeza que deseja ZERAR o sistema? Todas as movimentações, facturas, clientes e materiais fictícios serão apagados na base de dados Neon PostgreSQL e no cache local, ficando o ERP 100% limpo a ZERO para o registo dos seus dados reais.",
        async () => {
          if (typeof DBClient !== "undefined" && typeof DBClient.realResetSystem === "function") {
            toast("A zerar a base de dados Neon PostgreSQL...");
            const res = await DBClient.realResetSystem();
            renderCurrentPage();
            toast(res.message || "Sistema e Base de Dados Neon zerados com sucesso!");
          } else {
            resetData();
            renderCurrentPage();
            toast("Dados locais zerados com sucesso.");
          }
        },
        "Sim, Zerar Tudo",
        true
      );
      return;
    }

    const a = b.dataset.a;
    if (a === "new") openF(b.dataset.k);
    if (a === "edit") openF(b.dataset.k, b.dataset.id);
    if (a === "del") {
      showConfirm(
        "Confirmar Eliminação",
        "Tem a certeza que deseja eliminar este registo? Esta ação não pode ser desfeita.",
        () => delItem(b.dataset.k, b.dataset.id),
        "Sim, Eliminar",
        true
      );
      return;
    }
  });

  // Sincronização em Tempo Real entre Abas/Janelas
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const syncChannel = new BroadcastChannel("lecasu_erp_channel");
      syncChannel.onmessage = ev => {
        if (ev.data && ev.data.type === "SYNC") {
          S = loadData();
          renderCurrentPage();
          initNotifications();
        }
      };
    } catch (err) {}
  }

  if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("storage", ev => {
      if (ev.key === KEY) {
        S = loadData();
        renderCurrentPage();
        initNotifications();
      }
    });
  }

  document.addEventListener("change", e => {
    if (e.target.id === "file-excel-import" && e.target.files && e.target.files.length) {
      handleExcelFile(e.target.files[0]);
      e.target.value = "";
      return;
    }
    if (e.target.id === "file-import" && e.target.files && e.target.files.length) {
      importBackup(e.target.files[0]);
      e.target.value = "";
      return;
    }
    const f = e.target.dataset.f;
    if (!f) return;
    S[f] = f === "ref" ? e.target.value : parseMoney(e.target.value);
    saveData();
    renderCurrentPage();
  });

  document.addEventListener("focusin", e => {
    if (e.target.classList.contains("money-input")) {
      e.target.value = e.target.value.replace(/ MZN$/i, "").trim();
      setTimeout(() => e.target.select(), 10);
    }
  });

  document.addEventListener("focusout", e => {
    if (e.target.classList.contains("money-input")) {
      const val = parseMoney(e.target.value);
      e.target.value = m(val);
    }
  });

  document.addEventListener("input", e => {
    if (e.target.id === "q") {
      searchQ = e.target.value;
      const p = e.target.selectionStart;
      renderCurrentPage();
      const n = $("#q");
      if (n) {
        n.focus();
        n.setSelectionRange(p, p);
      }
    }
  });

  // Histórico de navegação do browser (Avançar / Recuar)
  window.addEventListener("popstate", () => {
    const fileName = window.location.pathname.split("/").pop().split("#")[0] || "dashboard.html";
    if (PAGE_MODULES[fileName]) {
      navigateToPage(fileName, false);
    }
  });

  // Registro do Service Worker para suporte a PWA Desktop
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator && window.location.protocol && window.location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(err => {
      console.warn("Service Worker não registrado:", err);
    });
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupGlobalListeners);
  } else {
    setupGlobalListeners();
  }
}
