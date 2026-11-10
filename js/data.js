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

const SEED = {
  ini: 245380.5,
  ext: 129613.1,
  ref: "2026-11-10",
  bank: "12.1.1",
  mov: [
    { id: "m12", date: "2026-09-03", desc: "Recebimento FT 2026/041 – Pousada Maré Alta", cat: "Receita", in: 232000.0, out: 0, ref: "TRF-IN-0903", tipo: "Recebimento de Cliente", conta: "41.1", terc: "CLI-001", doc: "FT 2026/041", ext: "2026-09-03", estado: "Reconciliado" },
    { id: "m13", date: "2026-09-03", desc: "Pgto FT ST-8812 – SolarTech (painéis 550 W)", cat: "Despesa Operacional", in: 0, out: 185600.0, ref: "TRF-OUT-0903", tipo: "Pagamento a Fornecedor", conta: "42.1", terc: "FOR-001", doc: "ST-8812", ext: "2026-09-03", estado: "Reconciliado" },
    { id: "m14", date: "2026-09-04", desc: "Pgto FT TRM-221 – Transporte de material", cat: "Despesa Operacional", in: 0, out: 8700.0, ref: "TRF-OUT-0904", tipo: "Pagamento a Fornecedor", conta: "42.1", terc: "FOR-003", doc: "TRM-221", ext: "2026-09-04", estado: "Reconciliado" },
    { id: "m15", date: "2026-09-07", desc: "Recebimento 50% FT 2026/043 – Clínica Vida Nova", cat: "Receita", in: 116000.0, out: 0, ref: "TRF-IN-0907", tipo: "Recebimento de Cliente", conta: "41.1", terc: "CLI-002", doc: "FT 2026/043", ext: "2026-09-07", estado: "Reconciliado" },
    { id: "m16", date: "2026-09-08", desc: "Pgto FT GCC-09/26 – Honorários contabilidade", cat: "Despesa Operacional", in: 0, out: 17400.0, ref: "TRF-OUT-0908", tipo: "Pagamento a Fornecedor", conta: "42.1", terc: "FOR-004", doc: "GCC-09/26", ext: "2026-09-08", estado: "Reconciliado" },
    { id: "m17", date: "2026-09-08", desc: "Subscrição LinkedIn (2 utilizadores)", cat: "Despesas Extras", in: 0, out: 5200.0, ref: "CARD-0908", tipo: "Despesa Directa", conta: "63.5", terc: "", doc: "REC-LI-0908", ext: "2026-09-09", estado: "Reconciliado" },
    { id: "m18", date: "2026-09-10", desc: "Transferência Sócio A – adiantamento por conta de lucros", cat: "Despesas Extras", in: 0, out: 15000.0, ref: "TRF-OUT-0910A", tipo: "Movimento de Sócios", conta: "45.4", terc: "SOC-001", doc: "OT-0910-A", ext: "2026-09-10", estado: "Reconciliado" },
    { id: "m19", date: "2026-09-10", desc: "Transferência Sócio B – adiantamento por conta de lucros", cat: "Despesas Extras", in: 0, out: 15000.0, ref: "TRF-OUT-0910B", tipo: "Movimento de Sócios", conta: "45.4", terc: "SOC-002", doc: "OT-0910-B", ext: "2026-09-10", estado: "Reconciliado" },
    { id: "m20", date: "2026-09-12", desc: "Combustível – deslocação obra Matola", cat: "Despesa Operacional", in: 0, out: 3500.0, ref: "POS-0912", tipo: "Despesa Directa", conta: "63.4", terc: "FOR-007", doc: "VD-55821", ext: "2026-09-12", estado: "Reconciliado" },
    { id: "m21", date: "2026-09-15", desc: "Pagamento INSS – Agosto 2026", cat: "Impostos e Encargos", in: 0, out: 4620.0, ref: "TRF-OUT-0915A", tipo: "Impostos e Contribuições", conta: "44.9", terc: "EST-002", doc: "GUIA INSS 08/26", ext: "2026-09-15", estado: "Reconciliado" },
    { id: "m22", date: "2026-09-15", desc: "Pagamento IRPS retido – Agosto 2026", cat: "Impostos e Encargos", in: 0, out: 3150.0, ref: "TRF-OUT-0915B", tipo: "Impostos e Contribuições", conta: "44.2", terc: "EST-001", doc: "GUIA IRPS 08/26", ext: "2026-09-15", estado: "Reconciliado" },
    { id: "m23", date: "2026-09-22", desc: "Recebimento FT 2026/038 – Escola Comunitária Esperança", cat: "Receita", in: 87000.0, out: 0, ref: "TRF-IN-0922", tipo: "Recebimento de Cliente", conta: "41.1", terc: "CLI-003", doc: "FT 2026/038", ext: "2026-09-22", estado: "Reconciliado" },
    { id: "m24", date: "2026-09-24", desc: "Pgto FT BE-3307 – Baterias de lítio 5 kWh", cat: "Despesa Operacional", in: 0, out: 139200.0, ref: "TRF-OUT-0924", tipo: "Pagamento a Fornecedor", conta: "42.1", terc: "FOR-002", doc: "BE-3307", ext: "2026-09-24", estado: "Reconciliado" },
    { id: "m25", date: "2026-09-25", desc: "Pagamento IVA – apuramento Agosto 2026", cat: "Impostos e Encargos", in: 0, out: 12880.0, ref: "TRF-OUT-0925A", tipo: "Impostos e Contribuições", conta: "44.3.5", terc: "EST-001", doc: "GUIA IVA 08/26", ext: "2026-09-25", estado: "Reconciliado" },
    { id: "m26", date: "2026-09-25", desc: "Salários Setembro 2026 – 3 trabalhadores (líquido)", cat: "Despesa Operacional", in: 0, out: 41230.0, ref: "TRF-OUT-0925B", tipo: "Salários", conta: "45.1", terc: "PES-000", doc: "FOLHA SAL 09/26", ext: "2026-09-25", estado: "Reconciliado" },
    { id: "m27", date: "2026-09-26", desc: "Pgto FT ISM-10/26 – Renda escritório Outubro", cat: "Despesa Operacional", in: 0, out: 18000.0, ref: "TRF-OUT-0926", tipo: "Pagamento a Fornecedor", conta: "42.1", terc: "FOR-006", doc: "ISM-10/26", ext: "2026-09-28", estado: "Reconciliado" },
    { id: "m28", date: "2026-09-28", desc: "Transferência para conta LECASU FNB", cat: "Transferência Interna", in: 0, out: 80000.0, ref: "TRF-INT-0928", tipo: "Transferência Interna", conta: "12.1.2", terc: "BAN-001", doc: "TRF INTERNA 0928", ext: "2026-09-28", estado: "Reconciliado" },
    { id: "m29", date: "2026-09-30", desc: "Depósito cheque FT 2026/045 – Pousada Maré Alta", cat: "Receita", in: 46400.0, out: 0, ref: "CHQ-DEP-0930", tipo: "Recebimento de Cliente", conta: "41.1", terc: "CLI-001", doc: "FT 2026/045", ext: "", estado: "Em trânsito" },
    { id: "m30", date: "2026-09-30", desc: "Pgto FT CFC-1190 – Cabos e acessórios (TRF agendada)", cat: "Despesa Operacional", in: 0, out: 23200.0, ref: "TRF-OUT-0930", tipo: "Pagamento a Fornecedor", conta: "42.1", terc: "FOR-005", doc: "CFC-1190", ext: "", estado: "Em trânsito" },
    { id: "m34", date: "2026-09-30", desc: "Comissões de transferências – 14 operações", cat: "Despesa Operacional", in: 0, out: 980.0, ref: "EXT-COM-09", tipo: "Encargos Bancários", conta: "69.8", terc: "", doc: "Extracto 09/2026", ext: "2026-09-30", estado: "Só no extracto" },
    { id: "m35", date: "2026-09-30", desc: "Comissão de manutenção de conta", cat: "Despesa Operacional", in: 0, out: 350.0, ref: "EXT-MAN-09", tipo: "Encargos Bancários", conta: "69.8", terc: "", doc: "Extracto 09/2026", ext: "2026-09-30", estado: "Só no extracto" },
    { id: "m36", date: "2026-09-30", desc: "Juros credores", cat: "Receita", in: 42.6, out: 0, ref: "EXT-JUR-09", tipo: "Rendimentos Financeiros", conta: "78.1", terc: "", doc: "Extracto 09/2026", ext: "2026-09-30", estado: "Só no extracto" },
    { id: "m40", date: "2026-11-02", desc: "Recebimento FT 2026/046 – Bombagem solar Maputo", cat: "Receita", in: 63800.0, out: 0, ref: "TRF-IN-1102", tipo: "Recebimento de Cliente", conta: "41.1", terc: "CLI-004", doc: "FT 2026/046", ext: "2026-11-02", estado: "Reconciliado" },
    { id: "m41", date: "2026-11-04", desc: "Pgto FT CFC-1250 – Cabos e disjuntores solares", cat: "Despesa Operacional", in: 0, out: 24500.0, ref: "TRF-OUT-1104", tipo: "Pagamento a Fornecedor", conta: "42.1", terc: "FOR-005", doc: "CFC-1250", ext: "2026-11-04", estado: "Reconciliado" },
    { id: "m42", date: "2026-11-06", desc: "Recebimento Adiantamento Obra Solar Matola", cat: "Receita", in: 145000.0, out: 0, ref: "TRF-IN-1106", tipo: "Recebimento de Cliente", conta: "41.1", terc: "CLI-001", doc: "FT 2026/048", ext: "2026-11-06", estado: "Reconciliado" },
    { id: "m43", date: "2026-11-08", desc: "Pgto Combustível e Logística de Instalação", cat: "Despesa Operacional", in: 0, out: 4800.0, ref: "POS-1108", tipo: "Despesa Directa", conta: "63.4", terc: "FOR-007", doc: "VD-88902", ext: "2026-11-08", estado: "Reconciliado" },
    { id: "m44", date: "2026-11-09", desc: "Comunicação e Internet Fibra Escritório", cat: "Despesas Extras", in: 0, out: 3500.0, ref: "TRF-OUT-1109", tipo: "Despesa Directa", conta: "63.5", terc: "", doc: "FAT-TM-1109", ext: "2026-11-09", estado: "Reconciliado" }
  ,
    { id: "m45", date: "2026-11-10", desc: "Recebimento FT 2026/048 – Sistema Solar Comercial", cat: "Receita", in: 115000.0, out: 0, ref: "TRF-IN-1110", tipo: "Recebimento de Cliente", conta: "41.1", terc: "CLI-001", doc: "FT 2026/048", ext: "2026-11-10", estado: "Reconciliado" }],
  ar: [
    { id: "r7", no: "FT 2026/030", date: "2026-07-31", terc: "CLI-005", conta: "41.1", desc: "Manutenção sistema solar – Julho", base: 21500.0, rate: 0.16, due: "2026-08-31" },
    { id: "r8", no: "FT 2026/038", date: "2026-08-20", terc: "CLI-003", conta: "41.1", desc: "Instalação kit solar 3 kWp – escola", base: 75000.0, rate: 0.16, due: "2026-09-19" },
    { id: "r9", no: "FT 2026/041", date: "2026-09-01", terc: "CLI-001", conta: "41.1", desc: "Sistema solar 10 kWp – 1.ª fase", base: 200000.0, rate: 0.16, due: "2026-10-01" },
    { id: "r10", no: "FT 2026/043", date: "2026-09-04", terc: "CLI-002", conta: "41.1", desc: "Sistema híbrido 15 kW (factura total)", base: 200000.0, rate: 0.16, due: "2026-10-04" },
    { id: "r11", no: "FT 2026/045", date: "2026-09-25", terc: "CLI-001", conta: "41.1", desc: "Manutenção preventiva", base: 40000.0, rate: 0.16, due: "2026-10-25" },
    { id: "r12", no: "FT 2026/046", date: "2026-09-28", terc: "CLI-004", conta: "41.1", desc: "Bombagem solar – 2 sistemas", base: 55000.0, rate: 0.16, due: "2026-10-28" }
  ],
  ap: [
    { id: "p7", no: "ST-8812", date: "2026-09-01", terc: "FOR-001", conta: "42.1", desc: "Painéis solares 550 W – 20 unidades", base: 160000.0, rate: 0.16, due: "2026-09-15" },
    { id: "p8", no: "TRM-221", date: "2026-09-03", terc: "FOR-003", conta: "42.1", desc: "Transporte de material Maputo–Matola", base: 7500.0, rate: 0.16, due: "2026-09-10" },
    { id: "p9", no: "GCC-09/26", date: "2026-09-05", terc: "FOR-004", conta: "42.1", desc: "Honorários de contabilidade – Setembro", base: 15000.0, rate: 0.16, due: "2026-09-15" },
    { id: "p10", no: "BE-3307", date: "2026-09-15", terc: "FOR-002", conta: "42.1", desc: "Baterias de lítio 5 kWh – 4 unidades", base: 120000.0, rate: 0.16, due: "2026-09-30" },
    { id: "p11", no: "ISM-10/26", date: "2026-09-25", terc: "FOR-006", conta: "42.1", desc: "Renda do escritório – Outubro 2026", base: 18000.0, rate: 0.0, due: "2026-10-05" },
    { id: "p12", no: "CFC-1190", date: "2026-09-22", terc: "FOR-005", conta: "42.1", desc: "Cabos e acessórios eléctricos", base: 20000.0, rate: 0.16, due: "2026-10-06" },
    { id: "p13", no: "ST-8840", date: "2026-09-26", terc: "FOR-001", conta: "42.1", desc: "Inversores híbridos 8 kW – 2 unidades", base: 80000.0, rate: 0.16, due: "2026-10-26" },
    { id: "p14", no: "CFC-1215", date: "2026-09-29", terc: "FOR-005", conta: "42.1", desc: "Estruturas de fixação para painéis", base: 30000.0, rate: 0.16, due: "2026-10-14" }
  ],
  ter: [
    { id: "CLI-001", cod: "CLI-001", nome: "Pousada Maré Alta, Lda.", tipo: "Cliente", nuit: "400123451", conta: "41.1", prov: "Inhambane" },
    { id: "CLI-002", cod: "CLI-002", nome: "Clínica Vida Nova, Lda.", tipo: "Cliente", nuit: "400234562", conta: "41.1", prov: "Maputo" },
    { id: "CLI-003", cod: "CLI-003", nome: "Escola Comunitária Esperança", tipo: "Cliente", nuit: "500345673", conta: "41.1", prov: "Gaza" },
    { id: "CLI-004", cod: "CLI-004", nome: "Agro-Serviços Limpopo, Lda.", tipo: "Cliente", nuit: "400456784", conta: "41.1", prov: "Gaza" },
    { id: "CLI-005", cod: "CLI-005", nome: "Condomínio Jardins do Bairro Novo", tipo: "Cliente", nuit: "400567895", conta: "41.1", prov: "Maputo" },
    { id: "FOR-001", cod: "FOR-001", nome: "SolarTech Distribuidora, Lda.", tipo: "Fornecedor", nuit: "400678906", conta: "42.1", prov: "Maputo" },
    { id: "FOR-002", cod: "FOR-002", nome: "Baterias & Energia, Lda.", tipo: "Fornecedor", nuit: "400789017", conta: "42.1", prov: "Matola" },
    { id: "FOR-003", cod: "FOR-003", nome: "Transportes Rápidos da Matola", tipo: "Fornecedor", nuit: "400890128", conta: "42.1", prov: "Matola" },
    { id: "FOR-004", cod: "FOR-004", nome: "Gabinete Contas Certas", tipo: "Fornecedor", nuit: "400901239", conta: "42.1", prov: "Maputo" },
    { id: "FOR-005", cod: "FOR-005", nome: "Cabos e Ferragens Central, Lda.", tipo: "Fornecedor", nuit: "401012340", conta: "42.1", prov: "Maputo" },
    { id: "FOR-006", cod: "FOR-006", nome: "Imobiliária Sol Nascente, Lda.", tipo: "Fornecedor", nuit: "401123451", conta: "42.1", prov: "Maputo" },
    { id: "FOR-007", cod: "FOR-007", nome: "Posto de Combustível Av. Principal", tipo: "Fornecedor", nuit: "401234562", conta: "63.4", prov: "Matola" },
    { id: "EST-001", cod: "EST-001", nome: "Autoridade Tributária de Moçambique", tipo: "Estado", nuit: "-", conta: "44", prov: "Maputo" },
    { id: "EST-002", cod: "EST-002", nome: "Instituto Nacional de Segurança Social (INSS)", tipo: "Estado", nuit: "-", conta: "44.9", prov: "Maputo" },
    { id: "SOC-001", cod: "SOC-001", nome: "Sócio A", tipo: "Sócio", nuit: "100000001", conta: "45.4", prov: "Maputo" },
    { id: "SOC-002", cod: "SOC-002", nome: "Sócio B", tipo: "Sócio", nuit: "100000002", conta: "45.4", prov: "Maputo" },
    { id: "PES-000", cod: "PES-000", nome: "Pessoal (folha de salários)", tipo: "Pessoal", nuit: "-", conta: "45.1", prov: "Maputo" },
    { id: "BAN-001", cod: "BAN-001", nome: "FNB Moçambique (conta própria)", tipo: "Banco", nuit: "-", conta: "12.1.2", prov: "Maputo" }
  ],
  pc: [
    { id: "1", cod: "1", des: "MEIOS MONETÁRIOS", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "11", cod: "11", des: "Caixa", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "12", cod: "12", des: "Bancos", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "12.1", cod: "12.1", des: "Depósitos à ordem", niv: "Subconta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "12.1.1", cod: "12.1.1", des: "NedBank – Conta corrente MZN", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "12.1.2", cod: "12.1.2", des: "FNB – Conta corrente MZN", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "2", cod: "2", des: "INVENTÁRIOS E ACTIVOS BIOLÓGICOS", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "21", cod: "21", des: "Compras", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "26", cod: "26", des: "Matérias-primas, subsidiárias e de consumo", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "3", cod: "3", des: "INVESTIMENTOS DE CAPITAL", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "32", cod: "32", des: "Activos tangíveis", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "33", cod: "33", des: "Activos intangíveis", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "4", cod: "4", des: "CONTAS A RECEBER, CONTAS A PAGAR, ACRÉSCIMOS E DIFERIMENTOS", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "41", cod: "41", des: "Clientes", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "41.1", cod: "41.1", des: "Clientes c/c", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "42", cod: "42", des: "Fornecedores", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "42.1", cod: "42.1", des: "Fornecedores c/c", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "43", cod: "43", des: "Empréstimos obtidos", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "44", cod: "44", des: "Estado", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "44.2", cod: "44.2", des: "Estado – IRPS retido a terceiros", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "44.3.1", cod: "44.3.1", des: "IVA suportado", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "44.3.3", cod: "44.3.3", des: "IVA liquidado", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "44.3.5", cod: "44.3.5", des: "IVA – apuramento / a pagar", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "44.9", cod: "44.9", des: "Segurança social – INSS", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "45", cod: "45", des: "Outras contas a receber e a pagar", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "45.1", cod: "45.1", des: "Pessoal – remunerações a pagar", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "45.4", cod: "45.4", des: "Sócios – conta corrente", niv: "Movimento", tipo: "Balanço", orig: "Interna LECASU" },
    { id: "5", cod: "5", des: "CAPITAL PRÓPRIO", niv: "Classe", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "51", cod: "51", des: "Capital", niv: "Conta", tipo: "Balanço", orig: "PGC-NIRF" },
    { id: "6", cod: "6", des: "GASTOS E PERDAS", niv: "Classe", tipo: "Resultados", orig: "PGC-NIRF" },
    { id: "62", cod: "62", des: "Gastos com o pessoal", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF" },
    { id: "62.1", cod: "62.1", des: "Remunerações do pessoal", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "63", cod: "63", des: "Fornecimentos e serviços de terceiros", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF" },
    { id: "63.1", cod: "63.1", des: "Transportes e deslocações", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "63.2", cod: "63.2", des: "Honorários e serviços especializados", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "63.3", cod: "63.3", des: "Rendas e alugueres", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "63.4", cod: "63.4", des: "Combustíveis", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "63.5", cod: "63.5", des: "Comunicações e subscrições de software", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "69", cod: "69", des: "Gastos e perdas financeiros", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF" },
    { id: "69.8", cod: "69.8", des: "Serviços bancários e comissões", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "7", cod: "7", des: "RENDIMENTOS E GANHOS", niv: "Classe", tipo: "Resultados", orig: "PGC-NIRF" },
    { id: "71", cod: "71", des: "Vendas", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF" },
    { id: "71.1", cod: "71.1", des: "Vendas – equipamento solar", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "72", cod: "72", des: "Prestações de serviços", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF" },
    { id: "72.1", cod: "72.1", des: "Instalação e manutenção", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" },
    { id: "78", cod: "78", des: "Rendimentos e ganhos financeiros", niv: "Conta", tipo: "Resultados", orig: "PGC-NIRF" },
    { id: "78.1", cod: "78.1", des: "Juros obtidos", niv: "Movimento", tipo: "Resultados", orig: "Interna LECASU" }
  ],
  notas: [
    ["Data", "Data (dd/mm/aaaa)", "Data do movimento na contabilidade da LECASU.", "03/09/2026"],
    ["Descrição", "Texto", "Descrição livre do movimento, idealmente com o nº do documento e o terceiro.", "Recebimento FT 2026/041 – Pousada Maré Alta"],
    ["Categoria", "Lista", "Categoria de gestão usada na tabela original da LECASU (análise interna).", "Receita, Despesa Operacional, Despesas Extras, Investimentos, Impostos e Encargos, Transferência Interna"],
    ["Entrada / Saída (MZN)", "Decimal (2 casas)", "Sempre valores positivos. Entrada aumenta o saldo; Saída diminui. Um movimento tem só um dos dois preenchido.", "232000.00"],
    ["Saldo (MZN)", "Calculado", "Saldo corrido: saldo anterior + Entrada − Saída.", "Saldo anterior + Entrada − Saída"],
    ["REF.", "Texto", "Referência do banco (nº da transferência, cheque, POS) – usada para cruzar com o extracto.", "TRF-IN-0903"],
    ["Tipo de Movimento", "Lista", "Classifica o movimento e define o fluxo no ERP.", "Recebimento de Cliente, Pagamento a Fornecedor, Despesa Directa, Salários, Impostos e Contribuições, Movimento de Sócios, Transferência Interna, Encargos Bancários, Rendimentos Financeiros"],
    ["Conta Contrapartida", "Código (Plano de Contas)", "Conta do PGC-NIRF que é movimentada contra o banco (12.1.1). Clientes 41.1, Fornecedores 42.1, Estado 44.x, Sócios 45.4, Pessoal 45.1, FST 63.x, Encargos bancários 69.8, Juros 78.1.", "41.1"],
    ["Conta Débito / Crédito", "Calculado", "Lançamento de partidas dobradas gerado automaticamente: Entrada → Débito Banco / Crédito Contrapartida; Saída → Débito Contrapartida / Crédito Banco.", "Entrada: D 12.1.1 / C 41.1"],
    ["Cód. Terceiro / Terceiro / NUIT", "Chave estrangeira", "Liga à folha Terceiros. Nome e NUIT são obtidos pelo código (não escrever à mão).", "CLI-001 → Pousada Maré Alta, Lda. / 400123451"],
    ["Nº Documento", "Texto (chave)", "Nº da factura do cliente ou do fornecedor. É a chave que liga o pagamento à factura nas folhas Contas a Receber / Contas a Pagar (SUMIFS).", "FT 2026/041; ST-8812"],
    ["Data no Extracto", "Data", "Data em que o movimento aparece no extracto bancário. Vazio = ainda não apareceu.", "03/09/2026"],
    ["Estado Reconciliação", "Lista", "Reconciliado = na contabilidade e no extracto. Em trânsito = só na contabilidade. Só no extracto = falta lançar na contabilidade. Por identificar = entrada/saída no extracto sem documento.", "Reconciliado, Em trânsito, Só no extracto, Por identificar"],
    ["Regra – Reconciliação", "Regra", "Saldo contabilístico + créditos só no extracto − débitos só no extracto = Saldo do extracto + depósitos em trânsito − pagamentos em trânsito. A diferença tem de ser zero.", "Diferença = 0,00 → OK"],
    ["Regra – Contas a Receber / Pagar", "Regra", "Recebido/Pago = soma dos movimentos com o mesmo Nº Documento. Saldo em aberto = Total − Recebido/Pago. Dias em atraso contados a partir da data de referência.", "Estados: Liquidada, Parcial, Em aberto, Vencida"],
    ["Regra – IVA", "Regra", "IVA = Valor s/ IVA × Taxa (16% taxa normal). Taxa 0% para operações isentas, a confirmar caso a caso.", "200 000,00 × 16% = 32 000,00"],
    ["Regra – Saldo Líquido", "Regra", "Saldo contabilístico ajustado + Pendentes Entradas (contas a receber) − Pendentes Implementação (contas a pagar). Mantém a lógica da tabela original.", ""]
  ],
  materia: [
    { id: "mat-1", cod: "MAT-001", nome: "Painel Solar 550W Monocristalino Tier-1", cat: "Painéis Solares", unidade: "un", qtd: 45, custo: 7500.0, preco: 9800.0, min: 10, forn: "FOR-001" },
    { id: "mat-2", cod: "MAT-002", nome: "Bateria de Lítio LiFePO4 5.12 kWh 48V", cat: "Baterias", unidade: "un", qtd: 12, custo: 28000.0, preco: 36500.0, min: 4, forn: "FOR-002" },
    { id: "mat-3", cod: "MAT-003", nome: "Inversor Híbrido 8 kW 48V Onda Pura", cat: "Inversores", unidade: "un", qtd: 8, custo: 38000.0, preco: 49000.0, min: 3, forn: "FOR-001" },
    { id: "mat-4", cod: "MAT-004", nome: "Cabo Solar 6mm² Vermelho/Preto UV", cat: "Cabos", unidade: "m", qtd: 650, custo: 65.0, preco: 95.0, min: 200, forn: "FOR-005" },
    { id: "mat-5", cod: "MAT-005", nome: "Estrutura Fixação Alumínio p/ 4 Painéis", cat: "Estruturas", unidade: "kit", qtd: 25, custo: 3200.0, preco: 4500.0, min: 5, forn: "FOR-005" },
    { id: "mat-6", cod: "MAT-006", nome: "Conectores MC4 Macho/Fêmea IP67", cat: "Acessórios", unidade: "par", qtd: 180, custo: 120.0, preco: 180.0, min: 50, forn: "FOR-005" }
  ],
  rh: [
    { id: "col-1", cod: "COL-001", nome: "Eng. Mário Matsinhe", cargo: "Engenheiro Chefe de Projectos", dept: "Engenharia & Obra", salario: 65000.0, nuit: "104523190", bi: "110100452934B", data_adm: "2024-02-01", estado: "Activo", contacto: "+258 84 123 4567", email: "mario@lecasu.co.mz" },
    { id: "col-2", cod: "COL-002", nome: "Anabela Cossa", cargo: "Gestora Financeira & Contabilista", dept: "Administração & Finanças", salario: 48000.0, nuit: "108923481", bi: "110200892341C", data_adm: "2024-05-15", estado: "Activo", contacto: "+258 82 987 6543", email: "anabela@lecasu.co.mz" },
    { id: "col-3", cod: "COL-003", nome: "Tomás Sitoe", cargo: "Técnico Sénior de Instalações", dept: "Operações & Campo", salario: 32000.0, nuit: "107623912", bi: "110300762391D", data_adm: "2025-01-10", estado: "Activo", contacto: "+258 86 554 4332", email: "tomas@lecasu.co.mz" },
    { id: "col-4", cod: "COL-004", nome: "Jaime Mondlane", cargo: "Electricista Montador", dept: "Operações & Campo", salario: 22500.0, nuit: "109234511", bi: "110400923451E", data_adm: "2025-08-01", estado: "Activo", contacto: "+258 87 112 2334", email: "jaime@lecasu.co.mz" }
  ],
  ativos: [
    { id: "LEC-INF-001", cod: "LEC-INF-001", nome: "Cadeira de escritorio", cat: "Mobiliário", marca: "N/A", serie: "JJ848B", qtd: 5, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-10", valor_unitario: 3134.05, fornecedor: "Home Store, Lda", factura: "6089", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-002", cod: "LEC-INF-002", nome: "Cadeira de escritorio", cat: "Mobiliário", marca: "N/A", serie: "JJ-HZ1023A", qtd: 2, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-10", valor_unitario: 5509.05, fornecedor: "Home Store, Lda", factura: "6089", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-003", cod: "LEC-INF-003", nome: "Mesa para duas pessoas", cat: "Mobiliário", marca: "N/A", serie: "JJ-620A-1", qtd: 2, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-10", valor_unitario: 13299.05, fornecedor: "Home Store, Lda", factura: "6089", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-004", cod: "LEC-INF-004", nome: "Mesa de recepcao", cat: "Mobiliário", marca: "N/A", serie: "N/A", qtd: 1, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-10", valor_unitario: 13584.05, fornecedor: "Home Store, Lda", factura: "6089", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-005", cod: "LEC-INF-005", nome: "Mesa de escritorio", cat: "Mobiliário", marca: "N/A", serie: "Z8123-1.6M", qtd: 2, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-10", valor_unitario: 8000.00, fornecedor: "Ifresh, Lda", factura: "339", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-006", cod: "LEC-INF-006", nome: "Mesa de escritorio", cat: "Mobiliário", marca: "N/A", serie: "Z8123-1.6M", qtd: 2, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-10", valor_unitario: 18000.00, fornecedor: "Ifresh, Lda", factura: "339", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-007", cod: "LEC-INF-007", nome: "Geleira", cat: "Outros", marca: "Depoint", serie: "186", qtd: 1, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-15", valor_unitario: 13500.00, fornecedor: "Nabil Electronica", factura: "621", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-008", cod: "LEC-INF-008", nome: "Microonda", cat: "Outros", marca: "DEFY", serie: "202", qtd: 1, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-15", valor_unitario: 4000.00, fornecedor: "Nabil Electronica", factura: "621", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-009", cod: "LEC-INF-009", nome: "Mesa de escritorio", cat: "Mobiliário", marca: "N/A", serie: "N/A", qtd: 1, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-17", valor_unitario: 23000.00, fornecedor: "China Mall", factura: "965895", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-010", cod: "LEC-INF-010", nome: "Cadeira de escritorio", cat: "Mobiliário", marca: "N/A", serie: "N/A", qtd: 6, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-17", valor_unitario: 3134.00, fornecedor: "Home Store, Lda", factura: "6209", estado: "Bom", ultima_verif: "2026-10-27", obs: "" },
    { id: "LEC-INF-011", cod: "LEC-INF-011", nome: "Telemovel", cat: "Equipamento informático", marca: "N/A", serie: "2162", qtd: 1, unidade: "un", localizacao: "Escritório", responsavel: "N/A", data_aquisicao: "2026-10-17", valor_unitario: 8000.00, fornecedor: "Home Store, Lda", factura: "6211", estado: "Bom", ultima_verif: "2026-10-27", obs: "" }
  ],
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
    bank: [
      { id: "b1", nome: "Millennium BIM - Conta Principal", num: "0001.2345.6789.01", saldo: 0, moeda: "MZN" },
      { id: "b2", nome: "Standard Bank - Conta Operações", num: "0002.9876.5432.10", saldo: 0, moeda: "MZN" },
      { id: "b3", nome: "BCI - Caixa e Tesouraria", num: "0003.5555.4444.22", saldo: 0, moeda: "MZN" }
    ],
    pc: Array.isArray(SEED.pc) ? SEED.pc.map(p => ({ ...p, saldo: 0 })) : [],
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

