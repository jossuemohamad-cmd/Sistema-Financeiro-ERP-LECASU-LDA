/**
 * LECASU, LDA. - Sistema Financeiro ERP
 * Dados Iniciais (SEED), Constantes e Camada de Persistência (data.js)
 */

const KEY = "lecasu-recon-v1";

const CAT = [
  "Receita",
  "Despesa Operacional",
  "Despesas Extras",
  "Investimentos",
  "Impostos e Encargos",
  "Transferência Interna"
];

const TIPO = [
  "Recebimento de Cliente",
  "Pagamento a Fornecedor",
  "Despesa Directa",
  "Salários",
  "Impostos e Contribuições",
  "Movimento de Sócios",
  "Transferência Interna",
  "Encargos Bancários",
  "Rendimentos Financeiros"
];

const EST = [
  "Reconciliado",
  "Em trânsito",
  "Só no extracto",
  "Por identificar"
];

const PGC_STANDARD_MOZAMBIQUE = [
  { id: "1", cod: "1", des: "MEIOS MONETÁRIOS", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "11", cod: "11", des: "Caixa", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "12", cod: "12", des: "Bancos", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "12.1", cod: "12.1", des: "Depósitos à ordem", niv: "Subconta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "12.1.1", cod: "12.1.1", des: "NedBank – Conta corrente MZN", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "12.1.2", cod: "12.1.2", des: "FNB – Conta corrente MZN", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "2", cod: "2", des: "INVENTÁRIOS E ACTIVOS BIOLÓGICOS", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "21", cod: "21", des: "Compras", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "26", cod: "26", des: "Matérias-primas, subsidiárias e de consumo", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "3", cod: "3", des: "INVESTIMENTOS DE CAPITAL", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "32", cod: "32", des: "Activos tangíveis", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "33", cod: "33", des: "Activos intangíveis", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "4", cod: "4", des: "CONTAS A RECEBER, CONTAS A PAGAR, ACRÉSCIMOS E DIFERIMENTOS", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "41", cod: "41", des: "Clientes", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "41.1", cod: "41.1", des: "Clientes c/c", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "42", cod: "42", des: "Fornecedores", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "42.1", cod: "42.1", des: "Fornecedores c/c", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "43", cod: "43", des: "Empréstimos obtidos", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "44", cod: "44", des: "Estado", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "44.2", cod: "44.2", des: "Estado – IRPS retido a terceiros", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "44.3.1", cod: "44.3.1", des: "IVA suportado", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "44.3.3", cod: "44.3.3", des: "IVA liquidado", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "44.3.5", cod: "44.3.5", des: "IVA – apuramento / a pagar", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "44.9", cod: "44.9", des: "Segurança social – INSS", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "45", cod: "45", des: "Outras contas a receber e a pagar", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "45.1", cod: "45.1", des: "Pessoal – remunerações a pagar", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "45.4", cod: "45.4", des: "Sócios – conta corrente", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU", saldo: 0 },
  { id: "5", cod: "5", des: "CAPITAL PRÓPRIO", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "51", cod: "51", des: "Capital", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF", saldo: 0 },
  { id: "6", cod: "6", des: "GASTOS E PERDAS", niv: "Classe", tipo: "Resultados", orig: "PGC-NIRF", saldo: 0 },
  { id: "62", cod: "62", des: "Gastos com o pessoal", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF", saldo: 0 },
  { id: "62.1", cod: "62.1", des: "Remunerações do pessoal", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "63", cod: "63", des: "Fornecimentos e serviços de terceiros", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF", saldo: 0 },
  { id: "63.1", cod: "63.1", des: "Transportes e deslocações", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "63.2", cod: "63.2", des: "Honorários e serviços especializados", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "63.3", cod: "63.3", des: "Rendas e alugueres", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "63.4", cod: "63.4", des: "Combustíveis", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "63.5", cod: "63.5", des: "Comunicações e subscrições de software", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "69", cod: "69", des: "Gastos e perdas financeiros", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF", saldo: 0 },
  { id: "69.8", cod: "69.8", des: "Serviços bancários e comissões", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "7", cod: "7", des: "RENDIMENTOS E GANHOS", niv: "Classe", tipo: "Resultados", orig: "PGC-NIRF", saldo: 0 },
  { id: "71", cod: "71", des: "Vendas", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF", saldo: 0 },
  { id: "71.1", cod: "71.1", des: "Vendas – equipamento solar", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "72", cod: "72", des: "Prestações de serviços", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF", saldo: 0 },
  { id: "72.1", cod: "72.1", des: "Instalação e manutenção", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 },
  { id: "78", cod: "78", des: "Rendimentos e ganhos financeiros", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF", saldo: 0 },
  { id: "78.1", cod: "78.1", des: "Juros obtidos", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU", saldo: 0 }
];
if (typeof window !== "undefined") window.PGC_STANDARD_MOZAMBIQUE = PGC_STANDARD_MOZAMBIQUE;

const SEED = {
  ini: 0,
  ext: 0,
  ref: "2026-11-10",
  bank: "",
  mov: [],
  ar: [],
  ap: [],
  ter: [],
  pc: [],
  materia: [],
  rh: [],
  ativos: [],
  config: {
    empresa: "LECASU, LDA.",
    nuit: "400999888",
    actividade: "Energias Renováveis, Instalações Solares e Engenharia Elétrica",
    morada: "Av. 24 de Julho, n.º 1250, 4.º Andar, Maputo, Moçambique",
    contacto: "+258 84 123 4567 / +258 21 300 400",
    email: "financeiro@lecasu.co.mz",
    moeda: "MZN",
    taxa_iva: 0.16,
    exercicio: "2026",
    mes: "11",
    banco_padrao: "12.1.1",
    contabilista: "Gabinete Contas Certas (Certificado n.º 4412/OCAM)"
  }
};

// Obtenção da data e fuso horário oficial (Moçambique - Africa/Maputo, CAT: UTC+2)
function getMaputoDateNow() {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Maputo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const [y, m, d] = formatter.format(now).split("-");
    return { ano: y, mes: m, dia: d, iso: `${y}-${m}-${d}`, dataFormatada: `${d}/${m}/${y}` };
  } catch (e) {
    return { ano: "2026", mes: "11", dia: "09", iso: "2026-11-09", dataFormatada: "09/11/2026" };
  }
}

let S = loadData();


// Função de saneamento para blindar o estado contra nulos/indefinidos e garantir tempo real
function sanitizeState(data) {
  const rt = getMaputoDateNow();
  if (!data || typeof data !== "object") {
    data = structuredClone(SEED);
  }
  if (!Array.isArray(data.mov)) data.mov = Array.isArray(SEED.mov) ? structuredClone(SEED.mov) : [];
  if (!Array.isArray(data.ar)) data.ar = Array.isArray(SEED.ar) ? structuredClone(SEED.ar) : [];
  if (!Array.isArray(data.ap)) data.ap = Array.isArray(SEED.ap) ? structuredClone(SEED.ap) : [];
  if (!Array.isArray(data.ter)) data.ter = Array.isArray(SEED.ter) ? structuredClone(SEED.ter) : [];
  if (!Array.isArray(data.materia)) data.materia = Array.isArray(SEED.materia) ? structuredClone(SEED.materia) : [];
  if (!Array.isArray(data.rh)) data.rh = Array.isArray(SEED.rh) ? structuredClone(SEED.rh) : [];
  if (!Array.isArray(data.ativos)) data.ativos = Array.isArray(SEED.ativos) ? structuredClone(SEED.ativos) : [];
  if (!Array.isArray(data.bank)) data.bank = Array.isArray(SEED.bank) ? structuredClone(SEED.bank) : [];
  if (!Array.isArray(data.pc)) data.pc = Array.isArray(SEED.pc) ? structuredClone(SEED.pc) : [];
  if (typeof data.ini !== "number" || isNaN(data.ini)) data.ini = typeof SEED.ini === "number" ? SEED.ini : 0;
  if (typeof data.ext !== "number" || isNaN(data.ext)) data.ext = typeof SEED.ext === "number" ? SEED.ext : 0;
  if (!data.config || typeof data.config !== "object") data.config = structuredClone(SEED.config || {});

  // Mês e ano atual em tempo real Moçambique (Africa/Maputo, CAT: UTC+2)
  if (!data.config.mes || data.config.mes === "09" || !data.config.userSessionSelected) {
    data.config.mes = rt.mes;
    data.config.exercicio = rt.ano;
  }
  data.ref = rt.iso;
  return data;
}
if (typeof window !== "undefined") window.sanitizeState = sanitizeState;

function loadData() {
  const rt = getMaputoDateNow();
  try {
    const j = localStorage.getItem(KEY);
    if (j) {
      const data = JSON.parse(j);
      return sanitizeState(data);
    }
  } catch (e) {
    console.error("Erro ao ler localStorage", e);
  }
  return getZeroState();
}

function resetData() {
  S = getZeroState();
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
  notifySync();
}

function notifySync() {
  try {
    if (typeof BroadcastChannel !== "undefined") {
      if (!window.__lecasuChannel) {
        window.__lecasuChannel = new BroadcastChannel("lecasu_erp_channel");
      }
      window.__lecasuChannel.postMessage({ type: "SYNC", ts: Date.now() });
    }
  } catch (e) {}
}

function saveData() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
    notifySync();
    if (typeof DBClient !== "undefined" && typeof DBClient.pushState === "function") {
      DBClient.pushState(S);
    }
  } catch (e) {
    console.error("Erro ao guardar no localStorage", e);
  }
}

function getZeroState() {
  const rt = getMaputoDateNow();
  return {
    ini: 0,
    ext: 0,
    ref: rt.iso,
    mov: [],
    ar: [],
    ap: [],
    ter: [],
    materia: [],
    rh: [],
    ativos: [],
    book: [],
    ex: [],
    bank: [],
    pc: [],
    config: {
      empresa: "LECASU, LDA.",
      nuit: "400999888",
      actividade: "Energias Renováveis, Instalações Solares e Engenharia Elétrica",
      morada: "Av. 24 de Julho, n.º 1250, 4.º Andar, Maputo, Moçambique",
      contacto: "+258 84 123 4567 / +258 21 300 400",
      email: "financeiro@lecasu.co.mz",
      moeda: "MZN",
      taxa_iva: 0.16,
      exercicio: rt.ano,
      mes: rt.mes,
      banco_padrao: "12.1.1",
      contabilista: "Gabinete Contas Certas (Certificado n.º 4412/OCAM)"
    }
  };
}

